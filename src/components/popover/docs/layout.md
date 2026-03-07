# ch-popover: Shadow DOM layout

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
