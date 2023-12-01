import { DropdownPosition } from "../../dropdown/types";
import { DropdownItemModel } from "../dropdown/types";

type ReducedDropdownItemModel = Omit<DropdownItemModel, "items" | "class">;

export type ActionGroupItemModel = ReducedDropdownItemModel & {
  actionClass?: string;
  subActionClass?: string;
  items?: ActionGroupItemModel[];
  itemsResponsiveCollapsePosition?: DropdownPosition;

  /**
   * Only used for performance reasons. It is not used as public property
   */
  wasExpandedInFirstLevel?: boolean;

  /**
   * Only used for performance reasons. It is not used as public property
   */
  wasExpandedInMoreActions?: boolean;
};
