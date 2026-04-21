# F-05: Pivoting

Pivoting transforms flat tabular data into a cross-tabulated view where row values become column headers and cell values show aggregated data at the intersections. This feature category covers pivot mode activation, multi-dimension pivoting, pivot aggregation, auto-generated pivot columns, dimension configuration, the field selector panel, and dynamic column reconfiguration.

Pivoting applies exclusively to the Pivot Table variant. The Data Grid may offer a "switch to pivot mode" entry point (which transitions the variant to Pivot Table), but the actual pivoting features described here operate within the Pivot Table context. Chameleon 6 had no pivot support; all features in this category are new for Chameleon 7.

> **Foundations**: This feature assumes the layout model defined in [FD-01](../01-foundations/01-layout-model.md). Pivot columns are generated dynamically and participate in the subgrid track list; `aria-colcount` MUST be updated to reflect the actual column count after pivot layout is computed. The variant model in [FD-02](../01-foundations/02-variant-model.md) defines the Pivot Table's ARIA structure (`role="grid"` with `aria-roledescription="pivot table"`). The ARIA structural model for multi-axis headers and header-to-cell association is defined in [03-variant-specific/02-pivot-table.md](../03-variant-specific/02-pivot-table.md).

> **Market context**: Full pivot table support is rare among JavaScript grid libraries. Only AG Grid Enterprise and MUI X Premium offer complete pivot functionality comparable to Excel PivotTables. This spec targets full OLAP-style capability.

---

## 5.1 Pivot Mode [P1]

**Description**: Pivot mode transforms the grid's data layout from a flat row-per-record view into a cross-tabulated view where distinct values from one or more source fields become column headers, and data cells display aggregated values at the intersections of row and column dimensions. This is the foundational capability that distinguishes a Pivot Table from a Data Grid -- without it, the Pivot Table variant cannot function.

**Applies to**: Pivot Table only

**Use Cases**
- UC-1: A sales analyst has a flat dataset of transactions with columns for Region, Quarter, and Revenue. Activating pivot mode with Region as the row dimension and Quarter as the column dimension produces a cross-tabulated view where each cell shows total revenue for a region-quarter combination.
- UC-2: A support manager pivots a ticket log by Severity (rows) and Status (columns) to see how many tickets of each severity are in each status, replacing a flat list of thousands of tickets with a compact summary matrix.
- UC-3: A product team pivots user feedback by Feature Area (rows) and Sentiment (columns) to quickly identify which features have the most negative feedback.

**Conditions of Use**
- The grid MUST be operating in the Pivot Table variant (per [FD-02](../01-foundations/02-variant-model.md), Section 2.3).
- At least one field MUST be designated as a row dimension, at least one field as a column dimension, and at least one field as a value field with an aggregation function (see F-05.5 for configuration).
- The data source MUST contain the raw, unaggregated records. The grid performs the aggregation internally (or delegates to a server in server-side mode per F-20).

**Behavioral Requirements**
- BR-1: When pivot mode is active, the grid MUST transform the flat data source into a cross-tabulated layout where column dimension values become column headers and row dimension values become row headers.
- BR-2: Each data cell in the pivoted view MUST display the result of applying the configured aggregation function (F-05.3) to all source records that match the intersection of the cell's row dimension values and column dimension values.
- BR-3: The grid MUST NOT display individual source records in the pivoted view. Source records are aggregated; the pivoted grid shows summary data only. Drill-down to underlying records is a separate interaction (see Interactions).
- BR-4: The grid MUST compute the pivot layout before rendering. The initial render MUST show the fully pivoted view -- the grid MUST NOT briefly flash the flat data before pivoting.
- BR-5: When the data source is updated (records added, removed, or modified), the grid MUST recompute the pivot aggregations and update affected cells. If a new distinct value appears in a column dimension field, a new column MUST be generated (see F-05.4).
- BR-6: The grid MUST emit a `pivotModeChanged` event when pivot mode is activated or deactivated, containing the new mode state and the current dimension configuration.
- BR-7: Rows and columns in the pivoted view MUST be sortable (per F-02). Sorting a value column sorts rows by the aggregated values in that column. Sorting a row dimension column sorts by the dimension member labels.

**CSS Subgrid Implications**

Pivot mode fundamentally changes the column structure. The subgrid track list (per [FD-01](../01-foundations/01-layout-model.md)) MUST be rebuilt when pivot mode is activated because the number and identity of columns change. Each auto-generated pivot column (F-05.4) becomes a new track in the grid template. The root grid container's `grid-template-columns` MUST be updated to reflect the pivoted column set, and all rows MUST continue using `grid-template-columns: subgrid` to maintain alignment.

