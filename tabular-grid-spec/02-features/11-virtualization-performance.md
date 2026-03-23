# F-11: Virtualization & Performance

Virtualization and performance features ensure the tabular grid remains responsive and efficient when rendering large datasets. Rather than creating DOM elements for every row and column in the data source, the grid renders only what the user can see plus a small buffer, recycling DOM nodes and batching updates to minimize browser layout and paint costs.

These features apply to all four variants (Data Grid, Tree Grid, Pivot Table, Gantt Chart) with variant-specific considerations for hierarchical expansion, aggregated rows, dual-region layouts, and timeline rendering.

> **Foundations**: This feature category builds on the layout model defined in [FD-01](../01-foundations/01-layout-model.md), specifically Sections 1.9 (Virtualization Compatibility) and 1.10 (Row Height Strategies). The subgrid architecture ensures that virtualized rows inherit column tracks automatically when they enter the DOM. The accessibility foundation in [FD-04](../01-foundations/04-accessibility-foundation.md), specifically Section 4.5 (Focus During Virtualization), defines how logical focus is preserved when cells are virtualized in and out of the DOM.

> **Performance contract**: The grid MUST treat performance as a first-class behavioral requirement, not an implementation detail. Each feature in this section includes measurable targets that MUST be verified through automated performance benchmarks as part of the CI pipeline.

---

## 11.1 Row Virtualization [P0]

**Description**

Row virtualization renders DOM elements only for rows that are visible in the viewport plus a configurable overscan buffer above and below. As the user scrolls, rows that leave the viewport are destroyed (or recycled per F-11.3), and new rows entering the viewport are created. This is the single most critical optimization for large datasets, reducing the DOM from potentially hundreds of thousands of elements to a fixed-size window.

**Applies to**: Data Grid, Tree Grid, Pivot Table, Gantt Chart

**Use Cases**

| ID | Use Case |
|----|----------|
| UC-1 | A financial analyst loads a dataset of 200,000 transaction records. Without virtualization, the browser would create millions of DOM nodes and become unresponsive. With row virtualization, only ~50 rows exist in the DOM at any time. |
| UC-2 | A project manager scrolls through a Gantt Chart with 5,000 tasks. The task list and timeline bars are virtualized so scrolling remains smooth at 60fps. |
| UC-3 | A Tree Grid displaying an organizational hierarchy with 10,000 nodes expands and collapses branches. Only the visible expanded nodes are rendered. |
| UC-4 | A Pivot Table with 50,000 aggregated rows scrolls smoothly, with spacers maintaining accurate scrollbar position and total scroll height. |

**Conditions of Use**

- Row virtualization MUST be enabled by default when the grid is initialized.
- The grid MUST accept an `overscanRowCount` property (default: 5) that controls how many extra rows are rendered above and below the visible viewport.
- The grid MUST support all three row height strategies defined in FD-01 Section 1.10: fixed, auto (max-content), and variable (per-row).
- Row virtualization MUST function correctly regardless of whether sorting, filtering, grouping, or tree expansion is active.

**Behavioral Requirements**

| ID | Requirement |
|----|-------------|
| BR-1 | The grid SHALL render only the rows visible in the viewport plus `overscanRowCount` rows above and below the visible range. All other rows MUST NOT exist in the DOM. |
| BR-2 | The grid SHALL maintain spacer elements (or equivalent padding) above and below the rendered rows to preserve the total scroll height. The scroll height MUST equal the sum of all row heights in the dataset, so the scrollbar thumb accurately reflects the user's position. |
| BR-3 | As the user scrolls, the grid SHALL add rows entering the viewport and remove rows leaving the viewport (beyond the overscan buffer). This MUST happen synchronously within the same animation frame to prevent visible blank regions. |
| BR-4 | Newly rendered rows MUST use `grid-template-columns: subgrid` and `grid-column: 1 / -1` per FD-01 LC-01/LC-02, ensuring they inherit the correct column tracks from the parent grid regardless of when they enter the DOM. |
| BR-5 | The grid SHALL support fixed row height (FD-01 Section 1.10.1), where total scroll height = rowCount x rowHeight. This is the highest-performance path. |
| BR-6 | The grid SHALL support auto row height (FD-01 Section 1.10.2) with an estimate-then-measure strategy: rows are rendered with an estimated height, measured after paint, and spacers are adjusted. Measured heights MUST be cached to avoid re-measurement. |
| BR-7 | The grid SHALL support variable per-row height (FD-01 Section 1.10.3) using a cumulative offset index. The virtual scroller MUST maintain a height array and perform binary search to determine which rows are visible at a given scroll position. |
| BR-8 | When the dataset changes (rows added, removed, or reordered), the virtual scroller MUST recalculate the total scroll height and visible range within the same render cycle. |
| BR-9 | The overscan buffer MUST be large enough to prevent blank flashes during normal scrolling speeds but small enough to keep DOM size minimal. The default of 5 rows SHOULD be sufficient for scroll speeds up to 2000px/s at standard row heights. |
| BR-10 | Spacer elements MUST NOT interfere with the subgrid layout. Spacers SHALL use `grid-column: 1 / -1` and a fixed height but MUST NOT declare `grid-template-columns: subgrid` (per FD-01 Section 1.9.3). |

**Variant-Specific Behavior**

| Variant | Deviation |
|---------|-----------|
| Tree Grid | Virtualization operates on the flattened list of visible (expanded) nodes. Collapsed children MUST NOT be included in the virtualized row set. When a node is expanded, the virtual scroller MUST recalculate the total row count and scroll height to include the newly visible children. |
| Pivot Table | Row virtualization applies to both dimension rows and value rows. Aggregation header rows (group totals, grand totals) are part of the virtualized set and MUST be rendered when they scroll into view. |
| Gantt Chart | Both the task list region and the timeline region MUST virtualize rows in sync. The same row range MUST be rendered in both regions to maintain visual alignment. Scroll events MUST be synchronized between the two regions. |

**CSS Subgrid Implications**

