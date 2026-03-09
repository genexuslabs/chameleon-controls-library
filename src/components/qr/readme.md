# ch-qr

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Use when](#use-when)
- [Do not use when](#do-not-use-when)
- [Accessibility](#accessibility)
- [Usage](./docs/usage.md)
- [Properties](#properties)
- [Styling](./docs/styling.md)

<!-- Auto Generated Below -->

## Overview

The `ch-qr` component generates a QR code from any text, URL, or data string and renders it as a canvas element in the Shadow DOM.

## Features
 - Customizable foreground (`fill`) and background colors with `currentColor` support for seamless theme integration.
 - Configurable error correction levels: `"Low"` (7%), `"Medium"` (15%), `"Quartile"` (25%), `"High"` (30%).
 - Adjustable block radius (0 to 0.5) for rounded or square aesthetics.
 - Scalable output size via the `size` property (in pixels).
 - Automatic re-render when any property changes — the canvas is regenerated on every render cycle.
 - Accessible via `role="img"` and `aria-label` when `value` is set.
 - When `value` is `undefined` or empty, the component renders nothing and removes ARIA attributes.

## Use when
 - Displaying a QR code for a URL, text, or data string.
 - Generating a machine-readable QR code from a URL, text, or identifier for mobile scanning.

## Do not use when
 - Scanning or reading QR codes — use `ch-barcode-scanner` instead.

## Accessibility
 - When `value` is set, the host element has `role="img"` and `aria-label` derived from the `accessibleName` property. Always provide `accessibleName` to describe the QR code content for screen readers.
 - When `value` is unset, ARIA attributes are removed.

## Properties

| Property               | Attribute                | Description                                                                                                                                                                                                                                                                                                                                                                                                     | Type                                        | Default     |
| ---------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------- |
| `accessibleName`       | `accessible-name`        | Specifies a short string, typically 1 to 3 words, that authors associate with an element to provide users of assistive technologies with a label for the element. This value is applied as `aria-label` on the host when `value` is set. If omitted, the QR code will have `role="img"` but no accessible name, which is a WCAG violation.                                                                      | `string`                                    | `undefined` |
| `background`           | `background`             | The background color of the rendered QR code. Accepts any valid CSS color string. The special value `"currentColor"` is resolved at render time to the computed `color` of the host element, enabling theme-aware coloring.                                                                                                                                                                                     | `string`                                    | `"white"`   |
| `errorCorrectionLevel` | `error-correction-level` | Controls how much of the QR code is used for error correction:  - `"Low"`: ~7% error correction. Smallest code size.  - `"Medium"`: ~15% error correction.  - `"Quartile"`: ~25% error correction.  - `"High"`: ~30% error correction. Largest code size but most resilient.  Higher correction levels increase the QR code's density but allow it to remain scannable even when partially obscured or damaged. | `"High" \| "Low" \| "Medium" \| "Quartile"` | `"High"`    |
| `fill`                 | `fill`                   | The foreground color of the QR code blocks. Accepts any valid CSS color string. The special value `"currentColor"` is resolved at render time to the computed `color` of the host element.                                                                                                                                                                                                                      | `string`                                    | `"black"`   |
| `radius`               | `radius`                 | Defines how round the QR code blocks should be. Valid range is `0` (squares) to `0.5` (maximum rounding / circles). Values outside this range may produce unexpected visual results.                                                                                                                                                                                                                            | `number`                                    | `0`         |
| `size`                 | `size`                   | The total size (width and height) of the rendered QR code canvas in pixels. The canvas is always square.                                                                                                                                                                                                                                                                                                        | `number`                                    | `128`       |
| `value`                | `value`                  | The text, URL, or data to encode into the QR code. Accepts any string value. When set to `undefined` or an empty string, no QR code is rendered and the ARIA `role` and `aria-label` attributes are removed from the host.                                                                                                                                                                                      | `string`                                    | `undefined` |

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
