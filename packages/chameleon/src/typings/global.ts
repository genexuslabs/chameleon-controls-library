import type { RegistryGetImagePathCallback } from "../utilities/register-properties/types";

declare global {
  // eslint-disable-next-line no-var
  var chameleonControlsLibrary:
    | {
        getImagePathCallback?: Partial<RegistryGetImagePathCallback>;
        reports?: {
          accessibility: boolean;
          performance?: boolean;
        };
      }
    | undefined;
}

// Necessary to auto-detect this module in the project
export {};
