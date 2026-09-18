import { W, H } from "./frame.js";
import { CREDITS_END } from "./credits.js";

/* ── the sign-off ────────────────────────────────────────────────────────── */

// The maker's mark to close: the card read, a hard cut, and the app icon is
// already falling onto the white — in at four times its size, seated in half
// a second. Then the mark steps aside onto its place at the lockup's left
// while the name comes out from behind it: the wipe is the mark's own
// trailing edge, so the reveal IS the move, not a second animation laid
// beside it. Icon and name land as one centred lockup, and the film is
// signed.

// the lockup's own geometry, taken from the export (design/logo.svg)
export const LOCKUP_W = 775;
export const LOCKUP_H = 137;
export const ICON_W = 137; // the tile — square, radius 36.45
export const TEXT_X = 179; // the D's left edge in lockup space
// The name's box reaches back to the mark's own seat, not just to the D:
// the wipe's edge lives on this box, and a box that started at the D would
// pin the edge there while the mark still had its last few px to travel.
export const REVEAL_W = LOCKUP_W - ICON_W;

// The mark's travel, its own centre to the lockup's: while it is out on the
// frame's middle the whole lockup is displaced by this much around it, so
// one distance serves the tile going left and the name coming right.
export const SLIDE_X = (LOCKUP_W - ICON_W) / 2;

export const MARK_FROM = 4; // in at 400% of the set size
export const T_LOGO = CREDITS_END; // the card gone, then the mark
export const MARK_IN = 500;

// The veil: the card's manner — full at the cut, lifted linearly across the
// first quarter-second (credits.js's BLUR_MS) — but shallower: 8px on screen
// to the card's 12, so the mark is never as deeply sunk as the type was.
// Stated on screen and bought back up by the scale, as the card's is.
export const VEIL = 4;
export const veilAt = (b, s) => (VEIL * b) / s;

// right after: the step aside, and the name unveiled with it
export const T_REVEAL = T_LOGO + MARK_IN;
export const REVEAL_MS = 500;

// The name's mask, in the text box's own space: its left edge held on the
// mark's trailing edge for the whole slide — the box starts at the mark's
// seat, so the edge never meets the box's wall before the mark is home and
// the wipe spends itself exactly as the slide does. The +1 keeps the last
// sliver covered while the mark is still out on the middle.
export const clipAt = (k) => SLIDE_X * (1 - k) + 1;

/* ── the revolver ────────────────────────────────────────────────────────── */

// The name read, the agents that drive the product pass under it: a small
// line of interface type — each word clipped to its own box and pushed up
// out of it, the house manner — and beneath that the marks on one drum,
// turning left to right for the whole stay. Whichever mark is passing the
// frame's middle swells and hands the size to the next, the way a picker
// wheel carries its chosen row; the strip fades in as its own node, and
// ground-coloured gradients feather the marks out at either end. The drift
// is a whole number of pitches, so a mark is seated dead centre at the fade
// and another at the film's last frame.

// nine marks, colour and monochrome interleaved so neither bunches
export const AGENTS = [
  "cursor",
  "openai",
  "gemini-color",
  "claude-color",
  "openclaw-color",
  "opencode",
  "pi",
  "githubcopilot",
  "hermesagent",
];

export const WORKS = ["Try", "now", "with:"];
export const FS_WORKS = 30;
export const WORKS_LH = 38; // the line's own clip box
export const WORKS_WS = 10; // the space between the words, kept outside the clips

export const STRIP_ICON = 72; // the exports drawn down from their 88
export const STRIP_GAP = 120; // aired out: ten marks, not fourteen
export const PITCH = STRIP_ICON + STRIP_GAP; // one seat of the drum
export const BAND_H = 136; // headroom for the centre mark at full swell

// The row is the nine three times over, so the drum never runs dry across
// the window plus the whole travel — and a mark's copies stand wider than
// the feathers' clear zone, so two are never fully lit at once.
export const STRIP_ROW = [...AGENTS, ...AGENTS, ...AGENTS];
export const ROW_W = STRIP_ROW.length * PITCH - STRIP_GAP;

// The turn: three seats of travel, rightward, first visible frame to last.
// C0 is the seat on the centre when the strip fades in — openclaw's, in the
// second copy so the row overhangs the frame at both ends throughout — then
// claude and gemini take their dwells, and the film closes on openai's mark
// seated and swollen.
const C0 = AGENTS.length + 4;
export const SEATS = 3;
export const DRIFT = SEATS * PITCH;
export const driftAt = (k) => W / 2 - STRIP_ICON / 2 - C0 * PITCH + DRIFT * k;

// the swell: full over the centre, spent on a cosine shoulder inside a seat
// and a half to either side — the neighbours are lifted a little, the rest
// stand at their own size
export const MAG = 1.76;
export const MAG_R = 240;
export const magAt = (cx) => {
  const d = Math.abs(cx - W / 2);
  return d >= MAG_R ? 1 : 1 + (MAG - 1) * (0.5 + 0.5 * Math.cos((d / MAG_R) * Math.PI));
};

// the window: 85% of the frame, centred, its soft ends drawn in by the same
// fraction — the drum shows through this and nothing outside it
export const STRIP_WIN = Math.round(0.85 * W);
export const WIN_X = (W - STRIP_WIN) / 2;
export const FEATHER_X = 238; // the window's soft ends

// the stack, top down: the lockup on the frame's middle — where the mark
// lands — the line tucked under it, the wall below
export const LOCKUP_Y = (H - LOCKUP_H) / 2;
export const WORKS_GAP = 38; // lockup's bottom to the line
export const WORKS_Y = LOCKUP_Y + LOCKUP_H + WORKS_GAP;
export const STRIP_TOP = 66; // the line to the marks' own row — grown by what the line gave up, so the row stands still
// the window's top: the marks ride centred in the band, so the band starts
// above the row by the swell's headroom
export const STRIP_Y = WORKS_Y + WORKS_LH + STRIP_TOP - (BAND_H - STRIP_ICON) / 2;

// right after the name has landed, the line; the drum sets off close behind,
// already turning as it fades up — the fade is the node's own keyframes, in
// the manner the whole film keeps
export const T_WORKS = T_REVEAL + REVEAL_MS;
export const WORKS_STEP = 110; // the second word behind the first
export const T_STRIP = T_WORKS + 200;
export const STRIP_FADE = 400;
export const STRIP_EASE = "cubicBezier(0.2,0.75,0.34,0.94)"; // ENTER's own numbers

// The film ends where the bed does: the music's cut was set by ear in the
// editor — frame 953 — and the scene holds the seated mark until that frame.
export const LOGO_END = (953 * 1000) / 30;

// The turn is not one run but seat to seat: a move per seat, each on FOLLOW,
// so the drum gathers through the gap and eases to rest as a mark takes the
// centre — the slowing and the swell are one moment. The dwell is the
// curve's own shoulders; no separate hold is written.
export const SEAT_MS = (LOGO_END - T_STRIP) / SEATS;
