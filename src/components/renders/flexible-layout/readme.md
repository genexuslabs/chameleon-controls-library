# ch-flexible-layout-render

The `ch-flexible-layout-render` control is a shell composed of lightweight modular widgets that provide a solid foundation for draggable dock layouts.

<!-- Auto Generated Below -->


## Properties

| Property   | Attribute   | Description                                                     | Type                                                                           | Default             |
| ---------- | ----------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------- |
| `cssClass` | `css-class` | A CSS class to set as the `ch-flexible-layout` element class.   | `string`                                                                       | `"flexible-layout"` |
| `layout`   | --          | Specifies the distribution of the items in the flexible layout. | `Omit<LayoutSplitterDistribution, "items"> & { items: FlexibleLayoutItem[]; }` | `undefined`         |
| `renders`  | --          | Specifies the distribution of the items in the flexible layout. | `{ [key: string]: (widgetInfo: FlexibleLayoutWidget) => any; }`                | `undefined`         |


## Methods

### `addSiblingView(parentGroup: string, siblingItem: string, placedInTheSibling: "before" | "after", viewInfo: FlexibleLayoutLeaf, takeHalfTheSpaceOfTheSiblingItem: boolean) => Promise<boolean>`

Add a view with widgets to render. The view will take the half space of
the sibling view that its added with.

#### Parameters

| Name                               | Type                                                                                                          | Description |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------- |
| `parentGroup`                      | `string`                                                                                                      |             |
| `siblingItem`                      | `string`                                                                                                      |             |
| `placedInTheSibling`               | `"after" \| "before"`                                                                                         |             |
| `viewInfo`                         | `LayoutSplitterDistributionLeaf & { accessibleRole?: ViewAccessibleRole; } & FlexibleLayoutLeafConfiguration` |             |
| `takeHalfTheSpaceOfTheSiblingItem` | `boolean`                                                                                                     |             |

#### Returns

Type: `Promise<boolean>`



### `addWidget(leafId: string, widget: FlexibleLayoutWidget, selectWidget?: boolean) => Promise<void>`

Add a widget in a `"tabbed"` type leaf.
Only works if the parent leaf is `"tabbed"` type.
If a widget with the same ID already exists, this method has not effect.

To add a widget in a `"single-content"` type leaf, use the
`addSiblingView` method.

#### Parameters

| Name           | Type                                                                                                                                                                                           | Description |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `leafId`       | `string`                                                                                                                                                                                       |             |
| `widget`       | `{ addWrapper?: boolean; conserveRenderState?: boolean; id: string; name: string; startImageSrc?: string; startImageType?: ImageRender; wasRendered?: boolean; } & FlexibleLayoutWidgetRender` |             |
| `selectWidget` | `boolean`                                                                                                                                                                                      |             |

#### Returns

Type: `Promise<void>`



### `removeView(leafId: string, removeRenderedWidgets: boolean) => Promise<FlexibleLayoutViewRemoveResult>`

Removes a view and optionally all its rendered widget from the render.
The reserved space will be given to the closest view.

#### Parameters

| Name                    | Type      | Description |
| ----------------------- | --------- | ----------- |
| `leafId`                | `string`  |             |
| `removeRenderedWidgets` | `boolean` |             |

#### Returns

Type: `Promise<FlexibleLayoutViewRemoveResult>`



### `removeWidget(widgetId: string) => Promise<void>`

Remove a widget from a `"tabbed"` type leaf.
Only works if the parent leaf is `"tabbed"` type.

To remove a widget from a `"single-content"` type leaf, use the
`removeView` method.

#### Parameters

| Name       | Type     | Description |
| ---------- | -------- | ----------- |
| `widgetId` | `string` |             |

#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [ch-test-flexible-layout](../../test/test-flexible-layout)

### Depends on

- [ch-flexible-layout](../../flexible-layout)

### Graph
```mermaid
graph TD;
  ch-flexible-layout-render --> ch-flexible-layout
  ch-flexible-layout --> ch-list
  ch-flexible-layout --> ch-layout-splitter
  ch-test-flexible-layout --> ch-flexible-layout-render
  style ch-flexible-layout-render fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
