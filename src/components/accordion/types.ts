import { ImageRender } from "../../common/types";

export type AccordionModel = AccordionItemModel[];

export type AccordionItemModel = {
  id: string;
  accessibleName?: string;
  caption: string;
  disabled?: boolean;
  expanded?: boolean;
  headerSlotId?: string;
  startImgSrc?: string;
  startImgType?: Exclude<ImageRender, "img">;
};

export type AccordionItemExpandedChangeEvent = {
  id: string;
  expanded: boolean;
};
