import type { LitElement } from "lit";

export type ComponentProperty<T extends HTMLElement> = {
  [key in Exclude<
    keyof T,
    keyof HTMLElement | keyof LitElement | "render" | "willUpdate"
  >]?: T[key] extends object
    ? ComponentObjectProperty<T[key]>
    :
        | ComponentEnumProperty<T[key]>
        | ComponentFunctionProperty<T[key]>
        | ComponentPrimitiveProperty<T[key]>
        | ComponentRefProperty<T[key]>;
};

export type ComponentPrimitiveProperty<Value> = {
  readonly value: Value;
  type: "boolean" | "number" | "string" | "string-multiline";
};

export type ComponentObjectProperty<Value extends object | undefined> = {
  readonly value: Value;
  type: "object";
};

export type ComponentEnumProperty<Value> = {
  readonly value: Value;
  values: { caption: string; value: Value }[];
  type: "enum";
};

export type ComponentRefProperty<Value> = {
  readonly value: Value;
  type: "ref";
};

export type ComponentFunctionProperty<Value> = {
  readonly value: Value;
  type: "function";
};

// const a: ComponentProperty<TemplateRender> = {
//   customCss: {
//     value: "",
//     type: "string"
//   }
// };

