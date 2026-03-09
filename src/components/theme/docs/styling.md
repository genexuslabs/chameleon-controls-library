# ch-theme: Styling

## Table of Contents

- [Overview](#overview)
- [FOUC Prevention](#fouc-prevention)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)
## Overview

The `ch-theme` component does not render any visible content and does not use Shadow DOM. It is a structural element that loads and attaches `CSSStyleSheet` objects to the nearest `Document` or `ShadowRoot` via the `adoptedStyleSheets` API. The component's host element has the `hidden` attribute set automatically.

Because `ch-theme` produces no visual output, there are no CSS custom properties, shadow parts, or styling hooks to customize.

## FOUC Prevention

When `avoidFlashOfUnstyledContent` is `true` (the default), the component injects a `<style>` element containing `visibility: hidden !important` into the host's root node until all theme loading promises settle. This prevents a flash of unstyled content while stylesheets are being fetched.

To disable this behavior (e.g., when themes are expected to be cached):

```html
<ch-theme
  avoid-flash-of-unstyled-content="false"
  model='[{"name": "my-theme", "url": "/themes/my-theme.css"}]'
></ch-theme>
```

## Anti-patterns

### 1. Applying CSS classes or styles directly to `ch-theme`

```css
/* INCORRECT - ch-theme is hidden and renders no visible content */
ch-theme {
  background-color: blue;
}

/* CORRECT - style the elements inside the themed root instead */
```

### 2. Nesting `ch-theme` inside Shadow DOM without understanding scope

The component attaches stylesheets to the root node where it is connected. If placed inside a Shadow DOM, stylesheets are attached to that `ShadowRoot`, not the document. This is intentional but can be surprising if you expect document-level theming.

```html
<!-- Attaches to the document -->
<body>
  <ch-theme model='["base-theme"]'></ch-theme>
</body>

<!-- Attaches to the shadow root of my-component -->
<my-component>
  #shadow-root
  <ch-theme model='["scoped-theme"]'></ch-theme>
</my-component>
```

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-theme__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-theme::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.

---

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).
