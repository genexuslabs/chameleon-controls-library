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
export type ImageRender = "background" | "img" | "mask";

export type Mutable<Immutable> = {
  -readonly [P in keyof Immutable]: Immutable[P];
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
};

export type GxImageMultiState = {
  base: string;
  hover?: string;
  active?: string;
  focus?: string;
  disabled?: string;
};

export type GxImageMultiStateStart = {
  classes: string;
  styles: GxImageMultiStateStartStyles;
};

export type GxImageMultiStateStartStyles = {
  "--ch-start-img--base": string;
  "--ch-start-img--hover"?: string;
  "--ch-start-img--active"?: string;
  "--ch-start-img--focus"?: string;
  "--ch-start-img--disabled"?: string;
};

export type GxImageMultiStateEnd = {
  classes: string;
  styles: GxImageMultiStateEndStyles;
};

export type GxImageMultiStateEndStyles = {
  "--ch-end-img--base": string;
  "--ch-end-img--hover"?: string;
  "--ch-end-img--active"?: string;
  "--ch-end-img--focus"?: string;
  "--ch-end-img--disabled"?: string;
};

export type CssCursorProperty =
  | "auto"
  | "default"
  | "none"
  | "context-menu"
  | "help"
  | "pointer"
  | "progress"
  | "wait"
  | "cell"
  | "crosshair"
  | "text"
  | "vertical-text"
  | "alias"
  | "copy"
  | "move"
  | "no-drop"
  | "not-allowed"
  | "grab"
  | "grabbing"
  | "e-resize"
  | "n-resize"
  | "ne-resize"
  | "nw-resize"
  | "s-resize"
  | "se-resize"
  | "sw-resize"
  | "w-resize"
  | "ew-resize"
  | "ns-resize"
  | "nesw-resize"
  | "nwse-resize"
  | "col-resize"
  | "row-resize"
  | "all-scroll"
  | "zoom-in"
  | "zoom-out";

export type CssContainProperty =
  | "none"
  | "size"
  | "inline-size"
  | "layout"
  | "paint"
  | "style"
  | "content"
  | "strict";

export type CssOverflowProperty =
  | "visible"
  | "hidden"
  | "clip"
  | "scroll"
  | "auto";

/**
 * Useful to filtering the keys of an object by pattern matching the keys. For
 * example, all Chameleon controls:
 *
 * @example
 * ```ts
 * type ChameleonControlsTagName = FilterKeys<
 *   HTMLElementTagNameMap,
 *   `ch-${string}`
 * >
 * ```
 */
export type FilterKeys<T, U> = {
  [K in keyof T]: K extends U ? K : never;
}[keyof T];

// Filter custom elements that start with "ch-"
export type ChameleonControlsTagName = FilterKeys<
  HTMLElementTagNameMap,
  `ch-${string}`
>;

export type ChameleonControls = {
  [key in ChameleonControlsTagName]: HTMLElementTagNameMap[key];
};

export type ChameleonImagePathCallbackControlsTagName = Extract<
  ChameleonControlsTagName,
  | "ch-accordion-render"
  | "ch-checkbox"
  | "ch-edit"
  | "ch-image"
  | "ch-navigation-list-render"
  | "ch-tree-view-render"
>;

export type ChameleonImagePathCallbackControls = {
  [key in ChameleonImagePathCallbackControlsTagName]: ChameleonControls[key];
};

export type ItemLink = {
  url: string;
};
