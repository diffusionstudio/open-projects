import { createTimeline, stagger } from "animejs";

import {
  ENTER,
  EXIT,
  WRITE,
  FOLLOW,
  SETTLE,
  AIM,
  WIND,
  LAND,
  DEPART,
  TURN,
  STAND,
  PULL,
  GLIDE,
  COLLAPSE,
  SWEEP,
  CAM_IN,
  PANEL_IN,
  CLIMB,
  DIVE,
  DWINDLE,
  STAMP,
  UNVEIL,
} from "./easing.js";
import {
  BLINK,
  EDGE,
  DARK,
  PREROLL,
  T_TYPE,
  CMD,
  TYPE_DUR,
  PAN_DUR,
  T_BLOCK_IN,
  T_OUT,
  HAND_IN,
  BLOCK_IN_DUR,
  IN_OPACITY,
  IN_MOVE,
  LEAD,
  RISE,
  WORD_DUR,
  WORD_SPREAD,
} from "./timing.js";
import { SWEEP_X } from "./coldopen.js";
import { BANNER_ROWS, B_STAGGER, B_SLIDE } from "./banner.js";
import { ROWS, CLIMB_Y, CLIMB_DUR, BLOCK_IN, T_END } from "./output.js";
import {
  PLACEHOLDER,
  PROMPT,
  SUBMIT_DIM,
  PANEL_RISE,
  T_PANEL_IN,
  T_CHIPS,
  CHIP_STAGGER,
  CHIP_RISE,
  T_PH_IN,
  T_SHINE,
  SHINE,
  T_FILE,
  DRAG,
  T_OVER,
  HOVER_IN,
  T_DROP,
  HOVER_OUT,
  TAKE,
  T_PILL,
  T_AWAY,
  AWAY,
  T_PH_OUT,
  PH_OUT,
  T_WORDS,
  WORD_RISE,
  WORD_WAVE,
  T_SUBMIT,
  SUBMIT_IN,
  T_PUSH,
  PUSH,
  T_SPIN,
  SPIN,
  SPIN_DEG,
  T_REACH,
  REACH,
  T_HOVER,
  T_PRESS,
  PRESS_DOWN,
  PRESS_UP,
  T_SHOOT,
  SHOOT,
  POP,
  T_RIPPLE,
  RIPPLE,
  RIPPLE_FROM,
  RIPPLE_TO,
  RIPPLE_O,
  T_DISMISS,
  DISMISS,
  T_CARET,
  SWING,
  A_REST,
  A_DRAG,
  A_EXIT,
  A_REACH,
} from "./prompt.js";
import { LETTERS, K0, T_WORD, STRIKE, GROW, T_PAN, PAN, PAN_X } from "./analyze.js";
import {
  COUNT,
  LAGS,
  FAR,
  APPROACH,
  BLOOM_O,
  LABEL_FROM,
  T_LABEL,
  LABEL_IN,
  SHRINK,
  T_WATCH,
  RUN_MS,
  SHIMMER_N,
  DOT_N,
} from "./watch.js";
import { N_RUN, T_TOKENS, TYPE_MS, T_ZOOM, ZOOM } from "./compose.js";
import {
  T_ARRIVE,
  ARRIVE,
  T_SLIDE,
  SLIDE,
  T_LABELS,
  T_FOOT,
  FOOT_STEP,
  N_FOOT,
  T_LIKE,
  LIKE_REACH,
  T_HITS,
  LIKE_ON,
  BALLOON_MS,
  N_HITS,
  T_SINK,
  SINK_MS,
  SINK_S,
} from "./compare.js";
import {
  T_TITLE,
  TITLE_TO,
  TITLE_DUR,
  TITLE_FROM,
  BLUR_MS,
  CREDITS_END,
} from "./credits.js";
import {
  MARK_FROM,
  MARK_IN,
  T_LOGO,
  T_REVEAL,
  REVEAL_MS,
  WORKS,
  T_WORKS,
  WORKS_STEP,
  T_STRIP,
  SEATS,
  SEAT_MS,
} from "./logo.js";

/* ── timeline ────────────────────────────────────────────────────────────── */

