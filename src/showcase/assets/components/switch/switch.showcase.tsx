import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import { renderShowcaseProperties, updateShowcase } from "../utils";

const state: Partial<HTMLChSwitchElement> = {};
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
    updateShowcase();
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
        <label class="label" htmlFor="switch-2">
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
        <label class="label" htmlFor="switch-3">
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

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChSwitchElement> =
  [
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

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChSwitchElement>[] =
  [
    { name: "accessibleName", defaultValue: undefined, type: "string" },
    {
      name: "class",
      fixed: true,
      value: "switch",
      type: "string"
    },
    { name: "checkedCaption", defaultValue: undefined, type: "string" },
    { name: "checkedValue", defaultValue: undefined, type: "string" },
    { name: "disabled", defaultValue: false, type: "boolean" },
    { name: "name", defaultValue: undefined, type: "string" },
    { name: "unCheckedCaption", defaultValue: undefined, type: "string" },
    { name: "unCheckedValue", defaultValue: undefined, type: "string" },
    { name: "value", defaultValue: undefined, type: "string" },
    { name: "input", fixed: true, value: "handleInput", type: "event" }
  ];

export const switchShowcaseStory: ShowcaseStory<HTMLChSwitchElement> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: {
    react: () => `<ChSwitch${renderShowcaseProperties(
      state,
      "react",
      showcasePropertiesInfo
    )}
      ></ChSwitch>`,

    stencil: () => `<ch-switch${renderShowcaseProperties(
      state,
      "stencil",
      showcasePropertiesInfo
    )}
        ></ch-switch>`
  },
  render: render,
  state: state
};
