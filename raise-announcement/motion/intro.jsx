import { SIZE, BG } from "./theme";
import { PreviewScene, DUR as PREVIEW_DUR } from "./scene-preview";
import { RaisedScene, DUR as RAISED_DUR } from "./scene-raised";
import { AmountScene, DUR as AMOUNT_DUR } from "./scene-amount";
import { GradientBand, SummaryContent, CONTENT_DELAY, DUR as SUMMARY_DUR } from "./scene-summary";

const T_RAISED = PREVIEW_DUR;
const T_AMOUNT = T_RAISED + RAISED_DUR;
const T_SUMMARY = T_AMOUNT + AMOUNT_DUR;

// Stacking is document order — a later element draws above an earlier one —
// so the band is written first: it plays under the summary's type. The four
// HTML beats never share a frame, so they ride one sequence.
export default function PreviewRaisedIntro() {
  return (
    <stage id="uz2ryb">
      <scene id="preview-raised-intro" name="Preview — Raised" {...SIZE} fill={BG} active>
        <GradientBand start={T_SUMMARY} />
        <sequence name="Words" id="70unl0">
          <PreviewScene start={0} />
          <RaisedScene start={T_RAISED} />
          <AmountScene start={T_AMOUNT} />
          <SummaryContent start={T_SUMMARY + CONTENT_DELAY} end={T_SUMMARY + SUMMARY_DUR} />
        </sequence>
      </scene>
    </stage>
  );
}
