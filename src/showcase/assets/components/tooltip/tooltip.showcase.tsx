import { forceUpdate, h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
import {
  renderShowcaseProperties,
  showcaseTemplateClassProperty
} from "../utils";

const state: Partial<HTMLChTooltipElement> = {};
let buttonRef: HTMLButtonElement;

const render = () => (
  <div class="tooltip-test-main-wrapper">
    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">
        Tooltip using a reference (actionElement property)
      </legend>

      <button id="tooltip-button-1" class="button-primary" type="button">
        Something
      </button>

      <ch-tooltip
        class="tooltip"
        actionElement={buttonRef}
        blockAlign={state.blockAlign}
        delay={state.delay}
        inlineAlign={state.inlineAlign}
      >
        Tooltip using a reference (actionElement property)
      </ch-tooltip>
    </fieldset>

    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">
        Tooltip inside a button element
      </legend>

      <button class="button-secondary" type="button">
        Something 2
        <ch-tooltip
          class="tooltip"
          actionElement={null}
          blockAlign={state.blockAlign}
          delay={state.delay}
          inlineAlign={state.inlineAlign}
        >
          Tooltip inside a button element
        </ch-tooltip>
      </button>
    </fieldset>

    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">Standalone tooltip</legend>

      <ch-tooltip
        class="tooltip"
        blockAlign={state.blockAlign}
        delay={state.delay}
        inlineAlign={state.inlineAlign}
      >
        <div slot="action">Standalone tooltip content</div>
        Standalone tooltip
      </ch-tooltip>
    </fieldset>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChTooltipElement> =
  [
    {
      caption: "Properties",
      properties: [
        {
          id: "blockAlign",
          caption: "Block Align",
          value: "outside-end",
          values: [
            { caption: "Outside start", value: "outside-start" },
            { caption: "Inside start", value: "inside-start" },
            { caption: "Center", value: "center" },
            { caption: "Inside end", value: "inside-end" },
            { caption: "Outside end", value: "outside-end" }
          ],
          type: "enum"
        },
        {
          id: "inlineAlign",
          caption: "Inline Align",
          value: "center",
          values: [
            { caption: "Outside start", value: "outside-start" },
            { caption: "Inside start", value: "inside-start" },
            { caption: "Center", value: "center" },
            { caption: "Inside end", value: "inside-end" },
            { caption: "Outside end", value: "outside-end" }
          ],
          type: "enum"
        },
        {
          id: "delay",
          caption: "Delay",
          value: 100,
          type: "number"
        }
      ]
    }
  ];

const showcaseTooltip1PropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChTooltipElement>[] =
  [
    { name: "actionElement", fixed: true, value: "button1Ref", type: "string" },
    {
      name: "class",
      fixed: true,
      value: "tooltip",
      type: "string"
    },
    {
      name: "blockAlign",
      defaultValue: "outside-end",
      type: "string"
    },
    { name: "delay", defaultValue: 100, type: "number" },
    {
      name: "inlineAlign",
      defaultValue: "center",
      type: "string"
    }
  ];

const showcaseTooltip2PropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChTooltipElement>[] =
  [
    { name: "actionElement", fixed: true, value: "button2Ref", type: "string" },
    {
      name: "class",
      fixed: true,
      value: "tooltip",
      type: "string"
    },
    {
      name: "blockAlign",
      defaultValue: "outside-end",
      type: "string"
    },
    { name: "delay", defaultValue: 100, type: "number" },
    {
      name: "inlineAlign",
      defaultValue: "center",
      type: "string"
    }
  ];

const showcaseTooltip3PropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChTooltipElement>[] =
  [
    {
      name: "class",
      fixed: true,
      value: "tooltip",
      type: "string"
    },
    {
      name: "blockAlign",
      defaultValue: "outside-end",
      type: "string"
    },
    { name: "delay", defaultValue: 100, type: "number" },
    {
      name: "inlineAlign",
      defaultValue: "center",
      type: "string"
    }
  ];

export const tooltipShowcaseStory: ShowcaseStory<HTMLChTooltipElement> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: {
    react: () => `<button id="tooltip-button-1" ${showcaseTemplateClassProperty(
      "react",
      "button-primary"
    )} type="button">
        Something
      </button>
      <ChTooltip${renderShowcaseProperties(
        state,
        "react",
        showcaseTooltip1PropertiesInfo
      )}
      >
        Tooltip using a reference (actionElement property)
      </ChTooltip>

      <button ${showcaseTemplateClassProperty(
        "react",
        "button-secondary"
      )} type="button">
        Something 2
        <ChTooltip${renderShowcaseProperties(
          state,
          "react",
          showcaseTooltip2PropertiesInfo,
          11
        )}
        >
          Tooltip inside a button element
        </ChTooltip>
      </button>

      <ChTooltip${renderShowcaseProperties(
        state,
        "react",
        showcaseTooltip3PropertiesInfo
      )}
      >
        <div slot="action">Standalone tooltip content</div>
        Standalone tooltip
      </ChTooltip>`,

    stencil:
      () => `<button id="tooltip-button-1" ${showcaseTemplateClassProperty(
        "stencil",
        "button-primary"
      )} type="button">
          Something
        </button>
        <ch-tooltip${renderShowcaseProperties(
          state,
          "stencil",
          showcaseTooltip1PropertiesInfo
        )}
        >
          Tooltip using a reference (actionElement property)
        </ch-tooltip>

        <button ${showcaseTemplateClassProperty(
          "stencil",
          "button-secondary"
        )} type="button">
          Something 2
          <ch-tooltip${renderShowcaseProperties(
            state,
            "stencil",
            showcaseTooltip2PropertiesInfo,
            13
          )}
          >
            Tooltip inside a button element
          </ch-tooltip>
        </button>

        <ch-tooltip${renderShowcaseProperties(
          state,
          "stencil",
          showcaseTooltip3PropertiesInfo
        )}
        >
          <div slot="action">Standalone tooltip content</div>
          Standalone tooltip
        </ch-tooltip>`
  },
  render: render,
  storyDidLoad: () => {
    buttonRef = document.querySelector("[id='tooltip-button-1']");
    forceUpdate(document.querySelector("ch-showcase"));
  },
  state: state
};
