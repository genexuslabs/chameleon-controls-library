// - - - - - - - - - - - - - - - - - - - -
//               Input model
// - - - - - - - - - - - - - - - - - - - -
export type LayoutSplitterDirection = "rows" | "columns";

export type LayoutSplitterDistribution = {
  direction: LayoutSplitterDirection;
  items: LayoutSplitterDistributionItem[];
};

export type LayoutSplitterDistributionItem =
  | LayoutSplitterDistributionLeaf
  | LayoutSplitterDistributionGroup;

export type LayoutSplitterDistributionLeaf = {
  id: string;
  fixedOffsetSize?: number;
  size: string;
};

export type LayoutSplitterDistributionGroup = {
  direction: LayoutSplitterDirection;
  items: LayoutSplitterDistributionItem[];
  size: string;
};

// - - - - - - - - - - - - - - - - - - - -
//          Model used internally
// - - - - - - - - - - - - - - - - - - - -
export type LayoutSplitterModel = {
  direction: LayoutSplitterDirection;
  fixedSizesSum: number;
  items: LayoutSplitterModelItem[];
};

export type LayoutSplitterModelItem =
  | LayoutSplitterModelLeaf
  | LayoutSplitterModelGroup;

export type LayoutSplitterModelLeaf = {
  actualSize: string;
  dragBarPosition: string;
  fixedOffsetSize?: number;
  id: string;
  size: string;
};

export type LayoutSplitterModelGroup = {
  actualSize: string;
  direction: LayoutSplitterDirection;
  dragBarPosition: string;
  fixedOffsetSize?: number;
  fixedSizesSum: number;
  items: LayoutSplitterModelItem[];
  size: string;
};

export type DragBarMouseDownEventInfo = {
  direction: LayoutSplitterDirection;
  dragBar: HTMLElement;
  dragBarContainer: HTMLElement;
  dragBarContainerSize: number;
  fixedSizesSum: number;
  index: number;
  lastPosition: number;
  layoutItems: LayoutSplitterModelItem[];
  newPosition: number;
  RTL: boolean;
};
