import { removeElement } from "../../../common/array";
import {
  FlexibleLayoutLeaf,
  FlexibleLayoutView
} from "../../flexible-layout/types";

export const removeView = (
  viewId: string,
  viewsInfo: Map<string, FlexibleLayoutView>,
  renderedWidgets: Set<string>,
  removeRenderedWidgets: boolean
) => {
  const viewInfo = viewsInfo.get(viewId);

  if (!viewInfo) {
    return false;
  }

  // Remove rendered widgets
  if (removeRenderedWidgets) {
    viewInfo.widgets.forEach(widget => {
      renderedWidgets.delete(widget.id);
    });
  }

  const parentItemRefItems = viewInfo.parentItemRef.items;

  // The space reserved for the view can be given to a sibling view
  if (parentItemRefItems.length > 1) {
    const viewToAddSpace =
      parentItemRefItems[
        viewInfo.itemRefIndex === 0 ? 1 : viewInfo.itemRefIndex - 1
      ];

    addSpaceToView(viewInfo.itemRef, viewToAddSpace as FlexibleLayoutLeaf);
  }

  // Delete the view
  removeElement(parentItemRefItems, viewInfo.itemRefIndex);
  removeElement(viewInfo.parentDistributionRef.items, viewInfo.itemRefIndex);
  viewsInfo.delete(viewId);

  return true;
};

function addSpaceToView(
  viewToSubtract: FlexibleLayoutLeaf,
  viewToAdd: FlexibleLayoutLeaf
) {
  console.log(viewToSubtract, viewToAdd);
  // TODO: Add implementation. Ensure the given space is relative to 100% (1fr)
}
