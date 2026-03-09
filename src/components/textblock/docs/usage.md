# ch-textblock - Usage

## Table of Contents

- [Sizing Behavior](#sizing-behavior)
- [Basic Usage](#basic-usage)
- [HTML Content with Slot](#html-content-with-slot)
- [Overflow Tooltip](#overflow-tooltip)
- [Do's and Don'ts](#dos-and-donts)

> **Sizing behavior:** `ch-textblock` uses `contain: size` when `autoGrow = false` (the default), which means it does **not** contribute to its parent's intrinsic size. The parent must establish its own size through layout. If the parent has no size, the component will be invisible.
>
> Set `autoGrow` to `true` to let the component size to its content, or place the component inside a grid or flex container that already has a defined size:
>
> ```css
> /* Recommended: parent establishes its own size via layout */
> .my-layout {
>   display: grid;
>   grid-template-rows: auto 1fr; /* component goes in the 1fr row */
> }
> ```

## Basic Usage

A simple text block that displays a plain-text caption with automatic multi-line ellipsis when content overflows.

### HTML

```html
<ch-textblock
  caption="This is a short informational message displayed to the user."
></ch-textblock>
```

### JavaScript

```javascript
const textblock = document.querySelector("ch-textblock");

// Update the caption programmatically
textblock.caption = "Updated message content.";
```

### Key Points

- The `caption` property sets the plain text content. It is used when `format` is `"text"` (the default).
- The `accessibleRole` property defaults to `"p"` (paragraph), which sets `role="paragraph"` on the host. Use `"h1"` through `"h6"` to render with `role="heading"` and the corresponding `aria-level`.
- By default, `autoGrow` is `false`, so the text block clips overflowing content with multi-line ellipsis truncation based on the available height of the container.
- Set `autoGrow="true"` to let the component expand to fit all content without truncation.

## HTML Content with Slot

Use the `format="HTML"` mode to render rich HTML content via the default slot instead of the `caption` property.

### HTML

```html
<ch-textblock format="HTML">
  <p>Welcome to the <strong>Dashboard</strong>.</p>
  <p>Use the sidebar to navigate between <em>reports</em>, <em>settings</em>, and <em>profile</em>.</p>
</ch-textblock>
```

```html
<ch-textblock format="HTML" accessible-role="h3">
  <span>Project <strong>Alpha</strong> — Status Report</span>
</ch-textblock>
```

### JavaScript

```javascript
const textblock = document.querySelector("ch-textblock");

// Switch to HTML mode programmatically
textblock.format = "HTML";

// When format is "HTML", the caption property is ignored.
// Content comes from the default slot.
```

### Key Points

- Set `format="HTML"` to render slotted HTML content. In this mode, the `caption` property is ignored.
- The default slot accepts any HTML elements. The content is rendered inside the component's shadow DOM via a `<slot>`.
- Multi-line ellipsis truncation still works in HTML mode when `autoGrow` is `false`. The component uses CSS line-clamping with a calculated number of visible lines.
- When switching between `"text"` and `"HTML"` formats dynamically, the component disconnects and reconnects its internal `ResizeObserver` to re-measure the content.

## Overflow Tooltip

Display a native browser tooltip when the text content overflows its container, and listen for overflow state changes.

### HTML

```html
<div style="height: 60px; overflow: hidden;">
  <ch-textblock
    caption="This is a very long text that will likely overflow the 60px container. When it does, hovering over the component will show a native tooltip with the full text content, so the user can read everything without expanding the container."
    show-tooltip-on-overflow="true"
  ></ch-textblock>
</div>
```

### JavaScript

```javascript
const textblock = document.querySelector("ch-textblock");

// Listen for overflow state changes
textblock.addEventListener("overflowingContentChange", (event) => {
  const isOverflowing = event.detail;
  console.log("Content overflows:", isOverflowing);

  if (isOverflowing) {
    // Show a "Read more" button, for example
    document.querySelector("#read-more-btn").hidden = false;
  }
});

// Dynamically update caption and let the component re-evaluate overflow
textblock.caption = "Short text.";
// The overflowingContentChange event will fire with `false` if the text now fits
```

### Key Points

- Set `showTooltipOnOverflow="true"` to show a native `title` tooltip when the content overflows. This only works when `format="text"` and `autoGrow="false"`.
- The `overflowingContentChange` event fires whenever the overflow state changes. The `event.detail` is a boolean: `true` when content overflows, `false` when it fits.
- The overflow detection uses a `ResizeObserver` internally to re-measure content whenever the container or content dimensions change.
- The tooltip displays the full `caption` text. For HTML content, use a different tooltip strategy since `showTooltipOnOverflow` only applies to the text format.
- The component calculates the number of visible lines based on the rendered line height, measured using the `characterToMeasureLineHeight` property (default `"A"`). This can be customized if your font produces different line heights for different characters.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.
- Use named slots to provide custom content where supported.
- Always provide an `accessibleName` or appropriate `aria-` attribute for screen reader support.

### Don't

- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
