# ch-flexible-layout



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute | Description                                                       | Type                                                                                                                                                                             | Default                                                                                            |
| ---------------- | --------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `displayedItems` | --        | Specifies the items in the flexible layout that must be rendered. | `{ blockStart?: string[]; inlineStart?: string[]; main?: string[]; inlineEnd?: string[]; blockEnd?: string[]; }`                                                                 | `{     blockStart: [],     inlineStart: [],     main: [],     inlineEnd: [],     blockEnd: []   }` |
| `layout`         | --        | Specifies the distribution of the items in the flexible layout.   | `{ blockStart?: FlexibleLayoutItemBase[]; inlineStart?: FlexibleLayoutItem[]; main?: FlexibleLayoutItem[]; inlineEnd?: FlexibleLayoutItem[]; blockEnd?: FlexibleLayoutItem[]; }` | `undefined`                                                                                        |


## Dependencies

### Used by

 - [ch-flexible-layout-render](../../renders/flexible-layout)

### Depends on

- [ch-flexible-layout-group](../flexible-layout-group)

### Graph
```mermaid
graph TD;
  ch-flexible-layout --> ch-flexible-layout-group
  ch-flexible-layout-render --> ch-flexible-layout
  style ch-flexible-layout fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
