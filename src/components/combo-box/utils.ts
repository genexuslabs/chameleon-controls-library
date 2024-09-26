import { ComboBoxItemGroup, ComboBoxItemModel, ComboBoxModel } from "./types";

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