- Per FD-01 Section 1.9.2, virtualized rows are rendered inside the `.body` scroll container. Because each row uses `grid-template-columns: subgrid`, newly created rows automatically inherit the correct column tracks. This is a key advantage of the subgrid model: rows can be added and removed freely without reconfiguring column widths.
- Spacer elements occupy full-width grid areas (`grid-column: 1 / -1`) but do not participate in subgrid. They serve only as height placeholders.

**Keyboard Interaction**

| Key | Context | Action |
|-----|---------|--------|
| Arrow Down | Focus on last rendered row | The grid MUST scroll to render the next row, then move focus to it. The target row MUST be rendered before focus is moved (per FD-04 Section 4.5.4). |
| Arrow Up | Focus on first rendered row | The grid MUST scroll to render the previous row, then move focus to it. |
| Page Down | Any row focused | The grid MUST scroll by one viewport height, render the new rows, and move focus to the row at the same relative position in the new viewport. |
| Page Up | Any row focused | The grid MUST scroll by one viewport height upward, render the new rows, and move focus accordingly. |
| Ctrl+End | Any row focused | The grid MUST scroll to the last row in the dataset, render it, and move focus to it. |
| Ctrl+Home | Any row focused | The grid MUST scroll to the first row in the dataset, render it, and move focus to it. |

**Accessibility**

| Aspect | Requirement |
|--------|-------------|
| ARIA | `aria-rowcount` on the grid element MUST equal the total number of rows in the dataset (including header rows), NOT the number of currently rendered DOM rows. This enables assistive technology to announce "row N of M" accurately. |
| ARIA | `aria-rowindex` on each rendered row MUST reflect the row's 1-based position in the full dataset. Values MUST be continuous across the entire dataset; gaps in rendered rows are expected and permitted by the ARIA spec. |
| Screen Reader | When the user navigates via arrow keys to a row that is not yet in the DOM, the grid MUST render the row and move focus to it before the screen reader attempts to announce it. There MUST be no "empty" announcement. |
| Focus | Per FD-04 Section 4.5, when a focused cell scrolls out of the DOM, the grid MUST preserve `focusedRowIndex` and `focusedColIndex` logically and restore focus when the cell re-enters the DOM. The grid MUST NOT interpret focus fallback to the container as "the user tabbed out." |
| WCAG 1.3.1 | The `grid` > `rowgroup` > `row` > `gridcell` hierarchy MUST be maintained for all rendered rows. Spacer elements MUST NOT have ARIA roles that would confuse the grid structure. |
| WCAG 2.1.1 | All rows MUST be reachable via keyboard. Arrow keys MUST trigger rendering of off-screen rows as needed. |
| Visual | Scrolling MUST be visually smooth (60fps target). There MUST be no visible blank regions or content flickering during normal scrolling. |

**Chameleon 6 Status**: Supported via `ch-virtual-scroller` component wrapping the grid body. Chameleon 7 integrates virtualization directly into the grid's scroll container for tighter subgrid integration and eliminates the external wrapper dependency.

**Interactions**: F-01 (Cell Renderers -- renderer lifecycle hooks `init`/`refresh`/`destroy` for recycling), F-02 (Sorting -- re-sorting triggers full virtual scroller recalculation), F-03 (Filtering -- filtered dataset changes total row count), F-04 (Grouping -- group headers are part of the virtualized row set), F-06 (Tree -- expand/collapse changes visible row count), F-08 (Selection -- selected state preserved across virtualization cycles), F-10 (Row Management -- pinned rows exempt from virtualization), F-11.3 (DOM Recycling), F-11.6 (Large Dataset Support), F-14 (Keyboard Navigation -- FD-04 Section 4.5 focus management), FD-01 (Layout Model -- Section 1.9)

---

## 11.2 Column Virtualization [P1]

**Description**

Column virtualization applies the same principle horizontally: only columns visible in the viewport (plus an overscan buffer) are rendered or sized, while off-screen columns are collapsed. For grids with 50+ columns, this prevents excessive DOM width and cell count from degrading performance. Per FD-01 Section 1.9.4, column virtualization collapses off-screen column tracks to `0px` rather than removing them from `grid-template-columns`, preserving subgrid alignment and grid-column indices.

**Applies to**: Data Grid, Tree Grid, Pivot Table (value columns region), Gantt Chart (task list columns)

**Use Cases**

| ID | Use Case |
|----|----------|
| UC-1 | A data analyst views a CSV import with 150 columns. Only the 10-15 columns visible in the viewport are rendered; scrolling horizontally reveals additional columns without creating all 150 columns' cells per row. |
| UC-2 | A Pivot Table with 80 value columns (one per month over several years) virtualizes the horizontal axis to keep DOM size manageable. |
| UC-3 | A wide Data Grid with frozen columns on the left scrolls horizontally. Frozen columns remain fully rendered while non-frozen off-screen columns are virtualized. |

**Conditions of Use**

- Column virtualization SHOULD be enabled automatically when the column count exceeds a configurable threshold (default: 30 columns).
- The grid MUST accept an `overscanColumnCount` property (default: 3) that controls how many extra columns are rendered on each side of the visible horizontal range.
- Column virtualization MUST NOT apply to frozen (pinned) columns. Frozen columns MUST always be rendered with their full width (per FD-01 LC-09).

**Behavioral Requirements**

| ID | Requirement |
|----|-------------|
| BR-1 | The grid SHALL collapse off-screen column tracks to `0px` in `grid-template-columns`. It MUST NOT remove tracks from the template (per FD-01 LC-07). |
| BR-2 | Cell elements for columns with `0px` tracks MAY be omitted from the DOM entirely or rendered with `visibility: hidden`. Omitting cells from the DOM is preferred for performance. |
| BR-3 | When the user scrolls horizontally, the grid SHALL update `grid-template-columns` to restore tracks entering the viewport to their configured width and collapse tracks leaving the viewport to `0px`. |
| BR-4 | Frozen columns MUST be exempt from column virtualization. Their track widths and cell elements MUST always be present (per FD-01 Section 1.9.5). |
| BR-5 | The grid MUST dynamically update `grid-template-columns` on horizontal scroll. This update MUST be batched with any row virtualization updates occurring in the same frame. |
| BR-6 | Column virtualization MUST preserve the scrollbar's horizontal range. The total grid width MUST equal the sum of all column widths (including collapsed `0px` columns count as their configured width for scrollbar calculation). |
| BR-7 | When column virtualization is active and the user resizes a column (F-09), the grid MUST update the track width in `grid-template-columns` and recalculate which columns are visible. |

