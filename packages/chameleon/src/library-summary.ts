export const librarySummary = [
  {
    access: "public",
    tagName: "ch-accordion-render",
    className: "ChAccordionRender",
    description:
      "The `ch-accordion-render` component displays a vertical stack of collapsible panels, each with a clickable header that toggles the visibility of its associated content section.",
    fullClassJSDoc:
      "/**\n * The `ch-accordion-render` component displays a vertical stack of collapsible panels, each with a clickable header that toggles the visibility of its associated content section.\n *\n * @remarks\n * ## Features\n *  - Expand or collapse panels on demand to organize lengthy content into space-efficient sections.\n *  - Single-item mode (`singleItemExpanded`) ensures only one panel is open at a time, automatically closing the others.\n *  - Configurable expandable button position (`start` or `end`) in each panel header.\n *  - Per-item images in the header via `startImgSrc` and a customizable image-path callback.\n *  - Disabled state at the control level or per individual item.\n *  - Custom header content through named slots.\n *\n * ## Use when\n *  - Organizing lengthy content into logically grouped, collapsible sections (FAQs, settings pages, form groups).\n *  - Reducing cognitive load by showing one section at a time.\n *  - Reducing page length when users are unlikely to need all sections simultaneously (FAQs, settings).\n *  - Space-constrained UIs where vertical scrolling is undesirable and content can be consumed independently.\n *\n * ## Do not use when\n *  - Users need to compare content side-by-side -- the accordion pattern inherently hides inactive sections.\n *  - Users are likely to read all sections — use plain headings and scrollable content instead.\n *  - Content sections are interdependent and must be compared side by side — the back-and-forth is too costly.\n *  - Sequential step-by-step processes where hiding steps creates confusion — prefer a stepper/wizard.\n *  - Nesting accordions within accordions — double-nested collapsed panels disorient users.\n *\n * ## Accessibility\n *  - Each header is a `<button>` with `aria-expanded` and `aria-controls` linking to its section.\n *  - Sections are labelled via `aria-labelledby` pointing back to the header button, or via explicit `aria-label` when provided.\n *  - Supports the disclosure pattern: toggling a header expands or collapses its associated section.\n *\n * @status experimental\n *\n * @csspart header - The clickable `<button>` element that toggles the collapsible section. Present on every item.\n * @csspart panel - The outer container that wraps the `header` and the `section` of each item.\n * @csspart section - The collapsible `<section>` element that contains the item's body content.\n *\n * @csspart disabled - Present in the `header`, `panel`, and `section` parts when the item is disabled.\n * @csspart expanded - Present in the `header`, `panel`, and `section` parts when the item is expanded.\n * @csspart collapsed - Present in the `header`, `panel`, and `section` parts when the item is collapsed.\n *\n * @slot {item.headerSlotId} - Named slot projected inside the `header` button for custom header content. Rendered when the item defines a `headerSlotId`.\n * @slot {item.id} - Named slot projected inside the `section` for each item's collapsible body content.\n *\n * @cssprop [--ch-accordion__chevron-size = #{$default-decorative-image-size}] - Specifies the box size of the chevron.\n * @cssprop [--ch-accordion__chevron-image-size = 100%] - Specifies the image size of the chevron.\n * @cssprop [--ch-accordion__chevron-color = currentColor] - Specifies the color of the chevron.\n * @cssprop [--ch-accordion-expand-collapse-duration = 0ms] - Specifies duration of the expand and collapse animation.\n * @cssprop [--ch-accordion-expand-collapse-timing-function = linear] - Specifies timing function of the expand and collapse animation.\n * @cssprop [--ch-accordion__header-background-image = #{$expandable-icon}] - Specifies the background image used for the expandable chevron in the header.\n */",
    srcPath: "./components/accordion/accordion.lit.ts",
    developmentStatus: "experimental",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "disabled",
        attribute: "disabled",
        type: " boolean",
        default: "false",
        description:
          "This attribute lets you specify if all accordions are disabled.\nIf disabled, accordions will not fire any user interaction related event\n(for example, `expandedChange` event)."
      },
      {
        name: "expandableButtonPosition",
        attribute: "expandable-button-position",
        type: ' "start" | "end"',
        default: '"end"',
        description:
          'Specifies the position of the expandable button (chevron) in the header\nof the panels. `"start"` places the chevron at the inline-start edge of\nthe header, while `"end"` places it at the inline-end edge.'
      },
      {
        name: "getImagePathCallback",
        attribute: false,
        type: " GetImagePathCallback | undefined",
        default: "undefined",
        description:
          "This property specifies a callback that is executed when the path for an\n`startImgSrc` needs to be resolved. The resolution follows a fallback\nchain: per-instance callback → global registry signal → `undefined`."
      },
      {
        name: "model",
        attribute: false,
        type: " AccordionModel | undefined",
        default: "undefined",
        description:
          "Specifies the items of the control. Each entry is an\n`AccordionItemModel` with at least `id`, `caption`, and `expanded`.\nThe component mutates `item.expanded` directly on these model objects\nwhen the user toggles a panel."
      },
      {
        name: "singleItemExpanded",
        attribute: "single-item-expanded",
        type: " boolean",
        default: "false",
        description:
          "If `true` only one item will be expanded at the same time."
      }
    ],
    events: [
      {
        name: "expandedChange",
        detailType: "AccordionItemExpandedChangeEvent",
        description:
          "Fired when an item is expanded or collapsed. The payload is\n`{ id: string; expanded: boolean }`. In `singleItemExpanded` mode,\nmultiple events fire: one for each auto-collapsed item (with\n`expanded: false`) followed by one for the newly expanded item."
      }
    ],
    slots: [
      {
        name: "{item.headerSlotId}",
        description:
          "Named slot projected inside the `header` button for custom header content. Rendered when the item defines a `headerSlotId`."
      },
      {
        name: "{item.id}",
        description:
          "Named slot projected inside the `section` for each item's collapsible body content."
      }
    ],
    cssVariables: [
      {
        name: "--ch-accordion__chevron-size = #{$default-decorative-image-size}",
        description: "Specifies the box size of the chevron."
      },
      {
        name: "--ch-accordion__chevron-image-size = 100%",
        description: "Specifies the image size of the chevron."
      },
      {
        name: "--ch-accordion__chevron-color = currentColor",
        description: "Specifies the color of the chevron."
      },
      {
        name: "--ch-accordion-expand-collapse-duration = 0ms",
        description: "Specifies duration of the expand and collapse animation."
      },
      {
        name: "--ch-accordion-expand-collapse-timing-function = linear",
        description:
          "Specifies timing function of the expand and collapse animation."
      },
      {
        name: "--ch-accordion__header-background-image = #{$expandable-icon}",
        description:
          "Specifies the background image used for the expandable chevron in the header."
      }
    ],
    propertyImportTypes: {
      "./typings/multi-state-images.ts": ["GetImagePathCallback"],
      "./components/accordion/types.ts": ["AccordionModel"]
    },
    eventImportTypes: {
      "./components/accordion/types.ts": ["AccordionItemExpandedChangeEvent"]
    }
  },
  {
    access: "public",
    tagName: "ch-action-group-render",
    className: "ChActionGroupRender",
    description:
      'The `ch-action-group-render` component displays a horizontal group of actionable items that adapts to the available space by collapsing overflowing items into a "more actions" dropdown menu.',
    fullClassJSDoc:
      '/**\n * The `ch-action-group-render` component displays a horizontal group of actionable items that adapts to the available space by collapsing overflowing items into a "more actions" dropdown menu.\n *\n * @remarks\n * ## Features\n *  - Three overflow strategies: horizontal scroll, multiline wrap, or responsive collapse into a dropdown.\n *  - Responsive-collapse mode uses `IntersectionObserver` to detect hidden items in real time.\n *  - Overflow dropdown powered by `ch-action-menu-render`.\n *  - Supports custom slot content that is forwarded into the overflow menu when collapsed.\n *\n * ## Use when\n *  - You have a dynamic set of toolbar-style actions that must remain usable at every viewport width.\n *  - Building command bars or toolbars that need graceful degradation on smaller screens.\n *  - Toolbars or command bars with a variable number of actions that must adapt to available space.\n *\n * ## Do not use when\n *  - The actions do not need responsive overflow handling -- prefer a plain list or `ch-action-menu-render` instead.\n *  - All actions should always be visible — use individual buttons or `ch-action-list-render` instead.\n *\n * ## Accessibility\n *  - The host element has `role="list"`, and the overflow menu item has `role="listitem"`.\n *  - The "more actions" button carries a configurable `aria-label` (`moreActionsAccessibleName`).\n *  - The component delegates click, keyboard, and expanded-change events to\n *    its embedded `ch-action-menu-render` for the overflow dropdown.\n *\n * @part separator - A horizontal divider rendered for items of `type: "separator"`. Also receives the item\'s `id` and custom `parts` if defined.\n * @part vertical - Present on `separator` items.\n *\n * @status experimental\n *\n * @slot {name} - Named slots matching each item of `type: "slot"` in the model. These slots allow projecting custom content for individual action items and are forwarded into the overflow menu when the item collapses.\n */',
    srcPath: "./components/action-group/action-group-render.lit.ts",
    developmentStatus: "experimental",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "disabled",
        attribute: "disabled",
        type: " boolean",
        default: "false",
        description:
          "This attribute lets you specify if the element is disabled.\nIf disabled, it will not fire any user interaction related event\n(for example, click event)."
      },
      {
        name: "getImagePathCallback",
        attribute: false,
        type: " ActionMenuImagePathCallback | undefined",
        default: "undefined",
        description:
          "This property specifies a callback that is executed when the path for an\nstartImgSrc or endImgSrc (of an item) needs to be resolved."
      },
      {
        name: "itemsOverflowBehavior",
        attribute: "items-overflow-behavior",
        type: " ItemsOverflowBehavior",
        default: '"responsive-collapse"',
        description:
          "This attribute determines how items behave when the content of the ActionGroup overflows horizontal. This property is needed\nto make the control responsive to changes in the width of the container of ActionGroup.\n\n| Value                 | Details                                                                                          |\n| --------------------- | ------------------------------------------------------------------------------------------------ |\n| `add-scroll`          | The items of the ActionGroup that overflow horizontally are shown by means of a scroll.          |\n| `multiline`           | The ActionGroup items that overflow horizontally are shown in a second line of the control.      |\n| `responsive-collapse` | The Action Group items, when they start to overflow the control, are placed in the More Actions. |",
        reflect: true
      },
      {
        name: "model",
        attribute: false,
        type: " ActionGroupModel | undefined",
        default: "undefined",
        description:
          "This property lets you define the model of the ch-action-group control."
      },
      {
        name: "moreActionsAccessibleName",
        attribute: "more-actions-accessible-name",
        type: " string",
        default: '"Show more actions"',
        description:
          "This property lets you specify the label for the more actions button.\nImportant for accessibility."
      },
      {
        name: "moreActionsBlockAlign",
        attribute: "more-actions-block-align",
        type: " ChPopoverAlign",
        default: '"outside-end"',
        description:
          'Specifies the block alignment of the more actions dropdown that is\nplaced relative to the "more actions" button.'
      },
      {
        name: "moreActionsCaption",
        attribute: "more-actions-caption",
        type: " string | undefined",
        default: "undefined",
        description:
          "This attribute lets you specify the caption for the more actions button."
      },
      {
        name: "moreActionsInlineAlign",
        attribute: "more-actions-inline-align",
        type: " ChPopoverAlign",
        default: '"inside-start"',
        description:
          'Specifies the inline alignment of the more actions dropdown that is\nplaced relative to the "more actions" button.'
      }
    ],
    parts: [
      {
        name: "separator",
        description:
          'A horizontal divider rendered for items of `type: "separator"`. Also receives the item\'s `id` and custom `parts` if defined.'
      },
      {
        name: "vertical",
        description: "Present on `separator` items."
      }
    ],
    slots: [
      {
        name: "{name}",
        description:
          'Named slots matching each item of `type: "slot"` in the model. These slots allow projecting custom content for individual action items and are forwarded into the overflow menu when the item collapses.'
      }
    ],
    propertyImportTypes: {
      "./components/action-menu/types.ts": ["ActionMenuImagePathCallback"],
      "./components/action-group/types.ts": [
        "ItemsOverflowBehavior",
        "ActionGroupModel"
      ],
      "./components/popover/types.ts": ["ChPopoverAlign"]
    }
  },
  {
    access: "public",
    tagName: "ch-action-list-render",
    className: "ChActionListRender",
    description:
      "The `ch-action-list-render` component renders an interactive list of actionable items driven by a declarative model.",
    fullClassJSDoc:
      '/**\n * The `ch-action-list-render` component renders an interactive list of actionable items driven by a declarative model.\n *\n * @remarks\n * ## Features\n *  - Single and multiple selection with modifier-key multi-select.\n *  - In-place caption editing with optimistic UI updates.\n *  - Item pinning (fixed) and sorting.\n *  - Grouping with expandable/collapsible sections.\n *  - Programmatic add/remove operations.\n *  - Three item types: `actionable`, `group`, and `separator`.\n *  - Keyboard navigation.\n *\n * ## Use when\n *  - You need a rich, data-driven list with selection semantics (e.g., panel lists, filterable sidebars, or reorderable collections).\n *  - Command palettes, selection panels, or item management lists where users can pick, pin, edit, or remove items.\n *\n * ## Do not use when\n *  - You need a simple static list without selection or editing -- use a plain HTML list instead.\n *  - Navigation is the primary purpose -- prefer `ch-navigation-list-render`.\n *  - The list is hierarchical -- prefer `ch-tree-view-render`.\n *\n * ## Accessibility\n *  - The host element has `role="list"` with `aria-multiselectable` when `selection` is `"multiple"`.\n *  - Separator items have `role="separator"` and `aria-hidden="true"`.\n *  - Supports keyboard navigation: arrow keys move focus between items, Enter/Space selects, and modifier-click enables multi-select.\n *\n * @status experimental\n *\n * @part separator - A horizontal divider rendered between items when the model contains an item of `type: "separator"`.\n *\n * @part item__action - The clickable row element for each actionable item.\n * @part item__caption - The text caption inside an actionable item.\n * @part item__checkbox - The checkbox element rendered when `checkbox` is `true`.\n *\n * @part group__action - The clickable header row for a group item.\n * @part group__caption - The text caption inside a group header.\n * @part group__expandable - The expandable/collapsible container for a group\'s children.\n *\n * @part disabled - Present in the `item__action`, `item__caption`, `group__action`, and `group__caption` parts when the item is disabled.\n * @part expanded - Present in the `group__expandable` part when the group is expanded.\n * @part collapsed - Present in the `group__expandable` part when the group is collapsed.\n * @part selected - Present in the `item__action` and `group__action` parts when the item is selected.\n * @part not-selected - Present in the `item__action` and `group__action` parts when the item is not selected.\n */',
    srcPath: "./components/action-list/action-list-render.lit.ts",
    developmentStatus: "experimental",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "checkbox",
        attribute: "checkbox",
        type: " boolean",
        default: "false",
        description:
          "Set this attribute if you want display a checkbox in all items by default."
      },
      {
        name: "checked",
        attribute: "checked",
        type: " boolean",
        default: "false",
        description:
          "Set this attribute if you want the checkbox to be checked in all items by\ndefault.\nOnly works if `checkbox = true`"
      },
      {
        name: "disabled",
        attribute: "disabled",
        type: " boolean",
        default: "false",
        description:
          "This attribute lets you specify if all items are disabled.\nIf disabled, action list items will not fire any user interaction related\nevent (for example, `selectedItemsChange` event)."
      },
      {
        name: "editableItems",
        attribute: "editable-items",
        type: " boolean",
        default: "DEFAULT_EDITABLE_ITEMS_VALUE",
        description:
          "This attribute lets you specify if the edit operation is enabled in all\nitems by default. If `true`, the items can edit its caption in place.\nNote: the default value is `true`, so items are editable unless\nexplicitly disabled."
      },
      {
        name: "fixItemCallback",
        attribute: false,
        type: "\n    | ((\n        itemInfo: ActionListItemActionable,\n        newFixedValue: boolean\n      ) => Promise<boolean>)\n    | undefined",
        default: "undefined",
        description:
          "Callback that is executed when and item requests to be fixed/unfixed.\nIf the callback is not defined, the item will be fixed/unfixed without\nfurther confirmation."
      },
      {
        name: "getImagePathCallback",
        attribute: false,
        type: "\n    | ActionListImagePathCallback\n    | undefined",
        default: "undefined",
        description:
          "This property specifies a callback that is executed when the path for an\nimgSrc needs to be resolved."
      },
      {
        name: "model",
        attribute: false,
        type: " ActionListModel",
        default: "[]",
        description:
          'This property lets you define the model of the control. The model is an\narray of `ActionListItemModel` objects. Each item has a `type`\n(`"actionable"`, `"group"`, or `"separator"`), an `id`, a `caption`,\nand optional properties such as `selected`, `disabled`, `fixed`, `order`,\nand nested `items` (for groups).'
      },
      {
        name: "modifyItemCaptionCallback",
        attribute: false,
        type: "\n    | ((actionListItemId: string, newCaption: string) => Promise<void>)\n    | undefined",
        default: "undefined",
        description:
          "Callback that is executed when a item request to modify its caption."
      },
      {
        name: "renderItem",
        attribute: false,
        type: "\n    | ((\n        itemModel: ActionListItemModel,\n        actionListRenderState: ChActionListRender,\n        disabled?: boolean,\n        nested?: boolean,\n        nestedExpandable?: boolean\n      ) => TemplateResult | typeof nothing)\n    | undefined",
        default: "undefined",
        description:
          "This property allows us to implement custom rendering of action-list items."
      },
      {
        name: "removeItemCallback",
        attribute: false,
        type: "\n    | ((itemInfo: ActionListItemActionable) => Promise<boolean>)\n    | undefined",
        default: "undefined",
        description:
          "Callback that is executed when and item requests to be removed.\nIf the callback is not defined, the item will be removed without further\nconfirmation."
      },
      {
        name: "selection",
        attribute: "selection",
        type: ' "single" | "multiple" | "none"',
        default: '"none"',
        description:
          'Specifies the type of selection implemented by the control.\n - `"none"`: No selection; item clicks fire the `itemClick` event.\n - `"single"`: Only one item can be selected at a time.\n - `"multiple"`: Multiple items can be selected using modifier-key clicks.'
      },
      {
        name: "sortItemsCallback",
        attribute: false,
        type: " (\n    subModel: ActionListModel\n  ) => void",
        default: "defaultSortItemsCallback",
        description:
          "Callback that is executed when the action-list model is changed to order its items."
      },
      {
        name: "translations",
        attribute: false,
        type: " ActionListTranslations",
        default: "actionListDefaultTranslations",
        description: "Specifies the literals required for the control."
      }
    ],
    events: [
      {
        name: "selectedItemsChange",
        detailType: "ActionListItemModelExtended[]",
        description:
          'Fired when the selected items change and `selection !== "none"`'
      },
      {
        name: "itemClick",
        detailType: "ActionListItemModelExtended",
        description:
          'Fired when an item is clicked and `selection === "none"`.\nApplies for items that have `type === "actionable"` or\n(`type === "group"` and `expandable === true`)'
      }
    ],
    methods: [
      {
        name: "addItem",
        paramTypes: [
          {
            name: "itemInfo",
            type: "ActionListItemModel"
          },
          {
            name: "groupParentId",
            type: "string"
          }
        ],
        returnType: "void",
        description:
          'Adds an item in the control.\n\nIf the item already exists, the operation is canceled.\n\nIf the `groupParentId` property is specified the item is added in the\ngroup determined by `groupParentId`. It only works if the item to add\nhas `type === "actionable"`'
      },
      {
        name: "getItemsInfo",
        paramTypes: [
          {
            name: "itemsId",
            type: "string[]"
          }
        ],
        returnType: "ActionListItemModelExtended[]",
        description:
          "Given a list of ids, it returns an array of the items that exists in the\ngiven list."
      },
      {
        name: "removeItem",
        paramTypes: [
          {
            name: "itemId",
            type: "string"
          }
        ],
        returnType: "void",
        description: "Remove the item and all its descendants from the control."
      },
      {
        name: "updateItemProperties",
        paramTypes: [
          {
            name: "itemId",
            type: "string"
          },
          {
            name: "properties",
            type: "Partial<ActionListItemModel> & { type: ActionListItemType }"
          }
        ],
        returnType: "void",
        description:
          "Given an itemId and the properties to update, it updates the properties\nof the items in the list."
      }
    ],
    parts: [
      {
        name: "separator",
        description:
          'A horizontal divider rendered between items when the model contains an item of `type: "separator"`.'
      },
      {
        name: "item__action",
        description: "The clickable row element for each actionable item."
      },
      {
        name: "item__caption",
        description: "The text caption inside an actionable item."
      },
      {
        name: "item__checkbox",
        description: "The checkbox element rendered when `checkbox` is `true`."
      },
      {
        name: "group__action",
        description: "The clickable header row for a group item."
      },
      {
        name: "group__caption",
        description: "The text caption inside a group header."
      },
      {
        name: "group__expandable",
        description:
          "The expandable/collapsible container for a group's children."
      },
      {
        name: "disabled",
        description:
          "Present in the `item__action`, `item__caption`, `group__action`, and `group__caption` parts when the item is disabled."
      },
      {
        name: "expanded",
        description:
          "Present in the `group__expandable` part when the group is expanded."
      },
      {
        name: "collapsed",
        description:
          "Present in the `group__expandable` part when the group is collapsed."
      },
      {
        name: "selected",
        description:
          "Present in the `item__action` and `group__action` parts when the item is selected."
      },
      {
        name: "not-selected",
        description:
          "Present in the `item__action` and `group__action` parts when the item is not selected."
      }
    ],
    propertyImportTypes: {
      "./components/action-list/types.ts": [
        "ActionListItemActionable",
        "ActionListImagePathCallback",
        "ActionListModel",
        "ActionListItemModel"
      ],
      lit: ["TemplateResult"],
      "./components/action-list/translations.ts": ["ActionListTranslations"]
    },
    eventImportTypes: {
      "./components/action-list/types.ts": ["ActionListItemModelExtended"]
    },
    methodImportTypes: {
      "./components/action-list/types.ts": [
        "ActionListItemModel",
        "ActionListItemModelExtended",
        "ActionListItemType"
      ]
    }
  },
  {
    access: "public",
    tagName: "ch-action-list-group",
    className: "ChActionListGroup",
    description: "",
    fullClassJSDoc: "/**\n * @status experimental\n */",
    srcPath:
      "./components/action-list/internal/action-list-group/action-list-group.lit.ts",
    developmentStatus: "experimental",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "caption",
        attribute: false,
        type: " string | undefined",
        default: "undefined",
        description: "This attributes specifies the caption of the control"
      },
      {
        name: "disabled",
        attribute: "disabled",
        type: " boolean",
        default: "false",
        description:
          "This attribute lets you specify if the element is disabled.\nIf disabled, it will not fire any user interaction related event\n(for example, click event).",
        reflect: true
      },
      {
        name: "expandable",
        attribute: false,
        type: " boolean | undefined",
        default: "undefined",
        description:
          "If the item has a sub-tree, this attribute determines if the subtree is\ndisplayed."
      },
      {
        name: "expanded",
        attribute: false,
        type: " boolean | undefined",
        default: "undefined",
        description:
          "If the item has a sub-tree, this attribute determines if the subtree is\ndisplayed."
      },
      {
        name: "metadata",
        attribute: false,
        type: " string | undefined",
        default: "undefined",
        description:
          "This attribute represents additional info for the control that is included\nwhen dragging the item."
      },
      {
        name: "parts",
        attribute: false,
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies a set of parts to use in every DOM element of the control."
      },
      {
        name: "selected",
        attribute: false,
        type: " boolean",
        default: "false",
        description: "This attribute lets you specify if the item is selected"
      },
      {
        name: "showDownloadingSpinner",
        attribute: "show-downloading-spinner",
        type: " boolean",
        default: "true",
        description:
          "`true` to show the downloading spinner when lazy loading the sub items of\nthe control."
      }
    ],
    events: [
      {
        name: "loadLazyContent",
        detailType: "string",
        description:
          "Fired when the lazy control is expanded an its content must be loaded."
      }
    ],
    methods: [
      {
        name: "setFocus",
        paramTypes: [],
        returnType: "void",
        description: "Set the focus in the control if `expandable === true`."
      }
    ]
  },
  {
    access: "public",
    tagName: "ch-action-list-item",
    className: "ChActionListItem",
    description: "",
    fullClassJSDoc: "/**\n * @status experimental\n */",
    srcPath:
      "./components/action-list/internal/action-list-item/action-list-item.lit.ts",
    developmentStatus: "experimental",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "additionalInfo",
        attribute: false,
        type: " ActionListItemAdditionalInformation | undefined",
        default: "undefined"
      },
      {
        name: "caption",
        attribute: false,
        type: " string | undefined",
        default: "undefined",
        description: "This attributes specifies the caption of the control."
      },
      {
        name: "checkbox",
        attribute: "checkbox",
        type: " boolean",
        default: "false",
        description:
          "Set this attribute if you want display a checkbox in the control."
      },
      {
        name: "checked",
        attribute: "checked",
        type: " boolean",
        default: "false",
        description:
          "Set this attribute if you want the checkbox to be checked by default.\nOnly works if `checkbox = true`",
        reflect: true
      },
      {
        name: "customRender",
        attribute: "custom-render",
        type: " boolean",
        default: "false",
        description:
          "Set this attribute if you want to set a custom render for the control, by\npassing a slot."
      },
      {
        name: "disabled",
        attribute: "disabled",
        type: " boolean",
        default: "false",
        description:
          "This attribute lets you specify if the element is disabled.\nIf disabled, it will not fire any user interaction related event\n(for example, click event).",
        reflect: true
      },
      {
        name: "editable",
        attribute: false,
        type: " boolean | undefined",
        default: "undefined",
        description:
          "This property lets you specify if the edit operation is enabled in the\ncontrol. If `true`, the control can edit its caption in place."
      },
      {
        name: "fixed",
        attribute: false,
        type: " boolean | undefined",
        default: "false"
      },
      {
        name: "getImagePathCallback",
        attribute: false,
        type: "\n    | ((item: ActionListItemAdditionalBase) => GxImageMultiState | undefined)\n    | undefined",
        default: "undefined",
        description:
          "This property specifies a callback that is executed when the path for an\nimgSrc needs to be resolved."
      },
      {
        name: "metadata",
        attribute: false,
        type: " string | undefined",
        default: "undefined",
        description:
          "This attribute represents additional info for the control that is included\nwhen dragging the item."
      },
      {
        name: "nested",
        attribute: false,
        type: " boolean",
        default: "false",
        description:
          "Specifies if the item is inside of a ch-action-list-group control."
      },
      {
        name: "nestedExpandable",
        attribute: false,
        type: " boolean",
        default: "false",
        description:
          "Specifies if the item is inside of a ch-action-list-group control that\nis expandable."
      },
      {
        name: "parts",
        attribute: false,
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies a set of parts to use in every DOM element of the control."
      },
      {
        name: "selectable",
        attribute: false,
        type: " boolean",
        default: "false",
        description: "Specifies if the item can be selected."
      },
      {
        name: "selected",
        attribute: false,
        type: " boolean",
        default: "false",
        description: "This attribute lets you specify if the item is selected"
      },
      {
        name: "showDownloadingSpinner",
        attribute: "show-downloading-spinner",
        type: " boolean",
        default: "true",
        description:
          "`true` to show the downloading spinner when lazy loading the sub items of\nthe control."
      },
      {
        name: "translations",
        attribute: false,
        type: " ActionListTranslations | undefined",
        default: "undefined",
        description: "Specifies the literals required for the control."
      }
    ],
    events: [
      {
        name: "captionChange",
        detailType: "ActionListCaptionChangeEventDetail",
        description: "Fired when the fixed value of the control is changed."
      },
      {
        name: "fixedChange",
        detailType: "ActionListFixedChangeEventDetail",
        description: "Fired when the control is asking to modify its caption"
      },
      {
        name: "remove",
        detailType: "string",
        description: "Fired when the remove button was clicked in the control."
      },
      {
        name: "itemDragEnd",
        detailType: "void",
        description: "Fired when the item is no longer being dragged."
      }
    ],
    propertyImportTypes: {
      "./components/action-list/types.ts": [
        "ActionListItemAdditionalInformation",
        "ActionListItemAdditionalBase"
      ],
      "./typings/multi-state-images.ts": ["GxImageMultiState"],
      "./components/action-list/translations.ts": ["ActionListTranslations"]
    },
    eventImportTypes: {
      "./components/action-list/internal/action-list-item/types.ts": [
        "ActionListCaptionChangeEventDetail",
        "ActionListFixedChangeEventDetail"
      ]
    }
  },
  {
    access: "public",
    tagName: "ch-action-menu-render",
    className: "ChActionMenuRender",
    description:
      "The `ch-action-menu-render` component renders a dropdown menu triggered by an expandable button, supporting deeply nested sub-menus and full keyboard accessibility.",
    fullClassJSDoc:
      '/**\n * The `ch-action-menu-render` component renders a dropdown menu triggered by an expandable button, supporting deeply nested sub-menus and full keyboard accessibility.\n *\n * @remarks\n * ## Features\n *  - Deeply nested sub-menus with mouse hover expand/collapse.\n *  - Keyboard navigation (arrow keys, Escape, Enter).\n *  - Menu items can be buttons, hyperlinks, separators, or custom slots.\n *  - Positioned using `ch-popover`; auto-closes on outside click or Escape.\n *  - Internal expansion state management -- host only supplies data and reacts to events.\n *\n * ## Use when\n *  - You need a multi-level dropdown menu with full keyboard accessibility (e.g., application menus, context menus, toolbar overflow menus).\n *  - Space is constrained and 3 or more item-level actions must be accessible (e.g., Edit, Rename, Delete in a table row).\n *  - Contextual actions that are secondary and do not need to be always visible.\n *\n * ## Do not use when\n *  - You need a flat list of selectable items without nesting -- prefer `ch-action-list-render` instead.\n *  - Fewer than 3 actions are available — show them as visible inline icon buttons (fewer clicks, more discoverable).\n *  - Selection input is needed — never use `role="menu"` semantics for a value selector; prefer `ch-combo-box-render`.\n *  - Actions should always be immediately visible and prominent — put them inline.\n *\n * ## Accessibility\n *  - The expandable button has `aria-expanded`, `aria-haspopup="true"`, `aria-controls`, and a configurable `aria-label` (`buttonAccessibleName`).\n *  - The popup window has `role="list"`.\n *  - Keyboard support: Enter/Space activates the focused item, ArrowUp/ArrowDown navigate within a menu level, ArrowRight opens a sub-menu, ArrowLeft closes it, and Escape closes the menu returning focus to the trigger button.\n *\n * @status experimental\n *\n * @part expandable-button - The top-level button that toggles the dropdown. Also receives the `expanded`, `collapsed`, and `disabled` state parts.\n * @part window - The popover container that holds the dropdown menu items.\n * @part action - The clickable row element for each menu item.\n * @part button - A `<button>`-type action row. Receives `expandable`, `expanded`, `collapsed`, and `disabled` state parts.\n * @part link - An `<a>`-type action row.\n * @part content - The content area inside each action row (caption + optional icon).\n * @part shortcut - The keyboard shortcut label rendered at the end of an action row.\n * @part separator - A horizontal divider rendered for items of `type: "separator"`.\n *\n * @part expandable - Present in the `button` part when the item has sub-items.\n * @part expanded - Present in the `button` part when the item\'s sub-menu is open.\n * @part collapsed - Present in the `button` part when the item\'s sub-menu is closed.\n * @part disabled - Present in the `button` part when the item is disabled.\n *\n * @slot - Default slot projected inside the expandable button. Use it to provide the button label or icon.\n * @slot {name} - Named slots matching each item of `type: "slot"` in the model. Use them to inject custom content at specific positions in the menu.\n */',
    srcPath: "./components/action-menu/action-menu-render.lit.ts",
    developmentStatus: "experimental",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "buttonAccessibleName",
        attribute: "button-accessible-name",
        type: " string | undefined",
        default: "undefined",
        description:
          "This attribute lets you specify the label for the first expandable button.\nImportant for accessibility. This property is practically required: without\nit the trigger button has no accessible name, making the menu unusable for\nscreen-reader users."
      },
      {
        name: "blockAlign",
        attribute: "block-align",
        type: " ChPopoverAlign",
        default: '"outside-end"',
        description:
          'Specifies the block alignment of the dropdown menu that is placed\nrelative to the expandable button. Valid values are `"inside-start"`,\n`"center"`, `"inside-end"`, `"outside-start"`, and `"outside-end"`.'
      },
      {
        name: "disabled",
        attribute: "disabled",
        type: " boolean",
        default: "false",
        description:
          "This attribute lets you specify if the element is disabled.\nIf disabled, it will not fire any user interaction related event\n(for example, click event)."
      },
      {
        name: "expanded",
        attribute: "expanded",
        type: " boolean",
        default: "false",
        description:
          "Controls the visibility of the dropdown menu. Set to `true` to open the\ndropdown and `false` to close it."
      },
      {
        name: "getImagePathCallback",
        attribute: false,
        type: " ActionMenuImagePathCallback | undefined",
        default: "undefined",
        description:
          "This property specifies a callback that is executed when the path for an\nstartImgSrc or endImgSrc (of an item) needs to be resolved."
      },
      {
        name: "inlineAlign",
        attribute: "inline-align",
        type: " ChPopoverAlign",
        default: '"center"',
        description:
          'Specifies the inline alignment of the dropdown section that is placed\nrelative to the expandable button. Valid values are `"inside-start"`,\n`"center"`, `"inside-end"`, `"outside-start"`, and `"outside-end"`.'
      },
      {
        name: "model",
        attribute: false,
        type: " ActionMenuModel | undefined",
        default: "undefined",
        description: "This property lets you define the model of the control."
      },
      {
        name: "positionTry",
        attribute: "position-try",
        type: ' "flip-block" | "flip-inline" | "none"',
        default: '"none"',
        description:
          "Specifies an alternative position to try when the popover overflows the\nwindow."
      }
    ],
    events: [
      {
        name: "buttonClick",
        detailType: "ActionMenuItemActionableModel",
        description:
          "Fired when a button is clicked.\nThis event can be prevented."
      },
      {
        name: "expandedChange",
        detailType: "boolean",
        description:
          "Fired when the visibility of the main dropdown is changed."
      },
      {
        name: "expandedItemChange",
        detailType: "ActionMenuExpandedChangeEvent",
        description: "Fired when the visibility of a dropdown item is changed."
      },
      {
        name: "hyperlinkClick",
        detailType: "ActionMenuHyperlinkClickEvent",
        description:
          "Fired when an hyperlink is clicked.\nThis event can be prevented, but the dropdown will be closed in any case\n(prevented or not)."
      }
    ],
    parts: [
      {
        name: "expandable-button",
        description:
          "The top-level button that toggles the dropdown. Also receives the `expanded`, `collapsed`, and `disabled` state parts."
      },
      {
        name: "window",
        description: "The popover container that holds the dropdown menu items."
      },
      {
        name: "action",
        description: "The clickable row element for each menu item."
      },
      {
        name: "button",
        description:
          "A `<button>`-type action row. Receives `expandable`, `expanded`, `collapsed`, and `disabled` state parts."
      },
      {
        name: "link",
        description: "An `<a>`-type action row."
      },
      {
        name: "content",
        description:
          "The content area inside each action row (caption + optional icon)."
      },
      {
        name: "shortcut",
        description:
          "The keyboard shortcut label rendered at the end of an action row."
      },
      {
        name: "separator",
        description:
          'A horizontal divider rendered for items of `type: "separator"`.'
      },
      {
        name: "expandable",
        description: "Present in the `button` part when the item has sub-items."
      },
      {
        name: "expanded",
        description:
          "Present in the `button` part when the item's sub-menu is open."
      },
      {
        name: "collapsed",
        description:
          "Present in the `button` part when the item's sub-menu is closed."
      },
      {
        name: "disabled",
        description: "Present in the `button` part when the item is disabled."
      }
    ],
    slots: [
      {
        name: "- Default slot projected inside the expandable button. Use it to provide the button label or icon."
      },
      {
        name: "{name}",
        description:
          'Named slots matching each item of `type: "slot"` in the model. Use them to inject custom content at specific positions in the menu.'
      }
    ],
    propertyImportTypes: {
      "./components/popover/types.ts": ["ChPopoverAlign"],
      "./components/action-menu/types.ts": [
        "ActionMenuImagePathCallback",
        "ActionMenuModel"
      ]
    },
    eventImportTypes: {
      "./components/action-menu/types.ts": [
        "ActionMenuItemActionableModel",
        "ActionMenuExpandedChangeEvent",
        "ActionMenuHyperlinkClickEvent"
      ]
    }
  },
  {
    access: "public",
    tagName: "ch-action-menu",
    className: "ChActionMenu",
    description: "",
    fullClassJSDoc: "/**\n * @status experimental\n */",
    srcPath: "./components/action-menu/internal/action-menu/action-menu.lit.ts",
    developmentStatus: "experimental",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "actionGroupParent",
        attribute: "action-group-parent",
        type: " boolean",
        default: "false",
        description:
          "Specifies if the current parent of the item is the action-group control."
      },
      {
        name: "blockAlign",
        attribute: false,
        type: " ChPopoverAlign",
        default: '"center"',
        description:
          "Specifies the block alignment of the dropdown menu that is placed\nrelative to the expandable button."
      },
      {
        name: "caption",
        attribute: false,
        type: " string | undefined",
        default: "undefined",
        description: "Specifies the caption that the control will display."
      },
      {
        name: "disabled",
        attribute: "disabled",
        type: " boolean",
        default: "false",
        description:
          "This attribute lets you specify if the element is disabled.\nIf disabled, it will not fire any user interaction related event\n(for example, click event)."
      },
      {
        name: "endImgSrc",
        attribute: false,
        type: " string | undefined",
        default: "undefined",
        description: "Specifies the src of the end image."
      },
      {
        name: "endImgType",
        attribute: false,
        type: ' Exclude<ImageRender, "img">',
        default: '"background"',
        description: "Specifies how the end image will be rendered."
      },
      {
        name: "expandable",
        attribute: "expandable",
        type: " boolean",
        default: "false",
        description:
          "Specifies whether the item contains a subtree. `true` if the item has a\nsubtree."
      },
      {
        name: "expanded",
        attribute: false,
        type: " boolean | undefined",
        default: "false",
        description: "`true` to display the dropdown menu."
      },
      {
        name: "inlineAlign",
        attribute: false,
        type: " ChPopoverAlign",
        default: '"center"',
        description:
          "Specifies the inline alignment of the dropdown menu that is placed\nrelative to the expandable button."
      },
      {
        name: "link",
        attribute: false,
        type: " ItemLink | undefined",
        default: "undefined",
        description:
          "Specifies the hyperlink properties of the item. If this property is\ndefined, the `ch-action-menu` will render an anchor tag with this\nproperties. Otherwise, it will render a button tag."
      },
      {
        name: "model",
        attribute: false,
        type: " ActionMenuItemActionableModel",
        default: "undefined",
        description:
          "Specifies the extended model of the control. This property is only needed\nto know the UI Model on each event"
      },
      {
        name: "openOnFocus",
        attribute: "open-on-focus",
        type: " boolean",
        default: "false",
        description:
          "Determine if the dropdown menu should be opened when the expandable\nbutton of the control is focused.\nTODO: Add implementation"
      },
      {
        name: "parts",
        attribute: false,
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies a set of parts to use in every DOM element of the control."
      },
      {
        name: "positionTry",
        attribute: false,
        type: ' "flip-block" | "flip-inline" | "none"',
        default: "undefined",
        description:
          "Specifies an alternative position to try when the popover overflows the\nwindow."
      },
      {
        name: "shortcut",
        attribute: false,
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies the shortcut caption that the control will display."
      },
      {
        name: "startImgSrc",
        attribute: false,
        type: " string | undefined",
        default: "undefined",
        description: "Specifies the src for the left img."
      },
      {
        name: "startImgType",
        attribute: false,
        type: ' Exclude<ImageRender, "img">',
        default: '"background"',
        description: "Specifies how the start image will be rendered."
      }
    ],
    propertyImportTypes: {
      "./components/popover/types.ts": ["ChPopoverAlign"],
      "./typings/multi-state-images.ts": ["ImageRender"],
      "./typings/hyperlinks.ts": ["ItemLink"],
      "./components/action-menu/types.ts": ["ActionMenuItemActionableModel"]
    }
  },
  {
    access: "public",
    tagName: "ch-beautiful-mermaid",
    className: "ChBeautifulMermaid",
    description: "",
    fullClassJSDoc: "/**\n * @status developer-preview\n */",
    srcPath: "./components/beautiful-mermaid/beautiful-mermaid.lit.ts",
    developmentStatus: "developer-preview",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "value",
        attribute: "value",
        type: " string | undefined",
        default: "undefined",
        description: "Specifies the Mermaid diagram definition to be rendered."
      }
    ]
  },
  {
    access: "public",
    tagName: "ch-breadcrumb-render",
    className: "ChBreadCrumbRender",
    description: "",
    fullClassJSDoc:
      "/**\n * @status experimental\n *\n * This component needs to be hydrated to properly work. If not hydrated, the\n * component visibility will be hidden.\n */",
    srcPath: "./components/breadcrumb/breadcrumb-render.lit.ts",
    developmentStatus: "to-be-defined",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "getImagePathCallback",
        attribute: "getimagepathcallback",
        type: "\n    | ((item: BreadCrumbItemModel) => GxImageMultiState | undefined)\n    | undefined",
        default: "undefined",
        description:
          "This property specifies a callback that is executed when the path for an\nstartImgSrc needs to be resolved."
      },
      {
        name: "selectedLink",
        attribute: "selectedlink",
        type: " {\n    id?: string;\n    link: ItemLink;\n  }",
        default: "{\n    link: { url: undefined }\n  }",
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
        name: "model",
        attribute: "model",
        type: " BreadCrumbModel | undefined",
        default: "undefined",
        description: "Specifies the items of the control."
      },
      {
        name: "separator",
        attribute: "separator",
        type: " string | undefined",
        default: '"/"'
      },
      {
        name: "accessibleName",
        attribute: "accessible-name",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies a short string, typically 1 to 3 words, that authors associate\nwith an element to provide users of assistive technologies with a label\nfor the element."
      }
    ],
    events: [
      {
        name: "buttonClick",
        detailType: "BreadCrumbItemModel",
        description:
          "Fired when an button is clicked.\nThis event can be prevented."
      },
      {
        name: "hyperlinkClick",
        detailType: "BreadCrumbHyperlinkClickEvent",
        description:
          "Fired when an hyperlink is clicked.\nThis event can be prevented."
      }
    ],
    propertyImportTypes: {
      "./components/breadcrumb/types.ts": [
        "BreadCrumbItemModel",
        "BreadCrumbModel"
      ],
      "./typings/multi-state-images.ts": ["GxImageMultiState"],
      "./typings/hyperlinks.ts": ["ItemLink"]
    },
    eventImportTypes: {
      "./components/breadcrumb/types.ts": [
        "BreadCrumbItemModel",
        "BreadCrumbHyperlinkClickEvent"
      ]
    }
  },
  {
    access: "public",
    tagName: "ch-breadcrumb-item",
    className: "ChBreadCrumbItem",
    description: "",
    fullClassJSDoc: "/**\n * @status experimental\n */",
    srcPath:
      "./components/breadcrumb/internal/breadcrumb-item/breadcrumb-item.lit.ts",
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
          "This attribute lets you specify if the element is disabled.\nIf disabled, it will not fire any user interaction related event\n(for example, click event)."
      },
      {
        name: "accessibleName",
        attribute: "accessible-name",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies a short string, typically 1 to 3 words, that authors associate\nwith an element to provide users of assistive technologies with a label\nfor the element."
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
        type: " BreadCrumbItemModel",
        default: "undefined",
        description: "Specifies the UI model of the control"
      },
      {
        name: "selected",
        attribute: "selected",
        type: " boolean",
        default: "false",
        description:
          "Specifies if the hyperlink is selected. Only applies when the `link`\nproperty is defined."
      },
      {
        name: "selectedLinkIndicator",
        attribute: "selectedlinkindicator",
        type: " boolean",
        default: "false",
        description:
          "Specifies if the selected item indicator is displayed when the item is\nselected. Only applies when the `link` property is defined."
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
      },
      {
        name: "getImagePathCallback",
        attribute: "getimagepathcallback",
        type: "\n    | ((imageSrc: BreadCrumbItemModel) => GxImageMultiState | undefined)\n    | undefined",
        default: "undefined",
        description:
          "This property specifies a callback that is executed when the path for an\nstartImgSrc needs to be resolved."
      }
    ],
    propertyImportTypes: {
      "./typings/hyperlinks.ts": ["ItemLink"],
      "./components/breadcrumb/types.ts": ["BreadCrumbItemModel"],
      "./typings/multi-state-images.ts": ["ImageRender", "GxImageMultiState"]
    }
  },
  {
    access: "public",
    tagName: "ch-chat",
    className: "ChChat",
    description:
      "The `ch-chat` component delivers a full-featured conversational interface with virtual scrolling for efficient rendering of large message histories.",
    fullClassJSDoc:
      '/**\n * The `ch-chat` component delivers a full-featured conversational interface with virtual scrolling for efficient rendering of large message histories.\n *\n * @remarks\n * ## Features\n *  - Text messaging with file uploads and markdown rendering.\n *  - Real-time voice conversations via LiveKit integration.\n *  - Virtual scrolling for large message histories with configurable buffer size.\n *  - Auto-scrolling behavior configurable as `"at-scroll-end"` or `"never"`.\n *  - Fully customizable send-container layout with four slot positions.\n *  - Programmatic message management: add, update, and send messages via public methods.\n *  - Custom rendering of chat items through flexible render callbacks.\n *  - Stop-response button for cancelling assistant response generation.\n *\n * ## Use when\n *  - Building AI-powered chat or assistant interfaces.\n *  - Implementing conversational UIs with file attachment and voice support.\n *  - Building AI-powered conversational interfaces where the interaction model is back-and-forth dialogue.\n *  - The system needs to ask clarifying questions or produce streaming responses.\n *\n * ## Do not use when\n *  - Displaying a simple message list without interactivity — use `ch-smart-grid` instead.\n *  - A standard form would be faster and more precise for collecting structured data (e.g., address forms).\n *  - Displaying a simple non-interactive message list — prefer `ch-smart-grid` directly.\n *\n * ## Accessibility\n *  - Integrates with `ch-virtual-scroller` to maintain DOM structure suitable for assistive technology during virtual scrolling.\n *  - The send button and stop-response button carry accessible labels via the `translations` property.\n *  - New messages should be announced to screen readers via `aria-live="polite"` on the messages container.\n *  - All action buttons (send, stop-response) must have descriptive labels via the `translations` property.\n *  - Color and alignment alone must not be the only way to distinguish user messages from AI messages.\n *\n * @status experimental\n *\n * @part messages-container - The scrollable container that holds the chat messages.\n * @part send-container - The bottom area containing the input and action buttons.\n * @part send-container-before - Region before the send input within the send container. Rendered when `sendContainerLayout.sendContainerBefore` is defined.\n * @part send-container-after - Region after the send input within the send container. Rendered when `sendContainerLayout.sendContainerAfter` is defined.\n * @part send-input-before - Region before the text input inside the edit control. Rendered when `sendContainerLayout.sendInputBefore` is defined.\n * @part send-input-after - Region after the text input inside the edit control. Rendered when `sendContainerLayout.sendInputAfter` is defined.\n * @part send-button - The button that sends the current message.\n * @part stop-response-button - The button that stops the assistant\'s response generation. Rendered when `waitingResponse` is `true` and a `stopResponse` callback is provided.\n *\n * @slot empty-chat - Displayed when all records are loaded but there are no messages.\n * @slot loading-chat - Displayed while the chat is in the initial loading state.\n * @slot additional-content - Projected between the messages area and the send container. Rendered when `showAdditionalContent` is `true` and the chat is not in initial or empty state.\n */',
    srcPath: "./components/chat/chat.lit.ts",
    developmentStatus: "experimental",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "autoScroll",
        attribute: "auto-scroll",
        type: ' "never" | "at-scroll-end"',
        default: '"at-scroll-end"',
        description:
          'Specifies how the scroll position will be adjusted when the chat messages\nare updated with the methods `addNewMessage`, `updateChatMessage` or\n`updateLastMessage`.\n  - "at-scroll-end": If the scroll is positioned at the end of the content,\n  the chat will maintain the scroll at the end while the content of the\n  messages is being updated.\n\n - "never": The scroll position won\'t be adjusted when the content of the\n  messages is being updated.'
      },
      {
        name: "callbacks",
        attribute: false,
        type: " ChatCallbacks | undefined",
        default: "undefined",
        description: "Specifies the callbacks required in the control."
      },
      {
        name: "disabled",
        attribute: "disabled",
        type: " boolean",
        default: "false",
        description: "Specifies if all interactions are disabled"
      },
      {
        name: "items",
        attribute: false,
        type: " ChatMessage[]",
        default: "[]",
        description: "Specifies the items that the chat will display."
      },
      {
        name: "liveMode",
        attribute: "live-mode",
        type: " boolean",
        default: "false",
        description:
          "Specifies if the live mode is set.\n\nWhen this mode is enabled, the chat will disable sending messages by user\ninteractions and the only way to send messages will be throughout the\nvoice. The user will have to enable the microphone input in their Operative\nSystem and it will voice chat with the remote participants.\n\nWhen any participant speaks, the transcribed conversation will be displayed\nas new messages in the chat (`items` property).\n\nWhen the `liveMode` ends, the transcribed conversation will be pushed\nto the `items` of the chat."
      },
      {
        name: "liveModeConfiguration",
        attribute: false,
        type: " ChatLiveModeConfiguration | undefined",
        default: "undefined",
        description:
          "Specifies the live mode configuration. The `token` and `url` are required\nto enable the `liveMode`."
      },
      {
        name: "loadingState",
        attribute: false,
        type: " SmartGridDataState",
        default: '"initial"',
        description:
          "Specifies if the chat is waiting for the data to be loaded."
      },
      {
        name: "markdownTheme",
        attribute: "markdown-theme",
        type: " string | null",
        default: '"ch-markdown-viewer"',
        description:
          "Specifies the theme to be used for rendering the markdown.\nIf `null`, no theme will be applied."
      },
      {
        name: "newUserMessageAlignment",
        attribute: "new-user-message-alignment",
        type: ' "start" | "end"',
        default: '"end"',
        description:
          'Specifies how the messages added by the user interaction will be aligned\nin the chat.\n\nIf `newUserMessageAlignment === "start"` the chat will reserve the\nnecessary space to visualize the message at the start of the content\nviewport if the content is not large enough.\nThis behavior is the same as the Monaco editor does for reserving space\nwhen visualizing the last lines positioned at the top of the editor.'
      },
      {
        name: "newUserMessageScrollBehavior",
        attribute: "new-user-message-scroll-behavior",
        type: ' Exclude<ScrollBehavior, "auto">',
        default: '"instant"',
        description:
          "Specifies how the chat will scroll to the position of the messages added\nby user interaction."
      },
      {
        name: "renderItem",
        attribute: false,
        type: "\n    | ChatMessageRenderByItem\n    | ChatMessageRenderBySections\n    | undefined",
        default: "undefined",
        description:
          "This property allows us to implement custom rendering of chat items.\n\nThis works by providing a custom render of the cell content in two\npossible ways:\n  1. Replacing the render of the entire cell with a function of the\n  message model.\n\n  2. Replacing the render of specific parts of the message by providing an\n  object with the specific renders of the message sections (`codeBlock`,\n  `contentBefore`, `content`, `contentAfter`, `files` and/or\n  `messageStructure`)."
      },
      {
        name: "sendButtonDisabled",
        attribute: "send-button-disabled",
        type: " boolean",
        default: "false",
        description: "`true` to disable the send-button element."
      },
      {
        name: "sendInputDisabled",
        attribute: "send-input-disabled",
        type: " boolean",
        default: "false",
        description: "`true` to disable the send-input element."
      },
      {
        name: "showAdditionalContent",
        attribute: "show-additional-content",
        type: " boolean",
        default: "false",
        description:
          '`true` to render a slot named "additional-content" to project elements\nbetween the "content" slot (grid messages) and the "send-container" slot.\n\nThis slot can only be rendered if loadingState !== "initial" and\n(loadingState !== "all-records-loaded" && items.length > 0).'
      },
      {
        name: "sendContainerLayout",
        attribute: false,
        type: " ChatSendContainerLayout",
        default: '{\n    sendContainerAfter: ["send-button"]\n  }',
        description:
          "Specifies the position of the elements in the `send-container` part.\nThere are four positions for distributing elements:\n  - `sendContainerBefore`: Before the contents of the `send-container` part.\n  - `sendInputBefore`: Before the contents of the `send-input` part.\n  - `sendInputAfter`: After the contents of the `send-input` part.\n  - `sendContainerAfter`: After the contents of the `send-container` part.\n\nAt each position you can specify reserved elements, such as the\n`send-button` and `stop-response-button`, but can also be specified\nnon-reserved elements, which will be projected as content slots.\n\nIf the reserved `stop-response-button` element is not specified anywhere,\nthe send button will be replaced with the stop-response button\nwhen `waitingResponse = true` and the `stopResponse` callback is specified.\n\nIf the `send-button` is not specified in any position, it won't be\nrendered in the `ch-chat`."
      },
      {
        name: "theme",
        attribute: false,
        type: " ThemeModel | undefined",
        default: "undefined",
        description:
          "Specifies the theme to be used for rendering the chat.\nIf `undefined`, no theme will be applied."
      },
      {
        name: "translations",
        attribute: false,
        type: " ChatTranslations",
        default:
          '{\n    accessibleName: {\n      clearChat: "Clear chat",\n      copyMessageContent: "Copy message content",\n      downloadCodeButton: "Download code",\n      sendButton: "Send",\n      sendInput: "Message",\n      stopResponseButton: "Stop generating answer"\n    },\n    placeholder: {\n      sendInput: "Ask me a question..."\n    },\n    text: {\n      copyCodeButton: "Copy code",\n      copyMessageContent: "Copy",\n      processing: "Processing...",\n      sourceFiles: "Source files:"\n    }\n  }',
        description: "Specifies the literals required in the control."
      },
      {
        name: "virtualScrollerBufferSize",
        attribute: "virtual-scroller-buffer-size",
        type: " number",
        default: "5",
        description:
          "Specifies the number of elements to be rendered above and below the\nvirtual scroll."
      },
      {
        name: "waitingResponse",
        attribute: "waiting-response",
        type: " boolean",
        default: "false",
        description:
          "`true` if the `ch-chat` is waiting for a response from the server. If so,\nthe `sendChatMessages` won't be executed when the user tries to send a new\nmessage. Although, the `send-input` and `send-button` won't be disabled,\nso the user can interact with the chat."
      }
    ],
    events: [
      {
        name: "userMessageAdded",
        detailType: 'ChatMessageByRole<"user">',
        description:
          "Fired when a new user message is added in the chat via user interaction.\n\nSince developers can define their own render for file attachment, this\nevent serves to synchronize the cleanup of the `send-input` with the\ncleanup of the custom file attachment, or or even blocking user\ninteractions before the `sendChatMessages` callback is executed."
      }
    ],
    methods: [
      {
        name: "addNewMessage",
        paramTypes: [
          {
            name: "message",
            type: "ChatMessage"
          }
        ],
        returnType: "void",
        description:
          "Add a new message at the end of the record, performing a re-render."
      },
      {
        name: "focusChatInput",
        paramTypes: [],
        returnType: "void",
        description: "Focus the chat input"
      },
      {
        name: "setChatInputMessage",
        paramTypes: [
          {
            name: "text",
            type: "string"
          }
        ],
        returnType: "void",
        description: "Set the text for the chat input"
      },
      {
        name: "sendChatMessage",
        paramTypes: [
          {
            name: "content",
            type: "ChatMessageUser | undefined"
          },
          {
            name: "files",
            type: "File[]"
          }
        ],
        returnType: "void",
        description:
          "Send the current message of the ch-chat's `send-input` element. This\nmethod executes the same callbacks and interoperates with the same\nfeatures as if the message were sent through user interaction. The only\nthings to keep in mind are the following:\n - If the `content` parameter is provided, it will be used in replacement\n   of the input content.\n\n - If the `files` parameter is provided, the `getChatMessageFiles`\n   callback won't be executed to get the current files of the chat.\n\nWhether or not the `content` parameter is provided, the content of the\n`send-input` element will be cleared."
      },
      {
        name: "updateChatMessage",
        paramTypes: [
          {
            name: "messageIndex",
            type: "number"
          },
          {
            name: "message",
            type: 'ChatMessageByRoleNoId<"system" | "assistant">'
          },
          {
            name: "mode",
            type: '"concat" | "replace"'
          }
        ],
        returnType: "void",
        description:
          "Given the id of the message, it updates the content of the indexed message."
      },
      {
        name: "updateLastMessage",
        paramTypes: [
          {
            name: "message",
            type: 'ChatMessageByRoleNoId<"system" | "assistant">'
          },
          {
            name: "mode",
            type: '"concat" | "replace"'
          }
        ],
        returnType: "void",
        description:
          "Update the content of the last message, performing a re-render."
      }
    ],
    parts: [
      {
        name: "messages-container",
        description: "The scrollable container that holds the chat messages."
      },
      {
        name: "send-container",
        description: "The bottom area containing the input and action buttons."
      },
      {
        name: "send-container-before",
        description:
          "Region before the send input within the send container. Rendered when `sendContainerLayout.sendContainerBefore` is defined."
      },
      {
        name: "send-container-after",
        description:
          "Region after the send input within the send container. Rendered when `sendContainerLayout.sendContainerAfter` is defined."
      },
      {
        name: "send-input-before",
        description:
          "Region before the text input inside the edit control. Rendered when `sendContainerLayout.sendInputBefore` is defined."
      },
      {
        name: "send-input-after",
        description:
          "Region after the text input inside the edit control. Rendered when `sendContainerLayout.sendInputAfter` is defined."
      },
      {
        name: "send-button",
        description: "The button that sends the current message."
      },
      {
        name: "stop-response-button",
        description:
          "The button that stops the assistant's response generation. Rendered when `waitingResponse` is `true` and a `stopResponse` callback is provided."
      }
    ],
    slots: [
      {
        name: "empty-chat",
        description:
          "Displayed when all records are loaded but there are no messages."
      },
      {
        name: "loading-chat",
        description: "Displayed while the chat is in the initial loading state."
      },
      {
        name: "additional-content",
        description:
          "Projected between the messages area and the send container. Rendered when `showAdditionalContent` is `true` and the chat is not in initial or empty state."
      }
    ],
    propertyImportTypes: {
      "./components/chat/types.js": [
        "ChatCallbacks",
        "ChatMessage",
        "ChatLiveModeConfiguration",
        "ChatMessageRenderByItem",
        "ChatMessageRenderBySections",
        "ChatSendContainerLayout"
      ],
      "./components/infinite-scroll/types.ts": ["SmartGridDataState"],
      "./components/theme/theme-types.ts": ["ThemeModel"],
      "./components/chat/translations.js": ["ChatTranslations"]
    },
    eventImportTypes: {
      "./components/chat/types.js": ["ChatMessageByRole"]
    },
    methodImportTypes: {
      "./components/chat/types.js": [
        "ChatMessage",
        "ChatMessageUser",
        "ChatMessageByRoleNoId"
      ]
    }
  },
  {
    access: "public",
    tagName: "ch-checkbox",
    className: "ChCheckbox",
    description: "",
    fullClassJSDoc:
      "/**\n * @status developer-preview\n *\n * @csspart container - The container that serves as a wrapper for the `input` and the `option` parts.\n * @csspart input - The input element that implements the interactions for the component.\n * @csspart label - The label that is rendered when the `caption` property is not empty.\n *\n * @csspart checked - Present in the `input`, `label` and `container` parts when the control is checked and not indeterminate (`checked === true` and `indeterminate !== true`).\n * @csspart disabled - Present in the `input`, `label` and `container` parts when the control is disabled (`disabled === true`).\n * @csspart indeterminate - Present in the `input`, `label` and `container` parts when the control is indeterminate (`indeterminate === true`).\n * @csspart unchecked - Present in the `input`, `label` and `container` parts when the control is unchecked and not indeterminate (`checked === false` and `indeterminate !== true`).\n\n * @cssprop [--ch-checkbox__container-size = min(1em, 20px)] - Specifies the size for the container of the `input` and `option` elements.\n *\n * @cssprop [--ch-checkbox__checked-image = url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><path d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z'/></svg>\")] - Specifies the image of the checkbox when is checked.\n *\n * @cssprop [--ch-checkbox__option-indeterminate-image = url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><rect width='8' height='8'/></svg>\")] - Specifies the image of the checkbox when is indeterminate.\n *\n * @cssprop [--ch-checkbox__option-image-size = 50%] - Specifies the image size of the `option` element.\n *\n * @cssprop [--ch-checkbox__image-size = #{$default-decorative-image-size}] - Specifies the box size that contains the start image of the control.\n * \n * @cssprop [--ch-checkbox__background-image-size = 100%] - Specifies the size of the start image of the control.\n */",
    srcPath: "./components/checkbox/checkbox.lit.ts",
    developmentStatus: "developer-preview",
    formAssociated: true,
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "accessibleName",
        attribute: "accessible-name",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies a short string, typically 1 to 3 words, that authors associate\nwith an element to provide users of assistive technologies with a label\nfor the element."
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
          "`true` if the `ch-switch` is checked.\n\nIf checked:\n  - The `value` property will be available in the parent `<form>` if the\n    `name` attribute is set.\n  - The `checkedCaption` will be used to display the current caption.\n\nIf not checked:\n  - The `value` property won't be available in the parent `<form>`, even\n    if the `name` attribute is set.\n  - The `unCheckedCaption` will be used to display the current caption."
      },
      {
        name: "disabled",
        attribute: "disabled",
        type: " boolean",
        default: "false",
        description:
          "This attribute lets you specify if the element is disabled.\nIf disabled, it will not fire any user interaction related event\n(for example, click event).",
        reflect: true
      },
      {
        name: "getImagePathCallback",
        attribute: false,
        type: " GetImagePathCallback | undefined",
        default: "undefined",
        description:
          "This property specifies a callback that is executed when the path for an\nstartImgSrc needs to be resolved."
      },
      {
        name: "indeterminate",
        attribute: "indeterminate",
        type: " boolean",
        default: "false",
        description:
          "`true` if the control's value is indeterminate.\n\nThis property is purely a visual change. It has no impact on whether the\ncheckbox's is used in a form submission. That is decided by the\n`checked` property, regardless of the `indeterminate` state."
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
          "This attribute indicates that the user cannot modify the value of the control.\nSame as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly)\nattribute for `input` elements."
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
        type: ' Exclude<ImageRender, "img">',
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
          "The `input` event is emitted when a change to the element's checked state\nis committed by the user.\n\nIt contains the new checked state of the control."
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
      "A control to highlight code blocks.\n- It supports code highlight by parsing the incoming code string to [hast](https://github.com/syntax-tree/hast) using [Shiki](https://shiki.matsu.io). After that, it implements a reactivity layer by implementing its own render for the hast.\n\n- It also supports all programming languages from [Shiki.js](https://shiki.matsu.io).\n\n- When the code highlighting is needed at runtime, the control will load on demand the code parser and the programming language needed to parse the code.",
    fullClassJSDoc:
      "/**\n * A control to highlight code blocks.\n * - It supports code highlight by parsing the incoming code string to [hast](https://github.com/syntax-tree/hast) using [Shiki](https://shiki.matsu.io). After that, it implements a reactivity layer by implementing its own render for the hast.\n *\n * - It also supports all programming languages from [Shiki.js](https://shiki.matsu.io).\n *\n * - When the code highlighting is needed at runtime, the control will load on demand the code parser and the programming language needed to parse the code.\n */",
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
          "Specifies if an indicator is displayed in the last element rendered.\nUseful for streaming scenarios where a loading indicator is needed."
      },
      {
        name: "theme",
        attribute: "theme",
        type: " string",
        default: "DEFAULT_CODE_THEME",
        description:
          'Specifies the Shiki theme to use for syntax highlighting.\nSupports all bundled Shiki themes (e.g., `"github-dark"`, `"nord"`,\n`"dracula"`) plus `"chameleon-theme-dark"` and `"chameleon-theme-light"`.',
        reflect: true
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
    tagName: "ch-combo-box-render",
    className: "ChComboBoxRender",
    description:
      "The `ch-combo-box-render` component is a feature-rich combo box that combines an input field with a popover-based dropdown list for selecting values.",
    fullClassJSDoc:
      '/**\n * The `ch-combo-box-render` component is a feature-rich combo box that combines an input field with a popover-based dropdown list for selecting values.\n *\n * @remarks\n * ## Features\n *  - Flat lists and expandable item groups.\n *  - Suggest (autocomplete) mode with strict matching, debounced input, and server-side filtering.\n *  - Full keyboard navigation: Arrow keys, Home, End, Enter, Tab, and type-ahead search.\n *  - Multiple selection support.\n *  - Item images with multi-state support.\n *  - Automatic min-width sizing based on the largest option.\n *  - Lazy rendering of items only when the popup is displayed.\n *  - Native `select` fallback on mobile devices.\n *\n * ## Use when\n *  - A dropdown selection from a list of options is needed.\n *  - A searchable or autocomplete input is required.\n *  - Options should be organized into groups.\n *  - The list has more than 7 options and space is constrained.\n *  - A searchable or filterable input improves discoverability of items.\n *  - Options are organized into named groups.\n *\n * ## Do not use when\n *  - A simple binary choice is needed — prefer `ch-checkbox` or `ch-switch` instead.\n *  - All options should be visible at once — prefer `ch-radio-group-render` instead.\n *  - There are 2–3 options — prefer `ch-radio-group-render` (always visible, no extra click required).\n *  - The selection has immediate side effects — clearly communicate what will happen on change.\n *  - Navigation links are needed — never use a combo box to navigate between pages.\n *\n * ## Accessibility\n *  - Form-associated via `ElementInternals` — participates in native form validation and submission.\n *  - Delegates focus into the shadow DOM (`delegatesFocus: true`).\n *  - Implements the WAI-ARIA `combobox` pattern: the input has `role="combobox"` with `aria-expanded`, `aria-controls`, and `aria-haspopup` attributes.\n *  - The popup list has `role="listbox"`.\n *  - Keyboard navigation:\n *    - **Arrow Up / Arrow Down**: Navigate through items in the dropdown. If the dropdown is closed, opens it.\n *    - **Home / End**: Jump to the first or last item (non-suggest mode).\n *    - **Enter / NumpadEnter**: Toggle the dropdown open/closed; in suggest mode, confirms the current selection.\n *    - **Space**: Opens the dropdown (non-suggest mode only).\n *    - **Tab**: Closes the dropdown and confirms the selection.\n *    - **Type-ahead**: In non-suggest mode, typing characters while the dropdown is open performs incremental search to jump to matching items.\n *  - Resolves its accessible name from an external `<label>` element or the `accessibleName` property.\n *  - On mobile devices, falls back to a native `<select>` element for optimal touch interaction and OS-level accessibility.\n *\n * @status experimental\n *\n * @part window - The popover element that contains the dropdown list of items.\n * @part expandable - Applied to group headers that can be expanded or collapsed.\n * @part group - Applied to each item group container.\n * @part group__header - The header element of an item group.\n * @part group__header-caption - The caption text inside a group header.\n * @part group__content - The container that wraps the child items of a group.\n * @part item - Applied to each selectable leaf item in the list.\n * @part section - Applied to section containers in the dropdown.\n * @part disabled - State part applied to disabled items, groups, group headers, and expandable headers.\n * @part expanded - State part applied to expanded group headers and expandable buttons.\n * @part collapsed - State part applied to collapsed group headers and expandable buttons.\n * @part nested - State part applied to items that are nested inside a group.\n * @part selected - State part applied to the currently selected item.\n * @part ch-combo-box-render--placeholder - Present on the host when no item is selected and the placeholder text is displayed.\n */',
    srcPath: "./components/combo-box/combo-box.lit.ts",
    developmentStatus: "experimental",
    formAssociated: true,
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "accessibleName",
        attribute: "accessible-name",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies a short string, typically 1 to 3 words, that authors associate\nwith an element to provide users of assistive technologies with a label\nfor the element."
      },
      {
        name: "disabled",
        attribute: "disabled",
        type: " boolean",
        default: "false",
        description:
          "This attribute lets you specify if the element is disabled.\nIf disabled, it will not fire any user interaction related event\n(for example, click event)."
      },
      {
        name: "getImagePathCallback",
        attribute: false,
        type: " ComboBoxImagePathCallback | undefined",
        default: "undefined",
        description:
          "This property specifies a callback that is executed when the path for an\nimgSrc needs to be resolved."
      },
      {
        name: "hostParts",
        attribute: false,
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies a set of parts to use in the Host element (`ch-combo-box-render`)."
      },
      {
        name: "model",
        attribute: false,
        type: " ComboBoxModel",
        default: "[]",
        description:
          "Specifies the items of the control.\n\n`ComboBoxModel` is an array of `ComboBoxItemModel` entries. Each entry is\neither a `ComboBoxItemLeaf` (a selectable item) or a `ComboBoxItemGroup` (a group header containing nested items)."
      },
      {
        name: "multiple",
        attribute: "multiple",
        type: " boolean",
        default: "false",
        description:
          "This attribute indicates that multiple options can be selected in the list.\nIf it is not specified, then only one option can be selected at a time.\nWhen multiple is specified, the control will show a scrolling list box\ninstead of a single line dropdown.\n\n**Note:** Currently declared but not yet implemented. Setting this property\nhas no effect on the component behavior."
      },
      {
        name: "name",
        attribute: "name",
        type: " string | undefined",
        default: "undefined",
        description:
          "This property specifies the `name` of the control when used in a form.",
        reflect: true
      },
      {
        name: "placeholder",
        attribute: "placeholder",
        type: " string",
        default: "undefined",
        description:
          "A hint to the user of what can be entered in the control. Same as\n[placeholder](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-placeholder)\nattribute for `input` elements."
      },
      {
        name: "popoverInlineAlign",
        attribute: "popover-inline-align",
        type: " ChPopoverAlign",
        default: '"inside-start"',
        description: "Specifies the inline alignment of the popover."
      },
      {
        name: "readonly",
        attribute: "readonly",
        type: " boolean",
        default: "false",
        description:
          "This attribute indicates that the user cannot modify the value of the control.\nSame as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly)\nattribute for `input` elements."
      },
      {
        name: "resizable",
        attribute: "resizable",
        type: " boolean",
        default: "false",
        description:
          "Specifies whether the control can be resized. If `true` the control can be\nresized at runtime by dragging the edges or corners."
      },
      {
        name: "suggest",
        attribute: "suggest",
        type: " boolean",
        default: "false",
        description:
          "This property lets you specify if the control behaves like a suggest.\nIf `true` the combo-box value will be editable and displayed items will be\nfiltered according to the input's value.\n\nWhen enabled, the `suggestDebounce` property controls how long the control\nwaits before processing input changes, and the `suggestOptions` property\nconfigures filtering behavior (e.g., strict matching, case sensitivity,\nserver-side filtering)."
      },
      {
        name: "suggestDebounce",
        attribute: "suggest-debounce",
        type: " number",
        default: "250",
        description:
          "This property lets you determine the debounce time (in ms) that the\ncontrol waits until it processes the changes to the filter property.\nConsecutive changes to the `value` property between this range, reset the\ntimeout to process the value.\nOnly works if `suggest === true`."
      },
      {
        name: "suggestOptions",
        attribute: false,
        type: " ComboBoxSuggestOptions",
        default: "{}",
        description:
          "This property lets you determine the options that will be applied to the\nsuggest. Available options (`ComboBoxSuggestOptions`):\n\n - `alreadyProcessed` (boolean) — `true` if the model is already filtered\n   server-side and the control should skip client-side filtering.\n - `autoExpand` (boolean) — expand matching groups when filtering. *(Not yet implemented.)*\n - `hideMatchesAndShowNonMatches` (boolean) — invert the filter: hide\n   matches and show non-matches.\n - `highlightMatchedItems` (boolean) — highlight matched text in items.\n   *(Not yet implemented.)*\n - `matchCase` (boolean) — make the filter case-sensitive (ignored when\n   `regularExpression` is `true`).\n - `regularExpression` (boolean) — treat the filter value as a regular expression.\n - `renderActiveItemIconOnExpand` (boolean) — keep the selected item icon\n   visible in the input while the dropdown is expanded in suggest mode.\n - `strict` (boolean) — when the popover closes, revert to the last\n   confirmed value if the input does not match any item."
      },
      {
        name: "value",
        attribute: "value",
        type: " string | undefined",
        default: "undefined",
        description: "Specifies the value (selected item) of the control."
      }
    ],
    events: [
      {
        name: "input",
        detailType: "string",
        description:
          "The `input` event is emitted when a change to the element's value is\ncommitted by the user.\n\nWhen `suggest === true`, this event is debounced by the `suggestDebounce`\nvalue (default 250 ms). When `suggest === false`, debouncing does not\napply and the event is emitted immediately on value change."
      },
      {
        name: "change",
        detailType: "string",
        description:
          "The `change` event is emitted when a change to the element's value is\ncommitted by the user.\n - In normal mode (suggest = false), it is emitted after each input event.\n\n - In suggest mode (suggest = true), it is emitted after the popover is closed\nand a new value is committed by the user.\n\nThis event is NOT debounced by the `suggestDebounce` value."
      }
    ],
    parts: [
      {
        name: "window",
        description:
          "The popover element that contains the dropdown list of items."
      },
      {
        name: "expandable",
        description:
          "Applied to group headers that can be expanded or collapsed."
      },
      {
        name: "group",
        description: "Applied to each item group container."
      },
      {
        name: "group__header",
        description: "The header element of an item group."
      },
      {
        name: "group__header-caption",
        description: "The caption text inside a group header."
      },
      {
        name: "group__content",
        description: "The container that wraps the child items of a group."
      },
      {
        name: "item",
        description: "Applied to each selectable leaf item in the list."
      },
      {
        name: "section",
        description: "Applied to section containers in the dropdown."
      },
      {
        name: "disabled",
        description:
          "State part applied to disabled items, groups, group headers, and expandable headers."
      },
      {
        name: "expanded",
        description:
          "State part applied to expanded group headers and expandable buttons."
      },
      {
        name: "collapsed",
        description:
          "State part applied to collapsed group headers and expandable buttons."
      },
      {
        name: "nested",
        description:
          "State part applied to items that are nested inside a group."
      },
      {
        name: "selected",
        description: "State part applied to the currently selected item."
      },
      {
        name: "ch-combo-box-render--placeholder",
        description:
          "Present on the host when no item is selected and the placeholder text is displayed."
      }
    ],
    propertyImportTypes: {
      "./components/combo-box/types.ts": [
        "ComboBoxImagePathCallback",
        "ComboBoxModel",
        "ComboBoxSuggestOptions"
      ],
      "./components/popover/types.ts": ["ChPopoverAlign"]
    }
  },
  {
    access: "public",
    tagName: "ch-edit",
    className: "ChEdit",
    description:
      'A wrapper for the input and textarea elements. It additionally provides:\n - A placeholder for `"date"`, `"datetime-local"` and `"time"` types.\n - An action button.\n - Useful style resets.\n - Support for picture formatting.\n - Support to auto grow the control when used with multiline (useful to\n   model chat inputs).\n - An image which can have multiple states.\n - Support for debouncing the input event.',
    fullClassJSDoc:
      '/**\n * A wrapper for the input and textarea elements. It additionally provides:\n *  - A placeholder for `"date"`, `"datetime-local"` and `"time"` types.\n *  - An action button.\n *  - Useful style resets.\n *  - Support for picture formatting.\n *  - Support to auto grow the control when used with multiline (useful to\n *    model chat inputs).\n *  - An image which can have multiple states.\n *  - Support for debouncing the input event.\n *\n * @part date-placeholder - A placeholder displayed when the control is editable (`readonly="false"`), has no value set, and its type is `"datetime-local" | "date" | "time"`.\n *\n * @slot additional-content-before - The slot used for the additional content when `showAdditionalContentBefore === true`.\n * @slot additional-content-after - The slot used for the additional content when `showAdditionalContentAfter === true`.\n */',
    srcPath: "./components/edit/edit.lit.ts",
    developmentStatus: "to-be-defined",
    formAssociated: true,
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "accessibleName",
        attribute: "accessible-name",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies a short string, typically 1 to 3 words, that authors associate\nwith an element to provide users of assistive technologies with a label\nfor the element."
      },
      {
        name: "autocapitalize",
        attribute: "autocapitalize",
        type: " string",
        default: '""',
        description:
          "Specifies the auto-capitalization behavior. Same as [autocapitalize](https://developer.apple.com/library/content/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/Attributes.html#//apple_ref/doc/uid/TP40008058-autocapitalize)\nattribute for `input` elements. Only supported by Safari and Chrome."
      },
      {
        name: "autocomplete",
        attribute: "autocomplete",
        type: '\n    | "on"\n    | "off"\n    | "current-password"\n    | "new-password"',
        default: '"off"',
        description:
          "This attribute indicates whether the value of the control can be\nautomatically completed by the browser. Same as [autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-autocomplete)\nattribute for `input` elements."
      },
      {
        name: "autoFocus",
        attribute: "auto-focus",
        type: " boolean",
        default: "false",
        description:
          "Specifies if the control automatically get focus when the page loads."
      },
      {
        name: "autoGrow",
        attribute: "auto-grow",
        type: " boolean",
        default: "false",
        description:
          "This property defines if the control size will grow automatically, to\nadjust to its content size."
      },
      {
        name: "debounce",
        attribute: "debounce",
        type: " number",
        default: "0",
        description: "Specifies a debounce for the input event."
      },
      {
        name: "disabled",
        attribute: "disabled",
        type: " boolean",
        default: "false",
        description:
          "This attribute lets you specify if the element is disabled.\nIf disabled, it will not fire any user interaction related event\n(for example, click event).",
        reflect: true
      },
      {
        name: "getImagePathCallback",
        attribute: false,
        type: "\n    | ((imageSrc: string) => GxImageMultiState | undefined)\n    | undefined",
        default: "undefined",
        description:
          "This property specifies a callback that is executed when the path for an\nstartImgSrc needs to be resolved."
      },
      {
        name: "hostParts",
        attribute: "host-parts",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies a set of parts to use in the Host element (`ch-edit`)."
      },
      {
        name: "maxLength",
        attribute: "max-length",
        type: "\n    | number\n    | undefined",
        default: "undefined",
        description:
          "This property defines the maximum string length that the user can enter\ninto the control."
      },
      {
        name: "mode",
        attribute: "mode",
        type: " EditInputMode | undefined",
        default: "undefined",
        description:
          "This attribute hints at the type of data that might be entered by the user\nwhile editing the element or its contents. This allows a browser to\ndisplay an appropriate virtual keyboard. Only works when\n`multiline === false`."
      },
      {
        name: "multiline",
        attribute: "multiline",
        type: " boolean",
        default: "false",
        description: "Controls if the element accepts multiline text."
      },
      {
        name: "name",
        attribute: "name",
        type: " string | undefined",
        default: "undefined",
        description:
          "This property specifies the `name` of the control when used in a form.",
        reflect: true
      },
      {
        name: "pattern",
        attribute: "pattern",
        type: " string | undefined",
        default: "undefined",
        description:
          "This attribute specifies a regular expression the form control's value\nshould match. Only works when `multiline === false`."
      },
      {
        name: "picture",
        attribute: "picture",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies a picture to apply for the value of the control. Only works if\nnot `multiline`."
      },
      {
        name: "pictureCallback",
        attribute: false,
        type: "\n    | ((value: unknown, picture: string) => string)\n    | undefined",
        default: "undefined",
        description:
          "Specifies the callback to execute when the picture must computed for the\nnew value."
      },
      {
        name: "placeholder",
        attribute: "placeholder",
        type: " string | undefined",
        default: "undefined",
        description:
          "A hint to the user of what can be entered in the control. Same as [placeholder](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-placeholder)\nattribute for `input` elements."
      },
      {
        name: "preventEnterInInputEditorMode",
        attribute: "prevent-enter-in-input-editor-mode",
        type: " boolean",
        default: "false",
        description:
          "Specifies whether the ch-edit should prevent the default behavior of the\n`Enter` key when in input editor mode.\n\nIn other words, if `true`, pressing `Enter` will not submit the form or\ntrigger the default action of the `Enter` key in an input field when the\nuser-edit is in input editor mode."
      },
      {
        name: "readonly",
        attribute: "readonly",
        type: " boolean",
        default: "false",
        description:
          "This attribute indicates that the user cannot modify the value of the control.\nSame as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly)\nattribute for `input` elements."
      },
      {
        name: "showAdditionalContentAfter",
        attribute: "show-additional-content-after",
        type: " boolean",
        default: "false",
        description:
          'If `true`, a slot is rendered in the edit with `"additional-content-after"`\nname.\nThis slot is intended to customize the internal content of the edit by\nadding additional elements after the edit content.'
      },
      {
        name: "showAdditionalContentBefore",
        attribute: "show-additional-content-before",
        type: " boolean",
        default: "false",
        description:
          'If `true`, a slot is rendered in the edit with `"additional-content-before"`\nname.\nThis slot is intended to customize the internal content of the edit by\nadding additional elements before the edit content.'
      },
      {
        name: "showPassword",
        attribute: "show-password",
        type: "\n    boolean",
        default: "false",
        description:
          'Specifies if the password is displayed as plain text when using\n`type = "password"`.'
      },
      {
        name: "showPasswordButton",
        attribute: "show-password-button",
        type: " boolean",
        default: "false",
        description:
          'Specifies if the show password button is displayed when using\n`type = "password"`.'
      },
      {
        name: "spellcheck",
        attribute: "spellcheck",
        type: " boolean",
        default: "false",
        description:
          "Specifies whether the element may be checked for spelling errors."
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
        type: ' Exclude<\n    ImageRender,\n    "img"\n  >',
        default: '"background"',
        description: "Specifies the source of the start image."
      },
      {
        name: "translations",
        attribute: false,
        type: " EditTranslations",
        default:
          '{\n    accessibleName: {\n      clearSearchButton: "Clear search",\n      hidePasswordButton: "Hide password",\n      showPasswordButton: "Show password"\n    }\n  }',
        description: "Specifies the literals required in the control."
      },
      {
        name: "type",
        attribute: "type",
        type: " EditType",
        default: '"text"',
        description:
          'The type of control to render. A subset of the types supported by the `input` element is supported:\n\n* `"date"`\n* `"datetime-local"`\n* `"email"`\n* `"file"`\n* `"number"`\n* `"password"`\n* `"search"`\n* `"tel"`\n* `"text"`\n* `"url"`'
      },
      {
        name: "value",
        attribute: "value",
        type: " string | undefined",
        default: "undefined",
        description: "The initial value of the control."
      }
    ],
    events: [
      {
        name: "change",
        detailType: "Event",
        description:
          "The `change` event is emitted when a change to the element's value is\ncommitted by the user. Unlike the `input` event, the `change` event is not\nnecessarily fired for each change to an element's value but when the\ncontrol loses focus.\nThis event is _NOT_ debounced by the `debounce` property."
      },
      {
        name: "input",
        detailType: "string",
        description:
          "Fired synchronously when the value is changed.\nThis event is debounced by the `debounce` property."
      },
      {
        name: "passwordVisibilityChange",
        detailType: "boolean",
        description:
          'Fired when the visibility of the password (when using `type="password"`)\nis changed by clicking on the show password button.\n\nThe detail contains the new value of the `showPassword` property.'
      }
    ],
    parts: [
      {
        name: "date-placeholder",
        description:
          'A placeholder displayed when the control is editable (`readonly="false"`), has no value set, and its type is `"datetime-local" | "date" | "time"`.'
      }
    ],
    slots: [
      {
        name: "additional-content-before",
        description:
          "The slot used for the additional content when `showAdditionalContentBefore === true`."
      },
      {
        name: "additional-content-after",
        description:
          "The slot used for the additional content when `showAdditionalContentAfter === true`."
      }
    ],
    propertyImportTypes: {
      "./typings/multi-state-images.ts": ["GxImageMultiState", "ImageRender"],
      "./components/edit/types.ts": [
        "EditInputMode",
        "EditTranslations",
        "EditType"
      ]
    }
  },
  {
    access: "public",
    tagName: "ch-image",
    className: "ChImage",
    description:
      "A control to display multiple images, depending on the state (focus, hover,\nactive or disabled) of a parent element.",
    fullClassJSDoc:
      "/**\n * A control to display multiple images, depending on the state (focus, hover,\n * active or disabled) of a parent element.\n */",
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
          "Specifies a reference for the container, in order to update the state of\nthe icon. The reference must be an ancestor of the control.\nIf not specified, the direct parent reference will be used."
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
        type: " GetImagePathCallback | undefined",
        default: "undefined",
        description:
          "This property specifies a callback that is executed when the path the\nimage needs to be resolved."
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
          "Specifies an accessor for the attribute style of the ch-image. This\naccessor is useful for SSR scenarios were the Host access is limited\n(since Lit does not provide the Host declarative component).\n\nWithout this accessor, the initial load in SSR scenarios would flicker.",
        reflect: true
      },
      {
        name: "type",
        attribute: "type",
        type: ' Exclude<ImageRender, "img"> | undefined',
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
    tagName: "ch-infinite-scroll",
    className: "ChInfiniteScroll",
    description: "",
    fullClassJSDoc: "",
    srcPath: "./components/infinite-scroll/infinite-scroll.lit.ts",
    developmentStatus: "to-be-defined",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "autoScroll",
        attribute: "auto-scroll",
        type: '\n    | "never"\n    | "at-scroll-end"',
        default: '"at-scroll-end"',
        description:
          'Specifies how the scroll position will be adjusted when the content size\nchanges when using `position = "bottom"`.\n  - "at-scroll-end": If the scroll is positioned at the end of the content,\n  the infinite-scroll will maintain the scroll at the end while the\n  content size changes.\n\n - "never": The scroll position won\'t be adjusted when the content size\n  changes.'
      },
      {
        name: "dataProvider",
        attribute: "data-provider",
        type: "\n    | boolean",
        default: "false",
        description:
          "`true` if the infinite scroll is used in a grid that has data provider.\nThis attribute determine the utility of the infinite scroll, because in\ncertain configurations the infinite scroll can be used only to implement\nthe inverse loading utility."
      },
      {
        name: "disabled",
        attribute: "disabled",
        type: " boolean",
        default: "false",
        description:
          "Specifies if the infinite scroll is disabled. When disabled, the infinite\nscroll won't fire any event when reaching the threshold.\nThe `dataProvider` property can be `true` and this property can be `false`\nat the same time, meaning that the infinite scroll is disabled, but if the\ncontrol has `inverseLoading`, the `dataProvider` property will re-position\nthe scrollbar when new content is added to the grid."
      },
      {
        name: "infiniteThresholdReachedCallback",
        attribute: false,
        type: " () => void",
        default: "undefined",
        description:
          'This callback will be called every time the `threshold` is reached.\n\nWhen the threshold is met and this callback is executed, the internal\n`loadingState` will be changed to `"loading"` and the user has to keep in\nsync the `loadingState` of the component with the real state of the data.'
      },
      {
        name: "loadingState",
        attribute: "loading-state",
        type: " SmartGridDataState",
        default: "undefined",
        description:
          'If `"more-data-to-fetch"`, the infinite scroll will execute the\n`infiniteThresholdReachedCallback` when the `threshold` is met. When the\nthreshold is met, the internal `loadingState` will be changed to\n`"loading"` and the user has to keep in sync the `loadingState` of the\ncomponent with the real state of the data.\n\nSet this to `"all-records-loaded"` to disable the infinite scroll from\nactively trying to receive new data while reaching the threshold. This is\nuseful when it is known that there is no more data that can be added, and\nthe infinite scroll is no longer needed.'
      },
      {
        name: "position",
        attribute: "position",
        type: ' "top" | "bottom"',
        default: '"bottom"',
        description:
          'The position of the infinite scroll element.\nThe value can be either `top` or `bottom`. When `position === "top"`, the\ncontrol also implements inverse loading.'
      },
      {
        name: "threshold",
        attribute: "threshold",
        type: " string",
        default: '"150px"',
        description:
          "The threshold distance from the bottom of the content to call the\n`infinite` output event when scrolled.\nThe threshold value can be either a percent, or in pixels. For example,\nuse the value of `10%` for the `infinite` output event to get called when\nthe user has scrolled 10% from the bottom of the page. Use the value\n`100px` when the scroll is within 100 pixels from the bottom of the page."
      }
    ],
    propertyImportTypes: {
      "./components/infinite-scroll/types.ts": ["SmartGridDataState"]
    }
  },
  {
    access: "public",
    tagName: "ch-json-render",
    className: "ChJsonRender",
    description: "",
    fullClassJSDoc: "",
    srcPath: "./components/json-render/json-render.lit.ts",
    developmentStatus: "to-be-defined",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "spec",
        attribute: false,
        type: " Spec | null",
        default: "null",
        description: "The JSON spec describing the UI tree to render."
      },
      {
        name: "registry",
        attribute: false,
        type: " ComponentRegistry",
        default: "{}",
        description:
          "Registry mapping element type names to renderer functions."
      },
      {
        name: "store",
        attribute: false,
        type: " StateStore | undefined",
        default: "undefined",
        description:
          "External state store (controlled mode).\nWhen absent, an internal store seeded from `spec.state` is used."
      },
      {
        name: "functions",
        attribute: false,
        type: " Record<string, ComputedFunction>",
        default: "{}",
        description:
          "Named functions available for `$computed` prop expressions."
      },
      {
        name: "loading",
        attribute: "loading",
        type: "any",
        default: "false",
        description:
          "When true, each renderer receives `loading: true` (e.g. during streaming)."
      },
      {
        name: "fallback",
        attribute: false,
        type: " ComponentRenderer | undefined",
        default: "undefined",
        description:
          "Fallback renderer used when an element type is not in the registry.\nUseful for showing a skeleton while the registry is being built."
      },
      {
        name: "styleSheet",
        attribute: false,
        type: " string",
        default: '""',
        description:
          "Optional CSS string adopted into the component's shadow root.\nUse this to style elements rendered by the registry, which live inside\nthe shadow DOM and cannot be styled from outside."
      },
      {
        name: "onAction",
        attribute: false,
        type: "\n    | ((\n        name: string,\n        params?: Record<string, unknown>,\n        setState?: (path: string, value: unknown) => void,\n        getState?: () => StateModel\n      ) => void | Promise<void>)\n    | undefined",
        default: "undefined",
        description:
          "Handler for custom (non-built-in) actions.\nReceives the action name, resolved params, a setState helper, and a\ngetState snapshot function."
      }
    ],
    propertyImportTypes: {
      "@json-render/core": [
        "Spec",
        "StateStore",
        "ComputedFunction",
        "StateModel"
      ],
      "./components/json-render/types.js": [
        "ComponentRegistry",
        "ComponentRenderer"
      ]
    }
  },
  {
    access: "public",
    tagName: "ch-layout-splitter",
    className: "ChLayoutSplitter",
    description:
      "This component allows us to design a layout composed by columns and rows.\n - Columns and rows can have relative (`fr`) or absolute (`px`) size.\n - The line that separates two columns or two rows will always have a drag-bar to resize the layout.",
    fullClassJSDoc:
      "/**\n * This component allows us to design a layout composed by columns and rows.\n *  - Columns and rows can have relative (`fr`) or absolute (`px`) size.\n *  - The line that separates two columns or two rows will always have a drag-bar to resize the layout.\n *\n * @csspart bar - The bar that divides two columns or two rows\n */",
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
          "This attribute lets you specify the label for the drag bar.\nImportant for accessibility."
      },
      {
        name: "dragBarDisabled",
        attribute: "drag-bar-disabled",
        type: " boolean",
        default: "false",
        description:
          "This attribute lets you specify if the resize operation is disabled in all\ndrag bars. If `true`, the drag bars are disabled."
      },
      {
        name: "incrementWithKeyboard",
        attribute: "increment-with-keyboard",
        type: " number",
        default: "2",
        description:
          "Specifies the resizing increment (in pixel) that is applied when using the\nkeyboard to resize a drag bar."
      },
      {
        name: "model",
        attribute: false,
        type: " LayoutSplitterModel",
        default:
          '{\n    id: "root",\n    direction: "columns",\n    items: []\n  }',
        description:
          "Specifies the list of component that are displayed. Each component will be\nseparated via a drag bar."
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
          "Removes the item that is identified by the given ID.\nThe layout is rearranged depending on the state of the removed item."
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
    tagName: "ch-live-kit-room",
    className: "ChLiveKitRoom",
    description:
      "The `ch-live-kit-room` component integrates with the LiveKit real-time communication platform to establish audio room connections and manage remote participants.",
    fullClassJSDoc:
      "/**\n * The `ch-live-kit-room` component integrates with the LiveKit real-time communication platform to establish audio room connections and manage remote participants.\n *\n * @remarks\n * ## Features\n *  - Room lifecycle management: connect, disconnect, and track remote participants via the `livekit-client` SDK.\n *  - Automatic attachment of remote audio tracks to dynamically rendered `<audio>` elements in the shadow DOM.\n *  - Local microphone toggle support via the `microphoneEnabled` property.\n *  - Callbacks for transcription updates, active speaker changes, mute/unmute, and connection quality via the `callbacks` property.\n *  - Renders a default `<slot>` for projecting custom UI (e.g., transcription display, controls).\n *\n * ## Use when\n *  - Building voice-enabled conversational experiences with LiveKit.\n *  - Adding real-time audio communication to a `ch-chat` component.\n *\n * ## Do not use when\n *  - You need a full video conferencing UI — use a dedicated LiveKit UI framework instead.\n *  - Video tracks are required — this component only handles audio tracks.\n *\n * ## Accessibility\n *  - The rendered `<audio>` elements are hidden (`display: none`) and play automatically when remote tracks are attached. No keyboard interaction is required for audio playback.\n *  - The host uses `display: contents`, so it does not affect the layout of slotted content.\n *\n * @slot - Default slot. Projects custom content (e.g., control buttons, transcription UI) within the component's shadow root.\n *\n * @status experimental\n */",
    srcPath: "./components/live-kit-room/live-kit-room.lit.ts",
    developmentStatus: "experimental",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "callbacks",
        attribute: false,
        type: " LiveKitCallbacks | undefined",
        default: "undefined",
        description:
          "Specifies the callback handlers for room events. Includes:\n - `activeSpeakersChanged`: called when the list of active speakers changes.\n - `updateTranscriptions`: called when transcription segments are received.\n - `muteMic` / `unmuteMic`: called when the local microphone is muted/unmuted.\n - `connectionEvents`: sub-callbacks for track mute/unmute, speaking state, and connection quality changes.\n\nWhen `undefined`, no callbacks are invoked. This property is read during\n`connect()` — changing it after connection has no effect until the next\nreconnection."
      },
      {
        name: "connected",
        attribute: "connected",
        type: " boolean",
        default: "false",
        description:
          "Controls the connection state of the LiveKit room. Set to `true` to\nconnect using the current `url` and `token`; set to `false` to disconnect.\n\nWhen toggled to `true`, the component calls `connectToRoom()` and begins\ntracking remote participants. When toggled to `false`, the room is\ndisconnected and audio tracks are detached."
      },
      {
        name: "microphoneEnabled",
        attribute: "microphone-enabled",
        type: " boolean",
        default: "false",
        description:
          "Controls whether the local participant's microphone is enabled. When\n`true`, the local participant publishes audio; when `false`, the mic is\nmuted. This property is only effective while `connected` is `true`.\n\nToggling this property immediately enables or disables the local\nmicrophone track."
      },
      {
        name: "token",
        attribute: "token",
        type: " string",
        default: '""',
        description:
          "Specifies the LiveKit access token used to authenticate and connect to\nthe room. The token encodes the participant identity, room name, and\npermissions. Must be set before `connected` is toggled to `true`.\n\nChanging this value while connected does not trigger a reconnection —\ndisconnect and reconnect to use a new token."
      },
      {
        name: "url",
        attribute: "url",
        type: " string",
        default: '""',
        description:
          'Specifies the WebSocket URL of the LiveKit server (e.g.,\n`"wss://my-livekit-server.example.com"`). Must be set before `connected`\nis toggled to `true`.\n\nChanging this value while connected does not trigger a reconnection —\ndisconnect and reconnect to use a new URL.'
      }
    ],
    slots: [
      {
        name: "- Default slot. Projects custom content (e.g., control buttons, transcription UI) within the component's shadow root."
      }
    ],
    propertyImportTypes: {
      "./components/live-kit-room/types.js": ["LiveKitCallbacks"]
    }
  },
  {
    access: "public",
    tagName: "ch-markdown-viewer",
    className: "ChMarkdownViewer",
    description:
      "The `ch-markdown-viewer` component renders Markdown content as rich HTML with GFM support, code highlighting, math rendering, and streaming indicators.",
    fullClassJSDoc:
      "/**\n * The `ch-markdown-viewer` component renders Markdown content as rich HTML with GFM support, code highlighting, math rendering, and streaming indicators.\n *\n * @remarks\n * ## Features\n *  - Parses Markdown to [mdast](https://github.com/syntax-tree/mdast) using [micromark](https://github.com/micromark/micromark) via [mdast-util-from-markdown](https://github.com/syntax-tree/mdast-util-from-markdown), with a reactive render layer that only updates changed DOM portions.\n *  - GitHub Flavored Markdown (GFM) via [mdast-util-gfm](https://github.com/syntax-tree/mdast-util-gfm) and [micromark-extension-gfm](https://github.com/micromark/micromark-extension-gfm).\n *  - Code highlighting by parsing code blocks to [hast](https://github.com/syntax-tree/hast) using [lowlight](https://github.com/wooorm/lowlight), supporting all [highlight.js](https://github.com/highlightjs/highlight.js) languages.\n *  - On-demand loading of code parsers and language grammars at runtime.\n *  - Math rendering (built-in extension), raw HTML pass-through, and streaming indicator for real-time content.\n *  - Custom extensions for adding new syntax and rendering behavior.\n *  - Theming support via the `theme` property with optional flash-of-unstyled-content prevention.\n *\n * ## Use when\n *  - Displaying user-authored or AI-generated Markdown in a polished, interactive way.\n *  - Rendering Markdown content that includes headings, lists, code blocks, tables, and math expressions.\n *\n * ## Do not use when\n *  - Only plain text needs to be displayed -- prefer `ch-textblock` for better performance.\n *  - Full math rendering is needed and Markdown is not involved -- prefer `ch-math-viewer` directly.\n *\n * ## Accessibility\n *  - Renders semantic HTML elements (headings, lists, tables, code blocks) that are natively accessible to assistive technologies.\n *  - Code blocks are rendered via `ch-code`, which provides scrollable, labeled code regions.\n *  - Math expressions rendered via the math extension include MathML for screen reader compatibility.\n *\n * @status experimental\n */",
    srcPath: "./components/markdown-viewer/markdown-viewer.lit.ts",
    developmentStatus: "experimental",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "avoidFlashOfUnstyledContent",
        attribute: "avoid-flash-of-unstyled-content",
        type: " boolean",
        default: "false",
        description:
          "When `true`, visually hides the contents of the root node until the\ntheme stylesheet has loaded, preventing a flash of unstyled content.\nOnly takes effect when the `theme` property is set; otherwise this\nproperty has no visible effect."
      },
      {
        name: "extensions",
        attribute: false,
        type: " MarkdownViewerExtension<object>[] | undefined",
        default: "undefined",
        description:
          "Specifies an array of custom extensions to extend and customize the\nrendered markdown language.\nThere a 3 things needed to implement an extension:\n - A tokenizer (the heavy part of the extension).\n - A mapping between the custom token to the custom mdast nodes (pretty straightforward).\n - A render of the custom mdast nodes in Lit's `TemplateResult` (pretty straightforward).\n\nYou can see an [example here](./examples/index.ts), which turns syntax like\n`Some text [[ Value ]]` to:"
      },
      {
        name: "rawHtml",
        attribute: "raw-html",
        type: " boolean",
        default: "false",
        description:
          "When `true`, raw HTML blocks in the Markdown source are rendered as\nactual HTML elements (with sanitization). When `false`, HTML blocks\nare ignored and not rendered.\n\nNote: in the current version, `allowDangerousHtml` is always `true`\ninternally, so this flag controls whether HTML is passed through to\nthe rendered output."
      },
      {
        name: "renderCode",
        attribute: false,
        type: " MarkdownViewerCodeRender | undefined",
        default: "undefined",
        description:
          "Allows custom rendering of code blocks (fenced code).\nWhen `undefined`, the default code renderer (which uses `ch-code`) is\nused. Provide a custom function to render code blocks with a different\ncomponent or UI (e.g., adding copy buttons, line numbers, etc.)."
      },
      {
        name: "showIndicator",
        attribute: "show-indicator",
        type: " boolean",
        default: "false",
        description:
          "When `true`, a blinking cursor-like indicator is displayed after the\nlast rendered element. Useful for streaming scenarios where Markdown\ncontent is being generated in real time (e.g., AI chat responses).\n\nThe indicator's appearance is controlled by the CSS custom properties\n`--ch-markdown-viewer-indicator-color`, `--ch-markdown-viewer-inline-size`,\nand `--ch-markdown-viewer-block-size`."
      },
      {
        name: "theme",
        attribute: false,
        type: " ThemeModel | undefined",
        default: '"ch-markdown-viewer"',
        description:
          "Specifies the theme model name to be used for rendering the control.\nWhen set, a `ch-theme` element is rendered to load the theme stylesheet.\nIf `undefined`, no theme will be applied.\n\nWorks together with `avoidFlashOfUnstyledContent` to prevent unstyled\ncontent from being visible before the theme loads."
      },
      {
        name: "value",
        attribute: false,
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies the Markdown string to parse and render.\nWhen `undefined` or empty, the component renders nothing.\nIf parsing fails, the error is logged to the console and the\npreviously rendered content is preserved."
      }
    ],
    propertyImportTypes: {
      "./components/markdown-viewer/parsers/types.ts": [
        "MarkdownViewerExtension",
        "MarkdownViewerCodeRender"
      ],
      "./components/theme/theme-types.ts": ["ThemeModel"]
    }
  },
  {
    access: "public",
    tagName: "ch-math-viewer",
    className: "ChMathViewer",
    description:
      "The `ch-math-viewer` component renders LaTeX math expressions as accessible, high-quality typeset mathematics using [KaTeX](https://katex.org/).",
    fullClassJSDoc:
      '/**\n * The `ch-math-viewer` component renders LaTeX math expressions as accessible, high-quality typeset mathematics using [KaTeX](https://katex.org/).\n *\n * @remarks\n * ## Features\n *  - Accepts LaTeX blocks delimited by `$$`, `\\[...\\]`, `\\(...\\)`, or bare expressions.\n *  - Supports both block and inline display modes via the `displayMode` property (reflected as an HTML attribute for CSS targeting).\n *  - Multi-paragraph support: paragraphs separated by blank lines are rendered as individual math blocks.\n *  - Graceful error handling: on parse failure, renders raw source text in a `<span part="error">` with the error message exposed via `aria-description` and `title`.\n *  - Accessible output via `htmlAndMathml` rendering.\n *\n * ## Use when\n *  - Displaying mathematical formulas, equations, or scientific notation.\n *\n * ## Do not use when\n *  - Rendering general rich-text content that may include math. Prefer `ch-markdown-viewer` instead.\n *\n * ## Accessibility\n *  - KaTeX renders both HTML and MathML output, allowing assistive technology to read mathematical expressions natively.\n *  - Error spans carry `aria-description` and `title` attributes describing the parsing error, so screen readers can announce what went wrong.\n *\n * ## Configuration Required\n *\n * You must include the KaTeX custom fonts and declare their font-faces. In your main SCSS file, import the font-faces mixin and include it:\n *\n * ```scss\n * @import "@genexus/chameleon-controls-library/dist/assets/scss/math-viewer-font-face.scss";\n *\n * @include math-viewer-font-faces();\n * ```\n *\n * Additionally, ensure the font files from\n * `node_modules/@genexus/chameleon-controls-library/dist/assets/fonts` are copied to your project\'s assets directory. If using StencilJS, add this to your `stencil.config.ts`:\n *\n * ```ts\n * {\n *   type: "dist",\n *   copy: [\n *     {\n *       src: "../node_modules/@genexus/chameleon-controls-library/dist/assets/fonts",\n *       dest: "assets/fonts"\n *     }\n *   ]\n * }\n * ```\n *\n * @status experimental\n *\n * @part error - A `<span>` rendered in place of a math block when KaTeX fails to parse the expression. Contains the raw source text and exposes the error message via `aria-description` and `title`.\n */',
    srcPath: "./components/math-viewer/math-viewer.lit.ts",
    developmentStatus: "experimental",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "displayMode",
        attribute: "display-mode",
        type: '\n    | "block"\n    | "inline"',
        default: '"block"',
        description:
          'Specifies whether to render the math in block or inline mode.\n - `"block"`: Renders display-style math (centered, larger, with vertical\n   spacing). The host element uses `display: block`.\n - `"inline"`: Renders inline math that flows with surrounding text. The\n   host element uses `display: inline-block`.\n\nThis property is reflected as an HTML attribute, enabling CSS selectors\nlike `:host([display-mode="inline"])` for layout customization.\n\nIndividual math blocks in the `value` string may auto-detect as\nblock-style if they start with `\\\\[`, `$$`, `\\\\begin`, or contain\nalignment operators (`&=`, `^`), overriding this setting for that block.',
        reflect: true
      },
      {
        name: "value",
        attribute: "value",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies the LaTeX math string to render.\nMultiple math blocks can be separated by blank lines (double newlines);\neach block is rendered independently.\n\nDelimiters (`$$`, `\\[...\\]`, `\\(...\\)`, `$...$`) are automatically\nstripped before passing to KaTeX. When `undefined` or empty, the\ncomponent renders nothing."
      }
    ],
    parts: [
      {
        name: "error",
        description:
          "A `<span>` rendered in place of a math block when KaTeX fails to parse the expression. Contains the raw source text and exposes the error message via `aria-description` and `title`."
      }
    ]
  },
  {
    access: "public",
    tagName: "ch-navigation-list-item",
    className: "ChNavigationListItem",
    description: "",
    fullClassJSDoc: "/**\n * @status experimental\n */",
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
          "This attribute lets you specify if the element is disabled.\nIf disabled, it will not fire any user interaction related event\n(for example, click event)."
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
          "This property works the same as the exportparts attribute. It is defined\nas a property just to reflect the default value, which avoids FOUC when\nthe `ch-navigation-list-render` component is Server Side Rendered.\nOtherwise, setting this attribute on the client would provoke FOUC and/or\nvisual flickering.",
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
          "Specifies if the hyperlink is selected. Only applies when the `link`\nproperty is defined."
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
        type: ' Exclude<ImageRender, "img"> | undefined',
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
      "/**\n * @status experimental\n *\n * This component needs to be hydrated to properly work. If not hydrated, the\n * component visibility will be hidden.\n */",
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
          "If `false` the overflowing content of the control will be clipped to the\nborders of its container.",
        reflect: true
      },
      {
        name: "expandableButton",
        attribute: "expandable-button",
        type: ' "decorative" | "no"',
        default: '"decorative"',
        description:
          'Specifies what kind of expandable button is displayed in the items by\ndefault.\n - `"decorative"`: Only a decorative icon is rendered to display the state\n    of the item.'
      },
      {
        name: "expandableButtonPosition",
        attribute: "expandable-button-position",
        type: ' "start" | "end"',
        default: '"start"',
        description:
          'Specifies the position of the expandable button in reference of the action\nelement of the items\n - `"start"`: Expandable button is placed before the action element.\n - `"end"`: Expandable button is placed after the action element.'
      },
      {
        name: "getImagePathCallback",
        attribute: "getimagepathcallback",
        type: "\n    | ((item: NavigationListItemModel) => GxImageMultiState | undefined)\n    | undefined",
        default: "undefined",
        description:
          "This property specifies a callback that is executed when the path for an\nstartImgSrc needs to be resolved."
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
          "`true` to expand the path to the selected link when the `selectedLink`\nproperty is updated."
      },
      {
        name: "model",
        attribute: "model",
        type: " NavigationListModel | undefined",
        default: "undefined",
        description: "Specifies the items of the control."
      },
      {
        name: "renderItem",
        attribute: "renderitem",
        type: "\n    | ((\n        item: NavigationListItemModel,\n        navigationListSharedState: NavigationListSharedState,\n        level: number\n      ) => TemplateResult)\n    | undefined",
        default: "undefined",
        description: "Specifies the items of the control."
      },
      {
        name: "selectedLink",
        attribute: "selectedlink",
        type: " {\n    id?: string;\n    link: ItemLink;\n  }",
        default: "{\n    link: { url: undefined }\n  }",
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
        type: '\n    | "inline"\n    | "tooltip"',
        default: '"inline"',
        description:
          "Specifies how the caption of the items will be displayed when the control\nis collapsed"
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
          "Fired when an button is clicked.\nThis event can be prevented."
      },
      {
        name: "hyperlinkClick",
        detailType: "NavigationListHyperlinkClickEvent",
        description:
          "Fired when an hyperlink is clicked.\nThis event can be prevented."
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
    tagName: "ch-component-render",
    className: "ChComponentRender",
    description: "",
    fullClassJSDoc: "/**\n * @fires modelUpdate\n */",
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
        type: "\n    | PlaygroundJsonRenderModel\n    | undefined",
        default: "undefined",
        description:
          "Explicit model for the playground. Takes priority over `componentName`."
      },
      {
        name: "componentName",
        attribute: "componentname",
        type: " string | undefined",
        default: "undefined",
        description:
          'Chameleon component tag name (e.g. "ch-checkbox"). Used to look up the\nmodel from `playgroundEditorModels` when `componentModel` is not set.'
      }
    ],
    propertyImportTypes: {
      "./components/playground-editor/typings/playground-json-render-model.ts":
        ["PlaygroundJsonRenderModel"]
    }
  },
  {
    access: "public",
    tagName: "ch-popover",
    className: "ChPopover",
    description:
      "The `ch-popover` component renders a positioned overlay container anchored to a reference element using the native Popover API and `position: fixed`.",
    fullClassJSDoc:
      '/**\n * The `ch-popover` component renders a positioned overlay container anchored to a reference element using the native Popover API and `position: fixed`.\n *\n * @remarks\n * ## Features\n *  - Configurable block and inline alignment (inside/outside/center) relative to the action element.\n *  - Optional flip-block or flip-inline fallback when the popover would overflow the viewport.\n *  - Automatic size-matching to the action element.\n *  - Dragging from a dedicated header or the entire box.\n *  - Edge and corner resizing.\n *  - Responsive re-alignment on scroll and resize.\n *  - Full RTL layout support.\n *  - Closes on outside click or Escape.\n *\n * ## Use when\n *  - You need precise, anchor-relative positioning for dropdowns, floating panels, or custom overlays.\n *  - Contextual content that requires more space than a tooltip but less formality than a modal.\n *  - The content includes interactive elements (links, buttons, form inputs, pickers).\n *  - Feature spotlights, overflow menus, or positioned pickers near a trigger.\n *\n * ## Do not use when\n *  - You need simple tooltip-style overlays with hover/focus triggers -- prefer `ch-tooltip` instead.\n *  - You need modal or non-modal dialog boxes -- prefer `ch-dialog` instead.\n *  - Critical content requiring user confirmation — prefer `ch-dialog`.\n *  - Brief, non-interactive supplementary text — prefer `ch-tooltip`.\n *  - Nested inside another popover — always an anti-pattern.\n *\n * ## Accessibility\n *  - Does not impose a semantic role — consuming components are responsible for adding appropriate ARIA attributes (e.g. `role="dialog"`, `role="listbox"`).\n *  - Keyboard: Escape closes the popover and returns focus to the action element.\n *\n * @status experimental\n *\n * @part header - A draggable header area rendered when `allowDrag === "header"`. Projects the "header" slot.\n *\n * @slot header - Content projected into the header area. Rendered when `allowDrag === "header"`.\n * @slot - Default slot. The main content of the popover.\n */',
    srcPath: "./components/popover/popover.lit.ts",
    developmentStatus: "experimental",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "actionById",
        attribute: "actionbyid",
        type: " boolean",
        default: "false",
        description:
          "`true` if the `actionElement` binds the ch-popover using an external ID.\nIf so, the `popoverTargetElement` property won't be configured in the\naction element."
      },
      {
        name: "actionElement",
        attribute: "actionelement",
        type: " PopoverActionElement",
        default: "undefined",
        description:
          "Specifies a reference of the action that controls the popover control."
      },
      {
        name: "allowDrag",
        attribute: "allow-drag",
        type: ' "box" | "header" | "no"',
        default: '"no"',
        description:
          'Specifies the drag behavior of the popover.\nIf `allowDrag === "header"`, a slot with the `"header"` name will be\navailable to place the header content.'
      },
      {
        name: "blockAlign",
        attribute: "block-align",
        type: " ChPopoverAlign",
        default: '"center"',
        description:
          'Specifies the block alignment of the popover relative to its action\nelement. Valid values: `"outside-start"`, `"inside-start"`, `"center"`,\n`"inside-end"`, `"outside-end"`.'
      },
      {
        name: "blockSizeMatch",
        attribute: "block-size-match",
        type: " ChPopoverSizeMatch",
        default: '"content"',
        description:
          'Specifies how the popover adapts its block size.\n - "content": The block size of the control will be determined by its\n   content block size.\n - "action-element": The block size of the control will match the block\n   size of the `actionElement`.\n - "action-element-as-minimum": The minimum block size of the control\n   will match the block size of the `actionElement`.\n\nIf the control is resized at runtime, only the "action-element-as-minimum"\nvalue will still work.'
      },
      {
        name: "closeOnClickOutside",
        attribute: "close-on-click-outside",
        type: " boolean",
        default: "false",
        description:
          'This property only applies for `"manual"` mode. In native popovers, when\nusing `"manual"` mode the popover doesn\'t close when clicking outside the\ncontrol. This property allows to close the popover when clicking outside\nin `"manual"` mode.\nWith this, the popover will close if the click is triggered on any other\nelement than the popover and the `actionElement`. It will also close if\nthe "Escape" key is pressed.'
      },
      {
        name: "firstLayer",
        attribute: "first-layer",
        type: " boolean",
        default: "true",
        description:
          "`true` if the popover is not stacked inside another top layer (e.g., not\nnested within another popover). When `true`, a CSS class is temporarily\napplied to prevent initial positioning flickering while the popover\ncalculates its alignment."
      },
      {
        name: "inlineAlign",
        attribute: "inline-align",
        type: " ChPopoverAlign",
        default: '"center"',
        description:
          'Specifies the inline alignment of the popover relative to its action\nelement. Valid values: `"outside-start"`, `"inside-start"`, `"center"`,\n`"inside-end"`, `"outside-end"`.'
      },
      {
        name: "inlineSizeMatch",
        attribute: "inline-size-match",
        type: " ChPopoverSizeMatch",
        default: '"content"',
        description:
          'Specifies how the popover adapts its inline size.\n - "content": The inline size of the control will be determined by its\n   content inline size.\n - "action-element": The inline size of the control will match the inline\n   size of the `actionElement`.\n - "action-element-as-minimum": The minimum inline size of the control\n   will match the inline size of the `actionElement`.\n\nIf the control is resized at runtime, only the "action-element-as-minimum"\nvalue will still work.'
      },
      {
        name: "mode",
        attribute: "popover",
        type: ' "auto" | "manual"',
        default: '"auto"',
        description:
          'Popovers that have the `"auto"` state can be "light dismissed" by\nselecting outside the popover area, and generally only allow one popover\nto be displayed on-screen at a time. By contrast, `"manual"` popovers must\nalways be explicitly hidden, but allow for use cases such as nested\npopovers in menus.'
      },
      {
        name: "overflowBehavior",
        attribute: "overflow-behavior",
        type: ' "overflow" | "add-scroll"',
        default: '"overflow"',
        description:
          'Specifies how the popover behaves when the content overflows the window\nsize.\n  - "overflow": The control won\'t implement any behavior if the content overflows.\n  - "add-scroll": The control will place a scroll if the content overflows.',
        reflect: true
      },
      {
        name: "positionTry",
        attribute: "position-try",
        type: ' "flip-block" | "flip-inline" | "none"',
        default: '"none"',
        description:
          "Specifies an alternative position to try when the control overflows the\nwindow."
      },
      {
        name: "resizable",
        attribute: "resizable",
        type: " boolean",
        default: "false",
        description:
          "Specifies whether the control can be resized. If `true` the control can be\nresized at runtime by dragging the edges or corners."
      },
      {
        name: "show",
        attribute: "show",
        type: " boolean",
        default: "false",
        description: "Specifies whether the popover is hidden or visible.",
        reflect: true
      }
    ],
    events: [
      {
        name: "popoverOpened",
        detailType: "void",
        description:
          "Emitted when the popover is opened by an user interaction.\n\nThis event can be prevented (`preventDefault()`), interrupting the\nch-popover's opening."
      },
      {
        name: "popoverClosed",
        detailType: "PopoverClosedInfo",
        description:
          'Emitted when the popover is closed by an user interaction.\n\nThis event can be prevented (`preventDefault()`), interrupting the\n`ch-popover`\'s closing.\n\nThe `reason` property of the event provides more information about\nthe cause of the closing:\n - `"click-outside"`: The popover is being closed because the user clicked\n   outside the popover when using `closeOnClickOutside === true` and\n   `mode === "manual"`.\n\n - `"escape-key"`: The popover is being closed because the user pressed the\n   "Escape" key when using `closeOnClickOutside === true` and\n   `mode === "manual"`.\n\n - `"popover-no-longer-visible"`: The popover is being closed because it\n   is no longer visible.\n\n - `"toggle"`: The popover is being closed by the native toggle behavior\n   of popover. It can be produced by the user clicking the `actionElement`,\n   pressing the "Enter" or "Space" keys on the `actionElement`, pressing\n   the "Escape" key or other. Used when `mode === "auto"`.'
      }
    ],
    parts: [
      {
        name: "header",
        description:
          'A draggable header area rendered when `allowDrag === "header"`. Projects the "header" slot.'
      }
    ],
    slots: [
      {
        name: "header",
        description:
          'Content projected into the header area. Rendered when `allowDrag === "header"`.'
      },
      {
        name: "- Default slot. The main content of the popover."
      }
    ],
    propertyImportTypes: {
      "./components/popover/types.ts": [
        "PopoverActionElement",
        "ChPopoverAlign",
        "ChPopoverSizeMatch"
      ]
    },
    eventImportTypes: {
      "./components/popover/types.ts": ["PopoverClosedInfo"]
    }
  },
  {
    access: "public",
    tagName: "ch-progress",
    className: "ChProgress",
    description:
      "The ch-progress is an element that displays the progress status for tasks\nthat take a long time.\n\nIt implements all accessibility behaviors for determinate and indeterminate\nprogress. It also supports referencing a region to describe its progress.",
    fullClassJSDoc:
      "/**\n * The ch-progress is an element that displays the progress status for tasks\n * that take a long time.\n *\n * It implements all accessibility behaviors for determinate and indeterminate\n * progress. It also supports referencing a region to describe its progress.\n *\n * @status experimental\n */",
    srcPath: "./components/progress/progress.lit.ts",
    developmentStatus: "experimental",
    formAssociated: true,
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "accessibleName",
        attribute: "accessible-name",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies a short string, typically 1 to 3 words, that authors associate\nwith an element to provide users of assistive technologies with a label\nfor the element."
      },
      {
        name: "accessibleValueText",
        attribute: "accessible-value-text",
        type: " string | undefined",
        default: "undefined",
        description:
          "Assistive technologies often present the `value` as a percentage. If this\nwould not be accurate use this property to make the progress bar value\nunderstandable."
      },
      {
        name: "indeterminate",
        attribute: "indeterminate",
        type: " boolean",
        default: "false",
        description:
          "Specifies whether the progress is indeterminate or not. In other words, it\nindicates that an activity is ongoing with no indication of how long it is\nexpected to take.\n\nIf `true`, the `max`, `min` and `value` properties won't be taken into\naccount.",
        reflect: true
      },
      {
        name: "max",
        attribute: "max",
        type: " number",
        default: "DEFAULT_MAX_VALUE",
        description:
          "Specifies the maximum value of progress. In other words, how much work the\ntask indicated by the progress component requires.\n\nThis property is not used if indeterminate === true."
      },
      {
        name: "min",
        attribute: "min",
        type: " number",
        default: "DEFAULT_MIN_VALUE",
        description:
          "Specifies the minimum value of progress.\n\nThis property is not used if indeterminate === true."
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
          "This property specifies how the progress will be render.\n - `\"custom\"`: Useful for making custom renders of the progress. The\n   control doesn't render anything and only projects the content of the\n   default slot. Besides that, all specified properties are still used to\n   implement the control's accessibility."
      },
      {
        name: "loadingRegionRef",
        attribute: false,
        type: " HTMLElement | undefined",
        default: "undefined",
        description:
          "If the control is describing the loading progress of a particular region\nof a page, set this property with the reference of the loading region.\nThis will set the `aria-describedby` and `aria-busy` attributes on the\nloading region to improve the accessibility while the control is in\nprogress.\n\nWhen the control detects that is no longer in progress (aka it is removed\nfrom the DOM or value === maxValue with indeterminate === false), it will\nremove the `aria-busy` attribute and update (or remove if necessary) the\n`aria-describedby` attribute.\n\nIf an ID is set prior to the control's first render, the control will use\nthis ID for the `aria-describedby`. Otherwise, the control will compute a\nunique ID for this matter.\n\n**Important**: If you are using Shadow DOM, take into account that the\n`loadingRegionRef` must be in the same Shadow Tree as this control.\nOtherwise, the `aria-describedby` binding won't work, since the control ID\nis not visible for the `loadingRegionRef`."
      },
      {
        name: "value",
        attribute: "value",
        type: " number",
        default: "DEFAULT_MIN_VALUE",
        description:
          "Specifies the current value of the component. In other words, how much of\nthe task that has been completed.\n\nThis property is not used if indeterminate === true."
      }
    ]
  },
  {
    access: "public",
    tagName: "ch-qr",
    className: "ChQr",
    description: "",
    fullClassJSDoc: "/**\n * @status developer-preview\n */",
    srcPath: "./components/qr/qr.lit.ts",
    developmentStatus: "developer-preview",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "accessibleName",
        attribute: "accessible-name",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies a short string, typically 1 to 3 words, that authors associate\nwith an element to provide users of assistive technologies with a label\nfor the element."
      },
      {
        name: "background",
        attribute: "background",
        type: " string",
        default: '"white"',
        description:
          'The background color of the render QR. If not specified, "transparent"\nwill be used.'
      },
      {
        name: "errorCorrectionLevel",
        attribute: "error-correction-level",
        type: " ErrorCorrectionLevel",
        default: '"High"',
        description:
          "The four values L, M, Q, and H will use %7, 15%, 25%, and 30% of the QR\ncode for error correction respectively. So on one hand the code will get\nbigger but chances are also higher that it will be read without errors\nlater on. This value is by default High (H)."
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
          "Defines how round the blocks should be. Numbers from 0 (squares) to 0.5\n(maximum round) are supported."
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
      "The radio group control is used to render a short list of mutually exclusive options.\n\nIt contains radio items to allow users to select one option from the list of options.",
    fullClassJSDoc:
      '/**\n * The radio group control is used to render a short list of mutually exclusive options.\n *\n * It contains radio items to allow users to select one option from the list of options.\n *\n * @part radio__item - The radio item element.\n * @part radio__container - The container that serves as a wrapper for the `input` and the `option` parts.\n * @part radio__input - The invisible input element that implements the interactions for the component. This part must be kept "invisible".\n * @part radio__option - The actual "input" that is rendered above the `input` part. This part has `position: absolute` and `pointer-events: none`.\n * @part radio__label - The label that is rendered when the `caption` property is not empty.\n *\n * @part checked - Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is checked (`checked` === `true`).\n * @part disabled - Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is disabled (`disabled` === `true`).\n * @part unchecked - Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is not checked (`checked` !== `true`).\n */',
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
          "This attribute lets you specify if the radio-group is disabled.\nIf disabled, it will not fire any user interaction related event\n(for example, click event).",
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
          "Fired when the selected item change. It contains the information about the\nnew selected value."
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
    fullClassJSDoc: "/**\n * @status developer-preview\n */",
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
      "Segmented control is used to pick one choice from a linear set of closely related choices, and immediately apply that selection.\nThis control represents and item of the ch-segmented-control-render",
    fullClassJSDoc:
      "/**\n * Segmented control is used to pick one choice from a linear set of closely related choices, and immediately apply that selection.\n * This control represents and item of the ch-segmented-control-render\n *\n * @part selected - ...\n */",
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
          "Specifies a short string, typically 1 to 3 words, that authors associate\nwith an element to provide users of assistive technologies with a label\nfor the element."
      },
      {
        name: "between",
        attribute: "between",
        type: " boolean",
        default: "false",
        description:
          "`true` if the control is the not the first or last item in the\nch-segmented-control-render."
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
          "This attribute lets you specify if the element is disabled.\nIf disabled, it will not fire any user interaction related event\n(for example, click event)."
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
      "/**\n * Segmented control is used to pick one choice from a linear set of closely related choices, and immediately apply that selection.\n */",
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
          "Specifies the parts that are exported by the internal\nsegmented-control-item. This property is useful to override the exported\nparts."
      },
      {
        name: "itemCssClass",
        attribute: "itemcssclass",
        type: " string",
        default: '"segmented-control-item"',
        description:
          "A CSS class to set as the `ch-segmented-control-item` element class.\nThis default class is used for the items that don't have an explicit class."
      },
      {
        name: "model",
        attribute: false,
        type: " SegmentedControlModel | undefined",
        default: "undefined",
        description:
          "This property lets you define the items of the ch-segmented-control-render\ncontrol."
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
          "Specifies a short string, typically 1 to 3 words, that authors associate\nwith an element to provide users of assistive technologies with a label\nfor expand button when `expanded = true`."
      },
      {
        name: "expandButtonExpandAccessibleName",
        attribute: "expand-button-expand-accessible-name",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies a short string, typically 1 to 3 words, that authors associate\nwith an element to provide users of assistive technologies with a label\nfor expand button when `expanded = false`."
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
          'Specifies the position of the expand button relative to the content of the\nsidebar.\n - `"before"`: The expand button is positioned before the content of the sidebar.\n - `"after"`: The expand button is positioned after the content of the sidebar.',
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
          "Emitted when thea element is clicked or the space key is pressed and\nreleased."
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
      "/**\n * The slider control is a input where the user selects a value from within a given range.\n *\n * @part track - The track of the slider element.\n * @part thumb - The thumb of the slider element.\n *\n * @part track__selected - Represents the portion of the track that is selected, that is, the portion of the track that starts at the min value and goes to the current value.\n * @part track__unselected - Represents the portion of the track that is not selected, that is, the portion of the track that starts at the current value and goes to the max value.\n *\n * @part disabled - Present in all parts when the control is disabled (`disabled` === `true`).\n */",
    srcPath: "./components/slider/slider.lit.ts",
    developmentStatus: "to-be-defined",
    formAssociated: true,
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "accessibleName",
        attribute: "accessible-name",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies a short string, typically 1 to 3 words, that authors associate\nwith an element to provide users of assistive technologies with a label\nfor the element."
      },
      {
        name: "disabled",
        attribute: "disabled",
        type: " boolean",
        default: "false",
        description:
          "This attribute allows you specify if the element is disabled.\nIf disabled, it will not trigger any user interaction related event\n(for example, click event).",
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
          "This attribute lets you indicate whether the control should display a\nbubble with the current value upon interaction."
      },
      {
        name: "step",
        attribute: "step",
        type: " number",
        default: "1",
        description:
          "This attribute lets you specify the step of the slider.\n\nThis attribute is useful when the values of the slider can only take some\ndiscrete values. For example, if valid values are `[10, 20, 30]` set the\n`minValue` to `10`, the maxValue to `30`, and the step to `10`. If the\nstep is `0`, the any intermediate value is valid."
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
          "The `change` event is emitted when a change to the element's value is\ncommitted by the user."
      },
      {
        name: "input",
        detailType: "number",
        description:
          "The `input` event is fired synchronously when the value is changed."
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
    tagName: "ch-smart-grid-cell",
    className: "ChSmartGridCell",
    description: "",
    fullClassJSDoc: "",
    srcPath:
      "./components/smart-grid/internal/smart-grid-cell/smart-grid-cell.lit.ts",
    developmentStatus: "to-be-defined",
    mode: "open",
    shadow: false,
    properties: [
      {
        name: "cellId",
        attribute: "cell-id",
        type: " string",
        default: "undefined",
        description:
          'Specifies the ID of the cell.\n\nWe use a specific property instead of the actual id attribute, because\nwith this property we don\'t need this ID to be unique in the Shadow scope\nwhere this cell is rendered. In other words, if there is an element with\n`id="1"`, this cell can still have `cellId="1"`.',
        reflect: true
      },
      {
        name: "smartGridRef",
        attribute: false,
        type: "\n    | HTMLChSmartGridElement\n    | undefined",
        default: "undefined",
        description:
          "Specifies the reference for the smart grid parent.\n\nThis property is useful to avoid the cell from queering the ch-smart-grid\nref on the initial load."
      }
    ],
    events: [
      {
        name: "smartCellDidLoad",
        detailType: "string",
        description:
          "Fired when the component and all its child did render for the first time.\n\nIt contains the `cellId`."
      }
    ]
  },
  {
    access: "public",
    tagName: "ch-smart-grid",
    className: "ChSmartGrid",
    description:
      "The `ch-smart-grid` component is an accessible grid layout for data-driven applications that require infinite scrolling, virtual rendering, and dynamic content loading.",
    fullClassJSDoc:
      '/**\n * The `ch-smart-grid` component is an accessible grid layout for data-driven applications that require infinite scrolling, virtual rendering, and dynamic content loading.\n *\n * @remarks\n * ## Features\n *  - Infinite scrolling via `ch-infinite-scroll` integration with configurable thresholds.\n *  - Standard and inverse loading orders (newest items at the bottom or top).\n *  - Automatic scroll-position management to prevent layout shifts (CLS) during async content loads.\n *  - Anchor a specific cell at the top of the viewport with reserved space, similar to code editors (via `scrollEndContentToPosition`).\n *  - Auto-grow mode (`autoGrow`) to adjust size to content, or fixed size with scrollbars.\n *  - ARIA live-region support for accessible announcements.\n *  - Virtual-scroller integration for rendering only visible items.\n *\n * ## Use when\n *  - Building chat-like interfaces with inverse loading.\n *  - Displaying large, dynamically loaded data sets with virtual scrolling.\n *  - Infinite-scroll or paginated feeds with bottom-to-top inverse loading (e.g., chat, activity streams).\n *\n * ## Do not use when\n *  - Displaying static tabular data with columns and headers -- use `ch-tabular-grid` instead.\n *  - A fixed, non-scrollable list is sufficient -- prefer `ch-action-list-render`.\n *\n * ## Accessibility\n *  - The host element uses `aria-live="polite"` to announce content changes to assistive technologies.\n *  - `aria-busy` is set to `"true"` during `"initial"` and `"loading"` states, preventing premature announcements.\n *  - The `accessibleName` property maps to `aria-label` on the host.\n *\n * @status experimental\n *\n * @slot grid-initial-loading-placeholder - Placeholder content shown during the initial loading state before any data has been fetched.\n * @slot grid-content - Primary content slot for grid cells. Rendered when the grid has records and is not in the initial loading state.\n * @slot grid-content-empty - Fallback content displayed when the grid has finished loading but contains no records.\n */',
    srcPath: "./components/smart-grid/smart-grid.lit.ts",
    developmentStatus: "experimental",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "accessibleName",
        attribute: "accessible-name",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies a short string, typically 1 to 3 words, that authors associate\nwith an element to provide users of assistive technologies with a label\nfor the element."
      },
      {
        name: "autoGrow",
        attribute: "auto-grow",
        type: " boolean | undefined",
        default: "false",
        description:
          "When `true`, the control size grows automatically to fit its content\n(no scrollbars). When `false`, the control has a fixed size and\nshows scrollbars if the content overflows.\n\nWhen `false`, the `ch-scrollable` class is applied to the host,\nenabling `contain: strict` and `overflow: auto`.\n\nInteracts with `inverseLoading`: when both `autoGrow` and\n`inverseLoading` are `true`, the CLS-avoidance opacity class is\nremoved after the first render instead of waiting for the\nvirtual-scroller load event."
      },
      {
        name: "autoScroll",
        attribute: "auto-scroll",
        type: ' "never" | "at-scroll-end"',
        default: '"at-scroll-end"',
        description:
          'Specifies how the scroll position will be adjusted when the content size\nchanges when using `inverseLoading = true`.\n  - "at-scroll-end": If the scroll is positioned at the end of the content,\n  the chat will maintain the scroll at the end while the content size\n  changes.\n\n - "never": The scroll position won\'t be adjusted when the content size\n  changes.'
      },
      {
        name: "dataProvider",
        attribute: "data-provider",
        type: " boolean | undefined",
        default: "false",
        description:
          "`true` if the control has an external data provider and therefore must\nimplement infinite scrolling to load data progressively.\nWhen `true`, a `ch-infinite-scroll` element is rendered at the top\n(if `inverseLoading`) or bottom of the grid content."
      },
      {
        name: "inverseLoading",
        attribute: "inverse-loading",
        type: " boolean | undefined",
        default: "false",
        description:
          'When set to `true`, the grid items will be loaded in inverse order, with\nthe first element at the bottom and the "Loading" message (infinite-scroll)\nat the top.'
      },
      {
        name: "itemsCount",
        attribute: "items-count",
        type: " number",
        default: "undefined",
        description:
          "The current number of items (rows/cells) in the grid.\nThis is a required property used to trigger re-renders whenever the\ndata set changes. When `itemsCount` is `0`, the `grid-content-empty`\nslot is rendered instead of `grid-content`.\n\nIf not specified, grid empty and loading placeholders may not work\ncorrectly."
      },
      {
        name: "loadingState",
        attribute: "loading-state",
        type: " SmartGridDataState",
        default: '"initial"',
        description:
          'Specifies the loading state of the grid:\n - `"initial"`: First load; shows the `grid-initial-loading-placeholder`\n   slot.\n - `"loading"`: Data is being fetched (infinite scroll triggered). The\n   `ch-infinite-scroll` component shows its loading indicator.\n - `"loaded"`: Data fetch is complete. Normal content is rendered.\n\nThis property is mutable: the component sets it to `"loading"` when\nthe infinite-scroll threshold is reached.'
      },
      {
        name: "threshold",
        attribute: "threshold",
        type: " string",
        default: '"10px"',
        description:
          "The threshold distance from the bottom of the content to call the\n`infinite` output event when scrolled. The threshold value can be either a\npercent, or in pixels. For example, use the value of `10%` for the\n`infinite` output event to get called when the user has scrolled 10% from\nthe bottom of the page. Use the value `100px` when the scroll is within\n100 pixels from the bottom of the page."
      }
    ],
    events: [
      {
        name: "infiniteThresholdReached",
        detailType: "void",
        description:
          'Emitted every time the infinite-scroll threshold is reached.\nThe host should respond by fetching the next page of data and updating\n`loadingState` back to `"loaded"` when done.\n\nDoes not bubble (`bubbles: false`). Not cancelable. Payload is `void`.\nBefore emitting, the component automatically sets `loadingState` to\n`"loading"`.'
      }
    ],
    methods: [
      {
        name: "scrollEndContentToPosition",
        paramTypes: [
          {
            name: "cellId",
            type: "string"
          },
          {
            name: "options",
            type: '{ position: "start" | "end"; behavior?: ScrollBehavior }'
          }
        ],
        returnType: "void",
        description:
          'Scrolls the grid so that the cell identified by `cellId` is aligned at\nthe `"start"` or `"end"` of the viewport.\n\nWhen `position === "start"`, the component reserves extra space after\nthe last cell (similar to how the Monaco editor reserves space for the\nlast lines) to keep the anchor cell visible at the top even when there\nis not enough content below it.\n\nThe reserved space is automatically recalculated as cells are added or\nremoved. Call `removeScrollEndContentReference()` to clear the anchor.'
      },
      {
        name: "removeScrollEndContentReference",
        paramTypes: [],
        returnType: "void",
        description:
          'Removes the cell reference that is aligned at the start of the viewport.\n\nIn other words, removes the reserved space that is used to aligned\n`scrollEndContentToPosition(cellId, { position: "start" })`'
      }
    ],
    slots: [
      {
        name: "grid-initial-loading-placeholder",
        description:
          "Placeholder content shown during the initial loading state before any data has been fetched."
      },
      {
        name: "grid-content",
        description:
          "Primary content slot for grid cells. Rendered when the grid has records and is not in the initial loading state."
      },
      {
        name: "grid-content-empty",
        description:
          "Fallback content displayed when the grid has finished loading but contains no records."
      }
    ],
    propertyImportTypes: {
      "./components/infinite-scroll/types.ts": ["SmartGridDataState"]
    }
  },
  {
    access: "public",
    tagName: "ch-status",
    className: "ChStatus",
    description:
      "The `ch-status` component provides a lightweight loading indicator that communicates an ongoing process to both visual users and assistive technologies.",
    fullClassJSDoc:
      '/**\n * The `ch-status` component provides a lightweight loading indicator that communicates an ongoing process to both visual users and assistive technologies.\n *\n * @remarks\n * ## Features\n *  - Sets `role="status"` and `aria-live="polite"` for non-interrupting screen reader announcements.\n *  - Automatic `aria-busy` and `aria-describedby` management on a referenced loading region.\n *  - Cleans up ARIA attributes when removed from the DOM.\n *  - Designed for use inside buttons, overlays, table cells, and any region needing a simple "busy" signal.\n *\n * ## Use when\n *  - You need an indeterminate loading state without numeric progress (e.g., a spinner on a button).\n *  - A region of the page is loading and no progress percentage is available (spinner pattern).\n *  - An operation is running in the background and the user should be aware without being interrupted.\n *\n * ## Do not use when\n *  - You have tasks with measurable progress -- prefer `ch-progress` instead.\n *  - Actual progress percentage is known — prefer `ch-progress` with determinate mode instead.\n *\n * ## Accessibility\n *  - `role="status"` is set on the host in `connectedCallback`, which carries an implicit `aria-live="polite"` and `aria-atomic="true"` semantic. An explicit `aria-live="polite"` is also set for maximum compatibility.\n *  - Resolves its accessible name from the `accessibleName` property.\n *  - `aria-busy` and `aria-describedby` are set on the `loadingRegionRef` element while the status is rendered, and cleaned up on disconnect.\n *  - No keyboard interaction — the component is a passive indicator, not an interactive control.\n *\n * @status experimental\n *\n * @slot - Default slot. Use it to project custom visual content such as a spinner icon or loading text. Content changes trigger polite `aria-live` announcements to assistive technologies.\n */',
    srcPath: "./components/status/status.lit.ts",
    developmentStatus: "experimental",
    formAssociated: true,
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "accessibleName",
        attribute: "accessible-name",
        type: "\n    | string\n    | undefined",
        default: "undefined",
        description:
          "Specifies a short string that authors associate with an element\nto provide users of assistive technologies with a label for the element."
      },
      {
        name: "loadingRegionRef",
        attribute: false,
        type: " HTMLElement | undefined",
        default: "undefined",
        description:
          "If the control is describing the loading progress of a particular region\nof a page, set this property with the reference of the loading region.\nThis will set the `aria-describedby` and `aria-busy` attributes on the\nloading region to improve accessibility while the control is in rendered.\n\nWhen the control detects that is no longer rendered (aka it is removed\nfrom the DOM), it will remove the `aria-busy` attribute and the\n`aria-describedby` attribute.\n\n**Note**: Setting this prop overwrites any existing `aria-describedby`\nvalue on the referenced element — it replaces rather than appends.\n\nIf an ID is set prior to the component's first render, the ch-status will use\nthis ID for the `aria-describedby`. Otherwise, the ch-status will compute a\nunique ID for this matter.\n\n**Important**: If you are using Shadow DOM, take into account that the\n`loadingRegionRef` must be in the same Shadow Tree as the ch-status.\nOtherwise, the `aria-describedby` binding won't work, since the control ID\nis not visible for the `loadingRegionRef`."
      }
    ],
    slots: [
      {
        name: "- Default slot. Use it to project custom visual content such as a spinner icon or loading text. Content changes trigger polite `aria-live` announcements to assistive technologies."
      }
    ]
  },
  {
    access: "public",
    tagName: "ch-switch",
    className: "ChSwitch",
    description: "",
    fullClassJSDoc:
      "/**\n * @status experimental\n *\n * A switch/toggle control that enables you to select between options.\n *\n * @part track - The track of the switch element.\n * @part thumb - The thumb of the switch element.\n * @part caption - The caption (checked or unchecked) of the switch element.\n *\n * @part checked - Present in the `track`, `thumb` and `caption` parts when the control is checked (`checked` === `true`).\n * @part disabled - Present in the `track`, `thumb` and `caption` parts when the control is disabled (`disabled` === `true`).\n * @part unchecked - Present in the `track`, `thumb` and `caption` parts when the control is unchecked (`checked` === `false`).\n */",
    srcPath: "./components/switch/switch.lit.ts",
    developmentStatus: "to-be-defined",
    formAssociated: true,
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "accessibleName",
        attribute: "accessible-name",
        type: " string | undefined",
        default: "undefined",
        description:
          "Specifies a short string, typically 1 to 3 words, that authors associate\nwith an element to provide users of assistive technologies with a label\nfor the element.asd123"
      },
      {
        name: "checkedCaption",
        attribute: "checked-caption",
        type: " string | undefined",
        default: "undefined",
        description: "Caption displayed when the switch is 'on'"
      },
      {
        name: "checked",
        attribute: "checked",
        type: " boolean",
        default: "false",
        description:
          "`true` if the `ch-switch` is checked.\n\nIf checked:\n  - The `value` property will be available in the parent `<form>` if the\n    `name` attribute is set.\n  - The `checkedCaption` will be used to display the current caption.\n\nIf not checked:\n  - The `value` property won't be available in the parent `<form>`, even\n    if the `name` attribute is set.\n  - The `unCheckedCaption` will be used to display the current caption."
      },
      {
        name: "disabled",
        attribute: "disabled",
        type: " boolean",
        default: "false",
        description:
          "This attribute lets you specify if the element is disabled.\nIf disabled, it will not fire any user interaction related event\n(for example, click event).",
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
          "This attribute indicates that the user cannot modify the value of the control.\nSame as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly)\nattribute for `input` elements."
      },
      {
        name: "unCheckedCaption",
        attribute: "un-checked-caption",
        type: " string | undefined",
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
          "The `input` event is emitted when a change to the element's checked state\nis committed by the user.\n\nIt contains the new checked state of the control.\n\nThis event is preventable."
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
    tagName: "ch-tab-render",
    className: "ChTabRender",
    description:
      "The `ch-tab-render` component renders a tabbed interface where each tab\nbutton switches the visible content panel.",
    fullClassJSDoc:
      '/**\n * The `ch-tab-render` component renders a tabbed interface where each tab\n * button switches the visible content panel.\n *\n * @remarks\n * ## Features\n *  - Tab list positioning along any edge of the container (`block-start`,\n *    `block-end`, `inline-start`, or `inline-end`).\n *  - Optional images, icons, captions, and close buttons per tab.\n *  - Keyboard navigation following WAI-ARIA tab patterns (Arrow keys are\n *    direction-aware based on `tabListPosition`; Home/End jump to first/last\n *    tab).\n *  - Drag-to-reorder tabs within the tab list when `sortable` is enabled.\n *  - Drag tabs outside the component for relocation in a flexible layout\n *    context when `dragOutside` is enabled.\n *  - CSS containment and overflow configuration per tab panel.\n *\n * ## Use when\n *  - Building a multi-panel UI where content should be switchable through\n *    labeled tabs (settings dialogs, property inspectors, IDE-style editor\n *    groups).\n *  - Organizing related but independent content sections within the same\n *    context (e.g., "Overview", "Files", "Commits").\n *  - Users need to view one section at a time without leaving the page.\n *\n * ## Do not use when\n *  - Showing or hiding a single content section -- prefer an accordion instead.\n *  - Users must compare content across sections -- switching back and forth is\n *    too costly.\n *  - The sections represent different pages or routes -- prefer\n *    `ch-navigation-list-render`.\n *  - Content follows a sequential linear process -- prefer a stepper/wizard\n *    pattern.\n *  - More than 6 tabs are needed -- consider a sidebar or\n *    `ch-navigation-list-render`.\n *  - Confusing with `ch-segmented-control-render`: tabs switch to DIFFERENT\n *    content sections; segmented controls switch the VIEW FORMAT of the same\n *    data.\n *\n * ## Accessibility\n *  - Implements the WAI-ARIA Tabs pattern with `role="tablist"`, `role="tab"`,\n *    and `role="tabpanel"`.\n *  - Supports keyboard navigation: Arrow keys to move between tabs, Home/End\n *    to jump to first/last.\n *  - Each tab button reflects `aria-selected` and `aria-controls` linking to\n *    its panel.\n *  - Close buttons carry an accessible label.\n *\n * @status experimental\n *\n * @csspart tab - The primary `<button>` element for each tab item. Also receives the `{item.id}`, position, state, and direction parts.\n * @csspart tab-caption - The `<ch-textblock>` text label inside each tab button. Present when `showCaptions` is `true`.\n * @csspart img - The `<img>` element rendered when a tab item uses `startImgSrc` with `startImgType = "img"`.\n * @csspart close-button - The button that closes a tab. Rendered when `closeButton` is `true` and the item is closable.\n * @csspart tab-list - The `<div>` that wraps all tab buttons and acts as the `role="tablist"` container.\n * @csspart tab-list-start - The `<div>` adjacent to the start of the tab list. Used to project toolbar content via `slot={tabListPosition}`.\n * @csspart tab-list-end - The `<div>` adjacent to the end of the tab list. Used to project toolbar content via `slot={tabListPosition}`.\n * @csspart tab-panel - The panel `<div>` for each tab\'s content area. Receives `{item.id}`, position, and state parts.\n * @csspart tab-panel-container - The outer container `<div>` that wraps all tab panels.\n *\n * @csspart {item.id} - Present on the `tab`, `tab-caption`, `close-button`, and `tab-panel` parts for each tab item, enabling per-tab styling.\n *\n * @csspart selected - Present in the `tab`, `tab-caption`, `close-button`, and `tab-panel` parts when the item is selected.\n * @csspart not-selected - Present in the `tab`, `tab-caption`, `close-button`, and `tab-panel` parts when the item is not selected.\n * @csspart disabled - Present in the `tab`, `tab-caption`, `close-button`, and `tab-panel` parts when the item is disabled.\n * @csspart closable - Present in the `tab` and `tab-caption` parts when the item has a close button.\n * @csspart not-closable - Present in the `tab` and `tab-caption` parts when the item does not have a close button.\n * @csspart dragging - Present in the `tab`, `close-button`, and `tab-list` parts while a tab is being dragged.\n * @csspart dragging-over-tab-list - Present in the `tab` and `close-button` parts while dragging within the tab list bounds.\n * @csspart dragging-out-of-tab-list - Present in the `tab` and `close-button` parts while dragging outside the tab list bounds.\n * @csspart expanded - Present in the `tab-panel-container` part when the panel container is visible.\n * @csspart collapsed - Present in the `tab-panel-container` part when the panel container is hidden.\n *\n * @csspart block - Present when the tab list is oriented vertically (block direction).\n * @csspart inline - Present when the tab list is oriented horizontally (inline direction).\n * @csspart start - Present when the tab list is positioned at the start edge.\n * @csspart end - Present when the tab list is positioned at the end edge.\n *\n * @slot {tabListPosition} - Named slot rendered adjacent to the tab list for custom toolbar content (e.g., an overflow menu or add-tab button).\n * @slot {item.id} - Named slot for each tab panel\'s content, projected when the tab has been rendered at least once.\n */',
    srcPath: "./components/tab/tab.lit.ts",
    developmentStatus: "experimental",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "accessibleName",
        attribute: "accessible-name",
        type: " string | undefined",
        default: "undefined",
        description:
          'Specifies a short string, typically 1 to 3 words, that authors associate\nwith an element to provide users of assistive technologies with a label\nfor the element. This value is applied as the accessible name of the\n`role="tablist"` element.'
      },
      {
        name: "closeButton",
        attribute: "close-button",
        type: " boolean",
        default: "false",
        description: "`true` to display a close button for the items."
      },
      {
        name: "closeButtonAccessibleName",
        attribute: "close-button-accessible-name",
        type: " string",
        default: '"Close"',
        description:
          "Specifies a short string, typically 1 to 3 words, that authors associate\nwith an element to provide users of assistive technologies with a label\nfor the element. This label is used for the close button of the captions."
      },
      {
        name: "contain",
        attribute: "contain",
        type: " CssContainProperty | undefined",
        default: '"none"',
        description:
          "Same as the contain CSS property. This property indicates that an item\nand its contents are, as much as possible, independent from the rest of\nthe document tree. Containment enables isolating a subsection of the DOM,\nproviding performance benefits by limiting calculations of layout, style,\npaint, size, or any combination to a DOM subtree rather than the entire\npage.\nContainment can also be used to scope CSS counters and quotes."
      },
      {
        name: "disabled",
        attribute: "disabled",
        type: " boolean",
        default: "false",
        description:
          "This attribute lets you specify if all tab buttons are disabled.\nIf disabled, tab buttons will not fire any user interaction related event\n(for example, click event)."
      },
      {
        name: "dragOutside",
        attribute: "drag-outside",
        type: " boolean",
        default: "false",
        description:
          "When the control is sortable, the items can be dragged outside of the\ntab-list.\n\nThis property lets you specify if this behavior is enabled."
      },
      {
        name: "expanded",
        attribute: "expanded",
        type: " boolean",
        default: "true",
        description:
          "`true` if the tab panel container is visible. When `false`, only the\ntab-list toolbar is displayed and all tab panels are hidden."
      },
      {
        name: "getImagePathCallback",
        attribute: "getimagepathcallback",
        type: " GetImagePathCallback | undefined",
        default: "undefined",
        description:
          "This property specifies a callback that is executed when the path for an\nstartImgSrc needs to be resolved."
      },
      {
        name: "model",
        attribute: "model",
        type: " TabModel | undefined",
        default: "undefined",
        description:
          "Specifies the items of the tab control. Tab panels use lazy rendering:\na panel's content slot is only rendered after the tab has been selected\nat least once (tracked internally via `wasRendered`)."
      },
      {
        name: "overflow",
        attribute: "overflow",
        type: " CssOverflowProperty | `${CssOverflowProperty} ${CssOverflowProperty}`",
        default: '"visible"',
        description:
          "Same as the overflow CSS property. This property sets the desired behavior\nwhen content does not fit in the item's padding box (overflows) in the\nhorizontal and/or vertical direction."
      },
      {
        name: "selectedId",
        attribute: "selected-id",
        type: " string | undefined",
        default: "undefined",
        description: "Specifies the selected item of the widgets array."
      },
      {
        name: "showCaptions",
        attribute: "show-captions",
        type: " boolean",
        default: "true",
        description: "`true` to show the captions of the items."
      },
      {
        name: "showTabListEnd",
        attribute: "show-tab-list-end",
        type: " boolean",
        default: "false",
        description:
          '`true` to render a slot named "tab-list-end" to project content at the\nend position of the tab-list ("after" the tab buttons).'
      },
      {
        name: "showTabListStart",
        attribute: "show-tab-list-start",
        type: " boolean",
        default: "false",
        description:
          '`true` to render a slot named "tab-list-start" to project content at the\nstart position of the tab-list ("before" the tab buttons).'
      },
      {
        name: "sortable",
        attribute: "sortable",
        type: " boolean",
        default: "false",
        description:
          "`true` to enable sorting the tab buttons by dragging them in the tab-list.\n\nIf `false`, the tab buttons can not be dragged out either."
      },
      {
        name: "tabButtonHidden",
        attribute: "tab-button-hidden",
        type: " boolean",
        default: "false",
        description: "`true` to not render the tab buttons of the control."
      },
      {
        name: "tabListPosition",
        attribute: "tab-list-position",
        type: " TabListPosition",
        default: "DEFAULT_TAB_LIST_POSITION",
        description:
          "Specifies the position of the tab list of the `ch-tab-render`."
      }
    ],
    events: [
      {
        name: "expandMainGroup",
        detailType: "string",
        description: "Fired when an item of the main group is double clicked."
      },
      {
        name: "itemClose",
        detailType: "TabItemCloseInfo",
        description: "Fired the close button of an item is clicked."
      },
      {
        name: "selectedItemChange",
        detailType: "TabSelectedItemInfo",
        description:
          "Fired when the selected item change.\nThis event can be default prevented to prevent the item selection."
      },
      {
        name: "itemDragStart",
        detailType: "number",
        description:
          "Fired the first time a caption button is dragged outside of its tab list."
      }
    ],
    methods: [
      {
        name: "endDragPreview",
        paramTypes: [],
        returnType: "Promise<void>",
        description:
          "Ends the preview of the dragged item. Useful for ending the preview via\nkeyboard interaction."
      },
      {
        name: "getDraggableViews",
        paramTypes: [],
        returnType: "Promise<DraggableViewInfo>",
        description: "Returns the info associated to the draggable view."
      },
      {
        name: "promoteDragPreviewToTopLayer",
        paramTypes: [],
        returnType: "Promise<void>",
        description:
          "Promotes the drag preview to the top layer. Useful to avoid z-index issues."
      },
      {
        name: "removePage",
        paramTypes: [
          {
            name: "pageId",
            type: "string"
          },
          {
            name: "forceRerender",
            type: "any"
          }
        ],
        returnType: "void",
        description: "Given an id, remove the page from the render"
      }
    ],
    slots: [
      {
        name: "{tabListPosition}",
        description:
          "Named slot rendered adjacent to the tab list for custom toolbar content (e.g., an overflow menu or add-tab button)."
      },
      {
        name: "{item.id}",
        description:
          "Named slot for each tab panel's content, projected when the tab has been rendered at least once."
      }
    ],
    propertyImportTypes: {
      "./typings/css-properties.ts": [
        "CssContainProperty",
        "CssOverflowProperty"
      ],
      "./typings/multi-state-images.ts": ["GetImagePathCallback"],
      "./components/tab/types.ts": ["TabModel", "TabListPosition"]
    },
    eventImportTypes: {
      "./components/tab/types.ts": ["TabItemCloseInfo", "TabSelectedItemInfo"]
    }
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
          "Specifies an accessor for the attribute style of the\n`ch-tabular-grid-column`. This accessor is useful for SSR scenarios were\nthe Host access is limited (since Lit does not provide the Host\ndeclarative component).\n\nWithout this accessor, the initial load in SSR scenarios would flicker.",
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
        type: "\n    | TabularGridSortDirection\n    | undefined",
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
      "/**\n * @status developer-preview\n *\n * @slot - The slot for the HTML content.\n */",
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
          "This property defines if the control size will grow automatically, to\nadjust to its content size.\n\nIf `false` the overflowing content will be displayed with an ellipsis.\nThis ellipsis takes into account multiple lines."
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
          "It specifies the format that will have the textblock control.\n\n - If `format` = `HTML`, the textblock control works as an HTML div and\n   the innerHTML will be taken from the default slot.\n\n - If `format` = `text`, the control works as a normal textblock control\n   and it is affected by most of the defined properties."
      },
      {
        name: "showTooltipOnOverflow",
        attribute: "showtooltiponoverflow",
        type: " boolean",
        default: "false",
        description:
          "`true` to display a tooltip when the caption overflows the size of the\ncontainer.\n\nOnly works if `format = text` and `autoGrow = false`."
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
      "It allows you to load a style sheet in a similar way to the\nnative LINK or STYLE tags, but assigning it a name so that\nit can be reused in different contexts,\neither in the Document or in a Shadow-Root.",
    fullClassJSDoc:
      "/**\n * It allows you to load a style sheet in a similar way to the\n * native LINK or STYLE tags, but assigning it a name so that\n * it can be reused in different contexts,\n * either in the Document or in a Shadow-Root.\n */",
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
          "Indicates whether the theme should be attached to the Document or\nthe ShadowRoot after loading.\nThe value can be overridden by the `attachStyleSheet` property of the model."
      },
      {
        name: "avoidFlashOfUnstyledContent",
        attribute: "avoidflashofunstyledcontent",
        type: " boolean",
        default: "true",
        description:
          "`true` to visually hide the contents of the root node while the control's\nstyle is not loaded."
      },
      {
        name: "hidden",
        attribute: "hidden",
        type: " boolean",
        default: "false",
        description:
          "Specifies an accessor for the attribute `hidden` of the `ch-theme`. This\naccessor is useful for SSR scenarios were the DOM is shimmed and we don't\nhave access to is limited (since Lit does not provide the Host declarative\ncomponent), so we have to find a way to reflect the hidden property in the\n`ch-theme` tag.\n\nWithout this accessor, the initial load in SSR scenarios would flicker.",
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
  },
  {
    access: "public",
    tagName: "ch-virtual-scroller",
    className: "ChVirtualScroller",
    description:
      "The `ch-virtual-scroller` component provides efficient virtual scrolling for large lists of items within a `ch-smart-grid`, keeping only visible items plus a configurable buffer in the DOM.",
    fullClassJSDoc:
      '/**\n * The `ch-virtual-scroller` component provides efficient virtual scrolling for large lists of items within a `ch-smart-grid`, keeping only visible items plus a configurable buffer in the DOM.\n *\n * @remarks\n * ## Features\n *  - `"virtual-scroll"` mode: removes items outside the viewport from the DOM, using CSS pseudo-element spacers (`::before` / `::after`) to maintain scroll height. Lowest memory footprint.\n *  - `"lazy-render"` mode: lazily renders items as they scroll into view, but keeps them in the DOM once rendered. Avoids re-rendering costs at the expense of higher memory usage.\n *  - Configurable buffer amount (`bufferAmount`) for items rendered above and below the viewport.\n *  - Inverse loading support (`inverseLoading`) for chat-style interfaces where the newest items are at the bottom and the scroll starts at the end.\n *  - Automatic re-rendering on scroll and resize events via `requestAnimationFrame`-synced updates.\n *  - Emits `virtualItemsChanged` whenever the visible slice changes, enabling the parent to render only the required cells.\n *  - Hides content with `opacity: 0` until the initial viewport cells are fully loaded, then fires `virtualScrollerDidLoad`.\n *\n * ## Use when\n *  - Rendering hundreds or thousands of items inside a `ch-smart-grid`.\n *  - Building chat interfaces that need efficient inverse-loaded virtual scrolling.\n *\n * ## Do not use when\n *  - The list has fewer than ~100 items — the overhead of virtual scrolling is not justified.\n *  - Used outside of `ch-smart-grid` — this component is designed to work exclusively with `ch-smart-grid`.\n *\n * ## Accessibility\n *  - This component is structural and does not render visible interactive content. Accessibility semantics are handled by the parent `ch-smart-grid` and its cells.\n *\n * ```\n *   <ch-smart-grid>\n *     #shadow-root (open)\n *     |  <slot name="grid-content"></slot>\n *     <ch-virtual-scroller slot="grid-content">\n *       <ch-smart-grid-cell>...</ch-smart-grid-cell>\n *       <ch-smart-grid-cell>...</ch-smart-grid-cell>\n *       ...\n *     </ch-virtual-scroller>\n *   </ch-smart-grid>\n * ```\n *\n * @status experimental\n *\n * @slot - Default slot. The slot for `ch-smart-grid-cell` elements representing the items to be virtually scrolled.\n *\n */',
    srcPath: "./components/virtual-scroller/virtual-scroller.lit.ts",
    developmentStatus: "experimental",
    mode: "open",
    shadow: true,
    properties: [
      {
        name: "bufferAmount",
        attribute: "buffer-amount",
        type: " number",
        default: "5",
        description:
          "The number of extra elements to render above and below the current\ncontainer's viewport. A higher value reduces the chance of blank areas\nduring fast scrolling but increases DOM size.\n\nThe new value is used on the next scroll or resize update."
      },
      {
        name: "initialRenderViewportItems",
        attribute: "initial-render-viewport-items",
        type: " number",
        default: "10",
        description:
          "Specifies an estimated count of items that fit in the viewport for the\ninitial render. Combined with `bufferAmount`, this determines how many\nitems are rendered before the first scroll event. A value that is too\nlow may cause visible blank space on initial load; a value that is too\nhigh increases initial DOM size.\n\nDefaults to `10`. Init-only — only used during the first render cycle."
      },
      {
        name: "inverseLoading",
        attribute: "inverse-loading",
        type: " boolean",
        default: "false",
        description:
          'When set to `true`, the grid items will be loaded in inverse order, with\nthe scroll positioned at the bottom on the initial load.\n\nIf `mode="virtual-scroll"`, only the items at the start of the viewport\nthat are not visible will be removed from the DOM. The items at the end of\nthe viewport that are not visible will remain rendered to avoid flickering\nissues.'
      },
      {
        name: "items",
        attribute: false,
        type: " SmartGridModel | undefined",
        default: "undefined",
        description:
          "The array of items to be rendered in the `ch-smart-grid`. Each item must\nhave a unique `id` property used internally for virtual size tracking.\n\nWhen a new array reference is assigned, the virtual scroller resets its\ninternal state (indexes, virtual sizes) and performs a fresh initial\nrender. For incremental additions, prefer the `addItems()` method to\navoid a full reset.\n\nSetting to `undefined` or an empty array emits an empty\n`virtualItemsChanged` event."
      },
      {
        name: "itemsCount",
        attribute: "items-count",
        type: " number",
        default: "undefined",
        description:
          "The total number of elements in the `items` array. Set this property when\nyou mutate the existing array (e.g., push/splice) without assigning a new\nreference, so the virtual scroller knows the length has changed.\n\nIf `items` is reassigned as a new array reference, this property is not\nneeded since the `@Watch` on `items` will handle the reset."
      },
      {
        name: "mode",
        attribute: "mode",
        type: ' "virtual-scroll" | "lazy-render"',
        default: '"virtual-scroll"',
        description:
          'Specifies how the control will behave.\n  - "virtual-scroll": Only the items at the start of the viewport that are\n  not visible will be removed from the DOM. The items at the end of the\n  viewport that are not visible will remain rendered to avoid flickering\n  issues.\n\n  - "lazy-render": It behaves similarly to "virtual-scroll" on the initial\n  load, but when the user scrolls and new items are rendered, those items\n  that are outside of the viewport won\'t be removed from the DOM.'
      }
    ],
    events: [
      {
        name: "virtualItemsChanged",
        detailType: "VirtualScrollVirtualItems",
        description:
          "Emitted when the slice of visible items changes due to scrolling, resizing,\nor programmatic updates. The payload includes `startIndex`, `endIndex`,\n`totalItems`, and the `virtualItems` sub-array that should be rendered.\n\nThis event is the primary mechanism for the parent `ch-smart-grid` to know\nwhich cells to render."
      },
      {
        name: "virtualScrollerDidLoad",
        detailType: "void",
        description:
          "Fired once when all cells in the initial viewport have been rendered and\nare visible. After this event, the scroller removes `opacity: 0` and\nstarts listening for scroll/resize events. This event has no payload."
      }
    ],
    methods: [
      {
        name: "addItems",
        paramTypes: [
          {
            name: "position",
            type: '"start" | "end"'
          },
          {
            name: "items",
            type: "SmartGridModel"
          }
        ],
        returnType: "void",
        description:
          'Adds items to the beginning or end of the `items` array without resetting\nthe virtual scroller\'s internal indexes. This is the preferred way to\nappend or prepend items to the collection (e.g., infinite scroll or\nchat message loading). When `position` is `"start"`, internal start/end\nindexes are shifted by the number of added items to keep the viewport\nstable.\n\nAfter mutation, the scroller triggers a scroll handler update to\nrecalculate visible items.'
      }
    ],
    slots: [
      {
        name: "- Default slot. The slot for `ch-smart-grid-cell` elements representing the items to be virtually scrolled."
      }
    ],
    propertyImportTypes: {
      "./components/smart-grid/types.js": ["SmartGridModel"]
    },
    eventImportTypes: {
      "./components/virtual-scroller/types.js": ["VirtualScrollVirtualItems"]
    },
    methodImportTypes: {
      "./components/smart-grid/types.js": ["SmartGridModel"]
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
