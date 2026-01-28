import { defineConfig } from "vite";
import { defineDistributionConfiguration } from "./vite-config-distribution";
import { minifiedConfiguration } from "./vite-config-minified";

export default defineConfig(({ mode }) =>
  mode === "minified"
    ? minifiedConfiguration
    : defineDistributionConfiguration(
        mode.startsWith("node"),
        mode.endsWith("production")
      )
);
