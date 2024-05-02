import { h } from "@stencil/core";
import { ChTreeViewRender } from "../../../../components/tree-view/tree-view-render";
import { ShowcaseRenderProperties, ShowcaseStory } from "../showcase/types";
import { Mutable } from "../../../../common/types";

const state: Partial<Mutable<ChTreeViewRender>> = {};

const render = () => (
  <ch-tree-view-render
    checkbox={state.checkbox}
    checked={state.checked}
    dragDisabled={state.dragDisabled}
    dropDisabled={state.dropDisabled}
    dropItemsCallback={state.dropItemsCallback}
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
    lazyLoadTreeItemsCallback={state.lazyLoadTreeItemsCallback}
    modifyItemCaptionCallback={state.modifyItemCaptionCallback}
    multiSelection={state.multiSelection}
    showLines={state.showLines}
    sortItemsCallback={state.sortItemsCallback}
    toggleCheckboxes={state.toggleCheckboxes}
    treeModel={state.treeModel}
  ></ch-tree-view-render>
);

const showcaseRenderProperties: ShowcaseRenderProperties<
  Mutable<ChTreeViewRender>
> = [
  { id: "checkbox", caption: "Checkbox", default: false, type: "boolean" },
  { id: "checked", caption: "Checked", default: false, type: "boolean" },
  {
    id: "showLines",
    caption: "Show Lines",
    default: "all",
    type: "enum",
    values: ["all", "last", "none"]
  }
];

export const treeViewShowcaseStory: ShowcaseStory<Mutable<ChTreeViewRender>> = {
  properties: showcaseRenderProperties,
  render: render,
  state: state
};
