# ch-dropdown

A generic dropdown menu that has 4 slots. One for the layout of the button that
displays the dropdown, one for the dropdown header, one for the dropdown items
and the last one for the dropdown footer.

```html
<ch-dropdown
  align="Center"
  class="Class"
  dropdown-separation="5"
  expand-behavior="Click or hover"
  open-on-focus="false"
  position="Bottom"
>
  <span slot="action">User info</span>

  <div slot="header">
    <h1>John Doe</h1>
    <span>johndoe@example.com</span>
  </div>

  <ch-dropdown-item
    slot="items"
    class="dropdown-item--fancy"
    href="https://..."
    leftImgSrc="./MyProfile.svg"
    rightImgSrc="AnotherImg"
  >
    My profile
  </ch-dropdown-item>

  <ch-dropdown-item-separator slot="items"></ch-dropdown-item-separator>

  <ch-dropdown-item
    slot="items"
    id="2"
    leftImgSrc="./Logout.svg"
    rightImgSrc="item.RightImage"
  >
    Logout
  </ch-dropdown-item>

  <div slot="footer">...</div>
</ch-dropdown>
```

<!-- Auto Generated Below -->


## Properties

| Property             | Attribute             | Description                                                                                                             | Type                                     | Default            |
| -------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------ |
| `align`              | `align`               | Specifies the horizontal alignment the dropdown section has when using `position === "Top"` or `position === "Bottom"`. | `"Center" \| "Left" \| "Right"`          | `"Center"`         |
| `buttonLabel`        | `button-label`        | This attribute lets you specify the label for the expandable button. Important for accessibility.                       | `string`                                 | `"Show options"`   |
| `dropdownSeparation` | `dropdown-separation` | Specifies the separation (in pixels) between the expandable button and the dropdown section of the control.             | `number`                                 | `12`               |
| `expandBehavior`     | `expand-behavior`     | Determine which actions on the expandable button display the dropdown section.                                          | `"Click or Hover" \| "Click"`            | `"Click or Hover"` |
| `openOnFocus`        | `open-on-focus`       | Determine if the dropdown section should be opened when the expandable button of the control is focused.                | `boolean`                                | `false`            |
| `position`           | `position`            | Specifies the position of the dropdown section that is placed relative to the expandable button.                        | `"Bottom" \| "Left" \| "Right" \| "Top"` | `"Bottom"`         |
| `valign`             | `valign`              | Specifies the vertical alignment the dropdown section has when using `position === "Right"` or `position === "Left"`.   | `"Bottom" \| "Middle" \| "Top"`          | `"Middle"`         |


## Events

| Event            | Description                                                  | Type                   |
| ---------------- | ------------------------------------------------------------ | ---------------------- |
| `expandedChange` | Fired when the visibility of the dropdown section is changed | `CustomEvent<boolean>` |


## Shadow Parts

| Part                            | Description |
| ------------------------------- | ----------- |
| `"dropdown__expandable-button"` |             |
| `"dropdown__footer"`            |             |
| `"dropdown__header"`            |             |
| `"dropdown__list"`              |             |
| `"dropdown__section"`           |             |
| `"dropdown__separation"`        |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
