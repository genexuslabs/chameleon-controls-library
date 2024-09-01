import { Mutable } from "../../../common/types";

export type ShowcaseStories = {
  [key: string]: ShowcaseStory<ShowcaseStoryClass>;
};

export type ShowcaseStory<T extends ShowcaseStoryClass> = {
  render: () => any;

  /**
   * Called after the first render of the story and before the storyDidRender
   * method.
   */
  storyDidLoad?: () => void;

  /**
   * Called after each render update.
   */
  storyDidRender?: () => void;

  /**
   * Called before the story is destroyed.
   */
  disconnectedCallback?: () => void;

  markupWithUIModel?: {
    uiModel: () => any[] | { [key: string]: any };
    uiModelType: string;
    render: () => string;
  };
  markupWithoutUIModel?: () => string;
  properties: ShowcaseRenderProperties<T>;
  state: Partial<T>;
};

export type ShowcaseStoryClass = Mutable<
  HTMLElementTagNameMap[keyof HTMLElementTagNameMap]
>;

export type ShowcaseCustomStory = {
  render: () => any;

  /**
   * Called after the first render of the story and before the storyDidRender
   * method.
   */
  storyDidLoad?: () => void;

  /**
   * Called after each render update.
   */
  storyDidRender?: () => void;

  /**
   * Called before the story is destroyed.
   */
  disconnectedCallback?: () => void;
};

export type ShowcaseRenderProperties<T extends { [key in string]: any }> =
  ShowcaseRenderPropertyGroup<T>[];

export type ShowcaseRenderPropertyGroup<T> = {
  caption: string;
  columns?: 1 | 2 | 3;
  properties: ShowcaseRenderProperty<T>[];
};

export type ShowcaseRenderProperty<T> =
  | ShowcaseRenderPropertyBoolean<T, keyof T>
  | ShowcaseRenderPropertyNumber<T, keyof T>
  | ShowcaseRenderPropertyString<T, keyof T>
  | ShowcaseRenderPropertyEnum<T, keyof T>
  | ShowcaseRenderPropertyObject<T, keyof T>;

export type ShowcaseRenderPropertyTypes = Pick<
  ShowcaseRenderProperty<ShowcaseStoryClass>,
  "type"
>["type"];

type ShowcaseRenderPropertyBase<T, D extends keyof T> = {
  id: D;
  accessibleName?: string;
  caption?: string;
  columnSpan?: 1 | 2 | 3;
};

export type ShowcaseRenderPropertyBoolean<
  T,
  D extends keyof T
> = ShowcaseRenderPropertyBase<T, D> & {
  value: boolean;
  render?: "checkbox" | "switch";
  type: "boolean";
};

export type ShowcaseRenderPropertyNumber<
  T,
  D extends keyof T
> = ShowcaseRenderPropertyBase<T, D> & {
  value: number;
  render?: "input";
  type: "number";
};

export type ShowcaseRenderPropertyString<
  T,
  D extends keyof T
> = ShowcaseRenderPropertyBase<T, D> & {
  value: string | undefined;
  render?: "input" | "textarea";
  type: "string";
};

// TODO: Improve the type safety for enums
export type ShowcaseRenderPropertyEnum<
  T,
  D extends keyof T
> = ShowcaseRenderPropertyBase<T, D> & {
  value: T[D];
  render?: "combo-box" | "radio-group";
  type: "enum";
  values: { caption: string; value: any }[];
};

export type ShowcaseRenderPropertyObject<
  T,
  D extends keyof T
> = ShowcaseRenderPropertyBase<T, D> & {
  properties: ShowcaseRenderProperty<any>[];
  render?: "action-button" | "independent-properties";
  type: "object";
};

export type ChameleonStories = {
  accordion: ShowcaseStory<HTMLChAccordionRenderElement>;
  "action-group-in-development": ShowcaseStory<HTMLChActionGroupRenderElement>;
  "action-list": ShowcaseStory<HTMLChActionListRenderElement>;
  "barcode-scanner": ShowcaseStory<HTMLChBarcodeScannerElement>;
  checkbox: ShowcaseStory<HTMLChCheckboxElement>;
  code: ShowcaseStory<HTMLChCodeElement>;
  "combo-box": ShowcaseStory<HTMLChComboBoxRenderElement>;
  dialog: ShowcaseStory<HTMLChDialogElement>;
  dropdown: ShowcaseStory<HTMLChDropdownRenderElement>;
  edit: ShowcaseStory<HTMLChEditElement>;
  image: ShowcaseStory<HTMLChImageElement>;
  "layout-splitter": ShowcaseStory<HTMLChLayoutSplitterElement>;
  "navigation-list": ShowcaseStory<HTMLChNavigationListRenderElement>;
  popover: ShowcaseStory<HTMLChPopoverElement>;
  qr: ShowcaseStory<HTMLChQrElement>;
  "radio-group": ShowcaseStory<HTMLChRadioGroupRenderElement>;
  "segmented-control": ShowcaseStory<HTMLChSegmentedControlRenderElement>;
  slider: ShowcaseStory<HTMLChSliderElement>;
  switch: ShowcaseStory<HTMLChSwitchElement>;
  tab: ShowcaseStory<HTMLChTabRenderElement>;
  textblock: ShowcaseStory<HTMLChTextblockElement>;
  tooltip: ShowcaseStory<HTMLChTooltipElement>;
  "tree-view": ShowcaseStory<HTMLChTreeViewRenderElement>;
};

export type ChameleonCustomStories = {
  chat: ShowcaseCustomStory;
  "markdown-viewer": ShowcaseCustomStory;
  "flexible-layout": ShowcaseCustomStory;
};

export type ShowcaseAvailableCustomStories =
  | Mutable<HTMLChChatElement>
  | Mutable<HTMLChMarkdownViewerElement>
  | Mutable<HTMLChFlexibleLayoutRenderElement>;
