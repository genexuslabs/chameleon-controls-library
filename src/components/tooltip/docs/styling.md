# ch-tooltip: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Action inside shadow DOM, tooltip visible](#case-1-action-inside-shadow-dom-tooltip-visible)
  - [Case 2: Action inside shadow DOM, tooltip hidden](#case-2-action-inside-shadow-dom-tooltip-hidden)
  - [Case 3: Action outside shadow DOM (no action slot), tooltip visible](#case-3-action-outside-shadow-dom-no-action-slot-tooltip-visible)
  - [Case 4: Action outside shadow DOM, tooltip hidden](#case-4-action-outside-shadow-dom-tooltip-hidden)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow Parts

| Part       | Description                                                                                                                                                           |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"action"` | The internally rendered `<button>` that acts as the tooltip trigger. Only present when `actionElement` is `undefined` (i.e., the action lives inside the shadow DOM). |
| `"window"` | The `ch-popover` element that contains the tooltip content. Only present while the tooltip is visible.                                                                |

## CSS Custom Properties

| Name                        | Description                                                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `--ch-tooltip-separation`   | Specifies the separation between the action and the displayed tooltip. @default 0px                                        |
| `--ch-tooltip-separation-x` | Specifies the separation between the action and the tooltip displayed on the x-axis. @default var(--ch-tooltip-separation) |
| `--ch-tooltip-separation-y` | Specifies the separation between the action and the tooltip displayed on the y-axis. @default var(--ch-tooltip-separation) |

## Shadow DOM Layout

## Case 1: Action inside shadow DOM, tooltip visible

```
<ch-tooltip>
  | #shadow-root
  | <button part="action">
  |   <slot name="action" />
  | </button>
  | <ch-popover part="window">
  |   | #shadow-root
  |   | <slot />
  | </ch-popover>
</ch-tooltip>
```

## Case 2: Action inside shadow DOM, tooltip hidden

```
<ch-tooltip>
  | #shadow-root
  | <button part="action">
  |   <slot name="action" />
  | </button>
</ch-tooltip>
```

## Case 3: Action outside shadow DOM (no action slot), tooltip visible

```
<ch-tooltip role="tooltip">
  | #shadow-root
  | <ch-popover part="window">
  |   | #shadow-root
  |   | <slot />
  | </ch-popover>
</ch-tooltip>
```

## Case 4: Action outside shadow DOM, tooltip hidden

```
<ch-tooltip role="tooltip">
  | #shadow-root
  | (empty)
</ch-tooltip>
```

## Styling Recipes

### Dark tooltip theme with custom separation

```css
ch-tooltip {
  --ch-tooltip-separation: 8px;
}

ch-tooltip::part(window) {
  background-color: #1e1e1e;
  color: #f0f0f0;
  padding: 8px 14px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-size: 13px;
  line-height: 1.4;
}
```

### Styled trigger button

When the action lives inside the shadow DOM, use the `action` part to restyle the default `<button>` trigger.

```css
ch-tooltip::part(action) {
  all: unset;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  color: var(--icon-color, #555);
  transition: background-color 150ms ease;
}

ch-tooltip::part(action):hover {
  background-color: rgba(0, 0, 0, 0.06);
}
```

### Axis-specific positioning overrides

Use the x/y separation properties independently to offset the tooltip window along a single axis -- useful when the tooltip appears beside the trigger rather than above or below it.

```css
/* Tooltip displayed to the right of the trigger with horizontal gap only */
ch-tooltip {
  --ch-tooltip-separation-x: 12px;
  --ch-tooltip-separation-y: 0px;
}

ch-tooltip::part(window) {
  background-color: #fff;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  padding: 6px 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
```

## Anti-patterns

### 1. Styling the window part when it may not exist

The `"window"` part is only rendered while the tooltip is visible. Styles applied to it are valid CSS but will have no effect when the tooltip is hidden. Do not rely on `::part(window)` for layout that must always be present.

```css
/* INCORRECT - trying to reserve space for a tooltip that may not be in the DOM */
ch-tooltip::part(window) {
  min-height: 40px;
  display: block;
}

/* CORRECT - the window part is ephemeral; style its appearance, not its layout presence */
ch-tooltip::part(window) {
  background-color: #333;
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
}
```

### 2. Using combinators after ::part()

CSS combinators (` `, `>`, `+`, `~`) cannot follow `::part()` selectors. You cannot reach into the popover's shadow tree through the tooltip's part.

```css
/* INCORRECT - combinators after ::part() are not supported */
ch-tooltip::part(window) > .tooltip-arrow {
  display: block;
}

/* CORRECT - style the window part directly */
ch-tooltip::part(window) {
  border: 1px solid #ccc;
}
```

### 3. Overriding separation with popover custom properties

The tooltip forwards its separation custom properties to `ch-popover` internally. Setting `--ch-popover-separation-*` directly on the tooltip host will not work because the internal mapping takes precedence.

```css
/* INCORRECT - popover custom properties are overridden internally */
ch-tooltip {
  --ch-popover-separation-x: 10px;
  --ch-popover-separation-y: 10px;
}

/* CORRECT - use the tooltip's own custom properties */
ch-tooltip {
  --ch-tooltip-separation-x: 10px;
  --ch-tooltip-separation-y: 10px;
}
```

## Do's and Don'ts

### Do

- Prefer CSS custom properties (`--ch-tooltip-separation`, `--ch-tooltip-separation-x`, `--ch-tooltip-separation-y`) over `::part()` for spacing and theming adjustments.
- Use class selectors on the host element (e.g., `ch-tooltip.dark-theme`) to scope variant styles.
- Use `::part(action)` to reset or restyle the internal trigger button when using the default action mode.
- Use `::part(window)` for visual styling of the tooltip overlay (background, border, padding, shadow).
- Test tooltip styling across all relevant states: visible/hidden, internal action vs. external `actionElement`, and different `delay` values.
- Test tooltip styling in both action modes (internal button vs. external element) since the `action` part is only rendered in the internal button mode.

### Don't

- Don't chain `::part()` selectors (e.g., `parent::part(x)::part(y)`) -- CSS does not support this.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-of-type()`, etc.) after `::part()` -- only user-action pseudo-classes (`:hover`, `:focus`) are supported.
- Don't override `--ch-popover-separation-*` on the tooltip host -- use `--ch-tooltip-separation-*` instead.
- Don't override internal CSS custom properties that are not documented.

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).
