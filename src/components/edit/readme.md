# ch-edit

<!-- Auto Generated Below -->


## Overview

A wrapper for the input and textarea elements. It additionally provides:
 - A placeholder for `"date"`, `"datetime-local"` and `"time"` types.
 - An action button.
 - Useful style resets.
 - Support for picture formatting.
 - Support to auto grow the control when used with multiline (useful to
   model chat inputs).
 - An image which can have multiple states.
 - Support for debouncing the input event.

## Properties

| Property                          | Attribute                             | Description                                                                                                                                                                                                                                                                                                           | Type                                                                                                                          | Default          |
| --------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `accessibleName`                  | `accessible-name`                     | Specifies a short string, typically 1 to 3 words, that authors associate with an element to provide users of assistive technologies with a label for the element.                                                                                                                                                     | `string`                                                                                                                      | `undefined`      |
| `autoFocus`                       | `auto-focus`                          | Specifies if the control automatically get focus when the page loads.                                                                                                                                                                                                                                                 | `boolean`                                                                                                                     | `false`          |
| `autoGrow`                        | `auto-grow`                           | This property defines if the control size will grow automatically, to adjust to its content size.                                                                                                                                                                                                                     | `boolean`                                                                                                                     | `false`          |
| `autocapitalize`                  | `autocapitalize`                      | Specifies the auto-capitalization behavior. Same as [autocapitalize](https://developer.apple.com/library/content/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/Attributes.html#//apple_ref/doc/uid/TP40008058-autocapitalize) attribute for `input` elements. Only supported by Safari and Chrome. | `string`                                                                                                                      | `undefined`      |
| `autocomplete`                    | `autocomplete`                        | This attribute indicates whether the value of the control can be automatically completed by the browser. Same as [autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-autocomplete) attribute for `input` elements.                                                                    | `"off" \| "on"`                                                                                                               | `"off"`          |
| `clearSearchButtonAccessibleName` | `clear-search-button-accessible-name` | This property lets you specify the label for the clear search button. Important for accessibility.  Only works if `type = "search"` and `multiline = false`.                                                                                                                                                          | `string`                                                                                                                      | `"Clear search"` |
| `debounce`                        | `debounce`                            | Specifies a debounce for the input event.                                                                                                                                                                                                                                                                             | `number`                                                                                                                      | `0`              |
| `disabled`                        | `disabled`                            | This attribute lets you specify if the element is disabled. If disabled, it will not fire any user interaction related event (for example, click event).                                                                                                                                                              | `boolean`                                                                                                                     | `false`          |
| `getImagePathCallback`            | --                                    | This property specifies a callback that is executed when the path for an startImgSrc needs to be resolved.                                                                                                                                                                                                            | `(imageSrc: string) => GxImageMultiState`                                                                                     | `undefined`      |
| `hostParts`                       | `host-parts`                          | Specifies a set of parts to use in the Host element (`ch-edit`).                                                                                                                                                                                                                                                      | `string`                                                                                                                      | `undefined`      |
| `maxLength`                       | `max-length`                          | This property defines the maximum string length that the user can enter into the control.                                                                                                                                                                                                                             | `number`                                                                                                                      | `undefined`      |
| `mode`                            | `mode`                                | This attribute hints at the type of data that might be entered by the user while editing the element or its contents. This allows a browser to display an appropriate virtual keyboard. Only works when `multiline === false`.                                                                                        | `"decimal" \| "email" \| "none" \| "numeric" \| "search" \| "tel" \| "text" \| "url"`                                         | `undefined`      |
| `multiline`                       | `multiline`                           | Controls if the element accepts multiline text.                                                                                                                                                                                                                                                                       | `boolean`                                                                                                                     | `false`          |
| `name`                            | `name`                                | This property specifies the `name` of the control when used in a form.                                                                                                                                                                                                                                                | `string`                                                                                                                      | `undefined`      |
| `pattern`                         | `pattern`                             | This attribute specifies a regular expression the form control's value should match. Only works when `multiline === false`.                                                                                                                                                                                           | `string`                                                                                                                      | `undefined`      |
| `picture`                         | `picture`                             | Specifies a picture to apply for the value of the control. Only works if not `multiline`.                                                                                                                                                                                                                             | `string`                                                                                                                      | `undefined`      |
| `pictureCallback`                 | --                                    | Specifies the callback to execute when the picture must computed for the new value.                                                                                                                                                                                                                                   | `(value: any, picture: string) => string`                                                                                     | `undefined`      |
| `placeholder`                     | `placeholder`                         | A hint to the user of what can be entered in the control. Same as [placeholder](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-placeholder) attribute for `input` elements.                                                                                                                     | `string`                                                                                                                      | `undefined`      |
| `readonly`                        | `readonly`                            | This attribute indicates that the user cannot modify the value of the control. Same as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly) attribute for `input` elements.                                                                                                      | `boolean`                                                                                                                     | `false`          |
| `showTrigger`                     | `show-trigger`                        | If true, a trigger button is shown next to the edit field. The button can be customized adding a child element with `slot="trigger-content"` attribute to specify the content inside the trigger button.                                                                                                              | `boolean`                                                                                                                     | `undefined`      |
| `spellcheck`                      | `spellcheck`                          | Specifies whether the element may be checked for spelling errors                                                                                                                                                                                                                                                      | `boolean`                                                                                                                     | `false`          |
| `startImgSrc`                     | `start-img-src`                       | Specifies the source of the start image.                                                                                                                                                                                                                                                                              | `string`                                                                                                                      | `undefined`      |
| `startImgType`                    | `start-img-type`                      | Specifies the source of the start image.                                                                                                                                                                                                                                                                              | `"background" \| "mask"`                                                                                                      | `"background"`   |
| `triggerButtonAccessibleName`     | `trigger-button-accessible-name`      | This attribute lets you specify the label for the trigger button. Important for accessibility.                                                                                                                                                                                                                        | `string`                                                                                                                      | `undefined`      |
| `type`                            | `type`                                | The type of control to render. A subset of the types supported by the `input` element is supported:  * `"date"` * `"datetime-local"` * `"email"` * `"file"` * `"number"` * `"password"` * `"search"` * `"tel"` * `"text"` * `"url"`                                                                                   | `"date" \| "datetime-local" \| "email" \| "file" \| "number" \| "password" \| "search" \| "tel" \| "text" \| "time" \| "url"` | `"text"`         |
| `value`                           | `value`                               | The initial value of the control.                                                                                                                                                                                                                                                                                     | `string`                                                                                                                      | `undefined`      |


