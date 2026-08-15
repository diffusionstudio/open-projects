import { cubicBezier } from "animejs";

/* ── easing ──────────────────────────────────────────────────────────────── */

export const ENTER = cubicBezier(0.2, 0.75, 0.34, 0.94);
export const EXIT = cubicBezier(1, 0.02, 0.54, 0.42);

// typing: leaves rest and keeps gathering, quickest at the last key
export const WRITE = cubicBezier(0.3, 0, 0.75, 0.55);
// soft and symmetric: gentle at both ends, quick through the middle
export const FOLLOW = cubicBezier(0.45, 0, 0.55, 1);
// a long arrival: motion spent evenly rather than front-loaded
export const SETTLE = cubicBezier(0.25, 0.4, 0.35, 1);

// The whole watch shot's rotation on one curve: quick, slow, then quickest.
// Monotone throughout, so a move read off it never doubles back. The start is
// deliberately gentle — the unwinding covers a long way over a short share of
// it, and a quicker start would empty the pile before it was seen.
export const WIND = cubicBezier(0.35, 0.45, 0.85, 0.28);

// coming to rest: fast in, nearly all of it spent slowing
export const LAND = cubicBezier(0.16, 1, 0.3, 1);

// Apple's own settle — the curve under a sheet's presentation: away at
// speed, then a long even landing. Quicker off the mark than SETTLE, softer
// at the end than LAND.
export const GLIDE = cubicBezier(0.66, 0.004, 0.376, 1.001);

// the player's collapse onto its frame: off at full speed — the size is
// changing from the first visible frame — with nearly the whole length a
// single long landing
export const COLLAPSE = cubicBezier(0.001, 0.725, 0.238, 0.99);

// a hand's reach: one throw, quickest a third in, then homing onto the target
export const AIM = cubicBezier(0.32, 0.04, 0.3, 1);

// the way out: barely leaving, then all of it at once — a thing let go
export const DIVE = cubicBezier(0.86, 0.005, 0.999, 0.177);

// the card's arrival: nearly the whole travel in the first frames, then a
// long soft settle onto its own size
export const ALIGHT = cubicBezier(0, 0.816, 0.135, 1.001);

// the card's whole stay on one curve: most of the shrink spent at the cut,
// a slow drift down through the hold, the last of it closed in the final
// frames
export const DWINDLE = cubicBezier(0, 0.986, 1, 0.371);

// the mark set down: in at full speed — the size is falling from the first
// frame — seated in the first third, the rest one long even landing
export const STAMP = cubicBezier(0, 0.626, 0.369, 0.993);

// the step aside: away at once, softer off the mark than STAMP, and nearly
// the whole length spent easing the name onto its place
export const UNVEIL = cubicBezier(0, 0.36, 0.469, 0.993);

// A letter standing up. Not ENTER — that spends three quarters of itself in
// its first fifth, so over a few frames the arrival would never be seen.
export const STAND = cubicBezier(0.5, 0, 0.3, 1);

// a hand withdrawing: gathers from rest, unlike EXIT which holds at the top
export const DEPART = cubicBezier(0.55, 0, 0.85, 0.55);

// the box's quarter turn: gathering the whole way, quickest as it lands
export const TURN = cubicBezier(0.737, 0.195, 0.927, 0.549);

/* ── the camera ──────────────────────────────────────────────────────────── */

// Shots leave on the move they were already making (SWEEP, CLIMB) and the next
// arrives at the speed the last one left at, so a hand-over reads as one swing.

// bringing a shot on: in at speed, the rest of the length is the settle
export const CAM_IN = cubicBezier(0.161, 0.708, 0.562, 0.916);

// the panel's arrival: off at full speed, then one long even settle
export const PANEL_IN = cubicBezier(0, 0.544, 0.414, 0.994);

// The analyzing camera's pull to the left: eased in from rest — the shot is
// cut in on a still frame — gathering through the writing, then easing off as
// the last of the line is carried over the left edge.
export const PULL = cubicBezier(0.378, 0.226, 0.817, 0.634);

// The cold open's whole camera, one move: seven eighths near the writing's own
// rate, then the run-off takes the line off left in seven frames.
export const SWEEP = cubicBezier(0.705, 0.076, 0.965, 0.818);

// The install's whole camera, one move: at rest while there is room under the
// head, then gathering without let-up — quickest as it takes the block off.
export const CLIMB = cubicBezier(0.512, 0.203, 1, 0.788);
