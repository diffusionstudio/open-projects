import { COMPARE_END, T_SINK } from "./compare.js";

/* ── the close ───────────────────────────────────────────────────────────── */

// The card: the maker named, one quiet line of interface type on a frame
// bleached to the brand's light tone. The dive takes the comparison out and
// the white comes up under it on the dive's own curve — the film's one hard
// change of ground, so the credits read as a clear cut. Then the card comes
// down out of the viewer and keeps coming for the whole scene on DWINDLE —
// most of the travel at the cut, a slow drift down through the hold, landed
// on its 40% size in the last frames. Its own fade rides that first rush,
// keyframed on the node as every fade in the film is.

export const TITLE = "Edited by Fable 5";
export const FS_TITLE = 64;

export const TITLE_FROM = 4;
export const TITLE_TO = 0.4; // landed at 40% of the set size
export const T_TITLE = COMPARE_END; // the frame emptied, then the card
export const TITLE_IN = 500; // the arriving side's half of the transition
export const TITLE_FADE = 300; // up while the arrival is at its quickest

// keyframe strings carry no spaces — a spaced bezier is rejected at mount
export const TITLE_EASE = "cubicBezier(0.2,0.75,0.34,0.94)"; // ENTER's own numbers

// the ground: white up under the diving comparison on the sink's own curve —
// barely there, then all at once. In three frames after the dive so the
// tiles are seen leaving on the dark, and shorter by two, so the frame has
// gone white a breath after the card cuts in.
export const T_GROUND = T_SINK + (3 * 1000) / 30;
export const GROUND_IN = COMPARE_END - T_SINK - (2 * 1000) / 30;
export const GROUND_EASE = "cubicBezier(0.86,0.005,0.999,0.177)"; // DIVE's own numbers

// Blur: not motion but a veil — full at the cut, lifted across the first
// quarter-second, laid back over the last, and the card crisp for the whole
// stay between. The filter runs before the element's scale, so the radius
// is stated in the frame's pixels and bought back up by the scale it is
// about to be drawn at.
const BLUR = 12; // px on screen, at either end
export const BLUR_MS = 250;
export const blurAt = (b, s) => (BLUR * b) / s;

// the card landed and read, then the film is done
const HOLD = 1800;
export const CREDITS_END = T_TITLE + TITLE_IN + HOLD;

// the scale is not the transition's half-second but the scene's whole length
export const TITLE_DUR = CREDITS_END - T_TITLE;
