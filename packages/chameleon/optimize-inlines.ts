import type { OutputChunk, Plugin } from "vite";

/**
 * Vite plugin that optimizes template literal expressions after Terser.
 *
 * ## Optimization 1 — Leading string concatenation
 * When Terser inlines a constant into a template expression, it often
 * produces `${"prefix" + expr}`. The string literal can be moved out of
 * the expression and merged into the surrounding template string:
 *
 *     ${"section-" + t}                             →  section-${t}
 *     ${"track" + (this.disabled ? " disabled" : "")}  →  track${this.disabled ? " disabled" : ""}
 *     ${"" + !!this.downloading}                    →  ${!!this.downloading}
 *
 * ## Optimization 2 — Pure string literal expressions
 * An expression that contains only a string literal is redundant — the
 * string can be merged directly into the template:
 *
 *     ${"radio__input"}  →  radio__input
 *     ${'panel'}         →  panel
 *     ${`header`}        →  header
 *
 * Both optimizations are safe inside tagged template literals (like Lit's
 * `html`). Optimization 1 preserves the expression count, only changing
 * the static prefix. Optimization 2 removes one binding and bakes the
 * value into the static template, which is more efficient for constants.
 *
 * **Important:** This plugin uses `generateBundle` (not `renderChunk`)
 * because Vite's built-in Terser minification runs as a post-build
 * `renderChunk` hook — AFTER all user plugins, including those with
 * `enforce: "post"`. The `generateBundle` hook runs after all
 * `renderChunk` hooks have completed, so the code is already minified.
 */
export function optimizeInlinesPlugin(): Plugin {
  return {
    name: "optimize-inlines",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
      // Optimization 1: Leading string literal concatenation.
      // Matches ${"prefix" + rest} or ${'prefix' + rest}, where `rest` is
      // everything up to the matching closing brace.
      // [^}]+ is safe here because Terser-minified expressions inside
      // template literals don't contain unbalanced `}` at this level.
      const leadingConcatPattern =
        /\$\{(?:"([^"]*)"|'([^']*)')\+([^}]+)\}/g;

      // Optimization 2: Pure string literal expressions (no concatenation).
      // For backticks, [^`$]* rejects any `$` to avoid matching template
      // literals with their own interpolations like ${`foo-${bar}`}.
      const pureStringPattern =
        /\$\{(?:"([^"]*)"|'([^']*)'|`([^`$]*)`)\}/g;

      for (const output of Object.values(bundle)) {
        if (output.type !== "chunk") {
          continue;
        }

        const chunk = output as OutputChunk;
        const code = chunk.code;

        // Pass 1: Extract leading string literals from concatenations
        let optimized = code.replace(
          leadingConcatPattern,
          (_match, dq, sq, rest) => (dq ?? sq) + "${" + rest + "}"
        );

        // Pass 2: Inline pure string literal expressions
        optimized = optimized.replace(
          pureStringPattern,
          (_match, dq, sq, bt) => dq ?? sq ?? bt ?? _match
        );

        if (optimized !== code) {
          chunk.code = optimized;
        }
      }
    }
  };
}

export default optimizeInlinesPlugin;
