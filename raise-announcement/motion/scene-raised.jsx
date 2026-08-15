import { SlideWord } from "./slide-word";
import { ANIM } from "./theme";

export const DUR = ANIM;

export function RaisedScene(props) {
  return <SlideWord word="raised" nodeStart={props.start} side="right" align="top" fontSize={800} crop={604} vOffset={-165} />;
}
