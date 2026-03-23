# F-10: Row Management

Row management encompasses features that control the structural behavior of rows beyond data display: reordering, pinning, expanding into detail panels, spanning full width, aggregating into footer summaries, animating transitions, and surfacing contextual actions on hover. These features operate at the row level and apply across all four variants (Data Grid, Tree Grid, Pivot Table, Gantt Chart) with variant-specific adaptations.

Row management features interact heavily with the layout model ([FD-01](../01-foundations/01-layout-model.md)) because pinned rows, full-width rows, and summary rows alter or extend the subgrid structure. They also interact with the editability model ([FD-03](../01-foundations/03-editability-model.md)) because detail panels, hover action buttons, and summary rows introduce non-editable structural elements into the row flow.

> **Foundations**: The CSS subgrid row model in [FD-01](../01-foundations/01-layout-model.md) governs how row elements participate in the grid layout. Pinned rows use `position: sticky` within the subgrid. Full-width and summary rows use `grid-column: 1 / -1` to span all column tracks. The accessibility foundation in [FD-04](../01-foundations/04-accessibility-foundation.md) defines the roving tabindex strategy used for focus management across structural row types (pinned, full-width, detail panels).

> **Structural row principle**: Structural rows (pinned summary rows, full-width rows, footer rows) are NOT data rows. They MUST NOT be selectable (F-08), sortable (F-02), filterable (F-03), or editable (F-07) unless explicitly specified per feature. They participate in keyboard navigation (F-14) but are skipped by operations that target data records.

---

## 10.1 Row Reorder (Drag-and-Drop) [P1]

**Description**: The user drags a row by its drag handle to change its position within the grid. The DOM is physically reordered to reflect the new position, and the underlying data model is updated accordingly. Row reorder provides a direct-manipulation interface for tasks like prioritization, manual sorting, and sequencing. For users who cannot use drag-and-drop, an equivalent keyboard-accessible alternative is provided via context menu actions ("Move Up" / "Move Down") or keyboard shortcuts.

**Applies to**: Data Grid, Tree Grid (flat reorder within same level), Gantt Chart (task reorder in task list)

**Use Cases**
- UC-1: A product manager drags a backlog item from position 5 to position 2 to reprioritize it above other items.
- UC-2: A project planner reorders tasks in a Gantt Chart task list to change the execution sequence, and the timeline bars reorder correspondingly.
- UC-3: A keyboard-only user opens the context menu on a row and selects "Move Up" to promote it one position without using a mouse.
- UC-4: In a Tree Grid, a user drags a child row within its sibling group to change its display order among siblings at the same level.

**Conditions of Use**
- The grid MUST be configured with a row reorder property (e.g., `rowReorderEnabled: true`).
- Each reorderable row MUST display a visible drag handle element. The handle SHOULD be a dedicated column or an icon within the first cell.
- Row reorder MUST be disabled when an active sort (F-02) is applied, since drag-based ordering conflicts with algorithmic ordering. The grid SHOULD either disable the drag handle visually or show a warning.
- Row reorder MUST be disabled when grouping (F-04) is active, unless reordering is constrained to within-group only.

**Behavioral Requirements**
- BR-1: When the user initiates a drag on the drag handle, the grid MUST visually indicate the drag operation with a ghost/preview of the row and a drop indicator (line or highlight) showing the target insertion point.
- BR-2: When the user drops the row at a new position, the grid MUST physically reorder the DOM element and update the internal data model to reflect the new order.
- BR-3: The grid MUST emit a `rowReorderStarted` event when the drag begins, containing the row ID and its original index.
- BR-4: The grid MUST emit a `rowReorderCompleted` event when the drop is accepted, containing the row ID, original index, and new index.
- BR-5: If the drop target is invalid (e.g., before a pinned row, outside the grid), the grid MUST cancel the reorder and return the row to its original position.
- BR-6: Reordering MUST update the visual order, the data model, and any associated index properties. Subsequent operations (sort, filter, export) MUST reflect the reordered state.
- BR-7: The drag handle MUST have `cursor: grab` (and `cursor: grabbing` during drag) to provide a visual affordance.
- BR-8: Multi-row reorder MUST be supported when multiple rows are selected (F-08). Dragging one selected row MUST move all selected rows as a contiguous block to the drop position.
- BR-9: The keyboard alternative for row reorder MUST be available via a context menu (F-16) with "Move Up" and "Move Down" actions, or via Ctrl+Shift+Arrow Up / Ctrl+Shift+Arrow Down shortcuts.
- BR-10: Keyboard-based reorder (BR-9) MUST move the focused row one position in the specified direction and emit the same `rowReorderCompleted` event as drag-and-drop reorder.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Row reorder within the same parent is supported. Reordering across different parents constitutes reparenting (F-06.6) and follows that feature's rules. Dragging a parent row MUST move it along with all its descendants. |
| Pivot Table | Row reorder does NOT apply. Pivot Table row order is determined by dimensions and aggregation, not manual positioning. |
| Gantt Chart | Reordering a task row in the task list MUST reorder the corresponding timeline bar in the timeline region. The timeline region MUST reflect the new visual order immediately. Dependency lines MUST re-render to match the updated positions. |

**CSS Subgrid Implications**

Reordering physically moves the row element within the grid container's DOM. Because CSS subgrid assigns rows to tracks based on DOM order, the reordered row automatically occupies the correct track position. No explicit `grid-row` reassignment is needed -- DOM order governs visual order.

During the drag, the ghost/preview row SHOULD be positioned with `position: fixed` or `position: absolute` outside the subgrid flow to avoid layout shifts. The drop indicator (insertion line) SHOULD be implemented as a pseudo-element or overlay, not as a DOM element that disrupts subgrid track assignment.

**Editability Interaction**
- Row reorder MUST NOT be initiatable while any cell is in Edit Mode. If the user attempts to drag while editing, the grid MUST either ignore the drag or commit/cancel the edit first (per [FD-03](../01-foundations/03-editability-model.md) mode transition rules).
- After reorder completes, focus MUST return to the reordered row at its new position.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Ctrl + Shift + Arrow Up | Move the focused row up one position | Navigation Mode |
| Ctrl + Shift + Arrow Down | Move the focused row down one position | Navigation Mode |
| Shift + F10 (or Context Menu key) | Open context menu with "Move Up" / "Move Down" options | Navigation Mode |
| Escape | Cancel an in-progress drag operation | During drag |

