export type LayoutSplitterComponent = {
  id: string;
  size: string;
  fixedOffsetSize?: number;
};

export type DragBarMouseDownEventInfo = {
  dragBar: HTMLElement;
  dragBarContainer: HTMLElement;
  dragBarContainerSize: number;
  index: number;
  lastPosition: number;
  newPosition: number;
  RTL: boolean;
};
