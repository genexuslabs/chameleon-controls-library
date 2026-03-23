# F-20: Server-Side Operations

> **Part of**: [Tabular Grid Specification](../README.md)
> **Feature category**: Server-Side Operations
> **Variants**: All (Data Grid, Tree Grid, Pivot Table, Gantt Chart)

## Overview
Server-side operations delegate sorting, filtering, grouping, and pagination to the server instead of the client. This is essential for large datasets where loading all data client-side is impractical.

---

### 20.1 Server-Side Row Model [P1]

**Description**: The grid operates in a server-side mode where data is fetched from a server on demand. Activating `rowModel: 'serverSide'` switches the grid from its default in-memory data model to a pull-based model driven by a consumer-supplied datasource object.

**Applies to**: All variants

**Use Cases**
- UC-1: A financial reporting application has 10 million transaction records in a database. The grid fetches only the visible window on demand rather than loading all records into the browser.
- UC-2: An enterprise CRM renders a contacts table backed by a REST API. Sort, filter, and group parameters are sent as query parameters on each request.
- UC-3: A data warehouse explorer paginates through query results that may contain billions of rows, making client-side data loading impossible.

**Conditions of Use**
- `rowModel: 'serverSide'` MUST be set before the grid is initialized; changing row model at runtime is not supported.
- The consumer MUST provide a `datasource` object with a `getRows(params: GetRowsParams) => Promise<RowDataResult>` method.
- `GetRowsParams` is defined as `{ startRow: number, endRow: number, sortModel: SortModel[], filterModel: FilterModel, groupKeys: string[], pivotMode: boolean, searchText?: string }`.
- `RowDataResult` is defined as `{ rows: RowData[], totalRowCount?: number, lastRow?: number }`.

**Behavioral Requirements**
- BR-1: The grid SHALL call `datasource.getRows(params)` on initial load, passing `startRow: 0`, `endRow: initialPageSize`, empty `sortModel` and `filterModel`, and empty `groupKeys`.
- BR-2: The grid SHALL call `datasource.getRows(params)` whenever the visible data window changes due to scrolling, sort change, filter change, group expansion, or pagination navigation.
- BR-3: The grid SHALL display skeleton loading rows (F-01.11) in the range `[startRow, endRow)` while a `getRows` call is pending.
- BR-4: Rows in a pending loading state SHALL carry `aria-busy="true"`. The attribute MUST be removed once data arrives and the rows are populated.
- BR-5: If `RowDataResult.totalRowCount` is provided, the grid SHALL use it to set `aria-rowcount` on the grid element for correct screen reader row count announcements.
- BR-6: If `totalRowCount` is not provided, the grid SHALL set `aria-rowcount="-1"` to indicate an unknown total, per the ARIA specification.
- BR-7: The grid SHALL emit a `datasourceError` event when `getRows` rejects, passing the error object as event detail, and SHALL clear the loading state and display an inline error indicator.
- BR-8: The grid SHALL NOT perform any client-side sort, filter, or grouping on rows returned by the datasource when `rowModel: 'serverSide'` is active; data is assumed to be pre-processed by the server.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | `groupKeys` carries the path to the expanded node. Top-level fetch uses `groupKeys: []`. |
| Pivot Table | `pivotMode: true` is passed; server computes pivot dimensions and returns `pivotFields` alongside rows. |
| Gantt Chart | `startRow`/`endRow` correspond to task rows; timeline data for each task is included in the row payload. |

**CSS Subgrid Implications**

Skeleton rows rendered during loading MUST use `grid-template-columns: subgrid` and `grid-column: 1 / -1` (per FD-01 LC-01/LC-02) so they align with the column track definitions established by the header, even before real data arrives.

**Accessibility**
- **ARIA**: `aria-rowcount` on the grid element reflects `totalRowCount` when known; `-1` otherwise.
- **ARIA**: `aria-busy="true"` on loading rows; removed when data populates.
- **Screen Reader**: SR: "Loading rows" announced via live region when a fetch begins; SR: "N rows loaded" when the fetch completes.
- **WCAG**: 4.1.3 (Status Messages) — loading and error states conveyed via live region without moving focus.
- **Visual**: Skeleton rows provide a non-color visual indicator of loading state.

**Chameleon 6 Status**: Partially existed — server-side fetching existed but without a formal datasource contract, `aria-rowcount` management, or skeleton row integration.

