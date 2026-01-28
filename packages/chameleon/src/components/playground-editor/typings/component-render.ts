import type { ThemeModel } from "../../theme/theme-types";

export type ComponentRenderModel = {
  bundles?: ThemeModel;
  customCss?: string;
  events?: ComponentRenderEvents;
  states?: ComponentRenderStates;
  variables?: ComponentRenderVariables;
  template: ComponentRenderTemplate;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                           Events
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export type ComponentRenderEvents = Record<
  string,
  (
    states: ComponentRenderStates | undefined
  ) => (event: CustomEvent<unknown>) => void
>;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                           States
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export type ComponentRenderStates = {
  readonly [key: string]: ComponentRenderState;
};

export type ComponentRenderState = {
  value: string | number | boolean | unknown[] | Record<string, unknown>;

  readonly type: string;

  /**
   * Determinate if the state is defined inside the component definition. If
   * not, it will be defined before the component/class definition.
   */
  readonly classMember?: boolean;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                         Variables
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export type ComponentRenderVariables = Record<string, ComponentRenderVariable>;

export type ComponentRenderVariable = {
  value: string | unknown[] | Record<string, unknown> | boolean;
  wrapWithFunction?: {
    functionName: string;
    arguments?: string[];
  };
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                          Template
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export type ComponentRenderTemplate =
  | ComponentRenderTemplateItem
  | ComponentRenderTemplateItem[];

export type ComponentRenderTemplateItem =
  | ComponentRenderTemplateItemNode<keyof HTMLElementTagNameMap>
  | ComponentRenderTemplateItemText;

export type ComponentRenderTemplateItemText = string;

export type ComponentRenderTemplateItemNode<
  T extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap
> = T extends keyof HTMLElementTagNameMap
  ? {
      tag: T;
      class?: string;
      properties?: ComponentRenderTemplateItemNodeProperties<T>;
      events?: ComponentRenderTemplateItemNodeEvents;
      children?: ComponentRenderTemplate;
    }
  : never;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                   Template | Properties
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export type ComponentRenderTemplateItemNodeProperties<
  T extends keyof HTMLElementTagNameMap
> = {
  [key in keyof HTMLElementTagNameMap[T]]?: ComponentRenderTemplateItemNodeProperty;
};

export type ComponentRenderTemplateItemNodeProperty =
  | string
  | number
  | boolean
  | null;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                     Template | Events
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export type ComponentRenderTemplateItemNodeEvents = Record<
  string,
  ComponentRenderTemplateItemNodeEvent
>;

export type ComponentRenderTemplateItemNodeEvent = {
  eventHandlerName: string;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                     Simplified Model??
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export type ComponentRenderTemplateSimplifiedModel =
  ComponentRenderTemplateSimplifiedItem[];

export type ComponentRenderTemplateSimplifiedItem =
  | ComponentTemplateItemSimplifiedNode
  | string;

export type ComponentTemplateItemSimplifiedNode = {
  tag: string;
  properties?: string[] | undefined;
  children?: ComponentRenderTemplateSimplifiedModel;
};

