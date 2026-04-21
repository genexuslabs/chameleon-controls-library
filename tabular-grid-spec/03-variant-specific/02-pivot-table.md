# VS-02: Pivot Table — ARIA Structure & Accessibility Model

> **Part of**: [Tabular Grid Specification](../README.md)
> **Variant**: Pivot Table
> **Scope**: ARIA structural model for multi-axis headers, header-to-cell association, drill-down semantics, screen reader announcement patterns

## Overview
The Pivot Table variant uses `role="grid"` with `aria-roledescription="pivot table"`. Its unique accessibility challenge is the multi-level column and row header hierarchy: cells must be associated with multiple header levels (both row and column axes), and the structure changes dynamically as users reconfigure pivot dimensions.

The baseline Data Grid ARIA structure is defined in [FD-04: Accessibility Foundation](../01-foundations/04-accessibility-foundation.md). This file specifies ONLY what changes or extends that baseline for the Pivot Table variant.

> **Feature coverage**: Pivot-specific features (pivot mode, dimension config, field selector, dynamic reconfiguration) are specified in [F-05: Pivoting](../02-features/05-pivoting.md).

---

## 1. Container Role

The pivot table grid container requires a specific combination of ARIA attributes to correctly identify the widget type and communicate structural metadata to assistive technologies.

### 1.1 Role and Description

The outermost grid container MUST carry:

```html
<div
  role="grid"
  aria-roledescription="pivot table"
  aria-label="Sales by Region and Quarter"
  aria-rowcount="5"
  aria-colcount="5"
>
```

- `role="grid"` establishes the interactive grid widget pattern, enabling keyboard navigation per the ARIA grid pattern.
- `aria-roledescription="pivot table"` overrides the default "grid" announcement with a more descriptive widget name. Screen readers announce this when the user enters the widget (e.g., NVDA: "pivot table").
- `aria-label` or `aria-labelledby` is REQUIRED and MUST describe the subject of the pivot analysis (e.g., "Sales by Region and Quarter"). If a visible title element exists, use `aria-labelledby` referencing its `id`.
- `aria-rowcount` and `aria-colcount` reflect the total logical row and column counts including all header rows.

### 1.2 Loading and Busy State

During pivot reconfiguration — the interval between a dimension change being committed and the new column/row structure being fully rendered — the container MUST set:

```html
<div role="grid" aria-roledescription="pivot table" aria-busy="true" ...>
```

`aria-busy="true"` signals to assistive technologies that the widget content is in flux and should not be read. The attribute MUST be removed (or set to `"false"`) once the new structure is fully in the DOM and the virtual scroller has rendered the first visible rows.

### 1.3 Completion Announcement

A dedicated ARIA live region (separate from the grid container) announces structural changes after reconfiguration completes:

```html
<div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
  <!-- Updated by JavaScript after pivot reconfiguration -->
  Pivot table updated: 24 rows, 7 columns.
</div>
```

- `role="status"` is equivalent to `aria-live="polite"` with `aria-atomic="true"`.
- The message text MUST include the new row and column counts.
- The live region element MUST exist in the DOM before the first reconfiguration (empty content is fine); inserting it dynamically is not reliable across all screen readers.

---

## 2. Multi-Level Column Header Structure

The most distinctive structural feature of the Pivot Table variant is multiple stacked header rows representing different levels of the column axis hierarchy.

### 2.1 Column Header Rows

A pivot table with N column dimension levels produces N header rows stacked above the data. All header rows reside inside the same `role="rowgroup"` element:

```
rowgroup (thead equivalent)
  row[aria-rowindex="1"]   ← outermost column dimension (e.g., Year)
  row[aria-rowindex="2"]   ← next column dimension level (e.g., Quarter)
  row[aria-rowindex="3"]   ← innermost column dimension or value labels
```

