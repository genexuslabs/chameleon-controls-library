# FD-01: CSS Subgrid Layout Model

The layout model defines the CSS architecture that underpins every visual feature of the tabular grid. All four variants (Data Grid, Tree Grid, Pivot Table, Gantt Chart) share this single layout model. Any feature specification in `02-features/` that affects layout MUST respect the constraints documented here.

---

## 1.1 Design Principles

1. **CSS-first column alignment.** Column widths are driven entirely by `grid-template-columns` on the host element. JavaScript MUST NOT measure or set pixel widths on individual cells; it MUST only update the CSS `grid-template-columns` string (or CSS custom properties that feed into it).

2. **Rows are real grid items.** Every row element participates in the host grid as a direct or inherited grid item. Rows MUST NOT use `display: contents`, because that destroys the element's box and prevents row-level styling, hit-testing, selection outlines, drag handles, and accessibility tree participation.

3. **Subgrid for column coherence.** Each row inherits the host's column tracks via `grid-template-columns: subgrid`, ensuring cells across all rows align to the same column grid without JavaScript measurement.

4. **Minimal JavaScript surface.** Layout mutations (resize, reorder, hide, freeze) MUST be expressed as CSS changes (updating `grid-template-columns`, toggling classes, setting custom properties). JavaScript orchestrates the mutations but never becomes the layout engine.

5. **Sticky over structural separation.** Frozen columns and frozen rows use `position: sticky` within the subgrid layout. They MUST NOT be placed in separate DOM containers that break the column grid.

---

## 1.2 Host Element Grid

The `ch-tabular-grid-render` host element establishes the grid context that all descendants participate in.

### 1.2.1 Host CSS

```css
:host {
  display: grid;
  grid-template-columns: <column-tracks>;   /* See 1.3 */
  grid-template-rows: max-content 1fr;       /* Header region + body region */
  overflow: hidden;                          /* Scrolling delegated to body */
}
```

**`grid-template-rows: max-content 1fr`** creates exactly two implicit row slots:

| Slot | Sizing | Content |
|------|--------|---------|
| Header region | `max-content` | Column header rowgroup (one or more header rows, filter rows) |
| Body region | `1fr` | Scrollable body rowgroup containing data rows |

> Additional structural rows (footer, action bar) MAY be added as further `max-content` row tracks appended to `grid-template-rows`. The two-slot model is the minimum viable layout.

### 1.2.2 Host DOM Structure (Minimal)

```
ch-tabular-grid-render            ← display: grid
  div.rowgroup[role="rowgroup"]   ← header rowgroup (subgrid)
    div.column-row[role="row"]    ← header row (see 1.5 for display:contents exception)
      ch-tabular-grid-column      ← columnheader cells
  div.body.rowgroup[role="rowgroup"]  ← body rowgroup (subgrid, overflow: auto)
    div.row[role="row"]           ← data row (subgrid)
      div.cell[role="gridcell"]   ← cell
```

### 1.2.3 Constraint: Two-Dimensional Track Ownership

The host element MUST be the sole owner of column track definitions. No descendant element MAY define its own independent column tracks that conflict with the host. All column alignment MUST flow downward through `subgrid` inheritance.

---

## 1.3 Column Track Definitions

### 1.3.1 The `grid-template-columns` Value

The host's `grid-template-columns` property defines one track per logical column. The value is a space-separated list of track sizes.

```css
/* 4 columns: selector checkbox, Name, Population, Language */
:host {
  grid-template-columns: 40px 1fr 150px 200px;
}
```

JavaScript updates this value by setting the CSS property on the host element directly:

```js
this.style.gridTemplateColumns = columns
  .map(col => col.hidden ? '0px' : col.size ?? 'max-content')
  .join(' ');
```

### 1.3.2 Track Sizing Functions

Column sizes MUST be expressed using valid CSS grid track sizing functions:

| Function | Use case | Example |
|----------|----------|---------|
| `<length>` | Fixed pixel width | `200px` |
| `<percentage>` | Proportional to grid width | `25%` |
| `max-content` | Shrink-wrap to widest cell | `max-content` |
| `min-content` | Shrink-wrap to narrowest breakpoint | `min-content` |
| `minmax(min, max)` | Bounded flexible | `minmax(100px, 1fr)` |
| `fr` | Fractional remaining space | `1fr` |
| `fit-content(limit)` | Content-sized with upper bound | `fit-content(300px)` |
| `0px` | Hidden column (see 1.3.4) | `0px` |

