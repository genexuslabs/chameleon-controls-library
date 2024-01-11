import { TreeViewItemModel } from "../../tree-view/tree-view/types";
import {
  TreeViewFilterInfo,
  TreeViewFilterOptions,
  TreeViewFilterType
} from "./types";

export const itemHasCheckbox = (
  item: TreeViewItemModel,
  defaultCheckbox: boolean
) => item.checkbox ?? defaultCheckbox;

const filterWithCase = (
  stringToFilter: string,
  filter: string,
  matchCase?: boolean
) =>
  matchCase
    ? stringToFilter.includes(filter)
    : stringToFilter.toLowerCase().includes(filter.toLowerCase());

const filterWithString = (
  stringToFilter: string,
  filter: string,
  filterOptions: TreeViewFilterOptions
) =>
  filterOptions?.regularExpression
    ? stringToFilter.match(filter) !== null
    : filterWithCase(stringToFilter, filter, filterOptions?.matchCase);

const filterDictionary: {
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
    itemHasCheckbox(item, filterInfo.defaultCheckbox) &&
    !item.indeterminate &&
    (item.checked ?? filterInfo.defaultChecked),

  list: (item, filterInfo) => filterInfo.filterSet.has(item.id),

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
    itemHasCheckbox(item, filterInfo.defaultCheckbox) &&
    !item.indeterminate &&
    !(item.checked ?? filterInfo.defaultChecked)
};

export const computeFilter = (
  filterType: TreeViewFilterType,
  item: TreeViewItemModel,
  filterInfo: TreeViewFilterInfo
): boolean =>
  filterInfo.filterOptions?.hideMatchesAndShowNonMatches === true
    ? !filterDictionary[filterType](item, filterInfo)
    : filterDictionary[filterType](item, filterInfo);

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
