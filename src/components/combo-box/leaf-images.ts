import { getControlRegisterProperty } from "../../common/registry-properties";
import {
  GxImageMultiState,
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

const DEFAULT_GET_IMAGE_PATH_CALLBACK = (
  itemUIModel: ComboBoxItemModel,
  iconDirection: "start" | "end"
): GxImageMultiState => ({
  base:
    iconDirection === "start" ? itemUIModel.startImgSrc : itemUIModel.endImgSrc
});

const computeImage = (
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
      const computedImage = computeImage(
        itemUIModel,
        "start",
        getImagePathCallback
      ) as GxImageMultiStateStart;

      computedImageModel = { start: computedImage };
    }

    // endImgSrc
    if (itemUIModel.endImgSrc) {
      const computedImage = computeImage(
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

  const actualCallback =
    getImagePathCallback ??
    getControlRegisterProperty("getImagePathCallback", "ch-combo-box-render") ??
    DEFAULT_GET_IMAGE_PATH_CALLBACK;

  setComboBoxImagesForMap(model, actualCallback, itemImages);

  return itemImages;
};
