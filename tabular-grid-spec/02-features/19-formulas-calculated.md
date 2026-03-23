# F-19: Formulas & Calculated Columns

> **Part of**: [Tabular Grid Specification](../README.md)
> **Feature category**: Formulas & Calculated Columns
> **Variants**: Data Grid, Tree Grid, Pivot Table (not applicable to Gantt timeline)

## Overview
Calculated columns derive their values from expressions or functions over other columns in the same row. Full Excel-like formula support and a formula bar are planned as future features.

---

### 19.1 Computed / Derived Columns [P1]

**Description**: A column can derive its display value from a function applied to the row data rather than reading a named property directly. Computed columns are read-only by default; they become editable only when a `valueSetter` is provided. Computed values are recalculated automatically when source row data changes, and sorting or filtering on a computed column uses the computed value.

**Applies to**: Data Grid, Tree Grid, Pivot Table

**Use Cases**
- UC-1: A "Full Name" column concatenates `row.firstName` and `row.lastName` without storing the combined string in the data model.
- UC-2: A "Profit Margin" column computes `(row.revenue - row.cost) / row.revenue * 100` for each row and formats the result as a percentage.
- UC-3: A "Days Overdue" column calculates the difference between today's date and `row.dueDate`, producing a derived integer.
- UC-4: A "Tax Amount" column chains off a "Subtotal" computed column: `computedSubtotal * row.taxRate`.
- UC-5: A "Status Label" computed column is made editable with a `valueSetter` that writes the decoded value back to `row.statusCode`.

**Conditions of Use**
- `valueGetter` is specified in the column definition in place of, or alongside, a `field` property.
- When both `field` and `valueGetter` are present, `valueGetter` takes precedence for display value.
- A computed column without a `valueSetter` is implicitly read-only regardless of the grid's global `editable` setting.
- Cycle detection runs at grid initialization time when column definitions are processed; a detected cycle throws a configuration error.

**Behavioral Requirements**
- BR-1: The grid SHALL accept `valueGetter: (row: RowData) => any` on a column definition and use its return value as the column's display value.
- BR-2: Computed columns SHALL be read-only by default; the grid SHALL ignore any attempt to enter edit mode on a computed column that has no `valueSetter`.
- BR-3: The grid SHALL accept `valueSetter: (value: any, row: RowData) => void` on a computed column; when provided alongside `editable: true`, the column SHALL become editable and `valueSetter` SHALL be called on commit.
- BR-4: The grid SHALL recalculate computed column values whenever the source row data changes (data reload, single-cell edit, bulk update).
- BR-5: Sorting on a computed column SHALL use the `valueGetter` return value as the sort key.
- BR-6: Filtering on a computed column SHALL apply filter predicates against the `valueGetter` return value.
- BR-7: The grid SHALL detect circular dependencies between computed columns at initialization time and throw a descriptive configuration error identifying the cycle.
- BR-8: `valueGetter` SHALL receive the full row data object as its argument, including all other column values (computed or raw) that do not depend on the current column.
- BR-9: The grid SHALL expose the computed value in clipboard operations, exports (F-12), and cell context menu copy actions as the displayed value.

**Editability Interaction**
A computed column is editable only when both `editable: true` and a `valueSetter` are present on the column definition. If only one of the two is provided, the column remains read-only. The `valueSetter` is responsible for writing back to the source data fields; the grid does not infer which source field to update.

**Chameleon 6 Status**: Partially existed (valueGetter was available in some form)

**Interactions**: F-18 (validation can be applied to editable computed columns), F-19.2 (aggregation expressions can use computed column values), F-19.3 (formula strings may reference computed columns), F-02 (sorting uses computed value), F-03 (filtering uses computed value), F-07 (cell editing lifecycle applies when valueSetter is present)

---

### 19.2 Aggregate Expressions in Column Headers [P1]

**Description**: Column header cells can display a live aggregate summary of the column's visible data — such as the sum, average, minimum, maximum, or count of non-null values. The aggregate is computed from all rows that pass the current filter (i.e., visible rows only) and updates reactively when data or filters change. A custom aggregation function is also supported for domain-specific summaries.

**Applies to**: Data Grid, Tree Grid, Pivot Table

**Use Cases**
- UC-1: A "Revenue" column header shows "Sum: $1,234,567" below the column label, updating as the user filters rows.
- UC-2: A "Rating" column header shows "Avg: 4.2" to provide a quick column-level statistic.
- UC-3: A "Count" header aggregate shows the number of non-null values in the column, useful for identifying missing data.
- UC-4: A custom aggregation function computes a weighted average and renders the result as "Wtd Avg: 3.87".

