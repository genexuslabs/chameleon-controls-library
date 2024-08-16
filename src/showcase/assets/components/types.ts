import { Mutable } from "../../../common/types";
import { ChActionGroupRender } from "../../../components/action-group/action-group-render";
import { ChActionListRender } from "../../../components/action-list/action-list-render";
import { ChBarcodeScanner } from "../../../components/barcode-scanner/barcode-scanner";
import { ChChat } from "../../../components/chat/chat";
import { ChCheckBox } from "../../../components/checkbox/checkbox";
import { ChCode } from "../../../components/code/code";
import { ChComboBoxRender } from "../../../components/combobox/combo-box";
import { ChDialog } from "../../../components/dialog/dialog";
import { ChDropdownRender } from "../../../components/dropdown/dropdown-render";
import { ChEdit } from "../../../components/edit/edit";
import { ChFlexibleLayoutRender } from "../../../components/flexible-layout/flexible-layout-render";
import { ChImage } from "../../../components/image/image";
import { ChLayoutSplitter } from "../../../components/layout-splitter/layout-splitter";
import { ChMarkdownViewer } from "../../../components/markdown-viewer/markdown-viewer";
import { ChPopover } from "../../../components/popover/popover";
import { ChQr } from "../../../components/qr/qr";
import { ChRadioGroupRender } from "../../../components/radio-group/radio-group-render";
import { ChSegmentedControl } from "../../../components/segmented-control/segmented-control-render";
import { ChSlider } from "../../../components/slider/slider";
import { ChSwitch } from "../../../components/switch/switch";
import { ChTabRender } from "../../../components/tab/tab";
import { ChTextBlock } from "../../../components/textblock/textblock";
import { ChTreeViewRender } from "../../../components/tree-view/tree-view-render";

export type ShowcaseStory<T extends ShowcaseAvailableStories> = {
  render: () => any;
  markupWithUIModel?: {
    uiModel: any[] | { [key: string]: any };
    uiModelType: string;
    render: string;
  };
  markupWithoutUIModel?: string;
  properties: ShowcaseRenderProperties<T>;
  state: Partial<T>;
};

export type ShowcaseCustomStory = {
  render: () => any;
};

export type ShowcaseRenderProperties<T extends ShowcaseAvailableStories> =
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
  ShowcaseRenderProperty<ShowcaseAvailableStories>,
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

export type ShowcaseAvailableStories =
  | Mutable<ChActionGroupRender>
  | Mutable<ChActionListRender>
  | Mutable<ChBarcodeScanner>
  | Mutable<ChCheckBox>
  | Mutable<ChCode>
  | Mutable<ChComboBoxRender>
  | Mutable<ChDialog>
  | Mutable<ChDropdownRender>
  | Mutable<ChEdit>
  | Mutable<ChImage>
  | Mutable<ChLayoutSplitter>
  | Mutable<ChPopover>
  | Mutable<ChQr>
  | Mutable<ChRadioGroupRender>
  | Mutable<ChSegmentedControl>
  | Mutable<ChSlider>
  | Mutable<ChSwitch>
  | Mutable<ChTabRender>
  | Mutable<ChTextBlock>
  | Mutable<ChTreeViewRender>;

export type ShowcaseAvailableCustomStories = Mutable<
  ChChat | ChMarkdownViewer | ChFlexibleLayoutRender
>;
