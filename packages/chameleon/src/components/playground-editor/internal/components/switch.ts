import ChSwitch from "../../../switch/switch.lit";
import type { ComponentProperty } from "../../typings/playground-editor";

ChSwitch.define();

export const chSwitchProperties: ComponentProperty<ChSwitch> = {
  accessibleName: {
    type: "string",
    value: undefined
  },
  checked: {
    type: "boolean",
    value: false
  },
  checkedCaption: {
    type: "string",
    value: undefined
  },
  disabled: {
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
  unCheckedCaption: {
    type: "string",
    value: undefined
  },
  value: {
    type: "string",
    value: "on"
  }
};

