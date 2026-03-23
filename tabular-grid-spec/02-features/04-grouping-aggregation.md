# F-04: Grouping & Aggregation

Grouping allows users to organize flat tabular data into collapsible sections based on shared column values. Aggregation computes summary values (sum, average, count, etc.) for each group and displays them in group headers or footers. Together, these features transform a flat data set into a structured, scannable view without altering the underlying data model.

Grouping is primarily a **Data Grid** feature. It creates visual and semantic hierarchy from flat data using `role="grid"` with `rowgroup` elements -- this is fundamentally different from Tree Grid, which represents inherently hierarchical data using `role="treegrid"` with `aria-level`. Implementers MUST NOT mix these two patterns: a grouped Data Grid MUST NOT use `role="treegrid"`, and a Tree Grid MUST NOT use the grouping mechanism described here for its inherent hierarchy.

> **Foundations**: This feature assumes the layout model defined in [FD-01](../01-foundations/01-layout-model.md). Group header rows and group footer rows use `display: grid; grid-template-columns: subgrid; grid-column: 1 / -1` to maintain column alignment. The editability model in [FD-03](../01-foundations/03-editability-model.md) defines how aggregation interacts with edited cell values. The variant model in [FD-02](../01-foundations/02-variant-model.md), Section 3.3, confirms that grouping applies to Data Grid (Yes), Pivot Table (No -- dimensions replace grouping), Tree Grid (No -- inherent hierarchy), and Gantt Chart (Modified -- WBS grouping handled by tree structure).

---

## 4.1 Single-Level Row Grouping [P1]

**Description**: The user groups all rows by the values of a single column, creating collapsible sections where each section contains rows sharing the same value in the grouping column. For example, grouping an employee list by "Department" creates one group for "Engineering", another for "Marketing", and so on. Each group is visually separated by a group header row that displays the grouping value and can be expanded or collapsed.

**Applies to**: Data Grid, Gantt Chart (task list only, when task list uses `role="grid"` and tasks are flat)

**Use Cases**
- UC-1: A sales manager groups a transaction list by "Region" to see all sales within each geographic area as a collapsible section.
- UC-2: A support team lead groups a ticket list by "Status" to quickly see how many tickets are Open, In Progress, or Resolved.
- UC-3: An HR analyst groups an employee directory by "Department" to browse headcount by organizational unit.

**Conditions of Use**
- The column used for grouping MUST have `groupable: true` in its column definition (or inherit from a grid-level default).
- The grid MUST accept a configuration property to specify the active grouping column (e.g., `groupBy: string | string[]`).
- Grouping MUST operate on the raw data values of the specified column, not on display-formatted values, unless explicitly configured otherwise (analogous to F-02.7 sort-by-value vs display-value).

**Behavioral Requirements**
- BR-1: When grouping is applied, the grid MUST reorganize rows into groups based on the distinct values in the specified column. Each group MUST be preceded by a group header row.
- BR-2: The group header row MUST span all columns in the grid. In CSS subgrid terms, the group header row MUST use `display: grid; grid-template-columns: subgrid; grid-column: 1 / -1`, and its content cell MUST span all column tracks (grid-column: 1 / -1).
- BR-3: Group header rows MUST be collapsible. When collapsed, all data rows within the group MUST be hidden from both the visual display and the accessibility tree. When expanded, all data rows MUST be visible.
- BR-4: The default state of groups (expanded or collapsed) MUST be configurable via a grid-level property (e.g., `groupDefaultExpanded: boolean`, default: `true`).
- BR-5: The grid MUST emit a `groupExpandedChanged` event when a group is expanded or collapsed, containing the group value, the grouping column ID, and the new expanded state.
- BR-6: The grid MUST wrap each group (header + data rows) in a container element with `role="rowgroup"` to semantically associate the group header with its member rows.
- BR-7: The order of groups MUST follow the natural order of the first occurrence of each group value in the data source, unless a sort is active on the grouping column (see Cross-Cutting Concerns: Sort and Grouping Interaction in F-02).
- BR-8: Rows that have a `null` or `undefined` value in the grouping column MUST be collected into a dedicated group with a configurable label (e.g., "(No Value)" or "(Blank)"). This group MUST NOT be silently omitted.
- BR-9: When grouping is removed (the `groupBy` configuration is cleared), the grid MUST restore the flat row display in the current sort order.
- BR-10: Grouping MUST operate on the filtered row set when filtering (F-03) is active. Groups with zero matching rows after filtering MUST NOT be displayed.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | N/A -- grouping does not apply. Tree Grid represents inherent parent-child hierarchy, not value-based grouping. Use `aria-level` and `aria-expanded` per the treegrid model (FD-02, Section 2.2). |
| Pivot Table | N/A -- the Pivot Table's row and column dimensions inherently create the equivalent of multi-level grouping through its dimension model (F-05). Separate row grouping is not applicable. |
| Gantt Chart | Grouping applies to the task list region only when it uses `role="grid"` (flat task list). When the task list uses `role="treegrid"` (WBS hierarchy), grouping is N/A because the hierarchy already structures the tasks. Timeline bars reorder to match grouped task list order. |

**CSS Subgrid Implications**

Group header rows participate in the same subgrid as data rows. The group header row element MUST use the standard row pattern from [FD-01](../01-foundations/01-layout-model.md), Section 1.4:

```css
.group-header-row {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
}
```

The group header's content cell spans all columns:

```css
.group-header-cell {
  grid-column: 1 / -1;  /* Span all column tracks */
}
```

This ensures the group header visually stretches across the full grid width while remaining part of the subgrid layout. Column resizing, hiding, and reordering automatically adjust the group header's width.

**Editability Interaction**
- Group header rows MUST NOT be editable. They are structural/summary elements, not data records. If the user navigates to a group header cell and presses F2 or Enter, the grid MUST NOT enter Edit Mode; it MUST toggle the group's expanded/collapsed state instead.
- Data rows within groups remain editable per their normal editability rules (FD-03).

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Enter | Toggle expand/collapse on a focused group header row | Navigation Mode, focus on group header |
| Space | Toggle expand/collapse on a focused group header row | Navigation Mode, focus on group header |
| Arrow Down | From a collapsed group header, move focus to the next group header (skip hidden rows). From an expanded group header, move focus to the first data row in the group. | Navigation Mode |
| Arrow Up | From the first data row in a group, move focus to the group header. From a group header, move focus to the last visible row of the previous group (or previous group header if that group is collapsed). | Navigation Mode |
| Home | Move focus to the first cell in the group header row (which is the full-span cell) | Navigation Mode, focus on group header |
| End | Move focus to the last cell in the group header row (same cell, since it spans all columns) | Navigation Mode, focus on group header |

