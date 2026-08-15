import { For } from "solid-js";

import { W, H } from "./frame.js";
import { C_TEXT } from "./theme.js";
import { CURSOR_TEXT } from "./art.js";
import {
  LETTERS,
  FS_WORD,
  LH_WORD,
  BASELINE,
  LINE_X,
  LINE_Y,
  PAD,
  CARET_W,
  CARET_H,
  CARET_Y,
  CARET_DX,
  blurAt,
  T_ANALYZE,
  ANALYZE_END,
} from "./analyze.js";

/* ── analyzing ───────────────────────────────────────────────────────────── */

export function Analyze(props) {
  const v = () => props.v;

  return (
    <html
      name="Analyzing"
      width={W}
      height={H}
      start={T_ANALYZE / 1000}
      end={ANALYZE_END / 1000}
    >
      <div
        style={`position:relative;width:${W}px;height:${H}px;overflow:hidden;
                font-family:'Anton';font-weight:400;color:${C_TEXT};
                -webkit-font-smoothing:antialiased;`}
      >
        {/* the camera: beam and line together on one pull to the left */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            transform: `translateX(${v().pan.x.toFixed(2)}px)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: `${(LINE_X - CARET_DX).toFixed(2)}px`,
              top: `${CARET_Y.toFixed(2)}px`,
              width: `${CARET_W}px`,
              height: `${CARET_H}px`,
              "background-image": CURSOR_TEXT,
              "background-size": "100% 100%",
            }}
          />

          {/* kerning off and each letter its own box, so the browser's advances
              match the ones measured in analyze.js */}
          <div
            style={{
              position: "absolute",
              left: `${(LINE_X + PAD).toFixed(2)}px`,
              top: `${LINE_Y}px`,
              height: `${LH_WORD}px`,
              "font-size": `${FS_WORD}px`,
              "line-height": `${LH_WORD}px`,
              "letter-spacing": "0",
              "font-kerning": "none",
              "font-variant-ligatures": "none",
              "white-space": "pre",
            }}
          >
            <For each={LETTERS}>
              {(c, i) => (
                <span
                  style={{
                    display: "inline-block",
                    "transform-origin": `0px ${BASELINE.toFixed(2)}px`,
                    transform: `scale(${v().word[i()].k.toFixed(4)})`,
                    // smeared while standing up, sharp the frame it lands
                    filter:
                      v().word[i()].k < 1
                        ? `blur(${blurAt(v().word[i()].k).toFixed(2)}px)`
                        : "none",
                    // hidden, not merely small, until struck
                    visibility: v().word[i()].on ? "visible" : "hidden",
                  }}
                >
                  {c}
                </span>
              )}
            </For>
          </div>
        </div>
      </div>
    </html>
  );
}
