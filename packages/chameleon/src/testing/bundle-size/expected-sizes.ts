import type { EntryOutputName } from "./entries";

/**
 * Exact bundle sizes (in bytes) for each minified entry point.
 *
 * These values are **exact measurements** — the test fails when a file's size
 * changes by even a single byte. This guarantees that every bundle-size change
 * is intentional and reviewed.
 *
 * To recalibrate after a legitimate change: run `npm run build:minified`,
 * then run the bundle-size tests. The error messages print the actual sizes
 * so you can paste them here.
 *
 * Note: these sizes include all local dependencies (helpers, SCSS, etc.)
 * bundled and minified by Vite/Terser. External dependencies (lit,
 * kasstor-core, etc.) are excluded.
 */
export const EXPECTED_SIZES: Record<
  EntryOutputName,
  { raw: number; gzipped: number }
> = {
  // - - - - - - - - - - Components - - - - - - - - - -
  "accordion.lit.js": { raw: 6559, gzipped: 2645 },
  "action-group-render.lit.js": { raw: 5662, gzipped: 2399 },
  "action-list-render.lit.js": { raw: 29662, gzipped: 8765 },
  "action-menu-render.lit.js": { raw: 14531, gzipped: 4455 },
  "breadcrumb-render.lit.js": { raw: 6359, gzipped: 2588 },
  "checkbox.lit.js": { raw: 4717, gzipped: 2204 },
  "code.lit.js": { raw: 26904, gzipped: 6165 },
  "combo-box.lit.js": { raw: 21080, gzipped: 6835 },
  "image.lit.js": { raw: 3094, gzipped: 1375 },
  "json-render.lit.js": { raw: 4173, gzipped: 2019 },
  "layout-splitter.lit.js": { raw: 10761, gzipped: 4468 },
  "math-viewer.lit.js": { raw: 280262, gzipped: 80265 },
  "navigation-list-render.lit.js": { raw: 14314, gzipped: 4566 },
  "popover.lit.js": { raw: 19814, gzipped: 5509 },
  "progress.lit.js": { raw: 3582, gzipped: 1610 },
  "qr.lit.js": { raw: 13770, gzipped: 5975 },
  "radio-group-render.lit.js": { raw: 3430, gzipped: 1817 },
  "router.lit.js": { raw: 1029, gzipped: 816 },
  "segmented-control-render.lit.js": { raw: 4623, gzipped: 1933 },
  "sidebar.lit.js": { raw: 3976, gzipped: 1784 },
  "slider.lit.js": { raw: 5205, gzipped: 2023 },
  "status.lit.js": { raw: 2027, gzipped: 1096 },
  "switch.lit.js": { raw: 4317, gzipped: 1951 },
  "tab.lit.js": { raw: 19954, gzipped: 6248 },
  "textblock.lit.js": { raw: 3699, gzipped: 1776 },
  "theme.lit.js": { raw: 3390, gzipped: 1533 },

  // - - - - - - - - - - Utilities - - - - - - - - - -
  "define-custom-elements.js": { raw: 1218, gzipped: 1023 },
  "web-components-path.js": { raw: 5413, gzipped: 2004 },
  "host.js": { raw: 1369, gzipped: 853 },
  "image-path-registry.js": { raw: 231, gzipped: 491 }
};
