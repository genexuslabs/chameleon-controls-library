# ch-progress - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Indeterminate Progress](#indeterminate-progress)
- [Loading Region with aria-busy](#loading-region-with-aria-busy)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Display a progress bar with a known completion percentage using explicit `min`, `max`, and `value` properties.

### HTML

```html
<label for="upload-progress">Uploading file...</label>
<ch-progress
  id="upload-progress"
  min="0"
  max="100"
  value="45"
  accessible-name="Uploading file"
>
  <!-- Custom visual representation -->
  <div class="progress-bar" style="width: 45%"></div>
</ch-progress>
```

### JavaScript

```javascript
const progress = document.querySelector("ch-progress");
let currentValue = 45;

// Simulate progress
const interval = setInterval(() => {
  currentValue += 5;
  progress.value = currentValue;

  // Update custom visual
  const bar = progress.querySelector(".progress-bar");
  bar.style.width = `${currentValue}%`;

  if (currentValue >= 100) {
    clearInterval(interval);
  }
}, 500);
```

### Key Points

- The default `renderType` is `"custom"`, which projects the default slot content while the component handles all ARIA semantics (`role="progressbar"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`).
- `min` defaults to `0` and `max` defaults to `100`. The `value` is clamped between `min` and `max`.
- When `max` equals `100` and `min` is `0`, the default ARIA attributes are omitted since they match the implicit defaults.
- You are responsible for rendering the visual bar inside the slot. The component manages accessibility only.
- Use `accessibleValueText` for custom screen reader announcements, e.g., `"Downloading {{PROGRESS_VALUE}} MB of {{PROGRESS_MAX_VALUE}} MB"`.

## Indeterminate Progress

Display an indeterminate progress indicator for tasks whose duration or completion percentage is unknown.

### HTML

```html
<ch-progress
  id="loading-indicator"
  indeterminate
  accessible-name="Loading data"
>
  <div class="spinner"></div>
</ch-progress>
```

### JavaScript

```javascript
const progress = document.querySelector("ch-progress");

// Remove the progress indicator when loading completes
async function loadData() {
  try {
    const response = await fetch("/api/data");
    const data = await response.json();
    // Remove the indeterminate indicator
    progress.remove();
  } catch (error) {
    console.error("Failed to load data:", error);
  }
}

loadData();
```

### Key Points

- When `indeterminate` is `true`, the `min`, `max`, and `value` properties are ignored.
- All `aria-value*` attributes (`aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`) are **omitted** per the ARIA specification for indeterminate progress bars.
- The component still sets `role="progressbar"` and resolves its accessible name normally.
- You provide the visual spinner or animation inside the default slot. The component only handles semantics.
- Prefer `ch-status` over `ch-progress` with `indeterminate` when you need a lightweight, non-numeric busy indicator (e.g., inside a button).

## Loading Region with aria-busy

Use `loadingRegionRef` to automatically mark a page region as busy while progress is active, improving accessibility for screen reader users.

### HTML

```html
<section id="data-table-region">
  <h2>Data Table</h2>

  <ch-progress
    id="table-progress"
    accessible-name="Loading table data"
    value="0"
    max="100"
  >
    <div class="progress-bar"></div>
  </ch-progress>

  <table id="data-table">
    <thead><tr><th>Name</th><th>Value</th></tr></thead>
    <tbody></tbody>
  </table>
</section>
```

### JavaScript

```javascript
const progress = document.querySelector("ch-progress");
const region = document.getElementById("data-table-region");

// Bind the loading region reference
progress.loadingRegionRef = region;

// Simulate loading
let loaded = 0;
const interval = setInterval(() => {
  loaded += 10;
  progress.value = loaded;

  if (loaded >= 100) {
    clearInterval(interval);
    // Once value reaches max, the component automatically:
    // - Removes aria-busy from the region
    // - Cleans up aria-describedby from the region
  }
}, 300);
```

### Key Points

- Setting `loadingRegionRef` to an element causes `ch-progress` to automatically set `aria-busy="true"` and `aria-describedby="<progress-id>"` on that element.
- When progress completes (i.e., `value >= max` with `indeterminate === false`), or when the component is removed from the DOM, these ARIA attributes are automatically cleaned up.
- If the `ch-progress` element does not have an explicit `id`, the component generates a unique one (e.g., `ch-progress-0`) for the `aria-describedby` binding.
- The `loadingRegionRef` must be in the **same Shadow Tree** as the `ch-progress` element. If using Shadow DOM, ensure both are within the same shadow root for `aria-describedby` to resolve correctly.
- The component appends its ID to any existing `aria-describedby` value on the region, preserving other references.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Always provide an `accessibleName` or appropriate `aria-` attribute for screen reader support.

### Don't

- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
