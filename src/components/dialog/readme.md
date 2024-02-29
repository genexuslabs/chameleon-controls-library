# ch-dialog



<!-- Auto Generated Below -->


## Overview

The `ch-dialog` component represents a modal or non-modal dialog box or other interactive component.

## Properties

| Property     | Attribute     | Description                                                                                                                                            | Type                        | Default     |
| ------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- | ----------- |
| `allowDrag`  | `allow-drag`  | Specifies the drag behavior of the dialog. If `allowDrag === "header"`, a slot with the `"header"` name will be available to place the header content. | `"box" \| "header" \| "no"` | `"box"`     |
| `caption`    | `caption`     | Refers to the dialog title. I will ve visible if 'showHeader´is true.                                                                                  | `string`                    | `undefined` |
| `firstLayer` | `first-layer` | `true` if the control is not stacked with another top layer.                                                                                           | `boolean`                   | `true`      |
| `hidden`     | `hidden`      | Specifies whether the dialog is hidden or visible.                                                                                                     | `boolean`                   | `true`      |
| `modal`      | `modal`       | Specifies whether the dialog is a modal or not.                                                                                                        | `boolean`                   | `true`      |
| `resizable`  | `resizable`   | Specifies whether the control can be resized. If `true` the control can be resized at runtime by dragging the edges or corners.                        | `boolean`                   | `false`     |
| `showHeader` | `show-header` | Specifies whether the dialog header is hidden or visible.                                                                                              | `boolean`                   | `true`      |


## Events

| Event          | Description                        | Type               |
| -------------- | ---------------------------------- | ------------------ |
| `dialogClosed` | Emitted when the dialog is closed. | `CustomEvent<any>` |
| `dialogOpened` | Emitted when the dialog is opened. | `CustomEvent<any>` |


## Shadow Parts

| Part        | Description |
| ----------- | ----------- |
| `"caption"` |             |
| `"close"`   |             |
| `"header"`  |             |


## CSS Custom Properties

| Name                           | Description                                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `--ch-dialog-block-size`       | Specifies the block size of the dialog. Useful for scenarios where the dialog is resizable. @default max-content   |
| `--ch-dialog-inline-size`      | Specifies the inline size of the dialog. Useful for scenarios where the dialog is resizable. @default max-content  |
| `--ch-dialog-max-block-size`   | Specifies the maximum block size of the dialog. Useful for scenarios where the dialog is resizable. @default auto  |
| `--ch-dialog-max-inline-size`  | Specifies the maximum inline size of the dialog. Useful for scenarios where the dialog is resizable. @default auto |
| `--ch-dialog-min-block-size`   | Specifies the minimum block size of the dialog. Useful for scenarios where the dialog is resizable. @default auto  |
| `--ch-dialog-min-inline-size`  | Specifies the minimum inline size of the dialog. Useful for scenarios where the dialog is resizable. @default auto |
| `--ch-dialog-resize-threshold` | Specifies the size of the threshold to resize the dialog. @default 4px                                             |
| `--ch-dialog-separation-x`     | Specifies the separation between the action and dialog in the x axis. @default 0px                                 |
| `--ch-dialog-separation-y`     | Specifies the separation between the action and dialog in the y axis. @default 0px                                 |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
