# ch-next-drag-bar

This control defines a simple container with two slots that are separated by a draggable vertical bar, which can resize both slots.

At this moment, it only support slots separation via a vertical bar. In the future, it might support a horizontal bar to resize the height.

<!-- Auto Generated Below -->


## Properties

| Property            | Attribute             | Description                                                                                          | Type                                                                        | Default                                         |
| ------------------- | --------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------- |
| `barAccessibleName` | `bar-accessible-name` | This attribute lets you specify the label for the drag bar. Important for accessibility.             | `string`                                                                    | `""`                                            |
| `direction`         | `direction`           | Specifies the direction in which the components will be placed                                       | `"columns" \| "rows"`                                                       | `"columns"`                                     |
| `layout`            | --                    | Specifies the list of component that are displayed. Each component will be separated via a drag bar. | `{ direction: LayoutSplitterDirection; items: LayoutSplitterComponent[]; }` | `{     direction: "columns",     items: []   }` |


## Shadow Parts

| Part    | Description                                                               |
| ------- | ------------------------------------------------------------------------- |
| `"bar"` | The bar of the drag-bar control that divides the start and end components |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
