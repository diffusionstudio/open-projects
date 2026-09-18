import { createEffect, createSignal, onCleanup, onMount, For } from "solid-js";
import { gsap } from "gsap";
import { cubicBezier } from "animejs";
import { useTicker } from "@diffusionstudio/jsx";
import { SIZE, INK } from "./theme";
import { dom } from "./dom";

export const DUR = 7;

// the band's drawing box: full-bleed horizontally, centered vertically
const BAND_H = 360;
const BAND_Y = (SIZE.height - BAND_H) / 2;

// reveal: a hairline sweeps outward from the center, then the line opens
// vertically into the pinched bowtie — the sweep finishes while the opening
// is already underway so the two read as one continuous ignition
const SWEEP_DUR = 0.5;
const OPEN_DELAY = 0.28;
const OPEN_DUR = 1.25;
const SWEEP_EASE = cubicBezier(0, 0.7, 0.2, 1);
const OPEN_EASE = cubicBezier(0.16, 1, 0.3, 1);

const SHADER = /* wgsl */ `
  struct U {
    time: f32,
    sweep: f32,
    open: f32,
    pad: f32,
  }
  @group(0) @binding(0) var<uniform> u: U;

  struct VSOut {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
  }

  @vertex
  fn vs(@builtin(vertex_index) i: u32) -> VSOut {
    var p = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
    var out: VSOut;
    out.position = vec4f(p[i], 0.0, 1.0);
    out.uv = p[i] * 0.5 + 0.5;
    return out;
  }

  fn hash(p: vec2f) -> f32 {
    return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
  }

  fn vnoise(p: vec2f) -> f32 {
    let i = floor(p);
    let f = fract(p);
    let s = f * f * (3.0 - 2.0 * f);
    let a = hash(i);
    let b = hash(i + vec2f(1.0, 0.0));
    let c = hash(i + vec2f(0.0, 1.0));
    let d = hash(i + vec2f(1.0, 1.0));
    return mix(mix(a, b, s.x), mix(c, d, s.x), s.y);
  }

  // cyclic palette (last stop wraps to the first) so the gradient can scroll
  // forever in one direction without a seam
  const N_STOPS = 6;
  const POS = array<f32, N_STOPS>(0.0, 0.2, 0.4, 0.6, 0.8, 1.0);
  const COL = array<vec3f, N_STOPS>(
    vec3f(0.925, 0.141, 0.090), // signature red
    vec3f(0.980, 0.451, 0.040), // orange
    vec3f(1.000, 0.812, 0.330), // warm core
    vec3f(0.980, 0.310, 0.780), // pink
    vec3f(0.490, 0.275, 0.930), // violet
    vec3f(0.925, 0.141, 0.090)  // back to red
  );

  fn palette(x: f32) -> vec3f {
    let t = fract(x);
    var col = COL[0];
    for (var i = 0; i < N_STOPS - 1; i++) {
      let a = POS[i];
      let b = POS[i + 1];
      col = mix(col, COL[i + 1], smoothstep(a, b, t));
    }
    return col;
  }

  @fragment
  fn fs(in: VSOut) -> @location(0) vec4f {
    let x = in.uv.x;            // 0..1 across the band
    let y = in.uv.y * 2.0 - 1.0; // -1..1, 0 at the vertical center
    let e = abs(x * 2.0 - 1.0);  // 0 at center, 1 at the sides

    // bowtie envelope: pinched at the center, flaring toward both sides,
    // with a slow breath so the shape never sits perfectly still
    var halfH = mix(0.52, 0.72, pow(e, 1.9));
    halfH *= 1.0 + 0.025 * sin(u.time * 0.7 + e * 2.0);
    halfH *= u.open;

    // during the ignition the band is a hairline; it opens into the envelope
    halfH = max(halfH, 0.018 * u.sweep);

    // horizontal sweep mask, center outward
    let hMask = 1.0 - smoothstep(u.sweep - 0.06, u.sweep + 0.01, e);

    // sharp edge: a single anti-aliased pixel, no dithering
    let aa = fwidth(y);
    let inside = 1.0 - smoothstep(halfH - aa, halfH + aa, abs(y));

    var alpha = inside * hMask;
    if (alpha <= 0.001) {
      return vec4f(0.0);
    }

    // color: the gradient scrolls steadily in one direction for the whole
    // beat; DENSITY < 1 stretches the palette so only a few hues share the
    // frame, and a soft noise warp keeps the hue borders bleeding organically
    let DENSITY = 0.55;
    let SPEED = 0.16;
    let warp = 0.04 * (vnoise(vec2f(x * 4.0 + u.time * 0.1, y * 1.4 + u.time * 0.14)) - 0.5);
    var col = palette(x * DENSITY - u.time * SPEED + warp);

    // lighter towards the sides: the strip melts fully into the canvas well
    // before the frame edge, leaving a padding of clear canvas on both sides
    col = mix(col, vec3f(0.980, 0.976, 0.965), smoothstep(0.42, 0.90, e));
    alpha *= 1.0 - smoothstep(0.71, 0.91, e);
    col *= 1.0 - 0.05 * abs(y);

    // film grain, re-rolled every frame
    let g = hash(in.position.xy + vec2f(fract(u.time * 0.731) * 641.0, fract(u.time * 0.517) * 383.0));
    col *= 0.91 + 0.18 * g;

    return vec4f(col * alpha, alpha);
  }
`;

