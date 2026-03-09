# ch-code-diff-editor

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Use when](#use-when)
- [Do not use when](#do-not-use-when)
- [Accessibility](#accessibility)
- [Configuration Required](#configuration-required)
- [Properties](#properties)
- [Methods](#methods)
  - [`updateOptions`](#updateoptionsoptions-codediffeditoroptions--promisevoid)

<!-- Auto Generated Below -->

## Overview

The `ch-code-diff-editor` component provides a side-by-side or inline diff view for comparing two versions of source code, powered by the [Monaco Editor](https://microsoft.github.io/monaco-editor/).

## Features
 - Side-by-side and inline diff rendering with syntax highlighting.
 - Scroll synchronization and inline change decorations.
 - Configurable themes, read-only mode, and YAML schema validation.
 - Automatic resize handling via `ResizeObserver`.
 - Separate `value` (original) and `modifiedValue` properties for each side of the diff.

## Use when
 - Visualizing textual differences between an original and a modified document.
 - Showing a before/after comparison of two code versions (e.g., pull request diffs, AI-generated code changes).

## Do not use when
 - Single-document editing is needed -- prefer `ch-code-editor` instead.
 - Read-only highlighted code without diff -- prefer `ch-code` instead.

## Accessibility
 - Monaco Diff Editor provides built-in keyboard accessibility, screen reader support, and ARIA attributes for both editor panes.
 - The component does not use Shadow DOM (`shadow: false`), so the Monaco editor's native accessibility features are fully available.

## Configuration Required

Like `ch-code-editor`, this control requires the Monaco Web Workers to be copied into your project's assets. For a StencilJS project, add the following copy task to your `stencil.config.ts`:

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

| Property                | Attribute         | Description                                                                                                                                                                                                                                                                            | Type                    | Default                                                                                                                                                        |
| ----------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `language` _(required)_ | `language`        | Specifies the language of the auto-created models in both the original and modified editor panes (e.g., `"typescript"`, `"json"`, `"yaml"`). Must be a valid Monaco language ID. This is a required property.  Changing the language recreates both models with the new language mode. | `string`                | `undefined`                                                                                                                                                    |
| `modifiedValue`         | `modified-value`  | Specifies the modified (right-side) text content of the diff editor. Updates the modified model in-place without recreating the editor.                                                                                                                                                | `string`                | `undefined`                                                                                                                                                    |
| `options`               | --                | Specifies the Monaco diff editor options passed on creation. Changes at runtime are forwarded via `updateOptions`.  The `theme`, `readOnly`, and `originalEditable` fields in this object take precedence over the dedicated `theme` and `readonly` properties.                        | `CodeDiffEditorOptions` | `{     automaticLayout: true,     mouseWheelScrollSensitivity: 4,     mouseWheelZoom: true,     enableSplitViewResizing: true,     renderSideBySide: true   }` |
| `readonly`              | `readonly`        | Specifies if both editor panes should be read-only. When `false`, the modified pane is editable and the original pane becomes editable too.  Overridden if `options.readOnly` or `options.originalEditable` is set.                                                                    | `boolean`               | `true`                                                                                                                                                         |
| `theme`                 | `theme`           | Specifies the Monaco theme to be used for rendering (e.g., `"vs"`, `"vs-dark"`, `"hc-black"`).  Overridden if `options.theme` is set.                                                                                                                                                  | `string`                | `"vs"`                                                                                                                                                         |
| `value`                 | `value`           | Specifies the original (left-side) text content of the diff editor. Updates the original model in-place without recreating the editor.                                                                                                                                                 | `string`                | `undefined`                                                                                                                                                    |
| `yamlSchemaUri`         | `yaml-schema-uri` | Specifies a remote schema URI for YAML language validation on both panes. Only takes effect when `language` is `"yaml"`. When changed at runtime, both editor models are recreated to apply the new schema. Set to an empty string to disable schema validation.                       | `string`                | `""`                                                                                                                                                           |

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
