# F-21: State Persistence & Responsive Design

> **Part of**: [Tabular Grid Specification](../README.md)
> **Feature category**: State Persistence & Responsive Design
> **Variants**: All (Data Grid, Tree Grid, Pivot Table, Gantt Chart)

## Overview
State persistence saves and restores grid configuration (column order, widths, sort, filter, etc.) across sessions. Responsive design adapts the grid layout for different screen sizes and touch devices.

---

### 21.1 Grid State Save/Restore [P1]

**Description**: The entire grid visual state can be serialized to JSON and restored later, enabling bookmarking, undo-history, and cross-session continuity.

**Applies to**: All variants

**Use Cases**
- UC-1: User customizes column order and widths, navigates away, returns to find layout unchanged.
- UC-2: Application bookmarks a specific sort+filter combination and shares a URL that restores that exact view.
- UC-3: Developer implements an undo stack by capturing state snapshots before each major user action.

**Conditions of Use**
- `grid.getState()` is always available; no configuration required to call it.
- `grid.setState(state)` can be called at any time after the grid is initialized (`ready` event has fired).
- Partial state objects are valid inputs to `setState`.

**Behavioral Requirements**
- BR-1: `grid.getState()` SHALL return a `GridState` object that is JSON-serializable (no circular references, no DOM nodes).
- BR-2: `GridState` SHALL include all of the following keys when they are applicable to the current variant: `columnOrder`, `columnWidths`, `columnVisibility`, `sortModel`, `filterModel`, `groupByColumns`, `pinnedColumns`, `pinnedRows`, `expandedGroups`, `expandedTreeNodes`, `selectedRows`, `scrollPosition`.
- BR-3: For Tree Grid variants, `GridState` SHALL include `expandedTreeNodes: string[]` (array of row IDs).
- BR-4: For Pivot Table variants, `GridState` SHALL include `pivotDimensions` (row dimensions, column dimensions, value fields).
- BR-5: For Gantt Chart variants, `GridState` SHALL include `ganttZoomLevel` and `ganttScrollPosition`.
- BR-6: `grid.setState(partial)` SHALL merge the provided keys into the current state; keys absent from the argument SHALL NOT be modified.
- BR-7: A `stateChange` event SHALL be fired after any state property changes; the event SHALL be debounced so that rapid sequential changes produce at most one event per 100 ms.
- BR-8: The `stateChange` event payload SHALL be `{ changedKeys: string[], state: GridState }`.
- BR-9: Calling `setState` programmatically SHALL NOT fire a `stateChange` event (to avoid infinite loops in save-on-change patterns).
- BR-10: `getState()` called immediately after `setState(partial)` SHALL return a state that reflects the merged result.

**Variant-Specific Behavior**

| Variant | Difference |
|---|---|
| Data Grid | `expandedGroups` tracked when row grouping is active (F-04). |
| Tree Grid | `expandedTreeNodes` tracked (F-06). |
| Pivot Table | `pivotDimensions` tracked instead of `groupByColumns` (F-05). |
| Gantt Chart | `ganttZoomLevel` and `ganttScrollPosition` tracked in addition to common keys. |

**Keyboard Interaction**

None — state save/restore is a programmatic API with no direct keyboard interaction.

**Accessibility**
- **ARIA**: No direct ARIA impact; restored state must result in a valid accessible grid (e.g., correct `aria-sort`, `aria-colindex`).
- **Screen Reader**: SR: After `setState`, the grid SHALL re-announce the current sort column via `aria-sort` without requiring user focus change.
- **WCAG**: 3.2.2 On Input — programmatic state changes SHALL NOT unexpectedly redirect focus.

**Chameleon 6 Status**: Partially existed (column widths and sort were persisted; filter, group, and tree state were not).

**Interactions**: F-02 (sorting state), F-03 (filter state), F-04 (grouping state), F-06 (tree expand state), F-21.2 (storage integration), F-22.3 (stateChange event)

---

### 21.2 Storage Integration [P1]

**Description**: Built-in integration with browser storage enables automatic state persistence without any consumer-side save/load logic. The grid saves its state on change and loads it on initialization.

