import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import {
  itemsPerPageOptionsModel,
  PaginatorRenderHyperlinkModel,
  paginatorRenderNumericModel,
  PaginatorRenderNumericModelWithoutUrlMapping,
  PaginatorRenderNumericModelWithoutTotalPages
} from "./models";
import { renderShowcaseProperties } from "../utils";
import {
  FIRST_ITEM_IN_PAGE,
  LAST_ITEM_IN_PAGE,
  TOTAL_ITEMS,
  ACTUAL_PAGE,
  TOTAL_PAGES
} from "../../../../components/paginator-render/constants";

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
        },
        {
          id: "maxPagesToShowLeft",
          caption: "Max number of pages shown to the left",
          value: 3,
          type: "number"
        },
        {
          id: "maxPagesToShowRight",
          caption: "Max number of pages shown to the right",
          value: 3,
          type: "number"
        },
        {
          id: "selectedPage",
          caption: "selected page",
          value: "1",
          type: "string"
        },
        {
          id: "showFirstControl",
          caption: "Show first control",
          value: true,
          type: "boolean"
        },
        {
          id: "showItemsPerPage",
          caption: "Show items per page",
          value: false,
          type: "boolean"
        },
        {
          id: "showItemsPerPageInfo",
          caption: "Show items per page info",
          value: false,
          type: "boolean"
        },
        {
          id: "showLastControl",
          caption: "Show last control",
          value: true,
          type: "boolean"
        },
        {
          id: "showNextControl",
          caption: "Show next control",
          value: true,
          type: "boolean"
        },
        {
          id: "showPrevControl",
          caption: "Show previous control",
          value: true,
          type: "boolean"
        },
        {
          id: "showNavigationControls",
          caption: "Show navigation controls",
          value: true,
          type: "boolean"
        },
        {
          id: "showNavigationControlsInfo",
          caption: "Show navigation controls info",
          value: false,
          type: "boolean"
        },
        {
          id: "showNavigationGoTo",
          caption: "Show navigation go to",
          value: false,
          type: "boolean"
        },
        {
          id: "totalItems",
          caption: "Total amount of items shown",
          value: undefined,
          type: "number"
        },
        {
          id: "hasNextPage",
          caption: "Has next page",
          type: "enum",
          values: [
            {
              caption: "true",
              value: true
            },
            {
              caption: "false",
              value: false
            }
          ],
          value: true
        }
      ]
    }
  ];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChPaginatorRenderElement>[] =
  [
    { name: "selectedPage", defaultValue: 1, type: "number" },
    { name: "hasNextPage", defaultValue: false, type: "boolean" },
    { name: "itemsPerPage", defaultValue: 10, type: "number" },
    { name: "maxPagesToShowLeft", defaultValue: 3, type: "number" },
    { name: "maxPagesToShowRight", defaultValue: 3, type: "number" },
    { name: "showItemsPerPage", defaultValue: false, type: "boolean" },
    { name: "showItemsPerPageInfo", defaultValue: false, type: "boolean" },
    { name: "showNavigationControls", defaultValue: true, type: "boolean" },
    {
      name: "showNavigationControlsInfo",
      defaultValue: false,
      type: "boolean"
    },
    { name: "showNavigationGoTo", defaultValue: false, type: "boolean" },
    { name: "showLastControl", defaultValue: false, type: "boolean" },
    { name: "totalItems", defaultValue: undefined, type: "number" }
  ];

const render = () => (
  <div class="wrapper">
    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">Navigation Controls</legend>
      <ch-paginator-render
        model={state.model}
        hasNextPage={state.hasNextPage}
        itemsPerPage={state.itemsPerPage}
        itemsPerPageOptions={itemsPerPageOptionsModel}
        selectedPage={state.selectedPage}
        maxPagesToShowLeft={state.maxPagesToShowLeft}
        maxPagesToShowRight={state.maxPagesToShowRight}
        showFirstControl={state.showFirstControl}
        showLastControl={state.showLastControl}
        showPrevControl={state.showPrevControl}
        showNextControl={state.showNextControl}
        showItemsPerPage={state.showItemsPerPage}
        showItemsPerPageInfo={state.showItemsPerPageInfo}
        showNavigationControls={state.showNavigationControls}
        showNavigationControlsInfo={state.showNavigationControlsInfo}
        showNavigationGoTo={state.showNavigationGoTo}
        totalItems={state.totalItems}
      ></ch-paginator-render>
    </fieldset>
    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">Unanimo Paginator</legend>
      <ch-paginator-render
        model={state.model}
        itemsPerPageOptions={itemsPerPageOptionsModel}
        selectedPage={state.selectedPage}
        itemsPerPage={state.itemsPerPage}
        maxPagesToShowLeft={2}
        maxPagesToShowRight={2}
        showFirstControl={false}
        showItemsPerPage
        showItemsPerPageInfo
        showLastControl={false}
        showNavigationGoTo={false}
        showNavigationControlsInfo={state.showNavigationControlsInfo}
        showNextControl
        showPrevControl
        totalItems={state.totalItems}
        translations={{
          accessibleName: {
            goToInput: "Go to page",
            itemsPerPageOptions: "Select amount of items to show"
          },
          text: {
            goToButton: "Go",
            itemsPerPage: "Show",
            of: "of ",
            ellipsis: "...",
            first: "",
            prev: "",
            next: "",
            last: "",
            unknownPages: "many",
            unknownItems: "many",
            showingItems: `Showing ${FIRST_ITEM_IN_PAGE} - ${LAST_ITEM_IN_PAGE} out of ${TOTAL_ITEMS} items`,
            page: "",
            showingPage: `Showing ${ACTUAL_PAGE} of ${TOTAL_PAGES} pages`
          }
        }}
      ></ch-paginator-render>
    </fieldset>
    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">Mercury Paginator</legend>
      <ch-paginator-render
        model={state.model}
        itemsPerPageOptions={itemsPerPageOptionsModel}
        selectedPage={state.selectedPage}
        itemsPerPage={state.itemsPerPage}
        order={{
          itemsPerPage: 1,
          itemsPerPageInfo: 2,
          firstControl: 3,
          prevControl: 4,
          navigationGoTo: 5,
          nextControl: 6,
          lastControl: 7
        }}
        showFirstControl
        showItemsPerPage
        showItemsPerPageInfo
        showLastControl
        showNavigationControls={false}
        showNavigationGoTo
        showNextControl
        showPrevControl
        totalItems={state.totalItems}
        translations={{
          accessibleName: {
            goToInput: "Go to page",
            itemsPerPageOptions: "Select amount of items to show"
          },
          text: {
            goToButton: "",
            itemsPerPage: "Items per page",
            of: "of ",
            ellipsis: "...",
            first: "",
            prev: "",
            next: "",
            last: "",
            unknownPages: "many",
            unknownItems: "many",
            showingItems: `${FIRST_ITEM_IN_PAGE} - ${LAST_ITEM_IN_PAGE} of ${TOTAL_ITEMS} items`,
            page: "",
            showingPage: `Showing ${ACTUAL_PAGE} of ${TOTAL_PAGES} pages`
          }
        }}
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
