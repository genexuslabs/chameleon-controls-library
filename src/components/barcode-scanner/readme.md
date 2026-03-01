# Barcode Scanner

<!-- Auto Generated Below -->


## Overview

The `ch-barcode-scanner` component provides real-time barcode and QR code
scanning through the device camera, with support for file-based scanning.


## Features
 - Real-time barcode and QR code scanning via device camera.
 - File-based scanning through the `scan` method.
 - Automatic camera enumeration with front-facing, rear-facing, or specific camera selection by ID.
 - Adaptive layout via built-in `ResizeObserver`.
 - Configurable debouncing to prevent duplicate read events for the same code.

## Use when
 - Scanning barcodes or QR codes from a live camera feed.
 - Decoding barcodes from uploaded image files.
 - Scanning QR codes or barcodes from a device camera or an uploaded image file.

## Do not use when
 - Only generating QR codes for display — use `ch-qr` instead.
 - Generating a QR code from data is needed — prefer `ch-qr`.
## Properties

| Property           | Attribute            | Description                                                                                                                                                                                           | Type                                         | Default     |
| ------------------ | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------- |
| `barcodeBoxHeight` | `barcode-box-height` | The height (in pixels) of the QR box displayed at the center of the video.                                                                                                                            | `number`                                     | `200`       |
| `barcodeBoxWidth`  | `barcode-box-width`  | The width (in pixels) of the QR box displayed at the center of the video.                                                                                                                             | `number`                                     | `200`       |
| `cameraId`         | `camera-id`          | Specifies the ID of the selected camera. Only works if `cameraPreference === "SelectedById"`.                                                                                                         | `string`                                     | `undefined` |
| `cameraPreference` | `camera-preference`  | Specifies the camera preference for scanning.                                                                                                                                                         | `"BackCamera" \| "Default" \| "FrontCamera"` | `"Default"` |
| `readDebounce`     | `read-debounce`      | Specifies how much time (in ms) should pass before to emit the read event with the same last decoded text. If the last decoded text is different from the new decoded text, this property is ignored. | `number`                                     | `200`       |
| `scanning`         | `scanning`           | `true` if the control is scanning.                                                                                                                                                                    | `boolean`                                    | `true`      |


## Events

| Event     | Description                                                                             | Type                    |
| --------- | --------------------------------------------------------------------------------------- | ----------------------- |
| `cameras` | Fired when the control is first rendered. Contains the ids about all available cameras. | `CustomEvent<string[]>` |
| `read`    | Fired when a new barcode is decoded.                                                    | `CustomEvent<string>`   |


## Methods

### `scan(imageFile: File) => Promise<string>`

Scan a file a return a promise with the decoded text.

#### Parameters

| Name        | Type   | Description |
| ----------- | ------ | ----------- |
| `imageFile` | `File` |             |

#### Returns

Type: `Promise<string>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
