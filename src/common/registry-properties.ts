import type { ActionListImagePathCallback } from "../components/action-list/types";
import type {
  ChameleonImagePathCallbackControls,
  ChameleonImagePathCallbackControlsTagName
} from "./types";

declare global {
  interface Window {
    getImagePathCallback: Partial<RegistryGetImagePathCallback>;
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
  window.getImagePathCallback ??= {};
}

export const registryProperty = <
  Prop extends RegisterPropertyName,
  T extends RegisterProperty[Prop]
>(
  propertyName: Prop,
  value: T
) => {
  window[propertyName] = value;
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
  window[propertyName][controlName] = value;
};

export const getControlRegisterProperty = <
  PropName extends RegisterPropertyName,
  Control extends keyof RegisterProperty[PropName]
>(
  propertyName: PropName,
  controlName: Control
): RegisterProperty[PropName][Control] | undefined =>
  window[propertyName][controlName];

export const DEFAULT_GET_IMAGE_PATH_CALLBACK: ActionListImagePathCallback =
  additionalItem => ({
    base: additionalItem.imgSrc
  });