**Interactions**: F-01.11 (Skeleton Rows), F-20.2 (Server-Side Sorting), F-20.3 (Server-Side Filtering), F-20.4 (Server-Side Grouping), F-20.5 (Server-Side Pagination), F-20.6 (Infinite Row Model), F-11.1 (Row Virtualization — coordinates scroll position with fetch window), FD-04 (Accessibility Foundation)

---

### 20.2 Server-Side Sorting [P1]

**Description**: When in server-side mode, sort interactions do not reorder client-side data. Instead the grid rebuilds the `sortModel` and calls `getRows` with the updated parameters so the server returns pre-sorted results.

**Applies to**: All variants

**Use Cases**
- UC-1: A user clicks the "Revenue" column header in a server-side Data Grid. The grid sends `sortModel: [{ colId: 'revenue', sort: 'desc' }]` to the datasource and displays the server-sorted results.
- UC-2: A user applies a multi-column sort (Shift+click) on "Region" then "Revenue". The grid sends both entries in `sortModel` in priority order.
- UC-3: A user clicks an already-sorted column again to reverse direction. The grid sends the updated sort direction in `sortModel` without performing any local reorder.

**Conditions of Use**
- Active only when `rowModel: 'serverSide'`.
- Sort interactions on column headers work the same as client-side (F-02) from the user's perspective; only the data-processing path differs.

**Behavioral Requirements**
- BR-1: The grid SHALL NOT perform client-side comparison or reordering of rows when `rowModel: 'serverSide'` is active.
- BR-2: On sort change, the grid SHALL clear all existing data rows, show skeleton loading rows for the current visible range, and call `getRows` with the updated `sortModel`.
- BR-3: `sortModel` SHALL be an ordered array of `{ colId: string, sort: 'asc' | 'desc' }` objects, where index 0 is the primary sort column.
- BR-4: Sort direction indicators (arrows) in column headers SHALL update immediately on user interaction (optimistic UI), before the server response arrives.
- BR-5: If `getRows` rejects after a sort change, the grid SHALL revert column header sort indicators to their previous state and emit a `datasourceError` event.
- BR-6: The grid SHALL maintain the sort model across page navigation so that newly fetched pages are always requested with the current `sortModel`.
- BR-7: Programmatic sort changes via `grid.setSortModel(model)` SHALL trigger a `getRows` call with the new model, identical to user-initiated sort changes.
- BR-8: The grid SHALL announce sort state changes via a live region before the data fetch completes, consistent with F-02.8 (optimistic announcement).

**Accessibility**
- **ARIA**: `aria-sort` on sorted column headers updates immediately on interaction (optimistic), then remains accurate after data loads.
- **Screen Reader**: SR: "Revenue, sorted descending, loading" — the live region announces both the new sort state and the loading status.
- **WCAG**: 4.1.3 — sort change status conveyed as a status message.
- **Visual**: Sort direction arrows update immediately; a loading indicator in the grid body signals that data is refreshing.

**Chameleon 6 Status**: Partially existed — sort parameters were forwarded to a callback but `sortModel` lacked a standardized schema and optimistic UI was not implemented.

**Interactions**: F-02 (Sorting — column header interactions, sort cycles, multi-sort), F-20.1 (Server-Side Row Model — datasource contract), F-20.3 (Server-Side Filtering — combined sort+filter model), F-20.4 (Server-Side Grouping — sort within group levels), F-20.5 (Server-Side Pagination — sort maintained across pages), F-11.1 (Row Virtualization — scroll reset on sort change)

---

### 20.3 Server-Side Filtering [P1]

**Description**: When in server-side mode, filter changes do not hide client-side rows. Instead the grid rebuilds the `filterModel` and calls `getRows` with the updated parameters so the server returns pre-filtered results.

**Applies to**: All variants

**Use Cases**
- UC-1: A user types "Europe" into the Region column filter. After a 300 ms debounce, the grid calls `getRows` with `filterModel: { region: { type: 'contains', value: 'Europe' } }`.
- UC-2: A user applies a date range filter on a Gantt Chart. The filter model includes start and end dates sent to the server.
- UC-3: A user uses the global search box (F-03.3) in a server-side grid. `searchText: "Q3 2024"` is included in `GetRowsParams`.
- UC-4: Multiple column filters are active simultaneously. The full `filterModel` map is sent on each `getRows` call.

**Conditions of Use**
- Active only when `rowModel: 'serverSide'`.
- Filter debounce applies to text-input filters. Checkbox and select filters apply immediately.

