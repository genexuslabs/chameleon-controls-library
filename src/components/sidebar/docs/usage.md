# ch-sidebar - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Resizable Sidebar](#resizable-sidebar)
- [Sidebar with Navigation](#sidebar-with-navigation)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates a simple sidebar that can be expanded and collapsed using its built-in toggle button.

### HTML

```html
<div style="display: flex; height: 400px;">
  <ch-sidebar
    id="my-sidebar"
    expanded
    show-expand-button
    expand-button-collapse-accessible-name="Collapse sidebar"
    expand-button-expand-accessible-name="Expand sidebar"
    expand-button-collapse-caption="Collapse"
    expand-button-expand-caption="Expand"
  >
    <div style="padding: 16px;">
      <h3>Sidebar</h3>
      <p>Place navigation links or tools here.</p>
    </div>
  </ch-sidebar>

  <main style="flex: 1; padding: 16px;">
    <h2>Main Content</h2>
    <p>The main content area expands when the sidebar is collapsed.</p>
  </main>
</div>
```

### JavaScript

```js
const sidebar = document.querySelector("#my-sidebar");

sidebar.addEventListener("expandedChange", (event) => {
  console.log("Sidebar expanded:", event.detail);
});
```

### Key Points

- The `expanded` property controls whether the sidebar is expanded or collapsed. It uses mutable two-way binding.
- Setting `show-expand-button` renders a toggle button that the user can click to expand or collapse the sidebar.
- Use `--ch-sidebar-inline-size--expanded` and `--ch-sidebar-inline-size--collapsed` CSS custom properties to control the sidebar width in each state.
- The `expandedChange` event fires when the user clicks the expand/collapse button, with the new `expanded` value as the detail.
- The `expand-button-position` property can be set to `"before"` or `"after"` (default) to place the button above or below the content.

## Resizable Sidebar

Demonstrates a sidebar that can be resized by the user via CSS `resize`, combined with the expand/collapse toggle for a flexible layout.

### HTML

```html
<div style="display: flex; height: 500px;">
  <ch-sidebar
    id="resizable-sidebar"
    expanded
    show-expand-button
    expand-button-collapse-accessible-name="Collapse sidebar"
    expand-button-expand-accessible-name="Expand sidebar"
  >
    <div style="padding: 16px;">
      <h3>Tools</h3>
      <p>Drag the edge to resize this sidebar.</p>
      <ul>
        <li>Tool A</li>
        <li>Tool B</li>
        <li>Tool C</li>
      </ul>
    </div>
  </ch-sidebar>

  <main style="flex: 1; padding: 16px;">
    <h2>Workspace</h2>
    <p>Main workspace area.</p>
  </main>
</div>
```

### JavaScript

```js
const sidebar = document.querySelector("#resizable-sidebar");

sidebar.addEventListener("expandedChange", (event) => {
  if (!event.detail) {
    // Reset inline-size to the collapsed custom property value when collapsing
    sidebar.style.inlineSize = "";
  }
});
```

### Key Points

- CSS `resize: horizontal` allows the user to drag the sidebar edge to resize it. Combine with `overflow: hidden` and `min-inline-size`/`max-inline-size` for bounds.
- When the sidebar is collapsed, the host class `ch-sidebar--collapsed` is applied. Use this to disable resizing in the collapsed state.
- On `expandedChange`, clearing the inline style ensures the sidebar respects the `--ch-sidebar-inline-size--collapsed` custom property.
- For a fully integrated resize experience, consider pairing with `ch-layout-splitter` instead of CSS `resize`.

## Sidebar with Navigation

Demonstrates a sidebar containing a navigation list that automatically synchronizes its expanded/collapsed state with the sidebar.

### HTML

```html
<div style="display: flex; height: 500px;">
  <ch-sidebar
    id="nav-sidebar"
    expanded
    show-expand-button
    expand-button-position="after"
    expand-button-collapse-accessible-name="Collapse navigation"
    expand-button-expand-accessible-name="Expand navigation"
  >
    <ch-navigation-list-render id="nav-list"></ch-navigation-list-render>
  </ch-sidebar>

  <main style="flex: 1; padding: 16px;">
    <h2>Application Content</h2>
    <p>Select a page from the sidebar navigation.</p>
  </main>
</div>
```

### JavaScript

```js
const navList = document.querySelector("#nav-list");

navList.model = [
  {
    id: "home",
    caption: "Home",
    link: { url: "#home" }
  },
  {
    id: "dashboard",
    caption: "Dashboard",
    link: { url: "#dashboard" }
  },
  {
    id: "settings",
    caption: "Settings",
    link: { url: "#settings" },
    items: [
      { id: "general", caption: "General", link: { url: "#settings/general" } },
      { id: "security", caption: "Security", link: { url: "#settings/security" } }
    ]
  },
  {
    id: "help",
    caption: "Help",
    link: { url: "#help" }
  }
];
```

### Key Points

- The `ch-sidebar` component uses an observable system: descendant components like `ch-navigation-list-render` automatically synchronize their expanded state with the sidebar.
- When the sidebar collapses, the navigation list detects the change and can adapt its rendering (e.g., showing only icons).
- The `expand-button-position` property controls whether the toggle button appears above (`"before"`) or below (`"after"`) the content.
- Separate accessible names for expanded and collapsed states ensure screen readers announce the correct action for the button.
- The sidebar auto-assigns an `id` on connect so the observer system can identify it for state synchronization with descendants.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.

### Don't

- Don't set complex model/items data via HTML attributes — use JavaScript property assignment instead.
- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
