# ch-tooltip: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Action inside shadow DOM, tooltip visible](#case-1-action-inside-shadow-dom-tooltip-visible)
  - [Case 2: Action inside shadow DOM, tooltip hidden](#case-2-action-inside-shadow-dom-tooltip-hidden)
  - [Case 3: Action outside shadow DOM (no action slot), tooltip visible](#case-3-action-outside-shadow-dom-no-action-slot-tooltip-visible)
  - [Case 4: Action outside shadow DOM, tooltip hidden](#case-4-action-outside-shadow-dom-tooltip-hidden)

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

