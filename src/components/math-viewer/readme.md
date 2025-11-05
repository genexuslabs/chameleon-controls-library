# ch-math-viewer

<!-- Auto Generated Below -->


## Overview

A component for rendering LaTeX math expressions using KaTeX.

To use this component, you must include the necessary custom fonts in your
project. These custom fonts are located in the
`node_modules/@genexus/chameleon-controls-library/dist/assets/fonts` folder.

To declare the font-faces of these custom fonts in your project, you must
use the `math-viewer-font-faces` mixin located in the
`node_modules/@genexus/chameleon-controls-library/dist/assets/scss/math-viewer-font-face.scss` folder

## Properties

| Property      | Attribute      | Description                                                   | Type                  | Default     |
| ------------- | -------------- | ------------------------------------------------------------- | --------------------- | ----------- |
| `displayMode` | `display-mode` | Specifies whether to render the math in block or inline mode. | `"block" \| "inline"` | `"block"`   |
| `value`       | `value`        | Specifies the LaTeX math string to render.                    | `string`              | `undefined` |


## Shadow Parts

| Part      | Description |
| --------- | ----------- |
| `"error"` |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
