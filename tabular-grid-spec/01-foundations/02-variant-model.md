# FD-02: Variant Model

This foundation defines the four grid variants supported by the tabular grid component. All four variants are at **equal priority level** -- no variant is subordinate or optional. Priority tiers (P0/P1/P2) apply to individual features within variants, not to variants themselves.

Each variant represents a distinct way of presenting tabular data with its own ARIA role, interaction model, and set of use cases. This document establishes what each variant IS, how it differs from the others, and when to choose which.

> **Cross-reference**: The Data Grid baseline ARIA structure is defined in [FD-04: Accessibility Foundation](04-accessibility-foundation.md). Variant-specific ARIA structures, keyboard extensions, and focus management nuances are detailed in Part III (`03-variant-specific/`).

---

## 1. Overview

The tabular grid component operates in exactly one variant at a time. The variant determines:

1. **ARIA role** -- the root role exposed to assistive technology.
2. **Row semantics** -- whether rows are flat, hierarchical, or part of a dual-region layout.
3. **Header structure** -- single-level column headers vs. multi-level row AND column headers.
4. **Navigation model** -- which keyboard interactions are available beyond the baseline.
5. **Feature applicability** -- which features from Part II apply, and how they adapt.

The Data Grid is the **foundational variant**: its ARIA structure, keyboard model, and feature behavior serve as the baseline. The other three variants extend or modify that baseline. Feature specifications in Part II (`02-features/`) describe Data Grid behavior by default; deviations for other variants are called out explicitly under "Variant-Specific Behavior" in each feature.

---

## 2. Variant Definitions

### 2.1 Data Grid

**Description**

The Data Grid presents flat, tabular data in rows and columns. Rows are homogeneous -- each row represents one record with the same set of columns. Optional row grouping (collapsible groups formed by grouping on a column value) adds visual and semantic hierarchy, but the underlying data model remains flat.

**ARIA Role**

```
role="grid"
```

The root container MUST carry `role="grid"`. Within the grid, the role hierarchy MUST follow:

```
grid
  rowgroup          (optional: separates header, body, footer)
    row
      columnheader  (header cells)
      rowheader     (row-identifying cells, if applicable)
      gridcell      (data cells)
```

**Key Characteristics**

- Flat row model with a single header row (or multi-level column headers via column groups).
- All features in Part II apply to the Data Grid unless explicitly excluded.
- Row grouping uses `rowgroup` with `aria-expanded` on group header rows -- this is NOT a Tree Grid; grouped rows are flat data organized by shared values, not parent-child hierarchy.
- Supports sorting, filtering, cell editing, row/cell/column/range selection, column management, virtualization, export, and all other standard grid features.

**When to Use**

- Displaying flat tabular data (database tables, API results, list views).
- Data with sorting, filtering, pagination, or search requirements.
- CRUD interfaces with inline editing.
- Tabular data where every row has the same schema.
- Data with optional value-based grouping (e.g., group by department).

**When NOT to Use**

- Data with inherent parent-child relationships at arbitrary depth -- use **Tree Grid**.
- Cross-tabulated data with row and column dimensions requiring aggregation -- use **Pivot Table**.
- Project scheduling data that requires temporal visualization -- use **Gantt Chart**.

**Relationship to Other Variants**

The Data Grid is the baseline. Tree Grid extends it with hierarchy semantics. Pivot Table extends it with multi-axis headers and aggregation. Gantt Chart pairs it with a timeline region. All features defined for the Data Grid are inherited by other variants unless their feature specification states otherwise.

---

### 2.2 Tree Grid

**Description**

The Tree Grid presents hierarchical, parent-child data with arbitrary nesting depth. Each row exists at a specific level in the hierarchy, and parent rows can be expanded or collapsed to reveal or hide their children. The Tree Grid combines the two-dimensional cell navigation of a grid with the expand/collapse semantics of a tree view.

**ARIA Role**

