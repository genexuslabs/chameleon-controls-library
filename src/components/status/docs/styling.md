# ch-status: Styling

## Table of Contents

- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default](#case-1-default)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow DOM Layout

## Case 1: Default

```
<ch-status>
  | #shadow-root
  | <slot />
</ch-status>
```

## Styling Recipes

### Inline button spinner

```html
<button>
  <ch-status accessible-name="Saving">
    <span class="dot-spinner"></span>
  </ch-status>
  Saving...
</button>
```

```css
.dot-spinner {
  display: inline-block;
  inline-size: 12px;
  block-size: 12px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Overlay loading indicator

```html
<div class="content-region" id="data-panel">
  <ch-status accessible-name="Loading panel" .loadingRegionRef=${panelRef}>
    <div class="overlay-spinner"></div>
  </ch-status>
</div>
```

```css
.overlay-spinner {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.7);
}
```

### Pulsing dot indicator

```html
<ch-status accessible-name="Connecting">
  <span class="pulse-dot"></span>
</ch-status>
```

```css
.pulse-dot {
  display: inline-block;
  inline-size: 8px;
  block-size: 8px;
  border-radius: 50%;
  background-color: currentColor;
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
```

## Anti-patterns

- **Do not set `role="status"` or `aria-live` on the host from outside.** The component sets these attributes internally in `connectedCallback`. Adding them externally will cause duplicates.
- **Do not use `ch-status` for determinate progress.** If you can measure progress (percentage, steps), use `ch-progress` instead. `ch-status` is designed for indeterminate loading states only.
- **Do not forget `accessible-name`.** Without it, screen readers will announce the status region but may not convey its purpose. The component logs a warning if no accessible name is provided.

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-status__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-status::part(...)`) instead of tag names.
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
