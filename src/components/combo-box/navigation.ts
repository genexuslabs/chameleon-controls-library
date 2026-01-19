import {
  ComboBoxItemGroup,
  ComboBoxItemModel,
  ComboBoxItemModelExtended,
  ComboBoxModel,
  ComboBoxSelectedIndex
} from "./types";

export const COMBO_BOX_NO_ACTIVE_ITEM: null = null;

const isValidIndex = (array: any, index: number) =>
  0 <= index && index < array.length;

export const findSelectedIndex = (
  valueToItemInfo: Map<string, ComboBoxItemModelExtended>,
  activeDescendant: ComboBoxItemModel | undefined
): ComboBoxSelectedIndex => {
  if (!activeDescendant) {
    return COMBO_BOX_NO_ACTIVE_ITEM;
  }

  return (
    valueToItemInfo.get(activeDescendant.value)?.index ??
    COMBO_BOX_NO_ACTIVE_ITEM
  );
};

export const findNextSelectedIndex = (
  model: ComboBoxModel,
  currentIndex: ComboBoxSelectedIndex,
  increment: 1 | -1,
  hasFilters: boolean,
  displayedValues: Set<ComboBoxItemModel>
): ComboBoxSelectedIndex => {
  if (currentIndex === COMBO_BOX_NO_ACTIVE_ITEM) {
    return COMBO_BOX_NO_ACTIVE_ITEM;
  }

  const firstLevelIndex =
    typeof currentIndex === "number" ? currentIndex : currentIndex[0];

  if (typeof currentIndex !== "number") {
    let secondLevelIndex = currentIndex[1] + increment; // Start from the first valid index
    const firstLevelItemItems = (model[firstLevelIndex] as ComboBoxItemGroup)
      .items;

    // Search in the nested level skipping disabled and not rendered items
    while (
      isValidIndex(firstLevelItemItems, secondLevelIndex) &&
      (firstLevelItemItems[secondLevelIndex].disabled ||
        (hasFilters &&
          !displayedValues.has(firstLevelItemItems[secondLevelIndex])))
    ) {
      secondLevelIndex += increment;
    }

    // If the index is not after the end of the array, the new selected value
    // was found
    if (isValidIndex(firstLevelItemItems, secondLevelIndex)) {
      return [firstLevelIndex, secondLevelIndex];
    }
  }

  // At this point, either all items in the nested level were disabled or the
  // "currentIndex" was not nested. In any case, we must check the next item
  // in the first level
  let nextFirstLevelIndex = firstLevelIndex + increment;

  // Search for the next first level item that is not disabled and is not filtered
  while (
    isValidIndex(model, nextFirstLevelIndex) &&
    (model[nextFirstLevelIndex].disabled ||
      (hasFilters && !displayedValues.has(model[nextFirstLevelIndex])))
  ) {
    nextFirstLevelIndex += increment;
  }

  // With this flag, we also say that we are at the end of the combo-box
  // and there isn't any new "next value" to select
  if (!isValidIndex(model, nextFirstLevelIndex)) {
    return COMBO_BOX_NO_ACTIVE_ITEM;
  }

  const nestedLevel = (model[nextFirstLevelIndex] as ComboBoxItemGroup).items;

  if (nestedLevel != null) {
    return findNextSelectedIndex(
      model,
      [
        nextFirstLevelIndex,
        increment === 1 ? -1 : nestedLevel.length // The algorithm will sum 1 (or -1) to the start index
      ],
      increment,
      hasFilters,
      displayedValues
    );
  }

  return nextFirstLevelIndex;
};
