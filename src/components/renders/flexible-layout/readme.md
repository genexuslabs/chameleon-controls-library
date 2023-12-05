# ch-flexible-layout-render



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute   | Description                                                     | Type                                                                                                                                                                             | Default             |
| ---------- | ----------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `cssClass` | `css-class` | A CSS class to set as the `ch-flexible-layout` element class.   | `string`                                                                                                                                                                         | `"flexible-layout"` |
| `layout`   | --          | Specifies the distribution of the items in the flexible layout. | `{ blockStart?: FlexibleLayoutItemBase[]; inlineStart?: FlexibleLayoutItem[]; main?: FlexibleLayoutItem[]; inlineEnd?: FlexibleLayoutItem[]; blockEnd?: FlexibleLayoutItem[]; }` | `undefined`         |
| `renders`  | --          | Specifies the distribution of the items in the flexible layout. | `{ [key: string]: () => any; }`                                                                                                                                                  | `undefined`         |


## Dependencies

### Used by

 - [ch-test-flexible-layout](../../test/test-flexible-layout)

### Depends on

- [ch-flexible-layout-item](../../flexible-layout/flexible-layout-item)
- [ch-flexible-layout](../../flexible-layout/flexible-layout)

### Graph
```mermaid
graph TD;
  ch-flexible-layout-render --> ch-flexible-layout-item
  ch-flexible-layout-render --> ch-flexible-layout
  ch-flexible-layout --> ch-flexible-layout-group
  ch-test-flexible-layout --> ch-flexible-layout-render
  style ch-flexible-layout-render fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
