import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { useTicker } from "@diffusionstudio/jsx";

import { W, H } from "./src/frame.js";
import { C_BG } from "./src/theme.js";
import { build, snapshot } from "./src/timeline.js";
import { Compose } from "./src/Compose.jsx";

/* ── scene ───────────────────────────────────────────────────────────────── */

export default function Main() {
  const { time } = useTicker();
  const tl = build();
  // seeked before the first snapshot, so even the very first paint of a fresh
  // context is the current frame's pose, never the timeline's initial one
  tl.seek(Math.min(time() * 1000, tl.duration));
  const [v, setV] = createStore(snapshot());

  createEffect(() => {
    tl.seek(Math.min(time() * 1000, tl.duration));
    setV(snapshot());
  });

  return (
    <rect scene="main" name="Main scene" width={W} height={H} fill={C_BG}>
      <Compose v={v} />
    </rect>
  );
}
