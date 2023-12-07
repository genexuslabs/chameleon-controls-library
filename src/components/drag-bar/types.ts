export type DragBarComponent = {
  id: string;
  size: string;
  fixedOffsetSize?: number;
};

export type DragBarMouseDownEventInfo = {
  dragBar: HTMLElement;
  dragBarContainer: HTMLElement;
  index: number;
  lastPosition: number;
  newPosition: number;
};
