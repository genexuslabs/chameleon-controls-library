# ch-sidebar: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Expand button before content](#case-1-expand-button-before-content)
  - [Case 2: Expand button after content](#case-2-expand-button-after-content)
  - [Case 3: No expand button](#case-3-no-expand-button)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow Parts

| Part              | Description                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| `"collapsed"`     | Present on the expand button when the sidebar is collapsed.                                       |
| `"expand-button"` | The button that toggles the expanded/collapsed state. Rendered when `showExpandButton` is `true`. |
| `"expanded"`      | Present on the expand button when the sidebar is expanded.                                        |

## CSS Custom Properties

| Name                                     | Description                                                                                                                                                                                                                                                                        |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ch-sidebar-inline-size--collapsed`    | Specifies the inline size of the sidebar when collapsed. @default auto                                                                                                                                                                                                             |
| `--ch-sidebar-inline-size--expanded`     | Specifies the inline size of the sidebar when expanded. @default auto                                                                                                                                                                                                              |
| `--ch-sidebar__chevron-background-image` | Specifies the image of expand button. @default url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" style="transform:rotate(-90deg)" viewBox="0 0 18 18" fill="none"><path d="M16.5 5L8.7 12.7L1 5" stroke="%23000" stroke-width="1.2" stroke-linecap="round"/></svg>') |
| `--ch-sidebar__chevron-image-size`       | Specifies the image size of the expandable button. @default 100%                                                                                                                                                                                                                   |
| `--ch-sidebar__chevron-size`             | Specifies the expandable button size. @default 0.875em                                                                                                                                                                                                                             |

## Shadow DOM Layout

## Case 1: Expand button before content

```
<ch-sidebar>
  | #shadow-root
  | <!-- when showExpandButton && expandButtonPosition === "before" -->
  | <button part="expand-button [expanded | collapsed]"></button>
  | <slot />
</ch-sidebar>
```

## Case 2: Expand button after content

```
<ch-sidebar>
  | #shadow-root
  | <slot />
  | <!-- when showExpandButton && expandButtonPosition === "after" -->
  | <button part="expand-button [expanded | collapsed]"></button>
</ch-sidebar>
```

## Case 3: No expand button

```
<ch-sidebar>
  | #shadow-root
  | <slot />
</ch-sidebar>
```

## Styling Recipes

### Fixed-Width Sidebar

Define explicit widths for expanded and collapsed states.

```css
ch-sidebar {
  --ch-sidebar-inline-size--expanded: 260px;
  --ch-sidebar-inline-size--collapsed: 56px;
  border-inline-end: 1px solid #e0e0e0;
  background-color: #fafafa;
}
```

### Animated Expand/Collapse

Add a transition for smooth expand and collapse animations.

```css
ch-sidebar {
  --ch-sidebar-inline-size--expanded: 260px;
  --ch-sidebar-inline-size--collapsed: 56px;
  transition: inline-size 200ms ease;
}
```

### Hidden When Collapsed

Completely hide the sidebar when collapsed by setting the collapsed size to zero.

```css
ch-sidebar {
  --ch-sidebar-inline-size--expanded: 280px;
  --ch-sidebar-inline-size--collapsed: 0px;
  overflow: hidden;
  transition: inline-size 200ms ease;
}
```

### Custom Expand Button

Replace the default expand button icon and adjust styling.

```css
ch-sidebar {
  --ch-sidebar__chevron-background-image: url("data:image/svg+xml,...");
  --ch-sidebar__chevron-size: 24px;
  --ch-sidebar__chevron-image-size: 80%;
}

ch-sidebar::part(expand-button) {
  padding: 10px;
  border-block-start: 1px solid #e0e0e0;
}
```

### Focus Ring

Add a visible focus indicator for keyboard navigation.

```css
ch-sidebar::part(expand-button):focus-visible {
  outline: 2px solid #0078d4;
  outline-offset: -2px;
}
```

## Anti-patterns

### 1. Using host class selectors instead of state parts

```css
/* INCORRECT - internal host classes are implementation details */
ch-sidebar.ch-sidebar--collapsed::part(expand-button) {
  color: red;
}

/* CORRECT - use state parts */
ch-sidebar::part(expand-button collapsed) {
  color: red;
}
```

### 2. Using combinators after `::part()`

```css
/* INCORRECT - combinators after ::part() are not supported */
ch-sidebar::part(expand-button) > span {
  font-size: 12px;
}

/* CORRECT - target the part directly */
ch-sidebar::part(expand-button) {
  font-size: 12px;
}
```

### 3. Manually hiding the sidebar with display: none

```css
/* INCORRECT - breaks the component's expanded state management */
ch-sidebar {
  display: none;
}

/* CORRECT - use the expanded property and collapsed size */
ch-sidebar {
  --ch-sidebar-inline-size--collapsed: 0px;
}
```

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-sidebar__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-sidebar::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.
