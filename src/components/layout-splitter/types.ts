// - - - - - - - - - - - - - - - - - - - -
//               Input model
// - - - - - - - - - - - - - - - - - - - -
export type LayoutSplitterDirection = "rows" | "columns";
export type LayoutSplitterSize = `${number}px` | `${number}fr`;

export type LayoutSplitterDistribution = {
  direction: LayoutSplitterDirection;
  items: LayoutSplitterDistributionItem[];
};

export type LayoutSplitterDistributionItem =
  | LayoutSplitterDistributionGroup
  | LayoutSplitterDistributionLeaf;

export type LayoutSplitterDistributionLeaf = {
  id: string;
  dragBarPart?: string;
  fixedOffsetSize?: number;
  hideDragBar?: boolean;
  size: LayoutSplitterSize;
};

export type LayoutSplitterDistributionGroup = {
  direction: LayoutSplitterDirection;
  dragBarPart?: string;
  hideDragBar?: boolean;
  items: LayoutSplitterDistributionItem[];
  size: LayoutSplitterSize;
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
  dragBarPart?: string;
  dragBarPosition: string;
  fixedOffsetSize?: number;
  hideDragBar?: boolean;
  id: string;
  size: LayoutSplitterSize;
};

export type LayoutSplitterModelGroup = {
  actualSize: string;
  direction: LayoutSplitterDirection;
  dragBarPart?: string;
  dragBarPosition: string;
  fixedOffsetSize?: number;
  fixedSizesSum: number;
  hideDragBar?: boolean;
  items: LayoutSplitterModelItem[];
  size: LayoutSplitterSize;
};

export type DragBarMouseDownEventInfo = {
  direction: LayoutSplitterDirection;
  dragBar: HTMLElement;
  dragBarContainer: HTMLElement;
  dragBarContainerSize: number;
  fixedSizesSum: number;
  index: number;
  layoutItems: LayoutSplitterModelItem[];
  RTL: boolean;
};
