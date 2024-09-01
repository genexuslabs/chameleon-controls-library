import { forceUpdate, h } from "@stencil/core";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";

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
        style={{ "--ch-tooltip-separation": "10px" }}
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
        <ch-tooltip class="tooltip" actionElement={null}>
          Tooltip inside a button element
        </ch-tooltip>
      </button>
    </fieldset>

    <fieldset class="fieldset-test">
      <legend class="heading-4 field-legend-test">Standalone tooltip</legend>

      <ch-tooltip class="tooltip">
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

export const tooltipShowcaseStory: ShowcaseStory<HTMLChTooltipElement> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel:
    () => `<button id="tooltip-button-1" class="button-primary" type="button">
          Something
        </button>
        <ch-tooltip
          class="tooltip"
          actionElement={button1Ref}
          blockAlign="${state.blockAlign}"
          inlineAlign="${state.inlineAlign}"
          delay={${state.delay}}
        >
          Tooltip using a reference (actionElement property)
        </ch-tooltip>

        <button class="button-secondary" type="button">
          Something 2
          <ch-tooltip
            class="tooltip" 
            actionElement={null}
            blockAlign="${state.blockAlign}"
            inlineAlign="${state.inlineAlign}"
            delay={${state.delay}}
          >
            Tooltip inside a button element
          </ch-tooltip>
        </button>

        <ch-tooltip
          class="tooltip"
          blockAlign="${state.blockAlign}"
          inlineAlign="${state.inlineAlign}"
          delay={${state.delay}}
        >
          <div slot="action">Standalone tooltip content</div>
          Standalone tooltip
        </ch-tooltip>`,
  render: render,
  storyDidLoad: () => {
    buttonRef = document.querySelector("[id='tooltip-button-1']");
    forceUpdate(document.querySelector("ch-showcase"));
  },
  state: state
};
