import type { ChameleonPublicControlsTagName } from "../../typings/chameleon-components";
import type { ThemeModel } from "../theme/theme-types";
import type { ComponentRenderModel } from "./typings/component-render";

const MERCURY_BUNDLES: ThemeModel = [
  {
    name: "Mercury",
    url: "https://unpkg.com/@genexus/mercury@0.26.0/dist/bundles/css/all.css"
  }
];

export const playgroundEditorModels = {
  "ch-checkbox": {
    bundles: MERCURY_BUNDLES,
    events: {
      updateChecked: states => (event: CustomEvent<unknown>) => {
        states.checked.value = event.detail;
      }
    },
    states: {
      checked: {
        type: "boolean",
        value: false
      }
    },
    template: {
      tag: "ch-checkbox",
      class: "checkbox",
      properties: {},
      events: {
        input: { eventHandlerName: "updateChecked" }
      }
    }
  },
  "ch-code": {
    bundles: MERCURY_BUNDLES,
    template: {
      tag: "ch-code",
      class: "code",
      properties: {}
    }
  },
  "ch-image": {
    bundles: MERCURY_BUNDLES,
    template: {
      tag: "ch-image",
      properties: {}
    }
  },
  "ch-radio-group-render": {
    bundles: MERCURY_BUNDLES,
    template: {
      tag: "ch-radio-group-render",
      class: "radio-group",
      properties: {}
    }
  },
  "ch-segmented-control-render": {
    bundles: MERCURY_BUNDLES,
    template: {
      tag: "ch-segmented-control-render",
      properties: {}
    }
  },
  "ch-slider": {
    bundles: MERCURY_BUNDLES,
    events: {
      updateValue: states => (event: CustomEvent<unknown>) => {
        states.value.value = event.detail;
      }
    },
    states: {
      value: {
        type: "number",
        value: 0
      }
    },
    template: {
      tag: "ch-slider",
      class: "slider",
      properties: {},
      events: {
        input: { eventHandlerName: "updateValue" }
      }
    }
  },
  "ch-switch": {
    bundles: MERCURY_BUNDLES,
    events: {
      updateChecked: states => (event: CustomEvent<unknown>) => {
        states.checked.value = event.detail;
      }
    },
    states: {
      checked: {
        type: "boolean",
        value: false
      }
    },
    template: {
      tag: "ch-switch",
      class: "switch-small",
      properties: {},
      events: {
        input: { eventHandlerName: "updateChecked" }
      }
    }
  }
} as const satisfies {
  [key in ChameleonPublicControlsTagName]?: ComponentRenderModel;
};

