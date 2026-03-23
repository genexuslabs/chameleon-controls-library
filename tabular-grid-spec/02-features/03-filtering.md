# F-03: Filtering

Filtering allows users to narrow the visible row set by applying conditions to column values or across all columns. This feature category covers inline filter rows, typed filter inputs, global search, programmatic filtering, floating filters, advanced filter builders, and saved filter presets.

Filtering applies to all four variants (Data Grid, Tree Grid, Pivot Table, Gantt Chart) with variant-specific adaptations for hierarchical data, aggregated values, and dual-region layouts.

> **Foundations**: This feature assumes the layout model defined in [FD-01](../01-foundations/01-layout-model.md). Filter rows participate in the host grid as subgrid rows, sharing column tracks with header and data rows. The editability model in [FD-03](../01-foundations/03-editability-model.md) defines how filtering interacts with active editing sessions. The accessibility foundation in [FD-04](../01-foundations/04-accessibility-foundation.md) defines the live region mechanism used for filter announcements.

---

## 3.1 Inline Filter Row [P1]

**Description**: A dedicated row rendered immediately below the column header row, containing one filter input per column. Each input allows the user to type or select filter criteria for that column. The filter row is part of the grid's header region and remains visible (sticky) while the body scrolls.

**Applies to**: All variants

**Use Cases**
- UC-1: A user viewing a customer list types "Smith" in the Name column's filter input to instantly narrow the list to matching customers.
- UC-2: A user types a minimum value in the Amount column's number filter input to see only high-value transactions.
- UC-3: A project manager in a Gantt Chart task list filters the "Status" column to show only "In Progress" tasks, focusing the timeline view on active work.

**Conditions of Use**
- The grid MUST support a configuration property to show or hide the filter row (e.g., `showFilterRow: boolean`, default: `false`).
- Each column definition MUST support a `filterable: boolean` property (default: `true` when the filter row is shown). Columns with `filterable: false` MUST render an empty, non-interactive cell in the filter row.
- The filter row MUST only appear when `showFilterRow` is `true`. When hidden, no DOM for the filter row is rendered (to avoid unnecessary overhead in grids that use external filtering only).

**Behavioral Requirements**
- BR-1: The grid MUST render the filter row as a `role="row"` element inside the header `role="rowgroup"`, positioned immediately after the column header row(s).
- BR-2: Each filter cell MUST contain an appropriate input control based on the column's `dataType` (see F-03.2 for filter type selection logic).
- BR-3: The grid MUST apply the filter after a configurable debounce period (default: 300ms) following the last keystroke in a text-based filter input. This prevents excessive re-filtering during rapid typing.
- BR-4: The grid MUST emit a `filterChanged` event whenever the active filter state changes, containing the complete filter model (all active column filters).
- BR-5: When a filter is active on a column, the grid MUST provide a visual indication on that column's filter input (e.g., a highlighted border, a filled background, or a clear/reset icon).
- BR-6: Each filter cell MUST include a clear/reset affordance (button or icon) that removes the filter for that column. The clear affordance MUST only be visible (or enabled) when the column has an active filter.
- BR-7: The filter row MUST remain sticky at the top of the grid (alongside the header row) when the body content scrolls vertically.
- BR-8: When the user clears all column filters (individually or via a "Clear All" action), the grid MUST restore the full unfiltered row set and re-apply the current sort state (F-02).
- BR-9: Filtering MUST operate on the raw data value by default. When `filterByDisplayValue: true` is configured on a column, the filter MUST match against the formatted display string instead.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | When a row matches the filter, the grid MUST also display all ancestor rows up to the root to preserve hierarchical context. Ancestor rows that do not themselves match the filter SHOULD be rendered with a muted/dimmed visual treatment to distinguish them from matching rows. |
| Pivot Table | The inline filter row applies to the row dimension headers (leftmost columns). Value columns (aggregated cells) are not filterable via the inline filter row; use value filtering (F-03.2) for those. |
| Gantt Chart | The filter row appears in the task list region only. The timeline region has no filter row. Filtering the task list hides the corresponding timeline bars. |

**CSS Subgrid Implications**

The filter row participates in the host grid's subgrid layout. It MUST use `display: grid; grid-template-columns: subgrid; grid-column: 1 / -1`, ensuring that each filter input cell aligns exactly with the corresponding column header and data cells. When columns are resized (F-09), frozen (F-09.3), or hidden (F-09.4), the filter row cells MUST respond identically because they share the same column tracks.

The filter row adds one additional `max-content` row track to the `grid-template-rows` on the host element (within the header region). This row track is only present when `showFilterRow` is `true`.

**Editability Interaction**
- When a cell in the body is in Edit Mode (per [FD-03](../01-foundations/03-editability-model.md)), the filter row MUST remain interactive. The user MUST be able to click on a filter input without cancelling the active cell edit.
- If a filter is applied while a row is being edited and the edited row no longer matches the new filter criteria, the grid MUST keep the edited row visible until the edit is committed or cancelled. The row SHOULD display a visual indicator (e.g., a subtle highlight or badge) signaling it is retained due to an in-progress edit. After the edit completes, the grid MUST re-evaluate the filter and hide the row if it does not match.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Tab | From the last column header, Tab moves focus into the filter row (first filterable input). | Navigation Mode |
| Shift+Tab | From the first filter input, Shift+Tab returns focus to the column header row. | Navigation Mode |
| Arrow Right / Arrow Left | Move focus between filter input cells within the filter row. | Navigation Mode, focus in filter row |
| Enter | Apply the current filter value immediately (bypass debounce). | Focus in a filter input |
| Escape | Clear the current filter input's value and remove that column's filter. | Focus in a filter input |
| Arrow Down | From a filter input, move focus to the first data cell in that column. | Navigation Mode, focus in filter row |

