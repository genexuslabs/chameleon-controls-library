import { h } from "@stencil/core";

import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import { renderShowcaseProperties } from "../utils";

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
              value: "#ffff00",
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
              value: "#ff0000",
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

const showcaseCounterPropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChCounterElement>[] =
  [
    {
      name: "class",
      fixed: true,
      value: "navigation-list navigation-list-secondary",
      type: "string"
    }
  ];

export const counterShowcaseStory: ShowcaseStory<HTMLChCounterElement> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: {
    react: () => `<ch-counter ${renderShowcaseProperties(
      state,
      "react",
      showcaseCounterPropertiesInfo
    )}>
      <ch-edit className="input" maxLength="20"></ch-edit>
    </ch-counter>`,

    stencil: () => `<ch-counter ${renderShowcaseProperties(
      state,
      "react",
      showcaseCounterPropertiesInfo
    )}>
      <ch-edit class="input" maxLength="20"></ch-edit>
    </ch-counter>`
  },
  render: render,
  state: state
};
