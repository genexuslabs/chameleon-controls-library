# ch-color-field



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute  | Description                                     | Type                                                           | Default                                                                                                |
| -------------- | ---------- | ----------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `disabled`     | `disabled` | Specifies if the color field is disabled.       | `boolean`                                                      | `false`                                                                                                |
| `readonly`     | `readonly` | Specifies if the color field is readonly.       | `boolean`                                                      | `false`                                                                                                |
| `step`         | `step`     | Step to navigate on the canvas.                 | `number`                                                       | `1`                                                                                                    |
| `translations` | --         | Specifies the literals required in the control. | `{ accessibleName: { label: string; description: string; }; }` | `{     accessibleName: {       description: "2D color selector",       label: "Color field"     }   }` |
| `value`        | `value`    | Selected color value.                           | `string`                                                       | `"#000"`                                                                                               |


## Events

| Event   | Description                                                                                                                                                  | Type                                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `input` | The `input` event is emitted when a change to the element's value is committed by the user.  It contains the new value (in all variants) of the color-field. | `CustomEvent<{ rgb: string; rgba: string; hsl: string; hsla: string; hex: string; hsv: { h: number; s: number; v: number; }; }>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