**Accessibility**
- **ARIA**: Each filter input MUST have `aria-label="Filter by [Column Name]"` (e.g., `aria-label="Filter by Last Name"`). The filter row element MUST have `role="row"`. Each filter cell MUST have `role="gridcell"` (or `role="columnheader"` if semantically treating filter controls as header-adjacent is preferred by the implementation, though `gridcell` within a header `rowgroup` is the recommended pattern).
- **Screen Reader**: When a filter is applied, a live region (`role="status"`, `aria-live="polite"`) MUST announce: SR: "Filtered by [Column Name]: [value]. [N] rows shown." When a filter is cleared: SR: "Filter cleared from [Column Name]. [N] rows shown." When all filters are cleared: SR: "All filters cleared. [N] rows shown."
- **WCAG**: 1.3.1 (filter state is programmatically determinable via `aria-label` and live region), 2.1.1 (filter inputs are keyboard-accessible), 2.4.6 (labels describe the purpose of each filter input), 4.1.2 (filter inputs have accessible name and role).
- **Visual**: Active filter indicators MUST NOT rely on color alone (WCAG 1.4.1). An icon, border style change, or text label MUST supplement any color change.

**Chameleon 6 Status**: Not built-in. Chameleon 6 does not provide a dedicated inline filter row. Applications implement external filtering via the `filterChanged` event and programmatic row hiding. Chameleon 7 introduces the built-in filter row as a first-class feature.

**Interactions**
- F-03.2 (Filter Types): determines the input control rendered in each filter cell.
- F-03.4 (External / Programmatic Filter): external filters and inline filter row filters are combined.
- F-03.5 (Floating Filters): floating filters are an alternative to the inline filter row (not typically used simultaneously).
- F-02 (Sorting): sort applies to the filtered row set.
- F-04 (Grouping): filter applies before grouping; groups with no matching rows collapse or hide.
- F-07 (Cell Editing): filter is deferred for rows with active edits.
- F-09 (Column Management): filter inputs share column tracks via subgrid.
- F-11 (Virtualization): filtering reduces the virtual row count; virtualization recalculates.
- F-14 (Keyboard Navigation): Tab/arrow keys integrate filter row into grid navigation.

---

## 3.2 Filter Types [P1]

**Description**: Each column's filter input control is automatically selected based on the column's `dataType`. The grid provides built-in filter types for text, number, date, set/list, and boolean data, each with appropriate operators (e.g., "contains", "greater than", "between"). Developers can override the automatic selection to assign a specific filter type to any column.

**Applies to**: All variants

**Use Cases**
- UC-1: A text column ("Name") renders a text input with a dropdown for operators: "Contains", "Starts with", "Equals", "Ends with", "Does not contain".
- UC-2: A number column ("Amount") renders a number input with operators: "Equals", "Greater than", "Less than", "Between", "Not equal".
- UC-3: A date column ("Created Date") renders a date picker input with operators: "Equals", "Before", "After", "Between" (date range).
- UC-4: A column with a small set of known values ("Status") renders a checkbox list popup showing all distinct values, allowing the user to select which values to include.
- UC-5: A boolean column ("Active") renders a tri-state control: All / True / False.

**Conditions of Use**
- The column MUST have a `dataType` property (`"string"`, `"number"`, `"datetime"`, `"boolean"`, or `"set"`) for automatic filter type selection.
- The column definition MAY include an explicit `filterType` property to override the automatic selection (e.g., forcing a `"set"` filter on a string column).
- The column MAY provide a `filterOptions` property to restrict the available operators for that column (e.g., only "contains" and "equals" for a text filter).

**Behavioral Requirements**
- BR-1: The grid MUST automatically select the filter type based on the column's `dataType` according to this mapping:

  | `dataType` | Default Filter Type | Default Operator |
  |------------|-------------------|-----------------|
  | `"string"` | Text filter | Contains |
  | `"number"` | Number filter | Equals |
  | `"datetime"` | Date filter | Equals |
  | `"boolean"` | Boolean filter | All (no filter) |
  | `"set"` | Set filter | Include all selected |

- BR-2: **Text Filter** MUST support the following operators: "Contains", "Does not contain", "Starts with", "Ends with", "Equals", "Not equal", "Is empty", "Is not empty". The default operator MUST be "Contains".
- BR-3: **Number Filter** MUST support: "Equals", "Not equal", "Greater than", "Greater than or equal", "Less than", "Less than or equal", "Between" (two-value range), "Is empty", "Is not empty". The default operator MUST be "Equals".
- BR-4: **Date Filter** MUST support: "Equals", "Before", "After", "Between" (date range with start and end), "Is empty", "Is not empty". The date filter MUST render a date picker control for value input.
- BR-5: **Set Filter** MUST display a popup or dropdown containing a checkbox list of all distinct values present in that column's data. The user checks or unchecks values to include or exclude them. A "Select All" / "Deselect All" toggle MUST be provided. A search input within the popup MUST be provided to filter the list of distinct values when the list is long.
- BR-6: **Boolean Filter** MUST render a tri-state control (or segmented button) with three options: "All" (no filter), "True", "False".
- BR-7: The operator selector MUST be accessible via a dropdown or button adjacent to the filter input. The operator selector MUST have an accessible label (e.g., `aria-label="Filter operator for [Column Name]"`).
- BR-8: When `filterType` is explicitly set on a column definition, the grid MUST use the specified filter type regardless of `dataType`.
- BR-9: The grid MUST support custom filter types via a registration mechanism. A custom filter type provides its own input control (render function or component) and its own match function. Custom filter types integrate with the filter row, floating filters, and the advanced filter builder (F-03.6).
- BR-10: All filter operations MUST be case-insensitive for text filters by default. A grid-level or column-level `filterCaseSensitive: boolean` property MUST allow enabling case-sensitive matching.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Pivot Table | Value columns (aggregated cells) support number filter operators applied to the aggregated value. Dimension columns support text or set filters on the dimension member labels. |
| Tree Grid | Set filters MUST collect distinct values from all hierarchy levels. The set popup SHOULD indicate which values exist at which level if the tree uses different value domains per level. |

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Alt+Down Arrow | Open the operator dropdown or set filter popup. | Focus in a filter input |
| Escape | Close the operator dropdown or set filter popup without applying changes. | Popup open |
| Enter | Confirm the selected operator or apply set filter selections. | Popup open |
| Space | Toggle a checkbox in the set filter popup. | Focus on a checkbox in set filter popup |