**Conditions of Use**
- `headerAggregation` is specified in the column definition.
- Aggregation is computed over all rows that are currently visible (post-filter, post-grouping expansion); hidden rows are excluded.
- The aggregate label (e.g., "Sum:", "Avg:") is rendered as part of the header cell content below the column label by default.
- Custom aggregation functions receive the array of raw (non-formatted) values for visible rows.

**Behavioral Requirements**
- BR-1: The grid SHALL accept `headerAggregation: 'sum' | 'avg' | 'min' | 'max' | 'count' | ((values: any[]) => any)` on a column definition.
- BR-2: When `headerAggregation` is set, the grid SHALL render the aggregate result inside the column header cell, below the column label.
- BR-3: The grid SHALL recompute the aggregate value reactively whenever the visible row set changes (data change, filter change, grouping expansion/collapse).
- BR-4: For built-in aggregation types, the grid SHALL operate on non-null, non-undefined values only; `null` and `undefined` values SHALL be excluded from the computation.
- BR-5: For `'count'`, the grid SHALL return the count of non-null, non-undefined values in the visible rows.
- BR-6: For `'sum'` and `'avg'`, the grid SHALL operate only on numeric values; non-numeric values SHALL be excluded without error.
- BR-7: When a custom function is provided, the grid SHALL call it with an array of raw (non-formatted) values from visible rows and render the return value as a string.
- BR-8: The aggregate display SHALL be formatted using the column's `valueFormatter` if one is defined, when applicable.
- BR-9: The grid SHALL expose a CSS part `column-header-aggregate` for consumer styling of the aggregate display area.
- BR-10: The aggregate element in the column header SHALL carry `aria-label="[aggregation type]: [formatted value]"` (e.g., `aria-label="Sum: 1234567"`) for screen reader access.

**Accessibility**
- **ARIA**: The aggregate element SHALL have `aria-label` describing both the aggregation type and the computed value (e.g., `aria-label="Average: 4.2"`). It SHALL be a child of the column header cell (`role="columnheader"`).
- **Screen Reader**: SR: When the column header is focused, the aggregate value is announced as part of the header label: "[column name], [aggregation type]: [value]".
- **WCAG**: 1.3.1 Info and Relationships (Level A) — aggregate information must be programmatically determinable, not only visually positioned.
- **Visual**: The aggregate display SHALL be visually distinct from the column label (e.g., smaller font, muted color) but SHALL meet WCAG 1.4.3 contrast requirements.

**Chameleon 6 Status**: New feature

**Interactions**: F-19.1 (aggregate can operate on computed column values), F-03 (filtering changes the visible row set that aggregation operates on), F-04 (grouping expansion/collapse changes the visible row set), F-02 (sorting does not affect which rows are visible, so aggregation is unaffected by sort order)

---

### 19.3 Excel-Like Formula Support [P2]

**Description**: Future feature. Cells can contain formula strings beginning with `=` (e.g., `=SUM(A1:A10)`, `=price * quantity`). A formula evaluation engine parses and evaluates these expressions at runtime. Dependency tracking ensures that when a referenced cell changes value, all dependent formula cells automatically recalculate. Formula errors follow Excel conventions.

**Applies to**: Data Grid, Tree Grid, Pivot Table

**Use Cases**
- UC-1: A user types `=unitPrice * quantity` in a "Total" cell; the cell immediately displays the computed product.
- UC-2: Changing the value of "unitPrice" automatically recalculates all cells that reference it.
- UC-3: A cell with `=SUM(revenue:A1:A10)` shows `#CIRCULAR` when one of the referenced cells depends on the formula cell.
- UC-4: A cell with `=A1/0` displays `#DIV/0!` instead of throwing a runtime exception.

**Conditions of Use**
- Formula support is opt-in and requires `enableFormulas: true` on the grid definition.
- Formula strings must begin with `=` to be distinguished from plain text values.
- Column-name references (e.g., `=price * quantity`) resolve against column `field` or `id` values.
- Row-index references (e.g., `A1`) use 1-based row indices and column letters matching column order.
- Circular references are detected at formula parse/registration time when possible, and at recalculation time otherwise.

