import type { Spec } from "@json-render/core";
import { html, type TemplateResult } from "lit";
import { ref } from "lit/directives/ref.js";
import type { ComponentRegistry } from "../../src/components/json-render/types";
import type { ChNavigationListRender } from "../../src/components/navigation-list/navigation-list-render.lit";
import type {
  NavigationListCustomRender,
  NavigationListItemModel,
  NavigationListModel
} from "../../src/components/navigation-list/types";

// Component imports (side effects — register custom elements)
import "../../src/components/accordion/accordion.lit";
import "../../src/components/action-group/action-group-render.lit";
import "../../src/components/action-list/action-list-render.lit";
import "../../src/components/action-menu/action-menu-render.lit";
import "../../src/components/breadcrumb/breadcrumb-render.lit";
import "../../src/components/chat/chat.lit";
import "../../src/components/checkbox/checkbox.lit";
import "../../src/components/code/code.lit";
import "../../src/components/combo-box/combo-box.lit";
import "../../src/components/custom-render/custom-render.lit";
import "../../src/components/edit/edit.lit";
import "../../src/components/image/image.lit";
import "../../src/components/layout-splitter/layout-splitter.lit";
import "../../src/components/live-kit-room/live-kit-room.lit";
import "../../src/components/markdown-viewer/markdown-viewer.lit";
import "../../src/components/math-viewer/math-viewer.lit";
import "../../src/components/navigation-list/navigation-list-render.lit";
import "../../src/components/popover/popover.lit";
import "../../src/components/progress/progress.lit";
import "../../src/components/qr/qr.lit";
import "../../src/components/radio-group/radio-group-render.lit";
import "../../src/components/segmented-control/segmented-control-render.lit";
import "../../src/components/sidebar/sidebar.lit";
import "../../src/components/slider/slider.lit";
import "../../src/components/smart-grid/smart-grid.lit";
import "../../src/components/status/status.lit";
import "../../src/components/switch/switch.lit";
import "../../src/components/tab/tab.lit";
import "../../src/components/tabular-grid/tabular-grid-render.lit";
import "../../src/components/textblock/textblock.lit";
import "../../src/components/theme/theme.lit";

// ---- Models for complex components ----

const ACCORDION_MODEL = [
  { id: "section-1", caption: "Section 1", expanded: true },
  { id: "section-2", caption: "Section 2", expanded: false },
  { id: "section-3", caption: "Section 3", expanded: false }
];

const ACTION_GROUP_MODEL = [{ caption: "Copy" }, { caption: "Paste" }, { caption: "Cut" }];

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
  { id: "day", caption: "Day" },
  { id: "week", caption: "Week" },
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
      { id: "switch", caption: "Switch", link: { url: "/components/switch" } }
    ]
  }
];

// ---- Console-style navigation list (icons + status badge via custom render) ----

// Inline SVG icons (Lucide-inspired, monochrome, stroke-based) keyed by id
const consoleIcon = (path: TemplateResult) => html`
  <svg
    class="console-nav-icon"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    ${path}
  </svg>
`;