**Behavioral Requirements**
- BR-1: The grid SHALL NOT perform client-side row hiding when `rowModel: 'serverSide'` is active.
- BR-2: On filter change, the grid SHALL clear existing data rows, show skeleton loading rows, and call `getRows` with the updated `filterModel`.
- BR-3: Text-input filter changes SHALL be debounced (default: 300 ms, configurable via `filterDebounceMs`) before triggering `getRows`.
- BR-4: `filterModel` SHALL be a map of `{ [colId: string]: FilterCondition }` where `FilterCondition` includes at minimum `{ type: string, value: unknown }`.
- BR-5: Global search (F-03.3) in server-side mode SHALL pass the current search string as `searchText` in `GetRowsParams` alongside the column-level `filterModel`.
- BR-6: Filter indicators (funnel icons) in column headers SHALL update immediately on user interaction (optimistic UI), before the server response arrives.
- BR-7: If `getRows` rejects after a filter change, the grid SHALL revert filter indicators to their previous state and emit a `datasourceError` event.
- BR-8: The grid SHALL display an active filter count in the grid toolbar (if a toolbar is present) based on the number of entries in `filterModel` plus the presence of a non-empty `searchText`.
- BR-9: Clearing all filters SHALL trigger a `getRows` call with an empty `filterModel` and no `searchText`.

**Accessibility**
- **ARIA**: `aria-label` on filter input fields identifies the column being filtered.
- **Screen Reader**: SR: "Filter applied. N rows match." announced via live region when the filtered result loads.
- **Screen Reader**: SR: "All filters cleared. N rows." announced when filters are removed.
- **WCAG**: 4.1.3 — filter result counts conveyed as status messages.
- **Visual**: Filter icon in column header uses a distinct shape (not color alone) to indicate an active filter.

**Chameleon 6 Status**: Partially existed — filter parameters were forwarded but the `filterModel` schema was not standardized, debounce was not built-in, and global search integration was absent.

**Interactions**: F-03 (Filtering — filter UI, filter condition types, global search), F-20.1 (Server-Side Row Model — datasource contract), F-20.2 (Server-Side Sorting — combined sort+filter in `getRows`), F-20.4 (Server-Side Grouping — filter applied before group keys resolved), F-20.5 (Server-Side Pagination — filter change resets to page 1), F-11.1 (Row Virtualization — row count updates on filter result)

---

### 20.4 Server-Side Grouping [P1]

**Description**: When in server-side mode with grouping enabled, the grid fetches only top-level group keys initially. On each group expansion, it calls `getRows` with `groupKeys` set to the path of the expanded group, loading that group's children lazily on demand.

**Applies to**: Data Grid, Tree Grid, Pivot Table

**Use Cases**
- UC-1: A user opens a Data Grid grouped by "Region". The grid fetches distinct region values from the server and renders them as group rows with no children loaded yet.
- UC-2: A user expands the "North America" group. The grid calls `getRows` with `groupKeys: ['North America']` and the server returns only that group's rows.
- UC-3: A user expands "North America" then "USA" in a two-level group hierarchy. The grid calls `getRows` with `groupKeys: ['North America', 'USA']`.
- UC-4: A Pivot Table fetches pivot dimensions from the server and generates column definitions from the returned `pivotFields`.

**Conditions of Use**
- Active only when `rowModel: 'serverSide'` and at least one grouping column is configured.
- Groups are collapsed by default; data is fetched only on expand.

**Behavioral Requirements**
- BR-1: On initial load with server-side grouping active, the grid SHALL call `getRows` with `groupKeys: []` to obtain top-level group keys. The `startRow`/`endRow` range applies to the top-level groups.
- BR-2: When the user expands a group row, the grid SHALL call `getRows` with `groupKeys` set to the path from the root to the expanded node (e.g., `['North America', 'USA']`).
- BR-3: Loaded group children SHALL be cached per group path. Re-collapsing and re-expanding the same group SHALL use cached data unless `grid.refreshServerSideStore(groupKeys)` is called to force a re-fetch.
- BR-4: The server MAY return a `childCount` field on group rows to indicate an estimated or exact child count. If provided, the grid SHALL display this count on the collapsed group row (e.g., "North America (247 rows)").
- BR-5: `groupKeys` SHALL be a string array where each element is the string representation of the group key value at that level.
- BR-6: Each group level MUST have its own loading skeleton displayed while its `getRows` call is pending.
- BR-7: For Pivot Table with server-side mode, the datasource MAY return `pivotFields: PivotField[]` alongside rows. The grid SHALL generate column definitions from `pivotFields` on the first `getRows` response when `pivotMode: true`.
- BR-8: Collapse of a group SHALL NOT trigger a new `getRows` call. Cached children are discarded from the DOM but retained in cache (subject to cache eviction policy).
- BR-9: `grid.refreshServerSideStore(groupKeys)` SHALL clear the cache for the specified group path and trigger a new `getRows` call for that level when the group is expanded (or immediately if it is currently expanded).

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | `groupKeys` reflects the parent node's key path. Tree nodes and grouping share the same `groupKeys` mechanism. |
| Pivot Table | `pivotMode: true` in `GetRowsParams`. Server returns `pivotFields` to drive column generation. |
| Data Grid | Standard row grouping; `groupKeys` drives hierarchical fetch levels. |

