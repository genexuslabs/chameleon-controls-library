# ch-qr - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Custom Colors and Rounded Modules](#custom-colors-and-rounded-modules)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates generating a basic QR code from a URL.

### HTML

```html
<ch-qr
  value="https://example.com"
  accessible-name="Link to example.com"
  size="200"
></ch-qr>
```

### Key Points

- The `value` property accepts any string (URL, text, identifier) to encode into the QR code.
- The `accessibleName` property sets `aria-label` on the host element. Always provide this for screen reader accessibility.
- The `size` property sets the canvas dimensions in pixels (always square). Defaults to `128`.
- The default `errorCorrectionLevel` is `"High"` (~30% error correction), which produces a denser QR code but is more resilient to damage or partial obstruction.
- When `value` is `undefined` or empty, no QR code is rendered and ARIA attributes are removed from the host.
- The QR code re-renders automatically when any property changes.

## Custom Colors and Rounded Modules

Demonstrates customizing the QR code appearance with colors, rounding, and error correction levels.

### HTML

```html
<!-- Rounded modules with brand colors -->
<ch-qr
  value="https://example.com/app"
  accessible-name="Download the app"
  fill="#1a73e8"
  background="#f8f9fa"
  radius="0.5"
  size="256"
  error-correction-level="High"
></ch-qr>

<!-- Theme-aware QR code using currentColor -->
<ch-qr
  value="https://example.com"
  accessible-name="Visit example.com"
  fill="currentColor"
  background="white"
  size="200"
  style="color: #6200ea;"
></ch-qr>
```

### Key Points

- The `fill` property sets the foreground color of the QR code blocks. Accepts any valid CSS color string. Defaults to `"black"`.
- The `background` property sets the background color. Defaults to `"white"`.
- Both `fill` and `background` support `"currentColor"`, which resolves to the computed `color` of the host element at render time.
- The `radius` property (range `0` to `0.5`) controls the rounding of QR code blocks. `0` produces sharp squares; `0.5` produces maximum rounding (circles).
- The `errorCorrectionLevel` property controls redundancy: `"Low"` (~7%), `"Medium"` (~15%), `"Quartile"` (~25%), `"High"` (~30%). Higher levels make the QR code larger but more scannable when partially obscured.
- Use the `size` property (not CSS dimensions) to control the output resolution for crisp rendering.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Always provide an `accessibleName` or appropriate `aria-` attribute for screen reader support.

### Don't

- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
