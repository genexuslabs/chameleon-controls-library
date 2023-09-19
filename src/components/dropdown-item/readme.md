# ch-dropdown-item



<!-- Auto Generated Below -->


## Properties

| Property               | Attribute                | Description                                                                                                                                                       | Type                                                                                                                                                                                                                                                                                                                                                                                                                                               | Default               |
| ---------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `expandBehavior`       | `expand-behavior`        | Determine which actions on the expandable button display the dropdown section. Only works if the control has subitems.                                            | `"Click" \| "ClickOrHover"`                                                                                                                                                                                                                                                                                                                                                                                                                        | `"ClickOrHover"`      |
| `forceContainingBlock` | `force-containing-block` | `true` to force the control to make its own containing block.                                                                                                     | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                          | `true`                |
| `href`                 | `href`                   | Specifies the hyperlink of the item. If this property is defined, the control will render an anchor tag with this `href`. Otherwise, it will render a button tag. | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                           | `undefined`           |
| `leftImgSrc`           | `left-img-src`           | Specifies the src for the left img.                                                                                                                               | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                           | `undefined`           |
| `openOnFocus`          | `open-on-focus`          | Determine if the dropdown section should be opened when the expandable button of the control is focused. Only works if the control has subitems.                  | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                          | `false`               |
| `position`             | `position`               | Specifies the position of the dropdown section that is placed relative to the expandable button.                                                                  | `"Center_OutsideEnd" \| "Center_OutsideStart" \| "InsideEnd_OutsideEnd" \| "InsideEnd_OutsideStart" \| "InsideStart_OutsideEnd" \| "InsideStart_OutsideStart" \| "OutsideEnd_Center" \| "OutsideEnd_InsideEnd" \| "OutsideEnd_InsideStart" \| "OutsideEnd_OutsideEnd" \| "OutsideEnd_OutsideStart" \| "OutsideStart_Center" \| "OutsideStart_InsideEnd" \| "OutsideStart_InsideStart" \| "OutsideStart_OutsideEnd" \| "OutsideStart_OutsideStart"` | `"Center_OutsideEnd"` |
| `rightImgSrc`          | `right-img-src`          | Specifies the src for the right img.                                                                                                                              | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                           | `undefined`           |


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

| Part          | Description |
| ------------- | ----------- |
| `"action"`    |             |
| `"button"`    |             |
| `"content"`   |             |
| `"left-img"`  |             |
| `"right-img"` |             |
| `"target"`    |             |


## Dependencies

### Used by

 - [ch-test-action-group](../test/test-action-group)
 - [ch-test-dropdown](../test/test-dropdown)

### Depends on

- [ch-dropdown](../dropdown)

### Graph
```mermaid
graph TD;
  ch-dropdown-item --> ch-dropdown
  ch-dropdown --> ch-window
  ch-window --> ch-window-close
  ch-test-action-group --> ch-dropdown-item
  ch-test-dropdown --> ch-dropdown-item
  style ch-dropdown-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
