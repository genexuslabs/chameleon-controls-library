# ch-tabular-grid-render



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description                                        | Type                                                                        | Default     |
| -------- | --------- | -------------------------------------------------- | --------------------------------------------------------------------------- | ----------- |
| `model`  | --        | Specifies the content of the tabular grid control. | `{ columns: TabularGridColumnModel[]; rowsets: TabularGridRowsetModel[]; }` | `undefined` |


## Dependencies

### Depends on

- [ch-tabular-grid](../tabular-grid)
- [ch-tabular-grid-columnset](../tabular-grid/columnset)
- [ch-tabular-grid-column](../tabular-grid/column)
- [ch-tabular-grid-rowset-legend](../tabular-grid/rowset/legend)

### Graph
```mermaid
graph TD;
  ch-tabular-grid-render --> ch-tabular-grid
  ch-tabular-grid-render --> ch-tabular-grid-columnset
  ch-tabular-grid-render --> ch-tabular-grid-column
  ch-tabular-grid-render --> ch-tabular-grid-rowset-legend
  ch-tabular-grid --> ch-tabular-grid-settings
  ch-tabular-grid --> ch-tabular-grid-settings-columns
  ch-tabular-grid-settings --> ch-window
  ch-window --> ch-window-close
  ch-tabular-grid-column --> ch-tabular-grid-column-settings
  ch-tabular-grid-column --> ch-tabular-grid-column-resize
  ch-tabular-grid-column-settings --> ch-window
  style ch-tabular-grid-render fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
