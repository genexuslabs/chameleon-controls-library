import type { EntryOutputName } from "./entries";

/**
 * Exact bundle sizes (in bytes) for each minified entry point, shared
 * dependencies, and total application cost.
 *
 * These values are **exact measurements** — the test fails when a file's size
 * changes by even a single byte. This guarantees that every bundle-size change
 * is intentional and reviewed.
 *
 * To recalibrate after a legitimate change: run `npm run build:minified`,
 * then run the bundle-size tests. The error messages print the actual sizes
 * so you can paste them here.
 *
 * The build simulates a real consumer application: an HTML entry point
 * dynamically imports every component, Rollup bundles everything (zero
 * externals), and code-splits shared code.
 *
 * Entry chunks contain component code + deps unique to that component (e.g.,
 * KaTeX stays in math-viewer, qr-creator in qr). Framework deps shared by
 * many components (lit, kasstor, tslib) and internal utilities are forced to
 * shared chunks via `manualChunks`.
 */

export interface BundleSizeExpectations {
  entries: Record<EntryOutputName, { raw: number; gzipped: number }>;
  sharedTotal: { raw: number; gzipped: number };
  appTotal: { raw: number; gzipped: number };
}

export const EXPECTED_SIZES: BundleSizeExpectations = {
  entries: {
    // - - - - - - - - - - Components - - - - - - - - - -
    "accordion.lit.js": { raw: 7370, gzipped: 3110 },
    "action-group-render.lit.js": { raw: 6167, gzipped: 2679 },
    "action-list-render.lit.js": { raw: 28791, gzipped: 8443 },
    "action-menu-render.lit.js": { raw: 13906, gzipped: 4224 },
    "breadcrumb-render.lit.js": { raw: 5514, gzipped: 2270 },
    "checkbox.lit.js": { raw: 4392, gzipped: 2102 },
    "combo-box.lit.js": { raw: 20248, gzipped: 6515 },
    "image.lit.js": { raw: 2917, gzipped: 1310 },
    "json-render.lit.js": { raw: 77040, gzipped: 21108 },
    "layout-splitter.lit.js": { raw: 10120, gzipped: 4263 },
    "math-viewer.lit.js": { raw: 279422, gzipped: 79977 },
    "navigation-list-render.lit.js": { raw: 13624, gzipped: 4372 },
    "popover.lit.js": { raw: 18990, gzipped: 5204 },
    "progress.lit.js": { raw: 2875, gzipped: 1458 },
    "qr.lit.js": { raw: 13342, gzipped: 5832 },
    "radio-group-render.lit.js": { raw: 2853, gzipped: 1610 },
    "router.lit.js": { raw: 899, gzipped: 768 },
    "segmented-control-render.lit.js": { raw: 3738, gzipped: 1695 },
    "sidebar.lit.js": { raw: 3760, gzipped: 1721 },
    "slider.lit.js": { raw: 4445, gzipped: 1865 },
    "status.lit.js": { raw: 1391, gzipped: 979 },
    "switch.lit.js": { raw: 3882, gzipped: 1801 },
    "tab.lit.js": { raw: 19066, gzipped: 5918 },
    "textblock.lit.js": { raw: 3351, gzipped: 1665 },
    "theme.lit.js": { raw: 2644, gzipped: 1389 },

    // - - - - - - - - - - Utilities - - - - - - - - - -
    "host.js": { raw: 1369, gzipped: 853 },
    "image-path-registry.js": { raw: 256, gzipped: 514 }
  },

  // Total size of all shared chunks (lit, kasstor, tslib, internal utilities)
  sharedTotal: { raw: 42249, gzipped: 18126 },

  // Sum of all files = real download cost when loading every component
  appTotal: { raw: 594621, gzipped: 191771 }
};
