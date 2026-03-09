# ch-intersection-observer - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Custom Thresholds](#custom-thresholds)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates using the intersection observer to trigger lazy loading when an element scrolls into view.

### HTML

```html
<div class="scroll-container">
  <!-- Other content above... -->

  <ch-intersection-observer>
    <div slot="content" id="lazy-section">
      <p>Loading...</p>
    </div>
  </ch-intersection-observer>
</div>
```

### JavaScript

```js
const observer = document.querySelector("ch-intersection-observer");

observer.addEventListener("intersectionUpdate", (event) => {
  const entry = event.detail;

  if (entry.isIntersecting) {
    const section = document.getElementById("lazy-section");
    section.innerHTML = "<p>Content loaded!</p>";
  }
});
```

### Key Points

- Place the content to observe inside the `content` slot.
- The `intersectionUpdate` event fires with an `IntersectionObserverEntry` as its `detail`, which includes `isIntersecting`, `intersectionRatio`, and bounding rectangles.
- By default, the threshold is `[0]`, meaning the event fires as soon as even one pixel of the observed element is visible.
- The `root` property accepts a DOM ID string. If not set, the browser viewport is used as the intersection root.
- All properties (`root`, `threshold`, margins) are init-only and must be set before the component loads.

## Custom Thresholds

Demonstrates configuring multiple visibility thresholds to trigger events at specific visibility percentages.

### HTML

```html
<div id="scroll-root" style="height: 400px; overflow-y: auto;">
  <div style="height: 800px;"></div>

  <ch-intersection-observer
    root="scroll-root"
    threshold="25%,50%,75%,100%"
    top-margin="0"
    bottom-margin="100dip"
  >
    <div slot="content" id="target">
      <p>Observed element</p>
    </div>
  </ch-intersection-observer>

  <div style="height: 800px;"></div>
</div>
```

### JavaScript

```js
const observer = document.querySelector("ch-intersection-observer");

observer.addEventListener("intersectionUpdate", (event) => {
  const entry = event.detail;
  const ratio = Math.round(entry.intersectionRatio * 100);
  console.log(`Visibility: ${ratio}%`);
  // Fires at approximately 25%, 50%, 75%, and 100%
});
```

### Key Points

- The `threshold` property accepts a comma-separated string of percentages (e.g., `"25%,50%,75%,100%"`). Each value triggers an `intersectionUpdate` event when the observed element crosses that visibility percentage.
- The `root` property accepts the DOM ID of a scrollable container. The element is resolved via `document.getElementById`. If not set, the viewport is used.
- Margin properties (`topMargin`, `bottomMargin`, `leftMargin`, `rightMargin`) expand or contract the intersection area. They accept device-independent pixels (e.g., `"100dip"`, converted to `px`) or percentages (e.g., `"10%"`).
- All configuration properties are init-only. Changes after `componentDidLoad` have no effect.
- The observer is automatically disconnected when the component is removed from the DOM.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.
- Use named slots to provide custom content where supported.

### Don't

- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
