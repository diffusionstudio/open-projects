import { W, H } from "./frame.js";
import { C_PRODUCT } from "./theme.js";
import { AIM, LAND, SETTLE } from "./easing.js";
import { HAND, HAND_IN_AT } from "./timing.js";
import { bodyOf } from "./words.js";
import { T_END } from "./output.js";

/* ── the prompt ──────────────────────────────────────────────────────────── */

// The panel is kept in the units it was designed in — 1756 × 647 — and placed
// by a single scale; `S` is the only place design and screen meet.

export const PW = 1756;
export const PH = 647;
export const RADIUS = 82;

const PANEL_W = 1440; // on screen
export const S = PANEL_W / PW;
export const PANEL_X = Math.round((W - PW * S) / 2);
export const PANEL_Y = Math.round((H - PH * S) / 2);

const PANEL_C = { x: PANEL_X + (PW * S) / 2, y: PANEL_Y + (PH * S) / 2 };

/* ── the panel's own surfaces ────────────────────────────────────────────── */

// product chrome, not brand colour: these are the values the interface ships
export const C_PANEL = "#252525";
export const C_HAIRLINE = "#3F3F3F";
export const C_PLACEHOLDER = "#979797";

export const AT_BTN = { x: 50, y: 50, s: 147, r: 32, bw: 6 };
export const PILL = { x: 233, y: 51, w: 734, h: 145, r: 31.6, bw: 5.92 };
export const SUBMIT = { x: 1559, y: 450, s: 147, r: 32 };
// the drop ring straddles the panel's edge rather than sitting inside it
export const HOVER = { bw: 5, out: 2.5, r: RADIUS + 2.5 };

/* ── type ────────────────────────────────────────────────────────────────── */

// Inter sets USE_TYPO_METRICS, so a line can be placed by where the capitals
// start. Per em, off the font — Inter's em is 2816 units.
const ASC = 2728 / 2816;
const DESC = 680 / 2816;
const CAP = 2048 / 2816;

const lineHeight = (fs) => Math.round((ASC + DESC) * fs);
const topForCap = (fs, capTop) =>
  capTop - ((lineHeight(fs) - (ASC + DESC) * fs) / 2 + (ASC - CAP) * fs);

export const FS_TEXT = 78; // the prompt line and the placeholder it replaces
export const LH_TEXT = lineHeight(FS_TEXT);
export const TEXT_X = 48.6; // the glyph origin, so the ink lands on the margin
export const TEXT_Y = topForCap(FS_TEXT, 265.73);

export const FS_PILL = 72; // the attachment's label
export const LH_PILL = lineHeight(FS_PILL);
export const PILL_TEXT_X = 375.5;
export const PILL_TEXT_Y = topForCap(FS_PILL, 98.09);

export const PILL_LABEL = "Launch Footage";

const PH_TEXT = "What would you like to edit?";
export const PLACEHOLDER = bodyOf([{ text: PH_TEXT, css: { color: C_PLACEHOLDER } }]);
export const PROMPT = bodyOf([
  { text: "/Editor ", css: { color: C_PRODUCT } },
  { text: "cut the Diffusion Studio launch video", css: {} },
]);

// The shine is the same line again, lit, seen through a band that crosses it:
// a mask can be cut to the shape of text, a highlight cannot.
const C_SHINE = "#E8E8E8";
export const PLACEHOLDER_LIT = bodyOf([{ text: PH_TEXT, css: { color: C_SHINE } }]);

// Drawn already settled rather than riding the wave in: a mask over content
// that changes every frame leaves the panel's paint unfinished on read-back,
// dropping the whole panel for as long as the wave runs. Nothing is lost —
// the band is off the line until the last word has landed.
export const SETTLED = PLACEHOLDER.lines.flat().map(() => ({ y: 0 }));

// At 250% the band clears both ends at the extremes and is on the text for
// nearly all the travel between.
export const SHINE_MASK =
  "linear-gradient(100deg, transparent 42%, #000 48%, #000 52%, transparent 58%)";
