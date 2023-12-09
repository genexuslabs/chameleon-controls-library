import {
  LayoutSplitterDirection,
  LayoutSplitterDistribution
} from "../layout-splitter/types";
import { TabType } from "../tab/types";

// - - - - - - - - - - - - - - - - - - - -
//               Input model
// - - - - - - - - - - - - - - - - - - - -
export type FlexibleLayout = {
  blockStart?: FlexibleLayoutHeader;
  inlineStart?: FlexibleLayoutAside;
  main?: FlexibleLayoutMain;
  inlineEnd?: FlexibleLayoutAside;
  blockEnd?: FlexibleLayoutFooter;
};

export type FlexibleLayoutMain = {
  distribution: FlexibleLayoutDistribution | FlexibleLayoutWidget[];
  viewType: Extract<TabType, "main">;
};

export type FlexibleLayoutAside = {
  distribution: FlexibleLayoutDistribution | FlexibleLayoutWidget[];
  expanded?: boolean;
  viewType: Extract<TabType, "inlineStart" | "inlineEnd">;
};

export type FlexibleLayoutHeader = {
  items: FlexibleLayoutItemBase[];
  viewType: "blockStart";
};

export type FlexibleLayoutFooter = {
  distribution: FlexibleLayoutDistribution | FlexibleLayoutWidget[];
  expanded?: boolean;
  viewType: Extract<TabType, "blockEnd">;
};

export type FlexibleLayoutDistribution = {
  direction: LayoutSplitterDirection;
  items: FlexibleLayoutItem[];
};

export type FlexibleLayoutItem = FlexibleLayoutGroup | FlexibleLayoutLeaf;

export type FlexibleLayoutGroup = {
  direction: LayoutSplitterDirection;
  items: FlexibleLayoutItem[];
  size: string;
};

export type FlexibleLayoutLeaf = {
  fixedOffsetSize?: number;
  size: string;
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
export type FlexibleLayoutSplitterModel = {
  model?: LayoutSplitterDistribution;
  views: Set<string>;
};

export type FlexibleLayoutView = {
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
