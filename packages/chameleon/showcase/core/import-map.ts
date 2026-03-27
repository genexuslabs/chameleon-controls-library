/**
 * Builds the import map for the playground's iframe srcdoc.
 * Maps bare module specifiers to absolute Vite-served URLs.
 *
 * Additional dynamic entries (blob: URLs for secondary tabs) are merged in
 * by the playground-code-editor at iframe build time.
 */

/** Base URL for Vite dev server (same origin as the showcase). */
const BASE = window.location.origin;

/** Chameleon source root as served by Vite. */
const SRC = `${BASE}/src`;

/** The static portion of the import map: library specifiers. */
export const staticImportMap: Record<string, string> = {
  // Lit core
  lit: `${BASE}/node_modules/lit/index.js`,
  "lit/": `${BASE}/node_modules/lit/`,
  "lit/decorators.js": `${BASE}/node_modules/lit/decorators.js`,
  "lit/directives/repeat.js": `${BASE}/node_modules/lit/directives/repeat.js`,
  "lit/directives/class-map.js": `${BASE}/node_modules/lit/directives/class-map.js`,
  "lit/directives/style-map.js": `${BASE}/node_modules/lit/directives/style-map.js`,
  "lit/directives/if-defined.js": `${BASE}/node_modules/lit/directives/if-defined.js`,

  // Kasstor core (used by Chameleon components)
  "@genexus/kasstor-core": `${BASE}/node_modules/@genexus/kasstor-core/index.js`,
  "@genexus/kasstor-core/": `${BASE}/node_modules/@genexus/kasstor-core/`,

  // Chameleon components (one entry per public component)
  "chameleon/checkbox": `${SRC}/components/checkbox/checkbox.lit.ts`,
  "chameleon/code": `${SRC}/components/code/code.lit.ts`,
  "chameleon/edit": `${SRC}/components/edit/edit.lit.ts`,
  "chameleon/image": `${SRC}/components/image/image.lit.ts`,
  "chameleon/navigation-list": `${SRC}/components/navigation-list/navigation-list-render.lit.ts`,
  "chameleon/radio-group": `${SRC}/components/radio-group/radio-group-render.lit.ts`,
  "chameleon/segmented-control": `${SRC}/components/segmented-control/segmented-control-render.lit.ts`,
  "chameleon/sidebar": `${SRC}/components/sidebar/sidebar.lit.ts`,
  "chameleon/slider": `${SRC}/components/slider/slider.lit.ts`,
  "chameleon/switch": `${SRC}/components/switch/switch.lit.ts`,
  "chameleon/textblock": `${SRC}/components/textblock/textblock.lit.ts`,
  "chameleon/theme": `${SRC}/components/theme/theme.lit.ts`,
  "chameleon/progress": `${SRC}/components/progress/progress.lit.ts`,
  "chameleon/qr": `${SRC}/components/qr/qr.lit.ts`,
  "chameleon/breadcrumb": `${SRC}/components/breadcrumb/breadcrumb-render.lit.ts`,
  "chameleon/layout-splitter": `${SRC}/components/layout-splitter/layout-splitter.lit.ts`,
  "chameleon/dialog": `${SRC}/components/dialog/dialog.lit.ts`,
  "chameleon/popover": `${SRC}/components/popover/popover.lit.ts`,
  "chameleon/tooltip": `${SRC}/components/tooltip/tooltip.lit.ts`,

  // Newly migrated components
  "chameleon/chat": `${SRC}/components/chat/chat.lit.ts`,
  "chameleon/live-kit-room": `${SRC}/components/live-kit-room/live-kit-room.lit.ts`,
  "chameleon/markdown-viewer": `${SRC}/components/markdown-viewer/markdown-viewer.lit.ts`,
  "chameleon/smart-grid": `${SRC}/components/smart-grid/smart-grid.lit.ts`
};

/**
 * Builds the full import map JSON string for a given set of additional
 * blob URL entries (secondary editor tabs).
 */
export function buildImportMapScript(
  extraEntries: Record<string, string> = {}
): string {
  const imports = { ...staticImportMap, ...extraEntries };
  return JSON.stringify({ imports }, null, 2);
}