export const SHINE_SPAN = "250% 100%";

/* ── the pointer ─────────────────────────────────────────────────────────── */

// drawn at the panel's scale, so one factor places both
export const PTR_BOX = { w: 145, h: 157 };
export const CARET_BOX = { w: 106, h: 169 };

// A cursor is held by the part of it that means something: the arrow by its
// point, the beam by its middle — both in the drawings' own units.
export const HOT_P = { x: 72.36 * S, y: 15.08 * S };
export const HOT_I = { x: 52.95 * S, y: 77 * S };

// The arrow is drawn straight up and never seen that way: it leans into its
// travel and rights itself as it stops. It turns about its point, so the
// angle costs the path nothing.
export const A_REST = -22; // deg
export const A_DRAG = -6; // laid over into the way in
export const A_EXIT = -12; // and over again as it drops out of the frame
export const A_REACH = -42; // banked into the way it came, coming back

/* ── the file ────────────────────────────────────────────────────────────── */

// macOS's folder at the size it was drawn: 513 × 437, of which the middle
// 480 × 403 is icon and the rest is the shadow's room.
const FILE_BOX = { w: 513, h: 437 };
const FILE_TOP = 8.17; // where the icon starts inside its box, the shadow above it
const FILE_MID = { x: 256.34, y: 209.87 }; // the icon's own middle
const FILE_ICON = 380; // px on screen, corner to corner of the folder itself
const FS_FILE = FILE_ICON / 480;

// Where the pointer holds it: up and to the left of the middle, in the
// drawing's units, as the cursor's own hotspots are.
const FILE_HOT = { x: 190, y: 150 };
export const FILE_W = FILE_BOX.w * FS_FILE;
export const FILE_H = FILE_BOX.h * FS_FILE;
export const FILE_OFF = { x: FILE_HOT.x * FS_FILE, y: FILE_HOT.y * FS_FILE };
const FILE_GHOST = 0.9; // carried, it is a copy of the file and not quite solid

// Let go under the line rather than over it — the icon's top edge clears the
// text's line box, so the words stay readable — and on the middle of the box
// across.
const CLEAR_OF_LINE = 24; // design units of air between the line and the icon
const DROP_AT = {
  x: PANEL_C.x - (FILE_MID.x - FILE_HOT.x) * FS_FILE,
  y:
    PANEL_Y +
    (TEXT_Y + LH_TEXT + CLEAR_OF_LINE) * S +
    (FILE_HOT.y - FILE_TOP) * FS_FILE,
};

// where the drawing's own edges are, once the pointer holding it is at `p`
const fileBox = (p) => ({
  left: p.x - FILE_OFF.x,
  top: p.y - FILE_OFF.y,
  right: p.x - FILE_OFF.x + FILE_W,
  bottom: p.y - FILE_OFF.y + FILE_H,
});

const MARGIN = 40;
const reach = (need, d) => (d > 0 ? need / d : Infinity);

// In from off the top left — the side the install was pushed off, and the one
// corner the pointer does not later use — from as far back as it takes for
// the whole file to be outside the frame.
const IN_DIR = { x: -1, y: -0.5 };
const IN_LEN = Math.hypot(IN_DIR.x, IN_DIR.y);
const DIR = { x: IN_DIR.x / IN_LEN, y: IN_DIR.y / IN_LEN };
const rest = fileBox(DROP_AT);
const IN_DIST = Math.min(
  reach(rest.right + MARGIN, -DIR.x),
  reach(rest.bottom + MARGIN, -DIR.y),
  reach(W + MARGIN - rest.left, DIR.x),
  reach(H + MARGIN - rest.top, DIR.y),
);
const DRAG_FROM = { x: DROP_AT.x + DIR.x * IN_DIST, y: DROP_AT.y + DIR.y * IN_DIST };

