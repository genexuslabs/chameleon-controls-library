# ch-showcase



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute        | Description                                                                | Type                | Default     |
| --------------- | ---------------- | -------------------------------------------------------------------------- | ------------------- | ----------- |
| `componentName` | `component-name` | Specifies the name of the control.                                         | `string`            | `undefined` |
| `pageName`      | `page-name`      | Specifies the title for the current showcase.                              | `string`            | `undefined` |
| `pageSrc`       | `page-src`       | Specifies the HTML directory where the showcase for the control is placed. | `string`            | `undefined` |
| `theme`         | `theme`          | Specifies the theme used in the iframe of the control                      | `"dark" \| "light"` | `undefined` |


## Dependencies

### Depends on

- [ch-flexible-layout-render](../../../../components/flexible-layout)
- [ch-checkbox](../../../../components/checkbox)
- [ch-combo-box](../../../../components/combobox)
- [ch-radio-group-render](../../../../components/radio-group)
- [ch-dropdown-render](../../../../components/dropdown)
- [ch-layout-splitter](../../../../components/layout-splitter)
- [ch-tree-view-render](../../../../components/tree-view)

### Graph
```mermaid
graph TD;
  ch-showcase --> ch-flexible-layout-render
  ch-showcase --> ch-checkbox
  ch-showcase --> ch-combo-box
  ch-showcase --> ch-radio-group-render
  ch-showcase --> ch-dropdown-render
  ch-showcase --> ch-layout-splitter
  ch-showcase --> ch-tree-view-render
  ch-flexible-layout-render --> ch-flexible-layout
  ch-flexible-layout --> ch-list
  ch-flexible-layout --> ch-layout-splitter
  ch-combo-box --> ch-popover
  ch-dropdown-render --> ch-dropdown
  ch-dropdown --> ch-popover
  ch-tree-view-render --> ch-tree-view
  ch-tree-view-render --> ch-tree-view-drop
  ch-tree-view-render --> ch-tree-view-item
  ch-tree-view-item --> ch-checkbox
  style ch-showcase fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
