import {
  DropdownItemActionableModel,
  DropdownItemSeparatorModel
} from "../dropdown/types";

export type ActionGroupModel = ActionGroupItemModel[];

type ReducedDropdownItemModel = Omit<
  DropdownItemActionableModel,
  "items" | "class"
>;

export type ActionGroupItemModel =
  | (ReducedDropdownItemModel & {
      actionClass?: string;
      subActionClass?: string;
      items?: ActionGroupModel;
      // itemsResponsiveCollapsePosition?: DropdownPosition;

      /**
       * Only used for performance reasons. It is not used as public property
       */
      wasExpandedInFirstLevel?: boolean;

      /**
       * Only used for performance reasons. It is not used as public property
       */
      wasExpandedInMoreActions?: boolean;
    })
  | DropdownItemSeparatorModel;