**Accessibility**
- **ARIA**: The drag handle MUST have `role="button"` with `aria-label="Reorder row"` (or equivalent localized label). The drag handle MUST be keyboard-focusable (`tabindex="0"` within the cell's tab sequence in Edit Mode focus model, per [FD-03](../01-foundations/03-editability-model.md) Section 7).
- **Screen Reader**: When the user activates keyboard reorder (Ctrl+Shift+Arrow), a live region (`role="status"`, `aria-live="polite"`) MUST announce: SR: "Row moved to position [N]". When the context menu alternative is used, the menu item labels ("Move Up", "Move Down") provide the accessible name.
- **WCAG**: 2.5.7 (Dragging Movements) -- the keyboard alternative (context menu or Ctrl+Shift+Arrow) MUST be provided as an equivalent non-drag mechanism. 2.1.1 (Keyboard) -- all reorder operations MUST be achievable via keyboard. 1.3.2 (Meaningful Sequence) -- the DOM order MUST match the visual order after reorder.
- **Visual**: The drag handle MUST be visually distinct (e.g., a grip icon). During drag, the dragged row MUST have a visual elevation (shadow) or opacity change to indicate it is being moved. The drop indicator MUST be visible with sufficient contrast (3:1 minimum per WCAG 1.4.11).

**Chameleon 6 Status**: Existed. `richRowDrag` property enabled drag handles. `rowDragStarted` event fired on drag initiation. Chameleon 7 adds keyboard alternatives (Ctrl+Shift+Arrow, context menu), WCAG 2.5.7 compliance, multi-row drag, and `rowReorderCompleted` event with full payload.

**Interactions**
- F-02 (Sorting): row reorder is disabled when sort is active.
- F-04 (Grouping): row reorder is disabled or constrained to within-group when grouping is active.
- F-06.6 (Reparenting via Drag-and-Drop): tree reparenting is the hierarchical equivalent of flat row reorder.
- F-08 (Selection): multi-row selection enables multi-row drag.
- F-11 (Virtualization): drag-and-drop MUST work across virtualized boundaries; the grid MUST auto-scroll when the drag reaches the viewport edge.
- F-14 (Keyboard Navigation): Ctrl+Shift+Arrow shortcuts are registered in the keyboard navigation system.
- F-16 (Context Menus): "Move Up" / "Move Down" context menu items.
- F-17 (Undo/Redo): row reorder SHOULD be undoable via the undo stack.

---

## 10.2 Row Pinning [P1]

**Description**: The user or developer pins specific rows to the top or bottom of the viewport so they remain visible during vertical scrolling. Pinned rows are anchored outside the scrollable region and serve as persistent reference points -- for example, summary rows, comparison baselines, or highlighted records. Pinning is orthogonal to selection: a pinned row is not necessarily selected, and a selected row is not necessarily pinned.

**Applies to**: Data Grid, Tree Grid, Gantt Chart (task list)

**Use Cases**
- UC-1: A financial analyst pins a "Budget Target" row to the top of a Data Grid so it remains visible while scrolling through hundreds of expense rows for comparison.
- UC-2: A project manager pins a critical milestone task to the top of a Gantt Chart task list so it is always visible as a reference while scrolling through other tasks.
- UC-3: A developer programmatically pins a totals row to the bottom of a grid as a sticky summary that follows the user during scroll.
- UC-4: A user right-clicks a row and selects "Pin to Top" from the context menu to temporarily anchor it for comparison.

**Conditions of Use**
- Row pinning MUST be configurable both declaratively (via data model property, e.g., `pinned: "top" | "bottom" | null` on the row definition) and programmatically (via API methods `pinRow(rowId, position)` and `unpinRow(rowId)`).
- Pinned rows MUST be visually separated from unpinned rows by a divider (border or shadow) to indicate they are outside the scroll flow.
- The grid SHOULD support a configurable maximum number of pinned rows per position (top and bottom) to prevent layout degradation.

**Behavioral Requirements**
- BR-1: Pinned-top rows MUST render above the scrollable data region and remain fixed at the top of the grid viewport during vertical scroll. Pinned-bottom rows MUST render below the scrollable data region and remain fixed at the bottom.
- BR-2: Pinned rows MUST participate in the same column subgrid as unpinned rows, sharing column widths, alignment, and frozen column behavior.
- BR-3: Pinned rows MUST be implemented using either `position: sticky` within the grid container or as separate `role="rowgroup"` sections (a pinned-top rowgroup, the scrollable rowgroup, and a pinned-bottom rowgroup).
- BR-4: Column operations (resize, reorder, hide, freeze) MUST apply uniformly to pinned and unpinned rows because they share the same subgrid column template.
- BR-5: The grid MUST emit a `rowPinnedChanged` event when a row is pinned or unpinned, containing the row ID and the new pinned state.
- BR-6: Sorting (F-02) MUST NOT reorder pinned rows relative to the pinned section. Pinned rows maintain their pinned position regardless of sort. Sort applies only within the unpinned scrollable region.
- BR-7: Filtering (F-03) MUST NOT hide pinned rows. Pinned rows remain visible even if they do not match the active filter criteria. This ensures pinned reference rows are always accessible.
- BR-8: The user MUST be able to unpin a row via the same mechanism used to pin it (context menu "Unpin Row", API call, or toggling the data model property).
- BR-9: When a pinned row is deleted from the data source, it MUST be removed from the pinned section and the grid MUST emit both a `rowPinnedChanged` event and the appropriate data change event.
- BR-10: Pinned rows MUST retain their original data and participate in cell editing (F-07) if editable.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Pinning a parent row MUST pin only that row, NOT its children. Children remain in the scrollable region. If the developer wants to pin a parent with its subtree, each row must be pinned individually. Alternatively, the grid MAY support a `pinSubtree` option that pins the parent and all descendants as a block. |
| Pivot Table | Row pinning does NOT apply in the standard Pivot Table. Row order is determined by dimensions. However, if the Pivot Table supports a "pinned comparison row" for baseline comparisons, it follows the same sticky mechanics. |
| Gantt Chart | Pinning a task row in the task list MUST also pin the corresponding timeline bar in the timeline region at the same vertical position. Both regions MUST scroll-lock the pinned row. |

**CSS Subgrid Implications**

Pinned rows can be implemented using two approaches, both compatible with subgrid:

**Approach A: Sticky positioning within a single grid container**
```css
.row[data-pinned="top"] {
  position: sticky;
  top: var(--ch-header-height, 0px);
  z-index: var(--ch-pinned-row-z-index, 3);
}
.row[data-pinned="bottom"] {
  position: sticky;
  bottom: 0;
  z-index: var(--ch-pinned-row-z-index, 3);
}
```

**Approach B: Separate rowgroup sections**
```css
.pinned-top-rowgroup,
.pinned-bottom-rowgroup {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
  position: sticky;
}
.pinned-top-rowgroup { top: var(--ch-header-height, 0px); }
.pinned-bottom-rowgroup { bottom: 0; }
```

Both approaches ensure pinned rows share column widths via subgrid. Approach B provides clearer semantic grouping for accessibility.

**Editability Interaction**
- Pinned rows MUST remain editable if their cells are configured as editable. Pinning a row does not alter its editability state.
- When the user enters Edit Mode on a pinned row cell, the editor MUST render within the sticky-positioned row, ensuring it remains visible during scroll.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Arrow Up / Arrow Down | Navigate into and out of pinned row sections. Focus MUST move seamlessly from pinned-top rows to scrollable rows to pinned-bottom rows. | Navigation Mode |
| Ctrl + Home | Move focus to the first cell of the first pinned-top row (if any), otherwise the first scrollable row | Navigation Mode |
| Ctrl + End | Move focus to the last cell of the last pinned-bottom row (if any), otherwise the last scrollable row | Navigation Mode |

**Accessibility**
- **ARIA**: If using separate rowgroup sections (Approach B), each pinned section MUST be a `role="rowgroup"` with `aria-label="Pinned rows, top"` or `aria-label="Pinned rows, bottom"`. If using sticky positioning within a single rowgroup, pinned rows MUST carry `aria-roledescription="pinned row"` to distinguish them from scrollable rows.
- **Screen Reader**: When focus enters a pinned row, the screen reader SHOULD announce: SR: "Pinned row, [row content]". When leaving the pinned section, SR: "Scrollable rows". This contextual announcement helps the user understand the grid's spatial structure.
- **WCAG**: 1.3.1 (the pinned/unpinned structure is programmatically determinable via `rowgroup` or `aria-roledescription`), 1.3.2 (DOM order matches visual order: pinned-top, scrollable, pinned-bottom), 2.4.3 (focus order follows the visual top-to-bottom pinned layout).
- **Visual**: Pinned rows MUST be visually separated from the scrollable region by a border, shadow, or divider line that meets WCAG 1.4.11 (3:1 contrast). Pinned rows MAY have a distinct background color to reinforce their fixed nature.

**Chameleon 6 Status**: Partial. Chameleon 6 supported frozen/sticky header rows but did not have a general-purpose row pinning API for arbitrary data rows. Chameleon 7 introduces declarative and programmatic row pinning for any row.

**Interactions**
- F-02 (Sorting): sort does not affect pinned row position.
- F-03 (Filtering): filter does not hide pinned rows.
- F-04 (Grouping): pinned rows are excluded from grouping. A pinned row is removed from its group and placed in the pinned section.
- F-07 (Cell Editing): pinned rows remain editable.
- F-08 (Selection): pinned rows are selectable. Selection state is independent of pinned state.
- F-09 (Column Management): column operations apply uniformly to pinned and unpinned rows.
- F-10.1 (Row Reorder): reorder operations MUST NOT move an unpinned row into the pinned section via drag. Pinning is a separate operation.
- F-11 (Virtualization): pinned rows are outside the virtualization window; they are always rendered in the DOM.
- F-14 (Keyboard Navigation): focus traversal includes pinned rows in the expected visual order.

---

## 10.3 Master-Detail (Expand Row to Detail Panel) [P1]

**Description**: The user expands a data row to reveal a nested detail panel directly below it. The detail panel can contain arbitrary content: another grid (nested child grid), a form, custom HTML, or a combination. Only one or multiple detail panels may be open simultaneously (configurable). The pattern provides drill-down capability without navigating away from the grid. The detail panel is visually indented or otherwise distinguished from regular rows.

**Applies to**: Data Grid, Tree Grid, Gantt Chart (task list)

**Use Cases**
- UC-1: A user expands an order row in a Data Grid to reveal a nested grid of line items within that order.
- UC-2: A support agent expands a ticket row to see a detail form with ticket description, attachments, and conversation history.
- UC-3: In a Tree Grid, a user expands a project node to see a detail panel showing a Gantt timeline of that project's tasks.
- UC-4: A user expands a Gantt Chart task row to see a detail panel with resource assignments, notes, and attachments.

**Conditions of Use**
- Master-detail MUST be enabled via a configuration property (e.g., `masterDetailEnabled: true`).
- The developer MUST provide a detail renderer -- a function or template that receives the parent row's data and returns the detail panel content.
- The grid MUST accept a configuration for simultaneous open panels: `detailPanelMode: "single" | "multiple"`. In `"single"` mode, expanding one row collapses any previously expanded row. In `"multiple"` mode, multiple panels can be open simultaneously.
- Rows that support detail expansion MUST display an expand/collapse affordance (chevron, +/- icon, or disclosure triangle) in a dedicated column or the first cell.

**Behavioral Requirements**
- BR-1: When the user activates the expand affordance (click or keyboard), the grid MUST insert a detail panel row immediately below the parent row. The detail panel MUST span all columns (`grid-column: 1 / -1`).
- BR-2: When the user activates the collapse affordance on an expanded row, the grid MUST remove (or hide) the detail panel and update the parent row's visual state.
- BR-3: The parent row MUST carry `aria-expanded="true"` when the detail panel is open and `aria-expanded="false"` when closed.
- BR-4: The grid MUST emit a `detailPanelOpened` event when a detail panel is expanded, containing the parent row ID. The grid MUST emit a `detailPanelClosed` event when collapsed.
- BR-5: In `"single"` mode, expanding a row MUST automatically collapse the previously expanded row. The grid MUST emit both `detailPanelClosed` (for the previously expanded row) and `detailPanelOpened` (for the newly expanded row) events.
- BR-6: The detail panel content MUST be lazily rendered -- the detail renderer is invoked when the panel is expanded, not when the grid initially renders. This avoids rendering hundreds of detail panels for a large data set.
- BR-7: The detail panel height MUST be dynamic, determined by its content. The grid MUST NOT require a fixed detail panel height.
- BR-8: When a parent row with an open detail panel is removed (by filtering, deletion, or sorting out of view), the detail panel MUST be closed and the `detailPanelClosed` event MUST fire.
- BR-9: The expand/collapse affordance MUST be visible only on rows configured to have detail panels. Not all rows are required to have detail panels.
- BR-10: The developer MUST be able to programmatically expand or collapse detail panels via API methods (e.g., `expandDetail(rowId)`, `collapseDetail(rowId)`, `toggleDetail(rowId)`).

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Master-detail is independent of the tree expand/collapse mechanism. A tree node can be expanded (showing children) AND have a detail panel expanded (showing additional content). The tree expand caret and the detail expand affordance MUST be distinct controls. |
| Pivot Table | Master-detail does NOT apply in standard Pivot Table usage. Drill-down in Pivot Tables is handled by the pivoting feature (F-05) through expanding dimension levels, not through detail panels. |
| Gantt Chart | Expanding a task row's detail panel in the task list MUST NOT disrupt the timeline region alignment. The detail panel spans only the task list columns. The timeline region MUST insert a corresponding blank space or the detail panel MUST span both regions (configurable). |

**CSS Subgrid Implications**

The detail panel row is a full-width row element that participates in the subgrid:

```css
.detail-panel-row {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
}
.detail-panel-content {
  grid-column: 1 / -1;  /* Span all columns */
  /* Content within is not constrained to subgrid tracks */
}
```

The detail panel's inner content is free-form (not subgridded) because it does not represent tabular data aligned to columns. Only the detail panel's outer row element participates in the subgrid to maintain DOM/layout consistency.

The detail panel row's height is auto-sized based on content, which creates a new implicit row track in the grid. This MUST NOT affect the height of other data rows.

**Editability Interaction**
- The detail panel is NOT a grid cell; it is a container for arbitrary content. Edit Mode (F-07) does not apply to the detail panel itself.
- If the detail panel contains an editable nested grid, that nested grid has its own independent edit mode and focus management.
- The parent row remains editable while its detail panel is expanded.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Enter | Toggle expand/collapse of the detail panel when focus is on the expand affordance cell or the parent row (if configured) | Navigation Mode |
| Escape | Collapse the detail panel and return focus to the parent row (when focus is inside the detail panel) | Any mode within detail panel |
| Tab | From the parent row, move focus into the detail panel content (when the detail panel is expanded) | Navigation Mode |
| Shift + Tab | From the detail panel content, move focus back to the parent row | Within detail panel |
| Arrow Down | From the parent row with an expanded detail panel, skip the detail panel and move focus to the next data row (detail panels are not navigated via arrow keys) | Navigation Mode |

**Accessibility**
- **ARIA**: The parent row MUST carry `aria-expanded="true"` when the detail panel is open and `aria-expanded="false"` when closed. The expand affordance MUST have `role="button"` with `aria-label="Expand details for [row identifier]"` (or `"Collapse details for [row identifier]"` when expanded). The detail panel row SHOULD carry `role="row"` with a single cell `role="gridcell"` spanning all columns, or it MAY use `role="none"` / `role="presentation"` and the content inside carries its own roles (e.g., a nested grid with its own `role="grid"`).
- **Screen Reader**: When the user expands a detail panel, a live region MUST announce: SR: "Details expanded for [row identifier]". When collapsed: SR: "Details collapsed for [row identifier]". When focus enters the detail panel via Tab, the screen reader SHOULD announce the detail panel content context (e.g., "Detail panel, [content description]").
- **WCAG**: 1.3.1 (expanded/collapsed state is programmatically determinable via `aria-expanded`), 2.1.1 (expand/collapse and navigation into detail panel is keyboard-accessible), 2.4.3 (focus order: parent row, then Tab into detail panel, then next row via Arrow Down), 4.1.2 (expand button has accessible name and state).
- **Visual**: The expand/collapse affordance MUST be a visible icon (chevron or disclosure triangle) that rotates or changes to indicate state. The detail panel MUST be visually distinct from data rows (e.g., different background, indentation, or border). The visual distinction MUST NOT rely on color alone (WCAG 1.4.1).

**Chameleon 6 Status**: Partial. Chameleon 6 had limited support for expandable row content but lacked a formalized master-detail pattern with lazy rendering, event lifecycle, and full ARIA compliance. Chameleon 7 introduces a complete master-detail feature with configurable detail renderers and proper accessibility.

**Interactions**
- F-06 (Tree/Hierarchical): tree expand/collapse is independent of detail panel expand/collapse.
- F-08 (Selection): expanding a detail panel MUST NOT change row selection state. The parent row remains selected or unselected independently.
- F-10.2 (Row Pinning): a pinned row CAN have a detail panel. The detail panel MUST remain visible within the pinned section when expanded.
- F-10.4 (Full-Width Rows): the detail panel IS a full-width row; it follows the same `grid-column: 1 / -1` pattern.
- F-11 (Virtualization): expanded detail panels MUST be accounted for in the virtualization height calculations. An expanded detail panel changes the row's effective height.
- F-14 (Keyboard Navigation): Tab enters the detail panel; Arrow keys skip it.

---

## 10.4 Full-Width Rows [P1]

**Description**: A row whose single cell spans all columns of the grid, ignoring the column structure. Full-width rows are used for banners, section dividers, informational messages, summary panels, or any content that does not conform to the columnar layout. They participate in the row flow (vertically ordered among data rows) but their content is not aligned to column tracks.

**Applies to**: All variants

**Use Cases**
- UC-1: A Data Grid inserts a full-width banner row after every 50 rows displaying an advertisement or informational message.
- UC-2: A section divider row separates logical groups of data with a label and horizontal rule.
- UC-3: A Tree Grid displays a full-width "No children found" message when a parent node has no children.
- UC-4: A Gantt Chart task list inserts a full-width milestone summary row spanning the task list columns.

**Conditions of Use**
- Full-width rows MUST be defined in the data model with a flag or type property (e.g., `rowType: "fullWidth"`).
- The developer MUST provide a renderer for full-width rows, since they do not use the standard column-based cell renderers.
- Full-width rows MUST be distinguishable from data rows in the data model so that operations like sorting, filtering, and editing can exclude them.

**Behavioral Requirements**
- BR-1: A full-width row MUST render as a single cell spanning all column tracks using `grid-column: 1 / -1`.
- BR-2: Full-width rows MUST maintain vertical alignment with adjacent data rows in the DOM order. They occupy one row track in the grid.
- BR-3: Full-width rows MUST NOT be sortable. They maintain their defined position relative to surrounding data rows (e.g., "after row ID X" or "at index N").
- BR-4: Full-width rows MUST NOT be filterable. They remain visible regardless of active filters.
- BR-5: Full-width rows MUST NOT be editable via the standard cell editing mechanism (F-07). The full-width content is rendered by a custom renderer; any interactivity within it is managed by that renderer.
- BR-6: Full-width rows MUST NOT be selectable via row selection (F-08) by default. If needed, selectability of full-width rows SHOULD be opt-in via configuration.
- BR-7: The grid MUST support full-width rows at any position: beginning, end, or interspersed among data rows.
- BR-8: Column resize, reorder, hide, and freeze operations MUST NOT affect full-width row rendering (since they span all columns). However, the full-width row's total width MUST equal the sum of all column widths to maintain horizontal scroll alignment.
- BR-9: Full-width rows MUST participate in keyboard navigation. Arrow Down/Up from a data row MUST move focus to an adjacent full-width row and vice versa.
- BR-10: Horizontal scrolling MUST scroll full-width rows in sync with data rows, maintaining the same horizontal scroll position.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Full-width rows can appear at any level of the tree. A full-width row nested under a parent node MUST be hidden when the parent is collapsed. |
| Pivot Table | Full-width rows are uncommon in Pivot Tables but MAY be used for section labels or disclaimers within the data region. They span all value columns and dimension header columns. |
| Gantt Chart | Full-width rows in the task list region MUST have a corresponding empty space in the timeline region to maintain vertical alignment. Alternatively, the full-width row MAY span both the task list and timeline regions if the content is relevant to both. |

**CSS Subgrid Implications**

```css
.full-width-row {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
}
.full-width-cell {
  grid-column: 1 / -1;
  /* Content is free-form, not aligned to column tracks */
}
```

The full-width row participates in the subgrid for horizontal extent (it spans all tracks) but its single cell's content is unconstrained. This pattern is identical to group header rows (F-04) and detail panel rows (F-10.3).

When frozen columns are present, the full-width cell MUST still span the frozen columns. The cell's content scrolls with the non-frozen region, but the cell itself stretches across both frozen and scrollable tracks.

**Editability Interaction**
- Full-width rows are NOT editable via standard cell editing. The `isCellEditable` check (FD-03) MUST return `false` for cells in full-width rows.
- If the full-width row's custom renderer contains interactive elements (buttons, links, form fields), those elements manage their own interaction independently of the grid's edit mode.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Arrow Down / Arrow Up | Move focus to/from a full-width row. Focus lands on the single full-width cell. | Navigation Mode |
| Tab | If the full-width row contains focusable content (buttons, links), Tab moves focus into that content (per [FD-03](../01-foundations/03-editability-model.md) two-level focus model). | Navigation Mode, focus on full-width cell |
| Escape | Return focus from inside full-width content to the full-width cell itself | Within full-width content |
| Arrow Left / Arrow Right | No effect on a full-width row (single cell spans all columns) | Navigation Mode, focus on full-width cell |

**Accessibility**
- **ARIA**: The full-width row MUST have `role="row"`. The spanning cell MUST have `role="gridcell"`. The cell SHOULD carry `aria-colspan` equal to the total number of columns to indicate spanning. If the content is purely presentational (e.g., a divider), the cell MAY carry `role="presentation"` and the row MAY carry `aria-hidden="true"` (only if the row provides no meaningful information).
- **Screen Reader**: When focus enters a full-width row, the screen reader MUST announce the cell content. SR: "[Full-width cell content]". The screen reader SHOULD indicate the spanning nature: SR: "Column 1 through [N]" (via `aria-colspan`).
- **WCAG**: 1.3.1 (the spanning structure is programmatically determinable via `aria-colspan`), 2.1.1 (full-width rows are keyboard-navigable), 4.1.2 (cell content is exposed to assistive technology).
- **Visual**: Full-width rows SHOULD be visually distinct from data rows (e.g., different background, centered text, or decorative borders). The distinction MUST NOT rely on color alone.

**Chameleon 6 Status**: Partial. Chameleon 6 supported full-width content via "legend" rows in rowsets. Chameleon 7 formalizes full-width rows as a first-class row type with dedicated rendering and accessibility semantics.

**Interactions**
- F-02 (Sorting): full-width rows are excluded from sorting.
- F-03 (Filtering): full-width rows are excluded from filtering.
- F-04 (Grouping): group header rows are a specific type of full-width row.
- F-07 (Cell Editing): full-width rows are not editable.
- F-08 (Selection): full-width rows are not selectable by default.
- F-10.3 (Master-Detail): detail panels are a specific type of full-width row.
- F-10.5 (Summary/Footer Rows): footer rows use the full-width pattern when they span all columns.
- F-11 (Virtualization): full-width rows participate in virtualization and MUST be measured for their actual height.
- F-14 (Keyboard Navigation): arrow keys include full-width rows in the navigation sequence.

---

## 10.5 Summary / Footer Rows [P0]

**Description**: One or more rows at the bottom of the grid (or at the bottom of each group) that display aggregated values for each column -- sums, averages, counts, min/max, or custom aggregations. Footer rows provide at-a-glance summary information without requiring the user to scroll to a separate section. They are structural rows tied to the column layout, meaning each footer cell aligns with its corresponding column and displays an aggregated value computed from the data rows in that column.

**Applies to**: All variants

**Use Cases**
- UC-1: A financial grid displays a footer row with the sum of the "Amount" column, the average of the "Rate" column, and the count of all rows in a "Row Count" cell.
- UC-2: A Data Grid with grouping (F-04) shows a footer row at the bottom of each group with group-level subtotals, plus a global footer with overall totals.
- UC-3: A Pivot Table displays a "Grand Total" row at the bottom with aggregated values across all pivot dimensions.
- UC-4: A project manager's grid shows a footer row with the earliest start date and latest end date across all tasks.

**Conditions of Use**
- Summary/footer rows MUST be enabled via a configuration property (e.g., `showFooterRow: true` or `footerRows: FooterRowDefinition[]`).
- Each footer cell MUST be configured with an aggregation function (e.g., `aggregation: "sum" | "average" | "count" | "min" | "max" | CustomAggregationFn`) or a custom renderer.
- Footer rows MUST be recalculated automatically when the underlying data changes (row add, remove, edit, filter, group).
- The developer MUST be able to configure multiple footer rows (e.g., one for sums, one for averages).

**Behavioral Requirements**
- BR-1: Footer rows MUST render at the bottom of the grid, below all data rows (and below all group footers, if grouping is active).
- BR-2: Footer row cells MUST align with their corresponding data column cells. Each footer cell occupies the same column track as the data column it summarizes. This is enforced by the CSS subgrid layout.
- BR-3: Footer rows MUST be sticky-positioned at the bottom of the grid viewport so they remain visible during vertical scrolling. They MUST NOT scroll out of view.
- BR-4: Footer rows MUST recalculate when data changes: row additions, deletions, edits to cell values, and filter changes MUST trigger recalculation of all aggregated footer values.
- BR-5: Footer rows MUST respect active filters. When a filter hides rows, footer aggregations MUST reflect only the visible (filtered) rows, not the full data set. An optional configuration `footerAggregationScope: "visible" | "all"` MAY allow developers to choose.
- BR-6: Footer rows MUST NOT be sortable, filterable, or reorderable. They are structural elements, not data rows.
- BR-7: The grid MUST emit a `footerRecalculated` event after footer values are updated, containing the new aggregated values.
- BR-8: Footer cells for columns without a configured aggregation MUST render empty or display a custom label (e.g., "Total" in the first column).
- BR-9: Multiple footer rows MUST be supported. Each footer row definition specifies its own aggregation functions per column. Footer rows render in the order they are defined.
- BR-10: Footer rows MUST be wrapped in a dedicated `role="rowgroup"` element, separate from the data rows' `role="rowgroup"`, to semantically distinguish summary rows from data rows.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Footer rows aggregate across all visible leaf nodes (not parent nodes, to avoid double-counting). Parent-level aggregation is handled by the tree's own aggregation mechanism (F-06). |
| Pivot Table | The "Grand Total" row is a standard footer row in Pivot Table terminology. It aggregates across all dimension intersections. The Pivot Table MAY display footer rows at the end of each dimension group as well (sub-totals). |
| Gantt Chart | Footer rows appear in the task list region only. The timeline region MUST insert a corresponding blank space to maintain vertical alignment, or the footer row MAY span both regions to display summary timeline information (e.g., overall project duration bar). |

**CSS Subgrid Implications**

Footer rows are critical consumers of CSS subgrid because their cells MUST align with data column cells:

```css
.footer-rowgroup {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
  position: sticky;
  bottom: 0;
  z-index: var(--ch-footer-row-z-index, 3);
}
.footer-row {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
}
.footer-cell {
  /* Inherits column track from subgrid -- automatically aligned with data cells */
}
```

This subgrid inheritance ensures that column resizing, reordering, and hiding automatically propagate to footer cells without additional JavaScript. Footer rows share the exact same `grid-template-columns` as the header and data rows via the subgrid mechanism.

When frozen columns (F-09) are active, footer cells in frozen columns MUST also use `position: sticky` with the appropriate `left` offset, layering over the non-frozen footer cells during horizontal scroll.

**Editability Interaction**
- Footer rows MUST NOT be editable. They display computed aggregations, not raw data. If the user navigates to a footer cell and presses F2, the grid MUST NOT enter Edit Mode.
- Editing a data cell value (F-07) that contributes to a footer aggregation MUST trigger recalculation of the affected footer cell.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Ctrl + End | Move focus to the last cell of the last footer row (if footer rows exist) | Navigation Mode |
| Arrow Down | From the last data row, move focus to the first footer row | Navigation Mode |
| Arrow Up | From the first footer row, move focus to the last data row | Navigation Mode |
| Arrow Left / Arrow Right | Navigate between footer cells within the footer row (same as data row cell navigation) | Navigation Mode |

**Accessibility**
- **ARIA**: Footer rows MUST be contained in a `role="rowgroup"` element. The rowgroup SHOULD carry `aria-label="Summary"` or `aria-label="Footer"` to distinguish it from the data rowgroup and header rowgroup. Each footer row has `role="row"`. Each footer cell has `role="gridcell"`. Footer cells SHOULD carry `aria-describedby` referencing the column header to associate the aggregated value with its column.
- **Screen Reader**: When focus enters a footer cell, the screen reader MUST announce: SR: "[Column Name], [Aggregation Type]: [Value]" (e.g., "Amount, Sum: $45,230"). The aggregation type SHOULD be included in the cell's accessible name or description. When the user enters the footer rowgroup, SR: "Summary section" SHOULD be announced.
- **WCAG**: 1.3.1 (footer structure is programmatically determinable via `rowgroup` with label), 1.3.2 (footer rows are at the bottom, matching visual order), 2.1.1 (footer rows are keyboard-navigable), 4.1.2 (footer cells have accessible names associating them with their columns).
- **Visual**: Footer rows MUST be visually distinct from data rows (e.g., bold text, different background color, top border separator). The visual distinction MUST meet WCAG 1.4.11 (3:1 contrast for borders/separators). Footer rows SHOULD visually match the header row styling to create a "bookend" effect.

**Chameleon 6 Status**: Partial. Chameleon 6 supported "footer" rows via the rowset model but lacked automatic aggregation recalculation, multiple footer rows, and proper ARIA semantics. Chameleon 7 introduces a declarative footer row model with automatic aggregation, sticky positioning, and full accessibility.

**Interactions**
- F-02 (Sorting): sorting does not affect footer rows. Footer rows always remain at the bottom.
- F-03 (Filtering): footer aggregations recalculate based on the visible (filtered) row set.
- F-04 (Grouping): group footer rows (F-04.5) are separate from global footer rows. Both can coexist. Group footers show group-level aggregations; global footers show overall aggregations.
- F-07 (Cell Editing): editing a data cell triggers footer recalculation. Footer cells themselves are not editable.
- F-08 (Selection): footer rows are NOT selectable.
- F-09 (Column Management): column resize, reorder, hide, and freeze propagate to footer cells via subgrid.
- F-10.2 (Row Pinning): footer rows are inherently pinned to the bottom. They behave like permanently pinned-bottom rows.
- F-10.4 (Full-Width Rows): footer rows are column-aligned, not full-width (unlike group headers or detail panels).
- F-11 (Virtualization): footer rows are always rendered (not virtualized) because they are sticky.
- F-14 (Keyboard Navigation): Arrow Down from the last data row reaches the footer row.

---

## 10.6 Row Animation [P2]

**Description**: Animated visual transitions applied to rows during add, remove, reorder, expand, and collapse operations. Animations provide spatial continuity, helping users understand where rows came from or went to. Implementations use CSS transitions, CSS animations, or the View Transitions API for smooth, hardware-accelerated effects. All animations MUST respect the user's motion preferences.

**Applies to**: All variants

**Use Cases**
- UC-1: When a new row is added to the grid, it fades in or slides down from the insertion point, drawing attention to the change.
- UC-2: When a row is deleted, it fades out or slides away, giving the user visual confirmation that the row was removed.
- UC-3: When a row is reordered via drag-and-drop (F-10.1), surrounding rows animate to make room for the moved row, providing spatial feedback.
- UC-4: When a group (F-04) or tree node (F-06) is expanded or collapsed, child rows slide in or out to convey the hierarchical relationship.

**Conditions of Use**
- Row animation MUST be disabled by default and enabled via a configuration property (e.g., `rowAnimation: boolean | RowAnimationConfig`).
- The configuration SHOULD allow fine-grained control: enable/disable animations per operation type (add, remove, reorder, expand, collapse).
- Animation duration SHOULD be configurable via CSS custom properties (e.g., `--ch-row-animation-duration: 200ms`).

**Behavioral Requirements**
- BR-1: When `prefers-reduced-motion: reduce` is detected, the grid MUST disable all row animations regardless of the configuration. Rows MUST appear/disappear/move instantly.
- BR-2: Row add animation: newly added rows MUST animate from their initial state (e.g., `opacity: 0; transform: translateY(-10px)`) to their final state (e.g., `opacity: 1; transform: translateY(0)`).
- BR-3: Row remove animation: rows being removed MUST animate to their exit state (e.g., `opacity: 0; height: 0`) before being removed from the DOM. The row MUST be removed from the DOM only after the animation completes.
- BR-4: Row reorder animation: when a row is moved, surrounding rows MUST animate their position change smoothly. The View Transitions API or FLIP (First, Last, Invert, Play) technique SHOULD be used for reorder animations.
- BR-5: Expand/collapse animation: child rows MUST animate their height from 0 to auto (or vice versa) when a group or tree node is expanded or collapsed. A slide-down / slide-up effect provides the best spatial metaphor.
- BR-6: Animations MUST NOT block user interaction. The grid MUST remain responsive during animations. Keyboard navigation and clicks MUST work even while animations are in progress.
- BR-7: If an animation would delay meaningful interaction (e.g., a long animation prevents the user from interacting with newly added rows), the animated element MUST carry `aria-busy="true"` for the duration of the animation and clear it when the animation completes.
- BR-8: Animation durations MUST be short (100-300ms) to avoid sluggish UX. The default SHOULD be 200ms.
- BR-9: Animations MUST NOT cause layout shifts that move interactive elements. CLS (Cumulative Layout Shift) SHOULD be minimized by reserving space before animation starts.
- BR-10: When multiple rows are added, removed, or reordered simultaneously (e.g., batch operations), the grid MUST batch-animate them as a group rather than sequentially to avoid cascading animation delays.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Expand/collapse animations apply to tree node children. Deeply nested animations SHOULD cascade slightly (children animate after parent) for visual hierarchy. |
| Pivot Table | Row animation is uncommon in Pivot Tables. If supported, it applies when pivot dimensions change and rows are recalculated. The animation SHOULD be subtle (fade only, no slide) to avoid disorienting the user during a structural change. |
| Gantt Chart | Row animations in the task list MUST synchronize with the timeline region. If a task row slides into position, the corresponding timeline bar MUST animate in sync. |

**CSS Subgrid Implications**

Row animations interact with CSS subgrid because row height changes affect the overall grid layout:

```css
.row-entering {
  animation: row-enter var(--ch-row-animation-duration, 200ms) ease-out;
}
.row-exiting {
  animation: row-exit var(--ch-row-animation-duration, 200ms) ease-in forwards;
}

@keyframes row-enter {
  from { opacity: 0; max-height: 0; }
  to   { opacity: 1; max-height: var(--ch-row-height); }
}
@keyframes row-exit {
  from { opacity: 1; max-height: var(--ch-row-height); }
  to   { opacity: 0; max-height: 0; }
}
```

Animating `max-height` or `grid-template-rows` on individual rows within a subgrid may cause reflow. For smooth performance, consider animating `transform` and `opacity` only (composite-only properties) and using the View Transitions API for layout-affecting changes.

**Editability Interaction**
- Animations MUST NOT interfere with Edit Mode. If a cell is in Edit Mode and an animation occurs on its row (e.g., neighboring row removed), the editor MUST remain stable and functional.
- If a row in Edit Mode is the target of a remove animation (e.g., the row is deleted), the edit MUST be cancelled first, then the removal animation begins.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| (none specific) | Animations are visual-only and do not introduce new keyboard interactions | -- |

Row animations do not define new key bindings. They enhance the visual presentation of operations triggered by other features.

**Accessibility**
- **ARIA**: `aria-busy="true"` MUST be applied to the grid element (or the specific row being animated) when an animation delays user interaction. It MUST be removed when the animation completes and the content is ready for interaction.
- **Screen Reader**: Animations MUST NOT generate screen reader announcements. The underlying operation (add, remove, reorder) already generates its own announcements via its respective feature's live region.
- **WCAG**: 2.3.3 (Animation from Interactions, AAA) -- animations MUST be disableable via the configuration property. The grid MUST honor `prefers-reduced-motion: reduce` as a system-level disable. 2.2.1 (Timing Adjustable) -- animation durations SHOULD be configurable.
- **Visual**: Animations SHOULD use easing functions (ease-out for enter, ease-in for exit) for natural motion. Abrupt start/stop (linear timing) SHOULD be avoided.

**Chameleon 6 Status**: Not implemented. Chameleon 6 did not support row animations. Chameleon 7 introduces this as a P2 feature.

**Interactions**
- F-04 (Grouping): group expand/collapse animations.
- F-06 (Tree/Hierarchical): tree node expand/collapse animations.
- F-10.1 (Row Reorder): reorder animations.
- F-10.3 (Master-Detail): detail panel expand/collapse animations.
- F-11 (Virtualization): animated rows entering/leaving the virtualization window MUST coordinate with the animation lifecycle -- a row SHOULD NOT be recycled while its exit animation is playing.
- F-15 (Theming & Styling): animation duration and easing are configurable via CSS custom properties.

---

## 10.7 Hover Action Buttons [P1]

**Description**: A set of contextual action buttons (edit, delete, duplicate, more, etc.) that appear on a row when the user hovers over it with a mouse. These buttons provide quick access to common row-level actions without requiring a context menu or selection-then-action workflow. When the available horizontal space cannot accommodate all action buttons, excess buttons overflow into an action menu (dropdown). The buttons MUST be keyboard-accessible: users who cannot hover MUST be able to reach the action buttons via keyboard navigation.

**Applies to**: All variants

**Use Cases**
- UC-1: A user hovers over a contact row and clicks the "Edit" button that appears to quickly open the contact for inline editing.
- UC-2: A user hovers over a task row in a Gantt Chart and clicks "Delete" to remove the task, with a confirmation dialog appearing.
- UC-3: A user hovers over a row and clicks "More" (an overflow menu trigger) to see additional actions: duplicate, archive, move to folder.
- UC-4: A keyboard user navigates to a row, presses Tab to enter the action cell, and activates the "Edit" button with Enter.

**Conditions of Use**
- Hover action buttons MUST be enabled via a configuration property (e.g., `rowActions: RowActionDefinition[]` or `showRowActions: true`).
- Each action MUST be defined with at minimum: an identifier, an icon or label, and a callback function.
- Actions SHOULD be configurable per row (e.g., a conditional function that determines which actions are available for each row based on its data).
- The action buttons MUST be rendered in a dedicated action column -- typically the last column (rightmost in LTR, leftmost in RTL) -- or as an overlay anchored to the row.

**Behavioral Requirements**
- BR-1: When the user hovers over a row with the mouse, the action buttons MUST become visible on that row. When the mouse leaves the row, the action buttons MUST hide (unless one of the buttons has focus or an action menu is open).
- BR-2: The action buttons MUST remain visible if any action button within the row has keyboard focus, regardless of mouse hover state. This ensures keyboard users can interact with the buttons.
- BR-3: The action buttons MUST remain visible if an action menu (overflow) triggered from that row is open, even if the mouse moves away from the row.
- BR-4: When there are more action buttons than the available column width can accommodate, the excess buttons MUST overflow into an action group or action menu (dropdown). The overflow trigger MUST be a visible "More" button (typically an ellipsis icon).
- BR-5: Each action button MUST emit a row-level event when activated (e.g., `rowActionClicked`), containing the action identifier and the row ID.
- BR-6: Actions MUST be conditionally showable or hidable per row. The developer provides a callback `isActionVisible(action, rowData): boolean` that the grid evaluates per row to determine which actions to display.
- BR-7: Actions MUST support a disabled state per row. A disabled action button MUST be visible but non-interactive, with `aria-disabled="true"`.
- BR-8: The action buttons MUST NOT prevent the user from interacting with the row's data cells. Hovering over the row shows the buttons, but clicking a data cell MUST still trigger the cell's normal behavior (selection, edit mode entry, etc.).
- BR-9: On touch devices where hover is not available, the action buttons MUST be accessible via an alternative mechanism: a persistent "More" button in the action column, a long-press gesture, or a context menu (F-16).
- BR-10: The grid MUST support a configurable action button position: `"overlay"` (floating over the last cells, potentially obscuring data) or `"column"` (rendered in a dedicated action column that is always allocated in the grid layout).

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Hover actions apply to all tree nodes (parent and leaf). The action set MAY differ between parent and leaf rows (e.g., parents may have "Add Child" action, leaves may not). |
| Pivot Table | Hover actions are uncommon in Pivot Tables. If supported, they apply to data rows (not dimension header rows). Actions might include "Drill Down" or "View Detail". |
| Gantt Chart | Hover actions on a task row in the task list MUST also apply to the corresponding timeline bar. Hovering over the timeline bar SHOULD show the same action buttons (or a subset) as the task list row. |

**CSS Subgrid Implications**

When using the `"column"` position mode, the action column is a regular column track in `grid-template-columns`:

```css
/* Action column as the last track */
.grid-container {
  grid-template-columns: /* ... data columns ... */ var(--ch-action-column-width, 120px);
}
```

When using the `"overlay"` position mode, the action buttons are absolutely positioned relative to the row element:

```css
.row {
  position: relative;
}
.row-actions-overlay {
  position: absolute;
  right: 0;  /* Anchored to the trailing edge */
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  background: linear-gradient(to right, transparent, var(--ch-row-bg) 20%);
  /* Gradient fade-in effect to avoid abruptly covering cell content */
}
```

In overlay mode, the action buttons cover the trailing data cells. The gradient background provides visual context that content is beneath the overlay. Frozen columns (F-09) MUST have a higher z-index than the action overlay to prevent the overlay from covering frozen cells.

**Editability Interaction**
- When a cell in the row is in Edit Mode (F-07), hover action buttons MUST still be visible on hover but MUST NOT interfere with the editor. Clicking an action button while editing SHOULD first commit (or cancel, configurable) the active edit, then execute the action.
- The "Edit" action button (if present) SHOULD enter Edit Mode on the first editable cell in the row, equivalent to double-clicking that cell.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Tab | From the last data cell in the row (in Edit Mode or when focus is within a cell), Tab moves focus to the first action button in the action column/overlay | Navigation Mode with two-level focus (per [FD-03](../01-foundations/03-editability-model.md)) |
| Shift + Tab | From the first action button, Shift+Tab moves focus back to the last focusable element in the preceding data cell | Within action buttons |
| Arrow Right / Arrow Left | Navigate between action buttons within the action column/overlay | Focus on action buttons |
| Enter / Space | Activate the focused action button | Focus on action button |
| Escape | Close an open action menu (overflow dropdown) and return focus to the action menu trigger button | Action menu open |

**Accessibility**
- **ARIA**: Each action button MUST have `role="button"` with an `aria-label` describing the action (e.g., `aria-label="Edit row [identifier]"`, `aria-label="Delete row [identifier]"`). The action column cell (or overlay container) SHOULD have `role="gridcell"`. The overflow menu trigger MUST have `aria-haspopup="menu"` and `aria-expanded="true"` / `"false"`. Disabled actions MUST have `aria-disabled="true"`.
- **Screen Reader**: When a keyboard user navigates to the action column cell, the screen reader MUST announce: SR: "Actions, [N] available" (or the first action button label). When focus moves to an individual action button: SR: "[Action Label] button" (e.g., "Edit row 42 button"). For the overflow menu: SR: "More actions, menu button".
- **WCAG**: 2.1.1 (Keyboard) -- all action buttons MUST be keyboard-reachable and activatable. 2.5.8 (Target Size) -- action buttons MUST have a minimum target size of 24x24 CSS pixels. 1.4.13 (Content on Hover or Focus) -- the action buttons shown on hover MUST remain visible while hovered or focused, MUST be dismissible (by moving the mouse away or pressing Escape), and MUST NOT obscure content that the user needs to read. The user MUST be able to move the pointer from the row to the action buttons without the buttons disappearing (no "gap" in the hover target).
- **Visual**: Action buttons MUST use recognizable icons with optional text labels. Icons MUST have sufficient contrast (3:1 per WCAG 1.4.11). The hover reveal effect MUST be smooth (not flickering). The action overlay gradient (if using overlay mode) MUST clearly indicate that buttons are overlaying content.

**Chameleon 6 Status**: Existed. `richRowActions` property enabled action buttons on rows. `actions-icon` CSS part allowed styling the action icons. Chameleon 7 enhances the feature with overflow into action menus, keyboard accessibility via Tab navigation, conditional actions, disabled states, and WCAG 1.4.13 compliance for hover-revealed content.

**Interactions**
- F-07 (Cell Editing): "Edit" action button triggers edit mode. Action buttons coexist with active cell editing.
- F-08 (Selection): clicking an action button MUST NOT change row selection state (the action is on the row, but it is not a selection gesture).
- F-08.11 (Highlight on Hover): hover action buttons and hover highlight both activate on the same hover trigger. They coexist visually.
- F-09 (Column Management): the action column (in `"column"` mode) is NOT resizable, reorderable, or hideable. It is a structural column like the checkbox column.
- F-10.2 (Row Pinning): pinned rows display action buttons on hover, same as unpinned rows.
- F-14 (Keyboard Navigation): Tab enters the action cell from the last data cell in the row; Arrow keys navigate between action buttons.
- F-15 (Theming & Styling): action button icons and the overlay gradient are styled via CSS custom properties and CSS parts.
- F-16 (Context Menus): the overflow action menu MAY reuse the context menu infrastructure. Actions available on hover SHOULD also be available in the row context menu for discoverability.
