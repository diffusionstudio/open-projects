# Prompt

The prompt this project was built from.

```text
Create a 15-second 16:9 motion graphics video, 30fps.

3D MODEL
Build or use a real 3D model for both the Leica M6 body and the 50mm prime lens, and render the whole video from that geometry. Do not draw or redraw the subject per frame. Proportions and key features must be accurate: top plate with shutter speed dial, advance lever and rewind crank, viewfinder and rangefinder windows, frameline lever, M bayonet mount, lens release button. The lens is modeled as a true assembly of separate, nested parts that can physically come apart: hood, filter ring, front retaining ring, front element group, aperture ring, iris with individual blades, focusing helicoid, rear element group, bayonet mount ring. All line art comes from the geometry itself (silhouette, crease and intersection edges with hidden-line removal), so perspective, occlusion and parallax are always correct and lines stay perfectly stable from frame to frame with no wobble, boiling or morphing.

STYLE
Minimalist technical line art in blueprint blue on white: fine cobalt-blue lines on a pure white background. Single isolated subject, clean contours, selective structural detail, lots of negative space. No fills, no gradients, no dimension lines, callouts or diagram panels on the drawing itself, no dense crosshatching. Shading minimal: only sparse lines to suggest form (knurling on the focus ring, a few concentric rings in the lens, vulcanite texture hinted with a handful of strokes). Line weight constant and hairline-thin at every zoom level. When the lens is apart: no screws, springs, shims or ball bearings, no leader lines, labels or part numbers. All typography is a separate flat 2D layer in the same cobalt blue.

TYPOGRAPHY
One bold monospace typeface throughout (JetBrains Mono Bold or similar).
- Title: "> LEICA M6", all caps, large, anchored bottom-left with a wide margin. Once it appears it never moves or changes.
- Info blocks: styled as code comments. Small header line, then numbered lines "01"–"04" in a lighter tint, each line starting with "//". Text types on character by character (~30 chars/sec) with a solid block cursor at the end of the current line. Left-aligned, small, generous line spacing.

Card 1:
// m6.system
01 // Leica M6 is a 35mm rangefinder camera.
02 // Introduced in 1984, built by hand in Germany.
03 // Fully mechanical. The battery only powers
04 // the light meter.

Card 2:
// m6.optics
01 // Leica M bayonet mount.
02 // This model: 50mm f/1.4 prime lens.
03 // 0.72x viewfinder, framelines from 28 to 135mm.
04 // Focus by aligning the rangefinder patch.

Card 3:
// m6.shutter
01 // Horizontal cloth focal-plane shutter.
02 // Speeds from 1s to 1/1000s, plus Bulb.
03 // TTL metering, two red LED arrows in the finder.
04 // Reissued in 2022, still in production.

MOTION
0.0–8.5s  COLD OPEN, no text. A single unbroken shot: one continuous, slow, eased push-in from a wide view of the whole camera, small and off-center in a mostly empty white frame, all the way into the lens and out through it into pure white. The disassembly is driven by the camera's progress, as if the approaching viewpoint is what takes the lens apart. As we close in, the lens twists out of its bayonet and leaves the body, and the nearer we get the further it opens up, its parts unthreading and separating along the optical axis, front to back, in one fluid overlapping motion. There are no stages, no pauses, no settled "exploded view" pose and no moment where the move stops to show something. The camera travel and the disassembly start together, progress together and finish together: by the time the viewpoint is on the optical axis, the parts have spread far enough that it glides through them, rings and glass passing the frame edges, the iris opening ahead, and exits through the aperture into white. Framing, angle, path and the choreography of the parts are yours to design. Make it feel like one elegant mechanical gesture.

8.5–9.3s  WHIP IN. Fast vertical whip with strong directional motion blur. Elements land with a slight overshoot: title "> LEICA M6" bottom-left; a flat front elevation of the fully assembled camera standing at left, tall enough to overlap and occlude part of the title; a flat top-down plan view (top plate, dials, lens barrel) bottom-right.

9.3–11.3s  CARD 1 types on at upper-right. Drawings hold almost still, only a 1–2% slow drift.

11.3–11.8s  Both drawings slide out vertically in opposite directions with motion blur; title stays.

11.8–13.5s  CARD 2. A 3/4 perspective view of the camera sits top-center, rotating slowly (~10° over the shot). Bottom, right of the title: a small side elevation of the lens alone, assembled. The focus ring turns slowly back and forth and the barrel extends and retracts with it. Card 2 types on below the top view, left of center.

13.5–14.0s  BEAT. Everything except the title cuts away. Title alone on white.

14.0–14.5s  WHIP IN. The camera sweeps in from the bottom-left corner, huge and motion-blurred, and settles as a large diagonal 3/4 view crossing the whole frame, lens toward upper-right, passing in front of the title and the text area so it occludes parts of both.

14.5–15.0s  CARD 3 types on at center-right, partly hidden behind the drawing. Camera continues a very slow rotation. Hold on the final frame, cursor blinking.

RULES
Easing: slow ease-in-out on all drifts, snappy ease-out with motion blur on all whips. Never more than one text block on screen. Text must be pixel-sharp and spelled exactly as written. Background stays pure white (#FFFFFF), lines and text cobalt (#1F4FD8). No camera shake, no grain, no glow, no music-video flashes.
```
