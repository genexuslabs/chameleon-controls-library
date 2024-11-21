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

const state: Partial<HTMLChPopoverElement> = {};
let buttonRef: HTMLButtonElement;
let popoverRef: HTMLChPopoverElement;

const handlePopoverOpened = () => {
  state.hidden = false;

  // TODO: Until we support external slots in the ch-flexible-layout-render,
  // this is a hack to update the render of the widget and thus re-render the
  // combo-box updating the displayed items
  const showcaseRef = popoverRef.closest("ch-showcase");

  if (showcaseRef) {
    forceUpdate(showcaseRef);
  }
};

const handlePopoverClosed = () => {
  state.hidden = true;

  // TODO: Until we support external slots in the ch-flexible-layout-render,
  // this is a hack to update the render of the widget and thus re-render the
  // combo-box updating the displayed items
  const showcaseRef = popoverRef.closest("ch-showcase");

  if (showcaseRef) {
    forceUpdate(showcaseRef);
  }
};

const render = () => (
  <div class="popover-test-main-wrapper">
    <div class="popover-test-scroll">
      <button class="button-primary" type="button" ref={el => (buttonRef = el)}>
        Open popover
      </button>

      <ch-popover
        allowDrag={state.allowDrag}
        actionElement={buttonRef}
        blockAlign={state.blockAlign}
        blockSizeMatch={state.blockSizeMatch}
        class="popover-secondary"
        closeOnClickOutside={state.closeOnClickOutside}
        hidden={state.hidden}
        inlineAlign={state.inlineAlign}
        inlineSizeMatch={state.inlineSizeMatch}
        mode={state.mode}
        overflowBehavior={state.overflowBehavior}
        positionTry={state.positionTry}
        resizable={state.resizable}
        onPopoverOpened={handlePopoverOpened}
        onPopoverClosed={handlePopoverClosed}
        ref={el => (popoverRef = el)}
      >
        <div
          slot="header"
          style={{ display: "flex", "justify-content": "space-between" }}
        >
          <span class="heading-4">Header title</span>
          <button
            aria-label="Close"
            class="button-tertiary"
            onClick={handlePopoverClosed}
          >
            X
          </button>
        </div>
        Popover content
        <div>
          <div>
            <label class="label">
              Any content 1
              <input class="input" type="text" />
            </label>
          </div>

          <label class="label">
            Any content 2
            <input class="input" type="text" />
          </label>
          <button class="button-primary" onClick={handlePopoverClosed}>
            Close
          </button>
        </div>
      </ch-popover>
    </div>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChPopoverElement> =
  [
    {
      caption: "Visibility",
      columns: 2,
      properties: [
        {
          id: "hidden",
          caption: "Hidden",
          value: true,
          type: "boolean"
        },
        {
          id: "mode",
          caption: "Mode",
          value: "auto",
          type: "enum",
          render: "radio-group",
          values: [
            {
              value: "auto",
              caption: "Auto"
            },
            {
              value: "manual",
              caption: "Manual"
            }
          ]
        },
        {
          id: "closeOnClickOutside",
          caption: 'Close On Click Outside (when Mode === "Manual")',
          columnSpan: 2,
          value: false,
          type: "boolean"
        }
      ]
    },
    {
      caption: "Alignment",
      columns: 2,
      properties: [
        {
          id: "inlineAlign",
          caption: "Inline Align",
          value: "center",
          type: "enum",
          values: [
            {
              value: "outside-start",
              caption: "outside-start"
            },
            {
              value: "inside-start",
              caption: "inside-start"
            },
            { value: "center", caption: "center" },
            {
              value: "inside-end",
              caption: "inside-end"
            },
            {
              value: "outside-end",
              caption: "outside-end"
            }
          ]
        },
        {
          id: "blockAlign",
          caption: "Block Align",
          value: "outside-end",
          type: "enum",
          values: [
            {
              value: "outside-start",
              caption: "outside-start"
            },
            {
              value: "inside-start",
              caption: "inside-start"
            },
            { value: "center", caption: "center" },
            {
              value: "inside-end",
              caption: "inside-end"
            },
            {
              value: "outside-end",
              caption: "outside-end"
            }
          ]
        },
        {
          id: "inlineSizeMatch",
          caption: "Inline Size Match",
          value: "content",
          type: "enum",
          values: [
            {
              value: "content",
              caption: "content"
            },
            {
              value: "action-element",
              caption: "action-element"
            },
            {
              value: "action-element-as-minimum",
              caption: "action-element-as-minimum"
            }
          ]
        },
        {
          id: "blockSizeMatch",
          caption: "Block Size Match",
          value: "content",
          type: "enum",
          values: [
            {
              value: "content",
              caption: "content"
            },
            {
              value: "action-element",
              caption: "action-element"
            },
            {
              value: "action-element-as-minimum",
              caption: "action-element-as-minimum"
            }
          ]
        },
        {
          id: "positionTry",
          caption: "Position Try",
          columnSpan: 2,
          value: "content",
          type: "enum",
          values: [
            {
              value: "flip-block",
              caption: "flip-block"
            },
            {
              value: "flip-inline",
              caption: "flip-inline"
            },
            {
              value: "none",
              caption: "none"
            }
          ]
        }
      ]
    },
    {
      caption: "Properties",
      properties: [
        {
          id: "allowDrag",
          caption: "Allow Drag",
          value: "no",
          type: "enum",
          render: "radio-group",
          values: [
            {
              value: "box",
              caption: "Box"
            },
            {
              value: "header",
              caption: "Header"
            },
            {
              value: "no",
              caption: "No"
            }
          ]
        },
        {
          id: "overflowBehavior",
          caption: "Overflow Behavior",
          value: "overflow",
          type: "enum",
          render: "radio-group",
          values: [
            {
              value: "overflow",
              caption: "Overflow"
            },
            {
              value: "add-scroll",
              caption: "Add Scroll"
            }
          ]
        },
        {
          id: "resizable",
          caption: "Resizable",
          value: false,
          type: "boolean"
        }
      ]
    }
  ];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChPopoverElement>[] =
  [
    { name: "allowDrag", defaultValue: "no", type: "string" },
    {
      name: "actionElement",
      fixed: true,
      value: "buttonRef",
      type: "function"
    },
    { name: "blockAlign", defaultValue: "center", type: "string" },
    { name: "blockSizeMatch", defaultValue: "content", type: "string" },
    {
      name: "class",
      fixed: true,
      value: "popover popover-secondary",
      type: "string"
    },
    { name: "closeOnClickOutside", defaultValue: false, type: "boolean" },
    { name: "hidden", defaultValue: true, type: "boolean" },
    { name: "inlineAlign", defaultValue: "center", type: "string" },
    { name: "inlineSizeMatch", defaultValue: "content", type: "string" },
    { name: "mode", defaultValue: "auto", type: "string" },
    { name: "overflowBehavior", defaultValue: "overflow", type: "string" },
    { name: "positionTry", defaultValue: "none", type: "string" },
    { name: "resizable", defaultValue: false, type: "boolean" },
    {
      name: "popoverClosed",
      fixed: true,
      value: "handlePopoverClosed",
      type: "event"
    }
  ];

const showcaseOpenButtonPropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChPopoverElement>[] =
  [
    {
      name: "class",
      fixed: true,
      value: "button-primary",
      type: "string"
    },
    {
      name: "type",
      fixed: true,
      value: "button",
      type: "string"
    }
    // TODO: Add ref keyword/type
  ];

const showcaseCloseButtonPropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChPopoverElement>[] =
  [
    {
      name: "aria-label",
      fixed: true,
      value: "Close",
      type: "string"
    },
    {
      name: "class",
      fixed: true,
      value: "button-tertiary",
      type: "string"
    },
    {
      name: "type",
      fixed: true,
      value: "button",
      type: "string"
    },
    {
      name: "popoverClosed",
      fixed: true,
      value: "handlePopoverClosed",
      type: "event"
    }
  ];

export const popoverShowcaseStory: ShowcaseStory<HTMLChPopoverElement> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: {
    react: () => `<button${renderShowcaseProperties(
      state,
      "react",
      showcaseOpenButtonPropertiesInfo
    )}
      >
        Open popover
      </button>

      <ChPopover${renderShowcaseProperties(
        state,
        "react",
        showcasePropertiesInfo
      )}
      >
        <div slot="header">
          <span ${showcaseTemplateClassProperty(
            "react",
            "heading-4"
          )}>Header title</span>

          <button${renderShowcaseProperties(
            state,
            "react",
            showcaseCloseButtonPropertiesInfo,
            13
          )}
          >
          </button>
        </div>

        Popover content
      </ChPopover>`,

    stencil: () => `<button${renderShowcaseProperties(
      state,
      "stencil",
      showcaseOpenButtonPropertiesInfo
    )}
        >
          Open popover
        </button>
  
        <ch-popover${renderShowcaseProperties(
          state,
          "stencil",
          showcasePropertiesInfo
        )}
        >
          <div slot="header">
            <span ${showcaseTemplateClassProperty(
              "stencil",
              "heading-4"
            )}>Header title</span>
  
            <button${renderShowcaseProperties(
              state,
              "stencil",
              showcaseCloseButtonPropertiesInfo,
              15
            )}
            >
            </button>
          </div>
  
          Popover content
        </ch-popover>`
  },
  render: render,
  state: state
};
