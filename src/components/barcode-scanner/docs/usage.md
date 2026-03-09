# ch-barcode-scanner - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Scan from File Upload](#scan-from-file-upload)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates real-time barcode and QR code scanning from the device camera.

### HTML

```html
<ch-barcode-scanner
  id="scanner"
  barcode-box-width="250"
  barcode-box-height="250"
  camera-preference="BackCamera"
  read-debounce="500"
  style="height: 300px;"
></ch-barcode-scanner>

<p>Scanned: <span id="result">—</span></p>
```

### JavaScript

```js
const scanner = document.getElementById("scanner");

// List available cameras when they are enumerated
scanner.addEventListener("cameras", (event) => {
  const cameraIds = event.detail;
  console.log("Available cameras:", cameraIds);
});

// Handle scanned barcodes
scanner.addEventListener("read", (event) => {
  const decodedText = event.detail;
  document.getElementById("result").textContent = decodedText;
});
```

### Key Points

- The `scanning` property (default `true`) controls whether the camera feed is active. Set to `false` to stop the camera without destroying the component.
- The `cameraPreference` property selects the camera: `"Default"` (first available), `"FrontCamera"`, or `"BackCamera"`.
- The `barcodeBoxWidth` and `barcodeBoxHeight` properties (default `200`) control the size of the scanning region overlay in pixels.
- The `readDebounce` property (default `200` ms) prevents duplicate `read` events when the same code is scanned consecutively.
- The `cameras` event fires once during initialization with an array of available camera ID strings.
- A `ResizeObserver` restarts the scanner automatically when the component is resized to maintain the correct aspect ratio.

## Scan from File Upload

Demonstrates scanning a barcode or QR code from an uploaded image file using the `scan()` method.

### HTML

```html
<input type="file" id="file-input" accept="image/*" />
<p>Result: <span id="result">—</span></p>

<!-- The scanner element is needed but does not need to be actively scanning -->
<ch-barcode-scanner
  id="scanner"
  scanning="false"
  style="display: none;"
></ch-barcode-scanner>
```

### JavaScript

```js
const scanner = document.getElementById("scanner");
const fileInput = document.getElementById("file-input");

fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;

  try {
    const decodedText = await scanner.scan(file);
    document.getElementById("result").textContent = decodedText;
  } catch (error) {
    document.getElementById("result").textContent = "No barcode found in image";
  }
});
```

### Key Points

- The `scan(imageFile)` method accepts a `File` object and returns a `Promise<string>` with the decoded text.
- The scanner does not need to be actively scanning (`scanning` can be `false`) for file-based scanning to work.
- If no barcode is found in the image, the promise rejects.
- The component element must be in the DOM even when hidden, because the `html5-qrcode` library needs the internal container element.
- File scanning works independently of the camera — no camera permissions are required for this method.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.

### Don't

- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
