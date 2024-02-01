/**
 * @typedef DropdownItemModel
 * @type {object}
 * @property {string=} id
 * @property {string=} caption
 * @property {string=} class
 * @property {string=} endImage
 * @property {DropdownItemModel[]=} items
 * @property {DropdownPosition=} itemsPosition
 * @property {Link=} link
 * @property {string=} separatorClass
 * @property {string=} shortcut
 * @property {boolean=} showSeparator
 * @property {string=} startImage
 */

/**
 * @typedef Link
 * @type {object}
 * @property {string} url
 */

/**
 * @typedef { "OutsideStart_OutsideStart" | "InsideStart_OutsideStart" | "Center_OutsideStart" | "InsideEnd_OutsideStart" | "OutsideEnd_OutsideStart" | "OutsideStart_InsideStart" | "OutsideEnd_InsideStart" | "OutsideStart_Center" | "OutsideEnd_Center" | "OutsideStart_InsideEnd" | "OutsideEnd_InsideEnd" | "OutsideStart_OutsideEnd" | "InsideStart_OutsideEnd" | "Center_OutsideEnd" | "InsideEnd_OutsideEnd" | "OutsideEnd_OutsideEnd" } DropdownPosition
 */

/**
 * @type {DropdownItemModel[]}
 */
export const GXWebModel = [
  {
    caption: "File",
    itemsPosition: "InsideStart_OutsideEnd",
    items: [
      {
        caption: "New",
        subActionClass: "dropdown-item dropdown-item-web",
        itemsPosition: "OutsideEnd_InsideStart",
        items: [
          {
            caption: "New Knowledge Base",
            subActionClass: "dropdown-item dropdown-item-web",
            shortcut: "Ctrl+Alt+Shift+N",
            startImage: "assets/icons/knowledge-base.svg"
          },
          {
            caption: "New Object",
            shortcut: "Ctrl+Alt+N",
            showSeparator: true
          },
          {
            caption: "Knowledge Base from GeneXus Server"
          }
        ]
      },
      {
        caption: "Open Object",
        shortcut: "Ctrl+O",
        showSeparator: true
      },
      {
        caption: "Close",
        shortcut: "Ctrl+Alt+W"
      },
      {
        caption: "Close Knowledge Base",
        showSeparator: true
      },
      {
        caption: "Save",
        subActionClass: "dropdown-item dropdown-item-web",

        shortcut: "Ctrl+S",
        startImage: "assets/icons/save.svg"
      },
      {
        caption: "Save All",
        subActionClass: "dropdown-item dropdown-item-web",

        shortcut: "Ctrl+Shift+S",
        startImage: "assets/icons/save-all.svg"
      }
    ]
  },

  {
    caption: "View",
    itemsPosition: "InsideStart_OutsideEnd",
    items: [
      {
        caption: "Domains",
        subActionClass: "dropdown-item dropdown-item-web",
        startImage: "assets/icons/domain.svg"
      },
      {
        caption: "Launchpad"
      },
      {
        caption: "Start Page",
        showSeparator: true
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
    itemsPosition: "InsideStart_OutsideEnd",
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
    itemsPosition: "InsideStart_OutsideEnd",
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
        shortcut: "Alt+Shift+Left",
        showSeparator: true
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
        caption: "Duplicate Selection",
        showSeparator: true
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
    itemsPosition: "InsideStart_OutsideEnd",
    items: [
      {
        caption: "Build All"
      },
      {
        caption: "Rebuild All",
        showSeparator: true
      },
      {
        caption: "Run",
        shortcut: "F5"
      },
      {
        caption: "Run Without Building",
        showSeparator: true
      },
      {
        caption: "Create Database Tables"
      },
      {
        caption: "Impact Database Tables",
        showSeparator: true
      },
      {
        caption: "Cancel Build",
        showSeparator: true
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
    itemsPosition: "InsideStart_OutsideEnd",
    items: [
      {
        caption: "Sketch Import"
      }
    ]
  }
];
