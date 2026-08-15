import { W, H } from "./frame.js";
import { ASSETS } from "./assets.js";
import { WORD_GONE } from "./analyze.js";

/* ── watching ────────────────────────────────────────────────────────────── */

// A pile of frames at the head of a ring, unwinding along it around a line of
// type. One number, `p`, runs the whole shot on one curve (WIND); every
// position, size and stacking order is read off it in frameAt below.

/* ── the frames ──────────────────────────────────────────────────────────── */

export const COUNT = 10;

// `<img>` inside an `<html>` is resolved by the host, so absolute paths —
// not ones relative to this file. One cover per frame, in the frames' order.
const COVER_DIR = `${ASSETS}/covers-640p`;
export const COVER_SRCS = [
  "IMG_3207.png",
  "IMG_3209.png",
  "IMG_3224.png",
  "IMG_3228.png",
  "Screenshot 2026-08-08 at 12.20.16.png",
  "Screenshot 2026-08-08 at 12.21.40.png",
  "aroll_frame_1_0.435s.png",
  "aroll_frame_3_0.911s.png",
  "aroll_frame_5_3.249s.png",
  "aroll_frame_7_4.877s.png",
].map((f) => `${COVER_DIR}/${f}`);

const ASPECT = 9 / 16;
export const BASE_W = 340;

// The white edge is the same width on every frame, which is why it is not
// part of the scale: a mat says the frames are different sizes, a stroke that
// grew with its frame would say they are at different distances.
export const MAT = 6;

/* ── the ring ────────────────────────────────────────────────────────────── */

// An ellipse rather than a circle because the frame is one: it fills the
// picture and runs just inside its edges at the widest a frame gets.
const RX = 700;

// Leaned over a few degrees, so it reads as a ring lying in space rather than
// drawn on the glass.
const TILT = (-9 * Math.PI) / 180; // rad, right side up
const COS_T = Math.cos(TILT);
const SIN_T = Math.sin(TILT);

// Leaned over, an ellipse is taller than it was, so the minor axis is bought
// back down by exactly what the lean costs — the ring reaches as near the top
// and bottom of the frame as it would square, and no nearer.
const RY = Math.round(Math.sqrt(358 * 358 - (RX * SIN_T) ** 2));

const TAU = Math.PI * 2;

// Where the pile stands: the bottom of the ellipse, the near point — biggest
// frames, in front of everything, and nearest the middle of the picture.
const START = Math.PI / 2;

// a frame nearer the eye is bigger; the bottom of the ring is the near side
const DEPTH = 0.15;

/* ── the seed ────────────────────────────────────────────────────────────── */

// A hash, not a sequence: a mount is re-executed in every context — canvas,
// capture, export — so the arrangement must come out of the index alone.
const rnd = (i, salt) => {
  let h = Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(salt + 1, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 15), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};
const span = (i, salt, lo, hi) => lo + (hi - lo) * rnd(i, salt);

const S_LO = 0.66;
const S_HI = 1.24;
const SCATTER = 0.09; // rad a frame is set off its share of the ring

/* ── the pile ────────────────────────────────────────────────────────────── */

// how far a frame sits off the pile's centre, both ways
const PILE_X = 90;
const PILE_Y = 50;

// A frame lies off level in the pile and comes up square as it travels: the
// tilt is spent on the opening, so nothing on the ring is ever off square.
const PILE_TILT = 11; // deg

// A frame's own properties. `d` is how far round the ring it travels — each
// one share more than the last, the tenth going the whole way round — so the
// pile pays out into the ring rather than bursting onto it.
const SEEDS = Array.from({ length: COUNT }, (_, i) => ({
  d: ((i + 1) / COUNT) * TAU + span(i, 1, -SCATTER, SCATTER),
  s: span(i, 3, S_LO, S_HI),
  r: span(i, 2, 0.94, 1.06),
  // every frame turns the same way, but not at quite the same rate, so the
  // ring breathes instead of rotating as one rigid wheel
  rate: span(i, 4, 0.95, 1.05),
  tilt0: span(i, 7, -PILE_TILT, PILE_TILT),
  jx: span(i, 5, -PILE_X, PILE_X),
  jy: span(i, 6, -PILE_Y, PILE_Y),
}));

// Ten random offsets do not average to nothing, so the mean is taken out of
// them: the heap sits on the ring, and only its frames are scattered.
const mean = (get) => SEEDS.reduce((a, f) => a + get(f), 0) / COUNT;
const MX = mean((f) => f.jx);
const MY = mean((f) => f.jy);

export const FRAMES = SEEDS.map((f) => ({ ...f, jx: f.jx - MX, jy: f.jy - MY }));

// A big frame sets off a little later than a small one — a property of the
// frame rather than of its place in the list, so the pile comes apart unevenly.
export const LAG_MAX = 140;
export const LAGS = FRAMES.map((f) =>
  Math.round((LAG_MAX * (f.s - S_LO)) / (S_HI - S_LO)),
);

/* ── the line ────────────────────────────────────────────────────────────── */

export const STEM = "Watching footage";

export const FS_LABEL = 48;
export const LH_LABEL = Math.round(FS_LABEL * 1.2);

// Inter's own advances summed over the line, per em — measured off the font
// as Anton's are in `analyze.js`. Only the centring is read off it.
const ADV_EM = 9.385; // Inter 500, stem and all three dots
const LABEL_W = Math.round(ADV_EM * FS_LABEL);

