import type { KasstorSignal } from "@genexus/kasstor-signals";
import type {
  ChameleonControls,
  ChameleonControlsTagName
} from "../../typings/chameleon-components";

export type ChameleonDefaultPropertyManager = ChameleonDefaultPropertyControlValues;

export type ChameleonDefaultPropertyControlValues = {
  [PropName in keyof ChameleonDefaultPropertyControls]: {
    [CompName in ChameleonDefaultPropertyControls[PropName]]: KasstorSignal<
      ChameleonControls[CompName][PropName]
    >;
  };
};

export type ChameleonDefaultPropertyControls = {
  getImagePathCallback: Extract<
    ChameleonControlsTagName,
    | "ch-accordion-render"
    | "ch-action-list-render"
    | "ch-action-menu-render"
    | "ch-checkbox"
    | "ch-combo-box-render"
    | "ch-edit"
    | "ch-image"
    | "ch-navigation-list-render"
    | "ch-tab-render"
    // | "ch-tree-view-render"
    | "ch-breadcrumb-render"
  >;
};
