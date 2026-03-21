import {
  ActionListItemActionable,
  ActionListItemGroup,
  ActionListItemModelExtended,
  ActionListModel
} from "./types";

const flattenSubUIModel = (
  model: ActionListItemActionable[],
  parentItem: ActionListItemGroup,
  flattenedModel: Map<string, ActionListItemModelExtended>,
  sortModel: (model: ActionListModel) => void
) => {
  if (!model) {
    return;
  }

  // Traditional for loop is the faster "for"
  for (let index = 0; index < model.length; index++) {
    const itemInfo = model[index];
    flattenedModel.set(itemInfo.id, {
      item: itemInfo,
      parentItem: parentItem
    });
  }

  sortModel(model);
};

export const flattenActionListUIModel = (
  model: ActionListModel,
  flattenedModel: Map<string, ActionListItemModelExtended>,
  sortModel: (model: ActionListModel) => void
) => {
  flattenedModel.clear();

  if (!model) {
    return;
  }

  // Traditional for loop is the faster "for"
  for (let index = 0; index < model.length; index++) {
    const itemInfo = model[index];

    // Group
    if (itemInfo.type === "group") {
      flattenedModel.set(itemInfo.id, { item: itemInfo, root: model });
      flattenSubUIModel(itemInfo.items, itemInfo, flattenedModel, sortModel);
    }
    // Actionable
    else if (itemInfo.type === "actionable") {
      flattenedModel.set(itemInfo.id, { item: itemInfo, root: model });
    }
  }

  sortModel(model);
};
