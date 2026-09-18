import { W, H } from "./frame.js";
import { C_TEXT, C_PRODUCT } from "./theme.js";
import { ICON_AT, ICON_FOLDER, ARROW, MACOS_FOLDER, CURSOR_ARROW, CURSOR_TEXT } from "./art.js";
import { Words } from "./Row.jsx";
import {
  PW,
  PH,
  RADIUS,
  S,
  PANEL_X,
  PANEL_Y,
  C_PANEL,
  C_HAIRLINE,
  AT_BTN,
  PILL,
  SUBMIT,
  HOVER,
  FS_TEXT,
  LH_TEXT,
  TEXT_X,
  TEXT_Y,
  FS_PILL,
  LH_PILL,
  PILL_TEXT_X,
  PILL_TEXT_Y,
  PILL_LABEL,
  PLACEHOLDER,
  PLACEHOLDER_LIT,
  SETTLED,
  SHINE_MASK,
  SHINE_SPAN,
  PROMPT,
  FILE_W,
  FILE_H,
  FILE_OFF,
  fileAt,
  pushAt,
  PUSH_SCALE,
  SUBMIT_C,
  SPIN_C,
  arrowAt,
  PTR_BOX,
  CARET_BOX,
  HOT_P,
  HOT_I,
  pointerAt,
  pressAt,
  buttonAt,
  dismissAt,
  T_PANEL_IN,
  PROMPT_END,
} from "./prompt.js";

/* ── the prompt ──────────────────────────────────────────────────────────── */

// A chip is a panel-sized layer carrying one piece of the header, so outline,
// glyph and label push up rigidly together in the design's own coordinates.
function Chip(props) {
  return (
    <div
      style={{
        position: "absolute",
        inset: "0",
        opacity: String(props.chip.o),
        transform: `translateY(${props.chip.y.toFixed(2)}px)`,
      }}
    >
      {props.children}
    </div>
  );
}

