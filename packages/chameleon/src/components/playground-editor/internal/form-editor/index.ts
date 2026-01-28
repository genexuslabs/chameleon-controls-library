import { html } from "lit";
import type {
  ComponentRenderStates,
  ComponentRenderTemplateItemNode
} from "../../typings/component-render";
import { componentProperties } from "../components";
import { booleanEditor } from "./boolean";
import { numberEditor } from "./number";
import { stringEditor } from "./string";
import { stringMultilineEditor } from "./string-multiline";

const renderMapping = {
  boolean: booleanEditor,
  enum: stringEditor,
  function: stringEditor,
  number: numberEditor,
  object: stringEditor,
  ref: stringEditor,
  string: stringEditor,
  "string-multiline": stringMultilineEditor
} as const;

export const renderProperties = (
  node: ComponentRenderTemplateItemNode,
  states: ComponentRenderStates | undefined
) => {
  const properties =
    componentProperties[node.tag as keyof typeof componentProperties];

  return properties
    ? html`<div class="property-editor" part="property-editor">
        ${Object.keys(properties).map(key =>
          renderMapping[properties[key as keyof typeof properties]!.type](
            key,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            properties[key as keyof typeof properties] as any, // TODO: Fix this type infer issue
            node,
            states
          )
        )}
      </div>`
    : "No properties for this element";
};

