import type { RegisterProperty, RegisterPropertyName } from "./types";

export const registryProperty = <
  Prop extends RegisterPropertyName,
  T extends RegisterProperty[Prop]
>(
  propertyName: Prop,
  value: T
) => {
  if (
    (propertyName as string) === "__proto__" ||
    (propertyName as string) === "constructor" ||
    (propertyName as string) === "prototype"
  ) {
    throw new Error("Invalid property name");
  }

  globalThis.chameleonControlsLibrary[propertyName] = value;
};

export const registryControlProperty = <
  PropName extends RegisterPropertyName,
  Control extends keyof RegisterProperty[PropName],
  T extends RegisterProperty[PropName][Control]
>(
  propertyName: PropName,
  controlName: Control,
  value: T
) => {
  if (
    (propertyName as string) === "__proto__" ||
    (propertyName as string) === "constructor" ||
    (propertyName as string) === "prototype"
  ) {
    throw new Error("Invalid property name");
  }

  if (
    (controlName as string) === "__proto__" ||
    (controlName as string) === "constructor" ||
    (controlName as string) === "prototype"
  ) {
    throw new Error("Invalid control name");
  }

  globalThis.chameleonControlsLibrary[propertyName][controlName] = value;
};

export const getControlRegisterProperty = <
  PropName extends RegisterPropertyName,
  Control extends keyof RegisterProperty[PropName]
>(
  propertyName: PropName,
  controlName: Control
): RegisterProperty[PropName][Control] | undefined => {
  globalThis.chameleonControlsLibrary ??= { getImagePathCallback: {} };
  globalThis.chameleonControlsLibrary.getImagePathCallback ??= {};

  return globalThis.chameleonControlsLibrary[propertyName][controlName];
};
