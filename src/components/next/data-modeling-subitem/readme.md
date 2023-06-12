# ch-next-data-modeling-item



<!-- Auto Generated Below -->


## Properties

| Property                 | Attribute                   | Description                                                                                                                                   | Type                           | Default     |
| ------------------------ | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----------- |
| `addNewFieldCaption`     | `add-new-field-caption`     | The caption used in the button to show the new field layout. Only useful if `addNewFieldMode = true` and `showNewFieldBtn = true`.            | `string`                       | `""`        |
| `addNewFieldMode`        | `add-new-field-mode`        | `true` to only show the component that comes with the default slot. Useful when the item is the last one of the list.                         | `boolean`                      | `false`     |
| `cancelNewFieldCaption`  | `cancel-new-field-caption`  | The caption used in the button to cancel the adding of the new field. Only useful if `addNewFieldMode = true` and `showNewFieldBtn = false`.  | `string`                       | `""`        |
| `collectionCaption`      | `collection-caption`        | The caption used when the entity is a collection (`type === "LEVEL"`).                                                                        | `string`                       | `""`        |
| `confirmNewFieldCaption` | `confirm-new-field-caption` | The caption used in the button to confirm the adding of the new field. Only useful if `addNewFieldMode = true` and `showNewFieldBtn = false`. | `string`                       | `""`        |
| `deleteButtonLabel`      | `delete-button-label`       | The label of the delete button. Important for accessibility.                                                                                  | `string`                       | `""`        |
| `description`            | `description`               | The description of the field.                                                                                                                 | `string`                       | `""`        |
| `editButtonLabel`        | `edit-button-label`         | The label of the edit button. Important for accessibility.                                                                                    | `string`                       | `""`        |
| `entityNameToATTs`       | --                          | This property maps entities of the current dataModel with their corresponding ATTs.                                                           | `{ [key: string]: string[]; }` | `{}`        |
| `name`                   | `name`                      | The name of the field.                                                                                                                        | `string`                       | `""`        |
| `type`                   | `type`                      | The type of the field.                                                                                                                        | `"ATT" \| "ENTITY" \| "LEVEL"` | `undefined` |


## Events

| Event               | Description                             | Type               |
| ------------------- | --------------------------------------- | ------------------ |
| `deleteButtonClick` | Fired when the delete button is clicked | `CustomEvent<any>` |
| `editButtonClick`   | Fired when the edit button is clicked   | `CustomEvent<any>` |


## Slots

| Slot      | Description                                        |
| --------- | -------------------------------------------------- |
| `"items"` | The first level items (entities) of the data model |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
