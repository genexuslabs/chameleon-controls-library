/**
 * CH6 bundle-size entry point.
 *
 * Uses Stencil's defineCustomElements to register all components, then
 * renders matched component tags into the DOM. Stencil's lazy-loading
 * mechanism detects the tags and downloads the corresponding entry bundles.
 *
 * After bundling by Vite, the Stencil runtime is inlined in the output.
 * Stencil's lazy-loader uses dynamic `import()` with template literals
 * (e.g., `import(\`./${hash}.entry.js\`)`), which Vite cannot resolve
 * at build time. Therefore, the CH6 dist files must be copied to the
 * Vite output directory post-build so the lazy-loader can find them.
 */
import { defineCustomElements } from "@genexus/chameleon-controls-library/loader";
import { MATCHED_COMPONENTS } from "./components.js";

defineCustomElements();

// Render each matched component tag into the DOM
for (const tag of MATCHED_COMPONENTS) {
  document.body.appendChild(document.createElement(tag));
}