// Plain objects, one per animated thing. anime writes them; the store in the
// scene mirrors them into the render. Nothing here reads the clock itself.
const cursor = { o: 0 };
const command = { n: 0 };
// the cameras: one number per axis a shot's contents are moved on
const look = { x: 0 }; // the cold open, panning with the writing and then off
const block = { x: BLOCK_IN, y: 0 }; // the install, brought on and then climbed
const rise = { y: PANEL_RISE }; // the panel, carried up from below the frame
const badge = { o: 0, y: RISE };
const banner = BANNER_ROWS.map(() => ({ o: 0, x: B_SLIDE }));
const gutter = ROWS.map(() => ({ o: 0, y: RISE }));
const words = ROWS.map((r) => Array.from({ length: r.body?.n ?? 0 }, () => ({ y: 100 })));
const file = { k: 0 };
const land = { k: 0 };
const away = { k: 0 };
const panel = { hover: 0, placeholder: 1, submit: SUBMIT_DIM };
const chips = [0, 1].map(() => ({ o: 0, y: CHIP_RISE }));
const holder = Array.from({ length: PLACEHOLDER.n }, () => ({ y: 100 }));
const shine = { x: 100 }; // % — the band's mask, off the right of the line
const prompt = Array.from({ length: PROMPT.n }, () => ({ y: 100 }));
const push = { k: 0 };
const spin = { a: 0 }; // deg — the box's own turn about the button
const reach = { k: 0 };
const swing = { a: A_DRAG }; // deg — the arrow comes in already leaning
const press = { k: 0 };
const button = { hover: 0, down: 0 };
const pop = { k: 0 }; // the release's spring
const shoot = { k: 0 }; // the arrow, loosed from the sling
const ripple = { s: RIPPLE_FROM, o: 0 }; // the click's ink, hidden until the press
const dismiss = { k: 0 };
const caret = { on: 0 };
const word = LETTERS.map(() => ({ k: K0, on: 0 }));
const pan = { x: 0 }; // the analyzing camera, pulled left with the writing
// watching: how far through the winding the shot is, and how near the whole
// arrangement has come — the shot arrives out of the distance on the latter
const wind = { p: 0 };
const depth = { m: FAR };
const blend = Array.from({ length: COUNT }, () => ({ o: 0 }));
const label = { s: LABEL_FROM, o: 0 };
// two counts that only go up; the render reads them modulo
const shimmer = { t: 0 };
const dots = { t: 0 };
// composing: one running count the tokens' blends are read off, and the
// pull back onto the whole — the ground's blend is read off the latter
const code = { n: 0 };
const zoom = { k: 0 };
// comparing: the player's collapse onto its frame, the step to State 2, the
// two labels, and the footer's words and icons — one cell per rising thing,
// read as a fraction of its own clip box; the crossfade itself is keyframed
// on the nodes, not written here
const arrive = { k: 0 };
const slide = { k: 0 };
const labels = T_LABELS.map(() => ({ o: 0, y: RISE }));
const foot = Array.from({ length: N_FOOT }, () => ({ y: 100 }));
// the like: the pointer's reach and lean, the thumb's colour, and one linear
// count per hit — its balloon's whole life, press included
const likeCur = { k: 0 };
const likeSwing = { a: A_REACH };
const likeOn = { k: 0 };
const balloon = Array.from({ length: N_HITS }, () => ({ k: 0 }));
// the way out and the close: the comparison's one breath-and-sink, and the
// card's arrival out of the viewer — the fades themselves are keyframed on
// the nodes, not written here
const sink = { s: 1 };
const title = { s: TITLE_FROM, b: 1 };
// the sign-off: the mark's set-down, and one value the tile's step aside,
// the name's arrival and the mask between them are all read from — then the
// line under it, one cell per word read as a fraction of its own clip box,
// and the revolver's one turn, every mark's seat and swell a reading of it
const logo = { s: MARK_FROM, k: 0, b: 1 };
const works = WORKS.map(() => ({ y: 100 }));
const strip = { k: 0 };

