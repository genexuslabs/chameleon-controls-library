# ch-tooltip: Shadow DOM layout

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
