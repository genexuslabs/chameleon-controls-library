export const DISABLED_CLASS = "ch-disabled";

/**
 * This Symbol allow us to add metadata to UI models, without making it
 * available to the UI model host.
 *
 * Additionally, object entries that are Symbols are not serialize
 * (JSON.stringify), which is perfect for further hiding even more this
 * metadata that must be internal to each component's implementation.
 */
export const MODEL_METADATA = /* @__PURE__ */ Symbol("metadata");

export const LIBRARY_PREFIX = "ch-";

/**
 * Utility class to globally style the scrollbars
 */
export const SCROLLABLE_CLASS = "ch-scrollable";
