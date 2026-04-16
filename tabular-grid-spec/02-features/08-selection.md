# F-08: Selection

Selection enables users to indicate one or more rows, cells, columns, or ranges for subsequent operations such as copying, deleting, formatting, or aggregation. This feature category covers single and multiple row selection, checkbox-based selection, cell selection, range selection, column selection, select-all, programmatic APIs, selection events, fill handle, hover highlighting, and row marking (independent from selection).

Selection applies to all four variants (Data Grid, Tree Grid, Pivot Table, Gantt Chart) with variant-specific adaptations for hierarchical data, aggregated cells, dual-region layouts, and dimension headers.

> **Foundations**: This feature assumes the layout model defined in [FD-01](../01-foundations/01-layout-model.md). Selected rows and cells are styled within the existing subgrid structure; selection state does not alter column tracks or row sizing. The editability model in [FD-03](../01-foundations/03-editability-model.md) defines how selection interacts with edit mode transitions -- clicking an already-selected editable cell enters Edit Mode rather than reselecting. The accessibility foundation in [FD-04](../01-foundations/04-accessibility-foundation.md) defines the roving tabindex strategy and live region mechanism used for selection announcements.

> **Key coordination principle**: Selection and editing MUST coordinate. Clicking an already-selected editable cell MUST enter Edit Mode (per [FD-03](../01-foundations/03-editability-model.md)), not merely reselect. This applies to all selection modes.

