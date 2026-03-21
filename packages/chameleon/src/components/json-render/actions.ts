import {
  resolveActionParam,
  resolvePropValue,
  getByPath,
  type ActionBinding,
  type StateStore,
  type StateModel,
  type PropResolutionContext,
} from "@json-render/core";

export interface ActionExecutionContext {
  binding: ActionBinding;
  store: StateStore;
  resolutionCtx: PropResolutionContext;
  onAction?: (
    name: string,
    params?: Record<string, unknown>,
    setState?: (path: string, value: unknown) => void,
    getState?: () => StateModel
  ) => void | Promise<void>;
}

/**
 * Recursively resolve all dynamic expressions inside a value.
 *
 * `resolveActionParam` only resolves a recognised `$`-expression at the
 * top level of its argument. Plain objects (e.g. `{ id: "$id", text: {$state} }`)
 * are returned as-is. This helper walks into plain objects and arrays so that
 * every nested expression is evaluated — required for `pushState` where the
 * value to append is often a multi-field object template.
 *
 * The `"$id"` string sentinel generates a short, unique ID (useful for
 * optimistic list inserts without a server-assigned key).
 */
function deepResolve(value: unknown, ctx: PropResolutionContext): unknown {
  if (value === "$id") {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  if (typeof value !== "object" || value === null) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(item => deepResolve(item, ctx));
  }
  // Try top-level $-expression resolution first.
  const resolved = resolvePropValue(value, ctx);
  if (resolved !== value) return resolved;
  // Plain object — recurse into each field.
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [
      k,
      deepResolve(v, ctx),
    ])
  );
}

/**
 * Execute a single action binding.
 *
 * Handles the three built-in actions (`setState`, `pushState`, `removeState`)
 * directly via the store. All other actions are forwarded to `onAction`.
 */
export async function executeActionBinding(
  ctx: ActionExecutionContext
): Promise<void> {
  const { binding, store, resolutionCtx, onAction } = ctx;
  const { action: actionName } = binding;

  // Resolve all params using PropResolutionContext so $item/$index work in
  // repeat scopes (resolveActionParam handles path-valued params specially).
  const resolvedParams = Object.fromEntries(
    Object.entries(binding.params ?? {}).map(([k, v]) => [
      k,
      resolveActionParam(v, resolutionCtx),
    ])
  );

  switch (actionName) {
    case "setState": {
      store.set(resolvedParams.statePath as string, resolvedParams.value);
      break;
    }

    case "pushState": {
      const statePath = resolvedParams.statePath as string;
      const current = (getByPath(store.getSnapshot(), statePath) as unknown[]) ?? [];

      // Deep-resolve the value so nested $-expressions inside objects/arrays
      // are evaluated. The top-level `value` param is already passed through
      // resolveActionParam, but a plain object like `{ id: "$id", text: {$state} }`
      // is treated as a literal by resolveActionParam and needs recursive resolution.
      store.set(statePath, [...current, deepResolve(resolvedParams.value, resolutionCtx)]);
      break;
    }

    case "removeState": {
      const statePath = resolvedParams.statePath as string;
      const index = resolvedParams.index as number;
      const current = (getByPath(store.getSnapshot(), statePath) as unknown[]) ?? [];
      store.set(
        statePath,
        current.filter((_, i) => i !== index)
      );
      break;
    }

    default: {
      await onAction?.(
        actionName,
        resolvedParams,
        store.set.bind(store),
        store.getSnapshot.bind(store)
      );
      break;
    }
  }
}
