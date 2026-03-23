# F-07: Cell Editing

Cell editing provides the interactive editing experience that allows users to modify data directly within the grid. This feature category covers the concrete editing workflows -- inline cell editing, full-row editing, trigger configuration, built-in and custom editors, lifecycle events, batch editing, clipboard paste, conditional editability, and spreadsheet-style row creation.

All four variants (Data Grid, Tree Grid, Pivot Table, Gantt Chart) support cell editing with variant-specific adaptations documented per feature.

> **Foundations**: This feature builds on the editability model defined in [FD-03: Editability Model](../01-foundations/03-editability-model.md), which specifies Navigation Mode vs Edit Mode, the two-level focus model, the editor lifecycle phases, ARIA contracts, and the custom editor interface. This document defines the user-facing features that exercise that model.

> **Prerequisites**: [FD-01: Layout Model](../01-foundations/01-layout-model.md) constrains editors to fit within the CSS subgrid cell area. [FD-04: Accessibility Foundation](../01-foundations/04-accessibility-foundation.md) defines the roving tabindex strategy and baseline ARIA structure.

---

## 7.1 Inline Cell Editing (Click-to-Edit) [P0]

**Description**: The user activates a single cell to enter Edit Mode, transforming the cell's display content into an editor widget in place. This is the most common editing pattern: the user double-clicks (or otherwise triggers) a cell, edits the value, and commits or cancels. Only one cell is in Edit Mode at a time. The editor replaces the cell renderer within the same grid cell area.

**Applies to**: All variants

**Use Cases**
- UC-1: A user double-clicks a "Name" cell in a contacts Data Grid to correct a misspelling, types the fix, and presses Enter to commit.
- UC-2: A user clicks a "Status" cell in a Tree Grid to change a task's status from "In Progress" to "Done" using a dropdown editor.
- UC-3: A project manager edits a "Start Date" cell in a Gantt Chart task list; the timeline bar repositions to reflect the updated date.
- UC-4: An analyst corrects a data-entry error in a Pivot Table value cell; the aggregated totals recalculate after commit.

**Conditions of Use**
- The cell MUST be editable per the layered editability evaluation in [FD-03](../01-foundations/03-editability-model.md), Section 3 (grid-level, column-level, row-level, and cell-level checks all permit editing).
- The grid MUST be configured with at least one editable column.
- The edit trigger MUST match the configured activation method (see F-07.3).

**Behavioral Requirements**
- BR-1: When the user activates an editable cell via the configured trigger (F-07.3), the grid MUST transition from Navigation Mode to Edit Mode on that cell. The cell's display content MUST be replaced by the appropriate editor widget.
- BR-2: The editor widget MUST receive focus automatically when it appears. For text-based editors, the cursor MUST be placed at the end of the existing value (or all text selected, depending on trigger -- see F-07.3).
- BR-3: Only ONE cell MAY be in Edit Mode at a time (excluding full-row editing, F-07.2). Activating a different cell while one is being edited MUST commit the current edit (as if the user pressed Enter) before entering Edit Mode on the new cell.
- BR-4: The editor MUST receive the **raw data value**, not the formatted display value, per [FD-03](../01-foundations/03-editability-model.md), Section 4.2.
- BR-5: Pressing **Enter** MUST commit the edit and return focus to the gridcell in Navigation Mode.
- BR-6: Pressing **Escape** MUST cancel the edit, revert to the original value, and return focus to the gridcell in Navigation Mode. Escape MUST always work (WCAG 2.1.2: No Keyboard Trap).
- BR-7: Pressing **Tab** MUST commit the edit and advance focus to the next editable cell in reading order, entering Edit Mode on that cell (when `tabNavigationMode` is `"cell"`, per [FD-03](../01-foundations/03-editability-model.md), Section 7).
- BR-8: Clicking outside the cell being edited MUST commit the current edit. If the click target is another editable cell, the grid MUST enter Edit Mode on the clicked cell.
- BR-9: The grid MUST emit the full lifecycle event sequence defined in [FD-03](../01-foundations/03-editability-model.md), Section 6: `before-edit`, `value-change` (during), `commit` or `cancel`.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | The editor widget MUST be positioned to the right of the expand/collapse control and indentation spacing. Indentation MUST NOT collapse when the editor is active. Editing a parent cell MUST NOT affect the collapsed/expanded state of its children. |
| Pivot Table | Only value cells (data intersections) are typically editable. Dimension header cells (row/column labels that define the pivot axes) are NOT editable by default. Editing a value cell SHOULD trigger recalculation of affected aggregates via the `commit` lifecycle hook. |
| Gantt Chart | Editing a date cell (start date, end date, duration) in the task list MUST cause the corresponding timeline bar to update its position and width to reflect the new dates. |

**CSS Subgrid Implications**

The editor widget MUST fit within the cell's CSS grid area without altering column track widths or row heights (per [FD-01](../01-foundations/01-layout-model.md)). Because each row uses `display: grid; grid-template-columns: subgrid; grid-column: 1 / -1`, the editor is constrained to the column track width. If the editor content exceeds the cell area (e.g., a large text area or a date picker dropdown), it MUST use an overlay/popover positioned relative to the cell rather than expanding the grid track.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Enter | Commit edit, return to Navigation Mode | Edit Mode |
| Escape | Cancel edit, revert value, return to Navigation Mode | Edit Mode |
| F2 | Toggle between Navigation Mode and Edit Mode | Both |
| Tab | Commit edit, move to next editable cell, enter Edit Mode | Edit Mode |
| Shift+Tab | Commit edit, move to previous editable cell, enter Edit Mode | Edit Mode |

**Accessibility**
- **ARIA**: The editable cell MUST have `aria-readonly="false"`. When the editor is active, focus moves to the editor input, which MUST have an accessible name derived from the column header (via `aria-labelledby` or `aria-label`). The cell's `aria-readonly` attribute does not change during editing -- it already indicates editability.
- **Screen Reader**: SR: "[Column Name]. [Current Value]. [Editor Type]." when entering Edit Mode (triggered by focus moving to the editor input). SR: "[Column Name] changed to [New Value]" on successful commit (via `role="status"` live region). SR: "Edit cancelled" on Escape (via live region).
- **WCAG**: 1.3.1 (editor structure programmatically determinable), 1.4.1 (Edit Mode visual indicator not color-only), 2.1.1 (all editing keyboard-accessible), 2.1.2 (Escape always exits Edit Mode), 2.4.7 (editor input has visible focus), 3.2.2 (commit is explicit, not on each keystroke), 4.1.2 (editor has accessible name, role, value).
- **Visual**: The cell MUST display a distinct visual indicator when in Edit Mode (e.g., a different border style, inset shadow, or background change) that does not rely on color alone. The transition SHOULD be animated but MUST respect `prefers-reduced-motion: reduce`.

**Chameleon 6 Status**: Existed (partially). Chameleon 6 had `rowDoubleClicked` event and a `rich` cell type with selector/drag/actions, but no built-in inline cell editing framework with automatic editor rendering. The editing workflow was application-managed. Chameleon 7 introduces a complete built-in editing system with lifecycle management.

**Interactions**
- F-07.2 (Full-Row Editing): full-row mode extends single-cell inline editing to all cells in a row.
- F-07.3 (Edit Triggers): determines which user action activates inline editing.
- F-07.4 (Built-In Editor Types): determines which editor widget appears.
- F-07.5 (Custom Cell Editors): custom editor replaces the built-in editor.
- F-07.6 (Edit Lifecycle Events): lifecycle hooks fire during inline editing.
- F-07.9 (Conditional Editability): determines whether the clicked cell can be edited.
- F-02 (Sorting): sort is deferred while a cell is in Edit Mode.
- F-08 (Selection): editing a cell typically selects it; selection state is preserved during editing.
- F-11 (Virtualization): the editing cell MUST be pinned in the DOM while in Edit Mode, not recycled by the virtual scroller.
- F-14 (Keyboard Navigation): Navigation Mode key bindings are suspended during Edit Mode.
- F-18 (Validation): validation runs during the Commit lifecycle phase.

---

## 7.2 Full-Row Editing Mode [P1]

**Description**: All editable cells in a row become active editors simultaneously, allowing the user to edit multiple fields as a logical unit. The row displays Save and Cancel action buttons (or equivalent affordances) for the user to commit or discard all changes at once. This mode is useful when fields are interdependent (e.g., start date and end date must be consistent) and must be validated or submitted together.

**Applies to**: All variants

**Use Cases**
- UC-1: A user clicks "Edit" on an employee record row. All fields (name, department, salary, start date) become editable. The user modifies several fields, then clicks "Save" to commit all changes as a unit.
- UC-2: A user begins editing a row but realizes the changes are incorrect. Clicking "Cancel" reverts all fields in the row to their original values.
- UC-3: In a Gantt Chart task list, a project manager edits the task name, start date, end date, and assignee in a single editing session, ensuring consistency before committing.

**Conditions of Use**
- Full-row editing MUST be enabled via a grid-level or row-level configuration property (e.g., `editMode: "row"`).
- When `editMode` is `"row"`, the single-cell inline editing trigger (F-07.1) MUST activate full-row editing instead of single-cell editing.
- At most ONE row MAY be in full-row Edit Mode at a time.