**Applies to**: All variants

**Use Cases**
- UC-1: Application sets `stateKey="dashboard-grid"` and state is automatically saved to `localStorage`; on next page load the grid restores exactly where the user left off.
- UC-2: Enterprise application stores grid state server-side by providing a `customStateStorage` adapter that calls a REST API.
- UC-3: Application increments `stateVersion` after a schema change to ensure stale saved state is discarded.

**Conditions of Use**
- `stateKey` must be set for automatic persistence to activate; without it the grid does not access storage.
- `customStateStorage` is only consulted when `stateStorage: 'custom'` is set.
- Version mismatch discards stored state silently; the grid initializes with default state.

**Behavioral Requirements**
- BR-1: When `stateKey` is set, the grid SHALL attempt to read from the configured storage during initialization, before the first render.
- BR-2: When `stateKey` is set, the grid SHALL write to the configured storage on each `stateChange` event, debounced at 500 ms.
- BR-3: `stateStorage: 'localStorage'` SHALL use `window.localStorage`; `'sessionStorage'` SHALL use `window.sessionStorage`.
- BR-4: When `stateStorage: 'custom'`, the grid SHALL call `customStateStorage.get(stateKey)` on init and `customStateStorage.set(stateKey, state)` on each save.
- BR-5: `customStateStorage.get` MAY return a `Promise<GridState>`; the grid SHALL await resolution before first render.
- BR-6: If the stored state's `_version` field does not match `stateVersion`, the grid SHALL discard the stored state and initialize with defaults.
- BR-7: If `stateVersion` is not set, version checking SHALL be skipped.
- BR-8: If a storage write fails (e.g., quota exceeded), a `stateSaveFailed` event SHALL be fired with `{ error: DOMException, state: GridState }`.
- BR-9: `stateSaveFailed` SHALL NOT throw an uncaught exception; the grid SHALL continue operating normally.
- BR-10: The stored JSON SHALL include a `_version` field equal to `stateVersion` (or `null` if unset) alongside the `GridState` keys.

**Accessibility**
- **ARIA**: No direct ARIA impact.
- **WCAG**: 1.3.4 Orientation — stored `scrollPosition` SHALL be applied after hydration without causing a layout shift that confuses users.

**Chameleon 6 Status**: New feature.

**Interactions**: F-21.1 (GridState shape), F-22.2 (SSR — storage must not be accessed server-side)

---

### 21.3 Responsive Column Hiding [P1]

**Description**: Columns can be configured with breakpoint thresholds so they are automatically hidden when the grid container narrows below a specified pixel width, implementing progressive disclosure for smaller viewports.

**Applies to**: All variants

**Use Cases**
- UC-1: A "Notes" column is hidden when the grid container is narrower than 800 px, keeping the primary data visible.
- UC-2: Multiple columns have staggered `hideBelowWidth` values (1200, 900, 600 px) so columns disappear incrementally as the container shrinks.
- UC-3: Application subscribes to `responsiveColumnChange` to update a summary badge showing the count of hidden columns.

**Conditions of Use**
- `hideBelowWidth` is defined per column definition; columns without it are never responsively hidden.
- Responsive hiding respects column pinning — pinned columns are exempt from responsive hiding (pinned columns are by definition important enough to always show).
- Responsive hiding is independent of explicit column visibility toggled by the user via the columns panel.

**Behavioral Requirements**
- BR-1: The grid SHALL use a `ResizeObserver` on its own container element (not `window.innerWidth`) to determine the available width.
- BR-2: When the container width falls below a column's `hideBelowWidth` value, that column SHALL be hidden as if `columnVisibility[colId] = false`.
- BR-3: When the container width rises at or above a column's `hideBelowWidth` value, that column SHALL be restored to visible (if it was hidden solely due to responsive hiding).
- BR-4: If a column was manually hidden by the user before responsive hiding triggers, responsive unhiding SHALL NOT override the manual hide (the column remains hidden).
- BR-5: `aria-colindex` values SHALL be recalculated after responsive column changes so there are no index gaps in the accessible grid.
- BR-6: A `responsiveColumnChange` event SHALL be fired with `{ hiddenColumns: string[], visibleColumns: string[] }` whenever the set of responsively hidden columns changes.
- BR-7: Pinned columns (left or right) SHALL be exempt from responsive hiding regardless of their `hideBelowWidth` value.
- BR-8: The column header row SHALL NOT show a gap or empty cell where a responsively hidden column was; the layout SHALL reflow as if the column never existed.

