import type { Spec } from "@json-render/core";
import type { ComponentRegistry } from "../../src/components/json-render/types";
import { html } from "lit";

// Component imports (side effects — register custom elements)
import "../../src/components/checkbox/checkbox.lit";
import "../../src/components/radio-group/radio-group-render.lit";
import "../../src/components/slider/slider.lit";
import "../../src/components/switch/switch.lit";
import "../../src/components/code/code.lit";
import "../../src/components/image/image.lit";
import "../../src/components/qr/qr.lit";
import "../../src/components/textblock/textblock.lit";
import "../../src/components/progress/progress.lit";
import "../../src/components/tabular-grid/tabular-grid-render.lit";
import "../../src/components/layout-splitter/layout-splitter.lit";
import "../../src/components/sidebar/sidebar.lit";
import "../../src/components/navigation-list/navigation-list-render.lit";
import "../../src/components/segmented-control/segmented-control-render.lit";
import "../../src/components/breadcrumb/breadcrumb-render.lit";
import "../../src/components/theme/theme.lit";

// ---- Models for complex components ----

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

  ChSwitch: ({ element }) =>
    html`<ch-switch caption=${(element.props as any).caption ?? ""}></ch-switch>`,

  ChSlider: () =>
    html`<ch-slider value="40" min="0" max="100"></ch-slider>`,

  ChRadioGroup: () =>
    html`<ch-radio-group-render .model=${RADIO_GROUP_MODEL} value="m"></ch-radio-group-render>`,

  // ---- Data ----
  ChCode: () =>
    html`<ch-code language="javascript" .value=${'console.log("Hello, Chameleon!");'}></ch-code>`,

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
  ChLayoutSplitter: () =>
    html`<div style="height: 140px;">
      <ch-layout-splitter .model=${LAYOUT_SPLITTER_MODEL}>
        <div slot="panel-a" style="padding: 12px; font-size: 13px;">Panel A</div>
        <div slot="panel-b" style="padding: 12px; font-size: 13px;">Panel B</div>
      </ch-layout-splitter>
    </div>`,

  ChSidebar: () =>
    html`<div style="display: flex; height: 160px; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden;">
      <ch-sidebar show-expand-button style="border-inline-end: 1px solid #e5e7eb;">
        <nav style="padding: 8px; font-size: 13px;">Navigation links</nav>
      </ch-sidebar>
      <main style="padding: 16px; flex: 1; font-size: 13px;">Page content</main>
    </div>`,

  // ---- Navigation ----
  ChNavigationList: () =>
    html`<ch-navigation-list-render .model=${NAVIGATION_LIST_MODEL}></ch-navigation-list-render>`,

  ChSegmentedControl: () =>
    html`<ch-segmented-control-render .model=${SEGMENTED_CONTROL_MODEL} selected-id="week"></ch-segmented-control-render>`,

  ChBreadcrumb: () =>
    html`<ch-breadcrumb-render .model=${BREADCRUMB_MODEL}></ch-breadcrumb-render>`,

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

  // ---- Navigation ----
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
