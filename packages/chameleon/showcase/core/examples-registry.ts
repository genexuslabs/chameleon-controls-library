import type { Spec } from "@json-render/core";
import type { ComponentRegistry } from "../../src/components/json-render/types";
import { html } from "lit";

// Component imports (side effects — register custom elements)
import "../../src/components/accordion/accordion.lit";
import "../../src/components/action-group/action-group-render.lit";
import "../../src/components/action-list/action-list-render.lit";
import "../../src/components/action-menu/action-menu-render.lit";
import "../../src/components/breadcrumb/breadcrumb-render.lit";
import "../../src/components/checkbox/checkbox.lit";
import "../../src/components/code/code.lit";
import "../../src/components/combo-box/combo-box.lit";
import "../../src/components/edit/edit.lit";
import "../../src/components/image/image.lit";
import "../../src/components/layout-splitter/layout-splitter.lit";
import "../../src/components/math-viewer/math-viewer.lit";
import "../../src/components/navigation-list/navigation-list-render.lit";
import "../../src/components/popover/popover.lit";
import "../../src/components/progress/progress.lit";
import "../../src/components/qr/qr.lit";
import "../../src/components/radio-group/radio-group-render.lit";
import "../../src/components/segmented-control/segmented-control-render.lit";
import "../../src/components/sidebar/sidebar.lit";
import "../../src/components/slider/slider.lit";
import "../../src/components/status/status.lit";
import "../../src/components/switch/switch.lit";
import "../../src/components/tab/tab.lit";
import "../../src/components/tabular-grid/tabular-grid-render.lit";
import "../../src/components/textblock/textblock.lit";
import "../../src/components/theme/theme.lit";
import "../../src/components/chat/chat.lit";
import "../../src/components/markdown-viewer/markdown-viewer.lit";
import "../../src/components/smart-grid/smart-grid.lit";
import "../../src/components/live-kit-room/live-kit-room.lit";

// ---- Models for complex components ----

const ACCORDION_MODEL = [
  { id: "section-1", caption: "Section 1", expanded: true },
  { id: "section-2", caption: "Section 2", expanded: false },
  { id: "section-3", caption: "Section 3", expanded: false }
];

const ACTION_GROUP_MODEL = [
  { caption: "Copy" },
  { caption: "Paste" },
  { caption: "Cut" }
];

const ACTION_LIST_MODEL = [
  { id: "item-1", caption: "First item", type: "actionable" as const },
  { id: "item-2", caption: "Second item", type: "actionable" as const },
  { type: "separator" as const },
  { id: "item-3", caption: "Third item", type: "actionable" as const }
];

const ACTION_MENU_MODEL = [
  { caption: "Edit" },
  { caption: "Duplicate" },
  { type: "separator" as const },
  { caption: "Delete" }
];

const COMBO_BOX_MODEL = [
  { value: "opt-1", caption: "Option 1" },
  { value: "opt-2", caption: "Option 2" },
  { value: "opt-3", caption: "Option 3" }
];

const TAB_MODEL = [
  { id: "tab-1", name: "Overview" },
  { id: "tab-2", name: "Details" },
  { id: "tab-3", name: "Settings" }
];

const RADIO_GROUP_MODEL = [
  { id: "s", caption: "Small" },
  { id: "m", caption: "Medium" },
  { id: "l", caption: "Large" }
];

const SEGMENTED_CONTROL_MODEL = [
  { id: "day",   caption: "Day"   },
  { id: "week",  caption: "Week"  },
  { id: "month", caption: "Month" }
];

const NAVIGATION_LIST_MODEL = [
  {
    id: "home",
    caption: "Home",
    link: { url: "/" }
  },
  {
    id: "components",
    caption: "Components",
    expanded: true,
    items: [
      { id: "checkbox", caption: "Checkbox", link: { url: "/components/checkbox" } },
      { id: "switch",   caption: "Switch",   link: { url: "/components/switch"   } }
    ]
  }
];

const BREADCRUMB_MODEL = [
  { id: "home",       caption: "Home",       link: { url: "/" } },
  { id: "components", caption: "Components", link: { url: "/components" } },
  { id: "breadcrumb", caption: "Breadcrumb" }
];

