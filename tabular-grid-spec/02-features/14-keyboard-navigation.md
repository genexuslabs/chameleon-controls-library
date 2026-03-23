# F-14: Keyboard Navigation

Keyboard navigation provides the complete set of keyboard interactions that allow users to traverse, operate, and manipulate the grid without a pointing device. This feature category covers the navigation mode property, arrow key movement, Enter/Escape semantics, Tab behavior, Home/End, Page Up/Page Down, Space toggle, tree expand/collapse keys, select-all, F2 editing entry, context menu invocation, shortcut customization, and Delete key behavior.

Keyboard navigation applies to all four variants (Data Grid, Tree Grid, Pivot Table, Gantt Chart) with variant-specific adaptations for hierarchical data, dual-region layouts, and dimension headers.

> **Foundations**: This feature assumes the focus management model defined in [FD-04: Accessibility Foundation](../01-foundations/04-accessibility-foundation.md), which specifies the roving tabindex strategy, the two-level focus model (row-focus vs cell-focus), and the baseline ARIA structure. The editability model in [FD-03: Editability Model](../01-foundations/03-editability-model.md) defines Navigation Mode vs Edit Mode and the transitions between them that keyboard actions trigger. The layout model in [FD-01: Layout Model](../01-foundations/01-layout-model.md) constrains cell positioning within the CSS subgrid structure that keyboard focus traverses.

> **WAI-ARIA APG compliance**: All keyboard behaviors in this feature category are designed to conform to the WAI-ARIA Authoring Practices Guide (APG) Grid and TreeGrid patterns. Where this specification extends beyond the APG (e.g., shortcut customization, configurable Tab behavior), the extensions MUST NOT conflict with the baseline APG key bindings.

> **Chameleon 6 context**: Chameleon 6 supported `keyboardNavigationMode` with three values (`"none"`, `"select"`, `"focus"`), arrow key navigation, Enter/Escape, and basic selection toggling. Chameleon 7 carries forward these modes with full APG compliance, enhanced tree navigation, Edit Mode integration, and configurable shortcuts.

---

## 14.1 Keyboard Navigation Mode [P0]

**Description**: The grid exposes a top-level property that determines the fundamental behavior of arrow keys and other navigation keystrokes. Three modes are supported: `"none"` disables all keyboard navigation (the grid is not a focusable widget), `"select"` causes arrow key movement to both move focus and change selection simultaneously, and `"focus"` causes arrow keys to move focus without altering the selection state. This property is the master switch for all keyboard interaction within the grid.

**Applies to**: All variants

**Use Cases**
- UC-1: A dashboard embeds a read-only summary grid where keyboard navigation is unnecessary; the developer sets `keyboardNavigationMode: "none"` to prevent the grid from trapping keyboard focus.
- UC-2: A master-detail application uses `"select"` mode so that pressing Arrow Down both moves focus and selects the next row, immediately updating the detail panel.
- UC-3: A data entry application uses `"focus"` mode so the user can freely navigate with arrow keys to review data without accidentally changing the selection (selection requires explicit Space or click).
- UC-4: A power user switches between `"focus"` and `"select"` mode at runtime via a toolbar toggle to adapt the grid behavior to their current workflow.

**Conditions of Use**
- The grid MUST expose a `keyboardNavigationMode` property accepting `"none"`, `"select"`, or `"focus"`. The default value MUST be `"focus"`.
- When `keyboardNavigationMode` is `"none"`, the grid root element MUST NOT be focusable (no `tabindex` attribute or `tabindex="-1"`). No keyboard event handlers for navigation MUST be active.
- When `keyboardNavigationMode` is `"select"` or `"focus"`, the grid MUST follow the roving tabindex strategy defined in [FD-04](../01-foundations/04-accessibility-foundation.md), making exactly one cell (or row) focusable with `tabindex="0"` at any time.

**Behavioral Requirements**
- BR-1: When `keyboardNavigationMode` is `"none"`, the grid MUST NOT participate in the tab order. Arrow keys, Enter, Escape, Home, End, Page Up, Page Down, Space, F2, and all other grid-specific keys MUST have no effect. The grid MUST be a purely visual, pointer-only component.
- BR-2: When `keyboardNavigationMode` is `"select"`, every arrow key movement that changes the focused row MUST also select the newly focused row (in single-selection mode) or extend the selection (when combined with Shift in multi-selection mode). The previously focused row MUST be deselected unless Shift or Ctrl modifiers are held.
- BR-3: When `keyboardNavigationMode` is `"focus"`, arrow key movement MUST change focus without altering selection state. The user MUST explicitly press Space, Enter, or use a click to change selection.
- BR-4: The grid MUST support changing `keyboardNavigationMode` at runtime. Changing the mode MUST NOT clear the current focus position or selection state. The new mode MUST take effect on the next keypress.
- BR-5: When the mode transitions from `"none"` to `"select"` or `"focus"`, the grid MUST become focusable. If no cell was previously focused, the first cell of the first data row MUST receive `tabindex="0"` (but not active focus -- the user must Tab into the grid).
- BR-6: When the mode transitions from `"select"` or `"focus"` to `"none"`, the grid MUST remove itself from the tab order. If the grid currently has DOM focus, focus MUST move to the next focusable element in the document tab order.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | In `"select"` mode, Arrow Up/Down selects the newly focused row. Arrow Left/Right for expand/collapse (F-14.10) MUST NOT alter selection. |
| Pivot Table | In `"select"` mode, only data rows are selectable. Navigating to a dimension header row MUST move focus but MUST NOT select the header row. |
| Gantt Chart | `keyboardNavigationMode` applies to the task list region. The timeline region is not keyboard-navigable in the APG sense; it provides supplementary visual feedback for the focused task. |

**CSS Subgrid Implications**

None. The navigation mode is a behavioral property that does not affect the CSS grid layout.

**Editability Interaction**
- When in Edit Mode, the `keyboardNavigationMode` is effectively suspended -- arrow keys are consumed by the editor widget, not by the grid's navigation handler. Exiting Edit Mode returns to the configured navigation mode.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| (all grid keys) | No action | `keyboardNavigationMode: "none"` |
| Arrow keys | Move focus and select in `"select"` mode; move focus only in `"focus"` mode | Navigation Mode |

**Accessibility**
- **ARIA**: When `keyboardNavigationMode` is `"none"`, the grid SHOULD carry `aria-hidden="true"` if it is purely decorative, or retain its grid role but have no focusable descendants. When `"select"` or `"focus"`, the roving tabindex model in [FD-04](../01-foundations/04-accessibility-foundation.md) applies.
- **Screen Reader**: When the user Tab-focuses into the grid, the screen reader MUST announce the grid label and the focused cell's content. No announcement is needed for the navigation mode itself.
- **WCAG**: 2.1.1 (Keyboard -- grid is keyboard-accessible when mode is not `"none"`), 2.1.2 (No Keyboard Trap -- Tab always exits the grid).
- **Visual**: No visual difference between `"select"` and `"focus"` modes. The focus indicator MUST be visible per WCAG 2.4.7 (Focus Visible) and 2.4.13 (Focus Appearance, AAA).

**Chameleon 6 Status**: Existed. `keyboardNavigationMode` property with `"none"`, `"select"`, and `"focus"` values. Chameleon 7 preserves the same property name and values with improved ARIA compliance and Edit Mode coordination.

**Interactions**
- F-08 (Selection): `"select"` mode tightly couples navigation and selection.
- F-07 (Cell Editing): Edit Mode suspends navigation key handling.
- F-14.2 (Arrow Key Navigation): arrow key behavior differs based on mode.
- F-14.5 (Tab Navigation): Tab exits the grid regardless of mode.

---

## 14.2 Arrow Key Navigation [P0]

**Description**: Arrow keys move focus between cells (left/right within a row) and rows (up/down across rows) in the grid. Arrow keys MUST NOT wrap at row or column boundaries (per APG). In the row-focus model, left/right arrows may expand/collapse tree nodes instead of moving between cells. In the cell-focus model, arrows navigate the full cell matrix.

**Applies to**: All variants

**Use Cases**
- UC-1: A user presses Arrow Down to move from row 3 to row 4 in a Data Grid to review the next record.
- UC-2: A user presses Arrow Right to move from the "Name" cell to the "Email" cell in the same row.
- UC-3: A user presses Arrow Down on the last visible row; focus does not wrap to the first row -- it stays on the last row (APG compliance).
- UC-4: In a Tree Grid with row-focus, a user presses Arrow Right on a collapsed parent to expand it, then presses Arrow Right again to move focus to the first child.

**Conditions of Use**
- `keyboardNavigationMode` MUST be `"select"` or `"focus"` (not `"none"`).
- The grid MUST be in Navigation Mode (not Edit Mode).
- The grid MUST implement either row-focus or cell-focus model as defined in [FD-04](../01-foundations/04-accessibility-foundation.md). The focus model determines which element (row or cell) receives the roving tabindex.

