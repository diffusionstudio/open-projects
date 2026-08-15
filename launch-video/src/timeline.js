import { createTimeline } from "animejs";

import { GLIDE } from "./easing.js";
import { N_RUN, T_TOKENS, TYPE_MS, T_ZOOM, ZOOM } from "./compose.js";

/* ── timeline ────────────────────────────────────────────────────────────── */

// Plain objects, one per animated thing. anime writes them; the store in the
// scene mirrors them into the render. Nothing here reads the clock itself.
// composing: one running count the tokens' blends are read off, and the
// pull back onto the whole — the ground's blend is read off the latter
const code = { n: 0 };
const zoom = { k: 0 };

export const snapshot = () => ({
  code: { ...code },
  zoom: { ...zoom },
});

export function build() {
  const tl = createTimeline({ autoplay: false });

  // one count on one linear run, a token a beat — every blend and the
  // camera's drift are tables in compose.js read off this number
  tl.add(code, { n: { from: 0, to: N_RUN }, duration: TYPE_MS, ease: "linear" }, T_TOKENS)

    // the last token lit, the camera lets the writing go — one pull back
    // onto the block's own middle, the ground blending in under it on the
    // same fraction; Apple's settle, away at speed and landing long
    .add(zoom, { k: 1, duration: ZOOM, ease: GLIDE }, T_ZOOM);

  return tl;
}
