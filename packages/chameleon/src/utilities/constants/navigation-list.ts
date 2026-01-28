import type { NavigationListItemModel } from "../../components/navigation-list/types";
import { formatImagePath } from "../multi-state-icons";

export const DEFAULT_NAVIGATION_LIST_GET_IMAGE_PATH_CALLBACK = (
  item: NavigationListItemModel
) =>
  item.startImgSrc
    ? { base: formatImagePath(item.startImgSrc, item.startImgType) }
    : undefined;
