import { forceUpdate, h } from "@stencil/core";
import { ChSwitch } from "../../../../components/switch/switch";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { Mutable } from "../../../../common/types";

const state: Partial<Mutable<ChSwitch>> = {};
const formRefs: {
  [key in "form-switch-1" | "form-switch-2" | "form-switch-3"]:
    | HTMLFormElement
    | undefined;
} = {
  "form-switch-1": undefined,
  "form-switch-2": undefined,
  "form-switch-3": undefined
};

const formValues = {
  "switch-1": "",
  "switch-2": "",
  "switch-3": ""
};

const handleValueInput =
  (formId: keyof typeof formRefs, switchId: keyof typeof formValues) => () => {
    formValues[switchId] = Object.fromEntries(new FormData(formRefs[formId]))[
      switchId
    ] as string;

    // TODO: Until we support external slots in the ch-flexible-layout-render,
    // this is a hack to update the render of the widget and thus re-render the
    // combo-box updating the displayed items
    const showcaseRef = formRefs[formId].closest("ch-showcase");

    if (showcaseRef) {
      forceUpdate(showcaseRef);
    }
  };

const render = () => (
  <div class="checkbox-test-main-wrapper">
    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">No label</legend>
      <form id="form-switch-1" ref={el => (formRefs["form-switch-1"] = el)}>
        <ch-switch
          name="switch-1"
          accessibleName={state.accessibleName}
          class="switch"
          checkedValue={state.checkedValue}
          unCheckedValue={state.unCheckedValue}
          checkedCaption={state.checkedCaption}
          unCheckedCaption={state.unCheckedCaption}
          disabled={state.disabled}
          value={state.value}
          onInput={handleValueInput("form-switch-1", "switch-1")}
        ></ch-switch>
      </form>
      Form value: {formValues["switch-1"]}
    </fieldset>

    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">Label with HTML for</legend>
      <form id="form-switch-2" ref={el => (formRefs["form-switch-2"] = el)}>
        <label class="form-input__label" htmlFor="switch-2">
          Label for switch 2
        </label>

        <ch-switch
          id="switch-2"
          name="switch-2"
          accessibleName={state.accessibleName}
          class="switch"
          checkedValue={state.checkedValue}
          unCheckedValue={state.unCheckedValue}
          checkedCaption={state.checkedCaption}
          unCheckedCaption={state.unCheckedCaption}
          disabled={state.disabled}
          value={state.value}
          onInput={handleValueInput("form-switch-2", "switch-2")}
        ></ch-switch>
      </form>
      Form value: {formValues["switch-2"]}
    </fieldset>

    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">
        Component inside label
      </legend>
      <form id="form-switch-3" ref={el => (formRefs["form-switch-3"] = el)}>
        <label class="form-input__label" htmlFor="switch-3">
          Label for switch 3
          <ch-switch
            id="switch-3"
            name="switch-3"
            accessibleName={state.accessibleName}
            class="switch"
            checkedValue={state.checkedValue}
            unCheckedValue={state.unCheckedValue}
            checkedCaption={state.checkedCaption}
            unCheckedCaption={state.unCheckedCaption}
            disabled={state.disabled}
            value={state.value}
            onInput={handleValueInput("form-switch-3", "switch-3")}
          ></ch-switch>
        </label>
      </form>
      Form value: {formValues["switch-3"]}
    </fieldset>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<Mutable<ChSwitch>> = [
  {
    caption: "Properties",
    properties: [
      {
        id: "accessibleName",
        caption: "Accessible Name",
        value: undefined,
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
        value: undefined,
        type: "string"
      },
      {
        id: "checkedCaption",
        caption: "Checked Caption",
        value: "Checked caption",
        type: "string"
      },
      {
        id: "unCheckedCaption",
        caption: "Unchecked Caption",
        value: "Unchecked caption",
        type: "string"
      },
      {
        id: "disabled",
        caption: "Disabled",
        value: false,
        type: "boolean"
      }
    ]
  }
];

export const switchShowcaseStory: ShowcaseStory<Mutable<ChSwitch>> = {
  properties: showcaseRenderProperties,
  render: render,
  state: state
};
