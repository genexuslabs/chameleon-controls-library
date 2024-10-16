import {
  GxImageMultiStateEnd,
  GxImageMultiStateStart
} from "../../common/types";
import { updateDirectionInImageCustomVar } from "../../common/utils";
import {
  ComboBoxImagePathCallback,
  ComboBoxItemGroup,
  ComboBoxItemImagesModel,
  ComboBoxItemModel,
  ComboBoxModel
} from "./types";

export const computeComboBoxItemImage = (
  itemUIModel: ComboBoxItemModel,
  iconDirection: "start" | "end",
  getImagePathCallback: ComboBoxImagePathCallback
) => {
  const img = getImagePathCallback(itemUIModel, iconDirection);
  return img
    ? (updateDirectionInImageCustomVar(img, iconDirection) as
        | GxImageMultiStateStart
        | GxImageMultiStateEnd)
    : undefined;
};

const setComboBoxImagesForMap = (
  model: ComboBoxModel | undefined,
  getImagePathCallback: ComboBoxImagePathCallback | undefined,
  itemImages: Map<string, ComboBoxItemImagesModel> | undefined
) => {
  for (let index = 0; index < model.length; index++) {
    const itemUIModel = model[index] as ComboBoxItemGroup;
    let computedImageModel: ComboBoxItemImagesModel | undefined;

    // startImgSrc
    if (itemUIModel.startImgSrc) {
      const computedImage = computeComboBoxItemImage(
        itemUIModel,
        "start",
        getImagePathCallback
      ) as GxImageMultiStateStart;

      computedImageModel = { start: computedImage };
    }

    // endImgSrc
    if (itemUIModel.endImgSrc) {
      const computedImage = computeComboBoxItemImage(
        itemUIModel,
        "end",
        getImagePathCallback
      ) as GxImageMultiStateEnd;

      if (computedImageModel) {
        computedImageModel.end = computedImage;
      } else {
        computedImageModel = { end: computedImage };
      }
    }

    if (computedImageModel) {
      itemImages.set(itemUIModel.value, computedImageModel);
    }

    // Recursive phase
    if (itemUIModel.items != null) {
      setComboBoxImagesForMap(
        itemUIModel.items,
        getImagePathCallback,
        itemImages
      );
    }
  }
};

export const getComboBoxImages = (
  model: ComboBoxModel | undefined,
  getImagePathCallback: ComboBoxImagePathCallback | undefined
): Map<string, ComboBoxItemImagesModel> | undefined => {
  if (!model) {
    return undefined;
  }
  const itemImages: Map<string, ComboBoxItemImagesModel> = new Map();
  setComboBoxImagesForMap(model, getImagePathCallback, itemImages);

  return itemImages;
};
