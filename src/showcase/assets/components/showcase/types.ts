import { Mutable } from "../../../../common/types";
import { CheckBox } from "../../../../components/checkbox/checkbox";
import { ChDropdownRender } from "../../../../components/dropdown/dropdown-render";
import { ChTreeViewRender } from "../../../../components/tree-view/tree-view-render";

export type ShowcaseStory<T extends ShowcaseAvailableStories> = {
  render: () => any;
  properties: ShowcaseRenderProperties<T>;
  state: Partial<T>;
};

export type ShowcaseRenderProperties<T extends ShowcaseAvailableStories> =
  ShowcaseRenderPropertyGroup<T>[];

export type ShowcaseRenderPropertyGroup<T extends ShowcaseAvailableStories> = {
  caption: string;
  columns?: 1 | 2 | 3;
  properties: ShowcaseRenderProperty<T>[];
};

export type ShowcaseRenderProperty<T extends ShowcaseAvailableStories> =
  | ShowcaseRenderPropertyBoolean<T, keyof T>
  | ShowcaseRenderPropertyNumber<T, keyof T>
  | ShowcaseRenderPropertyString<T, keyof T>
  | ShowcaseRenderPropertyEnum<T, keyof T>
  | ShowcaseRenderPropertyObject<T, keyof T>;

export type ShowcaseRenderPropertyTypes = Pick<
  ShowcaseRenderProperty<ShowcaseAvailableStories>,
  "type"
>["type"];

type ShowcaseRenderPropertyBase<
  T extends ShowcaseAvailableStories,
  D extends keyof T
> = {
  id: D;
  accessibleName?: string;
  caption?: string;
  columnSpan?: 1 | 2 | 3;
};

export type ShowcaseRenderPropertyBoolean<
  T extends ShowcaseAvailableStories,
  D extends keyof T
> = ShowcaseRenderPropertyBase<T, D> & {
  value: boolean;
  render?: "checkbox" | "switch";
  type: "boolean";
};

export type ShowcaseRenderPropertyNumber<
  T extends ShowcaseAvailableStories,
  D extends keyof T
> = ShowcaseRenderPropertyBase<T, D> & {
  value: number;
  render?: "input";
  type: "number";
};

export type ShowcaseRenderPropertyString<
  T extends ShowcaseAvailableStories,
  D extends keyof T
> = ShowcaseRenderPropertyBase<T, D> & {
  value: string;
  render?: "input" | "textarea";
  type: "string";
};

// TODO: Improve the type safety for enums
export type ShowcaseRenderPropertyEnum<
  T extends ShowcaseAvailableStories,
  D extends keyof T
> = ShowcaseRenderPropertyBase<T, D> & {
  value: T[D];
  render?: "combo-box" | "radio-group";
  type: "enum";
  values: { caption: string; value: any }[];
};

export type ShowcaseRenderPropertyObject<
  T extends ShowcaseAvailableStories,
  D extends keyof T
> = ShowcaseRenderPropertyBase<T, D> & {
  properties: ShowcaseRenderProperty<T>[];
  render?: "action-button" | "independent-properties";
  type: "object";
};

export type ShowcaseAvailableStories =
  | Mutable<ChTreeViewRender>
  | Mutable<CheckBox>
  | Mutable<ChDropdownRender>;
