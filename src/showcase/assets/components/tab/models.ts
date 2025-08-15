import type { GxImageMultiState } from "../../../../common/types";
import type { TabModel } from "../../../../components/tab/types";

const ASSETS_PREFIX = "showcase/pages/assets/icons/";

const FOLDER_ICON = "var(folder)";
const MODULE_ICON = "var(module)";

export const simpleModel1: TabModel = [
  { id: "item1", name: "Item 1" },
  { id: "item2", name: "Item 2" },
  { id: "item3", name: "Item 3" },
  { id: "item4", name: "Item 4 withhhhh a really largeeee nameeeee" }
];

export const simpleModel2: TabModel = [
  {
    id: "item1",
    name: "Item 1",
    startImgSrc: `${ASSETS_PREFIX}angular.svg`
  },
  {
    id: "item2",
    name: "Item 2 withhhhh a really largeeee nameeeee",
    startImgSrc: MODULE_ICON
  },
  { id: "item3", name: "Item 3" },
  { id: "item4", name: "", startImgSrc: `${ASSETS_PREFIX}dso.svg` }
];

export const closeButtonModel: TabModel = [
  {
    id: "item1",
    name: "Item 1 (always closable)",
    startImgSrc: `${ASSETS_PREFIX}angular.svg`,
    closeButton: true
  },
  {
    id: "item2",
    name: "Item 2 (not closable)",
    startImgSrc: `${ASSETS_PREFIX}api.svg`,
    closeButton: false
  },
  { id: "item3", name: "Item 3 (not closable)", closeButton: false },
  { id: "item4", name: "", startImgSrc: `${ASSETS_PREFIX}dso.svg` }
];

export const disabledModel1: TabModel = [
  {
    id: "item1",
    name: "Item 1",
    disabled: true,
    startImgSrc: `${ASSETS_PREFIX}angular.svg`
  },
  {
    id: "item2",
    name: "Item 2",
    startImgSrc: FOLDER_ICON
  },
  { id: "item3", name: "Item 3", disabled: true },
  { id: "item4", name: "", startImgSrc: `${ASSETS_PREFIX}dso.svg` }
];

export const disabledModel2: TabModel = [
  {
    id: "item1",
    name: "Item 1",
    startImgSrc: `${ASSETS_PREFIX}angular.svg`
  },
  {
    id: "item2",
    name: "Item 2",
    disabled: true,
    startImgSrc: `${ASSETS_PREFIX}api.svg`
  },
  { id: "item3", name: "Item 3" },
  {
    id: "item4",
    name: "",
    startImgSrc: `${ASSETS_PREFIX}dso.svg`,
    disabled: true
  }
];

export const disabledModel3: TabModel = [
  {
    id: "item1",
    name: "Item 1",
    disabled: true,
    startImgSrc: `${ASSETS_PREFIX}angular.svg`
  },
  {
    id: "item2",
    name: "Item 2",
    disabled: true,
    startImgSrc: `${ASSETS_PREFIX}api.svg`
  },
  { id: "item3", name: "Item 3  (not disabled)", disabled: false },
  {
    id: "item4",
    name: "",
    startImgSrc: `${ASSETS_PREFIX}dso.svg`,
    disabled: true
  }
];

export const disabledModel4: TabModel = [
  {
    id: "item1",
    name: "Item 1",
    disabled: true,
    startImgSrc: `${ASSETS_PREFIX}angular.svg`
  },
  {
    id: "item2",
    name: "Item 2",
    disabled: true,
    startImgSrc: `${ASSETS_PREFIX}api.svg`
  },
  { id: "item3", name: "Item 3", disabled: true },
  {
    id: "item4",
    name: "",
    startImgSrc: `${ASSETS_PREFIX}dso.svg`,
    disabled: true
  }
];

export const getImagePathCallbackTab = (
  startImgSrc: string
): GxImageMultiState => {
  if (startImgSrc === MODULE_ICON) {
    return {
      base: "var(--icon-module-base)",
      active: "var(--icon-module-active)",
      hover: "var(--icon-module-hover)",
      selected: "var(--icon-stencil-base)",
      disabled: "var(--icon-module-disabled)"
    };
  }

  if (startImgSrc === FOLDER_ICON) {
    return {
      base: "var(--icon-folder-base)",
      active: "var(--icon-folder-active)",
      hover: "var(--icon-folder-hover)",
      selected: "var(--icon-stencil-base)",
      disabled: "var(--icon-folder-disabled)"
    };
  }

  return {
    base: startImgSrc
  };
};
