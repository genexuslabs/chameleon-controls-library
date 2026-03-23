# F-22: Developer Experience

> **Part of**: [Tabular Grid Specification](../README.md)
> **Feature category**: Developer Experience
> **Variants**: All (Data Grid, Tree Grid, Pivot Table, Gantt Chart)

## Overview
Developer experience features cover TypeScript support, SSR compatibility, the event system, tool panels, external drag-and-drop, synchronized grids, plugin system, and programmatic row/column management.

---

### 22.1 TypeScript Type Definitions [P0]

**Description**: All public APIs are fully typed with TypeScript generics, giving developers compile-time safety, IDE autocompletion, and refactoring support when working with grid data.

**Applies to**: All variants

**Use Cases**
- UC-1: Developer defines `GridOptions<Employee>` and receives type errors if a `valueGetter` returns the wrong type.
- UC-2: IDE autocompletes `grid.getSelectedRows()` as `Employee[]` without requiring a cast.
- UC-3: Developer imports `ColDef`, `GridApi`, and `CellClickEvent` from the package entry point and uses them in a React wrapper component.

**Conditions of Use**
- TypeScript 4.7+ required (for the `infer` and template literal patterns used in event types).
- The package ships `.d.ts` declaration files alongside compiled JS; no `@types/` package is needed.
- Generic type parameter defaults to `unknown` when not specified, matching permissive JS usage.

**Behavioral Requirements**
- BR-1: `GridOptions<TRow>` SHALL be parameterized by row data type `TRow`, with `TRow` defaulting to `unknown`.
- BR-2: `ColDef<TRow>` SHALL type `valueGetter` as `(params: ValueGetterParams<TRow>) => unknown`, `valueSetter` as `(params: ValueSetterParams<TRow>) => boolean`, and `validate` as `(params: ValidateParams<TRow>) => ValidationResult | Promise<ValidationResult>`.
- BR-3: `GridApi<TRow>` SHALL be the return type of `grid.getApi()` and SHALL expose all programmatic API methods with typed signatures.
- BR-4: `grid.getSelectedRows()` SHALL return `TRow[]`.
- BR-5: `CellRendererParams<TRow>` SHALL include a `data: TRow` property.
- BR-6: All event payloads SHALL be typed generics: `CellClickEvent<TRow>`, `RowSelectEvent<TRow>`, `CellValueChangeEvent<TRow>`, etc.
- BR-7: All public interfaces, enums, and type aliases SHALL be exported from the package's main entry point (`index.ts`).
- BR-8: No exported symbol SHALL have type `any` in its public signature; `unknown` SHALL be used where type is genuinely indeterminate.
- BR-9: The package SHALL pass `tsc --strict --noEmit` against its own declaration files without errors.

**Chameleon 6 Status**: Existed (partial — many event payloads and cell renderer params were typed as `any` in Chameleon 6).

**Interactions**: F-22.3 (event system — all event types must be declared here), F-22.6 (programmatic API — all methods typed here), F-07 (cell editing — `valueSetter` and `validate` types)

---

### 22.2 SSR / SSG Compatibility [P1]

**Description**: The grid component can be used in Server-Side Rendering and Static Site Generation environments without build-time errors, and supports hydration without visual flicker or loss of user state.

**Applies to**: All variants

**Use Cases**
- UC-1: Next.js application pre-renders a grid as a static accessible table on the server; on the client the grid upgrades to an interactive `role="grid"` without a flash of blank content.
- UC-2: Astro static site generates a grid page; the pre-rendered HTML is valid and readable by search engine crawlers.
- UC-3: Developer imports the grid component in a Node.js test runner without getting `ReferenceError: document is not defined`.

**Conditions of Use**
- `ssr: true` must be set on the component for the static pre-render path; omitting it defaults to client-only mode.
- `stateKey`-based storage (F-21.2) must not be accessed during SSR; storage reads are deferred to client hydration.
- Hydration requires that the server-rendered HTML and the client-rendered initial HTML match (no random IDs or timestamps in initial render).

