# ch-entity-selector



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute | Description                                                                                                             | Type                                                                       | Default                                                                                                        |
| --------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `accessibilityLabels` | --        | This property provides the user a way to define custom aria-label descriptions.                                         | `{ buttonClearLabel: string; buttonSelectLabel: string; }`                 | `{     buttonClearLabel: "clears the actual value",     buttonSelectLabel: "displays the entity selector"   }` |
| `defaultValue`        | --        | Default value to be assigned as the component's value. This value should always be used when the 'X' button is pressed. | `{ id: string; name: string; iconSrc?: string; iconAutocolor?: boolean; }` | `undefined`                                                                                                    |
| `label`               | `label`   | Optional label (same as the label of an input).                                                                         | `string`                                                                   | `undefined`                                                                                                    |
| `onSelectEntity`      | --        | Callback that will be called when the user presses the action button. Returns the new value assigned to the component.  | `() => Promise<EntityData>`                                                | `undefined`                                                                                                    |
| `value`               | --        | Value currently assigned.                                                                                               | `{ id: string; name: string; iconSrc?: string; iconAutocolor?: boolean; }` | `undefined`                                                                                                    |


## Shadow Parts

| Part              | Description |
| ----------------- | ----------- |
| `"button"`        |             |
| `"button-clear"`  |             |
| `"button-select"` |             |
| `"icon"`          |             |
| `"input"`         |             |
| `"input-entity"`  |             |
| `"label"`         |             |
| `"wrapper"`       |             |


## CSS Custom Properties

| Name           | Description                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `--icon-color` | The icon color that gets applied on the ch-icon                                                   |
| `--icon-size`  | Indicates if the icon color is automatic or not. If it is, it ignores the value of '--icon-color' |


## Dependencies

### Depends on

- [ch-icon](../icon)

### Graph
```mermaid
graph TD;
  ch-entity-selector --> ch-icon
  style ch-entity-selector fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
