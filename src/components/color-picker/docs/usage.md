# ch-color-picker - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Full-Featured Color Picker](#full-featured-color-picker)
- [Event Handling and Color Formats](#event-handling-and-color-formats)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

A minimal color picker with the color field and hue slider visible.

### HTML

```html
<label for="brand-color">Brand Color</label>
<ch-color-picker
  id="brand-color"
  value="#3B82F6"
  show-hue-slider="true"
></ch-color-picker>
```

### JavaScript

```javascript
const picker = document.querySelector("#brand-color");

// Listen for color changes
picker.addEventListener("input", (event) => {
  // event.detail is a ColorVariants object with all formats
  const hex = event.detail.hex;
  console.log("Selected color (HEX):", hex);
});

// Set a color programmatically (accepts HEX, RGB, HSL, or HSV)
picker.value = "#10B981";
```

### Key Points

- The color field (saturation/brightness picker) is always visible. The hue slider must be enabled explicitly with `showHueSlider="true"`.
- The `value` property accepts color strings in HEX (`"#FF00AA"`), RGB (`"rgb(255, 0, 170)"`), HSL (`"hsl(320, 100%, 50%)"`), or HSV (`"hsv(320, 100%, 100%)"`) formats.
- The `input` event emits a `ColorVariants` object with the selected color in all supported formats simultaneously, so you do not need to convert between formats yourself.
- The component is form-associated via `ElementInternals`. Always pair it with a visible `<label>` for accessibility.
- Use `hueSliderStep` to control the precision of the hue slider (default is 1 degree).

## Full-Featured Color Picker

A color picker with all controls enabled: hue slider, alpha slider, format selector, color preview, and a preset palette.

### HTML

```html
<label for="theme-color">Theme Color</label>
<ch-color-picker
  id="theme-color"
  value="rgb(59, 130, 246)"
  show-hue-slider="true"
  show-alpha-slider="true"
  show-color-format-selector="true"
  show-color-preview="true"
  show-color-palette="true"
></ch-color-picker>
```

### JavaScript

```javascript
const picker = document.querySelector("#theme-color");

// Provide a palette of preset brand colors
picker.colorPalette = [
  "#EF4444", // Red
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#000000", // Black
  "#FFFFFF"  // White
];

// Optionally customize the visual order of controls
picker.order = {
  colorField: 1,
  hueSlider: 2,
  alphaSlider: 3,
  colorPreview: 4,
  colorFormatSelector: 5,
  colorPalette: 6
};

picker.addEventListener("input", (event) => {
  const variants = event.detail;
  console.log("HEX:", variants.hex);
  console.log("RGB:", variants.rgb);
  console.log("HSL:", variants.hsl);
  console.log("HSV:", variants.hsv);
});
```

### Key Points

- Each section is toggled independently with its `show*` property: `showHueSlider`, `showAlphaSlider`, `showColorFormatSelector`, `showColorPreview`, and `showColorPalette`.
- The `colorPalette` property accepts an array of CSS color strings. These render as clickable swatches for quick selection. The palette is only visible when `showColorPalette="true"` and the array has at least one item.
- The `order` property uses CSS `order` internally to rearrange the controls visually without changing the DOM structure.
- The format selector lets users switch between HEX, RGB, HSL, and HSV at runtime. Each format shows its respective channel inputs.
- The alpha slider controls opacity from 0% to 100%. The alpha value is reflected in RGBA and HSLA output formats.
- Use `disabled` or `readonly` properties to prevent user interaction while still displaying the current color.

## Event Handling and Color Formats

Capture the `input` event to receive all color format variants simultaneously and apply the selected color in real time.

### HTML

```html
<label for="bg-color">Background Color</label>
<ch-color-picker
  id="bg-color"
  value="#6366F1"
  show-hue-slider="true"
  show-alpha-slider="true"
  show-color-format-selector="true"
></ch-color-picker>

<div id="preview-box" style="width: 200px; height: 200px; border: 1px solid #ccc;"></div>
<pre id="color-output"></pre>
```

### JavaScript

```javascript
const picker = document.querySelector("#bg-color");
const previewBox = document.querySelector("#preview-box");
const colorOutput = document.querySelector("#color-output");

picker.addEventListener("input", (event) => {
  // The event detail is a ColorVariants object containing all formats
  const { hex, rgb, hsl, hsv } = event.detail;

  // Apply the color to a preview element
  previewBox.style.backgroundColor = hex;

  // Display all available formats
  colorOutput.textContent = [
    `HEX: ${hex}`,
    `RGB: ${rgb}`,
    `HSL: ${hsl}`,
    `HSV: ${hsv}`
  ].join("\n");
});
```

### Key Points

- The `input` event fires every time the color changes (field drag, slider move, palette click, or manual input). The `event.detail` is a `ColorVariants` object with `hex`, `rgb`, `hsl`, and `hsv` properties.
- You always receive all four format strings in a single event, regardless of which format the user is currently viewing.
- The component's `value` property reflects the color in the format that was last set. Setting `value="#FF0000"` stores it as HEX; setting `value="rgb(255,0,0)"` stores it as RGB.
- Because the component is form-associated, setting the `name` property allows it to participate in `<form>` submission. The submitted value is the current `value` string.
- For real-time previews, use the `hex` or `rgb` property from `ColorVariants` to set CSS properties directly.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.

### Don't

- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
