# ch-markdown



<!-- Auto Generated Below -->


## Overview

A control to render markdown syntax. It supports GitHub Flavored Markdown
(GFM) and code highlighting.

## Properties

| Property             | Attribute              | Description                                                                                                | Type                                                                     | Default             |
| -------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------- |
| `allowDangerousHtml` | `allow-dangerous-html` | `true` to render potentially dangerous user content when rendering HTML with the option `rawHtml === true` | `boolean`                                                                | `false`             |
| `rawHtml`            | `raw-html`             | `true` to render raw HTML with sanitization.                                                               | `boolean`                                                                | `false`             |
| `renderCode`         | --                     | This property allows us to implement custom rendering for the code blocks.                                 | `(language: string, nestedChildIsCodeTag: boolean, content: any) => any` | `defaultCodeRender` |
| `value`              | `value`                | Specifies the markdown string to parse.                                                                    | `string`                                                                 | `undefined`         |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