**Behavioral Requirements**
- BR-1: The grid module SHALL NOT access `document`, `window`, `navigator`, or any other browser global at module load time (i.e., during `import` or `require`).
- BR-2: When `ssr: true`, the grid SHALL render a static HTML `<table>` with `role="table"`, `<thead>`, `<tbody>`, and `<tr>` / `<td>` elements representing the initial data.
- BR-3: On client hydration, the grid SHALL upgrade the static `role="table"` to an interactive `role="grid"` without unmounting or re-rendering the visible DOM nodes.
- BR-4: Scroll position and row selection state SHALL be restored from `GridState` (if `stateKey` is set) during hydration, before the first user interaction.
- BR-5: No hydration mismatch warnings SHALL be produced by Lit's SSR hydration pipeline for any standard grid configuration.
- BR-6: The grid SHALL be importable in a Node.js 18+ environment (no browser globals required for import).
- BR-7: Virtual scrolling (F-11) SHALL be disabled in SSR mode; all rows are rendered into static HTML to enable indexing and initial paint.
- BR-8: Column definitions and row data passed as properties SHALL be used for the static render; no async data fetching is performed during SSR.

**Accessibility**
- **ARIA**: The static SSR table (`role="table"`) is fully accessible to screen readers before JavaScript loads; the hydrated interactive grid (`role="grid"`) extends this with keyboard navigation.
- **WCAG**: 4.1.1 Parsing — the server-rendered HTML SHALL be valid and parseable; 4.1.2 Name, Role, Value — all interactive controls have accessible names in the static render.

**Chameleon 6 Status**: New feature (Chameleon 6 Stencil-based had limited SSR support requiring workarounds).

**Interactions**: F-21.2 (storage not accessed during SSR), F-11 (virtualization disabled in SSR mode), F-22.1 (TypeScript types used in server-side code)

---

### 22.3 Event System [P0]

**Description**: A comprehensive, granular event system covers all user interactions and state changes, using standard `CustomEvent` instances that bubble through the DOM and are fully typed.

**Applies to**: All variants

**Use Cases**
- UC-1: Developer attaches a single listener on a container element to handle `ch-cell-click` events from multiple grids via event delegation.
- UC-2: Developer calls `event.preventDefault()` on `ch-before-edit` to conditionally block cell editing based on application state.
- UC-3: Application subscribes to `ch-state-change` to auto-save grid state to a backend API.

**Conditions of Use**
- All events are fired on the grid root element.
- Events named with the `ch-before-` prefix are cancelable; calling `event.preventDefault()` on them blocks the subsequent action.
- Events named with the `ch-after-` prefix are informational; they cannot be canceled.
- All other events (click, select, etc.) are cancelable unless noted otherwise.

**Behavioral Requirements**
- BR-1: All events SHALL be `CustomEvent` instances with `bubbles: true` and `composed: true` (to cross shadow DOM boundaries).
- BR-2: Cell events SHALL include: `ch-cell-click`, `ch-cell-dblclick`, `ch-cell-mouseenter`, `ch-cell-mouseleave`, `ch-cell-focus`, `ch-cell-blur`, `ch-cell-contextmenu`.
- BR-3: Row events SHALL include: `ch-row-click`, `ch-row-dblclick`, `ch-row-select`, `ch-row-deselect`, `ch-row-expand`, `ch-row-collapse`.
- BR-4: Column events SHALL include: `ch-column-resize`, `ch-column-reorder`, `ch-column-pin`, `ch-column-hide`, `ch-column-show`, `ch-column-sort`, `ch-column-filter`.
- BR-5: Grid lifecycle events SHALL include: `ch-grid-ready`, `ch-data-change`, `ch-state-change`, `ch-scroll-end`.
- BR-6: Edit events SHALL include: `ch-before-edit` (cancelable), `ch-after-edit`, `ch-cell-value-change`, `ch-before-commit` (cancelable), `ch-after-commit`.
- BR-7: All event `detail` objects SHALL include a `grid: GridApi` reference as their first property.
- BR-8: `ch-before-edit` and `ch-before-commit` SHALL be cancelable; calling `preventDefault()` SHALL abort the edit or commit respectively.
- BR-9: The `ch-grid-ready` event SHALL fire after the grid is fully initialized, data is loaded, and the DOM is rendered; it is safe to call `grid.getApi()` inside this handler.
- BR-10: `ch-scroll-end` SHALL fire when the user scrolls to within 20 % of the bottom of the visible rows (useful for infinite-scroll data loading).

