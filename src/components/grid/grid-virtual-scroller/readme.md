# ch-grid-virtual-scroller



<!-- Auto Generated Below -->


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
