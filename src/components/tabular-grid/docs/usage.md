# ch-tabular-grid - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Column Types](#column-types)
- [Tree Grid](#tree-grid)
- [Row Selection](#row-selection)
- [Virtual Scrolling](#virtual-scrolling)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates a simple data table with columns and rows displaying static tabular data.

### HTML

```html
<ch-tabular-grid id="basic-grid" row-selection-mode="single">
  <ch-tabular-grid-column-set>
    <ch-tabular-grid-column column-id="name" size="2fr">
      Name
    </ch-tabular-grid-column>
    <ch-tabular-grid-column column-id="email" size="2fr">
      Email
    </ch-tabular-grid-column>
    <ch-tabular-grid-column column-id="role" size="1fr">
      Role
    </ch-tabular-grid-column>
  </ch-tabular-grid-column-set>

  <ch-tabular-grid-row row-id="user-1">
    <ch-tabular-grid-cell>Alice Johnson</ch-tabular-grid-cell>
    <ch-tabular-grid-cell>alice@example.com</ch-tabular-grid-cell>
    <ch-tabular-grid-cell>Admin</ch-tabular-grid-cell>
  </ch-tabular-grid-row>

  <ch-tabular-grid-row row-id="user-2">
    <ch-tabular-grid-cell>Bob Smith</ch-tabular-grid-cell>
    <ch-tabular-grid-cell>bob@example.com</ch-tabular-grid-cell>
    <ch-tabular-grid-cell>Editor</ch-tabular-grid-cell>
  </ch-tabular-grid-row>

  <ch-tabular-grid-row row-id="user-3">
    <ch-tabular-grid-cell>Carol Davis</ch-tabular-grid-cell>
    <ch-tabular-grid-cell>carol@example.com</ch-tabular-grid-cell>
    <ch-tabular-grid-cell>Viewer</ch-tabular-grid-cell>
  </ch-tabular-grid-row>
</ch-tabular-grid>
```

### JavaScript

```js
const grid = document.querySelector("#basic-grid");

grid.addEventListener("selectionChanged", (event) => {
  console.log("Selected rows:", event.detail.rowsId);
});
```

### Key Points

- The grid is composed declaratively: `ch-tabular-grid-column-set` groups column definitions, `ch-tabular-grid-column` defines each column header, and `ch-tabular-grid-row` / `ch-tabular-grid-cell` define the data.
- Each column requires a unique `column-id` and each row requires a unique `row-id`.
- The `size` property on columns uses CSS grid track syntax (e.g., `"1fr"`, `"200px"`, `"auto"`).
- Setting `row-selection-mode="single"` enables clicking a row to select it. The `selectionChanged` event fires with the selected row IDs.
- Full keyboard navigation is built in: Arrow keys move focus, Enter selects, Home/End jump to row boundaries.

## Column Types

Demonstrates different column configurations including alignment, resizing, and reordering.

### HTML

```html
<ch-tabular-grid
  id="typed-grid"
  row-selection-mode="none"
  column-resize-mode="splitter"
  allow-column-reorder
>
  <ch-tabular-grid-column-set>
    <ch-tabular-grid-column column-id="product" size="2fr">
      Product
    </ch-tabular-grid-column>
    <ch-tabular-grid-column column-id="category" size="1fr">
      Category
    </ch-tabular-grid-column>
    <ch-tabular-grid-column column-id="price" size="100px">
      Price
    </ch-tabular-grid-column>
    <ch-tabular-grid-column column-id="date" size="120px">
      Date Added
    </ch-tabular-grid-column>
  </ch-tabular-grid-column-set>

  <ch-tabular-grid-row row-id="item-1">
    <ch-tabular-grid-cell>Wireless Keyboard</ch-tabular-grid-cell>
    <ch-tabular-grid-cell>Accessories</ch-tabular-grid-cell>
    <ch-tabular-grid-cell style="text-align: end;">$49.99</ch-tabular-grid-cell>
    <ch-tabular-grid-cell>2024-01-15</ch-tabular-grid-cell>
  </ch-tabular-grid-row>

  <ch-tabular-grid-row row-id="item-2">
    <ch-tabular-grid-cell>USB-C Hub</ch-tabular-grid-cell>
    <ch-tabular-grid-cell>Accessories</ch-tabular-grid-cell>
    <ch-tabular-grid-cell style="text-align: end;">$29.99</ch-tabular-grid-cell>
    <ch-tabular-grid-cell>2024-02-20</ch-tabular-grid-cell>
  </ch-tabular-grid-row>

  <ch-tabular-grid-row row-id="item-3">
    <ch-tabular-grid-cell>Monitor Stand</ch-tabular-grid-cell>
    <ch-tabular-grid-cell>Furniture</ch-tabular-grid-cell>
    <ch-tabular-grid-cell style="text-align: end;">$89.00</ch-tabular-grid-cell>
    <ch-tabular-grid-cell>2024-03-10</ch-tabular-grid-cell>
  </ch-tabular-grid-row>
</ch-tabular-grid>
```

### Key Points

- The `column-resize-mode` property controls resize behavior: `"single"` resizes only the dragged column; `"splitter"` redistributes space between neighboring columns.
- Setting `allow-column-reorder` enables drag-and-drop reordering of column headers.
- Cell alignment is applied via inline styles or CSS classes (e.g., `tabular-grid-align-cells-inline-end` for right-aligned numeric columns).
- Column sizes can mix fixed (`"100px"`, `"120px"`) and flexible (`"1fr"`, `"2fr"`) values.
- The grid does not enforce data types on cells; formatting (dates, currency) is handled by the consumer in the cell content.

## Tree Grid

Demonstrates hierarchical data with expandable/collapsible row groups using rowsets.

### HTML

```html
<ch-tabular-grid id="tree-grid" row-selection-mode="single">
  <ch-tabular-grid-column-set>
    <ch-tabular-grid-column column-id="name" size="2fr">
      Name
    </ch-tabular-grid-column>
    <ch-tabular-grid-column column-id="type" size="1fr">
      Type
    </ch-tabular-grid-column>
    <ch-tabular-grid-column column-id="size" size="100px">
      Size
    </ch-tabular-grid-column>
  </ch-tabular-grid-column-set>

  <!-- Top-level folder -->
  <ch-tabular-grid-rowset rowset-id="src-folder" caption="src">
    <ch-tabular-grid-row row-id="file-1">
      <ch-tabular-grid-cell>index.ts</ch-tabular-grid-cell>
      <ch-tabular-grid-cell>TypeScript</ch-tabular-grid-cell>
      <ch-tabular-grid-cell>4.2 KB</ch-tabular-grid-cell>
    </ch-tabular-grid-row>

    <!-- Nested folder -->
    <ch-tabular-grid-rowset rowset-id="components-folder" caption="components">
      <ch-tabular-grid-row row-id="file-2">
        <ch-tabular-grid-cell>App.tsx</ch-tabular-grid-cell>
        <ch-tabular-grid-cell>TypeScript JSX</ch-tabular-grid-cell>
        <ch-tabular-grid-cell>2.1 KB</ch-tabular-grid-cell>
      </ch-tabular-grid-row>

      <ch-tabular-grid-row row-id="file-3">
        <ch-tabular-grid-cell>Header.tsx</ch-tabular-grid-cell>
        <ch-tabular-grid-cell>TypeScript JSX</ch-tabular-grid-cell>
        <ch-tabular-grid-cell>1.5 KB</ch-tabular-grid-cell>
      </ch-tabular-grid-row>
    </ch-tabular-grid-rowset>
  </ch-tabular-grid-rowset>

  <!-- Top-level file -->
  <ch-tabular-grid-row row-id="file-4">
    <ch-tabular-grid-cell>package.json</ch-tabular-grid-cell>
    <ch-tabular-grid-cell>JSON</ch-tabular-grid-cell>
    <ch-tabular-grid-cell>1.8 KB</ch-tabular-grid-cell>
  </ch-tabular-grid-row>
</ch-tabular-grid>
```

### Key Points

- Use `ch-tabular-grid-rowset` to group rows hierarchically. Rowsets can be nested to any depth.
- Each rowset has a `rowset-id` and a `caption` that appears in the expandable legend row.
- Users can expand/collapse rowsets by clicking the legend or pressing `+` / `-` keys when the rowset is focused.
- Keyboard navigation automatically traverses into and out of nested rowsets.
- Rowsets use the `collapsed` property to programmatically control their expand/collapse state.

## Row Selection

Demonstrates single and multiple row selection modes, including marking (checkbox) support.

### HTML

```html
<div>
  <label>
    <input type="radio" name="mode" value="single" checked> Single
  </label>
  <label>
    <input type="radio" name="mode" value="multiple"> Multiple
  </label>
  <label>
    <input type="radio" name="mode" value="none"> None
  </label>
</div>

<ch-tabular-grid
  id="selection-grid"
  row-selection-mode="single"
  row-selected-class="row-selected"
  row-highlighted-class="row-hover"
>
  <ch-tabular-grid-column-set>
    <ch-tabular-grid-column column-id="task" size="2fr">
      Task
    </ch-tabular-grid-column>
    <ch-tabular-grid-column column-id="status" size="1fr">
      Status
    </ch-tabular-grid-column>
  </ch-tabular-grid-column-set>

  <ch-tabular-grid-row row-id="task-1">
    <ch-tabular-grid-cell>Design mockups</ch-tabular-grid-cell>
    <ch-tabular-grid-cell>Complete</ch-tabular-grid-cell>
  </ch-tabular-grid-row>

  <ch-tabular-grid-row row-id="task-2">
    <ch-tabular-grid-cell>Implement API</ch-tabular-grid-cell>
    <ch-tabular-grid-cell>In Progress</ch-tabular-grid-cell>
  </ch-tabular-grid-row>

  <ch-tabular-grid-row row-id="task-3">
    <ch-tabular-grid-cell>Write tests</ch-tabular-grid-cell>
    <ch-tabular-grid-cell>Pending</ch-tabular-grid-cell>
  </ch-tabular-grid-row>
</ch-tabular-grid>
```

### JavaScript

```js
const grid = document.querySelector("#selection-grid");

// Switch selection mode dynamically
document.querySelectorAll("input[name='mode']").forEach(radio => {
  radio.addEventListener("change", (e) => {
    grid.rowSelectionMode = e.target.value;
  });
});

// Listen for selection changes
grid.addEventListener("selectionChanged", (event) => {
  const { rowsId, addedRowsId, removedRowsId } = event.detail;
  console.log("Currently selected:", rowsId);
  console.log("Newly selected:", addedRowsId);
  console.log("Deselected:", removedRowsId);
});

// Listen for row marking changes (checkbox mode)
grid.addEventListener("rowMarkingChanged", (event) => {
  console.log("Marked rows:", event.detail.rowsId);
});
```

### Key Points

- `row-selection-mode` accepts `"none"`, `"single"`, or `"multiple"`.
- In `"multiple"` mode, Ctrl/Cmd+click toggles individual rows; Shift+click selects a range.
- The `selectionChanged` event provides `rowsId` (all selected), `addedRowsId`, `removedRowsId`, and `unalteredRowsId` for incremental updates.
- Row highlighting on hover is controlled by `rowHighlightEnabled` (defaults to `"auto"`, which enables it when selection is active).
- CSS class names for selected, highlighted, focused, and marked states are configurable via dedicated properties.

## Virtual Scrolling

Demonstrates handling a large dataset efficiently by constraining the grid height and leveraging the built-in scrollable area.

### HTML

```html
<ch-tabular-grid
  id="large-grid"
  row-selection-mode="multiple"
  style="height: 400px;"
>
  <ch-tabular-grid-column-set>
    <ch-tabular-grid-column column-id="id" size="80px">
      ID
    </ch-tabular-grid-column>
    <ch-tabular-grid-column column-id="name" size="1fr">
      Name
    </ch-tabular-grid-column>
    <ch-tabular-grid-column column-id="value" size="120px">
      Value
    </ch-tabular-grid-column>
  </ch-tabular-grid-column-set>
</ch-tabular-grid>
```

### JavaScript

```js
const grid = document.querySelector("#large-grid");
const ROW_COUNT = 10000;

// Programmatically generate rows for a large dataset
function populateGrid() {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < ROW_COUNT; i++) {
    const row = document.createElement("ch-tabular-grid-row");
    row.setAttribute("row-id", `row-${i}`);

    const cellId = document.createElement("ch-tabular-grid-cell");
    cellId.textContent = String(i + 1);

    const cellName = document.createElement("ch-tabular-grid-cell");
    cellName.textContent = `Item ${i + 1}`;

    const cellValue = document.createElement("ch-tabular-grid-cell");
    cellValue.textContent = `$${(Math.random() * 1000).toFixed(2)}`;

    row.appendChild(cellId);
    row.appendChild(cellName);
    row.appendChild(cellValue);

    fragment.appendChild(row);
  }

  grid.appendChild(fragment);
}

populateGrid();

// Listen for selection on the large dataset
grid.addEventListener("selectionChanged", (event) => {
  console.log(`${event.detail.rowsId.length} rows selected`);
});
```

### Key Points

- Set a fixed `height` (or use CSS to constrain the grid) so the internal scrollable area (`overflow-x: auto` on the main part) activates.
- The grid uses `grid-auto-rows: max-content` internally, so rows are rendered at their natural height.
- For very large datasets, populate rows programmatically using `DocumentFragment` for optimal DOM insertion performance.
- Keyboard navigation (PageUp/PageDown) works within the scrollable area, jumping multiple rows at a time.
- Column headers remain sticky at the top while the data area scrolls, thanks to the internal z-index layering system.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.
- Use the component's custom events (e.g., `input`, `change`) for reacting to user interactions.

### Don't

- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
