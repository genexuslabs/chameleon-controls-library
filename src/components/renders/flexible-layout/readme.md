# ch-flexible-layout-render

The `ch-flexible-layout-render` control is a shell composed of lightweight modular widgets that provide a solid foundation for draggable dock layouts.

<!-- Auto Generated Below -->


## Properties

| Property   | Attribute   | Description                                                     | Type                                                                   | Default             |
| ---------- | ----------- | --------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------- |
| `cssClass` | `css-class` | A CSS class to set as the `ch-flexible-layout` element class.   | `string`                                                               | `"flexible-layout"` |
| `layout`   | --          | Specifies the distribution of the items in the flexible layout. | `{ direction: LayoutSplitterDirection; items: FlexibleLayoutItem[]; }` | `undefined`         |
| `renders`  | --          | Specifies the distribution of the items in the flexible layout. | `{ [key: string]: () => any; }`                                        | `undefined`         |


## Dependencies

### Used by

 - [ch-test-flexible-layout](../../test/test-flexible-layout)

### Depends on

- [ch-flexible-layout](../../flexible-layout/flexible-layout)

### Graph
```mermaid
graph TD;
  ch-flexible-layout-render --> ch-flexible-layout
  ch-flexible-layout --> ch-tab
  ch-flexible-layout --> ch-layout-splitter
  ch-test-flexible-layout --> ch-flexible-layout-render
  style ch-flexible-layout-render fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
