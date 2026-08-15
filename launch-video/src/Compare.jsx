import { For } from "solid-js";

import { W, H } from "./frame.js";
import { CURSOR_ARROW } from "./art.js";
import { PTR_BOX, HOT_P, S } from "./prompt.js";
import {
  AROLL,
  AROLL_POST,
  LEFT,
  rightAt,
  leftAt,
  sunkAt,
  FADE_EASE,
  ARRIVE,
  T_PLAY,
  T_LEFT_IN,
  T_LEFT_ON,
  T_SET1,
  T_FADE,
  T_FADED,
  LOG_WGSL,
  LOG_SAT,
  LOG_CONTRAST,
  FOOT,
  LIKE_I,
  LIKE_FILL_D,
  LIKE_A,
  PTR_K,
  T_HITS,
  likeAt,
  hitAt,
  likeFillAt,
  balloonAt,
} from "./compare.js";
import { ART_LABEL_L, ART_LABEL_R } from "./compare-art.js";

/* ── comparing ───────────────────────────────────────────────────────────── */

// Two native players and a sheet of type. Stacking follows start time — a
// later-starting node draws above an earlier one — so the order is set by
// when each is cut in: the input first (under), the edit next (over it and
// over the composing shot it fades in on), the titles last. The edit's box
// is the collapse-and-slide rect the timeline writes; its crossfade is its
// own keyframes, engine-side. The input never fades on screen: it is lit
// while fully covered, and revealed by the slide.

const LABELS = [ART_LABEL_L, ART_LABEL_R];
const LIKE = FOOT[LIKE_I];