**Variant-Specific Behavior**

| Variant | Additional Events |
|---|---|
| Tree Grid | `ch-row-expand` / `ch-row-collapse` carry `{ nodeId, depth, childCount }` in addition to standard row payload. |
| Pivot Table | `ch-pivot-change` fires when pivot dimensions are rearranged. |
| Gantt Chart | `ch-task-resize`, `ch-task-move`, `ch-task-create` fire for Gantt-specific interactions. |

**Accessibility**
- **ARIA**: Events that change visual state (sort, select, expand) SHALL update corresponding ARIA attributes (`aria-sort`, `aria-selected`, `aria-expanded`) synchronously within the same event-handler microtask.
- **Screen Reader**: State-changing events trigger ARIA live region announcements where appropriate (see individual features for specific SR strings).
- **WCAG**: 4.1.2 Name, Role, Value — all programmatic state changes via events SHALL be reflected in ARIA attributes.

**Chameleon 6 Status**: Existed (25+ events carried forward; payloads extended with `grid: GridApi` and typed generics; `ch-before-edit` and `ch-before-commit` cancellation is new).

**Interactions**: F-21.1 (stateChange event), F-07 (edit events), F-08 (row select/deselect events), F-09 (column events), F-22.1 (all event types declared in TypeScript definitions)

---

### 22.4 Tool Panels / Sidebar [P1]

**Description**: A collapsible sidebar can contain tool panels for column management, filter management, and other configuration tasks, including consumer-defined custom panels.

**Applies to**: All variants

**Use Cases**
- UC-1: User opens the Columns panel in the sidebar to reorder and toggle visibility of columns without touching the header row.
- UC-2: User opens the Filters panel to see all active filters at a glance and clear individual filters.
- UC-3: Developer adds a custom "Saved Views" panel that lists named `GridState` snapshots.

**Conditions of Use**
- `toolPanels` must be configured; the sidebar is hidden when `toolPanels` is empty or not set.
- Sidebar position defaults to right; set `sidebarPosition: 'left'` to move it to the left.
- Built-in panels are tree-shakeable; only panels listed in `toolPanels` are included in the bundle.
- The Pivot panel is only available when the grid variant is Pivot Table.

**Behavioral Requirements**
- BR-1: The sidebar SHALL be a collapsible element adjacent to the grid; it SHALL NOT overlap the grid content when open.
- BR-2: Built-in panel IDs are: `'columns'` (show/hide/reorder columns), `'filters'` (view/clear active filters), `'pivot'` (drag fields to pivot dimensions — Pivot Table variant only).
- BR-3: Custom panels SHALL be defined as `{ id: string, label: string, component: HTMLElement | (() => HTMLElement) }` and rendered inside the sidebar when opened.
- BR-4: `grid.getApi().sidebar.toggle(panelId)` SHALL open the panel if closed and close it if open.
- BR-5: `grid.getApi().sidebar.open(panelId)` and `sidebar.close()` SHALL be available for explicit control.
- BR-6: `ch-tool-panel-open` event SHALL fire with `{ panelId: string }` when a panel opens.
- BR-7: `ch-tool-panel-close` event SHALL fire with `{ panelId: string }` when a panel closes.
- BR-8: Only one panel SHALL be open at a time; opening a new panel SHALL close the currently open panel.

