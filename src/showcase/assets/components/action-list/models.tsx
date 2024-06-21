import {
  ActionListItemAdditionalInformation,
  ActionListModel
} from "../../../../components/action-list/types";
import { h } from "@stencil/core";

const ASSETS_PREFIX = "showcase/pages/assets/icons/";
const chatIconPath =
  "https://unpkg.com/@genexus/unanimo@0.10.0/dist/assets/icons/chat.svg";

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
            center: [{ imageSrc: `${ASSETS_PREFIX}knowledge-base.svg` }]
          }
        }
      },
      {
        id: "Button",
        type: "actionable",
        caption: "Button",
        additionalInformation: {
          "stretch-start": {
            center: [{ imageSrc: `${ASSETS_PREFIX}knowledge-base.svg` }]
          }
        }
      },
      {
        id: "Component",
        type: "actionable",
        caption: "Component",
        additionalInformation: {
          "stretch-start": {
            center: [{ imageSrc: `${ASSETS_PREFIX}knowledge-base.svg` }]
          }
        }
      },
      {
        id: "Image",
        type: "actionable",
        caption: "Image",
        additionalInformation: {
          "stretch-start": {
            center: [{ imageSrc: `${ASSETS_PREFIX}knowledge-base.svg` }]
          }
        }
      },
      {
        id: "TextBlock",
        type: "actionable",
        caption: "TextBlock",
        additionalInformation: {
          "stretch-start": {
            center: [{ imageSrc: `${ASSETS_PREFIX}knowledge-base.svg` }]
          }
        }
      },
      {
        id: "UserControl",
        type: "actionable",
        caption: "User Control",
        additionalInformation: {
          "stretch-start": {
            center: [{ imageSrc: `${ASSETS_PREFIX}knowledge-base.svg` }]
          }
        }
      }
    ]
  }
];

const GxEAIRecentChatsAdditionalInfo: ActionListItemAdditionalInformation = {
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
    additionalInformation: GxEAIRecentChatsAdditionalInfo
  },
  {
    id: "Investors reports",
    type: "actionable",
    caption: "Investors reports",
    additionalInformation: GxEAIRecentChatsAdditionalInfo
  },
  {
    id: "2022 employee contracts",
    type: "actionable",
    caption: "2022 employee contracts",
    additionalInformation: GxEAIRecentChatsAdditionalInfo
  },
  {
    id: "Yesterday",
    type: "group",
    caption: "Yesterday",
    items: [
      {
        id: "Pluto Exploration Contract",
        type: "actionable",
        caption: "Pluto Exploration Contract",
        additionalInformation: GxEAIRecentChatsAdditionalInfo
      },
      {
        id: "Saturn Exploration Contract",
        type: "actionable",
        fixed: true,
        caption: "Saturn Exploration Contract",
        additionalInformation: GxEAIRecentChatsAdditionalInfo
      },
      {
        id: "Mars Exploration Contract",
        type: "actionable",
        caption: "Mars Exploration Contract",
        additionalInformation: GxEAIRecentChatsAdditionalInfo
      }
    ]
  }
];

const redDotIconPath =
  "https://unpkg.com/@genexus/unanimo@0.10.0/dist/assets/icons/error.svg";

export const GxEAINotifications: ActionListModel = [
  {
    id: "Project Name 1",
    type: "actionable",
    caption: "Project Name",
    additionalInformation: {
      "inline-caption": { end: [{ imageSrc: redDotIconPath }] },
      "block-end": {
        start: [
          { caption: "Ticket #ID Finalized" },
          { caption: "Just now", part: "time" }
        ]
      }
    }
  },
  { type: "separator" },
  {
    id: "Project Name 2",
    type: "actionable",
    caption: "We've updated our privacy policy.",
    additionalInformation: {
      "block-end": {
        start: [
          {
            caption: "We've updated our privacy policy.\nCheck out the changes "
          },
          {
            caption: "here",
            action: {
              type: "custom",
              callback: () => {
                console.log("hola");
              }
            },
            part: "hyperlink-notification"
          },
          { caption: ". If you have any question, feel free to contact us!" },
          { caption: "15 minutes ago", part: "time" }
        ]
      }
    }
  },
  { type: "separator" },
  {
    id: "Project Name 3",
    type: "actionable",
    caption: "We've updated our privacy policy.",
    additionalInformation: {
      "block-end": {
        start: [
          {
            caption: "We've updated our privacy policy.\nCheck out the changes "
          },
          {
            caption: "here",
            action: {
              type: "custom",
              callback: () => {
                console.log("hola");
              }
            },
            part: "hyperlink-notification"
          },
          { caption: ". If you have any question, feel free to contact us!" },
          {
            jsx: () => (
              <ch-checkbox
                caption="hola"
                unCheckedValue="false"
                checkedValue="true"
                value=""
              ></ch-checkbox>
            )
          }
        ]
      }
    }
  }
];

