import { forceUpdate, h } from "@stencil/core";
import { ChComboBoxRender } from "../../../../components/combo-box/combo-box";
import {
  ShowcaseRenderProperties,
  ShowcaseRenderProperty,
  ShowcaseStory
} from "../types";
import { Mutable } from "../../../../common/types";
import {
  comboBoxFilterChange,
  dataTypeInGeneXus,
  simpleModel1,
  smallModel
} from "./models";
import {
  ComboBoxFilterOptions,
  ComboBoxItemModel
} from "../../../../components/combo-box/types";
import { ChComboBoxRenderCustomEvent } from "../../../../components";

const state: Partial<Mutable<ChComboBoxRender>> = {};
let itemsFilteredByTheServer: ComboBoxItemModel[] = [];

const handleFilterChange = (event: ChComboBoxRenderCustomEvent<string>) => {
  // Filters on the client
  if (state.filterOptions.alreadyProcessed !== true) {
    return;
  }

  itemsFilteredByTheServer = comboBoxFilterChange(state.filterType, {
    filter: event.detail,
    filterOptions: state.filterOptions
  });

  // TODO: Until we support external slots in the ch-flexible-layout-render,
  // this is a hack to update the render of the widget and thus re-render the
  // combo-box updating the displayed items
  const showcaseRef = event.target.closest("ch-showcase");

  if (showcaseRef) {
    forceUpdate(showcaseRef);
  }
};

const render = () => (
  <div class="checkbox-test-main-wrapper">
    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">No label</legend>

      <ch-combo-box-render
        accessibleName={state.accessibleName}
        placeholder={state.placeholder}
        class="combo-box"
        disabled={state.disabled}
        destroyItemsOnClose={state.destroyItemsOnClose}
        filter={state.filter}
        filterDebounce={state.filterDebounce}
        filterOptions={state.filterOptions}
        filterType={state.filterType}
        popoverInlineAlign={state.popoverInlineAlign}
        model={
          state.filterOptions.alreadyProcessed === true &&
          state.filterType !== "none"
            ? itemsFilteredByTheServer
            : state.model
        }
        readonly={state.readonly}
        value={state.value}
        onFilterChange={handleFilterChange}
      ></ch-combo-box-render>
    </fieldset>

    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">Label with HTML for</legend>

      <label class="form-input__label" htmlFor="checkbox-2">
        Label for combo-box 2
      </label>
      <ch-combo-box-render
        id="checkbox-2"
        accessibleName={state.accessibleName}
        placeholder={state.placeholder}
        class="combo-box"
        disabled={state.disabled}
        destroyItemsOnClose={state.destroyItemsOnClose}
        filter={state.filter}
        filterDebounce={state.filterDebounce}
        filterOptions={state.filterOptions}
        filterType={state.filterType}
        popoverInlineAlign={state.popoverInlineAlign}
        model={
          state.filterOptions.alreadyProcessed === true &&
          state.filterType !== "none"
            ? itemsFilteredByTheServer
            : state.model
        }
        readonly={state.readonly}
        value={state.value}
        onFilterChange={handleFilterChange}
      ></ch-combo-box-render>
    </fieldset>

    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">
        Component inside label
      </legend>

      <label class="form-input__label" htmlFor="checkbox-3">
        Label for combo-box 3
        <ch-combo-box-render
          id="checkbox-3"
          accessibleName={state.accessibleName}
          placeholder={state.placeholder}
          class="combo-box"
          disabled={state.disabled}
          destroyItemsOnClose={state.destroyItemsOnClose}
          filter={state.filter}
          filterDebounce={state.filterDebounce}
          filterOptions={state.filterOptions}
          filterType={state.filterType}
          popoverInlineAlign={state.popoverInlineAlign}
          model={
            state.filterOptions.alreadyProcessed === true &&
            state.filterType !== "none"
              ? itemsFilteredByTheServer
              : state.model
          }
          readonly={state.readonly}
          value={state.value}
          onFilterChange={handleFilterChange}
        ></ch-combo-box-render>
      </label>
    </fieldset>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<
  Mutable<ChComboBoxRender>
> = [
  {
    caption: "Models",
    properties: [
      {
        id: "model",
        accessibleName: "Model",
        type: "enum",
        values: [
          { caption: "Simple Model", value: simpleModel1 },
          { caption: "Small Model", value: smallModel },
          { caption: "Data Type Model in GeneXus", value: dataTypeInGeneXus }
        ],
        value: simpleModel1
      }
    ]
  },
  {
    caption: "Properties",
    properties: [
      {
        id: "accessibleName",
        caption: "Accessible Name",
        value: "Option",
        type: "string"
      },
      {
        id: "placeholder",
        caption: "Placeholder",
        value: "Select an option...",
        type: "string"
      },
      {
        id: "popoverInlineAlign",
        caption: "Popover Inline Align",
        value: "inside-start",
        type: "enum",
        values: [
          {
            value: "outside-start",
            caption: "outside-start"
          },
          {
            value: "inside-start",
            caption: "inside-start"
          },
          { value: "center", caption: "center" },
          {
            value: "inside-end",
            caption: "inside-end"
          },
          {
            value: "outside-end",
            caption: "outside-end"
          }
        ]
      },
      {
        id: "destroyItemsOnClose",
        caption: "Destroy Items On Close",
        value: false,
        type: "boolean"
      },
      {
        id: "disabled",
        caption: "Disabled",
        value: false,
        type: "boolean"
      },
      {
        id: "readonly",
        caption: "Readonly",
        value: false,
        type: "boolean"
      }
    ]
  },
  {
    caption: "Filters",
    columns: 2,
    properties: [
      {
        id: "filterType",
        caption: "Filter Type",
        value: "none",
        type: "enum",
        values: [
          { caption: "None", value: "none" },
          { caption: "Caption", value: "caption" },
          { caption: "Value", value: "value" },
          { caption: "List", value: "list" }
        ]
      },
      {
        id: "filterDebounce",
        caption: "Filter Debounce",
        value: 250,
        type: "number"
      },
      {
        id: "filter",
        columnSpan: 2,
        caption: "Filter",
        value: "",
        type: "string"
      },
      {
        id: "filterOptions",
        type: "object",
        render: "independent-properties",
        properties: [
          {
            id: "alreadyProcessed",
            columnSpan: 2,
            caption: "Items are already filtered / Server filters",
            value: false,
            type: "boolean"
          },
          {
            id: "matchCase",
            columnSpan: 2,
            caption: "Apply camel casing",
            value: false,
            type: "boolean"
          },
          {
            id: "hideMatchesAndShowNonMatches",
            columnSpan: 2,
            caption: "Hide matches and show non-matches",
            value: false,
            type: "boolean"
          },
          {
            id: "strict",
            columnSpan: 2,
            caption: "Strict filter",
            value: false,
            type: "boolean"
          }
        ] satisfies ShowcaseRenderProperty<ComboBoxFilterOptions>[]
      }
    ]
  }
];

export const comboBoxShowcaseStory: ShowcaseStory<Mutable<ChComboBoxRender>> = {
  properties: showcaseRenderProperties,
  markupWithUIModel: {
    uiModel: simpleModel1,
    uiModelType: "ComboBoxModel",
    render: `<ch-combo-box-render
          class="combo-box"
          model={this.#controlUIModel}
          value={<initial value (optional)>}
          onInput={this.#handleValueChange}
          onFilterChange={this.#handleFilterChange}
        ></ch-combo-box-render>`
  },
  render: render,
  state: state
};
