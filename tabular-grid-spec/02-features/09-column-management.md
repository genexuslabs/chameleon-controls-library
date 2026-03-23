# F-09: Column Management

Column management encompasses the features that let users and developers control column dimensions, positions, visibility, and structure at runtime. This feature category covers column resizing (with multiple resize modes), drag reordering, pinning/freezing, hiding, auto-sizing, column menus, sizing modes, dynamic column mutations, custom header rendering, column-level styling, and collapsible column groups.

All four variants (Data Grid, Tree Grid, Pivot Table, Gantt Chart) support column management with variant-specific adaptations for multi-axis headers, dual-region layouts, dimension columns, and timeline tracks.

> **Foundations**: This feature builds directly on the CSS subgrid layout model defined in [FD-01](../01-foundations/01-layout-model.md). Every column management operation ultimately mutates `grid-template-columns` on the host element or toggles CSS properties on column tracks. The host element is the sole owner of column track definitions (FD-01, 1.2.3). Frozen columns use `position: sticky` within the subgrid (FD-01, 1.6). The accessibility foundation in [FD-04](../01-foundations/04-accessibility-foundation.md) defines the baseline ARIA structure for `role="columnheader"` elements, `aria-colindex`, and `aria-colcount`.

> **Key layout principle**: All column management operations MUST be expressed as CSS mutations (updating `grid-template-columns`, setting custom properties, toggling classes). JavaScript orchestrates but MUST NOT become the layout engine (FD-01, Principle 4).

> **DOM order requirement**: The logical order of columns in the DOM MUST match the visual order at all times (per WCAG 1.3.2 Meaningful Sequence). Operations that change visual order (reorder, pin) MUST physically reorder DOM elements, not use CSS `order` or `direction` tricks.

---

## 9.1 Column Resize (Drag Header Border) [P0]

**Description**: The user drags the right edge (in LTR) or left edge (in RTL) of a column header to increase or decrease the column's width. The resize handle is an interactive zone at the border between adjacent column headers. Dragging updates the corresponding track in `grid-template-columns` on the host element in real time, and the subgrid ensures all cells in that column reflect the new width immediately without per-cell measurement. As a brainstorming consideration, resizing MAY also be initiable from cell borders in the body region (not just headers), enabling users to resize columns from wherever they are working.

**Applies to**: All variants

**Use Cases**
- UC-1: A user widens the "Description" column in a Data Grid to read truncated text, dragging the right edge of the header from 200px to 400px.
- UC-2: A user narrows a "Status" column in a Tree Grid to reclaim horizontal space for other columns.
- UC-3: A project manager resizes the "Task Name" column in a Gantt Chart task list to see full task titles without horizontally scrolling.
- UC-4: A user resizes a value column in a Pivot Table to accommodate wider formatted numbers.

**Conditions of Use**
- Column resizing MUST be enabled by default. Each column definition MAY include a `resizable: boolean` property (default `true`) to disable resizing on a per-column basis.
- The grid MUST expose a minimum width per column (`minWidth`, default a reasonable minimum such as `40px`) and an optional maximum width (`maxWidth`). The resize operation MUST NOT shrink a column below its `minWidth` or expand it beyond its `maxWidth`.
- The checkbox/selector column (F-08.3) MUST NOT be resizable.

**Behavioral Requirements**
- BR-1: The grid MUST render a resize handle zone at the trailing edge of each resizable column header. The handle zone MUST be at least 8px wide to provide an adequate drag target.
- BR-2: When the user hovers over the resize handle, the cursor MUST change to `col-resize` to signal the affordance.
- BR-3: When the user initiates a drag on the resize handle, the grid MUST update the corresponding track in `grid-template-columns` on the host element in real time as the pointer moves. All cells in the column MUST reflow via subgrid inheritance without JavaScript measuring individual cells.
- BR-4: The grid MUST enforce `minWidth` and `maxWidth` constraints during the drag. If the pointer moves beyond the constraint, the column width MUST clamp at the limit.
- BR-5: The grid MUST emit a `columnSizeChanging` event continuously during the drag, containing the `columnId` and the current width value. This event MUST be cancellable; if cancelled, the resize MUST NOT be applied for that frame.
- BR-6: When the user releases the pointer (mouseup/pointerup), the grid MUST emit a `columnSizeChanged` event containing the `columnId`, the previous width, and the new width.
- BR-7: Double-clicking the resize handle MUST auto-size the column to fit its content (see F-09.7 for auto-size behavior).
- BR-8: If the resize handle is activated from a cell border in the body region (brainstorming consideration), the same behavioral requirements apply -- the resize target is determined by the column whose trailing edge the pointer is over.
- BR-9: During a resize drag, the grid SHOULD display a visual guide (e.g., a vertical line or highlight) indicating the current drag position.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Pivot Table | Value columns generated by the pivot engine MUST be resizable. Resizing one generated column SHOULD optionally resize all sibling columns of the same measure (configurable: `uniformPivotColumnWidth`). Dimension header columns (row headers) are independently resizable. |
| Gantt Chart | Column resize applies only to the task list region. The timeline region's column widths are controlled by the zoom level (see variant-specific spec), not by user drag. The splitter between the task list and timeline regions is a separate resize control (F-10). |
| Tree Grid | The indentation space in the tree column MUST be accounted for in minimum width calculations. The tree column's `minWidth` SHOULD accommodate the deepest visible indentation level plus the caret control plus meaningful content width. |

**CSS Subgrid Implications**

The resize operation modifies a single track value in the host's `grid-template-columns` string. For example, resizing the 3rd column from `150px` to `250px` changes:

```css
/* Before */
grid-template-columns: 40px 1fr 150px 200px;
/* After */
grid-template-columns: 40px 1fr 250px 200px;
```

JavaScript MUST update `grid-template-columns` (or the CSS custom property feeding it) directly on the host element. It MUST NOT set width on individual cells. The subgrid inheritance ensures all rows reflow automatically. During the drag, the update frequency SHOULD be throttled to animation frame rate (via `requestAnimationFrame`) to avoid layout thrashing.

**Keyboard Interaction**

A non-drag alternative is required per WCAG 2.5.7 (Dragging Movements). The column menu (F-09.9) MUST provide a "Resize Column" option that opens a size input or a resize dialog.

| Key | Action | Mode |
|-----|--------|------|
| Enter (on column menu "Resize" option) | Opens a dialog/input for entering a numeric width | Navigation Mode |

**Accessibility**
- **ARIA**: The resize handle does not require a separate ARIA role, as it is a pointer interaction affordance. The column header (`role="columnheader"`) MUST NOT change its role during resize. After resize, `aria-colindex` values remain unchanged (column identity is not affected by width changes).
- **Screen Reader**: When the user resizes a column via the column menu keyboard alternative, a live region SHOULD announce: SR: "[Column Name] resized to [width] pixels". No announcement is needed during pointer drag (it is a visual-only interaction).
- **WCAG**: 2.5.7 (Dragging Movements -- the column menu provides a non-drag alternative for resizing), 1.4.4 (Resize Text -- column resize does not affect text size, only container width; text MUST reflow within the new width).
- **Visual**: The resize handle zone MUST be visually discoverable on hover (cursor change is mandatory; an optional visible border highlight on hover improves discoverability). The visual guide during drag MUST have sufficient contrast (3:1 per WCAG 1.4.11).

**Chameleon 6 Status**: Existed. Events: `columnSizeChanging`, `columnSizeChanged`. Per-column `resizable` property. Chameleon 7 carries forward with CSS subgrid integration (no per-cell width setting) and WCAG 2.5.7 non-drag alternative via column menu.

**Interactions**
- F-09.2 (Resize Modes): determines how adjacent columns respond to the resize.
- F-09.7 (Auto-Size Columns): double-click resize handle triggers auto-size.
- F-09.9 (Column Menu): provides keyboard-accessible resize alternative.
- F-09.11 (Column Sizing Modes): the sizing mode of the column determines how the resize value is interpreted (px, %, fr).
- F-09.4 (Column Pinning): frozen columns are resizable; sticky positioning is maintained.
- F-14 (Keyboard Navigation): resize does not affect keyboard navigation order.

---

## 9.2 Resize Modes [P0]

**Description**: Resize modes control how the grid redistributes space among columns when a single column is resized. Three modes define the behavior: "shift" mode (the adjacent column absorbs the change), "flex" mode (all remaining columns proportionally adjust), and "none" mode (only the dragged column changes width, potentially causing horizontal scroll). The resize mode applies globally to the grid and affects the `grid-template-columns` update strategy.

**Applies to**: All variants

**Use Cases**
- UC-1: In "shift" mode, a user widens the "Name" column by 50px, and the adjacent "Email" column narrows by 50px, keeping the total grid width constant.
- UC-2: In "flex" mode, a user widens the "Name" column by 50px, and all other flex-sized columns shrink proportionally to absorb the 50px, keeping the total grid width constant.
- UC-3: In "none" mode, a user widens the "Name" column by 50px, the total grid content width increases by 50px, and a horizontal scrollbar appears (or grows).

