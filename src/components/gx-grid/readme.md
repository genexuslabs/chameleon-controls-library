# gx-grid-chameleon

<!-- Auto Generated Below -->


## Properties

| Property        | Attribute        | Description | Type                 | Default     |
| --------------- | ---------------- | ----------- | -------------------- | ----------- |
| `grid`          | --               |             | `GxGrid`             | `undefined` |
| `gridTimestamp` | `grid-timestamp` |             | `number`             | `undefined` |
| `state`         | --               |             | `GridChameleonState` | `undefined` |


## Dependencies

### Depends on

- [ch-grid](../grid)
- [ch-grid-actionbar](../grid-actionbar)
- [ch-grid-action-refresh](../grid-action/grid-action-refresh)
- [ch-grid-action-settings](../grid-action/grid-action-settings)
- [ch-grid-columnset](../grid-columnset)
- [ch-grid-column](../grid-column)
- [ch-paginator](../paginator)
- [ch-paginator-navigate](../paginator-navigate)

### Graph
```mermaid
graph TD;
  gx-grid-chameleon --> ch-grid
  gx-grid-chameleon --> ch-grid-actionbar
  gx-grid-chameleon --> ch-grid-action-refresh
  gx-grid-chameleon --> ch-grid-action-settings
  gx-grid-chameleon --> ch-grid-columnset
  gx-grid-chameleon --> ch-grid-column
  gx-grid-chameleon --> ch-paginator
  gx-grid-chameleon --> ch-paginator-navigate
  ch-grid --> ch-grid-settings
  ch-grid --> ch-grid-settings-columns
  ch-grid-settings --> ch-window
  ch-grid-column --> ch-grid-column-settings
  ch-grid-column --> ch-grid-column-resize
  ch-grid-column-settings --> ch-window
  style gx-grid-chameleon fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
