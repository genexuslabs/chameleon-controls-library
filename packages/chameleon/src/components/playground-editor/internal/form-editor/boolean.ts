import { html } from "lit";
import "../../../switch/switch.lit";
import type ChSwitch from "../../../switch/switch.lit";
import type {
  ComponentRenderStates,
  ComponentRenderTemplateItemNode
} from "../../typings/component-render";
import type { ComponentPrimitiveProperty } from "../../typings/playground-editor";
import { getPropertyInModel, updatePropertyInModel } from "./update-reference";

const updateBooleanValue =
  (
    propertyName: string,
    node: ComponentRenderTemplateItemNode,
    states: ComponentRenderStates | undefined
  ) =>
  // TODO: Use the ChSwitchEvent type
  (event: CustomEvent) => {
    const newValue = (event.target as ChSwitch).checked;

    updatePropertyInModel(propertyName, newValue, node, states);
  };

export const booleanEditor = (
  propertyName: string,
  property: ComponentPrimitiveProperty<boolean>,
  node: ComponentRenderTemplateItemNode,
  states: ComponentRenderStates | undefined
) =>
  html`<label class="label" for=${propertyName}>${propertyName}</label>
    <ch-switch
      id="${propertyName}"
      name="${propertyName}"
      class="switch-small"
      .checked=${getPropertyInModel(propertyName, property, node, states)}
      @input=${updateBooleanValue(propertyName, node, states)}
    ></ch-switch>`;

