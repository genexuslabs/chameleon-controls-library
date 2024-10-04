import {
  ChameleonImagePathCallbackControls,
  ChameleonImagePathCallbackControlsTagName,
  GxImageMultiState
} from "./types";

export type RegistryGetImagePathCallback = {
  [key in ChameleonImagePathCallbackControlsTagName]: ChameleonImagePathCallbackControls[key]["getImagePathCallback"];
};

export type RegisterPropertyName = "getImagePathCallback";

export type RegisterProperty = typeof registerMapping;

const registryGetImagePathCallback: Partial<RegistryGetImagePathCallback> = {};

const registerMapping = {
  getImagePathCallback: registryGetImagePathCallback
};

export const registryProperty = <
  Prop extends RegisterPropertyName,
  T extends RegisterProperty[Prop]
>(
  propertyName: Prop,
  value: T
) => {
  registerMapping[propertyName] = value;
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
  registerMapping[propertyName][controlName] = value;
};

export const getControlRegisterProperty = <
  PropName extends RegisterPropertyName,
  Control extends keyof RegisterProperty[PropName]
>(
  propertyName: PropName,
  controlName: Control
): RegisterProperty[PropName][Control] | undefined =>
  registerMapping[propertyName][controlName];

export const DEFAULT_GET_IMAGE_PATH_CALLBACK: (
  imageSrc: string
) => GxImageMultiState | undefined = imageSrc => ({ base: imageSrc });
