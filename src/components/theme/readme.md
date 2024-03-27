# ch-theme



<!-- Auto Generated Below -->


## Overview

It allows you to load a style sheet in a similar way to the
native LINK or STYLE tags, but assigning it a name so that
it can be reused in different contexts,
either in the Document or in a Shadow-Root.

## Properties

| Property  | Attribute  | Description                                                                     | Type      | Default     |
| --------- | ---------- | ------------------------------------------------------------------------------- | --------- | ----------- |
| `baseUrl` | `base-url` | A string containing the baseURL used to resolve relative URLs in the stylesheet | `string`  | `undefined` |
| `href`    | `href`     | Specifies the location of the stylesheet theme                                  | `string`  | `undefined` |
| `loaded`  | `loaded`   | Indicates whether the theme has successfully loaded                             | `boolean` | `false`     |
| `name`    | `name`     | Specifies the name of the theme to instantiate                                  | `string`  | `undefined` |


## Events

| Event         | Description                                          | Type                              |
| ------------- | ---------------------------------------------------- | --------------------------------- |
| `themeLoaded` | Event emitted when the theme has successfully loaded | `CustomEvent<ChThemeLoadedEvent>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
