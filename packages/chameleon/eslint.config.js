import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default defineConfig([
  {
    ignores: ["**/node_modules/*", "**/dist/*"],

    files: ["**/*.ts", "**/*.js", "**.*.js"],

    extends: compat.extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/eslint-recommended",
      "plugin:@typescript-eslint/recommended"
    ),

    plugins: {
      "@typescript-eslint": typescriptEslint
    },

    languageOptions: {
      globals: {
        ...globals.browser
      },

      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module"
    },

    rules: {
      // - - - - - - - - - - - -
      // ESLint
      // - - - - - - - - - - - -
      camelcase: "warn", // Enforce camelcase naming convention
      curly: "error", // Enforce consistent brace style for all control statements
      eqeqeq: ["warn", "always", { null: "ignore" }], // Require the use of === and !==   "ignore" -------> Do not apply this rule to null
      "logical-assignment-operators": [
        "warn",
        "always",
        { enforceForIfStatements: true }
      ], // This rule checks for expressions that can be shortened using logical assignment operator
      "dot-notation": "warn", // This rule is aimed at maintaining code consistency and improving code readability by encouraging use of the dot notation style whenever possible. As such, it will warn when it encounters an unnecessary use of square-bracket notation.
      "max-depth": ["warn", 3], // Enforce a maximum depth that blocks can be nested. Many developers consider code difficult to read if blocks are nested beyond a certain depth
      "no-alert": "error", // Disallow the use of alert, confirm, and prompt
      "no-console": "warn", // Warning when using console.log, console.warn or console.error
      "no-else-return": ["warn", { allowElseIf: false }], // Disallow else blocks after return statements in if statements
      "no-extra-boolean-cast": "error", // Disallow unnecessary boolean casts
      "no-debugger": "error", // Error when using debugger;
      "no-duplicate-case": "error", // This rule disallows duplicate test expressions in case clauses of switch statements
      "no-empty": "error", // Disallow empty block statements
      "no-lonely-if": "error", // Disallow if statements as the only statement in else blocks
      "no-multi-assign": "error", // Disallow use of chained assignment expressions
      "no-nested-ternary": "error", // Errors when using nested ternary expressions
      "no-sequences": "error", // Disallow comma operators
      "no-undef": "off", // Allows defining undefined variables
      "no-unneeded-ternary": "error", // Disallow ternary operators when simpler alternatives exist
      "no-useless-return": "error", // Disallow redundant return statements
      "prefer-const": "error",
      "spaced-comment": ["error", "always", { exceptions: ["-", "+", "/"] }], // Enforce consistent spacing after the // or /* in a comment

      "no-prototype-builtins": "off",

      // - - - - - - - - - - - -
      // TypeScript
      // - - - - - - - - - - - -
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-non-null-assertion": "off"

      // "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
    }
  }
]);

