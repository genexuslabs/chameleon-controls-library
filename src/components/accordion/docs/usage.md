# ch-accordion-render - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Single Expansion](#single-expansion)
- [Custom Header Slots](#custom-header-slots)
- [Animated Transitions](#animated-transitions)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates a simple accordion with multiple collapsible panels that can be expanded or collapsed independently.

### HTML

```html
<ch-accordion-render id="my-accordion">
  <div slot="faq-1">You can return items within 30 days of purchase.</div>
  <div slot="faq-2">We accept Visa, Mastercard, and PayPal.</div>
  <div slot="faq-3">Standard shipping takes 5-7 business days.</div>
</ch-accordion-render>
```

### JavaScript

```js
const accordion = document.querySelector("#my-accordion");

accordion.model = [
  { id: "faq-1", caption: "What is your return policy?", expanded: false },
  { id: "faq-2", caption: "What payment methods do you accept?", expanded: false },
  { id: "faq-3", caption: "How long does shipping take?", expanded: true }
];

accordion.addEventListener("expandedChange", (event) => {
  console.log("Item toggled:", event.detail.id, "Expanded:", event.detail.expanded);
});
```

### Key Points

- The `model` property accepts an array of `AccordionItemModel` objects, each requiring `id`, `caption`, and `expanded`.
- Slot names correspond to each item's `id` to project content into the correct panel.
- The `expandedChange` event fires whenever a panel is expanded or collapsed, with `{ id, expanded }` in the detail.
- Multiple panels can be open simultaneously by default.

## Single Expansion

Demonstrates the single-item expansion mode where only one panel can be open at a time. Opening a new panel automatically closes the previously open one.

### HTML

```html
<ch-accordion-render id="settings-accordion">
  <div slot="general">General settings content goes here.</div>
  <div slot="privacy">Privacy and security options.</div>
  <div slot="notifications">Notification preferences.</div>
</ch-accordion-render>
```

### JavaScript

```js
const accordion = document.querySelector("#settings-accordion");

accordion.singleItemExpanded = true;

accordion.model = [
  { id: "general", caption: "General", expanded: true },
  { id: "privacy", caption: "Privacy & Security", expanded: false },
  { id: "notifications", caption: "Notifications", expanded: false }
];

accordion.addEventListener("expandedChange", (event) => {
  console.log(event.detail.id, event.detail.expanded ? "opened" : "closed");
});
```

### Key Points

- Setting `singleItemExpanded` to `true` enforces that only one panel is open at a time.
- When a panel is expanded, the component automatically collapses the currently open panel and fires `expandedChange` for both items.
- If `singleItemExpanded` is toggled to `true` while multiple panels are open, all but the last expanded panel are auto-collapsed.
- The component mutates `item.expanded` directly on the model objects when toggling panels.

## Custom Header Slots

Demonstrates using named slots to provide custom header content instead of plain text captions. This is useful for adding icons, badges, or complex layouts to accordion headers.

### HTML

```html
<ch-accordion-render id="custom-accordion">
  <!-- Custom header for the first item -->
  <div slot="header-status">
    <span style="color: green;">&#9679;</span>
    <strong>System Status</strong>
    <span style="margin-inline-start: auto; font-size: 12px; color: #888;">All systems operational</span>
  </div>
  <div slot="status">All services are running normally. Uptime: 99.98%</div>

  <!-- Custom header for the second item -->
  <div slot="header-alerts">
    <span style="color: orange;">&#9888;</span>
    <strong>Alerts</strong>
    <span style="background: orange; color: white; border-radius: 9999px; padding: 2px 8px; font-size: 11px;">3</span>
  </div>
  <div slot="alerts">You have 3 unresolved alerts that require attention.</div>
</ch-accordion-render>
```

### JavaScript

```js
const accordion = document.querySelector("#custom-accordion");

accordion.model = [
  {
    id: "status",
    caption: "System Status",
    headerSlotId: "header-status",
    expanded: true
  },
  {
    id: "alerts",
    caption: "Alerts",
    headerSlotId: "header-alerts",
    expanded: false
  }
];
```

### Key Points

- Setting `headerSlotId` on a model item replaces the default caption text with the content of the named slot.
- The `headerSlotId` slot is projected inside the `<button>` header element, so its content is fully interactive and accessible.
- The `caption` property still serves as a fallback label if the slot is empty or for programmatic access.
- Both the `headerSlotId` and the item `id` are exported as parts, allowing per-item header styling via `::part()`.

## Animated Transitions

Demonstrates configuring smooth expand and collapse animations using CSS custom properties. The accordion uses CSS grid row transitions for a fluid reveal effect.

### HTML

```html
<ch-accordion-render id="animated-accordion">
  <div slot="about">
    <p>We are a team dedicated to building great user experiences.</p>
  </div>
  <div slot="services">
    <p>We offer consulting, design, and development services.</p>
  </div>
  <div slot="contact">
    <p>Reach us at contact@example.com or call +1 555-0100.</p>
  </div>
</ch-accordion-render>
```

### JavaScript

```js
const accordion = document.querySelector("#animated-accordion");

accordion.model = [
  { id: "about", caption: "About Us", expanded: false },
  { id: "services", caption: "Our Services", expanded: false },
  { id: "contact", caption: "Contact", expanded: false }
];
```

### Key Points

- The `--ch-accordion-expand-collapse-duration` custom property controls the animation duration. The default is `0ms` (no animation).
- The `--ch-accordion-expand-collapse-timing-function` custom property controls the easing curve. The default is `linear`.
- The animation is powered by CSS `grid-template-rows` transitions, providing a natural height reveal without JavaScript measurement.
- The chevron icon also rotates using the same duration and timing function, keeping the animation synchronized.
- Both properties are applied at the `:host` level and affect the panel grid, the section visibility, and the chevron rotation.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.
- Use named slots to provide custom content where supported.

### Don't

- Don't place a `<button>` or other interactive element inside the header slot — each accordion header is already rendered as a `<button>` internally, so nesting another `<button>` produces invalid HTML and breaks accessibility. Use `<span>`, `<div>`, images, or plain text for custom header content.
- Don't set complex model/items data via HTML attributes — use JavaScript property assignment instead.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
