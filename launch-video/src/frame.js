/* ── frame ───────────────────────────────────────────────────────────────── */

export const W = 1920;
export const H = 1080;

export const FS = 24; // JetBrains Mono size
export const CW = FS * 0.6; // monospace advance — exact, so every position is analytic
export const CH = 27; // terminal character cell — what a block glyph or cursor fills
export const LH = 34; // text line box
export const BW = 1600; // text measure a line is fitted to when nothing else sets it
export const GUT = 3 * CW; // gutter column: glyph + two spaces
