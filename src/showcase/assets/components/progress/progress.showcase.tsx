import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import { renderShowcaseProperties } from "../utils";

const state: Partial<HTMLChProgressElement> = {};

const render = () => (
  <ch-progress
    class="progress"
    accessibleName={state.accessibleName}
    accessibleValueText={state.accessibleValueText}
    indeterminate={state.indeterminate}
    min={state.min}
    max={state.max}
    value={state.value}
  ></ch-progress>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChProgressElement> =
  [
    {
      caption: "Properties",
      properties: [
        {
          id: "accessibleName",
          caption: "Accessible Name",
          value: undefined,
          type: "string"
        },
        {
          id: "accessibleValueText",
          caption: "Accessible Value Text",
          value: undefined,
          type: "string"
        },

        {
          id: "min",
          caption: "Min Value",
          value: 0,
          type: "number"
        },
        {
          id: "max",
          caption: "Max Value",
          value: 100,
          type: "number"
        },
        {
          id: "value",
          caption: "Value",
          value: 0,
          type: "number"
        },
        {
          id: "indeterminate",
          caption: "Indeterminate",
          value: false,
          type: "boolean"
        }
      ]
    }
  ];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChProgressElement>[] =
  [
    { name: "accessibleName", defaultValue: undefined, type: "string" },
    { name: "accessibleValueText", defaultValue: undefined, type: "string" },
    { name: "indeterminate", defaultValue: false, type: "boolean" },
    { name: "min", defaultValue: 0, type: "number" },
    { name: "max", defaultValue: 100, type: "number" },
    { name: "value", defaultValue: 0, type: "number" }
  ];

export const progressShowcaseStory: ShowcaseStory<HTMLChProgressElement> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: {
    react: () => `<ChProgress${renderShowcaseProperties(
      state,
      "react",
      showcasePropertiesInfo
    )}
      ></ChProgress>`,

    stencil: () => `<ch-progress${renderShowcaseProperties(
      state,
      "stencil",
      showcasePropertiesInfo
    )}
        ></ch-progress>`
  },
  render: render,
  state: state
};
