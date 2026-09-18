import { For } from "solid-js";

import { W, H, FS, LH } from "./frame.js";
import { C_TEXT, C_PROMPT, C_CYAN } from "./theme.js";
import { CMD, PROMPT_LEN, T_BLOCK_IN, HAND_OUT } from "./timing.js";
import { ROWS, ZOOM, BLOCK_X, BLOCK_W, HEAD_Y, T_END } from "./output.js";
import { Banner } from "./Banner.jsx";
import { Row, Words } from "./Row.jsx";

/* ── the install ─────────────────────────────────────────────────────────── */

// The block is drawn on the terminal's own grid and put on the frame by one
// factor: everything below `ZOOM` is a character cell, and the container is the
// only place the two meet.
export function Install(props) {
  const v = () => props.v;

  return (
    <html
      name="Install"
      width={W}
      height={H}
      start={T_BLOCK_IN / 1000}
      end={(T_END + HAND_OUT) / 1000} id="v0qyop"
    >
      <div
        style={`position:relative;width:${W}px;height:${H}px;overflow:hidden;
                font-family:'JetBrains Mono';font-size:${FS}px;font-weight:400;
                color:${C_TEXT};-webkit-font-smoothing:antialiased;`}
      >
        <div
          style={{
            position: "absolute",
            left: "0",
            top: "0",
            width: `${BLOCK_W}px`,
            "transform-origin": "0 0",
            transform:
              `translate(${(BLOCK_X + v().block.x).toFixed(2)}px, ` +
              `${(HEAD_Y - v().block.y).toFixed(2)}px) scale(${ZOOM})`,
          }}
        >
          <div style={`height:${LH}px;line-height:${LH}px;white-space:pre;`}>
            <span style={{ color: C_PROMPT }}>{CMD.slice(0, PROMPT_LEN)}</span>
            <span style={{ color: C_TEXT }}>{CMD.slice(PROMPT_LEN)}</span>
          </div>

          <For each={ROWS}>
            {(row, i) => {
              if (row.k === "gap") return <div style={`height:${row.h}px;`} />;

              if (row.k === "banner") return <Banner h={row.h} rows={v().banner} />;

              return (
                <Row row={row} gutter={v().gutter[i()]}>
                  {row.k === "badge" ? (
                    <span
                      style={{
                        display: "inline-block",
                        background: C_CYAN,
                        color: "#0A0A0A",
                        padding: "0 10px",
                        "line-height": "26px",
                        "border-radius": "4px",
                        "font-weight": "600",
                        "vertical-align": "middle",
                        opacity: String(v().badge.o),
                        transform: `translateY(${v().badge.y.toFixed(2)}px)`,
                      }}
                    >
                      skills
                    </span>
                  ) : (
                    row.body && <Words body={row.body} words={v().words[i()]} />
                  )}
                </Row>
              );
            }}
          </For>
        </div>
      </div>
    </html>
  );
}
