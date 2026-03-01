# ch-rating

<!-- Auto Generated Below -->


## Overview

The `ch-rating` component displays a star-based rating control that allows
users to select a value from zero up to a configurable maximum number of stars.

## Features
 - Configurable number of stars.
 - Partial (fractional) star selection for averaged ratings.
 - Form-associated via `ElementInternals` for native form submissions.
 - Radio group pattern internally for full keyboard and screen reader accessibility.

## Use when
 - Product reviews, feedback forms, or satisfaction ratings are needed.
 - A visual quality rating is required.
 - Collecting subjective quality feedback (e.g., product reviews, content ratings).
 - Displaying aggregated star ratings alongside user-generated content.

## Do not use when
 - Simple numeric input is needed — prefer `ch-slider` instead.
 - Precise numeric input is needed — prefer `ch-slider` or `ch-edit` with `type="number"`.
 - The scale semantics are unclear to users without a legend explaining what each star means.
 - The rating is read-only / display-only — remove interactive behaviors and provide equivalent alt text.

## Accessibility
 - Form-associated via `ElementInternals` — participates in native form validation and submission.
 - Delegates focus into the shadow DOM (`delegatesFocus: true`).
 - Implements the `radiogroup` pattern — the host receives `role="radiogroup"` and each star is a native `<input type="radio">`.
 - Each radio input carries an `aria-label` describing its value (e.g. "3 stars").
 - Resolves its accessible name from an external `<label>` element or the `accessibleName` property.
## Properties

| Property         | Attribute         | Description                                                                                                                                                       | Type      | Default     |
| ---------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| `accessibleName` | `accessible-name` | Specifies a short string, typically 1 to 3 words, that authors associate with an element to provide users of assistive technologies with a label for the element. | `string`  | `undefined` |
| `disabled`       | `disabled`        | This attribute allows you specify if the element is disabled. If disabled, it will not trigger any user interaction related event (for example, click event).     | `boolean` | `false`     |
| `name`           | `name`            | This property specifies the `name` of the control when used in a form.                                                                                            | `string`  | `undefined` |
| `stars`          | `stars`           | This property determine the number of stars displayed.                                                                                                            | `number`  | `5`         |
| `value`          | `value`           | The current value displayed by the component.                                                                                                                     | `number`  | `0`         |


## Events

| Event   | Description                                                                                                                            | Type                  |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `input` | The `input` event is emitted when a change to the element's value is committed by the user.  It contains the new value of the control. | `CustomEvent<number>` |


## Shadow Parts

| Part                 | Description                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| `"partial-selected"` | Present in the `star-container` and `star` parts when the star is partially selected (fractional value).        |
| `"selected"`         | Present in the `star-container` and `star` parts when the star is fully selected.                               |
| `"star"`             | The visual star element rendered inside each star container. Combined with state parts to indicate selection.   |
| `"star-container"`   | The wrapper for an individual star, including its radio input. Combined with state parts to indicate selection. |
| `"stars-container"`  | The container that wraps all individual star elements.                                                          |
| `"unselected"`       | Present in the `star-container` and `star` parts when the star is not selected at all.                          |


## CSS Custom Properties

| Name                                            | Description                                                                                                                      |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `--ch-rating-star__selected-background-color`   | Specifies the background-color of the selected portion of the star. @default color-mix(in srgb, currentColor 15%, transparent)   |
| `--ch-rating-star__size`                        | Specifies the size of the star.                                                                                                  |
| `--ch-rating-star__unselected-background-color` | Specifies the background-color of the unselected portion of the star. @default color-mix(in srgb, currentColor 15%, transparent) |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