export function GradientBand(props) {
  const { time, hold } = useTicker();
  const [gpu, setGpu] = createSignal();
  let surfaceRef;

  const setup = async () => {
    const el = surfaceRef?.element;
    if (!el) return;

    const adapter = await navigator.gpu?.requestAdapter();
    if (!adapter) throw new Error("WebGPU is not available");
    const device = await adapter.requestDevice();

    const context = el.getContext("webgpu");
    if (!context) throw new Error("No webgpu context on the surface canvas");
    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({ device, format, alphaMode: "premultiplied" });

    const module = device.createShaderModule({ code: SHADER });
    const pipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: { module, entryPoint: "vs" },
      fragment: {
        module,
        entryPoint: "fs",
        targets: [
          {
            format,
            blend: {
              color: { srcFactor: "one", dstFactor: "one-minus-src-alpha" },
              alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha" },
            },
          },
        ],
      },
    });

    const uniforms = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: uniforms } }],
    });

    setGpu({ device, context, pipeline, uniforms, bindGroup });
  };

  // held, so a capture or an export — which mounts the module again and sets
  // up a device of its own — waits for the pipeline instead of sampling the
  // band's first frames empty
  onMount(() => hold(setup()));

  createEffect(() => {
    const g = gpu();
    const t = Math.min(Math.max(time() - props.start, 0), DUR);
    if (!g) return;

    const sweep = SWEEP_EASE(Math.min(t / SWEEP_DUR, 1));
    const open = OPEN_EASE(Math.min(Math.max((t - OPEN_DELAY) / OPEN_DUR, 0), 1));
    g.device.queue.writeBuffer(g.uniforms, 0, new Float32Array([t, sweep, open, 0]));

    const encoder = g.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: g.context.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    pass.setPipeline(g.pipeline);
    pass.setBindGroup(0, g.bindGroup);
    pass.draw(3);
    pass.end();
    g.device.queue.submit([encoder.finish()]);
  });

  onCleanup(() => gpu()?.device.destroy());

  return (
    <surface
      name="Gradient band"
      x={0}
      y={BAND_Y}
      width={SIZE.width}
      height={BAND_H}
      start={props.start}
      end={props.start + DUR}
      ref={surfaceRef} id="hxpp9e"
    />
  );
}

// content starts entering while the band is still opening
export const CONTENT_DELAY = 0.8;

const MARGIN = 120;
const MUTED = "rgba(17,17,17,0.45)";
const SOFT = "rgba(17,17,17,0.82)";
const HAIRLINE = "rgba(17,17,17,0.14)";

