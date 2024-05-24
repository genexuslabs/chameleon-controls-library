# ch-showcase



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Type                                                | Default     |
| --------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------- |
| `colorScheme`   | `color-scheme`   | Specifies the theme used in the iframe of the control                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `"dark" \| "light"`                                 | `undefined` |
| `componentName` | `component-name` | Specifies the name of the control.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `string`                                            | `undefined` |
| `designSystem`  | `design-system`  | Specifies the design system used in the iframe of the control                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `"mercury" \| "unanimo"`                            | `undefined` |
| `pageName`      | `page-name`      | Specifies the title for the current showcase.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `string`                                            | `undefined` |
| `pageSrc`       | `page-src`       | Specifies the HTML directory where the showcase for the control is placed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `string`                                            | `undefined` |
| `status`        | `status`         | Specifies the development status of the control.   - "experimental": The control is in its early stages of the development.     This phase is often useful for testing the control early, but it is     very likely that the interface will change from the final version.      Breaking changes for the control can be applied in "patch" tags.    - "developer-preview": The control is in its final stages of the     development. The interface and behaviors to implement the control are     almost complete. The interface of the control should not change so much     from the final version.      Breaking changes for the control can be applied in "major" tags.    - "stable": The control's development is stable and can be safety used     in production environments.      Breaking changes for the control can be applied in "major" tags. In     some cases, two "major" tags would be used to deprecate a behavior in     the control. | `"developer-preview" \| "experimental" \| "stable"` | `undefined` |


## Dependencies

### Depends on

- [ch-flexible-layout-render](../../../components/flexible-layout)
- [ch-checkbox](../../../components/checkbox)
- [ch-combo-box](../../../components/combobox)
- [ch-radio-group-render](../../../components/radio-group)
- [ch-dropdown-render](../../../components/dropdown)
- [ch-layout-splitter](../../../components/layout-splitter)
- [ch-qr](../../../components/qr)
- [ch-slider](../../../components/slider)
- [ch-tab-render](../../../components/tab)
- [ch-tree-view-render](../../../components/tree-view)

### Graph
```mermaid
graph TD;
  ch-showcase --> ch-flexible-layout-render
  ch-showcase --> ch-checkbox
  ch-showcase --> ch-combo-box
  ch-showcase --> ch-radio-group-render
  ch-showcase --> ch-dropdown-render
  ch-showcase --> ch-layout-splitter
  ch-showcase --> ch-qr
  ch-showcase --> ch-slider
  ch-showcase --> ch-tab-render
  ch-showcase --> ch-tree-view-render
  ch-flexible-layout-render --> ch-flexible-layout
  ch-flexible-layout --> ch-tab-render
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