**Accessibility**
- **ARIA**: Operator dropdowns MUST use `role="listbox"` with `aria-expanded`, `aria-haspopup="listbox"`, and `aria-activedescendant` for the selected option. Set filter popups MUST use `role="listbox"` with `role="option"` items carrying `aria-selected`. The search input within a set filter MUST have `aria-label="Search filter values for [Column Name]"`.
- **Screen Reader**: When an operator is changed: SR: "Filter operator changed to [operator] for [Column Name]." When a set filter selection is confirmed: SR: "Filtered [Column Name] to [N] of [M] values. [N] rows shown."
- **WCAG**: 1.3.1 (filter type and operator are programmatically determinable), 2.1.1 (all filter controls are keyboard-operable), 4.1.2 (all interactive elements have accessible name and role).
- **Visual**: The operator selector and filter input MUST be visually distinct. Active filters MUST display a clear visual indicator (consistent with F-03.1, BR-5).

**Chameleon 6 Status**: Not built-in. Chameleon 6 exposes `dataType` per column ("string", "number", "boolean", "datetime") but does not provide built-in filter controls. Filtering logic is delegated to the application. Chameleon 7 introduces built-in typed filter inputs.

**Interactions**
- F-03.1 (Inline Filter Row): filter types determine the controls rendered in each filter row cell.
- F-03.5 (Floating Filters): floating filters use the same filter type logic in a compact form.
- F-03.6 (Advanced Filter Builder): the builder uses filter types to determine the value input for each condition.
- F-01 (Data Display & Rendering): `dataType` drives both cell rendering and filter type selection.
- F-02.6 (Locale-Aware Sort): text filter matching SHOULD use `Intl.Collator`-based comparison for locale-aware case-insensitive matching.

---

## 3.3 Quick Filter / Global Search [P1]

**Description**: A single text input that searches across all visible (non-hidden) columns simultaneously. The user types a search term, and the grid filters to show only rows where at least one column's value matches the search text. The quick filter input is external to the grid DOM (not a row within the grid) and uses `aria-controls` to associate with the grid.

**Applies to**: All variants

**Use Cases**
- UC-1: A user types "Johnson" into the global search box and sees all rows where any column contains "Johnson" -- matching name, address, notes, or any other text field.
- UC-2: A support agent types a ticket number into the quick filter to rapidly locate a specific record across thousands of rows.
- UC-3: A project manager types a keyword into the Gantt Chart's global search to filter the task list and timeline to relevant tasks.

**Conditions of Use**
- The quick filter input MUST be provided by the application as an external element (e.g., a text input above the grid). The grid provides an API method or reactive property (e.g., `quickFilterText: string`) that the application binds to the input's value.
- The grid MUST accept a configuration for which columns participate in the quick filter (e.g., `quickFilterColumns: string[]` listing column IDs, default: all visible columns).

**Behavioral Requirements**
- BR-1: The grid MUST filter rows to show only those where at least one participating column's value matches the quick filter text. The default match algorithm MUST be case-insensitive substring ("contains").
- BR-2: The grid MUST apply the quick filter after a configurable debounce period (default: 300ms) to avoid excessive re-filtering during typing. The debounce SHOULD be configurable via a property (e.g., `quickFilterDebounce: number`).
- BR-3: The quick filter MUST combine with per-column filters (F-03.1, F-03.4) using AND logic: a row MUST match the quick filter AND all active column filters to be visible.
- BR-4: When the quick filter text is cleared (empty string), the grid MUST remove the quick filter condition and show all rows that match any remaining column filters.
- BR-5: The grid MUST support a `quickFilterParser` callback that allows developers to customize how the search text is parsed (e.g., splitting on spaces for multi-word search, supporting quoted phrases for exact match, or implementing field-specific syntax like "status:open").
- BR-6: The grid MUST emit a `filterChanged` event when the quick filter state changes, including the quick filter text in the filter model.
- BR-7: The grid SHOULD support highlighting matched text within cells when a quick filter is active. Highlighting MUST be implemented without modifying the underlying data (e.g., via CSS or mark elements wrapping matched substrings in the rendered output). This is a P2 enhancement.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Quick filter MUST show matching rows along with their ancestor chain (same hierarchical preservation rule as F-03.1). |
| Pivot Table | Quick filter searches row dimension labels only (not aggregated value cells). To search aggregated values, use per-column number filters (F-03.2). |
| Gantt Chart | Quick filter applies to the task list columns. Timeline bars for non-matching tasks are hidden. |

**Editability Interaction**
- The quick filter MUST follow the same deferred-filter rule as F-03.1: if a row is being edited and no longer matches the quick filter, the row remains visible until the edit is committed or cancelled.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| (Application-defined) | The quick filter input is external to the grid. The application defines how to focus it (e.g., Ctrl+F, a toolbar button). | N/A |
| Escape | Clear the quick filter text and restore the full (column-filtered) row set. | Focus in quick filter input |
| Enter | Apply the quick filter immediately (bypass debounce). | Focus in quick filter input |

**Accessibility**
- **ARIA**: The quick filter input MUST have `aria-controls="[grid-id]"` pointing to the grid element's `id`. The input MUST have `aria-label="Search all columns"` or a visible `<label>` element. The input SHOULD have `role="searchbox"` to convey its purpose.
- **Screen Reader**: When the quick filter is applied: SR: "Search active: [N] rows shown." When cleared: SR: "Search cleared. [N] rows shown." Announcements MUST use the grid's live region (`aria-live="polite"`).
- **WCAG**: 1.3.1 (association between search input and grid via `aria-controls`), 2.1.1 (search input is keyboard-accessible), 2.4.6 (input has a descriptive label), 3.2.2 (filtering occurs after debounce, not on every keystroke, to avoid disorienting rapid content changes).
- **Visual**: The quick filter input SHOULD display an icon (magnifying glass) to visually indicate its search purpose. When active, a clear button MUST be visible.

**Chameleon 6 Status**: Not built-in. Applications implement global search externally and pass filtered data to the grid. Chameleon 7 introduces a built-in quick filter API (`quickFilterText` property) with configurable matching.

**Interactions**
- F-03.1 (Inline Filter Row): quick filter combines with column filters via AND logic.
- F-03.4 (External / Programmatic Filter): quick filter is a convenience wrapper; the same result can be achieved via external filter functions.
- F-02 (Sorting): sort applies to the quick-filtered row set.
- F-11 (Virtualization): quick filter changes recalculate the virtual row count.
- F-07 (Cell Editing): quick filter deferred for rows with active edits.

