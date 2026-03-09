# ch-accordion-render: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default (items from model)](#case-1-default-items-from-model)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow Parts

| Part          | Description                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------- |
| `"collapsed"` | Present in the `header`, `panel`, and `section` parts when the item is collapsed.             |
| `"disabled"`  | Present in the `header`, `panel`, and `section` parts when the item is disabled.              |
| `"expanded"`  | Present in the `header`, `panel`, and `section` parts when the item is expanded.              |
| `"header"`    | The clickable `<button>` element that toggles the collapsible section. Present on every item. |
| `"panel"`     | The outer container that wraps the `header` and the `section` of each item.                   |
| `"section"`   | The collapsible `<section>` element that contains the item's body content.                    |

## CSS Custom Properties

| Name                                                                                                                            | Description                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ch-accordion-expand-collapse-duration Specifies duration of the expand and collapse animation @default 0ms`                  |                                                                                                                                                                                                                                                                                           |
| `--ch-accordion-expand-collapse-timing-function Specifies timing function of the expand and collapse animation @default linear` |                                                                                                                                                                                                                                                                                           |
| `--ch-accordion__chevron-color`                                                                                                 | Specifies the color of the chevron. @default currentColor                                                                                                                                                                                                                                 |
| `--ch-accordion__chevron-image-size`                                                                                            | Specifies the image size of the chevron. @default 100%                                                                                                                                                                                                                                    |
| `--ch-accordion__chevron-size`                                                                                                  | Specifies the box size of the chevron. @default 0.875em                                                                                                                                                                                                                                   |
| `--ch-accordion__header-background-image`                                                                                       | Specifies the background image used for the expandable chevron in the header. @default url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="none"><path d="M16.5 5L8.7 12.7L1 5" stroke="%23000" stroke-width="1.2" stroke-linecap="round"/></svg>') |
| `--ch-accordion__header-background-image-size`                                                                                  | Specifies the size of the start image of the header. @default 100%                                                                                                                                                                                                                        |
| `--ch-accordion__header-image-size`                                                                                             | Specifies the box size that contains the start image of the header. @default 0.875em                                                                                                                                                                                                      |

## Shadow DOM Layout

## Case 1: Default (items from model)

```
<ch-accordion-render>
  | #shadow-root
  | <!-- for each item in model -->
  | <div part="{item.id} panel [disabled] [expanded | collapsed]">
  |   <button part="{item.id} [headerSlotId] header [disabled] [expanded | collapsed]">
  |     <!-- when headerSlotId -->
  |     <slot name="{headerSlotId}" />
  |     <!-- else -->
  |     Caption text
  |   </button>
  |   <section>
  |     <!-- when expanded or previously rendered -->
  |     <div part="{item.id} section [disabled] [expanded | collapsed]">
  |       <slot name="{item.id}" />
  |     </div>
  |   </section>
  | </div>
</ch-accordion-render>
```

## Styling Recipes

### Animated Expand/Collapse

Enable smooth expand and collapse transitions using CSS grid animation.

```css
ch-accordion-render {
  --ch-accordion-expand-collapse-duration: 250ms;
  --ch-accordion-expand-collapse-timing-function: ease-in-out;
}
```

### Custom Chevron

Replace the default chevron icon and adjust its size.

```css
ch-accordion-render {
  --ch-accordion__header-background-image: url("data:image/svg+xml,...");
  --ch-accordion__chevron-size: 24px;
  --ch-accordion__chevron-image-size: 80%;
  --ch-accordion__chevron-color: #0078d4;
}
```

### Bordered Panels

Add borders between accordion panels for visual separation.

```css
ch-accordion-render::part(panel) {
  border-block-end: 1px solid #e0e0e0;
}

ch-accordion-render::part(header) {
  padding: 12px 16px;
  font-size: 14px;
}

ch-accordion-render::part(section expanded) {
  padding: 8px 16px 16px;
}
```

### Focus Ring

Add a visible focus indicator for keyboard navigation.

```css
ch-accordion-render::part(header):focus-visible {
  outline: 2px solid #0078d4;
  outline-offset: -2px;
}
```

## Anti-patterns

### 1. Using attribute selectors instead of state parts

```css
/* INCORRECT - attribute selectors do not reflect internal shadow state */
ch-accordion-render[expanded]::part(header) {
  color: blue;
}

/* CORRECT - use state parts */
ch-accordion-render::part(header expanded) {
  color: blue;
}
```

### 2. Using combinators after `::part()`

```css
/* INCORRECT - combinators after ::part() are not supported */
ch-accordion-render::part(panel) > section {
  padding: 10px;
}

/* CORRECT - target the part directly */
ch-accordion-render::part(section expanded) {
  padding: 10px;
}
```

### 3. Animating with display or visibility instead of grid rows

```css
/* INCORRECT - abrupt show/hide without animation */
ch-accordion-render::part(section) {
  display: none;
}
ch-accordion-render::part(section expanded) {
  display: block;
}

/* CORRECT - use the built-in CSS custom properties for smooth animation */
ch-accordion-render {
  --ch-accordion-expand-collapse-duration: 200ms;
  --ch-accordion-expand-collapse-timing-function: ease;
}
```

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-accordion__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-accordion::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.