export const keyboardNavigation: ActionListModel = [
  {
    id: "item 1",
    type: "group",
    caption: "item 1",
    expandable: true,
    expanded: true,
    items: [
      {
        id: "item 1.1",
        type: "actionable",
        caption: "item 1.1"
      },
      {
        id: "item 1.2",
        type: "actionable",
        caption: "item 1.2"
      },
      {
        id: "item 1.3",
        type: "actionable",
        caption: "item 1.3"
      },
      {
        id: "item 1.4",
        type: "actionable",
        caption: "item 1.4"
      }
    ]
  },
  { type: "separator" },
  {
    id: "item 2",
    type: "group",
    caption: "item 2",
    expandable: true,
    expanded: false,
    items: [
      {
        id: "item 2.1",
        type: "actionable",
        caption: "item 2.1",
        disabled: true
      },
      {
        id: "item 2.2",
        type: "actionable",
        caption: "item 2.2"
      },
      {
        id: "item 2.3",
        type: "actionable",
        caption: "item 2.3",
        disabled: true
      },
      {
        id: "item 2.4",
        type: "actionable",
        caption: "item 2.4"
      }
    ]
  },
  { type: "separator" },
  {
    id: "item 3",
    type: "group",
    caption: "item 3",
    expandable: true,
    expanded: false,
    items: [
      {
        id: "item 3.1",
        type: "actionable",
        caption: "item 3.1",
        disabled: true
      },
      {
        id: "item 3.2",
        type: "actionable",
        caption: "item 3.2"
      },
      {
        id: "item 3.3",
        type: "actionable",
        caption: "item 3.3",
        disabled: true
      },
      {
        id: "item 3.4",
        type: "actionable",
        caption: "item 3.4",
        disabled: true
      }
    ]
  },
  { type: "separator" },
  {
    id: "item 4",
    type: "group",
    caption: "item 4",
    disabled: true,
    expandable: true,
    expanded: false,
    items: [
      {
        id: "item 4.1",
        type: "actionable",
        caption: "item 4.1",
        disabled: true
      },
      {
        id: "item 4.2",
        type: "actionable",
        caption: "item 4.2"
      }
    ]
  },
  { type: "separator" },
  {
    id: "item 5",
    type: "group",
    caption: "item 5",
    items: [
      {
        id: "item 5.1",
        type: "actionable",
        caption: "item 5.1",
        disabled: true
      },
      {
        id: "item 5.2",
        type: "actionable",
        caption: "item 5.2"
      },
      {
        id: "item 5.3",
        type: "actionable",
        caption: "item 5.3",
        disabled: true
      },
      {
        id: "item 5.4",
        type: "actionable",
        caption: "item 5.4",
        disabled: true
      }
    ]
  },
  { type: "separator" },
  {
    id: "item 6",
    type: "group",
    caption: "item 6",
    items: [
      {
        id: "item 6.1",
        type: "actionable",
        caption: "item 6.1",
        disabled: true
      },
      {
        id: "item 6.1",
        type: "actionable",
        caption: "item 6.1",
        disabled: true
      }
    ]
  },
  { type: "separator" },
  {
    id: "item 7",
    type: "actionable",
    caption: "item 7"
  },
  {
    id: "item 8",
    type: "actionable",
    caption: "item 8"
  },
  {
    id: "item 9",
    type: "actionable",
    caption: "item 9"
  },
  {
    id: "item 10",
    type: "group",
    caption: "item 10",
    expandable: true,
    items: [
      {
        id: "item 10.1",
        type: "actionable",
        caption: "item 10.1",
        disabled: true
      },
      {
        id: "item 10.1",
        type: "actionable",
        caption: "item 10.1",
        disabled: true
      }
    ]
  },
  { type: "separator" },
  {
    id: "item 11",
    type: "group",
    caption: "item 11",
    expandable: true,
    expanded: true,
    items: [
      {
        id: "item 11.1",
        type: "actionable",
        caption: "item 11.1"
      },
      {
        id: "item 11.2",
        type: "actionable",
        caption: "item 11.2",
        disabled: true
      }
    ]
  },
  { type: "separator" },
  {
    id: "item 12",
    type: "actionable",
    caption: "item 12"
  },
  {
    id: "item 13",
    type: "actionable",
    caption: "item 13",
    disabled: true
  },
  { type: "separator" },
  {
    id: "item 14",
    type: "group",
    caption: "item 14",
    disabled: true,
    items: [
      {
        id: "item 14.1",
        type: "actionable",
        caption: "item 14.1"
      },
      {
        id: "item 14.1",
        type: "actionable",
        caption: "item 14.1"
      }
    ]
  }
];
