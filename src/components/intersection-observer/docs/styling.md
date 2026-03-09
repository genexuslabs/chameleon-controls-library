# gx-intersection-observer: Styling

## Table of Contents

- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default](#case-1-default)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow DOM Layout

## Case 1: Default

```
<ch-intersection-observer>
  | #shadow-root
  | <slot name="content" />
</ch-intersection-observer>
```

## Anti-patterns

### 1. Relying on the host element for intersection observation

The observer does not observe the host element itself (which has `display: contents` and no box). Instead, it finds the first child element with a computed `display` other than `contents` and observes that element.

### 2. Using `display: contents` on the observed child

If the direct slotted child also uses `display: contents`, the observer traverses into its descendants to find the first element with a box. Avoid deeply nesting `display: contents` elements as it may lead to unexpected observation targets.

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-intersection-observer__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-intersection-observer::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.

---

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).
