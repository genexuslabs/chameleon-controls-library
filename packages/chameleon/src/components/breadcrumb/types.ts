import type { ItemLink } from "../../typings/hyperlinks";
import type { ImageRender } from "../../typings/multi-state-images";

export type BreadCrumbModel = BreadCrumbItemModel[];

export type BreadCrumbItemModel = {
  accessibleName?: string;
  id: string;
  caption?: string;
  disabled?: boolean;
  link?: ItemLink;
  startImgSrc?: string;
  startImgType?: Exclude<ImageRender, "img">;
};

export type BreadCrumbHyperlinkClickEvent = {
  item: BreadCrumbItemModel;
};
