import {
  ActionListItemAdditionalInformation,
  ActionListModel
} from "../../../../components/action-list/types";

const ASSETS_PREFIX = "showcase/pages/assets/icons/";
const chatIconPath =
  "https://unpkg.com/@genexus/unanimo@0.10.0/dist/assets/icons/chat.svg";

const pinOutlinedIconPath =
  "https://unpkg.com/@genexus/unanimo@0.10.0/dist/assets/icons/pin-outlined.svg";
const unpinOutlinedIconPath =
  "https://unpkg.com/@genexus/unanimo@0.10.0/dist/assets/icons/unpin-outlined.svg";

const editIconPath =
  "https://unpkg.com/@genexus/unanimo@0.10.0/dist/assets/icons/edit.svg";

const deleteIconPath =
  "https://unpkg.com/@genexus/unanimo@0.10.0/dist/assets/icons/delete.svg";

export const GitHubHistoryModel: ActionListModel = [
  {
    id: "5903474",
    type: "actionable",
    caption: "6.0.0-next.5",
    additionalInformation: {
      "block-end": {
        start: [
          {
            imageSrc: "https://avatars.githubusercontent.com/u/81186472?v=4"
          },
          { caption: "Nicolás Cámera" },
          { caption: "6 days ago" }
        ]
      },
      "stretch-end": {
        center: [{ caption: "6.0.0-next.5" }]
      }
    }
  },
  {
    id: "d47cb85",
    type: "actionable",
    caption:
      'Improve consistency across all interfaces that implement a UI Model ("-render" controls)',
    additionalInformation: {
      "block-end": {
        start: [
          {
            imageSrc: "https://avatars.githubusercontent.com/u/81186472?v=4"
          },
          { caption: "Nicolás Cámera" },
          { caption: "6 days ago" }
        ]
      }
    }
  },
  {
    id: "ce20ad5",
    type: "actionable",
    caption:
      "Fix for disabled not working properly in `ch-combo-box` and add support for `destroyItemsOnClose` property",
    additionalInformation: {
      "block-end": {
        start: [
          {
            imageSrc: "https://avatars.githubusercontent.com/u/81186472?v=4"
          },
          { caption: "Nicolás Cámera" },
          { caption: "6 days ago" }
        ]
      }
    }
  },
  {
    id: "3bf650f",
    type: "actionable",
    caption: "[ch-grid] Fix errors related to selection",
    additionalInformation: {
      "block-end": {
        start: [
          {
            imageSrc:
              "https://avatars.githubusercontent.com/u/49991370?s=96&v=4"
          },
          { caption: "Daniel Mariño" },
          { caption: "7 days ago" }
        ]
      }
    }
  }
];

export const GitHubChangesModel: ActionListModel = [
  {
    id: "src/common/renders.tsx",
    checkbox: true,
    checked: true,
    type: "actionable",
    caption: "",
    additionalInformation: {
      "inline-caption": {
        start: [
          { caption: "src\\common\\", part: "github-changes-directory" },
          { caption: "renders.tsx", part: "github-changes-file" }
        ],
        end: [{ imageSrc: "new" }]
      }
    }
  },
  {
    id: "src/components.d.ts",
    checkbox: true,
    checked: true,
    type: "actionable",
    caption: "",
    additionalInformation: {
      "inline-caption": {
        start: [
          {
            caption: "src\\",
            part: "github-changes-directory"
          },
          {
            caption: "components.d.ts",
            part: "github-changes-file"
          }
        ],
        end: [{ imageSrc: "modified" }]
      }
    }
  },
  {
    id: "src/components/action-list/action-list-render.scss",
    checkbox: true,
    checked: true,
    type: "actionable",
    caption: "",
    additionalInformation: {
      "inline-caption": {
        start: [
          {
            caption: "src\\components\\action-list\\",
            part: "github-changes-directory"
          },
          {
            caption: "action-list-render.scss",
            part: "github-changes-file"
          }
        ],
        end: [{ imageSrc: "new" }]
      }
    }
  },
  {
    id: "src/components/action-list/internal/action-list-item/action-list-item.scss",
    checkbox: true,
    checked: true,
    type: "actionable",
    caption: "",
    additionalInformation: {
      "inline-caption": {
        start: [
          {
            caption:
              "src\\components\\action-list\\internal\\action-list-item\\",
            part: "github-changes-directory"
          },
          {
            caption: "action-list-item.scss",
            part: "github-changes-file"
          }
        ],
        end: [{ imageSrc: "new" }]
      }
    }
  },
  {
    id: "src/components/action-list/internal/action-list-item/action-list-item.tsx",
    checkbox: true,
    checked: true,
    type: "actionable",
    caption: "",
    additionalInformation: {
      "inline-caption": {
        start: [
          {
            caption:
              "src\\components\\action-list\\internal\\action-list-item\\",
            part: "github-changes-directory"
          },
          {
            caption: "action-list-item.tsx",
            part: "github-changes-file"
          }
        ],
        end: [{ imageSrc: "new" }]
      }
    }
  }
];

