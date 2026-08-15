import { W, FS, CW, CH, LH } from "./frame.js";
import { LIT } from "./theme.js";
import { CMD } from "./timing.js";

/* ── cursor ──────────────────────────────────────────────────────────────── */

// Element opacity carries fill and glow together, so the glow breathes with
// the blink instead of sitting under it.
export const CUR_FILL = LIT(0.82);
const CUR_GAP = 4; // air between the last glyph and the block, off the cell grid

/* ── cold open ───────────────────────────────────────────────────────────── */

// The output's grid, four times nearer: everything scales off one ratio.
const BIG = 4;
export const FS_BIG = FS * BIG; // 96
export const CW_BIG = CW * BIG;
export const CH_BIG = Math.round(CH * BIG);
export const LH_BIG = Math.round(LH * BIG);
export const CUR_GAP_BIG = Math.round(CUR_GAP * BIG);
export const CUR_GLOW_BIG = `0 0 ${Math.round(12 * BIG)}px ${LIT(0.4)}, 0 0 ${Math.round(34 * BIG)}px ${LIT(0.14)}`;

// wider than the 1920px frame, so the line is never on it whole
export const LINE_W = CMD.length * CW_BIG + CUR_GAP_BIG + CW_BIG; // 2377.6

/* ── the camera ──────────────────────────────────────────────────────────── */

// On the first frame only the caret is on screen, centred; the line's left
// edge falls out of that.
export const LINE_X = W / 2 - CUR_GAP_BIG - CW_BIG / 2; // 915.2

// One sweep (SWEEP), first key to the line gone: far enough that the end of
// the line clears the left edge.
const CLEAR = 80;
export const SWEEP_X = LINE_X + LINE_W + CLEAR; // 3372.8