**Behavioral Requirements**
- BR-1: **Arrow Down** MUST move focus to the same column in the next visible row. If the focused row is the last visible row, focus MUST remain on the current row (no wrap, no scroll beyond content).
- BR-2: **Arrow Up** MUST move focus to the same column in the previous visible row. If the focused row is the first visible row (or the header row, if headers are focusable), focus MUST remain on the current row.
- BR-3: **Arrow Right** (cell-focus model) MUST move focus to the next cell in the current row (left-to-right in LTR, right-to-left in RTL). If the focused cell is the last cell in the row, focus MUST remain on the current cell (no wrap to next row).
- BR-4: **Arrow Left** (cell-focus model) MUST move focus to the previous cell in the current row. If the focused cell is the first cell in the row, focus MUST remain on the current cell (no wrap to previous row).
- BR-5: In the **row-focus model**, Arrow Left and Arrow Right MUST NOT move between cells. Instead, they MUST expand/collapse tree nodes per F-14.10, or perform no action on flat (non-tree) grids.
- BR-6: When `keyboardNavigationMode` is `"select"`, Arrow Down and Arrow Up MUST also update the selection to the newly focused row (per F-14.1 BR-2).
- BR-7: Arrow navigation MUST skip rows that are hidden (collapsed tree children, filtered-out rows). The grid MUST maintain a visible-row index for efficient skip-navigation.
- BR-8: When arrow navigation moves focus to a row that is outside the current viewport (virtualized or scrolled out of view), the grid MUST scroll to bring the focused row into view. The scroll MUST be the minimum necessary to make the row fully visible.
- BR-9: Arrow navigation into a frozen column region or out of a frozen column region MUST work seamlessly. The scroll position of the non-frozen region MUST adjust as needed, while frozen columns remain in place.
- BR-10: When a column header row is focusable (configurable), Arrow Up from the first data row MUST move focus to the column header. Arrow Down from the column header MUST move focus to the first data row.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Arrow Right on a collapsed parent: expand (do not move focus). Arrow Right on an expanded parent: move focus to first child. Arrow Right on a leaf: no action (cell-focus model: move to next cell). Arrow Left on an expanded parent: collapse (do not move focus). Arrow Left on a collapsed parent or leaf: move focus to parent row. See F-14.10 for full tree key semantics. |
| Pivot Table | Arrow navigation traverses the data cell matrix. Dimension header cells (row/column labels) are navigable if they are rendered as `columnheader` or `rowheader` roles. |
| Gantt Chart | Arrow navigation applies to the task list region only. The timeline region does not receive keyboard focus for cell-by-cell navigation. |

**CSS Subgrid Implications**

Arrow navigation relies on the grid knowing the column index of each cell. Because all rows share the same column track structure via subgrid (per [FD-01](../01-foundations/01-layout-model.md)), the column index of a cell is stable across rows. Hidden columns (via `display: none` on their track) MUST be skipped during left/right navigation.

**Editability Interaction**
- Arrow keys in Navigation Mode move focus between cells. Arrow keys in Edit Mode are consumed by the editor (e.g., cursor movement in a text input) and MUST NOT trigger grid navigation. The editor MUST call `event.stopPropagation()` (or the grid must check the mode) to prevent arrow keys from bubbling to the grid's navigation handler.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Arrow Down | Move focus to same column in next visible row | Navigation Mode |
| Arrow Up | Move focus to same column in previous visible row | Navigation Mode |
| Arrow Right | Move focus to next cell in row (cell-focus) or expand tree node (row-focus) | Navigation Mode |
| Arrow Left | Move focus to previous cell in row (cell-focus) or collapse tree node (row-focus) | Navigation Mode |
| Shift + Arrow Down | Extend selection downward (multi-select mode) | Navigation Mode |
| Shift + Arrow Up | Extend selection upward (multi-select mode) | Navigation Mode |

**Accessibility**
- **ARIA**: The focused cell MUST have `tabindex="0"`; all other cells MUST have `tabindex="-1"`. The `aria-activedescendant` pattern is NOT used; roving tabindex is the required strategy per [FD-04](../01-foundations/04-accessibility-foundation.md).
- **Screen Reader**: When focus moves to a new cell, the screen reader MUST announce the cell content, column header, and row position. For tree grids, the announcement MUST include the level, expanded/collapsed state, and set position (e.g., SR: "Level 2, expanded, 3 of 5, Project Alpha, Name column").
- **WCAG**: 2.1.1 (Keyboard -- all cells reachable via arrow keys), 2.4.3 (Focus Order -- arrow keys follow a logical grid order), 2.4.7 (Focus Visible -- focused cell has a visible indicator).
- **Visual**: The focused cell (or row) MUST display a visible focus ring that meets WCAG 2.4.13 (Focus Appearance): minimum 2px solid outline with at least 3:1 contrast ratio against both the focused component and the adjacent background. The focus ring MUST NOT be obscured by adjacent cells or frozen columns.

**Chameleon 6 Status**: Existed. Arrow key navigation with row-focus model. Chameleon 7 adds cell-focus model, configurable header focus, and full APG compliance including no-wrap behavior.

**Interactions**
- F-14.1 (Keyboard Navigation Mode): determines whether arrow keys also change selection.
- F-14.10 (+/- to Expand/Collapse): tree-specific arrow key behavior in row-focus model.
- F-08 (Selection): Shift+Arrow extends selection.
- F-11 (Virtualization): arrow navigation triggers scroll-into-view for virtualized rows.
- F-06 (Tree/Hierarchical): tree node arrow key semantics.

---

## 14.3 Enter to Edit/Confirm [P0]

**Description**: The Enter key serves a context-dependent role. On a read-only cell, it activates the cell's default action (e.g., following a link, opening a detail view). On an editable cell in Navigation Mode, it enters Edit Mode with the current value selected. In Edit Mode, it commits the current edit and optionally advances focus to the cell below. On a column header, it toggles the sort direction. Enter is the primary "activate" key in the grid.

**Applies to**: All variants

**Use Cases**
- UC-1: A user focuses on an editable "Price" cell and presses Enter to begin editing. The cell transitions to Edit Mode with the value selected, ready for replacement.
- UC-2: A user finishes editing a cell value and presses Enter to commit. Focus returns to the cell in Navigation Mode (or moves to the cell below, depending on configuration).
- UC-3: A user focuses on a column header and presses Enter to sort the column ascending. Pressing Enter again toggles to descending, then to unsorted.
- UC-4: A user focuses on a read-only cell containing a hyperlink and presses Enter to activate the link.

**Conditions of Use**
- `keyboardNavigationMode` MUST be `"select"` or `"focus"`.
- The behavior depends on the current mode (Navigation or Edit) and the cell type (editable, read-only, column header).

**Behavioral Requirements**
- BR-1: In Navigation Mode, pressing Enter on an **editable cell** MUST enter Edit Mode. The editor MUST display the current value with all text selected (for text-based editors) or in its default interactive state (for dropdown/checkbox editors). This matches the behavior defined in F-07.3, BR-3.
- BR-2: In Edit Mode, pressing Enter MUST **commit** the current edit value. The grid MUST fire the commit lifecycle event per [FD-03](../01-foundations/03-editability-model.md). After commit, the grid MUST return to Navigation Mode.
- BR-3: After committing via Enter, the grid SHOULD support a configurable behavior for focus placement: (a) focus remains on the same cell (default), or (b) focus moves to the same column in the next row (spreadsheet-style). This SHOULD be controlled by a property (e.g., `enterKeyNavigation: "stay" | "moveDown"`).
- BR-4: In Navigation Mode, pressing Enter on a **column header** MUST toggle the column's sort direction through the cycle defined in F-02 (ascending, descending, unsorted). The sort MUST be applied immediately.
- BR-5: In Navigation Mode, pressing Enter on a **read-only cell** that contains an actionable element (link, button) MUST activate that element's default action.
- BR-6: In Navigation Mode, pressing Enter on a **tree column cell** (Tree Grid, row-focus model) MUST toggle expand/collapse on the focused row. This is equivalent to clicking the expand/collapse control.
- BR-7: In Edit Mode within a **multi-line text editor**, Enter MUST insert a newline. The user MUST use **Ctrl+Enter** to commit the edit when in a multi-line context.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Enter on a parent row in row-focus model toggles expand/collapse. Enter on a cell in cell-focus model enters Edit Mode or activates the cell action. |
| Pivot Table | Enter on a dimension header cell has no action (dimension headers are not sortable in the traditional sense). Enter on a column header for value columns toggles sort. |
| Gantt Chart | Enter on a task row in the task list follows standard grid behavior. Enter does not interact with the timeline region. |

**Editability Interaction**
- Enter is the primary transition key between Navigation Mode and Edit Mode. See [FD-03](../01-foundations/03-editability-model.md) for the full lifecycle.
- If `before-edit` lifecycle hook cancels the edit (F-07.6), Enter MUST have no effect on an editable cell.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Enter | Enter Edit Mode (editable cell) / activate action (read-only cell) / toggle sort (column header) / toggle expand/collapse (tree row-focus) | Navigation Mode |
| Enter | Commit edit, return to Navigation Mode (optionally move down) | Edit Mode |
| Ctrl+Enter | Commit edit in multi-line editor | Edit Mode |

**Accessibility**
- **ARIA**: No additional ARIA attributes for Enter key behavior. The cell's `aria-readonly` and the column header's `aria-sort` convey the relevant state.
- **Screen Reader**: SR: "Editing [column name], [current value]" when entering Edit Mode via Enter. SR: "[Column name] changed to [new value]" on commit via live region. SR: "[Column name], sorted ascending" when toggling sort.
- **WCAG**: 2.1.1 (Keyboard -- Enter activates the appropriate action), 2.1.2 (No Keyboard Trap -- Enter does not trap the user in a mode without an exit).
- **Visual**: The cell MUST display an Edit Mode visual indicator when Enter activates editing (per F-07.1). Column headers MUST display the updated sort indicator when Enter toggles sort.

**Chameleon 6 Status**: Existed (partially). Enter toggled sort on column headers and could trigger row selection. Edit Mode entry via Enter was not built-in; it was application-managed. Chameleon 7 adds full Enter-to-edit and Enter-to-commit semantics.

**Interactions**
- F-07.1 (Inline Cell Editing): Enter enters Edit Mode on editable cells.
- F-07.3 (Edit Triggers): Enter is a mandatory keyboard trigger.
- F-07.6 (Edit Lifecycle Events): commit fires on Enter in Edit Mode.
- F-02 (Sorting): Enter on column header toggles sort.
- F-06 (Tree/Hierarchical): Enter on tree row toggles expand/collapse.
- F-14.4 (Escape to Cancel): Escape is the counterpart to Enter for cancellation.