**Accessibility**
- **ARIA**: Each group MUST be wrapped in a `role="rowgroup"` element. The group header row MUST carry `role="row"` and its content cell MUST carry `role="gridcell"` (or `role="rowheader"` if it serves as the group identifier). The group header row MUST carry `aria-expanded="true"` when the group is expanded and `aria-expanded="false"` when collapsed. The root grid element MUST retain `role="grid"` (NOT `role="treegrid"`) because grouping creates structure from flat data, not inherent hierarchy.
- **Screen Reader**: When a group header receives focus, the screen reader MUST announce: SR: "[Group Value], group, [expanded/collapsed], [N] items". When the user toggles expand/collapse, a live region (`role="status"`, `aria-live="polite"`) MUST announce: SR: "[Group Value] group expanded, [N] items" or SR: "[Group Value] group collapsed".
- **WCAG**: 1.3.1 (group structure is programmatically determinable via `rowgroup` and `aria-expanded`), 2.1.1 (expand/collapse is keyboard-accessible via Enter/Space), 4.1.2 (group header has accessible name and expanded state).
- **Visual**: Group header rows MUST be visually distinct from data rows (e.g., different background color, bold text, indentation). The expand/collapse affordance MUST be visible (chevron or +/- icon). The visual indicator MUST NOT rely on color alone (WCAG 1.4.1).

**Chameleon 6 Status**: Existed. Chameleon 6 supports row grouping via "rowsets" with a "legend" element as the group header. The grouping mechanism is configured through `TabularGridRowsetModel` with `legend` and `expanded` properties. Chameleon 7 carries forward the concept but aligns ARIA semantics with the `rowgroup` + `aria-expanded` pattern and adds `groupBy` declarative configuration.

**Interactions**
- F-04.2 (Multi-Level Grouping): single-level grouping is the base; multi-level extends it.
- F-04.3 (Group Headers with Expand/Collapse): defines the expand/collapse interaction in detail.
- F-04.4 (Aggregation Functions): aggregated values may display in the group header.
- F-04.5 (Group Footer Rows): optional summary row at the bottom of each group.
- F-02 (Sorting): sort applies within groups or reorders groups by aggregated values.
- F-03 (Filtering): filter applies before grouping; empty groups are hidden.
- F-08 (Selection): row selection within groups; selecting a group header MAY select all rows in the group.
- F-11 (Virtualization): grouped rows participate in virtualization; collapsed groups skip their hidden rows.
- F-14 (Keyboard Navigation): navigation through group headers and data rows.

---

## 4.2 Multi-Level / Nested Grouping [P1]

**Description**: The user groups rows by multiple columns simultaneously, creating a hierarchy of groups. The first grouping column creates top-level groups, the second creates sub-groups within each top-level group, and so on. For example, grouping first by "Country" and then by "City" produces a two-level hierarchy: countries at the outer level, cities nested within each country. Each level is independently collapsible.

**Applies to**: Data Grid, Gantt Chart (task list, when flat)

**Use Cases**
- UC-1: A financial analyst groups transactions by "Year" then by "Quarter" to see a time-based drill-down of financial data.
- UC-2: A logistics manager groups shipments by "Region" then by "Warehouse" then by "Status" to understand fulfillment across the supply chain.
- UC-3: A project manager groups tasks by "Priority" then by "Assignee" to see who owns the most critical work items.

**Conditions of Use**
- Multi-level grouping MUST be configured via an ordered array in the `groupBy` property (e.g., `groupBy: ["country", "city"]`). The array order determines the nesting hierarchy.
- Each column in the `groupBy` array MUST have `groupable: true`.
- The grid SHOULD support at least 3 levels of nesting. Implementations MAY support more, but deeply nested grouping (>4 levels) degrades usability and SHOULD trigger a developer warning.

**Behavioral Requirements**
- BR-1: The grid MUST create nested group structures where each level's groups are scoped to their parent group. For a `groupBy: ["country", "city"]` configuration, each country group contains city sub-groups, and each city sub-group contains the data rows for that country+city combination.
- BR-2: Each group level MUST have its own group header row, visually indented to convey nesting depth. The indentation MUST increase by a configurable amount per level (e.g., `--ch-tabular-grid-group-indent: 16px` per level).
- BR-3: Collapsing a parent group MUST hide ALL nested sub-groups and their data rows. Expanding a parent group MUST restore sub-groups to their previously remembered expanded/collapsed state (not force all to expanded).
- BR-4: Each group level MUST be independently collapsible. Collapsing an inner group MUST NOT affect the outer group's expanded state, and vice versa (except as specified in BR-3 where collapsing a parent hides its children).
- BR-5: The grid MUST emit `groupExpandedChanged` events for each group toggle, including the group level in the event payload.
- BR-6: Group header rows at each level MUST display the grouping column name and the group value (e.g., "Country: United States" for level 1, "City: New York" for level 2).
- BR-7: Adding or removing a grouping level at runtime (modifying the `groupBy` array) MUST re-group the data accordingly. The grid MUST NOT require a full data reload.
- BR-8: Each nesting level MUST be semantically represented. Nested `role="rowgroup"` elements MUST wrap each group and its sub-groups.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | N/A -- multi-level grouping does not apply. The Tree Grid's inherent hierarchy (via `aria-level`) already provides nesting. |
| Pivot Table | N/A -- the Pivot Table's multi-level row dimensions provide the equivalent functionality through its own dimension model (F-05). |
| Gantt Chart | Multi-level grouping applies to the task list when flat. When the task list uses WBS hierarchy (`treegrid`), grouping is N/A. |

**CSS Subgrid Implications**

Nested group header rows follow the same subgrid pattern as single-level group headers. Each group header row uses `grid-column: 1 / -1` with a full-span content cell. Visual indentation is achieved via padding on the content cell, NOT by consuming additional grid tracks:

```css
.group-header-cell[data-group-level="1"] { padding-inline-start: calc(1 * var(--ch-tabular-grid-group-indent, 16px)); }
.group-header-cell[data-group-level="2"] { padding-inline-start: calc(2 * var(--ch-tabular-grid-group-indent, 16px)); }
```

