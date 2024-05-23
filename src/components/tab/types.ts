import { ImageRender } from "../../common/types";

export type TabDirection = "block" | "inline";

export type TabModel = TabItemModel[];

export type TabItemModel = {
  id: string;
  name: string;

  startImgSrc?: string;

  /**
   * Specifies how the image will be rendered. Defaults to `"background"`.
   */
  startImgType?: ImageRender;
  wasRendered?: boolean;
};

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
