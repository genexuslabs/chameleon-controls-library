# ch-qr: Styling

## Table of Contents

- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: With value](#case-1-with-value)
  - [Case 2: No value](#case-2-no-value)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow DOM Layout

## Case 1: With value

```
<ch-qr role="img">
  | #shadow-root
  | <div>
  |   <!-- Canvas appended via componentDidRender -->
  | </div>
</ch-qr>
```

## Case 2: No value

```
<ch-qr>
  | #shadow-root
  | (empty)
</ch-qr>
```

## Anti-patterns

### 1. Using CSS to resize the QR code

```css
/* INCORRECT - scaling the canvas via CSS produces blurry output */
ch-qr {
  width: 256px;
  height: 256px;
}

/* CORRECT - use the size property for crisp rendering */
```

```html
<ch-qr value="https://example.com" size="256"></ch-qr>
```

### 2. Styling the internal canvas

```css
/* INCORRECT - the canvas is inside Shadow DOM and cannot be targeted */
ch-qr canvas {
  border-radius: 8px;
}

/* CORRECT - style the host element instead */
ch-qr {
  border-radius: 8px;
  overflow: hidden;
}
```

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-qr__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-qr::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.

---

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

---

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

---

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

---

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

---

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

---

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

---

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).
