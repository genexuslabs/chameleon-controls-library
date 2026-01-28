import { html } from "lit";
import type {
  ComponentRenderStates,
  ComponentRenderTemplateItemNode
} from "../../typings/component-render";
import type { ComponentPrimitiveProperty } from "../../typings/playground-editor";
import { getPropertyInModel, updatePropertyInModel } from "./update-reference";

const updateStringMultilineValue =
  (
    propertyName: string,
    node: ComponentRenderTemplateItemNode,
    states: ComponentRenderStates | undefined
  ) =>
  // TODO: Use the ChEditEvent type
  (event: CustomEvent) => {
    const newValue = (event.target as HTMLInputElement).value;

    updatePropertyInModel(propertyName, newValue, node, states);
  };

export const stringMultilineEditor = (
  propertyName: string,
  property: ComponentPrimitiveProperty<string>,
  node: ComponentRenderTemplateItemNode,
  states: ComponentRenderStates | undefined
) =>
  html`<label class="label" for=${propertyName}>${propertyName}</label>
    <textarea
      id=${propertyName}
      name=${propertyName}
      class="input"
      .value=${getPropertyInModel(propertyName, property, node, states) ?? ""}
      @input=${updateStringMultilineValue(propertyName, node, states)}
    ></textarea>`;

