import {
  ComboBoxSuggestInfo,
  ComboBoxSuggestOptions,
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
  filterOptions: ComboBoxSuggestOptions
) =>
  filterOptions?.regularExpression
    ? stringToFilter.match(filter) !== null
    : filterWithCase(stringToFilter, filter, filterOptions?.matchCase);

const filterCaption = (
  item: ComboBoxItemModel,
  filterInfo: ComboBoxSuggestInfo
) =>
  !filterInfo.filter ||
  filterWithString(
    item.caption ?? item.value,
    filterInfo.filter,
    filterInfo.options
  );

const computeFilter = (
  item: ComboBoxItemModel,
  filterInfo: ComboBoxSuggestInfo
): boolean =>
  filterInfo.options?.hideMatchesAndShowNonMatches === true
    ? !filterCaption(item, filterInfo)
    : filterCaption(item, filterInfo);

export const filterSubModel = (
  item: ComboBoxItemModel,
  filterInfo: ComboBoxSuggestInfo,
  displayedValues: Set<ComboBoxItemModel>
): boolean => {
  // Check if a subitem is rendered
  let aSubItemIsRendered = false;
  const itemSubGroup = (item as ComboBoxItemGroup).items;

  if (itemSubGroup != null) {
    for (let index = 0; index < itemSubGroup.length; index++) {
      const itemLeaf = itemSubGroup[index];
      const itemSatisfiesFilter = filterSubModel(
        itemLeaf,
        filterInfo,
        displayedValues
      );

      aSubItemIsRendered ||= itemSatisfiesFilter;
    }
  }

  // The current item is rendered if it satisfies the filter condition or a
  // subitem exists that needs to be rendered
  const satisfiesFilter = aSubItemIsRendered || computeFilter(item, filterInfo);

  // Update selected and checkbox items
  if (satisfiesFilter) {
    displayedValues.add(item);
  }

  return satisfiesFilter;
};
