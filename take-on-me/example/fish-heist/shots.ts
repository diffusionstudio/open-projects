// The Fish Heist — shot table. PASS 1: rough blocking (staging, timing, silhouettes).
// A shot is { start, end, world, draw(pen, t, R) }; t is seconds since the shot started, already stepped on twos.

import { backOut, easeIn, easeInOut, easeOut, ellipsePath, ellipsePts, lerp, pathOf, rng, seg } from "./engine";
import type { Pen, Pt, Rand, Shot, StrokeOpts } from "./engine";
import { LIGHT, STRUCT, bowl, bowlMat, catBack, catCrouch, catHead, catRunFront, catSide, catSit, fish, fist, kitchen, man, mass, paperBall } from "./cast";

export const DURATION = 25;
const W = 1440, H = 1080, TAU = Math.PI * 2;
const WARM = "#fff1bf"; // the light of the kitchen leaking into the sketch world

// ---------------------------------------------------------------- shared marks
function burst(pen: Pen, R: Rand, x: number, y: number, r0: number, r1: number, n: number, a0 = 0, a1 = TAU, o: StrokeOpts = {}) {
  for (let i = 0; i < n; i++) {
    const a = lerp(a0, a1, (i + R() * 0.6) / n), q0 = r0 * (0.9 + R() * 0.2), q1 = r1 * (0.7 + R() * 0.5);
    pen.sketchLine(x + Math.cos(a) * q0, y + Math.sin(a) * q0, x + Math.cos(a) * q1, y + Math.sin(a) * q1, R, { w: 2.4, a: 0.6, passes: 1, over: 0, ...o });
  }
}
function speedLines(pen: Pen, R: Rand, x: number, y: number, n: number, len: number, spread: number) {
  for (let i = 0; i < n; i++) {
    const oy = (R() - 0.5) * spread, l = len * (0.5 + R());
    pen.sketchLine(x - R() * 40, y + oy, x - l, y + oy + (R() - 0.5) * 10, R, { w: 2, a: 0.45, passes: 1, boil: 10, over: 0 });
  }
}
function panel(pen: Pen, R: Rand, x: number, y: number, w: number, h: number, o: StrokeOpts = LIGHT, skew = 0) {
  pen.sketchLine(x + skew, y, x + w + skew, y, R, o); pen.sketchLine(x + w + skew, y, x + w, y + h, R, o);
  pen.sketchLine(x + w, y + h, x, y + h, R, o); pen.sketchLine(x, y + h, x + skew, y, R, o);
}
/** A loose charcoal mass: two broad zigzags laid over each other. */
function charcoal(pen: Pen, R: Rand, x: number, y: number, len: number, angle: number, amp: number, o: StrokeOpts = {}) {
  mass(pen, R, x, y, len, angle, amp, o);
  mass(pen, R, x + 6, y + 4, len * 0.9, angle + 0.03, amp * 0.7, { ...o, a: (o.a ?? 0.5) * 0.7 });
}
/** Reflection strokes across a pane. */
function glass(pen: Pen, R: Rand, x: number, y: number, w: number, h: number) {
  for (const [u, l] of [[0.22, 0.5], [0.34, 0.8], [0.7, 0.4]]) pen.sketchLine(x + w * u, y + h * (0.5 + l / 2), x + w * (u + 0.16 * l * 2), y + h * (0.5 - l / 2), R, { ...LIGHT, a: 0.35, boil: 10 });
}
/** A dark upright (door jamb, post): hatched solid between two firm edges. */
function jamb(pen: Pen, R: Rand, x: number, y0: number, y1: number, w: number, lean = 0) {
  const path = pathOf([[x + lean, y0], [x + w + lean, y0], [x + w, y1], [x, y1]]);
  pen.hatch(path, x + w / 2, (y0 + y1) / 2, (y1 - y0) / 2 + 40, -1.0, 11, R, { a: 0.7, w: 3.2 });
  pen.hatch(path, x + w / 2, (y0 + y1) / 2, (y1 - y0) / 2 + 40, 0.5, 16, R, { a: 0.45 });
  pen.sketchLine(x + lean, y0, x, y1, R, { ...STRUCT, boil: 6 }); pen.sketchLine(x + w + lean, y0, x + w, y1, R, { ...STRUCT, boil: 6 });
}
function scribbles(pen: Pen, R: Rand, n: number) {
  for (let i = 0; i < n; i++) pen.scribble(R() * W, 80 + R() * 600, 120 + R() * 160, -1.2 + R() * 0.6, 26, R);
}
function ruled(pen: Pen, R: Rand, y0: number, y1: number, step: number) {
  for (let y = y0; y <= y1; y += step) pen.sketchLine(-20, y, W + 20, y + (R() - 0.5) * 8, R, { ...LIGHT, a: 0.22, boil: 12 });
}

