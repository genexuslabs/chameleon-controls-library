import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import {
  customOrder,
  itemsPerPageOptionsModel,
  PaginatorRenderHyperlinkModel,
  paginatorRenderNumericModel,
  PaginatorRenderNumericModelWithoutUrlMapping,
  PaginatorRenderNumericModelWithoutTotalPages
} from "./models";
import { renderShowcaseProperties } from "../utils";

const state: Partial<HTMLChPaginatorRenderElement> = {};

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChPaginatorRenderElement> =
  [
    {
      caption: "Models",
      properties: [
        {
          id: "model",
          accessibleName: "Model",
          type: "enum",
          values: [
            {
              caption: "Numeric Model",
              value: paginatorRenderNumericModel
            },
            {
              caption: "Hyperlinks Model",
              value: PaginatorRenderHyperlinkModel
            },
            {
              caption: "Numeric Model without urlMapping",
              value: PaginatorRenderNumericModelWithoutUrlMapping
            },
            {
              caption: "Numeric Model without total pages",
              value: PaginatorRenderNumericModelWithoutTotalPages
            }
          ],
          value: paginatorRenderNumericModel
        }
      ]
    }
  ];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChPaginatorRenderElement>[] =
  [
    { name: "selectedPage", defaultValue: 1, type: "number" },
    { name: "itemsPerPage", defaultValue: 10, type: "number" },
    { name: "showItemsPerPage", defaultValue: true, type: "boolean" },
    { name: "showItemsPerPageInfo", defaultValue: true, type: "boolean" },
    { name: "ShowNavigationControls", defaultValue: true, type: "boolean" },
    { name: "ShowNavigationControlsInfo", defaultValue: true, type: "boolean" },
    { name: "ShowNavigationGoTo", defaultValue: true, type: "boolean" }
  ];

const render = () => (
  <div class="wrapper">
    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">Navigation Controls</legend>
      <ch-paginator-render
        model={state.model}
        itemsPerPageOptions={itemsPerPageOptionsModel}
        selectedPage={4}
        itemsPerPage={10}
        totalItems={345}
        maxPagesToShowLeft={2}
        maxPagesToShowRight={2}
        showFirstControl
        showLastControl
        showPrevControl
        showNextControl
        showItemsPerPage
        showNavigationGoTo
      ></ch-paginator-render>
    </fieldset>
    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">Items Per Page</legend>
      <ch-paginator-render
        model={state.model}
        itemsPerPageOptions={itemsPerPageOptionsModel}
        selectedPage={1}
        itemsPerPage={10}
        totalItems={345}
        showItemsPerPage
        showItemsPerPageInfo
        showNavigationControls={false}
        showFirstControl
        showLastControl
        showPrevControl
        showNextControl
        showNavigationGoTo
        order={{
          itemsPerPage: 1,
          itemsPerPageInfo: 2,
          firstControl: 3,
          prevControl: 4,
          navigationGoTo: 5,
          nextControl: 6,
          lastControl: 7
        }}
      ></ch-paginator-render>
    </fieldset>
    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">Navigation Go To</legend>
      <ch-paginator-render
        model={state.model}
        itemsPerPageOptions={itemsPerPageOptionsModel}
        selectedPage={1}
        itemsPerPage={10}
        showNavigationGoTo
        showNavigationControlsInfo
        showNavigationControls={false}
      ></ch-paginator-render>
    </fieldset>
    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">Paginator Information</legend>
      <ch-paginator-render
        model={state.model}
        itemsPerPageOptions={itemsPerPageOptionsModel}
        selectedPage={1}
        itemsPerPage={10}
        totalItems={345}
        showItemsPerPageInfo
        showNavigationControlsInfo
      ></ch-paginator-render>
    </fieldset>
    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">
        Paginator with all components rendered
      </legend>
      <ch-paginator-render
        model={state.model}
        itemsPerPageOptions={itemsPerPageOptionsModel}
        selectedPage={1}
        itemsPerPage={10}
        totalItems={250}
        showItemsPerPageInfo
        showNavigationControlsInfo
        showFirstControl
        showLastControl
        showItemsPerPage
        showNavigationControls
        showNavigationGoTo
        showPrevControl
        showNextControl
        order={customOrder}
      ></ch-paginator-render>
    </fieldset>
  </div>
);

export const paginatorRenderShowcaseStory: ShowcaseStory<HTMLChPaginatorRenderElement> =
  {
    properties: showcaseRenderProperties,
    markupWithUIModel: {
      uiModel: () => state.model,
      uiModelType: "PaginatorRenderModel",
      render: {
        react: () => `<ChPaginatorRender${renderShowcaseProperties(
          state,
          "react",
          showcasePropertiesInfo
        )}
      ></ChPaginatorRender>`,

        stencil: () => `<ch-paginator-render${renderShowcaseProperties(
          state,
          "stencil",
          showcasePropertiesInfo
        )}
        ></ch-paginator-render>`
      }
    },
    render: render,
    state: state
  };