const TABULAR_GRID_MODEL = {
  columns: [
    { id: "name",  caption: "Name"  },
    { id: "email", caption: "Email" },
    { id: "role",  caption: "Role"  }
  ]
};

const LAYOUT_SPLITTER_MODEL = {
  id: "root" as const,
  direction: "columns" as const,
  items: [
    { id: "panel-a", size: "1fr" as const },
    { id: "panel-b", size: "1fr" as const }
  ]
};

// ---- Shared registry for all component examples ----

export const chameleonExamplesRegistry: ComponentRegistry = {
  // ---- Form ----
  ChCheckbox: ({ element }) =>
    html`<ch-checkbox caption=${(element.props as any).caption ?? ""}></ch-checkbox>`,

  ChEdit: ({ element }) =>
    html`<ch-edit
      placeholder=${(element.props as any).placeholder ?? ""}
      type=${(element.props as any).type ?? "text"}
      ?multiline=${(element.props as any).multiline ?? false}
      ?disabled=${(element.props as any).disabled ?? false}
      ?readonly=${(element.props as any).readonly ?? false}
    ></ch-edit>`,

  ChComboBox: () =>
    html`<ch-combo-box-render .model=${COMBO_BOX_MODEL} value="opt-1"></ch-combo-box-render>`,

  ChSwitch: ({ element }) =>
    html`<ch-switch caption=${(element.props as any).caption ?? ""}></ch-switch>`,

  ChSlider: () =>
    html`<ch-slider value="40" min="0" max="100"></ch-slider>`,

  ChRadioGroup: () =>
    html`<ch-radio-group-render .model=${RADIO_GROUP_MODEL} value="m"></ch-radio-group-render>`,

  // ---- Data ----
  ChCode: () =>
    html`<ch-code language="javascript" .value=${'console.log("Hello, Chameleon!");'}></ch-code>`,

  ChMathViewer: () =>
    html`<ch-math-viewer value="E = mc^2"></ch-math-viewer>`,

  ChStatus: () =>
    html`<ch-status accessible-name="Loading content"></ch-status>`,

  ChImage: () =>
    html`<ch-image style="width: 160px; height: 90px; display: block;"></ch-image>`,

  ChQr: ({ element }) =>
    html`<ch-qr value=${(element.props as any).value ?? ""} size=${(element.props as any).size ?? 128}></ch-qr>`,

  ChTextblockText: () =>
    html`<ch-textblock caption="Hello, world!"></ch-textblock>`,

  ChTextblockHtml: () =>
    html`<ch-textblock format="HTML">Welcome to <strong>Chameleon</strong>!</ch-textblock>`,

  ChProgressDeterminate: () =>
    html`<ch-progress value="65" accessible-name="Loading…"></ch-progress>`,

  ChProgressIndeterminate: () =>
    html`<ch-progress ?indeterminate=${true} accessible-name="Loading…"></ch-progress>`,

  ChTabularGrid: () =>
    html`<ch-tabular-grid-render .model=${TABULAR_GRID_MODEL}></ch-tabular-grid-render>`,

  // ---- Layout ----
  ChAccordion: () =>
    html`<ch-accordion-render .model=${ACCORDION_MODEL}>
      <div slot="section-1" style="padding: 12px; font-size: 13px;">Content for Section 1</div>
      <div slot="section-2" style="padding: 12px; font-size: 13px;">Content for Section 2</div>
      <div slot="section-3" style="padding: 12px; font-size: 13px;">Content for Section 3</div>
    </ch-accordion-render>`,

  ChLayoutSplitter: () =>
    html`<div style="height: 140px;">
      <ch-layout-splitter .model=${LAYOUT_SPLITTER_MODEL}>
        <div slot="panel-a" style="padding: 12px; font-size: 13px;">Panel A</div>
        <div slot="panel-b" style="padding: 12px; font-size: 13px;">Panel B</div>
      </ch-layout-splitter>
    </div>`,

  ChPopover: () =>
    html`<div style="position: relative; padding: 40px; text-align: center;">
      <button id="popover-trigger" style="padding: 6px 12px; font-size: 13px;">Toggle Popover</button>
      <ch-popover style="padding: 12px; font-size: 13px; border: 1px solid #e5e7eb; border-radius: 6px; background: white;">
        Popover content
      </ch-popover>
    </div>`,

  ChSidebar: () =>
    html`<div style="display: flex; height: 160px; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden;">
      <ch-sidebar show-expand-button style="border-inline-end: 1px solid #e5e7eb;">
        <nav style="padding: 8px; font-size: 13px;">Navigation links</nav>
      </ch-sidebar>
      <main style="padding: 16px; flex: 1; font-size: 13px;">Page content</main>
    </div>`,

  ChTab: () =>
    html`<ch-tab-render .model=${TAB_MODEL} selected-id="tab-1" style="height: 160px;">
      <div slot="tab-1" style="padding: 12px; font-size: 13px;">Overview content</div>
      <div slot="tab-2" style="padding: 12px; font-size: 13px;">Details content</div>
      <div slot="tab-3" style="padding: 12px; font-size: 13px;">Settings content</div>
    </ch-tab-render>`,

  // ---- Navigation ----
  ChActionGroup: () =>
    html`<ch-action-group-render .model=${ACTION_GROUP_MODEL}></ch-action-group-render>`,

  ChActionList: () =>
    html`<ch-action-list-render .model=${ACTION_LIST_MODEL}></ch-action-list-render>`,

  ChActionMenu: () =>
    html`<ch-action-menu-render .model=${ACTION_MENU_MODEL} button-accessible-name="Actions"></ch-action-menu-render>`,
  ChNavigationList: () =>
    html`<ch-navigation-list-render .model=${NAVIGATION_LIST_MODEL}></ch-navigation-list-render>`,

  ChSegmentedControl: () =>
    html`<ch-segmented-control-render .model=${SEGMENTED_CONTROL_MODEL} selected-id="week"></ch-segmented-control-render>`,

  ChBreadcrumb: () =>
    html`<ch-breadcrumb-render .model=${BREADCRUMB_MODEL}></ch-breadcrumb-render>`,

  // ---- AI / Real-time ----
  ChChat: () =>
    html`<div style="height: 320px; display: block;">
      <ch-chat></ch-chat>
    </div>`,

  ChMarkdownViewer: () =>
    html`<ch-markdown-viewer value=${"# Hello\n\nThis is **markdown** rendered by `ch-markdown-viewer`.\n\n- Item 1\n- Item 2\n- Item 3"}></ch-markdown-viewer>`,

  ChSmartGrid: () =>
    html`<div style="height: 200px; display: block;">
      <ch-smart-grid></ch-smart-grid>
    </div>`,

  ChLiveKitRoom: () =>
    html`<div style="font-size: 13px; color: #374151; padding: 16px; border: 1px solid #e5e7eb; border-radius: 6px;">
      <p style="margin: 0 0 8px; font-weight: 600;">ch-live-kit-room</p>
      <p style="margin: 0;">Connects to a LiveKit room for real-time audio. Provide <code>url</code> and <code>token</code> props to establish a connection.</p>
    </div>`,

  // ---- Theming ----
  ChTheme: () =>
    html`<div style="font-size: 13px; color: #374151; line-height: 1.6;">
      <p style="margin: 0 0 12px;">The Mercury theme styles all Chameleon components. For example:</p>
      <ch-checkbox caption="Checkbox with Mercury styles"></ch-checkbox>
    </div>`
};

