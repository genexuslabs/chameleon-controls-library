# ch-layout-splitter - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Vertical Split](#vertical-split)
- [Nested Splitters](#nested-splitters)
- [Constrained Splitter](#constrained-splitter)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates a simple horizontal split with two resizable panels.

### HTML

```html
<div style="width: 100%; height: 400px;">
  <ch-layout-splitter id="splitter">
    <div slot="left-panel">
      <h3>Left Panel</h3>
      <p>Drag the bar between the panels to resize.</p>
    </div>
    <div slot="right-panel">
      <h3>Right Panel</h3>
      <p>Content in the right panel.</p>
    </div>
  </ch-layout-splitter>
</div>
```

### JavaScript

```js
const splitter = document.getElementById("splitter");

splitter.model = {
  id: "root",
  direction: "columns",
  items: [
    { id: "left-panel", size: "1fr" },
    { id: "right-panel", size: "1fr" }
  ]
};
```

### Key Points

- The `model` property defines the layout structure. The root is a group with a `direction` (`"columns"` for horizontal, `"rows"` for vertical) and an `items` array.
- Each leaf item has an `id` that must match the `slot` attribute on the corresponding content element.
- Sizes can be `"1fr"` (flexible) or fixed values like `"250px"`. A drag bar is automatically rendered between sibling items.
- The parent container must have an explicit size (width and height) for the splitter to fill.

## Vertical Split

Demonstrates a vertical split where panels are stacked top to bottom.

### HTML

```html
<div style="width: 100%; height: 500px;">
  <ch-layout-splitter id="splitter">
    <div slot="top-panel">
      <h3>Top Panel</h3>
      <p>Content in the top panel.</p>
    </div>
    <div slot="bottom-panel">
      <h3>Bottom Panel</h3>
      <p>Content in the bottom panel.</p>
    </div>
  </ch-layout-splitter>
</div>
```

### JavaScript

```js
const splitter = document.getElementById("splitter");

splitter.model = {
  id: "root",
  direction: "rows",
  items: [
    { id: "top-panel", size: "1fr" },
    { id: "bottom-panel", size: "1fr" }
  ]
};
```

### Key Points

- Set `direction: "rows"` on the root group to stack panels vertically (top to bottom).
- The drag bar between rows uses a `ns-resize` cursor (north-south), while column drag bars use `ew-resize` (east-west).
- Keyboard resizing is supported with the Arrow Up and Arrow Down keys for row-direction bars.

## Nested Splitters

Demonstrates a complex layout with nested groups: a sidebar column alongside a vertically split main area.

### HTML

```html
<div style="width: 100%; height: 600px;">
  <ch-layout-splitter id="splitter">
    <div slot="sidebar">
      <h3>Sidebar</h3>
      <p>Navigation or tree view.</p>
    </div>
    <div slot="editor">
      <h3>Editor</h3>
      <p>Main content area.</p>
    </div>
    <div slot="output">
      <h3>Output</h3>
      <p>Console or terminal output.</p>
    </div>
  </ch-layout-splitter>
</div>
```

### JavaScript

```js
const splitter = document.getElementById("splitter");

splitter.model = {
  id: "root",
  direction: "columns",
  items: [
    { id: "sidebar", size: "250px" },
    {
      id: "main-area",
      direction: "rows",
      items: [
        { id: "editor", size: "2fr" },
        { id: "output", size: "1fr" }
      ]
    }
  ]
};
```

### Key Points

- Nesting is achieved by using a group (an item with `direction` and `items`) instead of a leaf item.
- The `"sidebar"` leaf has a fixed `"250px"` size, while the nested `"main-area"` group takes the remaining space as a flexible sibling.
- Inside the nested group, `"editor"` gets twice the space of `"output"` thanks to the `"2fr"` vs `"1fr"` ratio.
- Groups can be nested to arbitrary depth, enabling layouts like IDE-style editors with sidebars, panels, and terminals.
- Each group container gets a shadow part matching its `id`, so you can style individual groups from outside (e.g., `ch-layout-splitter::part(main-area)`).

## Constrained Splitter

Demonstrates a layout splitter with minimum size constraints and disabled drag bars.

### HTML

```html
<div style="width: 100%; height: 400px;">
  <ch-layout-splitter id="splitter" bar-accessible-name="Resize panels">
    <div slot="nav">
      <h3>Navigation</h3>
      <p>This panel has a minimum width of 150px.</p>
    </div>
    <div slot="content">
      <h3>Content</h3>
      <p>Main content area.</p>
    </div>
    <div slot="details">
      <h3>Details</h3>
      <p>The bar before this panel is disabled.</p>
    </div>
  </ch-layout-splitter>
</div>
```

### JavaScript

```js
const splitter = document.getElementById("splitter");

splitter.model = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: "nav",
      size: "200px",
      minSize: "150px",
      dragBar: { size: 6 }
    },
    {
      id: "content",
      size: "1fr",
      dragBar: { hidden: true }
    },
    {
      id: "details",
      size: "250px",
      minSize: "100px"
    }
  ]
};
```

### Key Points

- Set `minSize` on a leaf item to prevent the user from resizing it below that threshold. The drag bar will stop at the minimum.
- The `dragBar.size` property on a leaf controls the visual width (in px) of the drag bar separator that follows that item.
- Set `dragBar.hidden` to `true` to remove the drag bar between two items, making that boundary non-resizable.
- The `bar-accessible-name` property sets the `aria-label` for all drag bar separators, improving screen reader support.
- Use `drag-bar-disabled="true"` on the component to globally disable all resize operations.
- The `increment-with-keyboard` property (default `2`) controls how many pixels the bar moves per Arrow key press.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use named slots to provide custom content where supported.
- Always provide an `accessibleName` or appropriate `aria-` attribute for screen reader support.

### Don't

- Don't set complex model/items data via HTML attributes — use JavaScript property assignment instead.
- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
