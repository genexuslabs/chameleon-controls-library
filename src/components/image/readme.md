# ch-image

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Use when](#use-when)
- [Do not use when](#do-not-use-when)
- [Accessibility](#accessibility)
- [Properties](#properties)
- [Styling](./docs/styling.md)

<!-- Auto Generated Below -->

## Overview

The `ch-image` component renders a multi-state image that automatically reflects the interactive state of its parent container.

## Features
 - Visual appearance changes in response to parent state (hover, focus, active, disabled) via CSS custom properties (`--ch-start-img--base`, `--ch-start-img--hover`, etc.).
 - Image source resolved via a configurable callback (`getImagePathCallback`) or a globally registered resolver from the control registry.
 - Supports `"background"` (background-image) and `"mask"` (mask-image with `currentColor`) rendering modes.
 - Sets a `data-ch-image` attribute on its container element so parent-state CSS selectors can drive image state transitions.
 - Renders as a purely decorative element (`aria-hidden="true"`).

## Use when
 - Displaying icons inside buttons, menu items, or any interactive element where the image must reflect the element's current state.
 - An icon or image needs to visually respond to the interactive state of its parent (hover, focus, active, disabled).
 - You need a monochrome icon that inherits the parent's text color — use `type="mask"`.

## Do not use when
 - You need a standalone, non-interactive image display — use a native `<img>` element directly.
 - A static, non-state-reactive image is needed.
 - The image conveys meaningful content that requires alt text — this component is always `aria-hidden`.

## Accessibility
 - The host is marked `aria-hidden="true"` — this is a decorative element hidden from assistive technology.
 - Do not use this component for images that convey meaning; use a native `<img>` with `alt` text instead.

## Properties

| Property               | Attribute  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Type                                      | Default        |
| ---------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | -------------- |
| `containerRef`         | --         | Specifies a reference for the container, in order to update the state of the icon. The reference must be an ancestor of the control. If not specified, the direct parent element will be used.  The component sets a `data-ch-image` attribute on the resolved container so that CSS state selectors (`:hover`, `:active`, `:focus`) on the container can drive the image state. When the container changes, the attribute is removed from the previous container and added to the new one.  Setting to `undefined` reverts to the direct parent. | `HTMLElement`                             | `undefined`    |
| `disabled`             | `disabled` | Specifies if the icon is disabled. When `true`, the component uses the `--ch-start-img--disabled` CSS custom property (falling back to `--ch-start-img--base`) and hover/active/focus state changes are suppressed via CSS.                                                                                                                                                                                                                                                                                                                       | `boolean`                                 | `false`        |
| `getImagePathCallback` | --         | Specifies a callback that resolves an image source string into a `GxImageMultiState` object containing CSS custom property styles for each interactive state. If not provided, the component falls back to a globally registered resolver (registered via the control registry under `"getImagePathCallback"`).  If neither this callback nor the global registry provides a resolver, the image will not render (internal `#image` is set to `null`).                                                                                            | `(imageSrc: string) => GxImageMultiState` | `undefined`    |
| `src`                  | `src`      | Specifies the source identifier for the image. This value is passed to `getImagePathCallback` (or the global registry resolver) to obtain the multi-state image definition. When set to `undefined`, the image is cleared. When set to a non-empty string but the resolver returns `undefined`, the internal image reference is set to `null` (nothing renders).                                                                                                                                                                                  | `string`                                  | `undefined`    |
| `type`                 | `type`     | Specifies how the image will be rendered.  - `"background"`: renders the image as a CSS `background-image`.  - `"mask"`: renders as a CSS `mask-image` with `background-color: currentColor`, which makes the image inherit the parent's text color (useful for monochrome icons).  Defaults to `"background"`. This is an init-only property; changing it after initial render may not correctly update the CSS class.                                                                                                                           | `"background" \| "mask"`                  | `"background"` |

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
