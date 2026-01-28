import type { ComponentProperty } from "../../typings/playground-editor";
import { buttonProperties } from "./button";
import { chCheckboxProperties } from "./checkbox";
import { chCodeProperties } from "./code";
import { chImageProperties } from "./image";
import { chSliderProperties } from "./slider";
import { chSwitchProperties } from "./switch";

export const componentProperties = {
  button: buttonProperties,
  "ch-checkbox": chCheckboxProperties,
  "ch-code": chCodeProperties,
  "ch-image": chImageProperties,
  "ch-slider": chSliderProperties,
  "ch-switch": chSwitchProperties
} satisfies {
  [key in keyof HTMLElementTagNameMap]?: ComponentProperty<
    HTMLElementTagNameMap[key]
  >;
};