**Behavioral Requirements**
- BR-1: When full-row editing is activated, ALL editable cells in the target row MUST simultaneously display their editor widgets. Non-editable cells in the row MUST remain in display (read-only) mode.
- BR-2: The grid MUST display Save and Cancel action affordances (buttons, icons, or keyboard shortcuts) associated with the editing row. These controls MAY appear in a dedicated actions column, as an inline toolbar within the row, or as floating buttons adjacent to the row.
- BR-3: Pressing the Save button (or Enter when not inside a multi-line editor) MUST commit all edited values in the row simultaneously. The commit MUST fire a single `row-edit-committed` event containing the complete set of old and new values for all modified cells.
- BR-4: Pressing the Cancel button (or Escape) MUST revert ALL cells in the row to their original values and exit full-row Edit Mode. No partial commits are allowed in full-row mode.
- BR-5: Tab and Shift+Tab MUST cycle focus between the editable cells within the row, without leaving the row or committing. Focus MUST wrap within the row (from the last editable cell, Tab moves to the Save button or first editable cell, depending on configuration).
- BR-6: If the user attempts to navigate away from the editing row (e.g., clicking another row, pressing arrow keys), the grid MUST either auto-commit or prompt the user, based on configuration. The default behavior SHOULD be to prompt (a confirmation dialog or visual warning).
- BR-7: The grid MUST NOT allow entering Edit Mode on a different row while one row is already in full-row editing. The current row's edit MUST be committed or cancelled first.
- BR-8: The `before-edit` lifecycle hook MUST fire once for the row (not per cell) with context indicating all cells that will become editable. Calling `cancel()` on the hook MUST prevent all editors from appearing.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Full-row editing applies to the cells of the activated row only. Child rows are NOT affected. The expand/collapse control remains functional (in read-only state) during full-row editing. |
| Pivot Table | Full-row editing applies to value cells in the activated row. Dimension header cells remain read-only. Save triggers aggregate recalculation for all modified values. |
| Gantt Chart | Full-row editing in the task list updates the timeline bar after Save. The bar position MUST NOT update until Save is pressed (edits are transactional). |

**CSS Subgrid Implications**

All editors in the row MUST fit within their respective cell grid areas. The row height MAY increase slightly to accommodate taller editor widgets (e.g., dropdowns), but the height change MUST be uniform across the entire row (since the row is a single grid row spanning all column tracks via subgrid). Save/Cancel buttons, if placed in a dedicated column, occupy their own column track.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Tab | Move focus to the next editable cell in the row (wrapping to action buttons) | Full-Row Edit Mode |
| Shift+Tab | Move focus to the previous editable cell in the row (wrapping) | Full-Row Edit Mode |
| Enter | Commit all edits in the row (when focus is not in a multi-line editor) | Full-Row Edit Mode |
| Escape | Cancel all edits in the row, revert all values | Full-Row Edit Mode |
| Ctrl+Enter | Commit all edits (always, even from within a multi-line editor) | Full-Row Edit Mode |

**Accessibility**
- **ARIA**: ALL editable cells in the editing row MUST have `aria-readonly="false"`. The Save and Cancel buttons MUST have accessible labels (`aria-label="Save changes to this row"`, `aria-label="Cancel editing this row"`). The row SHOULD have `aria-selected="true"` or a distinguishing attribute to indicate it is the active editing row.
- **Screen Reader**: SR: "Editing row [row number]. [N] editable fields. Tab to navigate between fields." when full-row editing begins (via live region). SR: "Row [row number] saved with [N] changes" on Save. SR: "Row editing cancelled" on Cancel.
- **WCAG**: 2.1.1 (all editing and Save/Cancel actions keyboard-accessible), 2.1.2 (Escape always cancels and exits), 2.4.7 (visible focus on active editor and Save/Cancel buttons), 3.2.2 (commit requires explicit Save action, not automatic).
- **Visual**: The entire editing row MUST be visually distinguished from non-editing rows (e.g., a highlight background, a border, or an elevated shadow). This distinction MUST NOT rely on color alone. Save and Cancel buttons MUST be clearly visible and labeled.

**Chameleon 6 Status**: New. Chameleon 6 had no built-in full-row editing mode. Chameleon 7 introduces this as a configurable editing paradigm.

**Interactions**
- F-07.1 (Inline Cell Editing): full-row mode replaces single-cell mode when `editMode` is `"row"`.
- F-07.3 (Edit Triggers): the configured trigger activates the entire row, not a single cell.
- F-07.6 (Edit Lifecycle Events): lifecycle fires at the row level with all affected cells.
- F-07.7 (Batch Editing): full-row editing is a form of transactional editing at the row level; batch editing extends this to multiple rows.
- F-07.9 (Conditional Editability): non-editable cells within the row remain in display mode.
- F-14 (Keyboard Navigation): arrow keys are suspended during full-row editing; Tab navigates within the row.
- F-17 (Undo/Redo): a full-row save pushes a single compound entry onto the undo stack.
- F-18 (Validation): row-level validation runs on Save, potentially blocking the commit.

---

## 7.3 Edit Triggers [P0]

**Description**: Configurable user actions that activate Edit Mode on a cell. Supported triggers include double-click, single-click, Enter key, F2 key, and typing an alphanumeric character. Different triggers have different behavioral nuances: F2 enters edit mode without clearing the value; typing an alphanumeric character replaces the current value with the typed character. Activation occurs on the click event, not mousedown, to comply with WCAG 2.5.2 (Pointer Cancellation).

**Applies to**: All variants

**Use Cases**
- UC-1: A spreadsheet-like data entry application configures single-click trigger so users can begin editing immediately upon selecting a cell.
- UC-2: A data review application configures double-click trigger to prevent accidental edits while users browse data.
- UC-3: A power user presses F2 to enter edit mode on a cell, positioning the cursor at the end of the value to append text.
- UC-4: A data entry operator types a digit while a number cell is focused, replacing the value and immediately entering edit mode -- mimicking spreadsheet behavior.

**Conditions of Use**
- The grid MUST accept a configuration property for the edit trigger (e.g., `editTrigger: "doubleClick" | "singleClick" | "programmatic"`).
- Keyboard triggers (Enter, F2, alphanumeric) MUST always be active regardless of the mouse-based trigger configuration. These are mandated by the WAI-ARIA APG grid pattern.
- The cell MUST be editable per the conditions in [FD-03](../01-foundations/03-editability-model.md), Section 3.

**Behavioral Requirements**
- BR-1: When `editTrigger` is `"doubleClick"` (default), the grid MUST enter Edit Mode on a `dblclick` event on an editable cell. A single click MUST NOT enter Edit Mode; it MUST select the cell (per F-08) and set focus.
- BR-2: When `editTrigger` is `"singleClick"`, the grid MUST enter Edit Mode on a `click` event on an editable cell. The grid MUST differentiate between a click to select (moving focus) and a click to edit. When the cell does not already have focus, the first click MUST set focus (select) and a second click MUST enter Edit Mode. When the cell already has focus, a click MUST enter Edit Mode.
- BR-3: The **Enter** key MUST enter Edit Mode on the focused editable cell. The editor MUST display the current value with all text selected (for text-based editors) or in its default interactive state (for select/checkbox editors).
- BR-4: The **F2** key MUST enter Edit Mode on the focused editable cell. The editor MUST display the current value with the cursor positioned at the **end** of the value (for text-based editors), NOT selecting all text. This allows the user to append to the existing value.
- BR-5: When the user presses an **alphanumeric or printable character key** on a focused editable cell in Navigation Mode, the grid MUST enter Edit Mode, **clear the current value**, and begin editing with the pressed character as the initial input. This enables rapid data entry.
- BR-6: Mouse-based edit triggers (single-click, double-click) MUST execute on the `click` / `dblclick` event, NOT on `mousedown` or `pointerdown`. This satisfies WCAG 2.5.2 (Pointer Cancellation): the user can press the mouse button, realize they clicked the wrong cell, drag the pointer away, and release without triggering the edit.
- BR-7: Touch-based edit triggers MUST follow the same pattern: activation on `touchend` or the equivalent `click` event, not on `touchstart`.
- BR-8: The `before-edit` lifecycle event ([FD-03](../01-foundations/03-editability-model.md), Section 6.1) MUST include the `trigger` property indicating which action initiated the edit (`"enter"`, `"f2"`, `"alphanumeric"`, `"doubleclick"`, `"singleclick"`, `"api"`). This allows the application to customize behavior based on trigger type.
- BR-9: When `editTrigger` is `"programmatic"`, no mouse or keyboard action enters Edit Mode. Only the API can trigger editing. This is used for grids where editing is controlled by external UI (e.g., an "Edit" button in a toolbar).

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Double-click on the expand/collapse control MUST toggle the node, NOT enter Edit Mode, even on an editable cell. The click target MUST be disambiguated: the control region triggers expand/collapse; the content region triggers edit. |
| Gantt Chart | Double-click on a timeline bar MAY open a task detail editor (a separate interaction, not inline cell editing). This does not conflict with task list cell edit triggers. |

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Enter | Enter Edit Mode with current value selected | Navigation Mode, focus on editable cell |
| F2 | Enter Edit Mode with cursor at end of value | Navigation Mode, focus on editable cell |
| Any printable character | Enter Edit Mode, clear value, begin typing | Navigation Mode, focus on editable cell |
| Double-click | Enter Edit Mode (when `editTrigger` is `"doubleClick"`) | Navigation Mode, pointer on editable cell |
| Single-click | Enter Edit Mode (when `editTrigger` is `"singleClick"` and cell already focused) | Navigation Mode, pointer on focused editable cell |

