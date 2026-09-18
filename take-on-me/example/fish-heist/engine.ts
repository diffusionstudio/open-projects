// Procedural pencil engine, ported from pencil-style-test.html.
// Topic-independent: seeded RNG, paper tooth, pencil / sketchLine / hatch / scribble / erase, compositor.
// Additions over the baseline: a colour layer + a clean "toon" line layer (for the kitchen world),
// transforms (push / pop), clipping, and the solid-form recipe (erase → fill → hatch → contour → accent).

export type Rand = () => number;
export type Pt = [number, number];
export type Ctx = OffscreenCanvasRenderingContext2D;
export type PathFn = (c: Ctx) => void;

export interface Look { paper: string; graphite: string; weight: number; boil: number; grain: number }
export interface StrokeOpts { w?: number; a?: number; passes?: number; jitter?: number; taper?: boolean; boil?: number; over?: number; color?: string }
export interface FormOpts { fill?: string; tone?: 0 | 1 | 2 | 3; line?: StrokeOpts; accent?: boolean; /** < 1 narrows the shadow to a rim on the lower right */ rim?: number; /** contour as several broken, overlapping strokes + a construction line (rotoscope feel) */ sketchy?: boolean }
export interface Shot { start: number; end: number; world: "toon" | "pencil"; draw(pen: Pen, t: number, R: Rand): void }

export interface Pen {
  W: number; H: number; paper: string;
  /** true: strokes are clean marker lines on the toon layer; false: graphite */
  toon: boolean;
  pencil(pts: Pt[], R: Rand, o?: StrokeOpts): void;
  outline(pts: Pt[], R: Rand, o?: StrokeOpts): void;
  sketchLine(x0: number, y0: number, x1: number, y1: number, R: Rand, o?: StrokeOpts): void;
  hatch(clip: PathFn, cx: number, cy: number, radius: number, angle: number, spacing: number, R: Rand, o?: StrokeOpts): void;
  scribble(x: number, y: number, len: number, angle: number, amp: number, R: Rand, o?: StrokeOpts): void;
  blot(x: number, y: number, r: number, R: Rand, ry?: number, rot?: number): void;
  erase(path: PathFn): void;
  fill(path: PathFn, color: string): void;
  form(pts: Pt[], R: Rand, o?: FormOpts): void;
  clip(path: PathFn, draw: () => void): void;
  push(x: number, y: number, rot?: number, sx?: number, sy?: number): void;
  pop(): void;
}

const TOON_LINE = "#1d1b22";

export function rng(seed: number): Rand {
  let s = (Math.imul(seed + 1, 2654435761) >>> 0) || 1;
  const next = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  for (let i = 0; i < 8; i++) next();
  return next;
}

// ---------- geometry helpers ----------
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
/** progress of t through [a, b], clamped to 0..1 */
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const easeIn = (u: number) => u * u * u;
export const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
export const easeInOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
export const backOut = (u: number) => 1 + 2.7 * Math.pow(u - 1, 3) + 1.7 * Math.pow(u - 1, 2);

