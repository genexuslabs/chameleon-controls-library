# ch-dropdown-item



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute       | Description                                                                                                                                                       | Type     | Default     |
| ------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- |
| `href`        | `href`          | Specifies the hyperlink of the item. If this property is defined, the control will render an anchor tag with this `href`. Otherwise, it will render a button tag. | `string` | `undefined` |
| `leftImgSrc`  | `left-img-src`  | Specifies the src for the left img.                                                                                                                               | `string` | `undefined` |
| `rightImgSrc` | `right-img-src` | Specifies the src for the right img.                                                                                                                              | `string` | `undefined` |


## Events

| Event         | Description                                            | Type                  |
| ------------- | ------------------------------------------------------ | --------------------- |
| `actionClick` | Fires when the control's anchor or button is clicked.  | `CustomEvent<string>` |
| `focusChange` | Fires when the control's anchor or button is in focus. | `CustomEvent<any>`    |


## Methods

### `handleFocusElement() => Promise<void>`

Focuses the control's anchor or button.

#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part                         | Description |
| ---------------------------- | ----------- |
| `"dropdown-item__button"`    |             |
| `"dropdown-item__content"`   |             |
| `"dropdown-item__left-img"`  |             |
| `"dropdown-item__right-img"` |             |
| `"dropdown-item__target"`    |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
