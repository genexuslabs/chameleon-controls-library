import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplateFrameWork,
  ShowcaseTemplatePropertyInfo
} from "../types";
import {
  insertSpacesAtTheBeginningExceptForTheFirstLine,
  renderShowcaseProperties,
  showcaseTemplateClassProperty,
  updateShowcase
} from "../utils";
import type { LayoutSplitterModel } from "../../../../components/layout-splitter/types";

const state: Partial<HTMLChDialogElement> = {};

const handleClose = () => {
  state.show = false;

  // TODO: Until we support external slots in the ch-flexible-layout-render,
  // this is a hack to update the render of the widget and thus re-render the
  // combo-box updating the displayed items
  updateShowcase();
};

const handleDialogOpen = () => {
  state.show = true;

  // TODO: Until we support external slots in the ch-flexible-layout-render,
  // this is a hack to update the render of the widget and thus re-render the
  // combo-box updating the displayed items
  updateShowcase();
};

const layoutSplitterModel: LayoutSplitterModel = {
  id: "root",
  direction: "columns",
  items: [
    { id: "start", size: "1fr", minSize: "150px", dragBar: { size: 2 } },
    { id: "end", size: "1fr", minSize: "150px" }
  ]
};

const render = () => [
  <button class="button-primary" type="button" onClick={handleDialogOpen}>
    Open dialog
  </button>,

  <ch-dialog
    adjustPositionAfterResize={state.adjustPositionAfterResize}
    allowDrag={state.allowDrag}
    caption={state.caption}
    class="dialog dialog-primary"
    closeButtonAccessibleName={state.closeButtonAccessibleName}
    show={state.show}
    modal={state.modal}
    resizable={state.resizable}
    showFooter={state.showFooter}
    showHeader={state.showHeader}
    onDialogClosed={handleClose}
  >
    <ch-layout-splitter class="layout-splitter" model={layoutSplitterModel}>
      <div slot="start">
        <label htmlFor="some-input">Any data</label>
        <input id="some-input" class="input" type="text" />
      </div>

      <div slot="end">
        <button class="button-primary">button</button>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consectetur
          repellendus dolorem recusandae tenetur animi fuga aliquid! Vel iste
          amet laudantium deleniti iusto, commodi dolor omnis laboriosam quod
          magni, quis voluptatem.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consectetur
          repellendus dolorem recusandae tenetur animi fuga aliquid! Vel iste
          amet laudantium deleniti iusto, commodi dolor omnis laboriosam quod
          magni, quis voluptatem.
        </p>
      </div>
    </ch-layout-splitter>
    <div class="box"></div>

    <button slot="footer" type="button" class="button-secondary">
      Cancel
    </button>
    <button slot="footer" type="button" class="button-primary">
      Save
    </button>
  </ch-dialog>
];

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChDialogElement> =
  [
    {
      caption: "Visibility",
      columns: 2,
      properties: [
        {
          id: "show",
          caption: "Show",
          value: false,
          type: "boolean"
        },
        {
          id: "modal",
          caption: "Modal",
          value: true,
          type: "boolean"
        },
        {
          id: "showFooter",
          caption: "Show Footer",
          value: true,
          type: "boolean"
        },
        {
          id: "showHeader",
          caption: "Show Header",
          value: true,
          type: "boolean"
        }
      ]
    },
    {
      caption: "Properties",
      properties: [
        {
          id: "caption",
          caption: "Caption",
          value: "Title",
          type: "string"
        },
        {
          id: "closeButtonAccessibleName",
          caption: "Close Button Accessible Name",
          value: "Close dialog",
          type: "string"
        },
        {
          id: "resizable",
          caption: "Resizable",
          value: false,
          type: "boolean"
        },
        {
          id: "adjustPositionAfterResize",
          caption: "Adjust Position After Resize",
          value: false,
          type: "boolean"
        },
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
        }
      ]
    }
  ];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChCheckboxElement>[] =
  [
    { name: "adjustPositionAfterResize", defaultValue: false, type: "boolean" },
    { name: "allowDrag", defaultValue: "no", type: "string" },
    { name: "caption", defaultValue: undefined, type: "string" },
    {
      name: "class",
      fixed: true,
      value: "dialog dialog-primary",
      type: "string"
    },
    {
      name: "closeButtonAccessibleName",
      defaultValue: undefined,
      type: "string"
    },
    { name: "show", defaultValue: false, type: "boolean" },
    { name: "modal", defaultValue: true, type: "boolean" },
    { name: "resizable", defaultValue: false, type: "boolean" },
    { name: "showFooter", defaultValue: false, type: "boolean" },
    { name: "showHeader", defaultValue: false, type: "boolean" },
    { name: "value", defaultValue: undefined, type: "string" },
    { name: "unCheckedValue", defaultValue: undefined, type: "string" },
    {
      name: "dialogClosed",
      fixed: true,
      value: "handleDialogClosed",
      type: "event"
    }
  ];

const showcaseButtonPropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChCheckboxElement>[] =
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
    },
    {
      name: "click",
      fixed: true,
      value: "handleDialogOpen",
      type: "event"
    }
  ];

const lightDOMMarkup = (
  framework: ShowcaseTemplateFrameWork
) => `<label htmlFor="some-input">Any data</label>
<input id="some-input" ${showcaseTemplateClassProperty(
  framework,
  "input"
)} type="text" />

<button ${showcaseTemplateClassProperty(
  framework,
  "button-primary"
)}>Button</button>
<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>

<button slot="footer" type="button" ${showcaseTemplateClassProperty(
  framework,
  "button-secondary"
)}>
  Cancel
</button>
<button slot="footer" type="button" ${showcaseTemplateClassProperty(
  framework,
  "button-primary"
)}>
  Save
</button>`;

const lightDOMMarkupReact = insertSpacesAtTheBeginningExceptForTheFirstLine(
  lightDOMMarkup("react"),
  8
);

const lightDOMMarkupStencil = insertSpacesAtTheBeginningExceptForTheFirstLine(
  lightDOMMarkup("stencil"),
  10
);

export const dialogShowcaseStory: ShowcaseStory<HTMLChDialogElement> = {
  properties: showcaseRenderProperties,
  markupWithoutUIModel: {
    react: () => `<button${renderShowcaseProperties(
      state,
      "react",
      showcaseButtonPropertiesInfo
    )}
      >
        Open dialog
      </button>

      <ChDialog${renderShowcaseProperties(
        state,
        "react",
        showcasePropertiesInfo
      )}
      >
        ${lightDOMMarkupReact}
      </ChDialog>`,

    stencil: () => `<button${renderShowcaseProperties(
      state,
      "stencil",
      showcaseButtonPropertiesInfo
    )}
        >
          Open dialog
        </button>

        <ch-dialog${renderShowcaseProperties(
          state,
          "stencil",
          showcasePropertiesInfo
        )}
        >
          ${lightDOMMarkupStencil}
        </ch-dialog>`
  },
  render: render,
  state: state
};
