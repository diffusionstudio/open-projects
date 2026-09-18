// The cast and props of The Fish Heist. Every character is a small rig of solid forms.
// Each rig can be drawn in either world: toon (flat colour + marker line) or pencil (graphite, hatched).

import { ellipsePath, ellipsePts, lerp, pathOf, rng, sausage, smooth } from "./engine";
import type { Pen, Pt, Rand, StrokeOpts } from "./engine";

export const LIGHT: StrokeOpts = { w: 1.7, a: 0.32, passes: 1 };
export const STRUCT: StrokeOpts = { w: 2.6, a: 0.6, passes: 1 };
const det = (pen: Pen): StrokeOpts => (pen.toon ? { w: 2.2, a: 1, passes: 1 } : { w: 2.4, a: 0.75, passes: 1 });
const ell = (cx: number, cy: number, rx: number, ry: number, rot = 0, n = 28): Pt[] => ellipsePts(cx, cy, rx, ry, rot, 0, Math.PI * 2, n).slice(0, -1);
const dir = (a: number, sg = 1): Pt => [sg * Math.sin(a), Math.cos(a)]; // angle from straight down
const add = (p: Pt, d: Pt, k = 1): Pt => [p[0] + d[0] * k, p[1] + d[1] * k];

function styled(pen: Pen, toon: boolean | undefined, draw: () => void) {
  const prev = pen.toon;
  if (toon !== undefined) pen.toon = toon;
  try { draw(); } finally { pen.toon = prev; }
}

// ---------------------------------------------------------------- fish (always a pencil sketch unless told otherwise)
export function fish(pen: Pen, R: Rand, o: { x: number; y: number; s?: number; rot?: number; toon?: boolean }) {
  styled(pen, o.toon ?? false, () => {
    pen.push(o.x, o.y, o.rot ?? 0, o.s ?? 1);
    pen.form([[-58, 0], [-112, -36], [-98, 0], [-112, 36]], R, { fill: "#9fb6c4", tone: 1 });
    pen.form(smooth([[-70, 0], [-40, -26], [10, -31], [55, -16], [78, 0], [55, 15], [10, 28], [-40, 24]], true), R, { fill: "#b9ccd6", tone: 1 });
    pen.pencil(ellipsePts(36, 0, 10, 20, 0, -1.2, 1.2, 8), R, det(pen));
    pen.pencil([[48, -11], [58, -1]], R, det(pen)); pen.pencil([[58, -11], [48, -1]], R, det(pen));
    for (let i = 0; i < 3; i++) pen.pencil([[-28 + i * 22, -13], [-36 + i * 22, 0], [-28 + i * 22, 12]], R, LIGHT);
    pen.pop();
  });
}

// ---------------------------------------------------------------- the cat
// Design: big tilted head with the ears built into its outline, solid slanted oval eyes, a small "w" mouth,
// three stubby whiskers crossing each cheek, a slim body with haunch loops, a thin curled tail. One bold line.
const catLine = (pen: Pen): StrokeOpts => (pen.toon ? { w: 5.2, a: 1, passes: 1 } : { w: 3.8, a: 0.85, passes: 2 });
const catDet = (pen: Pen): StrokeOpts => (pen.toon ? { w: 4.8, a: 1, passes: 1 } : { w: 3.4, a: 0.85, passes: 1 });
const WHITE = "#ffffff";

export interface HeadOpts {
  x: number; y: number; s?: number; rot?: number; toon?: boolean;
  /** where the face points: shifts the features across the head */
  look?: Pt; mouth?: "closed" | "open" | "fish"; open?: number;
  eyes?: "normal" | "wide" | "shut" | "lock"; ear?: number; face?: boolean; flipY?: boolean;
  /** 0..1: how far the tongue hangs out */
  tongue?: number;
}
export function catHead(pen: Pen, R: Rand, o: HeadOpts) {
  const { s = 1, rot = 0, look = [0, 0], mouth = "closed", open = 1, eyes = "normal", ear = 0, face = true } = o;
  styled(pen, o.toon, () => {
    pen.push(o.x, o.y, rot, s, o.flipY ? -s : s);
    const tip = (sg: number): Pt => [sg * (116 + ear * 26), -122 + ear * 46];
    const lower = smooth([[114, -48], [124, -8], [112, 40], [80, 70], [35, 84], [0, 86], [-35, 84], [-80, 70], [-112, 40], [-124, -8], [-114, -48]]);
    const top = smooth([[-58, -78], [-28, -86], [0, -88], [28, -86], [58, -78]]);
    pen.form([...lower, tip(-1), ...top, tip(1)], R, { fill: WHITE, tone: 1, rim: 0.4, line: catLine(pen) });
    for (const sg of [-1, 1]) pen.pencil([[sg * 107, -50], [sg * 76, -68]], R, catDet(pen));
    if (face) {
      const fx = look[0] * 16, fy = look[1] * 11;
      for (const sg of [-1, 1]) {
        const ex = sg * 40 + fx, ey = -6 + fy;
        if (eyes === "shut") { pen.pencil(ellipsePts(ex, ey + 6, 20, 13, 0, Math.PI * 1.1, Math.PI * 1.9, 10), R, catDet(pen)); continue; }
        const [rx, ry] = eyes === "wide" ? [13, 21] : eyes === "lock" ? [11, 19] : [8, 17];
        pen.blot(ex, ey, rx, R, ry, -0.1);
        if (eyes === "lock") pen.pencil([[ex + sg * 26, ey - 38], [ex - sg * 20, ey - 22]], R, catDet(pen));
      }
      const mx = fx * 0.8, my = fy * 0.8;
      pen.pencil([[mx - 9, 22 + my], [mx, 32 + my], [mx + 9, 22 + my]], R, catDet(pen));
      if (mouth === "open") pen.form(ell(mx, 56 + my, 18, 6 + 19 * open, 0, 16), R, { fill: "#8c2f39", tone: 3, line: catDet(pen) });
      else for (const sg of [-1, 1]) pen.pencil(smooth([[mx, 32 + my], [mx + sg * 4, 46 + my], [mx + sg * 18, 50 + my], [mx + sg * 28, 40 + my]]), R, catDet(pen));
      if (o.tongue) pen.form(ell(mx, 52 + my + 30 * o.tongue, 11, 6 + 30 * o.tongue, 0, 14), R, { fill: "#ee7f8e", tone: 1, line: catDet(pen), accent: false });
      for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) pen.pencil([[sg * 96, 20 + i * 18], [sg * 152, 10 + i * 27]], R, catDet(pen));
      if (mouth === "fish") fish(pen, R, { x: mx + 4, y: 50 + my, s: 0.85, rot: 0.08 });
    }
    pen.pop();
  });
}

const TORSO: Pt[] = [[0, -222], [30, -218], [48, -150], [56, -70], [58, -8], [30, 2], [-30, 2], [-58, -8], [-56, -70], [-48, -150], [-30, -218]];
/** thin tail that rises and curls into a hook; `from` is where it leaves the body, sg the side it swings to */
function catTail(pen: Pen, R: Rand, from: Pt, sway: number, sg = 1) {
  const [x, y] = from, q = (dx: number, dy: number): Pt => [x + sg * dx, y + dy];
  pen.form(sausage([q(0, 0), q(55, -4), q(95 + sway * 8, -55), q(104 + sway * 16, -125), q(78 + sway * 22, -178), q(44 + sway * 22, -166), q(44 + sway * 20, -132), q(64 + sway * 20, -128)], 9, 8), R, { fill: WHITE, line: catLine(pen), accent: false });
}

