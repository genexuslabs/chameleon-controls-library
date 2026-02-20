import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    pool: "threads",
    projects: [
      // Tests that don't run on the Browser
      {
        // Inherit options from this config like plugins and pool
        extends: true,
        test: {
          include: ["src/**/*.{test,spec}.ts"],
          name: "unit",
          environment: "node"
        }
      },
      // Tests that runs on the Browser
      {
        // Inherit options from this config like plugins and pool
        extends: true,
        test: {
          exclude: ["node_modules", "dist"],
          include: ["src/**/*.e2e.ts"],
          name: "browser",
          browser: {
            provider: playwright(),

            // Disable screenshots when the test fails
            screenshotFailures: false,

            enabled: true,

            // It means that no UI will be displayed. Turn this off if you want to
            // see how the UI is tested
            headless: true,

            // At least one instance is required
            instances: [{ browser: "chromium" }]
          }
        }
      }
    ]
  }
});

