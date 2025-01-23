import { h } from "@stencil/core";
import {
  ShowcaseRender,
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplateFrameWork,
  ShowcaseTemplatePropertyInfo
} from "../types";
import {
  disabledModel1,
  disabledModel4,
  disabledModel2,
  disabledModel3,
  simpleModel1,
  simpleModel2,
  closeButtonModel
} from "./models";
import { ChTabRenderCustomEvent } from "../../../../components";
import {
  TabItemCloseInfo,
  TabSelectedItemInfo
} from "../../../../components/tab/types";
import {
  kbExplorerModel,
  lazyLoadTreeItemsCallback,
  preferencesModel
} from "../tree-view/models";
import {
  insertSpacesAtTheBeginningExceptForTheFirstLine,
  renderShowcaseProperties,
  showcaseTemplateClassProperty,
  updateShowcase
} from "../utils";

const state: Partial<HTMLChTabRenderElement> = {};
const renderedItems = new Set(["item1"]);

const selectedItemChangeHandler = (
  event: ChTabRenderCustomEvent<TabSelectedItemInfo>
) => {
  renderedItems.add(event.detail.newSelectedId);
  state.selectedId = event.detail.newSelectedId; // TODO: Automatic sync this value in the UI

  // TODO: Until we support external slots in the ch-flexible-layout-render,
  // this is a hack to update the render of the widget and thus re-render the
  // combo-box updating the displayed items
  updateShowcase();
};

const handleItemClose = (event: CustomEvent<TabItemCloseInfo>) => {
  console.log(event.detail);
};