Rules:
- Every header row MUST carry `role="row"` and `aria-rowindex` starting from 1.
- `aria-rowindex` values MUST be contiguous and must account for all rows including header rows. Data rows continue the sequence after the last header row.
- Header cells that span multiple adjacent columns MUST use `aria-colspan` with the integer count of columns spanned.
- Header cells that span multiple stacked rows (e.g., a row dimension label that occupies all N header rows) MUST use `aria-rowspan` with the integer count of rows spanned.

### 2.2 Header Cell Roles

| Cell position | `role` | Notes |
|---|---|---|
| Column dimension header | `columnheader` | Any cell in a header row that labels a column group or individual column |
| Row dimension label (header area) | `columnheader` | In header rows, leftmost cells labeling the row axis use `columnheader` because they appear in header rows |
| Row dimension value (data rows) | `rowheader` | In data rows, cells in the leftmost column(s) carrying row dimension values use `rowheader` |
| Value / measure cell | `gridcell` | All non-header cells in data rows |
| Grand Total column header | `columnheader` | Accessible name MUST be "Grand Total" |
| Sub-total column header | `columnheader` | Accessible name MUST be "[dimension value] Total" (e.g., "2024 Total") |

### 2.3 Complete Annotated HTML Example

The following example models a pivot table with:
- **Row dimension**: Region (North America, Europe)
- **Column dimension**: Year (2024) → Quarter (Q1, Q2)
- **Value**: Sum of Sales
- **Grand Total** column on the right