// ---------------------------------------------------------------- 1 · the empty bowl (0–2)
function s01(pen: Pen, t: number, R: Rand) {
  kitchen(pen, R); bowlMat(pen, R, { x: 705, y: 912, s: 1.05 });
  // two bursts of scraping at the bottom of the empty bowl, then the look
  const scratching = (t >= 0.15 && t < 0.75) || (t >= 0.95 && t < 1.4), demand = seg(t, 1.5, 1.62), ph = t * TAU * 3;
  const paw: Pt | undefined = scratching ? [26 + 36 * Math.sin(ph), 80 + 9 * Math.cos(ph)] : undefined;
  const cat = {
    x: 690, y: 792, toon: true, look: (demand > 0 ? [0, 0.1] : [0.1, 0.95]) as Pt, headDy: demand > 0 ? 0 : 26,
    headRot: demand > 0 ? -0.16 : 0.05 + (scratching ? Math.sin(ph) * 0.05 : 0), mouth: (demand > 0 ? "open" : "closed") as "open" | "closed", open: demand,
    pawR: paw, tail: Math.sin(t * 5), sy: demand > 0 ? 1 : 0.95,
  };
  catSit(pen, R, { ...cat, part: "body" }); catSit(pen, R, { ...cat, part: "head" });
  const { rim, inner, surf } = bowl(pen, R, { x: 705 + (scratching ? Math.sin(ph) * 5 : 0), y: 912, s: 1.05 });
  if (!paw) return;
  // the paw reaches over the far rim into the bowl; the near wall hides whatever is below the rim line
  pen.clip((c) => { c.beginPath(); c.rect(-50, -50, W + 100, rim.cy + 50); c.moveTo(inner.cx + inner.rx, inner.cy); c.ellipse(inner.cx, inner.cy, inner.rx, inner.ry, 0, 0, 7); }, () => {
    const scrape: StrokeOpts = { w: 2, a: 0.7, passes: 1, color: "#7a231d", over: 0, boil: 6 };
    for (let i = 0; i < 3; i++) pen.sketchLine(surf.cx - 70 + R() * 30, surf.cy - 8 + i * 9, surf.cx + 40 + R() * 40, surf.cy - 4 + i * 9, R, scrape);
    catSit(pen, R, { ...cat, part: "paws" });
  });
  for (const sg of [-1, 1]) for (let i = 0; i < 2; i++) pen.sketchLine(rim.cx + sg * (rim.rx + 14), rim.cy - 20 - i * 22, rim.cx + sg * (rim.rx + 44 + R() * 20), rim.cy - 34 - i * 30, R, { w: 2.4, a: 1, passes: 1, over: 0 });
}
// ---------------------------------------------------------------- 2 + 3 · over the bowl (2–5)
const BOWL_CU = { x: 720, y: 900, s: 3, tilt: 0.5 };
interface OverBowl { grow: number; ripple: number; lean: number; eyes?: "normal" | "wide"; ear?: number; headRot?: number; headDy?: number; reflect?: boolean; tongue?: number }
function overBowl(pen: Pen, R: Rand, p: OverBowl) {
  const { headRot = 0 } = p;
  kitchen(pen, R, { horizon: 170 }); bowlMat(pen, R, BOWL_CU);
  const headDy = p.lean * 130 + (p.headDy ?? 0), headS = 1 + p.lean * 0.15;
  const cat = { x: 720, y: 640, s: 1.2, toon: true, look: [0, 0.9] as Pt, eyes: p.eyes, ear: p.ear, headDy, headS, headRot, tongue: p.tongue, tail: Math.sin(p.ripple * 9) };
  catSit(pen, R, { ...cat, part: "body" });
  const { inner, surf } = bowl(pen, R, { ...BOWL_CU, surface: "graphite", grow: p.grow, ripple: p.ripple });
  if (p.reflect) {
    pen.clip(ellipsePath(inner.cx, inner.cy, inner.rx, inner.ry), () => pen.clip(ellipsePath(surf.cx, surf.cy, surf.rx * p.grow, surf.ry * p.grow), () =>
      catHead(pen, R, { x: 720, y: surf.cy + 30 + (1 - p.lean) * 140, s: 1.25, rot: -headRot, flipY: true, toon: false, look: [0, 0.9], eyes: p.eyes, ear: p.ear })));
  }
  catSit(pen, R, { ...cat, part: "head" });
  return surf;
}
function s02(pen: Pen, t: number, R: Rand) {
  // pool forms · cat leans in, the reflection is a sketch · curious head tilt · first tentative lick
  const lean = easeInOut(seg(t, 0.6, 1.2)), see = t >= 1.3, lick = t >= 1.7;
  const surf = overBowl(pen, R, {
    grow: easeOut(seg(t, 0.1, 0.9)), ripple: t * 0.8, lean, reflect: lean > 0.25 && !lick, eyes: see && !lick ? "wide" : "normal",
    headRot: see && !lick ? 0.14 * easeOut(seg(t, 1.3, 1.5)) : 0, ear: see ? -0.1 : 0, headDy: lick ? 58 : 0, tongue: t >= 1.8 ? 1 : 0,
  });
  if (t >= 1.8) lapRings(pen, R, surf.cy - surf.ry + 22);
}
function lapRings(pen: Pen, R: Rand, y: number) {
  styledPencil(pen, () => { for (const k of [1, 1.8]) pen.pencil(ellipsePts(720, y, 46 * k, 11 * k, 0, R() * 6, R() * 6 + 5.4, 16), R, { w: 2.4, a: 0.7 / k, passes: 1 }); });
}
/** value at t from [time, value] keys, eased between them */
function keys(t: number, k: [number, number][]) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return lerp(k[i - 1][1], k[i][1], easeInOut(seg(t, k[i - 1][0], k[i][0])));
  return k[k.length - 1][1];
}
function s03(pen: Pen, t: number, R: Rand) {
  // HIGH, CLOSE THREE-QUARTER VIEW: cat in profile, paws up on the rim, the pool wide open below its face.
  // 0–.42 lapping, the bowl dips a little under its paws on every lap · .42 one lean too many: the bowl TIPS toward the cat,
  // the rim drops away under its paws · .5–.75 it pivots in head-first · slides under, legs and tail last · the bowl thuds back level · splash
  kitchen(pen, R, { horizon: 150, zoom: 1.9, ox: -160 });
  pen.push(620, 1050, 0, 1.36); pen.push(-620, -1050);                                  // camera pushed in on cat + bowl
  bowlMat(pen, R, { x: 930, y: 1010, s: 3, tilt: 0.4 });
  const d = Math.round(t * 12), licking = t < 0.42, out = licking && d % 3 !== 2;
  const over = seg(t, 0.42, 0.5), tip = easeInOut(seg(t, 0.5, 0.75)), sink = easeIn(seg(t, 0.72, 0.94));
  // bowl rocks about the near-left edge of its base
  const B: Pt = [654, 1010];
  const rock = licking ? (out ? -0.04 : -0.01) : keys(t, [[0.42, -0.02], [0.5, -0.17], [0.62, -0.33], [0.78, -0.3], [0.87, 0], [0.92, -0.07], [0.97, 0]]);
  const inBowl = (p: Pt): Pt => { const dx = p[0] - B[0], dy = p[1] - B[1], cs = Math.cos(rock), sn = Math.sin(rock); return [B[0] + dx * cs - dy * sn, B[1] + dx * sn + dy * cs]; };
  const kick = Math.sin(t * TAU * 6);

  pen.push(B[0], B[1], rock); pen.push(-B[0], -B[1]);                                   // ── bowl frame
  bowl(pen, R, { x: 930, y: 1010, s: 3, tilt: 0.4, surface: "graphite", ripple: t * (licking ? 2.5 : 5), level: 0.35 });
  // what goes under the surface line is gone (but never the part of the cat still standing left of the bowl)
  const visible = (c: OffscreenCanvasRenderingContext2D) => { c.beginPath(); c.rect(-100, -600, W + 200, 915 + 600); c.rect(-100, -600, 570, H + 1200); };
  if (t < 0.94) pen.clip(visible, () => {
    pen.push(B[0], B[1], -rock); pen.push(-B[0], -B[1]);                                // back to the floor's frame: the cat is not glued to the bowl
    // the paws ride the rim; as it drops away the hind end comes up, then the whole cat goes over the paws and down the tilted pool
    const P = inBowl([520 + 200 * tip + 30 * sink, 872 + 10 * tip + 640 * sink]);
    pen.push(P[0], P[1], -1.1 * Math.min(0, rock) * (1 - tip) + 2.0 * tip);
    catCrouch(pen, R, {
      x: 430 - 520, y: 985 - 872, s: 1.5, rot: -0.3, toon: true, paws: [[24, -66], [-12, 8]], headRot: 0.45 + (out ? 0.06 : 0),
      headAt: [165, out ? -120 : -132], look: [0.35, 0.9], tongue: licking ? (out ? 1 : 0.2) : 1, eyes: licking ? "normal" : "wide", ear: licking ? 0 : 0.7,
      tail: licking ? Math.sin(t * 9) : kick, hind: over > 0 ? 0.5 + 0.5 * kick : 0,
    });
    pen.pop(); pen.pop(); pen.pop();
  });
  styledPencil(pen, () => {
    if (out) for (const k of [1, 1.9]) pen.pencil(ellipsePts(618, 902, 50 * k, 17 * k, 0, R() * 6, R() * 6 + 5.4, 16), R, { w: 2.4, a: 0.7 / k, passes: 1 });
    if (tip > 0.4 && t < 0.8) burst(pen, R, 720, 905, 90, 230, 9, Math.PI * 1.1, Math.PI * 1.9, { a: 0.7 });
    if (tip > 0.3 && t < 0.94) for (const k of [1, 1.5]) pen.pencil(ellipsePts(770, 917, 150 * k, 34 * k, 0, -0.2, Math.PI + 0.2, 20), R, { w: 2.8, a: 0.75 / k, passes: 1 }); // the pool closing around it
    if (t >= 0.86) { burst(pen, R, 760, 910, 110, 440 - 230 * seg(t, 0.86, 1), 13, Math.PI * 1.06, Math.PI * 1.94, { a: 0.75 }); for (const k of [1, 1.7]) pen.pencil(ellipsePts(760, 915, 90 * k, 30 * k, 0, 0, 6.6, 20), R, { w: 2.4, a: 0.6 / k, passes: 1 }); }
  });
  pen.pop(); pen.pop();                                                                 // ── end bowl frame

  const act: StrokeOpts = { w: 2.6, a: 1, passes: 1, over: 0 };
  if (over > 0 && tip < 0.5) for (let i = 0; i < 3; i++) pen.sketchLine(1190 + i * 26, 880 - i * 30, 1240 + i * 34, 840 - i * 40, R, act);   // far side of the bowl lifting
  if (t >= 0.86 && t < 0.97) for (let i = 0; i < 4; i++) pen.sketchLine(1130 + i * 40, 1030 + (i % 2) * 8, 1180 + i * 46, 1046 + (i % 2) * 10, R, act); // thud
  pen.pop(); pen.pop();
}
function styledPencil(pen: Pen, draw: () => void) { const prev = pen.toon; pen.toon = false; try { draw(); } finally { pen.toon = prev; } }