**CSS Subgrid Implications**

Group header rows returned by the server MUST use `grid-template-columns: subgrid` and `grid-column: 1 / -1` (per FD-01 LC-01). When pivot column definitions are generated dynamically from `pivotFields`, the host grid's `grid-template-columns` MUST be updated before child rows are rendered so that subgrid inheritance is correct.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Enter / Space | Expand or collapse focused group row | Any |
| Arrow Right | Expand group row if collapsed; move to first child if expanded | Any |
| Arrow Left | Collapse group row if expanded; move to parent if already collapsed | Any |

**Accessibility**
- **ARIA**: Group rows use `aria-expanded` (`true`/`false`) and `aria-level` to convey nesting depth.
- **Screen Reader**: SR: "North America, group row, collapsed, 3 of 10" — group row announced with expanded state.
- **Screen Reader**: SR: "North America, loading children" when a group fetch is pending.
- **WCAG**: 1.3.1 — group nesting conveyed structurally via `aria-level`, not only by indentation.
- **Visual**: Expand/collapse indicator uses a shape, not color alone.

**Chameleon 6 Status**: New feature — server-side hierarchical group loading did not exist in Chameleon 6.

**Interactions**: F-04 (Grouping & Aggregation — group configuration, aggregate display), F-06 (Tree/Hierarchical — tree node expansion shares `groupKeys` mechanism), F-05 (Pivoting — pivot column generation from `pivotFields`), F-20.1 (Server-Side Row Model — datasource contract), F-20.2 (Server-Side Sorting — sort within group levels), F-20.3 (Server-Side Filtering — filter applied before group resolution), F-11.1 (Row Virtualization — group children integrated into virtual row set)

---

### 20.5 Server-Side Pagination [P1]

**Description**: When in server-side mode with pagination enabled, the grid loads one page of data at a time by calling `getRows` with the appropriate row window for each page. Total page count is derived from `totalRowCount` in the datasource response.

**Applies to**: All variants

**Use Cases**
- UC-1: An admin table displays 10,000 user accounts at 50 per page. Navigating to page 3 calls `getRows` with `startRow: 100, endRow: 150`.
- UC-2: A report grid shows 25 rows per page. The user changes page size to 100; the grid recalculates pages and fetches the appropriate window.
- UC-3: A user jumps directly to page 47 using the page number input. The grid calls `getRows` with `startRow: 2300, endRow: 2350`.

**Conditions of Use**
- Active only when `rowModel: 'serverSide'` AND `pagination: true`.
- `pageSize` defaults to 100; configurable via the `pageSize` property or the page-size selector in the pagination bar.

**Behavioral Requirements**
- BR-1: The grid SHALL request each page by calling `getRows` with `startRow: (page - 1) * pageSize` and `endRow: page * pageSize`.
- BR-2: The grid SHALL derive the total page count from `Math.ceil(RowDataResult.totalRowCount / pageSize)`. If `totalRowCount` is not provided, the total page count SHALL be shown as unknown and the last-page button SHALL be disabled.
- BR-3: The grid SHALL render a pagination control bar containing: first page, previous page, page number indicators, next page, last page buttons, and a page-size selector.
- BR-4: Page navigation SHALL trigger a `getRows` call with the new row window, clear the current page's rows, and display skeleton loading rows while the request is pending.
- BR-5: Changing the page size SHALL recalculate the total page count and navigate to the page that contains the first row of the previously displayed page to preserve approximate position.
- BR-6: The page number input SHALL accept direct numeric entry. Invalid entries (non-numeric, out-of-range) SHALL be rejected and the input SHALL revert to the current page number.
- BR-7: The `aria-label` on the active page indicator SHALL read "Page N of M" when `totalRowCount` is known, or "Page N" when unknown.
- BR-8: The first-page and previous-page buttons SHALL be disabled on page 1. The next-page and last-page buttons SHALL be disabled on the last page (when `totalRowCount` is known) or the last-page button SHALL be disabled when `totalRowCount` is unknown.
- BR-9: The grid SHALL emit a `pageChanged` event carrying `{ page: number, pageSize: number }` whenever the active page changes.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Pagination operates on the top-level node set when no groups are expanded. Expanded groups increase the row count per page; behavior is configurable (`paginateChildRows: boolean`). |
| Pivot Table | Pagination operates on aggregated row count, not source data count. |
| Gantt Chart | Pagination groups tasks into pages; the timeline remains horizontally scrollable within each page. |

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Enter | Activate focused pagination button (first/prev/next/last) | Navigation mode |
| Enter | Submit page number from page number input | Edit mode |
| Tab | Move focus through pagination controls in DOM order | Navigation mode |