export function resample(pts: Pt[], step = 9): Pt[] {
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i], n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / step));
    for (let k = 1; k <= n; k++) out.push([lerp(ax, bx, k / n), lerp(ay, by, k / n)]);
  }
  return out;
}
export function ellipsePts(cx: number, cy: number, rx: number, ry: number, rot = 0, a0 = 0, a1 = Math.PI * 2, n = 48): Pt[] {
  const pts: Pt[] = [], c = Math.cos(rot), s = Math.sin(rot);
  for (let i = 0; i <= n; i++) {
    const a = lerp(a0, a1, i / n), x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    pts.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return pts;
}
/** Catmull-Rom through the given points */
export function smooth(pts: Pt[], closed = false, n = 8): Pt[] {
  const L = pts.length, out: Pt[] = [];
  const get = (i: number) => (closed ? pts[((i % L) + L) % L] : pts[clamp(i, 0, L - 1)]);
  const segs = closed ? L : L - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    for (let j = 0; j < n; j++) {
      const u = j / n, u2 = u * u, u3 = u2 * u;
      out.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * u3)) as Pt);
    }
  }
  if (!closed) out.push(pts[L - 1]);
  return out;
}
/** Closed outline of a limb: a smoothed centreline thickened from radius r0 to r1, round ends */
export function sausage(center: Pt[], r0: number, r1 = r0): Pt[] {
  const c = center.length > 2 ? smooth(center, false, 6) : resample(center, 20), n = c.length;
  const left: Pt[] = [], right: Pt[] = [];
  let ang0 = 0, ang1 = 0;
  for (let i = 0; i < n; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(n - 1, i + 1)];
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), r = lerp(r0, r1, i / (n - 1));
    if (i === 0) ang0 = ang;
    if (i === n - 1) ang1 = ang;
    left.push([c[i][0] + Math.cos(ang - Math.PI / 2) * r, c[i][1] + Math.sin(ang - Math.PI / 2) * r]);
    right.push([c[i][0] + Math.cos(ang + Math.PI / 2) * r, c[i][1] + Math.sin(ang + Math.PI / 2) * r]);
  }
  const capEnd = ellipsePts(c[n - 1][0], c[n - 1][1], r1, r1, 0, ang1 - Math.PI / 2, ang1 + Math.PI / 2, 8);
  const capStart = ellipsePts(c[0][0], c[0][1], r0, r0, 0, ang0 + Math.PI / 2, ang0 + Math.PI * 1.5, 8);
  return [...left, ...capEnd, ...right.reverse(), ...capStart];
}
export const pathOf = (pts: Pt[]): PathFn => (c) => {
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
  c.closePath();
};
export const ellipsePath = (cx: number, cy: number, rx: number, ry: number, rot = 0): PathFn => (c) => {
  c.beginPath(); c.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), rot, 0, 7);
};
export function bbox(pts: Pt[]) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, rw: (x1 - x0) / 2, rh: (y1 - y0) / 2 };
}

