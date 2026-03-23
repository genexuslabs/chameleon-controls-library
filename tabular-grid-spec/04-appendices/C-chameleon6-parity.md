# Appendix C: Chameleon 6 Feature Parity

> **Part of**: [Tabular Grid Specification](../README.md)
> **Type**: Mapping from Chameleon 6 tabular grid features to spec sections
> **Columns**: Feature | Type | Spec Section | Status

## Overview

This appendix maps every Chameleon 6 `ch-tabular-grid` / `ch-tabular-grid-render` property, event, and method to the Chameleon 7 spec section that covers it. Use this table to verify carry-forward coverage and identify breaking changes.

**Status values**:
- **Carried Forward**: Feature exists in Ch7 spec without significant change
- **Modified**: Feature exists but with changed API or behavior
- **Extended**: Feature exists with additional capabilities added
- **Deprecated**: Feature will not be carried forward to Ch7
- **New**: Feature is in Ch7 spec but did not exist in Ch6

---

## Properties (`ch-tabular-grid-render`)

| Feature Name | Type | Spec Section | Status | Notes |
|---|---|---|---|---|
| `columns: ColDef[]` | Prop | [F-09 Column Management](../02-features/09-column-management.md) | Carried Forward | `ColDef` interface extended with Ch7 additions (sizing modes, column-level styling, collapsible groups) |
| `rows: RowData[]` | Prop | [F-01 Data Display](../02-features/01-data-display-rendering.md) | Carried Forward | `RowData` interface extended; row height callback variant added |
| `keyboardNavigationMode: 'none' \| 'select' \| 'focus'` | Prop | [F-14.1 Keyboard Navigation Mode](../02-features/14-keyboard-navigation.md) | Carried Forward | Same three modes retained; internal roving-tabindex model formalised in FD-04 |
| `rowSelectionMode: 'single' \| 'multiple' \| 'none'` | Prop | [F-08.1 Row Selection: Single](../02-features/08-selection.md) / [F-08.2 Multiple](../02-features/08-selection.md) | Extended | Ch7 adds checkbox column (F-08.3), cell range selection (F-08.5), and row marking (F-08.12) as orthogonal options |
| `rowSelection` (programmatic setter) | Prop | [F-08.8 Programmatic Selection API](../02-features/08-selection.md) | Carried Forward | Now part of the unified programmatic API; type-safe `TRow[]` accepted |
| `selectedRows` (getter) | Prop | [F-08.8 Programmatic Selection API](../02-features/08-selection.md) | Carried Forward | Return type tightened to `TRow[]`; reactive signal model in Ch7 |
| `columnReorder: boolean` | Prop | [F-09.3 Column Reorder](../02-features/09-column-management.md) | Carried Forward | Column-level opt-out added via `ColDef.reorderable` |
| `columnResize: boolean` | Prop | [F-09.1 Column Resize](../02-features/09-column-management.md) | Extended | Resize handle now reachable from any column border, not only the header; double-click to auto-size added |
| `columnHide: boolean` | Prop | [F-09.5 Column Hide/Show](../02-features/09-column-management.md) | Carried Forward | Column visibility panel (F-09.6) now available as a built-in tool panel |
| `rowDrag: boolean` | Prop | [F-10.1 Row Reorder](../02-features/10-row-management.md) | Carried Forward | External drag target integration added in F-22.5 |
| `freezeColumnsCount: number` | Prop | [F-09.4 Column Pinning/Freezing](../02-features/09-column-management.md) | Modified | Ch7 uses CSS `position: sticky` instead of duplicated DOM; both left and right pinning supported; property renamed to `pinnedLeftCount` / `pinnedRightCount` |
| `rowHeight: number` | Prop | [F-01.5 Row Height: Fixed](../02-features/01-data-display-rendering.md) | Extended | Three modes in Ch7: fixed (F-01.5), auto/content-based (F-01.6), and per-row callback (F-01.7); the scalar `rowHeight` maps to fixed mode |
| `filterRow: boolean` | Prop | [F-03.1 Inline Filter Row](../02-features/03-filtering.md) | Extended | Ch7 adds floating filters (F-03.5), advanced filter builder (F-03.6), and filter presets (F-03.7) alongside the inline row |
| `pagination: boolean` | Prop | [F-11.5 Client-Side Pagination](../02-features/11-virtualization-performance.md) | Extended | Ch7 pagination supports server-side delegation (F-20.5) and is composable with virtual scroll |
| `pageSize: number` | Prop | [F-11.5 Client-Side Pagination](../02-features/11-virtualization-performance.md) | Carried Forward | No behavioral change; default value configurable via theme |
| `currentPage: number` | Prop | [F-11.5 Client-Side Pagination](../02-features/11-virtualization-performance.md) | Carried Forward | Two-way bindable in Ch7 via controlled/uncontrolled pattern |
| `showLines: string` | Prop | [F-15.7 Grid Lines Display](../02-features/15-theming-styling.md) | Carried Forward | Accepted values unchanged; mapped to CSS custom properties in Ch7 |
| `stripedRows: boolean` | Prop | [F-15.5 Row Striping](../02-features/15-theming-styling.md) | Carried Forward | Now also controllable via the CSS custom property `--ch-grid-stripe-color` |
| `sort` (sort model) | Prop | [F-02 Sorting](../02-features/02-sorting.md) | Extended | Ch7 adds multi-column sort (F-02.2), custom comparators (F-02.3), locale-aware sort (F-02.6), and sort-by-display-value (F-02.7) |
| `filter` (filter model) | Prop | [F-03 Filtering](../02-features/03-filtering.md) | Extended | Filter model now typed; supports multi-condition per column (F-03.2) and programmatic filter (F-03.4) |
| `loading: boolean` | Prop | [F-01.13 Loading Skeleton](../02-features/01-data-display-rendering.md) | Extended | Ch7 renders configurable skeleton rows instead of a single spinner overlay; row count and animation speed are themeable |
| `editMode: 'none' \| 'inline' \| 'batch'` | Prop | [FD-03 Editability Model](../01-foundations/03-editability-model.md) | Modified | Ch7 separates navigation mode (FD-03) from edit triggers (F-07.3); `batch` maps to F-07.7 Batch Editing; `inline` maps to F-07.1 |
| `allowCreate: boolean` | Prop | [F-07.10 Enter-to-Create-New-Row](../02-features/07-cell-editing.md) | Modified | Renamed; Ch7 controls row-creation capability through `editOptions.allowCreate`; integrated with validation (F-18.5) |
| `allowDelete: boolean` | Prop | [F-10 Row Management](../02-features/10-row-management.md) / [F-22.6 Programmatic Row Management](../02-features/22-developer-experience.md) | Modified | Renamed; now combined with hover action buttons (F-10.7) and row context menu (F-16.2) as the primary delete surfaces |
| `infiniteScrollMode: boolean` | Prop | [F-11.4 Lazy Loading / Infinite Scrolling](../02-features/11-virtualization-performance.md) / [F-20.6 Infinite Row Model](../02-features/20-server-side-operations.md) | Modified | Renamed to `rowModel: 'client' \| 'infinite' \| 'server'`; infinite scroll is a distinct row model in Ch7, not a boolean flag |

