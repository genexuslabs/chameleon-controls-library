import type {
  UIElement,
  StateModel,
  Catalog,
  InferCatalogComponents,
  InferCatalogActions,
  InferComponentProps,
  InferActionParams,
} from "@json-render/core";

export type { StateModel };

/** Mirrors EventHandle from @json-render/react. */
export interface EventHandle {
  emit: () => void;
  shouldPreventDefault: boolean;
  bound: boolean;
}

/**
 * Simplified props for component render functions defined with defineRegistry.
 * Mirrors BaseComponentProps from @json-render/react.
 * Adds setState (replaces the React-only useBoundProp hook).
 */
export interface BaseComponentProps<P = Record<string, unknown>> {
  props: P;
  children?: unknown[];
  emit: (event: string) => void;
  on: (event: string) => EventHandle;
  bindings?: Record<string, string>;
  setState: (path: string, value: unknown) => void;
  loading?: boolean;
}

/**
 * Low-level props exposing the full resolved UIElement.
 * Mirrors ComponentRenderProps from @json-render/react.
 */
export interface ComponentRenderProps<P = Record<string, unknown>> {
  element: UIElement<string, P>;
  children?: unknown[];
  emit: (event: string) => void;
  on: (event: string) => EventHandle;
  bindings?: Record<string, string>;
  setState: (path: string, value: unknown) => void;
  loading?: boolean;
}

/** Low-level component renderer. Returns a Lit TemplateResult. */
export type ComponentRenderer<P = Record<string, unknown>> = (
  ctx: ComponentRenderProps<P>
) => unknown;

/** Registry of component renderer functions, keyed by type name. */
export type ComponentRegistry = Record<string, ComponentRenderer<any>>;

/** Per-element repeat scope — active inside elements with a `repeat` config. */
export interface RepeatScope {
  item: unknown;
  index: number;
  /** Absolute state path to the current repeat item, e.g. "/todos/0". */
  basePath: string;
}

// Catalog-typed helpers (mirrors catalog-types.ts from @json-render/react)

export type ComponentFn<
  C extends Catalog,
  K extends keyof InferCatalogComponents<C>,
> = (ctx: BaseComponentProps<InferComponentProps<C, K & string>>) => unknown;

export type Components<C extends Catalog> = {
  [K in keyof InferCatalogComponents<C>]: ComponentFn<C, K>;
};

export type ActionFn<
  C extends Catalog,
  K extends keyof InferCatalogActions<C>,
> = (
  params: InferActionParams<C, K & string> | undefined,
  setState: (path: string, value: unknown) => void,
  state: StateModel
) => void | Promise<void>;

export type Actions<C extends Catalog> = {
  [K in keyof InferCatalogActions<C>]: ActionFn<C, K>;
};

/** True when the catalog declares at least one action. */
export type CatalogHasActions<C extends Catalog> =
  [keyof InferCatalogActions<C>] extends [never] ? false : true;