```html
<!--
  aria-rowcount="5": 2 header rows + 2 data rows + 1 grand total row
  aria-colcount="5": 1 row-header col + Q1 + Q2 + (2024 Total) + Grand Total
  Note: aria-colcount="5" here includes the sub-total column; adjust for actual config.
-->
<div
  role="grid"
  aria-roledescription="pivot table"
  aria-label="Sales by Region and Quarter"
  aria-rowcount="5"
  aria-colcount="5"
>
  <!-- ═══════════════════════════════════════════════════════
       HEADER ROWGROUP
       ═══════════════════════════════════════════════════════ -->
  <div role="rowgroup">

    <!-- Header row 1: Year level (outermost column dimension) -->
    <div role="row" aria-rowindex="1">

      <!--
        Row dimension label — spans 2 header rows because there are 2 column levels.
        Uses role="columnheader" because it lives in a header row.
        id="col-region" is referenced by data-row rowheader cells via `headers`.
      -->
      <div
        role="columnheader"
        id="col-region"
        aria-colindex="1"
        aria-rowspan="2"
      >
        Region
      </div>

      <!--
        Year group header — spans Q1, Q2, and 2024 Total columns (aria-colspan="3").
        id="col-2024" is used by lower-level quarter cells and data cells.
      -->
      <div
        role="columnheader"
        id="col-2024"
        aria-colindex="2"
        aria-colspan="3"
      >
        2024
      </div>

      <!--
        Grand Total column header — spans 2 header rows (no sub-level needed).
        aria-colindex="5" because Q1=2, Q2=3, 2024-Total=4 (if present), Grand Total=5.
        Adjust aria-colindex to match actual column count.
      -->
      <div
        role="columnheader"
        id="col-grand-total"
        aria-colindex="5"
        aria-rowspan="2"
      >
        Grand Total
      </div>
    </div>

    <!-- Header row 2: Quarter level (innermost column dimension) -->
    <div role="row" aria-rowindex="2">

      <!--
        "Region" columnheader spans rows 1–2; it is NOT repeated here.
        "Grand Total" columnheader spans rows 1–2; it is NOT repeated here.
        Only the leaf-level quarter headers appear in this row.
      -->

      <!--
        Q1 header. aria-sort indicates sortability by this column.
        id="col-q1" is referenced by data cells via the `headers` attribute.
      -->
      <div
        role="columnheader"
        id="col-q1"
        aria-colindex="2"
        aria-sort="none"
      >
        Q1
      </div>

      <!-- Q2 header. -->
      <div
        role="columnheader"
        id="col-q2"
        aria-colindex="3"
        aria-sort="none"
      >
        Q2
      </div>

      <!-- 2024 Total sub-total header. -->
      <div
        role="columnheader"
        id="col-2024-total"
        aria-colindex="4"
        aria-sort="none"
      >
        2024 Total
      </div>
    </div>

  </div><!-- /rowgroup (headers) -->

  <!-- ═══════════════════════════════════════════════════════
       DATA ROWGROUP
       ═══════════════════════════════════════════════════════ -->
  <div role="rowgroup">

    <!-- Data row: North America -->
    <div role="row" aria-rowindex="3">

      <!--
        Row dimension value — role="rowheader" because this is a data row.
        headers="col-region" links this cell to the column axis label.
        id="row-na" is referenced by data cells in this row.
      -->
      <div
        role="rowheader"
        id="row-na"
        aria-colindex="1"
        headers="col-region"
      >
        North America
      </div>

      <!--
        Value cell for North America × Q1 × 2024.
        headers="row-na col-2024 col-q1" gives full context:
          "North America, 2024, Q1: $1,200"
      -->
      <div
        role="gridcell"
        aria-colindex="2"
        headers="row-na col-2024 col-q1"
      >
        $1,200
      </div>

      <!-- North America × Q2 × 2024 -->
      <div
        role="gridcell"
        aria-colindex="3"
        headers="row-na col-2024 col-q2"
      >
        $1,450
      </div>

      <!-- North America × 2024 Total (sub-total) -->
      <div
        role="gridcell"
        aria-colindex="4"
        headers="row-na col-2024 col-2024-total"
      >
        $2,650
      </div>

      <!-- North America Grand Total -->
      <div
        role="gridcell"
        aria-colindex="5"
        headers="row-na col-grand-total"
      >
        $2,650
      </div>
    </div>

    <!-- Data row: Europe -->
    <div role="row" aria-rowindex="4">
      <div
        role="rowheader"
        id="row-eu"
        aria-colindex="1"
        headers="col-region"
      >
        Europe
      </div>
      <div role="gridcell" aria-colindex="2" headers="row-eu col-2024 col-q1">$980</div>
      <div role="gridcell" aria-colindex="3" headers="row-eu col-2024 col-q2">$1,100</div>
      <div role="gridcell" aria-colindex="4" headers="row-eu col-2024 col-2024-total">$2,080</div>
      <div role="gridcell" aria-colindex="5" headers="row-eu col-grand-total">$2,080</div>
    </div>

    <!-- Grand Total row -->
    <div role="row" aria-rowindex="5">
      <div
        role="rowheader"
        id="row-grand-total"
        aria-colindex="1"
        headers="col-region"
      >
        Grand Total
      </div>
      <div role="gridcell" aria-colindex="2" headers="row-grand-total col-2024 col-q1">$2,180</div>
      <div role="gridcell" aria-colindex="3" headers="row-grand-total col-2024 col-q2">$2,550</div>
      <div role="gridcell" aria-colindex="4" headers="row-grand-total col-2024 col-2024-total">$4,730</div>
      <div role="gridcell" aria-colindex="5" headers="row-grand-total col-grand-total">$4,730</div>
    </div>

  </div><!-- /rowgroup (data) -->
</div><!-- /grid -->
```

---

## 3. Row Dimension Headers (Multi-Level Row Axis)

When the pivot has multiple row dimensions (e.g., Region → Country → City), the row axis forms a nested hierarchy analogous to a tree grid.

### 3.1 Multi-Level Row Dimension Layout

Each level of the row hierarchy occupies its own leftmost column(s). The nesting is represented positionally:

```
Col 1: Region       Col 2: Country     Col 3: City
─────────────────────────────────────────────────
North America       [empty]            [empty]
                    United States      [empty]
                                       New York
                                       Los Angeles
                    Canada             [empty]
                                       Toronto
Europe              ...
```

