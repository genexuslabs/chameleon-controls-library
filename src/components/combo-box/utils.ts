import { ChameleonControlsTagName } from "../../common/types";
import { getComboBoxItemUIModel } from "./renders";
import {
  ComboBoxItemGroup,
  ComboBoxItemModel,
  ComboBoxItemModelExtended,
  ComboBoxModel
} from "./types";

export const findComboBoxLargestValue = (model: ComboBoxModel): string => {
  let largestValue = "";
  let largestValueLength = 0;

  model.forEach((itemGroup: ComboBoxItemGroup) => {
    const subItems = itemGroup.items;

    if (itemGroup.caption.length > largestValueLength) {
      largestValue = itemGroup.caption;
      largestValueLength = itemGroup.caption.length;
    }

    if (subItems != null) {
      subItems.forEach(leaf => {
        if (leaf.caption.length > largestValueLength) {
          largestValue = leaf.caption;
          largestValueLength = leaf.caption.length;
        }
      });
    }
  });

  return largestValue;
};

export const mapValuesToItemInfo = (
  model: ComboBoxModel,
  valueToItemInfo: Map<string, ComboBoxItemModelExtended>,
  captionToItemInfo: Map<string, ComboBoxItemModelExtended>
) => {
  valueToItemInfo.clear();
  captionToItemInfo.clear();

  if (model == null) {
    return;
  }

  model.forEach((item: ComboBoxItemGroup, index: number) => {
    const firstLevelItemInfo: ComboBoxItemModelExtended = { item, index };

    // First level item
    valueToItemInfo.set(item.value, firstLevelItemInfo);
    if (item.caption) {
      captionToItemInfo.set(item.caption, firstLevelItemInfo);
    }

    // Second level items
    item.items?.forEach((subItem, secondLevelIndex) => {
      const secondLevelItemInfo: ComboBoxItemModelExtended = {
        item: subItem,
        index: [index, secondLevelIndex]
      };

      valueToItemInfo.set(subItem.value, secondLevelItemInfo);

      if (subItem.caption) {
        captionToItemInfo.set(subItem.caption, secondLevelItemInfo);
      }
    });
  });
};

export const popoverWasClicked = (event: Event) => {
  const composedPath = event.composedPath();

  for (let index = 0; index < composedPath.length; index++) {
    const element = composedPath[index] as HTMLElement;
    const elementName = element.tagName?.toLowerCase();

    if (elementName === ("ch-popover" satisfies ChameleonControlsTagName)) {
      return true;
    }
    // The ch-popover tag does not exists in the path. There is no need to
    // check the rest of the path
    if (
      elementName === ("ch-combo-box-render" satisfies ChameleonControlsTagName)
    ) {
      return false;
    }
  }

  return false;
};

export const getComboBoxItemFromMouseEvent = (
  event: MouseEvent,
  model: ComboBoxModel
): ComboBoxItemModel | undefined => {
  event.stopPropagation();

  let elementTarget = event.target as HTMLButtonElement;

  // Expandable button case
  if (elementTarget.tagName?.toLowerCase() === "span") {
    elementTarget = elementTarget.parentElement as HTMLButtonElement;
  }

  if (elementTarget.tagName?.toLowerCase() !== "button") {
    return undefined;
  }
  const itemIndex = elementTarget.id;
  return getComboBoxItemUIModel(itemIndex, model);
};

// TODO: Add a unit test for this check
const isActiveDescendant = (
  item: ComboBoxItemModel | undefined,
  activeDescendant: ComboBoxItemModel
) =>
  item &&
  (item.value === activeDescendant.value ||
    (item.caption && item.caption === activeDescendant.caption));

const checkIfSecondLevelModelContainsActiveDescendant = (
  activeDescendant: ComboBoxItemModel | undefined,
  model: ComboBoxModel
) => {
  for (let secondIndex = 0; secondIndex < model.length; secondIndex++) {
    const secondLevelItem = model[secondIndex];

    if (isActiveDescendant(secondLevelItem, activeDescendant)) {
      return true;
    }
  }
  return false;
};

export const comboBoxActiveDescendantIsRendered = (
  activeDescendant: ComboBoxItemModel | undefined,
  model: ComboBoxModel | undefined
) => {
  if (!activeDescendant || !model) {
    return false;
  }

  for (let firstIndex = 0; firstIndex < model.length; firstIndex++) {
    const firstLevelItem = model[firstIndex] as ComboBoxItemGroup;

    if (isActiveDescendant(firstLevelItem, activeDescendant)) {
      return true;
    }
    if (
      firstLevelItem.items != null &&
      checkIfSecondLevelModelContainsActiveDescendant(
        activeDescendant,
        firstLevelItem.items
      )
    ) {
      return true;
    }
  }

  return false;
};