const CONSOLE_ICONS: Record<string, TemplateResult> = {
  chat: consoleIcon(
    html`<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>`
  ),
  inbox: consoleIcon(html`
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
    <path
      d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
    ></path>
  `),
  "scheduled-tasks": consoleIcon(html`
    <circle cx="12" cy="12" r="9"></circle>
    <polyline points="12 7 12 12 15 14"></polyline>
  `),
  agents: consoleIcon(html`
    <path
      d="M20 7h-4V4a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM10 5h4v2h-4z"
    ></path>
  `),
  integrations: consoleIcon(
    html`<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>`
  ),
  skills: consoleIcon(html`
    <rect x="3" y="3" width="7" height="7" rx="1"></rect>
    <rect x="14" y="3" width="7" height="7" rx="1"></rect>
    <rect x="3" y="14" width="7" height="7" rx="1"></rect>
    <rect x="14" y="14" width="7" height="7" rx="1"></rect>
  `),
  endpoints: consoleIcon(html`
    <circle cx="12" cy="12" r="9"></circle>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"></path>
  `),
  analytics: consoleIcon(html`
    <line x1="6" y1="20" x2="6" y2="12"></line>
    <line x1="12" y1="20" x2="12" y2="6"></line>
    <line x1="18" y1="20" x2="18" y2="14"></line>
  `),
  "session-activity": consoleIcon(
    html`<polyline points="3 12 6 12 9 4 15 20 18 12 21 12"></polyline>`
  ),
  traces: consoleIcon(html`
    <circle cx="6" cy="6" r="2.5"></circle>
    <circle cx="6" cy="18" r="2.5"></circle>
    <circle cx="18" cy="12" r="2.5"></circle>
    <path d="M8 8c2 4 6 4 8 4"></path>
    <path d="M8 16c2-4 6-4 8-4"></path>
  `),
  health: consoleIcon(html`<polyline points="3 12 7 12 10 5 14 19 17 12 21 12"></polyline>`),
  alerts: consoleIcon(html`
    <path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2v1h16v-1z"></path>
    <path d="M10 21a2 2 0 0 0 4 0"></path>
  `),
  memory: consoleIcon(html`
    <circle cx="12" cy="12" r="3"></circle>
    <circle cx="12" cy="4.5" r="1.5"></circle>
    <circle cx="12" cy="19.5" r="1.5"></circle>
    <circle cx="5.5" cy="8" r="1.5"></circle>
    <circle cx="18.5" cy="8" r="1.5"></circle>
    <circle cx="5.5" cy="16" r="1.5"></circle>
    <circle cx="18.5" cy="16" r="1.5"></circle>
    <line x1="12" y1="6" x2="12" y2="9"></line>
    <line x1="12" y1="15" x2="12" y2="18"></line>
    <line x1="7" y1="9" x2="9.5" y2="10.5"></line>
    <line x1="17" y1="9" x2="14.5" y2="10.5"></line>
    <line x1="7" y1="15" x2="9.5" y2="13.5"></line>
    <line x1="17" y1="15" x2="14.5" y2="13.5"></line>
  `),
  solutions: consoleIcon(html`
    <circle cx="12" cy="12" r="9"></circle>
    <line x1="5" y1="5" x2="19" y2="19"></line>
  `),
  taxonomies: consoleIcon(html`
    <path d="M20.59 13.41l-7.18 7.18a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83z"></path>
    <line x1="7" y1="7" x2="7.01" y2="7"></line>
  `)
};

type ConsoleBadge = "BETA" | "EXP" | "Soon";

const CONSOLE_BADGES: Record<string, ConsoleBadge> = {
  chat: "BETA",
  inbox: "EXP",
  "scheduled-tasks": "EXP",
  agents: "EXP",
  integrations: "EXP",
  skills: "EXP",
  analytics: "BETA",
  traces: "BETA",
  alerts: "BETA",
  memory: "EXP",
  solutions: "Soon",
  taxonomies: "Soon"
};

const NAVIGATION_LIST_CONSOLE_MODEL: NavigationListModel = [
  { id: "chat", caption: "Chat", link: { url: "#chat" } },
  { id: "inbox", caption: "Inbox", link: { url: "#inbox" } },
  { id: "scheduled-tasks", caption: "Scheduled Tasks", link: { url: "#scheduled-tasks" } },
  { id: "agents", caption: "Agents", link: { url: "#agents" } },
  { id: "integrations", caption: "Integrations", link: { url: "#integrations" } },
  { id: "skills", caption: "Skills", link: { url: "#skills" } },
  { id: "endpoints", caption: "Endpoints", link: { url: "#endpoints" } },
  { id: "analytics", caption: "Analytics", link: { url: "#analytics" } },
  { id: "session-activity", caption: "Session Activity", link: { url: "#session-activity" } },
  { id: "traces", caption: "Traces", link: { url: "#traces" } },
  { id: "health", caption: "Health", link: { url: "#health" } },
  { id: "alerts", caption: "Alerts", link: { url: "#alerts" } },
  { id: "memory", caption: "Memory", link: { url: "#memory" } },
  { id: "solutions", caption: "Solutions", link: { url: "#solutions" }, disabled: true },
  { id: "taxonomies", caption: "Taxonomies", link: { url: "#taxonomies" }, disabled: true }
];

