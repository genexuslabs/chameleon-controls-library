# ch-rating

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Use when](#use-when)
- [Do not use when](#do-not-use-when)
- [Slots](#slots)
- [Accessibility](#accessibility)
- [Usage](./docs/usage.md)
- [Properties](#properties)
- [Events](#events)
- [Styling](./docs/styling.md)

<!-- Auto Generated Below -->

## Overview

The `ch-rating` component displays a star-based rating control that allows users to select a value from zero up to a configurable maximum number of stars.

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

## Slots
 - No slots. All content is rendered internally.

## Accessibility
 - Form-associated via `ElementInternals` — participates in native form validation and submission.
 - Delegates focus into the shadow DOM (`delegatesFocus: true`).
 - The host receives `role="radiogroup"` set imperatively in `connectedCallback`.
 - Each star is a native `<input type="radio">`, so Arrow keys navigate between stars and Space selects the focused star.
 - Each radio input carries a hardcoded English `aria-label` describing its value (e.g. "3 stars").
 - Resolves its accessible name from an external `<label>` element or the `accessibleName` property.

## Properties

| Property         | Attribute         | Description                                                                                                                                                                                                                                                                                         | Type      | Default     |
| ---------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| `accessibleName` | `accessible-name` | Specifies a short string, typically 1 to 3 words, that authors associate with an element to provide users of assistive technologies with a label for the element.                                                                                                                                   | `string`  | `undefined` |
| `disabled`       | `disabled`        | This attribute allows you specify if the element is disabled. If disabled, it will not trigger any user interaction related event (for example, click event).                                                                                                                                       | `boolean` | `false`     |
| `name`           | `name`            | This property specifies the `name` of the control when used in a form.                                                                                                                                                                                                                              | `string`  | `undefined` |
| `stars`          | `stars`           | This property determine the number of stars displayed. Values less than 0 are treated as 0 (`Math.max(0, stars)`). The `value` property is clamped to the range `[0, stars]`.                                                                                                                       | `number`  | `5`         |
| `value`          | `value`           | The current value displayed by the component. Fractional values are supported for display (partial star fill), but user interaction only produces whole numbers. The value is clamped between `0` and `stars`. The `@Watch` handler syncs the clamped value with `ElementInternals.setFormValue()`. | `number`  | `0`         |

## Events

| Event   | Description                                                                                                                                                                          | Type                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| `input` | The `input` event is emitted when a change to the element's value is committed by the user.  The payload is the new numeric value — always a whole number in the range `[0, stars]`. | `CustomEvent<number>` |

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
