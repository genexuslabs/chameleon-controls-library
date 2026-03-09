# ch-action-group-render - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Overflow into More Menu](#overflow-into-more-menu)
- [Overflow Behavior Modes](#overflow-behavior-modes)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates a horizontal group of action buttons.

### HTML

```html
<ch-action-group-render
  items-overflow-behavior="responsive-collapse"
  more-actions-accessible-name="More actions"
></ch-action-group-render>
```

### JavaScript

```js
const actionGroup = document.querySelector("ch-action-group-render");

actionGroup.model = [
  { caption: "New", type: "actionable" },
  { caption: "Open", type: "actionable" },
  { caption: "Save", type: "actionable" },
  { type: "separator" },
  { caption: "Undo", type: "actionable" },
  { caption: "Redo", type: "actionable" }
];

actionGroup.addEventListener("buttonClick", (event) => {
  console.log("Action:", event.detail.caption);
});
```

### Key Points

- The `model` property accepts an array of items sharing the same types as `ch-action-menu-render`: `"actionable"`, `"separator"`, and `"slot"`.
- Separators render as vertical dividers between action items.
- By default, `itemsOverflowBehavior` is `"responsive-collapse"`, which moves items that do not fit into an overflow dropdown.
- The `buttonClick` and `hyperlinkClick` events bubble from the embedded action menu items.

## Overflow into More Menu

Demonstrates how overflowing items are automatically collapsed into a "more actions" dropdown.

### HTML

```html
<div style="inline-size: 300px; border: 1px solid #ddd; padding: 4px;">
  <ch-action-group-render
    items-overflow-behavior="responsive-collapse"
    more-actions-accessible-name="Show more actions"
    more-actions-caption="More"
  ></ch-action-group-render>
</div>
```

### JavaScript

```js
const actionGroup = document.querySelector("ch-action-group-render");

actionGroup.model = [
  { caption: "Bold", type: "actionable" },
  { caption: "Italic", type: "actionable" },
  { caption: "Underline", type: "actionable" },
  { caption: "Strikethrough", type: "actionable" },
  { caption: "Highlight", type: "actionable" },
  { caption: "Font Color", type: "actionable" },
  { caption: "Clear Formatting", type: "actionable" }
];

actionGroup.addEventListener("buttonClick", (event) => {
  console.log("Toolbar action:", event.detail.caption);
});
```

### Key Points

- When `itemsOverflowBehavior="responsive-collapse"`, the component uses `IntersectionObserver` to detect which items no longer fit within the available space.
- Items that overflow are automatically moved into the "more actions" dropdown menu.
- Set `moreActionsCaption` to provide a visible label for the overflow button. Without it, only the `moreActionsAccessibleName` is used (for screen readers).
- Control the alignment of the overflow dropdown with `moreActionsBlockAlign` and `moreActionsInlineAlign`.
- The overflow detection updates in real-time as the container is resized.

## Overflow Behavior Modes

Demonstrates the three overflow behavior strategies: responsive collapse, scrolling, and multiline wrapping.

### HTML

```html
<!-- Responsive collapse: overflow items go into a dropdown -->
<h3>Responsive Collapse</h3>
<div style="inline-size: 250px; border: 1px solid #ddd; padding: 4px;">
  <ch-action-group-render
    id="collapse-group"
    items-overflow-behavior="responsive-collapse"
    more-actions-accessible-name="More"
  ></ch-action-group-render>
</div>

<!-- Scroll: horizontal scrollbar appears -->
<h3>Add Scroll</h3>
<div style="inline-size: 250px; border: 1px solid #ddd; padding: 4px;">
  <ch-action-group-render
    id="scroll-group"
    items-overflow-behavior="add-scroll"
  ></ch-action-group-render>
</div>

<!-- Multiline: items wrap to additional rows -->
<h3>Multiline</h3>
<div style="inline-size: 250px; border: 1px solid #ddd; padding: 4px;">
  <ch-action-group-render
    id="multiline-group"
    items-overflow-behavior="multiline"
  ></ch-action-group-render>
</div>
```

### JavaScript

```js
const model = [
  { caption: "Cut", type: "actionable" },
  { caption: "Copy", type: "actionable" },
  { caption: "Paste", type: "actionable" },
  { caption: "Delete", type: "actionable" },
  { caption: "Select All", type: "actionable" }
];

document.querySelectorAll("ch-action-group-render").forEach(group => {
  group.model = model;
});
```

### Key Points

- `"responsive-collapse"` (default): Uses `IntersectionObserver` to detect hidden items and renders a "more actions" dropdown. Best for toolbars where all actions should remain accessible.
- `"add-scroll"`: Adds a horizontal scrollbar when items overflow. Best when preserving the visual order matters more than immediate accessibility.
- `"multiline"`: Wraps items to additional rows using flex-wrap. Best when vertical space is available and all items should be visible without interaction.
- The `itemsOverflowBehavior` property can be changed dynamically at runtime.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.

### Don't

- Don't set complex model/items data via HTML attributes — use JavaScript property assignment instead.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