**Conditions of Use**
- The grid MUST expose a `columnResizeMode` property with values `"shift"`, `"flex"`, or `"none"`. Default: `"none"`.
- Resize modes apply only when the user is actively resizing a column (F-09.1). Programmatic width changes (F-09.8) MUST default to "none" behavior unless explicitly specified.
- Resize modes MUST NOT apply to the auto-size operation (F-09.7), which always sets an absolute width.

**Behavioral Requirements**
- BR-1: **"none" mode**: When the user resizes a column, the grid MUST update only the dragged column's track in `grid-template-columns`. All other column tracks remain unchanged. The total width of all columns MAY exceed the grid viewport, causing horizontal scrolling.
- BR-2: **"shift" mode**: When the user resizes a column, the grid MUST adjust the immediately adjacent column (the column to the right of the resize handle in LTR, or to the left in RTL) by the inverse delta. If the dragged column grows by 50px, the adjacent column MUST shrink by 50px, and vice versa. The total grid width MUST remain constant.
- BR-3: In "shift" mode, if the adjacent column would shrink below its `minWidth`, the resize MUST be capped such that the adjacent column stays at `minWidth`. The dragged column's growth MUST stop correspondingly.
- BR-4: **"flex" mode**: When the user resizes a column, the grid MUST redistribute the delta across all other non-fixed columns proportionally to their current widths. If the dragged column grows by 60px and there are 3 other flex columns with widths 100px, 200px, 300px, they shrink by 10px, 20px, 30px respectively (proportional to 1:2:3).
- BR-5: In "flex" mode, if any column would shrink below its `minWidth` during redistribution, that column MUST be clamped at `minWidth` and the remaining delta redistributed among the other eligible columns.
- BR-6: In "shift" mode, if the dragged column is the last column (no adjacent column to the right), the behavior MUST fall back to "none" mode for that resize operation.
- BR-7: The `columnSizeChanging` and `columnSizeChanged` events (F-09.1) MUST include width changes for all affected columns, not just the dragged column. The event payload MUST contain an array of `{ columnId, previousWidth, newWidth }` entries.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Gantt Chart | Resize modes apply only to the task list region columns. The timeline region does not participate in resize mode redistribution. |
| Pivot Table | In "flex" mode, auto-generated pivot value columns participate in the redistribution. If `uniformPivotColumnWidth` is enabled (F-09.1), all pivot value columns resize together. |

**CSS Subgrid Implications**

Each resize mode produces a different `grid-template-columns` mutation:

- **"none"**: One track changes; total column width may exceed viewport.
- **"shift"**: Two tracks change (dragged + adjacent); total width is preserved.
- **"flex"**: Multiple tracks change; total width is preserved.

In all modes, the host's `grid-template-columns` is the single source of truth. JavaScript computes the new track values and applies them in one DOM write per animation frame.

**Keyboard Interaction**

Resize modes are a configuration property and do not directly have keyboard interaction. The active resize mode affects the result of any resize operation triggered by the column menu (F-09.9) keyboard alternative.

**Accessibility**
- **ARIA**: No additional ARIA attributes are required for resize modes. The mode is a behavioral configuration, not a state exposed to assistive technology.
- **Screen Reader**: When resizing via the keyboard alternative (column menu), the live region announcement SHOULD include all columns whose widths changed: SR: "[Column A] resized to [width]px, [Column B] resized to [width]px".
- **WCAG**: No specific WCAG criterion beyond those covered by F-09.1.
- **Visual**: In "shift" mode, both the dragged column and the adjacent column SHOULD display resize guides during the drag to show the dual adjustment. In "flex" mode, a subtle visual indicator on all affected column headers MAY signal the proportional redistribution.

**Chameleon 6 Status**: Existed. `columnResizeMode: "single" | "splitter"` where "single" maps to "none" and "splitter" maps to "shift". Chameleon 7 adds "flex" mode and multi-column event payloads.

**Interactions**
- F-09.1 (Column Resize): resize modes modify the behavior of the resize drag.
- F-09.11 (Column Sizing Modes): resize mode interacts with the column's sizing mode (e.g., resizing a `fr`-based column in "none" mode converts it to a fixed `px` value).
- F-09.4 (Column Pinning): frozen columns participate in resize modes normally; sticky positioning is unaffected.

---

## 9.3 Column Reorder (Drag Headers) [P0]

**Description**: The user drags a column header to a new position in the column sequence. On drop, the grid physically reorders the column's DOM elements (header cell and all body cells in that column) so that the DOM order matches the visual order. CSS `order` property MUST NOT be used, as DOM order must match visual order for accessibility compliance (WCAG 1.3.2). The `grid-template-columns` track list is also reordered to match.

**Applies to**: All variants

**Use Cases**
- UC-1: A user drags the "Email" column header from position 4 to position 2, placing it next to the "Name" column for easier visual correlation.
- UC-2: A user reorganizes a Pivot Table's value columns to place "Revenue" before "Cost" for a presentation.
- UC-3: A Gantt Chart user drags the "Priority" column closer to the "Task Name" column in the task list for better context.

**Conditions of Use**
- Column reorder MUST be controlled by a grid-level `allowColumnReorder: boolean` property (default `true`).
- Individual columns MAY have a `reorderable: boolean` property (default `true`) to prevent specific columns from being dragged.
- The checkbox/selector column (F-08.3) MUST NOT be reorderable. Frozen columns (F-09.4) MAY be reorderable within the frozen zone but MUST NOT be dragged out of the frozen zone (and vice versa for scrollable columns).
- Multi-level column headers (F-01.7): dragging a parent group header MUST reorder the entire group (all child columns) as a unit.

**Behavioral Requirements**
- BR-1: When the user initiates a drag on a column header, the grid MUST display a visual drag preview (a semi-transparent copy of the header or a placeholder column).
- BR-2: As the drag moves over other column headers, the grid MUST display a drop indicator (e.g., a vertical line between columns or a highlighted drop zone) showing where the column will be inserted.
- BR-3: On drop, the grid MUST physically reorder the column's track in `grid-template-columns`, the column header cell in the header row DOM, and all body cells in each data row. DOM order MUST match the new visual order.
- BR-4: The grid MUST emit a `columnOrderChanged` event after the reorder completes, containing the `columnId`, the `previousIndex`, and the `newIndex`.
- BR-5: If the user drops the column at its original position (no change), no event MUST be emitted.
- BR-6: Reordering MUST update `aria-colindex` values on all affected cells to reflect the new column positions.
- BR-7: The grid MUST NOT allow dropping a column into a position that would violate structural constraints (e.g., moving a scrollable column into the frozen zone, or splitting a column group).
- BR-8: If the drag is cancelled (Escape key or dropping outside the header area), the grid MUST restore the original column order with no side effects.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | The tree column (containing expand/collapse carets and indentation) MAY be restricted from reordering to maintain clear hierarchy visualization. This restriction SHOULD be configurable. |
| Pivot Table | Dimension columns (row headers) and value columns are typically distinct groups. Reordering SHOULD be constrained within each group: dimension columns reorder among dimensions, value columns reorder among values. Cross-group reordering SHOULD be disabled by default. |
| Gantt Chart | Column reorder applies only to the task list region. Timeline bars are positionally determined by date values, not column order. |

**CSS Subgrid Implications**

Reordering a column requires three synchronized DOM mutations:
1. Move the track in `grid-template-columns` (e.g., `40px 1fr 150px 200px` becomes `40px 150px 1fr 200px` when column 3 moves before column 2).
2. Move the `<ch-tabular-grid-column>` element in the header row.
3. For each data row, move the corresponding cell element to the new position.

Because rows use `grid-template-columns: subgrid`, moving a cell within a row changes which track it occupies. The cell at DOM position N occupies track N. All three mutations MUST occur in the same DOM write batch (within a single microtask or animation frame) to avoid intermediate layout states.

**Editability Interaction**
- If a cell is in Edit Mode when a reorder is initiated, the grid MUST exit Edit Mode (commit or cancel per the editability model) before performing the reorder.

**Keyboard Interaction**

A non-drag alternative is required per WCAG 2.5.7 (Dragging Movements).

| Key | Action | Mode |
|-----|--------|------|
| Ctrl + Shift + Left Arrow | Move the focused column one position to the left | Navigation Mode, focus on columnheader |
| Ctrl + Shift + Right Arrow | Move the focused column one position to the right | Navigation Mode, focus on columnheader |

The column menu (F-09.9) SHOULD also provide "Move Left" and "Move Right" options.

**Accessibility**
- **ARIA**: After reorder, all `aria-colindex` values MUST be updated to reflect the new column positions. `aria-colcount` on the grid element remains unchanged (the number of columns has not changed). Column header cells retain their `role="columnheader"`.
- **Screen Reader**: After a keyboard reorder, a live region MUST announce: SR: "[Column Name] moved to column [N]". During drag-and-drop (pointer), no real-time announcement is required, but after drop, the announcement MUST be made.
- **WCAG**: 1.3.2 (Meaningful Sequence -- DOM order matches visual order after reorder), 2.5.7 (Dragging Movements -- keyboard alternative via Ctrl+Shift+Arrow), 2.1.1 (keyboard operability of the reorder function).
- **Visual**: The drag preview MUST be visually distinct from the in-place columns (e.g., reduced opacity, elevated shadow). The drop indicator (vertical line or highlight) MUST have sufficient contrast (3:1 per WCAG 1.4.11).