**Accessibility**
- **ARIA**: Pagination bar has `role="navigation"` and `aria-label="Pagination"`.
- **ARIA**: Active page button carries `aria-current="page"`.
- **ARIA**: Disabled buttons carry `aria-disabled="true"`.
- **Screen Reader**: SR: "Page 3 of 200, 50 rows" announced via live region when page navigation completes.
- **WCAG**: 1.3.1 — current page conveyed via `aria-current`, not only visual styling.
- **Visual**: Current page indicator uses a shape or underline in addition to color to distinguish it from other page numbers.

**Chameleon 6 Status**: Partially existed — pagination existed but was client-side only; server-side page window fetching and `totalRowCount`-based page count were not implemented.

**Interactions**: F-11.5 (Client-Side Pagination — distinct: client-side has all data in memory; server-side fetches per page), F-20.1 (Server-Side Row Model — datasource contract), F-20.2 (Server-Side Sorting — sort maintained across page changes), F-20.3 (Server-Side Filtering — filter change resets to page 1), F-20.6 (Infinite Row Model — mutually exclusive with server-side pagination), F-14 (Keyboard Navigation — pagination control keyboard support)

---

### 20.6 Infinite Row Model (Infinite Scroll) [P1]

**Description**: In infinite scroll mode, rows are loaded in fixed-size blocks as the user scrolls toward the end of the loaded data. Loaded blocks are cached in memory up to a configurable limit; evicted blocks are re-fetched on demand. There are no page controls; the user scrolls continuously to load more data.

**Applies to**: All variants

**Use Cases**
- UC-1: A social media analytics dashboard displays an activity feed. As the user scrolls down, the next block of 100 rows is fetched seamlessly.
- UC-2: A log viewer streams server-side events. New blocks load at the bottom as the user scrolls, while very old blocks are evicted from memory.
- UC-3: A Tree Grid with a large flat child list uses infinite scroll within an expanded group to load children in blocks.

**Conditions of Use**
- `rowModel: 'infinite'` activates this mode. This is mutually exclusive with `rowModel: 'serverSide'` and `pagination: true`.
- `cacheBlockSize` (default: 100) defines how many rows constitute one fetch block.
- `maxBlocksInCache` (default: unlimited) defines the maximum number of blocks retained in memory; the least-recently-used block is evicted when the limit is exceeded.

**Behavioral Requirements**
- BR-1: The grid SHALL trigger a `getRows` call when the user's scroll position reaches within a configurable number of rows (`infiniteInitialRowCount` default: `cacheBlockSize * 2`) of the last loaded row.
- BR-2: While a block is loading, the grid SHALL render skeleton rows for the pending row range (per F-01.11) and set `aria-busy="true"` on those rows.
- BR-3: When a block load completes, the grid SHALL append the rows to the dataset, update the virtual scroller's total row count and scroll height, remove skeleton rows, and set `aria-busy="false"` on the newly populated rows.
- BR-4: If `RowDataResult.lastRow` is provided and equals the last row in the response, the grid SHALL recognize that all data has been loaded and SHALL NOT trigger further `getRows` calls.
- BR-5: When `maxBlocksInCache` is exceeded, the grid SHALL evict the oldest block, replace its rows with skeleton rows in the DOM, and re-fetch the block when the user scrolls back to it.
- BR-6: `aria-rowcount` SHALL be updated with each new block load. If the total is not yet known, `aria-rowcount="-1"` SHALL be used until `lastRow` is received.
- BR-7: A `loadComplete` event SHALL be emitted when `lastRow` is received, signaling that the full dataset has been loaded.
- BR-8: The grid MUST NOT show pagination controls in infinite scroll mode.
- BR-9: Programmatic `grid.refreshInfiniteCache()` SHALL evict all cached blocks and re-fetch from the first block.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Infinite scroll applies independently per expanded group. Each group level has its own block cache. |
| Gantt Chart | Infinite scroll applies to the task row list; timeline rendering remains fully virtualized horizontally. |

