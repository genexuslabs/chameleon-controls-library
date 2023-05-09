# ch-next-drag-bar

This control defines a simple container with two slots that are separated by a draggable vertical bar, which can resize both slots.

At this moment, it only support slots separation via a vertical bar. In the future, it might support a horizontal bar to resize the height.

<!-- Auto Generated Below -->


## Properties

| Property                     | Attribute                       | Description                                                                                               | Type      | Default     |
| ---------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| `barItemSrc`                 | `bar-item-src`                  | Specifies the bar item src. If defined, it will set an image to replace the default bar item.             | `string`  | `""`        |
| `barLabel`                   | `bar-label`                     | This attribute lets you specify the label for the drag bar. Important for accessibility.                  | `string`  | `""`        |
| `cssClass`                   | `css-class`                     | A CSS class to set as the `ch-next-drag-bar` element class.                                               | `string`  | `undefined` |
| `showBarItem`                | `show-bar-item`                 | If `true` an item at the middle of the bar will be displayed to give more context about the resize action | `boolean` | `true`      |
| `startComponentInitialWidth` | `start-component-initial-width` | Specifies the initial width of the start component                                                        | `string`  | `"50%"`     |


## Slots

| Slot                | Description                                                                  |
| ------------------- | ---------------------------------------------------------------------------- |
| `"end-component"`   | The component to be displayed in the right position when using LTR languages |
| `"start-component"` | The component to be displayed in the left position when using LTR languages  |


## Shadow Parts

| Part                | Description                                                               |
| ------------------- | ------------------------------------------------------------------------- |
| `"bar"`             | The bar of the drag-bar control that divides the start and end components |
| `"bar-item"`        | The bar item displayed in the center of the bar                           |
| `"bar-item-src"`    | The image control displayed inside the `bar-item`                         |
| `"end-component"`   | The component that wraps the `end-component` slot                         |
| `"start-component"` | The component that wraps the `start-component` slot                       |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
