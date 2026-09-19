# leica-m6-blueprint

A 15-second blueprint-style technical animation of a Leica M6 and its 50mm
lens, with the prompt it was built from: [PROMPT.md](PROMPT.md) is the prompt,
[BRIEF.md](BRIEF.md) the agent's production brief, and
[index.tsx](index.tsx) the composition.

Nothing in it is drawn or generated as an image. [model.ts](model.ts) builds
the camera body and a nested, separable lens assembly as real
[three.js](https://threejs.org) meshes, and every stroke is derived from that
geometry: a topology pass keeps the crease edges and the camera-dependent
silhouette edges, and white depth-writing surfaces remove the hidden lines. A
`<surface>` renders it from the playhead, so perspective, occlusion and
parallax stay correct while the lens twists out of its bayonet and comes apart
around the approaching viewpoint. The title and the typed code-comment cards
are native text on top. The soundtrack is a declared generation
(`generate.audio`); its file ships in [assets/](assets), so nothing is
regenerated on open.

## Load the composition

1. Install the dependencies (`three`), once after cloning:

   ```sh
   npm install
   ```

2. Open this folder as a project — from [Diffusion Studio](https://www.diffusion.studio/)
   (**Open folder**), by asking your agent to open it, or from a shell:

   ```sh
   dapi open .
   ```

Saving any source file recompiles and re-renders the canvas. The text uses
JetBrains Mono Bold; install it locally if it is not among `dapi fonts`.

## Have a look around

- `dapi capture leica-m6 -t 2 5 8 10 12.5 14.9` — render any frame to a PNG
  without exporting.
- `dapi check leica-m6` — structural checks on the scene.
- The `@inspect` constants at the top of [index.tsx](index.tsx) (color, font,
  title, type sizes) are editable from the app's inspector.
- `npm run typecheck` — types are stripped at compile time and never checked
  by the app.
- `npm run model` — rebuilds [assets/models/leica-m6-50mm.glb](assets/models),
  the same model as a standalone file (145 meshes, ~41k triangles, named lens
  subassemblies and nine iris leaves). The composition does not load it; it
  builds the meshes from `model.ts` directly.

The model is a stylized visualization based on published external dimensions,
not a manufacturing CAD replica. Sources are listed in [BRIEF.md](BRIEF.md).
