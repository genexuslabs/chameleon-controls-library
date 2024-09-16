import { h } from "@stencil/core";
import {
  ShowcaseRenderProperties,
  ShowcaseStory,
  ShowcaseTemplatePropertyInfo
} from "../types";
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
import { renderShowcaseProperties } from "../utils";

const state: Partial<HTMLChTreeViewRenderElement> = {};

const render = () => (
  <ch-tree-view-render
    class="tree-view tree-view-secondary"
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
    lazyLoadTreeItemsCallback={lazyLoadTreeItemsCallback}
    model={state.model}
    modifyItemCaptionCallback={state.modifyItemCaptionCallback}
    multiSelection={state.multiSelection}
    showLines={state.showLines}
    sortItemsCallback={state.sortItemsCallback}
    toggleCheckboxes={state.toggleCheckboxes}
  ></ch-tree-view-render>
);

const showcaseRenderProperties: ShowcaseRenderProperties<HTMLChTreeViewRenderElement> =
  [
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
          id: "expandOnClick",
          caption: "Expand on Click",
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
          value: undefined,
          type: "string"
        }
      ]
    }
  ];

// Hide matches and show non-matches

const showcasePropertiesInfo: ShowcaseTemplatePropertyInfo<HTMLChTreeViewRenderElement>[] =
  [
    { name: "checkbox", defaultValue: false, type: "boolean" },
    { name: "checked", defaultValue: false, type: "boolean" },
    {
      name: "class",
      fixed: true,
      value: "tree-view tree-view-secondary",
      type: "string"
    },
    {
      name: "checkDroppableZoneCallback",
      fixed: true,
      value: "checkDroppableZoneCallback",
      type: "function"
    },
    { name: "dragDisabled", defaultValue: true, type: "boolean" },
    { name: "dropDisabled", defaultValue: true, type: "boolean" },
    {
      name: "dropItemsCallback",
      fixed: true,
      value: "dropItemsCallback",
      type: "function"
    },
    { name: "dropMode", defaultValue: "above", type: "string" },
    { name: "editableItems", defaultValue: false, type: "boolean" },
    { name: "expandableButton", defaultValue: "decorative", type: "string" },
    { name: "expandOnClick", defaultValue: true, type: "boolean" },
    { name: "filter", defaultValue: undefined, type: "string" },
    { name: "filterDebounce", defaultValue: 250, type: "number" },
    // TODO: filterList and filterOptions
    { name: "filterType", defaultValue: "none", type: "string" },
    {
      name: "getImagePathCallback",
      fixed: true,
      value: "getImagePathCallback",
      type: "function"
    },
    {
      name: "lazyLoadTreeItemsCallback",
      fixed: true,
      value: "lazyLoadTreeItemsCallback",
      type: "function"
    },
    {
      name: "modifyItemCaptionCallback",
      fixed: true,
      value: "modifyItemCaptionCallback",
      type: "function"
    },
    { name: "multiSelection", defaultValue: false, type: "boolean" },
    { name: "model", fixed: true, value: "controlUIModel", type: "function" },
    { name: "showLines", defaultValue: "none", type: "string" },
    {
      name: "sortItemsCallback",
      fixed: true,
      value: "sortItemsCallback",
      type: "function"
    },
    { name: "toggleCheckboxes", defaultValue: false, type: "boolean" },
    {
      name: "checkedItemsChange",
      fixed: true,
      value: "handleCheckedItemsChange",
      type: "event"
    },
    {
      name: "itemContextmenu",
      fixed: true,
      value: "handleItemContextmenu",
      type: "event"
    },
    {
      name: "itemOpenReference",
      fixed: true,
      value: "handleItemOpenReference",
      type: "event"
    },
    {
      name: "selectedItemsChange",
      fixed: true,
      value: "handleSelectedItemsChange",
      type: "event"
    }
  ];

export const treeViewShowcaseStory: ShowcaseStory<HTMLChTreeViewRenderElement> =
  {
    properties: showcaseRenderProperties,
    render: render,
    markupWithUIModel: {
      uiModel: () => state.model,
      uiModelType: "TreeViewModel",
      render: {
        react: () => `<ChTreeViewRender${renderShowcaseProperties(
          state,
          "react",
          showcasePropertiesInfo
        )}
      ></ChTreeViewRender>`,

        stencil: () => `<ch-tree-view-render${renderShowcaseProperties(
          state,
          "stencil",
          showcasePropertiesInfo
        )}
        ></ch-tree-view-render>`
      }
    },
    state: state
  };