```
role="treegrid"
```

The root container MUST carry `role="treegrid"`. The internal role hierarchy is the same as a Data Grid (`rowgroup` > `row` > `gridcell`/`columnheader`/`rowheader`), but each body row MUST carry additional ARIA attributes:

| Attribute | Requirement | Description |
|-----------|-------------|-------------|
| `aria-level` | MUST on every body row | The depth of the row in the hierarchy (1-based). |
| `aria-setsize` | MUST on every body row | The number of siblings at this level within the same parent. |
| `aria-posinset` | MUST on every body row | The 1-based position of this row among its siblings. |
| `aria-expanded` | MUST on parent rows only | `"true"` when expanded, `"false"` when collapsed. MUST NOT appear on leaf rows. |

**Key Characteristics**

- Hierarchical row model with arbitrary nesting depth.
- Parent rows are expandable/collapsible; leaf rows are not.
- Children of a collapsed parent MUST NOT be present in the DOM (or MUST be hidden from the accessibility tree).
- Supports lazy-loading of children on first expand.
- Indentation MUST be visual (CSS) AND semantic (`aria-level`). Screen readers use `aria-level` to announce depth; visual indentation provides the sighted equivalent.
- Sorting and filtering MAY apply within each level or globally, but MUST preserve parent-child relationships. A child row MUST NOT appear without its ancestor chain.

**When to Use**

- Data with inherent parent-child relationships (file systems, organizational hierarchies, bills of materials, category trees).
- Nested data where users need to expand/collapse branches to manage information density.
- Hierarchical data that also needs columnar display (unlike a plain tree view which has no columns).

**When NOT to Use**

- Flat data with value-based grouping (e.g., group by region) -- use **Data Grid** with row grouping. The distinction: grouped Data Grid rows share a column value; Tree Grid rows have intrinsic parent-child relationships in the data model.
- Cross-tabulated aggregation with row and column dimensions -- use **Pivot Table**.
- Data that does not have a natural hierarchy -- forcing a tree structure on flat data harms usability and accessibility.

**Relationship to Other Variants**

The Tree Grid inherits all Data Grid features except those incompatible with hierarchy (e.g., flat row reorder by drag becomes reparenting by drag -- see `F-10`). It adds expand/collapse navigation keys (Right Arrow to expand, Left Arrow to collapse or navigate to parent -- see `F-14`). It extends the focus model to handle expand/collapse transitions (focus stays on the toggled row). The Gantt Chart's task list region MAY itself be a Tree Grid when work-breakdown-structure (WBS) hierarchy is needed.

---

### 2.3 Pivot Table

**Description**

The Pivot Table presents aggregated data at the intersection of multi-level row dimensions and multi-level column dimensions. Unlike a Data Grid where each row is a record and each column is a field, a Pivot Table's rows and columns represent dimension values, and its data cells contain computed aggregations (sum, count, average, etc.) over the records that match the intersection of those dimension values.

**ARIA Role**

```
role="grid" aria-roledescription="pivot table"
```

The root container MUST carry `role="grid"` with `aria-roledescription="pivot table"`. The `aria-roledescription` overrides the default "grid" announcement, giving screen reader users immediate context about the component type.

**Key Characteristics**

- Multi-level column headers: column dimensions are stacked vertically (e.g., Year > Quarter), with parent headers spanning child headers via `aria-colspan`.
- Multi-level row headers: row dimensions are stacked horizontally (e.g., Region > Product), with parent row headers spanning child rows via `aria-rowspan`.
- Data cells show aggregated values, not raw record values.
- Header-to-cell association MUST be explicit: each data cell MUST reference all contributing row headers and column headers via the `headers` attribute (recommended) or `aria-labelledby`. This is critical because implicit positional association breaks down with spanning headers.
- Grand total rows and grand total columns MUST contain explicit "Grand Total" text -- not just styling.
- Dynamic reconfiguration: when the user changes dimensions or aggregation, the entire column/row structure rebuilds. The grid MUST set `aria-busy="true"` during reconfiguration, update `aria-colcount`/`aria-rowcount`, and announce the change via `aria-live`.