export function Prompt(props) {
  const v = () => props.v;

  const file = () => fileAt(v().file.k, v().land.k);

  const gone = () => dismissAt(v().dismiss.k);
  const push = () => pushAt(v().push.k);
  const btn = () => buttonAt(v().button.hover, v().button.down, v().pop.k);
  const cur = () => pointerAt(v().file.k, v().away.k, v().reach.k);
  const beam = () => v().caret.on > 0.5;
  const cPose = () =>
    `rotate(${v().swing.a.toFixed(2)}deg) scale(${pressAt(v().press.k).toFixed(4)})`;

  return (
    <html
      name="Prompt"
      width={W}
      height={H}
      start={T_PANEL_IN / 1000}
      end={PROMPT_END / 1000} id="paik1l"
    >
      <div
        style={`position:relative;width:${W}px;height:${H}px;overflow:hidden;
                font-family:'Inter';font-weight:400;color:${C_TEXT};
                -webkit-font-smoothing:antialiased;`}
      >
        {/* the camera: the shot's whole contents on one move — the rise, and
            later the push in about the submit button */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            "transform-origin": `${SUBMIT_C.x.toFixed(2)}px ${SUBMIT_C.y.toFixed(2)}px`,
            transform: `translate(${push().x.toFixed(2)}px, ${(v().rise.y + push().y).toFixed(2)}px) scale(${push().scale.toFixed(4)})`,
          }}
        >
          {/* dismiss wrapper at on-screen size, so the panel recedes about its
              own middle and is blurred in the frame's pixels */}
          <div
            style={{
              position: "absolute",
              left: `${PANEL_X}px`,
              top: `${PANEL_Y}px`,
              width: `${PW * S}px`,
              height: `${PH * S}px`,
              "transform-origin": "50% 50%",
              transform: `scale(${gone().scale.toFixed(4)})`,
              filter: gone().blur ? `blur(${gone().blur.toFixed(2)}px)` : "none",
              opacity: String(gone().opacity),
            }}
          >
            {/* inside, everything is in the panel's own units; S is the one
                scale between design and frame. The spin is taken here too,
                about the button's middle in those units — the frame's own
                middle by then — so the box turns and the cursor standing on
                the pivot never feels it */}
            <div
              style={{
                position: "absolute",
                left: "0",
                top: "0",
                width: `${PW}px`,
                height: `${PH}px`,
                "transform-origin": "0 0",
                transform:
                  `scale(${S}) ` +
                  `translate(${SPIN_C.x}px, ${SPIN_C.y}px) ` +
                  `rotate(${v().spin.a.toFixed(2)}deg) ` +
                  `translate(${-SPIN_C.x}px, ${-SPIN_C.y}px)`,
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: `${PW}px`,
                  height: `${PH}px`,
                  background: C_PANEL,
                  "border-radius": `${RADIUS}px`,
                }}
              >
                {/* the drop ring straddles the edge, so it reads as the panel
                    lighting up rather than a smaller panel inside it */}
                <div
                  style={{
                    position: "absolute",
                    left: `${-HOVER.out}px`,
                    top: `${-HOVER.out}px`,
                    width: `${PW + 2 * HOVER.out}px`,
                    height: `${PH + 2 * HOVER.out}px`,
                    "box-sizing": "border-box",
                    border: `${HOVER.bw}px solid ${C_PRODUCT}`,
                    "border-radius": `${HOVER.r}px`,
                    opacity: String(v().panel.hover),
                  }}
                />

                <Chip chip={v().chips[0]}>
                  <div
                    style={`position:absolute;left:${AT_BTN.x}px;top:${AT_BTN.y}px;
                            width:${AT_BTN.s}px;height:${AT_BTN.s}px;box-sizing:border-box;
                            border:${AT_BTN.bw}px solid ${C_HAIRLINE};border-radius:${AT_BTN.r}px;`}
                  />
                  <div style={`position:absolute;inset:0;background-image:${ICON_AT};`} />
                </Chip>

                <Chip chip={v().chips[1]}>
                  <div
                    style={`position:absolute;left:${PILL.x}px;top:${PILL.y}px;
                            width:${PILL.w}px;height:${PILL.h}px;box-sizing:border-box;
                            border:${PILL.bw}px solid ${C_HAIRLINE};border-radius:${PILL.r}px;`}
                  />
                  <div style={`position:absolute;inset:0;background-image:${ICON_FOLDER};`} />
                  <div
                    style={`position:absolute;left:${PILL_TEXT_X}px;top:${PILL_TEXT_Y}px;
                            font-size:${FS_PILL}px;line-height:${LH_PILL}px;white-space:pre;`}
                  >
                    {PILL_LABEL}
                  </div>
                </Chip>

                {/* placeholder and prompt share one origin, so the line that
                    arrives sits exactly where the line that leaves was */}
                <div
                  style={`position:absolute;left:${TEXT_X}px;top:${TEXT_Y}px;
                          font-size:${FS_TEXT}px;line-height:${LH_TEXT}px;white-space:pre;`}
                >
                  {/* absolute and unsized, so the box is the line's width and
                      the shine's mask can be stated as a fraction of it */}
                  <div
                    style={{
                      position: "absolute",
                      left: "0",
                      top: "0",
                      opacity: String(v().panel.placeholder),
                    }}
                  >
                    <Words body={PLACEHOLDER} words={v().holder} lh={LH_TEXT} />
                    <div
                      style={{
                        position: "absolute",
                        inset: "0",
                        "-webkit-mask-image": SHINE_MASK,
                        "mask-image": SHINE_MASK,
                        "-webkit-mask-size": SHINE_SPAN,
                        "mask-size": SHINE_SPAN,
                        "-webkit-mask-repeat": "no-repeat",
                        "mask-repeat": "no-repeat",
                        "-webkit-mask-position": `${v().shine.x.toFixed(2)}% 0`,
                        "mask-position": `${v().shine.x.toFixed(2)}% 0`,
                      }}
                    >
                      <Words body={PLACEHOLDER_LIT} words={SETTLED} lh={LH_TEXT} />
                    </div>
                  </div>
                  <Words body={PROMPT} words={v().prompt} lh={LH_TEXT} />
                </div>

                <div
                  style={{
                    position: "absolute",
                    left: `${SUBMIT.x}px`,
                    top: `${SUBMIT.y}px`,
                    width: `${SUBMIT.s}px`,
                    height: `${SUBMIT.s}px`,
                    "border-radius": `${SUBMIT.r}px`,
                    "background-color": btn().fill,
                    "transform-origin": "50% 50%",
                    transform: `scale(${btn().scale.toFixed(4)})`,
                    opacity: String(v().panel.submit),
                  }}
                >
                  {/* the ink, Android's way: a light circle from the touch
                      point, sized to stay within the button's own edges —
                      inscribed, so no clip is needed */}
                  <div
                    style={{
                      position: "absolute",
                      inset: "0",
                      "border-radius": "50%",
                      background: "#FFFFFF",
                      "transform-origin": "50% 50%",
                      transform: `scale(${v().ripple.s.toFixed(4)})`,
                      opacity: String(v().ripple.o),
                    }}
                  />
                  {/* the glyph alone is counter-turned on the pivot, so the
                      button spins with the box and the arrow never leaves
                      upright; the press draws it down. It only rides the
                      sling to the release — the flight itself is drawn flat
                      on the frame, where the read-back tolerates it */}
                  <div
                    style={{
                      position: "absolute",
                      inset: "0",
                      "background-image": ARROW,
                      "transform-origin": "50% 50%",
                      transform:
                        `rotate(${(-v().spin.a).toFixed(2)}deg) ` +
                        `translate(0px, ${arrowAt(v().button.down, 0).toFixed(2)}px)`,
                      visibility: v().shoot.k > 0 ? "hidden" : "visible",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* the file is in the frame's pixels, not the panel's */}
          <div
            style={{
              position: "absolute",
              left: `${(file().x - FILE_OFF.x).toFixed(2)}px`,
              top: `${(file().y - FILE_OFF.y).toFixed(2)}px`,
              width: `${FILE_W}px`,
              height: `${FILE_H}px`,
              "background-image": MACOS_FOLDER,
              "background-size": "100% 100%",
              "transform-origin": `${FILE_OFF.x.toFixed(2)}px ${FILE_OFF.y.toFixed(2)}px`,
              transform: `scale(${file().scale.toFixed(4)})`,
              opacity: String(file().opacity),
            }}
          />

          {/* the arrow is over everything, including what it dismisses */}
          <div
            style={{
              position: "absolute",
              left: `${(cur().x - HOT_P.x).toFixed(2)}px`,
              top: `${(cur().y - HOT_P.y).toFixed(2)}px`,
              width: `${PTR_BOX.w * S}px`,
              height: `${PTR_BOX.h * S}px`,
              "background-image": CURSOR_ARROW,
              "background-size": "100% 100%",
              "transform-origin": `${HOT_P.x.toFixed(2)}px ${HOT_P.y.toFixed(2)}px`,
              transform: cPose(),
              visibility: beam() ? "hidden" : "visible",
            }}
          />
        </div>

        {/* The launch, flat on the frame: the same glyph at the size the
            zoom draws it, taking over from the button's own on the release —
            one animated transform at depth one, which the read-back
            tolerates where the nested flight was dropped. */}
        <div
          style={{
            position: "absolute",
            left: `${(W / 2 - (SUBMIT.s / 2) * S * PUSH_SCALE).toFixed(2)}px`,
            top: `${(H / 2 - (SUBMIT.s / 2) * S * PUSH_SCALE).toFixed(2)}px`,
            width: `${(SUBMIT.s * S * PUSH_SCALE).toFixed(2)}px`,
            height: `${(SUBMIT.s * S * PUSH_SCALE).toFixed(2)}px`,
            "background-image": ARROW,
            "background-size": "100% 100%",
            transform: `translateY(${(arrowAt(v().button.down, v().shoot.k) * S * PUSH_SCALE).toFixed(2)}px)`,
            visibility: v().shoot.k > 0 ? "visible" : "hidden",
          }}
        />

        {/* The beam the arrow becomes stands outside the camera, in the
            frame's own still coordinates: its middle on the absolute center,
            at the size the zoom has been drawing the cursor. Nothing that
            moves can move it. */}
        <div
          style={{
            position: "absolute",
            left: `${(W / 2 - HOT_I.x * PUSH_SCALE).toFixed(2)}px`,
            top: `${(H / 2 - HOT_I.y * PUSH_SCALE).toFixed(2)}px`,
            width: `${CARET_BOX.w * S * PUSH_SCALE}px`,
            height: `${CARET_BOX.h * S * PUSH_SCALE}px`,
            "background-image": CURSOR_TEXT,
            "background-size": "100% 100%",
            visibility: beam() ? "visible" : "hidden",
          }}
        />
      </div>
    </html>
  );
}