**Variant-Specific Behavior**

| Variant | Deviation |
|---------|-----------|
| Tree Grid | The first column (containing expand/collapse controls and indentation) SHOULD be treated as a frozen column and exempted from column virtualization to ensure the tree structure is always visible. |
| Pivot Table | Column virtualization applies to the value columns region. Dimension row headers on the left SHOULD be treated as frozen and exempted from virtualization. |
| Gantt Chart | Column virtualization applies only to the task list region. The timeline region uses its own horizontal rendering strategy (time-based, not column-based). |

**CSS Subgrid Implications**

- Collapsing a column track to `0px` does not remove it from the grid template. All `grid-column` indices remain stable, and subgrid rows continue to align correctly. This is the fundamental reason column virtualization uses track collapsing rather than track removal.
- `min-width: 0; overflow: hidden` on cells (per FD-01 LC-02) ensures that cells in `0px` tracks do not overflow into adjacent tracks.
- When a column track transitions from `0px` to its configured width, the browser recalculates the subgrid layout. This SHOULD be batched with other layout changes to avoid multiple reflows per frame.

**Keyboard Interaction**

| Key | Context | Action |
|-----|---------|--------|
| Arrow Right | Focus on last visible column's cell | The grid MUST expand the next column's track from `0px` to its configured width, scroll horizontally, and move focus to the cell. |
| Arrow Left | Focus on first visible (non-frozen) column's cell | The grid MUST expand the previous column's track, scroll horizontally, and move focus. |
| Home | Any cell focused | The grid MUST move focus to the first column in the current row, expanding its track if necessary. |
| End | Any cell focused | The grid MUST move focus to the last column in the current row, expanding its track if necessary. |

**Accessibility**

| Aspect | Requirement |
|--------|-------------|
| ARIA | `aria-colcount` on the grid element MUST equal the total number of columns in the grid, NOT the number of currently visible/rendered columns. |
| ARIA | `aria-colindex` on each rendered cell MUST reflect the cell's 1-based position in the full column set. Gaps in rendered cells are expected. |
| Screen Reader | When the user navigates via arrow keys to a column that is not currently rendered, the grid MUST restore the column and move focus before the screen reader announces. There MUST be no "empty" or "collapsed" announcement. |
| Focus | Column virtualization MUST coordinate with FD-04 Section 4.5 focus management. If the focused cell's column is collapsed, the grid MUST preserve `focusedColIndex` logically and restore the column when focus returns. |
| WCAG 2.1.1 | All columns MUST be reachable via keyboard navigation. Collapsed columns MUST be restored when the user arrows into them. |

**Chameleon 6 Status**: Not implemented. Chameleon 6 rendered all columns regardless of horizontal scroll position. Column virtualization is new in Chameleon 7.

**Interactions**: F-09 (Column Management -- column resize triggers re-evaluation of visible columns, column reorder updates grid-template-columns), F-10 (Row Management -- frozen/pinned columns exempt from virtualization), F-11.1 (Row Virtualization -- both dimensions virtualized simultaneously), F-11.7 (Batched DOM Updates -- column and row updates batched together), F-14 (Keyboard Navigation -- horizontal arrow key triggers column restoration), FD-01 (Layout Model -- Section 1.9.4, LC-07)

---

## 11.3 DOM Recycling [P0]

**Description**

DOM recycling reuses existing row and cell DOM nodes by updating their content instead of destroying old nodes and creating new ones during scrolling. When a row scrolls out of view, its DOM element is detached but kept in a pool. When a new row enters the viewport, the grid pulls a node from the pool, updates its text content, attributes, and state, and attaches it at the new position. This avoids the cost of DOM element allocation and garbage collection, which are the primary performance bottlenecks in high-frequency scroll updates.

**Applies to**: Data Grid, Tree Grid, Pivot Table, Gantt Chart

**Use Cases**

| ID | Use Case |
|----|----------|
| UC-1 | A user rapidly scrolls through 100,000 rows using the scrollbar thumb. Without recycling, the browser would create and destroy thousands of DOM nodes per second, causing frame drops and GC pauses. With recycling, the same ~60 DOM row elements are reused continuously. |
| UC-2 | A real-time dashboard updates 500 rows per second. DOM recycling ensures that cell content updates reuse existing elements rather than triggering destroy/create cycles. |
| UC-3 | A mobile user flick-scrolls through a large grid. DOM recycling prevents GC-induced jank on memory-constrained devices. |

**Conditions of Use**

- DOM recycling MUST be enabled by default when row virtualization (F-11.1) is active.
- The grid MUST maintain an internal pool of detached row elements and cell elements.
- Custom cell renderers (F-01.1) MUST support a `refresh(params)` lifecycle hook that updates the renderer's content without full re-initialization. If a renderer does not implement `refresh`, the grid MUST fall back to destroying and re-creating the renderer.

**Behavioral Requirements**

