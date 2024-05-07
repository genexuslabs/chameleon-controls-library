import { h } from "@stencil/core";
import { ChComboBox } from "../../../../components/combobox/combo-box";
import {
  ShowcaseRenderProperties,
  ShowcaseRenderProperty,
  ShowcaseStory
} from "../showcase/types";
import { Mutable } from "../../../../common/types";
import { dataTypeInGeneXus, simpleModel1, smallModel } from "./models";
import { ComboBoxFilterOptions } from "../../../../components/combobox/types";

const state: Partial<Mutable<ChComboBox>> = {};

const render = () => (
  <div class="checkbox-test-main-wrapper">
    <fieldset>
      <legend class="heading-4 field-legend-test">No label</legend>

      <ch-combo-box
        accessibleName={state.accessibleName}
        placeholder={state.placeholder}
        class="combo-box"
        disabled={state.disabled}
        filter={state.filter}
        filterDebounce={state.filterDebounce}
        filterList={state.filterList}
        filterOptions={state.filterOptions}
        filterType={state.filterType}
        items={state.items}
        readonly={state.readonly}
        value={state.value}
      ></ch-combo-box>
    </fieldset>

    <fieldset>
      <legend class="heading-4 field-legend-test">Label with HTML for</legend>

      <label class="form-input__label" htmlFor="checkbox-2">
        Label for combo-box 2
      </label>
      <ch-combo-box
        id="checkbox-2"
        accessibleName={state.accessibleName}
        placeholder={state.placeholder}
        class="combo-box"
        disabled={state.disabled}
        items={state.items}
        readonly={state.readonly}
        value={state.value}
      ></ch-combo-box>
    </fieldset>

    <fieldset>
      <legend class="heading-4 field-legend-test">
        Component inside label
      </legend>

      <label class="form-input__label" htmlFor="checkbox-3">
        Label for combo-box 3
        <ch-combo-box
          id="checkbox-3"
          accessibleName={state.accessibleName}
          placeholder={state.placeholder}
          class="combo-box"
          disabled={state.disabled}
          items={state.items}
          readonly={state.readonly}
          value={state.value}
        ></ch-combo-box>
      </label>
    </fieldset>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<Mutable<ChComboBox>> =
  [
    {
      caption: "Models",
      properties: [
        {
          id: "items",
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
          value: "Option",
          type: "string"
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
            }
          ] satisfies ShowcaseRenderProperty<ComboBoxFilterOptions>[]
        }
      ]
    }
  ];

export const comboBoxShowcaseStory: ShowcaseStory<Mutable<ChComboBox>> = {
  properties: showcaseRenderProperties,
  render: render,
  state: state
};
