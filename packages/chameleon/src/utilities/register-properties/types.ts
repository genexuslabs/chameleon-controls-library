import type {
  ChameleonImagePathCallbackControls,
  ChameleonImagePathCallbackControlsTagName
} from "../../typings/chameleon-components";

export type RegistryGetImagePathCallback = {
  [key in ChameleonImagePathCallbackControlsTagName]: ChameleonImagePathCallbackControls[key]["getImagePathCallback"];
};

export type RegisterPropertyName = "getImagePathCallback";

export type RegisterProperty = {
  getImagePathCallback: Partial<RegistryGetImagePathCallback>;
};