| ID | Requirement |
|----|-------------|
| BR-1 | When a row scrolls out of the overscan range, the grid SHALL detach the row element from the DOM and place it in a recycling pool instead of destroying it. |
| BR-2 | When a new row enters the viewport (or overscan range), the grid SHALL first attempt to obtain a row element from the recycling pool. Only if the pool is empty SHALL the grid create a new DOM element. |
| BR-3 | When a recycled row is reused, the grid MUST update all per-row attributes: `aria-rowindex`, `aria-selected`, `tabindex`, data attributes, CSS classes reflecting state (selected, focused, expanded, group header, etc.), and positional styles. |
| BR-4 | When a recycled cell is reused, the grid MUST update: text content or call the renderer's `refresh(params)` hook, `aria-colindex`, `aria-selected`, `aria-readonly`, `tabindex`, CSS classes, and any data-bound attributes. |
| BR-5 | Custom cell renderers (F-01.1) SHOULD implement a three-phase lifecycle: `init(params)` (called once when the renderer is first created), `refresh(params)` (called when the cell is recycled with new data), and `destroy()` (called when the renderer is permanently removed, e.g., on grid disposal). |
| BR-6 | If a custom renderer does not implement `refresh`, the grid MUST call `destroy()` on the old renderer instance and `init(params)` on a new instance. This fallback MUST be documented as a performance penalty. |
| BR-7 | The recycling pool MUST have a configurable maximum size (default: 2x the visible row count). Excess detached elements beyond the pool maximum MUST be destroyed to prevent memory leaks. |
| BR-8 | DOM recycling MUST correctly handle heterogeneous row types (data rows, group header rows, aggregation rows, tree node rows). The pool MAY be partitioned by row type to avoid mismatched recycling. |
| BR-9 | After recycling, the reused row MUST be visually indistinguishable from a freshly created row. There MUST be no residual state (stale classes, lingering tooltips, leftover event listeners from the previous row's data). |

**Variant-Specific Behavior**

| Variant | Deviation |
|---------|-----------|
| Tree Grid | Recycled rows MUST update indentation level and expand/collapse icon state. A row element previously used for a depth-2 node MUST correctly display as a depth-0 node if recycled for one. The pool MAY separate leaf-node rows from parent-node rows. |
| Pivot Table | Dimension header rows and value rows have different DOM structures. The recycling pool SHOULD maintain separate sub-pools for each row type to avoid expensive structural DOM mutations during recycling. |
| Gantt Chart | Both task list rows and timeline bar rows MUST be recycled. Timeline bar elements have additional position/width attributes that MUST be updated during recycling. |

**Editability Interaction**

- If a row containing a cell in Edit Mode scrolls out of view, the grid MUST commit or cancel the edit (per FD-03) before recycling the row element. A recycled element MUST NOT retain edit-mode state.
- When a recycled row element is reused for a row that was previously in Edit Mode (and the user scrolls back), the grid MUST re-enter Edit Mode if the edit was committed/cancelled as "pending restore." However, in practice, scrolling away from an edited cell typically commits the edit.

**Accessibility**

| Aspect | Requirement |
|--------|-------------|
| ARIA | All ARIA attributes (`aria-rowindex`, `aria-selected`, `aria-expanded`, `aria-level`, `aria-colindex`, `aria-readonly`) MUST be updated on recycled elements before the element is reattached to the DOM. Stale ARIA values from a previous row MUST NOT persist. |
| Screen Reader | Recycled elements MUST NOT produce phantom screen reader announcements from stale content. Attribute updates MUST complete before the element is made visible (i.e., update while detached, then attach). |
| WCAG 4.1.2 | Every recycled cell MUST expose correct name, role, and value after recycling. Residual state from a previous use MUST be cleared. |

**Chameleon 6 Status**: Partially implemented. The `ch-virtual-scroller` component used a basic create/destroy approach. DOM recycling is a Chameleon 7 enhancement for improved scroll performance.

**Interactions**: F-01.1 (Custom Cell Renderers -- `init`/`refresh`/`destroy` lifecycle), F-07 (Cell Editing -- edit state must be resolved before recycling), F-08 (Selection -- selected state updated on recycled rows), F-11.1 (Row Virtualization -- recycling is the implementation strategy for row add/remove), F-11.2 (Column Virtualization -- cell recycling for column changes), F-11.7 (Batched DOM Updates -- attribute updates on recycled nodes batched), FD-04 (Accessibility -- ARIA attribute correctness on recycled elements)

---

## 11.4 Lazy Loading / Infinite Scrolling [P0]

**Description**

Lazy loading (also known as infinite scrolling) incrementally fetches data chunks as the user scrolls toward the end of the currently loaded dataset. Instead of loading the entire dataset upfront, the grid starts with an initial page and fetches subsequent pages on demand. This reduces initial load time, network bandwidth, and memory consumption for datasets that are too large to transfer in a single request.

**Applies to**: Data Grid, Tree Grid, Pivot Table, Gantt Chart

**Use Cases**

| ID | Use Case |
|----|----------|
| UC-1 | A log viewer displays server logs. The initial request loads the first 500 entries. As the user scrolls toward entry 500, the grid fetches entries 501-1000, seamlessly appending them. |
| UC-2 | A Tree Grid lazily loads child nodes when a parent is expanded. Only the first level is loaded initially; deeper levels are fetched on demand. |
| UC-3 | A data analytics dashboard displays query results. The query returns 2 million rows, but the grid loads them in 10,000-row chunks as the user scrolls. |
| UC-4 | A Pivot Table with server-side aggregation lazily loads pivot cell values as the user scrolls into new intersection regions. |

**Conditions of Use**

- The grid MUST accept a data source configuration that supports asynchronous data fetching (e.g., a callback function, an observable, or a datasource interface).
- The developer MUST be able to specify the chunk size (number of rows per fetch), the fetch threshold (how close to the end of loaded data the user must scroll before triggering a fetch), and the total row count (if known) or indicate that the total is unknown.
- Lazy loading MAY coexist with client-side sorting and filtering on the loaded data, but the developer SHOULD be advised that partial-dataset operations may produce misleading results. For full-dataset operations, see F-20 (Server-Side Operations).

**Behavioral Requirements**

| ID | Requirement |
|----|-------------|
| BR-1 | The grid SHALL trigger a data fetch when the user's scroll position reaches within `fetchThreshold` rows of the last loaded row. The default `fetchThreshold` SHOULD be 20% of the current chunk size. |
| BR-2 | During a fetch operation, the grid MUST set `aria-busy="true"` on the grid element to indicate that content is being loaded. |
| BR-3 | During a fetch, the grid SHOULD display a loading indicator at the bottom of the rendered rows (e.g., a spinner row or skeleton rows). The loading indicator MUST be visually distinct from data rows. |
| BR-4 | When the fetch completes, the grid SHALL append the new rows to the dataset, update the virtual scroller's total row count and scroll height, remove the loading indicator, and set `aria-busy="false"`. |
| BR-5 | If the total row count is known upfront, `aria-rowcount` MUST be set to the total count from the start. The scrollbar MUST reflect the full dataset size, with unfetched regions represented by placeholder height. |
| BR-6 | If the total row count is unknown, `aria-rowcount` MUST be set to `-1` (per WAI-ARIA spec, indicating "size unknown"). As data is loaded, `aria-rowcount` MUST be updated to the current known count or remain `-1` until the final count is determined. |
| BR-7 | The grid MUST prevent duplicate fetch requests. If a fetch is in progress, additional scroll events that cross the threshold MUST NOT trigger another fetch until the current one completes. |
| BR-8 | If a fetch fails, the grid MUST display an error indicator (e.g., a "Retry" button in the loading row area) and set `aria-busy="false"`. The grid MUST NOT enter an unrecoverable state. A retry mechanism MUST be available. |
| BR-9 | The grid MUST support a `loadComplete` signal from the data source indicating that all data has been loaded. After this signal, no further fetch requests SHALL be triggered. |
| BR-10 | Fetched data MUST integrate seamlessly with row virtualization (F-11.1). Newly appended rows that are outside the viewport MUST NOT be rendered until they scroll into view. |

**Variant-Specific Behavior**

| Variant | Deviation |
|---------|-----------|
| Tree Grid | Lazy loading MAY operate at two levels: (1) flat lazy loading of the root-level node list, and (2) on-demand child loading when a parent node is expanded. The grid MUST support both independently. When a parent triggers child loading, `aria-busy="true"` SHOULD be set on the parent row (not the entire grid) and a loading indicator SHOULD appear below the parent row at the child indentation level. |
| Pivot Table | Lazy loading of pivot data is typically row-based (loading additional dimension intersections). Column-axis lazy loading (loading additional pivot value columns) MAY be supported if the pivot configuration produces a very wide result set. |
| Gantt Chart | Lazy loading in the task list MUST trigger corresponding lazy loading of timeline data for the same tasks. Both regions MUST show consistent loading states. |

**Keyboard Interaction**

| Key | Context | Action |
|-----|---------|--------|
| Arrow Down | Focus on last loaded row, more data available | The grid MUST trigger a data fetch, display a loading state, and move focus to the newly loaded row once the fetch completes. |
| Ctrl+End | Total row count known, data not fully loaded | The grid MUST fetch the last chunk of data and move focus to the final row. If this requires multiple fetches, the grid MAY fetch only the last chunk directly (if the data source supports random access). |

**Accessibility**

| Aspect | Requirement |
|--------|-------------|
| ARIA | `aria-busy="true"` MUST be set on the grid element (or the parent row for tree child loading) during fetch operations. |
| ARIA | `aria-rowcount` MUST be set to the total count if known, or `-1` if unknown. |
| Screen Reader | When a fetch begins, the grid's live region (FD-04 Section 4.6) MUST announce: "Loading additional rows." |
| Screen Reader | When a fetch completes, the live region MUST announce: "N rows loaded. Total: M rows." (where N is the chunk size and M is the current total). If total is unknown: "N additional rows loaded." |
| Screen Reader | When a fetch fails, the live region MUST announce: "Failed to load rows. Retry available." |
| WCAG 2.2.1 | If loading takes more than 3 seconds, users MUST be able to continue interacting with already-loaded data. The grid MUST NOT block keyboard navigation of loaded rows during a fetch. |
| WCAG 4.1.3 | Status messages (loading, loaded, error) MUST be communicated to assistive technology via live regions without moving focus. |
| Visual | The loading indicator MUST be perceivable. Skeleton rows or a spinner MUST meet WCAG 1.4.11 (Non-text Contrast) with 3:1 minimum contrast ratio. |

**Chameleon 6 Status**: Partially supported via `ch-virtual-scroller` infinite scroll events. The developer handled fetch logic externally. Chameleon 7 integrates lazy loading into the grid's datasource interface with built-in loading states, ARIA announcements, and error handling.

**Interactions**: F-02 (Sorting -- client-side sort on partial data produces incomplete results; warn developer), F-03 (Filtering -- same caveat for client-side filter on partial data), F-06 (Tree -- on-demand child node loading), F-11.1 (Row Virtualization -- lazy-loaded rows integrate with virtual scroller), F-11.6 (Large Dataset Support -- lazy loading is a prerequisite for very large datasets), F-20 (Server-Side Operations -- server-side sort/filter/page for full-dataset operations)

---

## 11.5 Client-Side Pagination [P1]

**Description**

Client-side pagination splits the dataset into discrete pages with page navigation controls. All data resides in client memory; the grid renders only the rows for the current page. Pagination is an alternative to infinite scrolling for workflows where users prefer explicit page boundaries, page-size control, and deterministic "page N of M" navigation. Pagination and infinite scrolling are mutually exclusive display modes.

**Applies to**: Data Grid, Tree Grid, Pivot Table, Gantt Chart

**Use Cases**

| ID | Use Case |
|----|----------|
| UC-1 | A customer support agent views a ticket queue paginated at 50 tickets per page, using "Next" and "Previous" to browse pages and a page-size dropdown to switch between 25, 50, and 100 tickets per page. |
| UC-2 | A regulatory report displays exactly 100 records per page with page numbers for auditability (e.g., "showing records 201-300 of 1,542"). |
| UC-3 | A Tree Grid paginates only root-level nodes. Expanding a node shows its children within the current page without affecting pagination. |
| UC-4 | A data analyst sorts a 10,000-row dataset and paginates to review sorted results page by page. Client-side sort applies to the full dataset before pagination. |

**Conditions of Use**

- The grid MUST accept a `paginationMode` property. When set to `"client"`, client-side pagination is active. Mutually exclusive with infinite scrolling (F-11.4) and server-side pagination (F-20).
- The grid MUST accept a `pageSize` property (default: 50) and a `currentPage` property (default: 1).
- Sorting and filtering (F-02, F-03) MUST operate on the full dataset before pagination is applied. The user sees sorted/filtered results paginated.

**Behavioral Requirements**

| ID | Requirement |
|----|-------------|
| BR-1 | The grid SHALL render only the rows belonging to the current page: rows from index `(currentPage - 1) * pageSize` to `currentPage * pageSize - 1`. |
| BR-2 | The grid SHALL render a pagination control bar below (or above, configurable) the grid body. The control bar MUST include: first page, previous page, page number indicators, next page, last page, and a page-size selector. |
| BR-3 | When the user changes the page, the grid SHALL replace the rendered rows with the new page's rows. Row virtualization (F-11.1) MAY still apply within a page if the page size is large enough to benefit from it. |
| BR-4 | When the user changes the page size, the grid SHALL recalculate the total page count and navigate to the page containing the first row of the previously displayed page (to maintain approximate scroll position). |
| BR-5 | The grid MUST display a status indicator showing: "Showing rows [start]-[end] of [total]" (e.g., "Showing rows 51-100 of 1,542"). |
| BR-6 | Client-side sorting (F-02) MUST sort the full dataset before pagination. Changing the sort order MUST reset `currentPage` to 1. |
| BR-7 | Client-side filtering (F-03) MUST filter the full dataset before pagination. The total page count MUST update to reflect the filtered row count. Applying a filter MUST reset `currentPage` to 1. |
| BR-8 | The pagination control bar MUST disable "Previous" and "First" when on page 1, and "Next" and "Last" when on the last page. |

**Variant-Specific Behavior**

| Variant | Deviation |
|---------|-----------|
| Tree Grid | Pagination MAY operate on root-level nodes only. Expanding a node shows its children within the current page without consuming page slots. Alternatively, pagination MAY count all visible (expanded) nodes toward the page size. The mode MUST be configurable. |
| Pivot Table | Pagination applies to the row axis. The column (value) axis is not paginated (use column virtualization instead). |
| Gantt Chart | Pagination applies to the task list. The timeline region renders bars only for tasks on the current page. Page changes MUST update both regions simultaneously. |

**Keyboard Interaction**

| Key | Context | Action |
|-----|---------|--------|
| Alt+Page Down | Focus anywhere in grid | Navigate to next page. Focus moves to the first data row of the new page. |
| Alt+Page Up | Focus anywhere in grid | Navigate to previous page. Focus moves to the first data row of the new page. |
| Tab | Focus on last row of grid | Focus moves to the pagination control bar. |
| Arrow Left/Right | Focus in pagination control bar | Navigate between pagination buttons. |
| Enter / Space | Focus on a pagination button | Activate the button (go to page, change page size). |
| Escape | Focus in pagination control bar | Return focus to the grid body (last focused cell). |

**Accessibility**

| Aspect | Requirement |
|--------|-------------|
| ARIA | The pagination control bar MUST be a `<nav>` element with `aria-label="Grid pagination"`. |
| ARIA | Each page button MUST be a `<button>`. The active page button MUST have `aria-current="page"`. |
| ARIA | Disabled navigation buttons (e.g., "Previous" on page 1) MUST have `aria-disabled="true"` (not the `disabled` HTML attribute, to maintain focusability for screen readers). |
| ARIA | The page-size selector MUST be a `<select>` or a custom dropdown with `aria-label="Rows per page"`. |
| ARIA | `aria-rowcount` on the grid MUST reflect the total dataset row count (not just the current page). `aria-rowindex` on each row MUST reflect the row's position in the full dataset. |
| Screen Reader | When the page changes, the grid's live region MUST announce: "Page N of M. Showing rows [start] through [end]." |
| Screen Reader | The status indicator ("Showing rows 51-100 of 1,542") MUST have `role="status"` and `aria-live="polite"` so that updates are announced when the page changes. |
| WCAG 2.1.1 | All pagination controls MUST be keyboard accessible. Tab order: grid body, then pagination controls. |
| WCAG 2.4.3 | Focus order MUST be logical: after changing pages, focus MUST move to the first data cell of the new page, not remain on the pagination control. |
| Visual | The active page indicator MUST have a visual style that does not rely on color alone (WCAG 1.4.1). A combination of background fill, underline, or bold text SHOULD be used. |

**Chameleon 6 Status**: Not natively supported in the grid. Developers implemented pagination externally by slicing data and passing page subsets. Chameleon 7 provides built-in client-side pagination with integrated controls and ARIA support.

**Interactions**: F-02 (Sorting -- full-dataset sort before pagination), F-03 (Filtering -- full-dataset filter before pagination, resets to page 1), F-08 (Selection -- selection state persists across pages; selecting rows on page 1 and page 3 retains both selections), F-11.1 (Row Virtualization -- may apply within large pages), F-11.4 (Lazy Loading -- mutually exclusive with pagination), F-20 (Server-Side Operations -- server-side pagination as alternative)

---

## 11.6 Large Dataset Support [P0]

**Description**

Large dataset support defines the performance targets and architectural constraints that ensure the grid remains responsive when handling datasets of 100,000+ rows. This feature is not a single mechanism but a performance contract that the combination of row virtualization (F-11.1), column virtualization (F-11.2), DOM recycling (F-11.3), and batched DOM updates (F-11.7) must collectively satisfy. It establishes measurable benchmarks, memory budgets, and degradation strategies.

**Applies to**: Data Grid, Tree Grid, Pivot Table, Gantt Chart

**Use Cases**

| ID | Use Case |
|----|----------|
| UC-1 | A financial institution loads 500,000 trade records into a Data Grid. Users sort by trade date, filter by instrument type, and scroll through results -- all operations must remain responsive. |
| UC-2 | A telecommunications provider displays 200,000 network events in a Tree Grid grouped by region and device. Expanding a region with 5,000 child events must complete without a perceptible delay. |
| UC-3 | A retail analytics Pivot Table aggregates 1,000,000 transaction rows into 50,000 pivot cells. Scrolling and drilling down must remain smooth. |
| UC-4 | A construction project Gantt Chart with 100,000 tasks renders the task list and timeline. Timeline panning and zooming must maintain 60fps. |

**Conditions of Use**

- Large dataset support requires row virtualization (F-11.1) and DOM recycling (F-11.3) to be enabled. Without these, the performance targets are not achievable.
- The grid MUST support datasets provided as flat arrays, indexed structures (Map/Set), or asynchronous data sources (F-11.4 lazy loading).
- The developer SHOULD be able to provide a `rowIdField` to enable O(1) row lookups by ID, avoiding O(n) scans on large datasets.

**Behavioral Requirements**

| ID | Requirement |
|----|-------------|
| BR-1 | The grid SHALL achieve an initial render time of less than 500ms for a 100,000-row dataset (measured from data assignment to first contentful paint, on a mid-range device: 4-core CPU, 8GB RAM). |
| BR-2 | The grid SHALL maintain a smooth scroll frame rate of 60fps (16.6ms per frame budget) for datasets up to 500,000 rows. Frame drops below 30fps MUST NOT occur during normal scrolling. |
| BR-3 | Client-side sort on 100,000 rows MUST complete in less than 200ms. Sort on 500,000 rows MUST complete in less than 1,000ms. These targets assume a single-column sort with a built-in comparator. |
| BR-4 | Client-side filter on 100,000 rows MUST complete in less than 200ms. Filter on 500,000 rows MUST complete in less than 1,000ms. |
| BR-5 | The grid's DOM node count MUST remain bounded regardless of dataset size. The maximum DOM element count SHOULD be approximately: `(visibleRows + 2 * overscanRowCount) * (visibleColumns + 2 * overscanColumnCount)` plus fixed overhead (header, pagination, scrollbar). For a typical grid (50 visible rows, 10 columns), this is approximately 1,000-2,000 elements. |
| BR-6 | Memory consumption MUST grow linearly with the dataset size for the data model, but MUST remain constant for the DOM representation. A 100,000-row dataset SHOULD consume less than 200MB of total JavaScript heap (including data + grid overhead). |
| BR-7 | The grid MUST support efficient data mutation operations: inserting a row into a 100,000-row dataset MUST NOT trigger a full re-render. Only the visible range MUST be updated. |
| BR-8 | The grid SHALL support efficient lookup structures internally. When `rowIdField` is provided, row lookups by ID MUST be O(1) using a Map or equivalent hash structure. |
| BR-9 | The grid MUST NOT freeze the main thread for more than 100ms during any single operation. Long-running operations (e.g., sorting 500,000 rows) SHOULD be broken into chunks using `requestIdleCallback` or `setTimeout(0)` yielding, with a progress indicator. |
| BR-10 | For datasets exceeding 1,000,000 rows, the grid SHOULD recommend server-side operations (F-20) and display a warning in development mode. Client-side operations on 1M+ rows MAY exceed the performance targets. |

**Variant-Specific Behavior**

| Variant | Deviation |
|---------|-----------|
| Tree Grid | Performance targets apply to the flattened visible node count. A tree with 100,000 visible nodes (after expansion) MUST meet the same targets as a flat 100,000-row Data Grid. Tree expansion/collapse MUST recalculate the flattened list in less than 50ms for a tree with up to 100,000 total nodes. |
| Pivot Table | Performance targets apply to the pivot result set (aggregated rows/columns), not the raw source data. Pivot computation itself is outside the grid's scope (performed by the developer's aggregation logic). The grid MUST handle 50,000 aggregated pivot cells performantly. |
| Gantt Chart | In addition to task list performance, the timeline region MUST maintain 60fps during panning and zooming. Timeline bar rendering MUST be virtualized horizontally (only bars in the visible time range are drawn). |

