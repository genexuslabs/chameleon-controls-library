import { h } from "@stencil/core";
import { ChCode } from "../../../../components/code/code";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { Mutable } from "../../../../common/types";

const state: Partial<Mutable<ChCode>> = {};

const render = () => (
  <ch-code
    class="code"
    addLastNestedChildClass={state.addLastNestedChildClass}
    language={state.language}
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
        id: "addLastNestedChildClass",
        caption: "Add Last Nested Child Class",
        value: false,
        type: "boolean"
      }
    ]
  }
];

export const codeShowcaseStory: ShowcaseStory<Mutable<ChCode>> = {
  properties: showcaseRenderProperties,
  render: render,
  state: state
};
