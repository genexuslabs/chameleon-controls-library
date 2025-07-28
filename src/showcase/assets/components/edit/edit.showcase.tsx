import { h } from "@stencil/core";
import { dataTypeInGeneXus } from "../combo-box/models";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import {
  renderShowcaseProperties,
  showcaseTemplateClassProperty,
  updateShowcase
} from "../utils";
import { dummyPictureCallback } from "./models";

const state: Partial<HTMLChEditElement> = {};
const formRefs: {
  [key in "form-edit-1" | "form-edit-2" | "form-edit-3"]:
    | HTMLFormElement
    | undefined;
} = {
  "form-edit-1": undefined,
  "form-edit-2": undefined,
  "form-edit-3": undefined
};

const formValues = {
  "edit-1": "",
  "edit-2": "",
  "edit-3": ""
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
    <fieldset class="fieldset-test form-test-edit">
      <legend class="heading-4 field-legend-test">No label</legend>
      <form id="form-edit-1" ref={el => (formRefs["form-edit-1"] = el)}>
        <ch-edit
          name="edit-1"
          accessibleName={state.accessibleName}
          autocapitalize={state.autocapitalize}
          autocomplete={state.autocomplete}
          autoGrow={state.autoGrow}
          class="input"
          debounce={state.debounce}
          disabled={state.disabled}
          maxLength={state.maxLength}
          mode={state.mode}
          multiline={state.multiline}
          pattern={state.pattern}
          placeholder={state.placeholder}
          picture={state.picture}
          pictureCallback={dummyPictureCallback}
          preventEnterOnInputEditorMode={state.preventEnterOnInputEditorMode}
          value={state.value}
          showAdditionalContentAfter={state.showAdditionalContentAfter}
          showAdditionalContentBefore={state.showAdditionalContentBefore}
          showPassword={state.showPassword}
          showPasswordButton={state.showPasswordButton}
          spellcheck={state.spellcheck}
          startImgSrc={state.startImgSrc}
          startImgType={state.startImgType}
          type={state.type}
          readonly={state.readonly}
          onInput={handleValueInput("form-edit-1", "edit-1")}
          onKeyDown={keyDownHandler}
        >
          {state.showAdditionalContentBefore && (
            <button
              slot="additional-content-before"
              class="button-primary"
              type="button"
            >
              Action
            </button>
          )}

          {state.showAdditionalContentAfter && (
            <ch-combo-box-render
              slot="additional-content-after"
              accessibleName="Data Types"
              class="combo-box"
              model={dataTypeInGeneXus}
            ></ch-combo-box-render>
          )}
        </ch-edit>
      </form>
      Form value: {formValues["edit-1"]}
    </fieldset>

    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">Label with HTML for</legend>
      <form
        id="form-edit-2"
        class="form-test-edit"
        ref={el => (formRefs["form-edit-2"] = el)}
      >
        <label class="label" htmlFor="edit-2">
          Label for edit 2
        </label>

        <ch-edit
          id="edit-2"
          name="edit-2"
          accessibleName={state.accessibleName}
          autocapitalize={state.autocapitalize}
          autocomplete={state.autocomplete}
          autoGrow={state.autoGrow}
          class="input"
          debounce={state.debounce}
          disabled={state.disabled}
          maxLength={state.maxLength}
          mode={state.mode}
          multiline={state.multiline}
          pattern={state.pattern}
          placeholder={state.placeholder}
          picture={state.picture}
          pictureCallback={dummyPictureCallback}
          preventEnterOnInputEditorMode={state.preventEnterOnInputEditorMode}
          value={state.value}
          showAdditionalContentAfter={state.showAdditionalContentAfter}
          showAdditionalContentBefore={state.showAdditionalContentBefore}
          showPassword={state.showPassword}
          showPasswordButton={state.showPasswordButton}
          spellcheck={state.spellcheck}
          startImgSrc={state.startImgSrc}
          startImgType={state.startImgType}
          type={state.type}
          readonly={state.readonly}
          onInput={handleValueInput("form-edit-2", "edit-2")}
          onKeyDown={keyDownHandler}
        >
          {state.showAdditionalContentBefore && (
            <button
              slot="additional-content-before"
              class="button-primary"
              type="button"
            >
              Action
            </button>
          )}

          {state.showAdditionalContentAfter && (
            <ch-combo-box-render
              slot="additional-content-after"
              accessibleName="Data Types"
              class="combo-box"
              model={dataTypeInGeneXus}
            ></ch-combo-box-render>
          )}
        </ch-edit>
      </form>
      Form value: {formValues["edit-2"]}
    </fieldset>

    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">
        Component inside label
      </legend>
      <form
        id="form-edit-3"
        class="form-test-edit"
        ref={el => (formRefs["form-edit-3"] = el)}
      >
        <label class="label" htmlFor="edit-3">
          Label for edit 3
          <ch-edit
            id="edit-3"
            name="edit-3"
            accessibleName={state.accessibleName}
            autocapitalize={state.autocapitalize}
            autocomplete={state.autocomplete}
            autoGrow={state.autoGrow}
            class="input"
            debounce={state.debounce}
            disabled={state.disabled}
            maxLength={state.maxLength}
            mode={state.mode}
            multiline={state.multiline}
            pattern={state.pattern}
            placeholder={state.placeholder}
            picture={state.picture}
            pictureCallback={dummyPictureCallback}
            preventEnterOnInputEditorMode={state.preventEnterOnInputEditorMode}
            value={state.value}
            showAdditionalContentAfter={state.showAdditionalContentAfter}
            showAdditionalContentBefore={state.showAdditionalContentBefore}
            showPassword={state.showPassword}
            showPasswordButton={state.showPasswordButton}
            spellcheck={state.spellcheck}
            startImgSrc={state.startImgSrc}
            startImgType={state.startImgType}
            type={state.type}
            readonly={state.readonly}
            onInput={handleValueInput("form-edit-3", "edit-3")}
            onKeyDown={keyDownHandler}
          >
            {state.showAdditionalContentBefore && (
              <button
                slot="additional-content-before"
                class="button-primary"
                type="button"
              >
                Action
              </button>
            )}

            {state.showAdditionalContentAfter && (
              <ch-combo-box-render
                slot="additional-content-after"
                accessibleName="Data Types"
                class="combo-box"
                model={dataTypeInGeneXus}
              ></ch-combo-box-render>
            )}
          </ch-edit>
        </label>
      </form>
      Form value: {formValues["edit-3"]}
    </fieldset>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChEditElement> = [
  {
    caption: "Model",
    columns: 2,
    properties: [
      {
        id: "value",
        columnSpan: 2,
        caption: "Value",
        value: undefined,
        type: "string"
      },
      {
        id: "type",
        caption: "Type",
        type: "enum",
        values: [
          { caption: "date", value: "date" },
          { caption: "datetime-local", value: "datetime-local" },
          { caption: "email", value: "email" },
          { caption: "file", value: "file" },
          { caption: "number", value: "number" },
          { caption: "password", value: "password" },
          { caption: "search", value: "search" },
          { caption: "tel", value: "tel" },
          { caption: "text", value: "text" },
          { caption: "time", value: "time" },
          { caption: "url", value: "url" }
        ],
        value: "text"
      },
      {
        id: "mode",
        caption: "Mode",
        type: "enum",
        values: [
          { caption: "none", value: "none" },
          { caption: "text", value: "text" },
          { caption: "decimal", value: "decimal" },
          { caption: "numeric", value: "numeric" },
          { caption: "tel", value: "tel" },
          { caption: "search", value: "search" },
          { caption: "email", value: "email" },
          { caption: "url", value: "url" }
        ],
        value: "none"
      },
      {
        id: "maxLength",
        columnSpan: 2,
        caption: "Max Length",
        type: "number",
        value: 1000
      },
      {
        id: "pattern",
        columnSpan: 2,
        caption: "Pattern",
        value: undefined,
        type: "string"
      },
      {
        id: "picture",
        columnSpan: 2,
        caption: "Picture",
        value: undefined,
        type: "string"
      },
      {
        id: "autoGrow",
        caption: "Auto Grow",
        value: false,
        type: "boolean"
      },
      {
        id: "multiline",
        caption: "Multiline",
        value: false,
        type: "boolean"
      }
    ]
  },
  {
    caption: "Properties",
    columns: 2,
    properties: [
      {
        id: "accessibleName",
        caption: "Accessible Name",
        columnSpan: 2,
        value: undefined,
        type: "string"
      },
      {
        id: "placeholder",
        caption: "Placeholder",
        columnSpan: 2,
        value: "Add a value...",
        type: "string"
      },
      {
        id: "debounce",
        columnSpan: 2,
        caption: "Debounce",
        type: "number",
        value: 0
      },
      {
        id: "startImgSrc",
        columnSpan: 2,
        caption: "Start Image Src",
        value: "folder",
        type: "string"
      },
      {
        id: "startImgType",
        columnSpan: 2,
        caption: "Start Image Type",
        type: "enum",
        values: [
          { caption: "Background", value: "background" },
          { caption: "Mask", value: "mask" }
        ],
        value: "background"
      },
      {
        id: "hostParts",
        columnSpan: 2,
        caption: "Host Parts",
        value: undefined,
        type: "string"
      },
      {
        id: "autocapitalize",
        caption: "Auto Capitalize",
        columnSpan: 2,
        type: "enum",
        values: [
          { caption: "on", value: "on" },
          { caption: "sentences", value: "sentences" },
          { caption: "words", value: "words" },
          { caption: "characters", value: "characters" },
          { caption: "off", value: "off" },
          { caption: "none", value: "none" }
        ],
        value: "off"
      },
      {
        id: "autocomplete",
        caption: "Auto Complete",
        columnSpan: 2,
        type: "enum",
        values: [
          { caption: "On", value: "on" },
          { caption: "Off", value: "off" },
          { caption: "Current Password", value: "current-password" },
          { caption: "New Password", value: "new-password" }
        ],
        render: "radio-group",
        value: "off"
      },
      {
        id: "spellcheck",
        caption: "Spellcheck",
        type: "boolean",
        value: false
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
      },
      {
        id: "preventEnterOnInputEditorMode",
        columnSpan: 2,
        caption: "Prevent Enter On Input Editor Mode",
        value: false,
        type: "boolean"
      },
      {
        id: "showPassword",
        caption: "Show Password",
        columnSpan: 2,
        value: false,
        type: "boolean"
      },
      {
        id: "showPasswordButton",
        caption: "Show Password Button",
        columnSpan: 2,
        value: false,
        type: "boolean"
      },
      {
        id: "showAdditionalContentBefore",
        caption: "Show Additional Content Before",
        columnSpan: 2,
        value: false,
        type: "boolean"
      },
      {
        id: "showAdditionalContentAfter",
        caption: "Show Additional Content After",
        columnSpan: 2,
        value: false,
        type: "boolean"
      }
    ]
  }
];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChEditElement>[] =
  [
    {
      name: "id",
      fixed: true,
      value: "first-name",
      type: "string"
    },
    {
      name: "name",
      fixed: true,
      value: "first-name",
      type: "string"
    },
    { name: "accessibleName", defaultValue: undefined, type: "string" },
    { name: "autocapitalize", defaultValue: undefined, type: "string" },
    { name: "autocomplete", defaultValue: undefined, type: "string" },
    { name: "autoGrow", defaultValue: false, type: "boolean" },
    {
      name: "class",
      fixed: true,
      value: "input",
      type: "string"
    },
    { name: "debounce", defaultValue: 0, type: "number" },
    { name: "disabled", defaultValue: false, type: "boolean" },
    {
      name: "getImagePathCallback",
      fixed: true,
      value: "getImagePathCallback",
      type: "function"
    },
    { name: "hostParts", defaultValue: undefined, type: "string" },
    { name: "maxLength", defaultValue: undefined, type: "number" },
    { name: "mode", defaultValue: undefined, type: "string" },
    { name: "multiline", defaultValue: false, type: "boolean" },
    { name: "pattern", defaultValue: undefined, type: "string" },
    { name: "picture", defaultValue: undefined, type: "string" },
    {
      name: "pictureCallback",
      fixed: true,
      value: "pictureCallback",
      type: "function"
    },
    { name: "placeholder", defaultValue: undefined, type: "string" },
    {
      name: "preventEnterOnInputEditorMode",
      defaultValue: false,
      type: "boolean"
    },
    { name: "readonly", defaultValue: false, type: "boolean" },
    {
      name: "showAdditionalContentBefore",
      defaultValue: false,
      type: "boolean"
    },
    {
      name: "showAdditionalContentAfter",
      defaultValue: false,
      type: "boolean"
    },
    { name: "showPassword", defaultValue: false, type: "boolean" },
    {
      name: "showPasswordButton",
      defaultValue: false,
      type: "boolean"
    },
    { name: "spellcheck", defaultValue: false, type: "boolean" },
    { name: "startImgSrc", defaultValue: undefined, type: "string" },
    { name: "startImgType", defaultValue: "background", type: "string" },
    { name: "type", defaultValue: "text", type: "string" },
    { name: "value", defaultValue: undefined, type: "string" },
    {
      name: "input",
      fixed: true,
      value: "handleInput",
      type: "event"
    }
  ];

export const editShowcaseStory: ShowcaseStory<HTMLChEditElement> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: {
    react: () => `<label ${showcaseTemplateClassProperty(
      "react",
      "label"
    )} htmlFor="first-name">
        First name
      </label>

      <ChEdit${renderShowcaseProperties(state, "react", showcasePropertiesInfo)}
      >${
        state.showAdditionalContentBefore
          ? '\n        <div slot="additional-content-before">Your content here...</div>\n      '
          : ""
      }${
      state.showAdditionalContentAfter
        ? '\n        <div slot="additional-content-after">Your content here...</div>\n      '
        : ""
    }</ChEdit>`,

    stencil: () => `<label ${showcaseTemplateClassProperty(
      "stencil",
      "label"
    )} htmlFor="first-name">
          First name
        </label>

        <ch-edit${renderShowcaseProperties(
          state,
          "stencil",
          showcasePropertiesInfo
        )}
        >${
          state.showAdditionalContentBefore
            ? '\n          <div slot="additional-content-before">Your content here...</div>\n        '
            : ""
        }${
      state.showAdditionalContentAfter
        ? '\n          <div slot="additional-content-after">Your content here...</div>\n        '
        : ""
    }</ch-edit>`
  },
  render: render,
  state: state
};