This preserves column alignment because the indentation is within the cell, not a structural change to the grid tracks.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Enter | Toggle expand/collapse on the focused group header (any level) | Navigation Mode, focus on group header |
| Space | Toggle expand/collapse on the focused group header (any level) | Navigation Mode, focus on group header |
| Arrow Down | From a collapsed group header, skip to the next sibling group header or parent's next sibling. From an expanded group header, enter the first child (sub-group header or data row). | Navigation Mode |
| Arrow Up | Reverse of Arrow Down logic: move to previous visible row or parent group header | Navigation Mode |

**Accessibility**
- **ARIA**: Nested groups MUST use nested `role="rowgroup"` elements. Each group header row MUST carry `aria-expanded`. The grid MUST NOT use `aria-level` on group header rows -- `aria-level` is reserved for `role="treegrid"` rows and MUST NOT be used in a `role="grid"` context to avoid confusing assistive technology.
- **Screen Reader**: When a nested group header receives focus: SR: "[Group Value], sub-group, [expanded/collapsed], [N] items, within [Parent Group Value]". The nesting context helps the user understand their position within the hierarchy.
- **WCAG**: 1.3.1 (nested group structure is determinable via nested `rowgroup` elements and `aria-expanded`), 2.1.1 (keyboard-accessible expand/collapse at each level).
- **Visual**: Each nesting level MUST be visually distinguishable via indentation, and optionally via progressively lighter background colors or visual connectors (lines). Visual differentiation MUST NOT rely on color alone.

**Chameleon 6 Status**: Existed (partially). Chameleon 6 supports nested rowsets (rowset within rowset), but nesting is manually configured in the model rather than declared via a `groupBy` array. Chameleon 7 introduces declarative multi-level grouping with automatic nesting from a column list.

**Interactions**
- F-04.1 (Single-Level Grouping): multi-level extends single-level. A single-element `groupBy` array is equivalent to single-level grouping.
- F-04.3 (Group Headers): each level has its own group header with independent expand/collapse.
- F-04.4 (Aggregation Functions): aggregation may be computed at each nesting level.
- F-04.5 (Group Footer Rows): footer rows may appear at each nesting level.
- F-04.6 (Drag-to-Group Panel): the panel manages the multi-level column list.
- F-02 (Sorting): sort applies within the innermost group level by default.
- F-21 (State Persistence): the `groupBy` array and per-group expanded states should be included in saved state.

---

## 4.3 Group Headers with Expand/Collapse [P1]

**Description**: Each group header row displays the group's identifying value, a count of items in the group, and an expand/collapse toggle. The header provides immediate context about the group's contents without requiring the user to scan individual rows. Pressing Enter or Space on a group header toggles the group between expanded and collapsed states. Group header rows are structural elements and MUST NOT be editable.

**Applies to**: Data Grid, Gantt Chart (task list, when flat)

**Use Cases**
- UC-1: A user scans a grouped employee list and sees "Engineering (42)" on the group header, immediately understanding the department size without expanding.
- UC-2: A user collapses all groups except "Critical" in a bug tracker grouped by severity, reducing visual noise to focus on the most important issues.
- UC-3: A user expands a "Q4-2025" group to review quarterly transactions while keeping all other quarters collapsed.

**Conditions of Use**
- Group headers MUST be present whenever grouping (F-04.1 or F-04.2) is active.
- The group header content (layout, displayed fields) MUST be configurable but MUST have a sensible default: "[Column Name]: [Group Value] ([Count])".

**Behavioral Requirements**
- BR-1: The group header row MUST display, at minimum: the grouping column name, the group value, and the count of data rows in the group (including rows hidden by sub-group collapsing, but excluding rows hidden by filtering).
- BR-2: The expand/collapse toggle MUST be activated by Enter or Space when the group header has focus, or by clicking the toggle icon or anywhere on the group header row.
- BR-3: When a group is collapsed, its data rows (and any sub-groups) MUST be removed from the DOM or hidden with `display: none` (or equivalent), so they are excluded from both visual rendering and the accessibility tree. Using `visibility: hidden` alone is NOT sufficient because the rows would still occupy space and remain in the accessibility tree.
- BR-4: When a group is expanded, all direct child rows (and expanded sub-group rows) MUST be rendered in the DOM.
- BR-5: The grid MUST support an "expand all" and "collapse all" action via API and optionally via a UI control (e.g., a button in the grid toolbar or a keyboard shortcut).
- BR-6: The expand/collapse state transition SHOULD be animated (slide or fade) to help the user track the visual change. The animation MUST respect `prefers-reduced-motion: reduce`.
- BR-7: When a group is collapsed and the focus was on a data row within that group, focus MUST move to the group header row. The grid MUST NOT leave focus on a hidden element.
- BR-8: The group header row MUST have a visual expand/collapse indicator (chevron pointing right when collapsed, down when expanded, or +/- icon). The indicator MUST be declared `aria-hidden="true"` because the expanded state is conveyed via `aria-expanded`.
- BR-9: Group header rows MUST NOT enter Edit Mode. They represent group structure, not editable data. Pressing F2 on a group header MUST have no effect (or toggle expand/collapse as a secondary affordance).
- BR-10: The count displayed in the group header MUST update dynamically when filtering (F-03) changes the visible row set, or when rows are added/removed.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | N/A. Tree Grid parent rows serve an analogous expand/collapse role, but they are data rows with `aria-expanded`, not structural group headers. See F-06 for Tree Grid expand/collapse behavior. |
| Pivot Table | N/A. Pivot Table dimension headers may be expandable, but this is governed by the pivot dimension model (F-05), not the grouping model. |
| Gantt Chart | Group headers in the task list behave identically to Data Grid. Timeline bars for rows within a collapsed group are hidden. |

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Enter | Toggle expand/collapse | Navigation Mode, focus on group header row |
| Space | Toggle expand/collapse | Navigation Mode, focus on group header row |
| Arrow Right | If collapsed, expand the group (do not move focus). If already expanded, move focus to the first data row in the group. | Navigation Mode, focus on group header row |
| Arrow Left | If expanded, collapse the group (do not move focus). If already collapsed, no action (or move to parent group header in multi-level). | Navigation Mode, focus on group header row |

> Note: Arrow Right/Left on group headers mirrors the tree expand/collapse pattern from WAI-ARIA APG's treegrid guidance, adapted for the grouped grid context. This provides a consistent mental model for users familiar with tree navigation.

