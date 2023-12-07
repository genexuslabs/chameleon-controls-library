# ch-test-flexible-layout



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description                                                     | Type                                                                                                                                                                                                                                                                                                     | Default         |
| -------- | --------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `layout` | --        | Specifies the distribution of the items in the flexible layout. | `{ blockStart?: { items: FlexibleLayoutItemBase[]; }; inlineStart?: { expanded?: boolean; items: FlexibleLayoutItem[]; }; main?: { items: FlexibleLayoutItem[]; }; inlineEnd?: { expanded?: boolean; items: FlexibleLayoutItem[]; }; blockEnd?: { expanded?: boolean; items: FlexibleLayoutItem[]; }; }` | `defaultLayout` |


## Dependencies

### Depends on

- [ch-flexible-layout-render](../../renders/flexible-layout)
- [ch-action-group-render](../../renders/action-group)
- [ch-tree-view-render](../../renders/tree-view)

### Graph
```mermaid
graph TD;
  ch-test-flexible-layout --> ch-flexible-layout-render
  ch-test-flexible-layout --> ch-action-group-render
  ch-test-flexible-layout --> ch-tree-view-render
  ch-flexible-layout-render --> ch-flexible-layout-item
  ch-flexible-layout-render --> ch-flexible-layout
  ch-flexible-layout --> ch-flexible-layout-group
  ch-action-group-render --> ch-dropdown-item
  ch-action-group-render --> ch-action-group
  ch-action-group-render --> ch-action-group-item
  ch-dropdown-item --> ch-dropdown
  ch-dropdown --> ch-window
  ch-window --> ch-window-close
  ch-action-group --> ch-dropdown
  ch-tree-view-render --> ch-tree-view
  ch-tree-view-render --> ch-tree-view-item
  ch-tree-view-item --> ch-checkbox
  style ch-test-flexible-layout fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