**CSS Subgrid Implications**

Skeleton rows for pending blocks MUST use `grid-template-columns: subgrid` per FD-01 LC-01 so that column alignment is maintained visually during loading. When blocks are evicted and replaced with skeleton rows, those skeleton rows MUST also use subgrid to avoid layout shifts.

**Accessibility**
- **ARIA**: `aria-rowcount` updated on each block load; `-1` while total unknown.
- **ARIA**: `aria-busy="true"` on rows in pending blocks.
- **Screen Reader**: SR: "Loading more rows" announced via live region when a block fetch is triggered.
- **Screen Reader**: SR: "All rows loaded. N total rows." announced when `lastRow` is received.
- **WCAG**: 4.1.3 — loading state and completion conveyed as status messages.
- **Visual**: Skeleton rows provide a non-color visual indicator for in-progress blocks.

**Chameleon 6 Status**: Partially existed — basic infinite scroll existed via `ch-virtual-scroller` integration but lacked block caching, eviction, skeleton row integration, and standardized `lastRow` signaling.

**Interactions**: F-01.11 (Skeleton Rows), F-11.1 (Row Virtualization — virtualization operates on the set of loaded rows; block fetch expands that set), F-20.1 (Server-Side Row Model — shares datasource `getRows` contract), F-20.5 (Server-Side Pagination — mutually exclusive; infinite scroll has no page controls), F-20.2 (Server-Side Sorting — sort change invalidates and re-fetches all cached blocks), F-20.3 (Server-Side Filtering — filter change invalidates and re-fetches all cached blocks)

---

### 20.7 CRUD Integration Patterns [P1]

**Description**: Defines the patterns and APIs for Create, Read, Update, and Delete operations in server-side mode, supporting both optimistic (update UI immediately, roll back on error) and pessimistic (wait for server confirmation before updating UI) strategies.

**Applies to**: All variants

**Use Cases**
- UC-1: A user edits a cell in a server-side Data Grid. The value is committed optimistically; if the server rejects the update, the cell reverts to its previous value.
- UC-2: A user deletes a row by clicking a delete action button. In pessimistic mode, the row is not removed until the server confirms deletion.
- UC-3: A user adds a new row via an "Add Row" button. In optimistic mode, the row appears immediately with a temporary ID; the real server-assigned ID replaces it on successful creation.
- UC-4: A server update fails due to a validation error. The grid rolls back the row's display and shows an inline error indicator on the cell.

**Conditions of Use**
- Active only when `rowModel: 'serverSide'` or `rowModel: 'infinite'`.
- `crudMode: 'optimistic'` (default) or `'pessimistic'` controls the UI update strategy.
- `datasource` SHOULD provide `updateRow` and `deleteRow` callbacks for server communication; if not provided, the grid fires `rowUpdate` and `rowDelete` events instead.

**Behavioral Requirements**
- BR-1: **Create (optimistic)**: `grid.addRow(rowData, position?)` SHALL immediately insert the row into the displayed set with a temporary ID (prefixed `__temp_`), then the consumer calls the server; on failure the consumer MUST call `grid.removeRow(tempId)` to roll back.
- BR-2: **Create (pessimistic)**: `grid.addRow` SHALL queue the row as pending (shown with a loading indicator) and only insert it into the displayed set once the consumer calls `grid.confirmRowAdd(tempId, serverRow)`.
- BR-3: **Update (optimistic)**: After a cell edit commits (F-07), the grid SHALL immediately apply the new value to the row and call `datasource.updateRow({ rowId, colId, newValue, oldValue })`. On rejection, the grid SHALL call `grid.revertRow(rowId)` internally to restore the previous values.
- BR-4: **Update (pessimistic)**: After a cell edit commits, the grid SHALL revert the cell to its previous value and show a loading indicator on the row until `datasource.updateRow` resolves; on success the grid applies the new value; on failure the cell remains at its original value and a `rowSaveError` event is emitted.
- BR-5: **Delete (optimistic)**: `grid.deleteRow(rowId)` SHALL immediately remove the row from the displayed set, then the consumer calls the server; on failure the consumer MUST call `grid.addRow(rowData, position)` to restore it.
- BR-6: **Delete (pessimistic)**: `grid.deleteRow(rowId)` SHALL mark the row as pending deletion (grayed out with a loading indicator) and only remove it once `datasource.deleteRow` resolves; on failure the row is restored to normal state and a `rowSaveError` event is emitted.
- BR-7: `datasource.updateRow: (params: { rowId: string, colId: string, newValue: unknown, oldValue: unknown }) => Promise<void>` SHALL be called after cell edit commits in server-side mode.
- BR-8: `datasource.deleteRow: (params: { rowId: string, rowData: RowData }) => Promise<void>` SHALL be called when a delete action is triggered in server-side mode.
- BR-9: The `rowSaveError` event SHALL be emitted when any CRUD server operation fails, carrying `{ rowId: string, operation: 'create' | 'update' | 'delete', error: unknown }` as event detail.
- BR-10: Rows in a pending state (pending create, pending update, pending delete) SHALL carry `aria-busy="true"` and a visual loading indicator. `aria-busy` MUST be removed when the pending operation resolves.
- BR-11: Rows that fail a save operation SHALL carry `aria-invalid="true"` and display an inline error indicator (distinct from `aria-busy`). The error indicator MUST be dismissible by the consumer calling `grid.clearRowError(rowId)`.

