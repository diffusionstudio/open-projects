/* ── timing ──────────────────────────────────────────────────────────────── */

// ms throughout — the timeline's own unit, so every number below can be handed
// straight to `.add()`. The scene's total length falls out of the row table in
// `output.js`.

export const BLINK = 120; // cursor half period
export const EDGE = 40; // the lamp has a fall and a rise; it is not a hard cut
export const DARK = 160; // the frame is empty before the cursor first lights
export const PREROLL = 1; // blinks before the first key

export const T_TYPE = DARK + 2 * BLINK * PREROLL; // 400 — typing starts
export const CHAR_DT = 39; // average; about a glyph a frame through the fast middle
export const CMD = "~$ npx skills add diffusionstudio/skills";
export const PROMPT_LEN = 3; // "~$ " is shell chrome, not typed intent
export const TYPE_DUR = CMD.length * CHAR_DT; // 1560
export const T_TYPED = T_TYPE + TYPE_DUR; // 1960 — the last key

/* ── the camera ──────────────────────────────────────────────────────────── */

// The first three shots are handed over, not cut: the leaver accelerates out
// and the arriver decelerates in on CAM_IN, both quickest across the join.
export const HAND = 800; // a shot is handed to the next in this
export const HAND_OUT = 450; // the leaving shot is clear of the frame in this…
export const HAND_IN_AT = 300; // …and, where they overlap, the arriver sets off here
export const HAND_IN = HAND - HAND_IN_AT; // 500 — and spends the rest settling

// One sweep (SWEEP), first key to the line gone: 240ms longer than the
// writing, so the run-off is seven frames.
export const PAN_DUR = 1800;
export const T_GONE = T_TYPE + PAN_DUR; // 2200 — the command's last frame

// The install sets off a frame plus OVERLAP before the command is gone — the
// same command line at two sizes reads as a duplicate if both are legible at
// once, so this join is a baton rather than a shared frame.
const FRAME = 1000 / 30;
const OVERLAP = 100;
const HOLD = 4 * FRAME; // the install is held back this much beyond that join
export const T_BLOCK_IN = T_GONE - FRAME - OVERLAP + HOLD; // 2200
// the hand-in is longer by what it sets off early, so it still ends where it ended
export const BLOCK_IN_DUR = 400 + OVERLAP + 4 * FRAME; // 633.3

// output starts printing before the line is at rest, the way a real CLI
// answers before the scroll has settled
const EAGER = 200;
export const T_OUT = T_BLOCK_IN + BLOCK_IN_DUR - EAGER; // 2633.3 (unmoved by OVERLAP)

// The row table in `output.js` is written in the CLI's real print rhythm;
// this plays it back faster.
export const PRINT = 0.3;

// how much further the camera climbs after the last line has settled before
// the panel's beat is counted from
export const TAIL = 280;

export const IN_OPACITY = 300; // opacity resolves first…
export const IN_MOVE = 400; // …so a line is readable before it settles
export const LEAD = 100; // gutter leads its body by 3f

export const RISE = 8; // px a gutter glyph travels up into place
export const WORD_DUR = 260; // a word clears its clip quicker than a line settles
// normalised across the line, so a two-word step and the agent list finish in
// the same beat
export const WORD_SPREAD = 110;