**CSS Subgrid Implications**
When responsive hiding removes columns, the `grid-template-columns` definition on the header and body rows must be updated atomically to avoid a flash of misaligned content. Both rows SHALL update in the same animation frame.

**Accessibility**
- **ARIA**: Responsively hidden columns SHALL be fully removed from the accessibility tree (not merely visually hidden with `visibility: hidden`).
- **Screen Reader**: SR: When a column is responsively hidden, screen readers SHALL NOT announce it as part of the grid column count.
- **WCAG**: 1.4.10 Reflow — the grid SHALL be usable without horizontal scrolling at 320 CSS px wide (columns hidden as needed); 1.3.1 Info and Relationships — remaining visible columns retain their semantic relationships.
- **Visual**: A "hidden columns" indicator (e.g., a column count badge) SHOULD be provided so sighted users know columns are not lost.

**Chameleon 6 Status**: New feature.

**Interactions**: F-09 (column visibility), F-21.1 (state includes responsive-hidden columns), F-21.5 (adaptive layout — an alternative approach for extreme narrowing)

---

### 21.4 Touch and Mobile Optimization [P1]

**Description**: The grid supports touch-based interactions for all primary operations, with appropriate touch targets and gesture recognition for mobile and tablet users.

**Applies to**: All variants

**Use Cases**
- UC-1: Mobile user swipes horizontally and vertically to scroll a wide, tall grid.
- UC-2: Tablet user taps a row to select it, then taps a column header to sort.
- UC-3: Mobile user long-presses a row to open the context menu (equivalent to right-click on desktop).
- UC-4: Tablet user double-taps a column resize handle to auto-size the column.

**Conditions of Use**
- Touch interactions are active when the primary input mechanism is a touch device or when a touch event is detected.
- Range selection via touch drag is not supported; drag-range requires pointer precision unavailable on touch screens.
- Touch-resize via drag is not supported; only auto-size via double-tap is available on touch.

**Behavioral Requirements**
- BR-1: Single-finger swipe (horizontal and vertical) SHALL scroll the grid with momentum (inertial) scrolling.
- BR-2: Tap on a row SHALL select the row when `rowSelection` is enabled (equivalent to mouse click).
- BR-3: Long-press (≥ 500 ms) on a row SHALL open the context menu (equivalent to right-click).
- BR-4: Tap on a column header SHALL trigger sort (equivalent to mouse click on header).
- BR-5: Double-tap on a column resize handle SHALL auto-size that column.
- BR-6: Tap on an editable cell SHALL enter edit mode.
- BR-7: All interactive elements (column headers, resize handles, row checkboxes, sort indicators, context menu items) SHALL have a touch target of at least 44 × 44 CSS pixels.
- BR-8: Interaction events (click, contextmenu, etc.) SHALL include a `pointerType: 'mouse' | 'touch' | 'pen'` field in their payload.
- BR-9: Range selection via touch drag SHALL NOT be activated; the drag gesture on the grid body SHALL be interpreted as scroll.
- BR-10: Two-finger pinch on the Gantt variant SHALL adjust the zoom level (F-Gantt zoom).

**Keyboard Interaction**

None beyond standard keyboard navigation (F-14); this feature is exclusively about touch/pointer input.

**Accessibility**
- **ARIA**: Touch interactions produce the same state changes as mouse/keyboard equivalents; ARIA attributes update identically.
- **Screen Reader**: Touch screen readers (VoiceOver on iOS, TalkBack on Android) navigate the grid using their standard swipe-based table navigation; the grid's `role="grid"` and `role="row"` markup enables this automatically.
- **WCAG**: 2.5.5 Target Size (AAA) — all touch targets ≥ 44 × 44 CSS px; 2.5.1 Pointer Gestures — all operations achievable with a single-point gesture (no multi-finger-only operations for primary actions).
- **Visual**: Touch affordances (resize handles, drag handles) SHALL be visually distinct and large enough to be tapped accurately.