// ---------------------------------------------------------------- diner set
function diner(pen: Pen, R: Rand) {
  pen.sketchLine(0, 885, W, 872, R, { ...LIGHT, boil: 14 });
  panel(pen, R, 90, 140, 420, 340, { ...LIGHT, boil: 18 }); panel(pen, R, 128, 176, 344, 268, { ...LIGHT, boil: 18 });
  panel(pen, R, 590, 120, 390, 320, { ...LIGHT, boil: 18 });
  glass(pen, R, 128, 176, 344, 268); glass(pen, R, 590, 120, 390, 320);
  pen.sketchLine(640, 500, 1420, 490, R, { ...STRUCT, boil: 8 }); pen.sketchLine(640, 500, 640, 875, R, { ...STRUCT, boil: 8 });
  pen.sketchLine(770, -20, 770, 150, R, STRUCT);
  pen.form([[710, 215], [742, 150], [798, 150], [830, 215]], R, { tone: 2 });
  scribbles(pen, R, 3);
  jamb(pen, R, 1345, -20, 880, 74);
  charcoal(pen, R, 1180, 60, 150, 1.3, 30, { a: 0.4 });
}
/** Two men at a pedestal table, a plate between them. Origin: centre of the table top. */
function dinerTable(pen: Pen, R: Rand, o: { x: number; y: number; s: number; bite: number; freeze?: boolean; fishOn?: boolean; plateX?: number; hop?: number }) {
  const px = o.plateX ?? 0, py = -(o.hop ?? 0);
  pen.push(o.x, o.y, 0, o.s);
  // three-quarter toward the table; the near forearm rests ON the table top, so it is drawn after the table
  const guy = (sg: number, part: "body" | "nearArm") => man(pen, R, { x: sg * 345, y: 390, flip: sg > 0, number: sg > 0, sit: true, seated: HIP, turn: o.freeze ? 0.1 : 0.85, shock: o.freeze, fork: true, armR: o.freeze ? [0.7, -2.3] : [0.7, -2.3 + o.bite * 0.3 * sg], armL: [-0.15, -1.62], yaw: 0.6, part });
  pen.hatch(ellipsePath(0, 362, 500, 30), 0, 362, 500, 0.1, 9, R, { a: 0.5 }); // everything under the table sits in one pool of shadow
  const FLOOR = 342, HIP = 300 - (390 - FLOOR); // the men's rig hangs from y 390; their hips end up this high above the floor
  for (const sg of [-1, 1]) {
    // side-on diner chair, facing the table: raked back, seat slab, two legs
    pen.push(sg * 345, FLOOR, 0, -sg, 1);
    pen.hatch(ellipsePath(10, 6, 190, 16), 10, 6, 190, 0.12, 9, R, { a: 0.45 });
    pen.form([[-150, -HIP + 8], [-128, -HIP + 8], [-176, -HIP - 230], [-200, -HIP - 226]], R, { tone: 2 });
    pen.form([[-140, -HIP + 30], [-122, -HIP + 30], [-130, 0], [-146, 0]], R, { tone: 2 });
    pen.form([[84, -HIP + 30], [102, -HIP + 30], [108, 0], [94, 0]], R, { tone: 2 });
    pen.form([[-156, -HIP + 6], [112, -HIP + 6], [112, -HIP + 32], [-156, -HIP + 32]], R, { tone: 2 });
    pen.pop();
    guy(sg, "body");
  }
  pen.form(ellipsePts(0, 338, 125, 27).slice(0, -1), R, { tone: 2 });
  pen.form([[-30, 60], [30, 60], [30, 335], [-30, 335]], R, { tone: 2 });
  pen.form([[-302, 28], [302, 28], [292, 64], [-292, 64]], R, { tone: 2 });
  pen.form([[-272, -30], [272, -30], [312, 30], [-312, 30]], R, { tone: 1 });
  pen.form(ellipsePts(px, py - 4, 100, 25).slice(0, -1), R, {}); pen.pencil(ellipsePts(px, py - 4, 72, 16, 0, 0.3, 5.6), R, LIGHT);
  if (o.fishOn) fish(pen, R, { x: px, y: py - 16, s: 0.8 });
  for (const sg of [-1, 1]) guy(sg, "nearArm");
  pen.pop();
}

