import { createEffect, createMemo } from "solid-js";
import { useResolution, useTicker } from "@diffusionstudio/jsx";
import type { SceneNode } from "@diffusionstudio/jsx";
import { createEngine } from "./engine";
import { shots, DURATION } from "./shots";

const W = 1440, H = 1080;

/** @inspect color path="Pencil/Paper" */
const paper = "#dddce9";
/** @inspect color path="Pencil/Graphite" */
const graphite = "#16161f";
/** @inspect number path="Pencil/Weight" min=0.5 max=3 step=0.05 */
const weight = 1.6;
/** @inspect number path="Pencil/Boil" min=0 max=3 step=0.05 */
const boil = 1;
/** @inspect number path="Pencil/Grain" min=0 max=1 step=0.05 */
const grain = 0.9;
/** @inspect number path="Pencil/Drawings per second" min=6 max=24 step=1 */
const drawingsPerSecond = 12;

export default function Film() {
  const { time } = useTicker();
  const resolution = useResolution();
  const engine = createEngine(W, H);
  let surfaceRef: SceneNode | undefined;

  // 12 drawings per second = "on twos" at 24 fps; the whole picture is a pure function of this index
  const drawing = createMemo(() => Math.floor(time() * drawingsPerSecond + 1e-4));

  createEffect(() => {
    const el = surfaceRef?.element;
    if (!el) return;
    const k = resolution();
    el.width = W * k; // same-size set is a no-op
    el.height = H * k;
    engine.render(el, drawing(), drawing() / drawingsPerSecond, k, { paper, graphite, weight, boil, grain }, shots);
  });

  return (
    <stage camera={[0.5, 0, 0, 0.5, 85, 150]}>
      <scene id="film" name="Pencil film" width={W} height={H} fill={paper} active>
        <surface id="drawing" x={0} y={0} width={W} height={H} start={0} end={DURATION} ref={surfaceRef} />
      </scene>
    </stage>
  );
}