export interface CatOpts extends Omit<HeadOpts, "rot" | "face" | "flipY"> {
  rot?: number; sx?: number; sy?: number;
  headDx?: number; headDy?: number; headRot?: number; headS?: number;
  pawL?: Pt; pawR?: Pt; tail?: number; part?: "all" | "body" | "head" | "paws";
}
/** Sitting cat, front view. Origin: ground under the body. `rot` spins it about the body centre (tumbling). */
export function catSit(pen: Pen, R: Rand, o: CatOpts) {
  const { s = 1, sy = 1, sx = 1 / Math.sqrt(sy), rot = 0, tail = 0, part = "all" } = o;
  styled(pen, o.toon, () => {
    pen.push(o.x, o.y, 0, s * sx, s * sy); pen.push(0, -170, rot); pen.push(0, 170);
    if (part === "all" || part === "body") {
      catTail(pen, R, [48, -16], tail);
      for (const sg of [-1, 1]) pen.form(ell(sg * 60, -76, 27, 76, 0, 22), R, { fill: WHITE, tone: 1, rim: 0.5, line: catLine(pen) });
      pen.form(smooth(TORSO, true), R, { fill: WHITE, tone: 1, rim: 0.5, line: catLine(pen) });
      for (const sg of [-1, 1]) pen.form(ell(sg * 50, -5, 27, 12, 0, 14), R, { fill: WHITE, line: catLine(pen), accent: false });
      [o.pawL, o.pawR].forEach((p, i) => { if (!p) pen.pencil([[(i ? 1 : -1) * 14, -148], [(i ? 1 : -1) * 17, -6]], R, catLine(pen)); });
    }
    if (part === "all" || part === "head") catHead(pen, R, { ...o, x: o.headDx ?? 0, y: -292 + (o.headDy ?? 0), s: (o.headS ?? 1) * 1.1, rot: o.headRot ?? -0.16 });
    // a lifted paw is held in front of everything
    if (part === "all" || part === "paws") [o.pawL, o.pawR].forEach((p, i) => { if (p) pen.form(sausage([[(i ? 1 : -1) * 30, -160], p], 16, 20), R, { fill: WHITE, tone: 1, rim: 0.5, line: catLine(pen) }); });
    pen.pop(); pen.pop(); pen.pop();
  });
}

export interface CatSideOpts extends Omit<HeadOpts, "face" | "flipY"> {
  flip?: boolean; lean?: number; legs?: [number, number]; arms?: [number, number]; tail?: number; stretch?: number;
}
/** Upright cartoon runner / leaper, facing +x. Origin: body centre. Limb angles are measured from straight down, + = forward. */
export function catSide(pen: Pen, R: Rand, o: CatSideOpts) {
  const { s = 1, rot = 0, lean = 0.4, legs = [0.5, -0.5], arms = [-0.5, 0.5], tail = 0, stretch = 1 } = o;
  styled(pen, o.toon, () => {
    pen.push(o.x, o.y, rot, (o.flip ? -s : s) * stretch, s / Math.sqrt(stretch));
    const up = (d: number, dx = 0): Pt => [Math.sin(lean) * d + dx, -Math.cos(lean) * d];
    const hip = up(-78), sh = up(66, 8);
    const leg = (a: number) => {
      const knee = add(hip, dir(a), 56), foot = add(knee, dir(a - (0.55 - 0.45 * Math.sin(a))), 56);
      pen.form(sausage([hip, knee, foot], 16, 13), R, { fill: WHITE, tone: 1, rim: 0.5, line: catLine(pen) });
      pen.form(ell(foot[0] + 12, foot[1] + 2, 25, 11, -a * 0.4, 14), R, { fill: WHITE, line: catLine(pen), accent: false });
    };
    const arm = (a: number) => pen.form(sausage([sh, add(sh, dir(a), 44), add(add(sh, dir(a), 44), dir(a + 0.9), 42)], 12, 14), R, { fill: WHITE, tone: 1, rim: 0.5, line: catLine(pen) });
    catTail(pen, R, add(hip, [-30, -6]), tail, -1);
    leg(legs[1]); arm(arms[1]);
    pen.form(ell(0, 0, 56, 112, lean, 30), R, { fill: WHITE, tone: 1, rim: 0.5, line: catLine(pen) });
    leg(legs[0]);
    const hc = up(176, 26);
    catHead(pen, R, { ...o, x: hc[0], y: hc[1], s: 1.05, rot: lean * 0.3 - 0.06 });
    arm(arms[0]);
    pen.pop();
  });
}

export interface CatCrouchOpts extends Omit<HeadOpts, "face" | "flipY" | "rot"> {
  rot?: number; headRot?: number; headAt?: Pt; tail?: number;
  /** where the two front paws rest (far, near), in the same space as x / y */
  paws?: [Pt, Pt];
  /** 0 = hind leg folded under the haunch, 1 = kicked out */
  hind?: number;
}
/** Cat on all fours in profile, facing +x: bean body, big haunch, straight front legs, head carried low in front. Origin: ground under the haunch. */
export function catCrouch(pen: Pen, R: Rand, o: CatCrouchOpts) {
  const { s = 1, rot = 0, tail = 0, hind = 0, headAt = [165, -130] } = o;
  styled(pen, o.toon, () => {
    pen.push(o.x, o.y, rot, s);
    const toLocal = ([px, py]: Pt): Pt => { const dx = (px - o.x) / s, dy = (py - o.y) / s, cs = Math.cos(-rot), sn = Math.sin(-rot); return [dx * cs - dy * sn, dx * sn + dy * cs]; };
    const paws: Pt[] = o.paws ? o.paws.map(toLocal) : [[128, -4], [96, 0]];
    const part = { fill: WHITE, tone: 1 as const, rim: 0.5, line: catLine(pen) };
    catTail(pen, R, [-108, -104], tail, -1);
    pen.form(sausage([[102, -96], paws[0]], 15, 17), R, part);
    pen.form(smooth([[-122, -92], [-104, -150], [-36, -174], [44, -164], [100, -136], [120, -92], [96, -56], [10, -44], [-84, -46]], true), R, part);
    if (hind > 0) pen.form(sausage([[-66, -46], [-84 - 40 * hind, -22 + 10 * hind], [-96 - 90 * hind, -8 + 44 * hind]], 17, 14), R, part);
    pen.form(ell(-62, -72, 60, 66, -0.2, 24), R, part);
    if (hind <= 0) pen.form(ell(-38, -9, 48, 13, 0, 16), R, { fill: WHITE, line: catLine(pen), accent: false });
    pen.form(sausage([[72, -90], paws[1]], 16, 18), R, part);
    catHead(pen, R, { ...o, x: headAt[0], y: headAt[1], s: 1, rot: o.headRot ?? 0 });
    pen.pop();
  });
}

