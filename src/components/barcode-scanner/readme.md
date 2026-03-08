# Barcode Scanner

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Use when](#use-when)
- [Do not use when](#do-not-use-when)
- [Accessibility](#accessibility)
- [Properties](#properties)
- [Events](#events)
- [Methods](#methods)
  - [`scan`](#scan)

<!-- Auto Generated Below -->

## Overview

The `ch-barcode-scanner` component provides real-time barcode and QR code scanning through the device camera, with support for file-based scanning.

## Features
 - Real-time barcode and QR code scanning via the device camera using the `html5-qrcode` library.
 - File-based scanning through the `scan()` method, which accepts a `File` object and returns a decoded string.
 - Automatic camera enumeration with front-facing (`"FrontCamera"`), rear-facing (`"BackCamera"`), or specific camera selection by ID (`cameraId`).
 - Adaptive layout via a built-in `ResizeObserver` that restarts the scanner when the component is resized.
 - Configurable debouncing (`readDebounce`) to prevent duplicate `read` events for the same code.
 - Emits a `cameras` event on first render with the list of available camera IDs.

## Use when
 - Scanning barcodes or QR codes from a live camera feed.
 - Decoding barcodes from uploaded image files via the `scan()` method.

## Do not use when
 - Only generating QR codes for display — use `ch-qr` instead.
 - The target device has no camera and file-based scanning is not needed.

## Accessibility
 - This component renders a camera video feed inside a `<div>` without shadow DOM. It does not provide built-in keyboard controls for the camera. Ensure the surrounding UI provides accessible controls for starting/stopping the scanner.

## Properties

| Property           | Attribute            | Description                                                                                                                                                                                                                                                                                                                                                          | Type                                         | Default     |
| ------------------ | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------- |
| `barcodeBoxHeight` | `barcode-box-height` | The height (in pixels) of the scanning box displayed at the center of the video feed. The scanner focuses decoding within this region.  Defaults to `200`. Init-only — changing this value after the scanner has started requires stopping and restarting via the `scanning` property.                                                                               | `number`                                     | `200`       |
| `barcodeBoxWidth`  | `barcode-box-width`  | The width (in pixels) of the scanning box displayed at the center of the video feed. The scanner focuses decoding within this region.  Defaults to `200`. Init-only — changing this value after the scanner has started requires stopping and restarting via the `scanning` property.                                                                                | `number`                                     | `200`       |
| `cameraId`         | `camera-id`          | Specifies the ID of the selected camera. When provided, this value takes precedence over `cameraPreference` — the scanner will use the camera matching this ID regardless of the `cameraPreference` setting. Camera IDs are available from the `cameras` event payload emitted on first render.  Updating this value triggers a scanner restart with the new camera. | `string`                                     | `undefined` |
| `cameraPreference` | `camera-preference`  | Specifies the camera preference for scanning.  - `"Default"`: uses the first available camera from the enumerated list.  - `"FrontCamera"`: requests `facingMode: { exact: "user" }`.  - `"BackCamera"`: requests `facingMode: { exact: "environment" }`.  Ignored when `cameraId` is set.                                                                           | `"BackCamera" \| "Default" \| "FrontCamera"` | `"Default"` |
| `readDebounce`     | `read-debounce`      | Specifies the minimum time (in milliseconds) that must elapse before the `read` event is re-emitted for the same decoded text. If the newly decoded text differs from the last decoded text, the event fires immediately regardless of this value.  The new value applies to the next scan callback invocation.                                                      | `number`                                     | `200`       |
| `scanning`         | `scanning`           | Controls whether the scanner is actively scanning. Set to `true` to start the camera feed and begin decoding; set to `false` to stop the camera and disconnect the `ResizeObserver`.  Toggling this property starts or stops the scanner without destroying the component.                                                                                           | `boolean`                                    | `true`      |

## Events

| Event     | Description                                                                                                                                                                                                                                         | Type                    |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `cameras` | Emitted once during `componentDidLoad` after camera enumeration completes. The payload is an array of camera ID strings. If no cameras are found or enumeration fails, an empty array is emitted.  Use this event to populate a camera selector UI. | `CustomEvent<string[]>` |
| `read`    | Emitted when a barcode or QR code is successfully decoded from the camera feed. The payload is the decoded text string. Subject to `readDebounce` filtering when the same code is scanned consecutively.  Not cancelable.                           | `CustomEvent<string>`   |

## Methods

### `scan(imageFile: File) => Promise<string>`

Scans a barcode or QR code from an image file and returns a promise that
resolves with the decoded text string. The scanner does not need to be
actively scanning (`scanning` can be `false`) for this method to work.

#### Parameters

| Name        | Type   | Description                              |
| ----------- | ------ | ---------------------------------------- |
| `imageFile` | `File` | - The image `File` to scan for barcodes. |

#### Returns

Type: `Promise<string>`

A promise that resolves with the decoded text, or rejects if no
barcode is found in the image.

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
