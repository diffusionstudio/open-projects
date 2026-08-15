import { W, H } from "./frame.js";
import { ASSETS } from "./assets.js";
import { SETTLE, DIVE } from "./easing.js";
import { WORD_DUR } from "./timing.js";
import { PLAYER, COMPOSE_END } from "./compose.js";
import { PTR_BOX, HOT_P, S } from "./prompt.js";
import { ART_FOOTER } from "./compare-art.js";

/* ── comparing ───────────────────────────────────────────────────────────── */

// The code is the video. The composing shot's pull back settles the block
// into the player's frame; the player grows onto the same rect from a touch
// smaller, and the two crossfade as they converge — no cut, one arrival.
// Landed, the player steps aside and the raw input slides out from
// underneath it: the edit and what it was made from, side by side, under the
// design's own titles.

// the -hold copies carry the source's last frame held for two more seconds —
// the raw cuts run out at 8s, a beat short of the way out, and the engine
// clamps a clip to its source rather than holding it
export const AROLL = `${ASSETS}/aroll.mp4`;
export const AROLL_POST = `${ASSETS}/aroll-post.mp4`;

/* ── the rects ───────────────────────────────────────────────────────────── */

// State 1 is the player's frame itself, stated in compose.js because the
// pull back is aimed at it. State 2 steps the player right and rests the
// input on the left — tucked under by design, so its travel happens behind.
export const RIGHT_X2 = 744;
export const LEFT = { x: 140, y: 327, w: 755, h: 425, r: 26 };
export const LEFT_X0 = 560; // at rest under the landed player until the slide

// how far over its frame the player begins: a larger frame, collapsing
// onto the rect the code is being zoomed into — both shrinking, one gesture
const G1 = 6;

const lerp = (a, b, k) => a + (b - a) * k;

// the player's box, both moves on one reading: the arrival collapses it onto
// the frame about the frame's own centre, the slide steps it right
export const rightAt = (arrive, slide) => {
  const s = lerp(G1, 1, arrive);
  return {
    x: lerp(PLAYER.x + (PLAYER.w * (1 - s)) / 2, RIGHT_X2, slide),
    y: PLAYER.y + (PLAYER.h * (1 - s)) / 2,
    w: PLAYER.w * s,
    h: PLAYER.h * s,
    r: PLAYER.r * s,
  };
};

export const leftAt = (slide) => lerp(LEFT_X0, LEFT.x, slide);

/* ── the log look ────────────────────────────────────────────────────────── */

// The input is shown as it came off the sensor: the display frame is taken
// back to scene linear, run through the S-Log3 curve, and eased off in
// saturation — mid-grey up around 41%, blacks lifted, whites compressed to
// ~60% — the flat, milky picture a log profile actually records.
export const LOG_WGSL = /* wgsl */ `
  @group(1) @binding(0) var<uniform> sat: f32;
  @group(1) @binding(1) var<uniform> contrast: f32;

  fn slog3(x: f32) -> f32 {
    if (x >= 0.01125) {
      return (420.0 + (log((x + 0.01) / 0.19) / log(10.0)) * 261.5) / 1023.0;
    }
    return (x * (171.2102946929 - 95.0) / 0.01125 + 95.0) / 1023.0;
  }

  @fragment
  fn main(@location(0) uv: vec2f) -> @location(0) vec4f {
    let src = sampleSource(uv);
    if (src.a <= 0.0) {
      return src;
    }
    // unpremultiply, take the display frame back to scene linear
    let lin = pow(max(src.rgb / src.a, vec3f(0.0)), vec3f(2.4));
    // encode through the curve, then mute the color the way the profile does
    var enc = vec3f(slog3(lin.r), slog3(lin.g), slog3(lin.b));
    let y = dot(enc, vec3f(0.2126, 0.7152, 0.0722));
    enc = mix(vec3f(y), enc, sat);
    // flatten further about the curve's own mid-grey (420/1023)
    enc = 0.4106 + (enc - vec3f(0.4106)) * contrast;
    return vec4f(enc * src.a, src.a);
  }
`;
export const LOG_SAT = 0.55;
export const LOG_CONTRAST = 0.85;

/* ── timing ──────────────────────────────────────────────────────────────── */

// ms, absolute, as everywhere.

// The convergence: the collapse, the player's fade-in and the code's
// fade-out share one window, laid over the tail of the pull back and landing
// exactly with it — the camera is shrinking the code as the frame shrinks
// onto it, and the crossfade is thrown where the two are nearly one. The
// collapse eases out, the last of its travel a settle onto the frame.
export const T_SET1 = COMPOSE_END; // the settle, the swap complete: State 1
export const ARRIVE = 380;
export const T_ARRIVE = T_SET1 - ARRIVE; // = T_ZOOM + 120, inside the pull back

