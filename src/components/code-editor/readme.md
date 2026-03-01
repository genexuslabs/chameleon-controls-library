# ch-code-editor

<!-- Auto Generated Below -->


## Overview

The `ch-code-editor` component provides a fully-featured code editing
experience powered by the [Monaco Editor](https://microsoft.github.io/monaco-editor/).



## Features
 - IntelliSense, syntax highlighting, and configurable themes via Monaco Editor.
 - Support for any text-based language (source code, JSON, YAML, etc.).
 - YAML schema validation via `yamlSchemaUri`.
 - Monaco chunks are pre-bundled with Vite to avoid issues with StencilJS' Rollup configuration.

## Use when
 - Users need to author or edit source code, JSON, YAML, or other text-based languages.
 - Providing an in-app code editing experience with syntax highlighting, IntelliSense, and language support.

## Do not use when
 - You only need read-only code display — prefer `ch-code` instead.
 - You need side-by-side diff comparison — prefer `ch-code-diff-editor` instead.
 - Read-only code display is sufficient — prefer `ch-code` (lightweight, no Monaco dependency).
 - Comparing two code versions — prefer `ch-code-diff-editor`.

## Configuration Required

This control requires a copy task that includes the Monaco Web Workers from
`@genexus/chameleon-controls-library/dist/chameleon/assets`. For example, in a
StencilJS project:

```ts
// stencil.config.ts
import { Config } from "@stencil/core";

export const config: Config = {
  namespace: "your-name-space",
  outputTargets: [
    {
      type: "dist",
      copy: [
        {
          src: "../node_modules/@genexus/chameleon-controls-library/dist/chameleon/assets",
          dest: "assets"
        }
      ]
    },
    {
      type: "www",
      serviceWorker: null,
      copy: [
        {
          src: "../node_modules/@genexus/chameleon-controls-library/dist/chameleon/assets",
          dest: "assets"
        }
      ]
    }
  ]
};
```


## Properties

| Property                | Attribute         | Description                                                                                                                                 | Type                | Default                                                                                                         |
| ----------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------- |
| `language` _(required)_ | `language`        | Specifies the language of the auto created model in the editor.                                                                             | `string`            | `undefined`                                                                                                     |
| `options`               | --                | Specifies the editor options.                                                                                                               | `CodeEditorOptions` | `{     automaticLayout: true,     mouseWheelScrollSensitivity: 4,     mouseWheelZoom: true,     tabSize: 2   }` |
| `readonly`              | `readonly`        | Specifies if the editor should be readonly. If the `readOnly` property is specified in the `options` property, this property has no effect. | `boolean`           | `false`                                                                                                         |
| `theme`                 | `theme`           | Specifies the theme to be used for rendering.                                                                                               | `string`            | `"vs"`                                                                                                          |
| `value`                 | `value`           | Specifies the value of the editor.                                                                                                          | `string`            | `undefined`                                                                                                     |
| `yamlSchemaUri`         | `yaml-schema-uri` | Specifies the schema URI for the YAML language.                                                                                             | `string`            | `""`                                                                                                            |


## Methods

### `updateOptions(options: CodeEditorOptions) => Promise<void>`

Update the editor's options after the editor has been created.

#### Parameters

| Name      | Type                | Description                  |
| --------- | ------------------- | ---------------------------- |
| `options` | `CodeEditorOptions` | Set of options to be updated |

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
