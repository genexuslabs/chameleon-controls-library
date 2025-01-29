import {
  DropdownItemActionableModel,
  DropdownItemSeparatorModel,
  DropdownItemSlotModel
} from "../dropdown/types";

export type ActionGroupModel = ActionGroupItemModel[];

export type ActionGroupItemModel =
  | ActionGroupActionableModel
  | ActionGroupSeparatorModel
  | ActionGroupSlotModel;

export type ActionGroupActionableModel = DropdownItemActionableModel;
export type ActionGroupSeparatorModel = DropdownItemSeparatorModel;
export type ActionGroupSlotModel = DropdownItemSlotModel;

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
