# ch-code-editor

<!-- Auto Generated Below -->


## Overview

The `ch-code-editor` component provides a fully-featured code editing experience powered by the [Monaco Editor](https://microsoft.github.io/monaco-editor/).

## Features
 - IntelliSense, syntax highlighting, and configurable themes via Monaco Editor.
 - Support for any text-based language (source code, JSON, YAML, etc.).
 - YAML schema validation via `yamlSchemaUri`.
 - Monaco chunks are pre-bundled with Vite to avoid issues with StencilJS' Rollup configuration.
 - Automatic resize handling via `ResizeObserver`.

## Use when
 - Users need to author or edit source code, JSON, YAML, or other text-based languages.
 - Providing an in-app code editing experience with syntax highlighting, IntelliSense, and language support.

## Do not use when
 - Read-only code display is sufficient -- prefer `ch-code` (lightweight, no Monaco dependency).
 - Comparing two code versions -- prefer `ch-code-diff-editor`.

## Accessibility
 - Monaco Editor provides built-in keyboard accessibility, screen reader support, and ARIA attributes for the editing surface.
 - The component does not use Shadow DOM (`shadow: false`), so the Monaco editor's native accessibility features are fully available.

## Configuration Required

This control requires a copy task that includes the Monaco Web Workers from
`@genexus/chameleon-controls-library/dist/chameleon/assets`. For example, in a StencilJS project:

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

| Property                | Attribute         | Description                                                                                                                                                                                                                                                                                                                                                                                 | Type                | Default                                                                                                         |
| ----------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------- |
| `language` _(required)_ | `language`        | Specifies the language of the auto-created model in the editor (e.g., `"typescript"`, `"json"`, `"yaml"`). Must be a valid Monaco language ID. This is a required property.  Changing the language updates the model's language mode without recreating the editor instance. Interacts with `yamlSchemaUri`: when language is `"yaml"` and a schema URI is set, YAML validation is enabled. | `string`            | `undefined`                                                                                                     |
| `options`               | --                | Specifies the Monaco editor options passed to the editor instance on creation. Changes at runtime are forwarded via `updateOptions`.  The `theme` and `readOnly` fields in this object take precedence over the dedicated `theme` and `readonly` properties when both are set.                                                                                                              | `CodeEditorOptions` | `{     automaticLayout: true,     mouseWheelScrollSensitivity: 4,     mouseWheelZoom: true,     tabSize: 2   }` |
| `readonly`              | `readonly`        | Specifies if the editor should be readonly. If the `readOnly` property is specified in the `options` property, this property has no effect.                                                                                                                                                                                                                                                 | `boolean`           | `false`                                                                                                         |
| `theme`                 | `theme`           | Specifies the Monaco theme to be used for rendering (e.g., `"vs"`, `"vs-dark"`, `"hc-black"`).  Overridden if `options.theme` is set.                                                                                                                                                                                                                                                       | `string`            | `"vs"`                                                                                                          |
| `value`                 | `value`           | Specifies the text content of the editor. Setting this property replaces the entire editor content (cursor position and undo stack may be affected).                                                                                                                                                                                                                                        | `string`            | `undefined`                                                                                                     |
| `yamlSchemaUri`         | `yaml-schema-uri` | Specifies a remote schema URI for YAML language validation. Only takes effect when `language` is `"yaml"`. When changed at runtime, the editor model is recreated to apply the new schema. Set to an empty string to disable schema validation.                                                                                                                                             | `string`            | `""`                                                                                                            |


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
