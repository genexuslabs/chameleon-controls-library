import { h } from "@stencil/core";
import { ChCode } from "../../../../components/code/code";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { Mutable } from "../../../../common/types";
import { renderBooleanPropertyOrEmpty } from "../utils";

const state: Partial<Mutable<ChCode>> = {};

const render = () => (
  <ch-code
    class="code"
    language={state.language}
    showIndicator={state.showIndicator}
    value={state.value}
  ></ch-code>
);

const showcaseRenderProperties: ShowcaseRenderProperties<Mutable<ChCode>> = [
  {
    caption: "Value",
    properties: [
      {
        id: "value",
        accessibleName: "value",
        value: 'console.log("Hello world")',
        render: "textarea",
        type: "string"
      }
    ]
  },
  {
    caption: "Properties",
    properties: [
      {
        id: "language",
        caption: "Language",
        value: "typescript",
        render: "input",
        type: "string"
      },
      {
        id: "showIndicator",
        caption: "Show Indicator",
        value: false,
        type: "boolean"
      }
    ]
  }
];

export const codeShowcaseStory: ShowcaseStory<Mutable<ChCode>> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: () => `<ch-code
          class="code"
          language="${state.language}"${renderBooleanPropertyOrEmpty(
    "showIndicator",
    state
  )}
          value={\`${state.value}\`}
        ></ch-code>`,
  render: render,
  state: state
};