---

## 14.4 Escape to Cancel [P0]

**Description**: The Escape key cancels the current operation and returns the grid to a less-engaged state. In Edit Mode, Escape cancels the edit, reverts the cell to its original value, and returns to Navigation Mode. If a popup (dropdown editor, date picker, context menu) is open, Escape closes the popup first. The Escape hierarchy ensures that the innermost interactive layer is dismissed first, preventing the user from being trapped (WCAG 2.1.2).

**Applies to**: All variants

**Use Cases**
- UC-1: A user is editing a cell and realizes the change is incorrect. Pressing Escape reverts the value and exits Edit Mode.
- UC-2: A user opens a dropdown editor in a cell. Pressing Escape closes the dropdown but keeps the cell in Edit Mode. Pressing Escape again cancels the edit and returns to Navigation Mode.
- UC-3: A user opens a context menu via Shift+F10. Pressing Escape closes the context menu and returns focus to the cell.
- UC-4: A user opens a column filter popup from the header. Pressing Escape closes the filter popup and returns focus to the column header.

**Conditions of Use**
- `keyboardNavigationMode` MUST be `"select"` or `"focus"`.
- The Escape key MUST always be functional. There MUST be no state in which Escape does nothing and the user is trapped (WCAG 2.1.2: No Keyboard Trap).

**Behavioral Requirements**
- BR-1: In **Edit Mode** (no popup open), pressing Escape MUST cancel the edit, revert the cell value to the value it had before Edit Mode was entered, and transition to Navigation Mode. Focus MUST return to the gridcell element (not the editor widget, which is removed/hidden).
- BR-2: In **Edit Mode with a popup open** (e.g., dropdown list, date picker, color picker), pressing Escape MUST close the popup first and keep the cell in Edit Mode. A second Escape press MUST cancel the edit per BR-1.
- BR-3: When a **context menu** is open (F-14.13), pressing Escape MUST close the context menu and return focus to the cell or row that had focus before the menu opened.
- BR-4: When a **filter popup** is open (F-03), pressing Escape MUST close the filter popup and return focus to the column header that triggered it.
- BR-5: When a **column header menu** or **popover** is open, pressing Escape MUST close the popover and return focus to the triggering header cell.
- BR-6: The grid MUST implement an **Escape hierarchy** (innermost first): popup within editor > editor > context menu > column menu > other overlays. Each Escape press dismisses one layer. The grid MUST NOT require more than 3 Escape presses to reach Navigation Mode from any state.
- BR-7: The grid MUST fire the `cancel` lifecycle event per [FD-03](../01-foundations/03-editability-model.md) when Escape cancels an edit.
- BR-8: If the cell value was modified but not committed and the user presses Escape, the grid MUST revert to the **original pre-edit value** with no partial save. The `cancel` event payload MUST include both the original value and the discarded modified value.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | No variant-specific Escape behavior. Escape in Edit Mode cancels editing. Escape does not affect expand/collapse state. |
| Gantt Chart | If a timeline bar drag operation is in progress and the user presses Escape (keyboard accessible drag), the drag MUST be cancelled and the bar MUST revert to its original position. |

**Editability Interaction**
- Escape is the primary exit-without-save mechanism. It MUST always revert. If the application needs to prompt before discarding changes (e.g., "You have unsaved changes"), this MUST be handled via the `cancel` lifecycle event hook, which MAY call `preventDefault()` to block the cancellation and display a confirmation dialog.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Escape | Close popup (if open) | Edit Mode with popup |
| Escape | Cancel edit, revert value, return to Navigation Mode | Edit Mode (no popup) |
| Escape | Close context menu, return focus to cell | Context menu open |
| Escape | Close filter/column menu popup | Filter/menu popup open |

**Accessibility**
- **ARIA**: No additional ARIA attributes for Escape. When the editor is removed on cancel, focus MUST return to the gridcell with `tabindex="0"`.
- **Screen Reader**: SR: "Edit cancelled" via a `role="status"` live region when Escape cancels an edit. SR: "Menu closed" when Escape closes a context menu.
- **WCAG**: 2.1.2 (No Keyboard Trap -- Escape always provides an exit path), 3.2.5 (Change on Request -- cancellation reverts the value, no unexpected changes).
- **Visual**: The cell MUST return to its Navigation Mode display (no edit border/shadow). If the value was modified and then cancelled, a brief revert animation MAY play but MUST respect `prefers-reduced-motion: reduce`.

**Chameleon 6 Status**: Existed (partially). Escape closed popups. Edit Mode cancellation via Escape was application-managed. Chameleon 7 adds built-in Escape hierarchy with lifecycle events.

**Interactions**
- F-14.3 (Enter to Edit/Confirm): Enter commits; Escape cancels. Complementary pair.
- F-07.1 (Inline Cell Editing): Escape cancels inline editing.
- F-07.6 (Edit Lifecycle Events): `cancel` event fires on Escape.
- F-14.13 (Shift+F10 for Context Menu): Escape closes context menus.
- F-03 (Filtering): Escape closes filter popups.

---

## 14.5 Tab Navigation [P0]

**Description**: The Tab key moves focus into and out of the grid, treating the entire grid as a single tab stop in the document's tab order. Shift+Tab exits the grid backward. When in Navigation Mode, Tab exits the grid to the next focusable element; it does NOT cycle between cells. In Edit Mode, Tab behavior is configurable: it can either commit the edit and advance to the next editable cell (spreadsheet-style) or commit and exit the grid.

**Applies to**: All variants

**Use Cases**
- UC-1: A user Tabs through a form that includes a grid. The grid receives focus as a single tab stop; the user sees the previously focused cell highlighted. Pressing Tab again exits the grid to the next form field.
- UC-2: A data entry operator in Edit Mode presses Tab to commit the current cell edit and advance to the next editable cell in the row, enabling rapid data entry without leaving the grid.
- UC-3: A user presses Shift+Tab to move focus from the grid backward to the previous form field.

**Conditions of Use**
- `keyboardNavigationMode` MUST be `"select"` or `"focus"` (when `"none"`, the grid is not in the tab order at all).
- The grid MUST implement the single-tab-stop pattern per the APG grid specification.

**Behavioral Requirements**
- BR-1: In **Navigation Mode**, pressing **Tab** MUST move focus OUT of the grid to the next focusable element in the document tab order. The grid MUST NOT cycle focus among its cells on Tab.
- BR-2: In **Navigation Mode**, pressing **Shift+Tab** MUST move focus OUT of the grid to the previous focusable element in the document tab order.
- BR-3: When the user Tabs INTO the grid from outside, focus MUST move to the **last focused cell** (the cell that had focus when the grid was last exited). If the grid has never been focused, focus MUST go to the first cell of the first data row (or the first column header, if headers are focusable and configured as the default focus target).
- BR-4: In **Edit Mode**, pressing Tab MUST commit the current edit. The post-commit behavior is controlled by a configurable property `tabNavigationMode`:
  - `"grid"` (default): Tab commits the edit and exits the grid to the next document tab stop (same as Navigation Mode Tab behavior).
  - `"cell"`: Tab commits the edit and moves focus to the **next editable cell** in reading order (left-to-right, then next row), entering Edit Mode on that cell. Shift+Tab moves to the previous editable cell. If no next editable cell exists, Tab exits the grid.
- BR-5: When `tabNavigationMode` is `"cell"` and Tab moves to the next editable cell, the grid MUST skip non-editable cells and move directly to the next editable cell. If the next editable cell is in a different row, focus MUST move to the first editable cell in the next row.
- BR-6: When `tabNavigationMode` is `"cell"`, Shift+Tab in Edit Mode MUST commit the current edit and move focus to the **previous editable cell** in reverse reading order, entering Edit Mode on that cell.
- BR-7: The grid MUST NOT create a keyboard trap. Regardless of Tab configuration, there MUST always be a way to exit the grid via keyboard (Tab in Navigation Mode always exits; in Edit Mode with `tabNavigationMode: "cell"`, Tab eventually reaches the last editable cell and then exits).

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Gantt Chart | Tab exits the task list region. The timeline region is not independently tabbable. Tab does not cycle between the task list and timeline regions. |
| Pivot Table | Tab skips dimension header cells when `tabNavigationMode` is `"cell"` and `editMode` is active, since dimension headers are not editable. |

**Editability Interaction**
- Tab in Edit Mode always commits first (never cancels). This is the key behavioral distinction from Escape (which cancels).
- When `tabNavigationMode` is `"cell"`, Tab creates a fluid data-entry experience similar to spreadsheet Tab behavior.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Tab | Exit grid to next focusable element | Navigation Mode |
| Shift+Tab | Exit grid to previous focusable element | Navigation Mode |
| Tab | Commit edit and exit grid (`tabNavigationMode: "grid"`) | Edit Mode |
| Tab | Commit edit and advance to next editable cell (`tabNavigationMode: "cell"`) | Edit Mode |
| Shift+Tab | Commit edit and move to previous editable cell (`tabNavigationMode: "cell"`) | Edit Mode |

**Accessibility**
- **ARIA**: The roving tabindex model ensures exactly one cell has `tabindex="0"` (the re-entry point) when the grid loses focus. All other cells have `tabindex="-1"`.
- **Screen Reader**: When the user Tabs into the grid, SR MUST announce the grid label and the focused cell. When the user Tabs out, SR announces the next focused element as normal.
- **WCAG**: 2.1.1 (Keyboard -- grid is reachable via Tab), 2.1.2 (No Keyboard Trap -- Tab always exits the grid in Navigation Mode), 2.4.3 (Focus Order -- grid is one logical tab stop).
- **Visual**: When the grid receives focus via Tab, the previously focused cell MUST display a visible focus ring immediately. No delay or animation that would obscure the focus location.

