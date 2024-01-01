import { AccessibleRole } from "../../common/types";
import {
  LayoutSplitterDirection,
  LayoutSplitterSize
} from "../layout-splitter/types";
import { TabType } from "../tab/types";

// - - - - - - - - - - - - - - - - - - - -
//               Input model
// - - - - - - - - - - - - - - - - - - - -
export type ViewType = TabType | "blockStart";
export type ViewAccessibleRole = Exclude<AccessibleRole, "article" | "list">;

/**
 * TODO: For some reason, this type does not work when is applied to an object,
 * and the "main" or "blockStart" keys are defined
 */
// export type FlexibleLayout = {
//   [key: string]: FlexibleLayoutAside | FlexibleLayoutFooter;
//   blockStart?: FlexibleLayoutHeader;
//   inlineStart?: FlexibleLayoutAside;
//   main?: FlexibleLayoutMain;
//   inlineEnd?: FlexibleLayoutAside;
//   blockEnd?: FlexibleLayoutFooter;
// };
export type FlexibleLayout = {
  direction: LayoutSplitterDirection;
  items: FlexibleLayoutItem[];
};

export type FlexibleLayoutItem = FlexibleLayoutGroup | FlexibleLayoutLeaf;

export type FlexibleLayoutGroup = {
  accessibleRole?: ViewAccessibleRole;
  direction: LayoutSplitterDirection;
  dragBarPart?: string;
  expanded?: boolean;
  hideDragBar?: boolean;
  items: FlexibleLayoutItem[];
  size: LayoutSplitterSize;
};

export type FlexibleLayoutLeaf = {
  accessibleRole?: ViewAccessibleRole;
  dragBarPart?: string;
  fixedOffsetSize?: number;
  hideDragBar?: boolean;
  size: LayoutSplitterSize;
  viewType: ViewType;
  widgets: FlexibleLayoutWidget[];
};

export type FlexibleLayoutWidget = {
  id: string;
  name: string;
  selected?: boolean;
  startImageSrc?: string;
  wasRendered?: boolean;
};

export type FlexibleLayoutItemBase = {
  id: string;
  name: string;
};

export type FlexibleLayoutRenders = { [key: string]: () => any };

// - - - - - - - - - - - - - - - - - - - -
//          Model used internally
// - - - - - - - - - - - - - - - - - - - -
export type FlexibleLayoutView = {
  id: string;
  type: ViewType;
  expanded?: boolean;
  exportParts: string;

  /**
   * This Set provides optimizations to not render items that were never
   * shown on the screen.
   */
  renderedWidgets: Set<string>;
  widgets: FlexibleLayoutWidget[];
};

// - - - - - - - - - - - - - - - - - - - -
//               Event info
// - - - - - - - - - - - - - - - - - - - -
export type ViewSelectedItemInfo = {
  lastSelectedIndex: number;
  newSelectedId: string;
  newSelectedIndex: number;
  type: TabType;
  viewId: string;
};
