# ch-smart-grid: Styling

## Table of Contents

- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: With records and inverse loading](#case-1-with-records-and-inverse-loading)
  - [Case 2: With records and data provider (bottom loading)](#case-2-with-records-and-data-provider-bottom-loading)
  - [Case 3: Initial loading](#case-3-initial-loading)
  - [Case 4: Empty (no records, loaded)](#case-4-empty-no-records-loaded)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow DOM Layout

## Case 1: With records and inverse loading

```
<ch-smart-grid>
  | #shadow-root
  | <ch-infinite-scroll position="top">
  |   | #shadow-root
  |   | <!-- when loadingState === "loading" -->
  |   | <slot />
  | </ch-infinite-scroll>
  | <slot name="grid-content" />
</ch-smart-grid>
```

## Case 2: With records and data provider (bottom loading)

```
<ch-smart-grid>
  | #shadow-root
  | <slot name="grid-content" />
  | <ch-infinite-scroll>
  |   | #shadow-root
  |   | <!-- when loadingState === "loading" -->
  |   | <slot />
  | </ch-infinite-scroll>
</ch-smart-grid>
```

## Case 3: Initial loading

```
<ch-smart-grid>
  | #shadow-root
  | <slot name="grid-initial-loading-placeholder" />
</ch-smart-grid>
```

## Case 4: Empty (no records, loaded)

```
<ch-smart-grid>
  | #shadow-root
  | <slot name="grid-content-empty" />
</ch-smart-grid>
```

## Styling Recipes

### Chat-style Inverse Layout

```css
ch-smart-grid {
  height: 600px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

[slot="grid-content"] {
  display: grid;
  gap: 8px;
  padding: 12px;
}

ch-smart-grid-cell {
  padding: 8px 12px;
  border-radius: 12px;
  background-color: #f0f0f0;
  max-width: 80%;
}
```

### Skeleton Loading Placeholder

```css
[slot="grid-initial-loading-placeholder"] {
  display: grid;
  gap: 8px;
  padding: 16px;
}

.skeleton-row {
  height: 40px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## Anti-patterns

### 1. Forgetting to set a fixed height for scrollable grids

```css
/* INCORRECT - without a height constraint, the scrollbar never appears */
ch-smart-grid {
  /* no height set, autoGrow is false */
}

/* CORRECT - set a height so overflow triggers scrolling */
ch-smart-grid {
  height: 400px;
}
```

### 2. Overriding the internal grid template

```css
/* INCORRECT - the component manages its own grid-template-rows */
ch-smart-grid {
  grid-template-rows: auto 1fr auto;
}

/* CORRECT - let the component manage its layout; style slotted content instead */
[slot="grid-content"] {
  gap: 8px;
}
```

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-smart-grid__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-smart-grid::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.
