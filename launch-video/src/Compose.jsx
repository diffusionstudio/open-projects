import { For } from "solid-js";

import { W, H } from "./frame.js";
import {
  WORDS,
  LEFTS,
  topOf,
  viewAt,
  litAt,
  heatAt,
  GLOW_TEXT,
  FS_CODE,
  CW_CODE,
  LH_CODE,
  T_COMPOSE,
  COMPOSE_END,
} from "./compose.js";
import { T_ARRIVE, FADE_EASE } from "./compare.js";

/* ── composing ───────────────────────────────────────────────────────────── */

// The block is laid out whole, centred line by line, and blended in a token
// at a time. Nothing on the page moves: a token fades up in the place it will
// keep, and only the camera drifts, trailing the writing. The timeline writes
// one running count (`code.n`); every opacity and the camera are read off it.
// The pull back zooms the block down into the player's frame while a much
// larger frame collapses onto the same rect, the writing crossfading into
// the footage as the two converge — the code is the video — so the shot's
// last frame is the swap complete.

export function Compose(props) {
  const v = () => props.v;

  const cam = () => viewAt(v().code.n, v().zoom.k);

  return (
    <rect
      name="Composing"
      width={W}
      height={H}
      start={T_COMPOSE / 1000}
      end={COMPOSE_END / 1000} id="6p5unf" clipHeight={28}
    >
      <keyframeTrack property="opacity" id="zqx3nu">
        <keyframe time={(T_ARRIVE - T_COMPOSE) / 1000} value={1} easing={FADE_EASE} id="nm1cqa" />
        <keyframe time={(COMPOSE_END - T_COMPOSE) / 1000} value={0} id="hhnwbw" />
      </keyframeTrack>
      <htmlPaint id="hrh3bp">
        <div
          style={`position:relative;width:${W}px;height:${H}px;overflow:hidden;
                  font-family:'JetBrains Mono';font-size:${FS_CODE}px;font-weight:400;
                  -webkit-font-smoothing:antialiased;`}
        >
          {/* the camera: the whole block on one drift while the writing runs,
              held near the frame's middle, and one pull back once it is done —
              the chain reads outside in: centre the frame, scale, then carry
              the looked-at point to the origin. The crossfade off the footage
              is the node's own keyframed opacity, engine-side, not a style */}
          <div
            style={{
              position: "absolute",
              inset: "0",
              "transform-origin": "0 0",
              transform: `translate(${W / 2}px, ${H / 2}px) scale(${cam().s.toFixed(4)}) translate(${(-cam().x).toFixed(2)}px, ${(-cam().y).toFixed(2)}px)`,
            }}
          >
            <For each={WORDS}>
              {(words, l) => (
                <div
                  style={{
                    position: "absolute",
                    left: `${LEFTS[l()].toFixed(1)}px`,
                    top: `${topOf(l())}px`,
                    height: `${LH_CODE}px`,
                    "line-height": `${LH_CODE}px`,
                    "white-space": "pre",
                  }}
                >
                  {/* each token on its own cell, carrying its own blend; the
                      hot copy sits exactly over the inked one — same cells,
                      same glyphs — and cools away to reveal it */}
                  <For each={words}>
                    {(w) => (
                      <span
                        style={{
                          position: "absolute",
                          left: `${(w.a * CW_CODE).toFixed(1)}px`,
                          opacity: litAt(w.i, v().code.n).toFixed(3),
                        }}
                      >
                        <For each={w.runs}>
                          {(run) => <span style={{ color: run.color }}>{run.text}</span>}
                        </For>
                        <span
                          style={{
                            position: "absolute",
                            left: "0",
                            top: "0",
                            color: 'white',
                            "text-shadow": GLOW_TEXT,
                            opacity: heatAt(w.i, v().code.n).toFixed(3),
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
          </div>
        </div>
      </htmlPaint>
    </rect>
  );
}
