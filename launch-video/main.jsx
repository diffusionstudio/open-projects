import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { useTicker } from "@diffusionstudio/jsx";

import { W, H } from "./src/frame.js";
import { C_BG } from "./src/theme.js";
import { build, snapshot } from "./src/timeline.js";
import { ColdOpen } from "./src/ColdOpen.jsx";
import { Install } from "./src/Install.jsx";
import { Prompt } from "./src/Prompt.jsx";
import { Analyze } from "./src/Analyze.jsx";
import { Watch } from "./src/Watch.jsx";
import { Compose } from "./src/Compose.jsx";
import { ComparePlayers, CompareTitles } from "./src/Compare.jsx";
import { CreditsGround, Credits } from "./src/Credits.jsx";
import { LogoGround, Logo, LogoWall } from "./src/Logo.jsx";
import { LOGO_END } from "./src/logo.js";

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

  // Stacking is document order — a later element draws above an earlier one,
  // and a sequence sits where it is written — so the scene reads bottom to
  // top. The HTML shots that never share a frame ride one sequence; the four
  // that cannot join it are held out by what they overlap: the composing shot
  // fades out under the players it becomes, the compare titles sit between
  // those players and the ground that bleaches over them, the watching blooms
  // in over the analysing's last frames, and the logo wall plays over the logo.
  return (
    <stage id="syqaz4" camera={[0.3, 0, 0, 0.3, 51.22, 148.01]}>
      <scene id="main" name="Main scene" width={W} height={H} fill={C_BG} active timeline={[18.98, -0.42, 0]}>
        <Compose v={v} />
        <ComparePlayers v={v} />
        <CompareTitles v={v} />
        <CreditsGround />
        <LogoGround />
        <sequence name="Shots" id="olj75q" clipHeight={28}>
          <ColdOpen v={v} />
          <Install v={v} />
          <Prompt v={v} />
          <Analyze v={v} />
          <Credits v={v} />
          <Logo v={v} />
        </sequence>
        <sequence name="Overlays" id="c0cg1q" clipHeight={28}>
          <Watch v={v} />
          <LogoWall v={v} />
        </sequence>
        <group name="Thumbnail" start="0f" end={LOGO_END / 1000} id="aj4iw5" clipHeight={28}>
          <image
            name="Poster frame"
            src="thumbnail.png"
            width={W}
            height={H}
            start="0f"
            end="1f"
            id="433ipt"
          />
        </group>
      </scene>
    </stage>
  );
}