**Keyboard Interaction**

| Key | Action | Mode |
|---|---|---|
| Enter / Space | Open or close the focused sidebar panel button | Sidebar navigation |
| Tab | Move focus into the open panel content | Panel open |
| Escape | Close the open panel and return focus to the panel button | Panel open |

**Accessibility**
- **ARIA**: The sidebar SHALL have `role="complementary"` with `aria-label="Grid options"`. Each panel button SHALL have `aria-expanded="true|false"` and `aria-controls` pointing to the panel content. Panel content SHALL have `role="region"` with `aria-label` matching the panel title.
- **Screen Reader**: SR: When a panel opens, focus moves to the panel heading and SR announces "Columns panel, expanded" (using `aria-expanded` on the trigger button).
- **WCAG**: 2.1.1 Keyboard — all sidebar interactions operable by keyboard; 4.1.2 Name, Role, Value — all panel buttons and regions have accessible names and roles.
- **Visual**: The active panel button SHALL have a distinct visual state (border accent or background highlight) in addition to `aria-expanded`.

**Chameleon 6 Status**: New feature.

**Interactions**: F-09 (columns panel shows/hides columns — calls same visibility API), F-03 (filters panel reads/clears active filters), F-05 (pivot panel — Pivot Table only), F-22.3 (tool-panel-open/close events)

---

### 22.5 External Drag-and-Drop Integration [P1]

**Description**: Grid rows can be dragged out to external drop targets and external items can be dropped into the grid, enabling integration with file managers, Kanban boards, and other grid instances.

**Applies to**: All variants

**Use Cases**
- UC-1: User drags rows from a grid onto a "Trash" area to delete them; the consumer handles the `ch-row-drag-end` event and calls `grid.removeRow`.
- UC-2: User drags rows from one grid into another grid at a specific position (cross-grid drag).
- UC-3: Consumer registers an external drop zone on a sidebar element; when rows are dropped there, the sidebar shows a detail view.

**Conditions of Use**
- `rowDrag: true` must be set on at least one column definition to enable row dragging.
- `rowDragManaged: false` puts the consumer in control of drop logic; `rowDragManaged: true` (the default for row reordering, see F-10) handles in-grid reordering automatically.
- External drop zones must be registered via `grid.getApi().addDropZone(element, config)` before the user initiates a drag.

**Behavioral Requirements**
- BR-1: When `rowDrag: true` is set on a column, a drag handle SHALL appear in that column's cells.
- BR-2: `ch-row-drag-start` event SHALL fire when a drag begins; payload SHALL include `{ rows: TRow[], event: DragEvent }`.
- BR-3: `ch-row-drag-end` event SHALL fire when the user releases the drag; payload SHALL include `{ rows: TRow[], dropped: boolean, dropTarget: 'grid' | 'external' | 'none' }`.
- BR-4: `grid.getApi().addDropZone(element, { onDragEnter?, onDragLeave?, onDrop: (rows: TRow[]) => void })` SHALL register the element as a valid drop target for grid rows.
- BR-5: When grid rows are dragged over a registered external drop zone, the element SHALL receive a CSS class `ch-drop-zone--active`; on leave or drop it SHALL be removed.
- BR-6: `ch-external-drop` event SHALL fire on the grid element when items from outside the grid are dropped onto it; payload SHALL include `{ items: DataTransfer, targetRow: TRow, position: 'before' | 'after' | 'into' }`.
- BR-7: `ch-external-drop` SHALL be cancelable; calling `preventDefault()` SHALL reject the drop (no state change occurs).
- BR-8: Cross-grid drag (rows dragged from Grid A and dropped on Grid B) SHALL be detected automatically when both grids are registered in the same `GridSyncGroup` (F-22.7) or when the consumer handles `ch-row-drag-end` and `ch-external-drop` manually.

