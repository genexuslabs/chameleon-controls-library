# ch-dialog: Shadow DOM layout

## Case 1: Full dialog (header + footer + resizable)

```
<ch-dialog>
  | #shadow-root
  | <dialog part="dialog">
  |   <!-- when showHeader -->
  |   <div part="header">
  |     <!-- when caption -->
  |     <h2 part="caption">Caption text</h2>
  |     <!-- when closable -->
  |     <button part="close-button"></button>
  |   </div>
  |
  |   <div part="content">
  |     <slot />
  |   </div>
  |
  |   <!-- when showFooter -->
  |   <div part="footer">
  |     <slot name="footer" />
  |   </div>
  |
  |   <!-- when resizable && show -->
  |   <div part="edge edge-block-start"></div>
  |   <div part="edge edge-inline-end"></div>
  |   <div part="edge edge-block-end"></div>
  |   <div part="edge edge-inline-start"></div>
  |   <div part="corner corner-block-start-inline-start"></div>
  |   <div part="corner corner-block-start-inline-end"></div>
  |   <div part="corner corner-block-end-inline-start"></div>
  |   <div part="corner corner-block-end-inline-end"></div>
  |   <div class="resize-layer"></div>
  | </dialog>
</ch-dialog>
```

## Case 2: Minimal dialog (no header, no footer, not resizable)

```
<ch-dialog>
  | #shadow-root
  | <dialog part="dialog">
  |   <div part="content">
  |     <slot />
  |   </div>
  | </dialog>
</ch-dialog>
```
