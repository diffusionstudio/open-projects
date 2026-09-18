# launch-video

The Diffusion Studio launch video, written as code. The whole cut is a Solid
JSX composition — [main.jsx](main.jsx) is the entry, the scenes live in
[src/](src), and the footage and images it loads ship in [assets/](assets),
the project's asset library. [design/](design) holds the vector exports the
scenes were drawn from — their paths are inlined in the source, so nothing
loads them.

## Prerequisites

- [Diffusion Studio](https://www.diffusion.studio/) installed, with its MCP
  server set up if you want an agent to drive the editor.
- Node.js, to install the one userland package the composition imports
  ([anime.js](https://animejs.com)).

## Load the composition

1. Install the dependencies, once after cloning. The app bundles userland
   packages from the project's own `node_modules`; nothing is fetched for you:

   ```sh
   npm install
   ```

2. Point the composition at your clone, once after cloning:

   ```sh
   ./setup.sh
   ```

   Footage and the poster frame are named by library path and need nothing,
   but an `<img>` inside HTML content only loads from an absolute path. This
   stamps the clone's path into the gitignored `src/repo.js`, which the
   watching shot's covers and the closing logo wall are resolved against.

3. Open this folder as a project — from the app (**Open folder**), by asking
   your agent to open it, or from a shell:

   ```sh
   dapi open .
   ```

   The folder is the project: [package.json](package.json) names `main.jsx` as
   the entry, the app compiles it and mounts the `main` scene onto the stage.
   Saving any source file recompiles and re-renders the canvas, so iterate by
   editing and saving.

## Have a look around

- `dapi capture main -t 3 12 20 30` — render any frame to a PNG without
  exporting.
- `dapi check main` — structural checks on the scene.
- Export the finished video from the app when you're happy with it.