// ch-custom-render places `content` into its own shadow root, so styles for
// the icon/caption/badge layout must be included inside the rendered content
// (light-DOM CSS cannot pierce that shadow tree).
const consoleItemStyles = `
    .row {
      display: flex;
      align-items: center;
      gap: 10px;
      inline-size: 100%;
      min-inline-size: 0;
    }
    .icon { flex-shrink: 0; display: inline-flex; }
    .caption {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .badge {
      flex-shrink: 0;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.04em;
      padding: 2px 6px;
      border-radius: 4px;
      line-height: 1;
    }
    .badge--beta { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .badge--exp  { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
    .badge--soon { background: rgba(120, 130, 150, 0.18); color: #8a93a6; }`;

// Stylesheet adopted directly into ch-navigation-list-render's shadow root so
// it can target the action `::part` (which is exported by ch-navigation-list-
// item to its parent's shadow but is not reachable from outside the render).
const consoleNavSheet = (() => {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(`
    ::part(item__action) {
      padding-block: 6px;
      padding-inline: 12px;
      block-size: 32px;
      box-sizing: border-box;
      color: #b9c0cc;
      text-decoration: none;
      border-radius: 6px;
      margin-block-end: 2px;
      cursor: pointer;
      background: transparent;
    }
    ::part(item__action):hover {
      background: rgba(255, 255, 255, 0.04);
      color: #e2e6ee;
    }
    ::part(item__action selected) {
      background: #1c2230;
      color: #f3f5f9;
    }
    ::part(item__action selected):hover {
      background: #1c2230;
      color: #f3f5f9;
    }
    ::part(item__action disabled) {
      background: transparent;
      color: #5a6072;
      cursor: not-allowed;
    }
    ::part(item__action disabled):hover {
      background: transparent;
      color: #5a6072;
    }
  `);
  return sheet;
})();

const attachConsoleNavStyles = (el: Element | undefined) => {
  if (!el) {
    return;
  }
  const nav = el as ChNavigationListRender;
  nav.updateComplete.then(() => {
    const root = nav.shadowRoot;
    if (root && !root.adoptedStyleSheets.includes(consoleNavSheet)) {
      root.adoptedStyleSheets = [...root.adoptedStyleSheets, consoleNavSheet];
    }
  });
};

const renderConsoleItem = (item: NavigationListItemModel) => {
  const icon = CONSOLE_ICONS[item.id];
  const badge = CONSOLE_BADGES[item.id];

  return html`
    <span class="row">
      <span class="icon">${icon ?? html``}</span>
      <span class="caption">${item.caption}</span>
      ${badge ? html`<span class=${"badge badge--" + badge.toLowerCase()}>${badge}</span>` : ""}
    </span>
  `;
};

const NAVIGATION_LIST_CONSOLE_CUSTOM_RENDERS: NavigationListCustomRender = {
  itemContent: item => ({ content: renderConsoleItem(item), stylesheet: consoleItemStyles })
};

// Light-DOM styles for the dark preview frame. Only descendants outside any
// shadow tree are reachable from here.
// ch-navigation-list-render has no intrinsic size, so we explicitly reserve
// space for it on both axes.
const NAVIGATION_LIST_CONSOLE_STYLES = html`
  <style>
    .console-nav-preview {
      background: #0b0d12;
      color: #d6dbe5;
      padding: 16px 8px;
      border-radius: 8px;
      inline-size: 240px;
      block-size: 600px;
      overflow: auto;
      font-size: 13px;
      box-sizing: border-box;
    }
    .console-nav-preview ch-navigation-list-render {
      inline-size: 100%;
      block-size: 100%;
    }
  </style>
`;

const BREADCRUMB_MODEL = [
  { id: "home", caption: "Home", link: { url: "/" } },
  { id: "components", caption: "Components", link: { url: "/components" } },
  { id: "breadcrumb", caption: "Breadcrumb" }
];

