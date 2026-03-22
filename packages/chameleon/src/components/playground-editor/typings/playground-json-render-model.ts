import type { Spec, ComputedFunction } from "@json-render/core";
import type { ComponentRegistry } from "../../json-render/types";
import type { ThemeModel } from "../../theme/theme-types";

export type PlaygroundJsonRenderModel = {
  spec: Spec;
  registry: ComponentRegistry;
  bundles?: ThemeModel;
  customCss?: string;
  functions?: Record<string, ComputedFunction>;
  /**
   * Explicit type metadata for states whose type cannot be inferred from the
   * initial value alone (e.g. enum, string-multiline).
   */
  stateTypes?: Record<string, PlaygroundStateTypeMeta>;

  /**
   * Hints used only for code generation (not used at runtime).
   * Describes which component events write back to which state keys.
   * Example: `{ events: { input: "checked" } }` means the `input` event
   * updates the `checked` state.
   */
  codegenHints?: {
    events?: Record<string, string>;
  };
};

export type PlaygroundStateTypeMeta =
  | { type: "boolean" }
  | { type: "number" }
  | { type: "string" }
  | { type: "string-multiline" }
  | { type: "enum"; options: string[] }
  | { type: "object" }
  | { type: "ref" }
  | { type: "function" };
