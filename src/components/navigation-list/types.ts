import { ImageRender, ItemLink } from "../../common/types";

export type NavigationListModel = NavigationListItemModel[];

export type NavigationListItemModel = {
  id?: string;
  caption: string;
  disabled?: boolean;
  expanded?: boolean;
  startImgSrc?: string;
  startImgType?: Exclude<ImageRender, "img">;
  link?: ItemLink;
  items?: NavigationListModel;
};
