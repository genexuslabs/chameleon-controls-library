/**
 * Compares Chameleon 6 vs Chameleon 7 bundle sizes per component and total
 * application cost (measured in a real browser via Playwright).
 *
 * Three app variants are measured:
 *   - CH6 (Stencil): Vite-built entry + lazy-loaded Stencil dist files
 *   - CH7 static:    Vite-built single bundle with direct component imports
 *   - CH7 dynamic:   Vite-built code-split app with dynamic imports
 *
 * Usage:
 *   bun run scripts/compare-bundle-sizes.ts
 */

import { exec as execCb } from "child_process";
import { cpSync, existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { createRequire } from "module";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
import { gzipSync, type ZlibOptions } from "zlib";
import { MATCHED_COMPONENTS } from "../src/bundle-size/components.js";

const exec = promisify(execCb);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PKG_ROOT = join(__dirname, "..");
const CHAMELEON_PKG = join(PKG_ROOT, "..", "chameleon");

// - - - - - - - - - - - - - - - - - - - -
//              Constants
// - - - - - - - - - - - - - - - - - - - -

const GZIP_OPTIONS: ZlibOptions = { level: 6 };
const GZIP_HEADER_CRC_OVERHEAD = 311;

const V6_BOOTSTRAP_FILES = ["index.esm.js", "chameleon.esm.js"];

const V7_FILENAME_TO_TAG: Record<string, string> = {
  "accordion.lit.js": "ch-accordion-render",
  "combo-box.lit.js": "ch-combo-box-render",
  "tab.lit.js": "ch-tab-render"
};

// - - - - - - - - - - - - - - - - - - - -
//            ANSI helpers
// - - - - - - - - - - - - - - - - - - - -

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const WHITE = "\x1b[37m";
const BG_GREEN = "\x1b[42m";
const BG_YELLOW = "\x1b[43m";

// - - - - - - - - - - - - - - - - - - - -
//               Types
// - - - - - - - - - - - - - - - - - - - -

interface BundleSize {
  raw: number;
  gzipped: number;
}

interface ComparisonRow {
  component: string;
  v6: BundleSize | null;
  v7: BundleSize | null;
}

interface AppMeasurement {
  gzipped: number;
  raw: number;
  fileCount: number;
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

function extractComponentNames(source: string): string[] {
  const match = source.match(/xport\s*\{([^}]+)\}\s*$/);
  if (!match) {
    return [];
  }
  return [...match[1].matchAll(/as\s+(ch_[a-z0-9_]+)/g)].map(m =>
    m[1].replace(/_/g, "-")
  );
}

function pickPrimaryComponent(components: string[]): string {
  if (components.length === 1) {
    return components[0];
  }
  return (
    components.find(c => c.endsWith("-render")) ??
    [...components].sort((a, b) => a.length - b.length)[0]
  );
}

function extractImports(source: string): string[] {
  const imports = new Set<string>();
  for (const match of source.matchAll(/\bfrom\s*"\.\/([^"]+)"/g)) {
    imports.add(match[1]);
  }
  for (const match of source.matchAll(/\bimport\s*"\.\/([^"]+)"/g)) {
    imports.add(match[1]);
  }
  for (const match of source.matchAll(/\bimport\(\s*"\.\/([^"]+)"\s*\)/g)) {
    imports.add(match[1]);
  }
  return [...imports];
}

function elapsedStr(startMs: number): string {
  return `${((performance.now() - startMs) / 1000).toFixed(1)}s`;
}

function stepDone(msg: string): void {
  console.error(`  ${GREEN}OK${RESET} ${msg}`);
}

function stepStart(msg: string): void {
  console.error(`  ${DIM}...${RESET} ${msg}`);
}

// - - - - - - - - - - - - - - - - - - - -
//        Per-component data (local)
// - - - - - - - - - - - - - - - - - - - -

