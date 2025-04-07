# ch-grid-infinite-scroller



<!-- Auto Generated Below -->


> **[DEPRECATED]** Use `ch-tabular-grid` component instead. Use `ch-tabular-grid-infinite-scroll` instead.

## Overview

The 'ch-grid-infinite-scroll' provides infinite scroll functionality for a 'ch-grid' component

## Properties

| Property | Attribute | Description                                              | Type                    | Default    |
| -------- | --------- | -------------------------------------------------------- | ----------------------- | ---------- |
| `status` | `status`  | Indicates whether the grid is loading or already loaded. | `"loaded" \| "loading"` | `"loaded"` |


## Events

| Event      | Description                        | Type               |
| ---------- | ---------------------------------- | ------------------ |
| `infinite` | Event emitted when end is reached. | `CustomEvent<any>` |


## Methods

### `complete() => Promise<void>`

Indicates that the grid is already loaded.

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
