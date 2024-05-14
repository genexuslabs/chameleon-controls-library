import { ActionListModel } from "../../../../components/action-list/types";

const ASSETS_PREFIX = "showcase/pages/assets/icons/";

export const GitHubHistoryModel: ActionListModel = [
  {
    id: "5903474",
    type: "actionable",
    caption: "6.0.0-next.5",
    additionalInformation: {
      "block-end": {
        start: [
          {
            type: "image",
            src: "https://avatars.githubusercontent.com/u/81186472?v=4"
          },
          { type: "text", caption: "Nicolás Cámera" },
          { type: "text", caption: "6 days ago" }
        ]
      },
      "stretch-end": {
        center: [{ type: "text", caption: "6.0.0-next.5" }]
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
            type: "image",
            src: "https://avatars.githubusercontent.com/u/81186472?v=4"
          },
          { type: "text", caption: "Nicolás Cámera" },
          { type: "text", caption: "6 days ago" }
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
            type: "image",
            src: "https://avatars.githubusercontent.com/u/81186472?v=4"
          },
          { type: "text", caption: "Nicolás Cámera" },
          { type: "text", caption: "6 days ago" }
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
            type: "image",
            src: "https://avatars.githubusercontent.com/u/49991370?s=96&v=4"
          },
          { type: "text", caption: "Daniel Mariño" },
          { type: "text", caption: "7 days ago" }
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
          {
            type: "text",
            caption: "src\\common\\",
            part: "github-changes-directory"
          },
          { type: "text", caption: "renders.tsx", part: "github-changes-file" }
        ],
        end: [{ type: "image", src: "new" }]
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
            type: "text",
            caption: "src\\",
            part: "github-changes-directory"
          },
          {
            type: "text",
            caption: "components.d.ts",
            part: "github-changes-file"
          }
        ],
        end: [{ type: "image", src: "modified" }]
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
            type: "text",
            caption: "src\\components\\action-list\\",
            part: "github-changes-directory"
          },
          {
            type: "text",
            caption: "action-list-render.scss",
            part: "github-changes-file"
          }
        ],
        end: [{ type: "image", src: "new" }]
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
            type: "text",
            caption:
              "src\\components\\action-list\\internal\\action-list-item\\",
            part: "github-changes-directory"
          },
          {
            type: "text",
            caption: "action-list-item.scss",
            part: "github-changes-file"
          }
        ],
        end: [{ type: "image", src: "new" }]
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
            type: "text",
            caption:
              "src\\components\\action-list\\internal\\action-list-item\\",
            part: "github-changes-directory"
          },
          {
            type: "text",
            caption: "action-list-item.tsx",
            part: "github-changes-file"
          }
        ],
        end: [{ type: "image", src: "new" }]
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
        start: [{ type: "text", caption: "Pending", part: "pending" }]
      },
      "block-end": {
        start: [
          {
            type: "text",
            caption: "Incorrect validation on user registratio..."
          }
        ]
      },
      "stretch-end": {
        center: [{ type: "text", caption: "Medium", part: "priority" }]
      }
    }
  },
  {
    id: "SISALGONT-10745",
    type: "actionable",
    caption: "SISALGONT-10745",
    additionalInformation: {
      "block-start": {
        start: [{ type: "text", caption: "Closed", part: "closed" }]
      },
      "block-end": {
        start: [
          {
            type: "text",
            caption: "Image upload feature not working as ex..."
          }
        ]
      },
      "stretch-end": {
        center: [{ type: "text", caption: "High", part: "priority" }]
      }
    }
  },
  {
    id: "SISALGONT-10745",
    type: "actionable",
    caption: "SISALGONT-10745",
    additionalInformation: {
      "block-start": {
        start: [{ type: "text", caption: "Error", part: "error" }]
      },
      "block-end": {
        start: [
          {
            type: "text",
            caption: "Broken link in footer navigation leadin..."
          }
        ]
      },
      "stretch-end": {
        center: [{ type: "text", caption: "Medium", part: "priority" }]
      }
    }
  },
  {
    id: "SISALGONT-10745",
    type: "actionable",
    caption: "SISALGONT-10745",
    additionalInformation: {
      "block-start": {
        start: [{ type: "text", caption: "Processing", part: "processing" }]
      },
      "block-end": {
        start: [
          {
            type: "text",
            caption: "Mismatch between email body content..."
          }
        ]
      },
      "stretch-end": {
        center: [{ type: "text", caption: "Medium", part: "priority" }]
      }
    }
  },
  {
    id: "SISALGONT-10745",
    type: "actionable",
    caption: "SISALGONT-10745",
    additionalInformation: {
      "block-start": {
        start: [{ type: "text", caption: "Pending", part: "pending" }]
      },
      "block-end": {
        start: [
          {
            type: "text",
            caption: "JavaScript error preventing checkout..."
          }
        ]
      },
      "stretch-end": {
        center: [{ type: "text", caption: "Medium", part: "priority" }]
      }
    }
  },
  {
    id: "SISALGONT-10745",
    type: "actionable",
    caption: "SISALGONT-10745",
    additionalInformation: {
      "block-start": {
        start: [{ type: "text", caption: "Open", part: "open" }]
      },
      "block-end": {
        start: [
          {
            type: "text",
            caption: "Inconsistent behavior in mobile view..."
          }
        ]
      },
      "stretch-end": {
        center: [{ type: "text", caption: "Low", part: "priority" }]
      }
    }
  },
  {
    id: "SISALGONT-10745",
    type: "actionable",
    caption: "SISALGONT-10745",
    additionalInformation: {
      "block-start": {
        start: [{ type: "text", caption: "Analyzing", part: "processing" }]
      },
      "block-end": {
        start: [
          {
            type: "text",
            caption: "Mismatch between email body content..."
          }
        ]
      },
      "stretch-end": {
        center: [{ type: "text", caption: "Medium", part: "priority" }]
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
        start: [{ type: "image", src: `${ASSETS_PREFIX}knowledge-base.svg` }]
      }
    }
  },
  {
    id: "AngularVisualTests",
    type: "actionable",
    caption: "AngularVisualTests",
    additionalInformation: {
      "stretch-start": {
        start: [{ type: "image", src: `${ASSETS_PREFIX}knowledge-base.svg` }]
      }
    }
  },
  {
    id: "AngularPlayground",
    type: "actionable",
    caption: "AngularPlayground",
    additionalInformation: {
      "stretch-start": {
        start: [{ type: "image", src: `${ASSETS_PREFIX}knowledge-base.svg` }]
      }
    }
  },
  {
    id: "AngularAccessibility",
    type: "actionable",
    caption: "AngularAccessibility",
    additionalInformation: {
      "stretch-start": {
        start: [{ type: "image", src: `${ASSETS_PREFIX}knowledge-base.svg` }]
      }
    }
  },
  {
    id: "UnanimoShowcase",
    type: "actionable",
    caption: "UnanimoShowcase",
    additionalInformation: {
      "stretch-start": {
        start: [{ type: "image", src: `${ASSETS_PREFIX}knowledge-base.svg` }]
      }
    }
  }
];

