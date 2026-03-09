# ch-barcode-scanner: Styling

## Table of Contents

- [Overview](#overview)
- [Layout](#layout)
- [Internal Structure](#internal-structure)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)
## Overview

The `ch-barcode-scanner` component renders a camera video feed for real-time barcode and QR code scanning. It does not use Shadow DOM (`shadow: false`), so its internal elements can be styled directly.

## Layout

The component uses `display: grid` with `position: relative` on the host element and an absolutely positioned inner container. The scanner video feed fills the component's width.

```css
ch-barcode-scanner {
  display: grid;
  position: relative;
  inline-size: 100%;
  overflow: clip;
}
```

### Sizing the Scanner

The component requires explicit dimensions to display the camera feed. Set a height on the element or its container:

```css
ch-barcode-scanner {
  height: 300px;
}
```

Or use a flex/grid parent to control the size:

```css
.scanner-container {
  display: grid;
  height: 400px;
}

ch-barcode-scanner {
  /* Fills the container */
}
```

## Internal Structure

Since the component does not use Shadow DOM, the internal HTML structure is:

```html
<ch-barcode-scanner>
  <div class="ch-barcode-scanner-absolute">
    <div id="ch-barcode-scanner-0">
      <!-- html5-qrcode renders the video feed and scanning box here -->
    </div>
  </div>
</ch-barcode-scanner>
```

### Styling the Scanning Box

The `html5-qrcode` library renders its own scanning region overlay. Consult the [html5-qrcode documentation](https://github.com/nicecactus/html5-qrcode) for customization of the scanning box appearance.

## Anti-patterns

### 1. Setting `display: none` or `height: 0` on the scanner

The scanner computes the camera aspect ratio from the element's `clientWidth` and `clientHeight`. If the element is collapsed or hidden, the scanner cannot start.

```css
/* INCORRECT - the scanner cannot compute aspect ratio */
ch-barcode-scanner {
  height: 0;
}

/* CORRECT - provide explicit dimensions */
ch-barcode-scanner {
  height: 300px;
}
```

### 2. Using `overflow: visible` on the host

The component uses `overflow: clip` to prevent flickering during initial load. Overriding this may cause visual artifacts.

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-barcode-scanner__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-barcode-scanner::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.

---

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).
