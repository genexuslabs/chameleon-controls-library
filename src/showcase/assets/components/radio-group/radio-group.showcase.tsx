import { forceUpdate, h } from "@stencil/core";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { simpleModel1, simpleModel2 } from "./models";
import { renderBooleanPropertyOrEmpty } from "../utils";

const state: Partial<HTMLChRadioGroupRenderElement> = {};
const formRefs: {
  [key in "form-radio-group-1" | "form-radio-group-2" | "form-radio-group-3"]:
    | HTMLFormElement
    | undefined;
} = {
  "form-radio-group-1": undefined,
  "form-radio-group-2": undefined,
  "form-radio-group-3": undefined
};

const formValues = {
  "radio-group-1": "",
  "radio-group-2": "",
  "radio-group-3": ""
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
  <div class="radio-group-test-main-wrapper">
    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">No label</legend>
      <form
        id="form-radio-group-1"
        ref={el => (formRefs["form-radio-group-1"] = el)}
      >
        <ch-radio-group-render
          id="radio-group-1"
          // name="radio-group-1"
          class="radio-group"
          direction={state.direction}
          disabled={state.disabled}
          model={state.model}
          value={state.value}
          onInput={handleValueInput("form-radio-group-1", "radio-group-1")}
        ></ch-radio-group-render>
      </form>
      Form value: {formValues["radio-group-1"]}
    </fieldset>

    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">Label with HTML for</legend>
      <form
        id="form-radio-group-2"
        ref={el => (formRefs["form-radio-group-2"] = el)}
      >
        <label class="form-input__label" htmlFor="radio-group-2">
          Label for switch 2
        </label>

        <ch-radio-group-render
          id="radio-group-2"
          // name="radio-group-2"
          class="radio-group"
          direction={state.direction}
          disabled={state.disabled}
          model={state.model}
          value={state.value}
          onInput={handleValueInput("form-radio-group-2", "radio-group-2")}
        ></ch-radio-group-render>
      </form>
      Form value: {formValues["radio-group-2"]}
    </fieldset>

    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">
        Component inside label
      </legend>
      <form
        id="form-radio-group-3"
        ref={el => (formRefs["form-radio-group-3"] = el)}
      >
        <label class="form-input__label" htmlFor="radio-group-3">
          Label for switch 3
          <ch-radio-group-render
            id="radio-group-3"
            // name="radio-group-3"
            class="radio-group"
            direction={state.direction}
            disabled={state.disabled}
            model={state.model}
            value={state.value}
            onInput={handleValueInput("form-radio-group-3", "radio-group-3")}
          ></ch-radio-group-render>
        </label>
      </form>
      Form value: {formValues["radio-group-3"]}
    </fieldset>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChRadioGroupRenderElement> =
  [
    {
      caption: "Models",
      properties: [
        {
          id: "model",
          accessibleName: "Model",
          type: "enum",
          values: [
            { caption: "Simple Model", value: simpleModel1 },
            { caption: "Simple Model 2", value: simpleModel2 }
          ],
          value: simpleModel2
        }
      ]
    },
    {
      caption: "Properties",
      properties: [
        {
          id: "value",
          caption: "Value",
          value: undefined,
          type: "string"
        },
        {
          id: "direction",
          caption: "Direction",
          value: "horizontal",
          values: [
            { caption: "Horizontal", value: "horizontal" },
            { caption: "Vertical", value: "vertical" }
          ],
          render: "radio-group",
          type: "enum"
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

export const radioGroupShowcaseStory: ShowcaseStory<HTMLChRadioGroupRenderElement> =
  {
    properties: showcaseRenderProperties,
    markupWithUIModel: {
      uiModel: () => state.model,
      uiModelType: "RadioGroupModel",
      render: () => `<ch-radio-group-render
          class="radio-group"${renderBooleanPropertyOrEmpty("disabled", state)}
          direction="${state.direction}"
          model={this.#controlUIModel}
          value="${state.value}"
          onInput={this.#handleValueChange}
        ></ch-radio-group-render>`
    },
    render: render,
    state: state
  };