### 1.3.3 CSS Custom Properties for Column Sizing

Column sizing MAY be driven by CSS custom properties to enable theme-level and runtime overrides without JavaScript recalculation:

```css
:host {
  grid-template-columns:
    var(--col-selector-size, 40px)
    var(--col-1-size, 1fr)
    var(--col-2-size, 150px)
    var(--col-3-size, 200px);
}
```

When JavaScript resizes a column, it SHOULD update the corresponding custom property:

```js
host.style.setProperty('--col-2-size', '180px');
```

This approach preserves the declarative column template and avoids rewriting the entire `grid-template-columns` string on every resize operation.

### 1.3.4 Column Hiding

A hidden column MUST have its track size set to `0px` (or `0fr`). This collapses the track to zero width while preserving the column's position in the grid. Cells in the hidden column MUST also receive `overflow: hidden` and `visibility: hidden` (or equivalent) to prevent content from bleeding into adjacent tracks.

```css
/* Column 2 hidden */
:host {
  grid-template-columns: 40px 1fr 0px 200px;
}
```

Hidden columns MUST NOT be removed from the DOM. Removing them would shift all subsequent `grid-column` indices and break subgrid alignment. The column header element SHOULD be hidden with `visibility: hidden; overflow: hidden` and MUST be excluded from keyboard navigation (see F-14).

### 1.3.5 Column Reorder

Column reorder MUST NOT physically move DOM elements. Instead, reorder is achieved by:

1. Rearranging the track sizes in `grid-template-columns` to reflect the new visual order.
2. Updating each cell's `grid-column` placement (or `order` property) so cells map to the correct track.

This approach keeps the DOM order stable (preserving accessibility tree order) while the visual order changes via CSS. See F-09 for full behavioral requirements.

---

## 1.4 Row and Cell Subgrid

### 1.4.1 Row Elements

Every row-level element (header row, data row, group row, footer row, filter row) MUST use the following CSS pattern:

```css
.row,
.rowgroup {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
}
```

**Why each property is required:**

- **`display: grid`** establishes the row as a grid container so it can host cell children as grid items.
- **`grid-template-columns: subgrid`** inherits the host's column track definitions, ensuring cells align with every other row's cells.
- **`grid-column: 1 / -1`** makes the row span all column tracks. Without this declaration, the row would only occupy a single track, and `subgrid` would have no tracks to inherit.

### 1.4.2 Constraint: No `display: contents` on Rows

Row elements MUST NOT use `display: contents`.

**Rationale:** `display: contents` removes the element's box from the formatting context. While cells would still participate in the grid, the row itself loses:

- Its ability to receive `background-color`, `border`, `outline`, or any box-model styling.
- Its ability to be a hit-test target for pointer events (row click, row hover, row drag).
- Its ability to act as a `position: relative` container for absolutely positioned children (e.g., row action overlays).
- Proper representation in the accessibility tree on some browser/screen reader combinations.
- Its ability to use `position: sticky` for row pinning.

### 1.4.3 Cell Elements

Cells are grid items within their parent row's subgrid. Each cell occupies one column track by default.

```css
.cell {
  /* No explicit grid-column needed for default single-column cells */
  /* The cell auto-places into the next available track */
  min-width: 0;    /* Prevent content from stretching the track beyond its defined size */
  overflow: hidden; /* Clip content that exceeds cell bounds */
}
```

For cells that span multiple columns (see F-01, multi-level headers):

```css
.cell--spanning {
  grid-column: var(--ch-tabular-grid-column__column-start)
               / span var(--ch-tabular-grid-column__column-span, 1);
}
```

### 1.4.4 Existing Custom Properties

The following CSS custom properties are defined by the `ch-tabular-grid-column` component for column header cell positioning:

| Custom property | Default | Purpose |
|----------------|---------|---------|
| `--ch-tabular-grid-column__column-span` | `span 1` | Number of column tracks the header spans |
| `--ch-tabular-grid-column__column-start` | `initial` | Explicit start track (for non-sequential placement) |
| `--ch-tabular-grid-column__row-span` | `span 1` | Number of row tracks the header spans (multi-level) |

These properties are set by the `ChTabularGridColumn` component via inline styles when `colSpan`, `colStart`, or `rowSpan` model properties differ from their defaults. Data cells SHOULD use the same custom property pattern for consistency.

---

## 1.5 Multi-Level Headers

Multi-level (grouped) column headers require multiple header rows where some cells span multiple columns and/or multiple rows.

