# ch-switch

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

The `ch-switch` component is a toggle control that lets users switch between two mutually exclusive states, typically representing an on/off or enabled/disabled choice.

## Features
 - Track with a sliding thumb for on/off toggling.
 - Optional caption that changes based on the current state.
 - Custom checked and unchecked values.
 - Form-associated via `ElementInternals`.

## Use when
 - A boolean setting, feature flag, or preference toggle is needed.
 - The semantics represent toggling a state on or off.
 - A binary system or application setting that takes effect immediately (e.g., "Enable notifications", "Dark mode").
 - The result is immediately visible and reversible without additional confirmation.

## Do not use when
 - Selecting an item from a list — prefer `ch-checkbox` or `ch-radio-group-render` instead.
 - The change requires a confirmation or save step — prefer `ch-checkbox`.
 - The toggle is part of a multi-field form submission — prefer `ch-checkbox`.
 - More than two states are needed — prefer `ch-combo-box-render`, `ch-radio-group-render`, or `ch-segmented-control-render`.
 - A destructive or irreversible action is triggered — always require explicit confirmation.

## Slots
 - This component does not define any slots.

## Accessibility
 - Form-associated via `ElementInternals` — participates in native form validation and submission.
 - Delegates focus into the shadow DOM (`delegatesFocus: true`), so focusing the host automatically focuses the internal `<input>`.
 - The native `<input>` element has `role="switch"` and `aria-checked` reflecting the current checked state.
 - Resolves its accessible name from an external `<label>` element or the `accessibleName` property.
 - The decorative caption is hidden from assistive technology with `aria-hidden`.
 - **Keyboard interaction**: `Space` toggles the switch, `Tab` moves focus to/from the control.

## Properties

| Property                    | Attribute            | Description                                                                                                                                                                                                                                                                                                                              | Type      | Default     |
| --------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| `accessibleName`            | `accessible-name`    | Specifies a short string, typically 1 to 3 words, that authors associate with an element to provide users of assistive technologies with a label for the element.                                                                                                                                                                        | `string`  | `undefined` |
| `checkedCaption`            | `checked-caption`    | Caption displayed when the switch is 'on'. This is purely visual — the caption element is `aria-hidden="true"`, so it has no effect on assistive technology.                                                                                                                                                                             | `string`  | `undefined` |
| `checkedValue` _(required)_ | `checked-value`      | The value when the switch is 'on'. This property is required (no default). The checked state is derived from `value === checkedValue`.                                                                                                                                                                                                   | `string`  | `undefined` |
| `disabled`                  | `disabled`           | This attribute allows you specify if the element is disabled. If disabled, it will not trigger any user interaction related event (for example, click event). When `true`, all event handlers (click on host, input on the internal input, click on the label) are suppressed, and the `ch-disabled` class is added to the host element. | `boolean` | `false`     |
| `name`                      | `name`               | This property specifies the `name` of the control when used in a form.                                                                                                                                                                                                                                                                   | `string`  | `undefined` |
| `unCheckedCaption`          | `un-checked-caption` | Caption displayed when the switch is 'off'. This is purely visual — the caption element is `aria-hidden="true"`, so it has no effect on assistive technology.                                                                                                                                                                            | `string`  | `undefined` |
| `unCheckedValue`            | `un-checked-value`   | The value when the switch is 'off'. If you want to not add the value when the control is used in a form and it's unchecked, just let this property with the default `undefined` value. When `undefined`, no form value is submitted in the unchecked state.                                                                              | `string`  | `undefined` |
| `value`                     | `value`              | The value of the control. Mutated internally on toggle (set to `checkedValue` or `unCheckedValue`). During `connectedCallback`, it is initialized from `unCheckedValue` if unset. The `@Watch` handler syncs the value with `ElementInternals.setFormValue()` on every change.                                                           | `string`  | `null`      |

## Events

| Event   | Description                                                                                                                                                                                                                                  | Type               |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `input` | The 'input' event is emitted when a change to the element's value is committed by the user. The native input event is stopped from propagating and re-emitted on the host. The payload is the original `UIEvent` (not the new value string). | `CustomEvent<any>` |

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
