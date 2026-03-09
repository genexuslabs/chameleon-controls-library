# ch-dialog: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Full dialog (header + footer + resizable)](#case-1-full-dialog-header-footer-resizable)
  - [Case 2: Minimal dialog (no header, no footer, not resizable)](#case-2-minimal-dialog-no-header-no-footer-not-resizable)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

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

## Styling Recipes

### Card-style Dialog

A dialog with rounded corners, shadow, and a distinct header.

```css
ch-dialog {
  --ch-dialog-inline-size: 500px;
}

ch-dialog::part(dialog) {
  border: none;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

ch-dialog::part(header) {
  padding: 16px 24px;
  background-color: #0078d4;
  color: white;
}

ch-dialog::part(caption) {
  color: white;
  font-size: 16px;
}

ch-dialog::part(close-button) {
  color: white;
}

ch-dialog::part(content) {
  padding: 24px;
}

ch-dialog::part(footer) {
  padding: 16px 24px;
  background-color: #fafafa;
}
```

### Resizable Dialog with Size Constraints

Constrain a resizable dialog within reasonable bounds.

```css
ch-dialog {
  --ch-dialog-inline-size: 600px;
  --ch-dialog-block-size: 400px;
  --ch-dialog-min-inline-size: 300px;
  --ch-dialog-min-block-size: 200px;
  --ch-dialog-max-inline-size: 90vw;
  --ch-dialog-max-block-size: 80vh;
  --ch-dialog-resize-threshold: 6px;
}
```

### Full-width Footer Buttons

Stretch footer buttons to fill the footer area.

```css
ch-dialog::part(footer) {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
}

/* Buttons inside the footer slot must be styled from outside */
ch-dialog [slot="footer"] button {
  flex: 1;
  padding: 8px 16px;
  border-radius: 4px;
}
```

### Backdrop Styling

Style the modal backdrop via the host element (since the host acts as the backdrop container in modal mode).

```css
ch-dialog {
  background-color: rgba(0, 0, 0, 0.4);
}
```

## Anti-patterns

### 1. Using `display: none` to hide the dialog

```css
/* INCORRECT - breaks the native <dialog> show/close lifecycle */
ch-dialog {
  display: none;
}

/* CORRECT - use the show property to control visibility */
```

```js
dialog.show = false;
```

### 2. Using combinators after `::part()`

```css
/* INCORRECT - combinators after ::part() are not supported */
ch-dialog::part(header) > h2 {
  color: blue;
}

/* CORRECT - target the part directly */
ch-dialog::part(caption) {
  color: blue;
}
```

### 3. Styling the backdrop with `::backdrop` from outside

```css
/* INCORRECT - the ::backdrop pseudo-element lives inside the shadow DOM
   and cannot be styled from outside */
ch-dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
}

/* CORRECT - style the host element background for modal dialogs */
ch-dialog {
  background-color: rgba(0, 0, 0, 0.5);
}
```

### 4. Setting position on the dialog part

```css
/* INCORRECT - the dialog uses position: fixed internally;
   overriding it will break positioning and drag */
ch-dialog::part(dialog) {
  position: absolute;
}

/* CORRECT - use custom properties to control position */
ch-dialog {
  --ch-dialog-block-start: 100px;
  --ch-dialog-inline-start: 200px;
}
```

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-dialog__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-dialog::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.