Rules:
- Each level MUST use `role="rowheader"` in data rows.
- Parent-level row header cells that visually span child rows (merged cell appearance) MUST use `aria-rowspan` with the count of logical rows they cover.
- If the implementation uses separate row entries per leaf node rather than merged cells, the parent-level headers are NOT repeated — only the leaf rows exist, and breadcrumb context is provided by the `headers` attribute chain.

### 3.2 Expandable Row Dimension Headers

Row dimension headers that can be drilled down (expanded to reveal sub-dimensions) MUST carry `aria-expanded`:

```html
<!-- Region header: currently expanded, showing country-level children -->
<div
  role="rowheader"
  id="row-na"
  aria-colindex="1"
  aria-expanded="true"
  tabindex="0"
>
  North America
</div>

<!-- Region header: collapsed, children not rendered -->
<div
  role="rowheader"
  id="row-eu"
  aria-colindex="1"
  aria-expanded="false"
  tabindex="-1"
>
  Europe
</div>
```

- `aria-expanded="true"`: children are currently visible.
- `aria-expanded="false"`: children exist but are hidden/not rendered.
- Row dimension headers with no sub-dimension (leaf nodes) MUST NOT carry `aria-expanded`.
- The `Enter` or `Space` key on an `aria-expanded` row header triggers expand/collapse (see Section 6).

### 3.3 Nesting Depth Indication

When nesting depth is relevant (e.g., for visual indentation levels), the implementation MAY add `aria-level` to row header cells. However, because `role="rowheader"` does not support `aria-level` in all browser/AT combinations, a visible text prefix (e.g., em-dash indentation) or `aria-label` that includes the dimension level name is more reliable:

```html
<!-- Explicit label includes dimension context -->
<div role="rowheader" aria-label="Country: United States" aria-colindex="2">
  United States
</div>
```

---

## 4. Header-to-Cell Association

The core accessibility challenge of pivot tables is ensuring that a screen reader user understands which row and column dimensions describe any given value cell. Two strategies are available.

### 4.1 Implicit Association (Default)

Screen readers infer header associations from DOM position: the cell's row provides the row header, and the cell's column provides the column header. For a simple 2-axis pivot where column headers span only one row, implicit association is adequate.

**Limitations**:
- When column headers span multiple rows (stacked year → quarter headers), most screen readers announce only the innermost (leaf) column header, omitting the year-level context.
- The cell "Q1 $1,200" is announced without "2024", losing the year context.

**Use when**: The pivot has exactly one column dimension level (no stacked headers), and one row dimension level.

### 4.2 Explicit Association via `headers` Attribute

Each `role="gridcell"` carries a `headers` attribute containing space-separated `id` values of all associated `role="columnheader"` and `role="rowheader"` elements, listed from outermost to innermost:

```html
<!-- Full association chain: row header, then column headers outermost → innermost -->
<div
  role="gridcell"
  aria-colindex="2"
  headers="row-na col-2024 col-q1"
>
  $1,200
</div>
```

The `id` order convention is: **row headers first (outer to inner), then column headers (outer to inner)**. This mirrors the natural reading order a screen reader uses to announce cell context.

**Required when**:
- The pivot has 2 or more column dimension levels (stacked column headers with `aria-colspan`).
- The pivot has 2 or more row dimension levels.
- Either axis uses spanning cells (`aria-colspan` > 1 or `aria-rowspan` > 1).

**Performance note**: The `headers` attribute creates O(cells × header-levels) ID lookups in the accessibility tree. For typical pivot table sizes (hundreds to low thousands of visible cells), this is acceptable. If the pivot renders tens of thousands of simultaneous cells (e.g., in a non-virtualized layout), consider limiting explicit association to visible cells only and updating on scroll.

### 4.3 Screen Reader Announcement Pattern

The target screen reader announcement for a value cell with full explicit association is:

> "[Row dimension N] ... [Row dimension 1], [Column dimension 1] ... [Column dimension N], [cell value]"

Example with the model from Section 2.3:

> "North America, 2024, Q1: $1,200"

