import { For } from "solid-js";

import { W, H } from "./frame.js";
import { C_TEXT, C_DIM } from "./theme.js";
import {
  COUNT,
  COVER_SRCS,
  BLOOM_B,
  OUT_O,
  OUT_B,
  MAT,
  STEM,
  DOTS,
  FS_LABEL,
  LH_LABEL,
  LABEL_LEFT,
  CX,
  CY,
  frameAt,
  T_WATCH,
  WATCH_END,
} from "./watch.js";

/* ── watching ────────────────────────────────────────────────────────────── */

// A pile of frames at the head of a ring, unwinding along it around a line of
// type. The timeline writes how far through the winding the shot is (`wind.p`)
// and how near the arrangement has come (`depth.m`); every position, size and
// stacking order is read off those in frameAt.

const INDEX = Array.from({ length: COUNT }, (_, i) => i);

// A strip three times the line's width, so the band is off the line at both
// ends of its pass; sweeping it right-to-left carries the band across the type
// left-to-right.
const SHIMMER_BAND = `linear-gradient(100deg,
  ${C_DIM} 0%, ${C_DIM} 42%, ${C_TEXT} 50%, ${C_DIM} 58%, ${C_DIM} 100%)`;

export function Watch(props) {
  const v = () => props.v;

  const lit = () => (1 - (v().shimmer.t % 1)) * 100;
  const dots = () => ".".repeat(Math.floor(v().dots.t) % DOTS);

  return (
    <html
      name="Watching"
      width={W}
      height={H}
      start={T_WATCH / 1000}
      end={WATCH_END / 1000}
      // The focus is the whole drawn frame's, so the node carries it: one
      // picture resolving, not ten and a line of type each resolving
      // separately. The engine's own preset rather than a CSS `filter`, which
      // blanks an htmlPaint outright (diffusionstudio/editor#12).
      animations={[
        { type: "blur", duration: BLOOM_B / 1000 },
        { type: "blur", phase: "out", duration: OUT_B / 1000 },
        { type: "fade", phase: "out", duration: OUT_O / 1000 },
      ]}
    >
      <div style={`position:relative;width:${W}px;height:${H}px;overflow:hidden;`}>
        <div
          style={{
            position: "absolute",
            left: `${(CX + LABEL_LEFT).toFixed(2)}px`,
            top: `${(CY - LH_LABEL / 2).toFixed(2)}px`,
            height: `${LH_LABEL}px`,
            "z-index": "1",
            "font-family": "'Inter'",
            "font-size": `${FS_LABEL}px`,
            "font-weight": "500",
            "line-height": `${LH_LABEL}px`,
            "white-space": "pre",
            "-webkit-font-smoothing": "antialiased",
            // the type is the window the band is seen through
            "background-image": SHIMMER_BAND,
            "background-size": "300% 100%",
            "background-position": `${lit().toFixed(2)}% 0`,
            "background-clip": "text",
            "-webkit-background-clip": "text",
            color: "transparent",
            opacity: v().label.o.toFixed(3),
            "transform-origin": `${(-LABEL_LEFT).toFixed(2)}px 50%`,
            transform: `scale(${v().label.s.toFixed(4)})`,
          }}
        >
          {STEM}
          {dots()}
        </div>

        <For each={INDEX}>
          {(i) => {
            // one number for everything that goes round, and the distance
            const at = () => frameAt(i, v().wind.p, v().depth.m);

            return (
              <div
                style={{
                  position: "absolute",
                  // sized rather than scaled, so the mat stays the same
                  // width on the biggest frame and the smallest
                  left: `${(CX + at().x - at().w / 2).toFixed(2)}px`,
                  top: `${(CY + at().y - at().h / 2).toFixed(2)}px`,
                  width: `${at().w.toFixed(2)}px`,
                  height: `${at().h.toFixed(2)}px`,
                  overflow: "hidden",
                  // …but the mat does scale with distance (m)
                  "box-shadow": `0 0 0 ${(MAT * v().depth.m).toFixed(2)}px ${C_TEXT}`,
                  // each blends up on its own, one just behind the next, so
                  // the pile assembles rather than switching on
                  opacity: v().blend[i].o.toFixed(3),
                  transform: `rotate(${at().deg.toFixed(2)}deg)`,
                  "z-index": String(at().over),
                }}
              >
                <img
                  src={COVER_SRCS[i]}
                  style={`display:block;width:100%;height:100%;object-fit:cover;`}
                />
              </div>
            );
          }}
        </For>
      </div>
    </html>
  );
}
