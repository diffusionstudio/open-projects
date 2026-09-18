# The engine

[`template/engine.ts`](../template/engine.ts) is the whole renderer: seeded RNG, three layers (graphite, toon marker line, flat colour), the pencil stroke, the solid-form recipe, and the compositor (paper → colour → grain → toon line → graphite multiplied on top with tooth, gate weave, blur, vignette). It is identical in every film. Read it once; it is 340 lines.

## How a frame is made

`index.tsx` derives `drawing = floor(time × 12)` and calls `engine.render(canvas, drawing, drawing / 12, k, style, shots)`. The engine reseeds `R = rng(drawing)`, clears the layers, finds the shot containing `t`, sets `pen.toon = shot.world === "toon"`, and calls `shot.draw(pen, t - shot.start, R)`. All coordinates are 1440×1080 composition pixels at any export resolution.

```ts
export const DURATION = 20;
export const shots: Shot[] = [
  { start: 0, end: 2, world: "toon", draw: s01 },
  { start: 2, end: 4.5, world: "pencil", draw: s02 },
];
function s01(pen: Pen, t: number, R: Rand) { /* draw back to front */ }
```

## The pen

Every call takes the `R` you were handed; never `Math.random()`. In a toon shot the same calls produce a clean marker line instead of graphite.

| Call | Draws |
| --- | --- |
| `pencil(pts, R, o?)` | One open stroke through `pts`. |
| `outline(pts, R, o?)` | A closed curve: random start, overlaps its own beginning. |
| `sketchLine(x0, y0, x1, y1, R, o?)` | A hand-ruled line: overshoot, bow, endpoints that boil by `o.boil` px (default 5; 14–22 for backgrounds). |
| `hatch(clip, cx, cy, radius, angle, spacing, R, o?)` | One continuous zigzag clipped to `clip`. Always graphite. |
| `scribble(x, y, len, angle, amp, R, o?)` | A loose zigzag — background energy. |
| `blot(x, y, r, R, ry?, rot?)` | A solid dark spot from a tight spiral (eyes, buttons). |
| `form(pts, R, { fill, tone, line, accent, rim, sketchy })` | **The workhorse.** A solid form: erase what is behind → fill (`fill` in toon, paper in pencil) → hatched shadow toward the lower right (pencil only) → contour → shadow-side accent. `tone`: 0 bare, 1 light, 2 core + cross-hatch, 3 dark cloth. `rim < 1` narrows the shadow to a rim. `sketchy` finds the contour in several broken, overshooting goes — the rotoscope feel, for humans. |
| `erase(path)` / `fill(path, color)` | Rub out lines / lay flat colour. `fill` works in both worlds — it is how light leaks into the pencil world. |
| `clip(path, draw)` | Clip all layers while `draw` runs (things behind a rim, inside a hole, under a surface). |
| `push(x, y, rot?, sx?, sy?)` / `pop()` | Transform all layers. Stroke width and jitter compensate for scale, so a rig drawn at `s: 3` still looks pencil-drawn. |

`StrokeOpts` is `{ w, a, passes, jitter, taper, boil, over, color }`. Helpers: `lerp`, `clamp`, `seg(t, a, b)` (progress of `t` through a window — the basis of all acting), `easeIn`, `easeOut`, `easeInOut`, `backOut` (overshoot and settle), `ellipsePts`, `smooth` (Catmull-Rom through key points, the way to draw organic outlines), `sausage` (a limb from a centreline), `pathOf`, `ellipsePath`, `bbox`, `rng(seed)`.

## Building a cast

Put characters, props, and sets in `cast.ts`; keep `shots.ts` to staging and acting. See [`example/fish-heist/cast.ts`](../example/fish-heist/cast.ts).

- A character is a function `(pen, R, { x, y, s, toon?, ...pose })` that `push`es to its origin (the ground under it), draws a handful of `pen.form`s back to front, adds a few detail strokes, and `pop`s. Pose parameters are plain numbers the shot animates: `headRot`, `look`, `tail`, `pawR`, `mouth`, `sy` (squash; derive `sx = 1/√sy`).
- Build outlines from `smooth([...keyPoints], true)`, ellipses, and `sausage` limbs. Give each form a `fill` (used in toon) and a `tone` (used in pencil) so one rig serves both worlds.
- A `toon?: boolean` option that temporarily overrides `pen.toon` lets a rig be drawn in the *other* world's style — that is every crossover.
- Offer a `part` option (`"body" | "head" | "paws"`) when something must pass between parts of a character (a bowl rim in front of the body, behind the paw).
- Line weights per world: toon contour `{ w: 5, a: 1, passes: 1 }`, pencil contour `{ w: 3.8, a: 0.85, passes: 2 }`. Shared constants: `LIGHT = { w: 1.7, a: 0.32, passes: 1 }` for backgrounds, `STRUCT = { w: 2.6, a: 0.6, passes: 1 }` for structure.
- Dark masses (jackets, hair): `tone: 3` plus a few broad overlapping zigzags — see `mass` and `charcoal` in the example.
- Sets are functions too (`kitchen(pen, R, { horizon, zoom })`), so every shot can reframe them.

## Acting in a shot

```ts
function s05(pen: Pen, t: number, R: Rand) {
  const crouch = easeInOut(seg(t, 0.2, 0.6)), leap = easeOut(seg(t, 0.7, 1.1)), land = backOut(seg(t, 1.1, 1.4));
  // anticipation → stretch along an arc → squash and settle; then energy marks: speedLines, burst, scribbles
}
```

Shot-local helpers worth copying from the example's `shots.ts`: `burst` (impact lines), `speedLines`, `panel` (comic frames), `ruled` (notebook lines whipping past), `focusLines`, `scribbles`, `tear` (the gash of warm light), `shreds`.