---

## Events (`ch-tabular-grid-render`)

| Feature Name | Type | Spec Section | Status | Notes |
|---|---|---|---|---|
| `sortChanged` | Event | [F-02 Sorting](../02-features/02-sorting.md) | Carried Forward | Renamed `ch-sort-change`; payload typed as `SortModel[]` |
| `filterChanged` | Event | [F-03 Filtering](../02-features/03-filtering.md) | Carried Forward | Renamed `ch-filter-change`; payload typed as `FilterModel` |
| `rowClick` | Event | [F-22.3 Event System](../02-features/22-developer-experience.md) | Carried Forward | Renamed `ch-row-click`; payload includes row data, index, and pointer coordinates |
| `rowDoubleClick` | Event | [F-22.3 Event System](../02-features/22-developer-experience.md) | Carried Forward | Renamed `ch-row-dbl-click`; payload aligned with `ch-row-click` |
| `cellClick` | Event | [F-22.3 Event System](../02-features/22-developer-experience.md) | Carried Forward | Renamed `ch-cell-click`; payload includes `colId`, `rowId`, and cell value |
| `cellDoubleClick` | Event | [F-22.3 Event System](../02-features/22-developer-experience.md) | Carried Forward | Renamed `ch-cell-dbl-click`; payload aligned with `ch-cell-click` |
| `rowSelect` | Event | [F-08.9 Selection Events](../02-features/08-selection.md) | Carried Forward | Renamed `ch-row-select`; carries selected row data |
| `rowDeselect` | Event | [F-08.9 Selection Events](../02-features/08-selection.md) | Carried Forward | Renamed `ch-row-deselect`; carries deselected row data |
| `selectionChanged` | Event | [F-08.9 Selection Events](../02-features/08-selection.md) | Carried Forward | Renamed `ch-selection-change`; carries full selection snapshot (`TRow[]`) |
| `columnReorder` | Event | [F-09.3 Column Reorder](../02-features/09-column-management.md) | Carried Forward | Renamed `ch-column-reorder`; payload includes previous and new column index |
| `columnResize` | Event | [F-09.1 Column Resize](../02-features/09-column-management.md) | Carried Forward | Renamed `ch-column-resize`; payload includes `colId` and new width in px |
| `columnHide` | Event | [F-09.5 Column Hide/Show](../02-features/09-column-management.md) | Carried Forward | Renamed `ch-column-hide`; carries `colId` |
| `columnShow` | Event | [F-09.5 Column Hide/Show](../02-features/09-column-management.md) | Carried Forward | Renamed `ch-column-show`; carries `colId` |
| `rowDragStart` | Event | [F-10.1 Row Reorder](../02-features/10-row-management.md) / [F-22.5 External DnD](../02-features/22-developer-experience.md) | Extended | Renamed `ch-row-drag-start`; now also fired when dragging to an external target |
| `rowDragEnd` | Event | [F-10.1 Row Reorder](../02-features/10-row-management.md) / [F-22.5 External DnD](../02-features/22-developer-experience.md) | Extended | Renamed `ch-row-drag-end`; fired on both internal reorder completion and external drop completion |
| `rowDrop` | Event | [F-10.1 Row Reorder](../02-features/10-row-management.md) | Carried Forward | Renamed `ch-row-drop`; includes target row index and drop position (`above \| below \| on`) |
| `cellEdit` | Event | [F-07.6 Edit Lifecycle Events](../02-features/07-cell-editing.md) | Modified | Renamed `ch-cell-value-change`; payload now carries `{ colId, rowId, oldValue, newValue }` with explicit old/new distinction |
| `cellEditStart` | Event | [F-07.6 Edit Lifecycle Events](../02-features/07-cell-editing.md) | Carried Forward | Renamed `ch-before-edit`; cancellable via `event.preventDefault()` |
| `cellEditEnd` | Event | [F-07.6 Edit Lifecycle Events](../02-features/07-cell-editing.md) | Carried Forward | Renamed `ch-after-edit`; carries committed value and cancellation flag |
| `rowCreate` | Event | [F-07.10 Enter-to-Create-New-Row](../02-features/07-cell-editing.md) / [F-22.6 Programmatic Row Management](../02-features/22-developer-experience.md) | Carried Forward | Renamed `ch-row-create`; payload carries the new row's draft data |
| `rowDelete` | Event | [F-22.6 Programmatic Row Management](../02-features/22-developer-experience.md) | Carried Forward | Renamed `ch-row-delete`; cancellable via `event.preventDefault()` |
| `pageChange` | Event | [F-11.5 Client-Side Pagination](../02-features/11-virtualization-performance.md) | Carried Forward | Renamed `ch-page-change`; carries `{ page, pageSize, totalRows }` |
| `infiniteScrollLoad` | Event | [F-20.6 Infinite Row Model](../02-features/20-server-side-operations.md) | Modified | Renamed `ch-load-rows`; now part of the server-side row model API; payload carries `{ startRow, endRow, sortModel, filterModel }` |
| `gridReady` | Event | [F-22.3 Event System](../02-features/22-developer-experience.md) | Carried Forward | Renamed `ch-grid-ready`; carries grid API reference for imperative access |

