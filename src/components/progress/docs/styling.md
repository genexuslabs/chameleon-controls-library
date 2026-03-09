# ch-progress: Styling

## Table of Contents

- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Custom render (default)](#case-1-custom-render-default)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow DOM Layout

## Case 1: Custom render (default)

```
<ch-progress role="progressbar">
  | #shadow-root
  | <slot />
</ch-progress>
```

## Styling Recipes

### Determinate progress bar

```html
<ch-progress value="45" max="100" accessible-name="File upload">
  <div class="progress-track">
    <div class="progress-bar" style="width: 45%"></div>
  </div>
</ch-progress>
```

```css
.progress-track {
  inline-size: 100%;
  block-size: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  block-size: 100%;
  background: #4caf50;
  transition: width 0.2s ease;
}
```

### Indeterminate spinner

```html
<ch-progress indeterminate accessible-name="Loading">
  <div class="spinner"></div>
</ch-progress>
```

```css
.spinner {
  inline-size: 24px;
  block-size: 24px;
  border: 3px solid #e0e0e0;
  border-top-color: #1a73e8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Progress with label text

```html
<ch-progress value="3" max="10" accessible-name="Steps completed"
  accessible-value-text="Step {{PROGRESS_VALUE}} of {{PROGRESS_MAX_VALUE}}">
  <span class="progress-label">Step 3 of 10</span>
</ch-progress>
```

```css
ch-progress {
  display: inline-flex;
  align-items: center;
}

.progress-label {
  font-size: 0.875rem;
  color: #555;
}
```

## Anti-patterns

- **Do not rely on internal DOM structure.** The component uses Shadow DOM with a slot; style your own projected content, not internal elements.
- **Do not set `role` or `aria-value*` attributes on the host from outside.** The component manages all ARIA attributes (`role="progressbar"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`) internally. Adding them externally will cause duplicates or conflicts.
- **Do not use `ch-progress` purely for visual decoration without setting `accessible-name`.** The component will log an accessibility warning if no accessible name is provided.

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-progress__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-progress::part(...)`) instead of tag names.
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
