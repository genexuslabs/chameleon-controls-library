import ChCode from "../../../code/code.lit";
import type { ComponentProperty } from "../../typings/playground-editor";

ChCode.define();

export const chCodeProperties: ComponentProperty<ChCode> = {
  language: {
    type: "string",
    value: "txt"
  },
  showIndicator: {
    type: "boolean",
    value: false
  },
  value: {
    type: "string-multiline",
    value: undefined
  }
};

