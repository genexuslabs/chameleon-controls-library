// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Basic test for validating default values of the interfaces.
// We also validate that components have Shadow DOM, their config for the
// shadow root and for the Component decorator.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

import type { ChameleonControlsTagName } from "../../typings/chameleon-components";
import type { ArgumentTypes } from "../../typings/types";
import { disableAccessibilityReports } from "../../utilities/analysis/reports";
import { testBasicInterfaceChecks } from "../implementation/basic-interface-checks";

disableAccessibilityReports();

export const testConfiguration = {
  "ch-checkbox": {
    interface: {
      accessibleName: undefined,
      caption: undefined,
      checked: false,
      disabled: false,
      getImagePathCallback: undefined,
      indeterminate: false,
      name: undefined,
      readonly: false,
      startImgSrc: undefined,
      startImgType: "background",
      value: "on"
    },
    options: {
      shadow: {
        delegatesFocus: true,
        formAssociated: true
      }
    }
  },

  "ch-code": {
    interface: {
      language: "txt",
      lastNestedChildClass: "last-nested-child",
      showIndicator: false,
      value: undefined
    }
  },

  "ch-image": {
    interface: {
      containerRef: undefined,
      disabled: false,
      getImagePathCallback: undefined,
      src: undefined,
      styles: undefined,
      type: "background"
    }
  },

  "ch-layout-splitter": {
    interface: {
      barAccessibleName: "Resize",
      dragBarDisabled: false,
      incrementWithKeyboard: 2,
      model: {
        id: "root",
        direction: "columns",
        items: []
      }
    }
  },

  "ch-navigation-list-item": {
    interface: {
      caption: undefined,
      disabled: undefined,
      expandable: false,
      expandableButton: "decorative",
      expandableButtonPosition: "start",
      expanded: undefined,
      // Don't use the NAVIGATION_LIST_ITEM_EXPORT_PARTS, as this value can
      // change depending on the implementation and the test will not notice
      // this change
      exportparts: "",
      getImagePathCallback: undefined,
      level: 0,
      link: undefined,
      model: undefined,
      navigationListExpanded: true,
      selected: false,
      selectedLinkIndicator: false,
      showCaptionOnCollapse: "inline",
      startImgSrc: undefined,
      startImgType: undefined,
      tooltipDelay: 100
    },
    options: {}
  },

  "ch-navigation-list-render": {
    interface: {
      autoGrow: false,
      expandableButton: "decorative",
      expandableButtonPosition: "start",
      expanded: true,
      expandSelectedLink: false,
      getImagePathCallback: undefined,
      model: undefined,
      renderItem: undefined,
      selectedLink: {
        link: { url: undefined }
      },
      selectedLinkIndicator: false,
      showCaptionOnCollapse: "inline",
      tooltipDelay: 100
    }
  },

  "ch-progress": {
    interface: {
      accessibleName: undefined,
      accessibleValueText: undefined,
      indeterminate: false,
      loadingRegionRef: undefined,
      max: 100,
      min: 0,
      name: undefined,
      renderType: "custom",
      value: 0
    },
    options: {
      shadow: {
        formAssociated: true
      }
    }
  },

  "ch-qr": {
    interface: {
      accessibleName: undefined,
      background: "white",
      errorCorrectionLevel: "High",
      fill: "black",
      radius: 0,
      size: 128,
      value: undefined
    }
  },

  "ch-radio-group-render": {
    interface: {
      direction: "horizontal",
      disabled: false,
      model: undefined,
      name: undefined,
      value: undefined
    },
    options: {
      shadow: {
        delegatesFocus: true,
        formAssociated: true
      }
    }
  },

  "ch-segmented-control-item": {
    interface: {
      accessibleName: undefined,
      between: false,
      caption: undefined,
      disabled: false,
      endImgSrc: undefined,
      endImgType: undefined,
      first: false,
      last: false,
      selected: undefined,
      startImgSrc: undefined,
      startImgType: undefined
    }
  },

  "ch-segmented-control-render": {
    interface: {
      model: undefined,
      selectedId: undefined
    },
    options: {
      shadow: false
    }
  },

  "ch-sidebar": {
    interface: {
      expandButtonCollapseAccessibleName: undefined,
      expandButtonCollapseCaption: undefined,
      expandButtonExpandAccessibleName: undefined,
      expandButtonExpandCaption: undefined,
      expandButtonPosition: "after",
      expanded: true,
      showExpandButton: false
    }
  },

  "ch-slider": {
    interface: {
      accessibleName: undefined,
      disabled: false,
      maxValue: 5,
      minValue: 0,
      name: undefined,
      showValue: false,
      step: 1,
      value: 0
    },
    options: {
      shadow: {
        delegatesFocus: true,
        formAssociated: true
      }
    }
  },

  "ch-switch": {
    interface: {
      accessibleName: undefined,
      checked: false,
      checkedCaption: undefined,
      disabled: false,
      name: undefined,
      readonly: false,
      unCheckedCaption: undefined,
      value: "on"
    },
    options: {
      shadow: {
        delegatesFocus: true,
        formAssociated: true
      }
    }
  },

  "ch-textblock": {
    interface: {
      autoGrow: false,
      caption: undefined,
      characterToMeasureLineHeight: "A",
      format: "text",
      showTooltipOnOverflow: false
    }
  }

  // TODO: Fix the ch-theme test
  // "ch-theme": {
  //   interface: {
  //     attachStyleSheets: true,
  //     avoidFlashOfUnstyledContent: true,
  //     model: undefined,
  //     timeout: 10000
  //   },
  //   options: {
  //     shadow: false
  //   }
  // }
} as const satisfies {
  [key in ChameleonControlsTagName]: {
    interface: ArgumentTypes<typeof testBasicInterfaceChecks<key>>[1];
    options?: ArgumentTypes<typeof testBasicInterfaceChecks<key>>[2];
  };
};

Object.entries(testConfiguration).forEach(([key, value]) =>
  testBasicInterfaceChecks(
    key as keyof typeof testConfiguration,
    value.interface,
    value.options
  )
);

