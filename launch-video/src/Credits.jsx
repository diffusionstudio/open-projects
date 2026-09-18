import { W, H } from "./frame.js";
import { C_TEXT, C_BG } from "./theme.js";
import {
  TITLE,
  FS_TITLE,
  T_TITLE,
  TITLE_FADE,
  TITLE_EASE,
  T_GROUND,
  GROUND_IN,
  GROUND_EASE,
  CREDITS_END,
  blurAt,
} from "./credits.js";

/* ── the close ───────────────────────────────────────────────────────────── */

// The ground first: the frame bleached to the brand's light tone while the
// comparison dives — starting inside the sink's window it draws over the
// tiles, and its rise is the node's own keyframes on the dive's curve. Then
// one line, centred, the palette inverted: surface-dark type on the light
// ground. The fade is the node's own keyframes, the arrival out of the
// viewer is the store's scale on the div.

export function CreditsGround() {
  return (
    <rect
      name="Credits ground"
      width={W}
      height={H}
      fill={C_TEXT}
      start={T_GROUND / 1000}
      end={CREDITS_END / 1000}
      id="hyf3e6" clipHeight={28}
    >
      <keyframeTrack property="opacity" id="jteqbd">
        <keyframe time={0} value={0} easing={GROUND_EASE} id="twkk9a" />
        <keyframe time={GROUND_IN / 1000} value={1} id="3y020v" />
      </keyframeTrack>
    </rect>
  );
}

export function Credits(props) {
  const v = () => props.v;

  return (
    <rect
      name="Credits"
      width={W}
      height={H}
      start={T_TITLE / 1000}
      end={CREDITS_END / 1000}
      id="u7d7gz"
    >
      <keyframeTrack property="opacity" id="3htgjr">
        <keyframe time={0} value={0} easing={TITLE_EASE} id="u7kv2c" />
        <keyframe time={TITLE_FADE / 1000} value={1} id="nx6p6p" />
      </keyframeTrack>
      <htmlPaint id="9th9ql">
      <div
        style={`position:relative;width:${W}px;height:${H}px;overflow:hidden;
                display:flex;align-items:center;justify-content:center;
                font-family:'Inter';font-weight:500;color:${C_BG};
                -webkit-font-smoothing:antialiased;`}
      >
        <div
          style={{
            "font-size": `${FS_TITLE}px`,
            "line-height": "1",
            "white-space": "pre",
            "transform-origin": "50% 50%",
            transform: `scale(${v().title.s.toFixed(4)})`,
            // veiled at either end of the scene, crisp for the stay between
            filter:
              v().title.b > 0.001
                ? `blur(${blurAt(v().title.b, v().title.s).toFixed(2)}px)`
                : "none",
          }}
        >
          {TITLE}
        </div>
      </div>
      </htmlPaint>
    </rect>
  );
}