**Accessibility**
- **ARIA**: Draggable rows SHALL have `aria-grabbed` when dragging (deprecated but still widely supported) or equivalent `aria-describedby` describing the drag operation.
- **Screen Reader**: An alternative keyboard-based row reordering mechanism (cut and paste via Ctrl+X / Ctrl+V or dedicated toolbar buttons) SHALL be available for users who cannot perform drag gestures.
- **WCAG**: 2.5.1 Pointer Gestures — drag-and-drop SHALL have a keyboard-operable alternative; 2.1.1 Keyboard — all drag-based operations achievable without a pointer device.
- **Visual**: A drag-in-progress indicator (row ghost + drop target line) SHALL use a non-color indicator (dashed border + position line).

**Chameleon 6 Status**: New feature.

**Interactions**: F-10.1 (row reordering — same drag handle; `rowDragManaged: true` is for in-grid reorder), F-22.7 (synchronized grids — cross-grid drag detection), F-22.3 (drag events)

---

### 22.6 Programmatic Row and Column Management [P1]

**Description**: A rich set of API methods allows rows and columns to be added, removed, updated, and moved at runtime without replacing the entire dataset, enabling live data feeds, undo/redo, and dynamic schema changes.

**Applies to**: All variants

**Use Cases**
- UC-1: Real-time trading application calls `grid.updateRow(tradeId, { price: 102.5 })` as tick data arrives; only the changed cell re-renders.
- UC-2: Developer wraps multiple row insertions in `grid.beginTransaction()` / `grid.commitTransaction()` for a single DOM update.
- UC-3: Application adds a new calculated column at runtime via `grid.addColumn({ id: 'margin', ... })` after the user configures a formula.

**Conditions of Use**
- All row operations require `rowId` to be set in each row's data (configured via `GridOptions.rowId`); without it operations fall back to row index (slower).
- `moveRow` and `moveColumn` only affect the rendered order, not the underlying data source order.
- Batch transaction wrapping (F-17.3) is available but optional; individual calls outside a transaction still produce correct results (just with one DOM update each).

**Behavioral Requirements**
- BR-1: `grid.addRow(rowData: TRow, position?: { index?: number, rowId?: string, before?: boolean })` SHALL insert a row at the specified position; default is append to end.
- BR-2: `grid.addRows(rows: TRow[], position?)` SHALL insert multiple rows in a single operation, firing one `ch-data-change` event.
- BR-3: `grid.updateRow(rowId: string, partial: Partial<TRow>)` SHALL merge `partial` into the existing row data and re-render only affected cells.
- BR-4: `grid.removeRow(rowId: string)` and `grid.removeRows(rowIds: string[])` SHALL remove the specified rows and fire `ch-row-remove` events.
- BR-5: `grid.moveRow(rowId: string, targetIndex: number)` SHALL move the row to the specified visual index.
- BR-6: `grid.addColumn(colDef: ColDef<TRow>, position?: { index?: number, colId?: string, before?: boolean })` SHALL insert a new column.
- BR-7: `grid.addColumns(colDefs: ColDef<TRow>[], position?)` SHALL insert multiple columns in a single operation.
- BR-8: `grid.updateColumn(colId: string, partial: Partial<ColDef<TRow>>)` SHALL merge the partial column definition and re-render affected cells.
- BR-9: `grid.removeColumn(colId: string)` SHALL remove the column and fire `ch-column-remove`.
- BR-10: `grid.moveColumn(colId: string, targetIndex: number)` SHALL move the column to the specified visual index.
- BR-11: All row/column operations SHALL fire their corresponding events: `ch-row-add`, `ch-row-remove`, `ch-column-add`, `ch-column-remove`.
- BR-12: Inside a `beginTransaction()` / `commitTransaction()` block, only one DOM update and one aggregate event SHALL be fired after `commitTransaction()`.

