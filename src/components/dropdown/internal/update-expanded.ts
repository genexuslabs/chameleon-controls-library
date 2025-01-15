import {
  DropdownItemActionableModel,
  DropdownItemModelExtended,
  DropdownModel
} from "../types";
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
  itemUIModelExtended: DropdownItemModelExtended
) => {
  let parentUIModelExtended = itemUIModelExtended;

  while (parentUIModelExtended !== undefined) {
    (parentUIModelExtended.item as DropdownItemActionableModel).expanded = true;

    parentUIModelExtended = parentUIModelExtended.parentItem;
  }
};