### 1.5.1 DOM Structure

```
div.rowgroup[role="rowgroup"]           ← header rowgroup (subgrid)
  div.column-row                        ← visual grouping wrapper (display: contents)
    ch-tabular-grid-column              ← "Region" spans columns 1-3, rows 1-2
    ch-tabular-grid-column              ← "Metrics" spans columns 4-6, row 1 only
  div.column-row                        ← second header level
    ch-tabular-grid-column              ← "Country" column 1
    ch-tabular-grid-column              ← "State" column 2
    ch-tabular-grid-column              ← "City" column 3
    ch-tabular-grid-column              ← "Population" column 4
    ch-tabular-grid-column              ← "Area" column 5
    ch-tabular-grid-column              ← "Density" column 6
```

### 1.5.2 The `column-row` Exception

The `.column-row` wrapper uses `display: contents` because it is a **visual grouping element**, not a semantic row. It exists solely to group column headers rendered within a single `repeat()` iteration in the template. Since column headers are placed using explicit `grid-column` and `grid-row` positions (via custom properties), the wrapper does not need a box of its own.

This is NOT a violation of the "no `display: contents` on rows" constraint (1.4.2), because `.column-row` is not a row -- it carries no `role="row"` and represents no data record. The actual semantic rows in the header are the `role="row"` elements that wrap `role="columnheader"` cells.

> **Implementation note:** The current Chameleon 7 code uses `display: contents` on `.column-row`. This is acceptable. If future requirements demand row-level styling on header row groups (e.g., a bottom border per header level), the structure SHOULD be refactored to use real row elements with subgrid instead.

### 1.5.3 Spanning Mechanics

Column headers in a multi-level configuration use these custom properties to position themselves:

```css
/* Example: "Region" header spanning columns 1-3 across 2 row levels */
ch-tabular-grid-column {
  --ch-tabular-grid-column__column-start: 1;
  --ch-tabular-grid-column__column-span: span 3;
  --ch-tabular-grid-column__row-span: span 2;
}
```

The JavaScript component sets these via inline style when the model specifies non-default `colSpan`, `colStart`, or `rowSpan` values:

```js
// From ChTabularGridColumn.#setColumnPosition()
if (colSpan !== 1) {
  styles = `${COLUMN_SPAN_CUSTOM_VAR}: span ${colSpan}`;
}
if (colStart !== undefined) {
  styles += `${COLUMN_START_CUSTOM_VAR}: ${colStart}`;
}
if (rowSpan !== 1) {
  styles += `${ROW_SPAN_CUSTOM_VAR}: span ${rowSpan};`;
}
```

### 1.5.4 Column Model Representation

The column model supports two forms:

- **Single-level:** `TabularGridColumnsSingleLevelModel` -- a flat array of column items. Renders as one header row.
- **Multi-level:** `TabularGridColumnsMultiLevelModel` -- an array of arrays, where each inner array represents one header level. Renders as N header rows.

The render component auto-detects the form:

```ts
const isSingleLevelModel = (columnsModel: TabularGridColumnsModel):
  columnsModel is TabularGridColumnsSingleLevelModel =>
    !Array.isArray(columnsModel[0]);
```

A single-level model is wrapped into `[columns]` to normalize to the multi-level form before rendering.

---

## 1.6 Additional Header Rows (Filter Row, Aggregate Row)

### 1.6.1 Filter Row

A filter row is an additional row rendered inside the header rowgroup, below the column headers. It MUST use the same subgrid pattern as data rows:

```css
.filter-row {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
}
```

Because the filter row inherits the same column tracks via subgrid, filter inputs automatically align with their corresponding column headers and data cells. No additional width synchronization is required.

### 1.6.2 Aggregate/Summary Rows

Summary rows (totals, averages) appearing at the top or bottom of the grid body MUST also use subgrid. They are structurally identical to data rows and inherit column alignment automatically.

### 1.6.3 Structural Impact on `grid-template-rows`

Each additional header row adds an implicit row to the header region. Because the header region uses `max-content` sizing, additional rows expand the header naturally without affecting the `1fr` body region.

```
grid-template-rows: max-content 1fr;

Header region (max-content):
  ├── Column header row 1    ← auto-sized
  ├── Column header row 2    ← auto-sized (multi-level)
  └── Filter row             ← auto-sized

Body region (1fr):
  └── Scrollable area with data rows
```

---

## 1.7 Frozen (Pinned) Columns

### 1.7.1 Approach: `position: sticky` Within Subgrid