**Accessibility**
- **ARIA**: No additional ARIA attributes are required for trigger configuration. The cell's `aria-readonly="false"` signals editability regardless of the trigger mechanism.
- **Screen Reader**: When an editable cell receives focus in Navigation Mode, the screen reader SHOULD announce: SR: "[Column Name]. [Value]. Editable." The "Editable" indication comes from `aria-readonly="false"` being present, which AT typically interprets and announces.
- **WCAG**: 2.1.1 (editing is keyboard-accessible via Enter, F2, and alphanumeric keys regardless of mouse trigger configuration), 2.5.2 (Pointer Cancellation: activation on click/dblclick, not mousedown), 3.2.1 (On Focus: merely focusing a cell MUST NOT enter Edit Mode; activation is always explicit).
- **Visual**: On hover over an editable cell, the cursor SHOULD change to indicate editability (e.g., `cursor: text` for text cells, `cursor: pointer` for checkbox/select cells). This hover affordance provides a visual cue about the trigger before the user clicks.

**Chameleon 6 Status**: Existed (partially). Chameleon 6 provided `rowDoubleClicked` event for detecting edit intent, but the actual editing workflow was application-managed. Chameleon 7 introduces configurable built-in edit triggers with automatic editor rendering.

**Interactions**
- F-07.1 (Inline Cell Editing): triggers determine when inline editing activates.
- F-07.2 (Full-Row Editing): triggers activate row-level editing when `editMode` is `"row"`.
- F-07.5 (Custom Cell Editors): custom editors receive the `trigger` type in their initialization parameters.
- F-07.6 (Edit Lifecycle Events): `before-edit` event includes the trigger type.
- F-08 (Selection): single-click selects a cell; the click-to-edit trigger must not conflict with click-to-select.
- F-14 (Keyboard Navigation): Enter and F2 on editable cells route to editing; on non-editable cells, these keys perform Navigation Mode actions.

---

## 7.4 Built-In Editor Types [P0]

**Description**: The grid provides pre-built editor widgets for common data types: text input, number input, date picker, select/dropdown, checkbox, and large text area. The appropriate editor is auto-selected based on the column's `dataType` property, but can be overridden per column. Each built-in editor receives the raw data value (not the formatted display value), manages its own input validation (type coercion, range constraints), and returns a typed value on commit.

**Applies to**: All variants

**Use Cases**
- UC-1: A "Name" column with `dataType: "string"` automatically renders a text input editor when the user enters Edit Mode.
- UC-2: A "Price" column with `dataType: "number"` renders a number input with min/max/step constraints configured in the column definition.
- UC-3: A "Due Date" column with `dataType: "datetime"` renders a date picker editor that the user can interact with via keyboard or mouse.
- UC-4: A "Status" column with `dataType: "string"` and a `cellEditorType: "select"` override renders a dropdown with predefined options.
- UC-5: A "Completed" column with `dataType: "boolean"` renders a checkbox editor that toggles on Enter or Space.
- UC-6: A "Notes" column with `cellEditorType: "textarea"` renders a large text area as an overlay for multi-line editing.

**Conditions of Use**
- The column definition MUST have a `dataType` property for automatic editor selection, OR a `cellEditorType` property to explicitly specify the editor.
- When both `dataType` and `cellEditorType` are provided, `cellEditorType` takes precedence.
- The column definition MAY include editor-specific parameters (e.g., `editorParams: { min: 0, max: 100, step: 1 }` for number inputs, or `editorParams: { options: [...] }` for select editors).

**Behavioral Requirements**
- BR-1: The grid MUST provide the following built-in editor types and their default mappings:

| Editor Type | Default for `dataType` | HTML Element(s) | Value Type |
|-------------|----------------------|------------------|------------|
| Text input | `"string"` | `<input type="text">` | `string` |
| Number input | `"number"` | `<input type="number">` or constrained `<input type="text">` | `number` |
| Date picker | `"datetime"` | `<input type="date">` or custom date component | `Date` or ISO string |
| Select / Dropdown | (no default; explicit via `cellEditorType`) | `<select>` or custom listbox | `string` or `number` |
| Checkbox | `"boolean"` | `<input type="checkbox">` | `boolean` |
| Large text area | (no default; explicit via `cellEditorType`) | `<textarea>` | `string` |

- BR-2: Each editor MUST receive the **raw data value** on initialization. For example, a number editor receives `1234.56`, not the formatted display string `"$1,234.56"`. The editor MUST return the raw typed value on commit.
- BR-3: The text input editor MUST select all text when entering Edit Mode via Enter. When entering via F2, the cursor MUST be positioned at the end. When entering via alphanumeric key, the value MUST be cleared and replaced with the typed character.
- BR-4: The number input editor MUST enforce `min`, `max`, and `step` constraints when configured. Values outside the range MUST be rejected on commit (via the commit lifecycle phase) and the editor MUST remain open with a validation message.
- BR-5: The date picker editor MUST support keyboard navigation within the date widget. The date format displayed in the editor SHOULD respect the grid's locale configuration (F-13). The committed value MUST be a `Date` object or an ISO 8601 string, regardless of the display format.
- BR-6: The select/dropdown editor MUST display the list of options provided in `editorParams.options`. The currently selected value MUST be highlighted when the dropdown opens. Arrow keys MUST navigate between options. Enter or click MUST select an option and commit the edit.
- BR-7: The checkbox editor MUST toggle on **Space** (standard checkbox behavior) and commit immediately. Enter SHOULD also toggle and commit. The checkbox does not require a separate commit step since the toggle IS the edit.
- BR-8: The textarea editor MUST render as an overlay or popover positioned relative to the cell, since multi-line content typically exceeds the cell height. Escape MUST cancel, and **Ctrl+Enter** (or **Cmd+Enter** on macOS) MUST commit (since Enter inserts a newline in a textarea).
- BR-9: All built-in editors MUST implement the `CellEditor` interface defined in [FD-03](../01-foundations/03-editability-model.md), Section 4.3.
- BR-10: The grid MUST allow the developer to override the default editor for any column by specifying `cellEditorType` in the column definition. For example, a `"string"` column can be overridden to use `"select"` or `"textarea"`.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | The first column (with the expand/collapse control) MUST position the editor to the right of the control and indentation. The editor width MUST account for the indentation offset. |
| Pivot Table | Editors for value cells SHOULD support numeric types predominantly, since pivot values are typically aggregated numbers. The `editorParams` MAY include precision/decimal configuration for numeric editors. |
| Gantt Chart | Date picker editors in the task list SHOULD visually indicate the timeline impact. A date change preview on the timeline (before commit) is a SHOULD requirement. |

**CSS Subgrid Implications**

All built-in editors MUST fit within the cell's CSS grid area. Text input, number input, and select editors MUST render at 100% width of the cell content area with appropriate padding. The textarea editor, date picker popup, and select dropdown list use overlay positioning (via `position: absolute` or CSS anchor positioning) and are NOT constrained by the cell's grid area -- only the trigger element is.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Enter | Commit edit (text, number, date, select) / Toggle (checkbox) | Edit Mode |
| Escape | Cancel edit, revert value | Edit Mode |
| Space | Toggle (checkbox) / Type space character (text, textarea) | Edit Mode |
| Arrow Up/Down | Increment/decrement (number) / Navigate options (select) / Cursor movement (textarea) | Edit Mode |
| Ctrl+Enter (Cmd+Enter) | Commit edit (textarea, where Enter inserts a newline) | Edit Mode (textarea) |

**Accessibility**
- **ARIA**: Each editor input MUST have an accessible name derived from the column header (via `aria-labelledby` pointing to the column header element, or `aria-label` matching the column name). Select editors MUST use `role="listbox"` with `role="option"` children (or native `<select>`). Checkbox editors MUST use the native `<input type="checkbox">` or `role="checkbox"` with proper `aria-checked` state.
- **Screen Reader**: SR: "[Column Name]. [Current Value]. [Editor Type] editor." when the editor receives focus. For select editors: SR: "[Option Name], [N] of [Total] options." when navigating the list. For checkbox: SR: "[Column Name]. [Checked/Not checked]. Checkbox."
- **WCAG**: 1.3.1 (editor structure determinable), 1.3.5 (input purpose identifiable where applicable via `autocomplete`), 2.1.1 (all editors fully keyboard-operable), 3.3.2 (editor has label), 4.1.2 (name, role, value exposed for all editor types).
- **Visual**: Each editor type MUST be visually distinguishable (text field border, dropdown arrow for select, checkbox appearance). Focus indicators MUST be visible on all editors (WCAG 2.4.7).

