# ch-virtual-scroller - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Adding Items Dynamically](#adding-items-dynamically)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates basic virtual scrolling of a large list inside a `ch-smart-grid`.

### HTML

```html
<ch-smart-grid id="my-grid" style="height: 400px; overflow-y: auto;">
  <ch-virtual-scroller
    id="scroller"
    slot="grid-content"
    buffer-amount="5"
    initial-render-viewport-items="10"
  ></ch-virtual-scroller>
</ch-smart-grid>
```

### JavaScript

```js
const scroller = document.getElementById("scroller");

// Generate 10,000 items
const items = Array.from({ length: 10000 }, (_, i) => ({
  id: `item-${i}`,
  label: `Item ${i + 1}`
}));

scroller.items = items;

// Listen for changes to the visible slice
scroller.addEventListener("virtualItemsChanged", (event) => {
  const { startIndex, endIndex, virtualItems } = event.detail;
  console.log(`Rendering items ${startIndex} to ${endIndex}`);

  // Render only the virtualItems as ch-smart-grid-cell elements
  const scroller = event.target;
  scroller.innerHTML = virtualItems
    .map(item => `<ch-smart-grid-cell>${item.label}</ch-smart-grid-cell>`)
    .join("");
});

// Know when the initial viewport is ready
scroller.addEventListener("virtualScrollerDidLoad", () => {
  console.log("Initial viewport rendered");
});
```

### Key Points

- The `items` property accepts an array of objects, each with a unique `id` property used for internal virtual size tracking.
- The `virtualItemsChanged` event fires whenever the visible slice changes due to scrolling or resizing. The parent is responsible for rendering only the `virtualItems` sub-array.
- The `bufferAmount` (default `5`) controls how many extra items are rendered above and below the viewport. Higher values reduce blank areas during fast scrolling but increase DOM size.
- The `initialRenderViewportItems` (default `10`) estimates how many items fit in the viewport for the first render.
- The `virtualScrollerDidLoad` event fires once when all initial viewport cells are rendered and visible.
- The default mode is `"virtual-scroll"`, which removes off-screen items from the DOM entirely.

## Adding Items Dynamically

Demonstrates adding items to a virtual scroller without resetting the scroll position, using the `addItems()` method.

### HTML

```html
<button id="load-more">Load More</button>

<ch-smart-grid id="my-grid" style="height: 400px; overflow-y: auto;">
  <ch-virtual-scroller
    id="scroller"
    slot="grid-content"
    mode="lazy-render"
  ></ch-virtual-scroller>
</ch-smart-grid>
```

### JavaScript

```js
const scroller = document.getElementById("scroller");
let nextId = 0;

// Initial items
const initialItems = Array.from({ length: 100 }, () => ({
  id: `item-${nextId++}`,
  label: `Item ${nextId}`
}));
scroller.items = initialItems;

// Append items without resetting scroll state
document.getElementById("load-more").addEventListener("click", () => {
  const newItems = Array.from({ length: 50 }, () => ({
    id: `item-${nextId++}`,
    label: `Item ${nextId}`
  }));

  scroller.addItems("end", ...newItems);
});
```

### Key Points

- The `addItems(position, ...items)` method adds items to the beginning (`"start"`) or end (`"end"`) of the items array without resetting the virtual scroller's internal indexes. This preserves the current scroll position.
- When `position` is `"start"`, internal start/end indexes are shifted by the number of added items to keep the viewport stable.
- For full array replacement, assign a new array to the `items` property. This triggers a full reset of internal state and indexes.
- The `mode` property controls DOM management:
  - `"virtual-scroll"` (default): removes off-screen items from the DOM for lowest memory footprint.
  - `"lazy-render"`: keeps items in the DOM once rendered, avoiding re-render costs at the expense of higher memory.
- The `inverseLoading` property enables chat-style interfaces where the scroll starts at the bottom and older items are loaded upward.

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