**Chameleon 6 Status**: Existed. `allowColumnReorder: boolean` property. Event: `columnOrderChanged` with column ID and new index. Chameleon 7 adds keyboard reorder alternative (Ctrl+Shift+Arrow), DOM-order enforcement per WCAG 1.3.2, and multi-level header group reordering.

**Interactions**
- F-09.4 (Column Pinning): reorder is constrained to within frozen/scrollable zones.
- F-09.5 (Column Hide/Show): hidden columns retain their logical position; reordering visible columns does not change hidden column positions.
- F-09.9 (Column Menu): provides keyboard-accessible reorder options.
- F-09.13 (Collapsible Column Groups): dragging a group header reorders the entire group.
- F-01.7 (Multi-Level Headers): reorder respects column group boundaries.
- F-08 (Selection): column reorder does not affect the selection state; selected cells move with their columns.
- F-14 (Keyboard Navigation): Ctrl+Shift+Arrow for keyboard reorder.

---

## 9.4 Column Pinning/Freezing [P0]

**Description**: Column pinning (also called freezing) fixes one or more columns to the left or right edge of the grid viewport so they remain visible during horizontal scrolling. Frozen columns use `position: sticky` within the subgrid layout rather than being placed in separate DOM containers, preserving the unified column grid. The sticky positioning ensures that frozen columns overlay scrollable columns when the user scrolls horizontally.

**Applies to**: All variants

**Use Cases**
- UC-1: A user freezes the "Name" column to the left edge so it remains visible while horizontally scrolling through 20 data columns.
- UC-2: A user freezes an "Actions" column (with edit/delete buttons) to the right edge for constant access.
- UC-3: A Gantt Chart's task list always has the "Task Name" column frozen to the left edge so users can identify tasks while scrolling through additional columns.
- UC-4: A Pivot Table's row dimension headers (leftmost columns) are frozen by default so the user can see which row they are reading as they scroll through value columns.

**Conditions of Use**
- Each column definition MUST support a `freeze` property with values `"start"` (left in LTR, right in RTL), `"end"` (right in LTR, left in RTL), or `"none"` (default).
- Multiple columns MAY be frozen to the same edge. They MUST be contiguous -- a column cannot be frozen to the left if there is an unfrozen column between it and the left edge.
- The grid MUST expose a `columnFreezeChanged` event when a column's frozen state changes at runtime.

**Behavioral Requirements**
- BR-1: Frozen columns MUST use `position: sticky` on the column header and all cells in that column. Left-frozen columns use `left: <cumulative-offset>`, right-frozen columns use `right: <cumulative-offset>`.
- BR-2: The `z-index` of frozen columns MUST be higher than scrollable columns to ensure they overlay correctly during horizontal scroll.
- BR-3: Frozen columns MUST participate in the same `grid-template-columns` as scrollable columns. They MUST NOT be placed in a separate container or grid context.
- BR-4: The border between the last left-frozen column and the first scrollable column MUST have a visual separator (e.g., a shadow or thicker border) that indicates the freeze boundary. The same applies to the right-freeze boundary.
- BR-5: `aria-colindex` values MUST be continuous across frozen and scrollable columns. Frozen columns do not get separate indexing -- they are part of the same logical column sequence.
- BR-6: Keyboard navigation (arrow keys) MUST seamlessly cross the freeze boundary. Moving right from the last frozen column MUST focus the first scrollable column; moving left from the first scrollable column MUST focus the last frozen column. No extra key press or trap at the boundary.
- BR-7: The user MUST be able to pin/unpin columns at runtime via the column menu (F-09.9), via drag-and-drop to a freeze zone (brainstorming consideration), or via the programmatic API (F-09.8).
- BR-8: When a column is pinned at runtime, the grid MUST physically reorder the DOM to place the column in the correct frozen zone position and update `grid-template-columns` and all `aria-colindex` values accordingly.
- BR-9: The grid MUST emit a `columnFreezeChanged` event when a column's freeze state changes, containing the `columnId`, the previous freeze state, and the new freeze state.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Pivot Table | Row dimension header columns SHOULD be frozen to the start by default, as they provide the row context for all value columns. The developer MAY override this default. |
| Gantt Chart | The task list region is separate from the timeline region (connected by a splitter). Freezing applies within the task list columns. The "Task Name" column is typically frozen by default. |
| Tree Grid | The tree column (with expand/collapse carets) is commonly frozen to the start so the hierarchy remains visible during horizontal scroll. |

**CSS Subgrid Implications**

Frozen columns use `position: sticky` within the unified subgrid. The cumulative offset calculation for stacking multiple left-frozen columns:

```css
/* Column 1: frozen left */
.cell[data-col="1"] { position: sticky; left: 0; z-index: 2; }
/* Column 2: frozen left */
.cell[data-col="2"] { position: sticky; left: var(--col1-width); z-index: 2; }
/* Right-frozen column */
.cell[data-col="last"] { position: sticky; right: 0; z-index: 2; }
```

CSS custom properties (`--col1-width`, etc.) MUST be maintained by JavaScript when column widths change (via resize or other operations) to keep sticky offsets in sync.

The freeze boundary shadow can be applied via a pseudo-element or `box-shadow` on the last frozen cell in each row. This shadow MUST NOT affect layout.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Arrow Left/Right | Seamless navigation across frozen/scrollable boundary | Navigation Mode |
| Column Menu shortcut | Pin/Unpin current column | Navigation Mode, focus on columnheader |

**Accessibility**
- **ARIA**: `aria-colindex` is continuous across frozen and scrollable regions. No special ARIA attributes are needed for frozen state -- the frozen/unfrozen distinction is visual, not semantic. The grid MUST NOT use `aria-hidden` on frozen columns.
- **Screen Reader**: Frozen columns appear in the same logical column sequence as unfrozen columns. Screen readers navigate them in `aria-colindex` order without distinction. No special announcement is needed for frozen state. If a column is pinned/unpinned at runtime via keyboard, a live region SHOULD announce: SR: "[Column Name] pinned to [start/end]" or SR: "[Column Name] unpinned".
- **WCAG**: 1.3.2 (Meaningful Sequence -- continuous column indexing regardless of frozen state), 2.1.1 (keyboard navigation crosses freeze boundary seamlessly), 1.4.11 (freeze boundary visual separator meets 3:1 contrast).
- **Visual**: The freeze boundary MUST be visually distinct. A shadow or border separator provides the visual cue. Frozen columns MUST NOT visually overlap scrollable column content -- the frozen column background MUST be opaque.

**Chameleon 6 Status**: Existed. `freeze: "left" | "right"` property on column definition. Event: `columnFreezeChanged`. Chameleon 7 renames to `"start"/"end"` for RTL compatibility, uses CSS sticky instead of separate containers, and ensures continuous `aria-colindex`.

**Interactions**
- F-09.1 (Column Resize): frozen columns are resizable; sticky offset custom properties update when width changes.
- F-09.3 (Column Reorder): reorder is constrained within frozen/scrollable zones.
- F-09.5 (Column Hide/Show): hiding a frozen column updates sticky offsets.
- F-09.9 (Column Menu): provides pin/unpin actions.
- F-08 (Selection): selection spans frozen and scrollable columns seamlessly.
- F-11 (Virtualization): frozen columns are always rendered (never virtualized out of view).
- F-14 (Keyboard Navigation): arrow keys cross freeze boundary without trapping.

---

## 9.5 Column Hide/Show [P0]

**Description**: Columns can be hidden from view without being removed from the grid's column definitions. A hidden column's track in `grid-template-columns` is set to `0px` (or `0fr`), making it visually invisible while preserving its logical position. Hidden columns still count in `aria-colcount` and affect `aria-colindex` calculations so that assistive technology maintains an accurate model of the full column set.

**Applies to**: All variants

**Use Cases**
- UC-1: A user hides the "Internal ID" column from a Data Grid to reduce visual clutter while keeping it available for export or programmatic access.
- UC-2: A developer conditionally hides a "Manager" column in a Tree Grid based on the user's role, showing it only to admin users.
- UC-3: A user hides several Pivot Table value columns to focus on specific measures, then restores them later via the visibility panel (F-09.6).

**Conditions of Use**
- Each column definition MUST support a `hidden: boolean` property (default `false`).
- Each column definition MAY support a `hideable: boolean` property (default `true`) to prevent certain columns from being hidden by the user (e.g., the primary identifier column).
- The grid MUST expose a `columnHiddenChanged` event when a column's visibility changes at runtime.

