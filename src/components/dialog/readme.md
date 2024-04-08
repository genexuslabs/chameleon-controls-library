# ch-dialog



<!-- Auto Generated Below -->


## Overview

The `ch-dialog` component represents a modal or non-modal dialog box or other interactive component.

## Properties

| Property     | Attribute     | Description                                                                                                                                            | Type                        | Default |
| ------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- | ------- |
| `allowDrag`  | `allow-drag`  | Specifies the drag behavior of the dialog. If `allowDrag === "header"`, a slot with the `"header"` name will be available to place the header content. | `"box" \| "header" \| "no"` | `"box"` |
| `hidden`     | `hidden`      | Specifies whether the dialog is hidden or visible.                                                                                                     | `boolean`                   | `true`  |
| `modal`      | `modal`       | Specifies whether the dialog is a modal or not.                                                                                                        | `boolean`                   | `true`  |
| `showHeader` | `show-header` | Specifies whether the dialog header is hidden or visible.                                                                                              | `boolean`                   | `true`  |


## Events

| Event          | Description                        | Type               |
| -------------- | ---------------------------------- | ------------------ |
| `dialogClosed` | Emitted when the dialog is closed. | `CustomEvent<any>` |
| `dialogOpened` | Emitted when the dialog is opened. | `CustomEvent<any>` |


## Shadow Parts

| Part       | Description |
| ---------- | ----------- |
| `"header"` |             |


## CSS Custom Properties

| Name                       | Description                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------- |
| `--ch-dialog-separation-x` | Specifies the separation between the action and dialog in the x axis. @default 0px |
| `--ch-dialog-separation-y` | Specifies the separation between the action and dialog in the y axis. @default 0px |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
