export type FlexibleLayout = {
  blockStart?: FlexibleLayoutItemBase[];
  inlineStart?: FlexibleLayoutItem[];
  main?: FlexibleLayoutItem[];
  inlineEnd?: FlexibleLayoutItem[];
  blockEnd?: FlexibleLayoutItem[];
};

export type FlexibleLayoutDisplayedItems = {
  [key in keyof FlexibleLayout]: string[];
};

export type FlexibleLayoutItemBase = {
  id: string;
  name: string;
};

export type FlexibleLayoutItem = FlexibleLayoutItemBase & {
  displayed?: boolean;
  selected?: boolean;
  startImageSrc?: string;
  wasRendered?: boolean;
};

export type FlexibleLayoutGroup =
  | "block-start"
  | "inline-start"
  | "main"
  | "inline-end"
  | "block-end";

export type FlexibleLayoutRenders = { [key: string]: () => any };

export type FlexibleLayoutGroupSelectedItemInfo = {
  group: Exclude<FlexibleLayoutGroup, "block-start">;
  lastSelectedIndex: number;
  newSelectedId: string;
  newSelectedIndex: number;
};
