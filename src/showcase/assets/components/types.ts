import { Mutable } from "../../../common/types";
import { CheckBox } from "../../../components/checkbox/checkbox";
import { ChComboBox } from "../../../components/combobox/combo-box";
import { ChDropdownRender } from "../../../components/dropdown/dropdown-render";
import { ChLayoutSplitter } from "../../../components/layout-splitter/layout-splitter";
import { ChTreeViewRender } from "../../../components/tree-view/tree-view-render";

export type ShowcaseStory<T extends ShowcaseAvailableStories> = {
  render: () => any;
  properties: ShowcaseRenderProperties<T>;
  state: Partial<T>;
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
  value: string;
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
  | Mutable<CheckBox>
  | Mutable<ChComboBox>
  | Mutable<ChDropdownRender>
  | Mutable<ChLayoutSplitter>
  | Mutable<ChTreeViewRender>;