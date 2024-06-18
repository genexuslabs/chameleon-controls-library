# ch-code-diff-editor



<!-- Auto Generated Below -->


## Properties

| Property                | Attribute         | Description                                                                                                                                                       | Type                    | Default                                                                                                                                                        |
| ----------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `language` _(required)_ | `language`        | Specifies the language of the auto created model in the editor.                                                                                                   | `string`                | `undefined`                                                                                                                                                    |
| `modifiedValue`         | `modified-value`  | Specifies the modified value of the diff editor.                                                                                                                  | `string`                | `undefined`                                                                                                                                                    |
| `options`               | --                | Specifies the editor options.                                                                                                                                     | `CodeDiffEditorOptions` | `{     automaticLayout: true,     mouseWheelScrollSensitivity: 4,     mouseWheelZoom: true,     enableSplitViewResizing: true,     renderSideBySide: true   }` |
| `readonly`              | `readonly`        | Specifies if the editor should be readonly. If the ´readOnly´ or ´originalEditable´ property is specified in the ´options´ property, this property has no effect. | `boolean`               | `true`                                                                                                                                                         |
| `theme`                 | `theme`           | Specifies the theme to be used for rendering.                                                                                                                     | `string`                | `"vs"`                                                                                                                                                         |
| `value`                 | `value`           | Specifies the original value of the diff editor.                                                                                                                  | `string`                | `undefined`                                                                                                                                                    |
| `yamlSchemaUri`         | `yaml-schema-uri` | Specifies the schema URI for the YAML language.                                                                                                                   | `string`                | `""`                                                                                                                                                           |


## Methods

### `updateOptions(options: CodeDiffEditorOptions) => Promise<void>`

Update the editor's options after the editor has been created.

#### Parameters

| Name      | Type                    | Description                  |
| --------- | ----------------------- | ---------------------------- |
| `options` | `CodeDiffEditorOptions` | Set of options to be updated |

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
