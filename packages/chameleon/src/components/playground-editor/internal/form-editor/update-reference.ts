import type {
  ComponentRenderStates,
  ComponentRenderTemplateItemNode
} from "../../typings/component-render";
import type { ComponentPrimitiveProperty } from "../../typings/playground-editor";

export const refreshPlaygroundTemplate = () => {
  document
    .querySelector("ch-playground-editor")!
    .shadowRoot!.querySelector("ch-component-render")!
    .requestUpdate();
};

export const updatePropertyInModel = (
  propertyName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newValue: any,
  node: ComponentRenderTemplateItemNode,
  states: ComponentRenderStates | undefined
) => {
  // If states are provided, update the state
  if (states && propertyName in states) {
    states[propertyName].value = newValue;
  } else {
    // Otherwise, update the node's properties
    node.properties ??= {};
    node.properties[propertyName] = newValue;
  }

  // Refresh the playground template to reflect changes
  refreshPlaygroundTemplate();
};

export const getPropertyInModel = (
  propertyName: string,
  propertyDefault: ComponentPrimitiveProperty<unknown>,
  node: ComponentRenderTemplateItemNode,
  states: ComponentRenderStates | undefined
) => {
  if (states && propertyName in states) {
    return states[propertyName].value;
  }
  if (node.properties && propertyName in node.properties) {
    return node.properties[propertyName];
  }

  return propertyDefault.value;
};