// Preview wordmark (official SVG), muted so it sits quieter than the headline
const EYEBROW_FILL = "rgba(17,17,17,0.55)";
const PREVIEW_SVG = `<svg display="block" viewBox="0 0 120 16" xmlns="http://www.w3.org/2000/svg" width="300" fill="${EYEBROW_FILL}"><g><path d="M 20.729 0.398 C 19.591 4.407 18.448 8.203 17.31 11.802 C 17.294 11.802 17.278 11.802 17.258 11.802 C 16.059 8.064 14.856 4.534 13.657 1.193 C 12.559 1.308 11.462 1.418 10.36 1.525 C 9.125 4.944 7.89 8.174 6.65 11.241 C 6.634 11.241 6.618 11.241 6.598 11.241 C 5.488 8.068 4.382 5.046 3.273 2.156 C 2.183 2.242 1.09 2.328 0 2.406 C 1.616 6.014 3.232 9.851 4.844 13.971 C 5.954 14.065 7.059 14.163 8.169 14.262 C 9.421 11.183 10.676 7.932 11.928 4.489 C 11.944 4.489 11.96 4.489 11.98 4.489 C 13.207 7.805 14.435 11.306 15.662 15.016 C 16.751 15.135 17.841 15.258 18.926 15.385 C 20.615 10.658 22.3 5.551 23.989 0 C 22.904 0.139 21.814 0.275 20.725 0.406 Z" transform="translate(89.007 0.008)"/><path d="M 3.228 6.055 C 6.326 6.071 9.421 6.092 12.515 6.116 L 12.515 4.559 C 9.421 4.595 6.322 4.628 3.228 4.653 L 3.228 2.078 C 6.573 1.968 9.919 1.828 13.264 1.664 L 13.264 0 C 8.846 0.312 4.423 0.558 0 0.738 L 0 10.277 C 4.484 10.458 8.967 10.708 13.443 11.027 L 13.443 9.359 C 10.04 9.191 6.634 9.052 3.224 8.937 L 3.224 6.059 Z" transform="translate(74.564 2.497)"/><path d="M 0 9.162 C 1.077 9.187 2.151 9.22 3.228 9.252 L 3.228 0 C 2.151 0.033 1.077 0.066 0 0.09 Z" transform="translate(67.379 3.374)"/><path d="M 8.035 7.059 L 7.983 7.059 C 6.44 4.735 4.901 2.419 3.358 0.074 C 2.24 0.066 1.118 0.053 0 0.033 C 2.049 3.038 4.099 5.961 6.148 8.896 C 7.347 8.896 8.542 8.896 9.741 8.904 C 11.843 5.977 13.945 3.038 16.043 0 C 14.949 0.02 13.856 0.041 12.762 0.053 C 11.187 2.415 9.611 4.739 8.035 7.059 Z" transform="translate(49.489 3.509)"/><path d="M 3.228 5.444 C 6.326 5.432 9.425 5.419 12.527 5.411 L 12.527 4.128 C 9.429 4.116 6.326 4.099 3.228 4.079 L 3.228 1.582 C 6.578 1.677 9.923 1.746 13.272 1.787 L 13.272 0.435 C 8.846 0.357 4.423 0.213 0 0 L 0 9.814 C 4.484 9.601 8.967 9.453 13.455 9.375 L 13.455 8.023 C 10.044 8.064 6.634 8.133 3.228 8.228 L 3.228 5.436 Z" transform="translate(35.317 3.091)"/><path d="M 14.569 8.555 C 14.569 8.158 14.475 7.826 14.285 7.559 C 14.115 7.297 13.888 7.084 13.613 6.92 C 13.337 6.752 13.038 6.625 12.71 6.551 C 12.402 6.473 12.106 6.428 11.831 6.407 L 11.831 6.379 C 11.985 6.35 12.228 6.288 12.552 6.202 C 12.896 6.112 13.24 5.977 13.584 5.784 C 13.929 5.583 14.228 5.325 14.488 5.018 C 14.747 4.698 14.876 4.3 14.876 3.812 C 14.876 2.952 14.37 2.263 13.354 1.722 C 12.337 1.181 10.818 0.832 8.789 0.693 C 5.857 0.492 2.928 0.262 0 0 L 0 12.286 C 1.073 12.192 2.147 12.097 3.22 12.011 L 3.22 7.178 C 4.8 7.153 6.383 7.133 7.963 7.117 C 8.704 7.108 9.303 7.158 9.769 7.26 C 10.251 7.363 10.628 7.531 10.903 7.764 C 11.179 7.986 11.369 8.277 11.47 8.625 C 11.571 8.965 11.624 9.379 11.624 9.859 C 11.624 10.113 11.64 10.38 11.677 10.654 C 11.729 10.925 11.875 11.167 12.114 11.38 C 13.268 11.31 14.419 11.245 15.573 11.183 C 15.229 10.995 14.97 10.663 14.799 10.187 C 14.646 9.703 14.569 9.154 14.569 8.555 Z M 10.854 5.251 C 10.32 5.522 9.538 5.661 8.505 5.653 C 6.744 5.641 4.982 5.628 3.22 5.616 L 3.22 1.951 C 4.966 2.054 6.707 2.148 8.453 2.234 C 8.866 2.255 9.259 2.296 9.639 2.353 C 10.036 2.415 10.381 2.505 10.672 2.64 C 10.98 2.771 11.223 2.947 11.393 3.173 C 11.563 3.386 11.652 3.661 11.652 3.993 C 11.652 4.55 11.385 4.973 10.854 5.251 Z" transform="translate(17.156 1.857)"/><path d="M 13.191 2.894 C 12.746 2.46 12.11 2.066 11.288 1.714 C 10.466 1.357 9.4 1.107 8.096 0.963 C 5.395 0.664 2.697 0.344 0 0 L 0 16 C 1.069 15.865 2.143 15.729 3.212 15.602 L 3.212 9.769 C 4.84 9.724 6.468 9.679 8.096 9.638 C 9.4 9.605 10.462 9.441 11.288 9.166 C 12.11 8.875 12.746 8.531 13.191 8.129 C 13.637 7.727 13.937 7.305 14.091 6.85 C 14.261 6.387 14.35 5.956 14.35 5.563 C 14.35 5.169 14.265 4.735 14.091 4.259 C 13.937 3.784 13.637 3.329 13.191 2.894 Z M 10.822 6.489 C 10.632 6.76 10.377 6.985 10.049 7.162 C 9.741 7.326 9.396 7.44 9.02 7.518 C 8.643 7.592 8.275 7.629 7.914 7.629 C 6.347 7.621 4.775 7.609 3.208 7.6 L 3.208 2.57 C 4.791 2.706 6.379 2.837 7.963 2.96 C 8.392 2.993 8.793 3.058 9.174 3.148 C 9.55 3.239 9.886 3.39 10.178 3.587 C 10.47 3.771 10.701 4.013 10.875 4.313 C 11.045 4.612 11.134 4.981 11.134 5.419 C 11.134 5.846 11.033 6.202 10.826 6.485 Z" fill="${EYEBROW_FILL}"/></g></svg>`;

