import { W, H, BW } from "./frame.js";
import { S, HOT_I, CARET_BOX, PROMPT_END, PUSH_SCALE } from "./prompt.js";

/* ── analyzing ───────────────────────────────────────────────────────────── */

export const WORD = "ANALYZING";
export const LETTERS = WORD.split("");

/* ── type ────────────────────────────────────────────────────────────────── */

// Anton's own advances, per 2048 units of em. The render turns kerning off and
// sets the letters as separate boxes, so these sums match the browser.
const UPM = 2048;
const ADV = { A: 994, N: 1020, L: 814, Y: 914, Z: 840, I: 464, G: 993 };
const SPACE = 480; // the font's word space — what the cursor stands in for

// Anton sets USE_TYPO_METRICS, so the browser builds its line box from these.
const ASC = 2409 / UPM;
const DESC = 674 / UPM;
const CAP = 1760 / UPM;

// the height a letter arrives at, as a share of the height it is struck to
export const K0 = 0.12;

/* ── the cursor ──────────────────────────────────────────────────────────── */

// The shot before ends pushed in, its beam standing on the frame's center at
// three times the panel's scale. The cut takes the beam as it stands — same
// size, same place — so the shot continues rather than restarts.
const Z = PUSH_SCALE;
export const CARET_W = CARET_BOX.w * S * Z;
export const CARET_H = CARET_BOX.h * S * Z;
export const CARET_DX = HOT_I.x * Z; // held by its middle, as it was
export const CARET_Y = H / 2 - HOT_I.y * Z;

/* ── the line ────────────────────────────────────────────────────────────── */

// Beam, word space and word fitted to the frame's text measure, then seen
// through the push — but set a step under the push's own scale, so the beam
// that carried over from the last shot reads larger against the word it writes.
const SLIM = 0.7; // of the push's scale
const SUM_ADV = [...WORD].reduce((n, c) => n + ADV[c], 0);
export const FS_WORD = Math.round((((BW - HOT_I.x) * UPM) / (SPACE + SUM_ADV)) * Z * SLIM);
export const LH_WORD = Math.round((ASC + DESC) * FS_WORD);

const ADVANCES = LETTERS.map((c) => (ADV[c] / UPM) * FS_WORD);
const LEFTS = ADVANCES.reduce((xs, adv) => [...xs, xs.at(-1) + adv], [0]);

// the cursor stands one word space in front of the A
export const PAD = Math.round((SPACE / UPM) * FS_WORD);

// the whole of it, beam included
const EXTENT = CARET_DX + PAD + LEFTS.at(-1);

// the cursor stands where the cut left it: its middle on the frame's center
export const LINE_X = W / 2;

// Two places in the line box: the middle of the capitals, which the line is
// hung by, and their foot, which a letter grows out of.
const HALF_LEAD = (LH_WORD - (ASC + DESC) * FS_WORD) / 2;
const CAP_MID = HALF_LEAD + (ASC - CAP / 2) * FS_WORD;
export const BASELINE = HALF_LEAD + ASC * FS_WORD;

export const LINE_Y = Math.round(H / 2 - CAP_MID); // capitals centred on the midline

/* ── motion blur ─────────────────────────────────────────────────────────── */

// The stand-up is quick enough to smear. The blur is read off the letter's
// own growth — most at the strike, resolving to nothing exactly as it lands.
// A filter runs before the element's scale, so the radius is stated in the
// frame's pixels and bought back up by the scale it is about to be drawn at.
const BLUR = FS_WORD * 0.01; // px on screen, at the strike
export const blurAt = (k) => (BLUR * (1 - (k - K0) / (1 - K0))) / k;

/* ── the camera ──────────────────────────────────────────────────────────── */

// Written at three times the measure, the line runs off the right of the
// frame; the camera is pulled left through the whole of it and does not
// stop — the word is read on the move, and the line's end is carried off
// the left edge. The shot leaves on its own pull.
export const PAN_X = -(LINE_X - CARET_DX + EXTENT);

/* ── timing ──────────────────────────────────────────────────────────────── */

// ms, absolute, as everywhere.
export const T_ANALYZE = PROMPT_END;
export const T_WORD = T_ANALYZE;

// A letter is struck when the writing reaches its own place on the line, so
// the rhythm is the type's own measure rather than a count.
const WRITE = 900; // first letter struck to last
export const STRIKE = LEFTS.slice(0, -1).map((x) =>
  Math.round((WRITE * x) / LEFTS.at(-2)),
);

export const GROW = 180; // struck at K0, then standing up off the baseline

const WHOLE = T_WORD + WRITE + GROW;
const HELD = 300;

// The pull sets off with the writing and is spent exactly at the dissolve:
// the last of the line clears the left edge as the next shot comes up.
export const T_PAN = T_WORD;
export const PAN = WHOLE + HELD - T_PAN;

// a dissolve — the only one in the film — with the next shot coming up under it
export const T_GO = WHOLE + HELD;
export const GO = 420;

// The pull has emptied the frame by T_GO, so the shot does not sit out the
// whole dissolve: seven frames are trimmed off its tail, and everything hung
// off WORD_GONE — the watch shot, the film's end — moves up with it.
const TRIM = Math.round(5 * (1000 / 30));

export const WORD_GONE = T_GO + GO - TRIM;
export const ANALYZE_END = WORD_GONE;
