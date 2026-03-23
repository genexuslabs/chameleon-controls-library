# ch-status - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Loading Region with aria-busy](#loading-region-with-aria-busy)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

A simple loading indicator with slotted content that announces itself to screen readers via `aria-live="polite"`.

### HTML

```html
<button id="save-btn" type="button">
  Save Changes
</button>

<!-- Shown conditionally while saving -->
<ch-status accessible-name="Saving changes">
  <span class="spinner"></span>
  Saving...
</ch-status>
```

### JavaScript

```javascript
const button = document.getElementById("save-btn");

button.addEventListener("click", async () => {
  // Insert the status indicator
  const status = document.createElement("ch-status");
  status.accessibleName = "Saving changes";
  status.innerHTML = '<span class="spinner"></span> Saving...';
  button.after(status);

  // Simulate an async operation
  await fetch("/api/save", { method: "POST" });

  // Remove the status indicator when done
  status.remove();
});
```

### Key Points

- `ch-status` sets `role="status"` and `aria-live="polite"` on the host element, so screen readers announce the slotted content without interrupting the user.
- The default slot accepts any content: spinner icons, text, or a combination of both.
- The component is a **passive indicator** with no keyboard interaction.
- Add or remove the element from the DOM to show/hide the loading state. ARIA cleanup happens automatically on disconnect.
- Always set `accessible-name` to provide a meaningful label for assistive technologies.

## Loading Region with aria-busy

Use `loadingRegionRef` to mark a specific page region as busy while the status indicator is active.

### HTML

```html
<section id="search-results">
  <h2>Search Results</h2>
  <div id="results-container">
    <!-- Results will be loaded here -->
  </div>
</section>

<!-- Shown conditionally while loading -->
<ch-status
  id="search-status"
  accessible-name="Loading search results"
>
  <span class="spinner"></span>
  Loading results...
</ch-status>
```

### JavaScript

```javascript
const resultsSection = document.getElementById("search-results");
const resultsContainer = document.getElementById("results-container");

async function search(query) {
  // Create and insert the status indicator
  const status = document.createElement("ch-status");
  status.accessibleName = "Loading search results";
  status.innerHTML = '<span class="spinner"></span> Loading results...';

  // Bind the loading region -- this automatically sets
  // aria-busy="true" and aria-describedby on the section
  status.loadingRegionRef = resultsSection;

  resultsContainer.before(status);

  try {
    const response = await fetch(`/api/search?q=${query}`);
    const data = await response.json();
    resultsContainer.innerHTML = renderResults(data);
  } finally {
    // Removing the status element automatically cleans up
    // aria-busy and aria-describedby from the region
    status.remove();
  }
}
```

### Key Points

- Setting `loadingRegionRef` causes `ch-status` to set `aria-busy="true"` and `aria-describedby="<status-id>"` on the referenced element.
- When the `ch-status` element is **removed from the DOM**, these ARIA attributes are automatically cleaned up via `disconnectedCallback`.
- If the `ch-status` element has no explicit `id`, the component generates a unique one (e.g., `ch-status-0`) for the `aria-describedby` binding.
- Unlike `ch-progress`, `ch-status` **replaces** (rather than appends to) any existing `aria-describedby` value on the referenced element.
- The `loadingRegionRef` must be in the **same Shadow Tree** as the `ch-status` element for `aria-describedby` to resolve correctly.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.
- Always provide an `accessibleName` or appropriate `aria-` attribute for screen reader support.

### Don't

- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