// The General Partnership "GP" monogram (official SVG), recolored to ink
const GP_SVG = `<svg viewBox="-2.775 -2.775 142.55 71.55" height="32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M114.796 0H33.7996C14.9988 0 0 14.7443 0 32.9314C0 51.1185 14.9988 65.8628 33.7996 65.8628H66.5663V24.6985H28.9647V41.1642H50.1755V49.3971H33.7846C23.9651 49.3971 16.6902 42.0175 16.6902 32.9314C16.6902 23.8453 23.9501 16.4657 33.7846 16.4657H115.185C117.745 16.4657 119.541 18.2021 119.541 20.5821C119.541 22.9622 117.745 24.6985 115.185 24.6985H74.7543V65.8628H91.1451V41.1642H114.781C126.966 41.1642 136.216 31.9435 136.216 20.5821C136.216 9.22079 126.966 0 114.796 0Z" fill="${INK}" stroke-linejoin="round"/></svg>`;

// Sequoia Capital wordmark + stepped-bars symbol (2022 mark), recolored to ink
const SEQUOIA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 297 39.1" height="30" fill="${INK}"><path d="M352.4,325.23l-3.84-6.65c1.81-3.37,1.79-7.42,1.79-12.58,0-6.64,0-11.45-3.84-15.34a14.94,14.94,0,0,0-20.79,0c-3.89,3.89-3.78,8.7-3.78,15.34s-.11,11.45,3.78,15.34a14,14,0,0,0,10.42,4.21,17.05,17.05,0,0,0,3.28-.32Zm-21.12-8.43c-1.46-1.62-1.83-3.4-1.83-10.8s.37-9.18,1.83-10.8a6.37,6.37,0,0,1,4.86-2.05A6.26,6.26,0,0,1,341,295.2c1.46,1.62,1.89,3.4,1.89,10.8s-.43,9.18-1.89,10.8a6.26,6.26,0,0,1-4.81,2.05A6.37,6.37,0,0,1,331.28,316.8Z" transform="translate(-247.5 -286.45)"/><path d="M440.25,325.21V286.77h7.41v38.44Z" transform="translate(-247.5 -286.45)"/><path d="M261.54,325.55c-5.83,0-10.26-1.24-14-5.08l4.86-4.86c2.43,2.43,5.72,3.24,9.29,3.24,4.43,0,6.8-1.67,6.8-4.75a4.28,4.28,0,0,0-1.18-3.24,5.76,5.76,0,0,0-3.41-1.35l-4.64-.65c-3.3-.48-5.73-1.51-7.45-3.18a10.15,10.15,0,0,1-2.76-7.56c0-6.86,5.08-11.67,13.4-11.67,5.29,0,9.12,1.3,12.42,4.48l-4.76,4.7c-2.43-2.32-5.34-2.64-7.88-2.64-4,0-5.94,2.21-5.94,4.86a3.71,3.71,0,0,0,1.13,2.75,6.6,6.6,0,0,0,3.57,1.51l4.53.65c3.51.49,5.73,1.46,7.35,3,2.05,1.94,3,4.75,3,8.15C275.8,321.34,269.59,325.55,261.54,325.55Z" transform="translate(-247.5 -286.45)"/><path d="M286.78,325.23V286.77h25.33v6.7H294.29v9h15.18v6.7H294.29v9.34h17.82v6.7Z" transform="translate(-247.5 -286.45)"/><path d="M375.82,325.55c-7.89,0-14.15-5.35-14.15-13.5V286.77h7.5v25c0,4.43,2.6,7.07,6.65,7.07s6.69-2.64,6.69-7.07v-25H390v25.28C390,320.2,383.7,325.55,375.82,325.55Z" transform="translate(-247.5 -286.45)"/><path d="M425.4,321.34a14.94,14.94,0,0,1-20.79,0c-3.89-3.89-3.78-8.7-3.78-15.34s-.11-11.45,3.78-15.34a14.94,14.94,0,0,1,20.79,0c3.89,3.89,3.83,8.7,3.83,15.34S429.29,317.45,425.4,321.34Zm-5.56-26.14a6.26,6.26,0,0,0-4.81-2.05,6.37,6.37,0,0,0-4.86,2.05c-1.46,1.62-1.84,3.4-1.84,10.8s.38,9.18,1.84,10.8a6.37,6.37,0,0,0,4.86,2.05,6.26,6.26,0,0,0,4.81-2.05c1.46-1.62,1.89-3.4,1.89-10.8S421.3,296.82,419.84,295.2Z" transform="translate(-247.5 -286.45)"/><path d="M483,325.23l-2.26-6.81H467.08l-2.32,6.81h-7.83l14-38.46h5.88l14.05,38.46Zm-9-27.11-4.86,14h9.56Z" transform="translate(-247.5 -286.45)"/><rect x="287.39" y="0.32" width="9.61" height="9.61"/><polygon points="263.36 30.57 263.36 0.32 258.55 0.32 258.55 35.38 263.36 30.57"/><polygon points="266.75 33.97 261.95 38.77 297 38.77 297 33.97 266.75 33.97"/><polygon points="272.97 20.96 272.97 0.32 268.16 0.32 268.16 25.76 272.97 20.96"/><polygon points="276.37 24.36 271.56 29.16 297 29.16 297 24.36 276.37 24.36"/><polygon points="282.58 11.35 282.58 0.32 277.77 0.32 277.77 16.15 282.58 11.35"/><polygon points="285.98 14.74 281.17 19.55 297 19.55 297 14.74 285.98 14.74"/></svg>`;