/** Upright cat sprinting straight at the camera. Origin: ground between the feet. `phase` drives the run cycle. */
export function catRunFront(pen: Pen, R: Rand, o: Omit<HeadOpts, "face" | "flipY" | "rot"> & { phase?: number; sy?: number }) {
  const { s = 1, sy = 1, phase = 0 } = o, c = Math.sin(phase), bob = Math.abs(c) * 18;
  styled(pen, o.toon, () => {
    pen.push(o.x, o.y - bob * s, 0, s / Math.sqrt(sy), s * sy);
    const part = { fill: WHITE, tone: 1 as const, rim: 0.5, line: catLine(pen) };
    catTail(pen, R, [30, -120], Math.cos(phase), 1);
    // planted leg straight under the hip (its foot stays on the floor while the body bobs); the other knee comes up at the camera
    for (const sg of c >= 0 ? [-1, 1] : [1, -1]) {
      const lift = Math.min(1, Math.max(0, sg * c) * 1.35), gy = bob * (1 - lift);
      const knee: Pt = [sg * lerp(27, 50, lift), lerp(-58, -104, lift) + gy * 0.5], foot: Pt = [sg * lerp(28, 44, lift), lerp(-8, -60, lift) + gy];
      pen.form(sausage([[sg * 24, -118], knee, foot], lerp(15, 19, lift), lerp(14, 17, lift)), R, part);
      pen.form(ell(foot[0] + sg * 3, foot[1] + 4, lerp(26, 38, lift), lerp(12, 22, lift), 0, 16), R, { fill: WHITE, line: catLine(pen), accent: false });
    }
    pen.push(0, -100, 0, 1, 0.84); pen.form(smooth(TORSO, true), R, part); pen.pop();
    for (const sg of [-1, 1]) { // arms pump opposite to the legs, fists coming up in front of the chest
      const up = Math.max(0, -sg * c);
      pen.form(sausage([[sg * 42, -262], [sg * lerp(74, 66, up), lerp(-206, -226, up)], [sg * lerp(70, 38, up), lerp(-150, -268, up)]], 14, lerp(15, 18, up)), R, part);
    }
    catHead(pen, R, { ...o, x: 0, y: -362, s: 1.1, rot: c * 0.07 });
    pen.pop();
  });
}

/** Cat seen from behind (clawing, leaping away). Origin: ground under the body. armL / armR: 0 = down, 1 = reaching high. */
export function catBack(pen: Pen, R: Rand, o: { x: number; y: number; s?: number; sy?: number; toon?: boolean; armL?: number; armR?: number; tail?: number; ear?: number; headDx?: number; headRot?: number }) {
  const { s = 1, sy = 1, armL = 0, armR = 0, tail = 0 } = o;
  styled(pen, o.toon, () => {
    pen.push(o.x, o.y, 0, s / Math.sqrt(sy), s * sy);
    for (const sg of [-1, 1]) pen.form(ell(sg * 60, -76, 27, 76, 0, 22), R, { fill: WHITE, tone: 1, rim: 0.5, line: catLine(pen) });
    pen.form(smooth(TORSO, true), R, { fill: WHITE, tone: 1, rim: 0.5, line: catLine(pen) });
    for (const sg of [-1, 1]) pen.form(ell(sg * 50, -5, 27, 12, 0, 14), R, { fill: WHITE, line: catLine(pen), accent: false });
    catHead(pen, R, { x: o.headDx ?? 0, y: -292, s: 1.1, rot: o.headRot ?? 0, ear: o.ear, face: false });
    [armL, armR].forEach((reach, i) => {
      const sg = i ? 1 : -1;
      const hand: Pt = [sg * (100 + 40 * reach), lerp(-40, -430, reach)];
      pen.form(sausage([[sg * 44, -185], [sg * (96 + 30 * reach), lerp(-110, -250, reach)], hand], 14, 17), R, { fill: WHITE, tone: 1, rim: 0.5, line: catLine(pen) });
      if (reach > 0.3) for (let c = -1; c <= 1; c++) pen.pencil([[hand[0] + c * 8, hand[1] - 14], [hand[0] + c * 11, hand[1] - 30]], R, catDet(pen));
    });
    catTail(pen, R, [8, -24], tail);
    pen.pop();
  });
}

// ---------------------------------------------------------------- the burly men (pencil world only)
export function wrench(pen: Pen, R: Rand, o: { x: number; y: number; rot?: number; s?: number }) {
  styled(pen, false, () => {
    pen.push(o.x, o.y, o.rot ?? 0, o.s ?? 1);
    pen.form(sausage([[0, 24], [0, -150]], 12, 13), R, { tone: 2, sketchy: true });
    pen.form([[-14, -148], [-36, -166], [-36, -218], [-8, -218], [-8, -190], [12, -190], [12, -218], [38, -218], [38, -170], [14, -148]], R, { tone: 2, sketchy: true });
    pen.pop();
  });
}

export interface ManOpts {
  x: number; y: number; s?: number; flip?: boolean; sx?: number; sy?: number; lean?: number;
  /** 0 = chest square to the camera … 1 = profile toward +x. The +x shoulder tucks behind the chest, the −x arm comes in front. */
  yaw?: number;
  /** draw in two passes around a table: "body" is everything but the near (−x) arm, "nearArm" only that arm */
  part?: "body" | "nearArm";
  sit?: boolean; /** on a chair, legs toward +x (under the table); the value is how high the hips are above the floor */ seated?: number; back?: boolean; turn?: number; shock?: boolean; /** mouth open in a shout, brows still down */ yell?: boolean; number?: boolean;
  legs?: [number, number]; armR?: [number, number]; armL?: [number, number];
  /** run-cycle phase for running straight at the camera (replaces `legs`) */
  run?: number;
  wrench?: boolean; wrenchRot?: number; fork?: boolean;
}
const MARK: StrokeOpts = { w: 3.6, a: 0.9, passes: 1 };
/** the racer's number, hand-lettered in a white roundel */
function roundel(pen: Pen, R: Rand, x: number, y: number, flip = false) {
  pen.push(x, y, 0, flip ? -1 : 1, 1);
  const cx = 0, cy = 0;
  pen.form(ell(cx, cy, 26, 18, 0, 16), R, { accent: false, line: { w: 2.6, a: 0.8, passes: 1 } });
  pen.pencil([[cx - 12, cy - 5], [cx - 7, cy - 10], [cx - 7, cy + 10]], R, { ...MARK, w: 2.8 });
  pen.pencil(smooth([[cx + 1, cy - 9], [cx + 10, cy - 10], [cx + 11, cy - 3], [cx + 4, cy], [cx + 12, cy + 3], [cx + 10, cy + 10], [cx + 1, cy + 9]]), R, { ...MARK, w: 2.8 });
  pen.pop();
}
/** A charcoal mass: one tight, fast zigzag of the side of the pencil — `len` along `angle`, `amp` to either side. */
export function mass(pen: Pen, R: Rand, x: number, y: number, len: number, angle: number, amp: number, o: StrokeOpts = {}) {
  const c = Math.cos(angle), sn = Math.sin(angle), pts: Pt[] = [];
  for (let d = 0, i = 0; d <= len; d += 5 + R() * 6, i++) {
    const off = (i % 2 ? 1 : -1) * amp * (0.55 + R() * 0.55) * Math.pow(Math.sin(Math.PI * Math.min(1, (d + 12) / (len + 24))), 0.4);
    pts.push([x + c * d - sn * off, y + sn * d + c * off]);
  }
  pen.pencil(pts, R, { w: 3.4, a: 0.5, passes: 1, jitter: 1.6, taper: false, ...o });
}

const SK = { sketchy: true };
const inJacketEarly = (jacket: Pt[], x0: number, y0: number, w: number, h: number) => (c: OffscreenCanvasRenderingContext2D) => { pathOf(jacket)(c); c.clip(); c.beginPath(); c.rect(x0, y0, w, h); };
/**
 * Burly racer after the 1985 video: light jacket carried by contour and loose zigzag shading, dark collar,
 * dark open-face helmet with a light peak, a face made of a few confident marks under a brow shadow.
 * Frontal rig. Origin: ground between the feet. Arm angles: from straight down, + = outward / up.
 */
