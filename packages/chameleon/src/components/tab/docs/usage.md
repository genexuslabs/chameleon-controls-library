# ch-tab-render - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Tab Positions](#tab-positions)
- [Closable Tabs](#closable-tabs)
- [Overflow Tabs](#overflow-tabs)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates a simple tab component with multiple panels. Clicking a tab button switches the visible content.

### HTML

```html
<ch-tab-render id="my-tabs" selected-id="overview">
  <div slot="overview">
    <h3>Overview</h3>
    <p>This is the overview panel with general information.</p>
  </div>
  <div slot="details">
    <h3>Details</h3>
    <p>Detailed specifications and technical information.</p>
  </div>
  <div slot="reviews">
    <h3>Reviews</h3>
    <p>Customer reviews and ratings.</p>
  </div>
</ch-tab-render>
```

### JavaScript

```js
const tabs = document.querySelector("#my-tabs");

tabs.model = [
  { id: "overview", name: "Overview" },
  { id: "details", name: "Details" },
  { id: "reviews", name: "Reviews" }
];

tabs.addEventListener("selectedItemChange", (event) => {
  console.log("Selected tab:", event.detail.newSelectedId);
});
```

### Key Points

- The `model` property accepts an array of `TabItemModel` objects, each requiring at least `id` and `name`.
- The `selected-id` attribute (or `selectedId` property) determines which tab is active initially.
- Slot names correspond to each item's `id` to project content into the correct panel.
- The `selectedItemChange` event fires when the user selects a different tab.
- Panel content is lazily rendered: a panel's slot is only mounted after the tab has been selected at least once.

## Tab Positions

Demonstrates the different `tabListPosition` values that control where the tab buttons are rendered relative to the panels.

### HTML

```html
<h4>block-start (default, tabs above)</h4>
<ch-tab-render id="tabs-block-start" selected-id="tab-1" tab-list-position="block-start">
  <div slot="tab-1">Content for block-start position.</div>
  <div slot="tab-2">Second panel content.</div>
</ch-tab-render>

<h4>block-end (tabs below)</h4>
<ch-tab-render id="tabs-block-end" selected-id="tab-1" tab-list-position="block-end">
  <div slot="tab-1">Content for block-end position.</div>
  <div slot="tab-2">Second panel content.</div>
</ch-tab-render>

<h4>inline-start (tabs on the left)</h4>
<ch-tab-render id="tabs-inline-start" selected-id="tab-1" tab-list-position="inline-start" style="height: 200px;">
  <div slot="tab-1">Content for inline-start position.</div>
  <div slot="tab-2">Second panel content.</div>
</ch-tab-render>

<h4>inline-end (tabs on the right)</h4>
<ch-tab-render id="tabs-inline-end" selected-id="tab-1" tab-list-position="inline-end" style="height: 200px;">
  <div slot="tab-1">Content for inline-end position.</div>
  <div slot="tab-2">Second panel content.</div>
</ch-tab-render>
```

### JavaScript

```js
const model = [
  { id: "tab-1", name: "First" },
  { id: "tab-2", name: "Second" }
];

document.querySelector("#tabs-block-start").model = model;
document.querySelector("#tabs-block-end").model = model;
document.querySelector("#tabs-inline-start").model = model;
document.querySelector("#tabs-inline-end").model = model;
```

### Key Points

- The `tabListPosition` property accepts `"block-start"`, `"block-end"`, `"inline-start"`, or `"inline-end"`.
- `"block-start"` (default) places tabs above the panels; `"block-end"` places them below.
- `"inline-start"` and `"inline-end"` place the tabs vertically on the left or right side, respectively. These layouts work best with a defined height on the component.
- The position is RTL-aware: `"inline-start"` maps to the right side in RTL layouts.
- Direction and position parts (`block`/`inline`, `start`/`end`) are exported for position-specific styling.

## Closable Tabs

Demonstrates tabs with a close button that allows users to remove individual tabs at runtime.

### HTML

```html
<ch-tab-render id="closable-tabs" selected-id="file-1" close-button>
  <div slot="file-1">
    <p>Contents of document.txt</p>
  </div>
  <div slot="file-2">
    <p>Contents of image.png</p>
  </div>
  <div slot="file-3">
    <p>Contents of styles.css</p>
  </div>
</ch-tab-render>
```

### JavaScript

```js
const tabs = document.querySelector("#closable-tabs");

let model = [
  { id: "file-1", name: "document.txt" },
  { id: "file-2", name: "image.png" },
  { id: "file-3", name: "styles.css" }
];

tabs.model = model;

tabs.addEventListener("itemClose", (event) => {
  const closedId = event.detail.itemId;

  // Remove the closed tab from the model
  model = model.filter(item => item.id !== closedId);
  tabs.model = [...model];

  // If the closed tab was selected, select another one
  if (tabs.selectedId === closedId && model.length > 0) {
    tabs.selectedId = model[0].id;
  }

  console.log("Closed tab:", closedId);
});
```

### Key Points

- Setting `close-button` (or `closeButton = true`) renders a close button on each tab.
- The `itemClose` event fires when the user clicks a tab's close button, with `{ itemId }` in the detail.
- The component does not remove the tab automatically; you must update the `model` in the event handler.
- Individual items can opt out of the close button by setting `closable: false` on the model item.
- The `closable` and `not-closable` state parts are available for styling tabs with or without close buttons.

## Overflow Tabs

Demonstrates handling many tabs that exceed the available width by using the tab list start/end slots for custom overflow controls.

### HTML

```html
<ch-tab-render
  id="overflow-tabs"
  selected-id="tab-1"
  show-tab-list-end
>
  <!-- Overflow menu projected into the tab-list-end slot -->
  <button slot="block-start" id="more-tabs-btn" style="padding: 4px 12px; font-size: 12px;">
    More...
  </button>

  <!-- Panel content for each tab -->
  <div slot="tab-1">Content for Tab 1</div>
  <div slot="tab-2">Content for Tab 2</div>
  <div slot="tab-3">Content for Tab 3</div>
  <div slot="tab-4">Content for Tab 4</div>
  <div slot="tab-5">Content for Tab 5</div>
  <div slot="tab-6">Content for Tab 6</div>
  <div slot="tab-7">Content for Tab 7</div>
  <div slot="tab-8">Content for Tab 8</div>
  <div slot="tab-9">Content for Tab 9</div>
  <div slot="tab-10">Content for Tab 10</div>
</ch-tab-render>
```

### JavaScript

```js
const tabs = document.querySelector("#overflow-tabs");

tabs.model = Array.from({ length: 10 }, (_, i) => ({
  id: `tab-${i + 1}`,
  name: `Tab ${i + 1}`
}));
```

### Key Points

- When many tabs are added, the tab list may overflow its container. Use `overflow-x: auto` on the `tab-list` part to enable horizontal scrolling.
- Set `showTabListEnd` (or `show-tab-list-end`) to `true` to render a slot adjacent to the tab list for custom controls like an overflow menu or "add tab" button.
- The slot name for projecting content into the tab list area matches the `tabListPosition` value (e.g., `"block-start"` for the default position).
- Similarly, `showTabListStart` renders a slot at the start of the tab list.
- The `tab-list-start` and `tab-list-end` parts are available for styling these adjacent areas.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.
- Use named slots to provide custom content where supported.

### Don't

- Don't set complex model/items data via HTML attributes — use JavaScript property assignment instead.
- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
