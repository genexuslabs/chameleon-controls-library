import type {
  DropdownImagePathCallback,
  DropdownModel
} from "../../../../components/dropdown/types";

const START_IMG_TYPE = "background";
const END_IMG_TYPE = "background";

const ASSETS_PREFIX = "showcase/pages/assets/icons/";

const FOLDER_ICON = "var(folder)";
const MODULE_ICON = "var(module)";

export const getDropdownImagePathCallback: DropdownImagePathCallback = (
  item,
  iconDirection
) => {
  if (
    (iconDirection === "start" && item.startImgSrc === MODULE_ICON) ||
    (iconDirection === "end" && item.endImgSrc === MODULE_ICON)
  ) {
    return {
      base: "var(--icon-module-base)",
      active: "var(--icon-module-active)",
      hover: "var(--icon-module-hover)",
      disabled: "var(--icon-module-disabled)",
      selected: "var(--icon-stencil-hover)"
    };
  }

  if (
    (iconDirection === "start" && item.startImgSrc === FOLDER_ICON) ||
    (iconDirection === "end" && item.endImgSrc === FOLDER_ICON)
  ) {
    return {
      base: "var(--icon-folder-base)",
      active: "var(--icon-folder-active)",
      hover: "var(--icon-folder-hover)",
      disabled: "var(--icon-folder-disabled)",
      selected: "var(--icon-stencil-hover)"
    };
  }

  return {
    base: iconDirection === "start" ? item.startImgSrc : item.endImgSrc
  };
};

export const simpleModel1: DropdownModel = [
  {
    id: "item-1",
    startImgSrc: MODULE_ICON,
    startImgType: START_IMG_TYPE,
    endImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
    endImgType: END_IMG_TYPE,
    items: [
      {
        id: "item-2-2",
        startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
        startImgType: START_IMG_TYPE,
        link: { url: "https://www.google.com.uy" },
        caption: "Google"
        // showSeparator: false
      },
      {
        id: "item-1-3",
        startImgSrc: FOLDER_ICON,
        startImgType: START_IMG_TYPE,
        caption: "Item 1-3"
        // showSeparator: false
      },
      {
        id: "item-1-4",
        startImgSrc: FOLDER_ICON,
        startImgType: START_IMG_TYPE,
        disabled: true,
        caption: "Item 1-4 (disabled)"
        // showSeparator: false
      },
      {
        id: "item-1-5",
        startImgSrc: `${ASSETS_PREFIX}file.svg`,
        startImgType: START_IMG_TYPE,
        caption: "Item 1-5"
        // showSeparator: false
      }
    ],
    caption: "Item 1"
    // showSeparator: false
  },
  {
    id: "item-2",
    startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
    startImgType: START_IMG_TYPE,
    link: { url: "https://www.google.com.uy" },
    caption: "Google"
    // showSeparator: false
  },
  { type: "slot", id: "tree" },
  {
    id: "item-3",
    startImgSrc: `${ASSETS_PREFIX}file.svg`,
    startImgType: START_IMG_TYPE,
    items: [
      {
        id: "item-3-1",
        startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
        startImgType: START_IMG_TYPE,
        endImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
        endImgType: END_IMG_TYPE,
        items: [
          {
            id: "item-3-1-1",

            startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
            startImgType: START_IMG_TYPE,
            endImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
            endImgType: END_IMG_TYPE,
            caption: "Item 3-1-1"
            // showSeparator: false
          },
          {
            id: "item-3-1-2",
            startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
            startImgType: START_IMG_TYPE,
            link: { url: "https://www.google.com.uy" },
            caption: "Google"
            // showSeparator: false
          },
          {
            id: "item-3-1-3",
            startImgSrc: `${ASSETS_PREFIX}file.svg`,
            startImgType: START_IMG_TYPE,
            caption: "Item 3-1-3"
            // showSeparator: false
          }
        ],
        caption: "Item 1-1"
        // showSeparator: false
      },
      {
        id: "item-3-2",
        startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
        startImgType: START_IMG_TYPE,
        link: { url: "https://www.google.com.uy" },
        caption: "Google"
        // showSeparator: false
      },
      {
        id: "item-3-3",
        startImgSrc: `${ASSETS_PREFIX}file.svg`,
        startImgType: START_IMG_TYPE,
        caption: "Item 3-3"
        // showSeparator: false
      }
    ],
    // itemsPosition: "OutsideStart_InsideStart",
    caption: "Item 3"
    // showSeparator: false
  }
];