// ---------- engine ----------
export function createEngine(W: number, H: number) {
  // Paper tooth: random-alpha speckle, erased out of the graphite so strokes look grainy.
  const tooth = new OffscreenCanvas(256, 256);
  {
    const t = tooth.getContext("2d")!, img = t.createImageData(256, 256), R = rng(7);
    for (let i = 0; i < img.data.length; i += 4) img.data[i + 3] = Math.pow(R(), 2.2) * 235;
    t.putImageData(img, 0, 0);
  }

  const ink = new OffscreenCanvas(W, H), g = ink.getContext("2d")!;     // graphite
  const line = new OffscreenCanvas(W, H), l = line.getContext("2d")!;   // toon marker line
  const paint = new OffscreenCanvas(W, H), p = paint.getContext("2d")!; // flat colour
  const layers = [g, l, p];

  let look: Look = { paper: "#dddce9", graphite: "#16161f", weight: 1.6, boil: 1, grain: 0.9 };
  const scales: number[] = [1];
  const scale = () => scales[scales.length - 1];

  // One stroke = a few passes of short segments with pressure taper, width and alpha flutter.
  function stroke(toon: boolean, pts: Pt[], R: Rand, { w = 2.4, a = 0.6, passes = 2, jitter = 1.1, taper = true, color }: StrokeOpts = {}) {
    if (pts.length < 2) return;
    const c = toon ? l : g, sc = scale(), wk = Math.pow(sc, -0.6), j = (toon ? jitter * 0.45 : jitter) / sc;
    const off = ((toon ? 1 : 3) * look.boil) / sc;
    c.strokeStyle = toon ? color ?? TOON_LINE : look.graphite;
    pts = resample(pts, 9 / sc);
    if (toon) passes = 1;
    for (let q = 0; q < passes; q++) {
      const ox = (R() - 0.5) * off, oy = (R() - 0.5) * off;
      let px = pts[0][0] + ox, py = pts[0][1] + oy;
      for (let i = 1; i < pts.length; i++) {
        const t = i / (pts.length - 1);
        const press = taper ? Math.pow(Math.sin(Math.PI * t), 0.45) : 1;
        const x = pts[i][0] + ox + (R() - 0.5) * j * 2, y = pts[i][1] + oy + (R() - 0.5) * j * 2;
        if (toon) {
          c.lineWidth = w * 1.35 * wk * (0.6 + 0.4 * press) * (0.92 + R() * 0.16);
          c.globalAlpha = Math.min(1, a * 1.6);
        } else {
          c.lineWidth = w * look.weight * wk * (0.3 + 0.7 * press) * (0.8 + R() * 0.4);
          c.globalAlpha = Math.min(1, a * 1.25 * (0.55 + 0.45 * press) * (0.7 + R() * 0.3));
        }
        c.beginPath(); c.moveTo(px, py); c.lineTo(x, y); c.stroke();
        px = x; py = y;
      }
    }
  }

  const pen: Pen = {
    W, H, paper: look.paper, toon: false,

    pencil(pts, R, o) { stroke(pen.toon, pts, R, o); },

    // Closed curve: random start, overlaps its own beginning by ~5 %.
    outline(pts, R, o) {
      const n = pts.length, s = Math.floor(R() * n), over = Math.max(2, Math.round(n * 0.05));
      const out: Pt[] = [];
      for (let i = 0; i <= n + over; i++) out.push(pts[(s + i) % n]);
      stroke(pen.toon, out, R, o);
    },

    // A "ruled by hand" line: endpoints wander per drawing (boil), slight bow, overshoot.
    sketchLine(x0, y0, x1, y1, R, o = {}) {
      const boil = ((o.boil ?? 5) * look.boil * (pen.toon ? 0.35 : 1)) / scale(), over = (o.over ?? 0.04) * (0.5 + R());
      const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
      const ax = x0 - dx * over + (R() - 0.5) * boil, ay = y0 - dy * over + (R() - 0.5) * boil;
      const bx = x1 + dx * over + (R() - 0.5) * boil, by = y1 + dy * over + (R() - 0.5) * boil;
      const bow = (R() - 0.5) * len * 0.015;
      stroke(pen.toon, [[ax, ay], [(ax + bx) / 2 + nx * bow, (ay + by) / 2 + ny * bow], [bx, by]], R, o);
    },

    // Zigzag scribble hatching clipped to a shape. One continuous hand motion. Always graphite.
    hatch(clip, cx, cy, radius, angle, spacing, R, o = {}) {
      g.save(); clip(g); g.clip();
      const c = Math.cos(angle), s = Math.sin(angle), pts: Pt[] = [];
      spacing /= scale();
      let flip = 1;
      for (let k = -radius; k <= radius; k += spacing * (0.6 + R() * 0.8)) {
        const ext = radius * (0.85 + R() * 0.3) * flip;
        pts.push([cx + c * -ext - s * k, cy + s * -ext + c * k], [cx + c * ext - s * (k + spacing * 0.4), cy + s * ext + c * (k + spacing * 0.4)]);
        flip = -flip;
      }
      stroke(false, pts, R, { w: 2.6, a: 0.5, passes: 1, jitter: 1.6, taper: false, ...o });
      g.restore();
    },

    scribble(x, y, len, angle, amp, R, o) {
      const pts: Pt[] = [], n = 5 + Math.floor(R() * 5), c = Math.cos(angle), s = Math.sin(angle);
      for (let i = 0; i <= n; i++) {
        const t = (i / n) * len, off = (i % 2 ? 1 : -1) * amp * (0.5 + R());
        pts.push([x + c * t - s * off, y + s * t + c * off]);
      }
      stroke(pen.toon, pts, R, { w: 1.8, a: 0.35, passes: 1, ...o });
    },

    // A solid dark spot made of a tight spiral (eyes, buttons). Optionally an ellipse r × ry, rotated.
    blot(x, y, r, R, ry = r, rot = 0) {
      const pts: Pt[] = [], a0 = R() * 6.28, k = Math.max(ry / r, r / ry), n = Math.round(28 * k), c = Math.cos(rot), s = Math.sin(rot);
      for (let i = 0; i <= n; i++) {
        const u = i / n, a = a0 + u * 15 * k, px = Math.cos(a) * r * u, py = Math.sin(a) * ry * u;
        pts.push([x + px * c - py * s, y + px * s + py * c]);
      }
      stroke(pen.toon, pts, R, { w: Math.max(2.2, Math.min(r, ry) * 0.75), a: 0.95, passes: 2, jitter: 0.3, taper: false });
    },

    // Occlusion: rub out whatever was drawn behind a solid form before drawing the form itself.
    erase(path) {
      for (const c of [g, l]) { c.save(); c.globalCompositeOperation = "destination-out"; c.globalAlpha = 1; path(c); c.fill(); c.restore(); }
    },

    fill(path, color) { p.save(); p.globalAlpha = 1; p.fillStyle = color; path(p); p.fill(); p.restore(); },

    // Solid form: erase what is behind → flat fill → hatched shadow (pencil only) → contour → shadow-side accent.
    // tone: 0 bare, 1 light shadow, 2 core + cross-hatch, 3 dark cloth (dense hatching, still strokes).
    form(pts, R, { fill, tone = 0, line: ln, accent = true, rim = 1, sketchy = false } = {}) {
      pts = resample([...pts, pts[0]], 14 / scale()).slice(0, -1);
      const path = pathOf(pts), toon = pen.toon;
      pen.erase(path);
      pen.fill(path, toon ? fill ?? "#ffffff" : look.paper); // pencil forms are bare paper; `fill` is the toon colour
      if (!toon && tone > 0) {
        const b = bbox(pts), rad = Math.hypot(b.rw, b.rh) * 1.05, tilt = (R() - 0.5) * 0.08;
        // the form minus a copy of itself shifted toward the light (upper left)
        const shadow = (lx: number, ly: number): PathFn => (c) => {
          path(c); c.clip();
          c.beginPath(); c.rect(b.cx - 9999, b.cy - 9999, 19998, 19998);
          c.moveTo(pts[0][0] + lx * rim * b.rw, pts[0][1] + ly * rim * b.rh);
          for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0] + lx * rim * b.rw, pts[i][1] + ly * rim * b.rh);
          c.closePath();
          // hatch() clips to the current path: keep even-odd by clipping here, then hand over a full rect
          c.clip("evenodd"); c.beginPath(); c.rect(b.cx - 9999, b.cy - 9999, 19998, 19998);
        };
        if (tone === 3) {
          pen.hatch(shadow(-1.7, -1.8), b.cx, b.cy, rad, -0.8 + tilt, 7, R, { a: 0.8, w: 3.2 });
          pen.hatch(shadow(-0.5, -0.55), b.cx, b.cy, rad, 0.75 + tilt, 8, R, { a: 0.7, w: 3 });
          pen.hatch(shadow(-0.9, -1.0), b.cx, b.cy, rad, -0.4 + tilt, 9, R, { a: 0.6, w: 3 });
        } else {
          pen.hatch(shadow(-0.34, -0.38), b.cx, b.cy, rad, -0.8 + tilt, 13, R, { a: 0.55 });
          if (tone === 2) {
            pen.hatch(shadow(-0.5, -0.56), b.cx, b.cy, rad, -0.8 + tilt, 7, R, { a: 0.75, w: 3.2 });
            pen.hatch(shadow(-0.62, -0.7), b.cx, b.cy, rad, 0.75 + tilt, 9, R, { a: 0.6 });
          }
        }
      }
      if (sketchy && !toon) {
        const n = pts.length, k = 4 + Math.floor(R() * 3), start = Math.floor(R() * n);
        for (let j = 0; j < k; j++) { // the contour is found in several goes, each overshooting the last
          const i0 = start + Math.floor((j * n) / k) - Math.ceil(n * 0.03), i1 = start + Math.floor(((j + 1) * n) / k) + Math.ceil(n * 0.04), run: Pt[] = [];
          for (let i = i0; i <= i1; i++) run.push(pts[((i % n) + n) % n]);
          stroke(false, run, R, { w: 3.2, a: 0.82, jitter: 1.5, ...ln, passes: R() < 0.5 ? 2 : 1 });
        }
        const a0 = Math.floor(R() * n), ox = (R() - 0.5) * 8, oy = (R() - 0.5) * 8, ghost: Pt[] = [];
        for (let i = a0; i < a0 + n * 0.25; i++) { const q = pts[i % n]; ghost.push([q[0] + ox, q[1] + oy]); }
        stroke(false, ghost, R, { w: 1.8, a: 0.38, passes: 1 });
      } else pen.outline(pts, R, toon ? { w: 3, a: 1, passes: 1, ...ln } : { w: 3.4, a: 0.85, passes: 2, ...ln });
      if (!toon && accent) {
        // heavier contour where the outward normal faces away from the light (lower right)
        let area = 0;
        for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; area += a[0] * b[1] - b[0] * a[1]; }
        const sgn = area > 0 ? 1 : -1, n = pts.length;
        let run: Pt[] = [];
        for (let i = 0; i <= n; i++) {
          const a = pts[i % n], b = pts[(i + 1) % n], len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
          const nx = (sgn * (b[1] - a[1])) / len, ny = (-sgn * (b[0] - a[0])) / len;
          if (i < n && nx * 0.7 + ny * 0.7 > 0.35) run.push(a);
          else { if (run.length > 3) stroke(false, run, R, { w: 4.2, a: 0.8, passes: 1 }); run = []; }
        }
      }
    },

    clip(path, draw) {
      for (const c of layers) { c.save(); path(c); c.clip(); }
      try { draw(); } finally { for (const c of layers) c.restore(); }
    },

    push(x, y, rot = 0, sx = 1, sy = sx) {
      for (const c of layers) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(sx, sy); }
      scales.push(scale() * Math.sqrt(Math.abs(sx * sy)));
    },
    pop() { for (const c of layers) c.restore(); scales.pop(); },
  };

  let size = 0;
  function render(canvas: HTMLCanvasElement, drawing: number, t: number, k: number, style: Look, shots: Shot[]) {
    look = style; pen.paper = style.paper;
    const R = rng(drawing);

    for (const c of layers) {
      if (size !== k) { c.canvas.width = W * k; c.canvas.height = H * k; }
      c.reset(); c.setTransform(k, 0, 0, k, 0, 0); c.lineCap = "round"; c.lineJoin = "round";
    }
    size = k; scales.length = 1; pen.toon = false;

    const shot = shots.find((s) => t >= s.start - 1e-6 && t < s.end - 1e-6) ?? shots[shots.length - 1];
    pen.toon = shot.world === "toon";
    try { shot.draw(pen, t - shot.start, R); } catch (e) { console.error("shot failed", shot.start, e); }

    // Bite the paper tooth out of the graphite; new offset per drawing so the grain boils too.
    g.setTransform(k, 0, 0, k, 0, 0);
    g.globalCompositeOperation = "destination-out"; g.globalAlpha = style.grain;
    g.save(); g.translate(-R() * 256, -R() * 256); g.scale(1.6, 1.6);
    g.fillStyle = g.createPattern(tooth, "repeat")!; g.fillRect(0, 0, W, H); g.restore();

    // Paper → colour → grain → toon line → graphite multiplied on top with gate weave and lens softness.
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.globalCompositeOperation = "source-over"; ctx.filter = "none"; ctx.globalAlpha = 1;
    ctx.fillStyle = style.paper; ctx.fillRect(0, 0, W, H);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(paint, 0, 0); ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.globalAlpha = 0.05; ctx.fillStyle = ctx.createPattern(tooth, "repeat")!; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(line, 0, 0);
    ctx.globalCompositeOperation = "multiply"; ctx.filter = `blur(${0.7 * k}px)`;
    ctx.drawImage(ink, (R() - 0.5) * 5 * k, (R() - 0.5) * 5 * k);
    ctx.filter = "none"; ctx.globalCompositeOperation = "source-over";
    ctx.setTransform(k, 0, 0, k, 0, 0);
    const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 0.95);
    const va = shot.world === "toon" ? 0.12 : 0.28;
    v.addColorStop(0, "rgba(120,118,150,0)"); v.addColorStop(1, `rgba(120,118,150,${va})`);
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }

  return { render, pen };
}