**CSS Subgrid Implications**

- The subgrid model imposes a constraint: `grid-template-columns` is defined on the host grid and inherited by all rows. Updating `grid-template-columns` (e.g., on column resize) triggers a relayout of all rendered rows. For large visible row counts (high overscan), this relayout cost is proportional to the rendered row count, NOT the dataset size (thanks to virtualization). The rendered row count SHOULD be kept below 100 to keep relayout under 16ms.
- The grid MUST NOT use `subgrid` for the row axis (only columns). Row layout is managed by the virtual scroller.

**Accessibility**

| Aspect | Requirement |
|--------|-------------|
| ARIA | `aria-rowcount` MUST reflect the total dataset size, even for 500,000+ rows. This enables screen readers to announce "row 250,000 of 500,000." |
| Screen Reader | Long-running operations (sort, filter) MUST set `aria-busy="true"` on the grid and announce progress via the live region if the operation takes more than 500ms. |
| Screen Reader | When a long operation completes, the live region MUST announce: "Sort complete. [N] rows." or "Filter applied. [N] rows match." |
| WCAG 2.2.1 | Operations that take more than 3 seconds MUST provide a way for the user to cancel or MUST show a progress indicator. The grid MUST NOT appear frozen without explanation. |

**Chameleon 6 Status**: The `ch-virtual-scroller` supported large datasets but without formal performance targets or DOM recycling. Scroll performance degraded noticeably beyond 100,000 rows. Chameleon 7 establishes explicit performance contracts and implements DOM recycling to maintain consistent performance at scale.

