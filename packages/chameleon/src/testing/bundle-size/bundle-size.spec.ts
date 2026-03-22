import { readFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { describe, expect, test } from "vitest";

import { MINIFIED_ENTRIES, MINIFIED_OUTPUT_DIR } from "./entries";
import { EXPECTED_SIZES } from "./expected-sizes";
import { getGzipSize } from "./get-gzip-size";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Root of the minified bundle output. Each entry's `outputName` maps to a
 * flat `.js` file in this directory. Run `npm run build:minified` before
 * executing these tests.
 */
const DIST_DIR = join(__dirname, "../../../", MINIFIED_OUTPUT_DIR);

const getBundleFilePath = (outputName: string) =>
  join(DIST_DIR, outputName);

const formatBytes = (bytes: number) =>
  bytes >= 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${bytes} B`;

MINIFIED_ENTRIES.forEach(({ outputName }) => {
  const expected = EXPECTED_SIZES[outputName];

  describe(`[bundle-size] ${outputName}`, () => {
    test(`RAW size should be at most ${formatBytes(expected.raw)}`, async () => {
      const filePath = getBundleFilePath(outputName);

      let content: string;
      try {
        content = await readFile(filePath, "utf-8");
      } catch {
        throw new Error(
          `Could not read "${filePath}". ` +
            `Run "npm run build:minified" before running bundle-size tests.`
        );
      }

      const currentSize = new Blob([content]).size;

      if (currentSize > expected.raw) {
        throw new Error(
          `The raw size of "${outputName}" increased by ${formatBytes(currentSize - expected.raw)} ` +
            `(${formatBytes(currentSize)} now, limit: ${formatBytes(expected.raw)}). ` +
            `If this is intended, update the expected size in ` +
            `"src/testing/bundle-size/expected-sizes.ts".`
        );
      }

      expect(currentSize).toBeLessThanOrEqual(expected.raw);
    });

    test(`GZIPPED size should be at most ${formatBytes(expected.gzipped)}`, async () => {
      const filePath = getBundleFilePath(outputName);

      let content: string;
      try {
        content = await readFile(filePath, "utf-8");
      } catch {
        throw new Error(
          `Could not read "${filePath}". ` +
            `Run "npm run build:minified" before running bundle-size tests.`
        );
      }

      const currentSize = getGzipSize(content);

      if (currentSize > expected.gzipped) {
        throw new Error(
          `The gzipped size of "${outputName}" increased by ${formatBytes(currentSize - expected.gzipped)} ` +
            `(${formatBytes(currentSize)} now, limit: ${formatBytes(expected.gzipped)}). ` +
            `If this is intended, update the expected size in ` +
            `"src/testing/bundle-size/expected-sizes.ts".`
        );
      }

      expect(currentSize).toBeLessThanOrEqual(expected.gzipped);
    });
  });
});
