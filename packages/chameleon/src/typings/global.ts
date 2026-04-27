import type { ChameleonDefaultPropertyManager } from "../managers/property-defaults/types";

declare global {
  var chameleonControlsLibraryDefaultManager: Readonly<ChameleonDefaultPropertyManager> | undefined;

  var chameleonControlsLibrary:
    | {
        reports?: {
          accessibility: boolean;
          performance?: boolean;
        };
      }
    | undefined;
}

// Necessary to auto-detect this module in the project
export {};
