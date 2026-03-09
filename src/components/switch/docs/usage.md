# ch-switch - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Form Switch](#form-switch)
- [Disabled State](#disabled-state)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates a simple on/off toggle with captions that change based on the current state.

### HTML

```html
<ch-switch
  accessible-name="Dark mode"
  checked-caption="On"
  un-checked-caption="Off"
  checked-value="enabled"
  un-checked-value="disabled"
  value="disabled"
></ch-switch>
```

### JavaScript

```js
const toggle = document.querySelector("ch-switch");

toggle.addEventListener("input", () => {
  const isEnabled = toggle.value === "enabled";
  document.body.classList.toggle("dark-mode", isEnabled);
  console.log("Dark mode:", isEnabled ? "on" : "off");
});
```

### Key Points

- The `checkedCaption` and `unCheckedCaption` properties control the visual label text shown next to the track; they are `aria-hidden` and do not affect assistive technology.
- The `accessibleName` property provides the label announced by screen readers.
- The checked state is derived from `value === checkedValue`, just like `ch-checkbox`.
- The `input` event fires on every toggle. The event payload is the original `UIEvent`, not the new value string; read `toggle.value` to get the current state.

## Form Switch

Demonstrates using `ch-switch` inside a native form with a `name` attribute for form submission.

### HTML

```html
<form id="notification-settings">
  <label for="email-switch">Email notifications</label>

  <ch-switch
    id="email-switch"
    name="email_notifications"
    checked-caption="Enabled"
    un-checked-caption="Disabled"
    checked-value="on"
    un-checked-value="off"
    value="off"
  ></ch-switch>

  <button type="submit">Save</button>
</form>
```

### JavaScript

```js
const form = document.querySelector("#notification-settings");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);

  // "email_notifications" will be "on" or "off"
  console.log("Email notifications:", formData.get("email_notifications"));
});
```

### Key Points

- The `name` property registers the switch as a form participant via `ElementInternals`.
- An external `<label>` element can be associated with the switch; the component resolves its accessible name from `ElementInternals.labels`, giving the external label priority over `accessibleName`.
- When `unCheckedValue` is `undefined` (the default), the unchecked state submits no value to `FormData`. Set it explicitly if you need a value for both states.
- The form value is synchronized via `ElementInternals.setFormValue()` on every change.

## Disabled State

Demonstrates a switch in the disabled state, preventing all user interaction.

### HTML

```html
<!-- Disabled in the "on" position -->
<ch-switch
  accessible-name="Premium features"
  checked-caption="Active"
  un-checked-caption="Inactive"
  checked-value="active"
  un-checked-value="inactive"
  value="active"
  disabled
></ch-switch>

<!-- Disabled in the "off" position -->
<ch-switch
  accessible-name="Beta features"
  checked-caption="Active"
  un-checked-caption="Inactive"
  checked-value="active"
  un-checked-value="inactive"
  value="inactive"
  disabled
></ch-switch>
```

### JavaScript

```js
// Re-enable a switch programmatically
const premiumSwitch = document.querySelector("ch-switch");
premiumSwitch.disabled = false;
```

### Key Points

- When `disabled` is `true`, the component suppresses all event handlers (click, input) and adds the `ch-disabled` CSS class to the host.
- The native `<input>` receives the `disabled` attribute, so keyboard interaction is blocked and assistive technology announces the disabled state.
- The `disabled` CSS part is added to the `track`, `thumb`, and `caption` parts, allowing you to style the disabled appearance via `::part(track disabled)`.
- A disabled switch retains its current value but does not submit it in forms (standard HTML disabled behavior).

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.
- Always provide an `accessibleName` or appropriate `aria-` attribute for screen reader support.

### Don't

- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