**When to Use**

- Cross-tabulating data with row and column dimensions plus value aggregation (sales by region and quarter, defects by severity and component).
- Business intelligence dashboards where users need to slice and dice data along multiple axes.
- Scenarios where the same dataset needs to be viewed from different dimensional perspectives.

**When NOT to Use**

- Flat tabular data without cross-tabulation -- use **Data Grid**.
- Hierarchical data where rows represent parent-child entities, not dimension values -- use **Tree Grid**.
- Data where users need to edit individual record values -- Pivot Table cells are aggregations. Drill-down MAY reveal underlying records in a separate Data Grid, but the Pivot Table itself is read-only at the aggregation level.

**Relationship to Other Variants**

The Pivot Table shares the base `role="grid"` with the Data Grid but diverges significantly in header structure. Features that depend on the "one row = one record" assumption (cell editing, row selection with checkbox, row reorder) do NOT apply to the Pivot Table in their standard form. Features that operate on columns (sorting, column resize, column freeze) apply but interact with the multi-level header structure. Filtering applies at the dimension level (e.g., filter which regions to include). The Pivot Table's detailed ARIA structure is specified in `03-variant-specific/02-pivot-table.md`.

---

### 2.4 Gantt Chart

**Description**

The Gantt Chart is a dual-region component that combines a structured task list with a graphical timeline. The task list region is a standard grid (or Tree Grid for WBS hierarchy). The timeline region visualizes task durations as horizontal bars, dependencies as arrows, and milestones as diamond markers along a time axis.

**ARIA Role**

The Gantt Chart does NOT have a single root role. Instead, it is composed of two regions wrapped in a landmark:

```
region (aria-label="Gantt Chart: [name]")
  grid (or treegrid)    -- Task list
  application           -- Timeline
```

| Region | Role | Description |
|--------|------|-------------|
| Outer wrapper | `role="region"` with `aria-label` | Groups the two regions into a single landmark. |
| Task list | `role="grid"` or `role="treegrid"` | Standard grid for task properties (name, assignee, dates, progress). Uses `role="treegrid"` when tasks have WBS hierarchy. |
| Timeline | `role="application"` with `aria-roledescription="timeline"` | Graphical bar chart area. `role="application"` disables screen reader browse mode, enabling custom keyboard shortcuts for bar manipulation. |

**Key Characteristics**

- **Dual-region architecture**: the task list and timeline are separate ARIA structures connected by shared row identity. Tab moves focus between the two regions.
- **`role="application"` on timeline ONLY**: this role disables the screen reader's virtual/browse mode shortcuts (H for headings, T for tables, etc.). It MUST be applied only to the timeline region, NEVER to the task list or the outer wrapper. A keyboard help mechanism (`aria-describedby` pointing to help text) MUST be provided.
- **Task bars** in the timeline MUST carry `role="img"` with a comprehensive `aria-label` that includes: task name, date range, completion percentage, and assignee. A nested `role="progressbar"` exposes completion. Dependencies MUST be described via `aria-describedby` pointing to hidden text.
- **Milestones** use `role="img"` with `aria-roledescription="milestone"`.
- **Summary tasks** (parent bars) use `role="img"` with `aria-roledescription="summary task"` and `aria-expanded` to indicate subtask visibility.
- **Today marker** uses `aria-current="date"`.
- **Timeline navigation**: arrow keys move/resize bars, `+`/`-` zoom the time scale, and scale changes MUST be announced via `aria-live`.
- **Cross-region synchronization**: scrolling the task list vertically MUST synchronize the timeline and vice versa. Selecting a task in the task list MUST highlight the corresponding bar in the timeline.

**When to Use**