/* ── the dots ────────────────────────────────────────────────────────────── */

export const DOTS = 4; // "", ".", "..", "..."
const DOT_STEP = 280; // ms a count is held

// Set from its left edge rather than centred, so the stem does not shuffle
// sideways as dots are added and dropped; the centred box is the whole
// line's, dots and all.
export const LABEL_LEFT = -LABEL_W / 2;

// arrives at a size and settles to its own, far slower than the fade
export const LABEL_FROM = 1.14;
export const LABEL_IN = 260;
export const SHRINK = 760;

/* ── the shimmer ─────────────────────────────────────────────────────────── */

export const SHIMMER = 900; // ms a pass takes, edge to edge

/* ── timing ──────────────────────────────────────────────────────────────── */

// ms, absolute, as everywhere. The shot starts four frames before the word's
// dissolve ends, so the cuts are lapped rather than butted.
const LAP = 4 * (1000 / 30);
export const T_WATCH = Math.round(WORD_GONE - LAP);

// It comes up out of nothing and in out of a blur, and the two are not the
// same thing twice. The blur is the whole drawn frame's, spent by the node —
// one picture resolving, not ten and a line of type each resolving
// separately. The opacity is each frame's own and staggered, so under the
// blur is a pile assembling rather than a finished pile turned up.
export const BLOOM_O = 260; // a frame blending in — opacity only
export const BLOOM_B = 240; // the picture resolving

// The whole arrangement is wound in out of the distance, scaled about the
// middle of the frame — quicker than the blur it comes in under, so the
// coming in is the first thing over.
export const FAR = 0.62;
export const APPROACH = 50;

/* ── the winding ─────────────────────────────────────────────────────────── */

// `p` runs from nothing to one over the whole shot on one curve; every angle
// in the frame is that number times something constant, so nothing can be out
// of step.
export const RUN = 2900;
export const WATCH_END = T_WATCH + RUN;

// What the ring itself turns through, first frame to last — stated as a total
// because no stretch of the shot has a pace of its own.
export const TURN = (200 * Math.PI) / 180;

// how much of the curve the unwinding is given; the rest is the ring turning
const P_SPREAD = 0.38;

// Smoothstep, so the coming-apart leaves and arrives at a standstill: an
// unwinding that ends at any pace at all reads as a second animation.
const ease = (u) => u * u * u * (u * (u * 6 - 15) + 10);
const spreadAt = (p) => ease(Math.min(1, p / P_SPREAD));

/* ── and wound in ────────────────────────────────────────────────────────── */

// The radius closes on the same number, so it is the same winding seen in the
// other axis. Squared, so it leaves rest as gently as it arrives quickly.
const P_CLOSE = 0.45; // where in the curve the drawing-in starts
export const RUSH_R = 0.66; // what is left of the radius at the cut

export const closeAt = (p) => {
  const u = Math.max(0, (p - P_CLOSE) / (1 - P_CLOSE));
  return 1 - (1 - RUSH_R) * u * u;
};

// while the ring is still coming apart — after would read as two halves
export const T_LABEL = T_WATCH + 640;

// It leaves the way it came, undone rather than reversed: the blur builds
// before the opacity goes, but in a third of the time — an entrance is
// watched, and this is got out of the way of.
export const OUT_O = 90; // 3f
export const OUT_B = 130; // 4f

// Ramps rather than loops: a count read modulo cannot be wrong on any frame,
// scrubbed or exported, where a looping child of a seeked timeline could be.
export const SHIMMER_N = RUN / SHIMMER;
export const DOT_N = RUN / DOT_STEP;
export const RUN_MS = RUN;

/* ── derived pose ────────────────────────────────────────────────────────── */

// Where a frame is, given the winding `p`. `m` is distance and deliberately
// not part of it: it scales sizes as well as the ring, which is the one thing
// the winding must not do. The radius closing (`z`) does come off `p`,
// because a ring drawn in while its frames stay the size they were is a ring
// being taken up rather than one going away.
export const frameAt = (i, p, m = 1) => {
  const f = FRAMES[i];
  const k = spreadAt(p);
  const z = closeAt(p);

  const ang = START + f.d * k + TURN * f.rate * p;
  const near = Math.sin(ang); // +1 is the bottom of the ring, which is the front

  const w = BASE_W * f.s * (1 + DEPTH * near) * m;

  // found on the ring's own axes and then laid over at TILT: near is the
  // ring's minor axis, not the picture's vertical, so what is in front stays
  // in front however the ellipse is turned on the frame
  const ex = RX * f.r * z * Math.cos(ang);
  const ey = RY * f.r * z * near;

  // the scatter is carried in with everything else: a pile standing off in
  // the distance is a smaller pile, not a full-sized one drawn small
  return {
    x: (ex * COS_T - ey * SIN_T + f.jx * (1 - k)) * m,
    y: (ex * SIN_T + ey * COS_T + f.jy * (1 - k)) * m,
    w,
    h: w * ASPECT,
    // the lean is spent on the same value the travel is
    deg: f.tilt0 * (1 - k),
    // painted in the order they stand in: near side over the line, far side
    // behind it. In the pile all are at one place and the tie falls to the
    // index, which is also how far each has to go — the pile is paid out from
    // the top.
    over: 3000 + Math.round(near * 100) * 20 + i,
  };
};

/* ── the frame's own middle ──────────────────────────────────────────────── */

export const CX = W / 2;
export const CY = H / 2;