// ---- Example type ----

export type ExampleDef = {
  title: string;
  description?: string;
  spec: Spec;
  code: string;
  language?: "html" | "typescript"; // default: "html"
};

// ---- Component examples map ----

export const componentExamples: Partial<Record<string, ExampleDef[]>> = {
  // ---- Form ----
  "ch-checkbox": [
    {
      title: "Basic checkbox",
      description: "A simple checkbox with a visible label.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChCheckbox", props: { caption: "Accept terms and conditions" }, children: [] }
        }
      },
      code: `<ch-checkbox caption="Accept terms and conditions"></ch-checkbox>`
    }
  ],
  "ch-edit": [
    {
      title: "Text input",
      description: "A basic single-line text field.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChEdit", props: { placeholder: "Type here..." }, children: [] }
        }
      },
      code: `<ch-edit placeholder="Type here..."></ch-edit>`
    },
    {
      title: "Password input",
      description: "A password field with a toggle button to reveal the value.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChEdit", props: { type: "password", placeholder: "Enter password" }, children: [] }
        }
      },
      code: `<ch-edit type="password" show-password-button placeholder="Enter password"></ch-edit>`
    },
    {
      title: "Multiline (textarea)",
      description: "A multiline text area for longer content.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChEdit", props: { multiline: true, placeholder: "Write something..." }, children: [] }
        }
      },
      code: `<ch-edit multiline placeholder="Write something..."></ch-edit>`
    },
    {
      title: "Search input",
      description: "A search field with a clear button when a value is present.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChEdit", props: { type: "search", placeholder: "Search..." }, children: [] }
        }
      },
      code: `<ch-edit type="search" placeholder="Search..."></ch-edit>`
    },
    {
      title: "Disabled input",
      description: "A disabled text field that cannot be edited.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChEdit", props: { disabled: true, placeholder: "Disabled" }, children: [] }
        }
      },
      code: `<ch-edit disabled placeholder="Disabled"></ch-edit>`
    }
  ],
  "ch-combo-box-render": [
    {
      title: "Combo box",
      description: "A dropdown list for selecting a value from a set of options.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChComboBox", props: {}, children: [] }
        }
      },
      language: "typescript",
      code:
