import { forceUpdate, h } from "@stencil/core";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { Mutable } from "../../../../common/types";
import { ChAccordionRender } from "../../../../components/accordion/accordion";
import { disabledModel, simpleModel } from "./models";
import {
  AccordionItemExpandedChangeEvent,
  ChAccordionRenderCustomEvent
} from "../../../../components";

const state: Partial<Mutable<ChAccordionRender>> = {};

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
        values: [
          { caption: "Simple model", value: simpleModel },
          { caption: "Disabled model", value: disabledModel }
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

export const accordionShowcaseStory: ShowcaseStory<Mutable<ChAccordionRender>> =
  {
    properties: showcaseRenderProperties,
    markupWithUIModel: {
      uiModel: simpleModel,
      uiModelType: "TabModel",
      render: `<ch-accordion-render
          class="accordion"
          model={state.model}
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
    
           {renderedItems.has("item 4") && [
            <div slot="item 4 header">
              Custom header
              <input
                aria-label="Search"
                class="form-input"
                type="text"
                placeholder="Search..."
              />
            </div>,
    
             <div slot="item 4">
              Content of the item 4
              <button class="button-tertiary" type="button">
                Some action
              </button>
            </div>
          ]}
        </ch-accordion-render>`
    },
    render: render,
    state: state
  };
