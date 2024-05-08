// - - - - - - - - - - - - - - - - - - - -
//               Input model
// - - - - - - - - - - - - - - - - - - - -
export type LayoutSplitterDirection = "rows" | "columns";
export type LayoutSplitterSize = `${number}px` | `${number}fr`;

export type LayoutSplitterDistribution = {
  id: "root";
  direction: LayoutSplitterDirection;
  items: LayoutSplitterItemModel[];
};

export type LayoutSplitterItemModel =
  | LayoutSplitterGroupModel
  | LayoutSplitterLeafModel;

export type LayoutSplitterLeafModel = {
  id: string;
  dragBar?: LayoutSplitterDragBarConfig;
  fixedOffsetSize?: number;
  size: LayoutSplitterSize;
  minSize?: `${number}px`;
};

export type LayoutSplitterGroupModel = LayoutSplitterLeafModel & {
  direction: LayoutSplitterDirection;
  items: LayoutSplitterItemModel[];
};

export type LayoutSplitterDragBarConfig = {
  hidden?: boolean;
  part?: string;
  size?: number;
};

// - - - - - - - - - - - - - - - - - - - -
//          Model used internally
// - - - - - - - - - - - - - - - - - - - -
export type LayoutSplitterItemModelExtended<
  T extends LayoutSplitterGroupModel | LayoutSplitterLeafModel
> = T extends LayoutSplitterGroupModel
  ? {
      item: LayoutSplitterGroupModel;
      parentItem: LayoutSplitterGroupModel;
      actualSize: string;
      fixedSizesSum: number;
    }
  : {
      item: LayoutSplitterLeafModel;
      parentItem: LayoutSplitterGroupModel;
      actualSize: string;
    };

// Aliases to improve code readability
export type ItemExtended =
  LayoutSplitterItemModelExtended<LayoutSplitterItemModel>;

export type LeafExtended =
  LayoutSplitterItemModelExtended<LayoutSplitterLeafModel>;

export type GroupExtended =
  LayoutSplitterItemModelExtended<LayoutSplitterGroupModel>;

// - - - - - - - - - - - - - - - - - - - -
//               Event info
// - - - - - - - - - - - - - - - - - - - -
export type DragBarMouseDownEventInfo = {
  container: HTMLElement;
  containerSize: number;
  direction: LayoutSplitterDirection;
  dragBar: HTMLElement;
  fixedSizesSumRoot: number;
  itemStartId: string;
  itemEndId: string;
  layoutItems: LayoutSplitterItemModel[];
  mouseEvent: MouseEvent | undefined;
  RTL: boolean;
};

export type LayoutSplitterItemAddResult = {
  success: boolean;
  fixedSizesSumIncrement?: number;
};

export type LayoutSplitterItemRemoveResult = {
  success: boolean;
  reconnectedSubtree: LayoutSplitterReconnectedSubtree;
  fixedSizesSumDecrement: number;
};

export type LayoutSplitterReconnectedSubtree = {
  nodeToRemove: string;
  nodeToReconnect: string;
};
