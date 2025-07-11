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

export type FilterByPrefix<
  T,
  Prefix extends string
> = T extends `${Prefix}${string}` ? T : never;

export type GxImageMultiState = {
  base: string;
  hover?: string;
  active?: string;
  focus?: string;
  selected?: string;
  disabled?: string;
};

export type GxImageMultiStateByDirection<T extends "start" | "end"> =
  T extends "start" ? GxImageMultiStateStart : GxImageMultiStateEnd;

export type GxImageMultiStateStart = {
  classes: string;
  styles: GxImageMultiStateStartStyles;
};

export type GxImageMultiStateStartStyles = {
  "--ch-start-img--base": string;
  "--ch-start-img--hover"?: string;
  "--ch-start-img--active"?: string;
  "--ch-start-img--focus"?: string;
  "--ch-start-img--selected"?: string;
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
  "--ch-end-img--selected"?: string;
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
export type ChameleonControlsTagName = Exclude<
  FilterKeys<HTMLElementTagNameMap, `ch-${string}`>,
  "ch-chat-lit" | "ch-markdown-viewer-lit"
>;

export type ChameleonControls = {
  [key in ChameleonControlsTagName]: HTMLElementTagNameMap[key];
};

export type ChameleonImagePathCallbackControlsTagName = Extract<
  ChameleonControlsTagName,
  | "ch-accordion-render"
  | "ch-action-list-render"
  | "ch-action-menu-render"
  | "ch-checkbox"
  | "ch-combo-box-render"
  | "ch-edit"
  | "ch-image"
  | "ch-navigation-list-render"
  | "ch-tab-render"
  | "ch-tree-view-render"
>;

export type ChameleonImagePathCallbackControls = {
  [key in ChameleonImagePathCallbackControlsTagName]: ChameleonControls[key];
};

export type ItemLink = {
  url: string;

  /**
   * Specifies the relationship between a linked resource and the current
   * document.
   *
   * sames as the [`rel` attribute](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement/rel)
   * of the anchor element, `a`.
   */
  rel?: string;

  /**
   * Specifies where to display the linked URL, as the name for a browsing
   * context.
   *
   * Same as the [`target` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a#target)
   * of the anchor element, `a`.
   *
   * If not specified, the browser's default is used.
   */
  target?: "_self" | "_blank" | "_parent" | "_top" | "_unfencedTop";
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type ArgumentTypes<F extends Function> = F extends (
  ...args: infer A
) => any
  ? A
  : never;