export const agentTickets: ActionListModel = [
  {
    id: "SISALGONT-10745",
    type: "actionable",
    caption: "SISALGONT-10745",
    additionalInformation: {
      "block-start": {
        start: [{ caption: "Pending", part: "pending" }]
      },
      "block-end": {
        start: [
          {
            caption: "Incorrect validation on user registratio..."
          }
        ]
      },
      "stretch-end": {
        center: [{ caption: "Medium", part: "priority" }]
      }
    }
  },
  {
    id: "SISALGONT-10745",
    type: "actionable",
    caption: "SISALGONT-10745",
    additionalInformation: {
      "block-start": {
        start: [{ caption: "Closed", part: "closed" }]
      },
      "block-end": {
        start: [
          {
            caption: "Image upload feature not working as ex..."
          }
        ]
      },
      "stretch-end": {
        center: [{ caption: "High", part: "priority" }]
      }
    }
  },
  {
    id: "SISALGONT-10745",
    type: "actionable",
    caption: "SISALGONT-10745",
    additionalInformation: {
      "block-start": {
        start: [{ caption: "Error", part: "error" }]
      },
      "block-end": {
        start: [
          {
            caption: "Broken link in footer navigation leadin..."
          }
        ]
      },
      "stretch-end": {
        center: [{ caption: "Medium", part: "priority" }]
      }
    }
  },
  {
    id: "SISALGONT-10745",
    type: "actionable",
    caption: "SISALGONT-10745",
    additionalInformation: {
      "block-start": {
        start: [{ caption: "Processing", part: "processing" }]
      },
      "block-end": {
        start: [
          {
            caption: "Mismatch between email body content..."
          }
        ]
      },
      "stretch-end": {
        center: [{ caption: "Medium", part: "priority" }]
      }
    }
  },
  {
    id: "SISALGONT-10745",
    type: "actionable",
    caption: "SISALGONT-10745",
    additionalInformation: {
      "block-start": {
        start: [{ caption: "Pending", part: "pending" }]
      },
      "block-end": {
        start: [
          {
            caption: "JavaScript error preventing checkout..."
          }
        ]
      },
      "stretch-end": {
        center: [{ caption: "Medium", part: "priority" }]
      }
    }
  },
  {
    id: "SISALGONT-10745",
    type: "actionable",
    caption: "SISALGONT-10745",
    additionalInformation: {
      "block-start": {
        start: [{ caption: "Open", part: "open" }]
      },
      "block-end": {
        start: [
          {
            caption: "Inconsistent behavior in mobile view..."
          }
        ]
      },
      "stretch-end": {
        center: [{ caption: "Low", part: "priority" }]
      }
    }
  },
  {
    id: "SISALGONT-10745",
    type: "actionable",
    caption: "SISALGONT-10745",
    additionalInformation: {
      "block-start": {
        start: [{ caption: "Analyzing", part: "processing" }]
      },
      "block-end": {
        start: [
          {
            caption: "Mismatch between email body content..."
          }
        ]
      },
      "stretch-end": {
        center: [{ caption: "Medium", part: "priority" }]
      }
    }
  }
];

export const recentKBs: ActionListModel = [
  {
    id: "TestIDEWeb",
    type: "actionable",
    caption: "TestIDEWeb",
    additionalInformation: {
      "stretch-start": {
        start: [{ imageSrc: `${ASSETS_PREFIX}knowledge-base.svg` }]
      }
    }
  },
  {
    id: "AngularVisualTests",
    type: "actionable",
    caption: "AngularVisualTests",
    additionalInformation: {
      "stretch-start": {
        start: [{ imageSrc: `${ASSETS_PREFIX}knowledge-base.svg` }]
      }
    }
  },
  {
    id: "AngularPlayground",
    type: "actionable",
    caption: "AngularPlayground",
    additionalInformation: {
      "stretch-start": {
        start: [{ imageSrc: `${ASSETS_PREFIX}knowledge-base.svg` }]
      }
    }
  },
  {
    id: "AngularAccessibility",
    type: "actionable",
    caption: "AngularAccessibility",
    additionalInformation: {
      "stretch-start": {
        start: [{ imageSrc: `${ASSETS_PREFIX}knowledge-base.svg` }]
      }
    }
  },
  {
    id: "UnanimoShowcase",
    type: "actionable",
    caption: "UnanimoShowcase",
    additionalInformation: {
      "stretch-start": {
        start: [{ imageSrc: `${ASSETS_PREFIX}knowledge-base.svg` }]
      }
    }
  }
];

