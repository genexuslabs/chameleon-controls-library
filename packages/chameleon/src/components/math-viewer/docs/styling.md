# ch-math-viewer: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Successfully rendered blocks](#case-1-successfully-rendered-blocks)
  - [Case 2: Block with error](#case-2-block-with-error)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow Parts

| Part      | Description                                                                                                                                                                           |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"error"` | A `<span>` rendered in place of a math block when KaTeX fails to parse the expression. Contains the raw source text and exposes the error message via `aria-description` and `title`. |

## Shadow DOM Layout

## Case 1: Successfully rendered blocks

```
<ch-math-viewer>
  | #shadow-root
  | <!-- for each block in renderedBlocks -->
  | <div><!-- rendered KaTeX HTML --></div>
</ch-math-viewer>
```

## Case 2: Block with error

```
<ch-math-viewer>
  | #shadow-root
  | <!-- for each block in renderedBlocks -->
  | <span part="error" title="error message">
  |   Raw expression text
  | </span>
</ch-math-viewer>
```

## Styling Recipes

### Consistent Math Sizing

```css
ch-math-viewer {
  font-size: 1.1em;
  color: #333;
}
```

### Math in a Card

```css
.math-card {
  padding: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  text-align: center;
}

.math-card ch-math-viewer {
  font-size: 1.2em;
}
```

### Inline Math in Text

```css
p ch-math-viewer[display-mode="inline"] {
  font-size: 1em;
  margin: 0 2px;
}
```

## Anti-patterns

### 1. Forgetting to include KaTeX fonts

```html
<!-- INCORRECT - fonts not loaded, math renders with fallback serif font -->
<ch-math-viewer value="E = mc^2"></ch-math-viewer>

<!-- CORRECT - include the font-faces mixin in your SCSS first -->
```

### 2. Using CSS to override KaTeX internal layout

```css
/* INCORRECT - KaTeX uses precise positioning; overriding breaks alignment */
ch-math-viewer .katex .base {
  display: block;
}

/* CORRECT - only style the host element and the error part */
ch-math-viewer {
  font-size: 1.1em;
}
ch-math-viewer::part(error) {
  color: red;
}
```

### 3. Using combinators after `::part()`

```css
/* INCORRECT - combinators after ::part() are not supported */
ch-math-viewer::part(error) span {
  font-weight: bold;
}

/* CORRECT - target the part directly */
ch-math-viewer::part(error) {
  font-weight: bold;
}
```

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-math-viewer__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-math-viewer::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.
