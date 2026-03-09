# ch-flexible-layout-render: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default (with model)](#case-1-default-with-model)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow Parts

| Part               | Description                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| `"droppable-area"` | The overlay surface rendered over the layout when a widget is being dragged, enabling drop-zone detection. |
| `"leaf"`           | The container element for a leaf node (either a single-widget view or a tabbed widget group).              |

## Shadow DOM Layout

## Case 1: Default (with model)

```
<ch-flexible-layout-render>
  | #shadow-root
  | <!-- when theme -->
  | <ch-theme></ch-theme>
  |
  | <ch-flexible-layout>
  |   | #shadow-root
  |   | <ch-layout-splitter>
  |   |   | #shadow-root
  |   |   | <div>
  |   |   |   <!-- for each item in layout.items -->
  |   |   |   <div part="{item.id}">
  |   |   |     <slot name="{item.id}" />
  |   |   |   </div>
  |   |   |   <div part="bar"></div>
  |   |   | </div>
  |   |
  |   |   <!-- for each single-content leaf in layout -->
  |   |   <slot name="{widget.id}" slot="{leaf.id}" />
  |   |
  |   |   <!-- for each tabbed leaf in layout -->
  |   |   <ch-tab-render slot="{leaf.id}" part="{leaf.id} leaf">
  |   |     | #shadow-root
  |   |     | <div part="tab-list">
  |   |     |   <!-- for each widget in leaf.widgets -->
  |   |     |   <button part="{item.id} tab [selected | not-selected] [disabled] [closable | not-closable]">
  |   |     |     <ch-textblock part="{item.id} tab-caption [selected | not-selected]">
  |   |     |       | #shadow-root
  |   |     |       | Caption text
  |   |     |     </ch-textblock>
  |   |     |     <!-- when closeButton -->
  |   |     |     <button part="{item.id} close-button [selected | not-selected] [disabled]"></button>
  |   |     |   </button>
  |   |     | </div>
  |   |     | <div part="tab-panel-container">
  |   |     |   <!-- for each widget in leaf.widgets -->
  |   |     |   <div part="{item.id} tab-panel [selected | not-selected] [disabled]">
  |   |     |     <slot name="{widget.id}" />
  |   |     |   </div>
  |   |     | </div>
  |   |
  |   |     <!-- for each widget in leaf.widgets -->
  |   |     <slot name="{widget.id}" slot="{widget.id}" />
  |   |   </ch-tab-render>
  |   | </ch-layout-splitter>
  |   |
  |   | <div part="droppable-area" popover="manual"></div>
  |
  |   <!-- for each widget in allWidgets -->
  |   <div slot="{widget.id}">
  |     <slot name="{widget.id}" />
  |   </div>
  | </ch-flexible-layout>
</ch-flexible-layout-render>
```

## Styling Recipes

### Full-height IDE Layout

Ensure the flexible layout fills its container.

```css
ch-flexible-layout-render {
  display: block;
  width: 100%;
  height: 100%;
}
```

### Custom Tab Appearance

Since `ch-flexible-layout-render` renders `ch-tab` components internally for tabbed leaves, you can style the tabs through the theme system or by targeting the inner `ch-tab` parts.

```css
/* Style via theme model - preferred approach */
ch-flexible-layout-render {
  --ch-tab-button-inline-size: auto;
}
```

### Widget Container Overflow

Control overflow behavior for all widgets globally or per-widget via the `contain` and `overflow` properties.

```html
<ch-flexible-layout-render
  contain="size"
  overflow="auto"
></ch-flexible-layout-render>
```

## Anti-patterns

### 1. Styling widget content from outside the shadow DOM

```css
/* INCORRECT - cannot reach into shadow DOM children */
ch-flexible-layout-render .my-widget {
  padding: 16px;
}

/* CORRECT - use slotted widgets and style in the host document */
[slot="my-widget-id"] {
  padding: 16px;
}
```

### 2. Using fixed dimensions on widgets without overflow control

```css
/* INCORRECT - content may overflow without scrollbars */
ch-flexible-layout-render {
  overflow: visible;
}

/* CORRECT - set overflow for scrollable widget content */
```

```html
<ch-flexible-layout-render overflow="auto"></ch-flexible-layout-render>
```

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-flexible-layout__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-flexible-layout::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.
