import { W, H, CW, LH, GUT } from "./frame.js";
import { C_DIM, C_GREEN } from "./theme.js";
import { BANNER_H, BANNER_ROWS } from "./banner.js";
import { bodyOf } from "./words.js";
import { CMD, PRINT, T_OUT, TAIL, HAND_OUT, WORD_DUR, WORD_SPREAD, LEAD } from "./timing.js";

/* ── output ──────────────────────────────────────────────────────────────── */

const AGENTS_1 =
  "Amp, Antigravity, Antigravity CLI, Cline, Codex, Cursor, Deep Agents, Gemini CLI, GitHub Copilot,";
const AGENTS_2 = "Kimi Code CLI, OpenCode, Warp, Zed";

const D = "◇";
const BAR = "│";

const W500 = { "font-weight": "500" };
const DIM = { color: C_DIM };
const GREEN = { color: C_GREEN, "font-weight": "500" };

// what a row says, as styled runs — the shape the words are cut from
const runsOf = (row) =>
  row.k === "found"
    ? [
        { text: "Found ", css: W500 },
        { text: "3 ", css: GREEN },
        { text: "skills", css: W500 },
      ]
    : row.k === "sub"
      ? [{ text: row.text, css: DIM }]
      : [
          { text: row.text + (row.dim ? " " : ""), css: W500 },
          ...(row.dim ? [{ text: row.dim.trimStart(), css: DIM }] : []),
        ];

const WORDED = { step: 1, sub: 1, found: 1 };

// Every row declares its height, so the block's total is known without
// measuring anything.
export const ROWS = [
  { k: "gap", h: 24 },
  { k: "banner", h: BANNER_H, at: 0 },
  { k: "gap", h: 30 },
  { k: "badge", h: LH, at: 620 },
  { k: "bar", h: LH, at: 820 },
  { k: "step", h: LH, at: 940, text: "Source: https://github.com/diffusionstudio/skills.git" },
  { k: "bar", h: LH, at: 1200 },
  { k: "found", h: LH, at: 1320 },
  { k: "bar", h: LH, at: 1580 },
  { k: "step", h: LH, at: 1700, text: "Select skills to install", dim: " (space to toggle)" },
  { k: "sub", h: LH, at: 1940, text: "editor" },
  { k: "bar", h: LH, at: 2200 },
  { k: "step", h: LH, at: 2320, text: "73 agents" },
  { k: "bar", h: LH, at: 2580 },
  { k: "step", h: LH, at: 2700, text: "Which agents do you want to install to?" },
  { k: "sub", h: LH * 2, at: 2960, text: AGENTS_1 + "\n" + AGENTS_2 },
  { k: "bar", h: LH, at: 3240 },
  { k: "step", h: LH, at: 3360, text: "Installation scope" },
  { k: "sub", h: LH, at: 3600, text: "Project" },
].map((row) => ({
  ...row,
  ...(row.at === undefined ? {} : { at: row.at * PRINT }),
  ...(WORDED[row.k] ? { body: bodyOf(runsOf(row)) } : {}),
}));

const BLOCK_H = LH + ROWS.reduce((sum, r) => sum + r.h, 0); // command row + output

/* ── the block on the frame ──────────────────────────────────────────────── */

// At this factor the block overruns the frame on both axes — the camera climbs
// it, and the widest line trails off the right.
export const ZOOM = 1.5;

// The widest thing the block ever prints, measured off the rows themselves so
// it follows the copy. The command line is in it because it is the one row
// with no gutter.
const bodyW = (body) =>
  Math.max(...body.lines.map((line) => line.reduce((n, w) => n + w.text.length, 0)));
const WIDEST = Math.max(
  CMD.length * CW,
  GUT + BANNER_ROWS[0].length * CW,
  ...ROWS.filter((r) => r.body).map((r) => GUT + bodyW(r.body) * CW),
); // 1440

// centred while it fits, held off the left edge once it doesn't
const PAD = 100;
export const BLOCK_X = Math.max(PAD, Math.round((W - WIDEST * ZOOM) / 2)); // 60
export const BLOCK_W = WIDEST;

/* ── the camera ──────────────────────────────────────────────────────────── */

// The command line arrives vertically centred, exactly where the shot before
// left its own copy of the line, and everything prints below that.
export const HEAD_Y = Math.round((H - LH * ZOOM) / 2); // 515

// brought on from a full frame's width to the right
export const BLOCK_IN = W;

// the last line to settle decides the scene's length, however fast the block prints
const T_SETTLED = Math.max(...ROWS.map((r) => (r.at ?? 0) + LEAD + WORD_SPREAD + WORD_DUR));

// One climb (CLIMB), first line to last frame, ending CUT shorter than the
// block takes to finish settling — the camera outruns the printing, so the
// last lines are read on their way up.
const CLEAR = 80; // clear of the top by this, so no edge of it is seen leaving
const CUT = 500;
export const CLIMB_Y = HEAD_Y + BLOCK_H * ZOOM + CLEAR; // 1837
export const CLIMB_DUR = T_SETTLED + TAIL + HAND_OUT - CUT; // 1780

/* ── the hand-over ───────────────────────────────────────────────────────── */

// Where the panel's beat is counted from — not an edge in the block's own
// move, which crosses it without a key. Taken from the climb rather than the
// rows, so shortening the climb brings the panel up sooner by the same amount.
export const T_END = T_OUT + CLIMB_DUR - HAND_OUT; // 1330 in, not 1830

// gutter column: `◇` marks a completed step, `│` carries the tree between them
export const GUTTER = { bar: BAR, sub: BAR, badge: "┌", step: D + "  ", found: D + "  " };
export const QUIET = { bar: 1, sub: 1, badge: 1 }; // gutter glyphs that are tree, not status
