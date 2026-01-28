/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LitElement } from "lit";
import { IS_SERVER } from "../../development-flags";
import type {
  HostAttributeClass,
  HostAttributeEvents,
  HostAttributeEventsValue,
  HostAttributeProperties,
  HostAttributePropertiesValue,
  HostAttributeStyles,
  HostAttributeStylesValue,
  HostAttributes,
  HostProperties
} from "./types";

/**
 * Symbol to store previous state of the Host
 */
const HOST_STATE = Symbol("host-state");

export const Host = (
  elementRef: LitElement,
  attributes: HostAttributes
): void => {
  if (IS_SERVER) {
    return;
  }

  const previousState = ((elementRef as any)[HOST_STATE] ??
    {}) as HostAttributes;

  updateClasses(elementRef, previousState.class, attributes.class);
  updateMembers(elementRef, previousState.events, attributes.events, "events");
  updateMembers(
    elementRef,
    previousState.properties,
    attributes.properties,
    "properties"
  );
  updateMembers(elementRef, previousState.style, attributes.style, "style");

  // Update the state with the current information
  (elementRef as any)[HOST_STATE] = attributes;
};

const getRenderedClasses = (
  hostClasses: NonNullable<HostAttributeClass>
): Set<string> => {
  const classes = Object.entries(hostClasses);
  const renderedClasses: Set<string> = new Set();

  for (let index = 0; index < classes.length; index++) {
    const classValue = classes[index][1];

    // console.log("key:", classes[index][0], "value:", classValue);

    if (classValue) {
      renderedClasses.add(classes[index][0]);
    }
  }

  return renderedClasses;
};

const addClasses = (elementRef: LitElement, classes: Set<string>) =>
  elementRef.classList.add(...classes);

const removeClasses = (elementRef: LitElement, classes: Set<string>) =>
  elementRef.classList.remove(...classes);

function updateClasses(
  elementRef: LitElement,
  previousClasses: HostAttributeClass,
  currentClasses: HostAttributeClass
) {
  // No new classes. Nothing to do
  if (previousClasses == null && currentClasses == null) {
    return;
  }

  // First time that new classes are set. Only add the classes
  if (previousClasses == null && currentClasses != null) {
    addClasses(elementRef, getRenderedClasses(currentClasses));
    return;
  }

  // All classes were removed. Remove all old classes
  if (previousClasses != null && currentClasses == null) {
    removeClasses(elementRef, getRenderedClasses(previousClasses));
    return;
  }

  // Make the diffing.
  // The "as" operator is a WA due to this issue (fixed in TypeScript 5.4):
  // https://github.com/microsoft/TypeScript/pull/56908
  const previousRenderedClasses = getRenderedClasses(
    previousClasses as NonNullable<HostAttributeClass>
  );
  const currentRenderedClasses = getRenderedClasses(
    currentClasses as NonNullable<HostAttributeClass>
  );

  // Find the difference between the last and current state. The last state
  // will be used to store the classes that no longer are rendered. The current
  // state will be used to store the classes that must be added to the render
  [...previousRenderedClasses].forEach(previousRendered => {
    if (currentRenderedClasses.has(previousRendered)) {
      previousRenderedClasses.delete(previousRendered);
      currentRenderedClasses.delete(previousRendered);
    }
  });

  addClasses(elementRef, currentRenderedClasses);
  removeClasses(elementRef, previousRenderedClasses);
}

const getRenderedMembers = <T extends HostAttributeMember>(
  hostMembers: NonNullable<HostAttributeMemberName<T>>
): Map<
  T extends "properties" ? HostProperties : string,
  NonNullable<HostAttributeMemberValue<T>>
> => {
  const members = Object.entries(hostMembers);
  const renderedMembers: Map<
    T extends "properties" ? HostProperties : string,
    NonNullable<HostAttributeMemberValue<T>>
  > = new Map();

  for (let index = 0; index < members.length; index++) {
    const memberValue = members[index][1];

    if (memberValue) {
      renderedMembers.set(
        members[index][0] as T extends "properties" ? HostProperties : string,
        memberValue
      );
    }
  }

  return renderedMembers;
};

// Events
const addEvents = (
  elementRef: LitElement,
  events: Map<string, (...args: any[]) => void>
) => {
  events.forEach((value, key) => {
    elementRef.addEventListener(key, value);
  });
};

