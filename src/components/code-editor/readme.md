# ch-code-editor

A Web Component based on the Monaco editor. We use Vite to prebundle the Monaco's chunks to avoid issues with StencilJS' rollup configuration.

This control provides code editing and code diffing. It also presents properties to customize its behavior, such as `theme`, `language`, etc.

To use this control it's important to have a copy task that includes the Web Workers used by the Monaco editor. Those Web Workers are placed in the `@genexus/chameleon-controls-library/dist/chameleon/assets` folder. For example, in a StencilJS project add the following configuration:

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

<!-- Auto Generated Below -->


## Properties

| Property                | Attribute         | Description                                                     | Type                | Default                                                                                                                                |
| ----------------------- | ----------------- | --------------------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `language` _(required)_ | `language`        | Specifies the language of the auto created model in the editor. | `string`            | `undefined`                                                                                                                            |
| `options`               | --                | Specifies the editor options.                                   | `CodeEditorOptions` | `{     theme: this.theme,     automaticLayout: true,     mouseWheelScrollSensitivity: 4,     mouseWheelZoom: true,     tabSize: 2   }` |
| `readonly`              | `readonly`        | Specifies if the editor should be readonly.                     | `boolean`           | `false`                                                                                                                                |
| `theme`                 | `theme`           | Specifies the theme to be used for rendering.                   | `string`            | `"vs"`                                                                                                                                 |
| `value`                 | `value`           | Specifies the value of the editor.                              | `string`            | `undefined`                                                                                                                            |
| `yamlSchemaUri`         | `yaml-schema-uri` | Specifies the schema URI for the YAML language.                 | `string`            | `""`                                                                                                                                   |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
