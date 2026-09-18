# raise-announcement

A funding-announcement motion graphic, with the design brief it was built
from: [design.md](design.md) is the brief, [references/](references) the
source material, and [motion/](motion) the composition —
[motion/intro.jsx](motion/intro.jsx) is the entry. The words are HTML driven
by paused [GSAP](https://gsap.com) timelines seeked from the playhead; the
gradient band is a WebGPU shader on a `<surface>`.

## Load the composition

1. Install the dependencies (`gsap`, `animejs`), once after cloning:

   ```sh
   npm install
   ```

2. Open this folder as a project — from [Diffusion Studio](https://www.diffusion.studio/)
   (**Open folder**), by asking your agent to open it, or from a shell:

   ```sh
   dapi open .
   ```

Saving any source file recompiles and re-renders the canvas.
