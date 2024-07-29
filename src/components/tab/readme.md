# ch-tab-render

<!-- Auto Generated Below -->


## Properties

| Property                    | Attribute                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                     | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Default     |
| --------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `accessibleName`            | `accessible-name`              | Specifies a short string, typically 1 to 3 words, that authors associate with an element to provide users of assistive technologies with a label for the element.                                                                                                                                                                                                                                                                               | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `undefined` |
| `closeButtonAccessibleName` | `close-button-accessible-name` | Specifies a short string, typically 1 to 3 words, that authors associate with an element to provide users of assistive technologies with a label for the element. This label is used for the close button of the captions.                                                                                                                                                                                                                      | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `"Close"`   |
| `closeButtonHidden`         | `close-button-hidden`          | `true` to hide the close button in the items.                                                                                                                                                                                                                                                                                                                                                                                                   | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `false`     |
| `contain`                   | `contain`                      | Same as the contain CSS property. This property indicates that an item and its contents are, as much as possible, independent from the rest of the document tree. Containment enables isolating a subsection of the DOM, providing performance benefits by limiting calculations of layout, style, paint, size, or any combination to a DOM subtree rather than the entire page. Containment can also be used to scope CSS counters and quotes. | `"content" \| "inline-size" \| "layout" \| "none" \| "paint" \| "size" \| "strict" \| "style"`                                                                                                                                                                                                                                                                                                                                                                                     | `"none"`    |
| `direction`                 | `direction`                    | Specifies the flexible layout type.                                                                                                                                                                                                                                                                                                                                                                                                             | `"block" \| "inline"`                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `undefined` |
| `dragOutsideDisabled`       | `drag-outside-disabled`        | When the control is sortable, the items can be dragged outside of the tab-list. This property lets you specify if this behavior is disabled.                                                                                                                                                                                                                                                                                                    | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `false`     |
| `expanded`                  | `expanded`                     | `true` if the group has is view section expanded. Otherwise, only the toolbar will be displayed.                                                                                                                                                                                                                                                                                                                                                | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `true`      |
| `model`                     | --                             | Specifies the items of the tab control.                                                                                                                                                                                                                                                                                                                                                                                                         | `TabItemModel[]`                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `undefined` |
| `overflow`                  | `overflow`                     | Same as the overflow CSS property. This property sets the desired behavior when content does not fit in the item's padding box (overflows) in the horizontal and/or vertical direction.                                                                                                                                                                                                                                                         | `CssOverflowProperty \| "auto auto" \| "auto hidden" \| "auto clip" \| "auto scroll" \| "auto visible" \| "hidden auto" \| "hidden hidden" \| "hidden clip" \| "hidden scroll" \| "hidden visible" \| "clip auto" \| "clip hidden" \| "clip clip" \| "clip scroll" \| "clip visible" \| "scroll auto" \| "scroll hidden" \| "scroll clip" \| "scroll scroll" \| "scroll visible" \| "visible auto" \| "visible hidden" \| "visible clip" \| "visible scroll" \| "visible visible"` | `"visible"` |
| `selectedId`                | `selected-id`                  | Specifies the selected item of the widgets array.                                                                                                                                                                                                                                                                                                                                                                                               | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `undefined` |
| `showCaptions`              | `show-captions`                | `true` to show the captions of the items.                                                                                                                                                                                                                                                                                                                                                                                                       | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `true`      |
| `sortable`                  | `sortable`                     | `true` to enable sorting the tab buttons by dragging them in the tab-list. If sortable !== true, the tab buttons can not be dragged out either.                                                                                                                                                                                                                                                                                                 | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `false`     |
| `tabButtonHidden`           | `tab-button-hidden`            | `true` to not render the tab buttons of the control.                                                                                                                                                                                                                                                                                                                                                                                            | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `false`     |


## Events

| Event                | Description                                                                                             | Type                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `expandMainGroup`    | Fired when an item of the main group is double clicked.                                                 | `CustomEvent<string>`                                                                          |
| `itemClose`          | Fired the close button of an item is clicked.                                                           | `CustomEvent<{ itemId: string; itemIndex: number; }>`                                          |
| `itemDragStart`      | Fired the first time a caption button is dragged outside of its tab list.                               | `CustomEvent<number>`                                                                          |
| `selectedItemChange` | Fired when the selected item change. This event can be default prevented to prevent the item selection. | `CustomEvent<{ lastSelectedIndex: number; newSelectedId: string; newSelectedIndex: number; }>` |


## Methods

### `endDragPreview() => Promise<void>`

Ends the preview of the dragged item. Useful for ending the preview via
keyboard interaction.

#### Returns

Type: `Promise<void>`



### `getDraggableViews() => Promise<DraggableViewInfo>`

Returns the info associated to the draggable view.

#### Returns

Type: `Promise<DraggableViewInfo>`



### `promoteDragPreviewToTopLayer() => Promise<void>`

Promotes the drag preview to the top layer. Useful to avoid z-index issues.

#### Returns

Type: `Promise<void>`



### `removePage(pageId: string, forceRerender?: boolean) => Promise<void>`

Given an id, remove the page from the render

#### Parameters

| Name            | Type      | Description |
| --------------- | --------- | ----------- |
| `pageId`        | `string`  |             |
| `forceRerender` | `boolean` |             |

#### Returns

Type: `Promise<void>`




## CSS Custom Properties

| Name                                           | Description                                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| `--ch-tab-close-button__background-image-size` | Specifies the image size of the close button. @default 100%                          |
| `--ch-tab-close-button__image-size`            | Specifies the box size that contains an image for the close button. @default 0.875em |


## Dependencies

### Used by

 - [ch-flexible-layout](../flexible-layout/internal/flexible-layout)
 - [ch-showcase](../../showcase/assets/components)

### Graph
```mermaid
graph TD;
  ch-flexible-layout --> ch-tab-render
  ch-showcase --> ch-tab-render
  style ch-tab-render fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
