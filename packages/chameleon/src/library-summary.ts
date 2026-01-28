export const librarySummary = [
  {
    access: "public",
    tagName: "ch-checkbox",
    className: "ChCheckbox",
    description: "",
    fullClassJSDoc:
      "/**\r\n * @status developer-preview\r\n *\r\n * @csspart container - The container that serves as a wrapper for the `input` and the `option` parts.\r\n * @csspart input - The input element that implements the interactions for the component.\r\n * @csspart label - The label that is rendered when the `caption` property is not empty.\r\n *\r\n * @csspart checked - Present in the `input`, `label` and `container` parts when the control is checked and not indeterminate (`checked === true` and `indeterminate !== true`).\r\n * @csspart disabled - Present in the `input`, `label` and `container` parts when the control is disabled (`disabled === true`).\r\n * @csspart indeterminate - Present in the `input`, `label` and `container` parts when the control is indeterminate (`indeterminate === true`).\r\n * @csspart unchecked - Present in the `input`, `label` and `container` parts when the control is unchecked and not indeterminate (`checked === false` and `indeterminate !== true`).\r\n\r\n * @cssprop [--ch-checkbox__container-size = min(1em, 20px)] - Specifies the size for the container of the `input` and `option` elements.\r\n *\r\n * @cssprop [--ch-checkbox__checked-image = url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><path d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z'/></svg>\")] - Specifies the image of the checkbox when is checked.\r\n *\r\n * @cssprop [--ch-checkbox__option-indeterminate-image = url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><rect width='8' height='8'/></svg>\")] - Specifies the image of the checkbox when is indeterminate.\r\n *\r\n * @cssprop [--ch-checkbox__option-image-size = 50%] - Specifies the image size of the `option` element.\r\n *\r\n * @cssprop [--ch-checkbox__image-size = #{$default-decorative-image-size}] - Specifies the box size that contains the start image of the control.\r\n * \r\n * @cssprop [--ch-checkbox__background-image-size = 100%] - Specifies the size of the start image of the control.\r\n */",
    srcPath: "./components/checkbox/checkbox.lit.ts",
    developmentStatus: "developer-preview",
    formAssociated: true,
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "accessibleName",
        attribute: "accessible-name",
        type: "\r\n    | string\r\n    | undefined",
        default: "undefined",
        description:
          "Specifies a short string, typically 1 to 3 words, that authors associate\r\nwith an element to provide users of assistive technologies with a label\r\nfor the element."
      },
      {
        name: "caption",
        attribute: "caption",
        type: " string | undefined",
        default: "undefined",
        description: "Specifies the label of the checkbox."
      },
      {
        name: "checked",
        attribute: "checked",
        type: " boolean",
        default: "false",
        description:
          "`true` if the `ch-switch` is checked.\r\n\r\nIf checked:\r\n  - The `value` property will be available in the parent `<form>` if the\r\n    `name` attribute is set.\r\n  - The `checkedCaption` will be used to display the current caption.\r\n\r\nIf not checked:\r\n  - The `value` property won't be available in the parent `<form>`, even\r\n    if the `name` attribute is set.\r\n  - The `unCheckedCaption` will be used to display the current caption."
      },
      {
        name: "disabled",
        attribute: "disabled",
        type: " boolean",
        default: "false",
        description:
          "This attribute lets you specify if the element is disabled.\r\nIf disabled, it will not fire any user interaction related event\r\n(for example, click event).",
        reflect: true
      },
      {
        name: "getImagePathCallback",
        attribute: false,
        type: "\r\n    | GetImagePathCallback\r\n    | undefined",
        default: "undefined",
        description:
          "This property specifies a callback that is executed when the path for an\r\nstartImgSrc needs to be resolved."
      },
      {
        name: "indeterminate",
        attribute: "indeterminate",
        type: " boolean",
        default: "false",
        description:
          "`true` if the control's value is indeterminate.\r\n\r\nThis property is purely a visual change. It has no impact on whether the\r\ncheckbox's is used in a form submission. That is decided by the\r\n`checked` property, regardless of the `indeterminate` state."
      },
      {
        name: "name",
        attribute: "name",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies the `name` of the component when used in a form."
      },
      {
        name: "readonly",
        attribute: "readonly",
        type: " boolean",
        default: "false",
        description:
          "This attribute indicates that the user cannot modify the value of the control.\r\nSame as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly)\r\nattribute for `input` elements."
      },
      {
        name: "startImgSrc",
        attribute: "start-img-src",
        type: " string | undefined",
        default: "undefined",
        description: "Specifies the source of the start image."
      },
      {
        name: "startImgType",
        attribute: "start-img-type",
        type: ' Exclude<\r\n    ImageRender,\r\n    "img"\r\n  >',
        default: '"background"',
        description: "Specifies the source of the start image."
      },
      {
        name: "value",
        attribute: "value",
        type: " string",
        default: '"on"',
        description: "The value of the control."
      }
    ],
    events: [
      {
        name: "input",
        detailType: "boolean",
        description:
          "The `input` event is emitted when a change to the element's checked state\r\nis committed by the user.\r\n\r\nIt contains the new checked state of the control."
      }
    ],
    cssVariables: [
      {
        name: "--ch-checkbox__container-size = min(1em, 20px)",
        description:
          "Specifies the size for the container of the `input` and `option` elements."
      },
      {
        name: "--ch-checkbox__checked-image = url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><path d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z'/></svg>\")",
        description: "Specifies the image of the checkbox when is checked."
      },
      {
        name: "--ch-checkbox__option-indeterminate-image = url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><rect width='8' height='8'/></svg>\")",
        description:
          "Specifies the image of the checkbox when is indeterminate."
      },
      {
        name: "--ch-checkbox__option-image-size = 50%",
        description: "Specifies the image size of the `option` element."
      },
      {
        name: "--ch-checkbox__image-size = #{$default-decorative-image-size}",
        description:
          "Specifies the box size that contains the start image of the control."
      },
      {
        name: "--ch-checkbox__background-image-size = 100%",
        description: "Specifies the size of the start image of the control."
      }
    ],
    propertyImportTypes: {
      "./typings/multi-state-images.ts": ["GetImagePathCallback", "ImageRender"]
    }
  },
  {
    access: "public",
    tagName: "ch-code",
    className: "ChCode",
    description:
      "A control to highlight code blocks.\r\n- It supports code highlight by parsing the incoming code string to [hast](https://github.com/syntax-tree/hast) using [Shiki](https://shiki.matsu.io). After that, it implements a reactivity layer by implementing its own render for the hast.\r\n\r\n- It also supports all programming languages from [Shiki.js](https://shiki.matsu.io).\r\n\r\n- When the code highlighting is needed at runtime, the control will load on demand the code parser and the programming language needed to parse the code.",
    fullClassJSDoc:
      "/**\r\n * A control to highlight code blocks.\r\n * - It supports code highlight by parsing the incoming code string to [hast](https://github.com/syntax-tree/hast) using [Shiki](https://shiki.matsu.io). After that, it implements a reactivity layer by implementing its own render for the hast.\r\n *\r\n * - It also supports all programming languages from [Shiki.js](https://shiki.matsu.io).\r\n *\r\n * - When the code highlighting is needed at runtime, the control will load on demand the code parser and the programming language needed to parse the code.\r\n */",
    srcPath: "./components/code/code.lit.ts",
    developmentStatus: "to-be-defined",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "language",
        attribute: "language",
        type: " string | undefined",
        default: '"txt"',
        description: "Specifies the code language to highlight."
      },
      {
        name: "lastNestedChildClass",
        attribute: "lastnestedchildclass",
        type: " string",
        default: '"last-nested-child"'
      },
      {
        name: "showIndicator",
        attribute: "show-indicator",
        type: " boolean",
        default: "false",
        description:
          "Specifies if an indicator is displayed in the last element rendered.\r\nUseful for streaming scenarios where a loading indicator is needed."
      },
      {
        name: "value",
        attribute: "value",
        type: " string | undefined",
        default: "undefined",
        description: "Specifies the code string to highlight."
      }
    ]
  },
  {
    access: "public",
    tagName: "ch-image",
    className: "ChImage",
    description:
      "A control to display multiple images, depending on the state (focus, hover,\r\nactive or disabled) of a parent element.",
    fullClassJSDoc:
      "/**\r\n * A control to display multiple images, depending on the state (focus, hover,\r\n * active or disabled) of a parent element.\r\n */",
    srcPath: "./components/image/image.lit.ts",
    developmentStatus: "to-be-defined",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "containerRef",
        attribute: false,
        type: " HTMLElement | undefined",
        default: "undefined",
        description:
          "Specifies a reference for the container, in order to update the state of\r\nthe icon. The reference must be an ancestor of the control.\r\nIf not specified, the direct parent reference will be used."
      },
      {
        name: "disabled",
        attribute: "disabled",
        type: " boolean | undefined",
        default: "false",
        description: "Specifies if the icon is disabled.",
        reflect: true
      },
      {
        name: "getImagePathCallback",
        attribute: false,
        type: "\r\n    | GetImagePathCallback\r\n    | undefined",
        default: "undefined",
        description:
          "This property specifies a callback that is executed when the path the\r\nimage needs to be resolved."
      },
      {
        name: "src",
        attribute: false,
        type: " string | unknown | undefined",
        default: "undefined",
        description: "Specifies the src for the image."
      },
      {
        name: "styles",
        attribute: "style",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies an accessor for the attribute style of the ch-image. This\r\naccessor is useful for SSR scenarios were the Host access is limited\r\n(since Lit does not provide the Host declarative component).\r\n\r\nWithout this accessor, the initial load in SSR scenarios would flicker.",
        reflect: true
      },
      {
        name: "type",
        attribute: "type",
        type: '\r\n    | Exclude<ImageRender, "img">\r\n    | undefined',
        default: '"background"',
        description: "Specifies how the image will be rendered.",
        reflect: true
      }
    ],
    propertyImportTypes: {
      "./typings/multi-state-images.ts": ["GetImagePathCallback", "ImageRender"]
    }
  },
  {
    access: "public",
    tagName: "ch-layout-splitter",
    className: "ChLayoutSplitter",
    description:
      "This component allows us to design a layout composed by columns and rows.\r\n - Columns and rows can have relative (`fr`) or absolute (`px`) size.\r\n - The line that separates two columns or two rows will always have a drag-bar to resize the layout.",
    fullClassJSDoc:
      "/**\r\n * This component allows us to design a layout composed by columns and rows.\r\n *  - Columns and rows can have relative (`fr`) or absolute (`px`) size.\r\n *  - The line that separates two columns or two rows will always have a drag-bar to resize the layout.\r\n *\r\n * @csspart bar - The bar that divides two columns or two rows\r\n */",
    srcPath: "./components/layout-splitter/layout-splitter.lit.ts",
    developmentStatus: "to-be-defined",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "barAccessibleName",
        attribute: "bar-accessible-name",
        type: " string",
        default: '"Resize"',
        description:
          "This attribute lets you specify the label for the drag bar.\r\nImportant for accessibility."
      },
      {
        name: "dragBarDisabled",
        attribute: "drag-bar-disabled",
        type: " boolean",
        default: "false",
        description:
          "This attribute lets you specify if the resize operation is disabled in all\r\ndrag bars. If `true`, the drag bars are disabled."
      },
      {
        name: "incrementWithKeyboard",
        attribute: "increment-with-keyboard",
        type: " number",
        default: "2",
        description:
          "Specifies the resizing increment (in pixel) that is applied when using the\r\nkeyboard to resize a drag bar."
      },
      {
        name: "model",
        attribute: false,
        type: " LayoutSplitterModel",
        default:
          '{\r\n    id: "root",\r\n    direction: "columns",\r\n    items: []\r\n  }',
        description:
          "Specifies the list of component that are displayed. Each component will be\r\nseparated via a drag bar."
      }
    ],
    methods: [
      {
        name: "refreshLayout",
        paramTypes: [],
        returnType: "void",
        description:
          "Schedules a new render of the control even if no state changed."
      },
      {
        name: "addSiblingLeaf",
        paramTypes: [
          {
            name: "parentGroup",
            type: "string"
          },
          {
            name: "siblingItem",
            type: "string"
          },
          {
            name: "placedInTheSibling",
            type: '"before" | "after"'
          },
          {
            name: "leafInfo",
            type: "LayoutSplitterLeafModel"
          },
          {
            name: "takeHalfTheSpaceOfTheSiblingItem",
            type: "boolean"
          }
        ],
        returnType: "LayoutSplitterItemAddResult"
      },
      {
        name: "removeItem",
        paramTypes: [
          {
            name: "itemId",
            type: "string"
          }
        ],
        returnType: "LayoutSplitterItemRemoveResult",
        description:
          "Removes the item that is identified by the given ID.\r\nThe layout is rearranged depending on the state of the removed item."
      }
    ],
    propertyImportTypes: {
      "./components/layout-splitter/types.ts": ["LayoutSplitterModel"]
    },
    methodImportTypes: {
      "./components/layout-splitter/types.ts": [
        "LayoutSplitterItemAddResult",
        "LayoutSplitterLeafModel",
        "LayoutSplitterItemRemoveResult"
      ]
    }
  },
  {
    access: "public",
    tagName: "ch-navigation-list-item",
    className: "ChNavigationListItem",
    description: "",
    fullClassJSDoc: "/**\r\n * @status experimental\r\n */",
    srcPath:
      "./components/navigation-list/internal/navigation-list-item/navigation-list-item.lit.ts",
    developmentStatus: "experimental",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "caption",
        attribute: "caption",
        type: " string | undefined",
        default: "undefined",
        description: "Specifies the caption of the control"
      },
      {
        name: "disabled",
        attribute: "disabled",
        type: " boolean | undefined",
        default: "undefined",
        description:
          "This attribute lets you specify if the element is disabled.\r\nIf disabled, it will not fire any user interaction related event\r\n(for example, click event)."
      },
      {
        name: "expandable",
        attribute: "expandable",
        type: " boolean",
        default: "false",
        description: "Specifies if the control contains sub items.",
        reflect: true
      },
      {
        name: "expanded",
        attribute: "expanded",
        type: " boolean | undefined",
        default: "undefined",
        description: "Specifies if the control is expanded or collapsed.",
        reflect: true
      },
      {
        name: "exportparts",
        attribute: "exportparts",
        type: " string",
        default: "NAVIGATION_LIST_ITEM_EXPORT_PARTS",
        description:
          "This property works the same as the exportparts attribute. It is defined\r\nas a property just to reflect the default value, which avoids FOUC when\r\nthe `ch-navigation-list-render` component is Server Side Rendered.\r\nOtherwise, setting this attribute on the client would provoke FOUC and/or\r\nvisual flickering.",
        reflect: true
      },
      {
        name: "level",
        attribute: "level",
        type: " number",
        default: "NAVIGATION_LIST_INITIAL_LEVEL",
        description:
          "Specifies at which level of the navigation list is rendered the control."
      },
      {
        name: "link",
        attribute: "link",
        type: " ItemLink | undefined",
        default: "undefined"
      },
      {
        name: "model",
        attribute: "model",
        type: " NavigationListItemModel",
        default: "undefined",
        description: "Specifies the UI model of the control"
      },
      {
        name: "selected",
        attribute: "selected",
        type: " boolean",
        default: "false",
        description:
          "Specifies if the hyperlink is selected. Only applies when the `link`\r\nproperty is defined."
      },
      {
        name: "sharedState",
        attribute: "sharedstate",
        type: " NavigationListSharedState",
        default: "undefined"
      },
      {
        name: "startImgSrc",
        attribute: "startimgsrc",
        type: " string | undefined",
        default: "undefined",
        description: "Specifies the src of the start image."
      },
      {
        name: "startImgType",
        attribute: "startimgtype",
        type: '\r\n    | Exclude<ImageRender, "img">\r\n    | undefined',
        default: "undefined",
        description: "Specifies how the start image will be rendered."
      }
    ],
    propertyImportTypes: {
      "./typings/hyperlinks.ts": ["ItemLink"],
      "./components/navigation-list/types.ts": [
        "NavigationListItemModel",
        "NavigationListSharedState"
      ],
      "./typings/multi-state-images.ts": ["ImageRender"]
    }
  },
  {
    access: "public",
    tagName: "ch-navigation-list-render",
    className: "ChNavigationListRender",
    description: "",
    fullClassJSDoc:
      "/**\r\n * @status experimental\r\n *\r\n * This component needs to be hydrated to properly work. If not hydrated, the\r\n * component visibility will be hidden.\r\n */",
    srcPath: "./components/navigation-list/navigation-list-render.lit.ts",
    developmentStatus: "to-be-defined",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "autoGrow",
        attribute: "auto-grow",
        type: " boolean",
        default: "false",
        description:
          "If `false` the overflowing content of the control will be clipped to the\r\nborders of its container.",
        reflect: true
      },
      {
        name: "expandableButton",
        attribute: "expandable-button",
        type: '\r\n    | "decorative"\r\n    | "no"',
        default: '"decorative"',
        description:
          'Specifies what kind of expandable button is displayed in the items by\r\ndefault.\r\n - `"decorative"`: Only a decorative icon is rendered to display the state\r\n    of the item.'
      },
      {
        name: "expandableButtonPosition",
        attribute: "expandable-button-position",
        type: ' "start" | "end"',
        default: '"start"',
        description:
          'Specifies the position of the expandable button in reference of the action\r\nelement of the items\r\n - `"start"`: Expandable button is placed before the action element.\r\n - `"end"`: Expandable button is placed after the action element.'
      },
      {
        name: "getImagePathCallback",
        attribute: "getimagepathcallback",
        type: "\r\n    | ((item: NavigationListItemModel) => GxImageMultiState | undefined)\r\n    | undefined",
        default: "undefined",
        description:
          "This property specifies a callback that is executed when the path for an\r\nstartImgSrc needs to be resolved."
      },
      {
        name: "expanded",
        attribute: "expanded",
        type: " boolean",
        default: "true",
        description: "Specifies if the control is expanded or collapsed.",
        reflect: true
      },
      {
        name: "expandSelectedLink",
        attribute: "expand-selected-link",
        type: " boolean",
        default: "false",
        description:
          "`true` to expand the path to the selected link when the `selectedLink`\r\nproperty is updated."
      },
      {
        name: "model",
        attribute: "model",
        type: "\r\n    | NavigationListModel\r\n    | undefined",
        default: "undefined",
        description: "Specifies the items of the control."
      },
      {
        name: "renderItem",
        attribute: "renderitem",
        type: "\r\n    | ((\r\n        item: NavigationListItemModel,\r\n        navigationListSharedState: NavigationListSharedState,\r\n        level: number\r\n      ) => TemplateResult)\r\n    | undefined",
        default: "undefined",
        description: "Specifies the items of the control."
      },
      {
        name: "selectedLink",
        attribute: "selectedlink",
        type: " {\r\n    id?: string;\r\n    link: ItemLink;\r\n  }",
        default: "{\r\n    link: { url: undefined }\r\n  }",
        description: "Specifies the current selected hyperlink."
      },
      {
        name: "selectedLinkIndicator",
        attribute: "selected-link-indicator",
        type: " boolean",
        default: "false",
        description:
          "Specifies if the selected item indicator is displayed (only work for hyperlink)"
      },
      {
        name: "showCaptionOnCollapse",
        attribute: "show-caption-on-collapse",
        type: '\r\n    | "inline"\r\n    | "tooltip"',
        default: '"inline"',
        description:
          "Specifies how the caption of the items will be displayed when the control\r\nis collapsed"
      },
      {
        name: "tooltipDelay",
        attribute: "tooltip-delay",
        type: " number",
        default: "100",
        description:
          "Specifies the delay (in ms) for the tooltip to be displayed."
      }
    ],
    events: [
      {
        name: "buttonClick",
        detailType: "NavigationListItemModel",
        description:
          "Fired when an button is clicked.\r\nThis event can be prevented."
      },
      {
        name: "hyperlinkClick",
        detailType: "NavigationListHyperlinkClickEvent",
        description:
          "Fired when an hyperlink is clicked.\r\nThis event can be prevented."
      }
    ],
    propertyImportTypes: {
      "./components/navigation-list/types.ts": [
        "NavigationListItemModel",
        "NavigationListModel",
        "NavigationListSharedState"
      ],
      "./typings/multi-state-images.ts": ["GxImageMultiState"],
      lit: ["TemplateResult"],
      "./typings/hyperlinks.ts": ["ItemLink"]
    },
    eventImportTypes: {
      "./components/navigation-list/types.ts": [
        "NavigationListItemModel",
        "NavigationListHyperlinkClickEvent"
      ]
    }
  },
  {
    access: "public",
    tagName: "ch-performance-scan-item",
    className: "ChPerformanceScanItem",
    description: "",
    fullClassJSDoc: "/**\r\n * @status experimental\r\n */",
    srcPath:
      "./components/performance-scan/internals/performance-scan-item/performance-scan-item.lit.ts",
    developmentStatus: "experimental",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "anchorRef",
        attribute: false,
        type: " LitElement",
        default: "undefined",
        description: "Specifies a reference for the scanned element."
      },
      {
        name: "anchorTagName",
        attribute: false,
        type: " string",
        default: "undefined",
        description: "Specifies the tagName of the scanned element."
      },
      {
        name: "renderCount",
        attribute: false,
        type: " number",
        default: "undefined",
        description:
          "Specifies how many times the scanned element has rendered in a buffer of\r\ntime."
      }
    ],
    propertyImportTypes: {
      lit: ["LitElement"]
    }
  },
  {
    access: "public",
    tagName: "ch-performance-scan",
    className: "ChPerformanceScan",
    description: "A component to visualize re-renders on Lit components.",
    fullClassJSDoc:
      "/**\r\n * A component to visualize re-renders on Lit components.\r\n * @status experimental\r\n */",
    srcPath: "./components/performance-scan/performance-scan.lit.ts",
    developmentStatus: "experimental",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "showFps",
        attribute: "showfps",
        type: " boolean",
        default: "false",
        description: "`true` to show the FPS"
      }
    ]
  },
  {
    access: "public",
    tagName: "ch-component-render",
    className: "ChComponentRender",
    description: "",
    fullClassJSDoc: "/**\r\n * @fires modelUpdate\r\n */",
    srcPath:
      "./components/playground-editor/internal/component-render/component-render.lit.ts",
    developmentStatus: "to-be-defined",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "model",
        attribute: false,
        type: " ComponentRenderModel",
        default: "undefined",
        description: "Specifies the component render."
      }
    ],
    events: [
      {
        name: "modelUpdate",
        detailType: "void"
      }
    ],
    propertyImportTypes: {
      "./components/playground-editor/typings/component-render.ts": [
        "ComponentRenderModel"
      ]
    }
  },
  {
    access: "public",
    tagName: "ch-playground-editor",
    className: "ChPlaygroundEditor",
    description: "",
    fullClassJSDoc: "",
    srcPath: "./components/playground-editor/playground-editor.lit.ts",
    developmentStatus: "to-be-defined",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "componentModel",
        attribute: false,
        type: "\r\n    | ComponentRenderModel\r\n    | undefined",
        default: "undefined"
      },
      {
        name: "componentName",
        attribute: "componentname",
        type: " string | undefined",
        default: "undefined"
      },
      {
        name: "selectedItem",
        attribute: false,
        type: "\r\n    | ComponentRenderTemplateItemNode\r\n    | undefined",
        default: "undefined"
      }
    ],
    propertyImportTypes: {
      "./components/playground-editor/typings/component-render.ts": [
        "ComponentRenderModel",
        "ComponentRenderTemplateItemNode"
      ]
    }
  },
  {
    access: "public",
    tagName: "ch-progress",
    className: "ChProgress",
    description:
      "The ch-progress is an element that displays the progress status for tasks\r\nthat take a long time.\r\n\r\nIt implements all accessibility behaviors for determinate and indeterminate\r\nprogress. It also supports referencing a region to describe its progress.",
    fullClassJSDoc:
      "/**\r\n * The ch-progress is an element that displays the progress status for tasks\r\n * that take a long time.\r\n *\r\n * It implements all accessibility behaviors for determinate and indeterminate\r\n * progress. It also supports referencing a region to describe its progress.\r\n *\r\n * @status experimental\r\n */",
    srcPath: "./components/progress/progress.lit.ts",
    developmentStatus: "experimental",
    formAssociated: true,
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "accessibleName",
        attribute: "accessible-name",
        type: "\r\n    | string\r\n    | undefined",
        default: "undefined",
        description:
          "Specifies a short string, typically 1 to 3 words, that authors associate\r\nwith an element to provide users of assistive technologies with a label\r\nfor the element."
      },
      {
        name: "accessibleValueText",
        attribute: "accessible-value-text",
        type: "\r\n    | string\r\n    | undefined",
        default: "undefined",
        description:
          "Assistive technologies often present the `value` as a percentage. If this\r\nwould not be accurate use this property to make the progress bar value\r\nunderstandable."
      },
      {
        name: "indeterminate",
        attribute: "indeterminate",
        type: " boolean",
        default: "false",
        description:
          "Specifies whether the progress is indeterminate or not. In other words, it\r\nindicates that an activity is ongoing with no indication of how long it is\r\nexpected to take.\r\n\r\nIf `true`, the `max`, `min` and `value` properties won't be taken into\r\naccount.",
        reflect: true
      },
      {
        name: "max",
        attribute: "max",
        type: " number",
        default: "DEFAULT_MAX_VALUE",
        description:
          "Specifies the maximum value of progress. In other words, how much work the\r\ntask indicated by the progress component requires.\r\n\r\nThis property is not used if indeterminate === true."
      },
      {
        name: "min",
        attribute: "min",
        type: " number",
        default: "DEFAULT_MIN_VALUE",
        description:
          "Specifies the minimum value of progress.\r\n\r\nThis property is not used if indeterminate === true."
      },
      {
        name: "name",
        attribute: "name",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies the `name` of the component when used in a form."
      },
      {
        name: "renderType",
        attribute: "render-type",
        type: ' "custom" | string',
        default: '"custom"',
        description:
          "This property specifies how the progress will be render.\r\n - `\"custom\"`: Useful for making custom renders of the progress. The\r\n   control doesn't render anything and only projects the content of the\r\n   default slot. Besides that, all specified properties are still used to\r\n   implement the control's accessibility."
      },
      {
        name: "loadingRegionRef",
        attribute: false,
        type: " HTMLElement | undefined",
        default: "undefined",
        description:
          "If the control is describing the loading progress of a particular region\r\nof a page, set this property with the reference of the loading region.\r\nThis will set the `aria-describedby` and `aria-busy` attributes on the\r\nloading region to improve the accessibility while the control is in\r\nprogress.\r\n\r\nWhen the control detects that is no longer in progress (aka it is removed\r\nfrom the DOM or value === maxValue with indeterminate === false), it will\r\nremove the `aria-busy` attribute and update (or remove if necessary) the\r\n`aria-describedby` attribute.\r\n\r\nIf an ID is set prior to the control's first render, the control will use\r\nthis ID for the `aria-describedby`. Otherwise, the control will compute a\r\nunique ID for this matter.\r\n\r\n**Important**: If you are using Shadow DOM, take into account that the\r\n`loadingRegionRef` must be in the same Shadow Tree as this control.\r\nOtherwise, the `aria-describedby` binding won't work, since the control ID\r\nis not visible for the `loadingRegionRef`."
      },
      {
        name: "value",
        attribute: "value",
        type: " number",
        default: "DEFAULT_MIN_VALUE",
        description:
          "Specifies the current value of the component. In other words, how much of\r\nthe task that has been completed.\r\n\r\nThis property is not used if indeterminate === true."
      }
    ]
  },
  {
    access: "public",
    tagName: "ch-qr",
    className: "ChQr",
    description: "",
    fullClassJSDoc: "/**\r\n * @status developer-preview\r\n */",
    srcPath: "./components/qr/qr.lit.ts",
    developmentStatus: "developer-preview",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "accessibleName",
        attribute: "accessible-name",
        type: "\r\n    | string\r\n    | undefined",
        default: "undefined",
        description:
          "Specifies a short string, typically 1 to 3 words, that authors associate\r\nwith an element to provide users of assistive technologies with a label\r\nfor the element."
      },
      {
        name: "background",
        attribute: "background",
        type: " string",
        default: '"white"',
        description:
          'The background color of the render QR. If not specified, "transparent"\r\nwill be used.'
      },
      {
        name: "errorCorrectionLevel",
        attribute: "error-correction-level",
        type: " ErrorCorrectionLevel",
        default: '"High"',
        description:
          "The four values L, M, Q, and H will use %7, 15%, 25%, and 30% of the QR\r\ncode for error correction respectively. So on one hand the code will get\r\nbigger but chances are also higher that it will be read without errors\r\nlater on. This value is by default High (H)."
      },
      {
        name: "fill",
        attribute: "fill",
        type: " string",
        default: '"black"',
        description: "What color you want your QR code to be."
      },
      {
        name: "radius",
        attribute: "radius",
        type: " number",
        default: "0",
        description:
          "Defines how round the blocks should be. Numbers from 0 (squares) to 0.5\r\n(maximum round) are supported."
      },
      {
        name: "size",
        attribute: "size",
        type: " number",
        default: "128",
        description: "The total size of the final QR code in pixels."
      },
      {
        name: "value",
        attribute: "value",
        type: " string | undefined",
        default: "undefined",
        description: "Any kind of text, also links, email addresses, any thing."
      }
    ],
    propertyImportTypes: {
      "./components/qr/types.ts": ["ErrorCorrectionLevel"]
    }
  },
  {
    access: "public",
    tagName: "ch-radio-group-render",
    className: "ChRadioGroupRender",
    description:
      "The radio group control is used to render a short list of mutually exclusive options.\r\n\r\nIt contains radio items to allow users to select one option from the list of options.",
    fullClassJSDoc:
      '/**\r\n * The radio group control is used to render a short list of mutually exclusive options.\r\n *\r\n * It contains radio items to allow users to select one option from the list of options.\r\n *\r\n * @part radio__item - The radio item element.\r\n * @part radio__container - The container that serves as a wrapper for the `input` and the `option` parts.\r\n * @part radio__input - The invisible input element that implements the interactions for the component. This part must be kept "invisible".\r\n * @part radio__option - The actual "input" that is rendered above the `input` part. This part has `position: absolute` and `pointer-events: none`.\r\n * @part radio__label - The label that is rendered when the `caption` property is not empty.\r\n *\r\n * @part checked - Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is checked (`checked` === `true`).\r\n * @part disabled - Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is disabled (`disabled` === `true`).\r\n * @part unchecked - Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is not checked (`checked` !== `true`).\r\n */',
    srcPath: "./components/radio-group/radio-group-render.lit.ts",
    developmentStatus: "to-be-defined",
    formAssociated: true,
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "direction",
        attribute: "direction",
        type: ' "horizontal" | "vertical"',
        default: '"horizontal"',
        description: "Specifies the direction of the items.",
        reflect: true
      },
      {
        name: "disabled",
        attribute: "disabled",
        type: " boolean",
        default: "false",
        description:
          "This attribute lets you specify if the radio-group is disabled.\r\nIf disabled, it will not fire any user interaction related event\r\n(for example, click event).",
        reflect: true
      },
      {
        name: "model",
        attribute: false,
        type: " RadioGroupModel | undefined",
        default: "undefined",
        description:
          "This property lets you define the items of the ch-radio-group-render control."
      },
      {
        name: "name",
        attribute: "name",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies the `name` of the component when used in a form."
      },
      {
        name: "value",
        attribute: "value",
        type: " string | undefined",
        default: "undefined",
        description: "The value of the control."
      }
    ],
    events: [
      {
        name: "change",
        detailType: "string",
        description:
          "Fired when the selected item change. It contains the information about the\r\nnew selected value."
      }
    ],
    parts: [
      {
        name: "radio__item",
        description: "The radio item element."
      },
      {
        name: "radio__container",
        description:
          "The container that serves as a wrapper for the `input` and the `option` parts."
      },
      {
        name: "radio__input",
        description:
          'The invisible input element that implements the interactions for the component. This part must be kept "invisible".'
      },
      {
        name: "radio__option",
        description:
          'The actual "input" that is rendered above the `input` part. This part has `position: absolute` and `pointer-events: none`.'
      },
      {
        name: "radio__label",
        description:
          "The label that is rendered when the `caption` property is not empty."
      },
      {
        name: "checked",
        description:
          "Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is checked (`checked` === `true`)."
      },
      {
        name: "disabled",
        description:
          "Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is disabled (`disabled` === `true`)."
      },
      {
        name: "unchecked",
        description:
          "Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is not checked (`checked` !== `true`)."
      }
    ],
    propertyImportTypes: {
      "./components/radio-group/types.ts": ["RadioGroupModel"]
    }
  },
  {
    access: "public",
    tagName: "ch-router",
    className: "ChRouter",
    description: "",
    fullClassJSDoc: "/**\r\n * @status developer-preview\r\n */",
    srcPath: "./components/router/router.lit.ts",
    developmentStatus: "developer-preview",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "model",
        attribute: "model",
        type: " RouterModel | undefined",
        default: "undefined"
      },
      {
        name: "pathname",
        attribute: "pathname",
        type: " string | undefined",
        default: "undefined"
      }
    ],
    propertyImportTypes: {
      "./components/router/types.ts": ["RouterModel"]
    }
  },
  {
    access: "public",
    tagName: "ch-segmented-control-item",
    className: "ChSegmentedControlItem",
    description:
      "Segmented control is used to pick one choice from a linear set of closely related choices, and immediately apply that selection.\r\nThis control represents and item of the ch-segmented-control-render",
    fullClassJSDoc:
      "/**\r\n * Segmented control is used to pick one choice from a linear set of closely related choices, and immediately apply that selection.\r\n * This control represents and item of the ch-segmented-control-render\r\n *\r\n * @part selected - ...\r\n */",
    srcPath:
      "./components/segmented-control/internal/segmented-control-item/segmented-control-item.lit.ts",
    developmentStatus: "to-be-defined",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "accessibleName",
        attribute: "accessiblename",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies a short string, typically 1 to 3 words, that authors associate\r\nwith an element to provide users of assistive technologies with a label\r\nfor the element."
      },
      {
        name: "between",
        attribute: "between",
        type: " boolean",
        default: "false",
        description:
          "`true` if the control is the not the first or last item in the\r\nch-segmented-control-render."
      },
      {
        name: "caption",
        attribute: "caption",
        type: " string | undefined",
        default: "undefined",
        description: "Specifies the caption that the control will display."
      },
      {
        name: "disabled",
        attribute: "disabled",
        type: " boolean | undefined",
        default: "undefined",
        description:
          "This attribute lets you specify if the element is disabled.\r\nIf disabled, it will not fire any user interaction related event\r\n(for example, click event)."
      },
      {
        name: "endImgSrc",
        attribute: "endimgsrc",
        type: " string | undefined",
        default: "undefined",
        description: "Specifies the src of the end image."
      },
      {
        name: "endImgType",
        attribute: "endimgtype",
        type: ' Exclude<ImageRender, "img"> | undefined',
        default: "undefined",
        description: "Specifies how the end image will be rendered."
      },
      {
        name: "first",
        attribute: "first",
        type: " boolean",
        default: "false",
        description:
          "`true` if the control is the first item in the ch-segmented-control-render."
      },
      {
        name: "last",
        attribute: "last",
        type: " boolean",
        default: "false",
        description:
          "`true` if the control is the last item in the ch-segmented-control-render."
      },
      {
        name: "selected",
        attribute: "selected",
        type: " boolean | undefined",
        default: "undefined",
        description: "Specifies if the control is selected."
      },
      {
        name: "startImgSrc",
        attribute: "startimgsrc",
        type: " string | undefined",
        default: "undefined",
        description: "Specifies the src of the start image."
      },
      {
        name: "startImgType",
        attribute: "startimgtype",
        type: ' Exclude<ImageRender, "img"> | undefined',
        default: "undefined",
        description: "Specifies how the start image will be rendered."
      }
    ],
    parts: [
      {
        name: "selected",
        description: "..."
      }
    ],
    propertyImportTypes: {
      "./typings/multi-state-images.ts": ["ImageRender"]
    }
  },
  {
    access: "public",
    tagName: "ch-segmented-control-render",
    className: "ChSegmentedControlRender",
    description:
      "Segmented control is used to pick one choice from a linear set of closely related choices, and immediately apply that selection.",
    fullClassJSDoc:
      "/**\r\n * Segmented control is used to pick one choice from a linear set of closely related choices, and immediately apply that selection.\r\n */",
    srcPath: "./components/segmented-control/segmented-control-render.lit.ts",
    developmentStatus: "to-be-defined",
    mode: "open",
    shadow: false,
    properties: [
      {
        name: "exportParts",
        attribute: "exportparts",
        type: " string",
        default: "SEGMENTED_CONTROL_EXPORT_PARTS",
        description:
          "Specifies the parts that are exported by the internal\r\nsegmented-control-item. This property is useful to override the exported\r\nparts."
      },
      {
        name: "itemCssClass",
        attribute: "itemcssclass",
        type: " string",
        default: '"segmented-control-item"',
        description:
          "A CSS class to set as the `ch-segmented-control-item` element class.\r\nThis default class is used for the items that don't have an explicit class."
      },
      {
        name: "model",
        attribute: false,
        type: " SegmentedControlModel | undefined",
        default: "undefined",
        description:
          "This property lets you define the items of the ch-segmented-control-render\r\ncontrol."
      },
      {
        name: "selectedId",
        attribute: "selectedid",
        type: " string | undefined",
        default: "undefined",
        description: "Specifies the ID of the selected item"
      }
    ],
    propertyImportTypes: {
      "./components/segmented-control/types.ts": ["SegmentedControlModel"]
    }
  },
  {
    access: "public",
    tagName: "ch-showcase-api",
    className: "ChShowcaseApi",
    description: "",
    fullClassJSDoc: "",
    srcPath: "./components/showcase/showcase-api/showcase-api.lit.ts",
    developmentStatus: "to-be-defined",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "properties",
        attribute: false,
        type: " ShowcaseApiProperties | undefined",
        default: "undefined",
        description: "Specifies the properties of the API."
      }
    ],
    propertyImportTypes: {
      "./components/showcase/showcase-api/types.ts": ["ShowcaseApiProperties"]
    }
  },
  {
    access: "public",
    tagName: "ch-sidebar",
    className: "ChSidebar",
    description: "",
    fullClassJSDoc: "",
    srcPath: "./components/sidebar/sidebar.lit.ts",
    developmentStatus: "to-be-defined",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "expandButtonCollapseAccessibleName",
        attribute: "expand-button-collapse-accessible-name",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies a short string, typically 1 to 3 words, that authors associate\r\nwith an element to provide users of assistive technologies with a label\r\nfor expand button when `expanded = true`."
      },
      {
        name: "expandButtonExpandAccessibleName",
        attribute: "expand-button-expand-accessible-name",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies a short string, typically 1 to 3 words, that authors associate\r\nwith an element to provide users of assistive technologies with a label\r\nfor expand button when `expanded = false`."
      },
      {
        name: "expandButtonCollapseCaption",
        attribute: "expand-button-collapse-caption",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies the caption of the expand button when `expanded = true`."
      },
      {
        name: "expandButtonExpandCaption",
        attribute: "expand-button-expand-caption",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies the caption of the expand button when `expanded = false`."
      },
      {
        name: "expandButtonPosition",
        attribute: "expand-button-position",
        type: ' "before" | "after"',
        default: '"after"',
        description:
          'Specifies the position of the expand button relative to the content of the\r\nsidebar.\r\n - `"before"`: The expand button is positioned before the content of the sidebar.\r\n - `"after"`: The expand button is positioned after the content of the sidebar.',
        reflect: true
      },
      {
        name: "expanded",
        attribute: "expanded",
        type: " boolean",
        default: "true",
        description: "Specifies whether the control is expanded or collapsed.",
        reflect: true
      },
      {
        name: "showExpandButton",
        attribute: "show-expand-button",
        type: " boolean",
        default: "false",
        description:
          "`true` to display a expandable button at the bottom of the control."
      }
    ],
    events: [
      {
        name: "expandedChange",
        detailType: "boolean",
        description:
          "Emitted when thea element is clicked or the space key is pressed and\r\nreleased."
      }
    ]
  },
  {
    access: "public",
    tagName: "ch-slider",
    className: "ChSlider",
    description:
      "The slider control is a input where the user selects a value from within a given range.",
    fullClassJSDoc:
      "/**\r\n * The slider control is a input where the user selects a value from within a given range.\r\n *\r\n * @part track - The track of the slider element.\r\n * @part thumb - The thumb of the slider element.\r\n *\r\n * @part track__selected - Represents the portion of the track that is selected, that is, the portion of the track that starts at the min value and goes to the current value.\r\n * @part track__unselected - Represents the portion of the track that is not selected, that is, the portion of the track that starts at the current value and goes to the max value.\r\n *\r\n * @part disabled - Present in all parts when the control is disabled (`disabled` === `true`).\r\n */",
    srcPath: "./components/slider/slider.lit.ts",
    developmentStatus: "to-be-defined",
    formAssociated: true,
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "accessibleName",
        attribute: "accessible-name",
        type: "\r\n    | string\r\n    | undefined",
        default: "undefined",
        description:
          "Specifies a short string, typically 1 to 3 words, that authors associate\r\nwith an element to provide users of assistive technologies with a label\r\nfor the element."
      },
      {
        name: "disabled",
        attribute: "disabled",
        type: " boolean",
        default: "false",
        description:
          "This attribute allows you specify if the element is disabled.\r\nIf disabled, it will not trigger any user interaction related event\r\n(for example, click event).",
        reflect: true
      },
      {
        name: "maxValue",
        attribute: "maxvalue",
        type: " number",
        default: "5",
        description:
          "This attribute lets you specify maximum value of the slider."
      },
      {
        name: "minValue",
        attribute: "minvalue",
        type: " number",
        default: "0",
        description:
          "This attribute lets you specify minimum value of the slider."
      },
      {
        name: "name",
        attribute: "name",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies the `name` of the component when used in a form."
      },
      {
        name: "showValue",
        attribute: "showvalue",
        type: " boolean",
        default: "false",
        description:
          "This attribute lets you indicate whether the control should display a\r\nbubble with the current value upon interaction."
      },
      {
        name: "step",
        attribute: "step",
        type: " number",
        default: "1",
        description:
          "This attribute lets you specify the step of the slider.\r\n\r\nThis attribute is useful when the values of the slider can only take some\r\ndiscrete values. For example, if valid values are `[10, 20, 30]` set the\r\n`minValue` to `10`, the maxValue to `30`, and the step to `10`. If the\r\nstep is `0`, the any intermediate value is valid."
      },
      {
        name: "value",
        attribute: "value",
        type: " number",
        default: "0",
        description: "The value of the control."
      }
    ],
    events: [
      {
        name: "change",
        detailType: "number",
        description:
          "The `change` event is emitted when a change to the element's value is\r\ncommitted by the user."
      },
      {
        name: "input",
        detailType: "number",
        description:
          "The `input` event is fired synchronously when the value is changed."
      }
    ],
    methods: [
      {
        name: "createPepe",
        paramTypes: [],
        returnType: "void"
      },
      {
        name: "createPepe2",
        paramTypes: [],
        returnType: "string"
      },
      {
        name: "createPaa",
        paramTypes: [
          {
            name: "param1",
            type: "string"
          },
          {
            name: "param2",
            type: "string"
          }
        ],
        returnType: "string",
        description: "asdasd\r\n\r\nasdasd123123\r\nasd.1.23--"
      }
    ],
    parts: [
      {
        name: "track",
        description: "The track of the slider element."
      },
      {
        name: "thumb",
        description: "The thumb of the slider element."
      },
      {
        name: "track__selected",
        description:
          "Represents the portion of the track that is selected, that is, the portion of the track that starts at the min value and goes to the current value."
      },
      {
        name: "track__unselected",
        description:
          "Represents the portion of the track that is not selected, that is, the portion of the track that starts at the current value and goes to the max value."
      },
      {
        name: "disabled",
        description:
          "Present in all parts when the control is disabled (`disabled` === `true`)."
      }
    ]
  },
  {
    access: "public",
    tagName: "ch-switch",
    className: "ChSwitch",
    description: "",
    fullClassJSDoc:
      "/**\r\n * @status experimental\r\n *\r\n * A switch/toggle control that enables you to select between options.\r\n *\r\n * @part track - The track of the switch element.\r\n * @part thumb - The thumb of the switch element.\r\n * @part caption - The caption (checked or unchecked) of the switch element.\r\n *\r\n * @part checked - Present in the `track`, `thumb` and `caption` parts when the control is checked (`checked` === `true`).\r\n * @part disabled - Present in the `track`, `thumb` and `caption` parts when the control is disabled (`disabled` === `true`).\r\n * @part unchecked - Present in the `track`, `thumb` and `caption` parts when the control is unchecked (`checked` === `false`).\r\n */",
    srcPath: "./components/switch/switch.lit.ts",
    developmentStatus: "to-be-defined",
    formAssociated: true,
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "accessibleName",
        attribute: "accessible-name",
        type: "\r\n    | string\r\n    | undefined",
        default: "undefined",
        description:
          "Specifies a short string, typically 1 to 3 words, that authors associate\r\nwith an element to provide users of assistive technologies with a label\r\nfor the element.asd123"
      },
      {
        name: "checkedCaption",
        attribute: "checked-caption",
        type: "\r\n    | string\r\n    | undefined",
        default: "undefined",
        description: "Caption displayed when the switch is 'on'"
      },
      {
        name: "checked",
        attribute: "checked",
        type: " boolean",
        default: "false",
        description:
          "`true` if the `ch-switch` is checked.\r\n\r\nIf checked:\r\n  - The `value` property will be available in the parent `<form>` if the\r\n    `name` attribute is set.\r\n  - The `checkedCaption` will be used to display the current caption.\r\n\r\nIf not checked:\r\n  - The `value` property won't be available in the parent `<form>`, even\r\n    if the `name` attribute is set.\r\n  - The `unCheckedCaption` will be used to display the current caption."
      },
      {
        name: "disabled",
        attribute: "disabled",
        type: " boolean",
        default: "false",
        description:
          "This attribute lets you specify if the element is disabled.\r\nIf disabled, it will not fire any user interaction related event\r\n(for example, click event).",
        reflect: true
      },
      {
        name: "name",
        attribute: "name",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies the `name` of the component when used in a form."
      },
      {
        name: "readonly",
        attribute: "readonly",
        type: " boolean",
        default: "false",
        description:
          "This attribute indicates that the user cannot modify the value of the control.\r\nSame as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly)\r\nattribute for `input` elements."
      },
      {
        name: "unCheckedCaption",
        attribute: "un-checked-caption",
        type: "\r\n    | string\r\n    | undefined",
        default: "undefined",
        description: "Caption displayed when the switch is 'off'"
      },
      {
        name: "value",
        attribute: "value",
        type: " string",
        default: '"on"',
        description: "The value of the control."
      }
    ],
    events: [
      {
        name: "input",
        detailType: "boolean",
        description:
          "The `input` event is emitted when a change to the element's checked state\r\nis committed by the user.\r\n\r\nIt contains the new checked state of the control.\r\n\r\nThis event is preventable."
      }
    ],
    parts: [
      {
        name: "track",
        description: "The track of the switch element."
      },
      {
        name: "thumb",
        description: "The thumb of the switch element."
      },
      {
        name: "caption",
        description: "The caption (checked or unchecked) of the switch element."
      },
      {
        name: "checked",
        description:
          "Present in the `track`, `thumb` and `caption` parts when the control is checked (`checked` === `true`)."
      },
      {
        name: "disabled",
        description:
          "Present in the `track`, `thumb` and `caption` parts when the control is disabled (`disabled` === `true`)."
      },
      {
        name: "unchecked",
        description:
          "Present in the `track`, `thumb` and `caption` parts when the control is unchecked (`checked` === `false`)."
      }
    ]
  },
  {
    access: "public",
    tagName: "ch-tabular-grid-column",
    className: "ChTabularGridColumn",
    description: "",
    fullClassJSDoc: "",
    srcPath:
      "./components/tabular-grid/internal/tabular-grid-column/tabular-grid-column.lit.ts",
    developmentStatus: "to-be-defined",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "accessibleName",
        attribute: "accessiblename",
        type: " string | undefined",
        default: "undefined",
        description: "..."
      },
      {
        name: "caption",
        attribute: "caption",
        type: " string | undefined",
        default: "undefined",
        description: "Specifies the caption of the column"
      },
      {
        name: "colSpan",
        attribute: "colspan",
        type: " number | undefined",
        default: "undefined",
        description: "Specifies the column span value of the column."
      },
      {
        name: "colStart",
        attribute: "colstart",
        type: " number | undefined",
        default: "undefined",
        description: "Specifies the start position of the column."
      },
      {
        name: "parts",
        attribute: "parts",
        type: " string | undefined",
        default: "undefined",
        description: "..."
      },
      {
        name: "resizable",
        attribute: "resizable",
        type: " boolean | undefined",
        default: "undefined",
        description: "..."
      },
      {
        name: "rowSpan",
        attribute: "rowspan",
        type: " number | undefined",
        default: "undefined",
        description: "Specifies the row span value of the column."
      },
      {
        name: "size",
        attribute: "size",
        type: " string | undefined",
        default: "undefined",
        description: "..."
      },
      {
        name: "styles",
        attribute: "style",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies an accessor for the attribute style of the\r\n`ch-tabular-grid-column`. This accessor is useful for SSR scenarios were\r\nthe Host access is limited (since Lit does not provide the Host\r\ndeclarative component).\r\n\r\nWithout this accessor, the initial load in SSR scenarios would flicker.",
        reflect: true
      },
      {
        name: "sortable",
        attribute: "sortable",
        type: " boolean | undefined",
        default: "undefined",
        description: "..."
      },
      {
        name: "sortDirection",
        attribute: "aria-sort",
        type: "\r\n    | TabularGridSortDirection\r\n    | undefined",
        default: "undefined",
        description: "Specifies if the column content is sorted."
      }
    ],
    propertyImportTypes: {
      "./components/tabular-grid/types.ts": ["TabularGridSortDirection"]
    }
  },
  {
    access: "public",
    tagName: "ch-tabular-grid-render",
    className: "ChTabularGridRender",
    description: "",
    fullClassJSDoc: "",
    srcPath: "./components/tabular-grid/tabular-grid-render.lit.ts",
    developmentStatus: "to-be-defined",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "columnHideable",
        attribute: "columnhideable",
        type: " boolean",
        default: "true",
        description: "Determines if the columns can be hidden by the user"
      },
      {
        name: "columnResizable",
        attribute: "columnresizable",
        type: " boolean",
        default: "true",
        description: "Determines if the columns can be resized by the user."
      },
      {
        name: "columnSortable",
        attribute: "columnsortable",
        type: " boolean",
        default: "true",
        description: "Determines if the columns can be sorted by the user."
      },
      {
        name: "model",
        attribute: "model",
        type: " TabularGridModel | undefined",
        default: "undefined",
        description: "Specifies the content of the tabular grid control."
      }
    ],
    propertyImportTypes: {
      "./components/tabular-grid/types.ts": ["TabularGridModel"]
    }
  },
  {
    access: "public",
    tagName: "ch-textblock",
    className: "ChTextBlock",
    description: "",
    fullClassJSDoc:
      "/**\r\n * @status developer-preview\r\n *\r\n * @slot - The slot for the HTML content.\r\n */",
    srcPath: "./components/textblock/textblock.lit.ts",
    developmentStatus: "developer-preview",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "autoGrow",
        attribute: "autogrow",
        type: " boolean",
        default: "false",
        description:
          "This property defines if the control size will grow automatically, to\r\nadjust to its content size.\r\n\r\nIf `false` the overflowing content will be displayed with an ellipsis.\r\nThis ellipsis takes into account multiple lines."
      },
      {
        name: "caption",
        attribute: "caption",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies the content to be displayed when the control has `format = text`."
      },
      {
        name: "characterToMeasureLineHeight",
        attribute: "charactertomeasurelineheight",
        type: " string",
        default: '"A"',
        description: "Specifies the character used to measure the line height"
      },
      {
        name: "format",
        attribute: "format",
        type: ' "text" | "HTML"',
        default: '"text"',
        description:
          "It specifies the format that will have the textblock control.\r\n\r\n - If `format` = `HTML`, the textblock control works as an HTML div and\r\n   the innerHTML will be taken from the default slot.\r\n\r\n - If `format` = `text`, the control works as a normal textblock control\r\n   and it is affected by most of the defined properties."
      },
      {
        name: "showTooltipOnOverflow",
        attribute: "showtooltiponoverflow",
        type: " boolean",
        default: "false",
        description:
          "`true` to display a tooltip when the caption overflows the size of the\r\ncontainer.\r\n\r\nOnly works if `format = text` and `autoGrow = false`."
      }
    ],
    slots: [
      {
        name: "- The slot for the HTML content."
      }
    ]
  },
  {
    access: "public",
    tagName: "ch-theme",
    className: "ChTheme",
    description:
      "It allows you to load a style sheet in a similar way to the\r\nnative LINK or STYLE tags, but assigning it a name so that\r\nit can be reused in different contexts,\r\neither in the Document or in a Shadow-Root.",
    fullClassJSDoc:
      "/**\r\n * It allows you to load a style sheet in a similar way to the\r\n * native LINK or STYLE tags, but assigning it a name so that\r\n * it can be reused in different contexts,\r\n * either in the Document or in a Shadow-Root.\r\n */",
    srcPath: "./components/theme/theme.lit.ts",
    developmentStatus: "to-be-defined",
    mode: "open",
    shadow: false,
    properties: [
      {
        name: "attachStyleSheets",
        attribute: "attachstylesheets",
        type: " boolean",
        default: "true",
        description:
          "Indicates whether the theme should be attached to the Document or\r\nthe ShadowRoot after loading.\r\nThe value can be overridden by the `attachStyleSheet` property of the model."
      },
      {
        name: "avoidFlashOfUnstyledContent",
        attribute: "avoidflashofunstyledcontent",
        type: " boolean",
        default: "true",
        description:
          "`true` to visually hide the contents of the root node while the control's\r\nstyle is not loaded."
      },
      {
        name: "hidden",
        attribute: "hidden",
        type: " boolean",
        default: "false",
        description:
          "Specifies an accessor for the attribute `hidden` of the `ch-theme`. This\r\naccessor is useful for SSR scenarios were the DOM is shimmed and we don't\r\nhave access to is limited (since Lit does not provide the Host declarative\r\ncomponent), so we have to find a way to reflect the hidden property in the\r\n`ch-theme` tag.\r\n\r\nWithout this accessor, the initial load in SSR scenarios would flicker.",
        reflect: true
      },
      {
        name: "model",
        attribute: false,
        type: " ThemeModel | undefined | null",
        default: "undefined",
        description: "Specify themes to load"
      },
      {
        name: "timeout",
        attribute: "timeout",
        type: "any",
        default: "10000",
        description:
          "Specifies the time to wait for the requested theme to load."
      }
    ],
    events: [
      {
        name: "themeLoaded",
        detailType: "ChThemeLoadedEvent",
        description: "Event emitted when the theme has successfully loaded"
      }
    ],
    propertyImportTypes: {
      "./components/theme/theme-types.ts": ["ThemeModel"]
    },
    eventImportTypes: {
      "./components/theme/theme-types.ts": ["ChThemeLoadedEvent"]
    }
  }
] as const satisfies LibraryComponents;

