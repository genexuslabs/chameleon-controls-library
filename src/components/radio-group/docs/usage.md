# ch-radio-group-render - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Vertical Layout](#vertical-layout)
- [Disabled Items](#disabled-items)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates a simple radio group with a model-driven list of options.

### HTML

```html
<ch-radio-group-render id="priority-group" value="medium"></ch-radio-group-render>
```

### JavaScript

```js
const radioGroup = document.querySelector("#priority-group");

radioGroup.model = [
  { caption: "Low", value: "low" },
  { caption: "Medium", value: "medium" },
  { caption: "High", value: "high" },
  { caption: "Critical", value: "critical" }
];

radioGroup.addEventListener("change", (event) => {
  console.log("Selected priority:", event.detail); // e.g. "high"
});
```

### Key Points

- The `model` property accepts an array of `RadioGroupItemModel` objects, each requiring a `value` and optionally a `caption`.
- The selected option is controlled by the `value` property; set it to match one of the item values for initial selection.
- The `change` event fires when the user selects a different option, with `event.detail` containing the new value string.
- The component uses native `<input type="radio">` elements internally, so arrow keys navigate between options and Space selects the focused one.

## Vertical Layout

Demonstrates rendering radio options in a vertical column using the `direction` property.

### HTML

```html
<ch-radio-group-render
  id="shipping-method"
  direction="vertical"
  value="standard"
></ch-radio-group-render>
```

### JavaScript

```js
const radioGroup = document.querySelector("#shipping-method");

radioGroup.model = [
  { caption: "Standard shipping (5-7 business days)", value: "standard" },
  { caption: "Express shipping (2-3 business days)", value: "express" },
  { caption: "Overnight shipping (next business day)", value: "overnight" },
  { caption: "In-store pickup", value: "pickup" }
];

radioGroup.addEventListener("change", (event) => {
  console.log("Shipping method:", event.detail);
});
```

### Key Points

- The `direction` property accepts `"horizontal"` (default) or `"vertical"`.
- `"horizontal"` renders items in a row using `display: flex; flex-wrap: wrap`.
- `"vertical"` renders items in a column using `display: inline-grid`, which is better suited for options with longer label text.
- The direction is purely visual; keyboard navigation (arrow keys) works the same in both layouts.

## Disabled Items

Demonstrates disabling individual radio options while keeping the rest of the group interactive.

### HTML

```html
<ch-radio-group-render id="plan-selector" value="basic"></ch-radio-group-render>
```

### JavaScript

```js
const radioGroup = document.querySelector("#plan-selector");

radioGroup.model = [
  { caption: "Free", value: "free" },
  { caption: "Basic ($9/month)", value: "basic" },
  { caption: "Pro ($29/month)", value: "pro", disabled: true },
  { caption: "Enterprise (Contact us)", value: "enterprise", disabled: true }
];

radioGroup.addEventListener("change", (event) => {
  console.log("Selected plan:", event.detail);
});

// Enable an option dynamically (e.g., after verifying eligibility)
function unlockPro() {
  radioGroup.model = radioGroup.model.map(item =>
    item.value === "pro" ? { ...item, disabled: false } : item
  );
}
```

### Key Points

- Each item in the model can set `disabled: true` independently to prevent selection of that specific option.
- The component-level `disabled` property disables the entire group; it is combined with per-item `disabled` flags (either being `true` disables the item).
- Disabled items receive the `disabled` CSS part on their `radio-item`, `radio__container`, `radio__option`, and `radio__label` parts for styling via `::part()`.
- To update a single item's disabled state, you must replace the entire `model` array (Stencil detects changes by reference).

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.

### Don't

- Don't set complex model/items data via HTML attributes — use JavaScript property assignment instead.
- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