---

## 3.4 External / Programmatic Filter [P0]

**Description**: Filters are applied from application code rather than through the grid's built-in filter UI. This supports custom filter panels, URL-driven filtering, form-based filtering, and any scenario where the application needs full control over filter logic. The grid exposes API methods and/or a reactive property to set, get, and clear the filter model programmatically.

**Applies to**: All variants

**Use Cases**
- UC-1: An application reads filter parameters from the URL query string on page load and applies them to the grid before the first render.
- UC-2: A custom sidebar panel with sliders, dropdowns, and checkboxes feeds filter conditions to the grid via its API.
- UC-3: A dashboard applies context-sensitive filters when the user selects a tile (e.g., clicking "Overdue Tasks" filters the Gantt Chart to show only overdue items).
- UC-4: A Tree Grid application programmatically filters to show only nodes at a specific depth or with specific metadata.

**Conditions of Use**
- The grid MUST expose a filter model property (e.g., `filterModel: FilterModel`) that accepts a structured object describing all active filters.
- The grid MUST expose methods: `setFilterModel(model: FilterModel)`, `getFilterModel(): FilterModel`, `clearFilters()`.
- The grid MUST support a `customFilter` callback function property that receives row data and returns a boolean (true = include, false = exclude). This is the most flexible approach for arbitrary filter logic.

**Behavioral Requirements**
- BR-1: When `setFilterModel()` is called, the grid MUST apply the provided filter model immediately (or after the current microtask to allow batching), re-evaluate all rows, update the visible row set, and emit a `filterChanged` event.
- BR-2: The filter model MUST be a serializable object (JSON-compatible) to support state persistence (F-21) and URL-driven filtering.
- BR-3: When a `customFilter` callback is provided, the grid MUST invoke it for each row during the filter evaluation. The callback signature MUST be: `(rowData: RowData, rowIndex: number) => boolean`. The callback MUST be invoked after any column-level filters and quick filter have been evaluated (i.e., the custom filter is an additional AND condition).
- BR-4: Programmatic filter changes MUST update the inline filter row (F-03.1) and floating filter (F-03.5) UI to reflect the applied state. For example, if `setFilterModel()` sets a text filter on the "Name" column, the inline filter input for "Name" MUST display the filter value.
- BR-5: The grid MUST emit a `filterChanged` event for programmatic filter changes, identical in structure to events emitted by UI-driven filter changes. The event payload SHOULD include a `source` property indicating `"api"` vs `"ui"`.
- BR-6: Calling `clearFilters()` MUST remove all active filters (column filters, quick filter, custom filter callback), restore the full row set, and emit a `filterChanged` event.
- BR-7: The grid MUST support applying the filter model before data is loaded (declarative initial filter). The filter MUST be applied as soon as data becomes available, without a visible flash of unfiltered content.
- BR-8: The `customFilter` callback MUST NOT be invoked during rendering -- only during filter evaluation. The grid MUST cache filter results and re-evaluate only when the filter model changes or data changes.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | The `customFilter` callback receives each row independently. The grid is responsible for preserving the ancestor chain of matching rows (same rule as F-03.1). The callback MUST NOT need to handle ancestor preservation -- that is the grid's responsibility. |
| Pivot Table | Programmatic filters may target row dimensions (filter by dimension member label), value cells (filter by aggregated value), or both. The filter model MUST distinguish between dimension filters and value filters. |
| Gantt Chart | Programmatic filters apply to task list data. Filtered-out tasks and their timeline bars are hidden. |

**Editability Interaction**
- Programmatic filter changes MUST follow the same deferred-filter rule as F-03.1: rows with active edits that no longer match the new filter MUST remain visible until the edit session completes.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| (none) | Programmatic filtering has no direct keyboard interaction within the grid. The application's custom filter UI defines its own keyboard behavior. | N/A |

**Accessibility**
- **ARIA**: When filters are applied programmatically, the grid's live region MUST announce the result, identical to UI-driven filtering: SR: "Filtered. [N] rows shown." If the programmatic filter is associated with an external UI element, that element SHOULD have `aria-controls="[grid-id]"`.
- **Screen Reader**: SR: "Filtered. [N] rows shown." on application. SR: "All filters cleared. [N] rows shown." on `clearFilters()`. Announcements use `aria-live="polite"` to avoid interrupting the user.
- **WCAG**: 4.1.3 (Status Messages) -- the filter result count MUST be communicated via a live region without requiring the user to navigate to the grid.
- **Visual**: When programmatic filters are active but no inline filter row is visible, the grid SHOULD provide an alternative visual indicator that filtering is in effect (e.g., a "Filtered" badge in a toolbar or status bar, a row count display showing "Showing X of Y rows").

**Chameleon 6 Status**: Existed. Chameleon 6 supports external filtering through the application managing which rows are rendered. The grid renders whatever data is provided. Chameleon 7 formalizes this with a structured `FilterModel` API and built-in filter evaluation.

**Interactions**
- F-03.1 (Inline Filter Row): programmatic filters combine with inline filter conditions.
- F-03.3 (Quick Filter): programmatic filters combine with the quick filter via AND logic.
- F-03.7 (Filter Presets): presets are implemented by saving and restoring the filter model via `setFilterModel()`.
- F-02 (Sorting): sort applies to the programmatically filtered row set.
- F-07 (Cell Editing): filter deferred for rows with active edits.
- F-20 (Server-Side Operations): in server-side mode, `setFilterModel()` sends the filter model to the server instead of filtering client-side.
- F-21 (State Persistence): the filter model is included in saved grid state.

---

## 3.5 Floating Filters [P1]

**Description**: Compact filter input controls embedded directly within the column header cell, as opposed to a separate filter row (F-03.1). Floating filters save vertical space by combining the column label and filter input in a single header cell. The header cell is divided into a label area (top) and a compact filter input area (bottom).

**Applies to**: All variants

**Use Cases**
- UC-1: A data-dense application needs filtering capability but cannot afford the vertical space of an additional filter row. Floating filters allow filtering within the existing header height.
- UC-2: A user frequently filters one or two columns and prefers always-visible filter inputs without needing to toggle a filter row on and off.
- UC-3: A compact dashboard widget uses a grid with floating filters to provide filtering in a minimal footprint.