const removeEvents = (
  elementRef: LitElement,
  events: Map<string, (...args: any[]) => void>
) => {
  events.forEach((value, key) => {
    elementRef.removeEventListener(key, value);
  });
};

// Properties
const addProperties = (
  elementRef: LitElement,
  properties: Map<HostProperties, any>
) => {
  properties.forEach((value, key) => {
    // @ts-expect-error: TODO: Remove read-only keys from HostProperties
    elementRef[key] = value;
  });
};

const removeProperties = (
  elementRef: LitElement,
  properties: Map<HostProperties, any>
) => {
  properties.forEach((_, key) => {
    // @ts-expect-error: TODO: Remove read-only keys from HostProperties
    elementRef[key] = null;
  });
};

// Styles
const addStyles = (elementRef: LitElement, styles: Map<string, string>) => {
  styles.forEach((value, key) => {
    elementRef.style.setProperty(key, value);
  });
};

const removeStyles = (elementRef: LitElement, styles: Map<string, string>) => {
  styles.forEach((_, key) => {
    elementRef.style.removeProperty(key);
  });
};

type HostAttributeMember = Exclude<keyof HostAttributes, "class">;
type HostAttributeMemberName<T extends HostAttributeMember> = T extends "style"
  ? HostAttributeStyles
  : T extends "events"
    ? HostAttributeEvents
    : HostAttributeProperties;

type HostAttributeMemberValue<T extends HostAttributeMember> = T extends "style"
  ? HostAttributeStylesValue
  : T extends "events"
    ? HostAttributeEventsValue
    : HostAttributePropertiesValue;

const addMemberDictionary: {
  [key in HostAttributeMember]: (
    elementRef: LitElement,
    members: Map<
      key extends "properties" ? HostProperties : string,
      NonNullable<HostAttributeMemberValue<key>>
    >
  ) => void;
} = {
  events: (elementRef, members) => addEvents(elementRef, members),
  properties: (elementRef, members) => addProperties(elementRef, members),
  style: (elementRef, members) => addStyles(elementRef, members)
};

const removeMemberDictionary: {
  [key in HostAttributeMember]: (
    elementRef: LitElement,
    members: Map<
      key extends "properties" ? HostProperties : string,
      NonNullable<HostAttributeMemberValue<key>>
    >
  ) => void;
} = {
  events: (elementRef, members) => removeEvents(elementRef, members),
  properties: (elementRef, members) => removeProperties(elementRef, members),
  style: (elementRef, members) => removeStyles(elementRef, members)
};

function updateMembers<T extends HostAttributeMember>(
  elementRef: LitElement,
  previousMembers: HostAttributeMemberName<T>,
  currentMembers: HostAttributeMemberName<T>,
  type: T
) {
  // No new classes. Nothing to do
  if (!previousMembers && !currentMembers) {
    return;
  }

  // First time that new classes are set. Only add the classes
  if (!previousMembers && !!currentMembers) {
    addMemberDictionary[type](elementRef, getRenderedMembers(currentMembers));
    return;
  }

  // All classes were removed. Remove all old classes
  if (!!previousMembers && !currentMembers) {
    removeMemberDictionary[type](
      elementRef,
      getRenderedMembers(previousMembers)
    );
    return;
  }

  // Make the diffing.
  // The "as" operator is a WA due to this issue (fixed in TypeScript 5.4):
  // https://github.com/microsoft/TypeScript/pull/56908
  const previousRenderedStyles = getRenderedMembers(
    previousMembers as NonNullable<HostAttributeMemberName<T>>
  );
  const currentRenderedStyles = getRenderedMembers(
    currentMembers as NonNullable<HostAttributeMemberName<T>>
  );

  // Find the difference between the last and current state. The last state
  // will be used to store the styles that no longer are rendered. The current
  // state will be used to store the styles that must be added or update in the
  // render
  [...previousRenderedStyles].forEach(([previousValue, key]) => {
    const currentStyle = currentRenderedStyles.get(key);

    // Same value. Nothing to do
    if (currentStyle && previousValue === previousValue) {
      previousRenderedStyles.delete(key);
      currentRenderedStyles.delete(key);
    }
    // Different value. Update the value by keeping the key in the
    // currentRenderedStyles variable
    else if (currentStyle) {
      previousRenderedStyles.delete(key);
    }
  });

  addMemberDictionary[type](elementRef, currentRenderedStyles);
  removeMemberDictionary[type](elementRef, previousRenderedStyles);
}