export function man(pen: Pen, R: Rand, o: ManOpts) {
  const { s = 1, sx = 1, sy = 1, lean = 0, turn = 0, yaw = 0, legs = [0.08, -0.08], armR = [0.25, 0.1], armL = [0.25, 0.1] } = o;
  styled(pen, false, () => {
    pen.push(o.x, o.y, 0, (o.flip ? -1 : 1) * s * sx, s * sy);
    // human build: limbs in two straight segments so knees and elbows read; contours found in several broken strokes
    const leg = (hip: Pt, knee: Pt, foot: Pt, q = 1) => {
      pen.form(sausage([hip, knee], 47 * q, 37 * q), R, { tone: 2, ...SK });
      pen.form(sausage([knee, foot], 35 * q, 27 * q), R, { tone: 2, ...SK });
      mass(pen, R, knee[0] - 20, knee[1] - 6, 40, 0.3, 9, { a: 0.4 });
    };
    const boot = (f: Pt, sg: number, q = 1) => pen.form(smooth(([[-32, -30], [10, -34], [56, -12], [62, 10], [-36, 10]] as Pt[]).map(([bx, by]): Pt => [f[0] + sg * bx * q, f[1] + by * q]), true, 4), R, { tone: 3, ...SK });
    const body = o.part !== "nearArm", k = lerp(1, 0.74, yaw), cx = yaw * 46; // k: how much the turn narrows the chest · cx: where its centre line ends up
    if (!body) { /* legs belong to the body pass */ } else if (!o.sit && o.run !== undefined) {
      // head-on run: planted leg straight under the hip; the other knee drives up at the camera — foreshortened thigh, bigger boot
      const c = Math.sin(o.run);
      for (const sg of c >= 0 ? [-1, 1] : [1, -1]) {
        const lift = Math.min(1, Math.max(0, sg * c) * 1.35), hip: Pt = [sg * 52, -300];
        const knee: Pt = [sg * lerp(58, 72, lift), lerp(-150, -226, lift)], foot: Pt = [sg * lerp(60, 66, lift), lerp(-6, -104, lift)];
        leg(hip, knee, foot, lerp(1, 1.18, lift)); boot([foot[0] - sg * 8, foot[1] + 4], sg, lerp(1, 1.25, lift));
      }
    } else if (o.seated !== undefined) {
      // thighs run forward off the seat, shins drop to the floor; far leg first, a little up and ahead of the near one
      for (const [dx, dy] of [[30, -14], [0, 0]]) {
        const hip: Pt = [24 + dx * 0.3, -300 + dy], knee: Pt = [162 + dx, -270 + dy], foot: Pt = [152 + dx, -300 + o.seated + dy - 8];
        leg(hip, knee, foot); boot([foot[0] + 4, foot[1] + 12], 1);
      }
    } else if (!o.sit) {
      legs.forEach((a, i) => {
        const hip: Pt = [i ? -50 : 50, -300], knee = add(hip, dir(a), 150), foot = add(knee, dir(a - (0.5 - 0.4 * Math.sin(a))), 150);
        leg(hip, knee, foot); boot([foot[0] + 2, foot[1] + 4], 1);
      });
    }
    pen.push(0, -290, lean);
    const arm = (sg: number, [u, f]: [number, number], tool: boolean, what: "all" | "sleeve" | "hand" = "all") => {
      const sh: Pt = [sg * 120 * k + (sg < 0 ? yaw * 12 : -yaw * 14), -240 + (sg < 0 ? yaw * 6 : -yaw * 8)], el = add(sh, dir(u, sg), 125), d = dir(f, sg), hd = add(el, d, 112);
      if (what !== "hand") {
        pen.form(sausage([sh, el], 43, 34), R, { tone: 1, rim: 0.7, ...SK });
        pen.form(sausage([el, hd], 34, 26), R, { tone: 1, rim: 0.7, ...SK });
        const ua = Math.atan2(el[1] - sh[1], el[0] - sh[0]);
        mass(pen, R, sh[0] + (el[0] - sh[0]) * 0.2 + 10, sh[1] + (el[1] - sh[1]) * 0.2 + 8, 92, ua, 15); // charcoal along the underside of the sleeve
      }
      if (what === "sleeve") return;
      pen.form(sausage([add(el, d, 100), add(el, d, 108)], 28, 28), R, { tone: 3 });
      const hand = add(hd, d, 24);
      if (tool && o.wrench) wrench(pen, R, { x: hand[0], y: hand[1], rot: Math.atan2(d[0], -d[1]) + (o.wrenchRot ?? 0) });
      if (tool && o.fork) { const tip = add(hand, [-sg * 70, -62]); pen.pencil([hand, tip], R, STRUCT); for (let i = -1; i <= 1; i++) pen.pencil([tip, add(tip, [-sg * 16 + i * 5, -18 - i * 4])], R, LIGHT); }
      pen.push(hand[0], hand[1], Math.atan2(d[1], d[0]));                     // fist, x along the forearm
      pen.form(smooth([[-22, -25], [8, -28], [27, -17], [31, 4], [23, 23], [-4, 28], [-24, 21]], true, 4), R, { tone: 1, rim: 0.6, ...SK });
      for (let q = -1; q <= 1; q++) pen.pencil([[10, -3 + q * 13], [27, -1 + q * 11]], R, LIGHT);
      pen.pencil([[-12, -25], [2, -9], [-6, 5]], R, STRUCT);
      pen.pop();
    };
    if (!body) { arm(-1, armL, false); pen.pop(); pen.pop(); return; }
    if (yaw > 0) arm(1, armR, true, "sleeve"); else arm(-1, armL, false); // turned: the far sleeve starts behind the chest
    // jacket — turned, the +x contour is the chest, the −x contour the back
    const jacket = smooth(([[-134, -234], [-94, -258], [-38, -274], [0, -278], [38, -274], [94, -258], [134, -234], [142, -150], [124, -52], [116, -4], [0, 8], [-116, -4], [-124, -52], [-142, -150]] as Pt[])
      .map(([x, y]): Pt => [x * k + yaw * (x > 100 && y > -200 ? 26 : x < -130 ? 0 : 10), y]), true, 5);
    pen.form(jacket, R, { tone: 1, rim: 0.8, ...SK });
    pen.hatch(inJacketEarly(jacket, 90 * k + cx * 0.6, -232, 62, 96), 120 * k, -186, 70, -1.1, 6, R, { a: 0.75, w: 3 }); // armpit, dark
    pen.pencil([[-118 * k, -18], [cx * 0.4, -10], [118 * k + yaw * 20, -18]], R, STRUCT);                                  // waistband
    const inJacket = (x0: number, y0: number, w: number, h: number) => (c: OffscreenCanvasRenderingContext2D) => { pathOf(jacket)(c); c.clip(); c.beginPath(); c.rect(x0, y0, w, h); };
    pen.hatch(inJacket(52 * k + cx * 0.7, -250, 130, 250), 100, -120, 150, -0.9, 15, R, { a: 0.6, w: 3 });
    pen.hatch(inJacket(-150, -60, 300, 80), 0, -20, 160, -0.5, 17, R, { a: 0.4 });
    // loose charcoal masses on the shadow side, a-ha style: broad zigzags that do not care much about the contour
    mass(pen, R, 88 * k + yaw * 22, -246, 232, 1.45, 36, { a: 0.6 });
    mass(pen, R, 56 * k + yaw * 22, -130, 124, 1.35, 30, { a: 0.45 });
    mass(pen, R, -100 * k, -30, 190 * k, 0.05, 16, { a: 0.45 });
    if (o.back) {
      pen.pencil([[-104, -236], [0, -222], [104, -236]], R, STRUCT); pen.pencil([[0, -222], [3, 4]], R, LIGHT);
    } else {
      pen.pencil([[2 + cx, -262], [6 + cx * 1.2, 6]], R, STRUCT);
      for (const by of [-210, -140, -70]) pen.blot(16 + cx * 1.1, by, 4.5, R);
      if (!yaw) { pen.scribble(-96, -120, 70, 0.9, 12, R, { w: 2.2, a: 0.45 }); pen.pencil([[-106, -182], [-54, -178], [-54, -164], [-106, -168]], R, LIGHT); } // fold, chest pocket
    }
    // neck, collar
    const nx = yaw * 14;
    pen.form([[nx - 30, -340], [nx + 30, -340], [nx + 40, -270], [nx - 40, -270]], R, { tone: 1, rim: 0.6, accent: false, ...SK });
    if (!o.back) pen.hatch((c) => { c.beginPath(); c.rect(nx - 30, -318, 60, 26); }, nx, -306, 40, -0.6, 5, R, { a: 0.7 }); // under the chin
    if (o.back) pen.form([[-58, -308], [58, -308], [52, -268], [-52, -268]], R, { tone: 3, ...SK });
    else for (const sg of [-1, 1]) pen.form([[cx * 0.8 + sg * 62 * k, -296], [cx + sg * 8, -248], [cx * 0.8 + sg * 14, -300]], R, { tone: 3, ...SK });
    // head — human-sized (the old cartoon head scaled down about the chin), a real face under the peak
    const hx = turn * 12 + yaw * 18, fx = hx + turn * 22;
    pen.push(hx, -294, 0, 0.86); pen.push(-hx, 294);
    if (o.back) {
      pen.form(smooth([[hx - 66, -348], [hx - 74, -400], [hx - 48, -446], [hx, -460], [hx + 48, -446], [hx + 74, -400], [hx + 66, -348], [hx + 28, -330], [hx - 28, -330]], true), R, { tone: 3, ...SK });
      pen.form([[hx - 70, -372], [hx + 70, -372], [hx + 68, -354], [hx - 68, -354]], R, { accent: false, line: STRUCT });
      if (o.number) roundel(pen, R, hx, -412, o.flip);
    } else {
      // jaw, not an egg: cheekbones, tapering chin; the far side foreshortens as the head turns
      const far = 1 - 0.28 * Math.abs(turn), wl = 55 * (turn < 0 ? far : 1), wr = 55 * (turn > 0 ? far : 1), chin = hx + turn * 10;
      const face = smooth([[hx - wl * 0.96, -386], [hx - wl, -350], [hx - wl * 0.9, -322], [hx - wl * 0.56, -301], [chin - 12, -289], [chin + 13, -289], [hx + wr * 0.56, -301], [hx + wr * 0.9, -322], [hx + wr, -350], [hx + wr * 0.96, -386], [hx + wr * 0.8, -420], [hx, -430], [hx - wl * 0.8, -420]], true, 4);
      pen.form(face, R, { tone: 1, rim: 0.5, ...SK });
      pen.hatch((c) => { pathOf(face)(c); c.clip(); c.beginPath(); c.rect(fx + 27, -392, 60, 112); }, fx + 40, -340, 70, -0.9, 7, R, { a: 0.6 }); // cheek in shadow
      // open-face helmet: a horseshoe around the face
      const outer = smooth([[hx - 64, -330], [hx - 76, -392], [hx - 52, -444], [hx, -462], [hx + 52, -444], [hx + 76, -392], [hx + 64, -330]]);
      const innerEdge = smooth([[hx + 50, -338], [hx + 56, -388], [hx + 30, -402], [hx, -404], [hx - 30, -402], [hx - 56, -388], [hx - 50, -338]]);
      pen.form([...outer, ...innerEdge], R, { tone: 3, ...SK });
      for (const sg of [-1, 1]) pen.pencil([[hx + sg * 52, -340], [hx + turn * 10 + sg * 15, -291]], R, LIGHT); // chin strap
      pen.form(smooth([[hx - 60, -398], [hx - 30, -412], [hx, -415], [hx + 30, -412], [hx + 60, -398], [hx + 30, -396], [hx, -398], [hx - 30, -396]], true), R, { accent: false, line: STRUCT });
      if (o.number) { pen.form(ell(hx - 26, -440, 17, 8, -0.45, 12), R, { accent: false, line: LIGHT }); roundel(pen, R, hx + 8, -436, o.flip); }
      else { // the other one wears his goggles pushed up on the helmet
        pen.pencil([[hx - 72, -414], [hx - 46, -432]], R, MARK); pen.pencil([[hx + 72, -414], [hx + 46, -432]], R, MARK);
        for (const sg of [-1, 1]) {
          pen.form(ell(hx + sg * 23 + turn * 5, -437, 22, 14, sg * 0.18, 14), R, { accent: false, line: MARK });
          pen.pencil([[hx + sg * 23 + turn * 5 - 10, -432], [hx + sg * 23 + turn * 5 + 2, -444]], R, LIGHT);
        }
        pen.pencil([[hx - 3 + turn * 5, -438], [hx + 3 + turn * 5, -438]], R, MARK);
      }
      // face: shadowed eye sockets under the peak, brows, eyes, nose with a shadow side, lips, chin
      for (const sg of [-1, 1]) {
        const ex = fx + sg * 23 * (sg * turn > 0 ? 1 - 0.28 * Math.abs(turn) : 1), brow = o.shock ? -9 : 0;
        pen.hatch(ellipsePath(ex, -365, 17, 8), ex, -365, 20, -0.5, 5.5, R, { a: o.shock ? 0.25 : 0.5, w: 2.2 });
        pen.pencil([[ex + sg * 19, -376 + brow], [ex - sg * 2, -378 + brow * 1.4], [ex - sg * 16, -370 + brow]], R, MARK);
        if (o.shock) pen.pencil(ellipsePts(ex, -359, 8, 8, 0, 0, 6.6, 10), R, STRUCT); else pen.pencil([[ex - 10, -363], [ex + 10, -364]], R, { ...MARK, w: 3 });
        pen.blot(ex + turn * 3, -361, o.shock ? 2.6 : 3.2, R);
      }
      pen.pencil([[fx + 3, -372], [fx + 7, -346], [fx + 13, -334], [fx + 3, -327], [fx - 9, -331]], R, STRUCT);
      pen.hatch((c) => { c.beginPath(); c.moveTo(fx + 6, -366); c.lineTo(fx + 20, -332); c.lineTo(fx + 6, -328); c.closePath(); }, fx + 12, -345, 24, -0.7, 4, R, { a: 0.6 });
      pen.pencil([[fx + 22, -336], [fx + 30, -318], [fx + 26, -304]], R, LIGHT);                        // fold beside the mouth
      if (o.shock) pen.form(ell(fx + 1, -307, 12, 10, 0, 12), R, { tone: 3, accent: false });
      else if (o.yell) { pen.form(ell(fx + 1, -306, 19, 13, 0, 14), R, { tone: 3 }); pen.pencil([[fx - 12, -313], [fx + 14, -313]], R, LIGHT); }
      else {
        pen.pencil([[fx - 21, -313], [fx - 7, -317], [fx, -315], [fx + 8, -317], [fx + 22, -312]], R, MARK);
        pen.pencil([[fx - 11, -304], [fx + 13, -304]], R, STRUCT);
        pen.hatch(ellipsePath(fx + 1, -299, 13, 4), fx + 1, -299, 14, -0.4, 3.5, R, { a: 0.5 });
      }
      pen.pencil(ellipsePts(hx + turn * 10, -296, 13, 7, 0, 0.3, 2.8, 8), R, LIGHT);
    }
    pen.pop(); pen.pop();
    if (yaw > 0) { arm(1, armR, true, "hand"); if (o.part !== "body") arm(-1, armL, false); } // turned: the near arm crosses in front of the chest
    else arm(1, armR, true);
    pen.pop(); pen.pop();
  });
}

