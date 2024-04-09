import { ImageRender } from "../../common/types";

export type ComboBoxItem = ComboBoxItemGroup | ComboBoxItemLeaf;

export type ComboBoxItemLeaf = {
  caption: string;
  disabled?: boolean;
  endImgSrc?: string;
  endImgType?: Exclude<ImageRender, "img">;
  startImgSrc?: string;
  startImgType?: Exclude<ImageRender, "img">;
  value: string;
};

export type ComboBoxItemGroup = ComboBoxItemLeaf & {
  items: ComboBoxItemLeaf[];
};
