import { GxImageMultiState } from "../../../../common/types";

const FOLDER_ICON = "folder";
const MODULE_ICON = "module";

export const getImagePathCallbackImage = (
  imgSrc: string
  // iconDirection: "start" | "end"
): GxImageMultiState => {
  if (imgSrc === MODULE_ICON) {
    return {
      base: "var(--icon-module-base)",
      active: "var(--icon-module-active)",
      hover: "var(--icon-module-hover)",
      disabled: "var(--icon-module-disabled)"
    };
  }

  if (imgSrc === FOLDER_ICON) {
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