/** A man after meeting the wall. */
export function paperBall(pen: Pen, R: Rand, o: { x: number; y: number; r: number; seed: number }) {
  styled(pen, false, () => {
    const F = rng(o.seed), pts: Pt[] = [];
    for (let i = 0; i < 11; i++) { const a = (i / 11) * 6.283, r = o.r * (0.72 + F() * 0.4); pts.push([o.x + Math.cos(a) * r, o.y + Math.sin(a) * r * 0.85]); }
    pen.form(pts, R, { tone: 2 });
    for (let i = 0; i < 7; i++) { const a = pts[Math.floor(F() * 11)], b = pts[Math.floor(F() * 11)]; pen.pencil([a, [lerp(a[0], b[0], 0.6) + (F() - 0.5) * 20, lerp(a[1], b[1], 0.6)]], R, LIGHT); }
  });
}

// ---------------------------------------------------------------- the sketched arm and fists that live in the bowl
/**
 * The sketched arm that lives in the bowl: a jacket sleeve with a dark cuff and a big bare hand seen from its back.
 * `path` runs from where the arm emerges to the wrist; `rot` turns the hand (0 = fingers up); grip 0 = splayed, 1 = clamped.
 */
export function sketchArm(pen: Pen, R: Rand, o: { path: Pt[]; rot: number; grip?: number; s?: number }) {
  const { path, rot, grip = 0, s = 1 } = o;
  styled(pen, false, () => {
    const w = path[path.length - 1], p = path[path.length - 2], len = Math.hypot(w[0] - p[0], w[1] - p[1]) || 1;
    const d: Pt = [(w[0] - p[0]) / len, (w[1] - p[1]) / len];
    pen.form(sausage(path, 52 * s, 38 * s), R, { tone: 1, rim: 0.8 });
    for (let i = 1; i < path.length - 1; i++) pen.scribble(path[i][0] - 30 * s, path[i][1], 60 * s, 0.4 + R(), 10 * s, R, { w: 2.2, a: 0.5 });
    pen.form(sausage([add(w, d, -22 * s), add(w, d, -6 * s)], 40 * s, 40 * s), R, { tone: 3 });
    pen.push(w[0], w[1], rot, s);
    pen.form(sausage([[-34, -22], [-72, -46], [-86 + 34 * grip, -94 + 30 * grip]], 14, 11), R, { tone: 1, rim: 0.6 });
    [72, 88, 82, 62].forEach((L, i) => {
      const bx = -33 + i * 22, l = L * (1 - 0.3 * grip), a = (i - 1.5) * 0.15 * (1 - grip) + Math.PI;
      const mid = add([bx, -80], dir(a), l * 0.5), tipP = add(mid, dir(a + (i - 1.5) * 0.06), l * 0.5);
      pen.form(sausage([[bx, -80], mid, tipP], 12, 10), R, { tone: 1, rim: 0.6 });
      pen.pencil([add(mid, [-8, 2]), add(mid, [8, 0])], R, LIGHT);
    });
    pen.form(smooth([[-40, 6], [-49, -44], [-44, -86], [0, -96], [42, -88], [47, -42], [36, 6]], true), R, { tone: 1, rim: 0.7 });
    for (let i = 0; i < 4; i++) pen.pencil(ellipsePts(-33 + i * 22, -84, 9, 7, 0, Math.PI * 1.1, Math.PI * 1.9, 6), R, STRUCT);
    for (let i = 0; i < 3; i++) pen.pencil([[-20 + i * 20, -70], [-16 + i * 18, -22]], R, LIGHT);
    pen.pop();
  });
}
/** Four fingertips hooked over an edge from behind (the rest of the hand is hidden). x, y: middle of the edge. */
export function fingersOver(pen: Pen, R: Rand, o: { x: number; y: number; s?: number }) {
  const s = o.s ?? 1;
  styled(pen, false, () => {
    [44, 56, 53, 40].forEach((L, i) => {
      const fx = o.x + (i - 1.5) * 27 * s, top: Pt = [fx, o.y - 12 * s], tipP: Pt = [fx + (i - 1.5) * 3 * s, o.y + L * s];
      pen.form(sausage([top, tipP], 13 * s, 11 * s), R, { tone: 1, rim: 0.6 });
      pen.pencil([[fx - 9 * s, o.y + L * 0.45 * s], [fx + 9 * s, o.y + L * 0.42 * s]], R, LIGHT);
    });
  });
}
/** A racer's fist punching straight at us: four knuckles, folded fingers, thumb across the front; the jacket sleeve and its dark cuff recede behind it. Origin: middle of the fist. */
export function fist(pen: Pen, R: Rand, o: { x: number; y: number; s?: number; rot?: number }) {
  styled(pen, false, () => {
    pen.push(o.x, o.y, o.rot ?? 0, o.s ?? 1);
    pen.form(sausage([[0, 30], [4, 210]], 40, 52), R, { tone: 1, rim: 0.7 });
    pen.form([[-43, 46], [43, 46], [46, 70], [-46, 70]], R, { tone: 3 });
    pen.form(smooth([[-58, -6], [-55, -34], [-42, -47], [-29, -37], [-14, -52], [1, -40], [15, -52], [29, -38], [43, -45], [55, -30], [58, -4], [52, 38], [0, 47], [-52, 38]], true), R, { tone: 1, rim: 0.6 });
    for (const [x0, x1] of [[-29, -27], [1, 1], [29, 27]]) pen.pencil([[x0, -36], [x1, 6]], R, STRUCT);
    pen.pencil(smooth([[-52, 4], [-26, 9], [0, 11], [26, 9], [52, 4]]), R, STRUCT);
    pen.form(sausage([[-52, 30], [-18, 22], [26, 27]], 13, 11), R, { tone: 1, rim: 0.5 });
    pen.pencil([[20, 20], [33, 24], [30, 34]], R, LIGHT);
    pen.pop();
  });
}