Frozen columns MUST NOT use separate DOM containers (e.g., a left-pinned grid and a scrollable center grid). Such an approach requires manual width synchronization between containers and breaks the subgrid model.

Instead, frozen columns use `position: sticky` on their cells:

```css
.cell--frozen-start {
  position: sticky;
  left: 0;                          /* Or computed offset for non-first frozen columns */
  z-index: var(--frozen-column-z, 2);
  background: inherit;              /* Prevent see-through on scroll */
}

.cell--frozen-end {
  position: sticky;
  right: 0;
  z-index: var(--frozen-column-z, 2);
  background: inherit;
}
```

### 1.7.2 Offset Calculation for Multiple Frozen Columns

When multiple columns are frozen to the start, each subsequent frozen column's `left` offset MUST equal the sum of all preceding frozen columns' widths. This offset MUST be maintained via CSS custom properties updated by JavaScript:

```css
.cell[data-frozen-start="0"] { left: 0; }
.cell[data-frozen-start="1"] { left: var(--frozen-offset-1, 0px); }
.cell[data-frozen-start="2"] { left: var(--frozen-offset-2, 0px); }
```

JavaScript computes the cumulative offsets:

```js
let offset = 0;
for (const col of frozenStartColumns) {
  host.style.setProperty(`--frozen-offset-${col.index}`, `${offset}px`);
  offset += col.computedWidth;
}
```

### 1.7.3 Scroll Container Requirement

For `position: sticky` to function, the body rowgroup (`.body`) MUST have `overflow: auto` (or `overflow-x: auto`). This makes it the scroll container that sticky cells anchor to.

```css
.body {
  overflow: auto;
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
}
```

### 1.7.4 Frozen Header Cells

Header cells in frozen columns MUST also be sticky. They are doubly sticky: sticky vertically (header stays at top) and sticky horizontally (frozen column stays at left/right). The `z-index` for frozen header cells MUST be higher than both regular header cells and regular frozen cells:

```css
.columnheader--frozen {
  position: sticky;
  left: 0;                                  /* Or computed offset */
  z-index: var(--frozen-header-z, 3);       /* Above both frozen body cells and regular headers */
}
```

### 1.7.5 Constraints

- Frozen columns MUST remain part of the same grid context as non-frozen columns. They MUST NOT be in a separate container.
- The frozen column `background` MUST be opaque (not transparent) to prevent non-frozen content from showing through during horizontal scroll.
- When a column is frozen/unfrozen at runtime, only the `position`, `left`/`right`, `z-index`, and `background` properties change. The column's track position in `grid-template-columns` does NOT change.
- The shadow or visual separator between frozen and scrollable regions SHOULD be implemented with `box-shadow` or a pseudo-element on the last frozen cell, not with a separate DOM element.

---

## 1.8 Frozen (Pinned) Rows

### 1.8.1 Approach

Frozen rows (pinned to top or bottom of the scrollable body) use `position: sticky` with `top: 0` or `bottom: 0` within the body scroll container.

```css
.row--pinned-top {
  position: sticky;
  top: 0;
  z-index: var(--frozen-row-z, 1);
}

.row--pinned-bottom {
  position: sticky;
  bottom: 0;
  z-index: var(--frozen-row-z, 1);
}
```

### 1.8.2 Combined Frozen Row + Frozen Column

A cell that is both in a frozen row and a frozen column requires the highest `z-index` in the grid:

| Cell type | z-index tier |
|-----------|-------------|
| Regular cell | 0 (auto) |
| Frozen row cell | 1 |
| Frozen column cell | 2 |
| Frozen header cell | 3 |
| Frozen row + frozen column cell | 4 |

These values are indicative; the exact values SHOULD be controlled by CSS custom properties to allow theme customization.

---

## 1.9 Virtualization and Subgrid

### 1.9.1 Overview

Virtualization (rendering only visible rows/columns in the DOM) is essential for large datasets. The key challenge is maintaining subgrid column alignment when rows are dynamically added and removed from the DOM.

### 1.9.2 Body Container as Subgrid Scroll Area

The body rowgroup MUST be a subgrid container with `overflow: auto`:

```css
.body {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
  overflow: auto;
}
```

Virtualized rows are rendered inside this container. Because each row uses `grid-template-columns: subgrid` and `grid-column: 1 / -1`, newly rendered rows automatically inherit the correct column tracks regardless of when they enter the DOM.

### 1.9.3 Row Virtualization Strategy

