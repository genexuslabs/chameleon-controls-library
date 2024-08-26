import { ImageRender, ItemLink } from "../../common/types";

export type NavigationListModel = NavigationListItem[];

export type NavigationListItem = {
  id?: string;
  caption: string;
  expanded?: boolean;
  startImgSrc?: string;
  startImgType?: Exclude<ImageRender, "img">;
  link?: ItemLink;
  items?: NavigationListModel;
};
