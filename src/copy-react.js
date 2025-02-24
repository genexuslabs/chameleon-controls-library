#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { styleText } from "node:util";
import { fileURLToPath } from "url";

const DEFAULT_OUT_DIR = "./src";
const FOLDER_NAME_FOR_WRAPPERS = "chameleon-components";

const ensureDirectoryItsClear = dirPath => {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true });
  }
};

// This is a WA to have __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);

// Directory name where the script is located (<path from root to node_modules/@genexus/chameleon-controls-library>/dist/react/)
const __dirname = path.dirname(__filename);
const directoryWhereTheScriptIsRunning = process.cwd();

const [, , ...args] = process.argv;

let outDir = DEFAULT_OUT_DIR;

if (!args || !args[0]) {
  console.log(
    styleText(
      "yellow",
      "  [warning]: Missing output directory for chameleon components. The directory "
    ) +
      styleText("cyan", `'${DEFAULT_OUT_DIR}'`) +
      styleText("yellow", " will be used as default.")
  );
} else {
  outDir = args[0];
}

const chameleonWrappersDirectory = path.join(
  __dirname,
  FOLDER_NAME_FOR_WRAPPERS
);
const pathToCopyChameleonWrappers = path.join(
  directoryWhereTheScriptIsRunning,
  outDir,
  FOLDER_NAME_FOR_WRAPPERS
);

ensureDirectoryItsClear(pathToCopyChameleonWrappers);

fs.cpSync(chameleonWrappersDirectory, pathToCopyChameleonWrappers, {
  recursive: true
});
