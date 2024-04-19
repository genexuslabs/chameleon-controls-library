import {
  ComboBoxFilterInfo,
  ComboBoxFilterOptions,
  ComboBoxFilterType,
  ComboBoxItemModel
} from "./types";

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
  filterOptions: ComboBoxFilterOptions
) =>
  filterOptions?.regularExpression
    ? stringToFilter.match(filter) !== null
    : filterWithCase(stringToFilter, filter, filterOptions?.matchCase);

const filterDictionary: {
  [key in ComboBoxFilterType]: (
    item: ComboBoxItemModel,
    filterInfo: ComboBoxFilterInfo
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

  list: (item, filterInfo) => filterInfo.filterSet.has(item.value),

  value: (item, filterInfo) =>
    filterInfo.filter
      ? filterWithString(
          item.value,
          filterInfo.filter,
          filterInfo.filterOptions
        )
      : true,

  none: () => true
};

export const computeFilter = (
  filterType: ComboBoxFilterType,
  item: ComboBoxItemModel,
  filterInfo: ComboBoxFilterInfo
): boolean =>
  filterInfo.filterOptions?.hideMatchesAndShowNonMatches === true
    ? !filterDictionary[filterType](item, filterInfo)
    : filterDictionary[filterType](item, filterInfo);