**Editability Interaction**

In pessimistic mode, a cell that is awaiting server confirmation MUST NOT be editable again until the pending operation resolves. Attempting to enter Edit Mode on a pending row SHALL be blocked, and the grid SHALL announce "Save in progress" via a live region.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Enter | Commit cell edit and trigger `updateRow` call | Cell Edit Mode |
| Escape | Cancel edit and discard uncommitted value | Cell Edit Mode |
| Delete / Backspace | Trigger delete confirmation if row-level delete is mapped to these keys (configurable) | Navigation Mode |

**Accessibility**
- **ARIA**: `aria-busy="true"` on rows with pending CRUD operations.
- **ARIA**: `aria-invalid="true"` on rows that have a save error.
- **ARIA**: `aria-live="assertive"` region announces save errors immediately so the user is notified without delay.
- **Screen Reader**: SR: "Row saved." announced on successful update.
- **Screen Reader**: SR: "Save failed. Row reverted." announced on rollback.
- **WCAG**: 4.1.3 — save status and errors conveyed as status or alert messages.
- **Visual**: Error state uses a distinct border color AND an icon (not color alone) on the affected row or cell.

**Chameleon 6 Status**: New feature — no standardized CRUD API or optimistic/pessimistic mode existed in Chameleon 6. Row edits were purely client-side with no server integration contract.

**Interactions**: F-07 (Cell Editing — edit commit triggers `updateRow`; edit cancel discards before `updateRow`), F-10 (Row Management — `addRow`/`deleteRow` APIs), F-20.1 (Server-Side Row Model — datasource contract extended with `updateRow`/`deleteRow`), F-20.2 (Server-Side Sorting — pending rows maintain position during sort updates), FD-03 (Editability Model — pessimistic mode blocks re-entry into Edit Mode on pending rows), FD-04 (Accessibility Foundation — `aria-busy`, `aria-invalid`, live region announcements)

---

## Normative Requirements Summary