---

## Methods (`ch-tabular-grid-render`)

| Feature Name | Type | Spec Section | Status | Notes |
|---|---|---|---|---|
| `selectRow(rowId)` | Method | [F-08.8 Programmatic Selection API](../02-features/08-selection.md) | Carried Forward | Signature unchanged; accepts string or number row ID |
| `deselectRow(rowId)` | Method | [F-08.8 Programmatic Selection API](../02-features/08-selection.md) | Carried Forward | Signature unchanged |
| `selectAll()` | Method | [F-08.7 Select All / Deselect All](../02-features/08-selection.md) | Carried Forward | Now respects `rowSelectionMode`; no-op when mode is `'none'` |
| `deselectAll()` | Method | [F-08.7 Select All / Deselect All](../02-features/08-selection.md) | Carried Forward | Clears both row selections and cell-range selections |
| `getSelectedRows()` | Method | [F-08.8 Programmatic Selection API](../02-features/08-selection.md) | Extended | Return type tightened from `RowData[]` to `TRow[]`; generic parameter inferred from grid configuration |
| `refreshData()` | Method | [F-20.1 Server-Side Row Model](../02-features/20-server-side-operations.md) | Carried Forward | Now also invalidates local computed column caches (F-19.1) |
| `sortBy(colId, direction)` | Method | [F-02 Sorting](../02-features/02-sorting.md) | Carried Forward | `direction` type is `'asc' \| 'desc' \| null`; `null` clears single-column sort |
| `clearSort()` | Method | [F-02 Sorting](../02-features/02-sorting.md) | Carried Forward | Clears all sort columns simultaneously |
| `filterBy(colId, filterDef)` | Method | [F-03 Filtering](../02-features/03-filtering.md) | Carried Forward | `filterDef` now typed as `FilterCondition \| FilterCondition[]` for multi-condition support |
| `clearFilter(colId?)` | Method | [F-03 Filtering](../02-features/03-filtering.md) | Carried Forward | Called without `colId` clears all active filters |
| `expandRow(rowId)` | Method | [F-10.3 Master-Detail](../02-features/10-row-management.md) | Carried Forward | Also expands tree rows when the grid is in tree mode (F-06.1) |
| `collapseRow(rowId)` | Method | [F-10.3 Master-Detail](../02-features/10-row-management.md) | Carried Forward | Also collapses tree rows when the grid is in tree mode |
| `expandAll()` | Method | [F-06.1 Tree Data](../02-features/06-tree-hierarchical.md) / [F-04.3 Group Headers](../02-features/04-grouping-aggregation.md) | Carried Forward | Expands all tree nodes or row groups depending on active variant |
| `collapseAll()` | Method | [F-06.1 Tree Data](../02-features/06-tree-hierarchical.md) / [F-04.3 Group Headers](../02-features/04-grouping-aggregation.md) | Carried Forward | Collapses all tree nodes or row groups depending on active variant |
| `scrollToRow(rowId)` | Method | [F-11 Virtualization](../02-features/11-virtualization-performance.md) | Carried Forward | Now accepts an optional `{ position: 'top' \| 'middle' \| 'bottom' \| 'nearest' }` options object |
| `scrollToColumn(colId)` | Method | [F-09 Column Management](../02-features/09-column-management.md) | Carried Forward | Scrolls horizontally; respects pinned column boundaries |
| `addRow(rowData)` | Method | [F-22.6 Programmatic Row Management](../02-features/22-developer-experience.md) | Extended | Now returns a `Promise<TRow>` with the committed row (including server-assigned ID when CRUD integration is active) |
| `deleteRow(rowId)` | Method | [F-22.6 Programmatic Row Management](../02-features/22-developer-experience.md) | Extended | Now returns `Promise<void>`; triggers `ch-row-delete` event which is cancellable |
| `updateRow(rowId, data)` | Method | [F-22.6 Programmatic Row Management](../02-features/22-developer-experience.md) | Extended | Now returns `Promise<TRow>`; partial updates supported via `Partial<TRow>` |
| `getColumnState()` | Method | [F-21.1 Grid State Save/Restore](../02-features/21-state-persistence-responsive.md) | Modified | Absorbed into the unified `getState()` API which returns the full grid state; a dedicated `getColumnState()` shim is provided for backward compatibility |
| `setColumnState(state)` | Method | [F-21.1 Grid State Save/Restore](../02-features/21-state-persistence-responsive.md) | Modified | Absorbed into `setState()`; a dedicated `setColumnState(state)` shim is provided for backward compatibility |

