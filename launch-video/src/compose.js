import { FS, CW, LH, W, H } from "./frame.js";
import { C_TEXT, C_DIM, C_GREEN, C_CYAN, LIT, PROD } from "./theme.js";
import { DARK } from "./timing.js";

/* ── composing ───────────────────────────────────────────────────────────── */

// The film's last shot is the work itself — the composition the whole film
// has been about — blended in a token at a time under a camera that trails
// the writing.

const SOURCE = `<rect key="launch-video" name="Launch Video" height={1080} width={1920}>
  <audio src="~/audio/background-music.mp3" />
  <sequence>
    <audio src="sfx1.wav" start={00.0} />
    <audio src="sfx2.wav" start={08.7} />
    <audio src="sfx4.wav" start={45.3} />
  </sequence>
  <sequence>
    <video src="cam1.mp4" start={00.0} end={12.3} sourceIn={03.2} />
    <video src="cam1.mp4" start={12.3} end={17.6} sourceIn={16.7} />
    <video src="cam1.mp4" start={17.6} end={34.2} sourceIn={35.5} />
    <video src="cam1.mp4" start={34.2} end={55.0} sourceIn={43.6} />
  </sequence>
  <sequence>
    <video src="cam2.mp4" start={23.0} end={28.2} sourceIn={06.4} />
    <image src="broll.png" start={44.2} end={49.6} />
  </sequence>
  <html height={1080} width={1920}>
    <div style="text-align: center;">
      Diffusion Studio Inc.
    </div>
  </html>
  <captions preset="paper" verticalAlign="bottom" />
</rect>`;

export const LINES = SOURCE.split("\n");

/* ── type ────────────────────────────────────────────────────────────────── */

// the output's grid, three quarters again nearer: everything scales off one
// ratio, and the widest line still clears the frame's edges when centred
const BIG = 1.75;
export const FS_CODE = FS * BIG; // 42
export const CW_CODE = CW * BIG; // 25.2 — exact, so every position is analytic
export const LH_CODE = Math.round(LH * BIG); // 60

/* ── the block ───────────────────────────────────────────────────────────── */

// Set as code is set: one left edge, the indentation carried in the cells.
// The block as a whole is centred by its widest line. Document coordinates —
// x from the block's middle, y from the first line's top.
const WIDEST = Math.max(...LINES.map((s) => s.length));
export const LEFTS = LINES.map(() => (-WIDEST * CW_CODE) / 2);
export const topOf = (l) => l * LH_CODE;

/* ── the colouring ───────────────────────────────────────────────────────── */

// Four inks: structure in the text's own white, strings in the brand's green,
// numbers in its cyan, and everything that is chrome — names, brackets,
// equals — stepped back so the values read first.
const C_TAG = C_TEXT;
const C_ATTR = C_DIM;
const C_PUNCT = LIT(0.42);
const C_STR = C_GREEN;
const C_NUM = C_CYAN;

const LEX = /(<\/?[A-Za-z][\w.]*)|("[^"]*")|(\d[\d.]*)|(\/?>|=|\{|\})|([A-Za-z][\w]*)|(\s+|.)/g;

// a line as runs of one colour, each knowing where on the line it starts
const runsOf = (line) => {
  const runs = [];
  let at = 0;
  const push = (text, color) => {
    if (text) runs.push({ text, color, at }), (at += text.length);
  };
  for (const m of line.matchAll(LEX)) {
    const [, tag, str, num, punct, name, rest] = m;
    if (tag) {
      const cut = tag[1] === "/" ? 2 : 1;
      push(tag.slice(0, cut), C_PUNCT);
      push(tag.slice(cut), C_TAG);
    } else if (str) push(str, C_STR);
    else if (num) push(num, C_NUM);
    else if (punct) push(punct, C_PUNCT);
    // attribute names are chrome; capitalised bare words are written content
    else if (name) push(name, /^[A-Z]/.test(name) ? C_TAG : C_ATTR);
    else push(rest, C_TEXT);
  }
  return runs;
};

/* ── the tokens ──────────────────────────────────────────────────────────── */

// The unit of the reveal is a run of non-space characters — split on the
// space, whatever the lexer makes of the inside. Each token knows its place
// on its line, its share of the line's colouring, and its number in the whole
// writing; the reveal is that number against one running count.
let count = 0;
export const WORDS = LINES.map((line, l) => {
  const runs = runsOf(line);
  return [...line.matchAll(/\S+/g)].map((m) => {
    const a = m.index;
    const b = a + m[0].length;
    // the line's runs, cut to the token — colour and reveal stay independent
    const cut = runs
      .filter((r) => r.at < b && r.at + r.text.length > a)
      .map((r) => ({
        text: r.text.slice(Math.max(0, a - r.at), b - r.at),
        color: r.color,
      }));
    return { i: count++, a, l, text: m[0], runs: cut, mid: (a + b) / 2 };
  });
});
export const N_TOKENS = count; // 77

/* ── the camera ──────────────────────────────────────────────────────────── */

