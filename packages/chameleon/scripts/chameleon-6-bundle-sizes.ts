/**
 * Compares Chameleon 6 vs Chameleon 7 bundle sizes.
 *
 * - Chameleon 6: fetched from unpkg (Stencil entry bundles).
 * - Chameleon 7: read from local `dist/minified/browser/` (Vite/Terser).
 *
 * Prints a formatted comparison table with ANSI colors to stdout.
 *
 * Prerequisites:
 *   npm run build:minified   (generates the Chameleon 7 minified bundles)
 *
 * Usage:
 *   npx tsx scripts/chameleon-6-bundle-sizes.ts
 */

import { readFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { gzipSync, type ZlibOptions } from "zlib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// - - - - - - - - - - - - - - - - - - - -
//              Constants
// - - - - - - - - - - - - - - - - - - - -

const CHAMELEON_6_VERSION = "6.33.1";

const BASE_URL = `https://unpkg.com/@genexus/chameleon-controls-library@${CHAMELEON_6_VERSION}/dist/chameleon`;

const LISTING_URL = `${BASE_URL}/?meta`;

const GZIP_OPTIONS: ZlibOptions = { level: 6 };
const GZIP_HEADER_CRC_OVERHEAD = 311;

const V7_MINIFIED_DIR = join(__dirname, "../dist/minified/browser");

// Components to exclude from the comparison — internal, deprecated, or
// irrelevant for a v6 ↔ v7 comparison.
const IGNORED_V6_COMPONENTS = new Set([
  "ch-accordion", // Wrapper, not the render component
  // TODO: Fix this
  // "ch-color-field", // Bundled with ch-slider in v6, not a standalone component
  "ch-form-checkbox", // Deprecated — replaced by ch-checkbox
  "ch-grid-column-display",
  "ch-grid-column-resize",
  "ch-grid-infinite-scroll",
  "ch-grid-row-actions",
  "ch-grid-rowset-empty",
  "ch-grid-rowset-legend",
  "ch-grid-settings",
  "ch-grid-virtual-scroller",
  "ch-icon", // Replaced by ch-image
  "ch-style", // Deprecated — replaced by ch-theme
  "ch-tabular-grid",
  "ch-tabular-grid-action-refresh",
  "ch-tabular-grid-action-settings",
  "ch-tabular-grid-actionbar",
  "ch-tabular-grid-column-display",
  "ch-tabular-grid-column-resize",
  "ch-tabular-grid-infinite-scroll",
  "ch-tabular-grid-render",
  "ch-tabular-grid-row-actions",
  "ch-tabular-grid-rowset-empty",
  "ch-tabular-grid-settings",
  "ch-tabular-grid-virtual-scroller",
  "ch-test-flexible-layout", // Test-only component
  "ch-test-suggest", // Test-only component
  "ch-tree", // Wrapper, not the render component
  "ch-tree-item", // Internal sub-component
  "ch-markdown",
  "ch-select",
  "ch-select-option",
  "ch-timer",
  "ch-grid",
  "ch-intersection-observer",
  "ch-next-data-modeling",
  "ch-next-data-modeling-item",
  "ch-next-progress-bar",
  "ch-notifications",
  "ch-notifications-item",
  "ch-paginator",
  "ch-window",
  "ch-sidebar-menu",
  "ch-sidebar-menu-list",
  "ch-sidebar-menu-list-item",
  "ch-step-list",
  "ch-step-list-item",
  "ch-next-data-modeling-render",
  "ch-suggest"
]);

const IGNORED_V7_COMPONENTS = new Set([
  "ch-router", // Internal routing utility, not a UI component
  "ch-showcase-api" // Showcase-only, not distributed
]);

// - - - - - - - - - - - - - - - - - - - -
//            ANSI colors
// - - - - - - - - - - - - - - - - - - - -

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const WHITE = "\x1b[37m";
const BG_GREEN = "\x1b[42m";
const BG_RED = "\x1b[41m";

// - - - - - - - - - - - - - - - - - - - -
//               Types
// - - - - - - - - - - - - - - - - - - - -

interface UnpkgFileMeta {
  path: string;
  size: number;
  type: "file" | "directory";
}

interface UnpkgDirectoryListing {
  files: UnpkgFileMeta[];
}

interface BundleSize {
  raw: number;
  gzipped: number;
}

interface ComparisonRow {
  component: string;
  v6: BundleSize | null;
  v7: BundleSize | null;
}

// - - - - - - - - - - - - - - - - - - - -
//            Helper functions
// - - - - - - - - - - - - - - - - - - - -

function getGzipSize(content: string): number {
  const buffer = Buffer.from(content, "utf-8");
  return gzipSync(buffer, GZIP_OPTIONS).length + GZIP_HEADER_CRC_OVERHEAD;
}

function measureContent(content: string): BundleSize {
  return {
    raw: Buffer.byteLength(content, "utf-8"),
    gzipped: getGzipSize(content)
  };
}

/**
 * Extracts component tag names from a Stencil entry bundle.
 *
 * Stencil minified bundles end with an export block like:
 * ```
 * xport{d as ch_tabular_grid_column_resize,a as ch_tabular_grid_column_settings}
 * ```
 *
 * Aliases use underscores which map to kebab-case tag names with the `ch-`
 * prefix.
 */
function extractComponentNames(source: string): string[] {
  const match = source.match(/xport\s*\{([^}]+)\}\s*$/);
  if (!match) {
    return [];
  }

  const exportBlock = match[1];
  const aliases = [...exportBlock.matchAll(/as\s+(ch_[a-z0-9_]+)/g)];

  return aliases.map(m => m[1].replace(/_/g, "-"));
}

