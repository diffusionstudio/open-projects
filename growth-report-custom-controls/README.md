# growth-report-custom-controls

An e-commerce growth report driven end to end by the editor's custom controls,
the `@inspect` annotations from
[Custom controls for your compositions](https://github.com/diffusionstudio/editor).
Nothing in the two scenes is edited by hand: the brand, the market, the
language, the imagery, the layout and the timing are all constants at the top
of [index.tsx](index.tsx), and every one of them shows up as a control in the
right sidebar. Changing a control updates the canvas live and writes the value
back into the source.

The first scene is the report: a title, a description whose percentages are
found by a regular expression and highlighted, a product gallery that lays
itself out from a count and a layout, and a bar chart. The second scene is a
dotted world map that lights up the selected region and states its growth.
Both scenes read the same constants, so one dropdown moves both.

| Section | Control | What it drives |
|---|---|---|
| Brand | Primary | Highlights, the latest bar, the lit region, the callout |
| Brand | Theme | Background, text, muted and bar colors; four palettes |
| Brand | Font | Every text node, through one `typography(size)` helper |
| Metrics | Region | Growth, direct-order share, return rate, five yearly values, the lit map region |
| Localization | Language | Title, description, region names and labels in English, Spanish and French |
| Scene Layout | Show | Gallery and chart, gallery only, or chart only; the visible part fills the width |
| Imagery | Collection | Which product shots the gallery draws from |
| Gallery Component | Layout, Count, Duration, Stagger | Grid or row, how many images, how long each takes, and whether they reveal in a wave |
| Highlight Words | Regex | The pattern that decides which words are highlighted |

The copy adapts to the numbers: a negative region reads "fell" instead of
"grew", and each language has its own paragraph width so every description
holds two balanced lines. The gallery fits itself to a fixed box, picking the
column count that gives the largest cells for the chosen number of images.

## Load the composition

1. Install the dev dependencies (types only), once after cloning:

   ```sh
   npm install
   ```

2. Open this folder as a project — from [Diffusion Studio](https://www.diffusion.studio/)
   (**Open folder**), by asking your agent to open it, or from a shell:

   ```sh
   dapi open .
   ```

Saving any source file recompiles and re-renders the canvas. The text uses
Inter, which the app registers by default.

## Have a look around

- Change **Region** to Asia-Pacific with the map scene selected: the map wipes
  to a new region, the description rewrites itself, and the chart in the
  report scene turns into a decline.
- `dapi capture report -t 1 2 4` and `dapi capture map -t 1 2 4` — render
  frames of either scene to PNGs without exporting. The reveal runs over the
  first two seconds at the default Duration.
- `dapi check report` and `dapi check map` — structural checks on each scene.
- `npm run typecheck` — types are stripped at compile time and never checked
  by the app.

The brand, SKUs and figures are fictional. The product shots in
[assets/Product Shots](assets/Product%20Shots) were generated with an image
model for this demo and ship with the project, so nothing is generated on
open. The map dots in [data/world-dots.ts](data/world-dots.ts) are sampled
from Natural Earth 1:110m land polygons, which are in the public domain.