export const panelToolbox: ActionListModel = [
  {
    id: "Controls",
    type: "heading",
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
            start: [
              { type: "image", src: `${ASSETS_PREFIX}knowledge-base.svg` }
            ]
          }
        }
      },
      {
        id: "Button",
        type: "actionable",
        caption: "Button",
        additionalInformation: {
          "stretch-start": {
            start: [
              { type: "image", src: `${ASSETS_PREFIX}knowledge-base.svg` }
            ]
          }
        }
      },
      {
        id: "Component",
        type: "actionable",
        caption: "Component",
        additionalInformation: {
          "stretch-start": {
            start: [
              { type: "image", src: `${ASSETS_PREFIX}knowledge-base.svg` }
            ]
          }
        }
      },
      {
        id: "Image",
        type: "actionable",
        caption: "Image",
        additionalInformation: {
          "stretch-start": {
            start: [
              { type: "image", src: `${ASSETS_PREFIX}knowledge-base.svg` }
            ]
          }
        }
      },
      {
        id: "TextBlock",
        type: "actionable",
        caption: "TextBlock",
        additionalInformation: {
          "stretch-start": {
            start: [
              { type: "image", src: `${ASSETS_PREFIX}knowledge-base.svg` }
            ]
          }
        }
      },
      {
        id: "UserControl",
        type: "actionable",
        caption: "User Control",
        additionalInformation: {
          "stretch-start": {
            start: [
              { type: "image", src: `${ASSETS_PREFIX}knowledge-base.svg` }
            ]
          }
        }
      }
    ]
  }
];
