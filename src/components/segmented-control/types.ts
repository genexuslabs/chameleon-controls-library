import { ImageRender } from "../../common/types";

export type SegmentedControlItem = {
  accessibleName?: string;
  caption?: string;
  class?: string;
  disabled?: boolean;
  endImgSrc?: string;
  endImgType?: Exclude<ImageRender, "img">;
  id: string;
  startImgSrc?: string;
  startImgType?: Exclude<ImageRender, "img">;
};
