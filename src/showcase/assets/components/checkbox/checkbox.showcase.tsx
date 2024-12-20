import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import { renderShowcaseProperties, updateShowcase } from "../utils";

const state: Partial<HTMLChCheckboxElement> = {};
const formRefs: {
  [key in "form-checkbox-1" | "form-checkbox-2" | "form-checkbox-3"]:
    | HTMLFormElement
    | undefined;
} = {
  "form-checkbox-1": undefined,
  "form-checkbox-2": undefined,
  "form-checkbox-3": undefined
};

const formValues = {
  "checkbox-1": "",
  "checkbox-2": "",
  "checkbox-3": ""
};

const handleValueInput =
  (formId: keyof typeof formRefs, checkboxId: keyof typeof formValues) =>
  () => {
    formValues[checkboxId] = Object.fromEntries(new FormData(formRefs[formId]))[
      checkboxId
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
      <form id="form-checkbox-1" ref={el => (formRefs["form-checkbox-1"] = el)}>
        <ch-checkbox
          name="checkbox-1"
          accessibleName={state.accessibleName}
          caption={state.caption}
          class="checkbox"
          checkedValue={state.checkedValue}
          unCheckedValue={state.unCheckedValue}
          disabled={state.disabled}
          indeterminate={state.indeterminate}
          readonly={state.readonly}
          startImgSrc={state.startImgSrc}
          startImgType={state.startImgType}
          value={state.value}
          onInput={handleValueInput("form-checkbox-1", "checkbox-1")}
        ></ch-checkbox>
      </form>
      Form value: {formValues["checkbox-1"]}
    </fieldset>

    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">Label with HTML for</legend>
      <form id="form-checkbox-2" ref={el => (formRefs["form-checkbox-2"] = el)}>
        <label class="label" htmlFor="checkbox-2">
          Label for checkbox 2
        </label>

        <ch-checkbox
          id="checkbox-2"
          name="checkbox-2"
          accessibleName={state.accessibleName}
          caption={state.caption}
          class="checkbox"
          checkedValue={state.checkedValue}
          unCheckedValue={state.unCheckedValue}
          disabled={state.disabled}
          indeterminate={state.indeterminate}
          readonly={state.readonly}
          startImgSrc={state.startImgSrc}
          startImgType={state.startImgType}
          value={state.value}
          onInput={handleValueInput("form-checkbox-2", "checkbox-2")}
        ></ch-checkbox>
      </form>
      Form value: {formValues["checkbox-2"]}
    </fieldset>

    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">
        Component inside label
      </legend>
      <form id="form-checkbox-3" ref={el => (formRefs["form-checkbox-3"] = el)}>
        <label class="label" htmlFor="checkbox-3">
          Label for checkbox 3
          <ch-checkbox
            id="checkbox-3"
            name="checkbox-3"
            accessibleName={state.accessibleName}
            caption={state.caption}
            class="checkbox"
            checkedValue={state.checkedValue}
            unCheckedValue={state.unCheckedValue}
            disabled={state.disabled}
            indeterminate={state.indeterminate}
            readonly={state.readonly}
            startImgSrc={state.startImgSrc}
            startImgType={state.startImgType}
            value={state.value}
            onInput={handleValueInput("form-checkbox-3", "checkbox-3")}
          ></ch-checkbox>
        </label>
      </form>
      Form value: {formValues["checkbox-3"]}
    </fieldset>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChCheckboxElement> =
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
          id: "caption",
          caption: "Caption",
          value: "Option",
          type: "string"
        },
        {
          id: "startImgSrc",
          caption: "Start Image Src",
          value: "folder",
          type: "string"
        },
        {
          id: "startImgType",
          caption: "Start Image Type",
          type: "enum",
          values: [
            { caption: "Background", value: "background" },
            { caption: "Mask", value: "mask" }
          ],
          value: "background"
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

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChCheckboxElement>[] =
  [
    { name: "accessibleName", defaultValue: undefined, type: "string" },
    { name: "class", fixed: true, value: "checkbox", type: "string" },
    { name: "caption", defaultValue: undefined, type: "string" },
    { name: "disabled", defaultValue: false, type: "boolean" },
    { name: "checkedValue", defaultValue: undefined, type: "string" },
    { name: "indeterminate", defaultValue: false, type: "boolean" },
    { name: "readonly", defaultValue: false, type: "boolean" },
    { name: "startImgSrc", defaultValue: undefined, type: "string" },
    { name: "startImgType", defaultValue: "background", type: "string" },
    { name: "value", defaultValue: undefined, type: "string" },
    { name: "unCheckedValue", defaultValue: undefined, type: "string" },
    { name: "input", fixed: true, value: "handleValueChange", type: "event" }
  ];

export const checkboxShowcaseStory: ShowcaseStory<HTMLChCheckboxElement> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: {
    react: () => `<ChCheckbox${renderShowcaseProperties(
      state,
      "react",
      showcasePropertiesInfo
    )}
      ></ChCheckbox>`,

    stencil: () => `<ch-checkbox${renderShowcaseProperties(
      state,
      "stencil",
      showcasePropertiesInfo
    )}
        ></ch-checkbox>`
  },
  render: render,
  state: state
};