// A bowed path: `d` is the deviation the curve actually makes — a quadratic
// sags half its control offset — signed to the right of travel.
const bow = (a, b, d) => {
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  return {
    x: (a.x + b.x) / 2 + ((b.y - a.y) / len) * 2 * d,
    y: (a.y + b.y) / 2 - ((b.x - a.x) / len) * 2 * d,
  };
};

const DRAG_C = bow(DRAG_FROM, DROP_AT, 90);

// the pointer leaves straight down, far enough that all of it is gone
const EXIT_TO = { x: DROP_AT.x, y: H + PTR_BOX.h * S - HOT_P.y + MARGIN };

const quad = (a, c, b, t) => {
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
  };
};

const inPanel = (p) =>
  p.x >= PANEL_X && p.x <= PANEL_X + PW * S && p.y >= PANEL_Y && p.y <= PANEL_Y + PH * S;

/* ── timing ──────────────────────────────────────────────────────────────── */

// ms, absolute: every mark below is a position on the film's own clock.

// The panel is carried up from below the frame while the install is still
// leaving by the top — a frame's height of travel, so its own top edge is
// never seen crossing in.
const PANEL_LEAD = 50;
const HOLD = 6 * (1000 / 30); // the panel held back six frames on top of the hand-over
export const PANEL_RISE = H;
export const T_PANEL_IN = T_END + HAND_IN_AT - PANEL_LEAD + HOLD;
export const T_PROMPT = T_END + HAND - PANEL_LEAD + HOLD;

export const WORD_RISE = 300; // a word clears its clip…
export const WORD_WAVE = 260; // …and the line crosses left to right in one pass

export const T_CHIPS = T_PROMPT + 80;
export const CHIP_STAGGER = 100; // 3f, as everywhere else in the film
export const CHIP_RISE = 26; // design units a chip travels up into place
export const T_PH_IN = T_CHIPS + CHIP_STAGGER;

// The shine sets off before the word wave has finished, and never overtakes:
// every word it lights has already landed.
const T_PH_SET = T_PH_IN + WORD_WAVE + WORD_RISE;
const SHINE_LEAD = 150;
export const T_SHINE = T_PH_SET - SHINE_LEAD;
export const SHINE = 560;

export const T_FILE = T_PH_IN + 200;
export const DRAG = 600;

const overAt = () => {
  const step = 1000 / 60;
  for (let t = 0; t < DRAG; t += step) {
    if (inPanel(quad(DRAG_FROM, DRAG_C, DROP_AT, AIM(t / DRAG)))) return t;
  }
  return DRAG;
};

// the box lights when the file is over it, not when the clock says so, and it
// goes out on the drop
export const T_OVER = T_FILE + overAt();
export const HOVER_IN = 120;
export const T_DROP = T_FILE + DRAG;
export const HOVER_OUT = 160;

// let go, the file is taken in toward the pill it becomes
export const TAKE = 200;
export const T_PILL = T_DROP + 40;
const PILL_FROM = 0.35; // how far to the pill it gets before it is spent
const FILE_SHRINK = 0.62;

// the pointer is on its way out while the file is still being taken in
export const T_AWAY = T_DROP + 120;
export const AWAY = 420;
export const SWING = 200; // it lays over into the way out as it sets off

// The placeholder holds until both the light has crossed it and the
// attachment has settled, then leaves at once.
export const T_PH_OUT = Math.max(T_SHINE + SHINE, T_PILL + 400);
export const PH_OUT = 153;

export const T_WORDS = T_PH_OUT + PH_OUT;
export const T_SUBMIT = T_WORDS + WORD_WAVE + WORD_RISE;
export const SUBMIT_IN = 300; // the button answers only once the line is whole
export const SUBMIT_DIM = 0.5;

const lerp = (a, b, k) => a + (b - a) * k;

/* ── the click ───────────────────────────────────────────────────────────── */

export const SUBMIT_C = {
  x: PANEL_X + (SUBMIT.x + SUBMIT.s / 2) * S,
  y: PANEL_Y + (SUBMIT.y + SUBMIT.s / 2) * S,
};

