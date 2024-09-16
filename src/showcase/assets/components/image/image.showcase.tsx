import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import { renderShowcaseProperties } from "../utils";

const state: Partial<HTMLChImageElement> = {};
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

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChImageElement> = [
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

const showcaseImage1PropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChImageElement>[] =
  [
    { name: "disabled", defaultValue: false, type: "boolean" },
    {
      name: "getImagePathCallback",
      fixed: true,
      value: "getImagePathCallback",
      type: "function"
    },
    {
      name: "src",
      defaultValue: undefined,
      type: "string"
    },
    {
      name: "type",
      defaultValue: "background",
      type: "string"
    }
  ];

const showcaseButton1PropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChImageElement>[] =
  [
    {
      name: "class",
      fixed: true,
      value: "button-tertiary button-icon",
      type: "string"
    },
    { name: "disabled", defaultValue: false, type: "boolean" },
    {
      name: "type",
      fixed: true,
      value: "button",
      type: "string"
    }
  ];

const showcaseImage2PropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChImageElement>[] =
  [
    { name: "containerRef", fixed: true, value: "buttonRef", type: "string" },
    { name: "disabled", defaultValue: false, type: "boolean" },
    {
      name: "getImagePathCallback",
      fixed: true,
      value: "getImagePathCallback",
      type: "function"
    },
    {
      name: "src",
      defaultValue: undefined,
      type: "string"
    },
    {
      name: "type",
      defaultValue: "background",
      type: "string"
    }
  ];

const showcaseButton2PropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChImageElement>[] =
  [
    {
      name: "class",
      fixed: true,
      value: "button-tertiary button-icon",
      type: "string"
    },
    { name: "disabled", defaultValue: false, type: "boolean" },
    {
      name: "type",
      fixed: true,
      value: "button",
      type: "string"
    }
    // TODO: Add ref property
  ];

export const imageShowcaseStory: ShowcaseStory<HTMLChImageElement> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: {
    react: () => `<button${renderShowcaseProperties(
      state,
      "react",
      showcaseButton1PropertiesInfo
    )}
      >
        <ChImage${renderShowcaseProperties(
          state,
          "react",
          showcaseImage1PropertiesInfo,
          11
        )}
        ></ChImage>
        Some text
      </button>

      <button${renderShowcaseProperties(
        state,
        "react",
        showcaseButton2PropertiesInfo
      )}
      >
        <div>
          <ChImage${renderShowcaseProperties(
            state,
            "react",
            showcaseImage2PropertiesInfo,
            13
          )}
          ></ChImage>
        </div>
        Some text
      </button>`,

    stencil: () => `<button${renderShowcaseProperties(
      state,
      "stencil",
      showcaseButton1PropertiesInfo
    )}
        >
          <ch-image${renderShowcaseProperties(
            state,
            "stencil",
            showcaseImage1PropertiesInfo,
            13
          )}
          ></ch-image>
          Some text
        </button>
  
        <button${renderShowcaseProperties(
          state,
          "stencil",
          showcaseButton2PropertiesInfo
        )}
        >
          <div>
            <ch-image${renderShowcaseProperties(
              state,
              "stencil",
              showcaseImage2PropertiesInfo,
              15
            )}
            ></ch-image>
          </div>
          Some text
        </button>`
  },
  render: render,
  state: state
};
