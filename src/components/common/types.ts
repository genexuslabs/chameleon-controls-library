export type FlexibleLayout = {
  blockStart?: FlexibleLayoutItem[];
  inlineStart?: FlexibleLayoutItem[];
  main?: FlexibleLayoutItem[];
  inlineEnd?: FlexibleLayoutItem[];
  blockEnd?: FlexibleLayoutItem[];
};

export type FlexibleLayoutItem = {
  id: string;
  name: string;
  selected: boolean;
  startImageSrc?: string;
};

export type FlexibleLayoutGroup =
  | "block-start"
  | "inline-start"
  | "main"
  | "inline-end"
  | "block-end";
