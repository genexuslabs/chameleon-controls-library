# ch-action-list-render - Usage

## Table of Contents

- [Sizing Behavior](#sizing-behavior)
- [Basic Usage](#basic-usage)
- [Multiple Selection](#multiple-selection)
- [Inline Editing](#inline-editing)
- [List with Checkbox Selection](#list-with-checkbox-selection)
- [Do's and Don'ts](#dos-and-donts)

> **Sizing behavior:** `ch-action-list-render` uses `contain: size`, which means the component does **not** contribute to its parent's intrinsic size. The parent must establish its own size through layout — for example, by being a grid or flex item, or by having an explicit `block-size`. If the parent has no size, the component will be invisible.
>
> The recommended approach is to place the component inside a grid or flex container that already has a defined size:
>
> ```css
> /* Recommended: parent establishes its own size via layout */
> .my-layout {
>   display: grid;
>   grid-template-rows: auto 1fr; /* action-list goes in the 1fr row */
> }
> ```

## Basic Usage

Demonstrates a simple action list with single selection.

### HTML

```html
<ch-action-list-render
  selection="single"
></ch-action-list-render>
```

### JavaScript

```js
const actionList = document.querySelector("ch-action-list-render");

actionList.model = [
  { id: "item-1", caption: "Dashboard", type: "actionable" },
  { id: "item-2", caption: "Reports", type: "actionable" },
  { id: "item-3", caption: "Settings", type: "actionable", selected: true }
];

actionList.addEventListener("selectedItemsChange", (event) => {
  const selectedItems = event.detail;
  console.log("Selected:", selectedItems.map(i => i.item.caption));
});
```

### Key Points

- The `model` property accepts an array of `ActionListItemModel` objects. Each actionable item requires an `id`, `caption`, and `type: "actionable"`.
- Set `selection="single"` to allow only one item to be selected at a time.
- Pre-select an item by setting `selected: true` on it in the model.
- The `selectedItemsChange` event fires whenever the selection changes and its `detail` contains the array of selected item models.

## Multiple Selection

Demonstrates a list that supports selecting multiple items using modifier-key clicks.

### HTML

```html
<ch-action-list-render
  selection="multiple"
></ch-action-list-render>
```

### JavaScript

```js
const actionList = document.querySelector("ch-action-list-render");

actionList.model = [
  { id: "file-1", caption: "report-2024.pdf", type: "actionable" },
  { id: "file-2", caption: "budget.xlsx", type: "actionable" },
  { id: "file-3", caption: "presentation.pptx", type: "actionable" },
  { id: "file-4", caption: "notes.txt", type: "actionable" }
];

actionList.addEventListener("selectedItemsChange", (event) => {
  const selectedItems = event.detail;
  console.log(
    "Selected files:",
    selectedItems.map(i => i.item.caption)
  );
});
```

### Key Points

- Set `selection="multiple"` to allow multi-selection.
- Hold Ctrl (Windows/Linux) or Cmd (macOS) while clicking to add or remove items from the current selection.
- Clicking an item without the modifier key clears the previous selection and selects only that item.
- The `selectedItemsChange` event fires after each selection change with the full list of currently selected items.

## Inline Editing

Demonstrates a list where item captions can be edited in-place.

### HTML

```html
<ch-action-list-render
  selection="single"
  editable-items
></ch-action-list-render>
```

### JavaScript

```js
const actionList = document.querySelector("ch-action-list-render");

actionList.model = [
  { id: "tab-1", caption: "Untitled Tab", type: "actionable", editable: true },
  { id: "tab-2", caption: "My Dashboard", type: "actionable", editable: true },
  { id: "tab-3", caption: "Read-only Item", type: "actionable", editable: false }
];

// Server-side callback to persist caption changes
actionList.modifyItemCaptionCallback = async (itemId, newCaption) => {
  await fetch(`/api/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ caption: newCaption })
  });
};
```

### Key Points

- Set `editableItems` to `true` (the default) to enable inline editing for all items. Override per-item with `editable: false`.
- The `modifyItemCaptionCallback` is called when the user confirms a caption edit. It receives the item ID and the new caption string.
- The component uses optimistic UI: the caption updates immediately in the UI. If the callback rejects, the caption reverts to its previous value.
- Items also support remove and fix/unfix actions via `removeItemCallback` and `fixItemCallback`.

## List with Checkbox Selection

Demonstrates an action list where each item displays a checkbox for toggling checked state.

### HTML

```html
<ch-action-list-render
  checkbox
  selection="none"
></ch-action-list-render>
```

### JavaScript

```js
const actionList = document.querySelector("ch-action-list-render");

actionList.model = [
  { id: "opt-1", caption: "Email notifications", type: "actionable", checked: true },
  { id: "opt-2", caption: "Push notifications", type: "actionable", checked: false },
  { id: "opt-3", caption: "SMS alerts", type: "actionable", checked: false }
];

actionList.addEventListener("itemClick", (event) => {
  const item = event.detail.item;
  console.log("Clicked:", item.caption, "Checked:", item.checked);
});
```

### Key Points

- Set the `checkbox` attribute to display a checkbox on all items by default. Override per-item with `checkbox: true/false`.
- Use `checked: true` on an item in the model to mark it as checked initially.
- When `selection="none"`, clicking an item fires the `itemClick` event instead of `selectedItemsChange`.
- Checkbox state and selection state are independent: an item can be checked without being selected and vice versa.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.

### Don't

- Don't set complex model/items data via HTML attributes — use JavaScript property assignment instead.
- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
