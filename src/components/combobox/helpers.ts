import {
  ComboBoxFilterInfo,
  ComboBoxFilterOptions,
  ComboBoxFilterType,
  ComboBoxItemGroup,
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

const computeFilter = (
  filterType: ComboBoxFilterType,
  item: ComboBoxItemModel,
  filterInfo: ComboBoxFilterInfo
): boolean =>
  filterInfo.filterOptions?.hideMatchesAndShowNonMatches === true
    ? !filterDictionary[filterType](item, filterInfo)
    : filterDictionary[filterType](item, filterInfo);

export const filterSubModel = (
  item: ComboBoxItemModel,
  filterType: ComboBoxFilterType,
  filterInfo: ComboBoxFilterInfo,
  displayedValues: Set<string>
): boolean => {
  // Check if a subitem is rendered
  let aSubItemIsRendered = false;
  const itemSubGroup = (item as ComboBoxItemGroup).items;

  if (itemSubGroup != null) {
    for (let index = 0; index < itemSubGroup.length; index++) {
      const itemLeaf = itemSubGroup[index];
      const itemSatisfiesFilter = filterSubModel(
        itemLeaf,
        filterType,
        filterInfo,
        displayedValues
      );

      aSubItemIsRendered ||= itemSatisfiesFilter;
    }
  }

  // The current item is rendered if it satisfies the filter condition or a
  // subitem exists that needs to be rendered
  const satisfiesFilter =
    aSubItemIsRendered || computeFilter(filterType, item, filterInfo);

  // Update selected and checkbox items
  if (satisfiesFilter) {
    displayedValues.add(item.value);
  }

  return satisfiesFilter;
};
