# gx-grid-chameleon

<!-- Auto Generated Below -->


## Properties

| Property            | Attribute        | Description                                                            | Type                 | Default     |
| ------------------- | ---------------- | ---------------------------------------------------------------------- | -------------------- | ----------- |
| `grid` _(required)_ | --               | The GxGrid instance representing the data to be displayed in the grid. | `GxGrid`             | `undefined` |
| `gridTimestamp`     | `grid-timestamp` | The timestamp indicating the time when the grid was last updated.      | `number`             | `undefined` |
| `state`             | --               | The UI state of the Grid.                                              | `GridChameleonState` | `undefined` |


## Dependencies

### Depends on

- [ch-grid-actionbar](../../deprecated-components/grid/grid-actionbar)
- [ch-grid-action-refresh](../../deprecated-components/grid/grid-actionbar/grid-action-refresh)
- [ch-grid-action-settings](../../deprecated-components/grid/grid-actionbar/grid-action-settings)
- [ch-grid-columnset](../../deprecated-components/grid/grid-columnset)
- [ch-grid-column](../../deprecated-components/grid/grid-column)
- [gx-grid-chameleon-column-filter](gx-grid-column-filter)
- [ch-paginator](../paginator)
- [ch-paginator-pages](../paginator/paginator-pages)
- [ch-paginator-navigate](../paginator/paginator-navigate)
- [ch-grid](../../deprecated-components/grid)

### Graph
```mermaid
graph TD;
  gx-grid-chameleon --> ch-grid-actionbar
  gx-grid-chameleon --> ch-grid-action-refresh
  gx-grid-chameleon --> ch-grid-action-settings
  gx-grid-chameleon --> ch-grid-columnset
  gx-grid-chameleon --> ch-grid-column
  gx-grid-chameleon --> gx-grid-chameleon-column-filter
  gx-grid-chameleon --> ch-paginator
  gx-grid-chameleon --> ch-paginator-pages
  gx-grid-chameleon --> ch-paginator-navigate
  gx-grid-chameleon --> ch-grid
  ch-grid-column --> ch-grid-column-settings
  ch-grid-column --> ch-grid-column-resize
  ch-grid-column-settings --> ch-window
  ch-window --> ch-window-close
  ch-grid --> ch-grid-settings
  ch-grid --> ch-grid-settings-columns
  ch-grid-settings --> ch-window
  style gx-grid-chameleon fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
