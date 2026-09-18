# The look

The reference is the rotoscoped pencil animation of the 1985 video: soft graphite on cool pale paper, loose searching contours, dense charcoal masses for hair and dark cloth, backgrounds that are a handful of ruled lines and zigzag scribbles, everything trembling from drawing to drawing. Match the *drawing style*, never the content. The engine's defaults already produce it; these rules keep your drawing code from undoing it.

## Sketch world (pencil)

**Paper and graphite**
- Paper `#dddce9` (cool lavender off-white). Graphite `#16161f` (blue-black), multiplied onto the paper.
- The engine bites paper tooth out of the graphite at a new offset every drawing, softens it by 0.7 px, weaves the layer ±2.5 px, and vignettes the corners. Nothing else — no scratches, sepia, or film border.

**The stroke is the only primitive.** Resampled to ~9 px segments, pressure curve `sin(πt)^0.45` so strokes taper in and out, 1–2 offset passes, per-point jitter. Weights (`w` / `a`):

| Mark | w / a |
| --- | --- |
| subject contour (2 passes) | 3.4 / 0.85 |
| shadow-side contour accent | 4.2 / 0.8 |
| structural lines | 2.6 / 0.6 |
| hatching (no taper) | 2.6–3.2 / 0.5–0.75 |
| background and construction lines | 1.7 / 0.32 |
| interior detail | 1.6 / 0.35 |

"Ruled" lines are drawn by hand: endpoints overshoot 2–6 %, bow up to 1.5 % of their length, never meet cleanly at corners. Closed curves overlap their own start by ~5 %.

**Tone is made of strokes — never fills.** No gradients, grey washes, or colour. Three tones: bare paper, sparse hatching (13 px), dense hatching (7 px) plus cross-hatching (9 px). Main hatch about −45°, cross-hatch about +45°, both tilting a few degrees per drawing. Large darks (hair, jackets, deep shadow) are very dense multi-pass hatching, still visibly strokes.

**One key light from the upper left.** Every solid form: contour → heavier accent on the lower-right contour → hatched shadow shape → hatched cast shadow. Forms occlude: erase the silhouette before drawing it, draw back to front (`pen.form` does all of this).

**Subject vs. background.** The subject carries the detail and the darkest darks. The background is a suggestion: at most ~15 light lines (a floor line, a door frame, a panel, perspective lines), 2–4 zigzag scribbles, one strip of loose hatching. Leave at least 60 % of the paper empty. When unsure, remove a line.

## Colour world (toon)

- Flat colour fills, one bold near-black marker line (`w` ≈ 3–5, alpha 1, single pass), slight wobble. Steady: boil is about a third of the pencil world's.
- No hatching, no gradients, no grain on the line. Shadows, if any, are a flat darker shape.
- A limited, warm palette (6–8 colours). Sets can be richer than in the pencil world, but the character still owns the strongest contrast.
- Set `world: "toon"` on the shot; the same rigs draw themselves in marker and fill.

## Crossovers

- **Pencil inside colour:** fill a patch with `pen.paper`, switch `pen.toon = false`, draw clipped to the patch, switch back. Reflections, hands reaching out, the souvenir, the final gag.
- **Colour inside pencil:** one warm light (`#fff1bf`) filled into a torn hole. Nothing else is ever coloured there.
- A character changes style exactly when it crosses, never gradually.

## Hand-drawn timing

- **On twos:** 12 drawings per second, each held for two frames of the 24 fps export. Motion also steps on twos.
- **Boil:** the RNG is reseeded per drawing, so every drawing is a fresh attempt at the same picture. Subject contours wander 3–5 px, structural lines 8 px, background lines 14–22 px, background scribbles land somewhere new each drawing, hatch spacing and tilt change. If the subject shimmers more than the background, it is wrong.
- Random choices that must *not* boil (a crumple pattern, scattered debris) come from a fixed `rng(seed)`, not the per-drawing `R`.
- Holds keep boiling — a held pose is redrawn, never frozen.

## Motion and film language

- Shots of 1–3 s, hard cuts only. No fades, wipes, or tweened camera moves. A "tracking shot" is a background that scrolls in steps behind a running cycle.
- Motion is posed and eased by hand: anticipation before a move, overshoot and settle after it, squash on contact, stretch at speed, arcs rather than straight paths. Preserve volume when squashing (`sx = 1/√sy`). Nothing moves at constant speed.
- Energy is drawn, not blurred: speed lines behind a fast object, radial bursts on impact, scribbles erupting in the background during action, heavier hatching as tension rises, emptier paper as it calms.
- End on a held, readable final image for at least 1 s.

## Acceptance checklist

- [ ] A pencil still could pass for a photographed drawing: grainy strokes, tapered ends, varied weight, visible paper.
- [ ] No fills, gradients, or colour in the pencil world beyond the leaking light; no hatching or grain on the toon line.
- [ ] Line-weight hierarchy is obvious: subject dark and bold, background faint.
- [ ] Shadows are hatched, lit from the upper left, with a cast shadow grounding each object.
- [ ] Frames come in identical pairs; consecutive drawings differ, background more than subject.
- [ ] At least 60 % of the paper is empty in every pencil shot.
- [ ] Every shot has a clear silhouette and one idea. The film has a want, a crossing, a reversal, a way back, and a held final image with something pencil in the colour world.
- [ ] Motion has anticipation, squash/stretch, and settle.
- [ ] The picture is a pure function of the drawing index; scrubbing back gives the identical drawing.
- [ ] `check` reports no issues; `package.json` exports at 24 fps.
- [ ] The story reads without any text.

## Common failures

- Uniform-width vector lines, or a "sketch" filter over clean shapes.
- Grey fills or soft gradients standing in for shading.
- Smooth tweening; a static background behind a moving subject; boil as a global wobble instead of redrawing.
- Backgrounds with as much weight as the subject; too much jitter on the subject.
- Explaining the story with labels, arrows, or captions.
- One long scene with a drifting camera instead of cuts.
- Driving the drawing from `frame()` (30 fps → uneven holds) or `requestAnimationFrame` (blank in exports); reading `useResolution()` outside the draw effect (soft export); exporting at the default 30 fps.
