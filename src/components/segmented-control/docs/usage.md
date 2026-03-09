# ch-segmented-control-render - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Segmented Control with Images](#segmented-control-with-images)
- [Per-Item Disabled State](#per-item-disabled-state)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

A simple segmented control for switching between mutually exclusive views.

### HTML

```html
<ch-segmented-control-render id="view-mode"></ch-segmented-control-render>
```

### JavaScript

```javascript
const segmentedControl = document.querySelector("#view-mode");

// Define the model as an array of SegmentedControlItemModel objects
segmentedControl.model = [
  { id: "list", caption: "List" },
  { id: "grid", caption: "Grid" },
  { id: "table", caption: "Table" }
];

// Set the initially selected segment
segmentedControl.selectedId = "list";

// Listen for selection changes
segmentedControl.addEventListener("selectedItemChange", (event) => {
  const selectedId = event.detail;
  console.log("View mode:", selectedId);

  // Switch content view based on selection
  document.querySelector("#list-view").hidden = selectedId !== "list";
  document.querySelector("#grid-view").hidden = selectedId !== "grid";
  document.querySelector("#table-view").hidden = selectedId !== "table";
});
```

### Key Points

- Each item in the `model` array requires a unique `id` (string) and typically a `caption` for the visible label.
- Set `selectedId` to the `id` of the segment that should be active. The property is mutable: the component updates it when the user clicks a segment.
- The `selectedItemChange` event fires only on user interaction (click). It does not fire when `selectedId` is changed programmatically.
- The host element renders with `role="list"` and each segment is a `role="listitem"` for semantic accessibility.
- Use the `itemCssClass` property to set a default CSS class applied to all segment items (defaults to `"segmented-control-item"`).

## Segmented Control with Images

Add start or end images to segments for visual context alongside captions.

### HTML

```html
<ch-segmented-control-render id="layout-selector"></ch-segmented-control-render>
```

### JavaScript

```javascript
const segmentedControl = document.querySelector("#layout-selector");

segmentedControl.model = [
  {
    id: "compact",
    caption: "Compact",
    startImgSrc: "/assets/icons/layout-compact.svg",
    startImgType: "mask"
  },
  {
    id: "comfortable",
    caption: "Comfortable",
    startImgSrc: "/assets/icons/layout-comfortable.svg",
    startImgType: "mask"
  },
  {
    id: "spacious",
    caption: "Spacious",
    startImgSrc: "/assets/icons/layout-spacious.svg",
    startImgType: "mask"
  }
];

segmentedControl.selectedId = "comfortable";

segmentedControl.addEventListener("selectedItemChange", (event) => {
  console.log("Layout density:", event.detail);
});
```

### Key Points

- Each `SegmentedControlItemModel` supports `startImgSrc` and `endImgSrc` for images rendered before and after the caption.
- The `startImgType` and `endImgType` properties control the rendering approach:
  - `"background"` renders the image as a CSS `background-image` (use for full-color images).
  - `"mask"` renders using CSS `-webkit-mask`, making the icon inherit `currentColor` (ideal for monochrome icons).
- For icon-only segments (no `caption`), always provide `accessibleName` so screen readers can announce the segment's purpose.
- Images are rendered inside the `ch-segmented-control-item` child components, which export their CSS parts via `exportParts`.

## Per-Item Disabled State

Disable individual segments to prevent user interaction while keeping them visible.

### HTML

```html
<ch-segmented-control-render id="plan-selector"></ch-segmented-control-render>
```

### JavaScript

```javascript
const segmentedControl = document.querySelector("#plan-selector");

segmentedControl.model = [
  { id: "free", caption: "Free" },
  { id: "pro", caption: "Pro" },
  { id: "enterprise", caption: "Enterprise", disabled: true }
];

segmentedControl.selectedId = "free";

segmentedControl.addEventListener("selectedItemChange", (event) => {
  console.log("Selected plan:", event.detail);
});
```

### Key Points

- Set `disabled: true` on individual items in the model to make them non-interactive. Disabled segments are rendered but cannot be clicked.
- The `disabled` CSS part is applied to the `action` button of disabled segments, allowing you to style them differently (e.g., reduced opacity).
- To change the disabled state at runtime, assign a new `model` array. The component re-renders based on the updated model.
- Clicking a disabled segment does not fire the `selectedItemChange` event and does not change `selectedId`.
- The `selected`, `unselected`, `disabled`, `first`, `last`, and `between` CSS parts on the `action` button enable fine-grained styling for every possible segment state.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.
- Always provide an `accessibleName` or appropriate `aria-` attribute for screen reader support.

### Don't

- Don't set complex model/items data via HTML attributes — use JavaScript property assignment instead.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
