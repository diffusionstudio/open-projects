import { CW, CH } from "./frame.js";

/* ── banner ──────────────────────────────────────────────────────────────── */

// The CLI's own banner, ANSI Shadow, on the same character grid as the output.
export const BANNER_ROWS = [
  "███████╗██╗  ██╗██╗██╗     ██╗     ███████╗",
  "██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝",
  "███████╗█████╔╝ ██║██║     ██║     ███████╗",
  "╚════██║██╔═██╗ ██║██║     ██║     ╚════██║",
  "███████║██║  ██╗██║███████╗███████╗███████║",
  "╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝",
];

// Drawn as geometry rather than set as text: a terminal's block glyph doesn't
// fill its cell, so every cell stays a discrete brick with air around it.
const B_CW = CW;
const B_CH = CH;
const B_GAP_Y = 4; // rows are separated; columns merge into one solid bar
const B_LT = 1.9; // stroke weight
const B_LD = 4.4; // separation between the two lines of a double stroke

export const B_STAGGER = 60; // rows arrive top to bottom
export const B_SLIDE = 3 * CW; // a nudge in from the right — the gutter's own measure

export const BANNER_H = BANNER_ROWS.length * B_CH;

// A corner turns [vertical, horizontal]; its outer line sits opposite the travel.
const CORNER = { "╔": [1, 1], "╗": [1, -1], "╚": [-1, 1], "╝": [-1, -1] };

export const BANNER_CELLS = BANNER_ROWS.map((line, r) => {
  const cells = [];
  const y0 = r * B_CH;
  const iy = y0 + B_GAP_Y / 2; // cell interior, top
  const ih = B_CH - B_GAP_Y; // cell interior, height
  const cy = y0 + B_CH / 2; // cell centre

  // blocks merge across columns, so a stroke is one solid bar with no seams
  let start = -1;
  for (let i = 0; i <= line.length; i++) {
    const on = line[i] === "█";
    if (on && start < 0) start = i;
    if (!on && start >= 0) {
      cells.push({ x: start * B_CW, y: iy, w: (i - start) * B_CW, h: ih });
      start = -1;
    }
  }

  // shadow strokes, given as centre lines so corners land on their neighbours
  const hSeg = (y, xa, xb) =>
    cells.push({ x: Math.min(xa, xb), y: y - B_LT / 2, w: Math.abs(xb - xa), h: B_LT, s: true });
  const vSeg = (x, ya, yb) =>
    cells.push({ x: x - B_LT / 2, y: Math.min(ya, yb), w: B_LT, h: Math.abs(yb - ya), s: true });

  const d = B_LD / 2;
  for (let i = 0; i < line.length; i++) {
    const x0 = i * B_CW;
    const cx = x0 + B_CW / 2;
    const c = line[i];

    if (c === "═") {
      hSeg(cy - d, x0, x0 + B_CW);
      hSeg(cy + d, x0, x0 + B_CW);
    } else if (c === "║") {
      vSeg(cx - d, iy, iy + ih);
      vSeg(cx + d, iy, iy + ih);
    } else if (CORNER[c]) {
      const [vy, hx] = CORNER[c];
      const xEdge = hx > 0 ? x0 + B_CW : x0;
      const yEdge = vy > 0 ? iy + ih : iy;
      // each arm starts half a stroke back, so the two lines close their corner
      for (const side of [-1, 1]) {
        hSeg(cy + side * vy * d, cx + side * hx * d - (hx * B_LT) / 2, xEdge);
        vSeg(cx + side * hx * d, cy + side * vy * d - (vy * B_LT) / 2, yEdge);
      }
    }
  }
  return cells;
});

// one ramp step per row — the cells are discrete, so the gradient is too
const ramp = (k) => {
  const v = Math.round(0xc6 + (0x3c - 0xc6) * k);
  return `rgb(${v},${v},${v})`;
};
export const BANNER_ROW_COLOR = BANNER_ROWS.map((_, r) => ramp(r / (BANNER_ROWS.length - 1)));
export const BANNER_ROW_SHADOW = BANNER_ROWS.map((_, r) =>
  ramp(Math.min(1, r / (BANNER_ROWS.length - 1) + 0.18)),
);