const TABULAR_GRID_MODEL = {
  columns: [
    { id: "name", caption: "Name" },
    { id: "email", caption: "Email" },
    { id: "role", caption: "Role" }
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

  ChSlider: () => html`<ch-slider value="40" min="0" max="100"></ch-slider>`,

  ChRadioGroup: () =>
    html`<ch-radio-group-render .model=${RADIO_GROUP_MODEL} value="m"></ch-radio-group-render>`,

  // ---- Data ----
  ChCode: () =>
    html`<ch-code language="javascript" .value=${'console.log("Hello, Chameleon!");'}></ch-code>`,

  ChMathViewer: () => html`<ch-math-viewer value="E = mc^2"></ch-math-viewer>`,

  ChStatus: () => html`<ch-status accessible-name="Loading content"></ch-status>`,

  ChImage: () => html`<ch-image style="width: 160px; height: 90px; display: block;"></ch-image>`,

  ChQr: ({ element }) =>
    html`<ch-qr
      value=${(element.props as any).value ?? ""}
      size=${(element.props as any).size ?? 128}
    ></ch-qr>`,

  ChTextblockText: () => html`<ch-textblock caption="Hello, world!"></ch-textblock>`,

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
      <button id="popover-trigger" style="padding: 6px 12px; font-size: 13px;">
        Toggle Popover
      </button>
      <ch-popover
        style="padding: 12px; font-size: 13px; border: 1px solid #e5e7eb; border-radius: 6px; background: white;"
      >
        Popover content
      </ch-popover>
    </div>`,

  ChSidebar: () =>
    html`<div
      style="display: flex; height: 160px; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden;"
    >
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
    html`<ch-action-menu-render
      .model=${ACTION_MENU_MODEL}
      button-accessible-name="Actions"
    ></ch-action-menu-render>`,
  ChNavigationList: () =>
    html`<ch-navigation-list-render .model=${NAVIGATION_LIST_MODEL}></ch-navigation-list-render>`,

  ChNavigationListConsole: () =>
    html`<div class="console-nav-preview">
      ${NAVIGATION_LIST_CONSOLE_STYLES}
      <ch-navigation-list-render
        ${ref(attachConsoleNavStyles)}
        .model=${NAVIGATION_LIST_CONSOLE_MODEL}
        .customRenders=${NAVIGATION_LIST_CONSOLE_CUSTOM_RENDERS}
        selected-link="scheduled-tasks"
      ></ch-navigation-list-render>
    </div>`,

  ChSegmentedControl: () =>
    html`<ch-segmented-control-render
      .model=${SEGMENTED_CONTROL_MODEL}
      selected-id="week"
    ></ch-segmented-control-render>`,

  ChBreadcrumb: () =>
    html`<ch-breadcrumb-render .model=${BREADCRUMB_MODEL}></ch-breadcrumb-render>`,

  // ---- AI / Real-time ----
  ChChat: () =>
    html`<div style="height: 320px; display: block;">
      <ch-chat></ch-chat>
    </div>`,

  ChMarkdownViewer: () =>
    html`<ch-markdown-viewer
      value=${"# Hello\n\nThis is **markdown** rendered by `ch-markdown-viewer`.\n\n- Item 1\n- Item 2\n- Item 3"}
    ></ch-markdown-viewer>`,

  ChSmartGrid: () =>
    html`<div style="height: 200px; display: block;">
      <ch-smart-grid></ch-smart-grid>
    </div>`,

  ChLiveKitRoom: () =>
    html`<div
      style="font-size: 13px; color: #374151; padding: 16px; border: 1px solid #e5e7eb; border-radius: 6px;"
    >
      <p style="margin: 0 0 8px; font-weight: 600;">ch-live-kit-room</p>
      <p style="margin: 0;">
        Connects to a LiveKit room for real-time audio. Provide <code>url</code> and
        <code>token</code> props to establish a connection.
      </p>
    </div>`,

  // ---- Theming ----
  ChTheme: () =>
    html`<div style="font-size: 13px; color: #374151; line-height: 1.6;">
      <p style="margin: 0 0 12px;">
        The Mercury theme styles all Chameleon components. For example:
      </p>
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
          root: {
            type: "ChCheckbox",
            props: { caption: "Accept terms and conditions" },
            children: []
          }
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
          root: {
            type: "ChEdit",
            props: { type: "password", placeholder: "Enter password" },
            children: []
          }
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
          root: {
            type: "ChEdit",
            props: { multiline: true, placeholder: "Write something..." },
            children: []
          }
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
          root: {
            type: "ChEdit",
            props: { type: "search", placeholder: "Search..." },
            children: []
          }
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
      code: `import type { ComboBoxModel } from "@genexus/chameleon-controls-library-lit";

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
      code: `import type { RadioGroupModel } from "@genexus/chameleon-controls-library-lit";

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
      code: `// In your Lit template:
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
          root: {
            type: "ChQr",
            props: { value: "https://chameleon.genexus.com", size: 160 },
            children: []
          }
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
      code: `import type { TabularGridModel } from "@genexus/chameleon-controls-library-lit";

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
      code: `import type { AccordionModel } from "@genexus/chameleon-controls-library-lit";

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
      code: `import type { LayoutSplitterModel } from "@genexus/chameleon-controls-library-lit";

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
      code: `// The popover anchors to an element and positions itself automatically.
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
      code: `<div style="display: flex; block-size: 400px;">
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
      code: `import type { TabModel } from "@genexus/chameleon-controls-library-lit";

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
      code: `import type { ActionGroupModel } from "@genexus/chameleon-controls-library-lit";

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
      code: `import type { ActionListModel } from "@genexus/chameleon-controls-library-lit";

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
      code: `import type { ActionMenuModel } from "@genexus/chameleon-controls-library-lit";

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
      code: `import type { NavigationListModel } from "@genexus/chameleon-controls-library-lit";

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
    },
    {
      title: "Console-style with icons and status badges",
      description:
        "Use a custom item render to project an icon next to the caption and a trailing status badge (BETA, EXP, Soon). Items can also be marked as disabled. The selected hyperlink is driven by the `selected-link` attribute, which receives the item id.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChNavigationListConsole", props: {}, children: [] }
        }
      },
      language: "typescript",
      code: `import { html } from "lit";
import type {
  NavigationListCustomRender,
  NavigationListItemModel,
  NavigationListModel
} from "@genexus/chameleon-controls-library-lit";

// 1. Map each item id to its icon and (optional) status badge.
const ICONS: Record<string, ReturnType<typeof html>> = {
  chat: html\`<svg ...></svg>\`,
  inbox: html\`<svg ...></svg>\`,
  "scheduled-tasks": html\`<svg ...></svg>\`
  // ...one per item
};

const BADGES: Record<string, "BETA" | "EXP" | "Soon"> = {
  chat: "BETA",
  inbox: "EXP",
  "scheduled-tasks": "EXP",
  solutions: "Soon"
};

// 2. Build a flat model of hyperlink items. \`disabled\` items act as
//    "Soon" entries that cannot be activated.
const model: NavigationListModel = [
  { id: "chat",            caption: "Chat",            link: { url: "#chat" } },
  { id: "inbox",           caption: "Inbox",           link: { url: "#inbox" } },
  { id: "scheduled-tasks", caption: "Scheduled Tasks", link: { url: "#scheduled-tasks" } },
  { id: "agents",          caption: "Agents",          link: { url: "#agents" } },
  { id: "solutions",       caption: "Solutions",       link: { url: "#solutions" }, disabled: true }
  // ...
];

// 3. Provide the custom render. \`itemContent\` returns the inner content of
//    each item; the navigation list still renders the surrounding <a> / <button>.
const customRenders: NavigationListCustomRender = {
  itemContent: (item: NavigationListItemModel) => ({
    content: html\`
      <span class="row">
        <span class="icon">\${ICONS[item.id]}</span>
        <span class="caption">\${item.caption}</span>
        \${BADGES[item.id]
          ? html\`<span class=\${"badge badge--" + BADGES[item.id].toLowerCase()}>
              \${BADGES[item.id]}
            </span>\`
          : ""}
      </span>
    \`
  })
};

// 4. In your template — \`selected-link\` is the id of the active hyperlink.
// <ch-navigation-list-render
//   .model=\${model}
//   .customRenders=\${customRenders}
//   selected-link="scheduled-tasks"
// ></ch-navigation-list-render>`
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
      code: `import type { SegmentedControlModel } from "@genexus/chameleon-controls-library-lit";

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
      code: `import type { BreadCrumbModel } from "@genexus/chameleon-controls-library-lit";

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
      description:
        "A conversational AI chat interface with virtual scrolling and markdown rendering.",
      spec: {
        root: "root",
        elements: {
          root: { type: "ChChat", props: {}, children: [] }
        }
      },
      language: "typescript",
      code: `import type { ChatMessage, ChatTranslations } from "@genexus/chameleon-controls-library-lit";

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
      code: `// In your template:
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
      code: `// ch-smart-grid works with ch-virtual-scroller to render large datasets efficiently.
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
      code: `// In your template:
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
      code: `import type { ThemeModel } from "@genexus/chameleon-controls-library-lit";

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

