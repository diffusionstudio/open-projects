# launch-video

The Diffusion Studio launch video, written as code. The whole cut is a Solid
JSX composition — [main.jsx](main.jsx) is the entry, the scenes live in
[src/](src), and all footage and artwork ship in [assets/](assets).

## Prerequisites

- macOS with [Diffusion Studio](https://github.com/diffusionstudio/editor)
  installed:

  ```sh
  brew install --cask diffusionstudio/tap/editor
  ```

  The cask links the `dapi` CLI automatically. If you installed the app from
  the `.dmg` instead, link the CLI via **Diffusion Studio → Install dapi
  Command Line Tool**.

## Load the composition

1. Point the composition at your clone (media sources are resolved against
   the OS, so asset paths must be absolute). Run once after cloning:

   ```sh
   ./setup.sh
   ```

   This stamps the clone's absolute path into the gitignored `src/repo.js`,
   which the composition imports to locate [assets/](assets).

2. Launch the app and create a fresh project:

   ```sh
   dapi open
   ```

   ```sh
   dapi project create launch-video
   ```

3. Mount the composition from the repo root:

   ```sh
   dapi mount main.jsx
   ```

   This compiles the module and mounts the `main` scene into the canvas.
   Re-running the mount after editing the source reconciles the scene in
   place rather than duplicating it, so iterate by editing and mounting again.

## Have a look around

- `dapi node tree` — inspect the mounted node hierarchy.
- `dapi node capture` — render any frame to a PNG without exporting.
- Export the finished video from the app when you're happy with it.
