# ch-theme



<!-- Auto Generated Below -->


## Overview

It allows you to load a style sheet in a similar way to the
native LINK or STYLE tags, but assigning it a name so that
it can be reused in different contexts,
either in the Document or in a Shadow-Root.

## Properties

| Property                      | Attribute                         | Description                                                                                                                                                                  | Type                                                                                                                           | Default     |
| ----------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `attachStyleSheets`           | `attach-style-sheets`             | Indicates whether the theme should be attached to the Document or the ShadowRoot after loading. The value can be overridden by the `attachStyleSheet` property of the model. | `boolean`                                                                                                                      | `true`      |
| `avoidFlashOfUnstyledContent` | `avoid-flash-of-unstyled-content` | `true` to visually hide the contents of the root node while the control's style is not loaded.                                                                               | `boolean`                                                                                                                      | `true`      |
| `model`                       | `model`                           | Specify themes to load                                                                                                                                                       | `ThemeItemModel[] \| string \| string[] \| { name: string; url?: string; themeBaseUrl?: string; attachStyleSheet?: boolean; }` | `undefined` |
| `timeout`                     | `timeout`                         | Specifies the time to wait for the requested theme to load.                                                                                                                  | `10000`                                                                                                                        | `10000`     |


## Events

| Event         | Description                                          | Type                              |
| ------------- | ---------------------------------------------------- | --------------------------------- |
| `themeLoaded` | Event emitted when the theme has successfully loaded | `CustomEvent<ChThemeLoadedEvent>` |


## Dependencies

### Used by

 - [ch-markdown-viewer](../markdown-viewer)
 - [ch-tabular-grid-render](../tabular-grid-render)

### Graph
```mermaid
graph TD;
  ch-markdown-viewer --> ch-theme
  ch-tabular-grid-render --> ch-theme
  style ch-theme fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
