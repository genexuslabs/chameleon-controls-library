import { h } from "@stencil/core";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { renderBooleanPropertyOrEmpty } from "../utils";

const state: Partial<HTMLChCodeElement> = {};

const render = () => (
  <ch-code
    class="code"
    language={state.language}
    showIndicator={state.showIndicator}
    value={state.value}
  ></ch-code>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChCodeElement> = [
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

export const codeShowcaseStory: ShowcaseStory<HTMLChCodeElement> = {
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
