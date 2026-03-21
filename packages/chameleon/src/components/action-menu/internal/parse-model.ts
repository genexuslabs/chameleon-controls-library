import { MODEL_METADATA } from "../../../common/reserved-names";
import {
  ActionMenuItemActionableModel,
  ActionMenuItemModel,
  ActionMenuItemModelMetadata,
  ActionMenuModel
} from "../types";
import {
  actionMenuItemActionableIsExpandable,
  actionMenuItemIsActionable
} from "./utils";

export const addMetadataInActionMenuItem = (
  itemUIModel: ActionMenuItemModel,
  parentItem: ActionMenuItemActionableModel | undefined
) => {
  itemUIModel[MODEL_METADATA] = {
    parentItem
  } satisfies ActionMenuItemModelMetadata;
};

export const getActionMenuItemMetadata = (
  itemUIModel: ActionMenuItemModel
): ActionMenuItemModelMetadata => itemUIModel[MODEL_METADATA];

export const parseSubModel = (
  parentModel: ActionMenuModel,
  parentItem: ActionMenuItemActionableModel | undefined
) => {
  // For loop is the fastest iterator
  for (let index = 0; index < parentModel.length; index++) {
    const itemUIModel = parentModel[index];

    addMetadataInActionMenuItem(itemUIModel, parentItem);

    if (
      actionMenuItemIsActionable(itemUIModel) &&
      actionMenuItemActionableIsExpandable(itemUIModel)
    ) {
      parseSubModel(itemUIModel.items, itemUIModel);
    }
  }
};