**Interactions**: F-02 (Sorting -- performance targets for sort operations), F-03 (Filtering -- performance targets for filter operations), F-04 (Grouping -- group computation on large datasets), F-11.1 (Row Virtualization -- primary enabler), F-11.2 (Column Virtualization -- secondary enabler), F-11.3 (DOM Recycling -- critical for scroll performance), F-11.7 (Batched DOM Updates -- prevents reflow storms), F-20 (Server-Side Operations -- recommended fallback for 1M+ rows)

---

## 11.7 Batched DOM Updates [P0]

**Description**

Batched DOM updates group multiple data changes, attribute mutations, and style modifications into a single render cycle using `requestAnimationFrame` coordination. Instead of applying each change individually (which triggers layout/reflow per change), the grid collects all pending changes and applies them in a single synchronous block within the next animation frame. This prevents excessive reflows, eliminates layout thrashing, and ensures that bulk operations (select all, bulk edit, data refresh) complete in a single paint cycle.

**Applies to**: Data Grid, Tree Grid, Pivot Table, Gantt Chart

**Use Cases**

| ID | Use Case |
|----|----------|
| UC-1 | A user clicks "Select All" on a 100,000-row dataset. The grid must update `aria-selected` on all visible rows, update the select-all checkbox, update the selection count display, and possibly update row background styles -- all in a single frame. |
| UC-2 | A real-time data feed pushes 200 cell updates per second. Without batching, each update triggers an individual reflow. With batching, all updates within a 16ms window are applied in one paint cycle. |
| UC-3 | A bulk edit operation changes a column value for 500 selected rows. The grid batches all 500 cell content updates into a single DOM write pass. |
| UC-4 | Column resize via drag updates `grid-template-columns` continuously. The grid batches resize calculations to fire once per animation frame, not once per mousemove event. |
| UC-5 | Sorting a dataset changes every visible row's content simultaneously. Batching ensures this is a single layout pass rather than N individual row updates. |