**Chameleon 6 Status**: Existed. Tab exited the grid. Tab-in-edit-mode behavior was not configurable. Chameleon 7 adds `tabNavigationMode` property for spreadsheet-style Tab cycling.

**Interactions**
- F-14.1 (Keyboard Navigation Mode): Tab has no effect when mode is `"none"`.
- F-07.1 (Inline Cell Editing): Tab commits inline edits.
- F-07.2 (Full-Row Editing): Tab cycles within the row in full-row edit mode (separate behavior from cell-level Tab).
- F-14.3 (Enter to Edit/Confirm): Enter and Tab both commit; Enter optionally moves down while Tab moves right.

---

## 14.6 Home/End [P0]

**Description**: The Home key moves focus to the first cell in the current row. The End key moves focus to the last cell in the current row. These keys provide efficient horizontal navigation without repeated Arrow Right/Left presses.

**Applies to**: All variants

**Use Cases**
- UC-1: A user in a wide grid (20+ columns) presses Home to jump from the 15th column back to the first column without pressing Arrow Left 14 times.
- UC-2: A user presses End to jump to the last column to check a total or status field.

**Conditions of Use**
- `keyboardNavigationMode` MUST be `"select"` or `"focus"`.
- The grid MUST be in Navigation Mode. In Edit Mode, Home/End are consumed by the editor (e.g., cursor to beginning/end of text).
- Cell-focus model MUST be active. In row-focus model, Home/End have no effect (the entire row is the focus unit).

**Behavioral Requirements**
- BR-1: Pressing **Home** MUST move focus to the **first visible cell** in the current row (the leftmost cell in LTR, rightmost in RTL). Hidden columns MUST be skipped.
- BR-2: Pressing **End** MUST move focus to the **last visible cell** in the current row. Hidden columns MUST be skipped.
- BR-3: If the first or last cell is in a frozen column region, focus MUST move to it regardless of the scroll position of the non-frozen region.
- BR-4: The grid MUST scroll horizontally as needed to bring the focused cell into view.
- BR-5: In `"select"` mode (F-14.1), Home and End MUST move focus without changing the row selection (since the row has not changed).

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Home/End navigates within the row's cells. The tree column cell (with indentation and expand/collapse control) is a valid Home target if it is the first column. |
| Pivot Table | Home moves to the first cell after any frozen row-header columns. End moves to the last value cell. |
| Gantt Chart | Home/End applies within the task list region only. |

**Editability Interaction**
- In Edit Mode, Home/End are consumed by the editor widget (e.g., move cursor to start/end of text input). The grid MUST NOT intercept Home/End during Edit Mode.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Home | Move focus to first cell in current row | Navigation Mode (cell-focus) |
| End | Move focus to last cell in current row | Navigation Mode (cell-focus) |

**Accessibility**
- **ARIA**: The newly focused cell receives `tabindex="0"`. The previously focused cell receives `tabindex="-1"`.
- **Screen Reader**: SR announces the newly focused cell content and column header.
- **WCAG**: 2.1.1 (Keyboard -- Home/End provide efficient navigation), 2.4.7 (Focus Visible).
- **Visual**: Focus ring moves to the target cell. Horizontal scroll adjusts to reveal the cell.

**Chameleon 6 Status**: New. Chameleon 6 did not implement Home/End cell navigation. Chameleon 7 introduces this per APG.

**Interactions**
- F-14.7 (Ctrl+Home / Ctrl+End): Ctrl modifier extends Home/End to the grid level.
- F-14.2 (Arrow Key Navigation): Home/End complement arrow keys for horizontal navigation.
- F-09 (Column Management): hidden columns are skipped by Home/End.

---

## 14.7 Ctrl+Home / Ctrl+End [P0]

**Description**: Ctrl+Home moves focus to the first cell of the first row in the grid. Ctrl+End moves focus to the last cell of the last row. These shortcuts provide grid-level navigation, allowing the user to jump to the absolute beginning or end of the data set.

**Applies to**: All variants

**Use Cases**
- UC-1: A user deep within a 10,000-row grid presses Ctrl+Home to jump back to the first row and first column to review the top of the data.
- UC-2: A user presses Ctrl+End to jump to the last row and last column to check the final record or a summary row.

**Conditions of Use**
- `keyboardNavigationMode` MUST be `"select"` or `"focus"`.
- The grid MUST be in Navigation Mode.
- Cell-focus model MUST be active for full grid-corner navigation. In row-focus model, Ctrl+Home moves to the first row and Ctrl+End moves to the last row.

**Behavioral Requirements**
- BR-1: Pressing **Ctrl+Home** MUST move focus to the **first cell** (first column) of the **first data row**. If column headers are focusable, Ctrl+Home MUST move to the first column header cell instead.
- BR-2: Pressing **Ctrl+End** MUST move focus to the **last cell** (last column) of the **last visible data row**.
- BR-3: The grid MUST scroll both vertically and horizontally as needed to bring the target cell into view.
- BR-4: In `"select"` mode, Ctrl+Home and Ctrl+End MUST change the selection to the target row (single selection) or set the selection anchor to the target row (multi-selection without extending).
- BR-5: In row-focus model, Ctrl+Home MUST move focus to the first row and Ctrl+End MUST move focus to the last visible row.
- BR-6: In virtualized grids, Ctrl+Home and Ctrl+End MUST work correctly even if the target rows are not currently rendered. The grid MUST trigger virtualization to render the target rows before placing focus.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Ctrl+End moves to the last *visible* row (deepest expanded leaf). Collapsed descendants are not considered. |
| Pivot Table | Ctrl+End moves to the last value cell of the last data row. Summary/total rows at the bottom, if present, are included. |
| Gantt Chart | Ctrl+Home/Ctrl+End applies to the task list region. |

**Editability Interaction**
- In Edit Mode, Ctrl+Home and Ctrl+End are NOT consumed by most editors (text inputs do not use Ctrl+Home/End). The grid MAY intercept these shortcuts to commit the edit and navigate, or it MAY defer to the editor. The recommended default is to let the editor handle them if it has multi-line content; otherwise, the grid intercepts.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Ctrl+Home | Move focus to first cell of first row | Navigation Mode |
| Ctrl+End | Move focus to last cell of last row | Navigation Mode |

**Accessibility**
- **ARIA**: Focus management via roving tabindex as usual.
- **Screen Reader**: SR announces the target cell content and position (e.g., SR: "Row 1 of 10000, Name column, Alice Johnson").
- **WCAG**: 2.1.1 (Keyboard), 2.4.7 (Focus Visible).
- **Visual**: Focus ring and scroll position both update to the target cell. If the jump is large, the scroll SHOULD be immediate (not animated) to avoid disorientation, or animated with `prefers-reduced-motion` respected.

**Chameleon 6 Status**: New. Chameleon 6 did not implement Ctrl+Home/Ctrl+End. Chameleon 7 introduces this per APG.

**Interactions**
- F-14.6 (Home/End): Home/End navigate within a row; Ctrl+Home/End navigate across the entire grid.
- F-14.8 (Page Up/Down): Page keys provide intermediate-distance vertical navigation.
- F-11 (Virtualization): Ctrl+Home/End triggers rendering of distant rows.

---

## 14.8 Page Up / Page Down [P0]

**Description**: Page Up and Page Down scroll the grid by approximately one viewport height and move focus to the cell in the same column at the new scroll position. These keys provide efficient vertical navigation for large data sets without holding down the Arrow Down key.

**Applies to**: All variants

**Use Cases**
- UC-1: A user browsing a 5,000-row grid presses Page Down to advance approximately one screenful of rows, landing on the row that would appear at the top of the new viewport.
- UC-2: A user presses Page Up to scroll back up after overshooting with Page Down.

**Conditions of Use**
- `keyboardNavigationMode` MUST be `"select"` or `"focus"`.
- The grid MUST be in Navigation Mode.

**Behavioral Requirements**
- BR-1: Pressing **Page Down** MUST scroll the grid down by the height of the visible viewport (the number of fully visible rows) and move focus to the cell in the same column that is now at the top of the viewport. If fewer rows remain than one viewport height, focus MUST move to the last row.
- BR-2: Pressing **Page Up** MUST scroll the grid up by the height of the visible viewport and move focus to the cell in the same column that is now at the top of the viewport. If fewer rows exist above than one viewport height, focus MUST move to the first row.
- BR-3: The column of the focused cell MUST be preserved across Page Up/Down navigation. If the user was focused on the "Email" column, Page Down MUST land on the "Email" column in the new row.
- BR-4: In `"select"` mode, Page Up/Down MUST also update the selection to the newly focused row.
- BR-5: In virtualized grids, Page Up/Down MUST trigger the virtual scroller to render the appropriate rows before placing focus. The transition SHOULD be seamless.
- BR-6: Page Down from the last page of rows MUST move focus to the last row (not wrap to the first row).
- BR-7: Page Up from the first page of rows MUST move focus to the first row (not wrap to the last row).

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Page Up/Down counts only visible (expanded) rows for the viewport calculation. Collapsed descendants are not counted. |
| Gantt Chart | Page Up/Down applies to the task list region. The timeline region scrolls in sync. |

**Editability Interaction**
- In Edit Mode, Page Up/Down SHOULD commit the current edit and then perform the page navigation. Alternatively, the grid MAY ignore Page Up/Down during Edit Mode. The recommended behavior is to commit and navigate (consistent with how Tab commits and moves).

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Page Down | Scroll down one viewport, move focus to same column in new position | Navigation Mode |
| Page Up | Scroll up one viewport, move focus to same column in new position | Navigation Mode |

