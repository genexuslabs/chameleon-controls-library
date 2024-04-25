import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import yamlWorker from "./yaml.worker.ts?worker";

self.MonacoEnvironment = {
  getWorker(_: unknown, label: string) {
    if (label === "json") {
      // @ts-expect-error: TODO Fix this error
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      // @ts-expect-error: TODO Fix this error
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      // @ts-expect-error: TODO Fix this error
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      // @ts-expect-error: TODO Fix this error
      return new tsWorker();
    }
    if (label === "yaml") {
      // @ts-expect-error: TODO Fix this error
      return new yamlWorker();
    }

    // @ts-expect-error: TODO Fix this error
    return new editorWorker();
  }
};

export default monaco;
export { configureMonacoYaml } from "monaco-yaml";
