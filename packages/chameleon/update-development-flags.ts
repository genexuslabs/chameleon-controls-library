import type { Plugin } from "vite";

/**
 * Vite plugin to update development flags in order to implement the `DEV_MODE`
 * and `IS_SERVER` flags by using different outputs that are implemented in the
 * "exports" options of the package.json file.
 */
export function updateDevelopmentFlags(
  isNode: boolean,
  isProduction: boolean
): Plugin {
  return {
    name: "update-development-flags",
    enforce: "pre", // Ensure this runs before other plugins

    /**
     * Hook to transform file contents during build/dev.
     * Runs for every matched file.
     */
    transform(code: string, id: string) {
      // Only target the development-flags.ts file
      if (!id.endsWith("development-flags.ts")) {
        return null;
      }

      // Replace the flags
      const transformedCode = code
        .replace(
          /const IS_SERVER = (true|false)/,
          `const IS_SERVER = ${isNode ? "true" : "false"}`
        )
        .replace(
          /const DEV_MODE = (true|false)/,
          `const DEV_MODE = ${isProduction ? "false" : "true"}`
        );

      return {
        code: transformedCode,
        map: null
      };
    }
  };
}
