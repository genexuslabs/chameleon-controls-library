# ch-edit - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Password Input with Show/Hide Toggle](#password-input-with-showhide-toggle)
- [Multiline Textarea with Auto-Grow](#multiline-textarea-with-auto-grow)
- [Debounced Search Input](#debounced-search-input)
- [Using Before/After Additional Content Slots](#using-beforeafter-additional-content-slots)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

A simple `ch-edit` text input with a placeholder, a visible label, and basic input handling.

### HTML

```html
<label for="username">Username</label>
<ch-edit id="username" type="text" placeholder="Enter your username"></ch-edit>
```

### JavaScript

```javascript
const edit = document.querySelector("#username");

// Listen for value changes as the user types
edit.addEventListener("input", (event) => {
  console.log("Current value:", event.detail);
});

// Listen for committed changes (on blur)
edit.addEventListener("change", () => {
  console.log("Committed value:", edit.value);
});

// Set a value programmatically
edit.value = "john.doe";
```

### Key Points

- The `type` property defaults to `"text"`, so it can be omitted for plain text inputs.
- Always pair `ch-edit` with a visible `<label>` element. The component is form-associated via `ElementInternals`, so the `<label for="...">` pattern resolves the accessible name automatically.
- The `input` event fires on every keystroke; the `change` event fires only when the user commits the value (e.g., on blur).
- Use the `placeholder` property for hint text, but never as a substitute for a visible label.

## Password Input with Show/Hide Toggle

A password field with a built-in button that lets the user toggle password visibility.

### HTML

```html
<label for="password">Password</label>
<ch-edit
  id="password"
  type="password"
  placeholder="Enter your password"
  show-password-button="true"
  autocomplete="current-password"
></ch-edit>
```

### JavaScript

```javascript
const edit = document.querySelector("#password");

// Listen for password visibility changes
edit.addEventListener("passwordVisibilityChange", (event) => {
  console.log("Password visible:", event.detail); // true or false
});

// Listen for committed value
edit.addEventListener("change", () => {
  console.log("Password value:", edit.value);
});

// Programmatically show the password
edit.showPassword = true;
```

### Key Points

- Set `type="password"` and `showPasswordButton="true"` to render the toggle button inside the input.
- The toggle button has its own `aria-label` (defaults to "Show password" / "Hide password") for screen reader users.
- The `showPassword` property is mutable: the component updates it internally when the button is clicked, and you can also set it programmatically.
- The `passwordVisibilityChange` event fires when the toggle is clicked, with `event.detail` containing the new boolean state.
- Use `autocomplete="current-password"` or `"new-password"` to help browsers and password managers.
- Style the toggle button via the `show-password-button` CSS part. The `password-displayed` and `password-hidden` parts indicate the current state.

## Multiline Textarea with Auto-Grow

A multiline text area that automatically expands its height to fit the content, ideal for chat inputs or comment fields.

### HTML

```html
<label for="comment">Comment</label>
<ch-edit
  id="comment"
  multiline="true"
  auto-grow="true"
  placeholder="Write your comment..."
  max-length="500"
></ch-edit>
```

### JavaScript

```javascript
const edit = document.querySelector("#comment");

edit.addEventListener("input", (event) => {
  const charCount = event.detail.length;
  document.querySelector("#char-counter").textContent =
    `${charCount} / 500 characters`;
});

edit.addEventListener("change", () => {
  console.log("Final comment:", edit.value);
});
```

### Key Points

- Setting `multiline="true"` renders a `<textarea>` instead of an `<input>`.
- The `autoGrow` property only takes effect when `multiline` is `true`. The textarea height increases as the user types and shrinks when content is removed.
- Use `maxLength` to cap the number of characters the user can enter.
- The `mode` (inputMode) property has no effect when `multiline` is `true`.
- When `autoGrow` is `true`, the component renders a hidden helper `<div>` to measure content height. This helper is `aria-hidden`.
- If you combine `autoGrow` with additional content slots, the textarea is wrapped in a container to support both features simultaneously.

## Debounced Search Input

A search input with debounced `input` events to avoid firing requests on every keystroke, plus a built-in clear button.

### HTML

```html
<label for="search-box">Search products</label>
<ch-edit
  id="search-box"
  type="search"
  placeholder="Search by name or SKU..."
  debounce="300"
></ch-edit>

<div id="search-results"></div>
```

### JavaScript

```javascript
const edit = document.querySelector("#search-box");
const resultsContainer = document.querySelector("#search-results");

// The input event is debounced by 300ms — it will not fire until the user
// stops typing for 300 milliseconds
edit.addEventListener("input", async (event) => {
  const query = event.detail;

  if (!query) {
    resultsContainer.innerHTML = "";
    return;
  }

  const response = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
  const products = await response.json();

  resultsContainer.innerHTML = products
    .map((p) => `<div class="result-item">${p.name} — ${p.sku}</div>`)
    .join("");
});

// The change event is NOT debounced — it fires on blur regardless of the
// debounce property
edit.addEventListener("change", () => {
  console.log("Search committed:", edit.value);
});
```

### Key Points

- The `debounce` property (in milliseconds) delays the `input` event emission. If the user keeps typing within the debounce window, the timer resets. Only the final value is emitted.
- The `change` event is never debounced by this property. It fires when the control loses focus.
- When `type="search"`, the component renders a clear button (the `clear-button` CSS part) whenever the input has a value. Clicking it clears the value and re-emits the `input` event (with an empty string).
- The clear button has its own `aria-label` (defaults to "Clear search") for accessibility.
- Combine `debounce` with a server-side search endpoint to reduce unnecessary network requests.

## Using Before/After Additional Content Slots

The `ch-edit` component provides two named slots to inject custom elements before and after the input content, such as icons, buttons, or badges.

### HTML

```html
<label for="price">Price</label>
<ch-edit
  id="price"
  type="number"
  mode="decimal"
  placeholder="0.00"
  show-additional-content-before="true"
  show-additional-content-after="true"
>
  <span slot="additional-content-before" class="currency-symbol">$</span>
  <span slot="additional-content-after" class="unit-label">USD</span>
</ch-edit>
```

### JavaScript

```javascript
const edit = document.querySelector("#price");

edit.addEventListener("input", (event) => {
  console.log("Price:", event.detail);
});

// Example: dynamically toggle the after slot
function showCurrencyHint(show) {
  edit.showAdditionalContentAfter = show;
}
```

### Key Points

- The `additional-content-before` slot renders only when `showAdditionalContentBefore` is `true`. Likewise, `additional-content-after` renders only when `showAdditionalContentAfter` is `true`.
- Slot content is placed inside the component's shadow DOM boundary, so it appears visually inside the input frame.
- You can place any HTML element in the slot: icons, text badges, buttons, or other web components.
- When `multiline="true"` and `autoGrow="false"`, the textarea renders inline alongside the slot content. When `autoGrow="true"`, the textarea is wrapped in a container to support auto-grow alongside the slotted elements.
- Use the `mode` property to control the virtual keyboard for mobile devices (e.g., `"decimal"` for numeric inputs with a decimal point).

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.
- Use named slots to provide custom content where supported.
- Always provide an `accessibleName` or appropriate `aria-` attribute for screen reader support.

### Don't

- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
