# ch-tree-view-render: Styling

## Table of Contents

- [Sizing Behavior](#sizing-behavior)
- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default](#case-1-default)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Sizing Behavior

> **Sizing behavior:** `ch-tree-view-render` uses `contain: size`, which means the component does **not** contribute to its parent's intrinsic size. The parent must establish its own size through layout. If the parent has no size, the component will be invisible.
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

## Shadow Parts

| Part                         | Description                                                                                                                                                                                                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"checked"`                  | Present in the `item__checkbox-input`, `item__checkbox-option` and `item__checkbox-container` parts when the item is checked and not indeterminate (`checked` === `true` and `indeterminate !== true`).                                                           |
| `"collapsed"`                | Present in the `item__action`, `item__expandable-button` and `item__group` parts when the item is collapsed (`expanded` !== `true`).                                                                                                                              |
| `"disabled"`                 | Present in the `item__header`, `item__expandable-button`, `item__checkbox-input`, `item__checkbox-option` and `item__checkbox-container` parts when the item is disabled (`disabled` === `true`).                                                                 |
| `"drag-enter"`               | Present in the `item` and `item__header` parts when a valid drop operation is over the item.                                                                                                                                                                      |
| `"drag-preview"`             | The element that contains the preview information for the current drag.                                                                                                                                                                                           |
| `"editing"`                  | Present in the `item__header` and `item__action` parts when the item is in edit mode.                                                                                                                                                                             |
| `"end-img"`                  | Present in the `item__img` part when the item has an end image element (`endImgSrc` is defined and `endImgType` === "img").                                                                                                                                       |
| `"even-level"`               | Present in the `item__group` and `item__header` parts when the item is in an even level.                                                                                                                                                                          |
| `"expand-button"`            | Present in the `item__header` part when the item has an expandable button (`level !== 0`, `leaf !== true` and `expandableButton !== "no"`).                                                                                                                       |
| `"expanded"`                 | Present in the `item__action`, `item__expandable-button` and `item__group` parts when the item is expanded (`expanded` === `true`).                                                                                                                               |
| `"indeterminate"`            | Present in the `item__checkbox-input`, `item__checkbox-option` and `item__checkbox-container` parts when the item is indeterminate (`indeterminate` === `true`).                                                                                                  |
| `"item"`                     | The host element of the each item.                                                                                                                                                                                                                                |
| `"item__action"`             | A sub element of the header (item__header part) that contains the main information related to the item (startImage, caption/edit-caption, endImage and downloading).                                                                                              |
| `"item__checkbox"`           | The host element of the item's checkbox.                                                                                                                                                                                                                          |
| `"item__checkbox-container"` | The container that serves as a wrapper for the `input` and the `option` parts of the checkbox.                                                                                                                                                                    |
| `"item__checkbox-input"`     | The input element that implements the interactions for the checkbox.                                                                                                                                                                                              |
| `"item__checkbox-option"`    | The actual "input" that is rendered above the `item__checkbox-input` part of the checkbox. This part has `position: absolute` and `pointer-events: none`.                                                                                                         |
| `"item__downloading"`        | The spinner element that is rendered when an item is lazy loading its content. This element is rendered at the end of the `item__action` part.                                                                                                                    |
| `"item__edit-caption"`       | The input element that is rendered when an item is editing its caption. When rendered this element replaces the caption of the `item__action` part.                                                                                                               |
| `"item__expandable-button"`  | The actionable expandable button element that is rendered when an item has subitems and the expandable button is interactive (`leaf !== true` and `expandableButton === "action"`). When rendered this element is placed at the start of the `item__action` part. |
| `"item__group"`              | The container element for the subitems that is rendered when the content of an item has been lazy loaded.                                                                                                                                                         |
| `"item__header"`             | The container for all elements -excepts the subitems (`item__group` part)- of an item. It contains the `item__expandable-button`, `item_checkbox` and `item__action` parts.                                                                                       |
| `"item__img"`                | The img element that is rendered when an item has images (`startImgSrc` is defined and/or `endImgSrc` is defined).                                                                                                                                                |
| `"item__line"`               | The element that is rendered to display the relationship between the an item and its parent. Rendered if the item is not in the first level and `showLines !== "none"`.                                                                                           |
| `"last-line"`                | Present in the `item__line` part if the item is the last item of its parent item in `showLines = "last"` mode (`showLines === "last"`, `level !== 0` and `lastItem === true`).                                                                                    |
| `"lazy-loaded"`              | Present in the `item__group` part when the content of the item has been loaded.                                                                                                                                                                                   |
| `"not-editing"`              | Present in the `item__header` and `item__action` parts when the item isn't in edit mode.                                                                                                                                                                          |
| `"not-selected"`             | Present in the `item__header` part when the item isn't selected (`selected` !== `true`).                                                                                                                                                                          |
| `"odd-level"`                | Present in the `item__group` and `item__header` parts when the item is in an odd level.                                                                                                                                                                           |
| `"selected"`                 | Present in the `item__header` part when the item is selected (`selected` === `true`).                                                                                                                                                                             |
| `"start-img"`                | Present in the `item__img` part when the item has an start image element (`startImgSrc` is defined and `startImgType` === "img").                                                                                                                                 |
| `"unchecked"`                | Present in the `item__checkbox-input`, `item__checkbox-option` and `item__checkbox-container` parts when the item is unchecked and not indeterminate (`checked` !== `true` and `indeterminate !== true`).                                                         |

## CSS Custom Properties

| Name                                              | Description                                                                                                                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--ch-tree-view-item-custom-padding-inline-start` | Specifies an additional value for the padding-inline-start of the items without breaking the indentation of the items. @default 0px                                                  |
| `--ch-tree-view-item-gap`                         | Specifies the spacing between the images, checkbox, text and the expandable button of the items. @default 0px                                                                        |
| `--ch-tree-view-item__background-image-size`      | Specifies the size of the start and end images of the items. @default 100%                                                                                                           |
| `--ch-tree-view-item__checkbox-size`              | Specifies the checkbox size of the items. @default 0.875em                                                                                                                           |
| `--ch-tree-view-item__expandable-button-size`     | Specifies the expandable button size of the items. @default 0.875em                                                                                                                  |
| `--ch-tree-view-item__image-size`                 | Specifies the box size that contains the start or end images of the items. @default 0.875em                                                                                          |
| `--ch-tree-view-item__line--inset-inline-end`     | Specifies the separation that only applies for the inline end position of the item's line. This separation visually shows a gap between the line and the item's header. @default 0px |
| `--ch-tree-view-item__line--inset-inline-start`   | Specifies an additional separation that only applies for the inline start position of the item's line. @default 0px                                                                  |

## Shadow DOM Layout

## Case 1: Default

```
<ch-tree-view-render aria-multiselectable="{multiSelection}">
  | #shadow-root
  | <ch-tree-view>
  |   | #shadow-root
  |   | <div part="drag-preview"></div>
  |   | <slot />
  |
  |   <!-- for each item in model -->
  |   <ch-tree-view-item role="treeitem" aria-level="{level}" aria-selected="{selected}" part="item [drag-enter]">
  |     | #shadow-root
  |     | <button aria-expanded="{expanded}" aria-controls="expandable" part="item__header [disabled] [drag-enter] [selected | not-selected] [expand-button] [editing | not-editing] [level-0-leaf] [even-level | odd-level] [expanded | collapsed]">
  |     |
  |     |   <!-- when expandableButton === "action" && !leaf -->
  |     |   <button part="item__expandable-button [disabled] [expanded | collapsed]"></button>
  |     |
  |     |   <!-- when checkbox -->
  |     |   <ch-checkbox part="item__checkbox [checked | unchecked | indeterminate] [disabled]">
  |     |     | #shadow-root
  |     |     | <div part="item__checkbox-container">
  |     |     |   <input part="item__checkbox-input" type="checkbox" />
  |     |     |   <div part="item__checkbox-option"></div>
  |     |     | </div>
  |     |   </ch-checkbox>
  |     |
  |     |   <!-- when customRender: custom content slot -->
  |     |   <slot name="custom-content" />
  |     |
  |     |   <!-- else (default action) -->
  |     |   <div part="item__action [editing | not-editing] [expanded | collapsed]">
  |     |     <!-- when startImgSrc -->
  |     |     <div part="item__img start-img"></div>
  |     |     <!-- when editing -->
  |     |     <input part="item__edit-caption" />
  |     |     <!-- else -->
  |     |     Caption text
  |     |     <!-- when endImgSrc -->
  |     |     <div part="item__img end-img"></div>
  |     |   </div>
  |     |
  |     |   <!-- when downloading && !leaf -->
  |     |   <div part="item__downloading"></div>
  |     |
  |     |   <!-- when showLines -->
  |     |   <div part="item__line [last-line]"></div>
  |     |
  |     | </button>
  |     |
  |     | <!-- when !leaf (has children) -->
  |     | <div id="expandable" role="group" aria-busy="{downloading}" part="item__group [expanded | collapsed] [even-level | odd-level] [lazy-loaded]">
  |     |   <slot />
  |     | </div>
  |   </ch-tree-view-item>
  | </ch-tree-view>
</ch-tree-view-render>
```

## Styling Recipes

### File Explorer Tree

A tree styled like a file explorer with indentation lines.

```css
ch-tree-view-render {
  --ch-tree-view-item-gap: 4px;
  --ch-tree-view-item__image-size: 18px;
  --ch-tree-view-item__expandable-button-size: 16px;
  --ch-tree-view-item-custom-padding-inline-start: 8px;
}

ch-tree-view-render::part(item__header) {
  padding-block: 2px;
  border-radius: 4px;
}

ch-tree-view-render::part(item__header):hover {
  background-color: rgba(0, 0, 0, 0.04);
}

ch-tree-view-render::part(item__header selected) {
  background-color: #0078d4;
  color: white;
}

ch-tree-view-render::part(item__line) {
  border-color: #ccc;
}
```

### Checkbox Tree Styling

Style checkboxes within a tree for multi-selection scenarios.

```css
ch-tree-view-render {
  --ch-tree-view-item__checkbox-size: 16px;
  --ch-tree-view-item-gap: 6px;
}

ch-tree-view-render::part(item__checkbox-input) {
  border: 2px solid #999;
  border-radius: 3px;
}

ch-tree-view-render::part(item__checkbox-input checked) {
  border-color: #0078d4;
  background-color: #0078d4;
}

ch-tree-view-render::part(item__checkbox-option checked) {
  background-color: white;
}

ch-tree-view-render::part(item__checkbox-input indeterminate) {
  border-color: #0078d4;
  background-color: #0078d4;
}
```

### Connection Lines

Style the relationship lines between tree nodes.

```css
ch-tree-view-render {
  --ch-tree-view-item__line--inset-inline-start: 4px;
  --ch-tree-view-item__line--inset-inline-end: 8px;
}

ch-tree-view-render::part(item__line) {
  border-color: #ddd;
  border-width: 1px;
}

ch-tree-view-render::part(item__line last-line) {
  border-bottom-left-radius: 6px;
}
```

## Anti-patterns

### 1. Using attribute selectors instead of state parts

```css
/* INCORRECT - attribute selectors do not reliably reflect internal state */
ch-tree-view-render[show-lines="all"]::part(item__line) {
  border-color: blue;
}

/* CORRECT - use state parts */
ch-tree-view-render::part(item__line) {
  border-color: blue;
}
```

### 2. Using combinators after `::part()`

```css
/* INCORRECT - combinators after ::part() are not supported */
ch-tree-view-render::part(item__header) > div {
  color: red;
}

/* CORRECT - target the part directly */
ch-tree-view-render::part(item__action) {
  color: red;
}
```

### 3. Setting `contain` or `overflow` on the host

```css
/* INCORRECT - overriding containment breaks tree layout and drag-and-drop */
ch-tree-view-render {
  contain: layout;
  overflow: hidden;
}

/* CORRECT - the component already sets contain: size and overflow: auto */
ch-tree-view-render {
  /* No containment override needed */
}
```

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-tree-view__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-tree-view::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.
