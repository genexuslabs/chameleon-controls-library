import { ImageRender } from "../../common/types";
import { ChActionListRender } from "./action-list-render";

export type ActionListModel = ActionListItemModel[];

// - - - - - - - - - - - - - - - - - - - -
//             List item types
// - - - - - - - - - - - - - - - - - - - -
export type ActionListItemType =
  | ActionListItemTypeActionable
  | ActionListItemTypeHeading
  | ActionListItemTypeSeparator;

export type ActionListItemTypeActionable = "actionable";
export type ActionListItemTypeHeading = "heading";
export type ActionListItemTypeSeparator = "separator";

export type ActionListItemModel =
  | ActionListItemActionable
  | ActionListItemGroup
  | ActionListItemSeparator;

export interface ActionListItemModelMap {
  actionable: ActionListItemActionable;
  heading: ActionListItemGroup;
  separator: ActionListItemSeparator;
}

// - - - - - - - - - - - - - - - - - - - -
//          List Item Actionable
// - - - - - - - - - - - - - - - - - - - -
export type ActionListItemActionable = {
  id: string;

  additionalInformation?: ActionListItemAdditionalInformation;
  caption: string;
  checkbox?: boolean;
  checked?: boolean;
  disabled?: boolean;
  editable?: boolean;

  metadata?: string;

  /**
   * Establish the order at which the item will be placed in its parent.
   * Multiple items can have the same `order` value.
   */
  order?: number;
  part?: string;

  selected?: boolean;

  type: ActionListItemTypeActionable;
};

export type ActionListItemAdditionalInformation = {
  "stretch-start"?: ActionListItemAdditionalModel;
  "block-start"?: ActionListItemAdditionalModel;
  "inline-caption"?: ActionListItemAdditionalModel;
  "block-end"?: ActionListItemAdditionalModel;
  "stretch-end"?: ActionListItemAdditionalModel;
};

export type ActionListItemAdditionalModel = {
  start?: ActionListItemAdditionalItem[];
  center?: ActionListItemAdditionalItem[];
  end?: ActionListItemAdditionalItem[];
};

export type ActionListItemAdditionalItem =
  | ActionListItemAdditionalAction
  | ActionListItemAdditionalImage
  | ActionListItemAdditionalText;

export type ActionListItemAdditionalAction = {
  id?: string;
  accessibleName?: string;
  caption?: string;
  part?: string;
  type: "action";
};

export type ActionListItemAdditionalImage = {
  src: string;
  imageType?: ImageRender;
  part?: string;
  type: "image";
};

export type ActionListItemAdditionalText = {
  caption: string;
  part?: string;
  type: "text";
};

// - - - - - - - - - - - - - - - - - - - -
//            List Item Heading
// - - - - - - - - - - - - - - - - - - - -
export type ActionListItemGroup = {
  id: string;
  caption: string;
  expandable?: boolean;
  expanded?: boolean;

  items: ActionListItemActionable[];

  /**
   * Establish the order at which the item will be placed in its parent.
   * Multiple items can have the same `order` value.
   */
  order?: number;
  part?: string;
  type: ActionListItemTypeHeading;
};

// - - - - - - - - - - - - - - - - - - - -
//           List Item Separator
// - - - - - - - - - - - - - - - - - - - -
export type ActionListItemSeparator = {
  /**
   * Establish the order at which the item will be placed in its parent.
   * Multiple items can have the same `order` value.
   */
  order?: number;
  part?: string;
  type: ActionListItemTypeSeparator;
};

export type ActionListImagePathCallback = (
  imgSrc: string,
  treeState: ChActionListRender
) => string;
