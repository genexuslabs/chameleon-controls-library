# ch-theme - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Loading Multiple Bundles](#loading-multiple-bundles)
- [FOUC Prevention](#fouc-prevention)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates loading a single theme by providing a `ThemeItemModel` with a `name` and `url`.

### HTML

```html
<ch-theme
  model='[{"name": "my-app-theme", "url": "/themes/my-app-theme.css"}]'
></ch-theme>

<div class="themed-content">
  <h1>Hello, themed world!</h1>
</div>
```

### JavaScript

```js
const theme = document.querySelector("ch-theme");

theme.addEventListener("themeLoaded", (event) => {
  console.log("Loaded themes:", event.detail.success);
  // ["my-app-theme"]
});
```

### Key Points

- The `model` property accepts a JSON-serialized string (via the attribute) or a JavaScript object/array (via the property).
- When using a single theme, wrap the object in an array: `[{"name": "...", "url": "..."}]`.
- The `themeLoaded` event fires after all theme promises settle. Its `detail.success` array lists the names of successfully loaded themes.
- The loaded stylesheet is attached to the `Document` (or `ShadowRoot`) via `adoptedStyleSheets`, making it available to all elements in that root.
- The component's host element is always `hidden` and does not render visible content.

## Loading Multiple Bundles

Demonstrates loading multiple theme bundles simultaneously. Failed themes do not block the others.

### HTML

```html
<ch-theme id="app-theme"></ch-theme>

<div class="themed-content">
  <p>This content receives styles from all loaded bundles.</p>
</div>
```

### JavaScript

```js
const theme = document.getElementById("app-theme");

theme.model = [
  { name: "base-tokens", url: "/themes/tokens.css" },
  { name: "component-styles", url: "/themes/components.css" },
  { name: "dark-mode", url: "/themes/dark.css" }
];

theme.addEventListener("themeLoaded", (event) => {
  console.log("Successfully loaded:", event.detail.success);
  // e.g. ["base-tokens", "component-styles", "dark-mode"]
});
```

### Key Points

- The `model` accepts an array of `ThemeItemModel` objects, each with a `name` and `url`.
- Loading uses `Promise.allSettled`, so a failing theme does not prevent the others from loading.
- Failed themes are logged to the console but not included in the `themeLoaded` event payload.
- The `timeout` property (default `10000` ms) controls how long to wait for each theme before treating it as failed.
- The `attachStyleSheets` property can be toggled at runtime to attach or detach all loaded stylesheets without re-fetching.
- Individual items can override the global `attachStyleSheets` via their own `attachStyleSheet` property.

## FOUC Prevention

Demonstrates how `avoidFlashOfUnstyledContent` hides the root node's content until themes finish loading.

### HTML

```html
<ch-theme
  model='[{"name": "app-theme", "url": "/themes/app.css"}]'
></ch-theme>

<!-- This content is hidden (visibility: hidden) until app-theme loads -->
<main>
  <h1>Welcome</h1>
</main>
```

```html
<ch-theme
  avoid-flash-of-unstyled-content="false"
  model='[{"name": "cached-theme", "url": "/themes/cached.css"}]'
></ch-theme>

<!-- Content is visible immediately, even before the theme loads -->
<main>
  <h1>Welcome</h1>
</main>
```

### Key Points

- When `avoidFlashOfUnstyledContent` is `true` (the default), the component injects a `<style>` element with `:host,html{visibility:hidden !important}` into the root node while themes are loading.
- Once all theme promises settle (via `Promise.allSettled`), the injected style is removed and the content becomes visible.
- Set `avoidFlashOfUnstyledContent` to `false` when themes are expected to be cached or when the initial unstyled flash is acceptable.
- The FOUC prevention applies to the entire root node (either the `Document` or the `ShadowRoot` where `ch-theme` is placed).
- This is an init-time behavior: the visibility style is only injected before the first load completes.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.

### Don't

- Don't set complex model/items data via HTML attributes — use JavaScript property assignment instead.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
