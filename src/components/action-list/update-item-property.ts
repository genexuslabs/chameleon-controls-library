import {
  ActionListItemModel,
  ActionListItemModelExtended,
  ActionListItemModelExtendedGroup,
  ActionListItemModelExtendedRoot,
  ActionListItemType,
  ActionListModel
} from "./types";

export const updateItemProperty = (
  itemId: string,
  properties: Partial<ActionListItemModel> & { type: ActionListItemType },
  flattenedTreeModel: Map<string, ActionListItemModelExtended>,
  newSelectedItems: Set<string>
): ActionListModel | undefined => {
  const itemUIModel = flattenedTreeModel.get(itemId);
  if (!itemUIModel) {
    return undefined;
  }
  const itemInfo = itemUIModel.item;

  if (properties.type !== itemInfo.type) {
    return undefined;
  }

  Object.keys(properties).forEach(propertyName => {
    if (properties[propertyName] !== undefined) {
      itemInfo[propertyName] = properties[propertyName];
    }
  });

  if (properties.type === "separator") {
    return undefined;
  }

  // Accumulate selection/deselection
  if (properties.selected) {
    newSelectedItems.add(itemId);
  } else if (properties.selected === false) {
    newSelectedItems.delete(itemId);
  }

  return (
    (itemUIModel as ActionListItemModelExtendedRoot).root ??
    (itemUIModel as ActionListItemModelExtendedGroup).parentItem.items
  );
};
