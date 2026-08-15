import { For } from "solid-js";

import { LH, GUT } from "./frame.js";
import { C_BAR, C_GREEN } from "./theme.js";
import { GUTTER, QUIET } from "./output.js";

/* ── row ─────────────────────────────────────────────────────────────────── */

export function Row(props) {
  const g = () => props.gutter;

  return (
    <div style={`height:${props.row.h}px;display:flex;align-items:flex-start;`}>
      <span
        style={{
          width: `${GUT}px`,
          "flex-shrink": "0",
          "line-height": `${LH}px`,
          color: QUIET[props.row.k] ? C_BAR : C_GREEN,
          opacity: String(g().o),
          transform: `translateY(${g().y.toFixed(2)}px)`,
        }}
      >
        {GUTTER[props.row.k]}
      </span>
      <div style={{ flex: "1", "line-height": `${LH}px`, "white-space": "pre" }}>
        {props.children}
      </div>
    </div>
  );
}

// Each word rides up through its own clip: the box is the word's advance and
// one line tall, so nothing shows until the glyphs clear the mask.
export function Words(props) {
  const lh = () => props.lh ?? LH;

  return (
    <For each={props.body.lines}>
      {(line) => (
        <div style={{ height: `${lh()}px`, "line-height": `${lh()}px`, "white-space": "pre" }}>
          <For each={line}>
            {(w) => (
              <span
                style={{
                  display: "inline-block",
                  overflow: "hidden",
                  "vertical-align": "top",
                  height: `${lh()}px`,
                  "line-height": `${lh()}px`,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    ...w.css,
                    transform: `translateY(${props.words[w.i].y.toFixed(2)}%)`,
                  }}
                >
                  {w.text}
                </span>
              </span>
            )}
          </For>
        </div>
      )}
    </For>
  );
}