---

## Breaking Changes Summary

The following changes between Chameleon 6 and Chameleon 7 require attention when migrating:

### Event Renames

All events are now prefixed with `ch-` to follow the Stencil/web component convention and avoid collisions with native DOM events. The full rename list:

| Ch6 Event Name | Ch7 Event Name |
|---|---|
| `sortChanged` | `ch-sort-change` |
| `filterChanged` | `ch-filter-change` |
| `rowClick` | `ch-row-click` |
| `rowDoubleClick` | `ch-row-dbl-click` |
| `cellClick` | `ch-cell-click` |
| `cellDoubleClick` | `ch-cell-dbl-click` |
| `rowSelect` | `ch-row-select` |
| `rowDeselect` | `ch-row-deselect` |
| `selectionChanged` | `ch-selection-change` |
| `columnReorder` | `ch-column-reorder` |
| `columnResize` | `ch-column-resize` |
| `columnHide` | `ch-column-hide` |
| `columnShow` | `ch-column-show` |
| `rowDragStart` | `ch-row-drag-start` |
| `rowDragEnd` | `ch-row-drag-end` |
| `rowDrop` | `ch-row-drop` |
| `cellEdit` | `ch-cell-value-change` |
| `cellEditStart` | `ch-before-edit` |
| `cellEditEnd` | `ch-after-edit` |
| `rowCreate` | `ch-row-create` |
| `rowDelete` | `ch-row-delete` |
| `pageChange` | `ch-page-change` |
| `infiniteScrollLoad` | `ch-load-rows` |
| `gridReady` | `ch-grid-ready` |

