# ch-qr

<!-- Auto Generated Below -->


## Overview

The `ch-qr` component generates a QR code from any text, URL, or data
string and renders it as a canvas element in the Shadow DOM.

## Features
 - Customizable foreground and background colors with `currentColor` support for theme integration.
 - Configurable error correction levels (L, M, Q, H).
 - Adjustable block radius for rounded aesthetics.
 - Scalable pixel size.
 - Automatic re-render when any property changes.
 - Accessible via `role="img"` and `aria-label`.

## Use when
 - Displaying a QR code for a URL, text, or data string.
 - Generating a machine-readable QR code from a URL, text, or identifier for mobile scanning.

## Do not use when
 - Scanning or reading QR codes — use `ch-barcode-scanner` instead.
 - Scanning a QR code from camera input is needed — prefer `ch-barcode-scanner`.

## Accessibility
 - The generated QR code is rendered as an `<img>` element with an `aria-label` derived from the `accessibleName` property.
## Properties

| Property               | Attribute                | Description                                                                                                                                                                                                                                                          | Type                                        | Default     |
| ---------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------- |
| `accessibleName`       | `accessible-name`        | Specifies a short string, typically 1 to 3 words, that authors associate with an element to provide users of assistive technologies with a label for the element.                                                                                                    | `string`                                    | `undefined` |
| `background`           | `background`             | The background color of the render QR. If not specified, "transparent" will be used.                                                                                                                                                                                 | `string`                                    | `"white"`   |
| `errorCorrectionLevel` | `error-correction-level` | The four values L, M, Q, and H will use %7, 15%, 25%, and 30% of the QR code for error correction respectively. So on one hand the code will get bigger but chances are also higher that it will be read without errors later on. This value is by default High (H). | `"High" \| "Low" \| "Medium" \| "Quartile"` | `"High"`    |
| `fill`                 | `fill`                   | What color you want your QR code to be.                                                                                                                                                                                                                              | `string`                                    | `"black"`   |
| `radius`               | `radius`                 | Defines how round the blocks should be. Numbers from 0 (squares) to 0.5 (maximum round) are supported.                                                                                                                                                               | `number`                                    | `0`         |
| `size`                 | `size`                   | The total size of the final QR code in pixels.                                                                                                                                                                                                                       | `number`                                    | `128`       |
| `value`                | `value`                  | Any kind of text, also links, email addresses, any thing.                                                                                                                                                                                                            | `string`                                    | `undefined` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
