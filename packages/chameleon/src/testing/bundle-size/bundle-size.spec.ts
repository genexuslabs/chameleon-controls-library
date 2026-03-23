import { readFile, readdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { describe, expect, test } from "vitest";

import { MINIFIED_ENTRIES, MINIFIED_OUTPUT_DIR } from "./entries";
import { EXPECTED_SIZES } from "./expected-sizes";
import { getGzipSize } from "./get-gzip-size";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, "../../../", MINIFIED_OUTPUT_DIR);

// Known entry filenames — anything else is a shared chunk
const ENTRY_FILENAMES = new Set(MINIFIED_ENTRIES.map(e => e.outputName));

// The app-entry script produced by Vite from the HTML input
const APP_ENTRY = "app-entry.js";

const formatBytes = (bytes: number) =>
  bytes >= 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`;

async function readContent(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, "utf-8");
  } catch {
    throw new Error(
      `Could not read "${filePath}". ` +
        `Run "npm run build:minified" before running bundle-size tests.`
    );
  }
}

/**
 * Reads all .js files in the dist directory and classifies them as entry
 * chunks or shared chunks.
 */
async function readAllChunks(): Promise<{
  entries: Map<string, string>;
  shared: Map<string, string>;
}> {
  let allFiles: string[];
  try {
    allFiles = await readdir(DIST_DIR, { recursive: true }) as string[];
  } catch {
    throw new Error(
      `Could not read "${DIST_DIR}". Run "npm run build:minified" first.`
    );
  }

  const jsFiles = allFiles.filter(
    f => f.endsWith(".js") && !f.includes("src/")
  );

  const entries = new Map<string, string>();
  const shared = new Map<string, string>();

  for (const file of jsFiles) {
    const basename = file.split("/").pop()!;
    const content = await readFile(join(DIST_DIR, file), "utf-8");

    if (ENTRY_FILENAMES.has(basename)) {
      entries.set(basename, content);
    } else if (basename !== APP_ENTRY) {
      shared.set(file, content);
    }
  }

  return { entries, shared };
}

// - - - - - - - - - - - - - - - - - - - -
//       Per-component entry chunks
// - - - - - - - - - - - - - - - - - - - -

MINIFIED_ENTRIES.forEach(({ outputName }) => {
  const expected = EXPECTED_SIZES.entries[outputName];

  describe(`[bundle-size] ${outputName}`, () => {
    test(`RAW size should be exactly ${formatBytes(expected.raw)}`, async () => {
      const content = await readContent(join(DIST_DIR, outputName));
      const currentSize = new Blob([content]).size;

      if (currentSize !== expected.raw) {
        throw new Error(
          `The raw size of "${outputName}" changed to ${formatBytes(currentSize)} ` +
            `(expected: ${formatBytes(expected.raw)}, diff: ${currentSize > expected.raw ? "+" : ""}${formatBytes(Math.abs(currentSize - expected.raw))}). ` +
            `If this is intended, update the expected size in ` +
            `"src/testing/bundle-size/expected-sizes.ts".`
        );
      }

      expect(currentSize).toBe(expected.raw);
    });

    test(`GZIPPED size should be exactly ${formatBytes(expected.gzipped)}`, async () => {
      const content = await readContent(join(DIST_DIR, outputName));
      const currentSize = getGzipSize(content);

      if (currentSize !== expected.gzipped) {
        throw new Error(
          `The gzipped size of "${outputName}" changed to ${formatBytes(currentSize)} ` +
            `(expected: ${formatBytes(expected.gzipped)}, diff: ${currentSize > expected.gzipped ? "+" : ""}${formatBytes(Math.abs(currentSize - expected.gzipped))}). ` +
            `If this is intended, update the expected size in ` +
            `"src/testing/bundle-size/expected-sizes.ts".`
        );
      }

      expect(currentSize).toBe(expected.gzipped);
    });
  });
});

// - - - - - - - - - - - - - - - - - - - -
//         Shared dependencies total
// - - - - - - - - - - - - - - - - - - - -

describe("[bundle-size] Shared dependencies", () => {
  test(`total RAW size should be exactly ${formatBytes(EXPECTED_SIZES.sharedTotal.raw)}`, async () => {
    const { shared } = await readAllChunks();

    let totalRaw = 0;
    for (const content of shared.values()) {
      totalRaw += new Blob([content]).size;
    }

    if (totalRaw !== EXPECTED_SIZES.sharedTotal.raw) {
      throw new Error(
        `Shared dependencies RAW total changed to ${formatBytes(totalRaw)} ` +
          `(expected: ${formatBytes(EXPECTED_SIZES.sharedTotal.raw)}). ` +
          `If this is intended, update sharedTotal in "src/testing/bundle-size/expected-sizes.ts".`
      );
    }

    expect(totalRaw).toBe(EXPECTED_SIZES.sharedTotal.raw);
  });

  test(`total GZIPPED size should be exactly ${formatBytes(EXPECTED_SIZES.sharedTotal.gzipped)}`, async () => {
    const { shared } = await readAllChunks();

    let totalGzipped = 0;
    for (const content of shared.values()) {
      totalGzipped += getGzipSize(content);
    }

    if (totalGzipped !== EXPECTED_SIZES.sharedTotal.gzipped) {
      throw new Error(
        `Shared dependencies GZIPPED total changed to ${formatBytes(totalGzipped)} ` +
          `(expected: ${formatBytes(EXPECTED_SIZES.sharedTotal.gzipped)}). ` +
          `If this is intended, update sharedTotal in "src/testing/bundle-size/expected-sizes.ts".`
      );
    }

    expect(totalGzipped).toBe(EXPECTED_SIZES.sharedTotal.gzipped);
  });
});

// - - - - - - - - - - - - - - - - - - - -
//         Total application cost
// - - - - - - - - - - - - - - - - - - - -

describe("[bundle-size] Total application cost", () => {
  test(`total RAW size should be exactly ${formatBytes(EXPECTED_SIZES.appTotal.raw)}`, async () => {
    const { entries, shared } = await readAllChunks();

    let totalRaw = 0;
    for (const content of entries.values()) {
      totalRaw += new Blob([content]).size;
    }
    for (const content of shared.values()) {
      totalRaw += new Blob([content]).size;
    }

    if (totalRaw !== EXPECTED_SIZES.appTotal.raw) {
      throw new Error(
        `Total app RAW cost changed to ${formatBytes(totalRaw)} ` +
          `(expected: ${formatBytes(EXPECTED_SIZES.appTotal.raw)}). ` +
          `If this is intended, update appTotal in "src/testing/bundle-size/expected-sizes.ts".`
      );
    }

    expect(totalRaw).toBe(EXPECTED_SIZES.appTotal.raw);
  });

  test(`total GZIPPED size should be exactly ${formatBytes(EXPECTED_SIZES.appTotal.gzipped)}`, async () => {
    const { entries, shared } = await readAllChunks();

    let totalGzipped = 0;
    for (const content of entries.values()) {
      totalGzipped += getGzipSize(content);
    }
    for (const content of shared.values()) {
      totalGzipped += getGzipSize(content);
    }

    if (totalGzipped !== EXPECTED_SIZES.appTotal.gzipped) {
      throw new Error(
        `Total app GZIPPED cost changed to ${formatBytes(totalGzipped)} ` +
          `(expected: ${formatBytes(EXPECTED_SIZES.appTotal.gzipped)}). ` +
          `If this is intended, update appTotal in "src/testing/bundle-size/expected-sizes.ts".`
      );
    }

    expect(totalGzipped).toBe(EXPECTED_SIZES.appTotal.gzipped);
  });
});