export const snapshot = () => ({
  cursor: { ...cursor },
  command: { ...command },
  look: { ...look },
  block: { ...block },
  rise: { ...rise },
  badge: { ...badge },
  banner: banner.map((o) => ({ ...o })),
  gutter: gutter.map((o) => ({ ...o })),
  words: words.map((row) => row.map((o) => ({ ...o }))),
  file: { ...file },
  land: { ...land },
  away: { ...away },
  panel: { ...panel },
  chips: chips.map((o) => ({ ...o })),
  holder: holder.map((o) => ({ ...o })),
  shine: { ...shine },
  prompt: prompt.map((o) => ({ ...o })),
  push: { ...push },
  spin: { ...spin },
  reach: { ...reach },
  swing: { ...swing },
  press: { ...press },
  button: { ...button },
  pop: { ...pop },
  shoot: { ...shoot },
  ripple: { ...ripple },
  dismiss: { ...dismiss },
  caret: { ...caret },
  word: word.map((o) => ({ ...o })),
  pan: { ...pan },
  wind: { ...wind },
  depth: { ...depth },
  blend: blend.map((o) => ({ ...o })),
  label: { ...label },
  shimmer: { ...shimmer },
  dots: { ...dots },
  code: { ...code },
  zoom: { ...zoom },
  arrive: { ...arrive },
  slide: { ...slide },
  labels: labels.map((o) => ({ ...o })),
  foot: foot.map((o) => ({ ...o })),
  likeCur: { ...likeCur },
  likeSwing: { ...likeSwing },
  likeOn: { ...likeOn },
  balloon: balloon.map((o) => ({ ...o })),
  sink: { ...sink },
  title: { ...title },
  logo: { ...logo },
  works: works.map((o) => ({ ...o })),
  strip: { ...strip },
});

