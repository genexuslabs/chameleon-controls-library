import type { Catalog } from "@json-render/core";
import type {
  ComponentRegistry,
  Components,
  Actions,
  StateModel,
  CatalogHasActions,
} from "./types.js";

export interface DefineRegistryResult {
  registry: ComponentRegistry;
  onAction: (
    name: string,
    params?: Record<string, unknown>,
    setState?: (path: string, value: unknown) => void,
    getState?: () => StateModel
  ) => void | Promise<void>;
}

type DefineRegistryOptions<C extends Catalog> = {
  components?: Components<C>;
} & (CatalogHasActions<C> extends true
  ? { actions: Actions<C> }
  : { actions?: Actions<C> });

/**
 * Build a typed registry from a catalog definition.
 *
 * Mirrors `defineRegistry` from @json-render/react.
 *
 * Component functions in `options.components` receive `BaseComponentProps`
 * (with a typed `props` field) rather than the low-level `ComponentRenderProps`.
 * The returned `onAction` dispatches to the matching entry in `options.actions`.
 */
export function defineRegistry<C extends Catalog>(
  _catalog: C,
  options: DefineRegistryOptions<C>
): DefineRegistryResult {
  // Wrap each typed component fn into a low-level ComponentRenderer that
  // unwraps element.props into the simpler BaseComponentProps shape.
  const registry: ComponentRegistry = {};
  for (const [key, fn] of Object.entries(options.components ?? {})) {
    registry[key] = ({ element, children, emit, on, bindings, setState, loading }) =>
      (fn as Function)({
        props: element.props,
        children,
        emit,
        on,
        bindings,
        setState,
        loading,
      });
  }

  const onAction = async (
    name: string,
    params?: Record<string, unknown>,
    setState?: (path: string, value: unknown) => void,
    getState?: () => StateModel
  ): Promise<void> => {
    const actions = (options as any).actions as Actions<C> | undefined;
    const handler = actions?.[name as keyof Actions<C>] as
      | ((
          p: unknown,
          s: (path: string, value: unknown) => void,
          state: StateModel
        ) => void | Promise<void>)
      | undefined;

    if (!handler) return;

    await handler(
      params,
      setState ?? (() => {}),
      getState?.() ?? {}
    );
  };

  return { registry, onAction };
}