**Accessibility**
- **ARIA**: The group header row MUST carry `aria-expanded="true"` or `aria-expanded="false"`. The group header cell SHOULD carry an accessible name that includes the group value and count: `aria-label="[Column Name]: [Group Value], [N] items"` or equivalent via visible text content.
- **Screen Reader**: On focus: SR: "[Column Name]: [Group Value], [N] items, [expanded/collapsed], row [M] of [Total]". On toggle: SR: "[Group Value] expanded" or SR: "[Group Value] collapsed" via live region.
- **WCAG**: 1.3.1 (expanded state determinable via `aria-expanded`), 2.1.1 (toggle via Enter/Space/Arrow), 2.4.3 (focus order: group header before its member rows), 2.4.7 (focus visible on group header).
- **Visual**: The expand/collapse icon MUST change shape (chevron rotation or +/- swap), not just color. The group header MUST have a visible focus indicator meeting WCAG 2.4.11 (Focus Appearance) requirements.

**Chameleon 6 Status**: Existed. Chameleon 6 rowset legends provide group header functionality with `expanded` property. The legend element renders the group title and a toggle. Chameleon 7 enhances this with full ARIA semantics (`aria-expanded` on the row), Arrow Right/Left expand/collapse keyboard support, and configurable header content.

**Interactions**
- F-04.1 (Single-Level Grouping): group headers are created as part of grouping.
- F-04.2 (Multi-Level Grouping): each nesting level has its own group header.
- F-04.4 (Aggregation Functions): aggregated values display within group headers.
- F-04.7 (Custom Group Row Rendering): custom content overrides the default header appearance.
- F-07 (Cell Editing): group headers are excluded from editing.
- F-14 (Keyboard Navigation): group header navigation is integrated into the grid's keyboard model.

---

## 4.4 Aggregation Functions [P1]

**Description**: The grid computes summary values for each group using aggregation functions such as sum, average, min, max, count, and custom functions. Aggregated values are displayed in group header rows (inline with the group title) or in group footer rows (F-04.5). Each column can have its own aggregation function, and values update automatically when the underlying data changes through editing, filtering, or row additions/removals.

**Applies to**: Data Grid, Gantt Chart (task list)

**Use Cases**
- UC-1: A financial dashboard groups transactions by "Category" and shows the sum of the "Amount" column in each group header, giving an instant spending breakdown.
- UC-2: A performance review grid groups employees by "Department" and displays the average "Rating" per department in the group footer.
- UC-3: A project management grid groups tasks by "Sprint" and shows the count of tasks, sum of story points, and the maximum "Due Date" per sprint.
- UC-4: An inventory system groups products by "Warehouse" and displays a custom aggregation function that computes the total shelf-space utilization percentage per warehouse.

**Conditions of Use**
- Aggregation functions MUST be configured per column via a column definition property (e.g., `aggregation: "sum" | "avg" | "min" | "max" | "count" | AggregationFunction`).
- A column MAY have no aggregation function, in which case its cell in the group header/footer row is empty or displays a dash.
- Custom aggregation functions MUST accept an array of cell values and return a single aggregated value.

**Behavioral Requirements**
- BR-1: The grid MUST support the following built-in aggregation functions: `sum` (numeric addition), `avg` (arithmetic mean), `min` (minimum value), `max` (maximum value), `count` (number of non-null values), `countAll` (total number of rows including nulls).
- BR-2: Custom aggregation functions MUST have the signature: `(values: any[], rowDataArray: RowData[]) => any`. Providing the full row data array allows aggregations that depend on multiple columns (e.g., weighted average).
- BR-3: Aggregated values MUST be displayed in the corresponding column's position within the group header row or group footer row (F-04.5). The value MUST align with the column it summarizes.
- BR-4: When a group header row spans all columns (F-04.1, BR-2), aggregated values MAY be displayed inline with the group title text (e.g., "Engineering (42) -- Total Salary: $4,200,000") or in a secondary row within the group header area.
- BR-5: Alternatively, when the group header row contains individual cells for each column (instead of a single spanning cell), each aggregated value MUST appear in its respective column's cell. This layout requires the group header row to participate fully in the subgrid.
- BR-6: Aggregated values MUST update automatically when: (a) a cell value is edited (F-07) within the group, (b) the filter (F-03) changes the visible row set, (c) rows are added or removed from the group.
- BR-7: Aggregation MUST respect the column's `dataType` for computation. Attempting to sum a string column MUST result in a count (fallback) or an empty value, not an error. The grid SHOULD log a developer warning for type mismatches.
- BR-8: For multi-level grouping (F-04.2), aggregation MUST compute at each nesting level. An outer group's aggregation MUST aggregate over all data rows within it (including those in sub-groups), NOT over the sub-group aggregations (unless the aggregation function is specifically designed for hierarchical roll-up, like `count`).
- BR-9: Aggregated values MUST be formatted using the same column formatter/renderer used for data cells, unless a separate `aggregationFormatter` is provided.
- BR-10: Null and undefined values MUST be excluded from `sum`, `avg`, `min`, and `max` calculations. The `count` function MUST count only non-null values; `countAll` MUST count all rows.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | N/A for grouping aggregation. Tree Grid may implement its own roll-up aggregation at parent nodes (summing child values), but that is a tree-specific feature (F-06), not part of the grouping model. |
| Pivot Table | Aggregation is the core mechanism of the Pivot Table (F-05). The Pivot Table's aggregation operates on the intersection of dimension values, which is structurally different from group-level aggregation in a Data Grid. |
| Gantt Chart | Aggregation applies to the task list columns. Common aggregations: sum of "Duration", average "Progress %", max "End Date". Timeline summary bars for groups visualize the aggregated date range. |

**Editability Interaction**
- Aggregated value cells MUST NOT be editable. They are computed values, not direct data. Pressing F2 on an aggregated cell MUST have no effect.
- When a user edits a data cell within a group, the aggregation for that group (and any parent groups in multi-level grouping) MUST recompute and update immediately upon edit commit. The update MUST NOT wait for a full re-render or require explicit refresh.
- If an edit causes a row to change groups (e.g., changing "Department" from "Engineering" to "Marketing" in a grid grouped by department), both the source and target groups' aggregations MUST recompute.

