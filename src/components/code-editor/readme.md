# ch-code-editor

<!-- Auto Generated Below -->


## Overview

The `ch-code-editor` component provides a fully-featured code editing
experience powered by the [Monaco Editor](https://microsoft.github.io/monaco-editor/).

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
