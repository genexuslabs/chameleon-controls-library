export type TabType = "inlineStart" | "main" | "inlineEnd" | "blockEnd";

export type TabSelectedItemInfo = {
  lastSelectedIndex: number;
  newSelectedId: string;
  newSelectedIndex: number;
  type: TabType;
};
