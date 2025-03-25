import { ActionMenuItemActionableModel, ActionMenuModel } from "../types";
import { getActionMenuItemMetadata } from "./parse-model";
import { actionMenuItemIsActionable } from "./utils";

export const collapseAllItems = (model: ActionMenuModel) => {
  // For loop is the fastest iterator
  for (let index = 0; index < model.length; index++) {
    const itemUIModel = model[index];

    if (actionMenuItemIsActionable(itemUIModel) && itemUIModel.expanded) {
      itemUIModel.expanded = false;

      if (itemUIModel.items?.length > 0) {
        collapseAllItems(itemUIModel.items);
      }
    }
  }
};

export const collapseSubTree = (item: ActionMenuItemActionableModel) => {
  item.expanded = false;

  if (item.items?.length > 0) {
    collapseAllItems(item.items);
  }
};

export const expandFromRootToNode = (
  itemUIModelExtended: ActionMenuItemActionableModel
) => {
  let parentUIModelExtended = itemUIModelExtended;

  while (parentUIModelExtended !== undefined) {
    parentUIModelExtended.expanded = true;

    parentUIModelExtended = getActionMenuItemMetadata(
      parentUIModelExtended
    ).parentItem;
  }
};
