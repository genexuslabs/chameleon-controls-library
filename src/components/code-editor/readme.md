# ch-code-editor

<!-- Auto Generated Below -->


## Properties

| Property                  | Attribute                    | Description                                                                                                                                                                                                                  | Type                        | Default     |
| ------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ----------- |
| `enableSplitViewResizing` | `enable-split-view-resizing` | Allow the user to resize the diff editor split view. This property only works if `mode` === `"diff-editor"`.                                                                                                                 | `boolean`                   | `true`      |
| `language` _(required)_   | `language`                   | Specifies the language of the auto created model in the editor.                                                                                                                                                              | `string`                    | `undefined` |
| `mode`                    | `mode`                       | Specifies the rendered mode of the editor, allowing to set a normal editor or a diff editor.                                                                                                                                 | `"diff-editor" \| "editor"` | `"editor"`  |
| `modifiedValue`           | `modified-value`             | Specifies the modified value of the diff editor. This property only works if `mode` === `"diff-editor"`.                                                                                                                     | `string`                    | `undefined` |
| `modifiedValueReadonly`   | `modified-value-readonly`    | Specifies if the modified value of the diff editor should be readonly. This property only works if `mode` === `"diff-editor"`.                                                                                               | `boolean`                   | `true`      |
| `readonly`                | `readonly`                   | Specifies if the editor should be readonly. When `mode` === `"diff-editor"` this property will apply to the left pane.  - If `mode` === `"editor"` defaults to `false`.  - If `mode` === `"diff-editor"` defaults to `true`. | `boolean`                   | `undefined` |
| `renderSideBySide`        | `render-side-by-side`        | Render the differences in two side-by-side editors. Only works if `mode` === `"diff-editor"`.                                                                                                                                | `boolean`                   | `true`      |
| `theme`                   | `theme`                      | Specifies the theme to be used for rendering.                                                                                                                                                                                | `string`                    | `"vs"`      |
| `value`                   | `value`                      | Specifies the value of the editor. If `mode` === `"diff-editor"`, this property will be used as the original model.                                                                                                          | `string`                    | `undefined` |
| `yamlSchemaUri`           | `yaml-schema-uri`            | Specifies the schema URI for the YAML language.                                                                                                                                                                              | `string`                    | `""`        |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