**Accessibility**
- **ARIA**: Aggregated cells in group header or footer rows MUST be programmatically associated with their column header via the standard `headers` attribute or positional association. Aggregated cells SHOULD carry `aria-describedby` or `aria-label` that includes the aggregation type: e.g., `aria-label="Total Salary: $4,200,000"` or `aria-description="Sum"`.
- **Screen Reader**: When navigating to an aggregated cell: SR: "[Column Name], [Aggregation Type]: [Value]". For example: SR: "Salary, Sum: $4,200,000".
- **WCAG**: 1.3.1 (aggregated values are programmatically associated with their column), 4.1.2 (aggregated cells have accessible names including the aggregation type).
- **Visual**: Aggregated values SHOULD be visually distinguished from regular data values (e.g., bold text, different text color) to prevent confusion between data and computed values. The distinction MUST NOT rely on color alone.

**Chameleon 6 Status**: New. Chameleon 6 does not provide built-in aggregation functions. Aggregated values in rowset legends were computed and rendered by the application. Chameleon 7 introduces declarative aggregation configuration per column with built-in and custom function support.

**Interactions**
- F-04.1 (Single-Level Grouping): aggregation values display within groups.
- F-04.2 (Multi-Level Grouping): aggregation computes at each nesting level.
- F-04.3 (Group Headers): aggregated values appear in group header content.
- F-04.5 (Group Footer Rows): aggregated values appear in group footers.
- F-07 (Cell Editing): edits trigger aggregation recomputation.
- F-01 (Data Display): column formatters apply to aggregated values.
- F-03 (Filtering): filtering changes the row set that aggregation operates on.
- F-02 (Sorting): groups may be sorted by their aggregated values.

---

## 4.5 Group Footer Rows [P1]

**Description**: A summary row rendered at the bottom of each group, after the last data row in the group, displaying aggregated values for the group. Group footers provide a dedicated location for aggregation results separate from the group header, which is useful when the group header displays the group title and the footer displays detailed column-by-column summaries. Footer rows share the column grid via subgrid, so aggregated values align with their respective columns.

**Applies to**: Data Grid, Gantt Chart (task list)

**Use Cases**
- UC-1: A financial report grouped by "Account" shows a footer row per account with the sum of "Debits", sum of "Credits", and the net "Balance" in their respective columns.
- UC-2: A grading system grouped by "Student" shows a footer row per student with the average "Score", count of "Assignments Completed", and the minimum "Score" for identifying weak areas.
- UC-3: A sales pipeline grouped by "Stage" shows a footer row per stage with the total "Deal Value" and the count of "Deals".

**Conditions of Use**
- Group footers MUST be enabled via a grid-level configuration property (e.g., `groupFooter: boolean`, default: `false`).
- Group footers MUST only appear when grouping (F-04.1 or F-04.2) is active.
- At least one column MUST have an `aggregation` function configured for footers to display meaningful data.

