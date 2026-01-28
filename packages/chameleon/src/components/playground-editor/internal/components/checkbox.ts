import ChCheckbox from "../../../checkbox/checkbox.lit";
import type { ComponentProperty } from "../../typings/playground-editor";

ChCheckbox.define();

export const chCheckboxProperties: ComponentProperty<ChCheckbox> = {
  accessibleName: {
    type: "string",
    value: undefined
  },
  caption: {
    type: "string",
    value: undefined
  },
  checked: {
    type: "boolean",
    value: false
  },
  disabled: {
    type: "boolean",
    value: false
  },
  indeterminate: {
    type: "boolean",
    value: false
  },
  name: {
    type: "string",
    value: undefined
  },
  readonly: {
    type: "boolean",
    value: false
  },
  startImgSrc: {
    type: "string",
    value: undefined
  },
  startImgType: {
    type: "string",
    value: "background"
  },
  value: {
    type: "string",
    value: "on"
  }
};

