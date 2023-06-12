# ch-next-data-modeling



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute | Description                                                     | Type                      | Default     |
| ----------- | --------- | --------------------------------------------------------------- | ------------------------- | ----------- |
| `dataModel` | --        | This property represents the current data model of the project. | `{ Entities: Entity[]; }` | `undefined` |


## Events

| Event             | Description                          | Type                                        |
| ----------------- | ------------------------------------ | ------------------------------------------- |
| `dataModelUpdate` | Fired when the dataModel is updated. | `CustomEvent<{ [key: string]: string[]; }>` |


## Slots

| Slot | Description                                        |
| ---- | -------------------------------------------------- |
|      | The first level items (entities) of the data model |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