| ID | Requirement | Level | Feature |
|----|-------------|-------|---------|
| SS-01 | The grid MUST call `datasource.getRows(params)` on initial load when `rowModel: 'serverSide'`. | MUST | F-20.1 |
| SS-02 | The grid MUST call `datasource.getRows(params)` whenever the visible data window changes due to scroll, sort, filter, group expansion, or page navigation in server-side mode. | MUST | F-20.1 |
| SS-03 | Skeleton loading rows MUST be shown for any row range that is pending a `getRows` response. | MUST | F-20.1 |
| SS-04 | Pending loading rows MUST carry `aria-busy="true"`; the attribute MUST be removed when data populates. | MUST | F-20.1 |
| SS-05 | `aria-rowcount` MUST be set to `totalRowCount` when known, or `-1` when unknown. | MUST | F-20.1 |
| SS-06 | A `datasourceError` event MUST be emitted when `getRows` rejects. | MUST | F-20.1 |
| SS-07 | The grid MUST NOT perform client-side sort, filter, or grouping on server-provided rows in server-side mode. | MUST | F-20.1 |
| SS-08 | Sort changes in server-side mode MUST clear existing rows and call `getRows` with the updated `sortModel`. | MUST | F-20.2 |
| SS-09 | `sortModel` MUST be an ordered array of `{ colId, sort }` objects (index 0 = primary sort). | MUST | F-20.2 |
| SS-10 | Sort direction indicators MUST update optimistically before the server response arrives. | MUST | F-20.2 |
| SS-11 | If `getRows` rejects after a sort change, sort indicators MUST revert to their previous state. | MUST | F-20.2 |
| SS-12 | Filter changes in server-side mode MUST clear existing rows and call `getRows` with the updated `filterModel`. | MUST | F-20.3 |
| SS-13 | Text-input filter changes MUST be debounced (default 300 ms) before triggering `getRows`. | MUST | F-20.3 |
| SS-14 | Global search in server-side mode MUST pass `searchText` in `GetRowsParams`. | MUST | F-20.3 |
| SS-15 | Filter indicators MUST update optimistically before the server response arrives. | MUST | F-20.3 |
| SS-16 | If `getRows` rejects after a filter change, filter indicators MUST revert to their previous state. | MUST | F-20.3 |
| SS-17 | Server-side grouping MUST call `getRows` with `groupKeys: []` for the initial top-level fetch. | MUST | F-20.4 |
| SS-18 | Group expansion MUST call `getRows` with `groupKeys` set to the full path to the expanded node. | MUST | F-20.4 |
| SS-19 | Loaded group children MUST be cached per group path and reused without re-fetching unless explicitly refreshed. | MUST | F-20.4 |
| SS-20 | Server-side pagination MUST request each page with `startRow: (page-1)*pageSize` and `endRow: page*pageSize`. | MUST | F-20.5 |
| SS-21 | Total page count MUST be derived from `Math.ceil(totalRowCount / pageSize)` when `totalRowCount` is provided. | MUST | F-20.5 |
| SS-22 | Infinite scroll MUST trigger a `getRows` call when scroll position nears the last loaded row. | MUST | F-20.6 |
| SS-23 | When `RowDataResult.lastRow` is received, the grid MUST stop triggering further `getRows` calls and MUST emit `loadComplete`. | MUST | F-20.6 |
| SS-24 | When `maxBlocksInCache` is exceeded in infinite mode, the oldest block MUST be evicted and replaced with skeleton rows. | MUST | F-20.6 |
| SS-25 | In optimistic CRUD mode, row additions, updates, and deletions MUST be reflected in the UI immediately before server confirmation. | MUST | F-20.7 |
| SS-26 | In pessimistic CRUD mode, row additions, updates, and deletions MUST NOT be applied to the UI until `datasource.updateRow` / `datasource.deleteRow` resolves. | MUST | F-20.7 |
| SS-27 | The `rowSaveError` event MUST be emitted with `{ rowId, operation, error }` when any CRUD server operation fails. | MUST | F-20.7 |
| SS-28 | Rows in a pending CRUD state MUST carry `aria-busy="true"`. Rows with a save error MUST carry `aria-invalid="true"`. | MUST | F-20.7 |

---

## Cross-References

| Topic | Reference |
|-------|-----------|
| CSS subgrid layout model | [FD-01: Layout Model](../01-foundations/01-layout-model.md) |
| Variant definitions | [FD-02: Variant Model](../01-foundations/02-variant-model.md) |
| Editability model (pessimistic edit blocking) | [FD-03: Editability Model](../01-foundations/03-editability-model.md) |
| Accessibility foundation (aria-busy, live regions) | [FD-04: Accessibility Foundation](../01-foundations/04-accessibility-foundation.md) |
| Skeleton / loading rows | F-01: Data Display & Rendering (F-01.11) |
| Sorting (sort model, multi-sort, indicators) | F-02: Sorting |
| Filtering (filter model, global search) | F-03: Filtering |
| Grouping and aggregation | F-04: Grouping & Aggregation |
| Pivoting (pivot dimensions from server) | F-05: Pivoting |
| Tree / hierarchical (groupKeys for tree nodes) | F-06: Tree / Hierarchical |
| Cell editing (edit commit triggers updateRow) | F-07: Cell Editing |
| Row management (addRow, deleteRow APIs) | F-10: Row Management |
| Row virtualization (scrolling triggers fetches) | F-11: Virtualization & Performance (F-11.1) |
| Client-side pagination (distinct from server-side) | F-11: Virtualization & Performance (F-11.5) |
| Keyboard navigation | F-14: Keyboard Navigation |

---
*This file is part of the Chameleon 7 Tabular Grid Specification. See [README.md](../README.md) for the complete table of contents.*