// the crossfade's curve, engine-side on both nodes' keyframes — the code's
// fade-out and the footage's fade-in answer each other on the same blend
export const FADE_EASE = "cubicBezier(0.45,0,0.55,1)";

// State 1 held long enough to be read as a frame of its own, then State 2:
// the player steps right as the input slides out from under it — opposite
// ways on one curve, so the reveal is the meeting of two moves
const HOLD1 = 700;
export const T_SLIDE = T_SET1 + HOLD1;
export const SLIDE = 640;

// the input is lit while still fully covered, just before it moves
export const T_LEFT_ON = T_SLIDE - 150;

/* ── the titles ──────────────────────────────────────────────────────────── */

// The two labels rise whole in the house manner as the slide is landing;
// then the footer — the title's words, the meta line's, the action row's
// icons and counts — slides up out of its own line, one thing at a time on
// one even step, reading order, each clipped to the box it rises into.
const T_TEXT = T_SLIDE + SLIDE - 120;
export const T_LABELS = [T_TEXT, T_TEXT + 90];
export const T_FOOT = T_TEXT + 200;
export const FOOT_STEP = 55;
export const N_FOOT = ART_FOOTER.length;

// The design's footer reads small at frame size, so it is scaled up in
// place: the title and the meta line about the shared left margin, the
// action row about its right edge — the margins the design already holds —
// growing into the room between them. The title grows down from where the
// design set it under the player, and the lower line is carried down a
// touch so the air between the two rows scales with the type. Each entry
// keeps its glyph sheet's own offset and scale, so the render stays one
// clipped box per rising thing.
const F_BODY = 1.25;
const ROW_Y = 900; // above this line is the title, below it the lower rows
const LX = 741.5; // the shared left margin, the title's own
const RX = 1770; // the action row's right edge, the player's above
const TITLE_TOP = 861.8; // the title's own top, held
const LINE_TOP = 910.7; // the lower line's own top…
const LINE_DROP = 14; // …let down by the room the grown title takes
export const FOOT = ART_FOOTER.map((it) => {
  const title = it.y < ROW_Y;
  const ax = !title && it.x >= 1200 ? RX : LX;
  const ay = title ? TITLE_TOP : LINE_TOP;
  return {
    ...it,
    x: ax + (it.x - ax) * F_BODY,
    y: ay + (title ? 0 : LINE_DROP) + (it.y - ay) * F_BODY,
    w: it.w * F_BODY,
    h: it.h * F_BODY,
    sx: -it.x * F_BODY,
    sy: -it.y * F_BODY,
    f: F_BODY,
  };
});

/* ── the like ────────────────────────────────────────────────────────────── */

// The film's last gesture: the footer read, the pointer pulls up out of the
// bottom — the same hand that clicked send — lands on the thumb, and spams
// it. The icon fills in like-red on the first hit and keeps it; every hit
// looses a filled like that climbs off the button like a balloon let go,
// each leaning its own way, whole for most of the climb and then gone.

export const LIKE_I = 15; // the thumb, in the footer's own list
const LIKE_BOX = FOOT[LIKE_I]; // as shown: the scaled-up action row's own box
export const LIKE_C = { x: LIKE_BOX.x + LIKE_BOX.w / 2, y: LIKE_BOX.y + LIKE_BOX.h / 2 };

// the reach, in the prompt's own manner: up from below the frame on a bowed
// path, banked into the way in and righting itself as it lands — the same
// drawing at the same size, so it reads as the same hand
const bow = (a, b, d) => {
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  return {
    x: (a.x + b.x) / 2 + ((b.y - a.y) / len) * 2 * d,
    y: (a.y + b.y) / 2 - ((b.x - a.x) / len) * 2 * d,
  };
};
const quad = (a, c, b, t) => {
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
  };
};

// a touch smaller than the prompt's hand — the shot is wider than the
// button it is aimed at
export const PTR_K = 0.8;

// in from below the bottom edge, off to the right of where it is headed,
// from far enough back that all of the arrow starts outside the frame
const P_FROM = { x: LIKE_C.x + 230, y: H + (PTR_BOX.h * S - HOT_P.y) * PTR_K + 40 };
const P_C = bow(P_FROM, LIKE_C, 80);
export const likeAt = (k) => quad(P_FROM, P_C, LIKE_C, k);