The exact announcement order varies by screen reader (NVDA, JAWS, VoiceOver) and is influenced by the `headers` attribute id order. Testing with the target screen readers during development is required to validate announcement quality.

### 4.4 Keyboard Shortcut for Header Context

Some screen readers provide keyboard shortcuts that read all headers associated with the current cell while in table-reading mode. These are not ARIA requirements but should be documented in user-facing help for the pivot component:

| Shortcut | Screen reader | Action |
|---|---|---|
| `Ctrl+Alt+Up` | NVDA (browse mode) | Read all column headers above current cell |
| `Ctrl+Alt+Left` | NVDA (browse mode) | Read all row headers to the left of current cell |
| `Insert+Shift+Up` | JAWS | Read current row header |
| `Insert+Shift+Left` | JAWS | Read current column header |

These shortcuts function in browse/virtual cursor mode. When the user is in application mode (navigating within the `role="grid"`), standard grid navigation keys apply instead.

---

## 5. Grand Totals and Sub-Totals

### 5.1 Grand Total Column and Row

The Grand Total column header MUST have an accessible name of exactly "Grand Total":

```html
<div role="columnheader" id="col-grand-total" aria-colindex="5" aria-rowspan="2">
  Grand Total
</div>
```

The Grand Total row header MUST similarly use "Grand Total" as its accessible name:

```html
<div role="rowheader" id="row-grand-total" aria-colindex="1">
  Grand Total
</div>
```

Value cells in the Grand Total row or column use `role="gridcell"` with no special role change. Context is provided by the `headers` attribute chain.

### 5.2 Sub-Total Rows and Columns

Sub-total row headers (aggregating child rows for a given dimension value) MUST use the pattern "[dimension value] Total":

```html
<!-- Sub-total row for the North America dimension group -->
<div role="rowheader" id="row-na-total" aria-colindex="1">
  North America Total
</div>
```

Sub-total column headers use the same pattern:

```html
<div role="columnheader" id="col-2024-total" aria-colindex="4">
  2024 Total
</div>
```

The `aria-roledescription="subtotal"` attribute on sub-total row or column headers is optional. It provides additional semantic context when screen reader users navigate by role:

```html
<div
  role="rowheader"
  aria-roledescription="subtotal"
  id="row-na-total"
  aria-colindex="1"
>
  North America Total
</div>
```

### 5.3 Visual Differentiation

Grand total and sub-total rows and columns are typically rendered with distinct styling (background color, bold text, border). Per WCAG 1.4.1 (Use of Color), visual differentiation MUST NOT rely solely on color. Acceptable differentiation methods:

- Bold font weight for total cell text content.
- A visible border separating the total row/column from regular data rows/columns.
- A text label suffix such as "Total" in the cell content itself (already required per 5.1 and 5.2).

---

## 6. Drill-Down / Roll-Up Semantics

### 6.1 Expand and Collapse

Row dimension headers that have expandable sub-dimensions use `aria-expanded` (defined in Section 3.2). The interaction model:

| User action | Result |
|---|---|
| `Enter` or `Space` on a collapsed row header | Expand: load child rows, set `aria-expanded="true"` |
| `Enter` or `Space` on an expanded row header | Collapse: remove child rows from DOM, set `aria-expanded="false"` |
| Click on expand icon | Same as `Enter`/`Space` |

### 6.2 Loading State During Drill-Down

While child rows are being fetched or computed:

1. Set `aria-busy="true"` on the expanding row element.
2. Optionally render a loading indicator row with `role="row"` and `aria-label="Loading..."`.
3. When complete: set `aria-busy="false"` (or remove the attribute) on the row.
4. Update `aria-rowcount` on the grid container to reflect the new total row count.

```html
<!-- While loading children for North America -->
<div role="row" aria-rowindex="3" aria-busy="true">
  <div role="rowheader" aria-colindex="1" aria-expanded="true">North America</div>
  ...
</div>
```

### 6.3 Screen Reader Announcements for Drill-Down