**Behavioral Requirements**
- BR-1: The grid SHALL accept formula strings (values beginning with `=`) in editable cells when `enableFormulas: true` is set.
- BR-2: The grid SHALL evaluate formula strings using a built-in formula engine and display the computed result in the cell.
- BR-3: The grid SHALL support cross-cell references using column-name form (`=colField operator colField`) and row-index form (`=A1`).
- BR-4: The grid SHALL implement dependency tracking so that when a referenced cell value changes, all formula cells that depend on it are automatically recalculated.
- BR-5: The grid SHALL detect circular references and display `#CIRCULAR` in all cells participating in the cycle.
- BR-6: The grid SHALL display `#DIV/0!` for division by zero, `#REF!` for invalid references, `#VALUE!` for type mismatches, and `#NAME?` for unrecognized function or column names, following Excel conventions.
- BR-7: Formula cells SHALL display the computed value in the cell body; the raw formula string SHALL be shown in the formula bar (F-19.4) when the cell is focused.
- BR-8: The grid SHALL expose `grid.recalculateFormulas()` for consumers to trigger a full recalculation pass (e.g., after bulk data mutation via the data API).
- BR-9: Formula evaluation errors SHALL NOT throw exceptions; all error conditions SHALL be surfaced as error values (`#CIRCULAR`, `#REF!`, etc.) within the cell.

**Accessibility**
- **ARIA**: Formula cells displaying error values SHALL have `aria-invalid="true"` and provide an `aria-describedby` tooltip explaining the error condition.
- **Screen Reader**: SR: When a formula cell is focused, the screen reader SHALL announce the computed display value, not the formula string. The formula string is accessible via the formula bar (F-19.4).
- **WCAG**: 3.3.1 Error Identification (Level A) — formula error values (`#REF!`, etc.) must be identifiable; they SHALL also have a tooltip explanation accessible to keyboard and AT users.
- **Visual**: Error values SHALL be visually distinct (e.g., displayed in an error color) with a non-color indicator (e.g., icon prefix) per WCAG 1.4.1.

**Chameleon 6 Status**: New feature (P2 - future)

**Interactions**: F-19.4 (formula bar displays the formula string for formula cells), F-19.1 (computed columns and formula cells are distinct mechanisms; both can coexist), F-18 (validation can be applied to formula cells using the computed result as the validated value), F-07 (cell editing lifecycle: editing a formula cell edits the formula string, not the computed result)

---

### 19.4 Formula Bar UI [P2]

**Description**: Future feature. A dedicated input bar rendered above the grid displays the formula string or raw value of the currently focused cell. When a formula cell is focused, the formula bar shows the `=`-prefixed formula; for non-formula cells it shows the raw value. Editing in the formula bar is equivalent to editing directly in the cell. The bar can be hidden via configuration.

**Applies to**: Data Grid, Tree Grid, Pivot Table

**Use Cases**
- UC-1: A user focuses a formula cell; the formula bar shows `=unitPrice * quantity` while the cell shows the numeric result.
- UC-2: A user edits the formula directly in the formula bar; pressing Enter commits the change to the cell.
- UC-3: A power user hides the formula bar via `showFormulaBar: false` to reclaim vertical space.
- UC-4: A screen reader user navigates to the formula bar with Tab to inspect or edit the formula of the currently focused cell.

**Conditions of Use**
- The formula bar is shown by default when `enableFormulas: true` is set; it can be hidden with `showFormulaBar: false`.
- The formula bar reflects the cell that currently has keyboard focus within the grid.
- Editing in the formula bar places the associated cell into edit mode; the cell and formula bar are kept in sync during editing.
- Pressing Escape while editing in the formula bar cancels the edit and restores the previous value, mirroring F-18.2 behavior.

**Behavioral Requirements**
- BR-1: The grid SHALL render a formula bar above the grid column headers when `enableFormulas: true` and `showFormulaBar` is not `false`.
- BR-2: When a cell with a formula is focused, the formula bar SHALL display the formula string (e.g., `=unitPrice * quantity`).
- BR-3: When a non-formula cell is focused, the formula bar SHALL display the cell's raw (unformatted) value.
- BR-4: Typing in the formula bar SHALL place the associated cell into edit mode and keep the formula bar and cell editor synchronized.
- BR-5: Pressing Enter while editing in the formula bar SHALL commit the value to the cell, identical to pressing Enter in the cell editor.
- BR-6: Pressing Escape while editing in the formula bar SHALL cancel the edit and restore the previous value.
- BR-7: The grid SHALL accept `showFormulaBar: boolean` (default `true` when `enableFormulas: true`); setting it to `false` SHALL hide the formula bar without disabling formula evaluation.
- BR-8: The formula bar SHALL be a focusable element reachable via Tab from the grid's column headers or from outside the grid.
- BR-9: The grid SHALL expose a CSS part `formula-bar` for consumer theming.

