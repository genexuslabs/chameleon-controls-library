import { DropdownPosition } from "../dropdown/internal/dropdown/types";
import { DropdownItemModel } from "../dropdown/types";

export type ActionGroupModel = ActionGroupItemModel[];

type ReducedDropdownItemModel = Omit<DropdownItemModel, "items" | "class">;

export type ActionGroupItemModel = ReducedDropdownItemModel & {
  actionClass?: string;
  subActionClass?: string;
  items?: ActionGroupModel;
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
