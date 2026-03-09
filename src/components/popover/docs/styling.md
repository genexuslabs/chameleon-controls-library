# ch-popover: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: With draggable header and resizable](#case-1-with-draggable-header-and-resizable)
  - [Case 2: Default (no drag header, not resizable)](#case-2-default-no-drag-header-not-resizable)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow Parts

| Part       | Description                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------- |
| `"header"` | A draggable header area rendered when `allowDrag === "header"`. Projects the "header" slot. |

## CSS Custom Properties

| Name                            | Description                                                                                                                                        |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ch-popover-block-size`       | Specifies the block size of the popover. Useful for scenarios where the popover is resizable. @default max-content                                 |
| `--ch-popover-inline-size`      | Specifies the inline size of the popover. Useful for scenarios where the popover is resizable. @default max-content                                |
| `--ch-popover-max-block-size`   | Specifies the maximum block size of the popover. Useful for scenarios where the popover is resizable. Only px values are supported. @default auto  |
| `--ch-popover-max-inline-size`  | Specifies the maximum inline size of the popover. Useful for scenarios where the popover is resizable. Only px values are supported. @default auto |
| `--ch-popover-min-block-size`   | Specifies the minimum block size of the popover. Useful for scenarios where the popover is resizable. @default auto                                |
| `--ch-popover-min-inline-size`  | Specifies the minimum inline size of the popover. Useful for scenarios where the popover is resizable. @default auto                               |
| `--ch-popover-resize-threshold` | Specifies the size of the threshold to resize the popover. @default 8px                                                                            |
| `--ch-popover-separation-x`     | Specifies the separation between the action and popover in the x axis. @default 0px                                                                |
| `--ch-popover-separation-y`     | Specifies the separation between the action and popover in the y axis. @default 0px                                                                |

## Shadow DOM Layout

## Case 1: With draggable header and resizable

```
<ch-popover popover="auto | manual">
  | #shadow-root
  | <!-- when allowDrag === "header" -->
  | <div part="header">
  |   <slot name="header" />
  | </div>
  |
  | <slot />
  |
  | <!-- when resizable && show -->
  | <div class="edge__block-start"></div>
  | <div class="edge__inline-end"></div>
  | <div class="edge__block-end"></div>
  | <div class="edge__inline-start"></div>
  | <div class="corner__block-start-inline-start"></div>
  | <div class="corner__block-start-inline-end"></div>
  | <div class="corner__block-end-inline-start"></div>
  | <div class="corner__block-end-inline-end"></div>
  | <div class="resize-layer"></div>
</ch-popover>
```

## Case 2: Default (no drag header, not resizable)

```
<ch-popover popover="auto | manual">
  | #shadow-root
  | <slot />
</ch-popover>
```

## Styling Recipes

### Dropdown Menu

A floating panel positioned below a trigger button.

```css
ch-popover {
  --ch-popover-inline-size: 200px;
  --ch-popover-separation-y: 4px;

  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 4px 0;
}
```

### Tooltip-like Popover

A compact popover with an arrow-like appearance.

```css
ch-popover {
  --ch-popover-separation-y: 8px;

  background-color: #333;
  color: white;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  max-inline-size: 250px;
}
```

### Constrained Scrollable Popover

A popover that adds a scroll when content overflows.

```css
ch-popover {
  --ch-popover-inline-size: 320px;
  --ch-popover-max-block-size: 300px;

  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}
```

### Separation Between Action and Popover

Add spacing between the trigger element and the popover.

```css
ch-popover {
  --ch-popover-separation-x: 8px;
  --ch-popover-separation-y: 8px;
}
```

### Resizable Popover with Constraints

Allow user resizing with minimum and maximum bounds.

```css
ch-popover {
  --ch-popover-inline-size: 400px;
  --ch-popover-block-size: 300px;
  --ch-popover-min-inline-size: 200px;
  --ch-popover-min-block-size: 150px;
  --ch-popover-max-inline-size: 800px;
  --ch-popover-max-block-size: 600px;
  --ch-popover-resize-threshold: 6px;
}
```

## Anti-patterns

### 1. Using `display` to show/hide the popover

```css
/* INCORRECT - the component manages display internally based on the show property */
ch-popover {
  display: block;
}

/* CORRECT - use the show property */
```

```js
popover.show = true;
```

### 2. Overriding `position` on the host

```css
/* INCORRECT - the component uses position: fixed for proper viewport-relative placement */
ch-popover {
  position: absolute;
}

/* CORRECT - use the separation custom properties and alignment props to control position */
ch-popover {
  --ch-popover-separation-y: 8px;
}
```

### 3. Using pixel values for max sizes without `px` suffix

```css
/* INCORRECT - max sizes require px values */
ch-popover {
  --ch-popover-max-block-size: 50%;
}

/* CORRECT - only px values are supported for max sizes */
ch-popover {
  --ch-popover-max-block-size: 400px;
}
```

### 4. Using combinators after `::part()`

```css
/* INCORRECT - combinators after ::part() are not supported */
ch-popover::part(header) > span {
  font-weight: bold;
}

/* CORRECT - target the part directly */
ch-popover::part(header) {
  font-weight: bold;
}
```

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-popover__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-popover::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.
