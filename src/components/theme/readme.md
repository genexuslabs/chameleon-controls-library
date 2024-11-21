# ch-theme



<!-- Auto Generated Below -->


## Overview

It allows you to load a style sheet in a similar way to the
native LINK or STYLE tags, but assigning it a name so that
it can be reused in different contexts,
either in the Document or in a Shadow-Root.

## Properties

| Property                      | Attribute                         | Description                                                                                                                                                                  | Type                                                                                                                               | Default     |
| ----------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `attachStyleSheets`           | `attach-style-sheets`             | Indicates whether the theme should be attached to the Document or the ShadowRoot after loading. The value can be overridden by the `attachStyleSheet` property of the model. | `boolean`                                                                                                                          | `true`      |
| `avoidFlashOfUnstyledContent` | `avoid-flash-of-unstyled-content` | `true` to visually hide the contents of the root node while the control's style is not loaded.                                                                               | `boolean`                                                                                                                          | `true`      |
| `model`                       | `model`                           | Specify themes to load                                                                                                                                                       | `ThemeItemBaseModel & { styleSheet: string; } \| ThemeItemBaseModel & { url?: string; } \| ThemeItemModel[] \| string \| string[]` | `undefined` |
| `timeout`                     | `timeout`                         | Specifies the time to wait for the requested theme to load.                                                                                                                  | `10000`                                                                                                                            | `10000`     |


## Events

| Event         | Description                                          | Type                              |
| ------------- | ---------------------------------------------------- | --------------------------------- |
| `themeLoaded` | Event emitted when the theme has successfully loaded | `CustomEvent<ChThemeLoadedEvent>` |


## Dependencies

### Used by

 - [ch-flexible-layout-render](../flexible-layout)
 - [ch-markdown-viewer](../markdown-viewer)
 - [ch-showcase](../../showcase/assets/components)
 - [ch-tabular-grid-render](../tabular-grid-render)
 - [ch-test-flexible-layout](../test/test-flexible-layout)

### Graph
```mermaid
graph TD;
  ch-flexible-layout-render --> ch-theme
  ch-markdown-viewer --> ch-theme
  ch-showcase --> ch-theme
  ch-tabular-grid-render --> ch-theme
  ch-test-flexible-layout --> ch-theme
  style ch-theme fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
