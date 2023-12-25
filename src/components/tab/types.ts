export type TabType = "inlineStart" | "main" | "inlineEnd" | "blockEnd";

export type TabDirection = "block" | "inline";

export type TabItemCloseInfo = {
  itemId: string;
  itemIndex: number;
  type: TabType;
};

export type TabSelectedItemInfo = {
  lastSelectedIndex: number;
  newSelectedId: string;
  newSelectedIndex: number;
  type: TabType;
};

export type TabElementSize = {
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
};