**Accessibility**
- **ARIA**: Roving tabindex updates to the new focused cell.
- **Screen Reader**: SR announces the newly focused cell. The large position jump SHOULD be accompanied by a live region announcement: SR: "Page down. Row [N] of [total]."
- **WCAG**: 2.1.1 (Keyboard), 2.4.7 (Focus Visible).
- **Visual**: The viewport scrolls and the focus ring appears on the target cell. The transition SHOULD be immediate for large jumps to avoid motion sickness (respect `prefers-reduced-motion`).

**Chameleon 6 Status**: New. Chameleon 6 did not implement Page Up/Down navigation. Chameleon 7 introduces this per APG.

**Interactions**
- F-14.2 (Arrow Key Navigation): arrows move one row; Page keys move one viewport.
- F-14.7 (Ctrl+Home/End): Ctrl+Home/End move to absolute edges; Page keys move relative distances.
- F-11 (Virtualization): Page navigation triggers virtualization updates.

---

## 14.9 Space to Toggle Selection [P0]

**Description**: The Space key toggles the selection state of the focused row or cell. In row-selection modes, Space selects or deselects the focused row. On a checkbox cell (in a checkbox column), Space toggles the checkbox. In `"select"` mode, Space is redundant with arrow keys for the focused row but is essential in `"focus"` mode where arrows do not change selection.

**Applies to**: All variants

**Use Cases**
- UC-1: In `"focus"` mode with multi-row selection, a user navigates to several rows with arrow keys and presses Space on each one to build up a multi-row selection without using Ctrl+click.
- UC-2: A user focuses on a row and presses Space to select it, triggering a detail panel update.
- UC-3: A user focuses on the checkbox column cell and presses Space to toggle the row's checkbox (equivalent to clicking the checkbox).

**Conditions of Use**
- `keyboardNavigationMode` MUST be `"select"` or `"focus"`.
- The grid MUST be in Navigation Mode.
- Selection MUST be enabled (`rowSelectionMode` is not `"none"`).