**Conditions of Use**

- Batched DOM updates MUST be an internal architectural mechanism. Developers do not enable or disable batching; it is always active.
- The grid MUST expose an API for developers to participate in batch cycles when performing programmatic multi-step updates (e.g., `grid.batchUpdate(() => { /* multiple changes */ })`).

**Behavioral Requirements**

| ID | Requirement |
|----|-------------|
| BR-1 | The grid SHALL maintain an internal change queue that accumulates data mutations, attribute changes, and style updates. |
| BR-2 | The grid SHALL flush the change queue once per animation frame using `requestAnimationFrame`. All queued changes MUST be applied in a single synchronous block within the rAF callback. |
| BR-3 | Within the flush cycle, the grid MUST follow the read-then-write pattern: first read all necessary DOM measurements (e.g., row heights for auto-sizing), then perform all DOM writes (content updates, attribute changes, style modifications). This prevents layout thrashing. |
| BR-4 | The grid SHALL expose a `batchUpdate(callback)` API. The callback receives a batch context; all grid mutations within the callback are queued and applied in the next flush cycle. This prevents intermediate renders during multi-step programmatic updates. |
| BR-5 | The `batchUpdate` API MUST support nesting. Inner `batchUpdate` calls MUST NOT trigger intermediate flushes; only the outermost `batchUpdate` completion triggers the flush. |
| BR-6 | During a batch flush, if the number of DOM mutations exceeds a configurable threshold (default: 10,000 mutations), the grid SHOULD split the flush across multiple frames using `requestAnimationFrame` chaining to avoid blocking the main thread for more than 100ms. |
| BR-7 | Scroll-triggered virtualization updates (row add/remove/recycle) MUST be included in the same batch cycle as any pending data updates. Scroll handling and data updates MUST NOT trigger separate, competing reflows. |
| BR-8 | Event emissions (e.g., `selectionChanged`, `dataChanged`) MUST be deferred until after the batch flush completes. Consumers MUST receive events that reflect the final DOM state, not intermediate states. |
| BR-9 | The grid MUST coalesce redundant updates within a batch. If the same cell's content is updated three times in one batch cycle, only the final value MUST be written to the DOM. |
| BR-10 | `aria-busy="true"` MUST be set on the grid element during a batch flush that takes more than one frame (i.e., a split flush per BR-6). `aria-busy` MUST be cleared when the final frame completes. |