// ---------------------------------------------------------------- 4 · into the sketch (5–8)
function s04(pen: Pen, t: number, R: Rand) {
  diner(pen, R);
  // the cat drops out of the sky onto the men's table; they are too busy eating to care
  const T = { x: 770, y: 665, s: 0.9 }, u = seg(t, 0, 0.6), landed = u >= 1;
  const hop = landed ? Math.sin(seg(t, 0.6, 0.9) * Math.PI) * 30 : 0;
  dinerTable(pen, R, { ...T, bite: Math.sin(t * 7), fishOn: true, plateX: 130, hop });
  const gx = T.x - 150 * T.s, gy = T.y - 2, x = lerp(gx - 110, gx, u), y = lerp(-260, gy, easeIn(u));
  const sy = landed ? lerp(0.58, 1, backOut(seg(t, 0.65, 1.05))) : 1.12;
  const A = easeOut(seg(t, 1.2, 1.45)), B = easeOut(seg(t, 1.75, 2.0)), baffled = t >= 2.35;
  if (landed && t < 0.95) burst(pen, R, gx, gy, 110, 230, 10, Math.PI * 1.05, Math.PI * 1.95);
  if (landed) pen.hatch(ellipsePath(x + 14, gy + 6, 84, 9), x + 14, gy + 6, 84, 0.12, 8, R, { a: 0.55 });
  catSit(pen, R, {
    x, y, s: 0.56, sy, toon: false, rot: (1 - u) * -4.5 * Math.PI, tail: Math.sin(t * 4),
    look: baffled ? [0, 0] : t >= 1.8 ? [0.9, 0.25] : t >= 1.2 ? [-0.9, 0.25] : [0, 0.3],
    eyes: !landed || baffled ? "wide" : t < 1.1 ? "shut" : "normal", ear: baffled ? 0.35 : 0, headRot: baffled ? 0.16 : undefined,
    pawL: A > 0 ? [lerp(-20, -112, A), lerp(-8, -232, A)] : undefined, pawR: B > 0 ? [lerp(20, 112, B), lerp(-8, -232, B)] : undefined,
  });
}
// ---------------------------------------------------------------- 5 · the heist (8–10)
/** Anime concentration lines: bundles of strokes racing in from beyond the frame toward (cx, cy), stopping at a ragged ellipse; every few bundles a heavy spike. Redrawn every drawing, so they flicker. */
function focusLines(pen: Pen, R: Rand, cx: number, cy: number, rx: number, ry: number, reach = 0) {
  const FAR = 1100;
  for (let a = R() * 0.2, b = 0; a < TAU; b++) {
    const n = 2 + Math.floor(R() * 5), r0 = 0.9 + R() * R() * 0.6 - reach;
    for (let i = 0; i < n; i++) {
      const c = Math.cos(a + i * 0.012), sn = Math.sin(a + i * 0.012), r = r0 + R() * 0.25;
      pen.sketchLine(cx + c * rx * r, cy + sn * ry * r, cx + c * FAR, cy + sn * FAR, R, { w: 1.4 + R() * 2.2, a: 0.45 + R() * 0.4, passes: 1, over: 0, boil: 3, taper: true });
    }
    if (b % 4 === 0) { // spike: a fan of heavy strokes sharing one tip
      const tip = r0 - 0.06, am = a + n * 0.006;
      for (let i = -2; i <= 2; i++) pen.sketchLine(cx + Math.cos(am) * rx * tip, cy + Math.sin(am) * ry * tip, cx + Math.cos(am + i * 0.009) * FAR, cy + Math.sin(am + i * 0.009) * FAR, R, { w: 3.6, a: 0.85, passes: 1, over: 0, boil: 2 });
    }
    a += n * 0.012 + 0.06 + R() * 0.13;
  }
}
function s05a(pen: Pen, t: number, R: Rand) {
  // a beat of bafflement, then THE LOOK: the room drops away, focus lines slam in, brow in shadow, a glint in the eye
  const lock = t >= 0.16, hit = lock && t < 0.3, H0 = { x: 700, y: 600, s: 3.1, rot: lock ? -0.05 : 0.1 };
  if (lock) focusLines(pen, R, 700, 560, 470, 380, hit ? 0.14 : 0);
  else { pen.sketchLine(0, 930, W, 915, R, { ...LIGHT, boil: 16 }); scribbles(pen, R, 2); }
  catHead(pen, R, { ...H0, toon: false, look: lock ? [0.9, -0.55] : [-0.35, 0.5], eyes: lock ? "lock" : "wide", ear: lock ? -0.15 : 0.35 });
  if (!lock) return;
  styledPencil(pen, () => {
    pen.push(H0.x, H0.y, H0.rot, H0.s);
    // shadow over the brow, its lower edge a scowling V that the eyes glare out from under
    const brow = (c: OffscreenCanvasRenderingContext2D) => { c.beginPath(); c.ellipse(0, -2, 121, 87, 0, 0, TAU); c.clip(); pathOf([[-130, -95], [130, -95], [130, -54], [22, -25], [0, -21], [-22, -25], [-130, -54]])(c); };
    pen.hatch(brow, 0, -64, 140, -0.9, 6, R, { a: 0.6, w: 0.8 });
    pen.hatch(brow, 0, -75, 140, -0.35, 9, R, { a: 0.4, w: 0.8 });
    for (const sg of [-1, 1]) { // highlights cut into the pupils
      const ex = sg * 40 + 0.9 * 16, ey = -6 - 0.55 * 11;
      pen.erase(ellipsePath(ex + 4, ey - 8, 3.6, 5.2, 0.3)); pen.erase(ellipsePath(ex - 4, ey + 9, 1.8, 2.2));
    }
    const gx = 92, gy = -26, g = hit ? 1.5 : 1; // the glint at the corner of the eye
    for (const [dx, dy] of [[0, 24], [17, 0], [7, 7], [7, -7]]) pen.pencil([[gx - dx * g, gy - dy * g], [gx + dx * g, gy + dy * g]], R, { w: 1.1, a: 0.95, passes: 1, taper: true });
    pen.pop();
  });
}
function s05b(pen: Pen, t: number, R: Rand) {
  pen.sketchLine(0, 985, W, 972, R, { ...LIGHT, boil: 14 });
  panel(pen, R, 440, 60, 560, 380, { ...LIGHT, boil: 18 }); panel(pen, R, 480, 98, 480, 300, { ...LIGHT, boil: 18 });
  scribbles(pen, R, 3);
  // crouch · one clean pounce along the table · fish in mouth, the men freeze mid-bite
  const T = { x: 720, y: 700, s: 1.15 }, jump = seg(t, 0.3, 0.6), landed = t >= 0.6, cs = 0.72;
  const hop = landed ? Math.sin(seg(t, 0.6, 0.85) * Math.PI) * 22 : 0;
  dinerTable(pen, R, { ...T, bite: Math.sin(t * 9), freeze: landed, fishOn: jump < 0.8, plateX: 125, hop });
  const x0 = T.x - 150 * T.s, x1 = T.x + 125 * T.s, gy = T.y - 2;
  if (t < 0.3) {
    const crouch = easeInOut(seg(t, 0, 0.25));
    pen.hatch(ellipsePath(x0 + 16, gy + 8, 100, 11), x0 + 16, gy + 8, 100, 0.12, 8, R, { a: 0.55 });
    catSit(pen, R, { x: x0, y: gy, s: cs, sy: 1 - 0.27 * crouch, toon: false, eyes: "lock", look: [0.95, 0.35], ear: -0.15, headRot: 0.12, tail: Math.sin(t * 30) });
  } else if (!landed) {
    const x = lerp(x0, x1, jump), y = gy - 150 * cs - Math.sin(Math.PI * jump) * 120;
    speedLines(pen, R, x - 70, y, 5, 170, 120);
    catSide(pen, R, { x, y, s: cs, toon: false, rot: lerp(-0.45, 0.55, jump), lean: 1.05, legs: [-0.9, -1.2], arms: [1.2, 1.5], stretch: 1.2, eyes: "lock", look: [0.8, 0.4], mouth: jump > 0.7 ? "fish" : "open", tail: 1 });
  } else {
    const sy = lerp(0.62, 1, backOut(seg(t, 0.6, 0.95)));
    if (t < 0.9) burst(pen, R, x1, gy - 20, 120, 240, 11, Math.PI * 1.05, Math.PI * 1.95);
    for (const sg of [-1, 1]) burst(pen, R, T.x + sg * 345 * T.s, 250, 80, 140, 5, Math.PI * 1.15, Math.PI * 1.85, { a: 0.5 });
    pen.hatch(ellipsePath(x1 + 16, gy + 8, 100, 11), x1 + 16, gy + 8, 100, 0.12, 8, R, { a: 0.55 });
    catSit(pen, R, { x: x1, y: gy, s: cs, sy, toon: false, mouth: "fish", eyes: t >= 1.0 ? "wide" : "normal", look: t >= 1.25 ? [0.9, 0] : t >= 1.0 ? [-0.9, 0] : [0, 0], tail: Math.sin(t * 5) });
  }
}
// ---------------------------------------------------------------- 6 · they turn (10–11)
function s06(pen: Pen, t: number, R: Rand) {
  pen.sketchLine(0, 300, W, 280, R, { ...LIGHT, boil: 18 }); scribbles(pen, R, 3);
  panel(pen, R, 150, -60, 700, 900, { ...STRUCT, boil: 8 }); panel(pen, R, 196, -20, 608, 820, { ...LIGHT, boil: 14 }); glass(pen, R, 196, 0, 608, 500);
  jamb(pen, R, 1300, -20, 1100, 86); charcoal(pen, R, 880, 60, 260, 1.25, 50, { a: 0.4 });
  const turn = easeInOut(seg(t, 0.08, 0.6)), raise = easeOut(seg(t, 0.45, 0.85));
  man(pen, R, { x: 1050, y: 1570, s: 1.7, flip: true, number: true, sit: true, turn: lerp(0.9, 0, turn), armR: [0.2, 0.1], armL: [0.2, 0.1] });
  man(pen, R, { x: 390, y: 1700, s: 2, sit: true, turn: lerp(0.9, 0, turn), wrench: true, armR: [lerp(0.3, 1.15, raise), lerp(0.4, 2.85, raise)], armL: [0.2, 0.1], wrenchRot: -0.2 * raise });
  if (raise > 0.9) burst(pen, R, 960, 150, 90, 170, 7, Math.PI * 1.1, Math.PI * 2.1, { a: 0.5 });
}