After expanding, the live region (Section 1.3) MUST announce:

> "North America expanded. 3 rows added."

After collapsing:

> "North America collapsed."

The message content MUST include the dimension value name so the user can identify which group changed, especially in long pivot tables where the original row may have scrolled out of view during the operation.

### 6.4 Focus Management During Drill-Down

Focus MUST remain on the row header cell that was activated during expand/collapse. It MUST NOT move to the first child row or to the grid container. This is consistent with the tree grid pattern (VS-03) and avoids disorienting focus jumps.

If the expanded row header scrolls out of view during virtualized rendering, the implementation MUST scroll it back into view before returning focus.

---

## 7. Dynamic Pivot Reconfiguration Accessibility

Pivot reconfiguration occurs when the user drags a field into or out of the row axis, column axis, or values area — or changes aggregation settings. The result is a structurally different grid (different column count, different header row count, different data layout).

### 7.1 Reconfiguration Sequence

The required ARIA state sequence during a reconfiguration:

1. **Before reconfiguration begins**: grid is in normal interactive state.
2. **Reconfiguration starts**: set `aria-busy="true"` on the grid container.
3. **DOM update**: remove old header and data rows; insert new header and data rows with updated `aria-rowindex`, `aria-colindex`, `aria-rowcount`, `aria-colcount` values.
4. **Reconfiguration complete**: set `aria-busy="false"` on the grid container.
5. **Announce**: update the live region text (Section 1.3) to "Pivot table updated. Now showing N rows and M columns."
6. **Focus**: move focus to the first data cell (first `role="gridcell"` in the first data row, i.e., the cell at `aria-rowindex` = [header row count + 1], `aria-colindex` = [row axis column count + 1]).

### 7.2 Empty Pivot State

When no fields are configured in the value area (or the row and column axes are both empty), the grid renders an empty state:

```html
<div
  role="grid"
  aria-roledescription="pivot table"
  aria-label="Empty pivot table. Add fields to build the view."
  aria-rowcount="0"
  aria-colcount="0"
>
  <!-- Empty state overlay visible to sighted users -->
  <div role="status" aria-live="polite">
    No data. Configure row dimensions, column dimensions, and at least one value field to build the pivot table.
  </div>
</div>
```

The `aria-label` on the container SHOULD describe the empty state so screen reader users understand the grid is intentionally empty rather than still loading.

### 7.3 Partial Configuration

When only row dimensions are configured (no column dimensions, or no value fields), the grid may render in a degraded but valid state. The live region MUST describe what is missing:

> "Pivot table requires at least one value field. Add a value field to see data."

---

## 8. `aria-sort` in Pivot Headers

Sorting behavior in pivot headers differs from the Data Grid variant because sorting a column dimension changes the ordering of column groups, not individual column values.

### 8.1 Column Dimension Header Sorting

If the pivot supports sorting columns by dimension value (e.g., sorting year groups alphabetically or chronologically):

```html
<div role="columnheader" id="col-2024" aria-colindex="2" aria-colspan="2" aria-sort="ascending">
  2024
</div>
```

`aria-sort` is applied to the dimension group header, not to the individual leaf column headers within that group. The leaf headers carry `aria-sort="none"` unless they themselves can be independently sorted.

### 8.2 Row Dimension Header Sorting

If the pivot supports sorting rows by a row dimension value:

```html
<div role="columnheader" id="col-region" aria-colindex="1" aria-rowspan="2" aria-sort="ascending">
  Region
</div>
```

Sorting by the Region dimension reorders the row groups. The `aria-sort` attribute is on the column header labeling the row axis, not on individual row header cells.

### 8.3 Value Header Sorting

Sorting by a value (e.g., "sort rows by Sum of Sales descending") applies `aria-sort` to the value column header:

```html
<div role="columnheader" id="col-q1" aria-colindex="2" aria-sort="descending">
  Q1
</div>
```

### 8.4 Sort Announcements

When the user activates a sort on a pivot header, the live region MUST announce:

> "Sorted by [dimension or value label] [ascending/descending]."

Example: "Sorted by Region ascending." or "Sorted by Q1 descending."

The sort announcement MUST be separate from structural change announcements (Section 1.3) and SHOULD use a distinct live region or update order to prevent message collisions.

---

## 9. Normative Requirements

The following requirements are normative for the Pivot Table variant. Each requirement is prefixed with `PT-` and cross-references the relevant ARIA specification or WCAG criterion where applicable.

| ID | Requirement | Priority |
|---|---|---|
| PT-01 | The grid container MUST carry `role="grid"` and `aria-roledescription="pivot table"`. | MUST |
| PT-02 | The grid container MUST carry `aria-label` or `aria-labelledby` identifying the subject of the pivot analysis. The label MUST be non-empty and descriptive. | MUST |
| PT-03 | `aria-busy="true"` MUST be set on the grid container when a pivot reconfiguration has been committed but the new DOM structure has not yet been fully rendered. `aria-busy` MUST be removed or set to `"false"` once rendering is complete. | MUST |
| PT-04 | A persistent `aria-live="polite"` region (or `role="status"`) MUST announce structural changes after pivot reconfiguration, including the new row count and column count. The region MUST be present in the DOM before the first reconfiguration. | MUST |
| PT-05 | All header rows MUST be enclosed in a `role="rowgroup"` element. Each header row MUST carry `role="row"` and a sequential `aria-rowindex` beginning at 1. | MUST |
| PT-06 | Header cells spanning multiple columns MUST carry `aria-colspan` equal to the number of columns spanned. Header cells spanning multiple rows MUST carry `aria-rowspan` equal to the number of rows spanned. | MUST |
| PT-07 | When the pivot has 2 or more column dimension levels (stacked column headers), each `role="gridcell"` in the data body MUST carry a `headers` attribute referencing the `id` values of all associated `role="rowheader"` and `role="columnheader"` elements, ordered from outermost to innermost axis level. | MUST |
| PT-08 | All `role="columnheader"` and `role="rowheader"` elements referenced by `headers` attributes MUST carry unique `id` attributes within the document. | MUST |
| PT-09 | Row dimension value cells in data rows MUST use `role="rowheader"`. Row dimension label cells in header rows MUST use `role="columnheader"`. | MUST |
| PT-10 | Value cells MUST use `role="gridcell"`. Grand total and sub-total value cells MUST also use `role="gridcell"` (no special role change). | MUST |
| PT-11 | The Grand Total column header accessible name MUST be "Grand Total". The Grand Total row header accessible name MUST be "Grand Total". | MUST |
| PT-12 | Sub-total column and row header accessible names MUST follow the pattern "[dimension value] Total" (e.g., "North America Total"). | MUST |
| PT-13 | Visual differentiation of grand total and sub-total rows/columns MUST NOT rely on color alone. At minimum, a text label (e.g., "Total") embedded in the cell content satisfies WCAG 1.4.1. | MUST |
| PT-14 | Row dimension headers with expandable sub-dimensions MUST carry `aria-expanded="false"` when collapsed and `aria-expanded="true"` when expanded. Leaf-node row headers MUST NOT carry `aria-expanded`. | MUST |
| PT-15 | `aria-busy="true"` MUST be set on an expanding row while its child rows are being loaded. The attribute MUST be removed once loading is complete. | MUST |
| PT-16 | After a row is expanded or collapsed, the live region MUST announce "[dimension value] expanded. N rows added." or "[dimension value] collapsed." respectively. | MUST |
| PT-17 | `aria-rowcount` on the grid container MUST be updated after drill-down expand or collapse to reflect the new total logical row count. | MUST |
| PT-18 | Focus MUST remain on the activated row header cell during and after expand/collapse operations. Focus MUST NOT move to child rows or to the grid container. | MUST |

---

*This file is part of the Chameleon 7 Tabular Grid Specification. See [README.md](../README.md) for the complete table of contents.*
