# ch-dialog

<!-- Auto Generated Below -->


## Overview

The `ch-dialog` component represents a modal or non-modal dialog box built on top of the native `<dialog>` element.

## Features
 - Modal and non-modal modes with native `<dialog>` semantics.
 - Dragging from the header or the entire box.
 - Resizing through edges and corners.
 - Optional header with caption and close button, and optional footer slot.
 - Full RTL layout support and `prefers-reduced-motion` respect.
 - Stacking of multiple simultaneous modal dialogs (only the topmost reacts to outside clicks and Escape).
 - Configurable `closable` property to prevent user dismissal.

## Use when
 - You need confirmation prompts, detail panels, form wizards, or any overlay that benefits from native dialog semantics.
 - Interrupting the user to gather required input or confirmation before a workflow can continue.
 - Short, focused tasks that are infrequent (e.g., rename, delete confirmation, quick settings form).

## Do not use when
 - You need lightweight, non-blocking overlays anchored to a trigger element -- prefer `ch-popover` or `ch-tooltip` instead.
 - The information is non-critical — prefer inline notifications, toasts, or banners.
 - The task involves large amounts of data or complex workflows — dialogs are not full pages.
 - The user did not initiate the action — never open a dialog automatically.
 - Users perform this task frequently — make it completable inline instead.
 - Nesting dialogs within dialogs — this is always an anti-pattern.
 - Lightweight contextual content anchored to a trigger element — prefer `ch-popover`.

## Accessibility
 - Built on the native `<dialog>` element, which provides modal semantics and focus trapping automatically.
 - The dialog is labelled via `aria-labelledby` pointing to an `<h2>` heading in the header.
 - The close button carries an `aria-label` (`closeButtonAccessibleName`).
 - When `closable` is `true`, the Escape key dismisses the dialog.
 - Multiple simultaneous modal dialogs are stacked so only the topmost reacts to outside clicks and Escape.

## Properties

| Property                    | Attribute                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                  | Type                        | Default     |
| --------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ----------- |
| `adjustPositionAfterResize` | `adjust-position-after-resize` | `true` if the dialog should be repositioned after resize.                                                                                                                                                                                                                                                                                                                                                                    | `boolean`                   | `false`     |
| `allowDrag`                 | `allow-drag`                   | "box" will allow the dialog to be draggable from both the header and the content. "header" will allow the dialog to be draggable only from the header. "no" disables dragging completely.                                                                                                                                                                                                                                    | `"box" \| "header" \| "no"` | `"no"`      |
| `caption`                   | `caption`                      | Refers to the dialog title. I will ve visible if 'showHeader´is true.                                                                                                                                                                                                                                                                                                                                                        | `string`                    | `undefined` |
| `closable`                  | `closable`                     | If `closable === true` the `ch-dialog` can be closed by user interaction, in which case a close button is rendered in the header (when `showHeader === true`).  If `closable === false`, the close button is not rendered and pressing the `Esc` key or clicking outside of the `ch-dialog` will not close it.                                                                                                               | `boolean`                   | `true`      |
| `closeButtonAccessibleName` | `close-button-accessible-name` | Specifies a short string, typically 1 to 3 words, that authors associate with an element to provide users of assistive technologies with a label for the element. This label is used for the close button of the header.                                                                                                                                                                                                     | `string`                    | `undefined` |
| `modal`                     | `modal`                        | Specifies whether the dialog is a modal or not. Modal dialog boxes interrupt interaction with the rest of the page being inert, while non-modal dialog boxes allow interaction with the rest of the page.  Note: If `show === true`, this property does not reflect changes on runtime, since at the time of writing browsers do not support switching from modal to not-modal (or vice-versa), when the `dialog` is opened. | `boolean`                   | `true`      |
| `resizable`                 | `resizable`                    | Specifies whether the control can be resized. If `true` the control can be resized at runtime by dragging the edges or corners.                                                                                                                                                                                                                                                                                              | `boolean`                   | `false`     |
| `show`                      | `show`                         | Specifies whether the dialog is shown or not.                                                                                                                                                                                                                                                                                                                                                                                | `boolean`                   | `false`     |
| `showFooter`                | `show-footer`                  | Specifies whether the dialog footer is hidden or visible.                                                                                                                                                                                                                                                                                                                                                                    | `boolean`                   | `false`     |
| `showHeader`                | `show-header`                  | Specifies whether the dialog header is hidden or visible.                                                                                                                                                                                                                                                                                                                                                                    | `boolean`                   | `false`     |


## Events

| Event          | Description                                                                                                                   | Type               |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `dialogClosed` | Emitted when the dialog is closed.  This event can be prevented (`preventDefault()`), interrupting the `ch-dialog`'s closing. | `CustomEvent<any>` |


## Slots

| Slot       | Description                                                                         |
| ---------- | ----------------------------------------------------------------------------------- |
|            | Default slot. Main body content of the dialog, projected inside the "content" part. |
| `"footer"` | Footer content of the dialog. Rendered when `showFooter === true`.                  |


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


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