// ---------------------------------------------------------------- kitchen props (toon world)
export function bowlGeo(x: number, y: number, s: number, tilt: number, level = 0.5) {
  const rim = { cx: x, cy: y - 95 * s * (1 - tilt), rx: 150 * s, ry: 150 * s * tilt };
  const base = { cx: x, cy: y, rx: 92 * s, ry: 92 * s * tilt };
  const inner = { cx: x, cy: rim.cy, rx: rim.rx * 0.92, ry: rim.ry * 0.9 };
  const surf = { cx: x, cy: lerp(rim.cy, y, level), rx: lerp(138, 92, level) * 1.043 * s, ry: lerp(138, 92, level) * 1.043 * s * tilt };
  return { rim, base, inner, surf };
}
/** Red food bowl. `surface` "graphite": the bottom has turned into a pool of pencil paper (grow 0..1). */
export function bowl(pen: Pen, R: Rand, o: { x: number; y: number; s?: number; tilt?: number; surface?: "empty" | "graphite"; grow?: number; ripple?: number; /** how deep the bottom / pool sits: 0 = at the rim, 1 = at the base */ level?: number }) {
  const { s = 1, tilt = 0.3, surface = "empty", grow = 1, ripple = 0 } = o;
  const geo = bowlGeo(o.x, o.y, s, tilt, o.level), { rim, base, inner, surf } = geo;
  styled(pen, true, () => {
    pen.form([[rim.cx - rim.rx, rim.cy], ...ellipsePts(base.cx, base.cy, base.rx, base.ry, 0, Math.PI, 0, 16), [rim.cx + rim.rx, rim.cy]], R, { fill: "#d9453c" });
    pen.form(ell(rim.cx, rim.cy, rim.rx, rim.ry), R, { fill: "#e2574d" });
    pen.form(ell(inner.cx, inner.cy, inner.rx, inner.ry), R, { fill: "#a9332c", line: { w: 2.2 } });
    pen.clip(ellipsePath(inner.cx, inner.cy, inner.rx, inner.ry), () => {
      if (surface === "empty" || grow < 1) pen.form(ell(surf.cx, surf.cy, surf.rx, surf.ry), R, { fill: "#c23f37", line: { w: 1.8, a: 0.6 } });
      if (surface === "graphite" && grow > 0.02) {
        pen.toon = false;
        pen.form(ell(surf.cx, surf.cy, surf.rx * grow, surf.ry * grow), R, {});
        for (let i = 0; i < 3; i++) {
          const u = (ripple + i / 3) % 1;
          pen.pencil(ellipsePts(surf.cx, surf.cy, surf.rx * grow * u, surf.ry * grow * u, 0, R() * 6, R() * 6 + 5.2, 30), R, { ...LIGHT, a: 0.5 * (1 - u) + 0.1 });
        }
      }
    });
  });
  return geo;
}