**Accessibility**
- **ARIA**: Row add/remove operations SHALL update `aria-rowcount` on the grid element. Column add/remove SHALL update `aria-colcount`.
- **Screen Reader**: SR: Row additions in a live data feed grid SHOULD be announced via `aria-live="polite"` at a rate that does not overwhelm the user (announcements batched, not per-row).
- **WCAG**: 4.1.2 Name, Role, Value — `aria-rowcount` and `aria-colcount` are kept accurate at all times.

**Chameleon 6 Status**: Existed (partial — `updateRow` existed; `addColumn`/`removeColumn` are new; batch transactions are new).

**Interactions**: F-10 (row management — these APIs extend F-10 row reorder/add/remove), F-09 (column management), F-17.3 (batch transactions), F-22.1 (all methods typed in `GridApi<TRow>`), F-22.3 (events fired for each operation)

---

### 22.7 Synchronized / Aligned Grids [P1]

**Description**: Two or more grid instances can be linked so that column configuration changes and horizontal scroll position are kept in sync, enabling split-header, master-detail, and comparison-view layouts.

**Applies to**: All variants

**Use Cases**
- UC-1: A frozen-header layout is implemented as two grids (header-only grid + scrollable body grid); column widths and horizontal scroll stay in sync.
- UC-2: A comparison view shows two data sets side-by-side in separate grids that share the same column structure; user resizes a column in one grid and it updates in both.
- UC-3: Developer removes a column from one synced grid and it is also removed from all other grids in the sync group.

**Conditions of Use**
- `syncWith` property accepts a single `GridElement` reference or an array for multi-grid sync groups.
- Sync is bidirectional; any grid in the group can initiate a change that propagates to all others.
- `syncable: false` on a column definition excludes that column from synchronization (e.g., a row-number column that differs between grids).
- Column sync only applies to columns that exist in both grids (matched by `colId`); columns unique to one grid are unaffected.

