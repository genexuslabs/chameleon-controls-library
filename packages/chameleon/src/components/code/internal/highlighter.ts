import { createShikiInternal } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { chameleonCssTheme } from "./default-theme";

export const highlighter = await createShikiInternal({
  themes: [chameleonCssTheme],

  engine: createJavaScriptRegexEngine({
    cache: new Map(),
    target: "ES2025"
  })
});