**Behavioral Requirements**
- BR-1: Pressing **Space** in single-selection mode MUST select the focused row. If another row was selected, it MUST be deselected.
- BR-2: Pressing **Space** in multi-selection mode MUST toggle the focused row's selection state (select if unselected, deselect if selected) without affecting other rows' selection states. This is equivalent to Ctrl+click.
- BR-3: Pressing **Shift+Space** in multi-selection mode MUST select the contiguous range from the anchor row to the focused row, replacing the current selection (equivalent to Shift+click).
- BR-4: Pressing **Ctrl+Space** in multi-selection mode MUST toggle the focused row's selection state without affecting other selections (explicit; same as Space alone in multi-select).
- BR-5: When focus is on a **checkbox cell** (F-08.3), Space MUST toggle the checkbox, which in turn toggles the row's selection state. The behavior MUST be identical to clicking the checkbox.
- BR-6: When focus is on a **column header checkbox** (select-all), Space MUST toggle the select-all/deselect-all state per F-08.3.
- BR-7: The grid MUST NOT scroll when Space is pressed (the browser's default behavior of scrolling on Space MUST be prevented via `event.preventDefault()`).
- BR-8: When focus is on a cell containing a boolean/checkbox editor in a data column (not the selector column), Space MUST toggle the boolean value. This is a cell-level action, not a selection action.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Space selects the focused row. It MUST NOT expand/collapse the tree node (that is Arrow Right/Left or +/-). |
| Pivot Table | Space selects data rows. If focus is on a non-selectable dimension header row, Space MUST have no effect. |
| Gantt Chart | Space selects the task row in the task list. The corresponding timeline bar MUST reflect the selection visually. |

**Editability Interaction**
- In Edit Mode, Space is consumed by the editor (e.g., typing a space character). The grid MUST NOT intercept Space during Edit Mode for selection purposes.
- On a read-only boolean/checkbox cell, Space toggles the value directly (entering a transient Edit Mode, committing immediately).

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Space | Toggle selection of focused row (single or multi) / toggle checkbox | Navigation Mode |
| Shift+Space | Select range from anchor to focused row | Navigation Mode (multi-select) |
| Ctrl+Space | Toggle focused row selection without affecting others | Navigation Mode (multi-select) |

**Accessibility**
- **ARIA**: `aria-selected` updates on the affected row(s). Checkbox cells update `aria-checked`.
- **Screen Reader**: SR: "Selected" or "Not selected" via `aria-selected` state change. For checkboxes: SR: "Checked" or "Not checked". Live region: SR: "[N] rows selected" when selection count changes.
- **WCAG**: 2.1.1 (Keyboard -- selection via Space), 1.3.1 (selection state programmatically determinable), 4.1.2 (checkbox state conveyed).
- **Visual**: The selected row MUST display the selection visual indicator (background highlight, left-edge bar). The focus ring remains on the focused cell/row independently of the selection highlight.

**Chameleon 6 Status**: Existed (partially). Space toggled selection. Chameleon 7 adds Shift+Space range selection, Ctrl+Space explicit toggle, and checkbox cell coordination.

**Interactions**
- F-08.1 (Row Selection: Single): Space selects in single mode.
- F-08.2 (Row Selection: Multiple): Space toggles, Shift+Space selects range.
- F-08.3 (Checkbox Column): Space toggles checkbox.
- F-14.1 (Keyboard Navigation Mode): in `"select"` mode, Space is supplementary; in `"focus"` mode, Space is the primary selection mechanism.

---

## 14.10 +/- to Expand/Collapse [P0]

**Description**: In Tree Grid and Gantt Chart variants, the plus (`+`) and minus (`-`) keys (or numpad equivalents) expand and collapse the focused tree node. In row-focus model, Arrow Right also expands and Arrow Left also collapses (per APG treegrid pattern). In cell-focus model, the +/- keys provide an alternative to clicking the expand/collapse control. The Enter key on the tree column cell also toggles expand/collapse.

**Applies to**: Tree Grid, Gantt Chart

**Use Cases**
- UC-1: A user navigating a file tree presses `+` on a collapsed folder to expand it and reveal its contents.
- UC-2: A user presses `-` on an expanded project phase in a Gantt Chart to collapse all its sub-tasks.
- UC-3: In row-focus mode, a user presses Arrow Right on a collapsed node to expand it, then Arrow Right again to move into the first child.
- UC-4: A user presses `*` (asterisk) on a node to expand all descendants (expand all below this node).

**Conditions of Use**
- `keyboardNavigationMode` MUST be `"select"` or `"focus"`.
- The grid MUST be in Navigation Mode.
- The focused row MUST be a parent node (has children). On leaf nodes, +/- MUST have no effect.
- The grid MUST be a Tree Grid or Gantt Chart variant (Data Grid and Pivot Table do not use tree expand/collapse keyboard shortcuts).

**Behavioral Requirements**
- BR-1: Pressing **`+`** (plus key, main keyboard or numpad) on a **collapsed** parent row MUST expand it, revealing its direct children. If already expanded, `+` MUST have no effect.
- BR-2: Pressing **`-`** (minus/hyphen key, main keyboard or numpad) on an **expanded** parent row MUST collapse it, hiding all descendants. If already collapsed, `-` MUST have no effect.
- BR-3: In **row-focus model**, **Arrow Right** on a collapsed parent MUST expand the node (do not move focus). Arrow Right on an expanded parent MUST move focus to the first child row. Arrow Right on a leaf row MUST have no effect.
- BR-4: In **row-focus model**, **Arrow Left** on an expanded parent MUST collapse the node (do not move focus). Arrow Left on a collapsed parent or leaf row MUST move focus to the parent row. Arrow Left on a root-level collapsed row MUST have no effect.
- BR-5: In **cell-focus model**, Arrow Left and Arrow Right navigate between cells (F-14.2). The +/- keys (and Enter on the tree column cell) provide the expand/collapse mechanism instead.
- BR-6: Pressing **`*`** (asterisk) on a parent row SHOULD expand all descendants of that node recursively. This MAY be configurable or disabled for performance reasons on large trees.
- BR-7: Expand/collapse via keyboard MUST fire the `rowExpandedChanged` event (per F-06.1, BR-6).
- BR-8: When a node is collapsed via keyboard and the previously focused descendant loses visibility, focus MUST move to the collapsed parent row (per F-06.1, BR-7).
- BR-9: Expand/collapse actions MUST NOT alter the selection state. If the collapsed parent was selected, it remains selected. If a hidden descendant was selected, its selection MUST be preserved in memory per F-06.1, BR-8.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Full expand/collapse keyboard support as described above. |
| Gantt Chart | Expand/collapse in the task list collapses descendant tasks. The timeline region hides the corresponding task bars and shows the parent summary bar. |
| Data Grid | N/A. Data Grid does not use tree expand/collapse (grouped rows use different interaction, see F-04). |
| Pivot Table | N/A. Dimension hierarchy expansion is managed by F-05, not by +/- keys. |

**Editability Interaction**
- In Edit Mode, +/- keys are consumed by the editor (e.g., typing `+` or `-` in a number field). The grid MUST NOT intercept +/- during Edit Mode.
- In a numeric editor, the +/- characters MUST be typed normally.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| + (plus) | Expand focused parent node | Navigation Mode |
| - (minus) | Collapse focused parent node | Navigation Mode |
| * (asterisk) | Expand all descendants of focused node | Navigation Mode |
| Arrow Right | Expand (collapsed parent) or move to first child (expanded parent) -- row-focus model | Navigation Mode |
| Arrow Left | Collapse (expanded parent) or move to parent row -- row-focus model | Navigation Mode |

**Accessibility**
- **ARIA**: `aria-expanded` MUST toggle between `"true"` and `"false"` on the parent row when expand/collapse occurs. Children rows MUST be added to or removed from the DOM (or hidden with `display: none`).
- **Screen Reader**: SR: "Expanded, [N] children" when expanding a node. SR: "Collapsed" when collapsing. The `aria-expanded` state change triggers the announcement automatically in most screen readers.
- **WCAG**: 2.1.1 (Keyboard -- expand/collapse accessible via keyboard), 1.3.1 (expanded/collapsed state is programmatically determinable via `aria-expanded`), 4.1.2 (role and state of tree nodes conveyed).
- **Visual**: The expand/collapse toggle icon MUST update (e.g., right-pointing arrow for collapsed, down-pointing arrow for expanded). The icon change MUST NOT rely on color alone.

**Chameleon 6 Status**: Existed (partially). Arrow keys expanded/collapsed in tree mode. +/- and * keys were not implemented. Chameleon 7 adds +/-, *, and explicit row-focus vs cell-focus model differentiation.

**Interactions**
- F-06.1 (Tree Data with Expand/Collapse): expand/collapse logic, events, and ARIA.
- F-14.2 (Arrow Key Navigation): arrow keys in row-focus model share expand/collapse responsibility.
- F-14.3 (Enter to Edit/Confirm): Enter on tree column cell toggles expand/collapse.
- F-06.2 (Lazy Loading Children): expanding a node may trigger lazy load.

---

## 14.11 Ctrl+A to Select All [P0]

**Description**: Ctrl+A (Cmd+A on macOS) selects all visible rows in the grid. If all rows are already selected, Ctrl+A deselects all rows. This shortcut provides a fast way to select the entire data set for batch operations such as export, delete, or copy.

**Applies to**: All variants

**Use Cases**
- UC-1: A user presses Ctrl+A to select all 200 visible rows before pressing Ctrl+C to copy them to the clipboard.
- UC-2: A user with all rows selected presses Ctrl+A again to deselect all, clearing the selection.
- UC-3: A user in a filtered grid presses Ctrl+A to select only the 50 visible (filtered) rows, not the entire unfiltered data set.

**Conditions of Use**
- `keyboardNavigationMode` MUST be `"select"` or `"focus"`.
- `rowSelectionMode` MUST be `"multiple"`. In single-selection mode, Ctrl+A MUST have no effect.
- The grid MUST be in Navigation Mode.

**Behavioral Requirements**
- BR-1: Pressing **Ctrl+A** (or **Cmd+A** on macOS) MUST select all visible, selectable data rows. Non-selectable rows (group headers, aggregation footers) MUST NOT be selected.
- BR-2: If ALL visible selectable rows are already selected, pressing Ctrl+A MUST **deselect all** rows (toggle behavior).
- BR-3: Ctrl+A MUST select only rows that are currently visible (not filtered out, not collapsed under a parent). Hidden rows MUST NOT be included in the selection.
- BR-4: Ctrl+A MUST fire a `selectionChanged` event with the full set of selected row IDs.
- BR-5: Ctrl+A MUST update the header checkbox (F-08.3) to the checked state (or unchecked if toggling to deselect all).
- BR-6: The grid MUST call `event.preventDefault()` to prevent the browser's default Ctrl+A behavior (selecting all text on the page).

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Ctrl+A selects all visible rows, including both parent and leaf rows that are expanded and visible. Collapsed descendants are NOT selected. |
| Pivot Table | Ctrl+A selects all visible data rows. Dimension header rows are not included. |
| Gantt Chart | Ctrl+A selects all visible task rows. All corresponding timeline bars MUST reflect the selection visually. |

**Editability Interaction**
- In Edit Mode, Ctrl+A MUST be consumed by the editor (e.g., select all text in the input). The grid MUST NOT intercept Ctrl+A during Edit Mode.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Ctrl+A / Cmd+A | Select all visible rows (or deselect all if all selected) | Navigation Mode |

**Accessibility**
- **ARIA**: All selected rows receive `aria-selected="true"`. The grid's `aria-multiselectable="true"` signals that multi-selection is supported.
- **Screen Reader**: Live region: SR: "All [N] rows selected" or "All rows deselected".
- **WCAG**: 2.1.1 (Keyboard -- select-all via keyboard shortcut), 1.3.1 (selection state programmatically determinable).
- **Visual**: All rows MUST display the selection highlight simultaneously. The visual transition SHOULD be immediate, not row-by-row animated.

**Chameleon 6 Status**: New. Chameleon 6 did not implement Ctrl+A. Select-all was available only via the header checkbox. Chameleon 7 adds Ctrl+A as a keyboard shortcut.

**Interactions**
- F-08.7 (Select All): Ctrl+A is the keyboard shortcut equivalent of the select-all API.
- F-08.3 (Checkbox Column): header checkbox state synchronized.
- F-08.2 (Row Selection: Multiple): Ctrl+A requires multi-selection mode.
- F-12 (Export/Import): Ctrl+A followed by Ctrl+C is a common export workflow.

---

## 14.12 F2 to Start Editing [P0]

**Description**: The F2 key enters Edit Mode on the focused editable cell without clearing the current value. Unlike typing a printable character (which replaces the value), F2 positions the cursor at the end of the existing value, allowing the user to append or modify the existing content. Pressing F2 while already in Edit Mode returns to Navigation Mode while preserving the current (possibly modified) value -- acting as a toggle.

**Applies to**: All variants

**Use Cases**
- UC-1: A user focuses on a "Description" cell containing "Project Alpha" and presses F2 to enter Edit Mode. The cursor appears at the end of "Project Alpha" so the user can append " - Phase 2".
- UC-2: A user is in Edit Mode and realizes they want to navigate away without committing. They press F2 to return to Navigation Mode. The modified value is preserved in the cell (but not committed to the data source until explicitly saved).
- UC-3: A user presses F2 on a dropdown cell. The dropdown editor opens with the current value pre-selected, ready for change.

**Conditions of Use**
- `keyboardNavigationMode` MUST be `"select"` or `"focus"`.
- The focused cell MUST be editable per [FD-03](../01-foundations/03-editability-model.md).
- F2 MUST work regardless of the `editTrigger` configuration (F-07.3). Even if `editTrigger` is `"programmatic"`, F2 MUST still enter Edit Mode. F2 is a mandatory keyboard trigger per APG.

**Behavioral Requirements**
- BR-1: In **Navigation Mode**, pressing F2 on an editable cell MUST enter Edit Mode. For text-based editors, the cursor MUST be positioned at the **end** of the current value (NOT selecting all text). This distinguishes F2 from Enter (which selects all text).
- BR-2: In **Edit Mode**, pressing F2 MUST return to **Navigation Mode** while **preserving** the current editor value. The value displayed in the cell MUST reflect whatever the user has typed, even though it has not been committed to the data source. This creates a "soft edit" state.
- BR-3: F2 MUST NOT trigger the `commit` lifecycle event when used to exit Edit Mode. The value is preserved visually but not committed. A subsequent Enter or Tab MUST commit the preserved value. A subsequent Escape MUST revert to the original pre-edit value.
- BR-4: F2 on a **non-editable cell** (read-only) MUST have no effect.
- BR-5: F2 MUST fire the `before-edit` lifecycle event when entering Edit Mode. If the event is cancelled, F2 MUST have no effect.
- BR-6: When F2 enters Edit Mode, the `trigger` property of the `before-edit` event MUST be `"f2"`.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | F2 on the tree column cell enters Edit Mode on the cell's data content, NOT on the expand/collapse control. The expand/collapse control remains functional (clicking it toggles the node, not the editor). |
| Pivot Table | F2 on a value cell enters Edit Mode. F2 on a dimension header cell has no effect (dimension headers are read-only). |
| Gantt Chart | F2 on a task list cell enters Edit Mode. F2 does not interact with the timeline region. |

**Editability Interaction**
- F2 is one of three keyboard edit triggers (along with Enter and printable characters). F2 is unique in that it preserves the cursor position at end-of-value and does NOT select all text.
- The F2 toggle behavior (Edit > Navigation with preserved value) is particularly useful for users who want to review a cell's editable content without committing, or who want to use arrow keys to navigate away and then return later to commit.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| F2 | Enter Edit Mode with cursor at end of value | Navigation Mode |
| F2 | Return to Navigation Mode, preserving modified value | Edit Mode |

**Accessibility**
- **ARIA**: When entering Edit Mode, focus moves to the editor input. `aria-readonly="false"` remains on the cell. When exiting via F2, focus returns to the gridcell.
- **Screen Reader**: SR: "Editing [column name], [current value]" when entering Edit Mode. SR: "Returned to navigation" when exiting Edit Mode via F2 (via live region).
- **WCAG**: 2.1.1 (Keyboard -- F2 provides keyboard editing entry), 2.1.2 (No Keyboard Trap -- F2 exits Edit Mode).
- **Visual**: Edit Mode visual indicator (border, shadow) appears on F2 entry and disappears on F2 exit. The cell SHOULD display the modified (uncommitted) value in a visually distinct way (e.g., italic text or a subtle marker) to indicate it has been changed but not committed.

**Chameleon 6 Status**: New. Chameleon 6 did not have built-in F2-to-edit behavior. Chameleon 7 introduces this per APG and spreadsheet convention.

**Interactions**
- F-07.3 (Edit Triggers): F2 is a mandatory trigger alongside Enter and alphanumeric characters.
- F-07.1 (Inline Cell Editing): F2 enters the same inline editing experience.
- F-07.6 (Edit Lifecycle Events): `before-edit` fires on F2 entry; no `commit` on F2 exit.
- F-14.3 (Enter to Edit/Confirm): Enter selects all text; F2 positions cursor at end.
- F-14.4 (Escape to Cancel): Escape reverts; F2 preserves.

---

## 14.13 Shift+F10 for Context Menu [P0]

**Description**: Shift+F10 opens the context menu for the focused cell or row, providing the keyboard equivalent of a right-click. Focus moves to the first item in the context menu. The context menu offers context-appropriate actions (copy, paste, delete, sort, filter, etc.) based on the focused element.

**Applies to**: All variants

**Use Cases**
- UC-1: A user focuses on a data cell and presses Shift+F10 to open a context menu with options like "Copy Cell", "Paste", "Insert Row Above", "Delete Row".
- UC-2: A user focuses on a column header and presses Shift+F10 to open a menu with "Sort Ascending", "Sort Descending", "Hide Column", "Pin Column".
- UC-3: A keyboard-only user relies on Shift+F10 as their only way to access context menu actions, since they cannot right-click.

**Conditions of Use**
- `keyboardNavigationMode` MUST be `"select"` or `"focus"`.
- The grid MUST be in Navigation Mode.
- The grid MUST have a context menu configured. If no context menu is configured, Shift+F10 MUST have no effect (no empty menu).

**Behavioral Requirements**
- BR-1: Pressing **Shift+F10** MUST open the context menu positioned relative to the focused cell (or row in row-focus model). The menu MUST appear visually adjacent to the focused element, not at a random position.
- BR-2: Focus MUST move to the **first menu item** when the context menu opens. The user MUST be able to navigate the menu with Arrow Up/Down and activate items with Enter or Space.
- BR-3: The context menu MUST be a proper `role="menu"` with `role="menuitem"` children (or `menuitemcheckbox` / `menuitemradio` as appropriate). The menu MUST follow APG menu keyboard patterns.
- BR-4: The context menu content MUST be context-sensitive. When triggered on a data cell, cell-relevant actions appear. When triggered on a column header, column-relevant actions appear. When triggered on a selected range, range-relevant actions appear.
- BR-5: Pressing **Escape** while the context menu is open MUST close the menu and return focus to the cell that triggered it (F-14.4).
- BR-6: Activating a menu item (Enter or Space on a menu item) MUST execute the action, close the menu, and return focus to the grid.
- BR-7: Shift+F10 MUST call `event.preventDefault()` to prevent the browser's native context menu from appearing.
- BR-8: The **Menu key** (context menu key on some keyboards, also known as the Application key) MUST behave identically to Shift+F10.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Context menu on a parent row MAY include "Expand All Below" and "Collapse All Below" actions. |
| Pivot Table | Context menu on dimension headers MAY include "Move to Rows" / "Move to Columns" for pivot reconfiguration. |
| Gantt Chart | Context menu on a task row MAY include "Add Dependency", "Set Milestone", and other Gantt-specific actions. |

**Editability Interaction**
- Shift+F10 in Edit Mode SHOULD close the editor (committing the edit) and open the context menu, or it SHOULD be ignored while in Edit Mode. The recommended behavior is to ignore Shift+F10 during Edit Mode (the user should Escape first, then Shift+F10). The exact behavior SHOULD be configurable.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Shift+F10 | Open context menu for focused cell/row | Navigation Mode |
| Menu key | Open context menu for focused cell/row (same as Shift+F10) | Navigation Mode |
| Escape | Close context menu, return focus to grid | Context menu open |
| Arrow Down | Move to next menu item | Context menu open |
| Arrow Up | Move to previous menu item | Context menu open |
| Enter / Space | Activate menu item, close menu | Context menu open |

**Accessibility**
- **ARIA**: The context menu MUST have `role="menu"`. Menu items MUST have `role="menuitem"`. The menu MUST have `aria-label` describing its purpose (e.g., "Cell actions" or "Column actions"). The triggering cell SHOULD reference the menu via `aria-haspopup="menu"` (though this is optional since the menu is invoked by keyboard shortcut, not a visible button).
- **Screen Reader**: SR: "Menu, [N] items" when the context menu opens. SR announces each menu item as the user navigates.
- **WCAG**: 2.1.1 (Keyboard -- context menu accessible via Shift+F10), 4.1.2 (menu role and items are properly conveyed).
- **Visual**: The context menu MUST appear as a floating overlay positioned near the focused cell. The first item MUST have a visible focus indicator. The menu MUST not be clipped by the grid's overflow boundaries.

**Chameleon 6 Status**: Existed (partially). Chameleon 6 had a configurable context menu. Chameleon 7 ensures full APG menu pattern compliance and context-sensitive content.

**Interactions**
- F-14.4 (Escape to Cancel): Escape closes the context menu.
- F-10 (Row Management): context menu may include row operations (insert, delete, duplicate).
- F-09 (Column Management): context menu on headers may include column operations.
- F-02 (Sorting): context menu on headers may include sort actions.
- F-03 (Filtering): context menu may include filter actions.

---

## 14.14 Keyboard Shortcut Customization [P1]

**Description**: The grid provides an API for developers to remap or extend the default keyboard shortcuts. This allows applications to avoid conflicts between grid shortcuts and application-level shortcuts, and to add domain-specific key bindings. Custom shortcuts MUST NOT override the mandatory APG key bindings (arrow keys, Tab, Enter, Escape, Space) unless explicitly opted in.

**Applies to**: All variants

**Use Cases**
- UC-1: An application uses Ctrl+D for a global "Duplicate" action, conflicting with the grid's potential Ctrl+D binding. The developer remaps the grid's duplicate shortcut to Ctrl+Shift+D.
- UC-2: A developer adds a custom Ctrl+Shift+N shortcut that triggers "New Row" within the grid.
- UC-3: A developer disables the Delete key's default behavior (clear cell) within the grid because their application uses Delete for a different purpose.

**Conditions of Use**
- The grid MUST expose a `keyboardShortcuts` configuration property (or equivalent API) that accepts an array of shortcut definitions.
- Customization MUST be available at initialization time and MUST support runtime updates.

**Behavioral Requirements**
- BR-1: The grid MUST accept a `keyboardShortcuts` configuration map that associates key combinations with action identifiers. Example: `{ "Ctrl+D": "duplicateRow", "Delete": null }` (where `null` disables the binding).
- BR-2: Custom shortcuts MUST override the default grid shortcuts for the same key combination.
- BR-3: The grid MUST provide a list of all built-in action identifiers (e.g., `"navigateDown"`, `"navigateUp"`, `"selectAll"`, `"enterEditMode"`, `"deleteCell"`, `"expandNode"`, `"collapseNode"`) so developers can remap them.
- BR-4: Setting a built-in shortcut to `null` MUST disable that shortcut. The key press MUST be ignored by the grid and allowed to propagate to the application.
- BR-5: Custom shortcuts MUST fire a `keyboardShortcutTriggered` event with the action identifier and the originating cell/row context. This allows the application to handle the action.
- BR-6: The grid SHOULD warn (via console or diagnostic event) if a developer overrides a mandatory APG key binding (Arrow keys, Tab, Enter, Escape, Space, Home, End, Page Up/Down) as this may break accessibility.
- BR-7: Shortcut matching MUST be modifier-aware: Ctrl, Shift, Alt, and Meta (Cmd on macOS) MUST be explicitly part of the binding definition. `"Ctrl+C"` MUST NOT match a bare `"C"` press.
- BR-8: The grid MUST support platform-adaptive bindings. The `"CmdOrCtrl"` alias SHOULD map to Ctrl on Windows/Linux and Cmd on macOS.

**Variant-Specific Behavior**

No variant-specific differences. Shortcut customization applies uniformly.

**Editability Interaction**
- Custom shortcuts SHOULD specify whether they apply in Navigation Mode, Edit Mode, or both. By default, custom shortcuts apply only in Navigation Mode. Applying a custom shortcut in Edit Mode requires explicit `mode: "edit"` or `mode: "both"` in the shortcut definition.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| (custom) | Developer-defined action | Configurable |

**Accessibility**
- **ARIA**: Custom shortcuts SHOULD be documented in the grid's `aria-describedby` or a help tooltip so assistive technology users can discover them. The grid SHOULD support an `aria-keyshortcuts` attribute on cells that have custom shortcut actions.
- **Screen Reader**: No automatic announcement for custom shortcuts. The application is responsible for documenting custom shortcuts in help text.
- **WCAG**: 2.1.1 (Keyboard -- custom shortcuts extend keyboard accessibility), 2.1.4 (Character Key Shortcuts, AAA -- custom single-character shortcuts MUST be remappable or disableable, which this feature inherently supports).
- **Visual**: No visual requirement for shortcut customization itself. Applications SHOULD display shortcut hints in tooltips or context menus.

**Chameleon 6 Status**: New. Chameleon 6 did not have shortcut customization. Chameleon 7 introduces this for application integration flexibility.

**Interactions**
- F-14.1 through F-14.13: all default keyboard behaviors can be remapped or extended.
- F-14.15 (Delete to Clear/Delete): Delete key behavior can be customized.

---

## 14.15 Delete to Clear/Delete [P0]

**Description**: The Delete key (and optionally Backspace) clears the content of the focused editable cell, or deletes selected rows when row deletion is enabled. The action depends on context: on an editable cell, Delete clears the cell's value to empty/null; on a selected row (with deletion enabled), Delete removes the row from the data set. Destructive row deletion SHOULD require confirmation.

**Applies to**: All variants

**Use Cases**
- UC-1: A user focuses on an editable "Notes" cell and presses Delete to clear its content to empty.
- UC-2: A user selects three rows in a contact list and presses Delete. A confirmation dialog appears; upon confirming, the three rows are removed.
- UC-3: A user focuses on a read-only cell and presses Delete. Nothing happens (the cell is not editable).
- UC-4: A user presses Backspace on an editable cell. The behavior matches Delete (clear cell content).

**Conditions of Use**
- `keyboardNavigationMode` MUST be `"select"` or `"focus"`.
- For cell clearing: the focused cell MUST be editable.
- For row deletion: `allowRowDeletion` (or equivalent property) MUST be `true`, and at least one row MUST be selected.
- The grid MUST be in Navigation Mode.

**Behavioral Requirements**
- BR-1: Pressing **Delete** on a focused **editable cell** MUST clear the cell's value to the column's default empty value (empty string for text, `null` for objects, `0` or `null` for numbers -- configurable per column). The grid MUST fire the edit lifecycle events (`before-edit` with trigger `"delete"`, then `commit` with the empty value).
- BR-2: Pressing **Delete** when one or more rows are **selected** and `allowRowDeletion` is `true` MUST initiate the row deletion workflow. If a confirmation dialog is configured, it MUST be displayed first. Upon confirmation, the selected rows MUST be removed.
- BR-3: When both cell-clear and row-delete are possible (editable cell is focused and rows are selected), the grid MUST resolve the ambiguity based on a configurable priority property (e.g., `deleteKeyAction: "clearCell" | "deleteRow" | "ask"`). The default SHOULD be `"clearCell"`.
- BR-4: **Backspace** SHOULD behave identically to Delete for cell clearing. Backspace MUST NOT trigger row deletion (to reduce accidental deletion risk).
- BR-5: Pressing Delete on a **non-editable cell** with no selected rows (or row deletion disabled) MUST have no effect.
- BR-6: After clearing a cell, focus MUST remain on the same cell. The cleared value MUST be displayed (empty cell). The grid MUST fire a `selectionChanged` event if the cleared value affects computed selection state (rare edge case).
- BR-7: After deleting rows, focus MUST move to the row that was immediately below the deleted row(s). If the deleted rows were at the bottom, focus MUST move to the new last row. If all rows are deleted, focus MUST move to the grid's empty-state message element or the column header.
- BR-8: Row deletion MUST be announced via a live region: SR: "[N] rows deleted". Cell clearing MUST be announced: SR: "[Column name] cleared".
- BR-9: Row deletion MUST be undoable via Ctrl+Z (if undo/redo is enabled, F-17).

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Deleting a parent row MUST also delete all its descendants (the entire subtree). The confirmation dialog MUST indicate the total number of rows being deleted (parent + all descendants). |
| Pivot Table | Cell clearing applies to value cells. Row deletion is typically not applicable in pivot tables (rows are generated from the pivot aggregation, not directly user-managed). |
| Gantt Chart | Deleting a task row removes the task from both the task list and the timeline. Deleting a summary task deletes all its sub-tasks. Dependencies referencing deleted tasks MUST be cleaned up. |

**Editability Interaction**
- In Edit Mode, Delete and Backspace are consumed by the editor (deleting characters). The grid MUST NOT intercept Delete/Backspace during Edit Mode.
- Cell clearing via Delete in Navigation Mode bypasses the editor: the grid sets the value directly to empty without opening the editor. The `before-edit` hook still fires, allowing the application to cancel the clear operation.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Delete | Clear focused editable cell OR delete selected rows (configurable) | Navigation Mode |
| Backspace | Clear focused editable cell (does NOT delete rows) | Navigation Mode |

**Accessibility**
- **ARIA**: After cell clearing, `aria-readonly` remains unchanged. After row deletion, `aria-rowcount` MUST be updated. Deleted rows are removed from the DOM.
- **Screen Reader**: Live region announcements: SR: "[Column name] cleared" for cell clearing. SR: "[N] rows deleted" for row deletion. If a confirmation dialog is shown, it MUST be a proper dialog with `role="alertdialog"` and focus management.
- **WCAG**: 2.1.1 (Keyboard -- deletion/clearing via keyboard), 3.3.4 (Error Prevention -- confirmation for destructive row deletion), 3.3.6 (Error Prevention, AAA -- all user-submitted deletions are confirmable and reversible).
- **Visual**: Cleared cells display their empty state. Deleted rows are removed from the visual display. If undo is available, a toast notification SHOULD appear: "Deleted [N] rows. Undo?" with a keyboard-accessible undo button.

**Chameleon 6 Status**: New. Chameleon 6 did not have built-in Delete key handling. Chameleon 7 introduces cell clearing and row deletion via keyboard.

**Interactions**
- F-07.1 (Inline Cell Editing): Delete clears without opening editor.
- F-07.6 (Edit Lifecycle Events): `before-edit` and `commit` fire during cell clear.
- F-10 (Row Management): row deletion via Delete integrates with row management.
- F-17 (Undo/Redo): Delete is undoable.
- F-14.14 (Keyboard Shortcut Customization): Delete key behavior can be remapped.
- F-08 (Selection): row deletion applies to selected rows.

---

## Complete Key Reference Table

The following table consolidates ALL keyboard interactions across ALL four variants and both focus models. Keys are grouped by functional area.

### Navigation Keys

| Key | Navigation Mode (Cell-Focus) | Navigation Mode (Row-Focus) | Edit Mode | Applicable Variants |
|-----|-----|-----|-----|-----|
| Arrow Down | Focus same column, next row | Focus next row | Consumed by editor | All |
| Arrow Up | Focus same column, previous row | Focus previous row | Consumed by editor | All |
| Arrow Right | Focus next cell in row | Expand collapsed parent / focus first child (expanded parent) / no-op (leaf) | Consumed by editor | All (row-focus tree behavior: Tree Grid, Gantt) |
| Arrow Left | Focus previous cell in row | Collapse expanded parent / focus parent (collapsed/leaf) / no-op (root collapsed) | Consumed by editor | All (row-focus tree behavior: Tree Grid, Gantt) |
| Home | Focus first cell in current row | No action | Consumed by editor (cursor to start) | All |
| End | Focus last cell in current row | No action | Consumed by editor (cursor to end) | All |
| Ctrl+Home | Focus first cell of first row | Focus first row | See F-14.7 | All |
| Ctrl+End | Focus last cell of last row | Focus last row | See F-14.7 | All |
| Page Down | Scroll down one viewport, focus same column | Scroll down one viewport, focus row | See F-14.8 | All |
| Page Up | Scroll up one viewport, focus same column | Scroll up one viewport, focus row | See F-14.8 | All |
| Tab | Exit grid to next focusable element | Exit grid to next focusable element | Commit + exit or next editable cell (configurable) | All |
| Shift+Tab | Exit grid to previous focusable element | Exit grid to previous focusable element | Commit + previous editable cell or exit (configurable) | All |

### Selection Keys

| Key | Navigation Mode (Cell-Focus) | Navigation Mode (Row-Focus) | Edit Mode | Applicable Variants |
|-----|-----|-----|-----|-----|
| Space | Toggle row/cell selection | Toggle row selection | Consumed by editor (type space) | All |
| Shift+Space | Select range from anchor to focused row | Select range from anchor to focused row | Consumed by editor | All |
| Ctrl+Space | Toggle focused row (multi-select) | Toggle focused row (multi-select) | Consumed by editor | All |
| Shift+Arrow Down | Extend selection downward | Extend selection downward | Consumed by editor | All |
| Shift+Arrow Up | Extend selection upward | Extend selection upward | Consumed by editor | All |
| Ctrl+A / Cmd+A | Select all visible rows | Select all visible rows | Select all text in editor | All |

### Editing Keys

| Key | Navigation Mode (Cell-Focus) | Navigation Mode (Row-Focus) | Edit Mode | Applicable Variants |
|-----|-----|-----|-----|-----|
| Enter | Enter Edit Mode (editable) / toggle sort (header) / activate action (read-only) / toggle expand/collapse (tree cell) | Toggle expand/collapse (tree) / Enter Edit Mode | Commit edit (optionally move down) | All |
| F2 | Enter Edit Mode (cursor at end) | Enter Edit Mode (cursor at end) | Return to Navigation Mode (preserve value) | All |
| Escape | No action (or deselect all if configured) | No action (or deselect all) | Cancel edit, revert value, return to Navigation Mode | All |
| Ctrl+Enter | No action | No action | Commit edit in multi-line editor | All |
| Printable character | Enter Edit Mode, clear value, begin typing | Enter Edit Mode, clear value, begin typing | Consumed by editor | All |
| Delete | Clear focused editable cell / delete selected rows | Clear focused editable cell / delete selected rows | Consumed by editor (delete character) | All |
| Backspace | Clear focused editable cell | Clear focused editable cell | Consumed by editor (delete character) | All |

### Tree/Hierarchy Keys

| Key | Navigation Mode (Cell-Focus) | Navigation Mode (Row-Focus) | Edit Mode | Applicable Variants |
|-----|-----|-----|-----|-----|
| + (plus) | Expand focused parent node | Expand focused parent node | Consumed by editor | Tree Grid, Gantt |
| - (minus) | Collapse focused parent node | Collapse focused parent node | Consumed by editor | Tree Grid, Gantt |
| * (asterisk) | Expand all descendants of focused node | Expand all descendants of focused node | Consumed by editor | Tree Grid, Gantt |

### Context and Special Keys

| Key | Navigation Mode (Cell-Focus) | Navigation Mode (Row-Focus) | Edit Mode | Applicable Variants |
|-----|-----|-----|-----|-----|
| Shift+F10 | Open context menu | Open context menu | Ignored (or commit + open, configurable) | All |
| Menu key | Open context menu (same as Shift+F10) | Open context menu | Ignored | All |

> **Note on macOS**: On macOS, Ctrl in key combinations is typically replaced by Cmd (Command). The grid MUST support both Ctrl and Cmd for all Ctrl-based shortcuts on macOS. The `keyboardShortcuts` API supports `"CmdOrCtrl"` as a platform-adaptive modifier alias.

> **Note on RTL**: In right-to-left layouts, Arrow Left and Arrow Right are logically swapped. Arrow Right moves to the *start* of the row (first cell) and Arrow Left moves toward the *end*. The grid MUST detect the `dir` attribute and adapt arrow key behavior accordingly.
