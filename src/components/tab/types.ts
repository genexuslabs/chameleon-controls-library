export type TabDirection = "block" | "inline";

export type TabItemCloseInfo = {
  itemId: string;
  itemIndex: number;
};

export type TabSelectedItemInfo = {
  lastSelectedIndex: number;
  newSelectedId: string;
  newSelectedIndex: number;
};

export type TabElementSize = {
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
};