**Behavioral Requirements**
- BR-1: When a column is hidden, the grid MUST set its track in `grid-template-columns` to `0px`. The column's header cell and all body cells in that column MUST have `display: none` or `visibility: hidden` combined with `overflow: hidden` to ensure the content is not visible and does not receive pointer events.
- BR-2: `aria-colcount` on the grid element MUST continue to reflect the total number of logical columns, including hidden ones. For example, if 10 columns are defined and 2 are hidden, `aria-colcount` MUST be `10`.
- BR-3: `aria-colindex` on each visible cell MUST reflect the column's logical index including hidden columns. For example, if column 3 is hidden, visible columns have `aria-colindex` values 1, 2, 4, 5, ... (skipping 3).
- BR-4: Hidden columns MUST be excluded from keyboard navigation. Arrow keys skip hidden columns: pressing Right from column 2 moves focus to column 4 if column 3 is hidden.
- BR-5: The grid MUST emit a `columnHiddenChanged` event when a column's visibility changes, containing the `columnId` and the new `hidden` state.
- BR-6: Hiding a column that is currently being edited MUST exit Edit Mode (cancel) before hiding.
- BR-7: Hiding a column MUST NOT affect the data model or row data -- the column's data values remain accessible programmatically.
- BR-8: The column menu (F-09.9) and visibility panel (F-09.6) MUST provide user-facing UI to hide and show columns.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Pivot Table | Hiding a pivot value column hides that measure across all pivot column groups. The developer MAY choose to hide a specific measure within specific dimension values (a more granular hide). |
| Gantt Chart | Hiding task list columns does not affect timeline bar rendering. Columns like "Start Date" and "End Date" may be hidden from the task list but their data still drives bar positioning. |
| Tree Grid | The tree column (column with expand/collapse carets) SHOULD NOT be hideable by default, as hiding it removes the primary hierarchy navigation mechanism. |

**CSS Subgrid Implications**

Setting a column track to `0px` collapses the column visually. However, cells in that track still exist in the DOM (for data integrity and `aria-colindex` correctness). To prevent hidden cells from receiving pointer events or being tab-targetable:

```css
.cell[data-col-hidden] {
  display: none; /* Removes from accessibility tree and pointer events */
}
```

Using `display: none` means the cell does not participate in the grid layout, which in a subgrid context means the track is genuinely empty. The host's track at `0px` ensures no visible space is allocated. The combination of `0px` track + `display: none` cells is the most robust approach.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Arrow Left/Right | Skip hidden columns in navigation | Navigation Mode |
| Column Menu shortcut | Hide current column | Navigation Mode, focus on columnheader |

**Accessibility**
- **ARIA**: `aria-colcount` includes hidden columns. `aria-colindex` on visible cells accounts for hidden columns (non-sequential if columns are hidden). Hidden cells MUST NOT be focusable or navigable.
- **Screen Reader**: When a column is hidden via keyboard, a live region SHOULD announce: SR: "[Column Name] hidden". When shown, SR: "[Column Name] shown". Screen readers navigating by `aria-colindex` will detect gaps in the sequence and may announce "column [N] through [M]" to indicate the skip.
- **WCAG**: 1.3.1 (hidden column state is programmatically determinable via `aria-colcount` and non-sequential `aria-colindex`), 2.1.1 (hide/show is keyboard-accessible via column menu or visibility panel).
- **Visual**: No visual representation of hidden columns is shown in the grid. The visibility panel (F-09.6) shows hidden columns with an unchecked state.

**Chameleon 6 Status**: Existed. `hidden: boolean` and `hideable: boolean` properties on column definition. Event: `columnHiddenChanged`. Chameleon 7 carries forward with corrected `aria-colcount`/`aria-colindex` handling and CSS subgrid `0px` track approach.

**Interactions**
- F-09.6 (Column Visibility Panel): primary UI for managing hidden columns.
- F-09.4 (Column Pinning): hiding a frozen column updates sticky offsets for remaining frozen columns.
- F-09.9 (Column Menu): provides per-column "Hide" action.
- F-09.3 (Column Reorder): hidden columns maintain their logical position; reordering visible columns does not change hidden column positions.
- F-12 (Export/Import): export operations MAY include or exclude hidden columns based on configuration.
- F-08 (Selection): column selection (F-08.6) skips hidden columns.

---

## 9.6 Column Visibility Panel [P0]

**Description**: A built-in UI panel (popover or dialog) that displays all available columns with checkboxes to toggle their visibility. The panel provides a centralized interface for users to manage which columns are visible, rather than hiding columns one at a time via the column menu. The panel also supports drag-based reordering of columns (with a keyboard alternative).

**Applies to**: All variants

**Use Cases**
- UC-1: A user opens the column visibility panel and unchecks three columns to declutter the view, then re-checks one column that was previously hidden.
- UC-2: A user opens the panel, drags columns into their preferred order, and closes the panel -- all changes take effect immediately.
- UC-3: A developer provides a "Reset Columns" button in the panel that restores the default column configuration.

**Conditions of Use**
- The grid MUST provide a mechanism to open the column visibility panel. This MAY be a toolbar button, a column menu item (F-09.9), or a programmatic API.
- The panel MUST be openable via keyboard (e.g., a toolbar button with a keyboard shortcut or the column menu).
- Columns with `hideable: false` MUST appear in the panel but their checkboxes MUST be disabled (checked and non-interactive), indicating they cannot be hidden.

**Behavioral Requirements**
- BR-1: The panel MUST render as a modal dialog (`role="dialog"`) or a popover with focus management. If modal, it MUST trap focus within the panel until closed.
- BR-2: The panel MUST display one entry per column definition, showing the column's display name and a checkbox reflecting its current visibility state.
- BR-3: Toggling a checkbox MUST immediately show or hide the corresponding column in the grid (live preview). Changes MUST NOT require a "confirm" step.
- BR-4: The panel MUST support an optional "Select All" / "Deselect All" action to bulk-show or bulk-hide columns (respecting `hideable: false` constraints).
- BR-5: The panel SHOULD support drag reordering of column entries (with a keyboard alternative per WCAG 2.5.7) to let users reorganize column order simultaneously with visibility changes.
- BR-6: The panel MUST include a close mechanism: an explicit close button and the Escape key.
- BR-7: When the panel is closed, it MUST return focus to the element that triggered it (per WCAG 2.4.3 focus order).
- BR-8: The panel MAY include a "Reset to Default" action that restores the initial column visibility and order from the original column definitions.
- BR-9: The panel MUST include a search/filter input to find columns by name when the column count is large (e.g., more than 15 columns).

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Pivot Table | The panel MAY separate columns into groups: dimension columns and measure/value columns. Users toggle visibility of measures independently from dimensions. |
| Gantt Chart | The panel applies to task list columns only. Timeline rendering is not affected by visibility panel changes. |

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Escape | Close the panel, return focus to trigger | Within panel |
| Tab / Shift+Tab | Navigate between panel controls (search, checkboxes, buttons) | Within panel |
| Space | Toggle the focused checkbox (show/hide column) | Focus on checkbox |
| Arrow Up/Down | Navigate between column entries in the list | Focus within column list |
| Ctrl + Arrow Up/Down | Reorder the focused column entry up/down (keyboard alternative for drag reorder) | Focus on column entry |

**Accessibility**
- **ARIA**: The panel MUST have `role="dialog"` with `aria-label="Column visibility"` or `aria-labelledby` referencing a heading element. Each column entry checkbox MUST have an accessible label matching the column name. Disabled checkboxes (for `hideable: false` columns) MUST have `aria-disabled="true"`.
- **Screen Reader**: On open, SR: "Column visibility dialog, [N] columns". When toggling, SR: "[Column Name], checkbox, checked/unchecked". When reordering via keyboard, SR: "[Column Name] moved to position [N]".
- **WCAG**: 2.4.3 (Focus Order -- focus trapped in dialog, returns to trigger on close), 2.5.7 (Dragging Movements -- keyboard reorder alternative), 1.3.1 (column visibility state is programmatically determinable via checkboxes), 2.1.1 (all panel actions are keyboard-accessible).
- **Visual**: The panel SHOULD be positioned near the trigger element (e.g., anchored to the toolbar button or column header). It MUST have a visible border or shadow to distinguish it from the grid. Checkbox states MUST be visually clear (checked/unchecked with 3:1 contrast per WCAG 1.4.11).

**Chameleon 6 Status**: Existed as part of the settings panel. Chameleon 7 creates a dedicated column visibility panel with improved keyboard support, search filtering, and WCAG-compliant dialog behavior.

**Interactions**
- F-09.5 (Column Hide/Show): the panel drives column visibility by toggling `hidden` states.
- F-09.3 (Column Reorder): the panel's drag reorder updates column order.
- F-09.9 (Column Menu): the column menu includes a "Column Visibility" item that opens this panel.
- F-21 (State Persistence): the visibility and order configuration from the panel SHOULD be persistable.

---

## 9.7 Auto-Size Columns to Fit Content [P1]

**Description**: The grid calculates the optimal width for a column based on the widest content in that column (header cell and all visible body cells), then sets the column to that width. Auto-sizing ensures no content is truncated while not allocating excessive space. The user triggers auto-size by double-clicking a column's resize handle, or via the column menu. A bulk "auto-size all columns" action is also available.

**Applies to**: All variants

**Use Cases**
- UC-1: A user double-clicks the resize handle on the "Full Name" column; the column expands from 100px to 185px to accommodate the longest name.
- UC-2: A user loads data into the grid and clicks "Auto-Size All Columns" in the toolbar to fit all columns to their content.
- UC-3: After filtering reduces the visible rows, a user auto-sizes a column and it shrinks because the widest value is no longer visible.

