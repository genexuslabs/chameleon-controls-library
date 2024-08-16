import { h } from "@stencil/core";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { Mutable } from "../../../../common/types";
import { ChAccordionRender } from "../../../../components/accordion/accordion";
import { simpleModel } from "./models";

const state: Partial<Mutable<ChAccordionRender>> = {};

const render = () => (
  <ch-accordion-render class="accordion" model={state.model}>
    <div slot="item 1">Content of the item 1</div>

    <div slot="item 2">
      Content of the item 2
      <button class="button-primary" type="button">
        Some action
      </button>
    </div>

    <div slot="item 3">
      Content of the item 3
      <button class="button-secondary" type="button">
        Some action
      </button>
    </div>
  </ch-accordion-render>
);

const showcaseRenderProperties: ShowcaseRenderProperties<
  Mutable<ChAccordionRender>
> = [
  {
    caption: "Properties",
    properties: [
      {
        id: "model",
        caption: "Model",
        type: "enum",
        value: simpleModel,
        values: [{ caption: "Simple model", value: simpleModel }]
      }
    ]
  }
];

export const accordionShowcaseStory: ShowcaseStory<Mutable<ChAccordionRender>> =
  {
    properties: showcaseRenderProperties,
    render: render,
    state: state
  };
