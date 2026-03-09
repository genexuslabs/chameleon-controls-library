# ch-textblock: Styling

## Table of Contents

- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Auto-grow mode](#case-1-auto-grow-mode)
  - [Case 2: No auto-grow, text format](#case-2-no-auto-grow-text-format)
  - [Case 3: No auto-grow, HTML format](#case-3-no-auto-grow-html-format)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow DOM Layout

## Case 1: Auto-grow mode

```
<ch-textblock role="paragraph | heading">
  | #shadow-root
  | Caption text or <slot />
</ch-textblock>
```

## Case 2: No auto-grow, text format

```
<ch-textblock role="paragraph | heading">
  | #shadow-root
  | <div class="line-measure"></div>
  | <div class="content">
  |   Caption text
  | </div>
</ch-textblock>
```

## Case 3: No auto-grow, HTML format

```
<ch-textblock role="paragraph | heading">
  | #shadow-root
  | <div class="line-measure"></div>
  | <div class="html-content">
  |   <slot />
  | </div>
</ch-textblock>
```

## Styling Recipes

### Basic text block with line clamping

Constrain the host height and the component automatically calculates how many lines to display with ellipsis truncation.

```css
ch-textblock {
  block-size: 3.6em;
  font-size: 14px;
  line-height: 1.2em;
}
```

### Full-width paragraph

```css
ch-textblock {
  display: grid; /* override default inline-grid */
  inline-size: 100%;
  font-family: "Georgia", serif;
  color: var(--my-text-color, #333);
}
```

### Heading-style text block

Use the `accessibleRole` property for semantics and style the host with heading typography.

```css
ch-textblock[accessible-role="h1"] {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.3;
}

ch-textblock[accessible-role="h2"] {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;
}
```

### Auto-grow mode with max height fallback

When `autoGrow` is enabled the component expands to fit content. Add a `max-block-size` to prevent unbounded growth.

```css
ch-textblock {
  max-block-size: 200px;
  overflow-y: auto;
}
```

## Anti-patterns

1. **Do not manually set `--ch-textblock-displayed-lines` or `--ch-textblock-line-height`.** These custom properties are computed at runtime by an internal `ResizeObserver`. Overriding them will conflict with the component's calculations and produce broken truncation.

2. **Do not apply `overflow: hidden` on the host element.** The component already handles overflow and line clamping internally. Adding `overflow: hidden` on the host can interfere with the resize observer measurements and the ellipsis rendering.

3. **Do not use `text-overflow: ellipsis` on the host.** The component implements multi-line ellipsis via `-webkit-line-clamp` internally. Adding `text-overflow` on the host has no effect on multi-line content and may cause confusion.

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-textblock__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-textblock::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.

---

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).
