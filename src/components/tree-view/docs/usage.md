# ch-tree-view-render - Usage

## Table of Contents

- [Sizing Behavior](#sizing-behavior)
- [Basic Usage](#basic-usage)
- [Lazy Loading Children](#lazy-loading-children)
- [Drag-and-Drop Reordering](#drag-and-drop-reordering)
- [Tree with Checkbox Selection](#tree-with-checkbox-selection)
- [Tree with Filter](#tree-with-filter)
- [Do's and Don'ts](#dos-and-donts)

> **Sizing behavior:** `ch-tree-view-render` uses `contain: size`, which means the component does **not** contribute to its parent's intrinsic size. The parent must establish its own size through layout — for example, by being a grid or flex item, or by having an explicit `block-size`. If the parent has no size, the component will be invisible.
>
> The recommended approach is to place the component inside a grid or flex container that already has a defined size:
>
> ```css
> /* Recommended: parent establishes its own size via layout */
> .my-layout {
>   display: grid;
>   grid-template-rows: auto 1fr; /* tree-view goes in the 1fr row */
> }
> ```

## Basic Usage

Demonstrates a simple tree with expandable and collapsible nodes.

### HTML

```html
<ch-tree-view-render
  show-lines="last"
  expandable-button="action"
></ch-tree-view-render>
```

### JavaScript

```js
const tree = document.querySelector("ch-tree-view-render");

tree.model = [
  {
    id: "src",
    caption: "src",
    expanded: true,
    items: [
      {
        id: "components",
        caption: "components",
        expanded: false,
        items: [
          { id: "button", caption: "button.tsx", leaf: true },
          { id: "input", caption: "input.tsx", leaf: true }
        ]
      },
      { id: "index", caption: "index.ts", leaf: true }
    ]
  },
  { id: "readme", caption: "README.md", leaf: true },
  { id: "package", caption: "package.json", leaf: true }
];

tree.addEventListener("selectedItemsChange", (event) => {
  console.log("Selected:", event.detail);
});
```

### Key Points

- The `model` property accepts an array of `TreeViewItemModel` objects. Each item needs an `id` and `caption`. Set `leaf: true` on items without children.
- Items with children should include an `items` array. Set `expanded: true` to show children initially.
- `expandableButton="action"` renders an interactive expand/collapse button. Use `"decorative"` for a non-interactive indicator where the row click toggles expansion.
- `showLines="last"` draws a connector line from the parent to the last child in each group. Use `"all"` for connector lines to all items or `"none"` to hide lines.

## Lazy Loading Children

Demonstrates loading child items on demand when a node is expanded.

### HTML

```html
<ch-tree-view-render
  expandable-button="action"
></ch-tree-view-render>
```

### JavaScript

```js
const tree = document.querySelector("ch-tree-view-render");

tree.model = [
  { id: "root-1", caption: "Documents", lazy: true },
  { id: "root-2", caption: "Images", lazy: true },
  { id: "root-3", caption: "Videos", lazy: true }
];

// Callback invoked when a lazy node is expanded
tree.lazyLoadTreeItemsCallback = async (itemId) => {
  const response = await fetch(`/api/files/${itemId}/children`);
  const children = await response.json();

  // Return the children to populate the tree node
  return children.map(file => ({
    id: file.id,
    caption: file.name,
    leaf: !file.isDirectory,
    lazy: file.isDirectory
  }));
};
```

### Key Points

- Set `lazy: true` on items to defer loading their children until the user expands them.
- Assign a `lazyLoadTreeItemsCallback` function that receives the item ID and returns a promise resolving to the child items array.
- While loading, the item displays a downloading spinner (the `item__downloading` part).
- Once loaded, the `item__group` part receives the `lazy-loaded` state part for targeted styling.
- Lazy items that return an empty array become leaf nodes visually.

## Drag-and-Drop Reordering

Demonstrates enabling drag-and-drop to reorder nodes within the tree.

### HTML

```html
<ch-tree-view-render
  expandable-button="action"
  drop-mode="above-below"
></ch-tree-view-render>
```

### JavaScript

```js
const tree = document.querySelector("ch-tree-view-render");

tree.model = [
  {
    id: "tasks",
    caption: "Tasks",
    expanded: true,
    items: [
      { id: "task-1", caption: "Design review", leaf: true },
      { id: "task-2", caption: "Code implementation", leaf: true },
      { id: "task-3", caption: "Testing", leaf: true }
    ]
  },
  {
    id: "completed",
    caption: "Completed",
    expanded: true,
    items: [
      { id: "done-1", caption: "Requirements gathering", leaf: true }
    ]
  }
];

tree.addEventListener("itemDragStart", (event) => {
  console.log("Dragging:", event.detail.item.caption);
});

tree.addEventListener("itemDrop", (event) => {
  const { item, dropTarget, dropType } = event.detail;
  console.log(`Dropped "${item.caption}" ${dropType} "${dropTarget.caption}"`);
});
```

### Key Points

- Set `dropMode="above-below"` to enable drop zones above and below each item. Use `"above"` to only allow dropping onto items (reparenting).
- Individual items can opt out of dragging with `dragDisabled: true` or dropping with `dropDisabled: true`.
- The `itemDragStart` event fires when a drag begins. The `itemDrop` event fires when a drop is completed, providing the dragged item, the drop target, and the drop type (`"before"`, `"after"`, or `"above"`).
- The `drag-preview` part can be styled to customize the drag preview appearance.
- Selected items can be dragged together when using multi-selection mode.

## Tree with Checkbox Selection

Demonstrates a tree with tri-state checkboxes for multi-selection.

### HTML

```html
<ch-tree-view-render
  checkbox
  toggle-checkboxes
  expandable-button="action"
  show-lines="last"
></ch-tree-view-render>
```

### JavaScript

```js
const tree = document.querySelector("ch-tree-view-render");

tree.model = [
  {
    id: "permissions",
    caption: "All Permissions",
    expanded: true,
    checked: false,
    items: [
      {
        id: "read",
        caption: "Read",
        expanded: true,
        checked: false,
        items: [
          { id: "read-docs", caption: "Documents", leaf: true, checked: true },
          { id: "read-media", caption: "Media", leaf: true, checked: false }
        ]
      },
      {
        id: "write",
        caption: "Write",
        leaf: true,
        checked: false
      }
    ]
  }
];

tree.addEventListener("checkedItemsChange", (event) => {
  const checkedItems = event.detail;
  console.log(
    "Checked items:",
    [...checkedItems.values()].map(i => i.item.caption)
  );
});
```

### Key Points

- Set the `checkbox` attribute to display a checkbox on all items. Override per-item with `checkbox: true/false`.
- `toggleCheckboxes` enables automatic parent-child checkbox propagation: checking a parent checks all children, and partially checked children cause the parent to show an indeterminate state.
- Each item supports three checkbox states: `checked: true`, `checked: false`, and `indeterminate: true`.
- The `checkedItemsChange` event fires whenever the checked state changes and its `detail` contains a Map of all checked item models.
- Checkbox selection is independent from node selection (`selected` property).

## Tree with Filter

Demonstrates filtering tree items by caption to find nodes quickly.

### HTML

```html
<input type="text" id="filter-input" placeholder="Search tree..." />

<ch-tree-view-render
  expandable-button="action"
  filter-type="caption"
></ch-tree-view-render>
```

### JavaScript

```js
const tree = document.querySelector("ch-tree-view-render");
const filterInput = document.getElementById("filter-input");

tree.model = [
  {
    id: "frontend",
    caption: "Frontend",
    expanded: true,
    items: [
      { id: "react", caption: "React", leaf: true },
      { id: "angular", caption: "Angular", leaf: true },
      { id: "vue", caption: "Vue", leaf: true }
    ]
  },
  {
    id: "backend",
    caption: "Backend",
    expanded: true,
    items: [
      { id: "node", caption: "Node.js", leaf: true },
      { id: "python", caption: "Python", leaf: true },
      { id: "java", caption: "Java", leaf: true }
    ]
  }
];

// Set debounce to avoid filtering on every keystroke
tree.filterDebounce = 300;

filterInput.addEventListener("input", (event) => {
  tree.filter = event.target.value;
});
```

### Key Points

- Set `filterType="caption"` to filter items whose captions match the `filter` property value. Other modes include `"metadata"`, `"list"`, `"checked"`, and `"unchecked"`.
- The `filter` property accepts a string or RegExp. When a string is provided, it is matched as a case-insensitive substring by default.
- Use `filterDebounce` (in milliseconds) to debounce rapid changes to the `filter` property and avoid excessive re-renders.
- For `filterType="list"`, set the `filterList` property to an array of item IDs to display.
- Parent items that contain matching children remain visible in the tree to preserve the hierarchy context.
- Use `filterOptions` to customize filter behavior (e.g., case sensitivity, match mode).

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.

### Don't

- Don't set complex model/items data via HTML attributes — use JavaScript property assignment instead.
- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
