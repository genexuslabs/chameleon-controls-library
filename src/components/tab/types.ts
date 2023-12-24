export type TabType = "inlineStart" | "main" | "inlineEnd" | "blockEnd";

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
