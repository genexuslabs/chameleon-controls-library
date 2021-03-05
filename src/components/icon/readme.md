# ch-icon

A component for displaying SVG icons that allows overriding the `fill` property by setting the `--icon-color` property.

<!-- Auto Generated Below -->

## Properties

| Property | Attribute | Description                                                                   | Type      | Default |
| -------- | --------- | ----------------------------------------------------------------------------- | --------- | ------- |
| `lazy`   | `lazy`    | If enabled, the icon will be loaded lazily when it's visible in the viewport. | `boolean` | `false` |
| `src`    | `src`     | The URL of the icon.                                                          | `string`  | `""`    |

## CSS Custom Properties

| Name           | Description                                          |
| -------------- | ---------------------------------------------------- |
| `--icon-color` | - Color of the icon (sets the SVG's `fill` property) |
| `--icon-size`  | - Size of the icon (sets both width and height)      |

---

_Built with [StencilJS](https://stenciljs.com/)_
