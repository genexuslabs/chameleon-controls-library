import type { Plugin } from "vite";

/**
 * Vite plugin that optimizes template literal expressions
 * Converts expressions like ${"radio__input"} to "radio__input"
 * This plugin runs after Terser optimizations using renderChunk hook
 */
export function optimizeInlinesPlugin(): Plugin {
  return {
    name: "optimize-inlines",
    apply: "build",
    enforce: "post", // Run after other plugins, including Terser
    renderChunk(code: string) {
      // Pattern to match template literals with single string expressions
      // Matches: ${"string"} or ${'string'} or ${`string`}
      // This handles cases like: part=${"radio__input"} inside template literals
      const pattern = /\$\{["']([^"']+)["']\}/g;

      const optimizedCode = code.replace(pattern, (match, content) => {
        // Convert to a simple string literal
        return `"${content}"`;
      });

      // Only return if code was actually modified
      if (optimizedCode !== code) {
        return {
          code: optimizedCode,
          map: null // You can generate a source map if needed
        };
      }

      return null;
    }
  };
}

export default optimizeInlinesPlugin;

