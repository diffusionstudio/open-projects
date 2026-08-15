import { onMount, createEffect, createMemo } from "solid-js";
import { gsap } from "gsap";
import { cubicBezier } from "animejs";
import { useTicker } from "@diffusionstudio/jsx";
import { SIZE, INK, ACCENT } from "./theme";

const AMOUNT = "$12,000,000";
const READ_SIZE = 160; // font size at the readability point, near full-bleed

const MID = 0.9; // where the flicker ends — the strobe sits centered on the readable dwell
const FLICK_FRAMES = 12; // length of the accent/ink strobe leading into MID
const FLICK_STEP = 2; // frames per strobe state — higher is a slower flicker

export const DUR = 1.4;

// one continuous zoom-out, a single tween with a single cubic-bezier easing:
// near-vertical tangents at both ends crash in and accelerate out, while the
// flat middle keeps a slow, never-zero drift. The bezier dwells around an
// eased value of ~0.6, so the endpoints are chosen to put scale 1 right there
const S_FROM = 3; // scale at the cut
const S_TO = 0.6; // scale at the end of the beat
const shaped = cubicBezier(0, 0.965, 0.917, 0.3);

export function AmountScene(props) {
  const { time } = useTicker();
  let el;
  let tl;

  onMount(() => {
    tl = gsap.timeline({ paused: true, defaults: { lazy: false } });
    tl.fromTo(
      el,
      { xPercent: -50, yPercent: -50, scale: S_FROM },
      { scale: S_TO, duration: DUR, ease: shaped },
      0
    );
  });

  createEffect(() => {
    if (!tl) return;
    tl.seek(Math.min(Math.max(time() - props.start, 0), DUR));
  });

  // ignition flicker: a burst of single-frame accent/ink alternations leading
  // into the readability point — the words' recolor compressed into a strobe —
  // that dies back down to ink for the rest of the beat
  const color = createMemo(() => {
    const t = Math.min(Math.max(time() - props.start, 0), DUR);
    const flickStart = MID - FLICK_FRAMES / 30;
    if (t < flickStart || t >= MID) return INK;
    return Math.floor(((t - flickStart) * 30) / FLICK_STEP) % 2 === 0 ? ACCENT : INK;
  });

  return (
    <html {...SIZE} x={0} y={0} start={props.start} end={props.start + DUR}>
      <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
        <div
          ref={el}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            "font-family": "Inter",
            "font-weight": 600,
            "font-size": `${READ_SIZE}px`,
            "line-height": 1,
            "letter-spacing": "0em",
            "white-space": "nowrap",
            color: color(),
          }}
        >
          {AMOUNT}
        </div>
      </div>
    </html>
  );
}
