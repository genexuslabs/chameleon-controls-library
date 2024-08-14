import {
  ActionListItemModel,
  ActionListItemModelExtended,
  ActionListItemType
} from "./types";

export const updateItemProperty = (
  itemId: string,
  properties: Partial<ActionListItemModel> & { type: ActionListItemType },
  flattenedTreeModel: Map<string, ActionListItemModelExtended>,
  newSelectedItems: Set<string>
) => {
  const itemUIModel = flattenedTreeModel.get(itemId);
  if (!itemUIModel) {
    return;
  }
  const itemInfo = itemUIModel.item;

  if (properties.type !== itemInfo.type) {
    return;
  }

  Object.keys(properties).forEach(propertyName => {
    if (properties[propertyName] !== undefined) {
      itemInfo[propertyName] = properties[propertyName];
    }
  });

  if (properties.type === "separator") {
    return;
  }

  // Accumulate selection/deselection
  if (properties.selected) {
    newSelectedItems.add(itemId);
  } else if (properties.selected === false) {
    newSelectedItems.delete(itemId);
  }
};
