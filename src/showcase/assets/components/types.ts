import { Mutable } from "../../../common/types";

export type ShowcaseStories = {
  [key: string]: ShowcaseStory<ShowcaseStoryClass>;
} & { customVars: ShowcaseRenderPropertyStyleValues };

export type ShowcaseStory<T extends ShowcaseStoryClass> = {
  render: ShowcaseRender;

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
    render: ShowcaseTemplateRender;
  };
  markupWithoutUIModel?: ShowcaseTemplateRender;
  properties: ShowcaseRenderProperties<T>;
  state: Partial<T>;
};

export type ShowcaseStoryClass = Mutable<
  HTMLElementTagNameMap[keyof HTMLElementTagNameMap]
>;

export type ShowcaseCustomStory = {
  render: ShowcaseRender;

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

export type ShowcaseRender = (designSystem: "mercury" | "unanimo") => any;
export type ShowcaseTemplateRender = {
  stencil: (designSystem: "mercury" | "unanimo") => string;
  react: (designSystem: "mercury" | "unanimo") => string;
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
  | ShowcaseRenderPropertyObject<T, keyof T>
  | ShowcaseRenderPropertyStyle;

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

export type ShowcaseRenderPropertyStyle = ShowcaseRenderPropertyBase<
  { customVars: { [key: string]: string } },
  "customVars"
> & {
  properties: ShowcaseRenderPropertyStyleValues;
  render?: "action-button" | "independent-properties";
  type: "style";
};

export type ShowcaseRenderPropertyStyleValues =
  ShowcaseRenderPropertyStyleValue[];

// TODO: Improve typing
export type ShowcaseRenderPropertyStyleValue =
  | ShowcaseRenderPropertyBoolean<any, any>
  | ShowcaseRenderPropertyNumber<any, any>
  | ShowcaseRenderPropertyString<any, any>;

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
  "action-group": ShowcaseStory<HTMLChActionGroupRenderElement>;
  "action-menu": ShowcaseStory<HTMLChActionMenuRenderElement>;
  "action-list": ShowcaseStory<HTMLChActionListRenderElement>;
  "barcode-scanner": ShowcaseStory<HTMLChBarcodeScannerElement>;
  checkbox: ShowcaseStory<HTMLChCheckboxElement>;
  chat: ShowcaseStory<HTMLChChatElement>;
  code: ShowcaseStory<HTMLChCodeElement>;
  "combo-box": ShowcaseStory<HTMLChComboBoxRenderElement>;
  counter: ShowcaseStory<HTMLChCounterElement>;
  dialog: ShowcaseStory<HTMLChDialogElement>;
  edit: ShowcaseStory<HTMLChEditElement>;
  image: ShowcaseStory<HTMLChImageElement>;
  "live-kit-room": ShowcaseStory<HTMLChLiveKitRoomElement>;
  "layout-splitter": ShowcaseStory<HTMLChLayoutSplitterElement>;
  "navigation-list": ShowcaseStory<HTMLChNavigationListRenderElement>;
  "paginator-render": ShowcaseStory<HTMLChPaginatorRenderElement>;
  popover: ShowcaseStory<HTMLChPopoverElement>;
  progress: ShowcaseStory<HTMLChProgressElement>;
  qr: ShowcaseStory<HTMLChQrElement>;
  rating: ShowcaseStory<HTMLChRatingElement>;
  "radio-group": ShowcaseStory<HTMLChRadioGroupRenderElement>;
  "segmented-control": ShowcaseStory<HTMLChSegmentedControlRenderElement>;
  sidebar: ShowcaseStory<
    HTMLChSidebarElement & HTMLChNavigationListRenderElement
  >;
  slider: ShowcaseStory<HTMLChSliderElement>;
  status: ShowcaseStory<HTMLChStatusElement>;
  switch: ShowcaseStory<HTMLChSwitchElement>;
  tab: ShowcaseStory<HTMLChTabRenderElement>;
  "tabular-grid-render": ShowcaseStory<HTMLChTabularGridRenderElement>;
  textblock: ShowcaseStory<HTMLChTextblockElement>;
  tooltip: ShowcaseStory<HTMLChTooltipElement>;
  "tree-view": ShowcaseStory<HTMLChTreeViewRenderElement>;
};

export type ChameleonCustomStories = {
  "code-editor": ShowcaseCustomStory;
  "code-diff-editor": ShowcaseCustomStory;
  "markdown-viewer": ShowcaseCustomStory;
  "flexible-layout": ShowcaseCustomStory;
  paginator: ShowcaseCustomStory;
  shortcuts: ShowcaseCustomStory;
  "tabular-grid": ShowcaseCustomStory;
};

export type ShowcaseTemplateFrameWork = "react" | "stencil";

export type ShowcaseTemplatePropertyInfo<
  Dictionary extends { [key in string]: any }
> =
  | ShowcaseTemplatePropertyInfoVariable<Dictionary, keyof Dictionary>
  | ShowcaseTemplatePropertyInfoFixed;

export type ShowcaseTemplatePropertyInfoVariable<
  Dictionary extends { [key in string]: any },
  T extends keyof Dictionary
> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  name: T | (string & {});
  defaultValue: Dictionary[T];
  fixed?: false;
  type: "boolean" | "number" | "string" | "string-template";
};

export type ShowcaseTemplatePropertyInfoFixed = {
  name: string;
  value: any;
  fixed: true;
  type:
    | "boolean"
    | "event"
    | "function"
    | "number"
    | "string"
    | "string-template";
};
