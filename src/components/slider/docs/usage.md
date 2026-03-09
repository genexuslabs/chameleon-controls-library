# ch-slider - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Custom Range Configuration](#custom-range-configuration)
- [Live Value Display](#live-value-display)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

A simple slider that lets users pick a value within the default range of 0 to 5.

### HTML

```html
<label for="volume">Volume</label>
<ch-slider id="volume" value="3"></ch-slider>
```

### JavaScript

```javascript
const slider = document.querySelector("ch-slider");

slider.addEventListener("change", (event) => {
  console.log("Final value:", event.detail);
});
```

### Key Points

- By default, `ch-slider` uses `minValue="0"`, `maxValue="5"`, and `step="1"`.
- The `change` event fires when the user **commits** a value (e.g., on mouseup or touchend).
- The component is form-associated via `ElementInternals` and participates in native form submission.
- Always provide an accessible name via a `<label>` element or the `accessible-name` attribute.
- The slider renders a native `<input type="range">` internally, so all standard keyboard controls work: Arrow keys to increment/decrement, Home/End to jump to min/max.

## Custom Range Configuration

Configure the slider with a custom minimum, maximum, and step size for precise control over allowed values.

### HTML

```html
<label for="temperature">Temperature (°C)</label>
<ch-slider
  id="temperature"
  min-value="15"
  max-value="30"
  step="0.5"
  value="22"
></ch-slider>
```

### JavaScript

```javascript
const slider = document.querySelector("ch-slider");

slider.addEventListener("change", (event) => {
  console.log("Temperature set to:", event.detail, "°C");
});
```

### Key Points

- `minValue` sets the lower bound and `maxValue` sets the upper bound. If `maxValue` is less than `minValue`, it is silently raised to match `minValue`.
- `step` controls the increment granularity. Set it to `0.5` for half-unit steps, `10` for coarse steps, etc.
- The `value` is clamped between `minValue` and `maxValue` internally, so out-of-range values are corrected automatically.
- The visual track is split into a selected portion (from min to current value) and an unselected portion (from current value to max). Style them with `ch-slider::part(track__selected)` and `ch-slider::part(track__unselected)`.

## Live Value Display

Use the `input` event to display the slider's value in real time as the user drags the thumb.

### HTML

```html
<label for="opacity">Opacity</label>
<ch-slider
  id="opacity"
  min-value="0"
  max-value="100"
  step="1"
  value="75"
></ch-slider>
<output id="opacity-output">75%</output>
```

### JavaScript

```javascript
const slider = document.querySelector("ch-slider");
const output = document.getElementById("opacity-output");

// Fires continuously as the user drags the thumb
slider.addEventListener("input", (event) => {
  output.textContent = `${event.detail}%`;
});

// Fires once when the user releases the thumb
slider.addEventListener("change", (event) => {
  console.log("Committed value:", event.detail);
});
```

### Key Points

- The `input` event fires on **every drag step** as the user moves the thumb. Updates are batched through `requestAnimationFrame` for performance.
- The `change` event fires only when the user **releases** the thumb (mouseup/touchend), making it ideal for committing the final value.
- Use `input` for live UI feedback (e.g., updating a label, adjusting opacity in real time) and `change` for persisting or submitting the value.
- Both events emit the numeric value as `event.detail`.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.

### Don't

- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
