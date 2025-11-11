import { GxImageMultiState, ImageRender } from "../../common/types";
import { ActionMenuModel } from "../action-menu/types";
// import { ChActionListRender } from "./action-list-render";

export type ActionListModel = ActionListItemModel[];

// - - - - - - - - - - - - - - - - - - - -
//             List item types
// - - - - - - - - - - - - - - - - - - - -
export type ActionListItemType =
  | ActionListItemTypeActionable
  | ActionListItemTypeSeparator;

export type ActionListItemTypeActionable = "actionable";
export type ActionListItemTypeGroup = "group";
export type ActionListItemTypeSeparator = "separator";

export type ActionListItemModel =
  | ActionListItemActionable
  | ActionListItemGroup
  | ActionListItemSeparator;

export type ActionListItemModelExtended =
  | ActionListItemModelExtendedRoot
  | ActionListItemModelExtendedGroup;

export type ActionListItemModelExtendedRoot = {
  root: ActionListModel;
  item: ActionListItemModel;
};

export type ActionListItemModelExtendedGroup = {
  parentItem: ActionListItemGroup;
  item: ActionListItemModel;
};

export interface ActionListItemModelMap {
  actionable: ActionListItemActionable;
  group: ActionListItemGroup;
  separator: ActionListItemSeparator;
}

// - - - - - - - - - - - - - - - - - - - -
//          List Item Actionable
// - - - - - - - - - - - - - - - - - - - -
export type ActionListItem = {
  id: string;

  additionalInformation?: ActionListItemAdditionalInformation;
  caption: string;
  checkbox?: boolean;
  checked?: boolean;
  disabled?: boolean;
  editable?: boolean;
  fixed?: boolean;

  metadata?: string;

  /**
   * Establish the order at which the item will be placed in its parent.
   * Multiple items can have the same `order` value.
   */
  order?: number;
  part?: string;

  selected?: boolean;

  expandable?: boolean;
  expanded?: boolean;

  items?: ActionListItemActionable[];
};

export type ActionListItemActionable = ActionListItem & {
  type: ActionListItemTypeActionable;
};

export type ActionListItemAdditionalInformation = {
  "stretch-start"?: ActionListItemAdditionalModel;
  "block-start"?: ActionListItemAdditionalModel;
  // TODO: Remove "center" section
  "inline-caption"?: ActionListItemAdditionalModel;
  "block-end"?: ActionListItemAdditionalModel;
  "stretch-end"?: ActionListItemAdditionalModel;
};

export type ActionListItemAdditionalModel = {
  start?: ActionListItemAdditionalItem[];
  center?: ActionListItemAdditionalItem[];
  end?: ActionListItemAdditionalItem[];
};

export type ActionListItemAdditionalInformationSection =
  keyof ActionListItemAdditionalInformation;

export type ActionListItemAdditionalInformationSectionAlign =
  keyof ActionListItemAdditionalModel;

export type ActionListItemAdditionalItem =
  | ActionListItemAdditionalBase
  | ActionListItemAdditionalAction
  | ActionListItemAdditionalCustom
  | ActionListItemAdditionalSlot
  | ActionListItemAdditionalMenu;

export type ActionListItemAdditionalBase = {
  id?: string;
  caption?: string;
  imgSrc?: string;

  /**
   * Specifies how the image will be rendered. Defaults to `"background"`.
   */
  imgType?: ImageRender;
  part?: string;
};

export type ActionListItemAdditionalSlot = {
  slot: string;
};

export type ActionListItemAdditionalCustom = {
  jsx: () => any;
  part?: string;
};

export type ActionListItemAdditionalMenu = {
  menu: ActionMenuModel;
};

export type ActionListItemAdditionalAction = ActionListItemAdditionalBase & {
  id: string;
  accessibleName: string;
  action: ActionListItemAdditionalItemActionType;
};

export type ActionListItemAdditionalItemActionType =
  | {
      type: "fix";
    }
  | {
      type: "modify" | "remove";
      showOnHover?: boolean;
      showAcceptCancel?: boolean;
    }
  | {
      callback?: (id: string) => void;
      type: "custom";
      showOnHover?: boolean;
      showAcceptCancel?: boolean;
    };

// - - - - - - - - - - - - - - - - - - - -
//            List Item Heading
// - - - - - - - - - - - - - - - - - - - -
export type ActionListItemGroup = ActionListItem & {
  type: ActionListItemTypeGroup;
};

// - - - - - - - - - - - - - - - - - - - -
//           List Item Separator
// - - - - - - - - - - - - - - - - - - - -
export type ActionListItemSeparator = {
  id?: string;

  /**
   * Establish the order at which the item will be placed in its parent.
   * Multiple items can have the same `order` value.
   */
  order?: number;
  part?: string;
  type: ActionListItemTypeSeparator;
};

export type ActionListImagePathCallback = (
  additionalItem: ActionListItemAdditionalBase
) => GxImageMultiState | undefined;
