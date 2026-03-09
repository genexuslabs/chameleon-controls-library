# ch-flexible-layout-render - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Tabbed Widgets](#tabbed-widgets)
- [Drag and Drop](#drag-and-drop)
- [Dynamic Widgets](#dynamic-widgets)
- [Nested Groups](#nested-groups)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates a simple two-panel side-by-side layout with one widget in each panel.

### HTML

```html
<ch-flexible-layout-render
  id="my-layout"
></ch-flexible-layout-render>
```

### JavaScript

```js
const layout = document.querySelector("#my-layout");

// Define the layout model: a horizontal group with two leaves
layout.model = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: "left-panel",
      size: "1fr",
      type: "single-content",
      widget: { id: "explorer", name: "Explorer" },
      dragBar: { size: 4 }
    },
    {
      id: "right-panel",
      size: "3fr",
      type: "single-content",
      widget: { id: "editor", name: "Editor" },
      dragBar: { size: 4 }
    }
  ]
};

// Provide render functions for each widget
layout.renders = {
  explorer: () => {
    const div = document.createElement("div");
    div.textContent = "File Explorer";
    return div;
  },
  editor: () => {
    const div = document.createElement("div");
    div.textContent = "Code Editor";
    return div;
  }
};
```

### Key Points

- The `model` property defines the hierarchical layout tree. Groups contain items; leaves contain widgets.
- The `direction` of a group controls whether children are laid out as `"columns"` (side by side) or `"rows"` (stacked).
- The `size` property uses CSS grid track syntax (`"1fr"`, `"200px"`, `"auto"`, etc.).
- The `renders` property is a dictionary mapping widget IDs to functions that return rendered content.
- The `dragBar` property on each leaf enables the resizable splitter between panels.

## Tabbed Widgets

Demonstrates a layout where one leaf hosts multiple widgets rendered as tabs.

### HTML

```html
<ch-flexible-layout-render
  id="tabbed-layout"
></ch-flexible-layout-render>
```

### JavaScript

```js
const layout = document.querySelector("#tabbed-layout");

layout.model = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: "sidebar",
      size: "250px",
      type: "single-content",
      widget: { id: "file-tree", name: "Files" },
      dragBar: { size: 4 }
    },
    {
      id: "editor-tabs",
      size: "1fr",
      type: "tabbed",
      selectedWidgetId: "file-a",
      widgets: [
        { id: "file-a", name: "index.ts" },
        { id: "file-b", name: "styles.css" },
        { id: "file-c", name: "README.md" }
      ],
      dragBar: { size: 4 }
    }
  ]
};

layout.renders = {
  "file-tree": () => {
    const el = document.createElement("div");
    el.textContent = "File tree content";
    return el;
  },
  "file-a": () => {
    const el = document.createElement("div");
    el.textContent = "Contents of index.ts";
    return el;
  },
  "file-b": () => {
    const el = document.createElement("div");
    el.textContent = "Contents of styles.css";
    return el;
  },
  "file-c": () => {
    const el = document.createElement("div");
    el.textContent = "Contents of README.md";
    return el;
  }
};
```

### Key Points

- Set `type: "tabbed"` on a leaf to render its widgets as tabs.
- The `selectedWidgetId` property determines which tab is initially active.
- Each widget in the `widgets` array has an `id` (used to look up the render function) and a `name` (displayed in the tab button).
- Widgets are lazily rendered: only the selected widget's render function is called until the user switches tabs.
- The `renderedWidgetsChange` event fires whenever the set of visible widgets changes, useful for lazy-mounting expensive content.

## Drag and Drop

Demonstrates enabling tab reordering within a tabbed leaf and dragging widgets between leaves.

### HTML

```html
<ch-flexible-layout-render
  id="dnd-layout"
  sortable
  drag-outside
  close-button
></ch-flexible-layout-render>
```

### JavaScript

```js
const layout = document.querySelector("#dnd-layout");

layout.model = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: "left-tabs",
      size: "1fr",
      type: "tabbed",
      selectedWidgetId: "widget-1",
      widgets: [
        { id: "widget-1", name: "Panel A" },
        { id: "widget-2", name: "Panel B" }
      ],
      dragBar: { size: 4 }
    },
    {
      id: "right-tabs",
      size: "1fr",
      type: "tabbed",
      selectedWidgetId: "widget-3",
      widgets: [
        { id: "widget-3", name: "Panel C" },
        { id: "widget-4", name: "Panel D" }
      ],
      dragBar: { size: 4 }
    }
  ]
};

layout.renders = {
  "widget-1": (w) => createPanel(`Content for ${w.name}`),
  "widget-2": (w) => createPanel(`Content for ${w.name}`),
  "widget-3": (w) => createPanel(`Content for ${w.name}`),
  "widget-4": (w) => createPanel(`Content for ${w.name}`)
};

function createPanel(text) {
  const el = document.createElement("div");
  el.style.padding = "16px";
  el.textContent = text;
  return el;
}

// Handle close button clicks
layout.addEventListener("widgetClose", (event) => {
  const { widgetId } = event.detail;

  // Optionally prevent the close for unsaved changes
  const confirmClose = confirm(`Close ${widgetId}?`);
  if (!confirmClose) {
    event.preventDefault();
  }
});
```

### Key Points

- Setting `sortable` enables drag reordering of tabs within their tab list.
- Setting `dragOutside` (requires `sortable`) allows dragging a tab out of one leaf and dropping it into another leaf's drop zone.
- The `closeButton` property renders a close button on each tab. The `widgetClose` event is emitted when clicked.
- Calling `event.preventDefault()` on the `widgetClose` event cancels the removal, enabling confirmation dialogs or save prompts.
- When the last widget is dragged out of a leaf, the leaf is automatically removed and its space is given to the sibling.

## Dynamic Widgets

Demonstrates adding and removing widgets programmatically via the component's public methods.

### HTML

```html
<button id="add-btn">Add Widget</button>
<button id="remove-btn">Remove Selected Widget</button>

<ch-flexible-layout-render
  id="dynamic-layout"
></ch-flexible-layout-render>
```

### JavaScript

```js
const layout = document.querySelector("#dynamic-layout");
let widgetCounter = 0;

layout.model = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: "main-tabs",
      size: "1fr",
      type: "tabbed",
      selectedWidgetId: "initial-widget",
      widgets: [
        { id: "initial-widget", name: "Welcome" }
      ],
      dragBar: { size: 4 }
    }
  ]
};

layout.renders = {
  default: (widget) => {
    const el = document.createElement("div");
    el.style.padding = "16px";
    el.textContent = `Content for: ${widget.name}`;
    return el;
  }
};

// Add a new widget to the tabbed leaf
document.querySelector("#add-btn").addEventListener("click", async () => {
  widgetCounter++;
  const newWidget = {
    id: `widget-${widgetCounter}`,
    name: `Tab ${widgetCounter}`,
    renderId: "default"
  };

  await layout.addWidget("main-tabs", newWidget, true);
});

// Remove the currently selected widget
document.querySelector("#remove-btn").addEventListener("click", async () => {
  // The selectedWidgetId can be tracked via renderedWidgetsChange
  await layout.removeWidget("initial-widget");
});

// Add a new sibling view next to an existing one
async function addSiblingPanel() {
  const newLeaf = {
    id: "new-sibling",
    size: "1fr",
    type: "tabbed",
    selectedWidgetId: "sibling-widget",
    widgets: [{ id: "sibling-widget", name: "Sibling", renderId: "default" }],
    dragBar: { size: 4 }
  };

  const success = await layout.addSiblingView(
    "root",         // parentGroup
    "main-tabs",    // siblingItem
    "after",        // placement relative to sibling
    newLeaf,        // the new leaf definition
    true            // take half the space of the sibling
  );

  console.log("View added:", success);
}
```

### Key Points

- `addWidget(leafId, widget, selectWidget)` adds a widget to an existing tabbed leaf. Set `selectWidget` to `true` to immediately switch to it.
- The `renderId` property on a widget maps to a key in the `renders` dictionary, allowing multiple widgets to share a render function.
- `removeWidget(widgetId)` removes a widget by its ID. If it was the last widget, the entire view is destroyed.
- `addSiblingView(parentGroup, siblingItem, placement, viewInfo, takeHalfSpace)` creates a new leaf view as a sibling in the layout tree.
- `removeView(leafId, removeRenderedWidgets)` removes an entire leaf and optionally destroys widget render state.

## Nested Groups

Demonstrates a complex nested layout with groups inside groups, mimicking a typical IDE arrangement with sidebar, editor area, and bottom panel.

### HTML

```html
<ch-flexible-layout-render
  id="nested-layout"
  sortable
  close-button
  style="width: 100%; height: 600px;"
></ch-flexible-layout-render>
```

### JavaScript

```js
const layout = document.querySelector("#nested-layout");

layout.model = {
  id: "root",
  direction: "columns",
  items: [
    // Left sidebar
    {
      id: "sidebar",
      size: "220px",
      type: "tabbed",
      selectedWidgetId: "explorer",
      tabListPosition: "block-start",
      widgets: [
        { id: "explorer", name: "Explorer", startImgSrc: "icons/folder.svg" },
        { id: "search", name: "Search", startImgSrc: "icons/search.svg" }
      ],
      dragBar: { size: 4 }
    },
    // Main area: editor on top, terminal on bottom
    {
      id: "main-area",
      direction: "rows",
      items: [
        {
          id: "editor-group",
          size: "3fr",
          direction: "columns",
          items: [
            {
              id: "editor-left",
              size: "1fr",
              type: "tabbed",
              selectedWidgetId: "file-1",
              widgets: [
                { id: "file-1", name: "app.ts" },
                { id: "file-2", name: "utils.ts" }
              ],
              dragBar: { size: 4 }
            },
            {
              id: "editor-right",
              size: "1fr",
              type: "tabbed",
              selectedWidgetId: "file-3",
              widgets: [
                { id: "file-3", name: "styles.css" }
              ],
              dragBar: { size: 4 }
            }
          ],
          dragBar: { size: 4 }
        },
        // Bottom panel
        {
          id: "bottom-panel",
          size: "200px",
          type: "tabbed",
          selectedWidgetId: "terminal",
          widgets: [
            { id: "terminal", name: "Terminal" },
            { id: "problems", name: "Problems" },
            { id: "output", name: "Output" }
          ],
          dragBar: { size: 4 }
        }
      ],
      dragBar: { size: 4 }
    }
  ]
};

// Renders for all widgets
layout.renders = {
  explorer:  () => makeWidget("File Explorer Tree"),
  search:    () => makeWidget("Search Panel"),
  "file-1":  () => makeWidget("// app.ts content"),
  "file-2":  () => makeWidget("// utils.ts content"),
  "file-3":  () => makeWidget("/* styles.css */"),
  terminal:  () => makeWidget("$ "),
  problems:  () => makeWidget("No problems detected."),
  output:    () => makeWidget("Build output...")
};

function makeWidget(text) {
  const el = document.createElement("div");
  el.style.cssText = "padding: 12px; font-family: monospace; height: 100%;";
  el.textContent = text;
  return el;
}
```

### Key Points

- Groups can be nested inside other groups. Each group specifies its own `direction` (`"columns"` or `"rows"`), enabling complex grid arrangements.
- In this example, the root group splits horizontally (sidebar vs. main area). The main area group splits vertically (editors vs. bottom panel). The editor group further splits horizontally (two side-by-side editor tabs).
- The `tabListPosition` property on a tabbed leaf controls where the tab buttons appear (`"block-start"`, `"block-end"`, `"inline-start"`, or `"inline-end"`).
- Each widget can display an icon via the `startImgSrc` property, rendered in the tab button.
- Fixed sizes (`"220px"`, `"200px"`) and flexible sizes (`"1fr"`, `"3fr"`) can be mixed within the same group to create fixed sidebars alongside fluid content areas.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.

### Don't

- Don't set complex model/items data via HTML attributes — use JavaScript property assignment instead.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
