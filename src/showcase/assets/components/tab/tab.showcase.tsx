import { forceUpdate, h } from "@stencil/core";
import { ChList } from "../../../../components/list/list";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { Mutable } from "../../../../common/types";
import { simpleModel1, simpleModel2 } from "./models";
import {
  ChListCustomEvent,
  ListSelectedItemInfo
} from "../../../../components";
import {
  kbExplorerModel,
  lazyLoadTreeItemsCallback,
  preferencesModel
} from "../tree-view/models";

const state: Partial<Mutable<ChList>> = {};
const renderedItems = new Set(["item1"]);

const selectedItemChangeHandler = (
  event: ChListCustomEvent<ListSelectedItemInfo>
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
      <legend class="heading-4 field-legend-test">Simple pages</legend>

      <ch-list
        class="tab"
        accessibleName={state.accessibleName}
        closeButtonAccessibleName={state.closeButtonAccessibleName}
        closeButtonHidden={state.closeButtonHidden}
        direction={state.direction}
        dragOutsideDisabled={state.dragOutsideDisabled}
        expanded={state.expanded}
        model={state.model}
        selectedId={state.selectedId}
        showCaptions={state.showCaptions}
        sortable={state.sortable}
        onSelectedItemChange={selectedItemChangeHandler}
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
      </ch-list>
    </fieldset>

    <fieldset>
      <legend class="heading-4 field-legend-test">Heavy pages</legend>

      <ch-list
        class="tab"
        accessibleName={state.accessibleName}
        closeButtonAccessibleName={state.closeButtonAccessibleName}
        closeButtonHidden={state.closeButtonHidden}
        direction={state.direction}
        dragOutsideDisabled={state.dragOutsideDisabled}
        expanded={state.expanded}
        model={state.model}
        selectedId={state.selectedId}
        showCaptions={state.showCaptions}
        sortable={state.sortable}
        onSelectedItemChange={selectedItemChangeHandler}
      >
        {renderedItems.has("item1") && (
          <ch-tree-view-render
            slot="item1"
            showLines="last"
            model={kbExplorerModel}
            lazyLoadTreeItemsCallback={lazyLoadTreeItemsCallback}
          ></ch-tree-view-render>
        )}

        {renderedItems.has("item2") && (
          <ch-tree-view-render
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
      </ch-list>
    </fieldset>
  </div>
);

const showcaseRenderProperties: ShowcaseRenderProperties<Mutable<ChList>> = [
  {
    caption: "Models",
    properties: [
      {
        id: "model",
        accessibleName: "Model",
        type: "enum",
        values: [
          { caption: "Simple Model 1", value: simpleModel1 },
          { caption: "Simple Model 2", value: simpleModel2 }
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
        id: "closeButtonAccessibleName",
        caption: "Close Button Accessible Name",
        value: "Close",
        type: "string"
      },
      {
        id: "closeButtonHidden",
        caption: "Close Button Hidden",
        value: true,
        type: "boolean"
      },
      {
        id: "dragOutsideDisabled",
        caption: "Drag Outside Disabled",
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
      }
    ]
  }
];

export const tabShowcaseStory: ShowcaseStory<Mutable<ChList>> = {
  properties: showcaseRenderProperties,
  render: render,
  state: state
};