import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import { renderShowcaseProperties } from "../utils";

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

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChCodeElement>[] =
  [
    { name: "class", fixed: true, value: "code", type: "string" },
    { name: "showIndicator", defaultValue: false, type: "boolean" },
    { name: "value", defaultValue: undefined, type: "string-template" }
  ];

export const codeShowcaseStory: ShowcaseStory<HTMLChCodeElement> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: {
    react: () => `<ChCode${renderShowcaseProperties(
      state,
      "react",
      showcasePropertiesInfo
    )}
      ></ChCode>`,

    stencil: () => `<ch-code${renderShowcaseProperties(
      state,
      "stencil",
      showcasePropertiesInfo
    )}
        ></ch-code>`
  },
  render: render,
  state: state
};
