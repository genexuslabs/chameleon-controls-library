import type { KasstorSignal } from "@genexus/kasstor-signals";
import { signal } from "@genexus/kasstor-signals/core.js";

import { DEFAULT_NAVIGATION_LIST_GET_IMAGE_PATH_CALLBACK } from "./default-implementations";
import type {
  ChameleonDefaultPropertyControls,
  ChameleonDefaultPropertyControlValues
} from "./types";

type UnwrapSignal<S> = S extends KasstorSignal<infer T> ? T : never;

globalThis.chameleonControlsLibraryDefaultManager ??= {
  getImagePathCallback: {
    "ch-accordion-render": signal(),
    "ch-action-list-render": signal(),
    "ch-action-menu-render": signal(),
    "ch-breadcrumb-render": signal(),
    "ch-checkbox": signal(),
    "ch-combo-box-render": signal(),
    "ch-edit": signal(),
    "ch-image": signal(),
    "ch-navigation-list-render": signal(DEFAULT_NAVIGATION_LIST_GET_IMAGE_PATH_CALLBACK),
    "ch-tab-render": signal()
    // "ch-tree-view-render": signal<TreeViewImagePathCallback | undefined>()
  }
};
const defaultManager = globalThis.chameleonControlsLibraryDefaultManager;

/**
 * Registers the default property for a given property name and a component name and value.
 *
 * @param propertyName - The name of the property to register the default value for.
 * @param componentName - The name of the component to register the default value for.
 * @param propValue - The default value to register for the component.
 */
export const registerDefaultPropertyForComponent = <
  PropName extends keyof ChameleonDefaultPropertyControlValues,
  CompName extends ChameleonDefaultPropertyControls[PropName]
>(
  propertyName: PropName,
  componentName: CompName,
  propValue: UnwrapSignal<ChameleonDefaultPropertyControlValues[PropName][CompName]>
): void =>
  (defaultManager[propertyName][componentName] as (value: typeof propValue) => void)(propValue);

/**
 * Registers the default property for a given property name and a set of component names and values.
 *
 * This is the preferred way to register the default property for a given property name and a set of component names and values.
 *
 * @param propertyName - The name of the property to register the default value for.
 * @param valuesForComponents - An object with the component names as keys and the default values as values.
 */
export const registerDefaultProperty = <
  PropName extends keyof ChameleonDefaultPropertyControlValues
>(
  propertyName: PropName,
  valuesForComponents: {
    [CompName in keyof ChameleonDefaultPropertyControlValues[PropName]]?: UnwrapSignal<
      ChameleonDefaultPropertyControlValues[PropName][CompName]
    >;
  }
): void => {
  // Object.keys is the faster than Object.entries
  const componentNames = Object.keys(
    valuesForComponents
  ) as ChameleonDefaultPropertyControls[PropName][];
  const length = componentNames.length;

  // For let i = .. is the fastest way to iterate over an array
  for (let index = 0; index < length; index++) {
    const compName = componentNames[index];
    const propValue = valuesForComponents[compName];

    defaultManager[propertyName][compName as keyof ChameleonDefaultPropertyControlValues[PropName]](
      propValue
    );
  }
};

export const getDefaultPropertyManager = () => defaultManager;