export const simpleModel2: DropdownModel = [
  {
    id: "item-1",
    startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
    startImgType: START_IMG_TYPE,
    endImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
    endImgType: END_IMG_TYPE,
    link: { url: "https://github.com" },
    caption: "GitHub"
    // showSeparator: false
  },
  {
    id: "item-2",
    startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
    startImgType: START_IMG_TYPE,
    items: [
      {
        id: "item-2-1",
        startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
        startImgType: START_IMG_TYPE,
        endImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
        endImgType: END_IMG_TYPE,
        caption: "Item 1-1"
        // showSeparator: false
      },
      {
        id: "item-2-2",

        startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
        startImgType: START_IMG_TYPE,
        link: { url: "https://www.google.com.uy" },
        caption: "Google"
        // showSeparator: false
      },
      {
        id: "item-2-3",
        startImgSrc: `${ASSETS_PREFIX}file.svg`,
        startImgType: START_IMG_TYPE,
        caption: "Item 3-3"
        // showSeparator: false
      }
    ],
    // itemsPosition: "InsideStart_OutsideEnd",
    caption: "More Actionsssssss"
    // showSeparator: false
  },
  {
    id: "item-3",
    startImgSrc: `${ASSETS_PREFIX}file.svg`,
    startImgType: START_IMG_TYPE,
    link: { url: "https://www.google.com.uy" },
    caption: "Googleeeeeeee"
    // showSeparator: true
  },
  {
    id: "item-4",
    startImgSrc: `${ASSETS_PREFIX}file.svg`,
    startImgType: START_IMG_TYPE,
    link: { url: "https://www.google.com.uy" },
    caption: "Google"
    // showSeparator: false
  }
];

const FIRST_LEVEL_SIZE = 10;
const SECOND_LEVEL_SIZE = 10;
const THIRD_LEVEL_SIZE = 50;

export const eagerLargeModel = [];

for (let i = 0; i < FIRST_LEVEL_SIZE; i++) {
  const subEagerLargeModel = [];
  const modelId = "item-" + i;

  for (let j = 0; j < SECOND_LEVEL_SIZE; j++) {
    const subModelId = modelId + "-" + j;
    const subSubEagerLargeModel = [];

    for (let k = 0; k < THIRD_LEVEL_SIZE; k++) {
      const subSubModelId = subModelId + "-" + k;

      subSubEagerLargeModel.push({
        id: subSubModelId,
        startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
        startImgType: START_IMG_TYPE,
        endImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
        endImgType: END_IMG_TYPE,
        link: "",
        caption: subSubModelId
        // showSeparator: false
      });
    }

    subEagerLargeModel.push({
      id: subModelId,
      startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
      startImgType: START_IMG_TYPE,
      endImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
      endImgType: END_IMG_TYPE,
      items: subSubEagerLargeModel,
      link: "",
      caption: subModelId,
      showSeparator: j % 4 === 0
    });
  }

  eagerLargeModel.push({
    startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
    startImgType: START_IMG_TYPE,
    endImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
    endImgType: END_IMG_TYPE,
    items: subEagerLargeModel,
    link: "",
    caption: modelId,
    showSeparator: i % 3 === 0
  });
}

