import { spreadEvents, spreadProps } from "@open-wc/lit-helpers";
import { nothing, type TemplateResult } from "lit";
import { html, unsafeStatic } from "lit/static-html.js";
import type {
  ComponentRenderModel,
  ComponentRenderTemplateItem,
  ComponentRenderTemplateItemNode,
  ComponentRenderTemplateItemNodeEvents,
  ComponentRenderTemplateItemNodeProperties
} from "../../typings/component-render";

/**
 * This mapping serves for properly binding the spreadProps with properties. In
 * some cases (like the for attribute), there are HTML attributes in the
 * properties that don't match their respective DOM property (for --> htmlFor),
 * so we have to manually map those cases.
 */
const ATTRIBUTE_TO_DOM_PROPERTY = {
  for: "htmlFor"
} as const;

const tryToGetPropertyValueFromStatesOrVariables = (
  states: ComponentRenderModel["states"],
  variables: ComponentRenderModel["variables"],
  nameOfTheStateOrVariable: string
) => {
  if (states !== undefined && nameOfTheStateOrVariable in states) {
    return states[nameOfTheStateOrVariable];
  }

  if (variables !== undefined && nameOfTheStateOrVariable in variables) {
    return variables[nameOfTheStateOrVariable];
  }

  // There is no state or variable with the given name, so we return the name
  // itself, meaning that the bindings is a string literal, e.g. "Hello World"
  return nameOfTheStateOrVariable;
};

const fromPropertiesToObject = (
  properties:
    | ComponentRenderTemplateItemNodeProperties<keyof HTMLElementTagNameMap>
    | undefined,
  states: ComponentRenderModel["states"],
  variables: ComponentRenderModel["variables"]
) => {
  if (!properties) {
    return undefined;
  }
  const result: Record<string, unknown> = {};
  const propertiesKeys = Object.keys(properties);

  for (let index = 0; index < propertiesKeys.length; index++) {
    const propertyKey = propertiesKeys[index];
    const propertyValue = properties[propertyKey];

    const propertyName =
      // Check if the property has to be mapped to a DOM attribute
      ATTRIBUTE_TO_DOM_PROPERTY[
        propertyKey as keyof typeof ATTRIBUTE_TO_DOM_PROPERTY
      ] ?? propertyKey;

    result[propertyName] =
      typeof propertyValue === "string"
        ? tryToGetPropertyValueFromStatesOrVariables(
            states,
            variables,
            propertyValue
          )
        : propertyValue;
  }

  return spreadProps(result);
};

const fromEventsToObject = (
  nodeEvents: ComponentRenderTemplateItemNodeEvents | undefined,
  events: ComponentRenderModel["events"],
  states: ComponentRenderModel["states"],
  queueReRender: () => void
) => {
  if (!nodeEvents) {
    return undefined;
  }

  const nodeEventNames = Object.keys(nodeEvents);

  if (!events && nodeEventNames.length > 0) {
    throw new Error(
      `The events member doesn't exist in the component's model, but there is a node that requires event bindings (for example, the eventName: "${nodeEventNames[0]}")`
    );
  }

  // Record to map event names to event handlers
  const result: Record<`${string}`, (event: CustomEvent<unknown>) => void> = {};

  // Find all event handlers in the "events" member of the component's model
  for (let index = 0; index < nodeEventNames.length; index++) {
    const nodeEventName = nodeEventNames[index];
    const nodeEventData = nodeEvents[nodeEventName];

    const eventHandler = events![nodeEventData.eventHandlerName];

    if (!eventHandler) {
      throw new Error(
        `The event handler "${nodeEventData.eventHandlerName}" doesn't exists in the "events" member of the component's model.`
      );
    }

    result[nodeEventName] = (event: CustomEvent<unknown>) => {
      eventHandler(states)(event);
      queueReRender();
    };
  }

  return spreadEvents(result);
};

const renderNode = (
  node: ComponentRenderTemplateItemNode,
  events: ComponentRenderModel["events"],
  states: ComponentRenderModel["states"],
  variables: ComponentRenderModel["variables"],
  queueReRender: () => void
): TemplateResult | undefined =>
  node.tag === "ch-theme"
    ? undefined
    : html`<${unsafeStatic(node.tag)} class=${node.class ?? nothing} ${fromPropertiesToObject(node.properties, states, variables)} ${fromEventsToObject(node.events, events, states, queueReRender)}>
  ${node.children ? renderItems(events, states, node.children, variables, queueReRender) : nothing}
</${unsafeStatic(node.tag)}>`;

const renderItem = (
  item: ComponentRenderTemplateItem,
  events: ComponentRenderModel["events"],
  states: ComponentRenderModel["states"],
  variables: ComponentRenderModel["variables"],
  queueReRender: () => void
) =>
  typeof item === "string"
    ? item
    : renderNode(item, events, states, variables, queueReRender);

export function renderItems(
  events: ComponentRenderModel["events"],
  states: ComponentRenderModel["states"],
  template: ComponentRenderModel["template"],
  variables: ComponentRenderModel["variables"],
  queueReRender: () => void
) {
  return Array.isArray(template)
    ? template.map(item =>
        renderItem(item, events, states, variables, queueReRender)
      )
    : renderItem(template, events, states, variables, queueReRender);
}