// ---------------------------------------------------------------- 7 · the chase (11–14)
function s07(pen: Pen, t: number, R: Rand) {
  // a low, narrow paper corridor: ceiling just over the helmets, ruled lines and panel frames whipping past inside it
  const G = 905, C = 318;
  pen.sketchLine(-20, C, W + 20, C - 10, R, { ...STRUCT, boil: 8 }); pen.sketchLine(-20, G + 24, W + 20, G + 12, R, { ...STRUCT, boil: 8 });
  pen.hatch((c) => { c.beginPath(); c.rect(0, C - 120, W, 108); }, 720, C - 66, 760, -1.0, 24, R, { a: 0.4 });
  pen.hatch((c) => { c.beginPath(); c.rect(0, G + 40, W, 80); }, 720, G + 80, 760, -1.0, 24, R, { a: 0.35 });
  ruled(pen, R, C + 70, G - 60, 92);
  for (let i = 0; i < 4; i++) {
    const x = ((((i * 560 - t * 1500) % 2240) + 2240) % 2240) - 480;
    panel(pen, R, x, C + 34, 380, G - C - 90, { ...STRUCT, boil: 10 }, 46); panel(pen, R, x + 32, C + 66, 316, G - C - 154, { ...LIGHT, boil: 16 }, 40);
    jamb(pen, R, x - 104, C, G + 18, 40, -26); glass(pen, R, x + 32, C + 66, 316, G - C - 154);
  }
  scribbles(pen, R, 2);

  const swipe = 0, dash = 0; // the swipe happens in the head-on angle that follows
  const pm = t * TAU * 2;
  [[lerp(150, 330, t / 1.5), 0.6, 1.6], [lerp(430, 600, t / 1.5), 0.64, 0]].forEach(([x, s, ph], i) => {
    const a = Math.sin(pm + ph), bob = Math.abs(Math.cos(pm + ph)) * 22;
    pen.hatch(ellipsePath(x + 30, G + 22, 150, 16), x + 30, G + 22, 150, 0.12, 11, R, { a: 0.45 });
    man(pen, R, {
      x, y: G - bob, s, lean: 0.3, turn: 0.9, number: i === 0, legs: [a * 0.85, -a * 0.85], wrench: true,
      armR: i ? [lerp(1.5 + 0.25 * a, 0.9, swipe), lerp(2.7, 1.0, swipe)] : [1.4 - 0.25 * a, 2.6], armL: [0.4 - a * 0.5, 0.9 - a * 0.5], wrenchRot: i ? swipe * 0.6 : 0,
    });
    speedLines(pen, R, x - 110, G - 230, 4, 170, 300);
  });

  const pc = t * TAU * 3, c = Math.sin(pc), back = t >= 0.7 && t < 1.25;
  const cx = 1000 + 50 * Math.sin(t * 1.4) + 230 * dash, cs = 0.8;
  pen.hatch(ellipsePath(cx + 10, G + 20, 110, 13), cx + 10, G + 20, 110, 0.12, 11, R, { a: 0.45 });
  catSide(pen, R, {
    x: cx, y: G - 178 * cs - Math.abs(Math.cos(pc)) * 20, s: cs, toon: false, lean: 0.45 + 0.2 * dash, stretch: 1 + 0.18 * dash,
    legs: [c, -c], arms: [-c * 0.9 + 0.3, c * 0.9 + 0.3], tail: Math.cos(pc), mouth: "fish", eyes: back ? "wide" : "normal", look: back ? [-1, 0.1] : [0.7, 0], ear: 0.5,
  });
  speedLines(pen, R, cx - 95, G - 190, 5, 200, 230);
  for (let i = 0; i < 2; i++) pen.scribble(cx - 120 - R() * 120, G - 10 - R() * 30, 70, R() * 0.5 - 0.2, 14, R);
}

// 7b · head-on down the narrow corridor (12.5–14): they are right behind it, the wrench comes down, the cat ducks and bolts
function s07b(pen: Pen, t: number, R: Rand) {
  const VP: Pt = [720, 390];
  for (let i = 0; i < 5; i++) { // frames of the corridor rushing at the camera
    const k = (i / 5 + t * 1.1) % 1, sc = 0.1 + k * k * 2.3, hw = 320 * sc, hh = 430 * sc;
    panel(pen, R, VP[0] - hw, VP[1] + 120 * sc - hh, hw * 2, hh * 2, k > 0.45 ? { ...STRUCT, boil: 10 } : { ...LIGHT, boil: 12 });
  }
  for (const sg of [-1, 1]) {
    pen.sketchLine(VP[0] + sg * 34, VP[1] - 32, VP[0] + sg * 1000, -330, R, LIGHT); pen.sketchLine(VP[0] + sg * 34, VP[1] + 56, VP[0] + sg * 1000, 1330, R, LIGHT);
    for (const dy of [-0.55, -0.2, 0.2]) pen.sketchLine(VP[0] + sg * 60, VP[1] + dy * 60, VP[0] + sg * 760, VP[1] + dy * 900, R, { ...LIGHT, a: 0.2, boil: 12 }); // ruled lines on the walls
  }
  burst(pen, R, VP[0], VP[1] + 80, 560, 820, 12, 0, TAU, { ...LIGHT, a: 0.35 });
  pen.hatch(pathOf([[VP[0] - 34, VP[1] - 32], [VP[0] + 34, VP[1] - 32], [VP[0] + 1000, -330], [VP[0] - 1000, -330]]), 720, 120, 900, 0.3, 22, R, { a: 0.3 }); // ceiling
  pen.hatch(pathOf([[VP[0] + 34, VP[1] - 32], [VP[0] + 1000, -330], [VP[0] + 1000, 1330], [VP[0] + 34, VP[1] + 56]]), 1150, 500, 900, -1.0, 20, R, { a: 0.32 }); // the wall away from the light

  const gain = easeInOut(seg(t, 0, 1.5)), pm = t * TAU * 2, swing = easeIn(seg(t, 0.62, 0.9)), duck = seg(t, 0.7, 0.85) - seg(t, 1.0, 1.15), bolt = easeIn(seg(t, 1.1, 1.5));
  [-1, 1].forEach((sg, i) => {
    const ph = pm + Math.PI / 6 + i * Math.PI, a = Math.sin(ph), ms = lerp(0.84, 1.04, gain) * (i ? 1 : 0.93), gy = lerp(930, 1010, gain) - (i ? 0 : 26);
    const x = 720 + sg * lerp(215, 250, gain);
    pen.hatch(ellipsePath(x + 20, gy + 14, 190 * ms, 22 * ms), x + 20, gy + 14, 190 * ms, 0.12, 10, R, { a: 0.5 });
    man(pen, R, {
      x, y: gy - Math.abs(a) * 24, s: ms, flip: sg > 0, number: sg < 0, lean: 0.05 * a, run: ph,
      wrench: true, wrenchRot: i ? -0.3 + 0.5 * swing : -0.4, armL: [0.3, lerp(0.35, -2.2, (1 - a) / 2)],
      armR: i ? [lerp(2.5, 0.75, swing), lerp(3.0, 0.15, swing)] : [1.9 + 0.2 * a, 2.8],
    });
  });
  const cs = lerp(1.0, 1.5, bolt), cy = lerp(1015, 1230, bolt), cx = 720 + 28 * Math.sin(t * 5);
  if (swing > 0.15 && t < 1.05) pen.pencil(ellipsePts(cx + 40, 470, 300, 230, 0, Math.PI * 1.15, Math.PI * 1.95, 16), R, { w: 2.8, a: 0.6, passes: 2 }); // the wrench whistles past its ears
  if (duck > 0.3) burst(pen, R, cx, 640, 190, 300, 9, Math.PI * 1.1, Math.PI * 1.9, { a: 0.55 });
  pen.hatch(ellipsePath(cx + 16, cy + 8, 120 * cs, 14 * cs), cx + 16, cy + 8, 120 * cs, 0.12, 9, R, { a: 0.5 });
  catRunFront(pen, R, { x: cx, y: cy, s: cs, sy: 1 - 0.32 * duck, phase: t * TAU * 3 + Math.PI / 4, toon: false, mouth: "fish", eyes: duck > 0.2 ? "wide" : "lock", ear: 0.4 + 0.5 * duck, look: [0, bolt > 0 ? -0.2 : 0.1] });
  for (let i = 0; i < 3; i++) pen.scribble(cx - 190 + i * 150 + R() * 40, cy - 20 - R() * 40, 80, -0.3 + R() * 0.6, 15, R);
}

