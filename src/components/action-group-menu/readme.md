# ch-action-group-menu



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description                                                                     | Type      | Default     |
| -------------- | --------------- | ------------------------------------------------------------------------------- | --------- | ----------- |
| `caption`      | `caption`       | The aria label for the accessibility of the component.                          | `""`      | `""`        |
| `closed`       | `closed`        | If the menu is opened or closed.                                                | `boolean` | `true`      |
| `cssClass`     | `css-class`     | A CSS class to set as the `ch-action-group-menu` element class.                 | `string`  | `undefined` |
| `disposedTop`  | `disposed-top`  | Visual disposition of the menu.                                                 | `boolean` | `false`     |
| `openIndex`    | `open-index`    | The index of item action that is targeted.                                      | `number`  | `null`      |
| `parentScroll` | `parent-scroll` | Used when the ch-action-group scroll changed, then update the position of menu. | `number`  | `0`         |
| `parentSize`   | `parent-size`   | Used when the ch-action-group scroll changed, then update the position of menu. | `number`  | `0`         |


## Slots

| Slot | Description                                   |
| ---- | --------------------------------------------- |
|      | The slot where you can put the actions items. |


## Dependencies

### Used by

 - [ch-action-group](../action-group)

### Graph
```mermaid
graph TD;
  ch-action-group --> ch-action-group-menu
  style ch-action-group-menu fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
