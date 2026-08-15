import { SIZE, BG } from "./theme";
import { PreviewScene, DUR as PREVIEW_DUR } from "./scene-preview";
import { RaisedScene, DUR as RAISED_DUR } from "./scene-raised";
import { AmountScene, DUR as AMOUNT_DUR } from "./scene-amount";
import { SummaryScene } from "./scene-summary";

export default function PreviewRaisedIntro() {
  return (
    <rect scene="preview-raised-intro" name="Preview — Raised" {...SIZE} fill={BG}>
      <sequence name="Words">
        <PreviewScene start={0} />
        <RaisedScene start={PREVIEW_DUR} />
        <AmountScene start={PREVIEW_DUR + RAISED_DUR} />
        <SummaryScene start={PREVIEW_DUR + RAISED_DUR + AMOUNT_DUR} />
      </sequence>
    </rect>
  );
}