// ---------------------------------------------------------------- the dead end (14–20)
function deadEnd(pen: Pen, R: Rand) {
  const o = { ...STRUCT, boil: 8 };
  // narrow: the end wall is a tall slot, the side walls rush in steeply
  panel(pen, R, 505, 130, 430, 670, o);
  pen.sketchLine(505, 130, 60, -60, R, LIGHT); pen.sketchLine(935, 130, 1380, -60, R, LIGHT);
  pen.sketchLine(505, 800, -40, 1100, R, LIGHT); pen.sketchLine(935, 800, 1480, 1100, R, LIGHT);
  for (const k of [0.35, 0.7]) { // frames on the side walls, receding
    const xl = lerp(505, 60, k), xr = lerp(935, 1380, k), yt = lerp(130, -60, k), yb = lerp(800, 1100, k);
    pen.sketchLine(xl, yt, xl, yb, R, LIGHT); pen.sketchLine(xr, yt, xr, yb, R, LIGHT);
  }
  for (let y = 225; y < 800; y += 96) pen.sketchLine(515, y, 925, y + (R() - 0.5) * 6, R, { ...LIGHT, a: 0.2, boil: 10 });
  // light comes from behind us on the left: the right wall and the ceiling go dark, darkest in the corner
  pen.hatch(pathOf([[935, 130], [1380, -60], [1480, 1100], [935, 800]]), 1200, 480, 700, -1.0, 24, R, { a: 0.3 });
  pen.hatch(pathOf([[935, 130], [1095, 62], [1130, 908], [935, 800]]), 1030, 480, 480, -0.85, 12, R, { a: 0.5, w: 3 });
  pen.hatch(pathOf([[505, 130], [935, 130], [1380, -60], [60, -60]]), 720, 40, 700, 0.35, 22, R, { a: 0.28 });
  pen.hatch(pathOf([[505, 130], [425, 96], [398, 858], [505, 800]]), 450, 480, 420, -1.1, 16, R, { a: 0.3 });
  pen.hatch(pathOf([[505, 800], [935, 800], [990, 830], [450, 830]]), 720, 815, 300, 0.08, 8, R, { a: 0.4 });
}
// the gash sits where the cat's paws reach: in the medium (shot 9, cat s 1.25 on y 1015) and the same spot in the wide (shot 10, cat s 0.5 on y 800)
const TEAR: Pt = [720, 510], TEAR_WIDE_S = 0.5 / 1.25, TEAR_WIDE: Pt = [720, 800 - (1015 - TEAR[1]) * TEAR_WIDE_S];
/** What the claws manage: a ragged gash of side-by-side slashes, too small for a cat. Origin: its middle. Shape is fixed, the line boils. */
function tear(pen: Pen, R: Rand, x: number, y: number, s: number, grow: number) {
  const F = rng(77), K = 7, hw = 185 * s * grow, hh = 150 * s * grow, lean = 0.2;
  const edge = (sg: number): Pt[] => {
    const h = Array.from({ length: K }, (_, i) => { const u = ((i + 0.5) / K) * 2 - 1; return hh * Math.sqrt(1 - 0.8 * u * u) * (0.7 + 0.6 * F()); });
    const pts: Pt[] = [];
    h.forEach((hi, i) => {
      const px = (((i + 0.5) / K) * 2 - 1) * hw;
      if (i > 0) pts.push([px - hw / K + (F() - 0.5) * 0.1 * hw, sg * Math.min(hi, h[i - 1]) * (0.55 + 0.25 * F())]); // the notch between two slashes
      pts.push([px, sg * hi]);
    });
    return pts;
  };
  const at = ([px, py]: Pt): Pt => [x + px - lean * py, y + py];
  const pts = [[-hw, 0] as Pt, ...edge(-1), [hw, 0] as Pt, ...edge(1).reverse()].map(at);
  const path = pathOf(pts);
  pen.erase(path); pen.fill(path, WARM);
  pen.outline(pts, R, { w: 3.6, a: 0.9, passes: 2, jitter: 2 });
  pen.outline(pts.map(([px, py]): Pt => [px + 6, py + 5]), R, { ...LIGHT, a: 0.4 });
}
/** Shreds of paper thrown out from (x, y); one leaves every `gap` seconds from t0. */
function shreds(pen: Pen, R: Rand, x: number, y: number, t: number, o: { n: number; t0: number; gap: number; seed: number; s?: number }) {
  const F = rng(o.seed), s = o.s ?? 1;
  for (let i = 0; i < o.n; i++) {
    const vx = (F() - 0.5) * 900 * s, vy = (-300 - F() * 400) * s, age = t - (o.t0 + i * o.gap);
    if (age <= 0 || age > 0.75) continue;
    const px = x + vx * age, py = y + vy * age + 900 * s * age * age, a = age * 9 + i;
    pen.form([0, 2.2, 4].map((da, k): Pt => [px + Math.cos(a + da) * (26 - 4 * k) * s, py + Math.sin(a + da) * (26 - 4 * k) * s]), R, { tone: 1 });
  }
}
function s08(pen: Pen, t: number, R: Rand) {
  deadEnd(pen, R);
  const skid = easeOut(seg(t, 0, 0.45)), cx = lerp(560, 720, skid) + (t > 0.5 ? (R() - 0.5) * 9 : 0);
  if (t < 0.5) { speedLines(pen, R, cx - 70, 720, 5, 180, 120); for (let i = 0; i < 3; i++) pen.scribble(cx - 60 - R() * 120, 790 - R() * 30, 70, -0.2 + R() * 0.4, 14, R); }
  pen.hatch(ellipsePath(cx + 15, 806, 85, 11), cx + 15, 806, 85, 0.12, 9, R, { a: 0.5 });
  catSit(pen, R, { x: cx, y: 800, s: 0.5, toon: false, mouth: "fish", eyes: "wide", ear: 0.6, look: [Math.floor(t * 2) % 2 ? 0.9 : -0.9, 0.1], sy: t > 0.5 ? 0.94 : 1, tail: Math.sin(t * 16) });
  const close = seg(t, 0.4, 2);
  [-1, 1].forEach((sg, i) => {
    const step = Math.abs(Math.sin(t * TAU * 1.5 + i * 1.5)) * 16, tap = Math.max(0, Math.sin(t * TAU * 2 + i * 2.2));
    man(pen, R, { x: 720 + sg * lerp(540, 430, close), y: 1530 - step, s: lerp(1.45, 1.6, close), flip: sg < 0, back: true, number: sg > 0, sit: true, wrench: true, armR: [0.75, 2.75 - tap * 0.5], armL: [0.3, 0.2], wrenchRot: -0.5 });
  });
}
function s09(pen: Pen, t: number, R: Rand) {
  ruled(pen, R, 170, 900, 120);
  pen.sketchLine(0, 1015, W, 1005, R, { ...LIGHT, boil: 14 });
  const n = Math.min(14, Math.floor(t * 10)), mark: StrokeOpts = { w: 3, a: 0.8, passes: 1 };
  const F = rng(500);
  for (let i = 0; i < 14; i++) {
    const x = 720 + (F() - 0.5) * 380, y = TEAR[1] + 20 + (F() - 0.5) * 300, d = i % 2 ? 1 : -1;
    if (i >= n) continue;
    for (let k = -1; k <= 1; k++) pen.pencil([[x + k * 22 - d * 45, y - 70], [x + k * 22 + d * 12, y + 10], [x + k * 22 + d * 38, y + 75]], R, mark);
    if (t > 0.8 && i < 5) { const lens = ellipsePath(x, y, 9 + 8 * seg(t, 0.8, 1.1), 78, -d * 0.5); pen.erase(lens); pen.fill(lens, WARM); }
  }
  // the slits rip into one another: a ragged gash where the paws were working — a tight fit for a cat (it gets forced a little wider in shot 10)
  const grow = backOut(seg(t, 1.1, 1.6));
  if (grow > 0) tear(pen, R, TEAR[0], TEAR[1], 1, Math.max(0.05, grow));
  shreds(pen, R, TEAR[0], TEAR[1] + 40, t, { n: 10, t0: 0.7, gap: 0.09, seed: 501 });
  const frantic = t < 1.65, ph = t * TAU * 3, crouch = easeOut(seg(t, 1.65, 1.85)); // done clawing: it gathers itself for the jump, and the gash shows over its head
  pen.hatch(ellipsePath(760, 1022, 210, 22), 760, 1022, 210, 0.12, 10, R, { a: 0.5 });
  catBack(pen, R, { x: 720, y: 1015, s: 1.25, sy: 1 - 0.28 * crouch, toon: false, armL: frantic ? 0.55 + 0.45 * Math.sin(ph) : 0.15, armR: frantic ? 0.55 - 0.45 * Math.sin(ph) : 0.15, tail: Math.sin(t * 17), ear: frantic ? 0.4 : -0.2, headDx: frantic ? Math.sin(ph) * 8 : 0 });
  if (frantic) for (const sg of [-1, 1]) for (let i = 0; i < 2; i++) pen.scribble(720 + sg * (150 + R() * 60), 560 + R() * 160, 80, -1.4 + R() * 0.4, 16, R);
}
function s10(pen: Pen, t: number, R: Rand) {
  deadEnd(pen, R);
  // the gash is a tight fit — squeezing through forces it a little wider, but it stays a ragged gash
  const dive = seg(t, 0, 0.42), punch = backOut(seg(t, 0.42, 0.67)), [tx, ty] = TEAR_WIDE;
  tear(pen, R, tx, ty, TEAR_WIDE_S, 1 + 0.25 * punch);
  shreds(pen, R, tx, ty, t, { n: 8, t0: 0.42, gap: 0.02, seed: 502, s: 0.6 });
  if (dive < 1) {
    const e = easeInOut(dive), x = lerp(520, tx, e), y = lerp(640, ty + 10, e) - Math.sin(Math.PI * dive) * 110, s = lerp(0.5, 0.32, e); // still about as big as the gash when it gets there
    const draw = () => catSide(pen, R, { x, y, s, toon: false, rot: lerp(-0.7, 0.3, e), lean: 1.2, legs: [-1.0, -1.3], arms: [1.3, 1.6], stretch: 1.25, mouth: "fish", eyes: "wide", tail: 1 });
    speedLines(pen, R, x - 60 * s * 2, y, 4, 140, 80);
    // last drawing of the dive: head and shoulders are already through — only what is still this side of the gash gets drawn
    if (dive > 0.9) pen.clip((c) => { c.beginPath(); c.rect(-50, -50, tx + 15 + 50, H + 100); }, draw);
    else draw();
  } else if (t < 0.7) burst(pen, R, tx, ty, 30, 90, 8, 0, TAU, { a: 0.5 });

  const swing = easeIn(seg(t, 0.2, 0.5));
  [-1, 1].forEach((sg, i) => {
    const d = i * 0.08, run = easeIn(seg(t, 0.62 + d, 1.15 + d)), hit = seg(t, 1.15 + d, 1.4 + d), wx = 720 + sg * 128;
    const x = lerp(720 + sg * 470, wx, run), y = lerp(1540, 800, run), s = lerp(1.5, 0.6, run), ph = t * TAU * 2.5 + i;
    if (hit <= 0) {
      const a = run > 0 ? Math.sin(ph) : 0;
      man(pen, R, {
        x, y: y - Math.abs(a) * 14, s, flip: sg < 0, back: true, number: sg > 0, sit: run <= 0, wrench: true, legs: [a * 0.5 + 0.1, -a * 0.5 - 0.1],
        armR: i === 0 ? [lerp(1.3, 0.5, swing), lerp(3.0, 0.9, swing)] : [0.8, 2.7], armL: [0.3, 0.2], wrenchRot: i === 0 ? swing * 0.7 : -0.4,
      });
    } else if (hit < 1) {
      burst(pen, R, wx, 560, 120, 230, 9, Math.PI, TAU, { a: 0.6 });
      man(pen, R, { x: wx, y: 800, s: 0.6, sx: lerp(1, 1.3, hit), sy: lerp(1, 0.42, easeOut(hit)), flip: sg < 0, back: true, number: sg > 0, armR: [1.9, 2.6], armL: [1.9, 2.6] });
      for (let k = 0; k < 3; k++) pen.scribble(wx - 90, 800 - (60 + k * 60) * (1 - 0.5 * hit), 180, 0, 18, R, { w: 2.4, a: 0.6 });
    } else {
      const settle = backOut(seg(t, 1.4 + d, 1.7 + d));
      pen.hatch(ellipsePath(wx + 12, 806, 95, 12), wx + 12, 806, 95, 0.12, 9, R, { a: 0.5 });
      paperBall(pen, R, { x: wx, y: 800 - 58 - 30 * (1 - settle), r: 74, seed: 40 + i });
      const hx = wx + sg * lerp(40, 150, settle);
      pen.form(ellipsePts(hx, 800, 40, 36, sg * 0.4, Math.PI, TAU, 14), R, { tone: 3 }); // helmet, rolled off
    }
  });
  if (swing > 0.15 && t < 0.62) pen.pencil(ellipsePts(560, 700, 300, 330, 0, -1.9, -0.2, 16), R, { w: 2.6, a: 0.55, passes: 2 });
}

