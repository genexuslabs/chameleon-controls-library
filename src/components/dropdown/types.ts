import { ImageRender } from "../../common/types";
import { DropdownPosition } from "./internal/dropdown/types";

export type DropdownItemModel = {
  id?: string;
  caption: string;
  class?: string;
  endImgSrc?: string;
  endImgType?: Exclude<ImageRender, "img">;
  items?: DropdownItemModel[];
  itemsPosition?: DropdownPosition;
  link?: Link;
  separatorClass?: string;
  shortcut?: string;
  startImgSrc?: string;
  startImgType?: Exclude<ImageRender, "img">;
  showSeparator?: boolean;

  /**
   * Only used for performance reasons. It is not used as public property
   */
  wasExpanded?: boolean;
};

type Link = {
  url: string;
};