**Chameleon 6 Status**: New. Chameleon 6 had a `rich` cell type allowing selector and action buttons, but no built-in editor type system with automatic type-based selection. Chameleon 7 introduces a complete set of built-in editors with automatic dataType mapping.

**Interactions**
- F-07.1 (Inline Cell Editing): built-in editors are rendered during inline editing.
- F-07.2 (Full-Row Editing): multiple built-in editors render simultaneously in full-row mode.
- F-07.3 (Edit Triggers): trigger type determines initial editor state (selected text vs cursor at end vs cleared value).
- F-07.5 (Custom Cell Editors): custom editors replace built-in editors when specified.
- F-01 (Data Display & Rendering): cell renderers produce the display format; editors work with the raw value underneath.
- F-15 (Theming & Styling): editor appearance MUST be stylable via CSS custom properties and CSS Parts.
- F-18 (Validation): editor-level constraints (min/max/step) are validated during the commit phase.

---

## 7.5 Custom Cell Editors [P0]

**Description**: The developer provides a custom editor component that replaces the built-in editor for specific columns or cells. The custom editor receives the cell value, row data, and column definition, and must implement a minimal interface (`focus()`, `getValue()`, `cancel()`) so the grid can manage its lifecycle. Custom editors enable domain-specific editing experiences such as color pickers, rating widgets, address lookups, rich text editors, or any bespoke input.

**Applies to**: All variants

**Use Cases**
- UC-1: A "Color" column uses a custom color picker editor that displays a color swatch palette and returns a hex color code.
- UC-2: A "Rating" column uses a custom star-rating editor that allows the user to select 1-5 stars via keyboard or mouse.
- UC-3: An "Address" column uses a custom editor with autocomplete that queries a geocoding API as the user types.
- UC-4: A "Tags" column uses a custom multi-select chip editor where the user can add and remove tags.
- UC-5: A "Rich Notes" column uses a custom rich text editor with formatting controls.

**Conditions of Use**
- The column definition MUST accept a `cellEditor` property that specifies the custom editor component (class, constructor function, or component tag name).
- The custom editor MUST implement the `CellEditor` interface defined in [FD-03](../01-foundations/03-editability-model.md), Section 4.3.
- The grid MUST pass an `EditorParams` object to the editor's `init()` method containing: `value` (raw cell value), `rowData` (complete row data), `columnDef` (column definition), `rowIndex`, `colIndex`, `trigger` (what initiated the edit), and a `commitEdit()` callback.

**Behavioral Requirements**
- BR-1: The grid MUST instantiate the custom editor component when a cell using it enters Edit Mode. The editor MUST be rendered inside the cell's DOM area (or as an overlay anchored to the cell).
- BR-2: The grid MUST call the editor's `init(params)` method immediately after mounting, passing the `EditorParams` object. The `init()` method MUST return the focusable HTML element that should receive initial focus.
- BR-3: The grid MUST call the editor's `getValue()` method when the edit is committed (Enter, Tab, or external commit). The returned value is passed through the commit lifecycle phase.
- BR-4: The grid MUST call the editor's `isValid()` method before accepting the committed value. If `isValid()` returns `false`, the edit MUST NOT be committed and the editor MUST remain open.
- BR-5: The grid MUST call the editor's `destroy()` method when the editor is removed (after commit, cancel, or if the cell is scrolled out of the virtual window during editing). The `destroy()` method MUST clean up event listeners and any external resources.
- BR-6: If the editor implements the optional `handlesKey(event)` method, the grid MUST call it before processing key events during Edit Mode. If `handlesKey()` returns `true`, the grid MUST NOT handle that key (the editor handles it internally). This allows custom editors to intercept keys that the grid would otherwise consume (e.g., arrow keys in a custom multi-select).
- BR-7: If the editor implements the optional `selectAll()` method, the grid MUST call it when the edit is triggered by Enter (to select all content). If the method is not implemented, the grid SHOULD NOT attempt to select content.
- BR-8: The grid MUST provide a `commitEdit()` callback in the `EditorParams` that the custom editor can call to programmatically trigger a commit (e.g., after the user selects a color in a color picker). This allows editors that commit on selection rather than on Enter.
- BR-9: Custom editors MUST participate in the same lifecycle event flow as built-in editors. The `before-edit`, `value-change`, `commit`, and `cancel` events all fire normally.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | The `EditorParams` includes `level` (hierarchy depth) and `isExpanded` (node state) in the `rowData` context, so the custom editor can adapt its behavior based on the tree position. |
| Pivot Table | The `EditorParams` includes `aggregationContext` (the dimension path leading to this cell), allowing custom editors to provide context-aware editing (e.g., showing only values valid for that dimension intersection). |
| Gantt Chart | Custom editors for date fields receive `timelineContext` in `EditorParams`, including the visible timeline range, so the editor can constrain date selection to the visible range or highlight the bar being affected. |

**CSS Subgrid Implications**

