import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import { renderShowcaseProperties } from "../utils";

const state: Partial<HTMLChColorFieldElement> = {};

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChColorFieldElement> =
  [
    {
      caption: "Properties",
      properties: [
        {
          id: "baseColor",
          caption: "Base Color",
          value: "#FF0000", // Default value
          type: "string"
        },
        {
          id: "colorFormat",
          caption: "Color Format",
          value: "rgb", // Default value
          type: "string"
        },
        {
          id: "step",
          caption: "Step",
          value: 1, // Default value
          type: "number"
        },
        {
          id: "selectedColor",
          caption: "Selected Color",
          value: "#FF0000", // Default value
          type: "string"
        }
      ]
    }
  ];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChColorFieldElement>[] =
  [
    { name: "baseColor", defaultValue: "#FF0000", type: "string" },
    { name: "colorFormat", defaultValue: "rgb", type: "string" },
    { name: "step", defaultValue: 1, type: "number" },
    { name: "selectedColor", defaultValue: "#FF0000", type: "string" }
  ];

const render = () => (
  <ch-color-field
    baseColor={state.baseColor}
    colorFormat={state.colorFormat}
    selectedColor={state.selectedColor}
    step={state.step}
  ></ch-color-field>
);

export const colorFieldShowcaseStory: ShowcaseStory<HTMLChColorFieldElement> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: {
    react: () =>
      `<ChColorField${renderShowcaseProperties(
        state,
        "react",
        showcasePropertiesInfo
      )}></ChColorField>`,

    stencil: () =>
      `<ch-color-field${renderShowcaseProperties(
        state,
        "stencil",
        showcasePropertiesInfo
      )}></ch-color-field>`
  },
  render: render,
  state: state
};
