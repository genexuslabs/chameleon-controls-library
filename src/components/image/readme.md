# ch-image

<!-- Auto Generated Below -->


## Overview

The `ch-image` component renders a multi-state image that automatically
reflects the interactive state of its parent container.


## Features
 - Visual appearance changes in response to parent state (hover, focus, active, disabled).
 - Image source resolved via a configurable callback (`getImagePathCallback`) or a globally registered resolver.
 - Supports background-image and mask-image rendering modes.
 - Renders as a purely decorative element (`aria-hidden="true"`).

## Use when
 - Displaying icons inside buttons, menu items, or any interactive element where the image must reflect the element's current state.
 - An icon or image needs to visually respond to the interactive state of its parent (hover, focus, active, disabled).

## Do not use when
 - You need a standalone, non-interactive image display.
 - A static, non-state-reactive image is needed — use a native `<img>` element directly.

## Accessibility
 - The host is marked `aria-hidden="true"` — this is a decorative element hidden from assistive technology.
## Properties

| Property               | Attribute  | Description                                                                                                                                                                                      | Type                                      | Default        |
| ---------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | -------------- |
| `containerRef`         | --         | Specifies a reference for the container, in order to update the state of the icon. The reference must be an ancestor of the control. If not specified, the direct parent reference will be used. | `HTMLElement`                             | `undefined`    |
| `disabled`             | `disabled` | Specifies if the icon is disabled.                                                                                                                                                               | `boolean`                                 | `false`        |
| `getImagePathCallback` | --         | This property specifies a callback that is executed when the path the image needs to be resolved.                                                                                                | `(imageSrc: string) => GxImageMultiState` | `undefined`    |
| `src`                  | `src`      | Specifies the src for the image.                                                                                                                                                                 | `string`                                  | `undefined`    |
| `type`                 | `type`     | Specifies how the image will be rendered.                                                                                                                                                        | `"background" \| "mask"`                  | `"background"` |


## CSS Custom Properties

| Name                         | Description                                                      |
| ---------------------------- | ---------------------------------------------------------------- |
| `--ch-image-background-size` | Specifies the size of the image. @default 100%                   |
| `--ch-image-size`            | Specifies the box size that contains the image. @default 0.875em |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