// angels, column-major like the reference, spread over five columns for 16:9
const NAME_COLS = [
  ["Soleio", "Jordan Taylor", "Diego Rodriguez"],
  ["Gabriel Petersson", "Kyle Parrish", "Burkay Gur"],
  ["Willem Evers", "John Lilly", "Batuhan Taskaya"],
  ["Sahil Lavingia", "Emery Wells", "Alec Wilcock"],
  ["Kurt Varner"],
];

const COL_W = (SIZE.width - MARGIN * 2) / NAME_COLS.length;
const ROW_H = 48;

// gradient frame: four hairline strips windowing one shared rotating conic
// gradient, in the band's palette
const FRAME_INSET = 0;
const FRAME_W = 12;
const FRAME = { x: FRAME_INSET, y: FRAME_INSET, w: SIZE.width - FRAME_INSET * 2, h: SIZE.height - FRAME_INSET * 2 };
const CONIC_SIZE = 2400; // covers the frame diagonal while rotating
const CONIC =
  "conic-gradient(from 0deg, #EC2417, #FA730A, #FFCF54, #FA4FC7, #7D46ED, #EC2417)";
const STRIPS = [
  { left: FRAME.x, top: FRAME.y, width: FRAME.w, height: FRAME_W },
  { left: FRAME.x, top: FRAME.y + FRAME.h - FRAME_W, width: FRAME.w, height: FRAME_W },
  { left: FRAME.x, top: FRAME.y, width: FRAME_W, height: FRAME.h },
  { left: FRAME.x + FRAME.w - FRAME_W, top: FRAME.y, width: FRAME_W, height: FRAME.h },
];