**Conditions of Use**
- The grid MUST support a configuration property (e.g., `floatingFilter: boolean`) at both the grid level and the column level. Column-level overrides grid-level.
- Floating filters and the inline filter row (F-03.1) MUST NOT be active simultaneously on the same column. If both are configured, the inline filter row takes precedence and the floating filter is suppressed for that column.
- Floating filters MUST only be shown when the column has `filterable: true`.

**Behavioral Requirements**
- BR-1: The grid MUST render the floating filter input as a child element within the column header cell, positioned below the column label text.
- BR-2: The floating filter input MUST be a compact version of the full filter type (F-03.2). For text filters, a simple text input. For number and date filters, a text input that accepts typed values. For set filters, a summary chip (e.g., "3 selected") that opens the full set popup on click or keyboard activation. For boolean filters, a compact tri-state toggle.
- BR-3: The floating filter MUST synchronize with the column's full filter state. If a filter is applied via the filter row, programmatic API, or advanced builder, the floating filter MUST reflect the current filter value.
- BR-4: The floating filter MUST apply filters using the same debounce, event emission, and evaluation logic as the inline filter row (F-03.1, BR-3 and BR-4).
- BR-5: The column header MUST increase its minimum height to accommodate both the label and the floating filter input. This additional height is part of the header row track sizing (auto or `max-content`).
- BR-6: When the user hovers over a floating filter or when it has focus, the grid SHOULD display a tooltip or expanded area showing the full filter configuration (operator and value), since the compact display may truncate information.
- BR-7: Floating filters MUST NOT interfere with column header interactions: clicking the label area still triggers sorting (F-02.1), and the resize handle (F-09.1) remains functional at the column edges.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Pivot Table | Floating filters appear in the innermost level of multi-level column headers. Parent (grouping) headers that span multiple columns MUST NOT display floating filters. |
| Gantt Chart | Floating filters appear only on task list column headers. The timeline region has no column headers and no floating filters. |

**CSS Subgrid Implications**

