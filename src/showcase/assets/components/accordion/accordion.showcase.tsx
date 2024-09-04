import { forceUpdate, h } from "@stencil/core";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import {
  accordionDisabledModel,
  accordionSimpleModel,
  accordionWithExpandedSizeModel
} from "./models";
import {
  AccordionItemExpandedChangeEvent,
  ChAccordionRenderCustomEvent
} from "../../../../components";
import { renderBooleanPropertyOrEmpty } from "../utils";

const state: Partial<HTMLChAccordionRenderElement> = {};

const renderedItems = new Set();

const expandedItemChangeHandler = (
  event: ChAccordionRenderCustomEvent<AccordionItemExpandedChangeEvent>
) => {
  if (event.detail.expanded) {
    renderedItems.add(event.detail.id);
  }

  // TODO: Until we support external slots in the ch-flexible-layout-render,
  // this is a hack to update the render of the widget and thus re-render the
  // combo-box updating the displayed items
  const showcaseRef = event.target.closest("ch-showcase");

  if (showcaseRef) {
    forceUpdate(showcaseRef);
  }
};

const render = () => (
  <ch-accordion-render
    class="accordion-filled"
    disabled={state.disabled}
    model={state.model}
    singleItemExpanded={state.singleItemExpanded}
    onExpandedChange={expandedItemChangeHandler}
  >
    {renderedItems.has("item 1") && (
      <div slot="item 1">Content of the item 1</div>
    )}

    {renderedItems.has("item 2") && (
      <div slot="item 2">
        Content of the item 2
        <button class="button-primary" type="button">
          Some action
        </button>
        <div>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga rem cum
          deleniti? Ullam sit saepe non laudantium dicta alias, corrupti dolores
          rerum sint, maiores expedita esse, molestias modi perspiciatis
          pariatur.
        </div>
        <div>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga rem cum
          deleniti? Ullam sit saepe non laudantium dicta alias, corrupti dolores
          rerum sint, maiores expedita esse, molestias modi perspiciatis
          pariatur.
        </div>
      </div>
    )}

    {renderedItems.has("item 3") && (
      <div slot="item 3">
        Content of the item 3
        <button class="button-secondary" type="button">
          Some action
        </button>
      </div>
    )}

    <div slot="item 4 header">
      Custom header
      <input
        aria-label="Search"
        class="form-input"
        type="text"
        placeholder="Search..."
      />
      <ch-slider
        accessibleName="Temperature"
        class="slider slider-secondary"
        minValue={0}
        maxValue={50}
      ></ch-slider>
    </div>

    {renderedItems.has("item 4") && (
      <div slot="item 4">
        Content of the item 4
        <button class="button-tertiary" type="button">
          Some action
        </button>
      </div>
    )}
  </ch-accordion-render>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChAccordionRenderElement> =
  [
    {
      caption: "Properties",
      properties: [
        {
          id: "model",
          caption: "Model",
          type: "enum",
          value: accordionSimpleModel,
          values: [
            { caption: "Simple model", value: accordionSimpleModel },
            { caption: "Disabled model", value: accordionDisabledModel },
            {
              caption: "Expanded size model",
              value: accordionWithExpandedSizeModel
            }
          ]
        },
        {
          id: "singleItemExpanded",
          caption: "Single Item Expanded",
          type: "boolean",
          value: false
        },
        {
          id: "disabled",
          caption: "Disabled",
          type: "boolean",
          value: false
        }
      ]
    }
  ];

export const accordionShowcaseStory: ShowcaseStory<HTMLChAccordionRenderElement> =
  {
    properties: showcaseRenderProperties,
    markupWithUIModel: {
      uiModel: () => state.model,
      uiModelType: "AccordionModel",
      render: () => `<ch-accordion-render
          class="accordion"${renderBooleanPropertyOrEmpty("disabled", state)}
          model={this.#controlUIModel}${renderBooleanPropertyOrEmpty(
            "singleItemExpanded",
            state
          )}
          onExpandedChange={this.#handleExpandedItemChange}
        >
          {renderedItems.has("item 1") && (
            <div slot="item 1">Content of the item 1</div>
          )}

          {renderedItems.has("item 2") && (
            <div slot="item 2">
              Content of the item 2
              <button class="button-primary" type="button">
                Some action
              </button>
              <div>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga rem cum
                deleniti? Ullam sit saepe non laudantium dicta alias, corrupti dolores
                rerum sint, maiores expedita esse, molestias modi perspiciatis
                pariatur.
              </div>
              <div>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga rem cum
                deleniti? Ullam sit saepe non laudantium dicta alias, corrupti dolores
                rerum sint, maiores expedita esse, molestias modi perspiciatis
                pariatur.
              </div>
            </div>
          )}

          {renderedItems.has("item 3") && (
            <div slot="item 3">
              Content of the item 3
              <button class="button-secondary" type="button">
                Some action
              </button>
            </div>
          )}

          <div slot="item 4 header">
            Custom header
            <input
              aria-label="Search"
              class="form-input"
              type="text"
              placeholder="Search..."
            />
            <ch-slider
              accessibleName="Temperature"
              class="slider slider-secondary"
              minValue={0}
              maxValue={50}
            ></ch-slider>
          </div>

          {renderedItems.has("item 4") && (
            <div slot="item 4">
              Content of the item 4
              <button class="button-tertiary" type="button">
                Some action
              </button>
            </div>
          )}
        </ch-accordion-render>`
    },
    render: render,
    state: state
  };
