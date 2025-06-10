import { Config } from "@stencil/core";
import { sass } from "@stencil/sass";
import { config as defaultConfig } from "./stencil.config.ts";

const argv = process.argv;
const buildReact = argv.includes("--react");

export const config: Config = {
  namespace: defaultConfig.namespace,
  globalScript: "src/fix-broken-hydrate-on-load.ts",
  outputTargets: defaultConfig.outputTargets!.filter(
    output => output.type === "www" || buildReact
  ),
  plugins: [sass()],
  testing: defaultConfig.testing,
  bundles: defaultConfig.bundles?.filter(
    bundle => bundle.components[0] !== "ch-markdown"
  ),
  tsconfig: "tsconfig-optimized-test-watch.json"
};