**Behavioral Requirements**
- BR-1: When enabled, the grid MUST render a footer row at the bottom of each group, immediately after the last data row and before the next group header (or the grid's own footer).
- BR-2: Group footer rows MUST participate in the subgrid layout: `display: grid; grid-template-columns: subgrid; grid-column: 1 / -1`. Each cell in the footer row aligns with its corresponding column.
- BR-3: Each footer cell MUST display the aggregated value for its column using the column's configured `aggregation` function (F-04.4). Columns without an aggregation function MUST render an empty footer cell.
- BR-4: Group footer rows MUST be hidden when their group is collapsed. They appear only when the group is expanded.
- BR-5: In multi-level grouping (F-04.2), each nesting level MAY have its own footer row. The grid MUST support a configuration that specifies at which grouping levels footers appear (e.g., `groupFooterLevels: "all" | "innermost" | number[]`).
- BR-6: Group footer rows MUST be visually distinct from data rows and group header rows (e.g., thicker top border, bold text, background color). The visual distinction MUST NOT rely on color alone.
- BR-7: Group footer values MUST update automatically when aggregation recomputation is triggered (F-04.4, BR-6).
- BR-8: Group footer rows MUST be included in keyboard navigation. Arrow Down from the last data row in a group moves focus to the footer row before the next group header. Arrow Up from the next group header moves to the footer row.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | N/A. If summary values are needed at parent levels in a Tree Grid, they are displayed in the parent row's cells, not in a separate footer row. |
| Pivot Table | N/A. The Pivot Table uses grand total rows/columns, which are part of its dimension model (F-05), not the grouping footer model. |
| Gantt Chart | Group footer rows appear in the task list. The timeline region does not render footer equivalents (the summary task bar serves this purpose). |

**CSS Subgrid Implications**

Footer rows use the identical subgrid pattern as data rows:

```css
.group-footer-row {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
}
```

Because footer rows inherit the host's column tracks, aggregated values automatically align with their corresponding column headers and data cells. Column resizing, hiding, and reordering affect footer cells identically to data cells.

**Editability Interaction**
- Group footer rows MUST NOT be editable. They contain computed aggregated values. Pressing F2 on a footer cell MUST have no effect. Focus on a footer cell MUST NOT trigger Edit Mode.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Arrow Down | From the last data row in a group, move focus to the group footer row. From the footer row, move to the next group header. | Navigation Mode |
| Arrow Up | From the next group header, move focus to the previous group's footer row (if visible). From the footer row, move to the last data row in the group. | Navigation Mode |
| Arrow Left/Right | Navigate between footer cells (one cell per column) | Navigation Mode |
| Enter | No action (footer cells are not interactive) | Navigation Mode |

**Accessibility**
- **ARIA**: Group footer rows MUST carry `role="row"`. Footer cells MUST carry `role="gridcell"`. Footer cells SHOULD include `aria-describedby` or `aria-label` identifying them as summary/aggregate values (e.g., `aria-label="Sum of Salary: $4,200,000"`).
- **Screen Reader**: When a footer cell receives focus: SR: "[Column Name], [Aggregation Type]: [Value], group footer". The "group footer" suffix differentiates this cell from data cells.
- **WCAG**: 1.3.1 (footer row is programmatically identifiable), 2.1.1 (footer cells are keyboard-navigable), 2.4.3 (footer row appears in the correct focus order after data rows, before next group header).
- **Visual**: Footer rows MUST have a visual treatment that clearly distinguishes them from data rows. Common patterns include a top border, bold font, or a summary-specific background. The distinction MUST NOT rely on color alone (WCAG 1.4.1).

**Chameleon 6 Status**: New. Chameleon 6 does not have built-in group footer rows. Applications rendered summary information manually. Chameleon 7 introduces declarative group footers with automatic aggregation display.

**Interactions**
- F-04.1 (Single-Level Grouping): footer rows appear within each group.
- F-04.2 (Multi-Level Grouping): footer rows may appear at each nesting level.
- F-04.3 (Group Headers): headers and footers are complementary; headers show the group identity, footers show the summary.
- F-04.4 (Aggregation Functions): footer cells display the aggregation results.
- F-10 (Row Management): footer rows are structural rows; they are not subject to row reorder or row drag.
- F-11 (Virtualization): footer rows participate in row virtualization.
- F-15 (Theming & Styling): footer row appearance is customizable via CSS custom properties and CSS Parts.

---

## 4.6 Drag-to-Group Panel [P2]

**Description**: An interactive drop zone area displayed above the grid (or in a configurable position) where users drag column headers to establish or modify groupings. Dropping a column header into the panel creates a grouping by that column. Multiple column headers can be dropped to create multi-level grouping (F-04.2), with the order of chips in the panel determining the nesting hierarchy. Users can rearrange chips to change grouping priority, or remove chips to ungroup.

**Applies to**: Data Grid

**Use Cases**
- UC-1: A business analyst drags the "Region" column header into the group panel to instantly group sales data by region, then drags "Product Category" as a second chip to add sub-grouping.
- UC-2: A user removes the "Region" chip from the group panel by dragging it out (or clicking its remove button), collapsing the grouping back to a single level by "Product Category" only.
- UC-3: A user rearranges chips in the group panel, moving "Product Category" before "Region" to change which dimension is the outer grouping level.

**Conditions of Use**
- The drag-to-group panel MUST be enabled via a grid-level configuration property (e.g., `showGroupPanel: boolean`, default: `false`).
- The panel is only meaningful when at least one column has `groupable: true`.
- Drag-and-drop grouping MUST also be achievable via keyboard (drag-and-drop is a mouse optimization; keyboard equivalence is required for accessibility).

**Behavioral Requirements**
- BR-1: The panel MUST be rendered as a designated drop zone above the grid body (below any toolbar, above the column headers). Its position SHOULD be configurable.
- BR-2: When no grouping is active, the panel MUST display placeholder text (e.g., "Drag a column header here to group by that column").
- BR-3: When the user drags a column header over the panel, the panel MUST display a visual drop indicator (highlight, dashed border, insertion marker) to signal that dropping is allowed.
- BR-4: Dropping a column header in the panel MUST add that column to the `groupBy` configuration and trigger re-grouping. The column appears as a "chip" or "tag" in the panel.
- BR-5: Each chip in the panel MUST display the column name and a remove button (X icon). Clicking the remove button MUST remove that column from the `groupBy` configuration and trigger re-grouping.
- BR-6: Chips MUST be reorderable within the panel via drag-and-drop. The left-to-right (LTR) or right-to-left (RTL) order of chips determines the nesting hierarchy (leftmost = outermost group in LTR).
- BR-7: Dragging a chip out of the panel (back to the column header area or to a general area) MUST remove it from the grouping configuration.
- BR-8: The panel MUST be keyboard-accessible: Tab moves focus into the panel, Arrow Left/Right navigates between chips, Delete or Backspace removes the focused chip, and a keyboard-accessible mechanism (e.g., a context menu or a column header action) MUST allow adding columns to the group panel without drag-and-drop.
- BR-9: The panel MUST update in real-time during drag operations (insertion marker shows where the chip will land).
- BR-10: Columns already in the group panel MUST NOT be droppable again (no duplicate grouping by the same column). The column header SHOULD indicate that it is already used for grouping (e.g., a visual badge or dimmed state).

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | N/A. Tree Grid does not support value-based grouping. |
| Pivot Table | The Pivot Table has its own field selector/configurator (F-05) for managing dimensions. The drag-to-group panel is not used. |
| Gantt Chart | The drag-to-group panel MAY be supported for the task list when it uses flat `role="grid"` mode. Not applicable for WBS hierarchy. |

**CSS Subgrid Implications**

The group panel is rendered OUTSIDE the grid's column track system. It sits in a separate row track above the header rowgroup (or in a separate container entirely). It does NOT participate in subgrid. Its layout is independent -- typically a flexbox or inline-flex container for the chip elements.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Tab | Move focus into the group panel (from toolbar or grid header) | Any |
| Arrow Left | Move focus to the previous chip in the panel | Focus in panel |
| Arrow Right | Move focus to the next chip in the panel | Focus in panel |
| Delete / Backspace | Remove the focused chip from the grouping | Focus on a chip |
| Shift + Arrow Left | Move the focused chip one position to the left (change grouping priority) | Focus on a chip |
| Shift + Arrow Right | Move the focused chip one position to the right (change grouping priority) | Focus on a chip |
| Escape | Move focus back to the grid | Focus in panel |

**Accessibility**
- **ARIA**: The panel MUST carry `role="toolbar"` with `aria-label="Grouping panel"` (or localized equivalent). Each chip MUST carry `role="button"` or be implemented as a button element. The chip's accessible name MUST include the column name and its position: `aria-label="Grouped by [Column Name], position [N] of [Total]. Press Delete to remove."`. The remove button within the chip MUST have `aria-label="Remove [Column Name] from grouping"`.
- **Screen Reader**: When a chip is focused: SR: "Grouped by [Column Name], position [N] of [Total], press Delete to remove". When a chip is added: SR: "Grouped by [Column Name], [N] grouping levels" via live region. When a chip is removed: SR: "[Column Name] removed from grouping, [N] grouping levels remaining" via live region.
- **WCAG**: 1.3.1 (panel structure is determinable), 2.1.1 (all panel operations are keyboard-accessible), 2.4.3 (panel is in logical focus order), 2.5.1 (pointer-based drag has keyboard alternatives), 4.1.2 (chips have accessible names and states).
- **Visual**: The panel MUST have a visible boundary distinguishing it from the grid header. Chips MUST have visible focus indicators. Drop target highlighting MUST NOT rely on color alone.

**Chameleon 6 Status**: New. Chameleon 6 does not have a drag-to-group panel. Grouping is configured programmatically. Chameleon 7 introduces the interactive panel as a P2 feature.

**Interactions**
- F-04.1 (Single-Level Grouping): adding one chip triggers single-level grouping.
- F-04.2 (Multi-Level Grouping): adding multiple chips triggers multi-level grouping.
- F-09 (Column Management): column headers serve as drag sources for the panel. Column reorder and group panel drag are distinct interactions.
- F-14 (Keyboard Navigation): Tab order includes the group panel.
- F-15 (Theming & Styling): panel and chip appearance are customizable via CSS custom properties and CSS Parts.
- F-22 (Developer Experience): the `groupBy` property reflects the panel state for programmatic access.

---

## 4.7 Custom Group Row Rendering [P1]

**Description**: The developer overrides the default group header row appearance with custom content. Instead of the standard "[Column]: [Value] ([Count])" text, the group header can display images, badges, sparkline charts, progress bars, or any arbitrary DOM structure. This follows the same custom renderer pattern as cell renderers (F-01.1), applied to the group header context.

**Applies to**: Data Grid, Gantt Chart (task list)

**Use Cases**
- UC-1: A CRM grid grouped by "Account" renders each group header with the account's logo image, company name in bold, and a revenue badge showing the account's total pipeline value.
- UC-2: A project tracker grouped by "Sprint" renders the group header with a progress bar showing sprint completion percentage alongside the sprint name and date range.
- UC-3: A support dashboard grouped by "Priority" renders group headers with color-coded severity icons (critical = red diamond, high = orange triangle, medium = yellow circle, low = green square) alongside the priority label and ticket count.
- UC-4: An analytics grid grouped by "Campaign" renders a mini sparkline chart in the group header showing the campaign's performance trend over the last 7 days.

**Conditions of Use**
- The grid MUST accept a custom group row renderer via a configuration property (e.g., `groupRowRenderer: (context: GroupRowContext) => HTMLElement | string`).
- The `GroupRowContext` MUST provide: the group value, the grouping column ID, the group level (for multi-level), the row count, the aggregated values (if any), and the expanded state.
- When no custom renderer is provided, the grid MUST use the default group header rendering (F-04.3).

**Behavioral Requirements**
- BR-1: The custom renderer function MUST receive a context object containing at minimum: `groupValue`, `columnId`, `level` (0-based), `rowCount`, `aggregations` (a map of column ID to aggregated value), `expanded` (boolean), and `groupData` (the full set of row data objects in the group, for complex computations).
- BR-2: The rendered content MUST be placed inside the group header cell. The group header row's structural role (`role="row"`) and the header cell's role (`role="gridcell"`) MUST NOT be affected by the custom renderer.
- BR-3: The expand/collapse toggle affordance MUST be preserved even when custom rendering is used. The grid MUST render the toggle icon/button alongside or within the custom content. The developer MAY suppress the default toggle via a configuration flag (e.g., `showGroupToggle: false`) and provide their own toggle mechanism, but the toggle behavior (Enter/Space, `aria-expanded`) MUST still function.
- BR-4: Custom group row content MUST be focusable as part of the grid's keyboard navigation. If the custom content contains interactive elements (buttons, links), they MUST be navigable within the group header cell using the edit-mode focus model from [FD-03](../01-foundations/03-editability-model.md) (Tab cycles through interactive children when in Edit Mode within the cell).
- BR-5: The custom renderer MUST be called with updated context whenever the group state changes (expanded/collapsed toggle, aggregation recomputation, row count change from filtering). The grid MUST NOT cache stale rendered content.
- BR-6: The grid MUST support both functional renderers (returning DOM elements) and declarative template-based renderers (e.g., HTML template strings or Lit templates) for consistency with cell renderer patterns (F-01.1).
- BR-7: Custom renderers MUST NOT interfere with the group header's ARIA semantics. The `aria-expanded` attribute MUST remain on the group header row regardless of custom content. The custom content's root MUST carry an appropriate `aria-label` or use the visible text as its accessible name.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | N/A. Tree Grid rows use cell renderers (F-01.1) for their content, not group row renderers. |
| Pivot Table | N/A. Pivot Table dimension headers have their own rendering model (F-05). |
| Gantt Chart | Custom group row rendering applies to the task list group headers. The timeline region does not use group row renderers. |

**Accessibility**
- **ARIA**: The group header row MUST retain `role="row"` and `aria-expanded`. The custom content MUST provide an accessible name for the group header cell via `aria-label` or visible text. If the custom content contains images, they MUST have `alt` text. Decorative images MUST be `aria-hidden="true"`.
- **Screen Reader**: The screen reader MUST still announce the group identity and expanded state. If the custom content provides richer information (e.g., "Acme Corp, $2.5M pipeline, 15 opportunities"), that text becomes the announced content: SR: "Acme Corp, $2.5M pipeline, 15 opportunities, group expanded". If the custom content is purely visual (images, charts), `aria-label` MUST provide an equivalent text description.
- **WCAG**: 1.1.1 (non-text content in custom renderers MUST have text alternatives), 1.3.1 (group structure is programmatically determinable regardless of custom rendering), 4.1.2 (custom interactive elements MUST have accessible names and roles).
- **Visual**: Custom rendered content MUST respect the grid's density setting (F-15). Content that exceeds the group header row height SHOULD be clipped with `overflow: hidden` or the row height SHOULD expand to accommodate it (depending on the grid's row height strategy).