export const GXWebModel: DropdownModel = [
  {
    caption: "File",
    // itemsPosition: "InsideStart_OutsideEnd",
    items: [
      {
        caption: "New",
        items: [
          {
            caption: "New Knowledge Base",
            startImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`
          },
          {
            caption: "New Object",
            shortcut: "Ctrl+Alt+N"
            // showSeparator: true
          },
          {
            caption: "Knowledge Base from GeneXus Server"
          }
        ]
      },
      {
        caption: "Open Object",
        shortcut: "Ctrl+O"
        // showSeparator: true
      },
      {
        caption: "Close",
        shortcut: "Ctrl+Alt+W"
      },
      {
        caption: "Close Knowledge Base"
        // showSeparator: true
      },
      {
        caption: "Save",
        shortcut: "Ctrl+S",
        startImgSrc: `${ASSETS_PREFIX}save.svg`
      },
      {
        caption: "Save All",
        shortcut: "Ctrl+Shift+S",
        startImgSrc: `${ASSETS_PREFIX}save-all.svg`
      }
    ]
  },

  {
    caption: "View",
    // itemsPosition: "InsideStart_OutsideEnd",
    items: [
      {
        caption: "Domains"
      },
      {
        caption: "Launchpad"
      },
      {
        caption: "Start Page"
        // showSeparator: true
      },
      {
        caption: "Last Impact"
      },
      {
        caption: "Last Navigation"
      }
    ]
  },

  {
    caption: "Knowledge Manager",
    // itemsPosition: "InsideStart_OutsideEnd",
    items: [
      {
        caption: "Export"
      },
      {
        caption: "Import"
      },
      {
        caption: "Team Development"
      }
    ]
  },

  {
    caption: "Selection",
    // itemsPosition: "InsideStart_OutsideEnd",
    items: [
      {
        caption: "Select All",
        shortcut: "Ctrl+A"
      },
      {
        caption: "Expand Selection",
        shortcut: "Alt+Shift+Right"
      },
      {
        caption: "Shrink Selection",
        shortcut: "Alt+Shift+Left"
        // showSeparator: true
      },
      {
        caption: "Copy Line Up",
        shortcut: "Alt+Shift+Up"
      },
      {
        caption: "Copy Line Up",
        shortcut: "Alt+Shift+Down"
      },
      {
        caption: "Move Line Up",
        shortcut: "Alt+Up"
      },
      {
        caption: "Move Line Down",
        shortcut: "Alt+Down"
      },
      {
        caption: "Duplicate Selection"
        // showSeparator: true
      },
      {
        caption: "Add Cursor Above",
        shortcut: "Ctrl+Alt+Up"
      },
      {
        caption: "Add Cursor Below",
        shortcut: "Ctrl+Alt+Down"
      },
      {
        caption: "Add Cursors to Line Ends",
        shortcut: "Alt+Shift+I"
      },
      {
        caption: "Add Next Occurrence",
        shortcut: "Ctrl+D"
      },
      {
        caption: "Add Previous Occurrence"
      },
      {
        caption: "Select All Occurrences",
        shortcut: "Ctrl+Shift+L"
      }
    ]
  },

  {
    caption: "Build",
    // itemsPosition: "InsideStart_OutsideEnd",
    items: [
      {
        caption: "Build All"
      },
      {
        caption: "Rebuild All"
        // showSeparator: true
      },
      {
        caption: "Run",
        shortcut: "F5"
      },
      {
        caption: "Run Without Building"
        // showSeparator: true
      },
      {
        caption: "Create Database Tables"
      },
      {
        caption: "Impact Database Tables"
        // showSeparator: true
      },
      {
        caption: "Cancel Build"
        // showSeparator: true
      },
      {
        caption: "Show Live Inspector"
      },
      {
        caption: "Toggle Live Editing"
      }
    ]
  },

  {
    caption: "Tools",
    // itemsPosition: "InsideStart_OutsideEnd",
    items: [
      {
        caption: "Sketch Import"
      }
    ]
  }
];
