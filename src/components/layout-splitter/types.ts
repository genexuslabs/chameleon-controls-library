// - - - - - - - - - - - - - - - - - - - -
//               Input model
// - - - - - - - - - - - - - - - - - - - -
export type LayoutSplitterDirection = "rows" | "columns";
export type LayoutSplitterSize = `${number}px` | `${number}fr`;

export type LayoutSplitterDistribution = {
  id: "root";
  direction: LayoutSplitterDirection;
  items: LayoutSplitterDistributionItem[];
};

export type LayoutSplitterDistributionItem =
  | LayoutSplitterDistributionGroup
  | LayoutSplitterDistributionLeaf;

export type LayoutSplitterDistributionLeaf = {
  id: string;
  dragBar?: LayoutSplitterDragBarConfig;
  fixedOffsetSize?: number;
  size: LayoutSplitterSize;
};

export type LayoutSplitterDistributionGroup = LayoutSplitterDistributionLeaf & {
  direction: LayoutSplitterDirection;
  items: LayoutSplitterDistributionItem[];
};

export type LayoutSplitterDragBarConfig = {
  hidden?: boolean;
  part?: string;
  size?: number;
};

// - - - - - - - - - - - - - - - - - - - -
//          Model used internally
// - - - - - - - - - - - - - - - - - - - -
export type LayoutSplitterDistributionItemExtended<
  T extends LayoutSplitterDistributionGroup | LayoutSplitterDistributionLeaf
> = T extends LayoutSplitterDistributionGroup
  ? {
      item: LayoutSplitterDistributionGroup;
      parentItem: LayoutSplitterDistributionGroup;
      actualSize: string;
      fixedSizesSum: number;
    }
  : {
      item: LayoutSplitterDistributionLeaf;
      parentItem: LayoutSplitterDistributionGroup;
      actualSize: string;
    };

// Aliases to improve code readability
export type ItemExtended =
  LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionItem>;

export type LeafExtended =
  LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionLeaf>;

export type GroupExtended =
  LayoutSplitterDistributionItemExtended<LayoutSplitterDistributionGroup>;

// - - - - - - - - - - - - - - - - - - - -
//               Event info
// - - - - - - - - - - - - - - - - - - - -
export type DragBarMouseDownEventInfo = {
  container: HTMLElement;
  containerSize: number;
  direction: LayoutSplitterDirection;
  dragBarContainer: HTMLElement;
  fixedSizesSumRoot: number;
  itemStartId: string;
  itemEndId: string;
  layoutItems: LayoutSplitterDistributionItem[];
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
