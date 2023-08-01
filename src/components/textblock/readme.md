# ch-textblock



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description                                                                                                                                                                                                                                                                                                                     | Type               | Default  |
| ----------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | -------- |
| `format`    | `format`     | It specifies the format that will have the textblock control.   - If `format` = `HTML`, the textblock control works as an HTML div and    the innerHTML will be taken from the default slot.   - If `format` = `Text`, the control works as a normal textblock control    and it is affected by most of the defined properties. | `"HTML" \| "Text"` | `"Text"` |
| `lineClamp` | `line-clamp` | True to cut text when it overflows, showing an ellipsis.                                                                                                                                                                                                                                                                        | `boolean`          | `false`  |


## Slots

| Slot | Description               |
| ---- | ------------------------- |
|      | The slot for the content. |


## Shadow Parts

| Part        | Description                                                                             |
| ----------- | --------------------------------------------------------------------------------------- |
| `"content"` | The main content displayed in the control. This part only applies when `format="Text"`. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