// content runs from CONTENT_DELAY to the end of the beat
const CONTENT_TOTAL = DUR - CONTENT_DELAY;
const STROKE_AT = 1.0; // midway through the text entrances

export function SummaryContent(props) {
  const { time } = useTicker();
  let eyebrowEl;
  const headChars = [];
  const rowEls = []; // "Backed by" + each logo
  const nameEls = []; // { el, row, col }
  let sepEl;
  const strokeWraps = [];
  const strokeRots = [];
  let tl;

  onMount(() => {
    tl = gsap.timeline({ paused: true, defaults: { lazy: false } });

    // eyebrow: the wordmark pushes up as one piece while blurring in
    tl.fromTo(
      eyebrowEl,
      { y: 34, opacity: 0, filter: "blur(8px)" },
      { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.55, ease: "expo.out" },
      0
    );

    // headline: same treatment, heavier travel
    tl.fromTo(
      headChars,
      { y: 110, opacity: 0, filter: "blur(14px)" },
      { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.7, ease: "expo.out", stagger: 0.03 },
      0.12
    );

    // backed-by label and logos
    tl.fromTo(
      rowEls,
      { y: 30, opacity: 0, filter: "blur(8px)" },
      { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.5, ease: "expo.out", stagger: 0.09 },
      0.55
    );

    // separator between the logos and the angels draws from the left
    tl.fromTo(
      sepEl,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.8, ease: "power3.inOut" },
      0.75
    );

    // angels cascade row by row, left to right
    const ordered = nameEls
      .slice()
      .sort((a, b) => a.row - b.row || a.col - b.col)
      .map((n) => n.el);
    tl.fromTo(
      ordered,
      { y: 26, opacity: 0, filter: "blur(8px)" },
      { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.5, ease: "expo.out", stagger: 0.045 },
      0.9
    );

    // the gradient frame fades in mid-cascade and its gradient keeps
    // rotating until the end of the beat
    tl.fromTo(strokeWraps, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "none" }, STROKE_AT);
    tl.fromTo(
      strokeRots,
      { rotation: 0 },
      { rotation: 200, duration: CONTENT_TOTAL - STROKE_AT, ease: "none" },
      STROKE_AT
    );
  });

  createEffect(() => {
    if (!tl) return;
    tl.seek(Math.min(Math.max(time() - props.start, 0), tl.duration()));
  });

  return (
    <html name="Summary" {...SIZE} x={0} y={0} start={props.start} end={props.end} id="mazm12">
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          "font-family": "Inter",
          color: INK,
        }}
      >
        <div style={{ position: "absolute", inset: "0" }}>
          <For each={STRIPS}>
            {(s, i) => (
              <div
                ref={(el) => (strokeWraps[i()] = dom(el))}
                style={{
                  position: "absolute",
                  left: `${s.left}px`,
                  top: `${s.top}px`,
                  width: `${s.width}px`,
                  height: `${s.height}px`,
                  overflow: "hidden",
                  opacity: 0,
                }}
              >
                <div
                  ref={(el) => (strokeRots[i()] = dom(el))}
                  style={{
                    position: "absolute",
                    left: `${SIZE.width / 2 - CONIC_SIZE / 2 - s.left}px`,
                    top: `${SIZE.height / 2 - CONIC_SIZE / 2 - s.top}px`,
                    width: `${CONIC_SIZE}px`,
                    height: `${CONIC_SIZE}px`,
                    background: CONIC,
                  }}
                />
              </div>
            )}
          </For>
        </div>

        <div
          ref={(el) => (eyebrowEl = dom(el))}
          style={{
            position: "absolute",
            left: `${MARGIN}px`,
            top: "130px",
            width: "300px",
            overflow: "visible",
          }}
          innerHTML={PREVIEW_SVG}
        />

        <div
          style={{
            position: "absolute",
            left: `${MARGIN}px`,
            top: "184px",
            "font-size": "150px",
            "font-weight": 500,
            "letter-spacing": "-0.02em",
            "line-height": 1,
            "white-space": "pre",
          }}
        >
          <For each={"$12M raised".split("")}>
            {(ch, i) => (
              <span ref={(el) => (headChars[i()] = dom(el))} style={{ display: "inline-block", "white-space": "pre" }}>
                {ch}
              </span>
            )}
          </For>
        </div>

        <div
          ref={(el) => (sepEl = dom(el))}
          style={{
            position: "absolute",
            left: `${MARGIN}px`,
            right: `${MARGIN}px`,
            top: "826px",
            height: "1px",
            background: HAIRLINE,
            "transform-origin": "left center",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: `${MARGIN}px`,
            right: `${MARGIN}px`,
            top: "746px",
            display: "flex",
            "align-items": "center",
            "justify-content": "space-between",
          }}
        >
          <span
            ref={(el) => (rowEls[0] = dom(el))}
            style={{ "font-size": "28px", "font-weight": 500, color: MUTED }}
          >
            Backed by
          </span>
          <div style={{ display: "flex", "align-items": "center", gap: "64px" }}>
            <div ref={(el) => (rowEls[1] = dom(el))} style={{ height: "30px" }} innerHTML={SEQUOIA_SVG} />
            <div ref={(el) => (rowEls[2] = dom(el))} style={{ height: "32px" }} innerHTML={GP_SVG} />
            <span
              ref={(el) => (rowEls[3] = dom(el))}
              style={{ "font-size": "30px", "font-weight": 700, "letter-spacing": "0.08em" }}
            >
              BADRUL
            </span>
          </div>
        </div>

        <For each={NAME_COLS}>
          {(col, c) => (
            <For each={col}>
              {(name, r) => (
                <div
                  ref={(el) => nameEls.push({ el: dom(el), row: r(), col: c() })}
                  style={{
                    position: "absolute",
                    left: `${MARGIN + c() * COL_W}px`,
                    top: `${862 + r() * ROW_H}px`,
                    "font-size": "26px",
                    "font-weight": 500,
                    color: SOFT,
                  }}
                >
                  {name}
                </div>
              )}
            </For>
          )}
        </For>
      </div>
    </html>
  );
}
