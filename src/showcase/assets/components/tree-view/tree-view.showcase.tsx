import { h } from "@stencil/core";
import { ChTreeViewRender } from "../../../../components/tree-view/tree-view-render";
import { ShowcaseRenderProperties, ShowcaseStory } from "../types";
import { Mutable } from "../../../../common/types";
import {
  lazyLargeModel,
  disabledItemsModel,
  eagerLargeModel,
  fileSystemModel,
  kbExplorerModel,
  lazyLoadTreeItemsCallback,
  importObjectsModel,
  simpleModel1,
  simpleModel2,
  checkDroppableZoneCallback,
  dropItemsCallback
} from "./models";

const state: Partial<Mutable<ChTreeViewRender>> = {};

const render = () => (
  <ch-tree-view-render
    class="tree-view-secondary"
    checkbox={state.checkbox}
    checked={state.checked}
    checkDroppableZoneCallback={checkDroppableZoneCallback}
    dragDisabled={state.dragDisabled}
    dropDisabled={state.dropDisabled}
    dropItemsCallback={dropItemsCallback}
    dropMode={state.dropMode}
    editableItems={state.editableItems}
    expandOnClick={state.expandOnClick}
    expandableButton={state.expandableButton}
    filter={state.filter}
    filterDebounce={state.filterDebounce}
    filterList={state.filterList}
    filterOptions={state.filterOptions}
    filterType={state.filterType}
    getImagePathCallback={state.getImagePathCallback}
    lazyLoadTreeItemsCallback={lazyLoadTreeItemsCallback}
    model={state.model}
    modifyItemCaptionCallback={state.modifyItemCaptionCallback}
    multiSelection={state.multiSelection}
    showLines={state.showLines}
    sortItemsCallback={state.sortItemsCallback}
    toggleCheckboxes={state.toggleCheckboxes}
  ></ch-tree-view-render>
);

const showcaseRenderProperties: ShowcaseRenderProperties<
  Mutable<ChTreeViewRender>
> = [
  {
    caption: "Models",
    properties: [
      {
        id: "model",
        accessibleName: "Model",
        type: "enum",
        values: [
          { caption: "KB Explorer", value: kbExplorerModel },
          { caption: "Import Objects", value: importObjectsModel },
          { caption: "File System", value: fileSystemModel },
          { caption: "Disabled items", value: disabledItemsModel },
          { caption: "Simple model 1", value: simpleModel1 },
          { caption: "Simple model 2", value: simpleModel2 },
          { caption: "Lazy Large Tree (10x20x20)", value: lazyLargeModel },
          { caption: "Eager Large Tree (10x20x20)", value: eagerLargeModel }
        ],
        value: kbExplorerModel
      }
    ]
  },
  {
    caption: "Properties",
    columns: 2,
    properties: [
      { id: "checkbox", caption: "Checkbox", value: false, type: "boolean" },
      { id: "checked", caption: "Checked", value: false, type: "boolean" },

      {
        id: "dragDisabled",
        caption: "Drag Disabled",
        value: false,
        type: "boolean"
      },
      {
        id: "dropDisabled",
        caption: "Drop Disabled",
        value: false,
        type: "boolean"
      },
      {
        id: "editableItems",
        caption: "Editable Items",
        value: true,
        type: "boolean"
      },
      {
        id: "multiSelection",
        caption: "Multi Selection",
        value: true,
        type: "boolean"
      },
      {
        id: "toggleCheckboxes",
        columnSpan: 2,
        caption: "Toggle Checkboxes",
        value: false,
        type: "boolean"
      },
      {
        id: "expandableButton",
        caption: "Expandable Button",
        value: "decorative",
        type: "enum",
        values: [
          { caption: "Action", value: "action" },
          { caption: "Decorative", value: "decorative" },
          { caption: "No", value: "no" }
        ]
      },
      {
        id: "dropMode",
        caption: "Drop Mode",
        value: "above",
        type: "enum",
        values: [
          { caption: "Above", value: "above" },
          { caption: "Before and After", value: "before-and-after" },
          { caption: "All", value: "all" }
        ]
      },
      {
        id: "showLines",
        columnSpan: 2,
        caption: "Lines",
        value: "all",
        render: "radio-group",
        type: "enum",
        values: [
          { caption: "All", value: "all" },
          { caption: "Last", value: "last" },
          { caption: "None", value: "none" }
        ]
      }
    ]
  },
  {
    caption: "Filters",
    columns: 2,
    properties: [
      {
        id: "filterType",
        caption: "Filter Type",
        value: "none",
        type: "enum",
        values: [
          { caption: "None", value: "none" },
          { caption: "Caption", value: "caption" },
          { caption: "Metadata", value: "metadata" },
          { caption: "Checked", value: "checked" },
          { caption: "Unchecked", value: "unchecked" },
          { caption: "List", value: "list" }
        ]
      },
      {
        id: "filterDebounce",
        caption: "Filter Debounce",
        value: 250,
        type: "number"
      },
      {
        id: "filter",
        columnSpan: 2,
        caption: "Filter",
        value: "",
        type: "string"
      }
    ]
  }
];

// Hide matches and show non-matches

export const treeViewShowcaseStory: ShowcaseStory<Mutable<ChTreeViewRender>> = {
  properties: showcaseRenderProperties,
  render: render,
  state: state
};