function readV6PerComponent(): Map<string, BundleSize> {
  const require = createRequire(import.meta.url);
  const ch6PkgJson = require.resolve(
    "@genexus/chameleon-controls-library/package.json"
  );
  const distDir = join(dirname(ch6PkgJson), "dist", "chameleon");

  const matchedSet = new Set(MATCHED_COMPONENTS as readonly string[]);
  const sizeByComponent = new Map<string, BundleSize>();

  for (const entryFile of readdirSync(distDir).filter(f =>
    f.endsWith(".entry.js")
  )) {
    const content = readFileSync(join(distDir, entryFile), "utf-8");
    const components = extractComponentNames(content);
    if (components.length === 0) {
      continue;
    }
    const primary = pickPrimaryComponent(components);
    if (matchedSet.has(primary)) {
      sizeByComponent.set(primary, measureContent(content));
    }
  }

  return sizeByComponent;
}

function readV7PerComponent(): Map<string, BundleSize> {
  const distDir = join(CHAMELEON_PKG, "dist", "minified", "browser");
  const matchedSet = new Set(MATCHED_COMPONENTS as readonly string[]);
  const sizeByComponent = new Map<string, BundleSize>();

  let files: string[];
  try {
    files = readdirSync(distDir);
  } catch {
    console.error(
      `ERROR: Could not read "${distDir}". build:minified may have failed.`
    );
    process.exit(1);
  }

  for (const filename of files.filter(f => f.endsWith(".js"))) {
    const tag =
      V7_FILENAME_TO_TAG[filename] ??
      (filename.endsWith(".lit.js")
        ? `ch-${filename.replace(".lit.js", "")}`
        : null);
    if (tag === null || !matchedSet.has(tag)) {
      continue;
    }
    const content = readFileSync(join(distDir, filename), "utf-8");
    sizeByComponent.set(tag, measureContent(content));
  }

  return sizeByComponent;
}

// - - - - - - - - - - - - - - - - - - - -
//      Playwright app cost measurement
// - - - - - - - - - - - - - - - - - - - -

async function startServer(
  dir: string,
  port: number
): Promise<{ url: string; close: () => Promise<void> }> {
  const http = await import("http");
  const sirv = (await import("sirv")).default;
  const compress = (await import("compression")).default;

  const staticHandler = sirv(dir, { dev: false });
  const compressHandler = compress();

  const handler = (
    req: import("http").IncomingMessage,
    res: import("http").ServerResponse
  ) => {
    compressHandler(req, res, () => staticHandler(req, res));
  };

  return new Promise((resolve, reject) => {
    const server = http.createServer(handler);
    server.listen(port, () =>
      resolve({
        url: `http://localhost:${port}/`,
        close: () => new Promise<void>(res => server.close(() => res()))
      })
    );
    server.on("error", reject);
  });
}

async function measureAppInBrowser(
  serverUrl: string,
  htmlFile: string
): Promise<AppMeasurement> {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();

    await page.goto(`${serverUrl}${htmlFile}`, {
      waitUntil: "networkidle",
      timeout: 30_000
    });

    await page.waitForTimeout(3000);

    const origin = new URL(serverUrl).origin;

    return await page.evaluate((serverOrigin: string) => {
      const entries = performance.getEntriesByType(
        "resource"
      ) as PerformanceResourceTiming[];

      const jsEntries = entries.filter(
        e =>
          e.name.startsWith(serverOrigin) &&
          (e.name.endsWith(".js") || e.name.endsWith(".mjs"))
      );

      let gzipped = 0;
      let raw = 0;
      for (const entry of jsEntries) {
        gzipped +=
          entry.encodedBodySize > 0
            ? entry.encodedBodySize
            : entry.transferSize;
        raw += entry.decodedBodySize;
      }

      return { gzipped, raw, fileCount: jsEntries.length };
    }, origin);
  } finally {
    await browser.close();
  }
}

// - - - - - - - - - - - - - - - - - - - -
//      Build orchestration (parallel)
// - - - - - - - - - - - - - - - - - - - -

