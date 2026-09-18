import { onMount, createEffect, For } from "solid-js";
import { gsap } from "gsap";
import { useTicker } from "@diffusionstudio/jsx";
import { SIZE, INK, ACCENT, ANIM } from "./theme";
import { dom } from "./dom";

const EASE_OUT = "expo.out"; // dramatic entrance that settles softly, no overshoot
const CHAR_DUR = 0.08; // how long each individual character takes to recolor
const CHAR_TOTAL = 0.42; // how long the whole word takes to finish recoloring
const CHAR_DELAY = 0.05; // wait until the word is visibly on screen before recoloring starts

// side: which edge the word is pinned to (and stays cropped against at rest)
// align: which edge of the frame it sits near vertically
export function SlideWord(props) {
  const { time } = useTicker();
  const chars = props.word.split("");
  let el;
  let tl;
  let charEls = [];

  onMount(() => {
    tl = gsap.timeline({ paused: true, defaults: { lazy: false } });
    if (props.side === "left") {
      tl.fromTo(dom(el), { xPercent: -100 }, { x: -props.crop, xPercent: 0, duration: ANIM, ease: EASE_OUT }, 0);
    } else {
      tl.fromTo(dom(el), { xPercent: 100 }, { x: props.crop, xPercent: 0, duration: ANIM, ease: EASE_OUT }, 0);
    }
    // each character flips color on its own, staggered left -> right (reading
    // order) regardless of which edge the word slides in from; starts once
    // the word has slid into view (CHAR_DELAY) so the recolor is actually
    // watchable, and finishes well ahead of the slide settling at ANIM
    const gap = chars.length > 1 ? (CHAR_TOTAL - CHAR_DUR) / (chars.length - 1) : 0;
    tl.fromTo(charEls, { color: INK }, { color: ACCENT, duration: CHAR_DUR, ease: "none", stagger: gap }, CHAR_DELAY);
  });

  createEffect(() => {
    if (!tl) return;
    tl.seek(Math.min(Math.max(time() - props.nodeStart, 0), ANIM));
  });

  const posStyle = props.side === "left" ? { left: "0px" } : { right: "0px" };
  const vOffset = props.vOffset ?? 72;
  const vStyle = props.align === "bottom" ? { bottom: `${vOffset}px` } : { top: `${vOffset}px` };

  return (
    <html name={props.word} {...SIZE} x={0} y={0} start={props.nodeStart} end={props.nodeStart + ANIM} id="e2bxxa">
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div
          ref={el}
          style={{
            position: "absolute",
            ...posStyle,
            ...vStyle,
            "font-family": "Inter",
            "font-weight": 500,
            "font-size": `${props.fontSize}px`,
            "line-height": 1,
            "letter-spacing": "0em",
            "white-space": "nowrap",
          }}
        >
          <For each={chars}>
            {(ch, i) => (
              <span ref={(node) => (charEls[i()] = dom(node))} style={{ color: INK }}>
                {ch}
              </span>
            )}
          </For>
        </div>
      </div>
    </html>
  );
}
