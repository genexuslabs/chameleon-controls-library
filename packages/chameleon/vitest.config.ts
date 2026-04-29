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
          include: ["src/testing/execution/accessible-name-and-label-variants.e2e.ts","src/components/breadcrumb/tests/breadcrumb.e2e.ts","src/components/json-render/tests/json-render.e2e.ts","src/components/accordion/tests/basic.e2e.ts","src/components/accordion/tests/expand-collapse.e2e.ts","src/components/accordion/tests/events.e2e.ts","src/components/accordion/tests/accessibility.e2e.ts","src/components/accordion/tests/parts.e2e.ts","src/components/accordion/tests/lazy-rendering.e2e.ts","src/components/accordion/tests/signal-updates.e2e.ts","src/components/status/tests/basic.e2e.ts","src/components/status/tests/accessibility.e2e.ts","src/components/status/tests/form-associated.e2e.ts","src/components/status/tests/loading-region.e2e.ts","src/components/math-viewer/tests/basic.e2e.ts","src/components/math-viewer/tests/rendering.e2e.ts","src/components/math-viewer/tests/error-handling.e2e.ts","src/components/math-viewer/tests/parts.e2e.ts","src/components/action-menu/tests/basic.e2e.ts","src/components/action-menu/tests/parts.e2e.ts","src/components/action-menu/tests/events.e2e.ts","src/components/action-menu/tests/accessibility.e2e.ts","src/components/action-group/tests/basic.e2e.ts","src/components/action-group/tests/parts.e2e.ts","src/components/action-group/tests/events.e2e.ts","src/components/action-group/tests/responsive-collapse.e2e.ts","src/components/confirmation/tests/confirmation.e2e.ts","src/components/reasoning/tests/basic.e2e.ts","src/components/reasoning/tests/streaming.e2e.ts","src/components/reasoning/tests/accessibility.e2e.ts","src/components/plan/tests/basic.e2e.ts","src/components/plan/tests/streaming.e2e.ts","src/components/plan/tests/accordion-interaction.e2e.ts","src/components/plan/tests/parts.e2e.ts","src/components/tool/tests/basic.e2e.ts","src/components/tool/tests/events.e2e.ts","src/components/tool/tests/input-output.e2e.ts","src/components/tool/tests/states.e2e.ts","src/components/chain-of-thought/tests/basic.e2e.ts","src/components/chain-of-thought/tests/events.e2e.ts","src/components/chain-of-thought/tests/accessibility.e2e.ts","src/components/chain-of-thought/tests/edge-cases.e2e.ts","src/utilities/host/tests/host.e2e.ts"],
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