async function buildCh6App(): Promise<string> {
  const t = performance.now();
  stepStart("Building CH6 app...");
  await exec("bun run build:bundle-size-ch6", { cwd: PKG_ROOT });

  const ch6Dir = join(PKG_ROOT, "dist-bundle-size-ch6");
  const require = createRequire(import.meta.url);
  const ch6PkgJson = require.resolve(
    "@genexus/chameleon-controls-library/package.json"
  );
  cpSync(
    join(dirname(ch6PkgJson), "dist", "chameleon"),
    join(ch6Dir, "assets"),
    { recursive: true }
  );

  stepDone(`CH6 app (${elapsedStr(t)})`);
  return ch6Dir;
}

async function buildCh7StaticApp(): Promise<string> {
  const t = performance.now();
  stepStart("Building CH7 static app...");
  await exec("bun run build:bundle-size-ch7", { cwd: PKG_ROOT });
  stepDone(`CH7 static app (${elapsedStr(t)})`);
  return join(PKG_ROOT, "dist-bundle-size-ch7");
}

async function buildCh7DynamicApp(): Promise<string | null> {
  const t = performance.now();
  stepStart("Building CH7 dynamic app...");
  try {
    await exec("bun run build:bundle-size-ch7-dynamic", { cwd: PKG_ROOT });
    stepDone(`CH7 dynamic app (${elapsedStr(t)})`);
    return join(PKG_ROOT, "dist-bundle-size-ch7-dynamic");
  } catch {
    console.error(`  ${YELLOW}!${RESET} CH7 dynamic build failed (source errors). Skipping.`);
    return null;
  }
}