/**
 * Given a list of components in a Stencil bundle, pick the "primary" one.
 *
 * In Chameleon 6, Stencil groups a render component with its internal
 * sub-components into a single entry bundle. The primary is the one consumers
 * actually use — typically the one with a `-render` suffix, or the shortest
 * name when no render suffix exists.
 */
function pickPrimaryComponent(components: string[]): string {
  if (components.length === 1) {
    return components[0];
  }

  // Prefer the component with "-render" suffix
  const renderComponent = components.find(c => c.endsWith("-render"));
  if (renderComponent) {
    return renderComponent;
  }

  // Otherwise pick the shortest name (e.g., "ch-grid" over "ch-grid-column")
  return [...components].sort((a, b) => a.length - b.length)[0];
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`
    );
  }

  return response.text();
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

// - - - - - - - - - - - - - - - - - - - -
//        Chameleon 6 → component map
// - - - - - - - - - - - - - - - - - - - -

async function fetchV6Sizes(): Promise<Map<string, BundleSize>> {
  console.error(
    `Fetching file listing for Chameleon ${CHAMELEON_6_VERSION}...`
  );
  const listing = await fetchJson<UnpkgDirectoryListing>(LISTING_URL);

  const entryFilenames = listing.files
    .filter(file => file.path.endsWith(".entry.js"))
    .map(file => file.path.split("/").pop()!);

  console.error(`Found ${entryFilenames.length} entry files\n`);

  // Fetch all entry files in parallel
  const results = await Promise.all(
    entryFilenames.map(async filename => {
      const content = await fetchText(`${BASE_URL}/${filename}`);
      const size = measureContent(content);
      const components = extractComponentNames(content);
      return { components, size };
    })
  );

  const sizeByComponent = new Map<string, BundleSize>();

  for (const { components, size } of results) {
    if (components.length === 0) {
      continue;
    }

    const primary = pickPrimaryComponent(components);
    sizeByComponent.set(primary, size);
  }

  return sizeByComponent;
}

// - - - - - - - - - - - - - - - - - - - -
//        Chameleon 7 → component map
// - - - - - - - - - - - - - - - - - - - -

const V7_FILENAME_TO_TAG: Record<string, string> = {
  "accordion.lit.js": "ch-accordion-render",
  "combo-box.lit.js": "ch-combo-box-render",
  "tab.lit.js": "ch-tab-render"
};

function v7FilenameToTag(filename: string): string | null {
  if (V7_FILENAME_TO_TAG[filename]) {
    return V7_FILENAME_TO_TAG[filename];
  }

  // Skip utility files — not components
  if (!filename.endsWith(".lit.js")) {
    return null;
  }

  return `ch-${filename.replace(".lit.js", "")}`;
}

function readV7Sizes(): Map<string, BundleSize> {
  const sizeByComponent = new Map<string, BundleSize>();

  let files: string[];
  try {
    files = readdirSync(V7_MINIFIED_DIR);
  } catch {
    console.error(
      `ERROR: Could not read "${V7_MINIFIED_DIR}". Run "npm run build:minified" first.`
    );
    process.exit(1);
  }

  const entryFiles = files.filter(
    f => f.endsWith(".js") && !f.match(/\.[A-Za-z0-9_-]{8}\./)
  );

  for (const filename of entryFiles) {
    const tag = v7FilenameToTag(filename);

    if (tag === null) {
      continue;
    }

    const content = readFileSync(join(V7_MINIFIED_DIR, filename), "utf-8");
    sizeByComponent.set(tag, measureContent(content));
  }

  return sizeByComponent;
}

// - - - - - - - - - - - - - - - - - - - -
//           Table formatting
// - - - - - - - - - - - - - - - - - - - -

function formatBytes(bytes: number): string {
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes} B`;
}