Row virtualization renders only the rows visible in the viewport plus a configurable overscan buffer. The virtual scroller manages:

1. **A spacer element** (or padding) before the first rendered row, representing the total height of rows above the viewport.
2. **The rendered rows** in the visible window.
3. **A spacer element** (or padding) after the last rendered row, representing the total height of rows below the viewport.

```
.body (overflow: auto, subgrid)
  div.spacer-top        ← height = sum of row heights above viewport
  div.row               ← first visible row (subgrid)
  div.row               ← ...
  div.row               ← last visible row (subgrid)
  div.spacer-bottom     ← height = sum of row heights below viewport
```

The spacer elements MUST NOT interfere with the subgrid. They SHOULD use `grid-column: 1 / -1` and a fixed height, but MUST NOT declare `grid-template-columns: subgrid` (they have no cell children).

### 1.9.4 Column Virtualization

Column virtualization hides off-screen columns by collapsing their tracks to `0px` (the same mechanism as column hiding, see 1.3.4). This is simpler than DOM removal because:

- The column track still exists in `grid-template-columns`, preserving all grid-column indices.
- Subgrid alignment is unaffected.
- Cell elements for hidden columns MAY be omitted from the DOM entirely (since their track is 0px), or MAY be rendered with `visibility: hidden`.

> **Constraint:** Column virtualization MUST NOT remove tracks from `grid-template-columns`. It MUST only set tracks to `0px`.

### 1.9.5 Virtualization and Frozen Columns

Frozen columns MUST be exempt from column virtualization. Their track size MUST always reflect their actual width, and their cells MUST always be present in the DOM, regardless of the horizontal scroll position.

### 1.9.6 Virtualization and Focus Management

When a focused cell is virtualized out of the DOM, the grid MUST preserve focus state logically and restore it when the row is re-rendered. See FD-04 for the complete focus management strategy under virtualization.

---

## 1.10 Row Height Strategies

### 1.10.1 Fixed Row Height

All rows have the same predetermined height. This is the highest-performance option for virtualization because total scroll height = row count x row height.

```css
.row {
  height: var(--ch-tabular-grid-row-height, 40px);
}
```

### 1.10.2 Auto Row Height (`max-content`)

Rows size to fit their tallest cell. This is the CSS default when no explicit height is set on the row.

Under subgrid, each row is an independent grid formatting context with `grid-template-columns: subgrid`. The row's height is determined by the tallest cell within it -- this is standard CSS grid behavior and requires no JavaScript.

**Trade-off:** Auto row heights complicate virtualization because the virtual scroller cannot know a row's height until it is rendered. Strategies to mitigate this:

- **Estimate-then-measure:** Render rows with an estimated height, measure after paint, and adjust the spacers. This causes a brief layout shift.
- **Pre-measure in a hidden container:** Render rows off-screen, measure, cache heights, then render in the viewport. This adds latency.
- **Hybrid:** Use a fixed estimate for initial render, then cache measured heights as rows scroll through the viewport.

### 1.10.3 Variable Row Height (Per-Row)

Each row has an individually specified height (e.g., from the data model). This is functionally similar to fixed row height for virtualization (heights are known upfront), but the virtual scroller must maintain a height array or cumulative offset index instead of a simple multiplication.

```css
.row {
  height: var(--row-height);  /* Set per-row via inline style */
}
```

### 1.10.4 Row Height and Subgrid Interaction

Because rows use `display: grid; grid-template-columns: subgrid`, the row's height does NOT affect column track sizing. Subgrid only inherits column tracks from the parent, not row tracks. Each row's height is independent.

This is a key advantage of the subgrid model: row height flexibility does not compromise column alignment.

---

## 1.11 Scrolling Architecture

### 1.11.1 Scroll Container

The body rowgroup (`.body`) is the primary scroll container. It MUST have `overflow: auto` to enable both horizontal and vertical scrolling when content exceeds the grid's bounds.

```css
.body {
  overflow: auto;
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
}
```

### 1.11.2 Header Scroll Synchronization

The header rowgroup does NOT scroll vertically (it is `max-content` in the host grid and sits above the scrollable body). However, it MUST scroll horizontally in sync with the body.

Two approaches:

**Approach A -- Shared horizontal overflow (preferred):**
If both header and body are subgrid children of the host, and the host itself has `overflow-x: auto`, horizontal scroll applies to the entire host. This naturally synchronizes header and body horizontal scroll.

