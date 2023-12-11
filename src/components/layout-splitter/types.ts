// - - - - - - - - - - - - - - - - - - - -
//               Input model
// - - - - - - - - - - - - - - - - - - - -
export type LayoutSplitterDirection = "rows" | "columns";

export type LayoutSplitterDistribution = {
  direction: LayoutSplitterDirection;
  items: LayoutSplitterDistributionItem[];
};

export type LayoutSplitterDistributionItem =
  | LayoutSplitterDistributionGroup
  | LayoutSplitterDistributionLeaf;

export type LayoutSplitterDistributionLeaf = {
  id: string;
  fixedOffsetSize?: number;
  hideDragBar?: boolean;
  size: string;
};

export type LayoutSplitterDistributionGroup = {
  direction: LayoutSplitterDirection;
  hideDragBar?: boolean;
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
  hideDragBar?: boolean;
  id: string;
  size: string;
};

export type LayoutSplitterModelGroup = {
  actualSize: string;
  direction: LayoutSplitterDirection;
  dragBarPosition: string;
  fixedOffsetSize?: number;
  fixedSizesSum: number;
  hideDragBar?: boolean;
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
