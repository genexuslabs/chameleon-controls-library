import type { ChameleonPublicControlsTagName } from "../../typings/chameleon-components";
import type { ThemeModel } from "../theme/theme-types";
import type { PlaygroundJsonRenderModel } from "./typings/playground-json-render-model";
import { chameleonRegistry } from "./chameleon-registry";

const MERCURY_BUNDLES: ThemeModel = [
  {
    name: "Mercury",
    url: "https://unpkg.com/@genexus/mercury@0.26.0/dist/bundles/css/all.css"
  }
];

export const playgroundEditorModels = {
  "ch-checkbox": {
    bundles: MERCURY_BUNDLES,
    registry: chameleonRegistry,
    codegenHints: { events: { input: "checked" } },
    spec: {
      root: "root",
      state: {
        accessibleName: "",
        caption: "",
        checked: false,
        disabled: false,
        indeterminate: false,
        name: "",
        readonly: false,
        startImgSrc: "",
        startImgType: "background",
        value: "on"
      },
      elements: {
        root: {
          type: "ch-checkbox",
          props: {
            accessibleName: { $bindState: "/accessibleName" },
            caption: { $bindState: "/caption" },
            checked: { $bindState: "/checked" },
            disabled: { $bindState: "/disabled" },
            indeterminate: { $bindState: "/indeterminate" },
            name: { $bindState: "/name" },
            readonly: { $bindState: "/readonly" },
            startImgSrc: { $bindState: "/startImgSrc" },
            startImgType: { $bindState: "/startImgType" },
            value: { $bindState: "/value" }
          }
        }
      }
    }
  },

  "ch-code": {
    bundles: MERCURY_BUNDLES,
    registry: chameleonRegistry,
    stateTypes: {
      value: { type: "string-multiline" as const }
    },
    spec: {
      root: "root",
      state: {
        language: "txt",
        showIndicator: false,
        value: ""
      },
      elements: {
        root: {
          type: "ch-code",
          props: {
            language: { $bindState: "/language" },
            showIndicator: { $bindState: "/showIndicator" },
            value: { $bindState: "/value" }
          }
        }
      }
    }
  },

  "ch-image": {
    bundles: MERCURY_BUNDLES,
    registry: chameleonRegistry,
    spec: {
      root: "root",
      state: {
        disabled: false,
        src: "",
        type: "background"
      },
      elements: {
        root: {
          type: "ch-image",
          props: {
            disabled: { $bindState: "/disabled" },
            src: { $bindState: "/src" },
            type: { $bindState: "/type" }
          }
        }
      }
    }
  },

  "ch-radio-group-render": {
    bundles: MERCURY_BUNDLES,
    registry: chameleonRegistry,
    spec: {
      root: "root",
      state: {},
      elements: {
        root: {
          type: "ch-radio-group-render",
          props: {}
        }
      }
    }
  },

  "ch-segmented-control-render": {
    bundles: MERCURY_BUNDLES,
    registry: chameleonRegistry,
    spec: {
      root: "root",
      state: {},
      elements: {
        root: {
          type: "ch-segmented-control-render",
          props: {}
        }
      }
    }
  },

  "ch-slider": {
    bundles: MERCURY_BUNDLES,
    registry: chameleonRegistry,
    codegenHints: { events: { input: "value" } },
    spec: {
      root: "root",
      state: {
        accessibleName: "",
        disabled: false,
        maxValue: 5,
        minValue: 0,
        name: "",
        showValue: false,
        step: 1,
        value: 0
      },
      elements: {
        root: {
          type: "ch-slider",
          props: {
            accessibleName: { $bindState: "/accessibleName" },
            disabled: { $bindState: "/disabled" },
            maxValue: { $bindState: "/maxValue" },
            minValue: { $bindState: "/minValue" },
            name: { $bindState: "/name" },
            showValue: { $bindState: "/showValue" },
            step: { $bindState: "/step" },
            value: { $bindState: "/value" }
          }
        }
      }
    }
  },

  "ch-switch": {
    bundles: MERCURY_BUNDLES,
    registry: chameleonRegistry,
    codegenHints: { events: { input: "checked" } },
    spec: {
      root: "root",
      state: {
        accessibleName: "",
        checked: false,
        checkedCaption: "",
        disabled: false,
        name: "",
        readonly: false,
        unCheckedCaption: "",
        value: "on"
      },
      elements: {
        root: {
          type: "ch-switch",
          props: {
            accessibleName: { $bindState: "/accessibleName" },
            checked: { $bindState: "/checked" },
            checkedCaption: { $bindState: "/checkedCaption" },
            disabled: { $bindState: "/disabled" },
            name: { $bindState: "/name" },
            readonly: { $bindState: "/readonly" },
            unCheckedCaption: { $bindState: "/unCheckedCaption" },
            value: { $bindState: "/value" }
          }
        }
      }
    }
  }
} as const satisfies {
  [key in ChameleonPublicControlsTagName]?: PlaygroundJsonRenderModel;
};