// Loosely on the writing rather than nailed to it. Two liberties: across,
// only three fifths of the excursion is followed, so the frame never chases a
// long line off its own middle; and the whole path — one point per token, its
// own middle — is smoothed twice over a fixed window, so line returns are
// corners the camera rounds rather than jumps. The table is read at the
// tween's own fraction, so the drift is continuous however the tokens land.
const FOLLOW_X = 0.6;
const R = 4; // tokens either side — about a fifth of a second of writing

const FLAT = WORDS.flat();
const PATH = Array.from({ length: N_TOKENS + 1 }, (_, k) => {
  const w = FLAT[Math.min(k, N_TOKENS - 1)];
  return { x: (LEFTS[w.l] + w.mid * CW_CODE) * FOLLOW_X, y: topOf(w.l) + LH_CODE / 2 };
});

const smooth = (pts) =>
  pts.map((_, i) => {
    let x = 0;
    let y = 0;
    for (let j = i - R; j <= i + R; j++) {
      const p = pts[Math.max(0, Math.min(N_TOKENS, j))];
      x += p.x;
      y += p.y;
    }
    return { x: x / (2 * R + 1), y: y / (2 * R + 1) };
  });

const CAM = smooth(smooth(PATH));

export const camAt = (n) => {
  const k = Math.max(0, Math.min(N_TOKENS, n));
  const i = Math.floor(k);
  const t = k - i;
  const a = CAM[i];
  const b = CAM[Math.min(N_TOKENS, i + 1)];
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
};

/* ── the pull back ───────────────────────────────────────────────────────── */

// The writing done, the camera lets it go: one pull back onto the block's
// own middle — the settle fits the whole block inside the frame, held off
// the edges by a margin, so the result stays large enough to read.
const MARGIN = 90;

export const BLOCK_W = WIDEST * CW_CODE;
export const BLOCK_H = LINES.length * LH_CODE;

// the settled scale: the block fitted inside the frame's margins
export const FIT = Math.min((W - 2 * MARGIN) / BLOCK_W, (H - 2 * MARGIN) / BLOCK_H);

// the two cameras on one fraction — the writing's drift at k=0, the settled
// whole at k=1 — position and scale together, so the pull back is one gesture
export const viewAt = (n, k) => {
  const c = camAt(n);
  return {
    x: c.x * (1 - k),
    y: c.y + (BLOCK_H / 2 - c.y) * k,
    s: 1 + (FIT - 1) * k,
  };
};

/* ── timing ──────────────────────────────────────────────────────────────── */

// ms, absolute, as everywhere. The shot opens the film: dark a beat, and
// then the tokens pour.
export const T_COMPOSE = 0;
export const T_TOKENS = T_COMPOSE + DARK;

// A token a beat, every beat alike; each blends up over the next few beats,
// so the writing is a pour with a soft leading edge rather than a flicker.
export const STEP_DT = 60;
export const FADE_STEPS = 1.5; // beats a token takes to resolve

// how far a token has come at count `n` — its own opacity
export const litAt = (i, n) => Math.max(0, Math.min(1, (n - i) / FADE_STEPS));

/* ── the heat ────────────────────────────────────────────────────────────── */

// A token arrives hot: the product's blue, glowing — the writing is the
// product working, so the edge carries its colour. The last five written are
// hot alike, one flat band rather than a gradient; a token falling out of
// the band takes its inks in under a frame, so at most one is ever seen
// between states. The overlay carries the glow, so both go together.
export const HOT_N = 5;
const COOL = 0.75; // beats — about a frame, an edge rather than a fade
export const heatAt = (i, n) => Math.max(0, Math.min(1, (HOT_N - (n - i)) / COOL));

// four widths of the blue's own light, tight to wide: a solid core, a bright
// inner bloom, and a wash that reaches well clear of the line
export const GLOW_TEXT = `0 0 ${Math.round(6 * BIG)}px white, 0 0 ${Math.round(18 * BIG)}px white, 0 0 ${Math.round(40 * BIG)}px white, 0 0 ${Math.round(84 * BIG)}px white`;

// the count runs HOT_N past the last token — longer than the blend — so by
// the last beat the block is not only whole but cooled into its inks
export const N_RUN = N_TOKENS + HOT_N;
export const TYPE_MS = N_RUN * STEP_DT; // 3690
export const T_SET = T_TOKENS + TYPE_MS; // the block whole

/* ── the pull back's timing ──────────────────────────────────────────────── */

// The last token lit — its own blend spent, though the tail behind it is
// still hot — the camera lets the writing go. The last of the heat dies as
// the frame widens, so the cut of the two moves is never seen.
export const T_ZOOM = T_TOKENS + (N_TOKENS - 1 + FADE_STEPS) * STEP_DT;
export const ZOOM = 500;

// the settle is the close: the pull back lands on the player's frame and
// the whole block holds there before the film ends
const HOLD_END = 1000;
export const COMPOSE_END = T_ZOOM + ZOOM + HOLD_END;
