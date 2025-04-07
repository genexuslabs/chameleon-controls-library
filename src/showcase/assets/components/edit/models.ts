import { GxImageMultiState } from "../../../../common/types";

const FOLDER_ICON = "var(folder)";
const MODULE_ICON = "var(module)";

export const getImagePathCallbackEdit = (
  startImgSrc: string
): GxImageMultiState => {
  if (startImgSrc === MODULE_ICON) {
    return {
      base: "var(--icon-module-base)",
      active: "var(--icon-module-active)",
      hover: "var(--icon-module-hover)",
      disabled: "var(--icon-module-disabled)"
    };
  }

  if (startImgSrc === FOLDER_ICON) {
    return {
      base: "var(--icon-folder-base)",
      active: "var(--icon-folder-active)",
      hover: "var(--icon-folder-hover)",
      disabled: "var(--icon-folder-disabled)"
    };
  }

  return {
    base: "var(--icon-stencil-base)",
    active: "var(--icon-stencil-active)",
    hover: "var(--icon-stencil-hover)",
    disabled: "var(--icon-stencil-disabled)"
  };
};

export const dummyPictureCallback = (value: any, picture: string): string => {
  if (Number.isInteger(Number(value)) && picture.includes("$")) {
    return `$ ${Number(value).toLocaleString()}`;
  }

  return `dummy ${value}`;
};
