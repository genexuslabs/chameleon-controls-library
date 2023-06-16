# ch-next-data-modeling-item



<!-- Auto Generated Below -->


## Properties

| Property                 | Attribute                   | Description                                                                                                                                   | Type                                                                   | Default     |
| ------------------------ | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------- |
| `addNewFieldCaption`     | `add-new-field-caption`     | The caption used in the button to show the new field layout. Only useful if `addNewFieldMode = true` and `showNewFieldBtn = true`.            | `string`                                                               | `""`        |
| `addNewFieldMode`        | `add-new-field-mode`        | `true` to only show the component that comes with the default slot. Useful when the item is the last one of the list.                         | `boolean`                                                              | `false`     |
| `cancelNewFieldCaption`  | `cancel-new-field-caption`  | The caption used in the button to cancel the adding of the new field. Only useful if `addNewFieldMode = true` and `showNewFieldBtn = false`.  | `string`                                                               | `""`        |
| `collectionCaption`      | `collection-caption`        | The caption used when the entity is a collection (`type === "LEVEL"`).                                                                        | `string`                                                               | `""`        |
| `confirmNewFieldCaption` | `confirm-new-field-caption` | The caption used in the button to confirm the adding of the new field. Only useful if `addNewFieldMode = true` and `showNewFieldBtn = false`. | `string`                                                               | `""`        |
| `dataType`               | `data-type`                 | The dataType of the field.                                                                                                                    | `string`                                                               | `""`        |
| `deleteButtonLabel`      | `delete-button-label`       | The label of the delete button. Important for accessibility.                                                                                  | `string`                                                               | `""`        |
| `deleteModeCancelLabel`  | `delete-mode-cancel-label`  | The label of the cancel button in delete mode. Important for accessibility.                                                                   | `string`                                                               | `""`        |
| `deleteModeCaption`      | `delete-mode-caption`       | The caption used in the message to confirm the delete of the field.                                                                           | `string`                                                               | `""`        |
| `deleteModeConfirmLabel` | `delete-mode-confirm-label` | The label of the confirm button in delete mode. Important for accessibility.                                                                  | `string`                                                               | `""`        |
| `description`            | `description`               | The description of the field.                                                                                                                 | `string`                                                               | `""`        |
| `disabled`               | `disabled`                  | This attribute lets you specify if the element is disabled. If disabled, it will not fire any user interaction related event.                 | `boolean`                                                              | `false`     |
| `editButtonLabel`        | `edit-button-label`         | The label of the edit button. Important for accessibility.                                                                                    | `string`                                                               | `""`        |
| `entityNameToATTs`       | --                          | This property maps entities of the current dataModel with their corresponding ATTs.                                                           | `{ [key: string]: string[]; }`                                         | `{}`        |
| `errorTexts`             | --                          | The error texts used for the new field input.                                                                                                 | `{ Empty: string; AlreadyDefined1: string; AlreadyDefined2: string; }` | `undefined` |
| `fieldNames`             | --                          | This property specifies the defined field names of the current entity.                                                                        | `string[]`                                                             | `[]`        |
| `level`                  | `level`                     | This property specifies at which collection level the field is located.                                                                       | `"field" \| "subfield"`                                                | `"field"`   |
| `name`                   | `name`                      | The name of the field.                                                                                                                        | `string`                                                               | `""`        |
| `type`                   | `type`                      | The type of the field.                                                                                                                        | `"ATT" \| "ENTITY" \| "LEVEL"`                                         | `undefined` |


## Events

| Event             | Description                                   | Type                  |
| ----------------- | --------------------------------------------- | --------------------- |
| `deleteField`     | Fired when the delete button is clicked       | `CustomEvent<any>`    |
| `editButtonClick` | Fired when the edit button is clicked         | `CustomEvent<any>`    |
| `newField`        | Fired when a new file is comitted to be added | `CustomEvent<string>` |


## Slots

| Slot      | Description                                        |
| --------- | -------------------------------------------------- |
| `"items"` | The first level items (entities) of the data model |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
