# ch-action-group-item



<!-- Auto Generated Below -->


## Properties

| Property                 | Attribute                    | Description                                                                                                        | Type      | Default     |
| ------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------- | ----------- |
| `cssClass`               | `css-class`                  | A CSS class to set as the `ch-action-group-item` element class when it is un the first level (disposedTop = true). | `string`  | `undefined` |
| `deactivated`            | `deactivated`                | This attribute lets you specify if the action item is activated or not.                                            | `boolean` | `true`      |
| `disabled`               | `disabled`                   | This attribute lets you specify if the action item is disabled or not.                                             | `boolean` | `false`     |
| `disposedTop`            | `disposed-top`               | Visual position of the menu of item. When action item is in the first level disposedTop = true.                    | `boolean` | `false`     |
| `groupedClass`           | `grouped-class`              | A CSS class to set as the `ch-action-group-item` element class when it is inside a ch-action-group-menu.           | `string`  | `undefined` |
| `link`                   | `link`                       | The url for item navigate.                                                                                         | `string`  | `undefined` |
| `presented`              | `presented`                  | This attribute lets you specify if the action item is presented or not.                                            | `boolean` | `true`      |
| `showActionsMenuOnHover` | `show-actions-menu-on-hover` | When it's true and an the action is hovered show the menu.                                                         | `boolean` | `true`      |


## Events

| Event                     | Description                                                 | Type                                        |
| ------------------------- | ----------------------------------------------------------- | ------------------------------------------- |
| `actionGroupItemKeyDown`  | Fired when a KeyboardEvent is captured for the action item. | `CustomEvent<ActionGroupItemKeyDownEvent>`  |
| `actionGroupItemSelected` | Fired when the item is selected.                            | `CustomEvent<HTMLChActionGroupItemElement>` |
| `actionGroupItemTargeted` | Fired when the item is targeted or not.                     | `CustomEvent<ActionGroupItemTargetEvent>`   |


## Slots

| Slot | Description                                                                        |
| ---- | ---------------------------------------------------------------------------------- |
|      | The slot where you can put the text or element for the <a> inside the action item. |


## Shadow Parts

| Part     | Description                             |
| -------- | --------------------------------------- |
| `"link"` | The <a> element inside the action item. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
