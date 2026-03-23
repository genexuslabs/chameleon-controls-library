import { readdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { Plugin } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Matches a SCREAMING_SNAKE_CASE property access on an identifier:
 * `IDENTIFIER.UPPER_KEY`
 *
 * Captures:
 *   [1] = identifier name (e.g., CHECKBOX_PARTS_DICTIONARY)
 *   [2] = property key (e.g., CONTAINER)
 */
const PROPERTY_ACCESS_PATTERN =
  /\b([A-Z][A-Z0-9_]*_PARTS_DICTIONARY)\s*\.\s*([A-Z][A-Z0-9_]*)\b/g;

// - - - - - - - - - - - - - - - - - - - -
//        Core transform (exported for testing)
// - - - - - - - - - - - - - - - - - - - -

/** Map of dictionary name → (key → resolved string value) */
export type DictionaryValues = ReadonlyMap<
  string,
  ReadonlyMap<string, string>
>;

/**
 * Transforms property accesses on annotated dictionaries into standalone
 * const declarations initialized with the literal string value.
 *
 * Example:
 *   CHECKBOX_PARTS_DICTIONARY.CONTAINER  →  const __X = "container"; ... __X
 *
 * The dictionary object is preserved for object-level usages
 * (joinParts, re-exports, spreads).
 *
 * @param code - The module source code
 * @param dictValues - Resolved dictionary values from the discovery phase
 * @returns The transformed code, or `null` if no changes were made
 */
export function transformDictionaryAccesses(
  code: string,
  dictValues: DictionaryValues
): string | null {
  // Quick bail: check if any known dictionary name appears with a dot access
  let hasMatch = false;
  for (const name of dictValues.keys()) {
    if (code.includes(`${name}.`)) {
      hasMatch = true;
      break;
    }
  }
  if (!hasMatch) {
    return null;
  }

  // Collect all unique DICT.KEY pairs that we can resolve
  const accesses = new Map<string, Set<string>>();

  for (const match of code.matchAll(PROPERTY_ACCESS_PATTERN)) {
    const dictName = match[1];
    const key = match[2];

    const values = dictValues.get(dictName);
    if (!values || !values.has(key)) {
      continue;
    }

    let keys = accesses.get(dictName);
    if (!keys) {
      keys = new Set();
      accesses.set(dictName, keys);
    }
    keys.add(key);
  }

  if (accesses.size === 0) {
    return null;
  }

  // Generate const declarations with the resolved literal values
  const declarations: string[] = [];

  for (const [dictName, keys] of accesses) {
    const values = dictValues.get(dictName)!;

    for (const key of keys) {
      const constName = `__${dictName}_${key}`;
      const value = values.get(key)!;
      declarations.push(`const ${constName}="${value}";`);
    }
  }

  // Replace all DICT.KEY accesses with the const name
  let result = code;

  for (const [dictName, keys] of accesses) {
    for (const key of keys) {
      const constName = `__${dictName}_${key}`;
      const pattern = new RegExp(
        `\\b${dictName}\\s*\\.\\s*${key}\\b`,
        "g"
      );
      result = result.replace(pattern, constName);
    }
  }

  // Insert declarations after the last import statement, or at the top
  const insertionPoint = findInsertionPoint(result);
  const declarationBlock = "\n" + declarations.join("\n") + "\n";

  result =
    result.slice(0, insertionPoint) +
    declarationBlock +
    result.slice(insertionPoint);

  return result;
}

/**
 * Finds the position after the last top-level import statement.
 * Returns 0 if no imports are found.
 */
function findInsertionPoint(code: string): number {
  const importPattern = /^import\s.+?(?:from\s+)?["'][^"']+["'];?\s*$/gm;

  let lastImportEnd = 0;
  for (const match of code.matchAll(importPattern)) {
    const end = match.index! + match[0].length;
    if (end > lastImportEnd) {
      lastImportEnd = end;
    }
  }

  return lastImportEnd;
}

// - - - - - - - - - - - - - - - - - - - -
//        Discovery
// - - - - - - - - - - - - - - - - - - - -

/**
 * Pattern to extract key-value pairs from a dictionary definition.
 * Matches: KEY: "value" or KEY: 'value'
 */
const KEY_VALUE_PATTERN = /\b([A-Z][A-Z0-9_]*)\s*:\s*["']([^"']+)["']/g;

/**
 * Scans the parts directory for dictionaries annotated with `/*# INLINE #*​/`.
 * Reads and resolves the literal string values for each key.
 *
 * Returns a map of dictName → (key → value).
 */
function discoverAnnotatedDictionaries(
  partsDir: string
): Map<string, Map<string, string>> {
  const result = new Map<string, Map<string, string>>();

  let files: string[];
  try {
    files = readdirSync(partsDir).filter(f => f.endsWith(".ts"));
  } catch {
    return result;
  }

  // Find /*# INLINE #*/ followed by export const NAME = { ... } as const;
  // and extract all KEY: "value" pairs from the object literal
  const annotationPattern =
    /\/\*\s*#INLINE#\s*\*\/\s*\n\s*export\s+const\s+([A-Z][A-Z0-9_]*)\s*=\s*\{([^}]+)\}/g;

  for (const file of files) {
    const content = readFileSync(join(partsDir, file), "utf-8");

    for (const dictMatch of content.matchAll(annotationPattern)) {
      const dictName = dictMatch[1];
      const body = dictMatch[2];

      const values = new Map<string, string>();

      for (const kvMatch of body.matchAll(KEY_VALUE_PATTERN)) {
        values.set(kvMatch[1], kvMatch[2]);
      }

      if (values.size > 0) {
        result.set(dictName, values);
      }
    }
  }

  return result;
}

// - - - - - - - - - - - - - - - - - - - -
//        Vite plugin
// - - - - - - - - - - - - - - - - - - - -

/**
 * Vite plugin that optimizes dictionary property accesses.
 *
 * Dictionaries annotated with `/*# INLINE #*​/` have their `.KEY` property
 * accesses replaced with standalone const declarations initialized with the
 * literal string value. This allows Terser to minify variable names.
 *
 * Runs as a `transform` hook AFTER TypeScript compilation, BEFORE Terser.
 */
export function optimizeDictionaryAccessesPlugin(): Plugin {
  let dictValues: DictionaryValues;

  return {
    name: "optimize-dictionary-accesses",
    apply: "build",

    buildStart() {
      const partsDir = join(
        __dirname,
        "src",
        "utilities",
        "reserved-names",
        "parts"
      );
      dictValues = discoverAnnotatedDictionaries(partsDir);

      if (dictValues.size > 0) {
        let totalKeys = 0;
        for (const values of dictValues.values()) {
          totalKeys += values.size;
        }
        console.log(
          `[optimize-dictionary-accesses] ${dictValues.size} dictionaries, ${totalKeys} keys`
        );
      }
    },

    transform(code, _id) {
      if (!dictValues || dictValues.size === 0) {
        return null;
      }

      const result = transformDictionaryAccesses(code, dictValues);
      if (result === null) {
        return null;
      }

      return { code: result, map: null };
    }
  };
}

export default optimizeDictionaryAccessesPlugin;
