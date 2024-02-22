# Barcode Scanner

<!-- Auto Generated Below -->

## Overview

This component allows you to scan a wide variety of types of barcode and QR
codes.

## Properties

| Property                               | Attribute                                    | Description                                                                                                                                                                                           | Type                                                           | Default     |
| -------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------- |
| `cameraId`                             | `camera-id`                                  | Specifies the ID of the selected camera. Only works if `cameraPreference === "SelectedById"`.                                                                                                         | `string`                                                       | `undefined` |
| `cameraPreference`                     | `camera-preference`                          | Specifies the camera preference for scanning.                                                                                                                                                         | `"BackCamera" \| "Default" \| "FrontCamera" \| "SelectedById"` | `"Default"` |
| `intervalBetweenReadsForTheSameDecode` | `interval-between-reads-for-the-same-decode` | Specifies how much time (in ms) should pass before to emit the read event with the same last decoded text. If the last decoded text is different from the new decoded text, this property is ignored. | `number`                                                       | `200`       |
| `qrBoxHeight`                          | `qr-box-height`                              | The height (in pixels) of the QR box displayed at the center of the video.                                                                                                                            | `number`                                                       | `200`       |
| `qrBoxWidth`                           | `qr-box-width`                               | The width (in pixels) of the QR box displayed at the center of the video.                                                                                                                             | `number`                                                       | `200`       |
| `scanMode`                             | `scan-mode`                                  |                                                                                                                                                                                                       | `"camera" \| "file"`                                           | `"camera"`  |
| `stopped`                              | `stopped`                                    | `true` if the control should stop the scanning.                                                                                                                                                       | `boolean`                                                      | `undefined` |

## Events

| Event     | Description                                                                             | Type                    |
| --------- | --------------------------------------------------------------------------------------- | ----------------------- |
| `cameras` | Fired when the control is first rendered. Contains the ids about all available cameras. | `CustomEvent<string[]>` |
| `read`    | Fired when the menu action is activated.                                                | `CustomEvent<string>`   |

## Methods

### `scan(imageFile: File) => Promise<string>`

Scan a file a return a promise with the decoded text.

#### Parameters

| Name        | Type   | Description |
| ----------- | ------ | ----------- |
| `imageFile` | `File` |             |

#### Returns

Type: `Promise<string>`

---

_Built with [StencilJS](https://stenciljs.com/)_

