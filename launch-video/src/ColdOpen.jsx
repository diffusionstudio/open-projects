import { W, H } from "./frame.js";
import { C_TEXT, C_PROMPT } from "./theme.js";
import { CMD, PROMPT_LEN, T_GONE } from "./timing.js";
import {
  CUR_FILL,
  FS_BIG,
  CW_BIG,
  CH_BIG,
  LH_BIG,
  CUR_GAP_BIG,
  CUR_GLOW_BIG,
  LINE_X,
} from "./coldopen.js";

/* ── cold open ───────────────────────────────────────────────────────────── */

export function ColdOpen(props) {
  const v = () => props.v;

  const typed = () => Math.round(v().command.n);
  const shown = () => CMD.slice(0, typed());

  return (
    <html name="Command" width={W} height={H} end={T_GONE / 1000}>
      <div
        style={`position:relative;width:${W}px;height:${H}px;overflow:hidden;
                font-family:'JetBrains Mono';font-size:${FS_BIG}px;font-weight:400;
                color:${C_TEXT};-webkit-font-smoothing:antialiased;`}
      >
        <div
          style={{
            position: "absolute",
            left: `${LINE_X}px`,
            top: `${Math.round((H - LH_BIG) / 2)}px`,
            height: `${LH_BIG}px`,
            "line-height": `${LH_BIG}px`,
            "white-space": "pre",
            transform: `translateX(${(-v().look.x).toFixed(2)}px)`,
          }}
        >
          <span style={{ color: C_PROMPT }}>{shown().slice(0, PROMPT_LEN)}</span>
          <span style={{ color: C_TEXT }}>{shown().slice(PROMPT_LEN)}</span>
          <span
            style={{
              display: "inline-block",
              width: `${CW_BIG}px`,
              height: `${CH_BIG}px`,
              "margin-left": `${CUR_GAP_BIG}px`,
              "vertical-align": "middle",
              background: CUR_FILL,
              "box-shadow": CUR_GLOW_BIG,
              opacity: String(v().cursor.o),
            }}
          />
        </div>
      </div>
    </html>
  );
}
