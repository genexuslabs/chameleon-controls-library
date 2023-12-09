import {
  LayoutSplitterDirection,
  LayoutSplitterDistribution
} from "../layout-splitter/types";
import { TabType } from "../tab/types";

// - - - - - - - - - - - - - - - - - - - -
//               Input model
// - - - - - - - - - - - - - - - - - - - -
export type FlexibleLayout = {
  blockStart?: { items: FlexibleLayoutItemBase[] };
  inlineStart?: {
    distribution: FlexibleLayoutDistribution | FlexibleLayoutWidget[];
    expanded?: boolean;
    viewType: TabType;
  };
  main?: {
    distribution: FlexibleLayoutDistribution | FlexibleLayoutWidget[];
    viewType: TabType;
  };
  inlineEnd?: {
    distribution: FlexibleLayoutDistribution | FlexibleLayoutWidget[];
    expanded?: boolean;
    viewType: TabType;
  };
  blockEnd?: {
    distribution: FlexibleLayoutDistribution | FlexibleLayoutWidget[];
    expanded?: boolean;
    viewType: TabType;
  };
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