**Keyboard Interaction**
| Key | Action | Mode |
|-----|--------|------|
| Tab (from column headers) | Move focus to formula bar | Grid navigation |
| Tab (from formula bar) | Move focus to first data cell | Formula bar focused |
| Enter | Commit formula/value to cell | Formula bar edit mode |
| Escape | Cancel edit, restore previous value | Formula bar edit mode |
| F2 (from cell) | Move focus to formula bar for cell editing | Cell focused |

**Accessibility**
- **ARIA**: The formula bar input SHALL have `role="textbox"`, `aria-label="Formula bar"`, and `aria-controls` pointing to the `id` of the currently focused cell element so that the relationship is programmatically determinable.
- **Screen Reader**: SR: When the formula bar receives focus, "Formula bar: [formula or value]" is announced. SR: When a formula cell is focused in the grid, "Has formula, press F2 to edit in formula bar" is announced as an additional hint.
- **WCAG**: 2.1.1 Keyboard (Level A), 4.1.2 Name, Role, Value (Level A) — the formula bar input must have an accessible name and expose its current value programmatically.
- **Visual**: The formula bar SHALL have a visible focus indicator when focused. Its label ("fx" or "Formula bar") SHALL meet WCAG 1.4.3 contrast requirements.

**Chameleon 6 Status**: New feature (P2 - future)

**Interactions**: F-19.3 (formula strings from formula cells are displayed in the bar), F-07 (editing via the formula bar uses the same cell editing lifecycle), F-18.2 (Escape behavior mirrors synchronous validation cancel), F-14 (formula bar is part of the grid's tab order)

---

## Normative Requirements

The following normative requirements summarize the binding rules for the Formulas & Calculated Columns feature. P2 requirements (future) are marked explicitly.

| ID | Priority | Requirement |
|----|----------|-------------|
| FC-01 | P1 | The grid SHALL accept `valueGetter: (row: RowData) => any` on a column definition and use its return value as the column's display value. |
| FC-02 | P1 | Computed columns SHALL be read-only by default; the grid SHALL ignore edit attempts on a computed column that has no `valueSetter`. |
| FC-03 | P1 | The grid SHALL accept `valueSetter: (value: any, row: RowData) => void`; when present alongside `editable: true`, the computed column SHALL become editable. |
| FC-04 | P1 | The grid SHALL recalculate computed column values whenever the source row data changes. |
| FC-05 | P1 | Sorting and filtering on a computed column SHALL use the `valueGetter` return value as the operative value. |
| FC-06 | P1 | The grid SHALL detect circular dependencies between computed columns at initialization time and throw a descriptive configuration error. |
| FC-07 | P1 | The grid SHALL accept `headerAggregation: 'sum' \| 'avg' \| 'min' \| 'max' \| 'count' \| ((values: any[]) => any)` on a column definition. |
| FC-08 | P1 | When `headerAggregation` is set, the grid SHALL render the aggregate result inside the column header cell and recompute it reactively when the visible row set changes. |
| FC-09 | P1 | Built-in `sum` and `avg` aggregations SHALL exclude `null`, `undefined`, and non-numeric values from their computations. |
| FC-10 | P1 | The aggregate header element SHALL carry `aria-label="[aggregation type]: [formatted value]"` for programmatic accessibility. |
| FC-11 | P2 | The grid SHALL accept formula strings (values beginning with `=`) in editable cells when `enableFormulas: true` is set. *(P2 — future)* |
| FC-12 | P2 | The grid SHALL implement dependency tracking so that when a referenced cell changes, all formula cells depending on it recalculate automatically. *(P2 — future)* |
| FC-13 | P2 | The grid SHALL detect circular references in formula cells and display `#CIRCULAR`; division by zero SHALL display `#DIV/0!`; invalid references SHALL display `#REF!`; type mismatches SHALL display `#VALUE!`; unrecognized names SHALL display `#NAME?`. *(P2 — future)* |
| FC-14 | P2 | The grid SHALL render a formula bar above the column headers when `enableFormulas: true` and `showFormulaBar` is not `false`. *(P2 — future)* |
| FC-15 | P2 | When a formula cell is focused, the formula bar SHALL display the formula string; for non-formula cells, it SHALL display the raw value. *(P2 — future)* |
| FC-16 | P2 | The formula bar SHALL have `role="textbox"`, `aria-label="Formula bar"`, and `aria-controls` pointing to the currently focused cell; it SHALL be reachable via Tab from the grid's keyboard focus order. *(P2 — future)* |

---
*This file is part of the Chameleon 7 Tabular Grid Specification. See [README.md](../README.md) for the complete table of contents.*
