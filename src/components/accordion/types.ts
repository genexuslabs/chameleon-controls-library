import { ImageRender } from "../../common/types";

export type AccordionModel = AccordionItemModel[];

export type AccordionItemModel = {
  id: string;
  accessibleName?: string;
  caption: string;
  disabled?: boolean;
  expanded?: boolean;

  /**
   * Determine the expanded size of the item. It support CSS units, including fr
   * units.
   */
  expandedSize?: AccordionItemModelExpandedSize;

  headerSlotId?: string;
  startImgSrc?: string;
  startImgType?: Exclude<ImageRender, "img">;
};

export type AccordionItemExpandedChangeEvent = {
  id: string;
  expanded: boolean;
};

export type AccordionItemModelExpandedSize =
  `${number}${AccordionItemModelExpandedSizeUnit}`;

export type AccordionItemModelExpandedSizeUnit = "fr";