**Variant-Specific Behavior**

| Variant | Deviation |
|---------|-----------|
| Tree Grid | Expand/collapse operations that add or remove many child rows MUST be batched into a single DOM update. Expanding a node with 1,000 children MUST NOT create 1,000 individual DOM insertions. |
| Pivot Table | Pivot recalculation that updates many value cells MUST batch all cell content updates into a single flush. |
| Gantt Chart | Timeline bar repositioning during pan/zoom MUST be batched. Position updates for all visible bars MUST occur in a single `requestAnimationFrame` callback. |

**Editability Interaction**

- Edit commit operations that trigger downstream updates (e.g., a formula cell recalculating, an aggregation row updating) MUST batch the original cell update and all dependent updates into a single flush cycle.
- The editor widget MUST NOT be torn down and re-created during a batch flush. If the cell being edited is also being updated by a batch (e.g., a concurrent real-time data push), the grid MUST defer the cell content update until after the edit session ends.

**Accessibility**

| Aspect | Requirement |
|--------|-------------|
| ARIA | `aria-busy="true"` MUST be set during multi-frame batch flushes (BR-6, BR-10). Single-frame flushes do not require `aria-busy` (the update is imperceptible to AT). |
| Screen Reader | Batch flushes MUST NOT generate multiple rapid-fire live region announcements. If a batch contains multiple state changes that would each trigger an announcement (e.g., sort complete + filter applied), the grid MUST coalesce them into a single announcement. |
| WCAG 2.2.2 | Real-time data updates that trigger frequent batch flushes MUST be pausable if they update content faster than the user can read. A "pause updates" control SHOULD be available for real-time data feeds. |

**Chameleon 6 Status**: Partially implemented. Stencil's rendering pipeline provided some level of batching via its virtual DOM diffing. Chameleon 7 implements explicit `requestAnimationFrame`-based batching with a read/write separation pattern for direct DOM manipulation (no virtual DOM overhead).

**Interactions**: F-02 (Sorting -- sort result applied as batched update), F-03 (Filtering -- filter result applied as batched update), F-07 (Cell Editing -- edit commit triggers batched downstream updates), F-08 (Selection -- bulk selection changes batched), F-11.1 (Row Virtualization -- scroll updates batched), F-11.2 (Column Virtualization -- horizontal scroll updates batched), F-11.3 (DOM Recycling -- recycle attribute updates batched), F-11.6 (Large Dataset Support -- batching is a prerequisite for performance targets)