**Chameleon 6 Status**: Existed (partially). Chameleon 6 rowset legends support custom content via slot-based rendering within the legend element. Chameleon 7 extends this with a formal renderer function API, context object, and guaranteed ARIA semantics preservation.

**Interactions**
- F-01.1 (Custom Cell Renderers): group row renderers follow the same pattern as cell renderers.
- F-04.3 (Group Headers): custom rendering overrides the default header content.
- F-04.4 (Aggregation Functions): aggregated values are available in the renderer context.
- F-15 (Theming & Styling): custom rendered content should respect density and theme settings.
- F-22 (Developer Experience): the renderer API should be TypeScript-typed with full `GroupRowContext` type definitions.

---

## Cross-Cutting Concerns

### Grouping and Sorting Interaction

When both grouping and sorting are active, the behavior depends on what is being sorted:

- **Sort within groups** (default): The sort column(s) reorder data rows within each group. Group headers remain in their original order (determined by first-occurrence or a separate group sort). This is the most common behavior.
- **Sort groups by aggregated value**: When the user sorts by a column that has an aggregation function, the grid MAY reorder the groups themselves based on the aggregated value (e.g., sort groups by "Sum of Revenue" descending to show the highest-revenue groups first). This behavior MUST be opt-in via a configuration property (e.g., `groupSortMode: "within" | "byAggregation"`).
- **Sort groups alphabetically**: Groups MAY be sorted by their group value (alphabetically or numerically) regardless of data row sort. This is useful when groups represent categories with a natural order.

The grid SHOULD support all three modes. The default MUST be "sort within groups".

