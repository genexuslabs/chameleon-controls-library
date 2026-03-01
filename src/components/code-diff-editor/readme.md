# ch-code-diff-editor



<!-- Auto Generated Below -->


## Overview

The `ch-code-diff-editor` component provides a side-by-side or inline diff
view for comparing two versions of source code, powered by the
[Monaco Editor](https://microsoft.github.io/monaco-editor/).



## Features
 - Side-by-side and inline diff rendering with syntax highlighting.
 - Scroll synchronization and inline change decorations.
 - Configurable themes, read-only mode, and YAML schema validation.

## Use when
 - Visualizing textual differences between an original and a modified document.
 - Showing a before/after comparison of two code versions (e.g., pull request diffs, AI-generated code changes).

## Do not use when
 - You need single-document editing — prefer `ch-code-editor` instead.
 - You need read-only highlighted code — prefer `ch-code` instead.
 - Only one version needs to be displayed — prefer `ch-code-editor` or `ch-code`.

## Configuration Required

Like `ch-code-editor`, this control requires the Monaco Web Workers to be copied
into your project's assets. For a StencilJS project, add the following copy task
to your `stencil.config.ts`:

```ts
{
  type: "dist",
  copy: [
    {
      src: "../node_modules/@genexus/chameleon-controls-library/dist/chameleon/assets",
      dest: "assets"
    }
  ]
}
```


## Properties

| Property                | Attribute         | Description                                                                                                                                                       | Type                    | Default                                                                                                                                                        |
| ----------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `language` _(required)_ | `language`        | Specifies the language of the auto created model in the editor.                                                                                                   | `string`                | `undefined`                                                                                                                                                    |
| `modifiedValue`         | `modified-value`  | Specifies the modified value of the diff editor.                                                                                                                  | `string`                | `undefined`                                                                                                                                                    |
| `options`               | --                | Specifies the editor options.                                                                                                                                     | `CodeDiffEditorOptions` | `{     automaticLayout: true,     mouseWheelScrollSensitivity: 4,     mouseWheelZoom: true,     enableSplitViewResizing: true,     renderSideBySide: true   }` |
| `readonly`              | `readonly`        | Specifies if the editor should be readonly. If the `readOnly` or `originalEditable` property is specified in the `options` property, this property has no effect. | `boolean`               | `true`                                                                                                                                                         |
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
