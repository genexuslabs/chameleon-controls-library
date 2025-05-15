# ch-rating



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute         | Description                                                                                                                                                       | Type      | Default     |
| ---------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| `accessibleName` | `accessible-name` | Specifies a short string, typically 1 to 3 words, that authors associate with an element to provide users of assistive technologies with a label for the element. | `string`  | `undefined` |
| `disabled`       | `disabled`        | This attribute allows you specify if the element is disabled. If disabled, it will not trigger any user interaction related event (for example, click event).     | `boolean` | `false`     |
| `stars`          | `stars`           | This property determine the number of stars displayed.                                                                                                            | `number`  | `5`         |
| `step`           | `step`            | This attribute lets you specify the step of the rating. It accepts non-integer values like 0.5, 0.2, 0.01 and so on.                                              | `number`  | `1`         |
| `value`          | `value`           | The current value displayed by the component.                                                                                                                     | `number`  | `0`         |


## Shadow Parts

| Part                | Description |
| ------------------- | ----------- |
| `"star"`            |             |
| `"stars-container"` |             |


## CSS Custom Properties

| Name                    | Description                     |
| ----------------------- | ------------------------------- |
| `--ch-rating-star-size` | Specifies the size of the star. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