- Project scheduling and task management with temporal visualization.
- Work breakdown structures where tasks have durations, dependencies, and milestones.
- Resource planning where task timing and sequencing are essential to understanding.

**When NOT to Use**

- Displaying tabular data without a time dimension -- use **Data Grid** or **Tree Grid**.
- Aggregated cross-tabulations -- use **Pivot Table**.
- Simple timelines without task properties (columns) -- a standalone timeline component would be more appropriate than a Gantt Chart.

**Relationship to Other Variants**

The Gantt Chart's task list region IS a Data Grid (or Tree Grid). All features that apply to the Data Grid also apply to the task list region. The timeline region is entirely separate -- it does not use grid ARIA semantics and has its own keyboard model. Features like sorting and filtering apply to the task list and automatically reorder the corresponding timeline bars. Column features (resize, reorder, freeze) apply to the task list columns only. Selection in the task list synchronizes to timeline bar highlighting. The Gantt Chart's detailed structure is specified in `03-variant-specific/01-gantt-chart.md`.

---

## 3. Variant Comparison

### 3.1 Structural Comparison

| Aspect | Data Grid | Tree Grid | Pivot Table | Gantt Chart |
|--------|-----------|-----------|-------------|-------------|
| **Root ARIA role** | `grid` | `treegrid` | `grid` + `aria-roledescription="pivot table"` | `region` > `grid`/`treegrid` + `application` |
| **Row model** | Flat (one record per row) | Hierarchical (parent-child, arbitrary depth) | Dimension-based (row header hierarchy) | Task-based (flat or WBS hierarchy) |
| **Column headers** | Single-level (or grouped) | Single-level (or grouped) | Multi-level (dimension stacking) | Single-level (task list only) |
| **Row headers** | Optional (`rowheader` role) | Implicit (first cell is tree node) | Multi-level (dimension stacking) | None (task list columns) |
| **Data cell content** | Raw record values | Raw record values | Aggregated values | Raw task properties |
| **Regions** | Single | Single | Single | Dual (task list + timeline) |
| **`aria-expanded`** | On group header rows (optional) | On parent rows (required) | Not applicable | On summary task rows/bars |
| **`aria-level`** | Not applicable | Required on every body row | Not applicable | Required when task list uses `treegrid` |

### 3.2 Keyboard Model Comparison

| Key | Data Grid | Tree Grid | Pivot Table | Gantt Chart (Task List) | Gantt Chart (Timeline) |
|-----|-----------|-----------|-------------|------------------------|----------------------|
| Arrow Up/Down | Move between rows | Move between visible rows | Move between rows | Move between rows | Move to prev/next bar |
| Arrow Left/Right | Move between cells | Move between cells; Left on expanded parent collapses; Left on child moves to parent; Right on collapsed parent expands | Move between cells | Move between cells | Move bar start date |
| Enter | Begin editing / activate | Begin editing / activate | Drill down (show underlying records) | Begin editing / activate | Open task editor |
| Space | Toggle selection | Toggle selection | N/A | Toggle selection | N/A |
| Tab | Exit grid | Exit grid | Exit grid | Move to timeline region | Move to task list region |
| Home / End | First/last cell in row | First/last cell in row | First/last cell in row | First/last cell in row | First/last bar |
| Ctrl+Home/End | First/last cell in grid | First/last cell in grid | First/last cell in grid | First/last cell in grid | First/last bar in project |
| +/- | N/A | N/A | N/A | N/A | Zoom timeline scale |

> Full keyboard reference: see [Appendix A](../04-appendices/A-keyboard-reference.md) and [F-14: Keyboard Navigation](../02-features/14-keyboard-navigation.md).

### 3.3 Feature Applicability Matrix

