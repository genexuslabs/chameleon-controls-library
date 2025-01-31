import { ActionGroupModel } from "../../../../components";

const START_IMG_TYPE = "background";
const END_IMG_TYPE = "background";

const ASSETS_PREFIX = "showcase/pages/assets/icons/";

export const modelMinimal: ActionGroupModel = [
  {
    id: "item-1",
    startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
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
        startImgSrc: `${ASSETS_PREFIX}file.svg`,
        startImgType: START_IMG_TYPE,
        caption: "Item 1-3"
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

export const modelMediumMinimal: ActionGroupModel = [
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
    // itemsResponsiveCollapsePosition: "OutsideEnd_InsideStart",
    caption: "More Actionsssssss"
    // showSeparator: false
  },
  {
    id: "item-3",
    startImgSrc: `${ASSETS_PREFIX}file.svg`,
    startImgType: START_IMG_TYPE,
    link: { url: "https://www.google.com.uy" },
    caption: "Googleeeeeeee"
    // showSeparator: false
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
        caption: subSubModelId
      });
    }

    subEagerLargeModel.push({
      id: subModelId,
      startImgSrc: `${ASSETS_PREFIX}patterns.svg`,
      startImgType: START_IMG_TYPE,
      endImgSrc: `${ASSETS_PREFIX}knowledge-base.svg`,
      endImgType: END_IMG_TYPE,
      items: subSubEagerLargeModel,
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
    caption: modelId,
    showSeparator: i % 3 === 0
  });
}

export const GXWebModel: ActionGroupModel = [
  {
    caption: "File",
    // itemsPosition: "InsideStart_OutsideEnd",
    items: [
      {
        caption: "New",
        // subActionClass: "dropdown-item dropdown-item-web",
        // itemsPosition: "OutsideEnd_InsideStart",
        items: [
          {
            caption: "New Knowledge Base",
            // subActionClass: "dropdown-item dropdown-item-web",
            shortcut: "Ctrl+Alt+Shift+N",
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
        // subActionClass: "dropdown-item dropdown-item-web",

        shortcut: "Ctrl+S",
        startImgSrc: `${ASSETS_PREFIX}save.svg`
      },
      {
        caption: "Save All",
        // subActionClass: "dropdown-item dropdown-item-web",

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
        caption: "Domains",
        // subActionClass: "dropdown-item dropdown-item-web",
        startImgSrc: `${ASSETS_PREFIX}domain.svg`
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

  { type: "separator" },
  {
    caption: "Tools",
    // itemsPosition: "InsideStart_OutsideEnd",
    items: [
      {
        caption: "Sketch Import"
      }
    ]
  },

  { id: "pepe", type: "slot" }
];
