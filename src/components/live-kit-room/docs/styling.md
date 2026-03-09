# ch-live-kit-room: Styling

## Table of Contents

- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default](#case-1-default)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow DOM Layout

## Case 1: Default

```
<ch-live-kit-room>
  | #shadow-root
  | <slot />
  | <!-- for each participant in participants -->
  | <audio></audio>
</ch-live-kit-room>
```

## Anti-patterns

### 1. Styling audio elements inside the shadow root

```css
/* INCORRECT - audio elements are inside Shadow DOM and hidden */
ch-live-kit-room audio {
  display: block;
}

/* The audio elements are intentionally hidden and managed by the component */
```

### 2. Expecting visual output from the component itself

The component renders no visible UI. All visible content must be provided via the default slot.

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-live-kit-room__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-live-kit-room::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.

---

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).