/** Oval rug the food bowl stands on. Same x / y / s / tilt as the bowl. */
export function bowlMat(pen: Pen, R: Rand, o: { x: number; y: number; s?: number; tilt?: number }) {
  const { s = 1, tilt = 0.3 } = o;
  styled(pen, true, () => {
    pen.form(ell(o.x, o.y + 8 * s, 212 * s, 212 * s * tilt), R, { fill: "#6fa8b8" });
    pen.form(ell(o.x, o.y + 8 * s, 184 * s, 184 * s * tilt), R, { fill: "#8fc3cf", line: { w: 1.6, a: 0.5 } });
    pen.form(ell(o.x, o.y + 8 * s, 150 * s, 150 * s * tilt), R, { fill: "#6fa8b8", line: { w: 1.6, a: 0.5 } });
  });
}

/** The colourised kitchen. `horizon` is where wall meets floor. */
export function kitchen(pen: Pen, R: Rand, o: { horizon?: number; zoom?: number; ox?: number } = {}) {
  const { horizon: h = 650, zoom = 1, ox = 0 } = o;
  styled(pen, true, () => {
    pen.push(720 + ox, h, 0, zoom); pen.push(-720, -h);
    const quad = (x: number, y: number, w: number, hh: number): Pt[] => [[x, y], [x + w, y], [x + w, y + hh], [x, y + hh]];
    const rect = (x: number, y: number, w: number, hh: number) => pathOf(quad(x, y, w, hh));
    const box = (x: number, y: number, w: number, hh: number, fill: string, line?: StrokeOpts) => pen.form(quad(x, y, w, hh), R, { fill, line });
    const thin: StrokeOpts = { w: 1.8, a: 0.7, boil: 3, over: 0 }, bold: StrokeOpts = { w: 3, a: 1, boil: 3, over: 0 };

    // ── wall: striped paper above a chair rail, plain panelling below
    pen.fill(rect(-3000, -3000, 7440, 3000 + h), "#f6e3b0");
    for (let x = -1500; x < 2940; x += 120) pen.fill(rect(x, -3000, 60, 3000 + h - 206), "#f9ecc8");
    pen.fill(rect(-3000, h - 206, 7440, 206), "#eccd92");

    // ── floor: checkerboard in perspective, a patch of window light across it
    const dys = [0, 70, 170, 310, 520, 800, 1250], fx = (i: number, dy: number) => 720 + i * lerp(110, 620, dy / 800);
    pen.fill(rect(-3000, h, 7440, 4000), "#e3a877");
    for (let r = 0; r < dys.length - 1; r++) for (let i = -16; i < 16; i++) {
      if ((i + r) & 1) pen.fill(pathOf([[fx(i, dys[r]), h + dys[r]], [fx(i + 1, dys[r]), h + dys[r]], [fx(i + 1, dys[r + 1]), h + dys[r + 1]], [fx(i, dys[r + 1]), h + dys[r + 1]]]), "#d18c5c");
    }
    const tile: StrokeOpts = { w: 1.6, a: 0.4, passes: 1, color: "#a9683f", boil: 4, over: 0 };
    for (const dy of dys.slice(1, -1)) pen.sketchLine(-1500, h + dy, 2940, h + dy, R, tile);
    for (let i = -16; i <= 16; i++) pen.sketchLine(fx(i, 0), h, fx(i, 1250), h + 1250, R, tile);
    const sun = (u: number, v: number): Pt => [fx(lerp(lerp(-4.0, -3.7, v), lerp(-1.7, -1.0, v), u), lerp(70, 330, v)), h + lerp(70, 330, v)];
    for (const [u0, u1] of [[0, 0.47], [0.53, 1]]) for (const [v0, v1] of [[0, 0.46], [0.54, 1]]) pen.fill(pathOf([sun(u0, v0), sun(u1, v0), sun(u1, v1), sun(u0, v1)]), "rgba(255, 246, 205, 0.36)");

    // ── window: a view, curtains on a rod, a plant on the sill
    box(110, h - 540, 370, 320, "#ffffff"); box(134, h - 516, 322, 272, "#bfe3f2", { w: 2.2 });
    pen.clip(rect(134, h - 516, 322, 272), () => {
      for (const [cx, cy, rx, ry] of [[330, h - 452, 46, 17], [366, h - 462, 34, 20], [400, h - 450, 40, 15], [196, h - 398, 30, 11], [222, h - 404, 24, 13]]) pen.fill(ellipsePath(cx, cy, rx, ry), "#ffffff");
      pen.fill(ellipsePath(400, h - 232, 190, 70), "#8cc37a"); pen.fill(ellipsePath(200, h - 226, 170, 56), "#a9d48f");
      pen.form(ell(250, h - 300, 40, 46, 0, 18), R, { fill: "#5fa55a", line: thin }); pen.fill(rect(245, h - 262, 10, 30), "#7a5236");
    });
    pen.sketchLine(295, h - 516, 295, h - 244, R, bold); pen.sketchLine(134, h - 380, 456, h - 380, R, bold);
    for (const m of [0, 1]) { // curtains, gathered by a tie-back
      const X = (x: number) => (m ? 590 - x : x);
      pen.form(smooth([[92, h - 562], [206, h - 562], [200, h - 470], [158, h - 398], [132, h - 372], [156, h - 338], [182, h - 238], [92, h - 238]].map(([x, y]): Pt => [X(x), y]), true, 4), R, { fill: "#e2574d" });
      for (const k of [0, 1, 2]) pen.pencil(smooth([[X(112 + k * 30), h - 556], [X(110 + k * 22), h - 460], [X(118 + k * 8), h - 384]]), R, thin);
      for (const k of [0, 1]) pen.pencil([[X(124 + k * 8), h - 360], [X(112 + k * 34), h - 246]], R, thin);
      pen.form(quad(X(m ? 164 : 116), h - 384, 48, 15), R, { fill: "#f4c95d", line: thin });
    }
    pen.sketchLine(70, h - 568, 520, h - 568, R, { ...bold, w: 4.5 }); pen.blot(66, h - 568, 8, R); pen.blot(524, h - 568, 8, R);
    box(92, h - 224, 406, 22, "#ffffff");
    for (const [dx, rot] of [[-20, -0.7], [-8, -0.25], [6, 0.2], [20, 0.65]]) pen.form(ell(330 + dx * 1.3, h - 292 + Math.abs(dx) * 0.5, 9, 27, rot, 12), R, { fill: "#5fa55a", line: thin });
    pen.form([[306, h - 264], [354, h - 264], [346, h - 224], [314, h - 224]], R, { fill: "#c96f4a" }); box(302, h - 270, 56, 10, "#d98560", thin);

    // ── between window and cupboards: the fish (framed), a clock stuck at feeding time
    box(610, h - 486, 200, 136, "#fff8e8"); box(626, h - 470, 168, 104, "#cfe8ef", thin);
    pen.form([[752, h - 418], [784, h - 440], [778, h - 418], [784, h - 396]], R, { fill: "#f08a5d", line: thin });
    pen.form(ell(712, h - 418, 46, 21, 0, 18), R, { fill: "#f08a5d", line: thin }); pen.blot(684, h - 422, 3.2, R);
    pen.pencil(ellipsePts(694, h - 418, 10, 17, 0, -1.1, 1.1, 8), R, thin);
    pen.form(ell(905, h - 426, 54, 54, 0, 26), R, { fill: "#6fb3a8" }); pen.form(ell(905, h - 426, 43, 43, 0, 24), R, { fill: "#ffffff", line: thin });
    for (let k = 0; k < 12; k++) { const a = (k / 12) * 6.283; pen.pencil([[905 + Math.sin(a) * 34, h - 426 - Math.cos(a) * 34], [905 + Math.sin(a) * 39, h - 426 - Math.cos(a) * 39]], R, thin); }
    pen.sketchLine(905, h - 426, 905, h - 458, R, bold); pen.sketchLine(905, h - 426, 918, h - 406, R, { ...bold, w: 3.6 });

    // ── cupboards: tiled splash-back, wall units, a counter with things on it
    pen.fill(rect(1000, h - 486, 520, 160), "#fdf6e6");
    for (let y = h - 486; y < h - 330; y += 52) pen.sketchLine(1000, y, 1520, y, R, { ...thin, color: "#cdbf9f" });
    for (let x = 1052; x < 1520; x += 52) pen.sketchLine(x, h - 486, x, h - 328, R, { ...thin, color: "#cdbf9f" });
    box(1040, h - 700, 480, 214, "#6fb3a8"); pen.sketchLine(1262, h - 694, 1262, h - 492, R, bold);
    box(1064, h - 676, 174, 166, "#7dc0b5", thin); box(1286, h - 676, 174, 166, "#7dc0b5", thin); pen.blot(1240, h - 520, 6, R); pen.blot(1284, h - 520, 6, R);
    box(1000, h - 300, 520, 330, "#6fb3a8");
    pen.sketchLine(1000, h - 232, 1520, h - 232, R, bold); pen.sketchLine(1225, h - 226, 1225, h + 4, R, bold);
    box(1022, h - 212, 182, 196, "#7dc0b5", thin); box(1246, h - 212, 182, 196, "#7dc0b5", thin);
    for (const x of [1082, 1304]) pen.sketchLine(x, h - 266, x + 62, h - 266, R, { ...bold, w: 5 });
    pen.blot(1195, h - 150, 6, R); pen.blot(1255, h - 150, 6, R);
    box(1000, h + 4, 520, 26, "#3f7f76"); pen.fill(pathOf([[1000, h + 30], [1520, h + 30], [1560, h + 56], [968, h + 56]]), "rgba(60, 30, 10, 0.16)");
    // kettle · jar of utensils · fruit bowl
    pen.pencil(ellipsePts(1118, h - 410, 30, 30, 0, Math.PI, Math.PI * 2, 12), R, { ...bold, w: 4.5 });
    pen.form([[1156, h - 384], [1190, h - 404], [1196, h - 394], [1160, h - 360]], R, { fill: "#f4c95d" });
    pen.form(smooth([[1078, h - 328], [1070, h - 376], [1090, h - 408], [1146, h - 408], [1166, h - 376], [1158, h - 328]], true, 4), R, { fill: "#f4c95d" });
    pen.pencil([[1086, h - 396], [1150, h - 396]], R, thin); pen.blot(1118, h - 414, 5, R);
    pen.sketchLine(1244, h - 372, 1236, h - 428, R, bold); pen.form(ell(1235, h - 436, 8, 12, -0.1, 10), R, { fill: "#f1ece2", line: thin });
    pen.sketchLine(1262, h - 372, 1270, h - 420, R, bold); pen.form(quad(1260, h - 446, 20, 28), R, { fill: "#e2574d", line: thin });
    box(1228, h - 374, 48, 46, "#fff8e8"); pen.sketchLine(1228, h - 360, 1276, h - 360, R, { ...thin, color: "#6fb3a8", w: 3 });
    pen.form(ell(1362, h - 362, 19, 19, 0, 14), R, { fill: "#f6a04d", line: thin }); pen.form(ell(1396, h - 366, 20, 20, 0, 14), R, { fill: "#d9453c", line: thin }); pen.form(ell(1426, h - 360, 17, 17, 0, 14), R, { fill: "#9bc53d", line: thin });
    pen.form([...ellipsePts(1394, h - 354, 58, 28, 0, 0, Math.PI, 14)], R, { fill: "#8ecae6" });
    box(978, h - 328, 560, 30, "#f1ece2");

    // ── skirting with a mouse hole, a ball of wool, the lamp (the diner has its twin)
    box(-1500, h - 24, 2500, 24, "#fff8e8", { w: 2 });
    pen.form([...ellipsePts(872, h - 1, 21, 40, 0, Math.PI, Math.PI * 2, 12)], R, { fill: "#2e211c" });
    pen.pencil(smooth([[548, h + 58], [520, h + 72], [486, h + 60], [452, h + 74], [430, h + 66]]), R, { ...bold, w: 2.6, color: "#4f6fb8" });
    pen.form(ell(566, h + 40, 27, 25, 0, 16), R, { fill: "#6c8fd6" });
    for (const [rx, rot] of [[24, 0.5], [16, -0.6], [25, -0.1]]) pen.pencil(ellipsePts(566, h + 40, rx, 9, rot, 0.2, 2.9, 10), R, { ...thin, color: "#3f5ca3" });
    pen.sketchLine(770, -3000, 770, h - 596, R, bold);
    pen.fill(ellipsePath(770, h - 540, 30, 9), "#fff3b8");
    pen.form([[716, h - 540], [742, h - 598], [798, h - 598], [824, h - 540]], R, { fill: "#e2574d" });
    pen.pop(); pen.pop();
  });
}
