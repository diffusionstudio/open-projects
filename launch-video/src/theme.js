/* ── brand ───────────────────────────────────────────────────────────────── */

export const C_BG = "#161616"; // Surface — the brand's one step up from black
export const C_TEXT = "#F8F8F8";
export const C_DIM = "#A4A4A4";
export const C_BAR = "#3A3A3A";
export const C_GREEN = "#4ADE80";
export const C_PROMPT = C_GREEN; // the shell sigil, tied to the step diamonds below it
export const C_CYAN = "#22D3EE";

// The brand's red, worn only by the app icon's tile in the sign-off — the
// one element in the film allowed to carry it.
export const C_RED = "#F43535";

// The product's own blue, never a brand accent: only where the real interface
// carries it — the panel's hover border, its submit, and the composing shot's
// hot edge, which is the product writing.
export const C_PRODUCT = "#008CFF";
export const PROD = (a) => `rgba(0, 140, 255, ${a})`; // C_PRODUCT, carrying an alpha

export const LIT = (a) => `rgba(248, 248, 248, ${a})`; // C_TEXT, carrying an alpha
