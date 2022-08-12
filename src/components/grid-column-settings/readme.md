# ch-grid-menu-columns



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type           | Default     |
| -------- | --------- | ----------- | -------------- | ----------- |
| `column` | --        |             | `ChGridColumn` | `undefined` |
| `show`   | `show`    |             | `boolean`      | `false`     |


## Events

| Event                  | Description | Type               |
| ---------------------- | ----------- | ------------------ |
| `settingsCloseClicked` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [ch-grid-column](../grid-column)

### Depends on

- [ch-window](../window)

### Graph
```mermaid
graph TD;
  ch-grid-column-settings --> ch-window
  ch-grid-column --> ch-grid-column-settings
  style ch-grid-column-settings fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
