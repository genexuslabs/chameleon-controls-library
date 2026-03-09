# ch-tooltip - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Action Element Modes](#action-element-modes)
  - [Internal Button (default)](#internal-button-default)
  - [Parent Element as Trigger](#parent-element-as-trigger)
  - [External Element Reference](#external-element-reference)
- [Positioning](#positioning)
- [Display Delay](#display-delay)
- [Accessible Name for the Action](#accessible-name-for-the-action)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates a tooltip with an internal trigger button that shows supplementary text on hover or focus.

### HTML

```html
<ch-tooltip>
  <span slot="action">?</span>
  This field accepts alphanumeric characters only.
</ch-tooltip>
```

### JavaScript

No JavaScript is required for the basic case. The component automatically manages hover, focus, and keyboard interactions.

### Key Points

- When `actionElement` is not set (the default), the component renders an internal `<button>` in its shadow DOM and projects the `"action"` slot inside it.
- The default slot holds the tooltip content displayed inside the popover window.
- The tooltip shows on `mouseenter` / `focus` and hides on `mouseleave` / `focusout`.
- If the trigger is focused via keyboard (`focus-visible`), the tooltip stays visible even after the mouse leaves the trigger area.
- Clicking outside the tooltip dismisses it.

## Action Element Modes

`ch-tooltip` supports three ways to specify which element triggers the tooltip. The mode is determined by the value of the `actionElement` property.

### Internal Button (default)

When `actionElement` is `undefined` (the default), the component renders its own `<button>` inside the shadow DOM. Use the `"action"` named slot to provide trigger content.

```html
<ch-tooltip>
  <span slot="action">
    <img src="info-icon.svg" alt="" width="16" height="16" />
  </span>
  More information about this option.
</ch-tooltip>
```

### Parent Element as Trigger

Set `actionElement` to `null` to use the tooltip's parent element as the trigger. This is useful when you want an existing element (e.g., a button or link) to act as the tooltip anchor without rendering an extra button.

#### HTML

```html
<button id="save-btn" type="button">
  Save
  <ch-tooltip id="save-tooltip">
    Save your changes (Ctrl+S)
  </ch-tooltip>
</button>
```

#### JavaScript

```js
const tooltip = document.getElementById("save-tooltip");

// null tells the tooltip to use its parentElement as the trigger
tooltip.actionElement = null;
```

#### Key Points

- The `"action"` slot is not rendered in this mode since the trigger lives outside the shadow DOM.
- The component automatically sets `aria-describedby` on the parent element.
- The host element receives `role="tooltip"` and `aria-hidden` attributes directly.

### External Element Reference

Pass an `HTMLButtonElement` reference to `actionElement` to anchor the tooltip to any button in the DOM, regardless of the component's position in the tree.

#### HTML

```html
<button id="delete-btn" type="button">Delete</button>

<!-- The tooltip can live anywhere in the DOM -->
<ch-tooltip id="delete-tooltip">
  Permanently remove this item
</ch-tooltip>
```

#### JavaScript

```js
const tooltip = document.getElementById("delete-tooltip");
const deleteBtn = document.getElementById("delete-btn");

tooltip.actionElement = deleteBtn;
```

#### Key Points

- The referenced element must be an `HTMLButtonElement` (or behave like one for focus management).
- `aria-describedby` is set on the referenced element, not on the tooltip's parent.
- This mode is useful when the trigger and tooltip cannot be in a parent-child relationship (e.g., the trigger is inside a different shadow root or a complex layout).

## Positioning

Control where the tooltip appears relative to the trigger using `blockAlign` and `inlineAlign`. These properties mirror `ch-popover` alignment and accept the following values: `"outside-start"`, `"inside-start"`, `"center"`, `"inside-end"`, `"outside-end"`.

### HTML

```html
<!-- Tooltip above, centered horizontally (default) -->
<ch-tooltip block-align="outside-start" inline-align="center">
  <span slot="action">Above</span>
  I appear above the trigger.
</ch-tooltip>

<!-- Tooltip below, centered horizontally -->
<ch-tooltip block-align="outside-end" inline-align="center">
  <span slot="action">Below</span>
  I appear below the trigger.
</ch-tooltip>

<!-- Tooltip to the right of the trigger -->
<ch-tooltip block-align="center" inline-align="outside-end">
  <span slot="action">Right</span>
  I appear to the right of the trigger.
</ch-tooltip>

<!-- Tooltip to the left of the trigger -->
<ch-tooltip block-align="center" inline-align="outside-start">
  <span slot="action">Left</span>
  I appear to the left of the trigger.
</ch-tooltip>
```

### Key Points

- The default positioning is `block-align="outside-end"` (below) and `inline-align="center"`.
- `block-align` controls the vertical axis; `inline-align` controls the horizontal axis in LTR layouts.
- `"outside-start"` / `"outside-end"` place the tooltip outside the trigger boundaries (above/below or left/right).
- `"inside-start"` / `"inside-end"` / `"center"` align the tooltip edge relative to the trigger edge.

## Display Delay

The `delay` property controls how long the user must hover or focus before the tooltip appears. The delay is implemented via a CSS animation that keeps the popover invisible for the specified duration.

### HTML

```html
<!-- Instant display (no delay) -->
<ch-tooltip delay="0">
  <span slot="action">Instant</span>
  This tooltip appears immediately.
</ch-tooltip>

<!-- Long delay -->
<ch-tooltip delay="500">
  <span slot="action">Slow</span>
  This tooltip waits 500ms before appearing.
</ch-tooltip>
```

### Key Points

- The default delay is `100` ms.
- The delay is purely visual: the popover is rendered in the DOM immediately on hover/focus, but its opacity is animated from `0` for the specified duration.
- Setting `delay="0"` makes the tooltip appear instantly.
- Use a longer delay (300-500ms) when tooltips might interfere with nearby interactive elements.

## Accessible Name for the Action

When the trigger is an icon-only button, use `actionElementAccessibleName` to provide a label for assistive technologies. This sets `aria-label` on the action element so the button has a meaningful name even when the tooltip is hidden.

### HTML

```html
<ch-tooltip
  action-element-accessible-name="More information"
>
  <span slot="action">
    <img src="info-icon.svg" alt="" width="16" height="16" />
  </span>
  This field is required for form submission.
</ch-tooltip>
```

### Key Points

- The `actionElementAccessibleName` property sets `aria-label` on the action element (whether internal or external).
- This is important because tooltips are not always visible -- without `aria-label`, an icon-only button would have no accessible name when the tooltip is hidden.
- The tooltip content itself is linked via `aria-describedby`, so screen readers announce both the label and the description.

## Do's and Don'ts

### Do

- Use `actionElementAccessibleName` for icon-only triggers so the button always has an accessible name.
- Keep tooltip content short (1-2 sentences). For longer content, use `ch-popover` instead.
- Set `actionElement` via JavaScript -- it is a property, not an HTML attribute.
- Use `block-align` and `inline-align` to position the tooltip away from other interactive elements.

### Don't

- Don't place a `<button>` inside the `"action"` slot — when using the default internal trigger (`actionElement` is `undefined`), the component already renders a `<button>`. Nesting another `<button>` produces invalid HTML and breaks accessibility. Use a `<span>`, an image, or plain text instead.
- Don't put interactive elements (links, buttons, inputs) inside the tooltip -- use `ch-popover` for interactive overlays.
- Don't rely on tooltips for essential information -- they are invisible on touch devices and to users who cannot hover.
- Don't attach a tooltip to a disabled element -- disabled elements cannot receive focus, making the tooltip inaccessible via keyboard.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't set `actionElement` as an HTML attribute -- it requires a JavaScript object reference.