export const panelToolbox: ActionListModel = [
  {
    id: "Controls",
    type: "group",
    caption: "Controls",
    expandable: true,
    expanded: false,
    items: [
      {
        id: "Attribute/Variable",
        type: "actionable",
        caption: "Attribute/Variable",
        additionalInformation: {
          "stretch-start": {
            start: [{ imageSrc: `${ASSETS_PREFIX}knowledge-base.svg` }]
          }
        }
      },
      {
        id: "Button",
        type: "actionable",
        caption: "Button",
        additionalInformation: {
          "stretch-start": {
            start: [{ imageSrc: `${ASSETS_PREFIX}knowledge-base.svg` }]
          }
        }
      },
      {
        id: "Component",
        type: "actionable",
        caption: "Component",
        additionalInformation: {
          "stretch-start": {
            start: [{ imageSrc: `${ASSETS_PREFIX}knowledge-base.svg` }]
          }
        }
      },
      {
        id: "Image",
        type: "actionable",
        caption: "Image",
        additionalInformation: {
          "stretch-start": {
            start: [{ imageSrc: `${ASSETS_PREFIX}knowledge-base.svg` }]
          }
        }
      },
      {
        id: "TextBlock",
        type: "actionable",
        caption: "TextBlock",
        additionalInformation: {
          "stretch-start": {
            start: [{ imageSrc: `${ASSETS_PREFIX}knowledge-base.svg` }]
          }
        }
      },
      {
        id: "UserControl",
        type: "actionable",
        caption: "User Control",
        additionalInformation: {
          "stretch-start": {
            start: [{ imageSrc: `${ASSETS_PREFIX}knowledge-base.svg` }]
          }
        }
      }
    ]
  }
];

const GxEAIRecentChatsAdditionalInfoUnpinned: ActionListItemAdditionalInformation =
  {
    "stretch-start": {
      center: [{ imageSrc: chatIconPath, imageType: "mask" }]
    },
    "stretch-end": {
      center: [
        {
          accessibleName: "Edit caption",
          imageSrc: editIconPath,
          imageType: "mask",
          action: {
            type: "modify",
            showOnHover: true
          }
        },
        {
          accessibleName: "Delete item",
          imageSrc: deleteIconPath,
          imageType: "mask",
          action: {
            type: "remove",
            showOnHover: true
          }
        },
        {
          accessibleName: "Pin item",
          imageSrc: pinOutlinedIconPath,
          imageType: "mask",
          action: {
            type: "fix",
            showOnHover: true
          }
        }
      ]
    }
  };

const GxEAIRecentChatsAdditionalInfoPinned: ActionListItemAdditionalInformation =
  {
    "stretch-start": {
      center: [{ imageSrc: chatIconPath, imageType: "mask" }]
    },
    "stretch-end": {
      center: [
        {
          accessibleName: "Edit caption",
          imageSrc: editIconPath,
          imageType: "mask",
          action: {
            type: "modify",
            showOnHover: true
          }
        },
        {
          accessibleName: "Delete item",
          imageSrc: deleteIconPath,
          imageType: "mask",
          action: {
            type: "remove",
            showOnHover: true
          }
        },
        {
          accessibleName: "Pin item",
          imageSrc: unpinOutlinedIconPath,
          imageType: "mask",
          action: {
            type: "fix"
          }
        }
      ]
    }
  };

export const GxEAIRecentChats: ActionListModel = [
  {
    id: "2023 employee contracts",
    type: "actionable",
    caption: "2023 employee contracts",
    additionalInformation: GxEAIRecentChatsAdditionalInfoUnpinned
  },
  {
    id: "Investors reports",
    type: "actionable",
    caption: "Investors reports",
    additionalInformation: GxEAIRecentChatsAdditionalInfoUnpinned
  },
  {
    id: "2022 employee contracts",
    type: "actionable",
    caption: "2022 employee contracts",
    additionalInformation: GxEAIRecentChatsAdditionalInfoUnpinned
  },
  {
    id: "Yesterday",
    type: "group",
    caption: "Yesterday",
    items: [
      {
        id: "Mars Exploration Contract",
        type: "actionable",
        caption: "Mars Exploration Contract",
        additionalInformation: GxEAIRecentChatsAdditionalInfoPinned
      }
    ]
  }
];