function colorDelta(v6Gzip: number, v7Gzip: number): string {
  const diff = v7Gzip - v6Gzip;
  const pct = ((diff / v6Gzip) * 100).toFixed(1);
  const sign = diff > 0 ? "+" : "";
  const diffStr = `${sign}${formatBytes(Math.abs(diff))}`;
  const pctStr = `${sign}${pct}%`;

  if (diff < 0) {
    return `${GREEN}${diffStr} (${pctStr})${RESET}`;
  }
  if (diff > 0) {
    return `${RED}${diffStr} (${pctStr})${RESET}`;
  }
  return `${DIM}0 B (0.0%)${RESET}`;
}

function padRight(str: string, len: number): string {
  // Strip ANSI codes for length calculation
  const visible = str.replace(/\x1b\[[0-9;]*m/g, "");
  return str + " ".repeat(Math.max(0, len - visible.length));
}

function padLeft(str: string, len: number): string {
  const visible = str.replace(/\x1b\[[0-9;]*m/g, "");
  return " ".repeat(Math.max(0, len - visible.length)) + str;
}

// Box-drawing constants
const TL = "┌";
const TR = "┐";
const BL = "└";
const BR = "┘";
const H = "─";
const V = "│";
const TJ = "┬"; // top join
const BJ = "┴"; // bottom join
const LJ = "├"; // left join
const RJ = "┤"; // right join
const CJ = "┼"; // cross join

type ColWidths = readonly [number, number, number, number];

function hLine(left: string, mid: string, right: string, w: ColWidths): string {
  return left + w.map(colW => H.repeat(colW + 2)).join(mid) + right;
}

function row(
  cols: readonly [string, string, string, string],
  w: ColWidths
): string {
  return (
    `${V} ` +
    [
      padRight(cols[0], w[0]),
      padLeft(cols[1], w[1]),
      padLeft(cols[2], w[2]),
      padLeft(cols[3], w[3])
    ].join(` ${V} `) +
    ` ${V}`
  );
}

function printTable(rows: ComparisonRow[]): void {
  const W: ColWidths = [42, 12, 12, 24];

  const both = rows.filter(r => r.v6 && r.v7);
  const v6Only = rows.filter(r => r.v6 && !r.v7);
  const v7Only = rows.filter(r => !r.v6 && r.v7);

  // ── Shared components ──
  console.log(
    `\n${BOLD}${CYAN} Chameleon 6 vs 7 — Bundle size comparison (gzipped)${RESET}\n`
  );

  console.log(hLine(TL, TJ, TR, W));
  console.log(
    row(
      [
        `${BOLD}Component${RESET}`,
        `${BOLD}v6${RESET}`,
        `${BOLD}v7${RESET}`,
        `${BOLD}Delta${RESET}`
      ],
      W
    )
  );
  console.log(hLine(LJ, CJ, RJ, W));

  let totalV6 = 0;
  let totalV7 = 0;

  for (const r of both) {
    totalV6 += r.v6!.gzipped;
    totalV7 += r.v7!.gzipped;

    console.log(
      row(
        [
          `${WHITE}${r.component}${RESET}`,
          `${DIM}${formatBytes(r.v6!.gzipped)}${RESET}`,
          formatBytes(r.v7!.gzipped),
          colorDelta(r.v6!.gzipped, r.v7!.gzipped)
        ],
        W
      )
    );
  }

  console.log(hLine(LJ, CJ, RJ, W));

  const totalDelta = totalV7 - totalV6;
  const totalColor = totalDelta <= 0 ? BG_GREEN : BG_RED;

  console.log(
    row(
      [
        `${BOLD}TOTAL (${both.length} components)${RESET}`,
        `${DIM}${formatBytes(totalV6)}${RESET}`,
        `${BOLD}${formatBytes(totalV7)}${RESET}`,
        `${totalColor}${BOLD} ${totalDelta > 0 ? "+" : ""}${formatBytes(Math.abs(totalDelta))} (${((totalDelta / totalV6) * 100).toFixed(1)}%) ${RESET}`
      ],
      W
    )
  );

  console.log(hLine(BL, BJ, BR, W));

  // ── v6-only ──
  if (v6Only.length > 0) {
    console.log(
      `\n${DIM} ${v6Only.length} components only in v6 (not yet migrated)${RESET}\n`
    );

    console.log(
      hLine(TL, TJ, TR, [W[0], W[1], 0, 0].slice(0, 2) as unknown as ColWidths)
    );

    for (const r of v6Only) {
      console.log(
        `${V} ${padRight(`${DIM}${r.component}${RESET}`, W[0])} ${V} ${padLeft(`${DIM}${formatBytes(r.v6!.gzipped)}${RESET}`, W[1])} ${V}`
      );
    }

    console.log(
      hLine(BL, BJ, BR, [W[0], W[1], 0, 0].slice(0, 2) as unknown as ColWidths)
    );
  }

  // ── v7-only ──
  if (v7Only.length > 0) {
    console.log(`\n${DIM} ${v7Only.length} components new in v7${RESET}\n`);

    console.log(
      hLine(TL, TJ, TR, [W[0], W[2], 0, 0].slice(0, 2) as unknown as ColWidths)
    );

    for (const r of v7Only) {
      console.log(
        `${V} ${padRight(`${CYAN}${r.component}${RESET}`, W[0])} ${V} ${padLeft(formatBytes(r.v7!.gzipped), W[2])} ${V}`
      );
    }

    console.log(
      hLine(BL, BJ, BR, [W[0], W[2], 0, 0].slice(0, 2) as unknown as ColWidths)
    );
  }

  console.log("");
}

// - - - - - - - - - - - - - - - - - - - -
//                Main
// - - - - - - - - - - - - - - - - - - - -

async function main(): Promise<void> {
  const start = performance.now();

  const [v6Sizes, v7Sizes] = await Promise.all([
    fetchV6Sizes(),
    Promise.resolve(readV7Sizes())
  ]);

  // Filter out irrelevant components
  for (const tag of IGNORED_V6_COMPONENTS) {
    v6Sizes.delete(tag);
  }
  for (const tag of IGNORED_V7_COMPONENTS) {
    v7Sizes.delete(tag);
  }

  // Collect all remaining component tags from both versions
  const allTags = new Set([...v6Sizes.keys(), ...v7Sizes.keys()]);

  const rows: ComparisonRow[] = [...allTags].sort().map(tag => ({
    component: tag,
    v6: v6Sizes.get(tag) ?? null,
    v7: v7Sizes.get(tag) ?? null
  }));

  printTable(rows);

  const elapsed = ((performance.now() - start) / 1000).toFixed(2);
  console.log(`${DIM}Completed in ${elapsed}s${RESET}\n`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

