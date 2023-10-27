import { TreeViewItemModel } from "../../tree-view/tree-view/types";
import {
  TreeViewFilterInfo,
  TreeViewFilterOptions,
  TreeViewFilterType
} from "./types";

const filterWithCamelCase = (
  stringToFilter: string,
  filter: string,
  camelCase?: boolean
) =>
  camelCase
    ? stringToFilter.includes(filter)
    : stringToFilter.toLowerCase().includes(filter.toLowerCase());

const filterWithString = (
  stringToFilter: string,
  filter: string,
  filterOptions: TreeViewFilterOptions
) =>
  filterOptions.regularExpression
    ? stringToFilter.match(filter) !== null
    : filterWithCamelCase(stringToFilter, filter, filterOptions.camelCase);

export const filterDictionary: {
  [key in TreeViewFilterType]: (
    item: TreeViewItemModel,
    filterInfo: TreeViewFilterInfo
  ) => boolean;
} = {
  caption: (item, filterInfo) =>
    filterInfo.filter
      ? filterWithString(
          item.caption ?? "",
          filterInfo.filter,
          filterInfo.filterOptions
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
          filterInfo.filterOptions
        )
      : true,

  none: () => true,

  unchecked: (item, filterInfo) =>
    (item.checkbox ?? filterInfo.defaultCheckbox) &&
    !item.indeterminate &&
    !(item.checked ?? filterInfo.defaultChecked)
};

export type TreeViewItemSimplifiedModel = {
  id: string;
  items: TreeViewItemSimplifiedModel[];
};

export function simplifyModel(
  model: TreeViewItemModel
): TreeViewItemSimplifiedModel[] {
  const items = model.items;

  if (!items) {
    return [];
  }

  const simplifiedModel: TreeViewItemSimplifiedModel[] = items.map(item => ({
    id: item.id,
    items: simplifyModel(item)
  }));

  return simplifiedModel;
}

export const prettyPrint = (value: any) => JSON.stringify(value, undefined, 2);
