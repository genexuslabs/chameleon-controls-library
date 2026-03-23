import type { ChameleonPublicControlsTagName } from "../../typings/chameleon-components";
import { chameleonRegistry } from "./chameleon-registry";
import type { PlaygroundJsonRenderModel } from "./typings/playground-json-render-model";

export const playgroundEditorModels = {
  "ch-accordion-render": {
    registry: chameleonRegistry,
    stateTypes: {
      expandableButtonPosition: {
        type: "enum" as const,
        options: ["start", "end"]
      }
    },
    spec: {
      root: "root",
      state: {
        disabled: false,
        expandableButtonPosition: "end",
        singleItemExpanded: false
      },
      elements: {
        root: {
          type: "ch-accordion-render",
          props: {
            disabled: { $bindState: "/disabled" },
            expandableButtonPosition: {
              $bindState: "/expandableButtonPosition"
            },
            singleItemExpanded: { $bindState: "/singleItemExpanded" }
          }
        }
      }
    }
  },

  "ch-action-group-render": {
    registry: chameleonRegistry,
    stateTypes: {
      itemsOverflowBehavior: {
        type: "enum" as const,
        options: ["add-scroll", "multiline", "responsive-collapse"]
      }
    },
    spec: {
      root: "root",
      state: {
        disabled: false,
        itemsOverflowBehavior: "responsive-collapse"
      },
      elements: {
        root: {
          type: "ch-action-group-render",
          props: {
            disabled: { $bindState: "/disabled" },
            itemsOverflowBehavior: {
              $bindState: "/itemsOverflowBehavior"
            }
          }
        }
      }
    }
  },

  "ch-action-list-render": {
    registry: chameleonRegistry,
    stateTypes: {
      selection: {
        type: "enum" as const,
        options: ["none", "single", "multiple"]
      }
    },
    spec: {
      root: "root",
      state: {
        checkbox: false,
        disabled: false,
        editableItems: true,
        selection: "none"
      },
      elements: {
        root: {
          type: "ch-action-list-render",
          props: {
            checkbox: { $bindState: "/checkbox" },
            disabled: { $bindState: "/disabled" },
            editableItems: { $bindState: "/editableItems" },
            selection: { $bindState: "/selection" }
          }
        }
      }
    }
  },

  "ch-action-menu-render": {
    registry: chameleonRegistry,
    stateTypes: {
      blockAlign: {
        type: "enum" as const,
        options: [
          "outside-start",
          "inside-start",
          "center",
          "inside-end",
          "outside-end"
        ]
      },
      inlineAlign: {
        type: "enum" as const,
        options: [
          "outside-start",
          "inside-start",
          "center",
          "inside-end",
          "outside-end"
        ]
      },
      positionTry: {
        type: "enum" as const,
        options: ["none", "flip-block", "flip-inline"]
      }
    },
    spec: {
      root: "root",
      state: {
        blockAlign: "outside-end",
        buttonAccessibleName: "Actions",
        disabled: false,
        expanded: false,
        inlineAlign: "center",
        positionTry: "none"
      },
      elements: {
        root: {
          type: "ch-action-menu-render",
          props: {
            blockAlign: { $bindState: "/blockAlign" },
            buttonAccessibleName: { $bindState: "/buttonAccessibleName" },
            disabled: { $bindState: "/disabled" },
            expanded: { $bindState: "/expanded" },
            inlineAlign: { $bindState: "/inlineAlign" },
            positionTry: { $bindState: "/positionTry" }
          }
        }
      }
    }
  },

  "ch-checkbox": {
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

  "ch-combo-box-render": {
    registry: chameleonRegistry,
    spec: {
      root: "root",
      state: {
        accessibleName: "",
        disabled: false,
        placeholder: "",
        readonly: false,
        suggest: false,
        value: "opt-1"
      },
      elements: {
        root: {
          type: "ch-combo-box-render",
          props: {
            accessibleName: { $bindState: "/accessibleName" },
            disabled: { $bindState: "/disabled" },
            placeholder: { $bindState: "/placeholder" },
            readonly: { $bindState: "/readonly" },
            suggest: { $bindState: "/suggest" },
            value: { $bindState: "/value" }
          }
        }
      }
    }
  },

  "ch-image": {
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

  "ch-math-viewer": {
    registry: chameleonRegistry,
    stateTypes: {
      displayMode: {
        type: "enum" as const,
        options: ["block", "inline"]
      },
      value: { type: "string-multiline" as const }
    },
    spec: {
      root: "root",
      state: {
        displayMode: "block",
        value: "E = mc^2"
      },
      elements: {
        root: {
          type: "ch-math-viewer",
          props: {
            displayMode: { $bindState: "/displayMode" },
            value: { $bindState: "/value" }
          }
        }
      }
    }
  },

  "ch-popover": {
    registry: chameleonRegistry,
    stateTypes: {
      allowDrag: {
        type: "enum" as const,
        options: ["no", "box", "header"]
      },
      blockAlign: {
        type: "enum" as const,
        options: [
          "outside-start",
          "inside-start",
          "center",
          "inside-end",
          "outside-end"
        ]
      },
      blockSizeMatch: {
        type: "enum" as const,
        options: ["content", "action-element", "action-element-as-minimum"]
      },
      inlineAlign: {
        type: "enum" as const,
        options: [
          "outside-start",
          "inside-start",
          "center",
          "inside-end",
          "outside-end"
        ]
      },
      inlineSizeMatch: {
        type: "enum" as const,
        options: ["content", "action-element", "action-element-as-minimum"]
      },
      mode: {
        type: "enum" as const,
        options: ["auto", "manual"]
      },
      overflowBehavior: {
        type: "enum" as const,
        options: ["overflow", "add-scroll"]
      },
      positionTry: {
        type: "enum" as const,
        options: ["none", "flip-block", "flip-inline"]
      }
    },
    spec: {
      root: "root",
      state: {
        allowDrag: "no",
        blockAlign: "center",
        blockSizeMatch: "content",
        closeOnClickOutside: false,
        inlineAlign: "center",
        inlineSizeMatch: "content",
        mode: "auto",
        overflowBehavior: "overflow",
        positionTry: "none",
        resizable: false,
        show: false
      },
      elements: {
        root: {
          type: "ch-popover",
          props: {
            allowDrag: { $bindState: "/allowDrag" },
            blockAlign: { $bindState: "/blockAlign" },
            blockSizeMatch: { $bindState: "/blockSizeMatch" },
            closeOnClickOutside: { $bindState: "/closeOnClickOutside" },
            inlineAlign: { $bindState: "/inlineAlign" },
            inlineSizeMatch: { $bindState: "/inlineSizeMatch" },
            mode: { $bindState: "/mode" },
            overflowBehavior: { $bindState: "/overflowBehavior" },
            positionTry: { $bindState: "/positionTry" },
            resizable: { $bindState: "/resizable" },
            show: { $bindState: "/show" }
          }
        }
      }
    }
  },

  "ch-qr": {
    registry: chameleonRegistry,
    stateTypes: {
      errorCorrectionLevel: {
        type: "enum" as const,
        options: ["Low", "Medium", "Quartile", "High"]
      }
    },
    spec: {
      root: "root",
      state: {
        accessibleName: "",
        background: "white",
        errorCorrectionLevel: "High",
        fill: "black",
        radius: 0,
        size: 128,
        value: "https://chameleon.genexus.com"
      },
      elements: {
        root: {
          type: "ch-qr",
          props: {
            accessibleName: { $bindState: "/accessibleName" },
            background: { $bindState: "/background" },
            errorCorrectionLevel: { $bindState: "/errorCorrectionLevel" },
            fill: { $bindState: "/fill" },
            radius: { $bindState: "/radius" },
            size: { $bindState: "/size" },
            value: { $bindState: "/value" }
          }
        }
      }
    }
  },

  "ch-radio-group-render": {
    registry: chameleonRegistry,
    stateTypes: {
      direction: {
        type: "enum" as const,
        options: ["horizontal", "vertical"]
      }
    },
    spec: {
      root: "root",
      state: {
        direction: "horizontal",
        disabled: false,
        name: "",
        value: ""
      },
      elements: {
        root: {
          type: "ch-radio-group-render",
          props: {
            direction: { $bindState: "/direction" },
            disabled: { $bindState: "/disabled" },
            name: { $bindState: "/name" },
            value: { $bindState: "/value" }
          }
        }
      }
    }
  },

  "ch-segmented-control-render": {
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

  "ch-sidebar": {
    registry: chameleonRegistry,
    stateTypes: {
      expandButtonPosition: {
        type: "enum" as const,
        options: ["before", "after"]
      }
    },
    spec: {
      root: "root",
      state: {
        expandButtonCollapseCaption: "",
        expandButtonExpandCaption: "",
        expandButtonPosition: "after",
        expanded: true,
        showExpandButton: false
      },
      elements: {
        root: {
          type: "ch-sidebar",
          props: {
            expandButtonCollapseCaption: {
              $bindState: "/expandButtonCollapseCaption"
            },
            expandButtonExpandCaption: {
              $bindState: "/expandButtonExpandCaption"
            },
            expandButtonPosition: {
              $bindState: "/expandButtonPosition"
            },
            expanded: { $bindState: "/expanded" },
            showExpandButton: { $bindState: "/showExpandButton" }
          }
        }
      }
    }
  },

  "ch-slider": {
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

  "ch-status": {
    registry: chameleonRegistry,
    spec: {
      root: "root",
      state: {
        accessibleName: "Loading"
      },
      elements: {
        root: {
          type: "ch-status",
          props: {
            accessibleName: { $bindState: "/accessibleName" }
          }
        }
      }
    }
  },

  "ch-switch": {
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
  },

  "ch-tab-render": {
    registry: chameleonRegistry,
    stateTypes: {
      tabListPosition: {
        type: "enum" as const,
        options: ["block-start", "block-end", "inline-start", "inline-end"]
      }
    },
    spec: {
      root: "root",
      state: {
        closeButton: false,
        disabled: false,
        selectedId: "tab-1",
        showCaptions: true,
        sortable: false,
        tabListPosition: "block-start"
      },
      elements: {
        root: {
          type: "ch-tab-render",
          props: {
            closeButton: { $bindState: "/closeButton" },
            disabled: { $bindState: "/disabled" },
            selectedId: { $bindState: "/selectedId" },
            showCaptions: { $bindState: "/showCaptions" },
            sortable: { $bindState: "/sortable" },
            tabListPosition: { $bindState: "/tabListPosition" }
          }
        }
      }
    }
  }
} as const satisfies {
  [key in ChameleonPublicControlsTagName]?: PlaygroundJsonRenderModel;
};

