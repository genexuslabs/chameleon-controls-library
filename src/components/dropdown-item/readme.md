# ch-dropdown-item



<!-- Auto Generated Below -->


## Properties

| Property               | Attribute                | Description                                                                                                                                                       | Type                                                                                                                                                                                                                                                                                                                                                                                                                                               | Default               |
| ---------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `caption`              | `caption`                | Specifies the caption that the control will display.                                                                                                              | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                           | `undefined`           |
| `expandBehavior`       | `expand-behavior`        | Determine which actions on the expandable button display the dropdown section. Only works if the control has subitems.                                            | `"Click" \| "ClickOrHover"`                                                                                                                                                                                                                                                                                                                                                                                                                        | `"ClickOrHover"`      |
| `forceContainingBlock` | `force-containing-block` | `true` to force the control to make its own containing block.                                                                                                     | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                          | `true`                |
| `href`                 | `href`                   | Specifies the hyperlink of the item. If this property is defined, the control will render an anchor tag with this `href`. Otherwise, it will render a button tag. | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                           | `undefined`           |
| `leftImgSrc`           | `left-img-src`           | Specifies the src for the left img.                                                                                                                               | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                           | `undefined`           |
| `openOnFocus`          | `open-on-focus`          | Determine if the dropdown section should be opened when the expandable button of the control is focused. Only works if the control has subitems.                  | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                          | `false`               |
| `position`             | `position`               | Specifies the position of the dropdown section that is placed relative to the expandable button.                                                                  | `"Center_OutsideEnd" \| "Center_OutsideStart" \| "InsideEnd_OutsideEnd" \| "InsideEnd_OutsideStart" \| "InsideStart_OutsideEnd" \| "InsideStart_OutsideStart" \| "OutsideEnd_Center" \| "OutsideEnd_InsideEnd" \| "OutsideEnd_InsideStart" \| "OutsideEnd_OutsideEnd" \| "OutsideEnd_OutsideStart" \| "OutsideStart_Center" \| "OutsideStart_InsideEnd" \| "OutsideStart_InsideStart" \| "OutsideStart_OutsideEnd" \| "OutsideStart_OutsideStart"` | `"Center_OutsideEnd"` |
| `rightImgSrc`          | `right-img-src`          | Specifies the src for the right img.                                                                                                                              | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                           | `undefined`           |
| `shortcut`             | `shortcut`               | Specifies the shortcut caption that the control will display.                                                                                                     | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                           | `undefined`           |


## Events

| Event            | Description                                                  | Type                   |
| ---------------- | ------------------------------------------------------------ | ---------------------- |
| `actionClick`    | Fires when the control's anchor or button is clicked.        | `CustomEvent<string>`  |
| `expandedChange` | Fired when the visibility of the dropdown section is changed | `CustomEvent<boolean>` |
| `focusChange`    | Fires when the control's anchor or button is in focus.       | `CustomEvent<any>`     |


## Methods

### `handleFocusElement() => Promise<void>`

Focuses the control's anchor or button.

#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part         | Description |
| ------------ | ----------- |
| `"action"`   |             |
| `"button"`   |             |
| `"content"`  |             |
| `"link"`     |             |
| `"shortcut"` |             |


## Dependencies

### Used by

 - [ch-action-group-render](../renders/action-group)
 - [ch-dropdown-render](../renders/dropdown)

### Depends on

- [ch-dropdown](../dropdown)

### Graph
```mermaid
graph TD;
  ch-dropdown-item --> ch-dropdown
  ch-dropdown --> ch-popover
  ch-action-group-render --> ch-dropdown-item
  ch-dropdown-render --> ch-dropdown-item
  style ch-dropdown-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