**Chameleon 6 Status**: Partially existed (basic touch scroll existed; touch-select, long-press context menu, and double-tap auto-size are new).

**Interactions**: F-08 (row selection), F-14 (keyboard navigation), F-16 (context menus), F-09.4 (column resize auto-size)

---

### 21.5 Adaptive Layout [P1]

**Description**: The grid can switch between a full tabular layout and a compact card-like layout based on container width, enabling a single grid component to serve both desktop and narrow mobile viewports.

**Applies to**: All variants

**Use Cases**
- UC-1: A CRM grid on a mobile device switches to card layout (showing Name, Status, and Last Modified), hiding all other columns; on desktop the full table is shown.
- UC-2: Developer configures `adaptiveSummaryColumns: ['name', 'status']` to control what data appears in the compact summary row.
- UC-3: In compact mode, a user taps a row card to expand it and see all column values.

**Conditions of Use**
- `adaptiveLayout: true` must be set; the feature is opt-in.
- `adaptiveThreshold` defaults to 480 px if not specified.
- `adaptiveSummaryColumns` defaults to the first two visible columns if not specified.
- Compact mode is triggered by the container width falling below `adaptiveThreshold` (uses `ResizeObserver`, same as F-21.3).

**Behavioral Requirements**
- BR-1: When `adaptiveLayout: true` and container width is at or above `adaptiveThreshold`, the grid SHALL render in full tabular mode with all standard features active.
- BR-2: When container width falls below `adaptiveThreshold`, the grid SHALL switch to compact mode, rendering each row as a card-like block.
- BR-3: In compact mode, only columns listed in `adaptiveSummaryColumns` SHALL be visible in the collapsed card.
- BR-4: In compact mode, pressing the right arrow key or tapping the expand icon on a row card SHALL expand that row to show all column values stacked vertically.
- BR-5: In compact mode, the grid root element SHALL have `role="list"` and each row SHALL have `role="listitem"`.
- BR-6: In compact mode, expanded row detail panels SHALL have `role="region"` with `aria-label` identifying the row.
- BR-7: An `adaptiveLayoutChange` event SHALL fire with `{ mode: 'full' | 'compact' }` when the layout mode changes.
- BR-8: Sort, filter, and selection state SHALL be preserved when switching between full and compact modes.
- BR-9: In compact mode, vertical arrow key navigation SHALL move between row cards; right arrow SHALL expand a card; left arrow SHALL collapse a card.
- BR-10: In full mode, the grid SHALL revert to `role="grid"` / `role="row"` ARIA semantics.

**Variant-Specific Behavior**

| Variant | Difference |
|---|---|
| Tree Grid | In compact mode, tree indentation is collapsed; expand/collapse of tree nodes is disabled until full mode is restored. |
| Pivot Table | Adaptive layout is disabled by default for Pivot Table (too information-dense); must be explicitly opted in. |
| Gantt Chart | Adaptive layout switches the Gantt to a vertical list of tasks with no timeline bar (timeline is too wide for compact mode). |

**Keyboard Interaction**

| Key | Action | Mode |
|---|---|---|
| Arrow Down / Arrow Up | Move focus between row cards | Compact |
| Arrow Right | Expand focused row card | Compact |
| Arrow Left | Collapse focused row card | Compact |
| Enter | Activate primary action on focused row (same as click) | Compact |
| Space | Toggle row selection (if `rowSelection` enabled) | Compact |

**Accessibility**
- **ARIA**: `role="list"` / `role="listitem"` in compact mode; `role="grid"` / `role="row"` in full mode. Mode switch updates `aria-label` on the grid root to indicate the current layout mode.
- **Screen Reader**: SR: When mode switches, the grid root announces "Switched to compact layout" or "Switched to full table layout" via an `aria-live="polite"` region.
- **WCAG**: 1.4.10 Reflow — compact mode is the reflow-compliant layout; 1.3.1 Info and Relationships — all data visible in expanded card detail retains semantic labels (column header labels appear as visible text adjacent to each value).
- **Visual**: The expand/collapse affordance on each row card SHALL use a non-color indicator (chevron icon + `aria-expanded`).

