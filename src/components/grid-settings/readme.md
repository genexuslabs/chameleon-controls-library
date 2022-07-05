# ch-grid-settings

<!-- Auto Generated Below -->


## Properties

| Property      | Attribute | Description | Type            | Default     |
| ------------- | --------- | ----------- | --------------- | ----------- |
| `gridManager` | --        |             | `ChGridManager` | `undefined` |
| `show`        | `show`    |             | `boolean`       | `false`     |


## Events

| Event                  | Description | Type               |
| ---------------------- | ----------- | ------------------ |
| `settingsCloseClicked` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [ch-grid](../grid)

### Depends on

- [ch-window](../window)

### Graph
```mermaid
graph TD;
  ch-grid-settings --> ch-window
  ch-grid --> ch-grid-settings
  style ch-grid-settings fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
