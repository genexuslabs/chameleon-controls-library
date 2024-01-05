export type LabelPosition = "start" | "above";

export type GxDataTransferInfo = {
  id: string;
  metadata: string;
};

export type AccessibleRole =
  | "article"
  | "banner"
  | "complementary"
  | "contentinfo"
  | "list"
  | "main"
  | "region";

/**
 * Specifies how the image will be rendered.
 */
export type ImageRender = "img" | "inject-svg" | "pseudo-element";
