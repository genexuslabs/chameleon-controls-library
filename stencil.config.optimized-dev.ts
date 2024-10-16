import { Config } from "@stencil/core";
import { sass } from "@stencil/sass";
import { config as defaultConfig } from "./stencil.config.ts";

export const config: Config = {
  namespace: defaultConfig.namespace,
  outputTargets: defaultConfig.outputTargets!.filter(
    output => output.type === "www"
  ),
  plugins: [sass()],
  tsconfig: "tsconfig-optimized-dev.json"
};
