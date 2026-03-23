import { describe, expect, test } from "vitest";
import {
  transformDictionaryAccesses,
  type DictionaryValues
} from "../../optimize-dictionary-accesses";

// Simulated resolved dictionary values (as the discovery phase would produce)
const DICT_VALUES: DictionaryValues = new Map([
  [
    "MY_PARTS_DICTIONARY",
    new Map([
      ["CONTAINER", "container"],
      ["DISABLED", "disabled"],
      ["KEY", "key"],
      ["A", "a-value"],
      ["B", "b-value"],
      ["LEVEL_2", "level-2"]
    ])
  ],
  [
    "OTHER_PARTS_DICTIONARY",
    new Map([
      ["B", "other-b"]
    ])
  ]
]);

describe("[optimize-dictionary-accesses] transformDictionaryAccesses", () => {
  // - - - - - - - - - - - - - - - - - - - -
  //        Basic transformations
  // - - - - - - - - - - - - - - - - - - - -

  test("extracts a property access into a const with the literal value", () => {
    const input = `f(MY_PARTS_DICTIONARY.CONTAINER);`;
    const result = transformDictionaryAccesses(input, DICT_VALUES)!;

    // Const initialized with the literal value, not a runtime access
    expect(result).toContain('const __MY_PARTS_DICTIONARY_CONTAINER="container";');
    expect(result).toContain("f(__MY_PARTS_DICTIONARY_CONTAINER)");
  });

  test("reuses the same const for repeated accesses", () => {
    const input = `f(MY_PARTS_DICTIONARY.KEY); g(MY_PARTS_DICTIONARY.KEY);`;
    const result = transformDictionaryAccesses(input, DICT_VALUES)!;

    const declarations = result.match(/const __MY_PARTS_DICTIONARY_KEY=/g);
    expect(declarations).toHaveLength(1);

    expect(result).toContain("f(__MY_PARTS_DICTIONARY_KEY)");
    expect(result).toContain("g(__MY_PARTS_DICTIONARY_KEY)");
  });

  test("handles multiple keys from the same dictionary", () => {
    const input = `f(MY_PARTS_DICTIONARY.A); g(MY_PARTS_DICTIONARY.B);`;
    const result = transformDictionaryAccesses(input, DICT_VALUES)!;

    expect(result).toContain('const __MY_PARTS_DICTIONARY_A="a-value";');
    expect(result).toContain('const __MY_PARTS_DICTIONARY_B="b-value";');
  });

  test("handles multiple dictionaries in the same file", () => {
    const input = `f(MY_PARTS_DICTIONARY.A); g(OTHER_PARTS_DICTIONARY.B);`;
    const result = transformDictionaryAccesses(input, DICT_VALUES)!;

    expect(result).toContain('const __MY_PARTS_DICTIONARY_A="a-value";');
    expect(result).toContain('const __OTHER_PARTS_DICTIONARY_B="other-b";');
  });

  // - - - - - - - - - - - - - - - - - - - -
  //        Object-level refs preserved
  // - - - - - - - - - - - - - - - - - - - -

  test("preserves object passed to a function", () => {
    const input = `joinParts(MY_PARTS_DICTIONARY);`;
    const result = transformDictionaryAccesses(input, DICT_VALUES);

    expect(result).toBeNull();
  });

  test("preserves export of dictionary", () => {
    const input = `export { MY_PARTS_DICTIONARY };`;
    const result = transformDictionaryAccesses(input, DICT_VALUES);

    expect(result).toBeNull();
  });

  test("transforms accesses while preserving object-level refs", () => {
    const input = [
      `f(MY_PARTS_DICTIONARY.KEY);`,
      `joinParts(MY_PARTS_DICTIONARY);`
    ].join("\n");

    const result = transformDictionaryAccesses(input, DICT_VALUES)!;

    expect(result).toContain("f(__MY_PARTS_DICTIONARY_KEY)");
    expect(result).toContain("joinParts(MY_PARTS_DICTIONARY)");
  });

  // - - - - - - - - - - - - - - - - - - - -
  //        Expression contexts
  // - - - - - - - - - - - - - - - - - - - -

  test("transforms inside template literals", () => {
    const input = "const x = `${MY_PARTS_DICTIONARY.KEY} value`;";
    const result = transformDictionaryAccesses(input, DICT_VALUES)!;

    expect(result).toContain("`${__MY_PARTS_DICTIONARY_KEY} value`");
  });

  test("transforms computed property names", () => {
    const input = `({ [MY_PARTS_DICTIONARY.KEY]: true });`;
    const result = transformDictionaryAccesses(input, DICT_VALUES)!;

    expect(result).toContain("[__MY_PARTS_DICTIONARY_KEY]: true");
  });

  test("transforms ternary expressions", () => {
    const input = `flag ? MY_PARTS_DICTIONARY.A : MY_PARTS_DICTIONARY.B;`;
    const result = transformDictionaryAccesses(input, DICT_VALUES)!;

    expect(result).toContain(
      "flag ? __MY_PARTS_DICTIONARY_A : __MY_PARTS_DICTIONARY_B"
    );
  });

  // - - - - - - - - - - - - - - - - - - - -
  //        No-op cases
  // - - - - - - - - - - - - - - - - - - - -

  test("returns null for code without dictionary access", () => {
    const result = transformDictionaryAccesses(
      `const x = 42;`,
      DICT_VALUES
    );
    expect(result).toBeNull();
  });

  test("ignores non-annotated dictionaries", () => {
    const result = transformDictionaryAccesses(
      `f(UNKNOWN_PARTS_DICTIONARY.KEY);`,
      DICT_VALUES
    );
    expect(result).toBeNull();
  });

  test("ignores lowercase property keys", () => {
    const result = transformDictionaryAccesses(
      `MY_PARTS_DICTIONARY.toLowerCase();`,
      DICT_VALUES
    );
    expect(result).toBeNull();
  });

  test("ignores keys not in the dictionary values", () => {
    const result = transformDictionaryAccesses(
      `MY_PARTS_DICTIONARY.NONEXISTENT;`,
      DICT_VALUES
    );
    expect(result).toBeNull();
  });

  // - - - - - - - - - - - - - - - - - - - -
  //        Insertion point
  // - - - - - - - - - - - - - - - - - - - -

  test("inserts consts after the last import statement", () => {
    const input = [
      `import { something } from "module";`,
      `import { MY_PARTS_DICTIONARY } from "parts";`,
      ``,
      `f(MY_PARTS_DICTIONARY.KEY);`
    ].join("\n");

    const result = transformDictionaryAccesses(input, DICT_VALUES)!;

    const constPos = result.indexOf('const __MY_PARTS_DICTIONARY_KEY="key"');
    const lastImportPos = result.lastIndexOf("import ");
    const usagePos = result.indexOf("f(__MY_PARTS_DICTIONARY_KEY)");

    expect(constPos).toBeGreaterThan(lastImportPos);
    expect(constPos).toBeLessThan(usagePos);
  });

  test("inserts at top if no imports exist", () => {
    const result = transformDictionaryAccesses(
      `f(MY_PARTS_DICTIONARY.KEY);`,
      DICT_VALUES
    )!;

    expect(result.trimStart()).toMatch(/^const __MY_PARTS_DICTIONARY_KEY/);
  });

  // - - - - - - - - - - - - - - - - - - - -
  //        Same-file definition + access
  // - - - - - - - - - - - - - - - - - - - -

  test("transforms accesses in the same file as the definition", () => {
    const input = [
      `export const MY_PARTS_DICTIONARY = { CONTAINER: "container" };`,
      `const derived = MY_PARTS_DICTIONARY.CONTAINER + "-extra";`
    ].join("\n");

    const result = transformDictionaryAccesses(input, DICT_VALUES)!;

    expect(result).toContain("__MY_PARTS_DICTIONARY_CONTAINER");
    // Dictionary definition preserved
    expect(result).toContain(
      `MY_PARTS_DICTIONARY = { CONTAINER: "container" }`
    );
  });

  // - - - - - - - - - - - - - - - - - - - -
  //        Edge cases
  // - - - - - - - - - - - - - - - - - - - -

  test("handles empty dictionary values", () => {
    const result = transformDictionaryAccesses(
      `f(MY_PARTS_DICTIONARY.KEY);`,
      new Map()
    );
    expect(result).toBeNull();
  });

  test("handles keys with numbers", () => {
    const result = transformDictionaryAccesses(
      `f(MY_PARTS_DICTIONARY.LEVEL_2);`,
      DICT_VALUES
    )!;

    expect(result).toContain('const __MY_PARTS_DICTIONARY_LEVEL_2="level-2"');
  });
});
