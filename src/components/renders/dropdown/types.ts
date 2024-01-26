import { DropdownPosition } from "../../dropdown/types";

export type DropdownItemModel = {
  id?: string;
  caption: string;
  class?: string;
  endImage?: string;
  items?: DropdownItemModel[];
  itemsPosition?: DropdownPosition;
  link?: Link;
  separatorClass?: string;
  shortcut?: string;
  startImage?: string;
  showSeparator?: boolean;

  /**
   * Only used for performance reasons. It is not used as public property
   */
  wasExpanded?: boolean;
};

type Link = {
  url: string;
};