async function buildCh7Minified(): Promise<void> {
  const t = performance.now();
  stepStart("Building CH7 minified (per-component)...");
  await exec("bun run build:minified", { cwd: CHAMELEON_PKG });
  stepDone(`CH7 minified (${elapsedStr(t)})`);
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

/** Formats delta: green for improvements, yellow for regressions, dim for neutral */
function colorDelta(base: number, current: number): string {
  const diff = current - base;
  const pct = ((diff / base) * 100).toFixed(1);
  const sign = diff > 0 ? "+" : "";
  const diffStr = `${sign}${formatBytes(Math.abs(diff))}`;
  const pctStr = `${sign}${pct}%`;

  if (diff < 0) {
    return `${GREEN}${diffStr} (${pctStr})${RESET}`;
  }
  if (diff > 0) {
    return `${YELLOW}${diffStr} (${pctStr})${RESET}`;
  }
  return `${DIM}0 B (0.0%)${RESET}`;
}

/** Formats the summary delta with background color */
function colorSummaryDelta(base: number, current: number): string {
  const diff = current - base;
  const pct = ((diff / base) * 100).toFixed(1);
  const sign = diff > 0 ? "+" : "";
  const color = diff <= 0 ? BG_GREEN : BG_YELLOW;
  return `${color}${BOLD} ${sign}${formatBytes(Math.abs(diff))} (${sign}${pct}%) ${RESET}`;
}

function padRight(str: string, len: number): string {
  const visible = str.replace(/\x1b\[[0-9;]*m/g, "");
  return str + " ".repeat(Math.max(0, len - visible.length));
}

function padLeft(str: string, len: number): string {
  const visible = str.replace(/\x1b\[[0-9;]*m/g, "");
  return " ".repeat(Math.max(0, len - visible.length)) + str;
}

const TL = "┌";
const TR = "┐";
const BL = "└";
const BR = "┘";
const H = "─";
const VL = "│";
const TJ = "┬";
const BJ = "┴";
const LJ = "├";
const RJ = "┤";
const CJ = "┼";

function hLine(left: string, mid: string, right: string, w: number[]): string {
  return left + w.map(colW => H.repeat(colW + 2)).join(mid) + right;
}

function tableRow(cols: string[], w: number[]): string {
  const cells = cols.map((col, i) =>
    i === 0 ? padRight(col, w[i]) : padLeft(col, w[i])
  );
  return `${VL} ${cells.join(` ${VL} `)} ${VL}`;
}

// - - - - - - - - - - - - - - - - - - - -
//           Print all tables
// - - - - - - - - - - - - - - - - - - - -

function printAllResults(
  rows: ComparisonRow[],
  ch6App: AppMeasurement,
  ch7Static: AppMeasurement,
  ch7Dynamic: AppMeasurement | null
): void {
  const both = rows.filter(r => r.v6 && r.v7);
  const W4 = [42, 12, 12, 24];

  // ── Table 1: Per-component ──
  console.log(
    `\n${BOLD}${CYAN} Chameleon 6 vs 7 — Per-component entry size (gzipped)${RESET}\n`
  );

  console.log(hLine(TL, TJ, TR, W4));
  console.log(
    tableRow(
      [
        `${BOLD}Component${RESET}`,
        `${BOLD}v6${RESET}`,
        `${BOLD}v7${RESET}`,
        `${BOLD}Delta${RESET}`
      ],
      W4
    )
  );
  console.log(hLine(LJ, CJ, RJ, W4));

  let totalV6 = 0;
  let totalV7 = 0;

  for (const r of both) {
    totalV6 += r.v6!.gzipped;
    totalV7 += r.v7!.gzipped;

    console.log(
      tableRow(
        [
          `${WHITE}${r.component}${RESET}`,
          `${DIM}${formatBytes(r.v6!.gzipped)}${RESET}`,
          formatBytes(r.v7!.gzipped),
          colorDelta(r.v6!.gzipped, r.v7!.gzipped)
        ],
        W4
      )
    );
  }

  console.log(hLine(LJ, CJ, RJ, W4));

  console.log(
    tableRow(
      [
        `${BOLD}TOTAL (${both.length} components)${RESET}`,
        `${DIM}${formatBytes(totalV6)}${RESET}`,
        `${BOLD}${formatBytes(totalV7)}${RESET}`,
        colorSummaryDelta(totalV6, totalV7)
      ],
      W4
    )
  );

  console.log(hLine(BL, BJ, BR, W4));

  // ── Table 2: App cost (Playwright, gzipped) ──
  const W5 = [32, 12, 14, 14, 22];

  console.log(
    `\n${BOLD}${CYAN} Application cost — real browser download${RESET}\n`
  );

  console.log(hLine(TL, TJ, TR, W5));
  console.log(
    tableRow(
      [
        `${BOLD}Metric${RESET}`,
        `${BOLD}v6${RESET}`,
        `${BOLD}v7 static${RESET}`,
        `${BOLD}v7 dynamic${RESET}`,
        `${BOLD}v6 vs v7 static${RESET}`
      ],
      W5
    )
  );
  console.log(hLine(LJ, CJ, RJ, W5));

  console.log(
    tableRow(
      [
        "Transferred (gzip)",
        `${DIM}${formatBytes(ch6App.gzipped)}${RESET}`,
        formatBytes(ch7Static.gzipped),
        ch7Dynamic ? formatBytes(ch7Dynamic.gzipped) : `${DIM}n/a${RESET}`,
        colorSummaryDelta(ch6App.gzipped, ch7Static.gzipped)
      ],
      W5
    )
  );

  console.log(
    tableRow(
      [
        "Resources (raw)",
        `${DIM}${formatBytes(ch6App.raw)}${RESET}`,
        formatBytes(ch7Static.raw),
        ch7Dynamic ? formatBytes(ch7Dynamic.raw) : `${DIM}n/a${RESET}`,
        colorDelta(ch6App.raw, ch7Static.raw)
      ],
      W5
    )
  );

  console.log(
    tableRow(
      [
        `${DIM}JS files${RESET}`,
        `${DIM}${ch6App.fileCount}${RESET}`,
        `${ch7Static.fileCount}`,
        ch7Dynamic ? `${ch7Dynamic.fileCount}` : `${DIM}n/a${RESET}`,
        ""
      ],
      W5
    )
  );

  console.log(hLine(BL, BJ, BR, W5));
  console.log("");
}

// - - - - - - - - - - - - - - - - - - - -
//                Main
// - - - - - - - - - - - - - - - - - - - -

async function buildAndMeasureCh6(): Promise<AppMeasurement> {
  const ch6Dir = await buildCh6App();
  const server = await startServer(ch6Dir, 4180);
  try {
    const result = await measureAppInBrowser(
      server.url,
      "bundle-size-ch6.html"
    );
    stepDone(
      `CH6: ${formatBytes(result.gzipped)} gzip, ${formatBytes(result.raw)} raw`
    );
    writeCh6Cache(result);
    return result;
  } finally {
    await server.close();
  }
}

const CH6_CACHE_FILE = join(PKG_ROOT, ".ch6-measurement-cache.json");

function readCh6Cache(): AppMeasurement | null {
  try {
    if (!existsSync(CH6_CACHE_FILE)) {
      return null;
    }
    return JSON.parse(readFileSync(CH6_CACHE_FILE, "utf-8")) as AppMeasurement;
  } catch {
    return null;
  }
}

function writeCh6Cache(result: AppMeasurement): void {
  writeFileSync(CH6_CACHE_FILE, JSON.stringify(result), "utf-8");
}

async function main(): Promise<void> {
  const start = performance.now();
  const skipCh6 = process.argv.includes("--skip-ch6");

  console.error(`\n${BOLD} Building apps...${RESET}\n`);

  // CH7 builds always run
  const ch7StaticPromise = buildCh7StaticApp();
  const ch7DynamicPromise = buildCh7DynamicApp();
  const ch7MinifiedPromise = buildCh7Minified();

  // CH6 build + measurement: skip if --skip-ch6 and cache exists
  let ch6MeasurePromise: Promise<AppMeasurement>;

  if (skipCh6) {
    const cached = readCh6Cache();
    if (cached) {
      stepDone(
        `CH6 cached: ${formatBytes(cached.gzipped)} gzip, ${formatBytes(cached.raw)} raw`
      );
      ch6MeasurePromise = Promise.resolve(cached);
    } else {
      console.error(
        `  ${YELLOW}!${RESET} No CH6 cache found, building anyway...`
      );
      ch6MeasurePromise = buildAndMeasureCh6();
    }
  } else {
    ch6MeasurePromise = buildAndMeasureCh6();
  }

  console.error(`\n${BOLD} Measuring in Chromium...${RESET}\n`);

  // Measure CH7 variants as their builds complete
  const ch7StaticMeasurePromise = ch7StaticPromise.then(async ch7Dir => {
    const server = await startServer(ch7Dir, 4181);
    try {
      const result = await measureAppInBrowser(
        server.url,
        "bundle-size-ch7.html"
      );
      stepDone(
        `CH7 static: ${formatBytes(result.gzipped)} gzip, ${formatBytes(result.raw)} raw`
      );
      return result;
    } finally {
      await server.close();
    }
  });

  const ch7DynamicMeasurePromise = ch7DynamicPromise.then(async ch7DynDir => {
    if (!ch7DynDir) {
      return null;
    }
    const server = await startServer(ch7DynDir, 4182);
    try {
      const result = await measureAppInBrowser(
        server.url,
        "bundle-size-ch7-dynamic.html"
      );
      stepDone(
        `CH7 dynamic: ${formatBytes(result.gzipped)} gzip, ${formatBytes(result.raw)} raw`
      );
      return result;
    } finally {
      await server.close();
    }
  });

  // Per-component data after build:minified
  await ch7MinifiedPromise;
  const v6PerComponent = readV6PerComponent();
  const v7PerComponent = readV7PerComponent();

  const [ch6App, ch7Static, ch7Dynamic] = await Promise.all([
    ch6MeasurePromise,
    ch7StaticMeasurePromise,
    ch7DynamicMeasurePromise
  ]);

  // Build per-component rows
  const allTags = new Set([
    ...v6PerComponent.keys(),
    ...v7PerComponent.keys()
  ]);

  const rows: ComparisonRow[] = [...allTags].sort().map(tag => ({
    component: tag,
    v6: v6PerComponent.get(tag) ?? null,
    v7: v7PerComponent.get(tag) ?? null
  }));

  // Print everything at the end
  printAllResults(rows, ch6App, ch7Static, ch7Dynamic);

  console.log(`${DIM}Done in ${elapsedStr(start)}${RESET}\n`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