**Behavioral Requirements**
- BR-1: `syncWith: GridElement | GridElement[]` SHALL establish a sync group; all grids in the group receive changes initiated by any member.
- BR-2: Synchronized behaviors SHALL include: column widths, column order, column hide/show, and horizontal scroll position.
- BR-3: Sort, filter, selection, and row data SHALL NOT be synchronized (each grid manages its own).
- BR-4: A `ch-synced-column-change` event SHALL fire on ALL grids in the group when any column change occurs in any member.
- BR-5: `ch-synced-column-change` payload SHALL include `{ originGridId: string, changeType: 'resize' | 'reorder' | 'hide' | 'show', colId: string }`.
- BR-6: Columns with `syncable: false` SHALL be excluded from synchronization; changes to them SHALL NOT propagate.
- BR-7: Horizontal scroll synchronization SHALL use a shared scroll container or a `scroll` event listener; scroll SHALL be applied without causing an infinite event loop.
- BR-8: Adding a grid to an existing sync group via `grid.syncWith(otherGrid)` at runtime SHALL immediately align column widths and order between the two grids (using the existing group's state as the source of truth).

**Accessibility**
- **ARIA**: Each synced grid remains an independent accessible grid; there is no ARIA relationship between them. Consumer is responsible for grouping them semantically (e.g., with `role="group"` on a container).
- **WCAG**: 1.3.2 Meaningful Sequence — column order changes propagated by sync SHALL maintain a logical reading order in all synced grids.

**Chameleon 6 Status**: New feature.

**Interactions**: F-09 (column resize/reorder/hide/show — these are the operations that sync), F-22.5 (cross-grid drag is independent of sync but both may be active simultaneously), F-22.3 (synced-column-change event)

---

### 22.8 Plugin / Module System [P2]

**Description**: A future extensible plugin architecture allows third-party modules and built-in opt-in capabilities to extend grid functionality, enabling tree-shaking of unused features and ecosystem growth.

**Applies to**: All variants

**Use Cases**
- UC-1: Developer registers an Excel export plugin: `grid.use(ExcelExportPlugin)` and a new `grid.exportToExcel()` method becomes available.
- UC-2: Enterprise adds a custom audit-log plugin that intercepts all `ch-cell-value-change` events and logs them to an API.
- UC-3: Application only imports `ChartingIntegrationPlugin` in the bundle; PDF export code is never included.

**Conditions of Use**
- Plugin registration via `grid.use(plugin)` must occur before or during the `ch-grid-ready` event.
- Plugins registered after `ch-grid-ready` will receive a deprecation warning in development mode.
- Two plugins with the same `name` property SHALL throw a `PluginConflictError`.
- P2 features: this entire feature is P2 (future); the `GridPlugin` interface is defined in P0 for forward compatibility but no built-in plugins are required at launch.

**Behavioral Requirements**
- BR-1 [P2]: `grid.use(plugin: GridPlugin)` SHALL call `plugin.install(gridApi)` immediately if the grid is already initialized, or queue it for installation during `ch-grid-ready` if not yet initialized. *(P2)*
- BR-2 [P2]: `GridPlugin` interface SHALL be: `{ name: string, install: (grid: GridApi) => void, uninstall?: (grid: GridApi) => void }`. *(P2)*
- BR-3 [P2]: Two plugins with the same `name` SHALL throw `PluginConflictError` on the second `grid.use()` call. *(P2)*
- BR-4 [P2]: Plugins MAY declare dependencies via `dependencies: string[]`; if a named dependency plugin is not registered, installation SHALL throw `PluginDependencyError`. *(P2)*
- BR-5 [P2]: Built-in opt-in modules (ExcelExport, PDFExport, ChartingIntegration, RichTextEditor) SHALL be importable as separate entry points and installable as plugins. *(P2)*
- BR-6 [P2]: `grid.unuse(pluginName: string)` SHALL call `plugin.uninstall(gridApi)` if defined and remove the plugin from the registry. *(P2)*
- BR-7 [P2]: Plugins SHALL be able to add custom CSS `part` values that follow the naming convention `ch-[plugin-name]-[part]`. *(P2)*

**Accessibility**
- **ARIA**: Plugin-provided UI (custom tool panels, context menu items) SHALL follow the same ARIA patterns as built-in UI (defined per feature).
- **WCAG**: Plugin-provided interactive elements SHALL meet WCAG 2.1 AA criteria; the core grid is not responsible for third-party plugin accessibility.

**Chameleon 6 Status**: New feature (P2 — future).

**Interactions**: F-22.4 (tool panels — plugins can register custom panels), F-16 (context menus — plugins can add menu items), F-12 (export — ExcelExport and PDFExport are built-in plugins), F-22.1 (GridPlugin type exported from package entry point)

---

## Normative Requirements

The following normative requirements derive from the features above and SHALL be implemented as written. Requirements marked **(P2)** belong to the plugin system and are deferred.

| ID | Requirement | Priority | Feature |
|---|---|---|---|
| DX-01 | `GridOptions<TRow>`, `ColDef<TRow>`, and `GridApi<TRow>` SHALL be parameterized generics with `TRow` defaulting to `unknown`. | P0 | F-22.1 |
| DX-02 | No exported public API symbol SHALL have type `any`; `unknown` SHALL be used where type is indeterminate. | P0 | F-22.1 |
| DX-03 | All public interfaces, enums, and type aliases SHALL be exported from the package main entry point. | P0 | F-22.1 |
| DX-04 | The package SHALL pass `tsc --strict --noEmit` against its own declaration files. | P0 | F-22.1 |
| DX-05 | All event payload types SHALL be declared generics (e.g., `CellClickEvent<TRow>`) with a typed `data: TRow` field. | P0 | F-22.1 |
| DX-06 | The grid module SHALL NOT access `document`, `window`, `navigator`, or other browser globals at module load time. | P1 | F-22.2 |
| DX-07 | When `ssr: true`, the grid SHALL render a static `<table role="table">` with full `<thead>` / `<tbody>` structure on the server. | P1 | F-22.2 |
| DX-08 | On client hydration, the grid SHALL upgrade `role="table"` to `role="grid"` without unmounting visible DOM nodes. | P1 | F-22.2 |
| DX-09 | Virtual scrolling SHALL be disabled in SSR mode; all rows SHALL be rendered into static HTML. | P1 | F-22.2 |
| DX-10 | All events SHALL be `CustomEvent` instances with `bubbles: true` and `composed: true`. | P0 | F-22.3 |
| DX-11 | All events listed in BR-2 through BR-6 of F-22.3 SHALL be implemented (cell, row, column, grid lifecycle, and edit events). | P0 | F-22.3 |
| DX-12 | `ch-before-edit` and `ch-before-commit` SHALL be cancelable via `event.preventDefault()`. | P0 | F-22.3 |
| DX-13 | All event `detail` objects SHALL include `grid: GridApi` as the first property. | P0 | F-22.3 |
| DX-14 | `ch-grid-ready` SHALL fire after data is loaded and the DOM is fully rendered; calling `grid.getApi()` inside this handler SHALL be safe. | P0 | F-22.3 |
| DX-15 | The sidebar SHALL have `role="complementary"`; panel buttons SHALL have `aria-expanded`; panel content SHALL have `role="region"` with `aria-label`. | P1 | F-22.4 |
| DX-16 | Only one tool panel SHALL be open at a time; opening a new panel SHALL close the current one. | P1 | F-22.4 |
| DX-17 | `grid.getApi().sidebar.toggle(panelId)`, `.open(panelId)`, and `.close()` SHALL be available as programmatic sidebar controls. | P1 | F-22.4 |
| DX-18 | `ch-row-drag-start` payload SHALL include `{ rows: TRow[], event: DragEvent }`. | P1 | F-22.5 |
| DX-19 | `ch-external-drop` SHALL be cancelable; `preventDefault()` SHALL reject the drop without any state change. | P1 | F-22.5 |
| DX-20 | An alternative keyboard-based row reordering mechanism SHALL be available for users who cannot perform drag gestures. | P1 | F-22.5 |
| DX-21 | `grid.addRow`, `addRows`, `updateRow`, `removeRow`, `removeRows`, and `moveRow` SHALL be available on `GridApi<TRow>` with the signatures specified in F-22.6. | P1 | F-22.6 |
| DX-22 | `grid.addColumn`, `addColumns`, `updateColumn`, `removeColumn`, and `moveColumn` SHALL be available on `GridApi<TRow>` with the signatures specified in F-22.6. | P1 | F-22.6 |
| DX-23 | `aria-rowcount` and `aria-colcount` SHALL be updated after every row or column add/remove operation. | P1 | F-22.6 |
| DX-24 | `syncWith` SHALL establish bidirectional synchronization of column widths, order, hide/show, and horizontal scroll position. | P1 | F-22.7 |
| DX-25 | Sort, filter, selection, and row data SHALL NOT be synchronized between grids in a sync group. | P1 | F-22.7 |
| DX-26 | `ch-synced-column-change` SHALL fire on all grids in a sync group with `{ originGridId, changeType, colId }` in the payload. | P1 | F-22.7 |
| DX-27 | Horizontal scroll synchronization SHALL NOT produce an infinite event loop. | P1 | F-22.7 |
| DX-28 [P2] | `grid.use(plugin)` SHALL call `plugin.install(gridApi)`; two plugins with the same `name` SHALL throw `PluginConflictError`. | P2 | F-22.8 |

---
*This file is part of the Chameleon 7 Tabular Grid Specification. See [README.md](../README.md) for the complete table of contents.*