`import type { ComboBoxModel } from "@genexus/chameleon-controls-library-lit";

const model: ComboBoxModel = [
  { value: "opt-1", caption: "Option 1" },
  { value: "opt-2", caption: "Option 2" },
  { value: "opt-3", caption: "Option 3" }
];

// In your template:
// <ch-combo-box-render .model=\${model} value="opt-1"></ch-combo-box-render>`
    }
  ],
  "ch-radio-group-render": [
    {
      title: "Radio group",
      description: "A group of radio buttons driven by a model array.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChRadioGroup", props: {}, children: [] }
        }
      },
      language: "typescript",
      code:
`import type { RadioGroupModel } from "@genexus/chameleon-controls-library-lit";

const model: RadioGroupModel = [
  { id: "s", caption: "Small" },
  { id: "m", caption: "Medium" },
  { id: "l", caption: "Large" }
];

// In your template:
// <ch-radio-group-render .model=\${model} value="m"></ch-radio-group-render>`
    }
  ],
  "ch-slider": [
    {
      title: "Horizontal slider",
      description: "A range slider from 0 to 100.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChSlider", props: {}, children: [] }
        }
      },
      code: `<ch-slider value="40" min="0" max="100"></ch-slider>`
    }
  ],
  "ch-switch": [
    {
      title: "Toggle switch",
      description: "An on/off toggle with a label.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChSwitch", props: { caption: "Enable notifications" }, children: [] }
        }
      },
      code: `<ch-switch caption="Enable notifications"></ch-switch>`
    }
  ],

  // ---- Data ----
  "ch-code": [
    {
      title: "Syntax-highlighted snippet",
      description: "Renders a code block with syntax highlighting.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChCode", props: {}, children: [] }
        }
      },
      code: `<ch-code language="javascript" .value=${'console.log("Hello, Chameleon!");'}></ch-code>`
    }
  ],
  "ch-image": [
    {
      title: "Basic image",
      description:
        "ch-image resolves paths through a configurable callback. Use .src and .getImagePathCallback for full control over asset resolution.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChImage", props: {}, children: [] }
        }
      },
      language: "typescript",
      code:
`// In your Lit template:
// <ch-image .src=\${"https://picsum.photos/320/180"} type="img"></ch-image>`
    }
  ],
  "ch-math-viewer": [
    {
      title: "Math expression",
      description: "Renders a LaTeX math expression using KaTeX.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChMathViewer", props: {}, children: [] }
        }
      },
      code: `<ch-math-viewer value="E = mc^2"></ch-math-viewer>`
    }
  ],
  "ch-qr": [
    {
      title: "QR code",
      description: "Generates a QR code for a URL.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChQr", props: { value: "https://chameleon.genexus.com", size: 160 }, children: [] }
        }
      },
      code: `<ch-qr value="https://chameleon.genexus.com" size="160"></ch-qr>`
    }
  ],
  "ch-status": [
    {
      title: "Status indicator",
      description: "A visual loading/status indicator.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChStatus", props: {}, children: [] }
        }
      },
      code: `<ch-status accessible-name="Loading content"></ch-status>`
    }
  ],
  "ch-textblock": [
    {
      title: "Plain text",
      description: "Renders a single-line text label.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChTextblockText", props: {}, children: [] }
        }
      },
      code: `<ch-textblock caption="Hello, world!"></ch-textblock>`
    },
    {
      title: "HTML content",
      description: "Renders rich HTML content via the default slot.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChTextblockHtml", props: {}, children: [] }
        }
      },
      code: `<ch-textblock format="HTML">Welcome to <strong>Chameleon</strong>!</ch-textblock>`
    }
  ],
  "ch-progress": [
    {
      title: "Determinate progress",
      description: "A progress bar showing 65% completion.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChProgressDeterminate", props: {}, children: [] }
        }
      },
      code: `<ch-progress value="65" accessible-name="Loading…"></ch-progress>`
    },
    {
      title: "Indeterminate progress",
      description: "An animated progress bar for unknown duration.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChProgressIndeterminate", props: {}, children: [] }
        }
      },
      code: `<ch-progress indeterminate accessible-name="Loading…"></ch-progress>`
    }
  ],
  "ch-tabular-grid-render": [
    {
      title: "Column definition",
      description: "Define columns via a model.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChTabularGrid", props: {}, children: [] }
        }
      },
      language: "typescript",
      code:
`import type { TabularGridModel } from "@genexus/chameleon-controls-library-lit";

const model: TabularGridModel = {
  columns: [
    { id: "name",  caption: "Name"  },
    { id: "email", caption: "Email" },
    { id: "role",  caption: "Role"  }
  ]
};

// In your template:
// <ch-tabular-grid-render .model=\${model}></ch-tabular-grid-render>`
    }
  ],

  // ---- Layout ----
  "ch-accordion-render": [
    {
      title: "Collapsible sections",
      description: "A vertical stack of panels that expand and collapse independently.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChAccordion", props: {}, children: [] }
        }
      },
      language: "typescript",
      code:
`import type { AccordionModel } from "@genexus/chameleon-controls-library-lit";

const model: AccordionModel = [
  { id: "section-1", caption: "Section 1", expanded: true },
  { id: "section-2", caption: "Section 2", expanded: false },
  { id: "section-3", caption: "Section 3", expanded: false }
];

// In your template:
// <ch-accordion-render .model=\${model}>
//   <div slot="section-1">Content for Section 1</div>
//   <div slot="section-2">Content for Section 2</div>
//   <div slot="section-3">Content for Section 3</div>
// </ch-accordion-render>`
    }
  ],
  "ch-layout-splitter": [
    {
      title: "Two-panel splitter",
      description: "A resizable layout with two side-by-side panels.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChLayoutSplitter", props: {}, children: [] }
        }
      },
      language: "typescript",
      code:
`import type { LayoutSplitterModel } from "@genexus/chameleon-controls-library-lit";

const layout: LayoutSplitterModel = {
  id: "root",
  direction: "columns",
  items: [
    { id: "sidebar", size: "240px", minSize: "160px" },
    { id: "main",    size: "1fr" }
  ]
};

// In your template:
// <ch-layout-splitter .model=\${layout}>
//   <div slot="sidebar">Sidebar content</div>
//   <div slot="main">Main content</div>
// </ch-layout-splitter>`
    }
  ],
  "ch-popover": [
    {
      title: "Anchored popover",
      description: "A floating container that positions itself relative to an anchor element.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChPopover", props: {}, children: [] }
        }
      },
      language: "typescript",
      code:
`// The popover anchors to an element and positions itself automatically.
// <button id="trigger">Open</button>
// <ch-popover .actionElement=\${triggerRef} block-align="outside-end" inline-align="center">
//   Popover content here
// </ch-popover>`
    }
  ],
  "ch-sidebar": [
    {
      title: "Collapsible sidebar",
      description:
        "ch-sidebar is the collapsible panel itself. Place it alongside your main content. Use show-expand-button to render the expand/collapse toggle.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChSidebar", props: {}, children: [] }
        }
      },
      code:
`<div style="display: flex; block-size: 400px;">
  <ch-sidebar show-expand-button>
    <nav>Navigation links here</nav>
  </ch-sidebar>
  <main style="padding: 16px;">Page content here</main>
</div>`
    }
  ],

  "ch-tab-render": [
    {
      title: "Tab panel",
      description: "A tabbed interface for switching between content panels.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChTab", props: {}, children: [] }
        }
      },
      language: "typescript",
      code:
`import type { TabModel } from "@genexus/chameleon-controls-library-lit";

const model: TabModel = [
  { id: "tab-1", name: "Overview" },
  { id: "tab-2", name: "Details" },
  { id: "tab-3", name: "Settings" }
];

// In your template:
// <ch-tab-render .model=\${model} selected-id="tab-1">
//   <div slot="tab-1">Overview content</div>
//   <div slot="tab-2">Details content</div>
//   <div slot="tab-3">Settings content</div>
// </ch-tab-render>`
    }
  ],

  // ---- Navigation ----
  "ch-action-group-render": [
    {
      title: "Action group",
      description: "A horizontal group of action buttons with optional overflow handling.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChActionGroup", props: {}, children: [] }
        }
      },
      language: "typescript",
      code:
`import type { ActionGroupModel } from "@genexus/chameleon-controls-library-lit";

const model: ActionGroupModel = [
  { caption: "Copy" },
  { caption: "Paste" },
  { caption: "Cut" }
];

// In your template:
// <ch-action-group-render .model=\${model}></ch-action-group-render>`
    }
  ],
  "ch-action-list-render": [
    {
      title: "Action list",
      description: "A vertical list of actionable items with optional grouping and selection.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChActionList", props: {}, children: [] }
        }
      },
      language: "typescript",
      code:
`import type { ActionListModel } from "@genexus/chameleon-controls-library-lit";

const model: ActionListModel = [
  { id: "item-1", caption: "First item", type: "actionable" },
  { id: "item-2", caption: "Second item", type: "actionable" },
  { type: "separator" },
  { id: "item-3", caption: "Third item", type: "actionable" }
];

// In your template:
// <ch-action-list-render .model=\${model}></ch-action-list-render>`
    }
  ],
  "ch-action-menu-render": [
    {
      title: "Action menu",
      description: "A dropdown menu triggered by a button, displaying a list of actions.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChActionMenu", props: {}, children: [] }
        }
      },
      language: "typescript",
      code:
`import type { ActionMenuModel } from "@genexus/chameleon-controls-library-lit";

const model: ActionMenuModel = [
  { caption: "Edit" },
  { caption: "Duplicate" },
  { type: "separator" },
  { caption: "Delete" }
];

// In your template:
// <ch-action-menu-render .model=\${model} button-accessible-name="Actions"></ch-action-menu-render>`
    }
  ],
  "ch-navigation-list-render": [
    {
      title: "Navigation list",
      description: "A hierarchical navigation list with nested items.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChNavigationList", props: {}, children: [] }
        }
      },
      language: "typescript",
      code:
`import type { NavigationListModel } from "@genexus/chameleon-controls-library-lit";

const model: NavigationListModel = [
  {
    id: "home",
    caption: "Home",
    link: { url: "/" }
  },
  {
    id: "components",
    caption: "Components",
    expanded: true,
    items: [
      { id: "checkbox", caption: "Checkbox", link: { url: "/components/checkbox" } },
      { id: "switch",   caption: "Switch",   link: { url: "/components/switch"   } }
    ]
  }
];

// In your template:
// <ch-navigation-list-render .model=\${model}></ch-navigation-list-render>`
    }
  ],
  "ch-segmented-control-render": [
    {
      title: "Segmented control",
      description: "A button group for mutually exclusive choices.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChSegmentedControl", props: {}, children: [] }
        }
      },
      language: "typescript",
      code:
