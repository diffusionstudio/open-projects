// Look test: the same bouncing ball in both worlds, then the crossover (a pencil ball on a patch of paper
// inside the colour world). Capture it, compare with references/look.md, then replace it with the real shot table.
// A shot is { start, end, world, draw(pen, t, R) }; t is seconds since the shot started, already stepped on twos.

import { easeIn, easeOut, ellipsePath, ellipsePts } from "./engine";
import type { Pen, Rand, Shot, StrokeOpts } from "./engine";

export const DURATION = 6;
const W = 1440, H = 1080, FLOOR = 820, TAU = Math.PI * 2;
const LIGHT: StrokeOpts = { w: 1.7, a: 0.32, passes: 1 };

function room(pen: Pen, R: Rand) {
  if (pen.toon) {
    pen.fill((c) => { c.beginPath(); c.rect(0, 0, W, FLOOR); }, "#f4e7cf");
    pen.fill((c) => { c.beginPath(); c.rect(0, FLOOR, W, H - FLOOR); }, "#d9b98c");
    pen.sketchLine(-20, FLOOR, W + 20, FLOOR, R, { w: 3, a: 1 });
    return;
  }
  // the pencil background is a suggestion: a floor line, a frame, a few scribbles in new places every drawing
  pen.sketchLine(-20, FLOOR, W + 20, FLOOR, R, { ...LIGHT, boil: 14 });
  pen.sketchLine(980, 160, 980, FLOOR, R, { ...LIGHT, boil: 18 });
  pen.sketchLine(980, 160, W + 20, 120, R, { ...LIGHT, boil: 18 });
  for (let i = 0; i < 3; i++) pen.scribble(R() * W, 120 + R() * 420, 140 + R() * 120, -1.2 + R() * 0.6, 26, R);
}

function ball(pen: Pen, t: number, R: Rand, x = W / 2) {
  // posed, not simulated: ease out going up, ease in coming down, squash on contact with volume preserved
  const u = t % 1, up = u < 0.5 ? easeOut(u * 2) : 1 - easeIn((u - 0.5) * 2);
  const r = 110, contact = Math.max(0, 1 - Math.min(u, 1 - u) / 0.09);
  const sy = 1 - 0.32 * contact + 0.12 * Math.sin(up * Math.PI) * (1 - up), sx = 1 / Math.sqrt(sy);
  const y = FLOOR - r * sy - up * 430;
  const shadow = ellipsePath(x + 34, FLOOR + 16, r * (1.15 - up * 0.45), 17);
  if (pen.toon) pen.fill(shadow, "#b8976c");
  else pen.hatch(shadow, x + 34, FLOOR + 16, r * 1.3, -0.8, 8, R, { a: 0.65 });
  pen.form(ellipsePts(x, y, r * sx, r * sy, 0, 0, TAU, 40).slice(0, -1), R, { fill: "#e4572e", tone: 2 });
  if (contact > 0.5) for (const sg of [-1, 1]) pen.sketchLine(x + sg * (r + 30), FLOOR - 12, x + sg * (r + 90), FLOOR - 40, R, { w: 2.4, a: pen.toon ? 1 : 0.6, passes: 1, over: 0 });
}

function crossover(pen: Pen, t: number, R: Rand) {
  room(pen, R); ball(pen, t, R, 460);
  // a pencil thing inside the colour world sits on its own patch of paper
  const patch = ellipsePath(980, 520, 260, 420);
  pen.erase(patch); pen.fill(patch, pen.paper);
  pen.toon = false;
  pen.clip(patch, () => ball(pen, t + 0.5, R, 980));
  pen.toon = true;
}

export const shots: Shot[] = [
  { start: 0, end: 2, world: "toon", draw: (pen, t, R) => { room(pen, R); ball(pen, t, R); } },
  { start: 2, end: 4, world: "pencil", draw: (pen, t, R) => { room(pen, R); ball(pen, t, R); } },
  { start: 4, end: 6, world: "toon", draw: crossover },
];