const render: ShowcaseRender = designSystem => (
  <div class="tab-test-main-wrapper">
    <fieldset>
      <legend class="heading-4">Simple pages</legend>

      <ch-tab-render
        class="tab"
        accessibleName={state.accessibleName}
        closeButton={state.closeButton}
        closeButtonAccessibleName={state.closeButtonAccessibleName}
        tabListPosition={state.tabListPosition}
        disabled={state.disabled}
        dragOutside={state.dragOutside}
        expanded={state.expanded}
        model={state.model}
        selectedId={state.selectedId}
        showCaptions={state.showCaptions}
        showTabListEnd={state.showTabListEnd}
        showTabListStart={state.showTabListStart}
        sortable={state.sortable}
        onItemClose={handleItemClose}
        onSelectedItemChange={selectedItemChangeHandler}
      >
        {renderedItems.has("item1") && (
          <div key="item1" slot="item1">
            Content of the item 1
            <label>
              Any text
              <input type="text" />
            </label>
          </div>
        )}

        {renderedItems.has("item2") && (
          <div key="item2" slot="item2">
            Content of the item 2
          </div>
        )}

        {renderedItems.has("item3") && (
          <div key="item3" slot="item3">
            Content of the item 3
          </div>
        )}

        {renderedItems.has("item4") && (
          <div key="item4" slot="item4">
            Content of the item 4
          </div>
        )}
      </ch-tab-render>
    </fieldset>

    <fieldset>
      <legend class="heading-4">Heavy pages</legend>

      <ch-tab-render
        class="tab"
        accessibleName={state.accessibleName}
        closeButton={state.closeButton}
        closeButtonAccessibleName={state.closeButtonAccessibleName}
        tabListPosition={state.tabListPosition}
        disabled={state.disabled}
        dragOutside={state.dragOutside}
        expanded={state.expanded}
        model={state.model}
        selectedId={state.selectedId}
        showCaptions={state.showCaptions}
        showTabListEnd={state.showTabListEnd}
        showTabListStart={state.showTabListStart}
        sortable={state.sortable}
        onItemClose={handleItemClose}
        onSelectedItemChange={selectedItemChangeHandler}
      >
        <ch-checkbox
          slot="tab-list-start"
          accessibleName="Visibility"
          class="checkbox"
          caption="Option"
          checkedValue="true"
        ></ch-checkbox>

        <ch-switch
          slot="tab-list-end"
          accessibleName="Visibility"
          class={designSystem === "mercury" ? "toggle-small" : "switch"}
          checkedValue="true"
          checkedCaption="Visibility"
          unCheckedCaption="Visibility"
        ></ch-switch>

        <ch-switch
          slot="tab-list-end"
          accessibleName="Status"
          class={designSystem === "mercury" ? "toggle-small" : "switch"}
          checkedValue="true"
          checkedCaption="Status"
          unCheckedCaption="Status"
        ></ch-switch>

        {renderedItems.has("item1") && (
          <ch-tree-view-render
            class="tree-view tree-view-secondary"
            slot="item1"
            showLines="last"
            model={kbExplorerModel}
            lazyLoadTreeItemsCallback={lazyLoadTreeItemsCallback}
          ></ch-tree-view-render>
        )}

        {renderedItems.has("item2") && (
          <ch-tree-view-render
            class="tree-view tree-view-secondary"
            slot="item2"
            showLines="last"
            model={preferencesModel}
            lazyLoadTreeItemsCallback={lazyLoadTreeItemsCallback}
          ></ch-tree-view-render>
        )}

        {renderedItems.has("item3") && (
          <div slot="item3">Content of the item 3</div>
        )}

        {renderedItems.has("item4") && (
          <div slot="item4">Content of the item 4</div>
        )}
      </ch-tab-render>
    </fieldset>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChTabRenderElement> =
  [
    {
      caption: "Models",
      properties: [
        {
          id: "model",
          accessibleName: "Model",
          type: "enum",
          values: [
            { caption: "Simple Model 1", value: simpleModel1 },
            { caption: "Simple Model 2", value: simpleModel2 },
            { caption: "Close Button Model", value: closeButtonModel },
            { caption: "Disabled Model 1", value: disabledModel1 },
            { caption: "Disabled Model 2", value: disabledModel2 },
            { caption: "Disabled Model 3", value: disabledModel3 },
            { caption: "Disabled Model 4", value: disabledModel4 }
          ],
          value: simpleModel1
        },
        {
          id: "selectedId",
          caption: "Selected Id",
          value: "item1",
          type: "string"
        }
      ]
    },
    {
      caption: "Properties",
      properties: [
        {
          id: "tabListPosition",
          caption: "Tab List Position",
          value: "block-start",
          values: [
            { caption: "Block Start", value: "block-start" },
            { caption: "Block End", value: "block-end" },
            { caption: "Inline Start", value: "inline-start" },
            { caption: "Inline End", value: "inline-end" }
          ],
          render: "radio-group",
          type: "enum"
        },
        {
          id: "showTabListStart",
          caption: "Show Tab List Start",
          type: "boolean",
          value: false
        },
        {
          id: "showTabListEnd",
          caption: "Show Tab List End",
          type: "boolean",
          value: false
        },
        {
          id: "contain",
          caption: "Contain",
          value: "none",
          values: [
            { caption: "style", value: "style" },
            { caption: "none", value: "none" },
            { caption: "size", value: "size" },
            { caption: "inline-size", value: "inline-size" },
            { caption: "layout", value: "layout" },
            { caption: "paint", value: "paint" },
            { caption: "content", value: "content" },
            { caption: "strict", value: "strict" }
          ],
          type: "enum"
        },
        {
          id: "overflow",
          caption: "Overflow",
          value: "visible",
          values: [
            { caption: "visible", value: "visible" },
            { caption: "hidden", value: "hidden" },
            { caption: "clip", value: "clip" },
            { caption: "scroll", value: "scroll" },
            { caption: "auto", value: "auto" },
            { caption: "visible hidden", value: "visible hidden" },
            { caption: "visible clip", value: "visible clip" },
            { caption: "visible scroll", value: "visible scroll" },
            { caption: "visible auto", value: "visible auto" },
            { caption: "hidden visible", value: "hidden visible" },
            { caption: "hidden clip", value: "hidden clip" },
            { caption: "hidden scroll", value: "hidden scroll" },
            { caption: "hidden auto", value: "hidden auto" },
            { caption: "clip visible", value: "clip visible" },
            { caption: "clip hidden", value: "clip hidden" },
            { caption: "clip scroll", value: "clip scroll" },
            { caption: "clip auto", value: "clip auto" },
            { caption: "auto visible", value: "auto visible" },
            { caption: "auto hidden", value: "auto hidden" },
            { caption: "auto clip", value: "auto clip" },
            { caption: "auto scroll", value: "auto scroll" }
          ],
          type: "enum"
        },
        {
          id: "accessibleName",
          caption: "Accessible Name",
          value: undefined,
          type: "string"
        },
        {
          id: "closeButton",
          caption: "Close Button",
          value: false,
          type: "boolean"
        },
        {
          id: "closeButtonAccessibleName",
          caption: "Close Button Accessible Name",
          value: "Close",
          type: "string"
        },
        {
          id: "disabled",
          caption: "Disabled",
          value: false,
          type: "boolean"
        },
        {
          id: "dragOutside",
          caption: "Drag Outside",
          value: false,
          type: "boolean"
        },
        {
          id: "expanded",
          caption: "Expanded",
          value: true,
          type: "boolean"
        },
        {
          id: "showCaptions",
          caption: "Show Captions",
          value: true,
          type: "boolean"
        },
        {
          id: "sortable",
          caption: "Sortable",
          value: false,
          type: "boolean"
        },
        {
          id: "tabButtonHidden",
          caption: "Tab Button Hidden",
          value: false,
          type: "boolean"
        }
      ]
    }
  ];

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChTabRenderElement>[] =
  [
    { name: "accessibleName", defaultValue: undefined, type: "string" },
    {
      name: "class",
      fixed: true,
      value: "tab",
      type: "string"
    },
    { name: "closeButton", defaultValue: false, type: "boolean" },
    {
      name: "closeButtonAccessibleName",
      defaultValue: "Close",
      type: "string"
    },
    { name: "contain", defaultValue: "none", type: "string" },
    { name: "direction", defaultValue: "block", type: "string" },
    { name: "disabled", defaultValue: false, type: "boolean" },
    { name: "dragOutside", defaultValue: false, type: "boolean" },
    { name: "expanded", defaultValue: true, type: "boolean" },
    { name: "model", fixed: true, value: "controlUIModel", type: "function" },
    { name: "overflow", defaultValue: "visible", type: "string" },
    { name: "selectedId", defaultValue: undefined, type: "string" },
    { name: "showCaptions", defaultValue: true, type: "boolean" },
    { name: "sortable", defaultValue: false, type: "boolean" },
    { name: "tabButtonHidden", defaultValue: false, type: "boolean" },
    {
      name: "itemClose",
      fixed: true,
      value: "handleItemClose",
      type: "event"
    },
    {
      name: "selectedItemChange",
      fixed: true,
      value: "handleSelectedItemChange",
      type: "event"
    },
    {
      name: "itemDragStart",
      fixed: true,
      value: "handleItemDragStart",
      type: "event"
    }
  ];

const lightDOMMarkup = (
  framework: ShowcaseTemplateFrameWork
) => `{renderedItems.has("item1") && (
  <div slot="item1">
    Content of the item 1
    <label>
      Any text
      <input ${showcaseTemplateClassProperty(framework, "input")} type="text" />
    </label>
  </div>
)}

{renderedItems.has("item2") && (
  <div slot="item2">Content of the item 2</div>
)}

{renderedItems.has("item3") && (
  <div slot="item3">Content of the item 3</div>
)}

{renderedItems.has("item4") && (
  <div slot="item4">Content of the item 4</div>
)}`;

const lightDOMMarkupReact = insertSpacesAtTheBeginningExceptForTheFirstLine(
  lightDOMMarkup("react"),
  8
);

const lightDOMMarkupStencil = insertSpacesAtTheBeginningExceptForTheFirstLine(
  lightDOMMarkup("stencil"),
  10
);

export const tabShowcaseStory: ShowcaseStory<HTMLChTabRenderElement> = {
  properties: showcaseRenderProperties,
  markupWithUIModel: {
    uiModel: () => state.model,
    uiModelType: "TabModel",
    render: {
      react: () => `<ChTabRender${renderShowcaseProperties(
        state,
        "react",
        showcasePropertiesInfo
      )}
      >
        ${lightDOMMarkupReact}
      </ChTabRender>`,

      stencil: () => `<ch-tab-render${renderShowcaseProperties(
        state,
        "stencil",
        showcasePropertiesInfo
      )}
        >
          ${lightDOMMarkupStencil}
        </ch-tab-render>`
    }
  },
  render: render,
  state: state
};
