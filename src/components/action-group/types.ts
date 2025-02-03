import {
  ActionMenuItemActionableModel,
  ActionMenuItemSeparatorModel,
  ActionMenuItemSlotModel
} from "../action-menu/types";

export type ActionGroupModel = ActionGroupItemModel[];

export type ActionGroupItemModel =
  | ActionGroupActionableModel
  | ActionGroupSeparatorModel
  | ActionGroupSlotModel;

export type ActionGroupActionableModel = ActionMenuItemActionableModel;
export type ActionGroupSeparatorModel = ActionMenuItemSeparatorModel;
export type ActionGroupSlotModel = ActionMenuItemSlotModel;

// - - - - - - - - - - - - - - - - - - - -
//             Internal types
// - - - - - - - - - - - - - - - - - - - -
export type ActionGroupDisplayedMarkers = {
  id: string;
  displayed: boolean;
  size?: `${number}px`;
};
// type ReducedDropdownItemModel = Omit<
//   DropdownItemActionableModel,
//   "items" | "class"
// >;

// export type ActionGroupItemModel =
//   | (ReducedDropdownItemModel & {
//       actionClass?: string;
//       subActionClass?: string;
//       items?: ActionGroupModel;
//       // itemsResponsiveCollapsePosition?: DropdownPosition;

//       // /**
//       //  * Only used for performance reasons. It is not used as public property
//       //  */
//       // wasExpandedInFirstLevel?: boolean;

//       // /**
//       //  * Only used for performance reasons. It is not used as public property
//       //  */
//       // wasExpandedInMoreActions?: boolean;
//     })
//   | DropdownItemSeparatorModel;
