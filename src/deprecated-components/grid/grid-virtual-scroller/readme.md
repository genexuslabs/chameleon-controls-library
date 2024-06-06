# ch-grid-virtual-scroller



<!-- Auto Generated Below -->


> **[DEPRECATED]** Use `ch-tabular-grid` component instead. Use `ch-tabular-grid-virtual-scroller` instead.

## Overview

The `ch-grid-virtual-scroller` component that displays a subset of items.
It optimizes the rendering of large data sets by only rendering the items that are currently visible on the screen
based on the viewport size and scroll position.

## Properties

| Property        | Attribute     | Description                                                                                      | Type     | Default     |
| --------------- | ------------- | ------------------------------------------------------------------------------------------------ | -------- | ----------- |
| `items`         | --            | The list of items to be rendered in the grid.                                                    | `any[]`  | `undefined` |
| `itemsCount`    | `items-count` | The number of elements in the items list. Use if the list changes, without recreating the array. | `number` | `undefined` |
| `viewPortItems` | --            | The list of items to display within the current viewport.                                        | `any[]`  | `undefined` |


## Events

| Event                  | Description                                                       | Type               |
| ---------------------- | ----------------------------------------------------------------- | ------------------ |
| `viewPortItemsChanged` | Event emitted when the list of visible items in the grid changes. | `CustomEvent<any>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
