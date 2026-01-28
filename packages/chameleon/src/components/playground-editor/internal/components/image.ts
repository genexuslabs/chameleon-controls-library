import ChImage from "../../../image/image.lit";
import type { ComponentProperty } from "../../typings/playground-editor";

ChImage.define();

export const chImageProperties: ComponentProperty<ChImage> = {
  containerRef: {
    type: "ref",
    value: undefined
  },
  disabled: {
    type: "boolean",
    value: false
  },
  getImagePathCallback: {
    type: "function",
    value: undefined
  },
  src: {
    type: "string",
    value: undefined
  },
  type: {
    type: "string",
    value: "background"
  }
};

