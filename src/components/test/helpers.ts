import { TreeXItemModel } from "../tree-view/tree-x/types";
import { TreeXFilterInfo, TreeXFilterType } from "./types";

const filterWithString = (
  stringToFilter: string,
  filter: string,
  regularExpression?: boolean
) =>
  regularExpression
    ? stringToFilter.match(filter) !== null
    : stringToFilter.includes(filter);

export const filterDictionary: {
  [key in TreeXFilterType]: (
    item: TreeXItemModel,
    filterInfo: TreeXFilterInfo
  ) => boolean;
} = {
  caption: (item, filterInfo) =>
    filterInfo.filter
      ? filterWithString(
          item.caption ?? "",
          filterInfo.filter,
          filterInfo.filterOptions.regularExpression
        )
      : true,

  checked: (item, filterInfo) =>
    (item.checkbox ?? filterInfo.defaultCheckbox) &&
    !item.indeterminate &&
    (item.checked ?? filterInfo.defaultChecked),

  "id-list": (item, filterInfo) => filterInfo.filterList.includes(item.id),

  metadata: (item, filterInfo) =>
    filterInfo.filter
      ? filterWithString(
          item.metadata ?? "",
          filterInfo.filter,
          filterInfo.filterOptions.regularExpression
        )
      : true,

  none: () => true,

  unchecked: (item, filterInfo) =>
    (item.checkbox ?? filterInfo.defaultCheckbox) &&
    !item.indeterminate &&
    !(item.checked ?? filterInfo.defaultChecked)
};

export type TreeXItemSimplifiedModel = {
  id: string;
  items: TreeXItemSimplifiedModel[];
};

export function simplifyModel(
  model: TreeXItemModel
): TreeXItemSimplifiedModel[] {
  const items = model.items;

  if (!items) {
    return [];
  }

  const simplifiedModel: TreeXItemSimplifiedModel[] = items.map(item => ({
    id: item.id,
    items: simplifyModel(item)
  }));

  return simplifiedModel;
}

export const prettyPrint = (value: any) => JSON.stringify(value, undefined, 2);
