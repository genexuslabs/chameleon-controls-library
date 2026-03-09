import type { BreadCrumbItemModel } from "../../components/breadcrumb/types";
import { formatImagePath } from "../multi-state-icons";


export const DEFAULT_BREADCRUMB_GET_IMAGE_PATH_CALLBACK = (
  item: BreadCrumbItemModel
) =>
  item.startImgSrc
    ? { base: formatImagePath(item.startImgSrc, item.startImgType) }
    : undefined;