export function build() {
  const tl = createTimeline({ autoplay: false });

  // the cursor blinks out of black and holds solid from the first key
  for (let b = 0; b < PREROLL; b++) {
    const on = DARK + b * 2 * BLINK;
    tl.add(cursor, { o: 1, duration: EDGE, ease: ENTER }, on).add(
      cursor,
      { o: 0, duration: EDGE, ease: EXIT },
      on + BLINK,
    );
  }
  tl.add(cursor, { o: 1, duration: EDGE, ease: ENTER }, T_TYPE - EDGE)

    // the command writes itself…
    .add(command, { n: { from: 0, to: CMD.length }, duration: TYPE_DUR, ease: WRITE }, T_TYPE)

    // …under one camera sweep, first key to the frame the line is gone
    .add(look, { x: SWEEP_X, duration: PAN_DUR, ease: SWEEP }, T_TYPE)

    // the install comes in at the speed the cold open left at
    .add(block, { x: 0, duration: BLOCK_IN_DUR, ease: CAM_IN }, T_BLOCK_IN);

  ROWS.forEach((row, i) => {
    if (row.k === "gap") return;
    const at = T_OUT + row.at;

    if (row.k === "banner") {
      // opacity resolves before the move, so a row reads before it settles
      tl.add(banner, { o: 1, duration: IN_OPACITY, ease: ENTER, delay: stagger(B_STAGGER) }, at).add(
        banner,
        { x: 0, duration: IN_MOVE, ease: ENTER, delay: stagger(B_STAGGER) },
        at,
      );
      return;
    }

    tl.add(gutter[i], { o: 1, duration: IN_OPACITY, ease: ENTER }, at).add(
      gutter[i],
      { y: 0, duration: IN_MOVE, ease: ENTER },
      at,
    );

    if (row.k === "badge") {
      tl.add(badge, { o: 1, duration: IN_OPACITY, ease: ENTER }, at + LEAD).add(
        badge,
        { y: 0, duration: IN_MOVE, ease: ENTER },
        at + LEAD,
      );
      return;
    }

    const n = words[i].length;
    if (n) {
      tl.add(
        words[i],
        {
          y: 0,
          duration: WORD_DUR,
          ease: ENTER,
          delay: stagger(n > 1 ? WORD_SPREAD / (n - 1) : 0),
        },
        at + LEAD,
      );
    }
  });

  // one climb, first line to last frame — no keys per row, and no separate
  // move to take the shot off
  tl.add(block, { y: CLIMB_Y, duration: CLIMB_DUR, ease: CLIMB }, T_OUT)

    // while the panel is carried up from below it over the last of that
    .add(rise, { y: 0, duration: HAND_IN, ease: PANEL_IN }, T_PANEL_IN);

  /* ── the prompt ────────────────────────────────────────────────────────── */

  // Only the first chip — the second is the attachment, and there is nothing
  // attached yet.
  tl.add(chips[0], { o: 1, duration: IN_OPACITY, ease: ENTER }, T_CHIPS)
    .add(chips[0], { y: 0, duration: IN_MOVE, ease: ENTER }, T_CHIPS)

    // the placeholder arrives the way the prompt will, so the later swap is a
    // replacement rather than a change of manner
    .add(
      holder,
      {
        y: 0,
        duration: WORD_RISE,
        ease: ENTER,
        delay: stagger(WORD_WAVE / Math.max(1, PLACEHOLDER.n - 1)),
      },
      T_PH_IN,
    )

    // the shine crosses the whole line once; the mask is three times the line
    // wide, so it starts and ends clear of it
    .add(shine, { x: 0, duration: SHINE, ease: FOLLOW }, T_SHINE)

    /* ── the file ────────────────────────────────────────────────────────── */

    .add(file, { k: 1, duration: DRAG, ease: AIM }, T_FILE)

    // the arrow rights itself over the same length and curve, so the lean is
    // spent exactly as the distance is
    .add(swing, { a: A_REST, duration: DRAG, ease: AIM }, T_FILE)

    // the drop ring is on for exactly as long as there is something to drop
    .add(panel, { hover: 1, duration: HOVER_IN, ease: ENTER }, T_OVER)
    .add(panel, { hover: 0, duration: HOVER_OUT, ease: EXIT }, T_DROP)

    // let go, the file is taken in
    .add(land, { k: 1, duration: TAKE, ease: ENTER }, T_DROP)

    // and the attachment chip arrives the way the first chip did
    .add(chips[1], { o: 1, duration: IN_OPACITY, ease: ENTER }, T_PILL)
    .add(chips[1], { y: 0, duration: IN_MOVE, ease: ENTER }, T_PILL)

    // the pointer drops out of the bottom of the frame while the file is
    // still being taken in
    .add(away, { k: 1, duration: AWAY, ease: DEPART }, T_AWAY)
    .add(swing, { a: A_EXIT, duration: SWING, ease: ENTER }, T_AWAY)

    .add(panel, { placeholder: 0, duration: PH_OUT, ease: EXIT }, T_PH_OUT)

    // the prompt takes the placeholder's place, a word at a time
    .add(
      prompt,
      {
        y: 0,
        duration: WORD_RISE,
        ease: ENTER,
        delay: stagger(WORD_WAVE / Math.max(1, PROMPT.n - 1)),
      },
      T_WORDS,
    )

    // the button answers only once there is something whole to send
    .add(panel, { submit: 1, duration: SUBMIT_IN, ease: SETTLE }, T_SUBMIT)

    // and the camera pushes in on it over the whole of the reach
    .add(push, { k: 1, duration: PUSH, ease: SETTLE }, T_PUSH)

    /* ── the click ───────────────────────────────────────────────────────── */

    .add(reach, { k: 1, duration: REACH, ease: SETTLE }, T_REACH)

    // The lean for the reach is set while the cursor is still off frame, then
    // spent on the same curve as the distance, so the arrow is upright exactly
    // when it is still.
    .add(swing, { a: A_REACH, duration: 1 }, T_REACH - 1)
    .add(swing, { a: A_REST, duration: REACH, ease: SETTLE }, T_REACH)

    // cursor and button dip together: they are the same event
    .add(button, { hover: 1, duration: HOVER_IN, ease: ENTER }, T_HOVER)

    // centered, the box turns a quarter under the still cursor
    .add(spin, { a: SPIN_DEG, duration: SPIN, ease: TURN }, T_SPIN)
    .add(press, { k: 1, duration: PRESS_DOWN, ease: ENTER }, T_PRESS)
    .add(button, { down: 1, duration: PRESS_DOWN, ease: ENTER }, T_PRESS)
    .add(press, { k: 0, duration: PRESS_UP, ease: ENTER }, T_PRESS + PRESS_DOWN)
    .add(button, { down: 0, duration: PRESS_UP, ease: ENTER }, T_PRESS + PRESS_DOWN)

    // the release is the send: the spring, and the arrow loosed by it —
    // nearly all its speed at the start, as a shot thing moves
    .add(pop, { k: 1, duration: POP, ease: FOLLOW }, T_SHOOT)
    .add(shoot, { k: 1, duration: SHOOT, ease: LAND }, T_SHOOT)

    // The press starts the ink: in with the touch, spreading evenly, held
    // until late so the splash is read before it goes. Two plain tweens, not
    // a from-to — a seek before a from-to's start would paint the `from`.
    .add(ripple, { s: RIPPLE_TO, duration: RIPPLE, ease: SETTLE }, T_RIPPLE)
    .add(ripple, { o: RIPPLE_O, duration: 80, ease: ENTER }, T_RIPPLE)
    .add(ripple, { o: 0, duration: RIPPLE - 80, ease: EXIT }, T_RIPPLE + 80)

    .add(dismiss, { k: 1, duration: DISMISS, ease: ENTER }, T_DISMISS)

    // the cursor becomes a beam where it stands — one frame, no move
    .add(caret, { on: 1, duration: 1 }, T_CARET)

    /* ── analyzing ─────────────────────────────────────────────────────── */

    // a letter is struck when the writing reaches its place on the line, then
    // stands up off a fixed baseline
    .add(word, { on: 1, duration: 1, delay: (t, i) => STRIKE[i] }, T_WORD)
    .add(word, { k: 1, duration: GROW, ease: STAND, delay: (t, i) => STRIKE[i] }, T_WORD)

    // the line runs off the right of the frame; the camera is pulled left with
    // the writing, eased in from rest, and carries the whole line off the left
    // edge — the frame is empty before the shot ends, so it needs no fade
    .add(pan, { x: PAN_X, duration: PAN, ease: PULL }, T_PAN)

    /* ── watching ──────────────────────────────────────────────────────── */

    // the frames blend up out of the dark, each on its own lag; the blur over
    // the lot of it is the node's own, in `Watch.jsx`
    .add(blend, { o: 1, duration: BLOOM_O, ease: ENTER, delay: (t, i) => LAGS[i] }, T_WATCH)

    // and the shot comes in out of the distance over the same stretch — the
    // arrangement grows and the ring closes on one term
    .add(depth, { m: 1, duration: APPROACH, ease: SETTLE }, T_WATCH)

    // one number, one curve, first frame to last: the unwinding, the turn and
    // the drawing-in are three readings of it in `watch.js`, not three
    // animations
    .add(wind, { p: 1, duration: RUN_MS, ease: WIND }, T_WATCH)

    // the line comes up in the middle, arriving at a size and settling to its own
    .add(label, { o: 1, duration: LABEL_IN, ease: ENTER }, T_LABEL)
    .add(label, { s: 1, duration: SHRINK, ease: LAND }, T_LABEL)

    // shimmer and dots run at their own rates from first frame to last.
    // Linear because a repeat that eases is seen to be a repeat.
    .add(shimmer, { t: SHIMMER_N, duration: RUN_MS, ease: "linear" }, T_WATCH)
    .add(dots, { t: DOT_N, duration: RUN_MS, ease: "linear" }, T_WATCH);

  /* ── composing ─────────────────────────────────────────────────────────── */

  // one count on one linear run, a token a beat — every blend and the
  // camera's drift are tables in compose.js read off this number
  tl.add(code, { n: { from: 0, to: N_RUN }, duration: TYPE_MS, ease: "linear" }, T_TOKENS)

    // the last token lit, the camera lets the writing go — one pull back
    // onto the block's own middle, the ground blending in under it on the
    // same fraction; Apple's settle, away at speed and landing long
    .add(zoom, { k: 1, duration: ZOOM, ease: GLIDE }, T_ZOOM);

  /* ── comparing ─────────────────────────────────────────────────────────── */

  // The convergence, laid over the tail of the pull back: a larger frame
  // collapses onto the rect the code is being zoomed into, on COLLAPSE —
  // off at full speed, the rest one long landing — while the two crossfade
  // on their own keyframes.
  tl.add(arrive, { k: 1, duration: ARRIVE, ease: COLLAPSE }, T_ARRIVE)

    // State 2: the player steps right as the input slides out from under it
    .add(slide, { k: 1, duration: SLIDE, ease: GLIDE }, T_SLIDE);

  // the labels, risen whole in the house manner a beat apart
  T_LABELS.forEach((at, i) => {
    tl.add(labels[i], { o: 1, duration: IN_OPACITY, ease: ENTER }, at).add(
      labels[i],
      { y: 0, duration: IN_MOVE, ease: ENTER },
      at,
    );
  });

  // the footer: every word and icon slides up out of its own line on one
  // even step — title, meta, actions, one wave in reading order
  tl.add(foot, { y: 0, duration: WORD_DUR, ease: ENTER, delay: stagger(FOOT_STEP) }, T_FOOT);

  // the last gesture: the pointer pulls up out of the bottom in the prompt's
  // manner — banked into the way in, righted on the same curve as the
  // distance, so the arrow is upright exactly when it is still
  tl.add(likeCur, { k: 1, duration: LIKE_REACH, ease: AIM }, T_LIKE)
    .add(likeSwing, { a: A_REST, duration: LIKE_REACH, ease: AIM }, T_LIKE)

    // the thumb fills in like-red on the first hit, for good
    .add(likeOn, { k: 1, duration: LIKE_ON, ease: ENTER }, T_HITS[0]);

  // a balloon per hit, one linear count each: the press, the climb and the
  // fade are readings of it in compare.js, not three animations
  T_HITS.forEach((at, i) => {
    tl.add(balloon[i], { k: 1, duration: BALLOON_MS, ease: "linear" }, at);
  });

  /* ── the way out ───────────────────────────────────────────────────────── */

  // the whole comparison is let go in one move — barely leaving, then all at
  // once; the fade rides the dive on the nodes' own keyframes
  tl.add(sink, { s: SINK_S, duration: SINK_MS, ease: DIVE }, T_SINK)

    // the close: the card's scale runs the scene's whole length — most of
    // the travel in the first frames, then drifting down onto its 40% size
    // through the hold
    .add(title, { s: TITLE_TO, duration: TITLE_DUR, ease: DWINDLE }, T_TITLE)

    // the veil: lifted across the first quarter-second, laid back over the
    // last, the card crisp for the whole stay between
    .add(title, { b: 0, duration: BLUR_MS, ease: "linear" }, T_TITLE)
    .add(title, { b: 1, duration: BLUR_MS, ease: "linear" }, CREDITS_END - BLUR_MS)

    /* ── the sign-off ──────────────────────────────────────────────────── */

    // the mark set down out of the viewer in half a second…
    .add(logo, { s: 1, duration: MARK_IN, ease: STAMP }, T_LOGO)

    // …then the step aside, right after: the slide, the name and the wipe
    // between them are three readings of this one value in Logo.jsx
    .add(logo, { k: 1, duration: REVEAL_MS, ease: UNVEIL }, T_REVEAL)

    // the veil, on the card's own lift, shallower: see logo.js's VEIL
    .add(logo, { b: 0, duration: BLUR_MS, ease: "linear" }, T_LOGO)

    // the line under it, a word at a time in the house manner…
    .add(works, { y: 0, duration: WORD_DUR, ease: ENTER, delay: stagger(WORKS_STEP) }, T_WORKS);

  // …then the revolver, seat to seat: a move per seat on FOLLOW — gathering
  // through the gap, easing to rest as each mark takes the centre, so the
  // slowing and the swell read as one gesture. The fade up is the node's own
  // keyframes, and the swell itself is read off the drift in Logo.jsx.
  for (let s = 1; s <= SEATS; s++) {
    tl.add(strip, { k: s / SEATS, duration: SEAT_MS, ease: FOLLOW }, T_STRIP + (s - 1) * SEAT_MS);
  }

  return tl;
}
