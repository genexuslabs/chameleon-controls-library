# ch-checkbox - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Indeterminate State](#indeterminate-state)
- [Form Submission](#form-submission)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates a simple checkbox with a visible caption that toggles between checked and unchecked states.

### HTML

```html
<ch-checkbox
  caption="I agree to the Terms of Service"
  checked-value="yes"
  un-checked-value="no"
  value="no"
></ch-checkbox>
```

### JavaScript

```js
const checkbox = document.querySelector("ch-checkbox");

checkbox.addEventListener("input", (event) => {
  console.log("New value:", event.detail); // "yes" or "no"
});
```

### Key Points

- The checked state is derived from `value === checkedValue`; there is no separate `checked` boolean property.
- Setting `value="yes"` at initialization renders the checkbox as checked immediately.
- The `caption` property renders a `<label>` element wrapping the checkbox, improving the click target area.
- The `input` event fires on every user toggle and its `detail` contains the new value string.

## Indeterminate State

Demonstrates the tri-state (indeterminate) checkbox pattern, typically used for a "select all" parent that reflects mixed child selections.

### HTML

```html
<ch-checkbox
  id="select-all"
  caption="Select all files"
  checked-value="all"
  un-checked-value="none"
  value="none"
  indeterminate
></ch-checkbox>

<ch-checkbox id="file-1" caption="report.pdf" checked-value="on" un-checked-value="off" value="off"></ch-checkbox>
<ch-checkbox id="file-2" caption="invoice.xlsx" checked-value="on" un-checked-value="off" value="off"></ch-checkbox>
<ch-checkbox id="file-3" caption="readme.md" checked-value="on" un-checked-value="off" value="off"></ch-checkbox>
```

### JavaScript

```js
const selectAll = document.querySelector("#select-all");
const children = document.querySelectorAll("#file-1, #file-2, #file-3");

// When a child changes, update the parent state
function updateParent() {
  const values = [...children].map(cb => cb.value);
  const allChecked = values.every(v => v === "on");
  const noneChecked = values.every(v => v === "off");

  if (allChecked) {
    selectAll.value = "all";
    selectAll.indeterminate = false;
  } else if (noneChecked) {
    selectAll.value = "none";
    selectAll.indeterminate = false;
  } else {
    selectAll.indeterminate = true;
  }
}

children.forEach(cb => cb.addEventListener("input", updateParent));

// When the parent is toggled, set all children
selectAll.addEventListener("input", (event) => {
  const checked = event.detail === "all";
  children.forEach(cb => {
    cb.value = checked ? "on" : "off";
  });
});
```

### Key Points

- Setting `indeterminate` to `true` renders the mixed-state visual; it takes precedence over `checked`/`unchecked` parts.
- Any user interaction automatically resets `indeterminate` to `false` internally. The parent must re-set it from the outside when needed.
- The `indeterminate` property maps to the native `<input>` IDL property, so screen readers announce the mixed state.
- The parent logic must be managed externally; the component does not propagate indeterminate state to other checkboxes.

## Form Submission

Demonstrates using `ch-checkbox` inside a native `<form>`, leveraging `checkedValue` and `unCheckedValue` for form data.

### HTML

```html
<form id="preferences-form">
  <ch-checkbox
    name="newsletter"
    caption="Subscribe to newsletter"
    checked-value="subscribed"
    un-checked-value="unsubscribed"
    value="unsubscribed"
  ></ch-checkbox>

  <ch-checkbox
    name="marketing"
    caption="Receive marketing emails"
    checked-value="yes"
    value="no"
  ></ch-checkbox>

  <button type="submit">Save preferences</button>
</form>
```

### JavaScript

```js
const form = document.querySelector("#preferences-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);

  // "newsletter" will be "subscribed" or "unsubscribed"
  console.log("newsletter:", formData.get("newsletter"));

  // "marketing" will be "yes" when checked, or null when unchecked
  // (unCheckedValue was not set, so no value is submitted)
  console.log("marketing:", formData.get("marketing"));
});
```

### Key Points

- The component is form-associated via `ElementInternals`, so it participates in native `<form>` submission without hidden inputs.
- The `name` property determines the key in `FormData`.
- When `unCheckedValue` is set, the unchecked state submits that value. When `unCheckedValue` is omitted (or `undefined`), the field is absent from `FormData` when unchecked.
- The form value is kept in sync via `ElementInternals.setFormValue()` on every value change.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.

### Don't

- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