**Conditions of Use**
- Auto-size MUST be available for any column where `resizable: true`.
- The grid MUST expose a programmatic `autoSizeColumn(columnId)` method and a bulk `autoSizeAllColumns()` method.
- Auto-size operates on visible cells only. Virtualized-out rows are not measured (measuring all rows in a 100k-row dataset is not practical). The grid MAY optionally support a `autoSizeSampleSize` parameter to measure a subset of rows for very large datasets.

**Behavioral Requirements**
- BR-1: When triggered, the grid MUST temporarily measure the natural width of the column's content. The measurement strategy SHOULD use CSS `max-content` or an off-screen measurement element to determine the widest content.
- BR-2: The auto-sized width MUST include padding, borders, and any cell decorations (sort icons in headers, expand carets in tree columns).
- BR-3: The auto-sized width MUST respect `minWidth` and `maxWidth` constraints. If the content width exceeds `maxWidth`, the column is set to `maxWidth`. If the content width is below `minWidth`, the column is set to `minWidth`.
- BR-4: After measurement, the grid MUST set the column's track in `grid-template-columns` to the calculated pixel value.
- BR-5: The grid MUST emit a `columnSizeChanged` event after auto-sizing, with the `columnId`, previous width, and new width.
- BR-6: Double-clicking the resize handle MUST trigger auto-size for that column (same as invoking `autoSizeColumn()` programmatically).
- BR-7: "Auto-Size All Columns" MUST measure and resize all visible, resizable columns in a single operation. It SHOULD perform all measurements before applying any width changes to avoid cascading reflows.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Auto-sizing the tree column MUST account for the indentation and caret widths at the deepest visible level. The content width includes indentation + caret + cell text. |
| Pivot Table | Auto-sizing a value column MUST consider formatted values (e.g., "$1,234,567.89" is wider than "12"). Auto-sizing SHOULD optionally apply the same width to all columns of the same measure (`uniformPivotColumnWidth`). |

**CSS Subgrid Implications**

The measurement strategy must not disrupt the current layout. One approach:
1. Temporarily set the column's track to `max-content` in `grid-template-columns`.
2. Read the computed width of any cell in that column.
3. Set the track to the measured pixel value.

This approach avoids creating off-screen clones but causes a brief layout reflow (two reflows: one for `max-content`, one for the final value). The grid SHOULD batch these operations within a single animation frame and suppress `columnSizeChanging` events during measurement.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Column Menu "Auto-Size" option | Auto-size the current column | Navigation Mode, focus on columnheader |
| Toolbar "Auto-Size All" button | Auto-size all columns | Navigation Mode |

**Accessibility**
- **ARIA**: No additional ARIA attributes. The column header retains its existing role and attributes. Width changes do not affect ARIA semantics.
- **Screen Reader**: After auto-size via keyboard, a live region SHOULD announce: SR: "[Column Name] auto-sized to [width] pixels".
- **WCAG**: 1.4.4 (Resize Text -- auto-size adapts column width to content, supporting readability), 2.5.7 (Dragging Movements -- auto-size via double-click is a single action, not a drag; column menu also provides the action).
- **Visual**: No special visual treatment. The column simply resizes to its content width.

**Chameleon 6 Status**: Not directly exposed as a feature. Chameleon 7 adds double-click-to-auto-size, `autoSizeColumn()` API, and "Auto-Size All Columns" action.

**Interactions**
- F-09.1 (Column Resize): double-click on resize handle triggers auto-size.
- F-09.11 (Column Sizing Modes): auto-size converts any sizing mode to an explicit pixel value.
- F-09.9 (Column Menu): provides "Auto-Size" action.
- F-11 (Virtualization): auto-size measures only rendered (visible) cells, not virtualized-out rows.

---

## 9.8 Dynamic Columns at Runtime [P0]

**Description**: Columns can be added, removed, or redefined after the grid's initial rendering without triggering a full component destruction and re-creation. The grid reactively updates its layout, ARIA attributes, and subgrid structure in response to column definition changes. This is essential for applications where the data schema changes at runtime (e.g., user-defined fields, pivot table recalculation, or dynamic report builders).

**Applies to**: All variants

**Use Cases**
- UC-1: A user adds a custom field in a CRM application; the grid immediately shows a new column without losing scroll position, selection, or edit state.
- UC-2: A Pivot Table recalculates after the user changes a dimension; the grid removes old value columns and adds new ones.
- UC-3: A developer removes a column programmatically after the user dismisses a feature flag, and the grid seamlessly collapses the removed column's space.

**Conditions of Use**
- The grid's column definitions MUST be reactive. Changes to the column definition array (add, remove, reorder, modify properties) MUST be detected and applied without a full re-render.
- The grid SHOULD support immutable column definition patterns (replace the entire array) as well as mutable patterns (push/splice into the existing array), depending on the framework binding strategy.

**Behavioral Requirements**
- BR-1: When a column is added, the grid MUST insert a new track in `grid-template-columns`, render a new header cell, and ensure every existing and future data row includes a cell for the new column. `aria-colcount` MUST be updated.
- BR-2: When a column is removed, the grid MUST remove its track from `grid-template-columns`, remove the header cell, and remove corresponding cells from all data rows. `aria-colcount` MUST be updated.
- BR-3: When a column's properties change (e.g., `width`, `hidden`, `freeze`, `headerText`), the grid MUST apply the changes incrementally without re-creating the entire column set.
- BR-4: Dynamic column changes MUST NOT reset the grid's scroll position.
- BR-5: Dynamic column changes MUST NOT clear the selection state unless a selected column is removed (in which case, cells in the removed column are deselected and a `selectionChanged` event fires).
- BR-6: If a cell in the modified column is in Edit Mode, the grid MUST exit Edit Mode (cancel) before applying the column change.
- BR-7: `aria-colindex` values MUST be recalculated for all cells after adding or removing columns.
- BR-8: The grid MUST emit a `columnsChanged` event after the column definitions are processed, containing the added column IDs, removed column IDs, and modified column IDs.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Pivot Table | Dynamic columns are the norm, not the exception. Every pivot recalculation produces a new column set. The grid MUST efficiently diff the old and new column sets to minimize DOM mutations (add/remove only the changed columns, not all of them). |
| Gantt Chart | Adding or removing task list columns does not affect the timeline region. The timeline columns (time intervals) are managed by the Gantt zoom/scroll model, not by the column definition array. |
| Tree Grid | Adding a column at runtime MUST ensure that existing rows with expand/collapse state retain their state. The new column cells are rendered with appropriate indentation if the new column is the tree column (rare but possible). |

**CSS Subgrid Implications**

Adding a column inserts a new track into `grid-template-columns`. Removing a column removes a track. The key challenge is that every row element's cell count must match the column count for subgrid alignment. The grid MUST:
1. Update `grid-template-columns` on the host.
2. Add or remove the header cell.
3. For each rendered row, add or remove the cell at the correct DOM position.

For virtualized rows that are not currently rendered, the cell addition/removal is deferred until the row is rendered (the row factory MUST use the current column definitions when creating row DOM).

**Keyboard Interaction**

Dynamic column changes do not have dedicated keyboard interactions. If the focused cell's column is removed, the grid MUST move focus to the nearest remaining cell in the same row (preferring the cell to the left; if none, the cell to the right).

