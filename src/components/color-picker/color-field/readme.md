# ch-color-field

<!-- Auto Generated Below -->


## Overview

The `ch-color-field` component provides an interactive 2D canvas for selecting colors
by saturation and value (brightness) within a specific hue. It displays a color gradient
allowing users to pick colors through click and drag interactions or keyboard navigation.

## Features
- Interactive 2D color field with canvas-based gradient visualization
- Supports multiple color formats: HEX, RGB, RGBA, HSL, HSLA, HSV
- Keyboard navigation with arrow keys for precise color selection
- Accessible with proper ARIA attributes and form association
- Drag and drop mouse interaction for smooth color selection
- Real-time canvas marker positioning
- Form-associated custom element for proper integration with form validation

## Use when
- Building a full-featured color picker that requires 2D color selection
- Users need to fine-tune saturation and brightness of a selected hue
- You want a visual, interactive color field component
- Part of a larger color picker system (typically used with ch-color-picker)

## Do not use when
- You need a simple color input field — use `<input type="color">` instead
- You need a complete color picker experience — use `ch-color-picker` instead
- Users only need basic color selection without 2D gradient interaction

## Accessibility
- Proper ARIA attributes for screen reader support (role, aria-label, aria-disabled)
- Form association with ElementInternals for form submission and validation
- Keyboard navigation support (arrow keys for precise color selection)
- Descriptive accessible names for the component

## Properties

| Property                    | Attribute                     | Description                                                                                                                                                                                                      | Type      | Default            |
| --------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------ |
| `accessibleName`            | `accessible-name`             | Specifies a short string, typically 1 to 3 words, that authors associate with an element to provide users of assistive technologies with a label for the element.                                                | `string`  | `"Color field"`    |
| `accessibleRoleDescription` | `accessible-role-description` | Specifies a readable description for the component’s role, primarily used by assistive technologies to give users more context about the component's purpose or behavior.                                        | `string`  | `"2D color field"` |
| `disabled`                  | `disabled`                    | This attribute lets you specify if the element is disabled. If disabled, it will not fire any user interaction related event (for example, click event).                                                         | `boolean` | `false`            |
| `readonly`                  | `readonly`                    | This attribute indicates that the user cannot modify the value of the control. Same as [readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly) attribute for `input` elements. | `boolean` | `false`            |
| `step`                      | `step`                        | Step size in pixels for keyboard navigation on the canvas. Determines how many pixels the marker moves when using arrow keys. Default = 1.                                                                       | `number`  | `1`                |
| `value`                     | `value`                       | The current value of the `ch-color-field` component, representing a color in one of the following formats:   - HEX   - HSL   - RGB This value determines the selected color and can be updated by the user.      | `string`  | `FALLBACK_COLOR`   |


## Events

| Event   | Description                                                                                                                                                  | Type                                                                                               |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `input` | The `input` event is emitted when a change to the element's value is committed by the user.  It contains the new value (in all variants) of the color-field. | `CustomEvent<{ rgb: string; rgba: string; hsl: string; hsla: string; hex: string; hsv: string; }>` |


## Shadow Parts

| Part         | Description                                                        |
| ------------ | ------------------------------------------------------------------ |
| `"disabled"` | Applied to the marker when the component is disabled.              |
| `"marker"`   | The circular marker/selector positioned on the color field canvas. |
| `"readonly"` | Applied to the marker when the component is read-only.             |


## Dependencies

### Used by

 - [ch-color-picker](..)

### Graph
```mermaid
graph TD;
  ch-color-picker --> ch-color-field
  style ch-color-field fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
