# ch-rating - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Fractional Display Rating](#fractional-display-rating)
- [Custom Number of Stars with Event Handling](#custom-number-of-stars-with-event-handling)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

A simple interactive star rating that lets users select a value from 1 to 5.

### HTML

```html
<label for="product-rating">Rate this product</label>
<ch-rating id="product-rating" value="0"></ch-rating>
```

### JavaScript

```javascript
const rating = document.querySelector("ch-rating");

rating.addEventListener("input", (event) => {
  console.log("Selected rating:", event.detail);
});
```

### Key Points

- By default, `ch-rating` renders **5 stars** (the `stars` property defaults to `5`).
- The `value` property represents the current selection. Set it to `0` for no initial selection.
- User interaction emits whole-number values only (1 through 5).
- The component is form-associated via `ElementInternals`, so it works inside native `<form>` elements. Use the `name` property to include it in form data.
- Always provide an accessible name via a `<label>` element or the `accessibleName` property.

## Fractional Display Rating

Display a read-only averaged rating with partial star fill (e.g., 3.5 stars). Useful for showing aggregated review scores.

### HTML

```html
<label for="avg-rating">Average customer rating</label>
<ch-rating
  id="avg-rating"
  value="3.5"
  disabled
></ch-rating>
```

### JavaScript

```javascript
// Set a fractional value programmatically
const rating = document.querySelector("ch-rating");
rating.value = 3.5;
```

### Key Points

- Fractional values (e.g., `3.5`) are supported for **display purposes**. The third star will be partially filled, and the fourth star will be empty.
- Set `disabled` to prevent user interaction when the rating is display-only.
- The partial fill is driven by the CSS custom property `--star-selected-value` on each star container, which ranges from `0` to `1`.
- You can style partial stars using the `partial-selected` CSS part: `ch-rating::part(star partial-selected) { ... }`.
- Even when disabled, the component still participates in form submission if it has a `name`.

## Custom Number of Stars with Event Handling

Configure the rating to use a different number of stars and react to user selections.

### HTML

```html
<label for="difficulty-rating">Difficulty level</label>
<ch-rating
  id="difficulty-rating"
  stars="10"
  value="0"
  accessible-name="Difficulty level"
></ch-rating>

<p id="output">No rating selected</p>
```

### JavaScript

```javascript
const rating = document.querySelector("ch-rating");
const output = document.getElementById("output");

rating.addEventListener("input", (event) => {
  const value = event.detail;
  output.textContent = `You selected ${value} out of ${rating.stars}`;
});
```

### Key Points

- The `stars` property controls how many stars are rendered. Set it to any positive integer (e.g., `10` for a 10-point scale).
- Values less than `0` for `stars` are treated as `0`.
- The `value` is automatically clamped to the range `[0, stars]`. If you set `stars="7"` and `value="10"`, the displayed value will be `7`.
- The `input` event's `detail` payload is always a whole number between `0` and `stars`.
- You can provide the accessible name either through a `<label>` element or the `accessible-name` attribute. Both approaches are demonstrated here for reference.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.
- Always provide an `accessibleName` or appropriate `aria-` attribute for screen reader support.

### Don't

- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