// the footer settled and read, then the hand
const T_SETTLED = T_FOOT + FOOT_STEP * (N_FOOT - 1) + WORD_DUR;
export const T_LIKE = T_SETTLED + 240;
export const LIKE_REACH = 620;
const LIKE_BEAT = 130; // 4f — the point seen at rest on the thumb, then the spam
export const N_HITS = 15;
export const HIT_STEP = 170; // the spam's own rate: quick, but every press read
export const T_HITS = Array.from(
  { length: N_HITS },
  (_, i) => T_LIKE + LIKE_REACH + LIKE_BEAT + i * HIT_STEP,
);
export const LIKE_ON = 130; // the colour arrives with the first hit and stays

// a hit's whole life is one linear count per balloon; the press, the climb
// and the fade are all readings of it below, not separate animations
export const BALLOON_MS = 1250;

// the press: the first sliver of a balloon's count, a dip and a return —
// read by the pointer and the thumb alike, so hand and button move as one
const POP_OF = 0.14; // of the balloon's life, ≈ the spam's own step
export const hitAt = (k) => (k > 0 && k < POP_OF ? Math.sin(Math.PI * (k / POP_OF)) : 0);

// The liked look: the outline glyph's first subpath is the thumb's own solid
// silhouette — filled, it is the lit state, and it is what every balloon
// carries. Like-red, not a brand colour: the badge a like actually wears.
export const LIKE_FILL_D = LIKE_BOX.d.slice(0, LIKE_BOX.d.indexOf("Z") + 1);
const RED = [255, 48, 64];
export const LIKE_A = (a) => `rgba(${RED[0]}, ${RED[1]}, ${RED[2]}, ${a})`;

// white to like-red on one mix, for the outline the fill sits on
export const likeFillAt = (k) =>
  `rgb(255, ${Math.round(255 - (255 - RED[1]) * k)}, ${Math.round(255 - (255 - RED[2]) * k)})`;

// the balloon's pose: up on one even spend, leaning its own way, popped to
// size by the press that loosed it. The fade is returned as an alpha for the
// fill — store-driven CSS opacity on a transformed div is dropped by the
// read-back, a colour's own alpha is not.
const B_RISE = 210; // px it climbs
const B_DRIFT = [-30, 22, -16, 34, -24, 12, -36, 27, -8, 31]; // px, a different lean per hit
const B_IN = 0.08; // on in a flash…
const B_HOLD = 0.55; // …whole until here, then the fade takes the rest
export const balloonAt = (k, i) => ({
  x: B_DRIFT[i % B_DRIFT.length] * SETTLE(k),
  y: -B_RISE * SETTLE(k),
  s: 0.6 + 0.4 * Math.min(1, k / POP_OF),
  o: k <= 0 ? 0 : k < B_IN ? k / B_IN : k <= B_HOLD ? 1 : Math.max(0, 1 - (k - B_HOLD) / (1 - B_HOLD)),
});

/* ── the footage ─────────────────────────────────────────────────────────── */

// live from its first visible frame under the crossfade, and held until the
// last balloon has burnt out plus a beat; the input is cut in a beat earlier
// so it stacks beneath — a later start draws above an earlier one
export const T_PLAY = T_ARRIVE;
export const T_LEFT_IN = T_ARRIVE - 40;

/* ── the way out ─────────────────────────────────────────────────────────── */

// The film's last move: the whole comparison — players, titles, hand and all
// — is let go in one move about the frame's own centre: to half size on
// DIVE, barely leaving at first and then all at once, begun while the last
// balloons are still burning. The content is released as the dive quickens:
// between nine tenths and four fifths, the fade takes it, and the rest of
// the travel is spent unseen.
const T_READ = T_HITS[N_HITS - 1] + BALLOON_MS + 400; // the spam burnt out, at rest
export const SINK_S = 0.5;
export const T_SINK = T_READ - 1700; // into the balloons' tail
export const SINK_MS = 500; // the leaving side's half of the transition
export const COMPARE_END = T_SINK + SINK_MS;

// where the dive crosses a size: the share of the travel spent there, taken
// back through the curve to a time — the fade is hung off the scale, not
// beside it
const invert = (ease, y) => {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 48; i++) {
    const mid = (lo + hi) / 2;
    if (ease(mid) < y) lo = mid;
    else hi = mid;
  }
  return lo;
};
const crossAt = (s) => T_SINK + SINK_MS * invert(DIVE, (1 - s) / (1 - SINK_S));
export const T_FADE = crossAt(0.9);
export const T_FADED = crossAt(0.8);

// a rect seen through the sink: scaled about the frame's centre, the one
// point the gesture is about — the two players read it off the store, the
// title sheet reads the same number as its own transform
export const sunkAt = (b, s) => ({
  x: W / 2 + (b.x - W / 2) * s,
  y: H / 2 + (b.y - H / 2) * s,
  w: b.w * s,
  h: b.h * s,
  r: b.r * s,
});
