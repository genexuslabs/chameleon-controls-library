import { Mutable } from "../../../../common/types";
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
  properties: ShowcaseRenderProperty<T>[];
};

export type ShowcaseRenderProperty<T extends ShowcaseAvailableStories> =
  | ShowcaseRenderPropertyBoolean<T>
  | ShowcaseRenderPropertyString<T>
  | ShowcaseRenderPropertyEnum<T, keyof T>;

export type ShowcaseRenderPropertyBoolean<T extends ShowcaseAvailableStories> =
  {
    id: keyof T;
    caption: string;
    value: boolean;
    render?: "checkbox" | "switch";
    type: "boolean";
  };

export type ShowcaseRenderPropertyString<T extends ShowcaseAvailableStories> = {
  id: keyof T;
  caption: string;
  value: string;
  render?: "input" | "textarea";
  type: "string";
};

// TODO: Improve the type safety for enums
export type ShowcaseRenderPropertyEnum<
  T extends ShowcaseAvailableStories,
  D extends keyof T
> = {
  id: D;
  caption: string;
  value: T[D];
  render?: "combo-box" | "radio-group";
  type: "enum";
  values: { caption: string; value: T[D] }[];
};

export type ShowcaseAvailableStories = Mutable<ChTreeViewRender>;
