import { h } from "@stencil/core";

import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { showcaseTemplateClassProperty } from "../utils";

const state: Partial<HTMLChCounterElement> = {};

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChCounterElement> =
  [];

const render = () => (
  <ch-counter>
    <input type="text"></input>
  </ch-counter>
);

export const counterShowcaseStory: ShowcaseStory<HTMLChCounterElement> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: {
    react: () => `<label ${showcaseTemplateClassProperty(
      "react",
      "label"
    )} htmlFor="first-name">
        First name
      </label>`,

    stencil: () => `<label ${showcaseTemplateClassProperty(
      "react",
      "label"
    )} htmlFor="first-name">
        First name
      </label>`
  },
  render: render,
  state: state
};