**Accessibility**
- **ARIA**: `aria-colcount` MUST be updated immediately after column addition or removal. `aria-colindex` on all rendered cells MUST be recalculated. If a focused cell's column is removed, focus MUST move to a valid cell and the screen reader MUST be notified via a live region.
- **Screen Reader**: When columns change, a live region SHOULD announce: SR: "Column [Name] added" or SR: "Column [Name] removed". If focus moves due to column removal, SR: "Focus moved to [Cell value], column [N]".
- **WCAG**: 4.1.2 (the grid's ARIA model is dynamically updated to reflect the current state), 2.4.3 (focus order remains logical after column changes).
- **Visual**: Newly added columns SHOULD appear with a brief highlight animation to draw the user's attention. Removed columns SHOULD collapse smoothly (a CSS transition on the track width from current to `0px` before DOM removal).

**Chameleon 6 Status**: Partially existed. Column definitions were reactive, but full incremental diffing was not implemented. Chameleon 7 adds efficient column diffing, animated addition/removal, and proper ARIA updates.

**Interactions**
- F-09.5 (Column Hide/Show): hiding is a non-destructive alternative to removal.
- F-09.11 (Column Sizing Modes): new columns must specify a sizing mode; defaults apply if omitted.
- F-05 (Pivoting): pivot recalculation produces dynamic column changes.
- F-11 (Virtualization): virtualized rows defer cell addition/removal until rendered.
- F-21 (State Persistence): state snapshot must capture the current column set including dynamically added columns.

---

## 9.9 Column Menu [P1]

**Description**: A per-column dropdown menu accessible from each column header. The menu provides quick access to common column operations: sort ascending, sort descending, clear sort, filter, hide column, pin/unpin, auto-size, and resize. The menu trigger is typically a hamburger icon (three horizontal lines) or a chevron icon in the column header. The column menu is the primary keyboard-accessible alternative for operations that otherwise require pointer-only gestures (drag resize, drag reorder).

**Applies to**: All variants

**Use Cases**
- UC-1: A keyboard-only user opens the column menu on the "Revenue" header and selects "Sort Descending" to sort the data.
- UC-2: A user opens the column menu, selects "Hide Column", and the column disappears from the grid.
- UC-3: A user opens the column menu and selects "Pin to Start" to freeze the column to the left edge.
- UC-4: A user with motor impairment opens the column menu and selects "Resize Column" to set a precise pixel width without needing to drag.

**Conditions of Use**
- The column menu MUST be enabled by default on all resizable, sortable, or hideable columns. The grid MAY expose a `showColumnMenu: boolean` property to globally enable/disable menus, and individual columns MAY have `showMenu: boolean`.
- The column menu MUST be keyboard-operable. It MUST be reachable via Tab or a dedicated shortcut when focus is on a column header.

**Behavioral Requirements**
- BR-1: Each column header MUST render a menu trigger button. The trigger MUST be a focusable element with `aria-haspopup="menu"`.
- BR-2: Clicking the trigger or pressing Enter/Space on it MUST open a dropdown menu (`role="menu"`) anchored to the column header.
- BR-3: The menu MUST include the following items (conditionally, based on the column's capabilities):
  - "Sort Ascending" (if column is sortable) -- `role="menuitem"`
  - "Sort Descending" (if column is sortable) -- `role="menuitem"`
  - "Clear Sort" (if column is currently sorted) -- `role="menuitem"`
  - "Filter" (if column is filterable) -- opens a filter sub-panel or submenu
  - "Hide Column" (if column is hideable) -- `role="menuitem"`
  - "Pin to Start" / "Pin to End" / "Unpin" (if column is pinnable) -- `role="menuitem"`
  - "Auto-Size Column" (if column is resizable) -- `role="menuitem"`
  - "Resize Column..." (opens a resize input/dialog) -- `role="menuitem"`
  - "Column Visibility..." (opens the visibility panel, F-09.6) -- `role="menuitem"`
- BR-4: Menu items that are not applicable to the current column MUST be hidden (not disabled). For example, if a column is not sortable, sort items MUST NOT appear.
- BR-5: The menu MUST close when a menu item is activated, when Escape is pressed, or when focus moves outside the menu.
- BR-6: When the menu closes, focus MUST return to the menu trigger button in the column header.
- BR-7: The developer MUST be able to add custom menu items (e.g., "Export This Column", "Set as Tree Column") via a column-level `menuItems` configuration or a `columnMenuOpening` event that allows item injection.
- BR-8: Menu items MUST respect the current column state: if a column is already pinned to start, the menu SHOULD show "Unpin" instead of "Pin to Start".

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Pivot Table | Dimension header column menus include "Remove from Pivot" or "Move to Rows/Columns" actions. Value column menus include "Change Aggregation" (sum, count, average, etc.). |
| Gantt Chart | Task list column menus are standard. The timeline region does not have per-column menus. |
| Tree Grid | The tree column menu includes "Expand All" and "Collapse All" actions in addition to standard items. |

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Enter / Space | Open menu (focus on trigger) or activate menu item (focus on item) | Navigation Mode |
| Arrow Down | Open menu (focus on trigger) or move to next menu item | Focus on trigger or within menu |
| Arrow Up | Move to previous menu item | Within menu |
| Escape | Close menu, return focus to trigger | Within menu |
| Home | Move to first menu item | Within menu |
| End | Move to last menu item | Within menu |

**Accessibility**
- **ARIA**: Menu trigger: `role="button"` (or `<button>`) with `aria-haspopup="menu"` and `aria-expanded="true"` when menu is open (or `aria-expanded="false"` when closed). Menu container: `role="menu"`. Each menu item: `role="menuitem"`. Disabled items: `aria-disabled="true"`. Submenus: `role="menu"` nested within a `role="menuitem"` with `aria-haspopup="menu"`.
- **Screen Reader**: On trigger focus, SR: "[Column Name] column menu, button, has popup menu". On menu open, SR: "menu, [N] items". On item focus, SR: "[Item label], menu item, [position] of [count]".
- **WCAG**: 2.1.1 (all menu actions are keyboard-accessible), 2.4.3 (focus moves into menu on open, returns to trigger on close), 4.1.2 (menu trigger states are programmatically determinable via `aria-haspopup` and `aria-expanded`).
- **Visual**: The menu trigger icon MUST be visible on hover or focus on the column header (it MAY be hidden at rest to reduce visual noise, but MUST appear on hover/focus). The menu dropdown MUST have a visible border or shadow distinguishing it from the grid. Active/focused menu items MUST have a visible focus indicator (background highlight) meeting WCAG 2.4.11.

**Chameleon 6 Status**: Partially existed. Column headers had context menus with limited options. Chameleon 7 formalizes the menu as a full `role="menu"` with keyboard navigation, extensible items, and WCAG 2.5.7 non-drag alternatives.

**Interactions**
- F-09.1 (Column Resize): "Resize Column..." menu item provides keyboard-accessible resize.
- F-09.3 (Column Reorder): "Move Left" / "Move Right" menu items provide keyboard-accessible reorder.
- F-09.4 (Column Pinning): "Pin to Start" / "Pin to End" / "Unpin" menu items.
- F-09.5 (Column Hide/Show): "Hide Column" menu item.
- F-09.6 (Column Visibility Panel): "Column Visibility..." menu item opens the panel.
- F-09.7 (Auto-Size): "Auto-Size Column" menu item.
- F-02 (Sorting): sort-related menu items.
- F-03 (Filtering): filter-related menu items.
- F-16 (Context Menus): column menu and cell context menu are separate but MAY share a common extensibility pattern.

---

## 9.10 Custom Header Rendering [P0]

**Description**: Developers can replace the default column header content with custom HTML, components, or render functions while preserving the column header's interactive behaviors (sorting, resizing, reordering, menu trigger). The custom rendering controls only the display content area of the header -- the structural affordances (sort indicator, resize handle, menu button) remain managed by the grid. This ensures that custom headers do not accidentally break accessibility or interaction patterns.

**Applies to**: All variants

**Use Cases**
- UC-1: A developer renders a header with an icon and label (e.g., a mail icon next to "Email") for visual richness.
- UC-2: A developer renders a header with a filter input directly embedded in it (header + inline filter combined).
- UC-3: A developer renders a header with a tooltip that explains the column's data source or calculation methodology.
- UC-4: A developer renders a Gantt Chart task list header with a miniature column chart summarizing the column's aggregate values.

**Conditions of Use**
- Each column definition MUST support a `headerRender` callback or slot that accepts custom content for the header cell.
- The custom content MUST be rendered within the header cell's content area. The sort indicator, resize handle, and menu button zones MUST remain under the grid's control.
- If `headerRender` is provided, it replaces only the text label area. The developer cannot replace the entire header cell structure.

**Behavioral Requirements**
- BR-1: The grid MUST render the custom header content within the `role="columnheader"` element. The `role="columnheader"` MUST remain on the cell regardless of custom content.
- BR-2: If the column is sortable, `aria-sort` MUST still be applied to the `role="columnheader"` element, even with custom content. The sort indicator (icon or text) MUST still be rendered in its designated zone.
- BR-3: The resize handle MUST still be present at the column header's trailing edge, even with custom content.
- BR-4: The menu trigger MUST still be present (if column menus are enabled), even with custom content.
- BR-5: Custom content MUST NOT interfere with keyboard navigation. If the custom content contains focusable elements (buttons, links, inputs), they MUST participate in the two-level focus model ([FD-04](../01-foundations/04-accessibility-foundation.md)): the column header cell receives focus in Navigation Mode; pressing Enter or F2 moves focus into the custom content's focusable elements.
- BR-6: The column header's accessible name MUST be set via `aria-label` or `aria-labelledby` if the custom content does not provide a clear text label. For example, if the header renders only an icon, the developer MUST provide an `aria-label` on the column definition.
- BR-7: The grid MUST provide the `headerRender` callback with context: `columnId`, `headerText`, `sortDirection`, `filterActive`, `frozen` state, and any other relevant column state, so the custom renderer can adapt its output.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Pivot Table | Custom header rendering applies to both dimension header columns and auto-generated value columns. For value columns, the render context includes the dimension path (e.g., "Q1 > Revenue"). |
| Gantt Chart | Custom header rendering applies to task list columns. Timeline region headers (time labels) use the Gantt-specific header model, not this custom header rendering. |
| Tree Grid | No special difference; custom headers work identically to Data Grid. |

**Editability Interaction**
- Custom headers are not editable cells. They are display-only (or interactive via custom controls). Editing applies to body cells, not headers.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Enter / F2 | Move focus from the columnheader cell into the first focusable element within the custom header content | Navigation Mode, focus on columnheader |
| Escape | Move focus back to the columnheader cell from within custom content | Focus within custom content |
| Tab | Navigate among focusable elements within the custom header content | Focus within custom content |

**Accessibility**
- **ARIA**: `role="columnheader"` MUST remain on the cell. `aria-sort` MUST be present if the column is sorted. `aria-label` or `aria-labelledby` MUST provide an accessible name if the visual content is non-textual (icon-only headers, etc.). Custom interactive elements within the header MUST have appropriate roles and labels.
- **Screen Reader**: SR: "[Accessible name], column header, [sort state if sorted]" when navigating to the header. If custom content contains interactive elements, they are announced when focus moves into them via Enter/F2.
- **WCAG**: 1.1.1 (Non-text Content -- icon-only headers need text alternatives), 4.1.2 (custom interactive elements within headers have roles and states), 2.1.1 (custom interactive elements are keyboard-accessible via the two-level focus model).
- **Visual**: Custom header content MUST fit within the column header cell's dimensions. Content that overflows SHOULD be clipped or show an ellipsis, not break the grid layout.

**Chameleon 6 Status**: Existed. Custom header templates via slots. Chameleon 7 carries forward with a callback/slot pattern, guaranteed preservation of sort/resize/menu affordances, and two-level focus model for interactive headers.

**Interactions**
- F-09.1 (Column Resize): resize handle is preserved alongside custom headers.
- F-09.3 (Column Reorder): custom headers remain draggable for reorder.
- F-09.9 (Column Menu): menu trigger is preserved alongside custom headers.
- F-02 (Sorting): `aria-sort` and sort indicator are preserved.
- F-01.7 (Multi-Level Headers): custom rendering can be applied at any header level.
- F-14 (Keyboard Navigation): two-level focus model applies to interactive custom headers.

---

## 9.11 Column Sizing Modes [P0]

**Description**: Each column can declare its width using one of several sizing modes that map directly to CSS `grid-template-columns` track values. Supported modes include: fixed pixel (`px`), percentage (`%`), flex (`fr` units), auto-fit (`max-content` or `min-content`), and `minmax()` ranges. The sizing mode determines how the column participates in the grid's layout calculation and how it responds to viewport resizing, content changes, and user resize operations.

**Applies to**: All variants

**Use Cases**
- UC-1: A developer sets the "ID" column to `80px` (fixed), the "Name" column to `1fr` (flex, takes remaining space), and the "Status" column to `120px` (fixed).
- UC-2: A developer uses `minmax(100px, 1fr)` for a "Description" column so it has a minimum readable width but expands to fill available space.
- UC-3: A developer sets a column to `max-content` so it always fits its widest cell value without truncation.
- UC-4: A developer sets percentage-based widths (`20%`, `30%`, `50%`) for a three-column layout that adapts to viewport width.

**Conditions of Use**
- Each column definition MUST accept a `width` property that supports the following formats:
  - `"<number>px"` -- fixed pixel width
  - `"<number>%"` -- percentage of the grid viewport width
  - `"<number>fr"` -- flex fraction of remaining space
  - `"max-content"` -- size to the widest content
  - `"min-content"` -- size to the narrowest content without overflow
  - `"minmax(<min>, <max>)"` -- range between minimum and maximum
  - `"auto"` -- browser default (typically `max-content`-like behavior)
- If no `width` is specified, the default SHOULD be `1fr` (flex, proportional).

**Behavioral Requirements**
- BR-1: The grid MUST map each column's `width` value directly into the corresponding track in the host's `grid-template-columns` property. For example, columns with widths `"80px"`, `"1fr"`, `"minmax(100px, 1fr)"`, `"120px"` produce `grid-template-columns: 80px 1fr minmax(100px, 1fr) 120px`.
- BR-2: When the user resizes a column (F-09.1), the grid MUST convert the column's track to an explicit pixel value (the result of the drag). This means that `fr`, `%`, `max-content`, and `minmax()` columns become fixed-pixel after a user resize. The developer MAY reset the sizing mode programmatically.
- BR-3: When the grid viewport width changes (window resize, container resize), `fr` and `%` columns MUST recalculate automatically (this is native CSS behavior). Fixed `px` columns MUST remain unchanged.
- BR-4: `minmax()` columns MUST respect both the minimum and maximum bounds during layout. If the available space cannot satisfy all minimums, horizontal scrolling MUST occur.
- BR-5: The `minWidth` and `maxWidth` properties on the column definition MUST be enforced in addition to any constraints from the sizing mode. `minWidth` acts as a floor that overrides even `min-content` calculations.
- BR-6: The grid MUST provide a `columnSizingMode` getter for each column that returns the current effective sizing mode: `"fixed"`, `"flex"`, `"percent"`, `"auto"`, or `"minmax"`.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Pivot Table | Auto-generated value columns SHOULD default to a uniform sizing mode (e.g., all `1fr` or all `minmax(80px, 1fr)`) for visual consistency. The developer MAY override this via pivot configuration. |
| Gantt Chart | Task list columns use standard sizing modes. Timeline region widths are governed by zoom level, not column sizing modes. |

**CSS Subgrid Implications**

This feature has the most direct CSS subgrid impact. The `grid-template-columns` value is built by joining each column's `width` value:

```css
/* Columns: Selector(40px), Name(1fr), Age(80px), Bio(minmax(200px, 2fr)), Status(120px) */
grid-template-columns: 40px 1fr 80px minmax(200px, 2fr) 120px;
```

The browser's grid layout engine handles the `fr` and `%` calculations natively. JavaScript does NOT need to compute pixel values for `fr` or `%` columns -- it only needs to construct the `grid-template-columns` string.

**Keyboard Interaction**

Sizing modes are a configuration property and do not have direct keyboard interaction. User-initiated resize (F-09.1) converts the sizing mode to fixed pixels.

**Accessibility**
- **ARIA**: No ARIA attributes reflect the sizing mode. It is a layout concern, not a semantic concern.
- **Screen Reader**: No announcements related to sizing modes. Column width is not typically announced by screen readers.
- **WCAG**: 1.4.4 (Resize Text -- percentage and flex columns adapt to viewport size, improving text readability at different sizes), 1.4.10 (Reflow -- flex columns help the grid adapt to narrow viewports).
- **Visual**: No specific visual treatment. The column displays at the width determined by its sizing mode.

**Chameleon 6 Status**: Partially existed. Columns supported pixel widths and a `flex` property. Chameleon 7 leverages the full CSS `grid-template-columns` syntax including `fr`, `%`, `minmax()`, and `max-content`.

**Interactions**
- F-09.1 (Column Resize): user resize converts sizing mode to fixed pixels.
- F-09.2 (Resize Modes): resize mode determines how adjacent columns respond to a resize in the context of their sizing modes.
- F-09.7 (Auto-Size): auto-size sets a fixed pixel value regardless of the original sizing mode.
- F-09.8 (Dynamic Columns): new columns must declare a sizing mode.

---

## 9.12 Column-Level Styling (like colgroup) [P1]

**Description**: The grid provides a mechanism to style all cells in a column at once, analogous to HTML `<colgroup>`/`<col>` elements. Because CSS subgrid does not support `colgroup`, the grid achieves column-level styling via CSS Parts scoped to each column's identifier. The column header cell and all body cells in the same column share a CSS Part name derived from the column's ID, enabling developers to target all cells in a column with a single `::part()` selector. This is brainstorming note #2.

**Applies to**: All variants

**Use Cases**
- UC-1: A developer right-aligns all cells in a "Revenue" column by applying `text-align: right` to the column's CSS Part.
- UC-2: A developer applies a light background color to a "Warnings" column to draw attention to it.
- UC-3: A developer applies a custom font to all cells in a "Code" column to display monospace content.
- UC-4: A developer applies conditional column styling based on state (e.g., all cells in a "Frozen" column get a subtle background tint).

**Conditions of Use**
- The grid MUST expose CSS Parts on each column header cell and each body cell that include the column's identifier. For example, a column with ID `"revenue"` MUST expose a Part like `column-revenue` on its header cell and every body cell.
- The Part naming convention MUST be documented and predictable. Part names MUST be valid CSS identifiers (alphanumeric plus hyphens).
- Column-level styling MUST be achievable without JavaScript. Pure CSS `::part()` selectors MUST be sufficient.

**Behavioral Requirements**
- BR-1: Every column header cell (`role="columnheader"`) MUST include a `part` attribute that contains a column-specific Part name: `column-<columnId>`.
- BR-2: Every body cell (`role="gridcell"`) MUST include a `part` attribute that contains the same column-specific Part name: `column-<columnId>`.
- BR-3: The Part name MUST be deterministic and stable across re-renders, column reorders, and dynamic column changes. It is derived from the column's unique ID, not its position.
- BR-4: Multiple Part names MAY be present on a single cell (e.g., `part="cell column-revenue row-5 column-type-number"`). The column-specific Part is additive to other Parts.
- BR-5: Column-level styling via `::part()` MUST NOT override explicit cell-level styling. Cell-level Parts (e.g., `cell-<rowId>-<columnId>`) have higher specificity if defined.
- BR-6: Hidden columns' cells (`display: none`) do not need to expose Parts, as they are not stylable.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Pivot Table | Auto-generated value columns MUST have Part names derived from their generated IDs (which include the dimension path, e.g., `column-q1-revenue`). The developer MAY use CSS Part wildcards (where supported) or class-based fallback to style all columns of the same measure. |
| Gantt Chart | Column-level styling applies to task list cells only. Timeline bars have a separate styling model. |

**CSS Subgrid Implications**

CSS subgrid does not support `<colgroup>` or `<col>` element styling. CSS Parts are the only mechanism to target all cells in a column from outside the shadow DOM. The Part approach works because the grid controls the `part` attribute on every cell it renders.

```css
/* Example: right-align all cells in the "revenue" column */
ch-tabular-grid-render::part(column-revenue) {
  text-align: right;
}

/* Example: tint the "status" column */
ch-tabular-grid-render::part(column-status) {
  background-color: var(--ch-status-bg, #f0f8ff);
}
```

**Keyboard Interaction**

Column-level styling is a CSS concern and has no keyboard interaction.

**Accessibility**
- **ARIA**: CSS Parts do not affect ARIA attributes or semantics. Column-level styling is purely visual.
- **Screen Reader**: No announcements. Styling does not alter the information conveyed to assistive technology.
- **WCAG**: 1.4.1 (Use of Color -- column background tinting MUST NOT be the sole means of conveying information; a text label or icon MUST supplement color-based column differentiation), 1.4.11 (Non-text Contrast -- column borders or backgrounds used as visual grouping cues MUST meet 3:1 contrast).
- **Visual**: Column-level styling applies uniformly to all cells in the column. The developer is responsible for ensuring that their custom styles maintain adequate contrast and readability.

**Chameleon 6 Status**: Not directly available. Chameleon 7 introduces column-specific CSS Parts as a first-class styling mechanism.

**Interactions**
- F-15 (Theming/Styling): column-level Parts complement the grid's theming system.
- F-09.5 (Column Hide/Show): hidden columns' cells are not styled (they are `display: none`).
- F-09.8 (Dynamic Columns): dynamically added columns automatically receive Part names based on their IDs.
- F-01 (Data Display): column-level styling can override cell renderer defaults (e.g., text alignment).

---

## 9.13 Collapsible Column Groups (Column Tree) [P1]

**Description**: Multi-level column headers (F-01.7) can be made collapsible, allowing a parent column group to collapse and hide its child columns, similar to how tree rows collapse to hide child rows. When a column group is collapsed, its child columns are hidden (their tracks set to `0px`) and the parent header spans only its own single track. An expand/collapse toggle on the parent header cell lets the user control the visibility of child columns. This feature supports multi-level hierarchies (groups within groups). This is brainstorming note #3.

**Applies to**: All variants

**Use Cases**
- UC-1: A financial report grid has column groups "Q1", "Q2", "Q3", "Q4", each containing "Revenue", "Cost", "Profit" child columns. The user collapses "Q2" and "Q3" to focus on "Q1" and "Q4".
- UC-2: A Pivot Table with multi-level column dimensions (Country > Region > City) allows the user to collapse a country group to hide all its region and city columns.
- UC-3: A developer creates a "Personal Info" column group containing "First Name", "Last Name", "Email", "Phone". The user collapses it to a single summary column showing "Personal Info [4 columns]".

**Conditions of Use**
- Column groups MUST be defined via the multi-level column header configuration (F-01.7). Each group header specifies its child columns.
- Each column group MAY have a `collapsible: boolean` property (default `false`). Setting it to `true` enables the expand/collapse toggle.
- A collapsible group MUST support a `collapsed: boolean` property for programmatic control of the initial state.
- When collapsed, the group MAY optionally display a summary column (a single column that represents the group in collapsed state, e.g., showing an aggregated or summary value).

**Behavioral Requirements**
- BR-1: When a collapsible column group is in the expanded state, all child columns MUST be visible and the parent header MUST span all child column tracks (`grid-column: span N` where N is the number of child tracks).
- BR-2: The parent header cell of a collapsible group MUST render an expand/collapse toggle (e.g., a caret icon or chevron) that is keyboard-accessible.
- BR-3: When the user collapses a group, all child column tracks MUST be set to `0px` in `grid-template-columns`, and child cells MUST be hidden (`display: none`). The parent header MUST shrink to span a single track (its own summary track, which replaces the group's span).
- BR-4: When collapsed, the grid MUST insert (or reveal) a summary track for the group if configured. The summary track occupies the space where the group was. If no summary track is configured, the group collapses to a narrow indicator column (e.g., the width of the toggle icon).
- BR-5: `aria-expanded="true"` MUST be set on the parent column header when the group is expanded. `aria-expanded="false"` MUST be set when collapsed.
- BR-6: `aria-colcount` MUST still reflect the total number of logical columns including hidden (collapsed) children. `aria-colindex` MUST account for collapsed columns (non-sequential indices for visible columns, consistent with F-09.5).
- BR-7: The grid MUST emit a `columnGroupExpandedChanged` event when a group's collapsed state changes, containing the `groupId` and the new `collapsed` state.
- BR-8: Keyboard navigation MUST skip collapsed child columns (same behavior as hidden columns per F-09.5, BR-4).
- BR-9: Multi-level collapse MUST be supported: collapsing a grandparent group MUST hide all descendant groups and columns, regardless of their individual collapsed state. Expanding the grandparent MUST restore each child group to its previous collapsed/expanded state.
- BR-10: The column visibility panel (F-09.6) MUST reflect the collapsed state of column groups. Collapsed groups MAY be shown with a visual indicator (e.g., an expand icon) to indicate they can be expanded.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Pivot Table | Collapsible column groups are especially useful for pivot tables with multi-level column dimensions. Collapsing a dimension level (e.g., "Quarter") hides all child columns (months) and shows the aggregated quarter value. This is analogous to row-level drill-down in pivots. |
| Gantt Chart | Collapsible column groups apply to the task list region. Collapsing a group in the task list does not affect timeline rendering. |
| Tree Grid | No special difference from Data Grid. Tree-specific hierarchy is in rows, not columns. |

**CSS Subgrid Implications**

Collapsing a column group requires:
1. Setting child column tracks to `0px` in `grid-template-columns`.
2. Inserting or revealing a summary track (if configured) at the group's position.
3. Updating the parent header's `grid-column` span.

Example with a 3-child group ("Q1" with "Revenue", "Cost", "Profit"):

```css
/* Expanded */
grid-template-columns: ... 150px 150px 150px ...;
/* Parent header spans 3 tracks */

/* Collapsed (no summary track) */
grid-template-columns: ... 40px 0px 0px ...;
/* Parent header spans 1 track (the 40px toggle indicator) */

/* Collapsed (with summary track) */
grid-template-columns: ... 200px 0px 0px ...;
/* Parent header spans 1 track (the 200px summary column) */
```

The tracks for collapsed children remain in `grid-template-columns` at `0px` to preserve their logical position and keep `aria-colindex` values stable.

**Editability Interaction**
- If a cell in a collapsible group is in Edit Mode when the group is collapsed, the grid MUST exit Edit Mode (cancel) before collapsing.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Enter / Space | Toggle expand/collapse on a focused collapsible group header | Navigation Mode, focus on group columnheader |
| Arrow Left | Collapse the group (if expanded and focus is on the group header) | Navigation Mode |
| Arrow Right | Expand the group (if collapsed and focus is on the group header) | Navigation Mode |
| Arrow Left/Right | Skip collapsed columns during cell navigation | Navigation Mode |

**Accessibility**
- **ARIA**: The parent column header cell MUST have `aria-expanded="true"` (expanded) or `aria-expanded="false"` (collapsed). Child column headers MUST NOT be focusable or navigable when collapsed (they are effectively hidden). `aria-colcount` includes collapsed children. `aria-colindex` values are non-sequential for visible columns (skipping collapsed columns).
- **Screen Reader**: On group header focus, SR: "[Group Name], column header, expanded/collapsed, [N] child columns". When toggling, SR: "[Group Name] expanded" or "[Group Name] collapsed". Live region announcements MUST follow expand/collapse actions.
- **WCAG**: 1.3.1 (expanded/collapsed state is programmatically determinable via `aria-expanded`), 2.1.1 (expand/collapse is keyboard-accessible), 4.1.2 (the toggle state is conveyed via `aria-expanded`).
- **Visual**: The expand/collapse toggle MUST be visually clear (e.g., a right-pointing caret when collapsed, a down-pointing caret when expanded). The toggle MUST meet WCAG 1.4.11 (3:1 contrast). When collapsed, the group header SHOULD visually indicate the collapsed state (e.g., a narrower header with an expand icon and a label like "Q1 [3]").

**Chameleon 6 Status**: Not available. Chameleon 7 introduces collapsible column groups as a new feature, building on the multi-level column header model.

**Interactions**
- F-01.7 (Multi-Level Headers): collapsible groups require multi-level header configuration.
- F-09.5 (Column Hide/Show): collapsed child columns use the same hidden mechanism (0px track, `display: none` cells).
- F-09.6 (Column Visibility Panel): the panel reflects collapsed group state.
- F-09.3 (Column Reorder): collapsible groups are reordered as a unit.
- F-09.8 (Dynamic Columns): adding a child column to a collapsed group keeps it hidden until the group is expanded.
- F-05 (Pivoting): pivot multi-level column dimensions map naturally to collapsible column groups.
- F-14 (Keyboard Navigation): keyboard skips collapsed columns.
