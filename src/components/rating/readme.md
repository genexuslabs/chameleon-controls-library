# ch-rating



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute         | Description                                                                                                                                                       | Type      | Default     |
| ---------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| `accessibleName` | `accessible-name` | Specifies a short string, typically 1 to 3 words, that authors associate with an element to provide users of assistive technologies with a label for the element. | `string`  | `undefined` |
| `disabled`       | `disabled`        | This attribute allows you specify if the element is disabled. If disabled, it will not trigger any user interaction related event (for example, click event).     | `boolean` | `false`     |
| `name`           | `name`            | This property specifies the `name` of the control when used in a form.                                                                                            | `string`  | `undefined` |
| `stars`          | `stars`           | This property determine the number of stars displayed.                                                                                                            | `number`  | `5`         |
| `step`           | `step`            | This attribute lets you specify the step of the rating. It accepts non-integer values like 0.5, 0.2, 0.01 and so on.                                              | `number`  | `1`         |
| `value`          | `value`           | The current value displayed by the component.                                                                                                                     | `number`  | `0`         |


## Events

| Event   | Description                                                                                                                            | Type                  |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `input` | The `input` event is emitted when a change to the element's value is committed by the user.  It contains the new value of the control. | `CustomEvent<number>` |


## Shadow Parts

| Part                | Description |
| ------------------- | ----------- |
| `"stars-container"` |             |


## CSS Custom Properties

| Name                                            | Description                                                                                                                      |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `--ch-rating-star__selected-background-color`   | Specifies the background-color of the selected portion of the star. @default color-mix(in srgb, currentColor 15%, transparent)   |
| `--ch-rating-star__size`                        | Specifies the size of the star.                                                                                                  |
| `--ch-rating-star__unselected-background-color` | Specifies the background-color of the unselected portion of the star. @default color-mix(in srgb, currentColor 15%, transparent) |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
