import { createShikiInternal } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { codeDefaultTheme } from "./default-theme";

export const highlighter = await createShikiInternal({
  themes: [codeDefaultTheme],

  engine: createJavaScriptRegexEngine({
    cache: new Map(),
    target: "ES2025"
  })
});
