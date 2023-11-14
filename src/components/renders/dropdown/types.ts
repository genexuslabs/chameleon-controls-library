import { DropdownPosition } from "../../dropdown/types";

export type DropdownItemModel = {
  id?: string;
  caption: string;
  class?: string;
  endImage?: string;
  items?: DropdownItemModel[];
  position?: DropdownPosition;
  startImage?: string;
  target?: string;
};
