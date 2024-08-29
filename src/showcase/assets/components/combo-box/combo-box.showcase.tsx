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
  ComboBoxSuggestOptions,
  ComboBoxItemModel
} from "../../../../components/combo-box/types";
import { ChComboBoxRenderCustomEvent } from "../../../../components";
import { renderBooleanPropertyOrEmpty } from "../utils";

const state: Partial<Mutable<ChComboBoxRender>> = {};
let itemsFilteredByTheServer: ComboBoxItemModel[] = [];

// TODO: There is an issue when setting suggest, items are already filtered, string filter and the input equals to "data"

const handleFilterChange = (event: ChComboBoxRenderCustomEvent<string>) => {
  // Filters on the client
  if (state.suggestOptions.alreadyProcessed !== true) {
    return;
  }

  itemsFilteredByTheServer = comboBoxFilterChange({
    filter: event.detail,
    options: state.suggestOptions
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
        popoverInlineAlign={state.popoverInlineAlign}
        model={
          state.suggestOptions.alreadyProcessed === true && state.suggest
            ? itemsFilteredByTheServer
            : state.model
        }
        readonly={state.readonly}
        resizable={state.readonly}
        suggest={state.suggest}
        suggestDebounce={state.suggestDebounce}
        suggestOptions={state.suggestOptions}
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
        popoverInlineAlign={state.popoverInlineAlign}
        model={
          state.suggestOptions.alreadyProcessed === true && state.suggest
            ? itemsFilteredByTheServer
            : state.model
        }
        readonly={state.readonly}
        resizable={state.readonly}
        suggest={state.suggest}
        suggestDebounce={state.suggestDebounce}
        suggestOptions={state.suggestOptions}
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
          popoverInlineAlign={state.popoverInlineAlign}
          model={
            state.suggestOptions.alreadyProcessed === true && state.suggest
              ? itemsFilteredByTheServer
              : state.model
          }
          readonly={state.readonly}
          resizable={state.resizable}
          suggest={state.suggest}
          suggestDebounce={state.suggestDebounce}
          suggestOptions={state.suggestOptions}
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
        id: "resizable",
        caption: "Resizable",
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
    caption: "Suggest",
    properties: [
      {
        id: "suggest",
        caption: "Suggest",
        value: false,
        type: "boolean"
      },
      {
        id: "filter",
        caption: "Filter",
        value: "",
        type: "string"
      },
      {
        id: "suggestDebounce",
        caption: "Debounce",
        value: 250,
        type: "number"
      },
      {
        id: "suggestOptions",
        caption: "Options",
        type: "object",
        render: "independent-properties",
        properties: [
          {
            id: "alreadyProcessed",
            caption: "Items are already filtered / Server filters",
            value: false,
            type: "boolean"
          },
          {
            id: "matchCase",
            caption: "Apply camel casing",
            value: false,
            type: "boolean"
          },
          {
            id: "hideMatchesAndShowNonMatches",
            caption: "Hide matches and show non-matches",
            value: false,
            type: "boolean"
          },
          {
            id: "strict",
            caption: "Strict filter",
            value: false,
            type: "boolean"
          }
        ] satisfies ShowcaseRenderProperty<ComboBoxSuggestOptions>[]
      }
    ]
  }
];

export const comboBoxShowcaseStory: ShowcaseStory<Mutable<ChComboBoxRender>> = {
  properties: showcaseRenderProperties,
  markupWithUIModel: {
    uiModel: () => state.model,
    uiModelType: "ComboBoxModel",
    render: () => `<ch-combo-box-render
          accessibleName="${state.accessibleName}"
          class="combo-box"${renderBooleanPropertyOrEmpty("disabled", state)}
          filter="${state.filter}"
          model={this.#controlUIModel}${renderBooleanPropertyOrEmpty(
            "suggest",
            state
          )}
          placeholder="${state.placeholder}"
          suggestDebounce={${
            state.suggestDebounce
          }}${renderBooleanPropertyOrEmpty(
      "readonly",
      state
    )}${renderBooleanPropertyOrEmpty("resizable", state)}
          value="${state.value}"
          onInput={this.#handleValueChange}
          onFilterChange={this.#handleFilterChange}
        ></ch-combo-box-render>`
  },
  render: render,
  state: state
};
