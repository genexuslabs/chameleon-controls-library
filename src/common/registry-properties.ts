import type { ActionListImagePathCallback } from "../components/action-list/types";
import type {
  ChameleonImagePathCallbackControls,
  ChameleonImagePathCallbackControlsTagName
} from "./types";

declare global {
  interface Window {
    chameleonControlsLibrary: {
      getImagePathCallback?: Partial<RegistryGetImagePathCallback>;
      reports?: {
        accessibility: boolean;
      };
    };
  }
}

export type RegistryGetImagePathCallback = {
  [key in ChameleonImagePathCallbackControlsTagName]: ChameleonImagePathCallbackControls[key]["getImagePathCallback"];
};

export type RegisterPropertyName = "getImagePathCallback";

export type RegisterProperty = {
  getImagePathCallback: Partial<RegistryGetImagePathCallback>;
};

if (typeof window !== "undefined") {
  window.chameleonControlsLibrary ??= { getImagePathCallback: {} };
  window.chameleonControlsLibrary.getImagePathCallback ??= {};
}

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

  window.chameleonControlsLibrary[propertyName] = value;
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

  window.chameleonControlsLibrary[propertyName][controlName] = value;
};

export const getControlRegisterProperty = <
  PropName extends RegisterPropertyName,
  Control extends keyof RegisterProperty[PropName]
>(
  propertyName: PropName,
  controlName: Control
): RegisterProperty[PropName][Control] | undefined =>
  window.chameleonControlsLibrary[propertyName][controlName];

export const DEFAULT_GET_IMAGE_PATH_CALLBACK: ActionListImagePathCallback =
  additionalItem => ({
    base: additionalItem.imgSrc
  });