// ---------------------------------------------------------------- 11 · back out (20–22)
function s11(pen: Pen, t: number, R: Rand) {
  kitchen(pen, R);
  const B = { x: 520, y: 900, s: 1 };
  bowlMat(pen, R, B);
  const { surf } = bowl(pen, R, { ...B, surface: "graphite", ripple: t * 2.5 });
  if (t < 0.15) { styledPencil(pen, () => burst(pen, R, surf.cx, surf.cy, 30, 80 + t * 600, 7, Math.PI * 1.15, Math.PI * 1.85)); return; }
  if (t < 0.6) styledPencil(pen, () => burst(pen, R, surf.cx, surf.cy - 10, 90, 260, 9, Math.PI * 1.05, Math.PI * 1.95, { a: 0.7 }));
  const u1 = seg(t, 0.15, 0.95), u2 = seg(t, 0.95, 1.4), u3 = easeOut(seg(t, 1.4, 1.75));
  let x: number, y: number, rot: number, sy = 1;
  if (u1 < 1) { x = lerp(520, 1000, u1); y = lerp(840, 905, u1) - 4 * u1 * (1 - u1) * 540; rot = u1 * TAU * 2; sy = 1.1; }
  else if (u2 < 1) { x = lerp(1000, 1180, u2); y = 905 - 4 * u2 * (1 - u2) * 160; rot = u2 * TAU; }
  else { x = lerp(1180, 1245, u3); y = 905; rot = 0; sy = lerp(0.72, 1, backOut(seg(t, 1.4, 1.8))); }
  const pencilCat = u1 < 1;
  if (!pencilCat && t < 1.2) styledPencil(pen, () => { burst(pen, R, 1000, 900, 60, 190, 12, Math.PI, TAU, { a: 0.6 }); for (let i = 0; i < 3; i++) pen.scribble(900 + R() * 200, 780 + R() * 100, 80, R() * 3, 16, R, { a: 0.5 }); });
  if (u2 >= 1 && t < 1.75) for (let i = 0; i < 4; i++) pen.sketchLine(x - 120 - R() * 40, 830 + i * 22, x - 250 - R() * 80, 830 + i * 22, R, { w: 2, a: 0.7, passes: 1, over: 0 });
  const draw = () => catSit(pen, R, { x, y, s: 0.85, sy, rot, toon: !pencilCat, mouth: "fish", eyes: u2 >= 1 && t > 1.8 ? "normal" : "wide", look: u2 >= 1 ? [Math.sin(t * 14) * 0.8, Math.cos(t * 14) * 0.8] : [0, 0], tail: Math.sin(t * 9), ear: 0.3 });
  if (u1 < 0.22) pen.clip(pathOf([[-50, -400], [W + 50, -400], [W + 50, surf.cy], [-50, surf.cy]]), draw); else draw();
}

