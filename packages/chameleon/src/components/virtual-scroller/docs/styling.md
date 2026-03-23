# ch-virtual-scroller: Styling

## Table of Contents

- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default](#case-1-default)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow DOM Layout

## Case 1: Default

```
<ch-virtual-scroller>
  | #shadow-root
  | <slot />
</ch-virtual-scroller>
```

## Anti-patterns

### 1. Using `ch-virtual-scroller` outside of `ch-smart-grid`

```html
<!-- INCORRECT - the virtual scroller requires ch-smart-grid as its ancestor -->
<div style="overflow: auto;">
  <ch-virtual-scroller>
    <div>Item 1</div>
  </ch-virtual-scroller>
</div>

<!-- CORRECT -->
<ch-smart-grid>
  <ch-virtual-scroller slot="grid-content">
    <ch-smart-grid-cell>Item 1</ch-smart-grid-cell>
  </ch-virtual-scroller>
</ch-smart-grid>
```

### 2. Overriding internal CSS custom properties

```css
/* INCORRECT - these are managed by the component */
ch-virtual-scroller {
  --ch-virtual-scroll__scroll-start-size: 500px;
}
```

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-virtual-scroller__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-virtual-scroller::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.

---

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).