### Property Behavior Changes

- **`freezeColumnsCount`**: Replaced by `pinnedLeftCount` and `pinnedRightCount`. The underlying mechanism changes from DOM duplication to CSS `position: sticky`, which removes the visual desynchronization bug present in Ch6.
- **`editMode`**: No longer a single tri-state prop. Ch7 separates the navigation mode (read `FD-03`) from edit triggers (`F-07.3`) and batch commit strategy (`F-07.7`).
- **`infiniteScrollMode`**: Replaced by `rowModel: 'client' | 'infinite' | 'server'`. Applications that used `infiniteScrollMode: true` should migrate to `rowModel="infinite"`.
- **`allowCreate` / `allowDelete`**: Renamed and moved into an `editOptions` object to group all mutation-related flags together.
- **`rowHeight`**: Still accepted as a scalar for fixed-height mode, but applications needing dynamic row heights must migrate to the callback form (`rowHeightFn`) or the auto-height mode.

### Deprecations

No Ch6 features are permanently dropped. The following are deprecated in Ch7 and will be removed in a future major release:

- The scalar `freezeColumnsCount` prop (replaced by `pinnedLeftCount` / `pinnedRightCount`)
- `getColumnState()` / `setColumnState()` as standalone methods (replaced by `getState()` / `setState()` with a shim retained for now)

---

> **See also**: [Appendix A: Keyboard Reference](A-keyboard-reference.md) · [Appendix B: ARIA Reference](B-aria-reference.md) · [Appendix D: Feature Priority Summary](D-feature-priority.md)
