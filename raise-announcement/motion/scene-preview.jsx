import { SlideWord } from "./slide-word";
import { ANIM } from "./theme";

export const DUR = ANIM;

export function PreviewScene(props) {
  return <SlideWord word="Preview" nodeStart={props.start} side="left" align="bottom" fontSize={540} crop={200} />;
}
