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
          id: "step",
          caption: "Step",
          value: 1, // Default value
          type: "number"
        },
        {
          id: "value",
          caption: "Selected Color: (rgb, hex, hsl)",
          value: "#3070ca",
          type: "string"
        }
      ]
    }
  ];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChColorFieldElement>[] =
  [
    { name: "step", defaultValue: 1, type: "number" },
    { name: "value", defaultValue: "#3070ca", type: "string" }
  ];

const render = () => (
  <ch-color-field value={state.value} step={state.step}></ch-color-field>
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