### Grouping and Filtering Interaction

Filtering (F-03) MUST be applied before grouping. The sequence is:

1. Apply all active filters to produce the filtered row set.
2. Group the filtered rows.
3. Groups with zero matching rows MUST NOT be displayed.
4. Group header counts and aggregated values MUST reflect the filtered row set, not the full data set.

If the filter changes, the grid MUST re-group and recompute aggregations on the new filtered set.

### Grouping and Virtualization Interaction

Grouped rows participate in virtualization (F-11). Key considerations:

- Collapsed groups contribute only their group header row (and optionally a footer row) to the virtualized row count. Their hidden data rows MUST NOT be measured or rendered.
- Expanding a large group triggers the virtual scroller to recalculate the total row count and scroll height.
- Group header rows and group footer rows are part of the virtual row pool and are rendered/recycled like data rows.

### Grouping and Selection Interaction

When grouping is active:

- Clicking a group header row's checkbox (if selection is enabled via F-08) SHOULD select all data rows within that group.
- If all rows in a group are selected individually, the group header checkbox MUST show a checked state. If some (but not all) are selected, it MUST show an indeterminate state. If none are selected, it MUST show an unchecked state.
- Shift+Click range selection across groups MUST select all visible data rows in the range, skipping group header and footer rows (which are not data rows).

### Grouping and Server-Side Operations

When the grid operates in server-side mode (F-20), grouping state changes MUST be communicated to the server as part of the data request. The server returns grouped data with group metadata (group values, row counts, aggregated values). The grid renders group headers and footers based on server-provided metadata. Expand/collapse MAY trigger additional server requests to fetch group member rows lazily.

---

## Normative Requirements Summary

| ID | Requirement | Level | Feature |
|----|-------------|-------|---------|
| GR-01 | The grid MUST organize rows into groups with group header rows when grouping is configured. | MUST | F-04.1 |
| GR-02 | Group header rows MUST span all columns via `grid-column: 1 / -1` within the subgrid. | MUST | F-04.1 |
| GR-03 | Collapsing a group MUST hide all its data rows from both visual display and accessibility tree. | MUST | F-04.1, F-04.3 |
| GR-04 | The grid MUST use `role="rowgroup"` to wrap each group, NOT `role="treegrid"` semantics. | MUST | F-04.1 |
| GR-05 | Group header rows MUST carry `aria-expanded="true"` or `aria-expanded="false"`. | MUST | F-04.1, F-04.3 |
| GR-06 | Multi-level grouping MUST create nested group structures with independently collapsible levels. | MUST | F-04.2 |
| GR-07 | Collapsing a parent group MUST hide all nested sub-groups and their data rows. | MUST | F-04.2 |
| GR-08 | The grid MUST NOT use `aria-level` on group header rows (reserved for `treegrid`). | MUST | F-04.2 |
| GR-09 | Enter and Space on a group header MUST toggle expand/collapse. | MUST | F-04.3 |
| GR-10 | Group header rows MUST NOT enter Edit Mode. | MUST | F-04.3 |
| GR-11 | When a group collapses and focus is on a hidden row, focus MUST move to the group header. | MUST | F-04.3 |
| GR-12 | The grid MUST support built-in aggregation functions: sum, avg, min, max, count, countAll. | MUST | F-04.4 |
| GR-13 | Aggregated values MUST update automatically when cell values are edited. | MUST | F-04.4 |
| GR-14 | Aggregated cells MUST NOT be editable. | MUST | F-04.4, F-04.5 |
| GR-15 | Group footer rows MUST participate in subgrid layout and share column widths. | MUST | F-04.5 |
| GR-16 | Group footer rows MUST be hidden when their group is collapsed. | MUST | F-04.5 |
| GR-17 | Drag-to-group panel operations MUST be keyboard-accessible. | MUST | F-04.6 |
| GR-18 | Custom group row renderers MUST NOT override `aria-expanded` or `role="row"` semantics. | MUST | F-04.7 |
| GR-19 | Custom group row renderers MUST preserve the expand/collapse toggle behavior. | MUST | F-04.7 |
| GR-20 | Filtering MUST be applied before grouping; empty groups MUST NOT be displayed. | MUST | F-04.1 |
| GR-21 | Group expand/collapse state changes MUST be announced via live region. | MUST | F-04.3 |
| GR-22 | Expand/collapse animations MUST respect `prefers-reduced-motion: reduce`. | MUST | F-04.3 |
| GR-23 | Null/undefined group values MUST be collected into a dedicated group, not silently omitted. | MUST | F-04.1 |
| GR-24 | The grid MUST retain `role="grid"` (not `role="treegrid"`) when grouping is active. | MUST | F-04.1 |
| GR-25 | Aggregation at outer levels MUST aggregate over all data rows, not sub-group aggregations. | MUST | F-04.4 |

---

## Cross-References

| Topic | Reference |
|-------|-----------|
| CSS subgrid layout (group rows as grid items) | [FD-01: Layout Model](../01-foundations/01-layout-model.md) |
| Variant model (grouping applicability per variant) | [FD-02: Variant Model](../01-foundations/02-variant-model.md), Section 3.3 |
| Editability model (group headers not editable) | [FD-03: Editability Model](../01-foundations/03-editability-model.md) |
| Baseline ARIA structure, focus management | [FD-04: Accessibility Foundation](../01-foundations/04-accessibility-foundation.md) |
| Data display and cell renderers | F-01: Data Display & Rendering |
| Sorting (sort within/across groups) | F-02: Sorting |
| Filtering (filter-then-group sequence) | F-03: Filtering |
| Pivoting (dimension-based grouping) | F-05: Pivoting |
| Tree/hierarchical (inherent hierarchy vs grouping) | F-06: Tree / Hierarchical |
| Cell editing (aggregation recomputation) | F-07: Cell Editing |
| Selection (group-level selection) | F-08: Selection |
| Column management (groupable columns) | F-09: Column Management |
| Row management (footer rows as structural) | F-10: Row Management |
| Virtualization (collapsed groups in virtual scroll) | F-11: Virtualization & Performance |
| Keyboard navigation (group header in focus order) | F-14: Keyboard Navigation |
| Theming & styling (group row appearance) | F-15: Theming & Styling |
| Server-side grouping delegation | F-20: Server-Side Operations |
| State persistence (groupBy and expanded states) | F-21: State Persistence & Responsive |
| Developer experience (GroupRowContext types) | F-22: Developer Experience |
