# ch-smart-grid-cell



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute        | Description                                                                                                                                                                                                                                                                                               | Type                     | Default     |
| --------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ----------- |
| `cellId` _(required)_ | `cell-id`        | Specifies the ID of the cell.  We use a specific property instead of the actual id attribute, because with this property we don't need this ID to be unique in the Shadow scope where this cell is rendered. In other words, if there is an element with `id="1"`, this cell can still have `cellId="1"`. | `string`                 | `undefined` |
| `smartGridRef`        | `smart-grid-ref` | Specifies the reference for the smart grid parent.  This property is useful to avoid the cell from queering the ch-smart-grid ref on the initial load.                                                                                                                                                    | `HTMLChSmartGridElement` | `undefined` |


## Events

| Event              | Description                                                                                          | Type                  |
| ------------------ | ---------------------------------------------------------------------------------------------------- | --------------------- |
| `smartCellDidLoad` | Fired when the component and all its child did render for the first time.  It contains the `cellId`. | `CustomEvent<string>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
