import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    // Tests that don't run on the Browser
    test: {
      include: ["src/tests/**/*.{test,spec}.ts"],
      name: "unit",
      environment: "node"
    }
  },
  {
    // Tests that runs on the Browser
    test: {
      exclude: ["src/testing/implementation/**"],
      include: ["src/testing/execution/basic-interface-checks.e2e.ts"],
      name: "browser",
      browser: {
        provider: "playwright",

        // Disable screenshots when the test fails
        screenshotFailures: false,

        enabled: true,

        // It means that no UI will be displayed. Turn this off if you want to
        // see how the UI is tested
        headless: false,

        // At least one instance is required
        instances: [{ browser: "chromium" }]
      }
    }
  }
]);
