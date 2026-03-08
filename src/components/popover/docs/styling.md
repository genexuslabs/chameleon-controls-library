# ch-popover: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: With draggable header and resizable](#case-1-with-draggable-header-and-resizable)
  - [Case 2: Default (no drag header, not resizable)](#case-2-default-no-drag-header-not-resizable)

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
