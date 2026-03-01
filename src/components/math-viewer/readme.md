# ch-math-viewer

<!-- Auto Generated Below -->


## Overview

The `ch-math-viewer` component renders LaTeX math expressions as accessible,
high-quality typeset mathematics using [KaTeX](https://katex.org/).

## Properties

| Property      | Attribute      | Description                                                   | Type                  | Default     |
| ------------- | -------------- | ------------------------------------------------------------- | --------------------- | ----------- |
| `displayMode` | `display-mode` | Specifies whether to render the math in block or inline mode. | `"block" \| "inline"` | `"block"`   |
| `value`       | `value`        | Specifies the LaTeX math string to render.                    | `string`              | `undefined` |


## Shadow Parts

| Part      | Description                                                                                                                                                                           |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"error"` | A `<span>` rendered in place of a math block when KaTeX fails to parse the expression. Contains the raw source text and exposes the error message via `aria-description` and `title`. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
