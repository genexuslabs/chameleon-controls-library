import { DropdownItemActionableModel, DropdownModel } from "../types";
import { getDropdownItemMetadata } from "./parse-model";
import { dropdownItemIsActionable } from "./utils";

export const collapseAllItems = (model: DropdownModel) => {
  // For loop is the fastest iterator
  for (let index = 0; index < model.length; index++) {
    const itemUIModel = model[index];

    if (dropdownItemIsActionable(itemUIModel) && itemUIModel.expanded) {
      itemUIModel.expanded = false;

      if (itemUIModel.items?.length > 0) {
        collapseAllItems(itemUIModel.items);
      }
    }
  }
};

export const collapseSubTree = (item: DropdownItemActionableModel) => {
  item.expanded = false;

  if (item.items?.length > 0) {
    collapseAllItems(item.items);
  }
};

export const expandFromRootToNode = (
  itemUIModelExtended: DropdownItemActionableModel
) => {
  let parentUIModelExtended = itemUIModelExtended;

  while (parentUIModelExtended !== undefined) {
    parentUIModelExtended.expanded = true;

    parentUIModelExtended = getDropdownItemMetadata(
      parentUIModelExtended
    ).parentItem;
  }
};
