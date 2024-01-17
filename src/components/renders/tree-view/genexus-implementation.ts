import { TreeViewItemModel } from "../../tree-view/tree-view/types";

export type GXRender<T extends true | false> = T extends true
  ? TreeViewGXItemModel
  : TreeViewItemModel;

export type TreeViewGXItemModel = {
  id: string;
  caption: string;
  checkbox?: boolean;
  checked?: boolean;
  class?: string;
  downloading?: boolean;
  dragEnabled?: boolean;
  dropEnabled?: boolean;
  editable?: boolean;
  enabled?: boolean;
  expanded?: boolean;
  expandableButton?: "action" | "decorative" | "no";

  /**
   * Used by the tree view to decide which is the last item in the list when
   * filters are applied.
   */
  lastItemId?: string;

  lazy?: boolean;
  leaf?: boolean;
  leftImage?: string;
  indeterminate?: boolean;
  items?: TreeViewGXItemModel[];
  metadata?: string;

  /**
   * Establish the order at which the item will be placed in its parent.
   * Multiple items can have the same `order` value.
   */
  order?: number;

  /**
   * `false` to not render the item.
   */
  render?: boolean;
  rightImage?: string;
  selected?: boolean;
  toggleCheckboxes?: boolean;
};

const URL_REGEX = /url\((["']?)([^\)]*)\)(?:\s+([\d.]+)x)?/i;
let computedStyle: CSSStyleDeclaration;

function normalizeUri(uri: string): string {
  if (uri.startsWith("data:image/svg+xml;utf8,")) {
    uri = `data:image/svg+xml;base64,${btoa(
      uri.slice(24).replace(/\\"/g, '"')
    )}`;
  }

  uri = uri.replace(/\\/g, "");
  uri = uri.replace(/\s/g, "%20");

  return uri;
}

function getImage(
  name: string,
  gxImageConstructor: (name: string) => any
): any {
  computedStyle ||= getComputedStyle(document.documentElement);

  let value = computedStyle.getPropertyValue(`--gx-image_${name}`);

  if (value) {
    let matches: RegExpMatchArray;
    const gximage = gxImageConstructor(name);

    while ((matches = value.match(URL_REGEX))) {
      gximage.densitySet.push({
        uri: normalizeUri(matches[1] ? matches[2].slice(0, -1) : matches[2]),
        density: matches[3] ? parseFloat(matches[3]) : 1
      });

      value = value.slice(matches[0].length);
    }

    if (gximage.densitySet.length > 0) {
      gximage.uri = gximage.densitySet.reduce((previousValue, currentValue) => {
        return previousValue.density === 1 ||
          previousValue.density < currentValue.density
          ? previousValue
          : currentValue;
      }).uri;
    }

    return gximage;
  }
}

export const fromGxImageToURL = (
  gxImage: any,
  Settings: any,
  gxImageConstructor: (name: string) => any
): string => {
  if (!gxImage) {
    return;
  }

  let url = "";
  if (gxImage.id) {
    url = getImage(gxImage.id, gxImageConstructor).uri;
  } else {
    url = gxImage.uri;
  }

  if (!url) {
    return "";
  }

  const baseUrl = Settings.WEBAPP_BASE;
  const urlLower = url.toLowerCase();
  if (urlLower.startsWith("assets/")) {
    // Relative URL to local assets
    return url;
  }
  if (
    urlLower.startsWith("http://") ||
    urlLower.startsWith("https://") ||
    urlLower.startsWith("blob:") ||
    urlLower.startsWith("file:") ||
    urlLower.startsWith("data:")
  ) {
    // Absolute URL
    return url;
  }
  if (urlLower.startsWith(Settings.BASE_PATH.toLowerCase())) {
    // Host relative URL
    return baseUrl + url.substring(Settings.BASE_PATH.length);
  }
  return baseUrl + url;
};
