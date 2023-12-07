export type LayoutSplitterDistribution = {
  direction: LayoutSplitterDirection;
  items: LayoutSplitterComponent[];
};

export type LayoutSplitterComponent = {
  id: string;
  size: string;
  fixedOffsetSize?: number;
  subLayout?: LayoutSplitterDistribution;
};

export type LayoutSplitterDirection = "rows" | "columns";

export type LayoutSplitterSize = {
  size: string;
  subLayout?: LayoutSplitterSize[];
  subLayoutFixedSizesSum?: number;
};

export type LayoutSplitterDragBarPosition = {
  position: string;
  subLayout?: LayoutSplitterDragBarPosition[];
};

export type DragBarMouseDownEventInfo = {
  dragBar: HTMLElement;
  dragBarContainer: HTMLElement;
  dragBarContainerSize: number;
  dragBarPositions: LayoutSplitterDragBarPosition[];
  fixedSizesSum: number;
  index: number;
  lastPosition: number;
  layout: LayoutSplitterDistribution;
  newPosition: number;
  sizes: LayoutSplitterSize[];
  RTL: boolean;
};
