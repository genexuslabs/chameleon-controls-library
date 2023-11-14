import { DropdownPosition } from "../../dropdown/types";

export type ActionGroupItemModel = {
  id?: string;
  class?: string;
  leftIcon?: string;
  rightIcon?: string;
  items: ActionGroupItemModel[];
  position?: DropdownPosition;
  responsiveCollapsePosition?: DropdownPosition;
  target?: string;
  title: string;
  showSeparator?: boolean;
  separatorClass?: string;
};