// ---------------------------------------------------------------- 12 · it eats it anyway (22–25)
function s12a(pen: Pen, t: number, R: Rand) {
  kitchen(pen, R, { horizon: 760, zoom: 1.5, ox: -40 }); bowlMat(pen, R, { x: 215, y: 900, s: 1.15 });
  bowl(pen, R, { x: 215, y: 900, s: 1.15, surface: "graphite", ripple: t * 0.7 });
  const eat = seg(t, 1.2, 1.55), gulp = t >= 1.55, s = 1.45, x = 730, y = 1010;
  const sy = lerp(0.7, 1, backOut(seg(t, 0, 0.4))) * (gulp && t < 1.75 ? 0.95 : 1);
  const headRot = -0.28 * Math.sin(Math.PI * eat), eating = eat > 0 && !gulp;
  catSit(pen, R, {
    x, y, s, sy, toon: true, tail: Math.sin(t * 3), headRot, headS: gulp && t < 1.75 ? 1.07 : 1,
    mouth: eating ? "open" : t < 1.2 ? "fish" : "closed", open: 1,
    eyes: t < 0.3 || gulp ? "shut" : "normal", look: t < 0.85 ? [0, 0.95] : [0, 0.05],
  });
  if (eating) { // the fish tips up and slides in
    const hy = y + (-292 + 48) * s * sy;
    pen.clip(pathOf([[0, 0], [W, 0], [W, hy + 6], [0, hy + 6]]), () => fish(pen, R, { x: x + 6 - 60 * Math.sin(headRot), y: hy - lerp(10, 150, Math.sin(Math.PI * Math.min(eat * 1.4, 1)) * 0.6 + 0.0) + eat * 190, s: 0.85 * s, rot: lerp(0.08, -Math.PI / 2, easeOut(seg(eat, 0, 0.4))) }));
  }
}
function s12b(pen: Pen, t: number, R: Rand) {
  kitchen(pen, R, { horizon: 170 }); bowlMat(pen, R, BOWL_CU);
  const hits = [0, 0.5].map((off) => ((t * 3 + off) % 1) < 0.34);
  const shake = hits[0] || hits[1] ? (R() - 0.5) * 10 : 0;
  const { inner, surf } = bowl(pen, R, { ...BOWL_CU, x: BOWL_CU.x + shake, surface: "graphite", ripple: t * 3 });
  // the two racers, crammed shoulder to shoulder under the surface, glaring up and pounding on it from below
  const cy = (surf.cy - surf.ry + inner.cy + inner.ry) / 2; // middle of the part of the pool we can see
  pen.clip(ellipsePath(inner.cx, inner.cy, inner.rx, inner.ry), () => pen.clip(ellipsePath(surf.cx, surf.cy, surf.rx, surf.ry), () => styledPencil(pen, () => {
    [-1, 1].forEach((sg, i) => man(pen, R, { x: surf.cx + sg * 205, y: cy + 520 + (hits[i] ? -8 : 0), s: 0.82, flip: sg > 0, number: sg > 0, sit: true, turn: 0.35, lean: 0.12, yell: hits[i], armR: [0.1, 0.1], armL: [0.1, 0.1] }));
    [-1, 1].forEach((sg, i) => {
      const fx = surf.cx + sg * 50, fy = cy + (hits[i] ? -6 : 42);
      if (hits[i]) burst(pen, R, fx, fy - 10, 95, 180, 10, 0, TAU, { a: 0.7 });
      fist(pen, R, { x: fx, y: fy, s: hits[i] ? 1.1 : 0.85, rot: sg * 0.16 });
    });
  })));
  hits.forEach((h, i) => { if (h) styledPencil(pen, () => burst(pen, R, surf.cx + (i ? 50 : -50), inner.cy - inner.ry * 0.2, 150, 240, 5, Math.PI * 1.2, Math.PI * 1.8, { a: 0.5 })); });
}

export const shots: Shot[] = [
  { start: 0, end: 2, world: "toon", draw: s01 },
  { start: 2, end: 4, world: "toon", draw: s02 },
  { start: 4, end: 5, world: "toon", draw: s03 },
  { start: 5, end: 8, world: "pencil", draw: s04 },
  { start: 8, end: 8.5, world: "pencil", draw: s05a },
  { start: 8.5, end: 10, world: "pencil", draw: s05b },
  { start: 10, end: 11, world: "pencil", draw: s06 },
  { start: 11, end: 12.5, world: "pencil", draw: s07 },
  { start: 12.5, end: 14, world: "pencil", draw: s07b },
  { start: 14, end: 16, world: "pencil", draw: s08 },
  { start: 16, end: 18, world: "pencil", draw: s09 },
  { start: 18, end: 20, world: "pencil", draw: s10 },
  { start: 20, end: 22, world: "toon", draw: s11 },
  { start: 22, end: 24, world: "toon", draw: s12a },
  { start: 24, end: 25, world: "toon", draw: s12b },
];
