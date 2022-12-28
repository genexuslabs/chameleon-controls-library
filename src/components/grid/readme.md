# ch-grid

<!-- Auto Generated Below -->


## Properties

| Property                | Attribute                  | Description | Type                               | Default     |
| ----------------------- | -------------------------- | ----------- | ---------------------------------- | ----------- |
| `localization`          | --                         |             | `GridLocalization`                 | `undefined` |
| `onRowHighlightedClass` | `on-row-highlighted-class` |             | `string`                           | `undefined` |
| `onRowSelectedClass`    | `on-row-selected-class`    |             | `string`                           | `undefined` |
| `rowSelectionMode`      | `row-selection-mode`       |             | `"multiple" \| "none" \| "single"` | `"single"`  |


## Events

| Event              | Description | Type                                       |
| ------------------ | ----------- | ------------------------------------------ |
| `rowClicked`       |             | `CustomEvent<ChGridRowClickedEvent>`       |
| `selectionChanged` |             | `CustomEvent<ChGridSelectionChangedEvent>` |


## Shadow Parts

| Part                 | Description |
| -------------------- | ----------- |
| `"footer"`           |             |
| `"header"`           |             |
| `"main"`             |             |
| `"row-actions"`      |             |
| `"settings-columns"` |             |


## Dependencies

### Used by

 - [gx-grid-chameleon](../gx-grid)

### Depends on

- [ch-grid-settings](../grid-settings)
- [ch-grid-settings-columns](../grid-settings/grid-settings-columns)

### Graph
```mermaid
graph TD;
  ch-grid --> ch-grid-settings
  ch-grid --> ch-grid-settings-columns
  ch-grid-settings --> ch-window
  gx-grid-chameleon --> ch-grid
  style ch-grid fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
