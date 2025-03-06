import { GxImageMultiState } from "../../../../common/types";
import { AccordionModel } from "../../../../components/accordion/types";

const FOLDER_ICON = "var(folder)";
const MODULE_ICON = "var(module)";

export const accordionSimpleModel: AccordionModel = [
  { id: "item 1", caption: "Item 1", startImgSrc: FOLDER_ICON },
  { id: "item 2", caption: "Item 2", startImgSrc: MODULE_ICON },
  { id: "item 3", caption: "Item 3" },
  { id: "item 4", caption: "Item 4", headerSlotId: "item 4 header" }
];

export const accordionDisabledModel: AccordionModel = [
  { id: "item 1", caption: "Item 1", startImgSrc: FOLDER_ICON, disabled: true },
  { id: "item 2", caption: "Item 2", startImgSrc: MODULE_ICON, disabled: true },
  { id: "item 3", caption: "Item 3 (disabled === false)", disabled: false },
  { id: "item 4", caption: "Item 4", headerSlotId: "item 4 header" }
];

export const accordionWithExpandedSizeModel: AccordionModel = [
  {
    id: "item 1",
    caption: "Item 1",
    startImgSrc: FOLDER_ICON
  },
  {
    id: "item 2",
    caption: "Item 2",
    startImgSrc: MODULE_ICON,
    expandedSize: "0.5fr"
  },
  { id: "item 3", caption: "Item 3", expandedSize: "1fr" },
  {
    id: "item 4",
    caption: "Item 4",
    headerSlotId: "item 4 header",
    expandedSize: "1fr"
  }
];

export const getImagePathCallbackAccordion = (
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
