import { forceUpdate, h } from "@stencil/core";
import { ChPopover } from "../../../../components/popover/popover";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { Mutable } from "../../../../common/types";

const state: Partial<Mutable<ChPopover>> = {};
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
            <label class="form-input__label">
              Any content 1
              <input class="form-input" type="text" />
            </label>
          </div>

          <label class="form-input__label">
            Any content 2
            <input class="form-input" type="text" />
          </label>
          <button class="button-primary" onClick={handlePopoverClosed}>
            Close
          </button>
        </div>
      </ch-popover>
    </div>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<Mutable<ChPopover>> = [
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
        id: "resizable",
        caption: "Resizable",
        value: false,
        type: "boolean"
      }
    ]
  }
];

export const popoverShowcaseStory: ShowcaseStory<Mutable<ChPopover>> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: `<button
          class="button-primary"
          type="button"
          ref={el => (this.#buttonRef = el)}
        >
          Open popover
        </button>
  
        <ch-popover
          allowDrag={<allowDrag value (optional)>}
          actionElement={this.#buttonRef}
          blockAlign={<blockAlign value>}
          blockSizeMatch={<blockSizeMatch value (optional)>}
          class="popover popover-secondary"
          closeOnClickOutside={<closeOnClickOutside value>}
          hidden={this.#popoverHidden}
          inlineAlign={<inlineAlign value>}
          inlineSizeMatch={<inlineSizeMatch value>}
          mode={<mode value>}
          positionTry={<positionTry value (optional)>}
          resizable={<resizable value (optional)>}
          onPopoverClosed={this.#handlePopoverClosed}
        >
          <div slot="header">
            <span class="heading-4">Header title</span>

            <button aria-label="Close" class="button-tertiary" onClick={this.#handlePopoverClosed}>
            </button>
          </div>

          Popover content
        </ch-popover>`,
  render: render,
  state: state
};
