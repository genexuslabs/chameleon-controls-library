# ch-markdown-viewer: Styling

## Table of Contents

- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: With value](#case-1-with-value)
  - [Case 2: No value](#case-2-no-value)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow DOM Layout

## Case 1: With value

```
<ch-markdown-viewer>
  | #shadow-root
  | <!-- when theme -->
  | <ch-theme></ch-theme>
  |
  | <ch-markdown-viewer-lit>
  |   | #shadow-root
  |   | ...rendered markdown HTML...
  | </ch-markdown-viewer-lit>
</ch-markdown-viewer>
```

## Case 2: No value

```
<ch-markdown-viewer>
  | #shadow-root
  | (empty)
</ch-markdown-viewer>
```

## Styling Recipes

### GitHub-style Markdown

```css
ch-markdown-viewer {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #24292e;
  max-width: 800px;
}
```

### Dark Theme

```css
ch-markdown-viewer {
  color: #d4d4d4;
  background-color: #1e1e1e;
}
```

## Anti-patterns

### 1. Trying to style inner elements from outside the shadow DOM

```css
/* INCORRECT - these elements are inside the shadow DOM */
ch-markdown-viewer h1 {
  color: blue;
}

/* CORRECT - use the theme property to load a stylesheet into the shadow DOM */
```

```html
<ch-markdown-viewer theme="my-custom-theme"></ch-markdown-viewer>
```

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-markdown-viewer__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-markdown-viewer::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.
