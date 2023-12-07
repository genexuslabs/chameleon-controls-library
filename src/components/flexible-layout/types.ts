export type FlexibleLayout = {
  blockStart?: { items: FlexibleLayoutItemBase[] };
  inlineStart?: { expanded?: boolean; items: FlexibleLayoutItem[] };
  main?: { items: FlexibleLayoutItem[] };
  inlineEnd?: { expanded?: boolean; items: FlexibleLayoutItem[] };
  blockEnd?: { expanded?: boolean; items: FlexibleLayoutItem[] };
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
  expanded?: boolean;
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