This matrix indicates whether major feature categories apply to each variant. "Yes" means the feature applies in its standard form. "Modified" means the feature applies but with variant-specific adaptations (documented in the feature's "Variant-Specific Behavior" section). "No" means the feature does not apply.

| Feature Category | Data Grid | Tree Grid | Pivot Table | Gantt Chart (Task List) | Gantt Chart (Timeline) |
|-----------------|-----------|-----------|-------------|------------------------|----------------------|
| Cell rendering (F-01) | Yes | Yes | Modified (aggregation display) | Yes | No (bars, not cells) |
| Sorting (F-02) | Yes | Modified (per-level or global) | Modified (dimension-level) | Yes | N/A (synced with task list) |
| Filtering (F-03) | Yes | Modified (preserves ancestors) | Modified (dimension filtering) | Yes | N/A (synced with task list) |
| Grouping (F-04) | Yes | No (inherent hierarchy) | No (dimensions replace grouping) | Modified (WBS grouping) | N/A |
| Pivoting (F-05) | Yes (switch to Pivot mode) | No | Core feature | No | No |
| Tree/hierarchical (F-06) | No | Core feature | No | Modified (WBS) | No |
| Cell editing (F-07) | Yes | Yes | No (aggregated values) | Yes | Modified (bar drag) |
| Selection (F-08) | Yes | Yes | Modified (cell only) | Yes | Modified (bar selection) |
| Column management (F-09) | Yes | Yes | Modified (dynamic columns) | Yes | No |
| Row management (F-10) | Yes | Modified (reparenting) | No | Modified (task-specific) | No |
| Virtualization (F-11) | Yes | Yes | Yes | Yes | Modified (virtual horizontal) |
| Export (F-12) | Yes | Yes | Yes | Modified (task list only) | No |
| Internationalization (F-13) | Yes | Yes | Yes | Yes | Yes |
| Keyboard navigation (F-14) | Yes | Modified (tree keys) | Modified (drill-down) | Yes | Modified (timeline keys) |
| Theming/styling (F-15) | Yes | Yes | Yes | Yes | Yes |
| Context menus (F-16) | Yes | Yes | Yes | Yes | Modified (bar context menu) |
| Undo/redo (F-17) | Yes | Yes | No | Yes | Yes (bar moves) |
| Validation (F-18) | Yes | Yes | No | Yes | No |
| Formulas (F-19) | Yes | Yes | No | No | No |
| Server-side ops (F-20) | Yes | Yes | Yes | Yes | No |
| State persistence (F-21) | Yes | Yes | Yes | Yes | Yes |
| Developer experience (F-22) | Yes | Yes | Yes | Yes | Yes |

---

## 4. Variant Selection Guide

### 4.1 Decision Criteria

When deciding which variant to use, evaluate the data and the user task:

| Question | If Yes... |
|----------|-----------|
| Is the data flat (each record independent, same schema)? | **Data Grid** |
| Does the data have intrinsic parent-child relationships at arbitrary depth? | **Tree Grid** |
| Do you need to cross-tabulate data along row and column dimensions with aggregation? | **Pivot Table** |
| Do tasks have durations, dependencies, and temporal relationships that need visualization? | **Gantt Chart** |
| Is the data flat but you want collapsible grouping by shared column values? | **Data Grid** with row grouping (NOT Tree Grid) |
| Is the data hierarchical AND you need a temporal timeline? | **Gantt Chart** with `treegrid` task list |

### 4.2 Common Misapplications

Implementers MUST avoid these misapplications:

1. **Using Tree Grid for flat data with grouping.** Grouped rows in a Data Grid share a column value (e.g., all rows where Department = "Engineering"). Tree Grid rows have intrinsic parent-child relationships in the data model (e.g., a folder contains files). If the hierarchy disappears when you remove the grouping column, it is Data Grid grouping, not a Tree Grid.

2. **Using Data Grid for hierarchical data.** If the data has inherent parent-child nesting (not derived from grouping a column), a Data Grid with grouping will produce an incorrect accessibility tree. Use Tree Grid so that `aria-level`, `aria-setsize`, and `aria-posinset` correctly describe the hierarchy.

3. **Using Pivot Table for simple grouped totals.** If you only need subtotals per group within a flat list, use Data Grid with group footers (F-04). Pivot Table is for cross-tabulation where BOTH row and column axes are dimensions.

4. **Using `role="treegrid"` on Gantt task lists that are flat.** If the task list has no WBS hierarchy, use `role="grid"`. Only use `role="treegrid"` when tasks have actual parent-child (summary task / subtask) relationships.

5. **Applying `role="application"` beyond the timeline.** In a Gantt Chart, `role="application"` MUST be scoped to the timeline region only. Applying it to the task list or outer wrapper removes screen reader browse mode from areas where it is needed.

---

## 5. Variant Configuration

The grid component MUST accept a variant configuration that determines which mode it operates in. The variant MUST be set at initialization and SHOULD NOT change at runtime (switching variants requires reconstructing the ARIA structure, which causes disruptive screen reader behavior).

The variant determines:

1. The root ARIA role applied to the grid container.
2. Which row-level ARIA attributes are required (e.g., `aria-level` for Tree Grid).
3. Which keyboard extensions are active (e.g., tree expand/collapse keys).
4. Which features are enabled, modified, or disabled per the applicability matrix in Section 3.3.
5. Whether the component renders as a single region or dual regions (Gantt Chart).

If no variant is specified, the component MUST default to **Data Grid**.

---

## 6. Normative Requirements Summary

The following table summarizes the normative (MUST/SHOULD/MAY) requirements established in this document.

| ID | Requirement | Level |
|----|-------------|-------|
| VR-01 | The grid component MUST operate in exactly one variant at a time. | MUST |
| VR-02 | The Data Grid MUST use `role="grid"` on the root container. | MUST |
| VR-03 | The Tree Grid MUST use `role="treegrid"` on the root container. | MUST |
| VR-04 | The Tree Grid MUST set `aria-level`, `aria-setsize`, and `aria-posinset` on every body row. | MUST |
| VR-05 | The Tree Grid MUST set `aria-expanded` on parent rows only. Leaf rows MUST NOT carry `aria-expanded`. | MUST |
| VR-06 | The Pivot Table MUST use `role="grid"` with `aria-roledescription="pivot table"`. | MUST |
| VR-07 | The Pivot Table MUST explicitly associate data cells with all contributing row and column headers via `headers` or `aria-labelledby`. | MUST |
| VR-08 | The Gantt Chart MUST wrap its two regions in `role="region"` with `aria-label`. | MUST |
| VR-09 | The Gantt Chart's task list MUST use `role="grid"` or `role="treegrid"`. | MUST |
| VR-10 | The Gantt Chart's timeline MUST use `role="application"` with `aria-roledescription="timeline"`. | MUST |
| VR-11 | `role="application"` MUST NOT be applied to the task list or outer wrapper of a Gantt Chart. | MUST |
| VR-12 | The Gantt Chart MUST provide a keyboard help mechanism via `aria-describedby`. | MUST |
| VR-13 | Children of a collapsed Tree Grid parent MUST NOT be visible in the accessibility tree. | MUST |
| VR-14 | Pivot Table grand total headers MUST contain explicit "Grand Total" text. | MUST |
| VR-15 | If no variant is specified, the component MUST default to Data Grid. | MUST |
| VR-16 | The variant SHOULD NOT change at runtime after initialization. | SHOULD |
| VR-17 | Timeline task bars MUST expose task name, date range, completion, and assignee via `aria-label`. | MUST |
| VR-18 | Timeline scale changes SHOULD be announced via `aria-live`. | SHOULD |
| VR-19 | The Gantt Chart's today marker SHOULD use `aria-current="date"`. | SHOULD |
| VR-20 | Tree Grid sorting MAY apply within each level or globally, but MUST preserve parent-child relationships. | MUST |
