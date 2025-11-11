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
          value: 1,
          type: "number"
        },
        {
          id: "value",
          caption: "Selected Color: (rgb, hex, hsl)",
          value: "#3070ca",
          type: "string"
        },
        {
          id: "disabled",
          caption: "Disabled",
          value: false,
          type: "boolean"
        },
        {
          id: "readonly",
          caption: "Readonly",
          value: false,
          type: "boolean"
        }
      ]
    }
  ];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChColorFieldElement>[] =
  [
    { name: "step", defaultValue: 1, type: "number" },
    { name: "value", defaultValue: "#3070ca", type: "string" },
    { name: "Disabled", defaultValue: false, type: "boolean" },
    { name: "Readonly", defaultValue: false, type: "boolean" }
  ];

const render = () => (
  <ch-color-field
    value={state.value}
    step={state.step}
    disabled={state.disabled}
    readonly={state.readonly}
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
