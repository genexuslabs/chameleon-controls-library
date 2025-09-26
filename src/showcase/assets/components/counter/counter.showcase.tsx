import { h } from "@stencil/core";

import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { showcaseTemplateClassProperty } from "../utils";

const state: Partial<HTMLChCounterElement> = {};

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChCounterElement> =
  [
    {
      caption: "Styles",
      properties: [
        {
          id: "customVars",
          type: "style",
          properties: [
            {
              id: "--ch-counter-status__warning-color",
              caption: "--ch-counter-status__warning-color",
              value: "yelow",
              render: "input",
              type: "string"
            }
          ]
        },
        {
          id: "customVars",
          type: "style",
          properties: [
            {
              id: "--ch-counter-status__error-color",
              caption: "--ch-counter-status__error-color",
              value: "red",
              render: "input",
              type: "string"
            }
          ]
        }
      ]
    }
  ];

const render = () => (
  <div class="checkbox-test-main-wrapper">
    <fieldset class="fieldset-test form-test-edit">
      <p class="heading-4">Textarea</p>
      <ch-counter initialValue={state.initialValue}>
        <ch-edit
          class="input"
          multiline
          maxLength={50}
          style={{ "block-size": "100px" }}
          value="pepe"
        ></ch-edit>
      </ch-counter>
    </fieldset>

    <fieldset class="fieldset-test form-test-edit">
      <p class="heading-4">input</p>
      <ch-counter initialValue="pepe">
        <ch-edit class="input" maxLength={30} value="pepe"></ch-edit>
      </ch-counter>
    </fieldset>
  </div>
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