## Events

| Event          | Description                                                                                                                                                                                                                                                                                          | Type                  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `change`       | The `change` event is emitted when a change to the element's value is committed by the user. Unlike the `input` event, the `change` event is not necessarily fired for each change to an element's value but when the control loses focus. This event is _NOT_ debounced by the `debounce` property. | `CustomEvent<any>`    |
| `input`        | Fired synchronously when the value is changed. This event is debounced by the `debounce` property.                                                                                                                                                                                                   | `CustomEvent<string>` |
| `triggerClick` | Fired when the trigger button is clicked.                                                                                                                                                                                                                                                            | `CustomEvent<any>`    |


## Slots

| Slot                | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `"trigger-content"` | The slot used for the content of the trigger button. |


## Shadow Parts

| Part                 | Description                                                                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"date-placeholder"` | A placeholder displayed when the control is editable (`readonly="false"`), has no value set, and its type is `"datetime-local" \| "date" \| "time"`. |
| `"hidden-multiline"` | The auxiliary content rendered in the control to implement the auto-grow. This part only applies when `multiline="true"`.                            |
| `"trigger-button"`   | The trigger button displayed on the right side of the control when `show-trigger="true"`.                                                            |


## CSS Custom Properties

| Name                                   | Description                                                                                                                                                                                                                                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ch-edit-auto-fill-background-color` | Define the background color when the edit is auto filled. (#e8f0fe by default)                                                                                                                                                                                                                  |
| `--ch-edit-gap`                        | Specifies the gap between the start image and the value of the control. @default 0px                                                                                                                                                                                                            |
| `--ch-edit__background-image-size`     | Specifies the size of the start and clear images of the control. @default 100%                                                                                                                                                                                                                  |
| `--ch-edit__clear-button-image`        | Specifies the image for the clear button. @default url('data:image/svg+xml,<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/></svg>') |
| `--ch-edit__image-size`                | Specifies the box size that contains the start and clear images of the control. @default 0.875em                                                                                                                                                                                                |
| `--ch-placeholder-color`               | Define the placeholder color when the edit does not have a value set. (currentColor by default)                                                                                                                                                                                                 |


## Dependencies

### Used by

 - [ch-action-list-item](../action-list/internal/action-list-item)
 - [ch-chat](../chat)
 - [ch-showcase](../../showcase/assets/components)
 - [ch-test-flexible-layout](../test/test-flexible-layout)

### Graph
```mermaid
graph TD;
  ch-action-list-item --> ch-edit
  ch-chat --> ch-edit
  ch-showcase --> ch-edit
  ch-test-flexible-layout --> ch-edit
  style ch-edit fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