**Accessibility**
- **ARIA**: The grid MUST carry `role="grid"` with `aria-roledescription="pivot table"` (per [FD-02](../01-foundations/02-variant-model.md)). `aria-colcount` and `aria-rowcount` MUST reflect the pivoted dimensions (not the source record count). Each data cell MUST be associated with its row and column headers via the `headers` attribute or `aria-labelledby` (per the structural model in `03-variant-specific/02-pivot-table.md`).
- **Screen Reader**: When pivot mode is activated, a live region (`role="status"`, `aria-live="polite"`) MUST announce: SR: "Pivot table view. [N] rows by [M] columns. Rows grouped by [row dimension names]. Columns grouped by [column dimension names]."
- **WCAG**: 1.3.1 (table structure is programmatically determinable via ARIA roles and header associations), 1.3.2 (meaningful reading order maintained in pivot layout), 4.1.2 (each cell's role and relationship to headers is programmatically determinable).
- **Visual**: The pivot layout MUST visually distinguish row headers from data cells (e.g., via background color, font weight, or border treatment). Column dimension headers MUST be visually distinguishable from regular column headers.

**Chameleon 6 Status**: New feature. Chameleon 6 had no pivot support.

**Interactions**
- F-05.2 (Multi-Dimension Pivoting): extends single-dimension pivoting to multiple axes.
- F-05.3 (Pivot with Aggregation): defines how cell values are computed.
- F-05.4 (Auto-Generated Pivot Columns): defines how columns are created from data.
- F-05.5 (Dimension Configuration): defines the configuration API.
- F-05.6 (Pivot Field Selector Panel): provides the UI for configuring pivot mode.
- F-05.7 (Dynamic Column Reconfiguration): handles structural changes when pivot dimensions change.
- F-02 (Sorting): sorting applies to pivoted rows and columns.
- F-03 (Filtering): filtering applies at the dimension level (include/exclude dimension members).
- F-09 (Column Management): pivot columns support resize and reorder within their dimension level.
- F-11 (Virtualization): pivoted views with many generated columns benefit from column virtualization.
- F-20 (Server-Side Operations): pivot aggregation may be delegated to the server.

---

## 5.2 Multi-Dimension Pivoting [P1]

**Description**: Multi-dimension pivoting allows the user to pivot on multiple row dimensions and multiple column dimensions simultaneously, producing nested headers that represent the dimensional hierarchy. For example, pivoting with Region and Product as row dimensions and Year and Quarter as column dimensions produces a four-dimensional cross-tabulation with nested row headers and nested column headers. This is the full OLAP-style capability that distinguishes an enterprise pivot table from a simple crosstab.

**Applies to**: Pivot Table only

**Use Cases**
- UC-1: A finance team pivots revenue data by Region > Country (row dimensions) and Year > Quarter (column dimensions) to produce a geographic and temporal breakdown of sales performance with four levels of nesting.
- UC-2: A supply chain analyst pivots inventory data by Warehouse > Product Category (rows) and Month > Week (columns) to identify stock patterns at granular levels of both location and time.
- UC-3: An HR team pivots headcount data by Department > Team (rows) and Employment Type > Gender (columns) to produce a diversity matrix broken down by organizational structure.

**Conditions of Use**
- The grid MUST support at least 3 row dimensions and at least 3 column dimensions simultaneously. Implementations SHOULD support an unlimited number of dimensions.
- Each dimension field MUST be a column from the original data source.
- The order of dimensions within the rows area and within the columns area determines the nesting hierarchy (first dimension is outermost, last is innermost).

**Behavioral Requirements**
- BR-1: When multiple row dimensions are configured, the grid MUST produce nested row headers where the outermost dimension spans multiple rows and the innermost dimension appears on individual rows. Parent row headers MUST use `aria-rowspan` (or equivalent `rowspan`) to span their children.
- BR-2: When multiple column dimensions are configured, the grid MUST produce nested column headers where the outermost dimension appears at the top level and the innermost dimension appears at the bottom level closest to the data cells. Parent column headers MUST use `aria-colspan` (or equivalent `colspan`) to span their children.
- BR-3: The nesting order MUST match the order of dimensions in the configuration. Reordering dimensions in the configuration (e.g., moving Country above Region) MUST restructure the headers accordingly.
- BR-4: Each data cell MUST be associated with ALL of its contributing row headers and ALL of its contributing column headers across every dimension level. The `headers` attribute (or `aria-labelledby`) MUST list all ancestor headers at every nesting level.
- BR-5: The grid MUST support expand/collapse on dimension groups in the row area. Collapsing a parent dimension value (e.g., collapsing "North America" in a Region > Country hierarchy) MUST hide all child rows and show an aggregated summary row for the collapsed parent.
- BR-6: The grid MUST support expand/collapse on dimension groups in the column area. Collapsing a parent column dimension value MUST hide child columns and show an aggregated summary column.
- BR-7: The total number of data columns in the pivoted view equals the product of distinct values across all column dimensions (e.g., 4 years times 4 quarters = 16 columns per value field). The grid MUST handle this combinatorial expansion and update `aria-colcount` accordingly.
- BR-8: When a dimension has no data for a particular combination (e.g., no sales in Q3 for a specific region), the corresponding cell MUST display a placeholder value (null, zero, or a configured empty indicator) rather than omitting the row or column.

**CSS Subgrid Implications**

Multi-level column headers require multiple header rows in the DOM, each participating in the subgrid. The outermost dimension header row contains cells that span multiple subgrid tracks (via `grid-column: span N`). All header rows MUST use `grid-template-columns: subgrid` to maintain alignment with data rows. When dimensions are added or removed, the number of header rows changes and the grid template MUST be rebuilt.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Arrow Left/Right | Navigate between sibling dimension headers at the same level | Navigation Mode, focus on dimension header |
| Arrow Up/Down | Navigate between dimension levels (parent to child header, or header to data row) | Navigation Mode, focus on dimension header |
| Enter | Expand or collapse the focused dimension group (toggle `aria-expanded`) | Navigation Mode, focus on expandable dimension header |
| Space | Expand or collapse the focused dimension group | Navigation Mode, focus on expandable dimension header |

**Accessibility**
- **ARIA**: Multi-level row headers MUST use `aria-rowspan` to indicate how many rows they span. Multi-level column headers MUST use `aria-colspan` to indicate how many columns they span. Each header cell MUST carry `role="rowheader"` or `role="columnheader"` as appropriate. Expandable dimension headers MUST carry `aria-expanded="true"` or `aria-expanded="false"`.
- **Screen Reader**: When navigating to a data cell, the screen reader MUST announce all contributing headers at every dimension level. For example: SR: "North America, United States, Q1 2024, Revenue, 1,250,000". When a dimension group is expanded or collapsed, a live region MUST announce: SR: "[Dimension value] expanded, showing [N] items" or SR: "[Dimension value] collapsed".
- **WCAG**: 1.3.1 (multi-level header structure is programmatically determinable via spanning attributes and header associations), 4.1.2 (expand/collapse state is exposed via `aria-expanded`).
- **Visual**: Nested headers MUST be visually distinguished by level (e.g., indentation, background shading, or border treatment). Expand/collapse affordances (caret icons) MUST be visible on expandable dimension headers.

**Chameleon 6 Status**: New feature. Chameleon 6 had no pivot support.

**Interactions**
- F-05.1 (Pivot Mode): multi-dimension extends the base pivot capability.
- F-05.3 (Pivot with Aggregation): aggregation applies to each dimension-combination intersection.
- F-05.4 (Auto-Generated Pivot Columns): columns are generated for each unique combination of column dimension values.
- F-05.5 (Dimension Configuration): configuration specifies the ordered list of row and column dimensions.
- F-05.6 (Pivot Field Selector Panel): drag-and-drop reordering of dimensions changes the nesting hierarchy.
- F-05.7 (Dynamic Column Reconfiguration): adding or removing a dimension triggers structural reconfiguration.
- F-01.8 (Multi-Level Column Headers): the pivot's nested column headers reuse the multi-level header rendering infrastructure.
- F-14 (Keyboard Navigation): navigation through multi-level headers follows the structural hierarchy.

---

## 5.3 Pivot with Aggregation [P1]

**Description**: Pivot cells display aggregated values computed from the source records that match a given row-column dimension intersection. Since multiple source rows typically map to a single pivot cell, an aggregation function (sum, count, average, min, max, or custom) is essential to produce a meaningful single value. Without aggregation, pivot mode cannot function -- this feature is a mandatory companion to F-05.1.

**Applies to**: Pivot Table only

**Use Cases**
- UC-1: A sales dashboard pivots transactions by Product (rows) and Region (columns) with a SUM aggregation on Revenue, showing total revenue per product per region.
- UC-2: A customer service report pivots tickets by Agent (rows) and Month (columns) with a COUNT aggregation, showing how many tickets each agent resolved per month.
- UC-3: An engineering metrics dashboard pivots build results by Team (rows) and Week (columns) with an AVERAGE aggregation on Build Duration, showing the average build time per team per week.
- UC-4: A procurement report pivots purchase orders by Vendor (rows) and Category (columns) with both SUM on Amount and COUNT on Order ID as separate value columns, producing two data columns per column dimension value.

**Conditions of Use**
- Each value field in the dimension configuration (F-05.5) MUST have an associated aggregation function.
- The grid MUST support at least the following built-in aggregation functions: `sum`, `count`, `avg` (average), `min`, `max`, `countDistinct`.
- The grid MUST support custom aggregation functions provided by the developer.

**Behavioral Requirements**
- BR-1: The grid MUST compute the aggregation for each pivot cell by collecting all source records that match the cell's row dimension values AND column dimension values, then applying the configured aggregation function to the value field.
- BR-2: The grid MUST support multiple value fields simultaneously. When multiple value fields are configured (e.g., SUM of Revenue and COUNT of Orders), each column dimension value MUST produce one data column per value field. The value field name MUST appear as the innermost column header level.
- BR-3: The built-in aggregation functions MUST behave as follows:
  - `sum`: Sum of all non-null numeric values. Result is 0 if no non-null values exist.
  - `count`: Count of all non-null values (any type).
  - `avg`: Arithmetic mean of all non-null numeric values. Result is null if no non-null values exist.
  - `min`: Minimum value among all non-null values (numeric or date comparison).
  - `max`: Maximum value among all non-null values (numeric or date comparison).
  - `countDistinct`: Count of unique non-null values.
- BR-4: Custom aggregation functions MUST receive an array of values (from matching source records) and MUST return a single aggregated value. The function signature MUST be: `(values: any[], rowData: RowData[]) => any`. Providing the full row data array allows aggregations that depend on multiple fields.
- BR-5: The grid MUST compute grand totals for each row (aggregating across all column dimension values) and for each column (aggregating across all row dimension values). A grand total cell at the intersection of the row and column totals MUST aggregate all source records.
- BR-6: Grand total rows and columns MUST be toggleable via configuration (e.g., `showGrandTotalRow: boolean`, `showGrandTotalColumn: boolean`). Both SHOULD default to `true`.
- BR-7: The grid MUST support subtotals at each dimension level in multi-dimension pivoting (F-05.2). For example, in a Region > Country row hierarchy, a subtotal row for each Region MUST aggregate all Countries within that Region. Subtotals MUST be toggleable per dimension level.
- BR-8: Aggregation MUST be recalculated when the data source changes (records added, removed, or modified). Only affected cells need to be updated -- the grid SHOULD optimize by tracking which dimension combinations are affected by the change.
- BR-9: The grid MUST handle null and undefined values in value fields gracefully. Null values MUST be excluded from numeric aggregations (sum, avg, min, max) but included in count (as non-null check) only if the value is not null. The behavior MUST be consistent and documented.

**Editability Interaction**

Pivot cells are aggregated values and MUST NOT be directly editable. Users cannot meaningfully edit an aggregation (changing a SUM does not indicate which source record should change). However, drill-down (navigating to the underlying source records) MAY open an editable Data Grid view. See Interactions.

**Accessibility**
- **ARIA**: Grand total row headers MUST contain explicit text "Grand Total" (per [FD-02](../01-foundations/02-variant-model.md), VR-14). Subtotal row headers MUST contain text identifying the aggregation level (e.g., "North America Total"). Each aggregated data cell MUST expose its computed value as text content accessible to screen readers.
- **Screen Reader**: When a screen reader user navigates to a pivot data cell, the announced value MUST be the aggregated result formatted according to the value field's formatter. For grand total cells: SR: "Grand Total, [Column dimension value], [aggregated value]". For subtotal cells: SR: "[Parent dimension value] Total, [Column dimension value], [aggregated value]".
- **WCAG**: 1.3.1 (grand total and subtotal rows are semantically distinguishable from data rows via explicit header text), 1.1.1 (aggregated values are text, not images or visual-only representations).
- **Visual**: Grand total rows and columns MUST be visually distinct from regular data rows (e.g., bold text, different background color, or thicker border). Subtotal rows SHOULD be visually distinct from both regular rows and grand total rows.

**Chameleon 6 Status**: New feature. Chameleon 6 had no pivot support.

**Interactions**
- F-05.1 (Pivot Mode): aggregation is required for pivot mode to function.
- F-05.2 (Multi-Dimension Pivoting): subtotals are computed at each dimension level.
- F-05.4 (Auto-Generated Pivot Columns): each generated column corresponds to one aggregation result.
- F-05.5 (Dimension Configuration): value fields and their aggregation functions are part of the configuration.
- F-04 (Grouping & Aggregation): the aggregation functions and grand total concepts are shared with row grouping aggregation in Data Grid mode. Implementation SHOULD reuse the same aggregation engine.
- F-01 (Data Display & Rendering): cell formatters apply to aggregated values for display.
- F-02 (Sorting): pivot rows can be sorted by aggregated values in a specific column.
- F-12 (Export): exported data MUST include the aggregated pivot values, not raw source records.

---

## 5.4 Auto-Generated Pivot Columns [P1]

**Description**: When pivot mode is active, columns are not defined manually by the developer -- they are generated automatically from the distinct values found in the column dimension field(s). For example, if the column dimension is "Quarter" and the data contains Q1, Q2, Q3, and Q4 values, four columns are generated automatically. If new data arrives containing Q5 (e.g., in a rolling dataset), a fifth column is generated dynamically. This data-driven column generation is what makes pivot tables responsive to the underlying data.

**Applies to**: Pivot Table only

**Use Cases**
- UC-1: A sales report pivots by Quarter. The data initially contains Q1 through Q3 data. When Q4 data is loaded, a Q4 column appears automatically without any developer intervention.
- UC-2: A customer segmentation pivot uses Customer Tier (Gold, Silver, Bronze) as the column dimension. When a new "Platinum" tier is introduced in the data, a Platinum column is generated automatically.
- UC-3: A multi-dimension pivot on Year > Month generates columns for every year-month combination present in the data (e.g., "2024 > Jan", "2024 > Feb", ...), with the Year level as parent headers spanning the month-level children.

**Conditions of Use**
- The column dimension field(s) MUST be specified in the dimension configuration (F-05.5).
- The data source MUST be available for the grid to extract distinct values from the column dimension field(s).
- The grid MUST handle the case where the column dimension field contains no distinct values (empty dataset) by rendering a pivot table with row headers but no data columns.

**Behavioral Requirements**
- BR-1: The grid MUST scan the data source to extract all distinct values from each column dimension field and generate one column (or column group, for multi-dimension) per unique value combination.
- BR-2: Auto-generated columns MUST be ordered according to a configurable sort: ascending (default for string and numeric types), descending, or custom comparator. The default order MUST produce a natural reading experience (e.g., Q1, Q2, Q3, Q4 rather than Q3, Q1, Q4, Q2).
- BR-3: When the data source changes and new distinct values appear in a column dimension field, the grid MUST generate new columns for those values. Existing columns MUST be preserved and their aggregated values updated.
- BR-4: When the data source changes and a column dimension value no longer has any matching records, the grid MAY remove the empty column or MAY retain it with zero/null aggregated values. The behavior MUST be configurable (e.g., `removeEmptyPivotColumns: boolean`, default: `false`).
- BR-5: Each auto-generated column MUST have a programmatically generated column ID that encodes the dimension values it represents (e.g., `"pivot_quarter_Q1"` or `"pivot_year_2024_quarter_Q1"`). This ID MUST be stable across data refreshes as long as the dimension value exists.
- BR-6: Auto-generated column headers MUST display the dimension value as their label. For multi-dimension columns, each level of the header hierarchy displays the corresponding dimension value (e.g., parent header shows "2024", child headers show "Q1", "Q2", etc.).
- BR-7: The grid MUST update `aria-colcount` on the root grid element whenever columns are generated or removed. The count MUST reflect the total number of leaf-level columns (including row header columns and grand total columns).
- BR-8: Auto-generated columns MUST support column management features: resize (F-09.1), column menu (F-09.6), and sorting (F-02). They MUST NOT support reorder (column order is determined by the dimension value sort order) or hide (hiding a dimension value would silently remove data from view without filtering).
- BR-9: When multiple value fields are configured (F-05.3, BR-2), the grid MUST generate a sub-column for each value field under each column dimension value. The value field name MUST appear as the innermost header level.

**CSS Subgrid Implications**

Auto-generated columns dynamically change the number of grid tracks. The root grid container's `grid-template-columns` MUST be reconstructed each time the pivot column set changes. Because all rows use `grid-template-columns: subgrid`, adding or removing tracks propagates automatically to all rows. The grid SHOULD batch column changes (e.g., when processing a large data update that adds multiple new dimension values) to minimize layout thrash -- a single `grid-template-columns` update after all columns are computed is preferred over incremental updates.

**Accessibility**
- **ARIA**: Each auto-generated column header MUST carry `role="columnheader"` and MUST have an accessible name derived from the dimension value. For multi-level columns, parent headers MUST use `aria-colspan` to span their children. `aria-colcount` MUST be updated whenever columns are added or removed.
- **Screen Reader**: When columns are added or removed due to data changes, a live region MUST announce: SR: "Pivot columns updated. [N] columns." This avoids disorienting the screen reader user when the structure changes silently.
- **WCAG**: 1.3.1 (auto-generated columns are programmatically determinable via column header roles and spanning attributes), 4.1.2 (column headers have accessible names).
- **Visual**: Auto-generated column headers MUST be visually consistent with manually defined column headers. There MUST be no visual distinction that implies auto-generated columns are "different" or "temporary".

**Chameleon 6 Status**: New feature. Chameleon 6 had no pivot support.

**Interactions**
- F-05.1 (Pivot Mode): auto-generated columns are the mechanism that implements pivot mode's column structure.
- F-05.2 (Multi-Dimension Pivoting): multi-dimension columns generate nested header hierarchies.
- F-05.3 (Pivot with Aggregation): each auto-generated column contains aggregated values.
- F-05.5 (Dimension Configuration): the column dimension fields determine which columns are generated.
- F-05.7 (Dynamic Column Reconfiguration): changing dimensions triggers column regeneration.
- F-09 (Column Management): auto-generated columns participate in resize and column menu but not manual reorder.
- F-11 (Virtualization): large numbers of auto-generated columns benefit from column virtualization.

---

## 5.5 Dimension Configuration [P1]

**Description**: Dimension configuration is the core API that drives the pivot layout. The developer (or user via the field selector panel, F-05.6) specifies which data fields serve as row dimensions, which as column dimensions, and which as value fields with their aggregation functions. This three-area model (rows, columns, values) is the standard paradigm used by Excel PivotTables, OLAP cubes, and every major pivot table implementation.

**Applies to**: Pivot Table only

**Use Cases**
- UC-1: A developer configures a sales pivot table declaratively: row dimensions = [Region, Product], column dimensions = [Year, Quarter], value fields = [{field: "revenue", aggregation: "sum"}, {field: "orderCount", aggregation: "count"}].
- UC-2: A business analyst reconfigures a pivot at runtime by moving "Product" from the row area to the column area, transforming the view from "products as rows" to "products as columns" to explore the data from a different perspective.
- UC-3: A developer adds a filter dimension (e.g., Country) that does not appear as a row or column but constrains which records are included in the pivot aggregation.

**Conditions of Use**
- The grid MUST accept a dimension configuration object that specifies row dimensions, column dimensions, value fields, and optionally filter dimensions.
- At least one row dimension, one column dimension, and one value field MUST be configured for the pivot table to render.
- The configuration MUST be settable at initialization and changeable at runtime.

**Behavioral Requirements**
- BR-1: The dimension configuration MUST support the following areas:
  - **Row dimensions**: An ordered array of field identifiers. Each field becomes a level in the row header hierarchy. Order determines nesting (first = outermost).
  - **Column dimensions**: An ordered array of field identifiers. Each field becomes a level in the column header hierarchy. Order determines nesting (first = outermost).
  - **Value fields**: An array of objects, each specifying a field identifier and an aggregation function. Multiple value fields produce multiple sub-columns per column dimension value.
  - **Filter dimensions** (optional): An ordered array of field identifiers with selected values. These dimensions constrain the data without appearing as row or column headers.
- BR-2: Moving a field between areas (e.g., from rows to columns) MUST trigger a complete pivot recalculation and structural update (see F-05.7). The grid MUST NOT attempt incremental updates when dimensions change -- the entire pivot structure is recomputed.
- BR-3: The order of fields within the row dimensions and column dimensions arrays MUST determine the nesting hierarchy. Reordering fields within an area (e.g., swapping Region and Product in the rows array) MUST restructure the headers accordingly.
- BR-4: Removing all row dimensions or all column dimensions MUST be prevented (the configuration is invalid). The grid MUST validate the configuration and emit a warning if it is incomplete. If an invalid configuration is set programmatically, the grid SHOULD retain the previous valid configuration and log a descriptive error.
- BR-5: The grid MUST emit a `pivotConfigChanged` event whenever the dimension configuration changes, containing the complete new configuration. This event MUST fire after the pivot has been recalculated and the new structure is rendered.
- BR-6: Each value field configuration MUST support an optional `formatter` function (or format string) that determines how the aggregated value is displayed in pivot cells. This formatter is independent of the source field's column formatter.
- BR-7: Filter dimensions MUST accept a set of selected values (inclusion filter) or excluded values (exclusion filter). Changing the filter selection MUST trigger pivot recalculation for affected cells without changing the row or column structure.
- BR-8: The configuration MUST support a `label` property for each dimension and value field, allowing the developer to override the default header text (which defaults to the field identifier).

**Keyboard Interaction**

Dimension configuration is typically performed via the field selector panel (F-05.6) or programmatic API. No direct keyboard interactions are defined for the configuration itself. See F-05.6 for field selector keyboard interactions.

**Accessibility**
- **ARIA**: The dimension configuration produces the ARIA structure described in `03-variant-specific/02-pivot-table.md`. Configuration changes trigger structural updates that MUST maintain valid ARIA at all times.
- **Screen Reader**: When the configuration changes, the live region announcement from F-05.7 informs the user of the new structure. The configuration API itself does not produce screen reader output.
- **WCAG**: 1.3.1 (the resulting pivot structure is programmatically determinable). No direct WCAG implications for the configuration API itself.
- **Visual**: Dimension labels (BR-8) MUST be used as the visible text in row and column headers.

**Chameleon 6 Status**: New feature. Chameleon 6 had no pivot support.

**Interactions**
- F-05.1 (Pivot Mode): dimension configuration is what activates and defines the pivot layout.
- F-05.2 (Multi-Dimension Pivoting): the configuration's ordered arrays of row and column dimensions enable multi-dimension pivoting.
- F-05.3 (Pivot with Aggregation): value fields with aggregation functions are part of the configuration.
- F-05.4 (Auto-Generated Pivot Columns): column dimension fields in the configuration determine which columns are auto-generated.
- F-05.6 (Pivot Field Selector Panel): the field selector is a UI for manipulating the dimension configuration.
- F-05.7 (Dynamic Column Reconfiguration): configuration changes trigger dynamic reconfiguration.
- F-03 (Filtering): filter dimensions in the configuration complement the grid's standard filtering features.
- F-21 (State Persistence): the dimension configuration SHOULD be included in saved/restored grid state.

---

## 5.6 Pivot Field Selector Panel [P1]

**Description**: The field selector panel is a dedicated UI component where users can interactively configure the pivot table by dragging fields between the four areas: rows, columns, values, and filters. This panel makes pivoting discoverable and manipulable without requiring API calls, similar to the "PivotTable Field List" in Excel or the field panel in business intelligence tools. The panel displays all available fields from the data source and shows which fields are currently assigned to which area.

**Applies to**: Pivot Table only

**Use Cases**
- UC-1: A business analyst opens the field selector, sees all available data fields listed, and drags "Region" to the Rows area and "Quarter" to the Columns area. The pivot table immediately reconfigures to show the new layout.
- UC-2: A user drags "Product" from the Rows area to the Columns area to transpose the pivot perspective, instantly seeing products as columns instead of rows.
- UC-3: A user drags "Country" to the Filters area and selects specific countries from a dropdown, limiting the pivot to only those countries without adding Country as a visible dimension.
- UC-4: A user drags a field from the Values area to remove it, simplifying the pivot to show fewer metrics.

**Conditions of Use**
- The field selector panel MUST be toggleable (show/hide) via a toolbar button, keyboard shortcut, or API call.
- The panel MUST be available whenever the grid is in Pivot Table mode.
- The panel MUST display all fields from the data source that are eligible to serve as dimensions or values.

**Behavioral Requirements**
- BR-1: The field selector panel MUST display four distinct drop zones: Rows, Columns, Values, and Filters. Each zone MUST be visually labeled and MUST accept fields dropped into it.
- BR-2: The panel MUST list all available fields from the data source. Fields already assigned to an area MUST be visually indicated (e.g., checked, highlighted, or removed from the unassigned list and shown in their assigned area).
- BR-3: Users MUST be able to add a field to an area by dragging it from the available fields list into the target zone, or by using a context menu / dropdown on the field to select the target area.
- BR-4: Users MUST be able to move a field between areas by dragging it from one zone to another. Moving a field MUST update the dimension configuration (F-05.5) and trigger pivot recalculation.
- BR-5: Users MUST be able to remove a field from an area by dragging it out of the zone (back to the available list), using a remove button on the field chip, or via context menu. Removing a field MUST update the configuration, subject to the validation constraints in F-05.5, BR-4 (cannot remove all row or all column dimensions).
- BR-6: Users MUST be able to reorder fields within an area by dragging them to a new position. Reordering within the Rows or Columns area changes the dimension nesting hierarchy (F-05.2).
- BR-7: When a field is added to the Values area, the panel MUST present a default aggregation function (e.g., `sum` for numeric fields, `count` for non-numeric fields) and MUST allow the user to change the aggregation function via a dropdown or menu.
- BR-8: The panel MUST update in real time as changes are made. Each drag-and-drop operation MUST immediately update the pivot table view (or debounce rapid changes with a short delay to avoid excessive recalculation).
- BR-9: The field selector panel MUST be closable without losing the current configuration. Closing the panel MUST NOT reset the pivot layout.
- BR-10: The panel MUST support a search/filter input for finding fields by name when the data source has many columns. Fields not matching the search MUST be hidden from the available fields list.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Tab | Move focus between the available fields list, each drop zone (Rows, Columns, Values, Filters), and panel controls (close button, search input) | Navigation within the field selector panel |
| Arrow Up/Down | Navigate between fields in the available fields list or within a drop zone | Focus within a list |
| Space | Select/grab the focused field for keyboard-based drag-and-drop (enters "grabbed" mode) | Focus on a field item |
| Arrow Up/Down (in grabbed mode) | Reorder the grabbed field within its current zone | Field is grabbed |
| Arrow Left/Right (in grabbed mode) | Move the grabbed field to the adjacent zone (Left = previous zone in tab order, Right = next zone) | Field is grabbed |
| Enter | Confirm the drop position of the grabbed field; or open the aggregation function menu for a value field | Field is grabbed; or focus on value field |
| Escape | Cancel the grab operation and return the field to its original position | Field is grabbed |
| Delete / Backspace | Remove the focused field from its current zone (return it to the available fields list) | Focus on a field within a zone |

**Accessibility**
- **ARIA**: The field selector panel MUST be a landmark region with `role="region"` and `aria-label="Pivot table field selector"`. Each drop zone MUST be an `aria-dropeffect="move"` target. Each draggable field MUST have `aria-grabbed="false"` (or `"true"` when grabbed). Each drop zone MUST carry `role="listbox"` with `aria-label` identifying the zone (e.g., "Row dimensions"). Each field within a zone MUST carry `role="option"`. The search input MUST use `role="searchbox"` with `aria-label="Filter available fields"`.
- **Screen Reader**: When a field is grabbed: SR: "[Field name] grabbed. Use arrow keys to move. Press Enter to drop, Escape to cancel." When a field is dropped in a new zone: SR: "[Field name] moved to [zone name]. Now in position [N] of [total]." When a field is removed: SR: "[Field name] removed from [zone name]." When the pivot reconfigures after a change: SR: deferred to F-05.7 live region announcement.
- **WCAG**: 1.3.1 (panel structure is programmatically determinable via roles and labels), 2.1.1 (all drag-and-drop operations are achievable via keyboard using grab/move/drop pattern), 2.4.3 (focus order within the panel follows a logical sequence: search, available fields, Rows zone, Columns zone, Values zone, Filters zone, close button), 2.5.1 (drag-and-drop has keyboard alternative via grab mode), 4.1.2 (each interactive element has accessible name and state).
- **Visual**: Drop zones MUST provide visual feedback during drag operations (highlight target zone, show insertion indicator for position within a zone). Fields in transit MUST show a ghost/preview element. Empty zones MUST display placeholder text (e.g., "Drag fields here").

**Chameleon 6 Status**: New feature. Chameleon 6 had no pivot support.

**Interactions**
- F-05.5 (Dimension Configuration): the field selector is a UI that manipulates the dimension configuration.
- F-05.7 (Dynamic Column Reconfiguration): each field selector change triggers dynamic reconfiguration.
- F-10.7 (Drag and Drop): the field selector's drag-and-drop reuses the grid's drag-and-drop infrastructure.
- F-14 (Keyboard Navigation): keyboard interactions within the panel follow the grab/move/drop pattern from ARIA drag-and-drop.
- F-15 (Theming & Styling): the panel MUST be stylable via CSS custom properties and CSS Parts for theme consistency with the grid.
- F-22 (Developer Experience): the panel MUST be toggleable and configurable via the developer API.

---

## 5.7 Dynamic Column Reconfiguration [P1]

**Description**: When the user changes pivot dimensions (via the field selector panel or programmatic API), the entire column structure of the grid changes dynamically. Columns may be added, removed, reordered, or restructured. This is a disruptive structural change that affects the DOM, the ARIA tree, the focus position, and the visual layout. The grid MUST manage this transition gracefully, maintaining accessibility throughout and informing assistive technology users of the structural change.

**Applies to**: Pivot Table only

**Use Cases**
- UC-1: A user adds "Month" as a column dimension to an existing "Year" column dimension. The grid transitions from 4 columns (one per year) to 48 columns (12 months times 4 years), with Year as the parent header level and Month as the child level.
- UC-2: A user removes the "Quarter" column dimension, collapsing the column structure from Year > Quarter (16 columns) to just Year (4 columns). Previously visible quarterly detail is now aggregated at the year level.
- UC-3: A user swaps row and column dimensions entirely (rows become columns, columns become rows), producing a transposed view of the same data.

**Conditions of Use**
- Dynamic reconfiguration occurs whenever the dimension configuration (F-05.5) changes: fields are added to, removed from, reordered within, or moved between the rows, columns, values, or filters areas.
- The grid MUST handle reconfiguration triggered by user action (via field selector panel, F-05.6) and by programmatic API calls identically.

**Behavioral Requirements**
- BR-1: When a dimension configuration change is initiated, the grid MUST set `aria-busy="true"` on the root grid element immediately, before beginning the recalculation. This signals to assistive technology that the grid content is being updated and suppresses premature announcements of incomplete content.
- BR-2: The grid MUST recompute the complete pivot structure (row headers, column headers, aggregated values) based on the new configuration. The recomputation MUST be performed in a single batch -- intermediate states MUST NOT be rendered.
- BR-3: After recalculation is complete and the new structure is rendered, the grid MUST set `aria-busy="false"` to signal that the update is complete.
- BR-4: After reconfiguration, the grid MUST update `aria-colcount` on the root element to reflect the new total number of leaf-level columns. If the number of rows changed, `aria-rowcount` MUST also be updated.
- BR-5: After reconfiguration, the grid MUST announce the new structure via a live region (`role="status"`, `aria-live="polite"`): SR: "Pivot table reconfigured. [N] rows by [M] columns. Rows: [row dimension names]. Columns: [column dimension names]."
- BR-6: If the user's focus was on a cell or header that no longer exists after reconfiguration (e.g., a column was removed), the grid MUST move focus to the nearest valid cell in the new structure. Focus MUST NOT be lost to the document body. The focus recovery strategy MUST prefer: (1) same row, nearest column; (2) same column dimension, nearest row; (3) first data cell.
- BR-7: During reconfiguration, the grid MUST NOT accept user interactions (sorting, filtering, editing, selection). Interactions attempted while `aria-busy="true"` MUST be queued or discarded. The grid SHOULD display a visual loading indicator (spinner or overlay) during reconfiguration if the computation takes longer than 100ms.
- BR-8: The grid MUST animate the transition between pivot structures when `prefers-reduced-motion` is not `reduce`. The animation SHOULD convey the structural change (e.g., columns sliding in/out, headers reorganizing). When `prefers-reduced-motion: reduce`, the grid MUST skip animation and render the new structure immediately.
- BR-9: The grid MUST emit the `pivotConfigChanged` event (F-05.5, BR-5) after the reconfiguration is complete and `aria-busy` is set to `false`.
- BR-10: Reconfiguration MUST be performant. For datasets up to 100,000 records with up to 5 dimensions, the recalculation SHOULD complete within 500ms on modern hardware. The grid SHOULD offload heavy computation to a Web Worker to avoid blocking the main thread.

**CSS Subgrid Implications**

Dynamic reconfiguration requires a complete rebuild of the grid's column track list. The root container's `grid-template-columns` MUST be replaced with the new track definitions. All rows (header rows and data rows) MUST continue using `grid-template-columns: subgrid` to align with the new tracks. If column virtualization (F-11) is active, the virtualized window MUST be reset to account for the changed column count. The grid SHOULD perform the DOM update in a single requestAnimationFrame callback to avoid intermediate layouts.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| (none) | Dynamic reconfiguration does not introduce new keyboard interactions. It is triggered by field selector actions (F-05.6) or API calls. | N/A |

> Note: During reconfiguration (`aria-busy="true"`), all keyboard interactions in the grid MUST be suppressed. The field selector panel (which triggers the reconfiguration) remains interactive, but the grid body does not respond until `aria-busy="false"`.

**Accessibility**
- **ARIA**: `aria-busy="true"` MUST be set on the root grid element during reconfiguration. `aria-colcount` and `aria-rowcount` MUST be updated to reflect the new structure. All header-to-cell associations (via `headers` or `aria-labelledby`) MUST be rebuilt for the new structure.
- **Screen Reader**: The live region announcement (BR-5) is the primary mechanism for informing screen reader users of the structural change. The `aria-busy="true"` attribute prevents screen readers from reading partially updated content during the transition.
- **WCAG**: 4.1.2 (the grid maintains valid ARIA structure throughout the transition; `aria-busy` signals the interim state), 2.4.3 (focus is managed to a valid target after reconfiguration; focus is not lost), 3.2.2 (the reconfiguration is user-initiated via field selector or API -- it does not happen unexpectedly).
- **Visual**: A visual loading indicator MUST be displayed if reconfiguration takes longer than 100ms. The indicator MUST be accessible (visible to sighted users and announced to screen readers via `aria-busy` or a complementary `role="alert"`).

**Chameleon 6 Status**: New feature. Chameleon 6 had no pivot support.

**Interactions**
- F-05.1 (Pivot Mode): reconfiguration is the mechanism that implements pivot layout changes.
- F-05.4 (Auto-Generated Pivot Columns): column regeneration is part of reconfiguration.
- F-05.5 (Dimension Configuration): configuration changes trigger reconfiguration.
- F-05.6 (Pivot Field Selector Panel): user-initiated reconfiguration comes from the field selector.
- F-09 (Column Management): column-level features (resize widths, column menu state) SHOULD be preserved for columns that survive reconfiguration. New columns SHOULD use default widths.
- F-11 (Virtualization): column virtualization MUST reset its window after reconfiguration.
- F-14 (Keyboard Navigation): focus recovery after reconfiguration prevents focus loss.
- F-20 (Server-Side Operations): in server-side mode, reconfiguration sends the new dimension configuration to the server and awaits the recomputed pivot data.

---

## Cross-Cutting Concerns

### Pivoting and Sorting Interaction

Sorting in a Pivot Table operates on the pivoted view, not the source data. Users can sort rows by a specific value column (e.g., sort regions by Q1 revenue descending) or by a dimension member label (e.g., sort regions alphabetically). Multi-column sort (F-02.2) applies to the pivoted columns. Sort state MUST be preserved across minor data updates but SHOULD be reset when the pivot structure changes (dimension reconfiguration).

### Pivoting and Filtering Interaction

Filtering in a Pivot Table operates at the dimension level. Users can filter which dimension members are included (e.g., show only "North America" and "Europe" in a Region dimension). Filter dimensions (F-05.5, BR-1) provide top-level data slicing without adding rows or columns. Standard column filters (F-03) MAY apply to individual pivot columns to filter rows by aggregated values (e.g., show only rows where Q1 Revenue > 100,000).

### Pivoting and Virtualization

Pivot tables with many auto-generated columns (e.g., pivoting by day over a year produces 365+ columns) benefit from column virtualization (F-11). Row virtualization applies when the number of row dimension combinations is large. Both row and column virtualization MUST maintain correct ARIA indexing (`aria-rowindex`, `aria-colindex`) relative to the full pivot structure, not just the visible window.

### Pivoting and Server-Side Operations

For large datasets, the pivot aggregation computation SHOULD be delegated to the server (F-20). The dimension configuration is sent as part of the data request, and the server returns pre-aggregated pivot results. The grid renders the server-provided pivot data without performing client-side aggregation. Dynamic reconfiguration in server-side mode sends the new configuration to the server and displays a loading state while awaiting the response.

### Pivoting and Export

Export (F-12) of a pivot table MUST export the pivoted view (dimension headers and aggregated values), not the raw source data. The export MUST preserve the multi-level header structure (nested row and column headers) in formats that support it (Excel). CSV export MUST flatten the multi-level headers into a single header row with composite labels (e.g., "2024 > Q1 > Revenue").

### Pivoting and State Persistence

The dimension configuration (which fields are in rows, columns, values, filters, and their order and aggregation functions) MUST be included in the grid's persisted state (F-21). Restoring state MUST rebuild the pivot structure from the saved configuration.

---

## Normative Requirements Summary

| ID | Requirement | Level | Feature |
|----|-------------|-------|---------|
| PR-01 | The grid MUST transform flat data into a cross-tabulated pivot layout when pivot mode is active. | MUST | F-05.1 |
| PR-02 | Each pivot data cell MUST display the aggregated value for its row-column dimension intersection. | MUST | F-05.1, F-05.3 |
| PR-03 | The grid MUST NOT display individual source records in the pivoted view. | MUST | F-05.1 |
| PR-04 | The pivoted view MUST render completely on initial paint (no flash of flat data). | MUST | F-05.1 |
| PR-05 | The grid MUST support at least 3 row dimensions and 3 column dimensions simultaneously. | MUST | F-05.2 |
| PR-06 | Nested row headers MUST use `aria-rowspan` and nested column headers MUST use `aria-colspan`. | MUST | F-05.2 |
| PR-07 | Each data cell MUST be associated with ALL contributing headers at every dimension level. | MUST | F-05.2 |
| PR-08 | The grid MUST support expand/collapse on dimension groups in both row and column areas. | MUST | F-05.2 |
| PR-09 | The grid MUST support built-in aggregation functions: sum, count, avg, min, max, countDistinct. | MUST | F-05.3 |
| PR-10 | The grid MUST support custom aggregation functions. | MUST | F-05.3 |
| PR-11 | Grand total rows and columns MUST contain explicit "Grand Total" text. | MUST | F-05.3 |
| PR-12 | Grand totals and subtotals MUST be toggleable via configuration. | MUST | F-05.3 |
| PR-13 | Columns MUST be auto-generated from distinct values in column dimension fields. | MUST | F-05.4 |
| PR-14 | Auto-generated columns MUST be ordered by a configurable sort (default: ascending). | MUST | F-05.4 |
| PR-15 | New columns MUST be generated when new dimension values appear in the data. | MUST | F-05.4 |
| PR-16 | `aria-colcount` MUST be updated whenever pivot columns are added or removed. | MUST | F-05.4, F-05.7 |
| PR-17 | Dimension configuration MUST support rows, columns, values, and filters areas. | MUST | F-05.5 |
| PR-18 | At least one row dimension, one column dimension, and one value field MUST be configured. | MUST | F-05.5 |
| PR-19 | The grid MUST emit `pivotConfigChanged` after dimension configuration changes. | MUST | F-05.5 |
| PR-20 | Invalid configurations (empty rows or columns) MUST be rejected with a warning. | MUST | F-05.5 |
| PR-21 | The field selector panel MUST display four drop zones: Rows, Columns, Values, Filters. | MUST | F-05.6 |
| PR-22 | All drag-and-drop operations in the field selector MUST be achievable via keyboard. | MUST | F-05.6 |
| PR-23 | The field selector MUST support search/filter for finding fields by name. | MUST | F-05.6 |
| PR-24 | `aria-busy="true"` MUST be set during dynamic reconfiguration. | MUST | F-05.7 |
| PR-25 | The new structure MUST be announced via live region after reconfiguration. | MUST | F-05.7 |
| PR-26 | Focus MUST be moved to a valid target if the focused element is removed during reconfiguration. | MUST | F-05.7 |
| PR-27 | User interactions MUST be suppressed while `aria-busy="true"`. | MUST | F-05.7 |
| PR-28 | `aria-colcount` and `aria-rowcount` MUST be updated after reconfiguration. | MUST | F-05.7 |
| PR-29 | Reconfiguration animation MUST respect `prefers-reduced-motion: reduce`. | MUST | F-05.7 |
| PR-30 | Reconfiguration for up to 100,000 records with 5 dimensions SHOULD complete within 500ms. | SHOULD | F-05.7 |
| PR-31 | Dimension configuration SHOULD be included in persisted state (F-21). | SHOULD | F-05.5 |
| PR-32 | Pivot aggregation SHOULD be offloadable to a Web Worker. | SHOULD | F-05.7 |
| PR-33 | Pivot aggregation SHOULD be delegable to the server in server-side mode. | SHOULD | F-05.3 |

---

## Cross-References

| Topic | Reference |
|-------|-----------|
| CSS subgrid layout (dynamic column tracks) | [FD-01: Layout Model](../01-foundations/01-layout-model.md) |
| Pivot Table ARIA role and variant definition | [FD-02: Variant Model](../01-foundations/02-variant-model.md), Section 2.3 |
| Pivot Table multi-axis header ARIA structure | [03-variant-specific/02-pivot-table.md](../03-variant-specific/02-pivot-table.md) |
| Baseline ARIA structure, focus management | [FD-04: Accessibility Foundation](../01-foundations/04-accessibility-foundation.md) |
| Sorting pivoted rows and columns | [F-02: Sorting](02-sorting.md) |
| Dimension-level filtering | F-03: Filtering |
| Shared aggregation engine with row grouping | F-04: Grouping & Aggregation |
| Cell rendering and formatters for aggregated values | F-01: Data Display & Rendering |
| Multi-level column headers infrastructure | F-01.8: Multi-Level Column Headers |
| Column management for auto-generated columns | F-09: Column Management |
| Row and column virtualization for large pivots | F-11: Virtualization & Performance |
| Export of pivoted view | F-12: Export & Import |
| Keyboard navigation through pivot headers | F-14: Keyboard Navigation |
| Theming and styling for pivot-specific elements | F-15: Theming & Styling |
| Server-side pivot aggregation | F-20: Server-Side Operations |
| State persistence of dimension configuration | F-21: State Persistence & Responsive |
| Developer API for pivot configuration | F-22: Developer Experience |