export function Compare(props) {
  const v = () => props.v;

  // both players' boxes, seen through the way out: the sink scales every
  // rect about the frame's centre, 1 until the film's last move
  const R = () => sunkAt(rightAt(v().arrive.k, v().slide.k), v().sink.s);
  const L = () =>
    sunkAt({ x: leftAt(v().slide.k), y: LEFT.y, w: LEFT.w, h: LEFT.h, r: LEFT.r }, v().sink.s);

  // the press now, if any: the deepest of every balloon's opening sliver —
  // the thumb pops and the pointer dips on the same reading
  const hit = () => Math.max(...v().balloon.map((b) => hitAt(b.k)));
  const cur = () => likeAt(v().likeCur.k);

  return (
    <>
      {/* the input: on a frame early so it stacks under the edit, unseen
          until the slide; muted — one voice is already speaking */}
      <video
        name="Log input"
        src={AROLL}
        x={L().x}
        y={L().y}
        width={L().w}
        height={L().h}
        cornerRadius={L().r}
        muted
        opacity={[
          { time: 0, value: 0 },
          { time: (T_LEFT_ON - T_LEFT_IN) / 1000, value: 0 },
          { time: (T_LEFT_ON - T_LEFT_IN) / 1000 + 0.034, value: 1 },
          { time: (T_FADE - T_LEFT_IN) / 1000, value: 1, easing: FADE_EASE },
          { time: (T_FADED - T_LEFT_IN) / 1000, value: 0 },
        ]}
        start={T_LEFT_IN / 1000}
        end={T_FADED / 1000}
      >
        {/* the raw look: the display frame re-encoded through the log curve,
            so the input reads as what the camera wrote, not a finished grade */}
        <shaderPaint
          wgsl={LOG_WGSL}
          uniforms={{ sat: LOG_SAT, contrast: LOG_CONTRAST }}
        />
      </video>

      {/* the edit: a much larger frame collapsing onto the player's rect as
          the code is zoomed into it, the crossfade keyframed over the same
          window */}
      <video
        name="Agentic output"
        src={AROLL_POST}
        x={R().x}
        y={R().y}
        width={R().w}
        height={R().h}
        cornerRadius={R().r}
        opacity={[
          { time: 0, value: 0, easing: FADE_EASE },
          { time: ARRIVE / 1000, value: 1 },
          { time: (T_FADE - T_PLAY) / 1000, value: 1, easing: FADE_EASE },
          { time: (T_FADED - T_PLAY) / 1000, value: 0 },
        ]}
        start={T_PLAY / 1000}
        end={T_FADED / 1000}
        muted
      />

      {/* the titles: the design's vectors at frame coordinates — the labels
          risen whole in the house manner, and the footer a word or icon at a
          time, each clipped to its own padded box and slid up out of it */}
      <html
        name="Compare titles"
        width={W}
        height={H}
        start={T_SET1 / 1000}
        end={T_FADED / 1000}
        opacity={[
          { time: (T_FADE - T_SET1) / 1000, value: 1, easing: FADE_EASE },
          { time: (T_FADED - T_SET1) / 1000, value: 0 },
        ]}
      >
        <div style={`position:relative;width:${W}px;height:${H}px;overflow:hidden;`}>
          {/* the way out: the whole sheet — labels, footer, likes, hand —
              through the same sink as the players, about the same centre.
              Layout scale (zoom), not a transform: a store-driven transform
              on the full-frame div drops the subtree from the read-back;
              zoom is layout, which the read-back honours. It scales about
              the top-left, so the outer div carries the centring — kept
              clear of the zoom, whose own offsets some engines scale too. */}
          <div
            style={{
              position: "absolute",
              left: `${((W * (1 - v().sink.s)) / 2).toFixed(2)}px`,
              top: `${((H * (1 - v().sink.s)) / 2).toFixed(2)}px`,
              width: `${W}px`,
              height: `${H}px`,
            }}
          >
            <div
              style={{
                position: "absolute",
                width: `${W}px`,
                height: `${H}px`,
                zoom: v().sink.s.toFixed(4),
              }}
            >
              <For each={LABELS}>
                {(paths, i) => (
                  <div
                    style={{
                      position: "absolute",
                      inset: "0",
                      opacity: v().labels[i()].o.toFixed(3),
                      transform: `translateY(${v().labels[i()].y.toFixed(2)}px)`,
                    }}
                  >
                    <svg
                      width={`${W}`}
                      height={`${H}`}
                      viewBox={`0 0 ${W} ${H}`}
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <For each={paths}>{(p) => <path d={p.d} fill={p.fill} />}</For>
                    </svg>
                  </div>
                )}
              </For>

              <For each={FOOT}>
                {(it, i) => (
                  <div
                    style={{
                      position: "absolute",
                      left: `${it.x}px`,
                      top: `${it.y}px`,
                      width: `${it.w}px`,
                      height: `${it.h}px`,
                      overflow: "hidden",
                      /* the thumb pops with each press — box and glyph scaled as
                         one, so the clip that served the rise never bites */
                      "transform-origin": "50% 50%",
                      transform:
                        i() === LIKE_I ? `scale(${(1 + 0.16 * hit()).toFixed(4)})` : "none",
                    }}
                  >
                    {/* the sheet at the item's own scale, carried back so the
                        item sits in its box, then slid down the box's height and
                        risen */}
                    <svg
                      width={`${W * it.f}`}
                      height={`${H * it.f}`}
                      viewBox={`0 0 ${W} ${H}`}
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        position: "absolute",
                        left: `${it.sx}px`,
                        top: `${it.sy}px`,
                        transform: `translateY(${((v().foot[i()].y / 100) * it.h).toFixed(2)}px)`,
                      }}
                    >
                      <path
                        d={it.d}
                        fill={i() === LIKE_I ? likeFillAt(v().likeOn.k) : it.fill}
                      />
                      {/* the lit state: the silhouette filled in over the
                          outline, arriving with the first hit and staying */}
                      {i() === LIKE_I ? (
                        <path d={LIKE_FILL_D} fill={LIKE_A(v().likeOn.k.toFixed(3))} />
                      ) : null}
                    </svg>
                  </div>
                )}
              </For>

              {/* the likes let go: one glyph per hit, popped to size by the press
                  that loosed it, climbing off the thumb and leaning its own way.
                  The fade rides the fill's alpha — store-driven CSS opacity on a
                  transformed div is dropped by the read-back */}
              <For each={T_HITS}>
                {(t, i) => {
                  const b = () => balloonAt(v().balloon[i()].k, i());
                  return (
                    <div
                      style={{
                        position: "absolute",
                        left: `${LIKE.x}px`,
                        top: `${LIKE.y}px`,
                        width: `${LIKE.w}px`,
                        height: `${LIKE.h}px`,
                        "transform-origin": "50% 50%",
                        transform:
                          `translate(${b().x.toFixed(2)}px, ${b().y.toFixed(2)}px) ` +
                          `scale(${b().s.toFixed(4)})`,
                      }}
                    >
                      <svg
                        width={`${W * LIKE.f}`}
                        height={`${H * LIKE.f}`}
                        viewBox={`0 0 ${W} ${H}`}
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          position: "absolute",
                          left: `${LIKE.sx}px`,
                          top: `${LIKE.sy}px`,
                        }}
                      >
                        <path d={LIKE_FILL_D} fill={LIKE_A(b().o.toFixed(3))} />
                      </svg>
                    </div>
                  );
                }}
              </For>

              {/* the hand, over everything: the prompt's own arrow at the prompt's
                  own size, held by its point — off below the frame until the
                  reach, dipping with each press */}
              <div
                style={{
                  position: "absolute",
                  left: `${(cur().x - HOT_P.x * PTR_K).toFixed(2)}px`,
                  top: `${(cur().y - HOT_P.y * PTR_K).toFixed(2)}px`,
                  width: `${PTR_BOX.w * S * PTR_K}px`,
                  height: `${PTR_BOX.h * S * PTR_K}px`,
                  "background-image": CURSOR_ARROW,
                  "background-size": "100% 100%",
                  "transform-origin": `${(HOT_P.x * PTR_K).toFixed(2)}px ${(HOT_P.y * PTR_K).toFixed(2)}px`,
                  transform:
                    `rotate(${v().likeSwing.a.toFixed(2)}deg) ` +
                    `scale(${(1 - 0.08 * hit()).toFixed(4)})`,
                }}
              />
            </div>
          </div>
        </div>
      </html>
    </>
  );
}
