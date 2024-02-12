import { h } from "@stencil/core";
import { Element as HElement, Text as HText } from "hast";

import {
  parseCodeToHAST,
  lowLight,
  SUPPORTED_LANGUAGES
} from "@genexus/markdown-parser/dist/parse-code.js";
import { Root } from "mdast";

// Mark which languages are registered in the code parser. Useful to defer the
// loading of all languagasync es
let registeredLanguages: Set<string>; // Allocated at runtime to save memory

const registerLanguage = async (language: string) => {
  registeredLanguages ??= new Set();

  // Already registered or inexistent language
  if (registeredLanguages.has(language) || !SUPPORTED_LANGUAGES.has(language)) {
    return;
  }

  // Register the language in the set
  // registeredLanguages.add(language);

  try {
    // Load its module
    const javascript = (
      await import(
        "highlight.js/es/languages/javascript.js"
        // `../../../node_modules/@genexus/markdown-parser/dist/languages/${language}.js`
      )
    ).default;

    // Register the language in the parser
    lowLight.register({ javascript: javascript });
    // register(language, languageModule);
  } catch (error) {
    console.log(error);
  }
};

const codeToJSXDictionary = {
  element: (element: HElement) => {
    const className = element.properties.className as string[];
    const classes = className ? className.join(" ") : null;

    return <span class={classes}>{renderCodeChildren(element)}</span>;
  },

  text: (element: HText) => element.value
};

function renderCodeChildren(element: HElement) {
  return element.children.map(child => codeToJSXDictionary[child.type](child));
}

export const parseCodeToJSX = async (language: string, code: string) => {
  // Register the language
  await registerLanguage(language);

  const tree: Root = parseCodeToHAST("js", code);

  return (
    <pre>
      <code class={`hljs language-${"js"}`}>
        {tree.children.map(child => codeToJSXDictionary[child.type](child))}
      </code>
    </pre>
  );
};