`import type { SegmentedControlModel } from "@genexus/chameleon-controls-library-lit";

const model: SegmentedControlModel = [
  { id: "day",   caption: "Day"   },
  { id: "week",  caption: "Week"  },
  { id: "month", caption: "Month" }
];

// In your template:
// <ch-segmented-control-render .model=\${model} selected-id="week"></ch-segmented-control-render>`
    }
  ],
  "ch-breadcrumb-render": [
    {
      title: "Breadcrumb trail",
      description: "A navigation breadcrumb with three levels.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChBreadcrumb", props: {}, children: [] }
        }
      },
      language: "typescript",
      code:
`import type { BreadCrumbModel } from "@genexus/chameleon-controls-library-lit";

const model: BreadCrumbModel = [
  { id: "home",       caption: "Home",       link: { url: "/" } },
  { id: "components", caption: "Components", link: { url: "/components" } },
  { id: "breadcrumb", caption: "Breadcrumb" }
];

// In your template:
// <ch-breadcrumb-render .model=\${model}></ch-breadcrumb-render>`
    }
  ],

  // ---- AI / Real-time ----
  "ch-chat": [
    {
      title: "Basic chat",
      description: "A conversational AI chat interface with virtual scrolling and markdown rendering.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChChat", props: {}, children: [] }
        }
      },
      language: "typescript",
      code:
`import type { ChatMessage, ChatTranslations } from "@genexus/chameleon-controls-library-lit";

const items: ChatMessage[] = [
  { id: "1", role: "user",      content: "Hello!" },
  { id: "2", role: "assistant", content: "Hi! How can I help you today?" }
];

// In your template:
// <ch-chat .items=\${items}></ch-chat>`
    }
  ],
  "ch-markdown-viewer": [
    {
      title: "Markdown rendering",
      description: "Renders a Markdown string with GFM support (tables, code blocks, math, etc.).",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChMarkdownViewer", props: {}, children: [] }
        }
      },
      language: "typescript",
      code:
`// In your template:
// <ch-markdown-viewer .value=\${markdownString}></ch-markdown-viewer>

const markdownString = \`
# Hello

This is **markdown** rendered by \\\`ch-markdown-viewer\\\`.

- Item 1
- Item 2
- Item 3
\`;`
    }
  ],
  "ch-smart-grid": [
    {
      title: "Virtualized grid",
      description: "A high-performance virtualized grid with infinite scroll support.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChSmartGrid", props: {}, children: [] }
        }
      },
      language: "typescript",
      code:
`// ch-smart-grid works with ch-virtual-scroller to render large datasets efficiently.
// Use the virtualItemsChanged event to update the visible slice.

// In your template:
// <ch-smart-grid>
//   <ch-virtual-scroller slot="grid-content" .items=\${allItems}
//     @virtualItemsChanged=\${onVirtualItemsChanged}>
//     \${visibleItems.map(item => html\`
//       <ch-smart-grid-cell cell-id=\${item.id}>
//         <!-- item content -->
//       </ch-smart-grid-cell>
//     \`)}
//   </ch-virtual-scroller>
// </ch-smart-grid>`
    }
  ],
  "ch-live-kit-room": [
    {
      title: "LiveKit room",
      description: "Connects to a LiveKit room for real-time audio communication.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChLiveKitRoom", props: {}, children: [] }
        }
      },
      language: "typescript",
      code:
`// In your template:
// <ch-live-kit-room
//   url="wss://your-livekit-server.io"
//   .token=\${participantToken}
//   microphone-enabled
//   @liveKitCallbacks=\${handleCallbacks}
// ></ch-live-kit-room>`
    }
  ],

  // ---- Theming ----
  "ch-theme": [
    {
      title: "Apply the Mercury theme",
      description:
        "Load the Mercury design-system stylesheet and apply it to all Chameleon components in the page.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChTheme", props: {}, children: [] }
        }
      },
      language: "typescript",
      code:
`import type { ThemeModel } from "@genexus/chameleon-controls-library-lit";

const bundles: ThemeModel = [
  {
    name: "Mercury",
    url: "https://unpkg.com/@genexus/mercury@0.26.0/dist/bundles/css/all.css"
  }
];

// In your template (add once near the root):
// <ch-theme .bundles=\${bundles} avoid-flash-of-unstyled-content></ch-theme>`
    }
  ]
};
