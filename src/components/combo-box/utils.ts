import { ChameleonControlsTagName } from "../../common/types";
import {
  ComboBoxItemGroup,
  ComboBoxItemModel,
  ComboBoxItemModelExtended,
  ComboBoxModel
} from "./types";

export const getComboBoxItemImageCustomVars = (
  item: ComboBoxItemModel,
  hasImages: boolean,
  hasStartImg: boolean,
  hasEndImg: boolean
) =>
  hasImages
    ? {
        "--ch-combo-box-item-start-img": hasStartImg
          ? `url("${item.startImgSrc}")`
          : null,
        "--ch-combo-box-item-end-img": hasEndImg
          ? `url("${item.endImgSrc}")`
          : null
      }
    : undefined;

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
  itemCaptionToItemValue: Map<string, string>
) => {
  valueToItemInfo.clear();
  itemCaptionToItemValue.clear();

  if (model == null) {
    return;
  }

  model.forEach((item, firstLevelIndex) => {
    const itemGroup = item as ComboBoxItemGroup;
    const subItems = itemGroup.items;

    if (subItems != null) {
      // First level item
      valueToItemInfo.set(itemGroup.value, {
        item: itemGroup,
        index: {
          type: "first-level",
          firstLevelIndex: firstLevelIndex
        },
        firstExpanded: itemGroup.expandable && !!itemGroup.expanded
      });

      itemCaptionToItemValue.set(itemGroup.caption, itemGroup.value);

      // Second level items
      subItems.forEach((subItem, secondLevelIndex) => {
        valueToItemInfo.set(subItem.value, {
          item: subItem,
          index: {
            type: "nested",
            firstLevelIndex: firstLevelIndex,
            secondLevelIndex: secondLevelIndex
          }
        });

        itemCaptionToItemValue.set(subItem.caption, subItem.value);
      });
    }
    // First level item
    else {
      valueToItemInfo.set(item.value, {
        item: item,
        index: {
          type: "first-level",
          firstLevelIndex: firstLevelIndex
        }
      });
      itemCaptionToItemValue.set(item.caption, item.value);
    }
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
