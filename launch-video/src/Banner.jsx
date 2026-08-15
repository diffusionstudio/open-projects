import { For } from "solid-js";

import { BANNER_CELLS, BANNER_ROW_COLOR, BANNER_ROW_SHADOW } from "./banner.js";

/* ── banner, drawn ───────────────────────────────────────────────────────── */

// Every cell of the ANSI Shadow art is its own rectangle, laid out in banner.js.
export function Banner(props) {
  return (
    <div style={`position:relative;height:${props.h}px;`}>
      <For each={BANNER_CELLS}>
        {(cells, r) => (
          // the row carries its own cells, so they stay rigid while it travels
          <div
            style={{
              position: "absolute",
              left: "0",
              top: "0",
              width: "100%",
              height: "100%",
              opacity: String(props.rows[r()].o),
              transform: `translateX(${props.rows[r()].x.toFixed(2)}px)`,
            }}
          >
            <For each={cells}>
              {(c) => (
                <div
                  style={{
                    position: "absolute",
                    left: `${c.x}px`,
                    top: `${c.y}px`,
                    width: `${c.w}px`,
                    height: `${c.h}px`,
                    background: c.s ? BANNER_ROW_SHADOW[r()] : BANNER_ROW_COLOR[r()],
                  }}
                />
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
}