Floating filters increase the column header row height. Because column headers share a row track, all headers in the row grow to the same height. The header row track sizing MUST use `max-content` (or `auto`) so that the row height accommodates the tallest header (which includes both label and floating filter). Columns without floating filters MUST still align vertically within the row (the label is vertically positioned in the available space).

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| F3 (or configurable shortcut) | When focus is on a column header, move focus to the floating filter input within that header. | Navigation Mode, focus on `columnheader` |
| Escape | Clear the floating filter value for this column and return focus to the column header label area. | Focus in floating filter input |
| Enter | Apply the floating filter value immediately (bypass debounce). | Focus in floating filter input |
| Tab | From the floating filter, move to the next interactive element (next column's floating filter or the first data cell). | Focus in floating filter input |

**Accessibility**
- **ARIA**: The floating filter input MUST have `aria-label="Filter by [Column Name]"`. The column header cell that contains both the label and the floating filter MUST maintain its `role="columnheader"` and accessible name (the column label). The floating filter input is a descendant interactive element within the column header cell.
- **Screen Reader**: When focus moves to the floating filter input: SR: "Filter by [Column Name], [current value or empty]". Filter application and clearance announcements are identical to F-03.1 (via live region).
- **WCAG**: 1.3.1 (filter input is programmatically associated with the column), 2.1.1 (floating filter is keyboard-accessible), 2.4.6 (filter input has descriptive label), 4.1.2 (name, role, value are programmatically determinable).
- **Visual**: The floating filter input area MUST be visually separated from the column label (e.g., by a thin border, padding, or background difference). Active filters MUST show a visual indicator consistent with F-03.1.

**Chameleon 6 Status**: Not built-in. Chameleon 6 does not provide floating filter functionality. This is a new capability for Chameleon 7.

**Interactions**
- F-03.1 (Inline Filter Row): floating filters are mutually exclusive with the inline filter row per column.
- F-03.2 (Filter Types): floating filters render compact versions of the same filter types.
- F-03.4 (External / Programmatic Filter): programmatic filter changes update floating filter displays.
- F-02.1 (Single-Column Sort): clicking the header label area triggers sort; clicking the floating filter area does not.
- F-09.1 (Column Resize): resize handles remain functional at column edges despite floating filter presence.
- F-09.3 (Column Pinning / Freeze): floating filters in frozen columns remain sticky with the header.

---

## 3.6 Advanced Filter Builder [P2]

**Description**: A dedicated UI panel for constructing compound filter expressions with AND/OR logical operators and nested condition groups. Users can build complex boolean expressions like "(Status = 'Open' AND Priority > 3) OR (Assignee = 'Me' AND Due Date < Today)" using a visual, form-based interface. The builder is typically opened from a toolbar button or grid menu and renders as a popover, dialog, or sidebar panel.

**Applies to**: All variants

**Use Cases**
- UC-1: An analyst needs to find records matching complex criteria: all orders from Region "East" with Amount > 10000 OR from Region "West" with Amount > 5000. The advanced builder allows this without writing code.
- UC-2: A QA engineer builds a compound filter on a bug tracker: (Severity = "Critical" AND Status != "Closed") OR (Severity = "High" AND Created Date < 30 days ago).
- UC-3: A data steward constructs a filter with nested groups: ((Category = "A" OR Category = "B") AND (Value > 100)) to isolate specific data segments for review.

**Conditions of Use**
- The advanced filter builder MUST be an optional feature enabled via configuration (e.g., `showAdvancedFilter: boolean` or `enableAdvancedFilterBuilder: true`).
- The builder MUST be openable from a clearly labeled button or menu item. It MUST NOT replace the inline filter row or floating filters; it complements them.
- When the builder applies a filter, it MUST replace any existing column-level filters (the builder defines the complete filter expression). The quick filter (F-03.3) remains independent and combines with the builder's expression via AND logic.

**Behavioral Requirements**
- BR-1: The builder MUST render a form-based interface with one or more condition rows. Each condition row contains: a column selector (dropdown of filterable columns), an operator selector (operators appropriate to the selected column's data type per F-03.2), and a value input (appropriate input control for the data type).
- BR-2: The builder MUST support logical grouping with AND / OR operators. Multiple conditions within a group are combined with the group's operator. A "toggle" or "dropdown" MUST allow switching between AND and OR.
- BR-3: The builder MUST support nested groups: a group can contain condition rows and/or sub-groups, enabling arbitrary boolean expression depth. A practical maximum nesting depth of 5 levels SHOULD be enforced to avoid usability degradation.
- BR-4: The builder MUST provide "Add Condition" and "Add Group" actions to extend the expression tree.
- BR-5: Each condition row and group MUST have a "Remove" action to delete it from the expression.
- BR-6: The builder MUST provide a "Clear All" action that removes all conditions and groups.
- BR-7: The builder MUST validate conditions before applying: empty value fields SHOULD be flagged with a validation message, and the builder MUST NOT apply an incomplete condition (though it MAY allow saving an incomplete expression as a draft).
- BR-8: The builder MUST emit the same `filterChanged` event as other filter mechanisms, with the filter model representing the compound expression.
- BR-9: The filter model generated by the builder MUST be serializable (JSON-compatible) for state persistence (F-21) and for integration with filter presets (F-03.7).
- BR-10: When the builder is opened, it MUST populate with the current filter state (if any), allowing the user to modify an existing expression rather than starting from scratch.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | The builder can reference columns at any hierarchy level. The hierarchical preservation rule (show ancestors of matching rows) applies to the builder's result set. |
| Pivot Table | The builder MUST allow conditions on both dimension columns and value (aggregated) columns, with appropriate operators for each. |
| Gantt Chart | The builder applies to task list columns only. Timeline bars reflect the filtered task list. |

**Editability Interaction**
- When the builder panel is open and the user applies a filter, the same deferred-filter rule applies: rows with active edits that no longer match MUST remain visible until the edit completes.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Tab / Shift+Tab | Navigate between controls within the builder panel (column selector, operator, value input, buttons). | Focus within builder panel |
| Enter | Apply the filter expression and close the builder. | Focus within builder panel |
| Escape | Close the builder without applying changes (revert to the previous filter state). | Focus within builder panel |
| Delete / Backspace | When focus is on a condition row's remove button, delete the condition. | Focus on remove button |
| Ctrl+Enter | Add a new condition row to the current group. | Focus within builder panel |

**Accessibility**
- **ARIA**: The builder panel MUST use `role="dialog"` with `aria-label="Advanced filter builder"` and `aria-modal="true"` (if rendered as a modal dialog) or `aria-modal="false"` (if rendered as a non-modal panel). Each condition group MUST use `role="group"` with `aria-label="Filter group, [AND/OR]"`. Each condition row's controls MUST have descriptive `aria-label` attributes: column selector (`"Filter column"`), operator selector (`"Filter operator"`), value input (`"Filter value"`).
- **Screen Reader**: When a condition is added: SR: "Condition added. [Column] [operator] [value]." When a group's logical operator changes: SR: "Group changed to [AND/OR]." When the filter is applied: SR: "Advanced filter applied. [N] rows shown."
- **WCAG**: 1.3.1 (group structure and condition relationships are programmatically determinable via `role="group"` and labels), 2.1.1 (all builder controls are keyboard-operable), 2.4.3 (focus order within the builder follows the visual condition/group order), 2.4.6 (all controls have descriptive labels).
- **Visual**: The builder MUST visually represent the group/condition hierarchy using indentation, borders, or background shading. Nested groups MUST be visually distinguishable from their parent group. AND/OR operators MUST be clearly labeled between conditions.

**Chameleon 6 Status**: New. Chameleon 6 does not provide an advanced filter builder. This is a new capability for Chameleon 7, inspired by AG Grid Enterprise's Advanced Filter feature and DevExtreme's Filter Builder.

**Interactions**
- F-03.1 (Inline Filter Row): the builder replaces column-level filters when applied. The inline filter row SHOULD reflect the builder's per-column conditions where possible (or show "Advanced filter active" for complex expressions that cannot be represented in per-column inputs).
- F-03.2 (Filter Types): the builder uses filter type definitions for operator lists and value input controls.
- F-03.4 (External / Programmatic Filter): the builder's filter model can be set and read via the programmatic API.
- F-03.7 (Filter Presets): complex filter expressions from the builder can be saved as named presets.
- F-21 (State Persistence): the builder's compound filter expression is part of the serializable grid state.

---

## 3.7 Filter Presets / Saved States [P2]

**Description**: Users or developers can save named filter configurations and restore them later with a single action. Presets enable quick switching between commonly used views such as "Open Issues", "My Assignments", "Overdue Tasks", or "This Quarter's Revenue". Presets capture the complete filter model (column filters, quick filter text, and advanced builder expressions) as a named, storable snapshot.

**Applies to**: All variants

**Use Cases**
- UC-1: A project manager saves a filter preset called "My Overdue Tasks" that filters by assignee and due date. They can apply this preset with one click whenever they need this view.
- UC-2: A team lead creates shared presets ("Sprint 12 Bugs", "Unassigned P0") that all team members can use to standardize their grid views.
- UC-3: A sales dashboard provides pre-configured presets ("This Quarter", "Top Accounts", "At Risk") that users can switch between to get different perspectives on the same data set.
- UC-4: A user saves a complex advanced filter expression (built via F-03.6) as a preset so they do not have to reconstruct it each time.

**Conditions of Use**
- The grid MUST support a `filterPresets` configuration property that accepts an array of named filter preset objects.
- Each preset MUST contain at minimum: a `name` (human-readable label), an `id` (unique identifier), and a `filterModel` (the complete filter state to restore).
- The grid SHOULD support both developer-defined presets (provided in the initial configuration) and user-defined presets (created and managed at runtime).

**Behavioral Requirements**
- BR-1: The grid MUST provide a UI affordance for selecting a preset (e.g., a dropdown, segmented control, or button group). The preset selector MUST be configurable in position (above the grid, in a toolbar, or in a column menu).
- BR-2: When a preset is selected, the grid MUST apply the preset's `filterModel` by calling the equivalent of `setFilterModel()` (F-03.4). All current filters MUST be replaced by the preset's filter state.
- BR-3: The grid MUST support a "Save Current Filter as Preset" action that captures the current filter model, prompts the user for a name, and adds the preset to the list.
- BR-4: The grid MUST support "Update Preset" (overwrite an existing preset with the current filter state), "Rename Preset", and "Delete Preset" actions for user-defined presets.
- BR-5: Developer-defined presets (provided in initial configuration) MUST be read-only: they cannot be renamed, updated, or deleted by the user. They SHOULD be visually distinguished from user-defined presets (e.g., with a lock icon or a "Built-in" label).
- BR-6: The grid MUST emit a `filterPresetApplied` event when a preset is selected, containing the preset `id` and `name`.
- BR-7: Preset storage is the responsibility of the application. The grid MUST expose events and API methods for CRUD operations on presets. The application decides whether to persist presets in localStorage, a database, or another storage mechanism (see F-21 for state persistence patterns).
- BR-8: When no preset is active and the user modifies filters manually, the preset selector MUST display a neutral state (e.g., "Custom" or no preset selected) to indicate that the current filter does not correspond to a saved preset.
- BR-9: The grid SHOULD support an "Auto-apply on load" option for presets, where a specified preset is applied automatically when the grid initializes.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Presets for tree grids may include depth-based filter settings (e.g., "Show only level 1 and 2 nodes"). The filter model MUST support tree-specific filter parameters. |
| Pivot Table | Presets may capture both dimension filters and value filters. Switching presets can dramatically change the visible pivot structure. |
| Gantt Chart | Presets apply to task list filters. A preset like "Critical Path Tasks" would filter to show only tasks on the critical path. |

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Alt+P (or configurable shortcut) | Open the preset selector dropdown. | Focus anywhere in the grid |
| Arrow Up / Arrow Down | Navigate between presets in the dropdown. | Focus in preset dropdown |
| Enter | Apply the focused preset. | Focus on a preset in the dropdown |
| Delete | Delete the focused user-defined preset (with confirmation). | Focus on a user-defined preset |
| Escape | Close the preset dropdown without applying. | Focus in preset dropdown |

**Accessibility**
- **ARIA**: The preset selector MUST use `role="listbox"` (or `role="menu"` if implemented as a menu) with `aria-label="Filter presets"`. Each preset option MUST have `role="option"` (or `role="menuitem"`) with an accessible name matching the preset's `name`. The currently active preset MUST be indicated with `aria-selected="true"` (for `listbox`) or `aria-current="true"` (for `menu`). Developer-defined (read-only) presets SHOULD include `aria-description="Built-in preset"` to distinguish them from user-defined presets.
- **Screen Reader**: When a preset is applied: SR: "Filter preset applied: [Preset Name]. [N] rows shown." When a preset is saved: SR: "Filter preset saved: [Preset Name]." When a preset is deleted: SR: "Filter preset deleted: [Preset Name]."
- **WCAG**: 1.3.1 (preset list and active selection are programmatically determinable), 2.1.1 (preset selector is keyboard-accessible), 2.4.6 (preset names are descriptive), 3.3.4 (delete preset action requires confirmation to prevent error).
- **Visual**: The active preset MUST be visually indicated in the selector (e.g., highlighted, checkmark). User-defined presets MUST be visually distinguishable from developer-defined presets. The "Custom" state (no preset active) MUST be clearly represented.

**Chameleon 6 Status**: New. Chameleon 6 does not provide filter preset functionality. This is a new capability for Chameleon 7.

**Interactions**
- F-03.4 (External / Programmatic Filter): presets apply filter models via the programmatic API.
- F-03.6 (Advanced Filter Builder): complex builder expressions can be saved as presets.
- F-21 (State Persistence): presets can be part of the grid's persisted state. The preset list and the currently active preset are both storable.
- F-16 (Context Menus): a "Save Filter as Preset" action MAY appear in the grid's context menu or toolbar menu.

---

## Cross-Cutting Concerns

### Filter and Sort Interaction

When both filtering and sorting are active (F-02), the execution order is: filter first, then sort the filtered results. If the filter changes (rows added to or removed from the visible set), the existing sort MUST be re-applied to the new filtered set. If the sort changes, it operates on the current filtered set without re-evaluating filters.

### Filter and Grouping Interaction

When both filtering and grouping are active (F-04), filtering evaluates before grouping. Groups are formed from the filtered row set. If a group has no matching rows after filtering, the group header row MUST be hidden. If a group has at least one matching row, the group header MUST be visible and the group's aggregation values MUST be recalculated based on the filtered rows within the group.

### Filter and Tree Grid Ancestor Preservation

For Tree Grid, ALL filter mechanisms (inline filter row, quick filter, programmatic filter, floating filters, advanced builder) MUST implement ancestor preservation: when a row matches a filter, all ancestor rows up to the root MUST be displayed to maintain hierarchical context. Ancestor rows that do not themselves match the filter:
- MUST be expanded (not collapsed) to show the path to matching descendants.
- SHOULD be rendered with a dimmed or muted visual treatment (e.g., reduced opacity, lighter text color) to distinguish them from direct matches.
- MUST NOT be counted as matches in the "N rows shown" live region announcement. The announcement SHOULD say "N matching rows" to avoid confusion.

### Filter and Pivot Table Semantics

For Pivot Table, filtering has two distinct modes:
1. **Dimension filtering**: filters applied to row or column dimension headers, narrowing which dimension members are visible. This is equivalent to filtering rows/columns in the structural sense.
2. **Value filtering**: filters applied to aggregated value cells (e.g., "show only regions where total revenue > $1M"). Value filtering requires that the aggregation be computed before the filter can be evaluated.

The execution order for Pivot Tables is: dimension filter -> aggregate -> value filter -> sort.

### Filter and Editing Interaction

When a row is being edited (Edit Mode per [FD-03](../01-foundations/03-editability-model.md)) and a filter change causes the row to no longer match:
1. The row MUST remain visible until the edit is committed or cancelled.
2. The row SHOULD display a visual indicator (e.g., a warning icon or highlighted border) that it is being retained due to an in-progress edit.
3. After the edit is committed, the grid MUST re-evaluate the filter. If the committed value matches the filter, the row remains. If it does not match, the row is removed from the visible set.
4. After the edit is cancelled, the grid MUST re-evaluate the filter with the original (pre-edit) values.

### Filter and Server-Side Operations

When the grid operates in server-side mode (F-20), filter state changes MUST be communicated to the server as part of the data request. The server is responsible for returning only matching rows. The grid MUST NOT perform client-side filtering of server-provided data in server-side mode. The filter model sent to the server MUST be the same serializable structure used for client-side filtering, enabling the server to interpret column filters, quick filter text, and advanced builder expressions.

### Filter and Virtualization

Filter changes alter the total row count, requiring the virtualizer (F-11) to recalculate scroll height and visible row range. After a filter change, the grid SHOULD reset the scroll position to the top (showing the first matching rows) or optionally scroll to keep a previously focused row visible (if it still matches the filter). Filter evaluation on large datasets SHOULD be performed incrementally or off the main thread to avoid blocking the UI.

---

## Normative Requirements Summary

| ID | Requirement | Level | Feature |
|----|-------------|-------|---------|
| FR-01 | The grid MUST render an inline filter row with per-column inputs when `showFilterRow` is enabled. | MUST | F-03.1 |
| FR-02 | Filter inputs MUST have `aria-label="Filter by [Column Name]"`. | MUST | F-03.1, F-03.5 |
| FR-03 | After filter application, a live region MUST announce: "Filtered by [Column]: [value]. N rows shown." | MUST | F-03.1, F-03.3, F-03.4 |
| FR-04 | Filter cleared announcement: "Filter cleared. N rows shown." via live region. | MUST | F-03.1, F-03.3 |
| FR-05 | The filter row MUST share column widths with data rows via CSS subgrid. | MUST | F-03.1 |
| FR-06 | Filter type MUST be auto-selected based on column `dataType`. | MUST | F-03.2 |
| FR-07 | Text filters MUST be case-insensitive by default. | MUST | F-03.2 |
| FR-08 | Set filters MUST display a searchable checkbox list of distinct values. | MUST | F-03.2 |
| FR-09 | Quick filter MUST search across all visible columns by default. | MUST | F-03.3 |
| FR-10 | Quick filter input MUST have `aria-controls` pointing to the grid element. | MUST | F-03.3 |
| FR-11 | The grid MUST expose `setFilterModel()`, `getFilterModel()`, and `clearFilters()` API methods. | MUST | F-03.4 |
| FR-12 | The filter model MUST be JSON-serializable for state persistence. | MUST | F-03.4 |
| FR-13 | Programmatic filter changes MUST emit `filterChanged` events. | MUST | F-03.4 |
| FR-14 | Programmatic filter changes MUST update inline filter row and floating filter UI. | MUST | F-03.4 |
| FR-15 | Floating filters MUST NOT be active simultaneously with the inline filter row on the same column. | MUST | F-03.5 |
| FR-16 | Floating filters MUST synchronize with the full filter state. | MUST | F-03.5 |
| FR-17 | Advanced filter builder MUST support AND/OR grouping with nested condition groups. | MUST | F-03.6 |
| FR-18 | Builder filter model MUST be JSON-serializable. | MUST | F-03.6 |
| FR-19 | Filter presets MUST capture the complete filter model as a named snapshot. | MUST | F-03.7 |
| FR-20 | Developer-defined presets MUST be read-only (not user-modifiable). | MUST | F-03.7 |
| FR-21 | Tree Grid filtering MUST preserve the ancestor chain of matching rows. | MUST | F-03.1, F-03.3, F-03.4, F-03.5, F-03.6 |
| FR-22 | Filtering MUST be deferred for rows with active edits. | MUST | F-03.1, F-03.3, F-03.4, F-03.5, F-03.6 |
| FR-23 | Filter inputs MUST be keyboard-accessible. | MUST | F-03.1, F-03.2, F-03.5 |
| FR-24 | Active filter indicators MUST NOT rely on color alone (WCAG 1.4.1). | MUST | F-03.1, F-03.5 |
| FR-25 | Pivot Table value filtering MUST evaluate after aggregation. | MUST | F-03.2, F-03.4 |
| FR-26 | Gantt Chart filters MUST apply to the task list only; timeline bars reflect filtered state. | MUST | F-03.1, F-03.3, F-03.4, F-03.5 |
| FR-27 | The grid MUST emit `filterChanged` events for both UI-driven and programmatic filter changes. | MUST | F-03.1, F-03.4 |
| FR-28 | The grid MUST apply filter-then-sort execution order. | MUST | F-03 (cross-cutting) |
| FR-29 | Ancestor rows shown for context in Tree Grid MUST NOT be counted in "N rows shown" announcements. | SHOULD | F-03 (cross-cutting) |
| FR-30 | Filter evaluation on large datasets SHOULD be performed off the main thread. | SHOULD | F-03 (cross-cutting) |

---

## Cross-References

| Topic | Reference |
|-------|-----------|
| CSS subgrid layout (filter row shares column tracks) | [FD-01: Layout Model](../01-foundations/01-layout-model.md) |
| Variant-specific filter behavior (Tree ancestor preservation, Pivot dimension vs value) | [FD-02: Variant Model](../01-foundations/02-variant-model.md) |
| Filter deferred during editing | [FD-03: Editability Model](../01-foundations/03-editability-model.md) |
| Baseline ARIA structure, live regions, focus management | [FD-04: Accessibility Foundation](../01-foundations/04-accessibility-foundation.md) |
| Data types and cell formatters | F-01: Data Display & Rendering |
| Sort applies to filtered row set (filter-then-sort) | F-02: Sorting |
| Grouping formed from filtered rows | F-04: Grouping & Aggregation |
| Tree hierarchy filter ancestor preservation | F-06: Tree / Hierarchical |
| Cell editing (filter deferred during edits) | F-07: Cell Editing |
| Column management (filter row shares column tracks, frozen filter cells) | F-09: Column Management |
| Virtualization (row count changes on filter) | F-11: Virtualization & Performance |
| Internationalization (locale-aware filter matching) | F-13: Internationalization |
| Keyboard navigation (Tab into filter row, arrow keys) | F-14: Keyboard Navigation |
| Theming (filter input styling via CSS custom properties) | F-15: Theming & Styling |
| Context menus (filter actions, save preset) | F-16: Context Menus |
| Server-side filter delegation | F-20: Server-Side Operations |
| State persistence (filter model in saved state) | F-21: State Persistence & Responsive |