Custom editors MUST respect the same sizing constraints as built-in editors: the editor's trigger/inline element fits within the cell's CSS grid area, and any popover/overlay portions are positioned absolutely and do not affect grid track sizing.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| (Delegated to the custom editor via `handlesKey()`) | Custom editor defines its own key handling | Edit Mode |
| Escape | Cancel edit (grid-handled, always works even if editor does not implement it) | Edit Mode |
| Enter | Commit edit (grid-handled, unless editor's `handlesKey()` claims it) | Edit Mode |

**Accessibility**
- **ARIA**: The custom editor's focusable element MUST have an accessible name. The grid provides `aria-labelledby` pointing to the column header. If the custom editor renders its own label, it MUST associate it with the input via `aria-labelledby` or `aria-label`. The editor MUST expose the correct ARIA role (e.g., `role="combobox"` for an autocomplete, `role="slider"` for a rating widget).
- **Screen Reader**: The custom editor is responsible for its own screen reader announcements for internal interactions (e.g., announcing selected color, current rating star). The grid handles mode-transition announcements (entering/exiting Edit Mode) and commit/cancel announcements.
- **WCAG**: 4.1.2 (custom editor widget MUST expose name, role, value), 2.1.1 (custom editor MUST be fully keyboard-operable), 2.1.2 (Escape always returns to Navigation Mode -- the grid enforces this regardless of the editor), 1.3.1 (editor structure programmatically determinable).
- **Visual**: Custom editors SHOULD follow the grid's visual theme for consistency. The grid exposes CSS custom properties that custom editors MAY use for colors, borders, and fonts.

**Chameleon 6 Status**: New. Chameleon 6 allowed custom cell content via the `rich` cell type with arbitrary HTML, but there was no formal custom editor interface or lifecycle. Chameleon 7 introduces a standardized `CellEditor` interface that custom editors implement.

**Interactions**
- F-07.1 (Inline Cell Editing): custom editors replace built-in editors during inline editing.
- F-07.4 (Built-In Editor Types): custom editors take precedence when both `cellEditor` and `dataType` are specified.
- F-07.6 (Edit Lifecycle Events): custom editors participate in the same lifecycle.
- F-15 (Theming & Styling): custom editors can use the grid's CSS custom properties for consistent theming.
- F-18 (Validation): `isValid()` integrates with the grid's validation system.

---

## 7.6 Edit Lifecycle Events [P0]

**Description**: The grid emits events at each stage of the editing lifecycle: before-edit (cancelable), value-change (during editing), after-edit (committed), and edit-cancelled. These events allow the application to intercept, validate, transform, or react to edits at precise points in the workflow. The `before-edit` event can prevent entering Edit Mode entirely. The `commit` event receives both old and new values and can reject the change.

**Applies to**: All variants

**Use Cases**
- UC-1: An application listens to `before-edit` to check user permissions. If the user lacks write access to the column, the handler calls `cancel()` and the cell does not enter Edit Mode.
- UC-2: An application listens to `value-change` to provide real-time validation feedback (e.g., displaying a character count or warning as the user types).
- UC-3: An application listens to `after-edit` to send the updated value to a backend API, then updates a "Last Modified" column.
- UC-4: An application listens to `edit-cancelled` to log audit events, even for cancelled edits.
- UC-5: An application uses `before-edit` to conditionally lock cells based on another cell's value (e.g., a "Total" cell is only editable when the "Override" checkbox is checked).

**Conditions of Use**
- Lifecycle events are always emitted when editing occurs, regardless of configuration. They are part of the core editing infrastructure.
- Event listeners are registered via the standard event mechanism (e.g., `grid.addEventListener("before-edit", handler)` or framework-specific binding).

**Behavioral Requirements**
- BR-1: The grid MUST emit the following events in the documented order during an edit lifecycle:

| Event | Phase | Cancelable | When |
|-------|-------|------------|------|
| `before-edit` | Before editor creation | Yes (`cancel()`) | User triggers edit (Enter, F2, key, click, API) |
| `value-change` | During editing | No | Each meaningful input change within the editor |
| `commit-edit` | On commit attempt | Yes (`cancel()`) | User commits (Enter, Tab, click outside) |
| `after-edit` | After successful commit | No | Value has been written to the data model |
| `cancel-edit` | After cancellation | No | User presses Escape |

- BR-2: The `before-edit` event MUST include: `{ cell: { rowIndex, colIndex, rowData, columnDef }, trigger: string }`. Calling `event.cancel()` MUST prevent the editor from being created and keep the grid in Navigation Mode.
- BR-3: The `value-change` event MUST include: `{ cell: { rowIndex, colIndex, rowData, columnDef }, oldValue: any, newValue: any, source: "user" | "api" }`. This event is informational and MUST NOT block or delay user input.
- BR-4: The `commit-edit` event MUST include: `{ cell: { rowIndex, colIndex, rowData, columnDef }, oldValue: any, newValue: any, trigger: string }`. Calling `event.cancel()` MUST prevent the commit, keep the editor open, and the application SHOULD display a validation message. The `trigger` indicates what caused the commit (`"enter"`, `"tab"`, `"clickOutside"`, `"api"`).
- BR-5: The `after-edit` event MUST include: `{ cell: { rowIndex, colIndex, rowData, columnDef }, oldValue: any, newValue: any }`. This event fires AFTER the value has been written to the data model. It is not cancelable.
- BR-6: The `cancel-edit` event MUST include: `{ cell: { rowIndex, colIndex, rowData, columnDef }, oldValue: any, dirtyValue: any }`. The `dirtyValue` is whatever the user typed before cancelling. This event is not cancelable -- Escape MUST always work.
- BR-7: For full-row editing (F-07.2), the lifecycle events MUST fire at the row level. The `before-edit` event MUST include all cells that will become editable. The `commit-edit` and `after-edit` events MUST include the complete set of old and new values for all modified cells in the row.
- BR-8: When the value has not changed (new value equals old value), the `commit-edit` and `after-edit` events SHOULD still fire (the user explicitly committed), but a `skipUnchanged` configuration option MAY suppress them.
- BR-9: Lifecycle events MUST fire for both built-in and custom editors. The event sequence is managed by the grid, not by individual editors.
- BR-10: Events MUST be synchronous (or await the handler's return if it returns a Promise) for `before-edit` and `commit-edit` (cancelable events). The `value-change`, `after-edit`, and `cancel-edit` events MAY be asynchronous (fire-and-forget).

**Accessibility**
- **ARIA**: No direct ARIA implications for events themselves. However, when `before-edit` cancels an edit, the grid SHOULD provide feedback (see F-07.9 for conditional editability). When `commit-edit` cancels a commit (validation failure), `aria-invalid="true"` MUST be set and `aria-errormessage` MUST point to the error text.
- **Screen Reader**: SR: "Cell is locked" or "[Reason]" when `before-edit` cancels (via live region, if a reason is provided by the handler). SR: "Invalid value. [Error message]." when `commit-edit` cancels (via `aria-invalid` and live region). Commit and cancel announcements are handled by F-07.1.
- **WCAG**: 3.3.1 (Error Identification: validation errors from `commit-edit` cancellation are described in text), 3.3.3 (Error Suggestion: the application SHOULD provide correction hints when `commit-edit` is cancelled).
- **Visual**: When `commit-edit` is cancelled (validation rejection), the cell/editor MUST display a visible error indicator (e.g., a red border, an error icon, or inline error text). This indicator MUST NOT rely on color alone (WCAG 1.4.1).

**Chameleon 6 Status**: Existed (partially). Chameleon 6 provided `rowDoubleClicked` and cell change detection via property updates, but had no formal before/during/after lifecycle event system. Chameleon 7 introduces a complete, standardized lifecycle event chain.

**Interactions**
- F-07.1 (Inline Cell Editing): lifecycle events fire during inline editing.
- F-07.2 (Full-Row Editing): lifecycle fires at row granularity.
- F-07.5 (Custom Cell Editors): custom editors participate in the same lifecycle.
- F-07.7 (Batch Editing): batch commit fires lifecycle events for all accumulated edits.
- F-17 (Undo/Redo): `after-edit` events push entries onto the undo stack.
- F-18 (Validation): validation logic executes within the `commit-edit` handler; validation failure calls `cancel()`.
- F-20 (Server-Side Operations): `after-edit` may trigger a server-side persistence call.

---

## 7.7 Batch Editing / Transaction Updates [P1]

**Description**: Edits are accumulated locally without immediate commitment to the data source. The user makes multiple changes across different cells and rows, then applies all changes at once via a "Save All" action, or discards all changes via a "Discard All" action. Modified cells display visual dirty indicators (e.g., a colored triangle or changed background) to show which values have been modified since the last save. This pattern supports workflows where changes must be reviewed or validated as a batch before persistence.

**Applies to**: All variants

**Use Cases**
- UC-1: A data entry operator edits 20 cells across 10 rows in a large dataset. Rather than saving each edit individually (triggering 20 API calls), the operator clicks "Save All" to submit all changes in a single transaction.
- UC-2: A user edits several cells but realizes the changes are incorrect. Clicking "Discard All" reverts every modified cell to its original value.
- UC-3: A manager reviews a batch of proposed changes (highlighted with dirty indicators) before approving the save operation.
- UC-4: An application validates all accumulated changes as a batch (e.g., checking that the total budget does not exceed a limit) before allowing the save.

**Conditions of Use**
- Batch editing MUST be enabled via a grid-level configuration property (e.g., `batchMode: true`).
- When `batchMode` is enabled, individual cell commits (Enter, Tab) write to an in-memory change buffer, not directly to the underlying data source.
- The application MUST provide UI for "Save All" and "Discard All" actions (the grid provides the API; the application provides the buttons/triggers).

**Behavioral Requirements**
- BR-1: When `batchMode` is enabled, the `after-edit` event MUST fire with a `pending: true` flag indicating the change is buffered, not persisted. The underlying data source MUST NOT be modified until a batch commit.
- BR-2: The grid MUST maintain an in-memory change buffer that records each cell modification as `{ rowId, colId, oldValue, newValue }`.
- BR-3: Modified cells MUST display a visual dirty indicator. The indicator MUST be visible without requiring user interaction (e.g., a small triangle in the corner of the cell, a colored left border, or a changed background). The indicator MUST NOT rely on color alone (shape or pattern MUST be used in addition to color).
- BR-4: Modified rows MUST be visually distinguishable from unmodified rows (e.g., a subtle background tint or a dirty icon in the row header).
- BR-5: The grid MUST provide an API method to retrieve all pending changes: `getPendingChanges()`, which returns the complete change buffer as an array of `{ rowId, colId, oldValue, newValue }` entries.
- BR-6: The grid MUST provide a `commitBatch()` API method that writes all pending changes to the data source, clears the change buffer, removes all dirty indicators, and emits a `batch-committed` event with the complete change set.
- BR-7: The grid MUST provide a `discardBatch()` API method that reverts all pending changes to their original values, clears the change buffer, removes all dirty indicators, and emits a `batch-discarded` event.
- BR-8: If a cell is edited multiple times before a batch commit, the change buffer MUST track only the original value and the latest value (not the intermediate values). The dirty indicator reflects the difference between the original and current value.
- BR-9: If a cell is edited back to its original value, the change buffer MUST remove that entry and the dirty indicator MUST be cleared for that cell.
- BR-10: The grid MUST provide a `hasPendingChanges()` API method (or a reactive property) that returns `true` when the change buffer is non-empty. This enables applications to warn users before navigating away (e.g., "You have unsaved changes").

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Dirty indicators appear on cells at any hierarchy level. If a child cell is modified, the parent row MAY optionally display a "descendant modified" indicator. |
| Pivot Table | Editing a value cell creates a pending change for that intersection. Aggregated totals SHOULD NOT recalculate until batch commit (since intermediate states may be inconsistent). Alternatively, the grid MAY show tentative recalculated values with a "pending" indicator. |
| Gantt Chart | Editing date fields creates pending changes. Timeline bars SHOULD update to reflect pending values with a "pending" visual treatment (e.g., a dashed outline). The original bar position MAY be shown as a ghost for comparison. |

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Ctrl+S (Cmd+S) | Commit batch (Save All) -- configurable shortcut | Navigation Mode |
| Ctrl+Z (Cmd+Z) | Undo last change within the batch (see F-17) | Navigation Mode |

**Accessibility**
- **ARIA**: Modified cells SHOULD have `aria-description="Modified"` or a similar attribute to indicate their dirty state. When a batch commit or discard is performed, a live region MUST announce the result.
- **Screen Reader**: SR: "Modified" when a screen reader user navigates to a dirty cell (via `aria-description`). SR: "[N] changes saved" on batch commit (via live region). SR: "[N] changes discarded" on batch discard (via live region). SR: "You have [N] unsaved changes" as a periodic reminder or when the user attempts to leave the grid context.
- **WCAG**: 1.3.1 (dirty state programmatically determinable), 1.4.1 (dirty indicator not color-only), 3.3.4 (Error Prevention: batch confirmation before destructive discard action), 2.4.7 (focus visible on Save All/Discard All controls).
- **Visual**: Dirty indicators MUST use a combination of color and shape (e.g., a blue triangle in the top-left corner of the cell). A count badge or status bar showing "N unsaved changes" SHOULD be visible when there are pending changes.

**Chameleon 6 Status**: New. Chameleon 6 had no built-in batch editing or change tracking. Chameleon 7 introduces a complete batch editing system with change buffer, dirty indicators, and commit/discard API.

**Interactions**
- F-07.1 (Inline Cell Editing): individual cell edits populate the change buffer instead of persisting immediately.
- F-07.2 (Full-Row Editing): a full-row save writes to the change buffer (not persisted) in batch mode.
- F-07.6 (Edit Lifecycle Events): `after-edit` fires with `pending: true`; `batch-committed` and `batch-discarded` are batch-level events.
- F-07.8 (Clipboard Paste): pasted values populate the change buffer in batch mode.
- F-17 (Undo/Redo): undo within a batch reverts individual changes from the buffer. Undo after a batch commit reverts the entire batch.
- F-18 (Validation): batch validation runs across all pending changes on `commitBatch()`.
- F-20 (Server-Side Operations): `batch-committed` triggers a server-side batch persistence call.
- F-21 (State Persistence): pending changes MAY be included in saved state to survive page refreshes.

---

## 7.8 Clipboard Paste into Cells [P1]

**Description**: The user pastes data from the system clipboard into editable cells. Pasted content is parsed and mapped to the target cells based on column and row alignment. Multi-cell paste distributes values across a range of cells starting from the currently focused cell, mapping tab-separated columns and newline-separated rows. Paste is only permitted in editable grids and only affects editable cells.

**Applies to**: All variants

**Use Cases**
- UC-1: A user copies a column of values from a spreadsheet and pastes them into a grid column, populating multiple rows at once.
- UC-2: A user copies a rectangular block of cells from Excel (3 columns x 5 rows) and pastes into the grid. The values fill the corresponding 3x5 cell range starting from the focused cell.
- UC-3: A user copies a single value and pastes it into a range of selected cells, applying the same value to all selected cells (fill paste).
- UC-4: A user pastes data containing more columns than the grid has remaining from the focus point. The excess columns are silently discarded.

**Conditions of Use**
- Clipboard paste MUST only work when the grid has at least one editable column.
- The grid MUST be in Navigation Mode (not Edit Mode) for multi-cell paste. If the grid is in Edit Mode, Ctrl+V MUST paste into the active editor (standard text input paste behavior).
- The Clipboard API (`navigator.clipboard.readText()`) or the `paste` event MUST be available. The grid MUST handle both the async Clipboard API and the synchronous `paste` event for cross-browser compatibility.
- Multi-cell paste MUST require user-initiated clipboard access (paste event) -- the grid MUST NOT read the clipboard without a user gesture.

**Behavioral Requirements**
- BR-1: When the user presses **Ctrl+V** (Cmd+V on macOS) while in Navigation Mode with an editable cell focused, the grid MUST read the clipboard content and attempt to paste it into cells starting from the focused cell.
- BR-2: Clipboard content MUST be parsed as tab-separated values (TSV) for columns and newline-separated values for rows. This matches the format used by spreadsheet applications (Excel, Google Sheets).
- BR-3: For **single-cell paste** (clipboard contains a single value), the grid MUST write the value to the focused cell (subject to editability and validation).
- BR-4: For **multi-cell paste** (clipboard contains a TSV grid), the grid MUST map values to cells starting from the focused cell, filling right across columns and down across rows. The paste region is `focusRow + pasteRows` by `focusCol + pasteCols`.
- BR-5: If the paste data exceeds the available grid area (more rows than remain below the focus, or more columns than remain to the right), the grid MUST silently discard the excess values. The grid MUST NOT add new rows or columns to accommodate paste data (unless F-07.10 Enter-to-Create-New-Row is enabled, in which case new rows MAY be created).
- BR-6: Non-editable cells within the paste range MUST be skipped. The paste MUST NOT fail entirely because some target cells are non-editable; it MUST apply values to the editable cells and skip the rest.
- BR-7: Each pasted value MUST go through the `commit-edit` lifecycle event (F-07.6). If a value fails validation, that specific cell MUST be marked as invalid, but other cells in the paste range MUST still receive their values.
- BR-8: The grid MUST emit a `paste-completed` event after all paste operations are processed, containing: `{ pastedCells: [{ rowIndex, colIndex, oldValue, newValue, success: boolean }], source: "clipboard" }`.
- BR-9: When a cell range is selected (F-08 Selection) and the clipboard contains a single value, the grid SHOULD fill all selected editable cells with that value (fill paste). When the clipboard contains a multi-cell range that is smaller than the selection, the grid MAY tile the paste data to fill the selection (repeat paste).
- BR-10: In batch mode (F-07.7), pasted values MUST be written to the change buffer, not directly to the data source. Dirty indicators MUST appear on all pasted cells.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Paste applies to visible rows only. Collapsed child rows are not targets for paste. The paste range follows the visible row order, which may skip hierarchy levels. |
| Pivot Table | Paste applies to value cells only. Dimension header cells are skipped during multi-cell paste. |
| Gantt Chart | Paste applies to task list cells. Pasting date values MUST trigger timeline bar updates for all affected rows. |

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Ctrl+V (Cmd+V) | Paste clipboard content into cells starting from the focused cell | Navigation Mode |
| Ctrl+V (Cmd+V) | Standard paste into the active editor | Edit Mode |

**Accessibility**
- **ARIA**: No specific ARIA attributes for paste. The result of the paste (new cell values) is reflected in the cell content, which assistive technology reads normally.
- **Screen Reader**: SR: "Pasted [N] values into [N] cells. [M] cells skipped (read-only)." after paste completes (via live region). If validation errors occur: SR: "Pasted [N] values. [M] validation errors."
- **WCAG**: 2.1.1 (paste is keyboard-accessible via Ctrl+V), 1.3.1 (pasted values are reflected in the grid structure), 3.3.1 (validation errors from paste are identified and described).
- **Visual**: After a multi-cell paste, the affected cell range SHOULD be briefly highlighted (flash animation) to indicate which cells were modified. The highlight MUST respect `prefers-reduced-motion: reduce`. Cells that failed validation MUST display error indicators.

**Chameleon 6 Status**: New. Chameleon 6 had no built-in clipboard paste support for cells. Chameleon 7 introduces clipboard integration with TSV parsing and multi-cell distribution.

**Interactions**
- F-07.1 (Inline Cell Editing): paste in Edit Mode goes to the editor (standard browser paste); paste in Navigation Mode triggers multi-cell paste.
- F-07.6 (Edit Lifecycle Events): each pasted cell goes through the `commit-edit` lifecycle.
- F-07.7 (Batch Editing): paste populates the change buffer in batch mode.
- F-07.9 (Conditional Editability): non-editable cells are skipped during paste.
- F-07.10 (Enter-to-Create-New-Row): paste MAY create new rows if this feature is enabled and paste data exceeds existing row count.
- F-08 (Selection): selected range may define the paste target for fill-paste behavior.
- F-17 (Undo/Redo): a multi-cell paste pushes a single compound entry onto the undo stack, undoable in one step.
- F-18 (Validation): each pasted value is validated; failures are reported individually.

---

## 7.9 Conditional Editability (Read-Only Cells) [P0]

**Description**: Specific cells, rows, or columns are conditionally non-editable based on runtime logic. A developer-provided function evaluates whether a given cell is editable based on the cell's data, the row's state, user permissions, or any other criterion. Non-editable cells display `aria-readonly="true"` and do not respond to edit triggers. Cells that are visible but conditionally disabled (e.g., editable only after another field is filled) use `aria-disabled="true"` to indicate that they exist but are not currently operable.

**Applies to**: All variants

**Use Cases**
- UC-1: A "Total" cell is read-only because it is a computed formula. The user cannot edit it directly.
- UC-2: Rows representing approved records are locked (non-editable). Only rows in "Draft" status are editable.
- UC-3: A "Discount" cell is only editable when the "Override" checkbox in the same row is checked. When unchecked, the Discount cell shows `aria-disabled="true"`.
- UC-4: A user with "Viewer" permissions sees the grid but cannot edit any cells. All cells are `aria-readonly="true"`.
- UC-5: In a Tree Grid, parent summary rows are non-editable; only leaf rows are editable.

**Conditions of Use**
- Editability is determined by the layered system defined in [FD-03](../01-foundations/03-editability-model.md), Section 3: grid-level, column-level, row-level, and cell-level conditions.
- The cell-level editability callback (`cellEditable(rowData, columnDef, rowIndex, colIndex) -> boolean`) MUST be evaluated whenever a cell is rendered, when the user attempts to enter Edit Mode, and when the cell's data or context changes.

**Behavioral Requirements**
- BR-1: The grid MUST evaluate cell editability at render time and set the appropriate ARIA attribute:
  - `aria-readonly="false"` for editable cells in an editable grid.
  - `aria-readonly="true"` for non-editable cells in an editable grid.
  - `aria-disabled="true"` for cells that are visible but conditionally non-interactive (e.g., will become editable when a prerequisite is met).
- BR-2: When the user attempts to enter Edit Mode on a non-editable cell (via any trigger), the grid MUST NOT create an editor. The grid MUST remain in Navigation Mode. No lifecycle events fire.
- BR-3: When the user attempts to enter Edit Mode on a `aria-disabled="true"` cell, the grid MUST NOT create an editor. The grid SHOULD provide feedback explaining why the cell is not currently editable (via a tooltip, a live region announcement, or a status message).
- BR-4: When Tab/Shift+Tab navigation skips between editable cells during Edit Mode (per [FD-03](../01-foundations/03-editability-model.md), Section 7.4), non-editable cells MUST be skipped.
- BR-5: The editability callback MUST be re-evaluated when the cell's data changes (e.g., another cell in the row is edited, causing a dependent cell's editability to change). The ARIA attribute MUST be updated accordingly.
- BR-6: For column-level editability (`column.editable: boolean`), all cells in the column inherit the same editability state. Column-level is the most common and performant way to define editability.
- BR-7: For row-level editability (`row.editable: boolean` or a callback on row data), all cells in the row inherit the row's editability state. Row-level editability overrides column-level: if the row is non-editable, even cells in editable columns are non-editable.
- BR-8: For cell-level editability (the `cellEditable` callback), the callback overrides both column-level and row-level settings. This is the finest granularity and the most flexible.
- BR-9: The evaluation priority MUST be: grid-level > row-level > column-level > cell-level callback. If the grid is read-only, nothing below it matters. If the row is read-only, column and cell callbacks are not evaluated.
- BR-10: In full-row editing mode (F-07.2), non-editable cells within the row MUST remain in display mode while the editable cells show editors. The row's Save/Cancel actions affect only the editable cells.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Parent/summary rows MAY be configured as non-editable at the row level. The editability callback receives `level` and `isLeaf` properties in the row data, allowing rules like "only leaf nodes are editable." |
| Pivot Table | Dimension header cells are non-editable by default (they represent aggregation axes). The editability callback can make specific value cells non-editable based on the dimension intersection (e.g., "cannot edit totals"). |
| Gantt Chart | Timeline bar interactions (drag to reschedule) have their own editability separate from cell editability. A task list cell can be non-editable while the bar is still draggable, or vice versa. |

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Enter / F2 / alphanumeric | No effect on non-editable cells (grid stays in Navigation Mode) | Navigation Mode, focus on non-editable cell |
| Tab (in Edit Mode) | Skip non-editable cells, advance to the next editable cell | Edit Mode |

**Accessibility**
- **ARIA**: Non-editable cells MUST have `aria-readonly="true"`. Conditionally disabled cells MUST have `aria-disabled="true"`. The `aria-readonly` attribute MUST NOT be absent on non-editable cells in an editable grid -- its absence would imply inheritance from the grid level, which could be `false` (editable).
- **Screen Reader**: When a screen reader user navigates to a non-editable cell, AT announces: SR: "[Column Name]. [Value]. Read-only." (from `aria-readonly="true"`). For disabled cells: SR: "[Column Name]. [Value]. Dimmed." or SR: "[Column Name]. [Value]. Disabled." (from `aria-disabled="true"`).
- **WCAG**: 1.3.1 (editability state programmatically determinable via `aria-readonly` / `aria-disabled`), 4.1.2 (name, role, value -- the readonly/disabled state is part of the cell's value/state), 1.4.3 (disabled cells SHOULD have sufficient contrast, or use 3:1 minimum for the dimmed presentation per WCAG 1.4.11).
- **Visual**: Non-editable cells SHOULD have a subtle visual distinction from editable cells (e.g., a slightly different background, absence of an edit cursor on hover, or no hover highlight). Disabled cells (`aria-disabled`) SHOULD appear dimmed but still readable. The visual difference MUST NOT rely on color alone.

**Chameleon 6 Status**: Existed (partially). Chameleon 6 column model included `editable` at the column level, but no row-level or cell-level editability callbacks. Chameleon 7 introduces the full layered editability system with callback support and proper ARIA attribute management.

**Interactions**
- F-07.1 (Inline Cell Editing): editability determines whether a cell can enter Edit Mode.
- F-07.2 (Full-Row Editing): non-editable cells remain in display mode during full-row editing.
- F-07.3 (Edit Triggers): triggers are ignored on non-editable cells.
- F-07.8 (Clipboard Paste): non-editable cells are skipped during paste.
- F-08 (Selection): non-editable cells CAN still be selected (selection and editability are independent).
- F-14 (Keyboard Navigation): arrow keys still navigate to non-editable cells; only edit triggers are blocked.
- FD-03 (Editability Model): defines the layered evaluation system that this feature implements.

---

## 7.10 Enter-to-Create-New-Row [P1]

**Description**: A spreadsheet-like behavior where pressing Enter on the last row of the grid (or on a dedicated "new row" placeholder) creates a new empty row and positions the cursor on its first editable cell. This enables rapid data entry workflows where the user continuously enters records without using a separate "Add Row" button. The behavior is configurable and can be disabled for grids that do not support user-created rows.

**Applies to**: Data Grid, Tree Grid, Gantt Chart

**Use Cases**
- UC-1: A data entry operator finishes editing the last row and presses Enter. A new empty row appears below, and the cursor is in the first editable cell, ready for the next record.
- UC-2: A user tabs through the last editable cell of the last row. Instead of exiting the grid, a new row is created and the cursor advances to it.
- UC-3: A project manager adds a new task to a Gantt Chart by pressing Enter on the last task row. The new task row appears with default values, and the timeline bar placeholder appears.
- UC-4: In a Tree Grid, a user adds a new child row under a parent by pressing Enter on the last child of that parent (configurable).

**Conditions of Use**
- This feature MUST be opt-in via a grid-level configuration property (e.g., `allowNewRow: true`). The default MUST be `false` because most grids display server-provided data and do not support client-side row creation.
- The grid MUST be editable (at least one editable column) for this feature to be active.
- The behavior MUST only trigger when the user commits an edit on the last row (or last child in Tree Grid mode) and the commit is successful.

**Behavioral Requirements**
- BR-1: When `allowNewRow` is enabled and the user presses **Enter** to commit an edit on the **last row** of the grid, the grid MUST create a new empty row after the current last row.
- BR-2: When `allowNewRow` is enabled and the user presses **Tab** on the last editable cell of the last row (with `tabNavigationMode: "cell"`), the grid MUST create a new row and move focus to the first editable cell of the new row, entering Edit Mode.
- BR-3: The new row MUST be initialized with default values provided by a `newRowDefaults` configuration (a function or object that returns default values for each column). If no defaults are configured, all cells start with `null` or empty values.
- BR-4: The grid MUST emit a `row-created` event when a new row is added, containing: `{ rowIndex, rowData: <default values>, source: "user" }`. The application can listen to this event to assign an ID or perform other initialization.
- BR-5: The new row MUST receive focus on its first editable cell. The cell MUST be in Edit Mode, ready for immediate data entry.
- BR-6: The new row MUST participate in the same editing, validation, and lifecycle event system as existing rows. If the user presses Escape without entering any data, the new row SHOULD be removed (configurable: `removeEmptyNewRow: true`).
- BR-7: The grid MAY display a persistent "new row" placeholder at the bottom of the grid (an empty row with a "+" icon or "Click to add" label) as an alternative or complement to the Enter-based trigger. Clicking the placeholder creates the row.
- BR-8: New rows added via this feature MUST be included in the batch change buffer when batch mode is enabled (F-07.7). They appear as new entries (not modifications to existing rows).
- BR-9: The grid MUST assign a temporary client-side identifier to the new row until it is persisted to the server. This identifier MUST be unique within the current session.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Data Grid | New rows are added at the bottom of the grid (after the last row in the current sort/filter order). If the grid is sorted, the new row remains at the bottom until the user commits and a re-sort is triggered. |
| Tree Grid | The grid MUST support configuring WHERE new rows are added: as a sibling of the last row, as a child of the focused parent, or always at the root level. The `row-created` event includes `parentId` when the new row is a child. |
| Pivot Table | NOT APPLICABLE. Pivot Tables derive rows from data aggregation; users cannot add arbitrary rows. This feature MUST be disabled for Pivot Table variant. |
| Gantt Chart | New rows represent new tasks. The grid MUST create a placeholder timeline bar (zero-duration or default-duration) for the new task. The bar updates as the user edits date fields. |

**CSS Subgrid Implications**

The new row MUST be appended as a new grid row element with the same `display: grid; grid-template-columns: subgrid; grid-column: 1 / -1` structure as existing rows. The row insertion MUST NOT cause a relayout of the entire grid. If virtualization is active (F-11), the new row is appended at the logical end and rendered only if it falls within the visible window (which it typically does, since the user is at the bottom of the grid).

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Enter | Commit current edit on last row; create new row; focus first editable cell of new row | Edit Mode, last row |
| Tab | Commit current edit on last editable cell of last row; create new row; focus first editable cell of new row | Edit Mode, last row, last editable cell |
| Escape | Cancel edit on the new row; remove the new row if empty (when `removeEmptyNewRow: true`) | Edit Mode, new row |

**Accessibility**
- **ARIA**: When a new row is created, the grid's `aria-rowcount` MUST be updated to reflect the new total. The new row MUST have the correct `aria-rowindex`. The grid SHOULD set `aria-rowcount` to `-1` (unknown) if the total count is dynamic and cannot be determined.
- **Screen Reader**: SR: "New row added at position [N]." when the row is created (via live region, `role="status"`, `aria-live="polite"`). SR: "[Column Name]. Empty. Text input." when the first editable cell of the new row receives focus and enters Edit Mode.
- **WCAG**: 1.3.1 (new row is part of the grid structure with correct ARIA), 2.1.1 (row creation is keyboard-accessible via Enter/Tab), 4.1.2 (new row cells have proper name, role, value).
- **Visual**: The new row SHOULD be visually distinguished momentarily (e.g., a brief highlight animation) to draw attention. If a "new row" placeholder is used, it MUST be clearly labeled and visually distinct from data rows. Animations MUST respect `prefers-reduced-motion: reduce`.

**Chameleon 6 Status**: New. Chameleon 6 had no built-in mechanism for creating new rows via keyboard interaction. Row addition was entirely application-managed. Chameleon 7 introduces this spreadsheet-like rapid data entry pattern.

**Interactions**
- F-07.1 (Inline Cell Editing): the new row immediately enters inline editing on its first editable cell.
- F-07.6 (Edit Lifecycle Events): `row-created` event fires; subsequent cell edits on the new row follow the standard lifecycle.
- F-07.7 (Batch Editing): new rows are tracked in the batch change buffer as additions.
- F-07.8 (Clipboard Paste): paste that overflows beyond the last row MAY create new rows when this feature is enabled.
- F-07.9 (Conditional Editability): the `cellEditable` callback is evaluated for new row cells.
- F-02 (Sorting): new row remains at the bottom until re-sort is triggered after commit.
- F-03 (Filtering): new row is visible regardless of current filters until committed and re-filtered.
- F-11 (Virtualization): new row is appended at the logical end; the virtual scroller scrolls to show it.
- F-17 (Undo/Redo): row creation pushes an entry onto the undo stack; undoing removes the row.

---

## Cross-Cutting Concerns

### Cell Editing and Sorting Interaction

When a cell is in Edit Mode, the grid MUST defer any sort operation (whether user-initiated or programmatic) until the edit is committed or cancelled. Reordering the DOM during active editing would destroy the editor widget and lose user input. After the edit completes, any pending sort MUST be applied. See [F-02](02-sorting.md), F-02.1, Editability Interaction.

### Cell Editing and Filtering Interaction

When a cell is in Edit Mode, filter changes MUST NOT remove the editing row from the visible set, even if the edited value would cause the row to fail the current filter. The row MUST remain visible until the edit is committed or cancelled. After commit, the filter MUST be re-evaluated and the row may be filtered out.

### Cell Editing and Selection Interaction

Entering Edit Mode on a cell SHOULD select that cell (single-cell selection per F-08). If a range of cells is selected and the user enters Edit Mode, only the anchor cell (the cell that initiated the selection) enters Edit Mode. The selection range is preserved but inactive during editing. See [F-08](08-selection.md).

### Cell Editing and Virtualization Interaction

The cell currently in Edit Mode MUST be pinned in the DOM and MUST NOT be recycled by the virtual scroller (F-11). If the user scrolls during editing, the editing cell remains in place (either fixed or scrolling with its row, depending on implementation). If the row is scrolled entirely out of the visible window, the grid SHOULD auto-commit the edit rather than destroying the editor silently. See [F-11](11-virtualization.md).

### Cell Editing and Undo/Redo Interaction

Each committed edit (single-cell or full-row) MUST push an entry onto the undo stack (F-17). The undo entry contains the cell coordinates, old value, and new value. Undoing an edit MUST restore the old value and re-render the cell. Multi-cell operations (batch commit, clipboard paste) MUST be undoable as a single compound action. See [F-17](17-undo-redo.md).

### Cell Editing and Server-Side Operations Interaction

When the grid operates in server-side mode (F-20), committed edits MUST be sent to the server. The grid SHOULD support optimistic updates (apply the edit locally and revert if the server rejects it) and pessimistic updates (wait for server confirmation before updating the display). The mode is configurable per grid. See [F-20](20-server-side.md).

---

## Normative Requirements Summary

| ID | Requirement | Level | Feature |
|----|-------------|-------|---------|
| CE-01 | The grid MUST transition to Edit Mode when the user activates an editable cell via the configured trigger. | MUST | F-07.1 |
| CE-02 | Only one cell MAY be in Edit Mode at a time (single-cell mode). | MUST | F-07.1 |
| CE-03 | The editor MUST receive the raw data value, not the formatted display value. | MUST | F-07.1 |
| CE-04 | Escape MUST always cancel the edit and return to Navigation Mode. | MUST | F-07.1 |
| CE-05 | Editable cells MUST have `aria-readonly="false"`. | MUST | F-07.1, F-07.9 |
| CE-06 | Full-row editing MUST activate all editable cells in the row simultaneously. | MUST | F-07.2 |
| CE-07 | Full-row Save MUST commit all changes as a single unit. Full-row Cancel MUST revert all changes. | MUST | F-07.2 |
| CE-08 | Edit triggers MUST execute on click/dblclick, not mousedown (WCAG 2.5.2). | MUST | F-07.3 |
| CE-09 | F2 MUST enter Edit Mode with cursor at end (no selection). Enter MUST enter with value selected. | MUST | F-07.3 |
| CE-10 | Alphanumeric key MUST clear the value and begin typing with the pressed character. | MUST | F-07.3 |
| CE-11 | Built-in editors MUST be auto-selected based on column `dataType`. | MUST | F-07.4 |
| CE-12 | All built-in editors MUST implement the `CellEditor` interface. | MUST | F-07.4 |
| CE-13 | Custom editors MUST implement `init()`, `getValue()`, `isValid()`, and `destroy()`. | MUST | F-07.5 |
| CE-14 | The grid MUST pass `EditorParams` to custom editors with value, rowData, columnDef, and trigger. | MUST | F-07.5 |
| CE-15 | The grid MUST emit `before-edit`, `value-change`, `commit-edit`, `after-edit`, and `cancel-edit` events. | MUST | F-07.6 |
| CE-16 | `before-edit` and `commit-edit` MUST be cancelable via `cancel()`. | MUST | F-07.6 |
| CE-17 | Batch mode MUST maintain an in-memory change buffer with dirty indicators. | MUST | F-07.7 |
| CE-18 | Batch mode dirty indicators MUST NOT rely on color alone. | MUST | F-07.7 |
| CE-19 | Clipboard paste MUST parse TSV format and distribute values across cells. | MUST | F-07.8 |
| CE-20 | Non-editable cells MUST be skipped during paste. | MUST | F-07.8 |
| CE-21 | Non-editable cells MUST have `aria-readonly="true"` in an editable grid. | MUST | F-07.9 |
| CE-22 | Conditionally disabled cells MUST have `aria-disabled="true"`. | MUST | F-07.9 |
| CE-23 | Editability evaluation priority MUST be: grid > row > column > cell callback. | MUST | F-07.9 |
| CE-24 | Enter-to-create-new-row MUST be opt-in (default: disabled). | MUST | F-07.10 |
| CE-25 | New row MUST receive focus on its first editable cell in Edit Mode. | MUST | F-07.10 |
| CE-26 | `aria-rowcount` MUST be updated when a new row is created. | MUST | F-07.10 |
| CE-27 | SR: "New row added at position [N]." MUST be announced via live region. | MUST | F-07.10 |
| CE-28 | Sort MUST be deferred while a cell is in Edit Mode. | MUST | F-07.1 |
| CE-29 | The editing cell MUST be pinned in the DOM (not recycled by the virtual scroller). | MUST | F-07.1 |
| CE-30 | Each committed edit MUST push an entry onto the undo stack. | MUST | F-07.1 |

---

## Cross-References

| Topic | Reference |
|-------|-----------|
| CSS subgrid layout (editors within grid areas) | [FD-01: Layout Model](../01-foundations/01-layout-model.md) |
| Variant-specific editing behavior | [FD-02: Variant Model](../01-foundations/02-variant-model.md) |
| Editability model, lifecycle, ARIA contract | [FD-03: Editability Model](../01-foundations/03-editability-model.md) |
| Baseline ARIA structure, focus management | [FD-04: Accessibility Foundation](../01-foundations/04-accessibility-foundation.md) |
| Data display and cell formatters | F-01: Data Display & Rendering |
| Sort deferred during editing | F-02: Sorting |
| Filter interaction during editing | F-03: Filtering |
| Selection interaction with editing | F-08: Selection |
| Virtualization (pinned editing cell) | F-11: Virtualization & Performance |
| Keyboard navigation (mode transitions) | F-14: Keyboard Navigation |
| Theming (editor styling) | F-15: Theming & Styling |
| Undo/Redo (edit history) | F-17: Undo/Redo |
| Validation (commit rejection) | F-18: Validation |
| Server-side operations (edit persistence) | F-20: Server-Side Operations |
| State persistence (batch state, edit configuration) | F-21: State Persistence & Responsive |
