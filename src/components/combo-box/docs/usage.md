# ch-combo-box - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Grouped Items](#grouped-items)
- [Searchable Suggest Mode with Debounce](#searchable-suggest-mode-with-debounce)
- [Items with Images](#items-with-images)
- [Popover Customization](#popover-customization)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

A simple combo box with a flat list of items for single-value selection.

### HTML

```html
<label for="country">Country</label>
<ch-combo-box-render
  id="country"
  placeholder="Select a country"
></ch-combo-box-render>
```

### JavaScript

```javascript
const comboBox = document.querySelector("#country");

// Define the model as a flat array of ComboBoxItemLeaf objects
comboBox.model = [
  { caption: "Argentina", value: "AR" },
  { caption: "Brazil", value: "BR" },
  { caption: "Canada", value: "CA" },
  { caption: "Germany", value: "DE" },
  { caption: "Japan", value: "JP" },
  { caption: "United States", value: "US" }
];

// Set an initial selection
comboBox.value = "US";

// Listen for selection changes
comboBox.addEventListener("input", (event) => {
  console.log("Selected value:", comboBox.value);
});
```

### Key Points

- Each item in the `model` array is a `ComboBoxItemLeaf` with a required `value` (the underlying data value) and an optional `caption` (the display text).
- If `caption` is omitted, the `value` is displayed as the label.
- The `value` property on the combo box must match the `value` of one of the items in the model to set the initial selection.
- The `input` event fires when the user selects a new item.
- Always pair the combo box with a visible `<label>` for accessibility. The component is form-associated via `ElementInternals`.

## Grouped Items

A combo box with items organized into expandable groups using the `ComboBoxItemGroup` type.

### HTML

```html
<label for="city">City</label>
<ch-combo-box-render id="city" placeholder="Select a city"></ch-combo-box-render>
```

### JavaScript

```javascript
const comboBox = document.querySelector("#city");

// ComboBoxItemGroup extends ComboBoxItemLeaf and adds an `items` array
comboBox.model = [
  {
    caption: "United States",
    value: "us-group",
    expandable: true,
    expanded: true,
    items: [
      { caption: "New York", value: "NYC" },
      { caption: "Los Angeles", value: "LAX" },
      { caption: "Chicago", value: "CHI" }
    ]
  },
  {
    caption: "Europe",
    value: "eu-group",
    expandable: true,
    expanded: false,
    items: [
      { caption: "London", value: "LDN" },
      { caption: "Paris", value: "PAR" },
      { caption: "Berlin", value: "BER" }
    ]
  },
  {
    caption: "Asia",
    value: "asia-group",
    expandable: true,
    expanded: false,
    items: [
      { caption: "Tokyo", value: "TKY" },
      { caption: "Seoul", value: "SEL" },
      { caption: "Singapore", value: "SIN" }
    ]
  }
];

// Select a nested item by its value
comboBox.value = "PAR";

comboBox.addEventListener("input", () => {
  console.log("Selected city:", comboBox.value);
});
```

### Key Points

- A `ComboBoxItemGroup` has all the properties of a `ComboBoxItemLeaf` plus `expandable`, `expanded`, and `items`.
- Set `expandable: true` to allow the group to be collapsed/expanded by the user.
- Set `expanded: true` to have the group open by default.
- The `items` array inside a group contains `ComboBoxItemLeaf` objects (groups cannot be nested further).
- The selected `value` on the combo box refers to a leaf item's `value`, not the group's `value`.
- The `ComboBoxSelectedIndex` type for grouped items uses a tuple `[groupIndex, itemIndex]` internally.

## Searchable Suggest Mode with Debounce

Enable suggest mode to let users filter items by typing in the combo box input. The built-in debounce reduces filtering frequency.

### HTML

```html
<label for="employee">Employee</label>
<ch-combo-box-render
  id="employee"
  placeholder="Type to search..."
  suggest="true"
  suggest-debounce="300"
></ch-combo-box-render>
```

### JavaScript

```javascript
const comboBox = document.querySelector("#employee");

comboBox.model = [
  { caption: "Alice Johnson", value: "emp-001" },
  { caption: "Bob Martinez", value: "emp-002" },
  { caption: "Carol Williams", value: "emp-003" },
  { caption: "David Brown", value: "emp-004" },
  { caption: "Eva Chen", value: "emp-005" },
  { caption: "Frank O'Brien", value: "emp-006" },
  { caption: "Grace Kim", value: "emp-007" },
  { caption: "Henry Davis", value: "emp-008" }
];

// Configure suggest options for case-insensitive filtering
comboBox.suggestOptions = {
  matchCase: false
};

comboBox.addEventListener("input", () => {
  console.log("Selected employee:", comboBox.value);
});
```

### Key Points

- Set `suggest="true"` to turn the combo box into a searchable input. The user can type to filter the displayed items.
- The `suggestDebounce` property (default 250ms) controls how long the component waits after the user stops typing before filtering. Set a higher value for server-side filtering.
- `suggestOptions` configures the filter behavior:
  - `matchCase: false` (default) performs case-insensitive matching.
  - `alreadyProcessed: true` tells the component that the model is pre-filtered (useful for server-side search).
  - `hideMatchesAndShowNonMatches: true` inverts the filter, hiding matches and showing non-matches.
  - `regularExpression: true` treats the filter string as a regular expression.
- When `alreadyProcessed` is `true`, update the `model` property with the server response to refresh the dropdown items.

## Items with Images

Display icons or images alongside item captions using the `startImgSrc` and `endImgSrc` properties.

### HTML

```html
<label for="file-type">File Type</label>
<ch-combo-box-render
  id="file-type"
  placeholder="Select a file type"
></ch-combo-box-render>
```

### JavaScript

```javascript
const comboBox = document.querySelector("#file-type");

comboBox.model = [
  {
    caption: "PDF Document",
    value: "pdf",
    startImgSrc: "/assets/icons/file-pdf.svg",
    startImgType: "mask"
  },
  {
    caption: "Word Document",
    value: "docx",
    startImgSrc: "/assets/icons/file-word.svg",
    startImgType: "mask"
  },
  {
    caption: "Excel Spreadsheet",
    value: "xlsx",
    startImgSrc: "/assets/icons/file-excel.svg",
    startImgType: "mask"
  },
  {
    caption: "Image (PNG)",
    value: "png",
    startImgSrc: "/assets/icons/file-image.svg",
    startImgType: "background"
  },
  {
    caption: "Plain Text",
    value: "txt",
    startImgSrc: "/assets/icons/file-text.svg",
    startImgType: "mask"
  }
];

comboBox.addEventListener("input", () => {
  console.log("Selected file type:", comboBox.value);
});
```

### Key Points

- Each `ComboBoxItemLeaf` supports `startImgSrc` and `endImgSrc` for images rendered before and after the caption, respectively.
- The `startImgType` and `endImgType` properties control how the image is rendered:
  - `"background"` uses a CSS `background-image`. Use this for full-color images or photos.
  - `"mask"` uses a CSS `-webkit-mask`. The image inherits `currentColor`, making it ideal for monochrome icons that should match the text color.
- Use the `getImagePathCallback` property on the combo box to customize how image paths are resolved. This is useful for multi-state images or when image paths need transformation.
- Images are displayed both in the dropdown list and in the selected item display.

## Popover Customization

Control the alignment and resizability of the combo box dropdown popover.

### HTML

```html
<label for="priority">Priority</label>
<ch-combo-box-render
  id="priority"
  placeholder="Select priority"
  popover-inline-align="outside-end"
  resizable="true"
></ch-combo-box-render>
```

### JavaScript

```javascript
const comboBox = document.querySelector("#priority");

comboBox.model = [
  { caption: "Critical", value: "critical" },
  { caption: "High", value: "high" },
  { caption: "Medium", value: "medium" },
  { caption: "Low", value: "low" },
  { caption: "None", value: "none" }
];

comboBox.value = "medium";

comboBox.addEventListener("input", () => {
  console.log("Selected priority:", comboBox.value);
});
```

### Key Points

- The `popoverInlineAlign` property controls the horizontal alignment of the dropdown popover relative to the combo box. It accepts `ChPopoverAlign` values such as `"inside-start"` (default), `"inside-end"`, `"outside-start"`, `"outside-end"`, and `"center"`.
- Set `resizable="true"` to allow the user to resize the popover by dragging its edges. This is useful when item captions may be long or vary in length.
- Both properties can be changed at runtime to adapt the layout to different viewport sizes or container positions.
- The popover automatically closes when the user selects an item or clicks outside the dropdown.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.

### Don't

- Don't set complex model/items data via HTML attributes — use JavaScript property assignment instead.
- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