// where the file is headed as it is taken in: the middle of the pill it becomes
const PILL_C = {
  x: PANEL_X + (PILL.x + PILL.w / 2) * S,
  y: PANEL_Y + (PILL.y + PILL.h / 2) * S,
};

// the point comes to rest on the button's exact middle — under the full
// push, the absolute center of the frame
const CLICK_AT = { x: SUBMIT_C.x, y: SUBMIT_C.y };
const FROM = { x: W + 60, y: H + 130 }; // off the corner it is coming from

// bowed below the line it travels: the reach finishes going up into the button
const REACH_C = bow(FROM, CLICK_AT, 90);

// hover and press are the product's blue, moved — not a second colour
const RGB = { rest: [0, 140, 255], hover: [46, 161, 255], down: [0, 121, 219] };
export const BTN_PRESS = 0.93; // it gives, about its own middle

const inButton = (p) =>
  p.x >= SUBMIT_C.x - (SUBMIT.s / 2) * S &&
  p.x <= SUBMIT_C.x + (SUBMIT.s / 2) * S &&
  p.y >= SUBMIT_C.y - (SUBMIT.s / 2) * S &&
  p.y <= SUBMIT_C.y + (SUBMIT.s / 2) * S;

/* ── timing ──────────────────────────────────────────────────────────────── */

export const REACH = 680; // the cursor's travel
const SIGHT = 90; // the push's room beyond the cursor's own travel

/* ── the push in ─────────────────────────────────────────────────────────── */

// The line whole, the camera pushes in on the button that will send it. The
// zoom is taken about the button's own middle, and the group is carried the
// rest of the way, so that middle comes to rest exactly on the frame's.
export const PUSH_SCALE = 3;
const PROMPT_HELD = 167; // 5f — the whole line is read before the camera moves
export const T_PUSH = T_SUBMIT + PROMPT_HELD;
export const PUSH = SUBMIT_IN + REACH + SIGHT;

// The cursor sets off late enough to land on the frame the push settles —
// camera and point come to rest together, and the click follows on the beat.
export const T_REACH = T_PUSH + PUSH - REACH;

const enteredAt = () => {
  const step = 1000 / 60;
  for (let t = 0; t < REACH; t += step) {
    if (inButton(quad(FROM, REACH_C, CLICK_AT, SETTLE(t / REACH)))) return t;
  }
  return REACH;
};

export const T_HOVER = T_REACH + enteredAt();

/* ── the spin ────────────────────────────────────────────────────────────── */

// Centered, the box turns a quarter about the button under the point. The
// button is the pivot — by now the frame's own middle — so the cursor
// standing on it never feels the turn; the button itself is counter-turned
// about its own middle, so the arrow stays upright too.
export const SPIN_DEG = -90;
// the pivot, in the panel's own units — the same point the push centered
export const SPIN_C = { x: SUBMIT.x + SUBMIT.s / 2, y: SUBMIT.y + SUBMIT.s / 2 };
export const T_SPIN = T_PUSH + PUSH / 2; // set off halfway into the push
export const SPIN = 250; // one quick turn, done well before the push is
const BEAT = 100; // 3f — the point seen at rest on the button, then the press

export const T_PRESS = T_PUSH + PUSH + BEAT;
export const PRESS_DOWN = 150; // down…
export const PRESS_UP = 300; // …and back in twice that

/* ── the send ────────────────────────────────────────────────────────────── */

// A sling: the press draws the arrow down with the button's dip, and the
// release looses it — nearly all its speed in the first frames, gone off the
// top before the eye can follow.
const DRAW = 20; // design units the arrow is drawn back
export const T_SHOOT = T_PRESS + PRESS_DOWN; // on the release, not the press
export const SHOOT = 600;
const SHOOT_DIST = 420; // design units — well clear of the frame at this zoom
export const POP = 600;
const POP_AMP = 0.1; // how far past its own size the spring carries the button