**Chameleon 6 Status**: New feature.

**Interactions**: F-21.3 (both use ResizeObserver; adaptive layout takes precedence over responsive column hiding when active), F-14 (keyboard navigation — compact mode overrides standard grid key bindings), F-08 (selection preserved across layout switch)

---

## Normative Requirements

The following normative requirements derive from the features above and SHALL be implemented as written.

| ID | Requirement | Priority | Feature |
|---|---|---|---|
| SP-01 | `grid.getState()` SHALL return a JSON-serializable `GridState` object with no DOM node references. | P1 | F-21.1 |
| SP-02 | `GridState` SHALL include `columnOrder`, `columnWidths`, `columnVisibility`, `sortModel`, `filterModel`, `groupByColumns`, `pinnedColumns`, `pinnedRows`, `expandedGroups`, `expandedTreeNodes`, `selectedRows`, and `scrollPosition`. | P1 | F-21.1 |
| SP-03 | `grid.setState(partial)` SHALL merge provided keys into current state without modifying absent keys. | P1 | F-21.1 |
| SP-04 | `stateChange` event SHALL be debounced (max one event per 100 ms) and SHALL NOT fire for programmatic `setState` calls. | P1 | F-21.1 |
| SP-05 | `stateChange` payload SHALL be `{ changedKeys: string[], state: GridState }`. | P1 | F-21.1 |
| SP-06 | Tree Grid `GridState` SHALL include `expandedTreeNodes: string[]`. | P1 | F-21.1 |
| SP-07 | Pivot Table `GridState` SHALL include `pivotDimensions`. | P1 | F-21.1 |
| SP-08 | Gantt Chart `GridState` SHALL include `ganttZoomLevel` and `ganttScrollPosition`. | P1 | F-21.1 |
| SP-09 | When `stateKey` is set, the grid SHALL load state from storage before first render and save state on each `stateChange` event (debounced 500 ms). | P1 | F-21.2 |
| SP-10 | When stored state's `_version` does not match `stateVersion`, the stored state SHALL be discarded and the grid SHALL initialize with defaults. | P1 | F-21.2 |
| SP-11 | `stateSaveFailed` event SHALL fire on storage write failure; the grid SHALL NOT throw an uncaught exception on storage failure. | P1 | F-21.2 |
| SP-12 | `customStateStorage.get` MAY return `Promise<GridState>`; the grid SHALL await it before first render. | P1 | F-21.2 |
| SP-13 | Responsive column hiding SHALL use a `ResizeObserver` on the grid container, not `window.innerWidth`. | P1 | F-21.3 |
| SP-14 | A column with `hideBelowWidth` SHALL be hidden when container width is strictly less than that value, and restored when container width is at or above that value (unless manually hidden). | P1 | F-21.3 |
| SP-15 | Pinned columns SHALL be exempt from responsive hiding. | P1 | F-21.3 |
| SP-16 | `aria-colindex` SHALL be recalculated after any responsive column change; there SHALL be no index gaps in the accessible grid. | P1 | F-21.3 |
| SP-17 | All interactive grid elements SHALL have a touch target of at least 44 × 44 CSS pixels. | P1 | F-21.4 |
| SP-18 | Long-press (≥ 500 ms) on a row SHALL open the context menu. | P1 | F-21.4 |
| SP-19 | Touch drag on the grid body SHALL be interpreted as scroll, not range selection. | P1 | F-21.4 |
| SP-20 | In adaptive compact mode, the grid SHALL use `role="list"` / `role="listitem"` ARIA semantics; in full mode it SHALL use `role="grid"` / `role="row"` semantics. | P1 | F-21.5 |

---
*This file is part of the Chameleon 7 Tabular Grid Specification. See [README.md](../README.md) for the complete table of contents.*