**Approach B -- JavaScript sync:**
If the body alone scrolls (body has `overflow: auto`, host does not), JavaScript MUST listen to the body's `scroll` event and apply a `transform: translateX(-scrollLeft)` to the header rowgroup.

Approach A is preferred because it requires no JavaScript and avoids scroll desynchronization.

### 1.11.3 Scroll and Sticky Interaction

For `position: sticky` to work on frozen columns, the sticky cells must be within a scroll container. The `.body` element serves this role for body cells. For header cells, the scroll container is either the host (Approach A) or requires the header to also be within a scrollable container.

---

## 1.12 Gantt Chart Dual-Region Layout

The Gantt Chart variant extends the base layout with a timeline region to the right of the data grid columns.

### 1.12.1 Extended Track Layout

```css
:host([variant="gantt"]) {
  grid-template-columns:
    /* Data columns */
    var(--col-1-size) var(--col-2-size) var(--col-3-size)
    /* Divider */
    var(--gantt-divider-size, 4px)
    /* Timeline region: single track that contains the bar canvas */
    1fr;
}
```

The timeline region occupies the last column track. Timeline bars inside each row are positioned absolutely within that cell, or via a nested grid/flexbox inside the timeline cell.

### 1.12.2 Divider

A resizable divider between the data columns and the timeline region is a regular grid track whose size the user can drag. The divider track width determines the split point. The data columns to the left and the `1fr` timeline track to the right adjust accordingly.

### 1.12.3 Subgrid Compatibility

The data-side cells use subgrid as normal. The timeline cell in each row spans only the timeline track and does not participate in subgrid alignment with data cells. This is correct because timeline content (bars, dependencies) follows its own positioning model (absolute or a nested timeline grid).

---

## 1.13 Summary of Hard Constraints

These constraints are non-negotiable. Any feature specification that conflicts with them MUST be revised.

| ID | Constraint | Rationale |
|----|-----------|-----------|
| LC-01 | Row elements MUST NOT use `display: contents` | Preserves row box model, hit-testing, styling, accessibility |
| LC-02 | Column widths MUST be defined solely via `grid-template-columns` on the host | Single source of truth; prevents JS/CSS layout conflicts |
| LC-03 | Row elements MUST use `display: grid; grid-template-columns: subgrid; grid-column: 1 / -1` | Ensures column alignment across all rows |
| LC-04 | Frozen columns MUST use `position: sticky`, not separate containers | Preserves subgrid alignment and simplifies DOM |
| LC-05 | Column hiding MUST set the track to `0px`, not remove the track | Preserves grid-column indices and subgrid alignment |
| LC-06 | Column reorder MUST NOT move DOM elements | Preserves accessibility tree order; visual order via CSS |
| LC-07 | Column virtualization MUST NOT remove tracks from `grid-template-columns` | Preserves grid-column indices and subgrid alignment |
| LC-08 | JavaScript MUST NOT measure/set pixel widths on individual cells | CSS grid handles sizing; JS only updates track definitions |
| LC-09 | Frozen columns MUST be exempt from column virtualization | Frozen cells must always be visible |
| LC-10 | The `.column-row` wrapper MAY use `display: contents` as it is a visual grouping aid, not a semantic row | Exception to LC-01; no role="row", no data record |

---

## 1.14 Browser Support Considerations

### 1.14.1 Subgrid Support

CSS `subgrid` is supported in all evergreen browsers (Chrome 117+, Firefox 71+, Safari 16+, Edge 117+). For environments requiring broader support, a fallback SHOULD be documented but is outside the scope of this specification.

### 1.14.2 Sticky Within Subgrid

`position: sticky` within a subgrid child is supported in the same browser versions that support subgrid. No additional polyfills are required.

---

## 1.15 Cross-References

| Topic | Reference |
|-------|-----------|
| Multi-level header features | F-01 (Data Display & Rendering) |
| Column resize, reorder, hide, freeze features | F-09 (Column Management) |
| Virtualization features | F-11 (Virtualization & Performance) |
| Frozen row features | F-10 (Row Management) |
| Keyboard navigation in subgrid context | F-14 (Keyboard Navigation) |
| Focus management under virtualization | FD-04 (Accessibility Foundation) |
| Row height / density settings | F-15 (Theming & Styling) |
| Filter row | F-03 (Filtering) |
| Gantt Chart variant | VS-01 (Gantt Chart) |
| Pivot Table multi-axis headers | VS-02 (Pivot Table) |
| Tree Grid indentation within cells | VS-03 (Tree Grid) |
