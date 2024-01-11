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
      item: T;
      parentItem: LayoutSplitterDistributionGroup;
      actualSize: string;
      fixedSizesSum: number;
    }
  : {
      item: T;
      parentItem: LayoutSplitterDistributionGroup;
      actualSize: string;
    };

export type DragBarMouseDownEventInfo = {
  container: HTMLElement;
  containerSize: number;
  direction: LayoutSplitterDirection;
  fixedSizesSumRoot: number;
  itemStartId: string;
  itemEndId: string;
  layoutItems: LayoutSplitterDistributionItem[];
  RTL: boolean;
};

export type LayoutSplitterItemRemoveResult = {
  success: boolean;
  renamedItems: LayoutSplitterRenamedItem[];
};

export type LayoutSplitterRenamedItem = { oldId: string; newId: string };