export type LibraryComponents = ComponentDefinition[];
export type ComponentDefinition = {
  /**
   * The visibility of the component in the library. "public" component can be
   * used outside of the library, but "private" components are scoped to the
   * library, meaning that they should not be used outside of the library.
   *
   * For example, if a component is part of a render and should only be controlled
   * by the render, it should be marked with "private" | "protected" | "package".
   */
  access: "public" | "private" | "protected" | "package";
  tagName: string;
  className: string;
  description: string;
  /**
   * The full JSDoc comment of the custom element Class.
   */
  fullClassJSDoc: string;
  /**
   * Relative path where the component's class is located.
   */
  srcPath: string;
  /**
   * The path where the component is defined to be imported.
   *
   * This path is defined "exports" field of the package.json.
   */
  packageJsonExportsPath?: string;
  /**
   * Semantic role that the component implements. A component might implement
   * multiple accessible roles, in which case they are defined with an array.
   */
  accessibleRole?: string | string[];
  /**
   * Development status of the component.
   */
  developmentStatus:
    | "experimental"
    | "developer-preview"
    | "stable"
    | "to-be-defined";
  /**
   * `true` if the component can be used in web forms by setting the name
   * attribute on the tag.
   */
  formAssociated?: boolean;
  /**
   * Shadow root mode.
   */
  mode: "open" | "closed";
  /**
   * `true` if the web component has Shadow DOM.
   */
  shadow: boolean;
  properties?: ComponentDefinitionProperties;
  events?: ComponentDefinitionEvents;
  methods?: ComponentDefinitionMethods;
  parts?: ComponentDefinitionParts;
  slots?: ComponentDefinitionSlots;
  cssVariables?: ComponentDefinitionCssVariables;
  /**
   * The location of type declarations that the component imports in order to
   * correctly type its properties. These imports are relative to the folder
   * of where the library is analyzed.
   */
  propertyImportTypes?: ComponentImportTypes;
  /**
   * The location of type declarations that the component imports in order to
   * correctly type its events. These imports are relative to the folder
   * of where the library is analyzed.
   */
  eventImportTypes?: ComponentImportTypes;
  /**
   * The location of type declarations that the component imports in order to
   * correctly type its methods. These imports are relative to the folder
   * of where the library is analyzed.
   */
  methodImportTypes?: ComponentImportTypes;
};
export type ComponentDefinitionProperties = ComponentDefinitionProperty[];
export type ComponentDefinitionEvents = ComponentDefinitionEvent[];
export type ComponentDefinitionMethods = ComponentDefinitionMethod[];
export type ComponentDefinitionParts = ComponentDefinitionPart[];
export type ComponentDefinitionSlots = ComponentDefinitionSlot[];
export type ComponentDefinitionCssVariables = ComponentDefinitionCssVariable[];
export type ComponentImportTypes = Record<string, string[]>;
export type ComponentDefinitionProperty = {
  /**
   * If `false`, the property is not associated with an HTML attribute.
   * Otherwise, it is a string with the name of the attribute that is synced
   * with the class property.
   */
  attribute: string | false;
  default: string;
  description?: string;
  name: string;
  /**
   * `true` if the property value is reflected with the attribute in the DOM.
   */
  reflect?: boolean;
  /**
   * `true` if the property is required for using the component.
   */
  required?: boolean;
  type: string;
};
export type ComponentDefinitionEvent = {
  bubbles?: boolean;
  cancelable?: boolean;
  composed?: boolean;
  description?: string;
  /**
   * Type for the `detail` field of the event. If the event doesn't emits any
   * detail, the `detailType` is be `void`.
   */
  detailType: string;
  name: string;
};
export type ComponentDefinitionMethod = {
  description?: string;
  name: string;
  paramTypes: {
    name: string;
    description?: string;
    type: string;
  }[];
  returnType: string;
};
export type ComponentDefinitionPart = {
  description?: string;
  name: string;
};
export type ComponentDefinitionSlot = {
  description?: string;
  name: string;
};
export type ComponentDefinitionCssVariable = {
  description?: string;
  default?: string;
  name: string;
};
