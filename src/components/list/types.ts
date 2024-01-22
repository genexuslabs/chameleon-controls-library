export type ListType = "inlineStart" | "main" | "inlineEnd" | "blockEnd";

export type ListDirection = "block" | "inline";

export type ListItemCloseInfo = {
  itemId: string;
  itemIndex: number;
  type: ListType;
};

export type ListSelectedItemInfo = {
  lastSelectedIndex: number;
  newSelectedId: string;
  newSelectedIndex: number;
  type: ListType;
};

export type ListElementSize = {
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
};
