# ch-theme



<!-- Auto Generated Below -->


## Overview

It allows you to load a style sheet in a similar way to the
native LINK or STYLE tags, but assigning it a name so that
it can be reused in different contexts,
either in the Document or in a Shadow-Root.

## Properties

| Property                      | Attribute                         | Description                                                                                    | Type                                                                                               | Default     |
| ----------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------- |
| `avoidFlashOfUnstyledContent` | `avoid-flash-of-unstyled-content` | `true` to visually hide the contents of the root node while the control's style is not loaded. | `boolean`                                                                                          | `true`      |
| `model`                       | `model`                           | Specify themes to load                                                                         | `ThemeItemModel[] \| string \| string[] \| { name: string; url?: string; themeBaseUrl?: string; }` | `undefined` |
| `timeout`                     | `timeout`                         | Specifies the time to wait for the requested theme to load.                                    | `10000`                                                                                            | `10000`     |


## Events

| Event         | Description                                          | Type                              |
| ------------- | ---------------------------------------------------- | --------------------------------- |
| `themeLoaded` | Event emitted when the theme has successfully loaded | `CustomEvent<ChThemeLoadedEvent>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
