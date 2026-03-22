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
 * kasstor-core, etc.) are excluded. External import paths are replaced with
 * realistic Rollup-style chunk references (`./chunk-XXXXXXXX.js`) to ensure
 * a fair comparison with Chameleon 6 (where Stencil inlines all imports).
 */
export const EXPECTED_SIZES: Record<
  EntryOutputName,
  { raw: number; gzipped: number }
> = {
  // - - - - - - - - - - Components - - - - - - - - - -
  "accordion.lit.js": { raw: 6523, gzipped: 2666 },
  "action-group-render.lit.js": { raw: 5577, gzipped: 2405 },
  "action-list-render.lit.js": { raw: 29555, gzipped: 8768 },
  "action-menu-render.lit.js": { raw: 14408, gzipped: 4462 },
  "breadcrumb-render.lit.js": { raw: 6274, gzipped: 2593 },
  "checkbox.lit.js": { raw: 4632, gzipped: 2204 },
  "code.lit.js": { raw: 26864, gzipped: 6171 },
  "combo-box.lit.js": { raw: 20956, gzipped: 6844 },
  "image.lit.js": { raw: 3033, gzipped: 1370 },
  "json-render.lit.js": { raw: 4112, gzipped: 2019 },
  "layout-splitter.lit.js": { raw: 10676, gzipped: 4477 },
  "math-viewer.lit.js": { raw: 280177, gzipped: 80249 },
  "navigation-list-render.lit.js": { raw: 14127, gzipped: 4577 },
  "popover.lit.js": { raw: 19707, gzipped: 5523 },
  "progress.lit.js": { raw: 3283, gzipped: 1620 },
  "qr.lit.js": { raw: 13709, gzipped: 5960 },
  "radio-group-render.lit.js": { raw: 3345, gzipped: 1823 },
  "router.lit.js": { raw: 990, gzipped: 815 },
  "segmented-control-render.lit.js": { raw: 4348, gzipped: 1943 },
  "sidebar.lit.js": { raw: 3891, gzipped: 1783 },
  "slider.lit.js": { raw: 4884, gzipped: 2036 },
  "status.lit.js": { raw: 1728, gzipped: 1101 },
  "switch.lit.js": { raw: 4232, gzipped: 1954 },
  "tab.lit.js": { raw: 19847, gzipped: 6259 },
  "textblock.lit.js": { raw: 3614, gzipped: 1782 },
  "theme.lit.js": { raw: 3069, gzipped: 1550 },

  // - - - - - - - - - - Utilities - - - - - - - - - -
  "define-custom-elements.js": { raw: 1218, gzipped: 1023 },
  "web-components-path.js": { raw: 5413, gzipped: 2004 },
  "host.js": { raw: 1369, gzipped: 853 },
  "image-path-registry.js": { raw: 218, gzipped: 486 }
};
