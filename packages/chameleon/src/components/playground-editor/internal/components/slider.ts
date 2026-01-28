import ChSlider from "../../../slider/slider.lit";
import type { ComponentProperty } from "../../typings/playground-editor";

ChSlider.define();

export const chSliderProperties: ComponentProperty<ChSlider> = {
  accessibleName: {
    type: "string",
    value: undefined
  },
  disabled: {
    type: "boolean",
    value: false
  },
  maxValue: {
    type: "number",
    value: 5
  },
  minValue: {
    type: "number",
    value: 5
  },
  name: {
    type: "string",
    value: undefined
  },
  showValue: {
    type: "boolean",
    value: false
  },
  step: {
    type: "number",
    value: 1
  },
  value: {
    type: "number",
    value: 0
  }
};