> **Cell interaction forwarding**: The grid MUST support a configurable cell interaction delegate pattern (brainstorming note #14). A click on the first cell in a row MAY be configured to forward focus to the second cell; a double-click MAY toggle a value. This delegate does not replace selection but augments it with per-column click behavior.

---

## 8.1 Row Selection: Single [P0]

**Description**: The user clicks a row to select it, deselecting any previously selected row. Only one row can be selected at a time. This is the simplest selection mode and serves as the default for master-detail patterns, navigation lists, and detail pane workflows.

**Applies to**: All variants

**Use Cases**
- UC-1: A user clicks a row in an employee directory to display the employee's full details in an adjacent detail panel.
- UC-2: A project manager clicks a task row in a Gantt Chart to highlight the corresponding timeline bar and show task properties in a side panel.
- UC-3: A user navigates a Tree Grid of file system entries and selects a folder row to display its metadata below the grid.

**Conditions of Use**
- The grid MUST be configured with a row selection mode property (e.g., `rowSelectionMode: "single" | "multiple" | "none"`). Single selection is active when set to `"single"`.
- `aria-multiselectable` MUST NOT be set on the grid element when in single-selection mode. Its absence (or explicit omission) signals to assistive technology that only one item can be selected at a time.

**Behavioral Requirements**
- BR-1: When the user clicks a data row, the grid MUST select that row and deselect any previously selected row.
- BR-2: The selected row MUST receive `aria-selected="true"`. All other selectable rows MUST have `aria-selected="false"` (not absent -- presence of the attribute on all selectable rows signals that selection is supported).
- BR-3: The grid element MUST NOT carry the `aria-multiselectable` attribute when in single-selection mode.
- BR-4: Clicking a non-selectable row (e.g., a group header, aggregation footer) MUST NOT change the selection state.
- BR-5: The grid MUST emit a `selectionChanged` event when the selected row changes, containing the newly selected row ID and the previously selected row ID.
- BR-6: If the currently selected row is removed from the data source (e.g., by filtering or deletion), the selection MUST be cleared and a `selectionChanged` event MUST fire with no selected row.
- BR-7: Clicking the already-selected row MUST NOT deselect it (single selection always has exactly one selected row once any row has been selected, unless cleared programmatically or by data removal). To deselect, the developer uses the programmatic API (F-08.8).

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Selecting a parent row MUST NOT automatically select its children. Selection is per-row, independent of hierarchy. |
| Pivot Table | Row selection applies to the innermost data rows. Dimension header rows (row headers) MAY be selectable if configured, but default to non-selectable. |
| Gantt Chart | Selecting a task row in the task list MUST visually highlight the corresponding timeline bar in the timeline region. Both regions MUST reflect the selection state. |

**Editability Interaction**
- When the user clicks an already-selected editable cell, the grid MUST enter Edit Mode (per [FD-03](../01-foundations/03-editability-model.md)) rather than reselecting the row.
- When the user clicks an unselected row, the grid MUST select the row and place focus on the clicked cell in Navigation Mode. A second click (or F2) enters Edit Mode.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Arrow Up / Arrow Down | Move focus to adjacent row; the focused row becomes selected (focus-follows-selection in single mode) | Navigation Mode |
| Space | Select the focused row (if not already selected) | Navigation Mode |
| Enter | Select the focused row and optionally enter Edit Mode on the focused cell (if editable) | Navigation Mode |

**Accessibility**
- **ARIA**: `aria-selected="true"` on the selected row element, `aria-selected="false"` on all other selectable row elements. The grid element MUST NOT have `aria-multiselectable`. The `role="row"` on each selectable row MUST carry `aria-selected`.
- **Screen Reader**: SR: "[Row content], selected" when the user navigates to the selected row. SR: "[Row content], not selected" for other rows. When selection changes, a live region (`role="status"`, `aria-live="polite"`) SHOULD announce: SR: "Selected [identifying value]".
- **WCAG**: 1.3.1 (selection state is programmatically determinable via `aria-selected`), 2.1.1 (selection is keyboard-accessible via Arrow keys and Space), 3.3.2 (the purpose of the selection is communicated by context -- e.g., "Select a row to view details").
- **Visual**: The selected row MUST have a visually distinct background color or border that meets WCAG 1.4.11 (Non-text Contrast) with a minimum 3:1 contrast ratio against the unselected row background. The selected state MUST NOT rely on color alone (WCAG 1.4.1); a secondary cue such as a left-edge highlight bar, bold text, or border SHOULD supplement the background color.

**Chameleon 6 Status**: Existed. `rowSelectionMode: "single"` property. Selection events with `rowsId`. Chameleon 7 carries forward the same mode with improved ARIA compliance.

**Interactions**
- F-08.2 (Row Selection: Multiple): mutually exclusive with single selection via the `rowSelectionMode` property.
- F-08.3 (Checkbox Column): checkbox column can be used alongside single selection (clicking the checkbox selects the row, deselecting any other).
- F-08.8 (Programmatic Selection API): `selectRow()`, `deselectRow()`, `getSelectedRows()` work in single mode.
- F-08.9 (Selection Events): `selectionChanged` event fires on every selection change.
- F-08.11 (Highlight on Hover): hover highlight is independent of selection highlight.
- F-07 (Cell Editing): selection-then-edit flow.
- F-10 (Row Management): row pinning does not affect selectability.
- F-14 (Keyboard Navigation): arrow keys move focus and selection in single mode.

---

## 8.2 Row Selection: Multiple (Ctrl/Shift+Click) [P0]

**Description**: The user selects multiple rows simultaneously using Ctrl+click for non-contiguous selections and Shift+click for contiguous range selections. This mode enables batch operations such as multi-row deletion, bulk status changes, or multi-row copy.

**Applies to**: All variants

**Use Cases**
- UC-1: A user Ctrl+clicks three non-adjacent rows in a task list to delete them in a single batch operation.
- UC-2: A user clicks row 5, then Shift+clicks row 15 to select the contiguous range of 11 rows for a bulk export.
- UC-3: A user combines both: Ctrl+clicks rows 3 and 7, then Shift+Ctrl+clicks row 12 to add the range 7-12 to the existing selection.

**Conditions of Use**
- The grid MUST be configured with `rowSelectionMode: "multiple"`.
- `aria-multiselectable="true"` MUST be set on the grid element to signal assistive technology that multiple items can be selected.

**Behavioral Requirements**
- BR-1: When the user clicks a row without modifier keys, the grid MUST select that row and deselect all previously selected rows (same as single-selection behavior).
- BR-2: When the user Ctrl+clicks (Cmd+click on macOS) an unselected row, the grid MUST add that row to the current selection without affecting other selected rows.
- BR-3: When the user Ctrl+clicks an already-selected row, the grid MUST deselect that row without affecting other selected rows.
- BR-4: When the user Shift+clicks a row, the grid MUST select the contiguous range from the last-clicked row (the anchor) to the Shift+clicked row, replacing any previous selection.
- BR-5: When the user Shift+Ctrl+clicks a row, the grid MUST add the contiguous range from the anchor to the clicked row to the existing selection, without deselecting previously selected rows outside the range.
- BR-6: The grid MUST maintain an anchor row for range selection. The anchor is set to the row that was clicked (without Shift) most recently. The anchor MUST persist across Ctrl+click operations.
- BR-7: All selected rows MUST have `aria-selected="true"`. All unselected selectable rows MUST have `aria-selected="false"`.
- BR-8: The grid MUST emit a `selectionChanged` event containing the full set of selected row IDs, the IDs added in this operation, and the IDs removed in this operation.
- BR-9: When a selected row is removed from the visible set (by filtering, deletion, or grouping collapse), it MUST be removed from the selection, and a `selectionChanged` event MUST fire.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Shift+click selects the visible range between anchor and target, including both parent and child rows in the range. Selection does not automatically propagate to hidden (collapsed) children. |
| Pivot Table | Multi-row selection applies to data rows. Selecting multiple dimension header rows is typically not meaningful and SHOULD be disabled by default. |
| Gantt Chart | Multi-row selection in the task list MUST highlight all corresponding timeline bars. Shift+click range in the task list selects the visible range of tasks. |

**Editability Interaction**
- When multiple rows are selected and the user presses Delete, the grid SHOULD prompt for confirmation before deleting all selected rows (if row deletion is supported).
- Entering Edit Mode (F2 or double-click) while multiple rows are selected MUST edit only the focused cell, not all selected rows. The multi-row selection MUST be preserved during the edit session.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Shift + Arrow Down | Extend selection to include the next row below | Navigation Mode |
| Shift + Arrow Up | Extend selection to include the next row above | Navigation Mode |
| Ctrl + Space | Toggle selection of the focused row without affecting other selections | Navigation Mode |
| Shift + Space | Select the range from the anchor to the focused row | Navigation Mode |
| Ctrl + A | Select all visible rows (see F-08.7) | Navigation Mode |
| Escape | Deselect all rows (if no edit is active) | Navigation Mode |

**Accessibility**
- **ARIA**: `aria-multiselectable="true"` on the grid element. Each selected row has `aria-selected="true"`, each unselected selectable row has `aria-selected="false"`.
- **Screen Reader**: SR: "[Row content], selected, [N] of [M] selected" when navigating to a selected row in multi-select mode. When selection changes via Shift+Arrow, a live region SHOULD announce: SR: "[N] rows selected".
- **WCAG**: 1.3.1 (multi-selection state is programmatically determinable), 2.1.1 (multi-selection is keyboard-accessible via Shift+Arrow, Ctrl+Space), 4.1.2 (multiselectable state is conveyed via `aria-multiselectable`).
- **Visual**: All selected rows MUST share the same visual selection indicator (background color, border, or highlight bar). The visual treatment MUST meet the same contrast requirements as F-08.1. The focused row within a multi-selection SHOULD have a distinct focus ring in addition to the selection highlight.

**Chameleon 6 Status**: Existed. `rowSelectionMode: "multiple"` property. Event: `selectionChanged` with `rowsId`, `addedRowsId`, `removedRowsId`. Chameleon 7 adds Shift+Arrow keyboard extension and improves ARIA compliance.

**Interactions**
- F-08.1 (Row Selection: Single): click without modifier in multi-select mode behaves like single selection.
- F-08.3 (Checkbox Column): checkboxes provide an alternative to Ctrl+click for toggling individual rows.
- F-08.7 (Select All): Ctrl+A selects all rows in multi-select mode.
- F-08.8 (Programmatic Selection API): API methods support multi-row operations.
- F-08.9 (Selection Events): event payload includes added/removed/total IDs.
- F-12 (Export/Import): multi-row selection feeds into "export selected rows" workflows.
- F-14 (Keyboard Navigation): Shift+Arrow extends selection.

---

## 8.3 Row Selection: Checkbox Column [P0]

**Description**: A dedicated column at the leading edge of the grid containing checkboxes for each row. The header cell of this column contains a tri-state checkbox that toggles select-all / deselect-all. Clicking a row's checkbox toggles that row's selection state without requiring modifier keys. Optionally, clicking anywhere on the row cell (not just the checkbox) can also toggle selection (configurable behavior, brainstorming note #8).

**Applies to**: All variants

**Use Cases**
- UC-1: A user checks three rows in a contact list to prepare a bulk email operation, without needing to remember Ctrl+click.
- UC-2: A user clicks the header checkbox to select all 500 visible rows for a bulk export, then unchecks two rows to exclude them.
- UC-3: In a Tree Grid, a user checks a parent row's checkbox; the grid offers optional tri-state propagation (see F-06) where checking the parent checks all children.

**Conditions of Use**
- The grid MUST accept a configuration property to enable the checkbox column (e.g., `showRowSelector: true` or `richRowSelector: true`).
- The checkbox column MUST be the first column (leftmost in LTR, rightmost in RTL) by default. This position SHOULD be configurable.
- The checkbox column MUST NOT be sortable, filterable, resizable, or reorderable. It is a structural/selection column, not a data column.

**Behavioral Requirements**
- BR-1: Each data row MUST render a checkbox (`<input type="checkbox">` or equivalent ARIA checkbox) in the selector column cell.
- BR-2: Clicking the row checkbox MUST toggle that row's `aria-selected` state. If the row was unselected, it becomes selected; if selected, it becomes unselected.
- BR-3: The header row MUST render a tri-state checkbox. Its state MUST reflect the aggregate selection: unchecked when no rows are selected, checked when all visible selectable rows are selected, and mixed (indeterminate) when some but not all rows are selected.
- BR-4: The header checkbox MUST use `aria-checked="true"`, `aria-checked="false"`, or `aria-checked="mixed"` to convey its tri-state to assistive technology.
- BR-5: Clicking the header checkbox MUST toggle between selecting all visible rows and deselecting all rows. When in the mixed state, clicking MUST select all visible rows (not deselect all).
- BR-6: When the grid is configured to allow row-click selection (e.g., `selectOnRowClick: true`), clicking anywhere on a row cell MUST toggle that row's selection, in addition to the checkbox. The checkbox visual state MUST stay synchronized.
- BR-7: Checking or unchecking a row checkbox MUST emit a `selectionChanged` event.
- BR-8: The checkbox column MUST have a fixed width that accommodates the checkbox control with adequate touch target size (minimum 24x24 CSS pixels per WCAG 2.5.8).
- BR-9: The checkbox column MUST participate in the subgrid layout as the first column track. It MUST remain visible (not scrolled off) when horizontal scrolling occurs -- it SHOULD be frozen/pinned by default.
- BR-10: Group header rows (F-04) SHOULD display a checkbox that selects/deselects all rows within the group. The group checkbox MUST also be tri-state (all/none/mixed for that group's rows).

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Parent row checkboxes MAY propagate selection to children (tri-state checkbox propagation, per F-06.5). When a parent is checked and all children are checked, the parent shows checked. When only some children are checked, the parent shows mixed. This propagation MUST be configurable and off by default. |
| Pivot Table | Checkbox column applies to data rows. Row dimension header rows do not typically have checkboxes. If the pivot table shows aggregated rows only, checkboxes select those aggregated rows. |
| Gantt Chart | Checkbox column appears in the task list region. Checking a task row MUST visually highlight the corresponding timeline bar. |

**CSS Subgrid Implications**

The checkbox column occupies the first track in `grid-template-columns`. Its width is fixed (e.g., `40px` or a CSS custom property `--ch-selector-column-width`). When frozen (pinned), it uses `position: sticky; left: 0` (per [FD-01](../01-foundations/01-layout-model.md) frozen column model). All row elements (header, data, group, footer) MUST include a cell in this column track to maintain subgrid alignment.

**Editability Interaction**
- Clicking the checkbox in the selector column MUST NOT enter Edit Mode on that cell. The checkbox is a selection control, not an editable data cell.
- If `selectOnRowClick` is enabled, clicking a non-editable cell in the row toggles selection. Clicking an editable cell that is already selected enters Edit Mode rather than toggling selection.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Space | Toggle the checkbox in the focused selector column cell (select/deselect the row) | Navigation Mode, focus on selector cell |
| Space | Toggle the header checkbox (select all / deselect all) | Navigation Mode, focus on header selector cell |
| Ctrl + A | Select all visible rows (equivalent to checking the header checkbox) | Navigation Mode, any cell focused |

**Accessibility**
- **ARIA**: Each row checkbox MUST have `role="checkbox"` (or be an `<input type="checkbox">`) with `aria-checked="true"` or `aria-checked="false"`. The header checkbox MUST support `aria-checked="mixed"` for the indeterminate state. Each checkbox MUST have an accessible label: row checkboxes via `aria-label="Select row [identifier]"`, header checkbox via `aria-label="Select all rows"`.
- **Screen Reader**: SR: "Select row [Name], checkbox, not checked" when navigating to an unchecked row selector. SR: "Select all rows, checkbox, mixed, [N] of [M] selected" for the header checkbox in mixed state.
- **WCAG**: 1.3.1 (checkbox state is programmatically determinable), 2.1.1 (checkbox is keyboard-operable via Space), 2.5.8 (touch target size meets 24x24 minimum), 4.1.2 (checkbox has accessible name and state).
- **Visual**: Checkboxes MUST have visible checked, unchecked, and indeterminate states. The indeterminate state MUST be visually distinct from both checked and unchecked (typically a horizontal dash). Checkbox visuals MUST meet WCAG 1.4.11 (3:1 contrast ratio for the checkbox border and check mark against the background).

**Chameleon 6 Status**: Existed. `richRowSelector: boolean` property enables the checkbox column. Event: `columnSelectorClicked`. Chameleon 7 adds tri-state header checkbox ARIA, group-level checkboxes, and configurable `selectOnRowClick`.

**Interactions**
- F-08.1 / F-08.2 (Row Selection modes): checkbox column works with both single and multiple selection modes.
- F-08.7 (Select All): header checkbox is the primary UI for select-all.
- F-08.12 (Row Marking): marking checkboxes are separate from selection checkboxes; both can coexist.
- F-04 (Grouping): group header checkbox for within-group selection.
- F-06 (Tree/Hierarchical): tri-state checkbox propagation for parent-child relationships.
- F-09 (Column Management): checkbox column is not resizable or reorderable.
- F-14 (Keyboard Navigation): Space on selector cell toggles checkbox.

---

## 8.4 Cell Selection: Single [P0]

**Description**: The user selects an individual cell for cell-level operations such as copying a single value, inspecting cell metadata, or navigating to a specific cell via the programmatic API. Cell selection is tracked independently from row selection -- a cell can be selected within an unselected row, and a row can be selected without any specific cell being selected.

**Applies to**: All variants

**Use Cases**
- UC-1: A user clicks a cell to select it, then presses Ctrl+C to copy that cell's value to the clipboard.
- UC-2: A formula bar (F-19) displays the selected cell's raw value and formula, requiring precise cell-level selection tracking.
- UC-3: A developer programmatically selects a specific cell to scroll it into view and highlight it (e.g., navigating to a validation error).

**Conditions of Use**
- Cell selection MUST be enabled by default when the grid is in Navigation Mode. Focus on a cell implies cell selection in most workflows.
- The grid MAY support a `cellSelectionMode: "single" | "range" | "none"` property to control cell selection behavior explicitly.

**Behavioral Requirements**
- BR-1: When the user clicks a cell, the grid MUST select that cell and deselect any previously selected cell (in single-cell mode).
- BR-2: The selected cell MUST have a visible focus ring or selection border that distinguishes it from other cells. This visual indicator MUST meet WCAG 1.4.11 (3:1 contrast ratio).
- BR-3: Cell selection MUST be tracked independently from row selection. Selecting a cell MUST NOT automatically select the entire row (unless the grid is in row-selection-only mode with no cell selection enabled).
- BR-4: The selected cell's coordinates (rowId, columnId) MUST be queryable via the programmatic API (F-08.8).
- BR-5: The grid MUST emit a `cellSelectionChanged` event when the selected cell changes, containing the `columnId`, `rowId`, and `cellId` of the newly selected cell.
- BR-6: Arrow key navigation MUST move cell selection to the adjacent cell in the arrow direction.
- BR-7: When the grid is in Navigation Mode, the focused cell and the selected cell MUST be the same cell. Focus and selection are unified in single-cell mode.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Pivot Table | Cell selection in a pivot table selects a value cell at the intersection of row and column dimensions. The selected cell's context includes its dimension path (e.g., "Region=East, Quarter=Q1, Measure=Revenue"). |
| Gantt Chart | Cell selection applies to the task list region. Cells in the timeline region (bars, milestones) have their own selection model (see variant-specific spec). |

**Editability Interaction**
- Clicking an already-selected editable cell (or pressing F2) MUST transition from cell selection to Edit Mode. The cell selection remains active; the cell is now both selected and being edited.
- When Edit Mode is exited (Escape or Enter), the cell MUST remain selected in Navigation Mode.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Arrow Keys | Move cell selection to the adjacent cell | Navigation Mode |
| Tab | Move cell selection to the next cell in reading order (left-to-right, top-to-bottom in LTR) and exit the grid if at the last cell | Navigation Mode |
| Home | Select the first cell in the current row | Navigation Mode |
| End | Select the last cell in the current row | Navigation Mode |
| Ctrl + Home | Select the first cell in the first row | Navigation Mode |
| Ctrl + End | Select the last cell in the last row | Navigation Mode |

**Accessibility**
- **ARIA**: The selected/focused cell carries `tabindex="0"` per the roving tabindex strategy ([FD-04](../01-foundations/04-accessibility-foundation.md)). All other cells have `tabindex="-1"`. For grids that support both row and cell selection, `aria-selected` on the cell MAY be used when the cell is explicitly selected (distinct from mere focus).
- **Screen Reader**: SR: "[Cell value], [Column Name], row [N], column [M]" when the cell receives focus. The screen reader naturally announces the focused cell's content and position.
- **WCAG**: 1.3.1 (focused cell position is programmatically determinable via `aria-colindex` and `aria-rowindex`), 2.1.1 (cell selection is keyboard-accessible via Arrow keys), 2.4.7 (focus indicator is visible -- the cell focus ring).
- **Visual**: The selected cell MUST have a visible focus ring (border or outline) that meets WCAG 2.4.11 (focus appearance: minimum 2px solid contrasting border around the cell). The focus ring MUST NOT be obscured by adjacent cell borders or backgrounds.

**Chameleon 6 Status**: Existed. Cell focus tracking via `selectedCellId`. Event: `cellSelectionChanged` with `columnId`, `rowId`, `cellId`. Chameleon 7 carries forward with improved focus ring visibility.

**Interactions**
- F-08.5 (Cell Range Selection): single-cell selection is the starting point for range selection (Shift+Arrow extends from the selected cell).
- F-08.8 (Programmatic Selection API): `getSelectedCells()`, `selectCell()` operate on single-cell selection.
- F-08.9 (Selection Events): `cellSelectionChanged` event.
- F-07 (Cell Editing): cell selection precedes edit mode entry.
- F-12 (Export/Import): Ctrl+C on a selected cell copies its value.
- F-14 (Keyboard Navigation): arrow key navigation moves cell selection.
- F-18 (Validation): validation error navigation selects the erroneous cell.

---

## 8.5 Cell Range Selection (Excel-Like) [P1]

**Description**: The user selects a rectangular range of cells by clicking a cell and dragging to another cell, or by using Shift+click / Shift+Arrow keys to extend the selection from an anchor cell to a target cell. The selected range is visually highlighted as a contiguous rectangle. Range selection is essential for copy/paste workflows, aggregate calculations on a selection (sum, count displayed in a status bar), and fill-handle operations.

**Applies to**: Data Grid, Tree Grid, Pivot Table

**Use Cases**
- UC-1: A user clicks cell B3, drags to cell E10, and presses Ctrl+C to copy the 4-column x 8-row rectangle to the clipboard in a tab-separated format.
- UC-2: A user selects a range of numeric cells and sees "Sum: 1234, Count: 32, Average: 38.6" in a status bar at the bottom of the grid.
- UC-3: A user selects a range, then uses the fill handle (F-08.10) at the corner to auto-fill adjacent cells with a pattern.

**Conditions of Use**
- Cell range selection MUST be enabled via `cellSelectionMode: "range"`.
- Range selection requires that the grid supports cell-level focus (F-08.4).
- Range selection MUST NOT be available when the grid is in row-selection-only mode (`cellSelectionMode: "none"`).

**Behavioral Requirements**
- BR-1: The user MUST be able to initiate range selection by clicking a cell (establishing the anchor) and dragging to another cell (establishing the extent). All cells within the rectangular bounding box of the anchor and extent MUST be selected.
- BR-2: The user MUST be able to extend or create a range by holding Shift and clicking a cell. The range extends from the current anchor cell to the Shift+clicked cell.
- BR-3: The user MUST be able to extend a range with Shift+Arrow keys. Each Shift+Arrow press extends the range by one cell in the arrow direction.
- BR-4: Shift+Ctrl+End MUST extend the range from the anchor to the last cell in the grid. Shift+Ctrl+Home MUST extend to the first cell.
- BR-5: Shift+Space MUST select the entire row of the focused cell (all columns in that row). Ctrl+Space MUST select the entire column of the focused cell (all rows in that column).
- BR-6: The range highlight MUST be rendered as a visual overlay that covers all cells in the selected rectangle. The overlay MUST have a distinct background color (semi-transparent) and a solid border around the outer edges of the range.
- BR-7: Ctrl+click (without Shift) on a cell outside the current range MUST start a new independent range, allowing multiple disjoint ranges when supported. If multiple ranges are not supported, Ctrl+click MUST replace the existing range.
- BR-8: The grid MUST emit a `cellRangeSelectionChanged` event when the range changes, containing the anchor cell coordinates, the extent cell coordinates, and the list of all cells within the range.
- BR-9: When the user copies (Ctrl+C) with a range selected, the grid MUST copy the range contents in a tab-separated, row-delimited format suitable for pasting into spreadsheet applications.
- BR-10: The range selection MUST clip to the visible data area. The user MUST NOT be able to select cells in header rows, footer rows, or non-data columns (e.g., the checkbox column) as part of a data range.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Range selection spans visible rows regardless of hierarchy level. Collapsed children are not included in the range. The range is defined by visual position, not by tree structure. |
| Pivot Table | Range selection in a pivot table selects value cells. Row header cells and column header cells are excluded from the range by default. |
| Gantt Chart | Range selection applies to the task list region only. The timeline region does not support cell range selection (timeline bars are not cells in a grid). |

**CSS Subgrid Implications**

The range highlight overlay MUST be positioned to align with the subgrid cell boundaries. Because cells participate in a subgrid layout, the overlay MUST be calculated from the actual rendered positions of the anchor and extent cells. The overlay SHOULD be rendered as an absolutely positioned element within the grid's scrollable area, or as a CSS highlight using `::selection`-like pseudo-elements or CSS custom highlight API where supported.

**Editability Interaction**
- Typing while a range is selected SHOULD NOT enter Edit Mode on all cells in the range. It MUST enter Edit Mode only on the anchor cell (the cell that initiated the range).
- Pressing Delete with a range selected SHOULD clear the values of all editable cells within the range and emit edit events for each cell.
- Pasting (Ctrl+V) with a range selected SHOULD fill the range with the clipboard contents, distributing values across cells row by row (per F-07 clipboard paste).

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Shift + Arrow Keys | Extend the range by one cell in the arrow direction | Navigation Mode |
| Shift + Ctrl + Arrow Keys | Extend the range to the last non-empty cell in the arrow direction | Navigation Mode |
| Shift + Ctrl + Home | Extend the range from anchor to the first cell in the grid | Navigation Mode |
| Shift + Ctrl + End | Extend the range from anchor to the last cell in the grid | Navigation Mode |
| Shift + Space | Select the entire current row (extends range to full row width) | Navigation Mode |
| Ctrl + Space | Select the entire current column (extends range to full column height) | Navigation Mode |
| Escape | Clear the range selection | Navigation Mode |

**Accessibility**
- **ARIA**: Each cell within the selected range SHOULD have `aria-selected="true"`. The grid element MUST have `aria-multiselectable="true"` when range selection is enabled. The range boundaries are not directly expressible in ARIA, so the count of selected cells SHOULD be announced via a live region.
- **Screen Reader**: When the range changes, a live region SHOULD announce: SR: "Selected [rows] rows by [columns] columns, from [anchor cell name] to [extent cell name]". When navigating within the range, SR: "[Cell value], selected".
- **WCAG**: 1.3.1 (selected cells are programmatically determinable via `aria-selected`), 2.1.1 (range selection is keyboard-accessible via Shift+Arrow), 1.4.11 (range highlight has 3:1 contrast).
- **Visual**: The range highlight MUST have a semi-transparent overlay (e.g., `rgba(0, 120, 215, 0.1)`) and a solid 2px border around the outer edge of the range. The anchor cell within the range SHOULD have a distinct appearance (e.g., white background or no overlay) to indicate the starting point. The highlight MUST NOT obscure cell content to the point of unreadability.

**Chameleon 6 Status**: New. Chameleon 6 supported single-cell selection but not rectangular range selection. Excel-like range selection is a new capability for Chameleon 7.

**Interactions**
- F-08.4 (Cell Selection: Single): single cell selection is the degenerate case of a 1x1 range.
- F-08.6 (Column Selection): Ctrl+Space selects a column, which is a special case of range (full-height single-column range).
- F-08.10 (Fill Handle): the fill handle appears at the corner of the selected range.
- F-07 (Cell Editing): paste-into-range and delete-range interact with editing.
- F-12 (Export/Import): Ctrl+C on a range copies in tab-separated format.
- F-14 (Keyboard Navigation): Shift+Arrow extends the range.
- F-19 (Formulas): formula selection mode may use range selection to pick cell references.

---

## 8.6 Column Selection [P2]

**Description**: The user clicks a column header to select all cells in that column. This is useful for column-level operations such as column deletion, formatting an entire column, sorting/filtering by right-click context, or copying an entire column's data. Column selection is a convenience shortcut equivalent to selecting a full-height cell range for a single column.

**Applies to**: Data Grid, Tree Grid, Pivot Table

**Use Cases**
- UC-1: A user clicks the "Revenue" column header to select all revenue cells, then applies a currency format to the entire column.
- UC-2: A user selects a column and presses Delete to clear all values in that column.
- UC-3: A user selects multiple columns (Ctrl+click on headers) and drags them to reorder as a group.

**Conditions of Use**
- Column selection MUST be opt-in via a configuration property (e.g., `columnSelectable: true`) because clicking a column header already triggers sorting (F-02) by default. Column selection via header click MUST be an alternative mode or require a modifier key.
- Alternatively, Ctrl+Space selects the column of the focused cell without requiring a header click, avoiding the conflict with sort activation.

**Behavioral Requirements**
- BR-1: When column selection is triggered (via Ctrl+Space or configured header click), the grid MUST select all data cells in the target column by setting `aria-selected="true"` on each cell in that column.
- BR-2: The column header MUST receive a visual selected indicator (e.g., highlighted background) to signal that the entire column is selected.
- BR-3: Ctrl+click on additional column headers MUST add those columns to the selection (non-contiguous multi-column selection).
- BR-4: Shift+click on a column header MUST select the contiguous range of columns from the last-selected column to the clicked column.
- BR-5: The grid MUST emit a `columnSelectionChanged` event containing the IDs of all selected columns.
- BR-6: Column selection MUST be compatible with cell range selection (F-08.5) -- selecting a column is equivalent to selecting a range spanning all rows for that column.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Pivot Table | Column selection in a pivot table selects all value cells under a pivot column header. Multi-level pivot headers: clicking an outer-level header selects all columns within that group. |
| Gantt Chart | Column selection applies to the task list region only. Timeline columns (time intervals) are not selectable via this mechanism. |

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Ctrl + Space | Select the entire column of the currently focused cell | Navigation Mode |
| Shift + Ctrl + Space | Extend column selection to include additional columns | Navigation Mode |

**Accessibility**
- **ARIA**: All cells in the selected column MUST have `aria-selected="true"`. The column header SHOULD carry an `aria-selected="true"` or equivalent to indicate column-level selection. `aria-multiselectable="true"` MUST be present on the grid when multi-column selection is supported.
- **Screen Reader**: SR: "Column [Column Name] selected, [N] cells" via live region when a column is selected.
- **WCAG**: 1.3.1 (column selection state is programmatically determinable), 2.1.1 (Ctrl+Space is keyboard-accessible).
- **Visual**: The selected column MUST have a visual highlight on all its cells and its header. The highlight MUST meet WCAG 1.4.11 (3:1 contrast).

**Chameleon 6 Status**: New. Chameleon 6 did not support column selection. Column selection is a new capability for Chameleon 7.

**Interactions**
- F-08.5 (Cell Range Selection): column selection is a special case of full-height range selection.
- F-02 (Sorting): column header click defaults to sort; column selection requires a modifier or alternate configuration.
- F-09 (Column Management): column selection may feed into column-level operations (hide, format, resize).
- F-16 (Context Menus): right-click on a selected column header provides column-level actions.

---

## 8.7 Select All / Deselect All [P0]

**Description**: A single action selects or deselects all visible rows in the grid. The primary UI affordance is the header checkbox (F-08.3), and the primary keyboard shortcut is Ctrl+A. Select-all operates on the visible (filtered) row set, not the full data source -- hidden rows (collapsed groups, filtered-out rows) are not selected.

**Applies to**: All variants

**Use Cases**
- UC-1: A user presses Ctrl+A to select all 200 visible rows before performing a bulk export.
- UC-2: A user clicks the header checkbox to select all rows, then unchecks three rows to exclude them from a batch delete.
- UC-3: After applying a filter that narrows the grid to 15 results, a user presses Ctrl+A to select all 15 matching rows for a status update.

**Conditions of Use**
- Select-all MUST only be available when the grid is in multi-selection mode (`rowSelectionMode: "multiple"` or checkbox column enabled).
- Select-all MUST NOT be available in single-selection mode.

**Behavioral Requirements**
- BR-1: Ctrl+A MUST select all visible selectable rows. Non-selectable rows (group headers, footer/summary rows) MUST NOT be included in the selection.
- BR-2: If all visible rows are already selected, Ctrl+A MUST deselect all rows (toggle behavior).
- BR-3: The header checkbox (F-08.3) MUST update to the checked state after select-all and to the unchecked state after deselect-all.
- BR-4: Select-all MUST operate on the currently visible row set. Rows hidden by filtering (F-03) or group collapse (F-04) MUST NOT be selected. If a filter is later removed, previously hidden rows MUST NOT retroactively become selected.
- BR-5: The grid MUST emit a `selectionChanged` event after select-all or deselect-all, with the complete set of selected row IDs.
- BR-6: For very large data sets (e.g., 100,000+ rows with virtualization), select-all SHOULD use a "select-all flag" internally rather than iterating and marking every row, for performance. The flag indicates "all visible rows are selected except those in an explicit exclusion set."
- BR-7: A live region MUST announce the outcome of the operation: SR: "All rows selected, [N] rows" or SR: "All rows deselected".

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Select-all selects all visible rows at all hierarchy levels. Collapsed subtrees are not selected. Expanding a previously collapsed subtree after select-all MUST NOT auto-select the newly visible children (the select-all was a snapshot of visible rows at the time). |
| Pivot Table | Select-all selects all data rows. Dimension header rows are excluded. |
| Gantt Chart | Select-all selects all visible task rows in the task list. Corresponding timeline bars MUST reflect the selected state. |

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Ctrl + A | Select all visible rows (or deselect all if all are selected) | Navigation Mode |

**Accessibility**
- **ARIA**: After select-all, every visible selectable row MUST have `aria-selected="true"`. The header checkbox (if present) MUST have `aria-checked="true"`.
- **Screen Reader**: A live region (`role="status"`, `aria-live="polite"`) MUST announce: SR: "All rows selected" or SR: "All rows deselected" immediately after the action completes. If a count is meaningful, include it: SR: "All [N] rows selected".
- **WCAG**: 1.3.1 (selection state is programmatically determinable), 2.1.1 (Ctrl+A is keyboard-accessible), 4.1.3 (status message via live region).
- **Visual**: All visible rows MUST show the selected visual indicator. The header checkbox MUST show the checked state. The visual transition SHOULD be immediate (no per-row animation).

**Chameleon 6 Status**: Existed. Method: `selectAllRows()`. Chameleon 7 adds Ctrl+A keyboard shortcut, live region announcement, and performance-optimized select-all flag for large data sets.

**Interactions**
- F-08.2 (Row Selection: Multiple): select-all is only available in multi-select mode.
- F-08.3 (Checkbox Column): header checkbox is the primary UI for select-all.
- F-08.8 (Programmatic Selection API): `selectAllRows()` method.
- F-08.9 (Selection Events): `selectionChanged` event with all row IDs.
- F-03 (Filtering): select-all operates on the filtered set.
- F-04 (Grouping): group header checkboxes update to reflect select-all state.
- F-11 (Virtualization): select-all MUST use an optimized flag, not per-row DOM updates.

---

## 8.8 Programmatic Selection API [P0]

**Description**: A set of methods that allow developers to get, set, and clear selection state from application code. This API is essential for linking grid selection to external application state (e.g., URL-driven selection, master-detail synchronization, form-driven selection), for initializing selection on load, and for implementing custom selection workflows that go beyond the built-in mouse/keyboard interactions.

**Applies to**: All variants

**Use Cases**
- UC-1: A URL contains a query parameter `?selected=row-42`. On load, the application calls `selectRow("row-42")` to pre-select and scroll to the row.
- UC-2: An external button "Select All Overdue" uses `getSelectedRows()` to check current selection, then iterates through data to call `selectRow()` for each overdue item.
- UC-3: A master-detail view calls `getSelectedRows()` when the detail panel saves, to refresh the selected row's data.
- UC-4: A developer calls `selectCell("col-revenue", "row-42")` to programmatically focus and highlight a specific cell after a validation error.

**Conditions of Use**
- All programmatic selection methods MUST be callable at any time after the grid has completed its initial render.
- Programmatic selection changes MUST emit the same events as user-initiated selection changes (unlike initial sort state in F-02.4 which suppresses events).

**Behavioral Requirements**
- BR-1: The grid MUST expose the following row selection methods:
  - `getSelectedRows(): string[]` -- returns an array of selected row IDs.
  - `selectRow(rowId: string, keepExisting?: boolean): void` -- selects the specified row. If `keepExisting` is `false` (default in single mode) or not provided, clears previous selection first. In multiple mode, `keepExisting` defaults to `true`.
  - `deselectRow(rowId: string): void` -- removes the specified row from the selection.
  - `selectAllRows(): void` -- selects all visible selectable rows.
  - `deselectAllRows(): void` -- clears all row selection.
- BR-2: The grid MUST expose the following cell selection methods:
  - `getSelectedCells(): Array<{ rowId: string, columnId: string }>` -- returns all selected cells.
  - `selectCell(columnId: string, rowId: string): void` -- selects the specified cell and scrolls it into view if not visible.
  - `deselectAllCells(): void` -- clears all cell selection.
- BR-3: Programmatic selection changes MUST update the visual selection state (highlights, checkbox states), ARIA attributes (`aria-selected`), and emit the corresponding events (`selectionChanged`, `cellSelectionChanged`).
- BR-4: Calling `selectRow()` with a `rowId` that does not exist in the current data set MUST be a no-op (no error thrown, no event emitted). Implementations MAY log a warning in development mode.
- BR-5: Calling `selectCell()` MUST move keyboard focus to the selected cell and scroll it into view. This allows programmatic navigation (e.g., jumping to a validation error).
- BR-6: All methods MUST work correctly with virtualized grids (F-11). If the target row/cell is not currently in the DOM (virtualized out), the grid MUST scroll to bring it into view before applying selection.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | `selectRow()` on a collapsed parent row MUST select the parent without expanding it. The parent's children remain collapsed and unselected. |
| Gantt Chart | `selectRow()` MUST highlight both the task list row and the corresponding timeline bar. |

**Accessibility**
- **ARIA**: Programmatic selection changes MUST update `aria-selected` attributes identically to user-initiated changes.
- **Screen Reader**: When `selectCell()` moves focus, the screen reader MUST announce the newly focused cell (the standard focus announcement). A live region announcement is NOT required for programmatic selection (the application is responsible for providing context).
- **WCAG**: No additional criteria. Programmatic selection is developer-facing.
- **Visual**: All visual indicators MUST update immediately upon programmatic selection.

**Chameleon 6 Status**: Existed. Methods: `selectRow()`, `selectAllRows()`, `selectCell()`, `getSelectedRows()`, `getMarkedRows()`. Chameleon 7 carries forward and adds `deselectRow()`, `deselectAllRows()`, `deselectAllCells()`, `getSelectedCells()`, and `keepExisting` parameter.

**Interactions**
- F-08.1 / F-08.2 (Row Selection modes): API respects the current selection mode.
- F-08.4 / F-08.5 (Cell Selection): `selectCell()` and `getSelectedCells()` work with both single and range modes.
- F-08.7 (Select All): `selectAllRows()` is the programmatic equivalent.
- F-08.9 (Selection Events): all programmatic changes emit events.
- F-11 (Virtualization): API must scroll-to-view for virtualized rows/cells.
- F-21 (State Persistence): programmatic selection can restore persisted selection state.

---

## 8.9 Selection Events [P0]

**Description**: Callback events that fire when row or cell selection changes, providing the application with the information needed to react to selection (e.g., updating a detail panel, enabling/disabling toolbar buttons, synchronizing external state). Events include the full selection set plus the delta (added and removed items) to support efficient incremental updates.

**Applies to**: All variants

**Use Cases**
- UC-1: A master-detail layout listens to `selectionChanged` to update the detail panel whenever the user selects a different row.
- UC-2: A toolbar's "Delete Selected" button is enabled/disabled based on whether `selectionChanged` reports any selected rows.
- UC-3: An analytics dashboard listens to `cellSelectionChanged` to update a formula bar or status bar with the selected cell's value and coordinates.

**Conditions of Use**
- Selection events MUST fire for both user-initiated and programmatic selection changes.
- Selection events MUST NOT fire during initial render for default/pre-configured selection state. They MUST fire only for subsequent changes.

**Behavioral Requirements**
- BR-1: The grid MUST emit a `selectionChanged` event whenever the row selection changes. The event payload MUST include:
  - `rowsId: string[]` -- the complete set of currently selected row IDs.
  - `addedRowsId: string[]` -- row IDs that were added in this change.
  - `removedRowsId: string[]` -- row IDs that were removed in this change.
- BR-2: The grid MUST emit a `cellSelectionChanged` event whenever the cell selection changes. The event payload MUST include:
  - `columnId: string` -- the column ID of the newly selected cell (or primary cell in a range).
  - `rowId: string` -- the row ID of the newly selected cell.
  - `cellId: string` -- a composite identifier for the selected cell.
- BR-3: For range selection (F-08.5), the grid SHOULD emit a `cellRangeSelectionChanged` event with the anchor coordinates, extent coordinates, and the full list of cells in the range.
- BR-4: Events MUST be debounced during rapid selection changes (e.g., Shift+Arrow held down to extend a range). The grid SHOULD emit at most one event per animation frame during continuous interaction, with the final state reflected in the last event.
- BR-5: Events MUST fire after the DOM and ARIA attributes have been updated. Listeners MUST be able to query the grid's DOM and find it in a consistent state matching the event payload.
- BR-6: The event MUST NOT include the full row data objects. It includes only IDs. The application retrieves full data via the programmatic API if needed. This keeps event payloads lightweight for large selections.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | `selectionChanged` includes the row IDs regardless of hierarchy level. The event does not include parent-child relationship information; the application can derive this from its data model. |
| Gantt Chart | Selection events fire from the task list region. Timeline bar selection may produce separate events (per variant-specific spec). |

**Accessibility**
- **ARIA**: No additional ARIA requirements. Events are application-facing, not user-facing.
- **Screen Reader**: Event handlers MAY update live regions to announce selection context (e.g., "3 rows selected"), but this is the application's responsibility, not the grid's. The grid's own live region announcements (defined in F-08.1, F-08.2, F-08.7) handle the grid-level announcements.
- **WCAG**: No additional criteria.
- **Visual**: No additional visual requirements.

**Chameleon 6 Status**: Existed. Events: `selectionChanged` (with `rowsId`, `addedRowsId`, `removedRowsId`), `cellSelectionChanged` (with `columnId`, `rowId`, `cellId`). Chameleon 7 carries forward identical event names and adds `cellRangeSelectionChanged` for range selection.

**Interactions**
- F-08.1 / F-08.2 (Row Selection): events fire on row selection changes.
- F-08.4 / F-08.5 (Cell Selection): `cellSelectionChanged` and `cellRangeSelectionChanged` events.
- F-08.7 (Select All): select-all triggers a single `selectionChanged` event with all row IDs in `addedRowsId`.
- F-08.8 (Programmatic Selection API): programmatic changes fire events.
- F-08.12 (Row Marking): marking has its own event (`rowMarkingChanged`), separate from selection events.

---

## 8.10 Fill Handle (Drag to Auto-Fill Range) [P2]

**Description**: A small square handle rendered at the bottom-right corner of the selected cell or range. The user drags the handle over adjacent cells to auto-fill them with a pattern derived from the selected range (copy, increment, series). This is a core spreadsheet interaction that accelerates data entry for repetitive patterns.

**Applies to**: Data Grid, Tree Grid

**Use Cases**
- UC-1: A user selects a cell containing "100", drags the fill handle down 5 rows, and the cells are filled with "100" (copy mode).
- UC-2: A user selects two cells containing "1" and "2", drags the fill handle down, and the cells are filled with "3", "4", "5" (increment/series mode).
- UC-3: A user selects a cell containing "Monday", drags the fill handle, and the cells are filled with "Tuesday", "Wednesday", "Thursday" (named series mode).

**Conditions of Use**
- Fill handle MUST be opt-in via a configuration property (e.g., `enableFillHandle: true`) because not all grids are spreadsheet-like.
- Fill handle requires cell range selection (F-08.5) to be enabled.
- Fill handle MUST only appear on editable cells/ranges. Non-editable cells MUST NOT show the fill handle.

**Behavioral Requirements**
- BR-1: The fill handle MUST be rendered as a small square (6x6 to 8x8 CSS pixels) at the bottom-right corner (in LTR) of the selected cell or the selected range's extent cell.
- BR-2: When the user drags the fill handle vertically (down or up) or horizontally (right or left), the grid MUST preview the fill region with a distinct highlight (e.g., dashed border or lighter overlay) before the user releases the mouse.
- BR-3: On mouse release, the grid MUST fill the target cells based on the fill mode:
  - **Copy**: the source cell(s) values are repeated in the target cells.
  - **Increment**: if the source cells contain a numeric sequence, the grid MUST continue the sequence (linear extrapolation of the pattern).
  - **Named Series**: if the source value matches a known series (days of the week, months), the grid MUST continue the series.
- BR-4: The fill operation MUST emit edit events for each filled cell (per F-07 cell editing lifecycle), enabling undo/redo (F-17) for the entire fill operation as a single transaction.
- BR-5: If a target cell is non-editable, the fill operation MUST skip that cell and continue to the next.
- BR-6: The fill handle MUST be visible only when the grid has focus and a cell or range is selected. It MUST disappear when the grid loses focus.
- BR-7: The fill handle MUST use `cursor: crosshair` to signal the drag interaction affordance.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Fill handle operates on visible cells. Dragging across hierarchy levels fills cells at whatever level they appear visually. Parent/child structure is irrelevant to the fill operation. |
| Pivot Table | Fill handle is not applicable. Pivot Table cells show aggregated data that cannot be directly edited or filled. |
| Gantt Chart | Fill handle is not applicable. Gantt timeline bars are not cell-level data entry targets. Task list cells MAY support fill handle if editable. |

**Editability Interaction**
- The fill operation MUST go through the standard cell editing lifecycle (F-07): validate each target cell's value, emit `cellEditStarted` and `cellEditCompleted` events, and respect validation rules (F-18). If a filled value fails validation, the grid SHOULD highlight the validation error but still fill the cell (the user can correct it).
- The entire fill operation MUST be recorded as a single undo transaction (F-17).

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Ctrl + D | Fill down: copy the topmost cell's value to all selected cells below it in the range | Navigation Mode, range selected |
| Ctrl + R | Fill right: copy the leftmost cell's value to all selected cells to its right in the range | Navigation Mode, range selected |

**Accessibility**
- **ARIA**: The fill handle MUST have `role="separator"` or be `aria-hidden="true"` with a keyboard alternative provided (Ctrl+D / Ctrl+R). The fill handle is a mouse-oriented affordance; keyboard users use the keyboard alternatives.
- **Screen Reader**: When a fill operation completes, a live region MUST announce: SR: "Filled [N] cells [direction]" (e.g., "Filled 5 cells down").
- **WCAG**: 2.1.1 (keyboard alternative via Ctrl+D / Ctrl+R), 2.5.1 (fill handle drag has keyboard equivalent), 1.4.11 (fill handle square meets 3:1 contrast).
- **Visual**: The fill handle square MUST meet WCAG 1.4.11 (3:1 contrast against the cell background). The fill preview highlight MUST be distinct from the selection highlight.

**Chameleon 6 Status**: New. Chameleon 6 did not support fill handle. Fill handle is a new capability for Chameleon 7.

**Interactions**
- F-08.4 / F-08.5 (Cell / Range Selection): fill handle appears on the selected cell or range.
- F-07 (Cell Editing): fill triggers the cell editing lifecycle for each filled cell.
- F-17 (Undo/Redo): fill is a single undo transaction.
- F-18 (Validation): filled values are validated per cell validation rules.
- F-11 (Virtualization): fill handle must work correctly when the target cells are virtualized out (scroll into view as needed during drag).

---

## 8.11 Highlight on Hover [P0]

**Description**: Visual feedback is provided when the user moves the mouse pointer over a row or cell. Hover highlighting improves scannability by helping the user track which row they are looking at in wide or dense grids. This is a CSS-only feature implemented via `:hover` pseudo-class, with no JavaScript interaction required for the basic case.

**Applies to**: All variants

**Use Cases**
- UC-1: A user scans a wide grid (20+ columns) and the hover highlight helps them track the row their mouse is on, preventing misreading data from an adjacent row.
- UC-2: A user hovers over a row to preview it before clicking to select it, using the hover as a "soft selection" visual cue.
- UC-3: In a dense grid with compact row spacing, the hover highlight distinguishes the target row from its neighbors.

**Conditions of Use**
- Hover highlighting MUST be enabled by default. It SHOULD be disableable via a configuration property (e.g., `rowHighlightEnabled: false`).
- Hover highlighting is a mouse/pointer interaction only. It MUST NOT appear for keyboard navigation (keyboard focus has its own focus ring per F-14).

**Behavioral Requirements**
- BR-1: When the mouse pointer enters a data row, the row MUST display a hover highlight (background color change or other visual treatment).
- BR-2: The hover highlight MUST be implemented via CSS `:hover` on the row element. No JavaScript event handling is required for the basic highlight.
- BR-3: The hover highlight color MUST meet a minimum 3:1 contrast ratio against the unhovered row background (WCAG 1.4.11 Non-text Contrast).
- BR-4: The hover highlight MUST NOT override or obscure the selected row highlight. When a row is both hovered and selected, the selected state MUST take visual precedence (or a combined hover+selected style MUST be applied).
- BR-5: The hover highlight MUST apply to the entire row (all cells in the row), not just the cell under the pointer. This ensures readability across wide grids.
- BR-6: The hover highlight MUST be customizable via a CSS custom property (e.g., `--ch-row-hover-background`) and/or a CSS Part (e.g., `::part(row):hover`).
- BR-7: The hover highlight MUST respect `prefers-reduced-motion: reduce` if an animation or transition is applied to the hover state change. A simple background color change (no animation) satisfies this automatically.
- BR-8: Group header rows (F-04) and summary/footer rows (F-10) MAY have their own distinct hover highlights, or hover may be disabled on structural rows. This SHOULD be configurable.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Hover applies to the full row (all cells) including the indentation area. The hover highlight MUST NOT change the tree indentation visual structure. |
| Pivot Table | Hover applies to data rows and MAY apply to row dimension header rows. Column dimension headers do not have row-level hover. |
| Gantt Chart | Hover on a task list row SHOULD also visually highlight (or subtly emphasize) the corresponding timeline bar, creating cross-region hover feedback. This cross-region hover is a SHOULD (enhancement), not a MUST. |

**CSS Subgrid Implications**

The hover highlight is applied to the row element (`[role="row"]`), which uses `display: grid; grid-template-columns: subgrid; grid-column: 1 / -1`. The CSS `:hover` pseudo-class on this element naturally covers all cell tracks within the row. No subgrid-specific considerations are needed.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| (none) | Hover highlighting is pointer-only. Keyboard focus uses the focus ring, not hover. | N/A |

**Accessibility**
- **ARIA**: No ARIA attributes are required for hover state. Hover is a transient visual enhancement, not a state that assistive technology needs to track.
- **Screen Reader**: No announcements for hover. Hover is a visual-only feature.
- **WCAG**: 1.4.11 (Non-text Contrast: hover background must have 3:1 contrast against unhovered background), 1.4.1 (hover MUST NOT rely on color alone if it conveys meaning -- but hover is decorative/enhancement, so color-only is acceptable for the highlight itself as long as contrast is met).
- **Visual**: The hover highlight MUST be visible at all density settings (compact, default, spacious per F-15). The highlight MUST NOT be so subtle that it is indistinguishable from the unhovered state.

**Chameleon 6 Status**: Existed. `rowHighlightEnabled: boolean` property enables hover highlighting. `rowHighlightedClass: string` allows a custom CSS class for the hover state. Chameleon 7 carries forward with CSS custom property support and WCAG 1.4.11 compliance.

**Interactions**
- F-08.1 / F-08.2 (Row Selection): hover is independent of selection. Both can be active simultaneously.
- F-15 (Theming & Styling): hover color is themeable via CSS custom properties and CSS Parts.
- F-10 (Row Management): hover applies to all row types unless configured otherwise.
- F-01 (Data Display): hover may trigger tooltip display (F-01 tooltips).

---

## 8.12 Row Marking (Independent Checkbox) [P0]

**Description**: A marking mechanism separate from selection that allows users to "check off" rows for batch operations. Marking and selection are independent states: a row can be marked but not selected, selected but not marked, both, or neither. Marking is useful for workflows where the user builds a set of items over time (e.g., marking invoices for payment, flagging records for review) while using selection for navigation and detail display.

**Applies to**: All variants

**Use Cases**
- UC-1: A user navigates through invoice rows (selecting each to view details in a side panel) while marking invoices to be included in a payment batch. Selection changes with navigation; marks persist.
- UC-2: A user marks 10 records for export, then applies a filter to verify the marked set. The marks persist across filter changes (marked rows that become invisible retain their mark state).
- UC-3: A user marks several rows, then clicks "Process Marked" to trigger a batch workflow on exactly the marked rows, regardless of which row is currently selected.

**Conditions of Use**
- Row marking MUST be opt-in via a configuration property (e.g., `enableRowMarking: true`).
- The marking checkbox column MUST be visually distinct from the selection checkbox column (F-08.3) when both are present. They SHOULD be separate columns or clearly labeled differently.
- If only marking is needed (no row selection via checkbox), the marking column MAY replace the selection checkbox column.

**Behavioral Requirements**
- BR-1: When marking is enabled, the grid MUST render a marking checkbox in a dedicated column for each data row.
- BR-2: Clicking the marking checkbox MUST toggle the row's marked state without affecting the row's selection state.
- BR-3: The marked state MUST be tracked independently from `aria-selected`. Marking is not selection. The marking checkbox uses its own `aria-checked` attribute.
- BR-4: The grid MUST emit a `rowMarkingChanged` event when a row's marked state changes, containing the row ID and the new marked state. The event payload SHOULD also include the complete set of marked row IDs.
- BR-5: The grid MUST expose programmatic marking methods:
  - `markRow(rowId: string): void` -- mark a row.
  - `unmarkRow(rowId: string): void` -- unmark a row.
  - `markAllRows(): void` -- mark all visible rows.
  - `unmarkAllRows(): void` -- unmark all rows.
  - `getMarkedRows(): string[]` -- return all marked row IDs.
- BR-6: Marked rows MUST retain their marked state when filtered out and then shown again. Marking is a persistent state on the data item, not on the visual row.
- BR-7: A header marking checkbox MAY be provided to mark/unmark all visible rows (tri-state: all/none/mixed, analogous to F-08.3 header checkbox). This is optional because marking is often a deliberate per-row action where mark-all is less common.
- BR-8: The visual treatment of a marked row MUST be distinct from the selected row highlight. Marking SHOULD use a checkbox in a column; it MUST NOT use the same background-color-based highlight as selection.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Marking is per-row and does not propagate to children. Marking a parent MUST NOT automatically mark its children (unlike tri-state selection checkbox in F-06.5). |
| Pivot Table | Marking applies to data rows in the pivot table, if applicable. In most pivot table workflows, marking is less common since rows represent aggregated data. |
| Gantt Chart | Marking a task row marks it for batch operations (e.g., "reschedule all marked tasks"). The timeline bar MAY display a visual marker (e.g., a flag icon) for marked rows. |

**Editability Interaction**
- Clicking the marking checkbox MUST NOT enter Edit Mode. The marking column is a control column, not a data column.
- Marking state MUST NOT trigger the cell editing lifecycle or validation.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Space | Toggle mark on the focused row's marking checkbox | Navigation Mode, focus on marking column cell |
| (Grid-level shortcut) | Mark/unmark focused row (if a grid-level shortcut is configured) | Navigation Mode, any cell focused |

**Accessibility**
- **ARIA**: Each marking checkbox MUST have `role="checkbox"` with `aria-checked="true"` or `aria-checked="false"`. The accessible label MUST distinguish marking from selection: `aria-label="Mark row [identifier]"` (not "Select row"). If a header marking checkbox exists, it MUST support `aria-checked="mixed"`.
- **Screen Reader**: SR: "Mark row [Name], checkbox, not checked" when navigating to a marking checkbox. The distinction from "Select row" is critical to avoid confusion. SR: "Mark all rows, checkbox, mixed" for the header marking checkbox.
- **WCAG**: 1.3.1 (marking state is programmatically determinable), 2.1.1 (marking is keyboard-accessible), 4.1.2 (marking checkbox has distinct accessible name).
- **Visual**: The marking checkbox MUST be visually distinguishable from the selection checkbox. Different column position, different checkbox style (e.g., circle vs square), or a clear label ("Mark" vs row-selector icon) SHOULD be used. The marking checkbox MUST meet WCAG 1.4.11 (3:1 contrast).

**Chameleon 6 Status**: Existed. Methods: `markRow()`, `markAllRows()`, `getMarkedRows()`. Event: `rowMarkingChanged`. Chameleon 7 carries forward and adds `unmarkRow()`, `unmarkAllRows()`, tri-state header marking checkbox, and ARIA-compliant labeling that distinguishes marking from selection.

**Interactions**
- F-08.1 / F-08.2 / F-08.3 (Row Selection): marking is independent of selection; both states coexist.
- F-08.8 (Programmatic Selection API): marking has its own API methods, separate from selection methods.
- F-08.9 (Selection Events): marking has its own event (`rowMarkingChanged`), not part of `selectionChanged`.
- F-03 (Filtering): marked rows retain their mark when filtered out.
- F-12 (Export/Import): "export marked rows" is a valid workflow, distinct from "export selected rows."
- F-21 (State Persistence): marking state SHOULD be persistable.

---

## Cross-Cutting Concerns

### Selection and Editing Interaction

When both selection and editing are active, the following coordination rules MUST apply (per [FD-03](../01-foundations/03-editability-model.md)):

- Clicking an unselected cell MUST select it (in Navigation Mode). A second click or F2 enters Edit Mode.
- Clicking an already-selected editable cell MUST enter Edit Mode directly.
- While in Edit Mode, the selection state MUST NOT change. Arrow keys are captured by the editor, not by the grid's selection manager.
- When Edit Mode is exited (Escape/Enter), the cell MUST remain selected in Navigation Mode.
- Bulk operations (delete, format) triggered on a multi-selection MUST NOT affect cells currently in Edit Mode. The edit MUST be committed or cancelled first.

### Selection and Filtering Interaction

When selection and filtering interact:

- When a filter hides a selected row, the row MUST be removed from the active selection and a `selectionChanged` event MUST fire.
- When a filter is removed and the row becomes visible again, it MUST NOT be automatically re-selected. Selection was cleared when the row was hidden.
- Select-all (F-08.7) operates on the visible (filtered) row set only.

### Selection and Sorting Interaction

When sorting reorders rows:

- The selection state MUST be preserved through sort operations. Selected rows remain selected regardless of their new visual position.
- The visual selection highlight MUST move with the rows to their new sorted positions.
- Range selection (F-08.5) MUST be cleared when a sort is applied, because the rectangular range may no longer form a meaningful rectangle after reordering. Single-cell and row selection persist.

### Selection and Grouping Interaction

- When a group is collapsed, selected rows within the group are visually hidden but SHOULD remain in the selection set. When the group is re-expanded, those rows reappear with their selection state intact.
- Alternatively, the grid MAY be configured to clear selection for rows that become hidden by group collapse (analogous to the filtering behavior). This SHOULD be configurable.

### Selection and Virtualization Interaction

- Selection state MUST be maintained in a data structure independent of the DOM. When a row is virtualized out (removed from the DOM), its selection state MUST persist. When the row is scrolled back into view and its DOM element is recycled/recreated, the selection visual and `aria-selected` attribute MUST be restored.
- The programmatic API (F-08.8) MUST return all selected row IDs, including those currently virtualized out.

### Cell Interaction Forwarding

The grid MUST support a configurable cell interaction delegate pattern (brainstorming note #14):

- A column definition MAY specify `clickForwardsTo: columnId` -- clicking a cell in this column forwards focus to the specified column's cell in the same row.
- A column definition MAY specify `doubleClickAction: (rowId) => void` -- double-clicking a cell in this column invokes the callback (e.g., toggling a boolean value).
- These delegates operate on top of the selection system and do not replace it. A click that forwards focus still selects the target cell.

---

## Normative Requirements Summary

| ID | Requirement | Level | Feature |
|----|-------------|-------|---------|
| SEL-01 | Single-selection mode MUST deselect previous row when a new row is clicked. | MUST | F-08.1 |
| SEL-02 | `aria-selected="true"` MUST be set on the selected row; `"false"` on all other selectable rows. | MUST | F-08.1 |
| SEL-03 | `aria-multiselectable` MUST NOT be present on the grid in single-selection mode. | MUST | F-08.1 |
| SEL-04 | `aria-multiselectable="true"` MUST be present on the grid in multi-selection mode. | MUST | F-08.2 |
| SEL-05 | Ctrl+click MUST toggle individual row selection without affecting other selected rows. | MUST | F-08.2 |
| SEL-06 | Shift+click MUST select the contiguous range from anchor to target. | MUST | F-08.2 |
| SEL-07 | Shift+Arrow MUST extend selection by one row in the arrow direction. | MUST | F-08.2 |
| SEL-08 | Header checkbox MUST be tri-state: checked (all), unchecked (none), mixed (some). | MUST | F-08.3 |
| SEL-09 | Header checkbox MUST use `aria-checked="mixed"` for indeterminate state. | MUST | F-08.3 |
| SEL-10 | Clicking header checkbox in mixed state MUST select all visible rows. | MUST | F-08.3 |
| SEL-11 | Checkbox touch target MUST be at least 24x24 CSS pixels (WCAG 2.5.8). | MUST | F-08.3 |
| SEL-12 | Cell selection MUST be tracked independently from row selection. | MUST | F-08.4 |
| SEL-13 | Selected cell focus ring MUST meet WCAG 2.4.11 (minimum 2px contrasting border). | MUST | F-08.4 |
| SEL-14 | Range selection MUST be initiable by click-drag and Shift+click. | MUST | F-08.5 |
| SEL-15 | Shift+Arrow MUST extend the cell range by one cell. | MUST | F-08.5 |
| SEL-16 | Range highlight MUST have 3:1 contrast ratio (WCAG 1.4.11). | MUST | F-08.5 |
| SEL-17 | Ctrl+A MUST select all visible rows in multi-selection mode. | MUST | F-08.7 |
| SEL-18 | Select-all MUST operate on the visible (filtered) row set, not the full data source. | MUST | F-08.7 |
| SEL-19 | Live region MUST announce "All rows selected" or "All rows deselected". | MUST | F-08.7 |
| SEL-20 | Programmatic selection MUST update visual state, ARIA, and emit events. | MUST | F-08.8 |
| SEL-21 | `selectCell()` MUST scroll the target cell into view and move focus. | MUST | F-08.8 |
| SEL-22 | `selectionChanged` event MUST include `rowsId`, `addedRowsId`, `removedRowsId`. | MUST | F-08.9 |
| SEL-23 | `cellSelectionChanged` event MUST include `columnId`, `rowId`, `cellId`. | MUST | F-08.9 |
| SEL-24 | Selection events MUST fire after DOM/ARIA updates are complete. | MUST | F-08.9 |
| SEL-25 | Fill handle keyboard alternative MUST exist (Ctrl+D, Ctrl+R). | MUST | F-08.10 |
| SEL-26 | Fill operation MUST emit edit events for each filled cell. | MUST | F-08.10 |
| SEL-27 | Row hover highlight MUST meet 3:1 contrast against unhovered state (WCAG 1.4.11). | MUST | F-08.11 |
| SEL-28 | Hover highlight MUST be customizable via CSS custom properties. | MUST | F-08.11 |
| SEL-29 | Marking state MUST be independent of selection state. | MUST | F-08.12 |
| SEL-30 | Marking checkbox `aria-label` MUST distinguish from selection (e.g., "Mark row" not "Select row"). | MUST | F-08.12 |
| SEL-31 | Marked rows MUST retain mark state when filtered out and shown again. | MUST | F-08.12 |
| SEL-32 | Clicking an already-selected editable cell MUST enter Edit Mode, not reselect. | MUST | Cross-cutting |
| SEL-33 | Selection state MUST persist through sort operations. | MUST | Cross-cutting |
| SEL-34 | Selection state MUST be maintained independently of the DOM for virtualized grids. | MUST | Cross-cutting |
| SEL-35 | Selection visual MUST NOT rely on color alone (WCAG 1.4.1). | MUST | F-08.1 |

---

## Cross-References

| Topic | Reference |
|-------|-----------|
| CSS subgrid layout (row elements, column tracks) | [FD-01: Layout Model](../01-foundations/01-layout-model.md) |
| Variant definitions and ARIA roles | [FD-02: Variant Model](../01-foundations/02-variant-model.md) |
| Navigation Mode vs Edit Mode, selection-edit coordination | [FD-03: Editability Model](../01-foundations/03-editability-model.md) |
| Baseline ARIA structure, roving tabindex, live regions | [FD-04: Accessibility Foundation](../01-foundations/04-accessibility-foundation.md) |
| Data display, cell renderers, tooltips on hover | F-01: Data Display & Rendering |
| Sorting (selection persists through sort) | F-02: Sorting |
| Filtering (selection cleared for hidden rows) | F-03: Filtering |
| Grouping (group header checkboxes, collapse behavior) | F-04: Grouping & Aggregation |
| Tree hierarchy (tri-state checkbox propagation) | F-06: Tree / Hierarchical |
| Cell editing (selection-edit coordination, fill handle lifecycle) | F-07: Cell Editing |
| Column management (checkbox column pinning, non-resizable) | F-09: Column Management |
| Row management (row pinning, full-width rows) | F-10: Row Management |
| Virtualization (selection state independent of DOM) | F-11: Virtualization & Performance |
| Export/Import (copy selected, export marked) | F-12: Export / Import |
| Keyboard navigation (Arrow keys, Shift+Arrow, Ctrl+A) | F-14: Keyboard Navigation |
| Theming (hover color, selection color, focus ring) | F-15: Theming & Styling |
| Context menus (actions on selected rows/cells) | F-16: Context Menus |
| Undo/Redo (fill handle as single transaction) | F-17: Undo / Redo |
| Validation (navigate to error cell via selectCell) | F-18: Validation |
| Formulas (range selection for cell references) | F-19: Formulas & Calculated |
| Server-side operations (selection with server data) | F-20: Server-Side Operations |
| State persistence (persist selection and marking state) | F-21: State Persistence & Responsive |
