import { html } from "lit";
import type {
  ComponentRenderStates,
  ComponentRenderTemplateItemNode
} from "../../typings/component-render";
import type { ComponentPrimitiveProperty } from "../../typings/playground-editor";
import { getPropertyInModel, updatePropertyInModel } from "./update-reference";

const updateNumberValue =
  (
    propertyName: string,
    node: ComponentRenderTemplateItemNode,
    states: ComponentRenderStates | undefined
  ) =>
  // TODO: Use the ChEditEvent type
  (event: CustomEvent) => {
    const newValue = Number((event.target as HTMLInputElement).value);

    updatePropertyInModel(propertyName, newValue, node, states);
  };

export const numberEditor = (
  propertyName: string,
  property: ComponentPrimitiveProperty<number>,
  node: ComponentRenderTemplateItemNode,
  states: ComponentRenderStates | undefined
) =>
  html`<label class="label" for=${propertyName}>${propertyName}</label>
    <input
      id=${propertyName}
      name=${propertyName}
      class="input"
      type="number"
      value=${getPropertyInModel(propertyName, property, node, states)}
      @input=${updateNumberValue(propertyName, node, states)}
    ></input>`;

