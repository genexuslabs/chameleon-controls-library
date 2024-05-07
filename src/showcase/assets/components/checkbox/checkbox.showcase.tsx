import { h } from "@stencil/core";
import { CheckBox } from "../../../../components/checkbox/checkbox";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { Mutable } from "../../../../common/types";

const state: Partial<Mutable<CheckBox>> = {};

const render = () => (
  <div class="checkbox-test-main-wrapper">
    <fieldset>
      <legend class="heading-4 field-legend-test">No label</legend>

      <ch-checkbox
        accessibleName={state.accessibleName}
        caption={state.caption}
        class="checkbox"
        checkedValue={state.checkedValue}
        unCheckedValue={state.unCheckedValue}
        disabled={state.disabled}
        indeterminate={state.indeterminate}
        readonly={state.readonly}
        value={state.value}
      ></ch-checkbox>
    </fieldset>

    <fieldset>
      <legend class="heading-4 field-legend-test">Label with HTML for</legend>

      <label class="form-input__label" htmlFor="checkbox-2">
        Label for checkbox 2
      </label>
      <ch-checkbox
        id="checkbox-2"
        accessibleName={state.accessibleName}
        caption={state.caption}
        class="checkbox"
        checkedValue={state.checkedValue}
        unCheckedValue={state.unCheckedValue}
        disabled={state.disabled}
        indeterminate={state.indeterminate}
        readonly={state.readonly}
        value={state.value}
      ></ch-checkbox>
    </fieldset>

    <fieldset>
      <legend class="heading-4 field-legend-test">
        Component inside label
      </legend>

      <label class="form-input__label" htmlFor="checkbox-3">
        Label for checkbox 3
        <ch-checkbox
          id="checkbox-3"
          accessibleName={state.accessibleName}
          caption={state.caption}
          class="checkbox"
          checkedValue={state.checkedValue}
          unCheckedValue={state.unCheckedValue}
          disabled={state.disabled}
          indeterminate={state.indeterminate}
          readonly={state.readonly}
          value={state.value}
        ></ch-checkbox>
      </label>
    </fieldset>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<Mutable<CheckBox>> = [
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
        id: "caption",
        caption: "Caption",
        value: "Option",
        type: "string"
      },
      {
        id: "checkedValue",
        caption: "Checked Value",
        value: "true",
        type: "string"
      },
      {
        id: "unCheckedValue",
        caption: "Unchecked Value",
        value: "false",
        type: "string"
      },
      {
        id: "disabled",
        caption: "Disabled",
        value: false,
        type: "boolean"
      },
      {
        id: "indeterminate",
        caption: "Indeterminate",
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
  }
];

export const checkboxShowcaseStory: ShowcaseStory<Mutable<CheckBox>> = {
  properties: showcaseRenderProperties,
  render: render,
  state: state
};
