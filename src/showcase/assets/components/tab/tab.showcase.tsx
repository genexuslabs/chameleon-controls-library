import { forceUpdate, h } from "@stencil/core";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import {
  disabledModel1,
  disabledModel4,
  disabledModel2,
  disabledModel3,
  simpleModel1,
  simpleModel2
} from "./models";
import { ChTabRenderCustomEvent } from "../../../../components";
import { TabSelectedItemInfo } from "../../../../components/tab/types";
import {
  kbExplorerModel,
  lazyLoadTreeItemsCallback,
  preferencesModel
} from "../tree-view/models";
import { renderBooleanPropertyOrEmpty } from "../utils";

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
  const showcaseRef = event.target.closest("ch-showcase");

  if (showcaseRef) {
    forceUpdate(showcaseRef);
  }
};

const render = () => (
  <div class="tab-test-main-wrapper">
    <fieldset>
      <legend class="heading-4">Simple pages</legend>

      <ch-tab-render
        class="tab"
        accessibleName={state.accessibleName}
        closeButton={state.closeButton}
        closeButtonAccessibleName={state.closeButtonAccessibleName}
        direction={state.direction}
        disabled={state.disabled}
        dragOutside={state.dragOutside}
        expanded={state.expanded}
        model={state.model}
        selectedId={state.selectedId}
        showCaptions={state.showCaptions}
        sortable={state.sortable}
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
        direction={state.direction}
        disabled={state.disabled}
        dragOutside={state.dragOutside}
        expanded={state.expanded}
        model={state.model}
        selectedId={state.selectedId}
        showCaptions={state.showCaptions}
        sortable={state.sortable}
        onSelectedItemChange={selectedItemChangeHandler}
      >
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
          id: "direction",
          caption: "Direction",
          value: "block",
          values: [
            { caption: "Block", value: "block" },
            { caption: "Inline", value: "inline" }
          ],
          render: "radio-group",
          type: "enum"
        },
        {
          id: "accessibleName",
          caption: "Accessible Name",
          value: "",
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
          value: true,
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
        }
      ]
    }
  ];

export const tabShowcaseStory: ShowcaseStory<HTMLChTabRenderElement> = {
  properties: showcaseRenderProperties,
  markupWithUIModel: {
    uiModel: () => state.model,
    uiModelType: "TabModel",
    render: () => `<ch-tab-render
          accessibleName="${state.accessibleName}"
          class="tab"${renderBooleanPropertyOrEmpty("closeButton", state)}
          direction="${state.direction}"${renderBooleanPropertyOrEmpty(
      "disabled",
      state
    )}${renderBooleanPropertyOrEmpty(
      "dragOutside",
      state
    )}${renderBooleanPropertyOrEmpty("expanded", state)}
          model={this.#controlUIModel}
          selectedId="${state.selectedId}"${renderBooleanPropertyOrEmpty(
      "sortable",
      state
    )}${renderBooleanPropertyOrEmpty("showCaptions", state)}
          onSelectedItemChange={this.#handleSelectedItemChange}
        >
          {renderedItems.has("item1") && (
            <div slot="item1">
              Content of the item 1
              <label>
                Any text
                <input type="text" />
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
          )}   
        </ch-tab-render>`
  },
  render: render,
  state: state
};
