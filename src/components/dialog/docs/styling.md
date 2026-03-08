# ch-dialog: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Full dialog (header + footer + resizable)](#case-1-full-dialog-header-footer-resizable)
  - [Case 2: Minimal dialog (no header, no footer, not resizable)](#case-2-minimal-dialog-no-header-no-footer-not-resizable)

## Shadow Parts

| Part                                | Description                                                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `"caption"`                         | The `<h2>` heading inside the header. Rendered when `showHeader === true` and `caption` is defined.            |
| `"close-button"`                    | The button that closes the dialog. Rendered when `showHeader === true` and `closable === true`.                |
| `"content"`                         | A wrapper `<div>` around the default slot that holds the dialog body content.                                  |
| `"corner"`                          | Any of the four dialog corners used as resize handles. Rendered when `resizable === true` and `show === true`. |
| `"corner-block-end-inline-end"`     | Bottom-right (in LTR) resize corner (see also "corner" part).                                                  |
| `"corner-block-end-inline-start"`   | Bottom-left (in LTR) resize corner (see also "corner" part).                                                   |
| `"corner-block-start-inline-end"`   | Top-right (in LTR) resize corner (see also "corner" part).                                                     |
| `"corner-block-start-inline-start"` | Top-left (in LTR) resize corner (see also "corner" part).                                                      |
| `"dialog"`                          | The native `<dialog>` element, which is the first element inside the host.                                     |
| `"edge"`                            | Any of the four dialog edges used as resize handles. Rendered when `resizable === true` and `show === true`.   |
| `"edge-block-end"`                  | The bottom resize edge (see also "edge" part).                                                                 |
| `"edge-block-start"`                | The top resize edge (see also "edge" part).                                                                    |
| `"edge-inline-end"`                 | The inline-end (right in LTR) resize edge (see also "edge" part).                                              |
| `"edge-inline-start"`               | The inline-start (left in LTR) resize edge (see also "edge" part).                                             |
| `"footer"`                          | The dialog footer. Rendered when `showFooter === true`.                                                        |
| `"header"`                          | The dialog header. Rendered when `showHeader === true`. Contains the caption and the close button.             |

## CSS Custom Properties

| Name                           | Description                                                                                                                                                             |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ch-dialog-block-size`       | Specifies the block size of the dialog. Useful for scenarios where the dialog is resizable. @default max-content                                                        |
| `--ch-dialog-block-start`      | This specifies the value used in calculating the dialog's position along the y-axis. The default value centers the dialog along the y-axis. @default calc(50dvh - 50%)  |
| `--ch-dialog-inline-size`      | Specifies the inline size of the dialog. Useful for scenarios where the dialog is resizable. @default max-content                                                       |
| `--ch-dialog-inline-start`     | This specifies the value used in calculating the dialog's position along the x-axis. The default value centers the dialog along the x-axis. @default calc(50dvw - 50%); |
| `--ch-dialog-max-block-size`   | Specifies the maximum block size of the dialog. Useful for scenarios where the dialog is resizable. @default auto                                                       |
| `--ch-dialog-max-inline-size`  | Specifies the maximum inline size of the dialog. Useful for scenarios where the dialog is resizable. @default auto                                                      |
| `--ch-dialog-min-block-size`   | Specifies the minimum block size of the dialog. Useful for scenarios where the dialog is resizable. @default auto                                                       |
| `--ch-dialog-min-inline-size`  | Specifies the minimum inline size of the dialog. Useful for scenarios where the dialog is resizable. @default auto                                                      |
| `--ch-dialog-resize-threshold` | Specifies the size of the threshold to resize the dialog. @default 8px                                                                                                  |

## Shadow DOM Layout

## Case 1: Full dialog (header + footer + resizable)

```
<ch-dialog>
  | #shadow-root
  | <dialog aria-labelledby="heading" part="dialog">
  |   <!-- when showHeader -->
  |   <div part="header">
  |     <!-- when caption -->
  |     <h2 id="heading" part="caption">Caption text</h2>
  |     <!-- when closable -->
  |     <button aria-label="{closeButtonAccessibleName}" part="close-button"></button>
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
