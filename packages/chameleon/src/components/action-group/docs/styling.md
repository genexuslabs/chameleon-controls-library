# ch-action-group-render: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Responsive collapse with overflow menu](#case-1-responsive-collapse-with-overflow-menu)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow Parts

| Part          | Description                                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `"separator"` | A horizontal divider rendered for items of `type: "separator"`. Also receives the item's `id` and custom `parts` if defined. |
| `"vertical"`  | Present on `separator` items.                                                                                                |

## Shadow DOM Layout

## Case 1: Responsive collapse with overflow menu

```
<ch-action-group-render>
  | #shadow-root
  |
  | <!-- when responsive collapse && collapsedItems > 0 -->
  | <ch-action-menu-render>
  |   | #shadow-root
  |   | <button part="expandable-button [expanded | collapsed] [disabled]">
  |   |   <slot />
  |   | </button>
  |   | <!-- when expanded -->
  |   | <ch-popover part="window">
  |   |   | #shadow-root
  |   |   | <slot />
  |   |
  |   |   <!-- for each collapsedItem in collapsedItems -->
  |   |   <ch-action-menu role="listitem">
  |   |     | #shadow-root
  |   |     | <!-- Button item (no link) -->
  |   |     | <button part="button [disabled] [expanded | collapsed] [{parts}]">
  |   |     |   <span part="content [{parts}]">Caption text</span>
  |   |     |   <!-- when shortcut -->
  |   |     |   <span part="shortcut [{parts}]">Ctrl+S</span>
  |   |     | </button>
  |   |     |
  |   |     | <!-- else (link item) -->
  |   |     | <a part="link [disabled] [expanded | collapsed] [{parts}]">
  |   |     |   <span part="content [{parts}]">Caption text</span>
  |   |     |   <!-- when shortcut -->
  |   |     |   <span part="shortcut [{parts}]">Ctrl+S</span>
  |   |     | </a>
  |   |     |
  |   |     | <!-- when expandable && expanded (sub-menu) -->
  |   |     | <ch-popover role="list" part="window [{parts}]">
  |   |     |   | #shadow-root
  |   |     |   | <slot />
  |   |     |
  |   |     |   <!-- Nested ch-action-menu (recursive) -->
  |   |     | </ch-popover>
  |   |   </ch-action-menu>
  |   | </ch-popover>
  |
  |   <!-- for each slotItem in collapsedItems -->
  |   <slot slot="{item.id}" name="{item.id}" />
  | </ch-action-menu-render>
  |
  | <!-- for each item in model -->
  | <!-- Actionable item -->
  | <ch-action-menu-render role="listitem">
  |   | #shadow-root
  |   | <button part="expandable-button [expanded | collapsed] [disabled]">
  |   |   <slot />
  |   | </button>
  |   | <!-- when expanded -->
  |   | <ch-popover role="list" part="window">
  |   |   | #shadow-root
  |   |   | <slot />
  |   |
  |   |   <!-- for each item in model -->
  |   |   <ch-action-menu role="listitem">
  |   |     | #shadow-root
  |   |     | <!-- Button item (no link) -->
  |   |     | <button part="button [disabled] [expanded | collapsed] [{parts}]">
  |   |     |   <span part="content [{parts}]">Caption text</span>
  |   |     |   <!-- when shortcut -->
  |   |     |   <span part="shortcut [{parts}]">Ctrl+S</span>
  |   |     | </button>
  |   |     |
  |   |     | <!-- else (link item) -->
  |   |     | <a part="link [disabled] [expanded | collapsed] [{parts}]">
  |   |     |   <span part="content [{parts}]">Caption text</span>
  |   |     |   <!-- when shortcut -->
  |   |     |   <span part="shortcut [{parts}]">Ctrl+S</span>
  |   |     | </a>
  |   |     |
  |   |     | <!-- when expandable && expanded (sub-menu) -->
  |   |     | <ch-popover role="list" part="window [{parts}]">
  |   |     |   | #shadow-root
  |   |     |   | <slot />
  |   |     |
  |   |     |   <!-- Nested ch-action-menu (recursive) -->
  |   |     | </ch-popover>
  |   |   </ch-action-menu>
  |   |
  |   |   <!-- Separator (between items) -->
  |   |   <hr part="separator [{parts}]" role="listitem" />
  |   | </ch-popover>
  | </ch-action-menu-render>
  |
  | <!-- Separator -->
  | <hr part="[{item.id}] separator vertical [{item.parts}]" />
  |
  | <!-- Slot item -->
  | <slot role="listitem" name="{item.id}" />
</ch-action-group-render>
```

## Styling Recipes

### Toolbar with Gap and Separators

A horizontal toolbar with consistent spacing.

```css
ch-action-group-render {
  gap: 4px;
  padding: 4px;
  background: #f5f5f5;
  border-radius: 8px;
}
```

### Responsive Overflow Button

Style the "more actions" button and dropdown via exported parts from the embedded `ch-action-menu-render`.

```css
ch-action-group-render::part(expandable-button) {
  padding: 6px;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
}

ch-action-group-render::part(expandable-button):hover {
  background-color: rgba(0, 0, 0, 0.06);
}

ch-action-group-render::part(window) {
  min-inline-size: 160px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 4px;
}
```

### Multiline Wrap Layout

When using `items-overflow-behavior="multiline"`, the group wraps items to additional rows.

```css
ch-action-group-render[items-overflow-behavior="multiline"] {
  gap: 4px 8px;
  padding: 4px;
}
```

## Anti-patterns

### 1. Using attribute selectors instead of state parts

```css
/* INCORRECT - attribute selectors do not reliably reflect internal state */
ch-action-group-render[items-overflow-behavior]::part(expandable-button) {
  display: block;
}

/* CORRECT - the overflow button is only rendered when there are collapsed items */
ch-action-group-render::part(expandable-button) {
  display: block;
}
```

### 2. Using combinators after `::part()`

```css
/* INCORRECT - combinators after ::part() are not supported */
ch-action-group-render::part(expandable-button) > span {
  color: red;
}

/* CORRECT - target the part directly */
ch-action-group-render::part(expandable-button) {
  color: red;
}
```

### 3. Setting `overflow: hidden` on the host

```css
/* INCORRECT - clipping the host prevents responsive collapse from detecting hidden items */
ch-action-group-render {
  overflow: hidden;
}

/* CORRECT - let the component manage overflow internally via itemsOverflowBehavior */
ch-action-group-render {
  /* No overflow override needed */
}
```

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-action-group__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-action-group::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.
