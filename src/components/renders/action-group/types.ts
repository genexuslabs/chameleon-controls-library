import { DropdownPosition } from "../../dropdown/types";
import { DropdownItemModel } from "../dropdown/types";

type ReducedDropdownItemModel = Exclude<DropdownItemModel, "items" | "class">;

export type ActionGroupItemModel = ReducedDropdownItemModel & {
  actionClass?: string;
  subActionClass?: string;
  items?: ActionGroupItemModel[];
  responsiveCollapsePosition?: DropdownPosition;
};
