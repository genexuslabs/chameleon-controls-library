import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import { renderShowcaseProperties, updateShowcase } from "../utils";

const state: Partial<HTMLChRatingElement> = {};
const formRefs: {
  [key in "form-rating-1" | "form-rating-2" | "form-rating-3"]:
    | HTMLFormElement
    | undefined;
} = {
  "form-rating-1": undefined,
  "form-rating-2": undefined,
  "form-rating-3": undefined
};

const formValues = {
  "rating-1": "",
  "rating-2": "",
  "rating-3": ""
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
      <legend class="heading-5 field-legend-test">No label</legend>
      <form id="form-rating-1" ref={el => (formRefs["form-rating-1"] = el)}>
        <ch-rating
          class="rating"
          name="rating-1"
          accessibleName={state.accessibleName}
          disabled={state.disabled}
          value={state.value}
          stars={state.stars}
          onInput={handleValueInput("form-rating-1", "rating-1")}
        ></ch-rating>
      </form>
      Form value: {formValues["rating-1"]}
    </fieldset>

    <fieldset class="fieldset-test">
      <legend class="heading-5 field-legend-test">Label with HTML for</legend>
      <form
        id="form-rating-2"
        class="form-test-edit"
        ref={el => (formRefs["form-rating-2"] = el)}
      >
        <label class="label" htmlFor="rating-2">
          Label for rating 2
        </label>

        <ch-rating
          class="rating"
          id="rating-2"
          name="rating-2"
          accessibleName={state.accessibleName}
          disabled={state.disabled}
          value={state.value}
          stars={state.stars}
          onInput={handleValueInput("form-rating-2", "rating-2")}
        ></ch-rating>
      </form>
      Form value: {formValues["rating-2"]}
    </fieldset>

    <fieldset class="fieldset-test">
      <legend class="heading-5 field-legend-test">
        Component inside label
      </legend>
      <form
        id="form-rating-3"
        class="form-test-edit"
        ref={el => (formRefs["form-rating-3"] = el)}
      >
        <label class="label" htmlFor="rating-3">
          Label for rating 3
          <ch-rating
            class="rating"
            id="rating-3"
            name="rating-3"
            accessibleName={state.accessibleName}
            disabled={state.disabled}
            value={state.value}
            stars={state.stars}
            onInput={handleValueInput("form-rating-3", "rating-3")}
          ></ch-rating>
        </label>
      </form>
      Form value: {formValues["rating-3"]}
    </fieldset>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChRatingElement> =
  [
    {
      caption: "Model",
      properties: [
        {
          id: "accessibleName",
          caption: "Accessible Name",
          value: undefined,
          type: "string"
        },
        {
          id: "value",
          caption: "Value",
          value: 0,
          type: "number"
        },
        {
          id: "stars",
          caption: "Stars",
          value: 5,
          type: "number"
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

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChRatingElement>[] =
  [
    { name: "accessibleName", defaultValue: undefined, type: "string" },
    {
      name: "class",
      fixed: true,
      value: "rating",
      type: "string"
    },
    { name: "disabled", defaultValue: false, type: "boolean" },
    { name: "value", defaultValue: 0, type: "number" },
    { name: "stars", defaultValue: 5, type: "number" },
    {
      name: "input",
      fixed: true,
      value: "handleInput",
      type: "event"
    }
  ];

export const ratingShowcaseStory: ShowcaseStory<HTMLChRatingElement> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: {
    react: () => `<ChRating${renderShowcaseProperties(
      state,
      "react",
      showcasePropertiesInfo
    )}
      ></ChRating>`,

    stencil: () => `<ch-rating${renderShowcaseProperties(
      state,
      "stencil",
      showcasePropertiesInfo
    )}
        ></ch-rating>`
  },
  render: render,
  state: state
};
