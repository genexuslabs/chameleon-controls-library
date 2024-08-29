import { h } from "@stencil/core";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { Mutable } from "../../../../common/types";
import { ChImage } from "../../../../components/image/image";
import { renderBooleanPropertyOrEmpty } from "../utils";

const state: Partial<Mutable<ChImage>> = {};
let button2Ref: HTMLButtonElement;

const render = () => (
  <div class="image-test-main-wrapper">
    <button
      class="button-tertiary button-icon"
      disabled={state.disabled}
      type="button"
    >
      <ch-image
        disabled={state.disabled}
        src={state.src}
        type={state.type}
      ></ch-image>
      Some text
    </button>

    <button
      class="button-tertiary button-icon"
      disabled={state.disabled}
      type="button"
      ref={el => (button2Ref = el)}
    >
      <div>
        <ch-image
          containerRef={button2Ref}
          disabled={state.disabled}
          src={state.src}
          type={state.type}
        ></ch-image>
      </div>
      Some text
    </button>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<Mutable<ChImage>> = [
  {
    caption: "Properties",
    properties: [
      {
        id: "src",
        caption: "Src",
        value: "folder",
        render: "input",
        type: "string"
      },
      {
        id: "type",
        caption: "Type",
        value: "background",
        values: [
          { caption: "Background", value: "background" },
          { caption: "Mask", value: "mask" }
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

export const imageShowcaseStory: ShowcaseStory<Mutable<ChImage>> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: () => `<button
          class="button-tertiary button-icon"${renderBooleanPropertyOrEmpty(
            "disabled",
            state
          )}
          type="button"
        >
          <ch-image${renderBooleanPropertyOrEmpty("disabled", state)}
            getImagePathCallback={getImagePathCallback}
            src="${state.src}"
            type="${state.type}"
          ></ch-image>
          Some text
        </button>

        <button
          class="button-tertiary button-icon"${renderBooleanPropertyOrEmpty(
            "disabled",
            state
          )}
          type="button"
          ref={el => (this.#buttonRef = el)}
        >
          <div>
            <ch-image
              containerRef={this.#buttonRef}${renderBooleanPropertyOrEmpty(
                "disabled",
                state
              )}
              getImagePathCallback={getImagePathCallback}
              src="${state.src}"
              type="${state.type}"
            ></ch-image>
          </div>
          Some text
        </button>`,
  render: render,
  state: state
};