// The press starts an ink ripple inside the button, as Android draws it: a
// light circle growing from the touch point to the button's own edges. An
// inscribed circle needs no clip — a mask over moving ink would drop the
// whole panel on read-back, as the placeholder's shine nearly did.
export const T_RIPPLE = T_PRESS;
export const RIPPLE = 500;
export const RIPPLE_FROM = 0.3; // of the button, at the touch
export const RIPPLE_TO = 1; // edge to edge, inside the corners by geometry
export const RIPPLE_O = 0.35; // the ink: light over the button's blue

// the bump, shaped: past size and back, spent exactly as `k` is
export const popAt = (k) => 1 + POP_AMP * Math.sin(Math.PI * k);
// drawn back with the press, loosed on the release — one line for the glyph
export const arrowAt = (down, k) => DRAW * down - SHOOT_DIST * k;

// The box blurs out only once the arrow has left the frame, so the spring
// and the launch play unclouded: the moment is found by walking the flight
// at the zoom the frame is seen through.
const goneAt = () => {
  const step = 1000 / 60;
  for (let t = 0; t < SHOOT; t += step) {
    const clear = (SHOOT_DIST * LAND(t / SHOOT) - SUBMIT.s / 2) * S * PUSH_SCALE;
    if (clear > H / 2) return t;
  }
  return SHOOT;
};
export const T_DISMISS = T_SHOOT + goneAt();
export const DISMISS = 600;

// the pointer becomes a beam once the launch and the blur have been seen —
// on the absolute center, where the click was, the panel nearly gone
export const T_CARET = T_DISMISS + 180;

const BEAM_HELD = 67; // 2f — the beam is a flash on the center, then the cut
export const PROMPT_END = T_CARET + BEAM_HELD;

/* ── derived pose ────────────────────────────────────────────────────────── */

// One position, three legs, walked in reverse: each is at rest at the end of
// the one before it. The last leg has no end — the cursor stays on the button.
export const pointerAt = (f, x, k) => {
  if (k > 0) return quad(FROM, REACH_C, CLICK_AT, k);
  if (x > 0) return { x: lerp(DROP_AT.x, EXIT_TO.x, x), y: lerp(DROP_AT.y, EXIT_TO.y, x) };
  return quad(DRAG_FROM, DRAG_C, DROP_AT, f);
};

// the file rides the pointer in and is then let go
export const fileAt = (f, l) => {
  const p = quad(DRAG_FROM, DRAG_C, DROP_AT, f);
  return {
    x: lerp(p.x, PILL_C.x - (FILE_MID.x - FILE_HOT.x) * FS_FILE, l * PILL_FROM),
    y: lerp(p.y, PILL_C.y - (FILE_MID.y - FILE_HOT.y) * FS_FILE, l * PILL_FROM),
    scale: lerp(1, FILE_SHRINK, l),
    opacity: FILE_GHOST * (1 - l),
  };
};

// the press is taken about the point, so the arrow dips into the button
export const pressAt = (k) => lerp(1, 0.9, k);

// scale about the button, and the carry that puts it on the frame's middle —
// both spent on the one curve, so the move reads as a single push
export const pushAt = (k) => ({
  scale: lerp(1, PUSH_SCALE, k),
  x: (W / 2 - SUBMIT_C.x) * k,
  y: (H / 2 - SUBMIT_C.y) * k,
});

// one fill, moved twice, so the press reads as a further step of the hover;
// the release's spring rides the same scale
export const buttonAt = (h, p, pk) => {
  const c = RGB.rest.map((v, i) =>
    Math.round(lerp(lerp(v, RGB.hover[i], h), RGB.down[i], p)),
  );
  return { fill: `rgb(${c.join(",")})`, scale: lerp(1, BTN_PRESS, p) * popAt(pk) };
};

// size, blur and opacity are one value on one curve — exactly as faint as far
const CLICK_SCALE = 0.96;
const CLICK_BLUR = 26; // px, in the frame's own pixels
export const dismissAt = (k) => ({
  scale: lerp(1, CLICK_SCALE, k),
  blur: CLICK_BLUR * k,
  opacity: 1 - k,
});
