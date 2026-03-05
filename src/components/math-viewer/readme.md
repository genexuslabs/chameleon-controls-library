# ch-math-viewer

<!-- Auto Generated Below -->


## Overview

The `ch-math-viewer` component renders LaTeX math expressions as accessible, high-quality typeset mathematics using [KaTeX](https://katex.org/).

## Features
 - Accepts LaTeX blocks delimited by `$$`, `\[...\]`, `\(...\)`, or bare expressions.
 - Supports both block and inline display modes via the `displayMode` property (reflected as an HTML attribute for CSS targeting).
 - Multi-paragraph support: paragraphs separated by blank lines are rendered as individual math blocks.
 - Graceful error handling: on parse failure, renders raw source text in a `<span part="error">` with the error message exposed via `aria-description` and `title`.
 - Accessible output via `htmlAndMathml` rendering.

## Use when
 - Displaying mathematical formulas, equations, or scientific notation.

## Do not use when
 - Rendering general rich-text content that may include math. Prefer `ch-markdown-viewer` instead.

## Accessibility
 - KaTeX renders both HTML and MathML output, allowing assistive technology to read mathematical expressions natively.
 - Error spans carry `aria-description` and `title` attributes describing the parsing error, so screen readers can announce what went wrong.

## Configuration Required

You must include the KaTeX custom fonts and declare their font-faces. In your main SCSS file, import the font-faces mixin and include it:

```scss

## Properties

| Property      | Attribute      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Type                  | Default     |
| ------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | ----------- |
| `displayMode` | `display-mode` | Specifies whether to render the math in block or inline mode.  - `"block"`: Renders display-style math (centered, larger, with vertical    spacing). The host element uses `display: block`.  - `"inline"`: Renders inline math that flows with surrounding text. The    host element uses `display: inline-block`.  This property is reflected as an HTML attribute, enabling CSS selectors like `:host([display-mode="inline"])` for layout customization.  Individual math blocks in the `value` string may auto-detect as block-style if they start with `\\[`, `$$`, `\\begin`, or contain alignment operators (`&=`, `^`), overriding this setting for that block. | `"block" \| "inline"` | `"block"`   |
| `value`       | `value`        | Specifies the LaTeX math string to render. Multiple math blocks can be separated by blank lines (double newlines); each block is rendered independently.  Delimiters (`$$`, `\[...\]`, `\(...\)`, `$...$`) are automatically stripped before passing to KaTeX. When `undefined` or empty, the component renders nothing.                                                                                                                                                                                                                                                                                                                                                 | `string`              | `undefined` |


## Shadow Parts

| Part      | Description                                                                                                                                                                           |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"error"` | A `<span>` rendered in place of a math block when KaTeX fails to parse the expression. Contains the raw source text and exposes the error message via `aria-description` and `title`. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
