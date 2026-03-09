# ch-shortcuts - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Shortcut Definitions File](#shortcut-definitions-file)
- [Trigger Key Configuration](#trigger-key-configuration)
- [Actions: Focus vs Click](#actions-focus-vs-click)
- [Conditional Shortcuts](#conditional-shortcuts)
- [Suspending Shortcuts at Runtime](#suspending-shortcuts-at-runtime)
- [Listening for Shortcut Events](#listening-for-shortcut-events)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Place the `ch-shortcuts` component anywhere in your page and point its `src`
property to a JSON file that describes the keyboard shortcuts. Press the trigger
key (default **F10**) to toggle visual hints next to every target element.

### HTML

```html
<form>
  <label for="name">Name:</label>
  <input type="text" id="name" />

  <label for="email">Email:</label>
  <input type="email" id="email" />

  <button id="submit-btn" type="button">Submit</button>
</form>

<!-- Place the component once; it applies to the whole document -->
<ch-shortcuts src="/assets/shortcuts.json"></ch-shortcuts>
```

### JavaScript

```js
// No additional JavaScript is required for basic usage.
// The component fetches the JSON file and registers the shortcuts automatically.
```

### Key Points

- The `src` property is **required** and must point to a valid JSON file that
  returns an array of shortcut definitions.
- The component fetches the JSON at `componentDidLoad`, so it can be added to
  the DOM at any time.
- Press **F10** (the default `show-key`) to toggle the on-screen shortcut hints.
  Press any non-modifier key while hints are visible to dismiss them.
- The component uses `ch-window` internally to position each tooltip next to its
  target element.

## Shortcut Definitions File

The JSON file referenced by `src` must contain an array of shortcut objects.
Each object describes one keyboard shortcut binding.

### Schema

| Property         | Type     | Required | Default   | Description |
|------------------|----------|----------|-----------|-------------|
| `keyShortcuts`   | `string` | Yes      | --        | Key combination string. Modifiers (`Ctrl`, `Alt`, `Shift`, `Meta`) joined with `+`. Alternatives separated by a space. |
| `selector`       | `string` | No       | --        | CSS selector for the target element. Supports standard selectors, `:host()`, and `::part()`. |
| `id`             | `string` | No       | --        | An optional identifier included in the `keyShortcutPressed` event detail. |
| `action`         | `string` | No       | `"focus"` | The action to perform on the target element: `"focus"` or `"click"`. |
| `preventDefault` | `boolean`| No       | `true`    | Whether to call `preventDefault()` on the native keyboard event. |
| `conditions`     | `object` | No       | --        | Conditional rules that determine when the shortcut is active. See [Conditional Shortcuts](#conditional-shortcuts). |
| `legendPosition` | `string` | No       | --        | Hint for where to display the shortcut legend relative to the target. |

### Example JSON

```json
[
  {
    "selector": "#name",
    "keyShortcuts": "Alt+N"
  },
  {
    "selector": "#email",
    "keyShortcuts": "Alt+E"
  },
  {
    "selector": "#submit-btn",
    "keyShortcuts": "Ctrl+Enter",
    "action": "click"
  }
]
```

### Key Combination Syntax

- **Single key:** `"Enter"`, `"Escape"`, `"F1"`
- **Modifier + key:** `"Ctrl+S"`, `"Alt+N"`, `"Shift+Tab"`
- **Multiple modifiers:** `"Ctrl+Shift+K"`
- **Alternative bindings** (separated by space): `"Alt+N Alt+n"` -- both
  alternatives are registered as separate shortcuts pointing to the same target.

## Trigger Key Configuration

By default, pressing **F10** toggles shortcut hint tooltips. Change this via the
`show-key` property.

### HTML

```html
<!-- Use F1 as the trigger key instead of F10 -->
<ch-shortcuts
  src="/assets/shortcuts.json"
  show-key="F1"
></ch-shortcuts>
```

### Key Points

- The `show-key` value must match a valid
  [`KeyboardEvent.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key)
  string.
- When the trigger key is pressed a second time, the hints are dismissed.
- Pressing any non-modifier key while hints are visible also dismisses them.
- The trigger key press calls `preventDefault()` to avoid browser-default
  behavior (e.g., F10 opening the browser menu bar).

## Actions: Focus vs Click

Each shortcut definition can specify an `action` that determines what happens
when the key combination is pressed.

### HTML

```html
<input type="text" id="search-box" placeholder="Search..." />
<button id="save-btn">Save</button>

<ch-shortcuts src="/assets/shortcuts.json"></ch-shortcuts>
```

### JSON

```json
[
  {
    "selector": "#search-box",
    "keyShortcuts": "Ctrl+K",
    "action": "focus"
  },
  {
    "selector": "#save-btn",
    "keyShortcuts": "Ctrl+S",
    "action": "click"
  }
]
```

### Key Points

- `"focus"` (default) -- calls `element.focus()` on the target. Ideal for input
  fields and navigation.
- `"click"` -- dispatches a synthetic `click` event on the target. Ideal for
  buttons and actionable elements.

## Conditional Shortcuts

Shortcut definitions support a `conditions` object that restricts when a
shortcut fires based on the current focus context.

### JSON

```json
[
  {
    "selector": "#submit-btn",
    "keyShortcuts": "Enter",
    "action": "click",
    "conditions": {
      "focusExclude": "#email, #notes"
    }
  },
  {
    "selector": "#next-field",
    "keyShortcuts": "ArrowDown",
    "conditions": {
      "focusInclude": "#name"
    }
  }
]
```

### Condition Properties

| Property       | Type      | Description |
|----------------|-----------|-------------|
| `focusHost`    | `boolean` | When `true`, the shortcut only fires if the focus is inside the shadow host that owns the component instance. |
| `focusInclude` | `string`  | CSS selector. The shortcut fires **only** when one of the matching elements is in the current focus composed path. |
| `focusExclude` | `string`  | CSS selector. The shortcut is **suppressed** when one of the matching elements is in the current focus composed path. |
| `allowRepeat`  | `boolean` | When `true`, the shortcut continues to fire on `keydown` repeat events (key held down). By default, repeated events are ignored. |

### Key Points

- `focusInclude` and `focusExclude` accept comma-separated selectors, just like
  `querySelectorAll`.
- When `focusInclude` is set, the shortcut tooltip is **not shown** in the
  visual overlay (since it is context-dependent).
- `focusHost` is useful when multiple `ch-shortcuts` instances exist inside
  different shadow roots, ensuring shortcuts only trigger in their own context.

## Suspending Shortcuts at Runtime

Set the `suspend` property to `true` to temporarily disable all shortcut
handling without removing the component from the DOM.

### HTML

```html
<ch-shortcuts
  id="my-shortcuts"
  src="/assets/shortcuts.json"
></ch-shortcuts>

<button id="toggle-btn">Toggle Shortcuts</button>
```

### JavaScript

```js
const shortcuts = document.querySelector("#my-shortcuts");
const toggleBtn = document.querySelector("#toggle-btn");

toggleBtn.addEventListener("click", () => {
  shortcuts.suspend = !shortcuts.suspend;
  toggleBtn.textContent = shortcuts.suspend
    ? "Enable Shortcuts"
    : "Disable Shortcuts";
});
```

### Key Points

- When `suspend` is `true`, the component unloads its shortcut registrations
  from the internal manager. The trigger key is also ignored.
- When `suspend` returns to `false`, the shortcuts are re-registered without
  re-fetching the JSON file.
- Use this to disable shortcuts during modal dialogs, inline editing, or any
  context where global key bindings would interfere.

## Listening for Shortcut Events

Every time a shortcut fires, a `keyShortcutPressed` custom event is dispatched
on the root node (document or shadow root). Use this to run custom logic or
override the default action.

### JavaScript

```js
document.addEventListener("keyShortcutPressed", (event) => {
  const { id, keyShortcut, target, focusComposedPath } = event.detail;

  console.log(`Shortcut fired: ${keyShortcut}`);
  console.log(`Target element:`, target);
  console.log(`Shortcut ID:`, id);
});
```

### Preventing the Default Action

Call `preventDefault()` on the `keyShortcutPressed` event to cancel the
component's built-in focus/click action while still intercepting the key
combination.

```js
document.addEventListener("keyShortcutPressed", (event) => {
  if (event.detail.id === "custom-save") {
    event.preventDefault();
    // Run your own save logic instead
    saveDocument();
  }
});
```

### Event Detail

| Property            | Type            | Description |
|---------------------|-----------------|-------------|
| `keyShortcut`       | `string`        | The normalized key combination string (e.g., `"Ctrl+S"`). |
| `id`                | `string`        | The `id` value from the shortcut definition, if provided. |
| `target`            | `HTMLElement`    | The DOM element matched by the shortcut's `selector`. |
| `focusComposedPath` | `HTMLElement[]` | The composed focus path at the time the shortcut fired. |

## Do's and Don'ts

### Do

- Keep shortcut definitions in a separate JSON file so they can be managed and
  updated independently of the application code.
- Provide an `id` for each shortcut definition to make `keyShortcutPressed`
  event handling straightforward.
- Use `conditions.focusExclude` to prevent shortcuts from firing inside
  text inputs where the key combination has a natural meaning (e.g., `Enter`
  inside a textarea).
- Use the `suspend` property to disable shortcuts during modal workflows.
- Pair `ch-shortcuts` with `aria-keyshortcuts` attributes on target elements for
  accessibility.

### Don't

- Don't use `ch-shortcuts` to **define** keyboard behavior -- it only
  visualizes and dispatches pre-configured shortcut bindings.
- Don't place multiple `ch-shortcuts` instances pointing to the same `src` in
  the same root; this would register duplicate shortcut handlers.
- Don't use browser-reserved key combinations (e.g., `Ctrl+T`, `Ctrl+W`) as
  shortcut bindings -- the browser will intercept them before the component can.
- Don't rely on `ch-shortcuts` for critical-path functionality without a
  fallback; keyboard shortcuts are a power-user convenience, not a primary
  interaction method.
