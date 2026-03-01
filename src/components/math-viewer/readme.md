# ch-math-viewer

<!-- Auto Generated Below -->


## Overview

The `ch-math-viewer` component renders LaTeX math expressions as accessible,
high-quality typeset mathematics using [KaTeX](https://katex.org/).

## Features
 - Accepts LaTeX blocks delimited by `$`, `\[...\]`, `\(...\)`, or bare expressions.
 - Supports both block and inline display modes.
 - Graceful error handling: exposes raw text with an error description when parsing fails.
 - Accessible output via `htmlAndMathml` rendering.

## Use when
 - Displaying mathematical formulas, equations, or scientific notation.

## Do not use when
 - Rendering general rich-text content that may include math — prefer `ch-markdown-viewer` instead.

## Accessibility
 - KaTeX renders both HTML and MathML output, allowing assistive technology to read mathematical expressions natively.
 - Error spans carry `aria-description` and `title` attributes describing the parsing error.

## Configuration Required

You must include the KaTeX custom fonts and declare their font-faces. In your main
SCSS file, import the font-faces mixin and include it:

```scss
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
