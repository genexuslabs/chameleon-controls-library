import { ActionListModel } from "./types";

export const setActionListSelectedItems = (
  model: ActionListModel,
  selectedItems: Set<string>
) => {
  for (let index = 0; index < model.length; index++) {
    const itemUIModel = model[index];

    if (itemUIModel.type === "actionable" && itemUIModel.selected) {
      selectedItems.add(itemUIModel.id);
    } else if (itemUIModel.type === "group" && itemUIModel.items != null) {
      setActionListSelectedItems(itemUIModel.items, selectedItems);
    }
  }
};
