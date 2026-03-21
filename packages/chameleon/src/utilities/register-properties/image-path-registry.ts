import { signal } from "@genexus/kasstor-signals/core.js";
import { computed } from "@genexus/kasstor-signals/core.js";
import type { GetImagePathCallback } from "../../typings/multi-state-images";

/**
 * Global signal-based registry for image path callbacks.
 *
 * When this signal changes, all components that use `watch()` with a
 * computed derived from it will perform pin-point updates — only the
 * `<ch-image>` bindings re-render, not the entire component.
 */
export const imagePathCallbackRegistry = signal<
  GetImagePathCallback | undefined
>(undefined);

/**
 * Registers a global image path callback. Components that read from the
 * registry signal (via a computed) will reactively update their icons.
 */
export const registerImagePathCallback = (
  callback: GetImagePathCallback
): void => {
  imagePathCallbackRegistry(callback);
};

/**
 * Creates a computed that resolves a `getImagePathCallback` with the
 * following priority: local property > global registry.
 *
 * Use this in render components (`ch-*-render`) to produce a single
 * computed that is then passed by reference to internal items.
 *
 * @param getLocalCallback - A getter for the component's local
 *   `getImagePathCallback` signal (e.g., `() => this.getImagePathCallback`)
 * @returns A computed signal that resolves the callback
 */
export const createResolvedImagePathCallback = (
  getLocalCallback: () => GetImagePathCallback | undefined
) =>
  computed<GetImagePathCallback | undefined>(
    () => getLocalCallback() ?? imagePathCallbackRegistry()
  );
