# FD-03: Editability Model

This foundation defines how cell editing works across ALL four tabular grid variants (Data Grid, Tree Grid, Pivot Table, Gantt Chart). Any cell of the tabular grid can be editable. This document establishes the interaction modes, focus management during editing, the fundamental lifecycle that all editing features build upon, and the accessibility contract that editing MUST satisfy.

> **Scope boundary**: This foundation specifies the _model_ -- the mode system, the focus rules, the lifecycle hooks, and the ARIA contract. Specific editing behaviors such as "Enter creates a new row," batch editing workflows, clipboard paste-to-edit, and full-row editing belong in [F-07: Cell Editing](../02-features/07-cell-editing.md).

> **Prerequisite**: [FD-04: Accessibility Foundation](04-accessibility-foundation.md) defines the roving tabindex strategy and the baseline ARIA structure. This document extends those concepts into the editing domain.

---

## 1. Navigation Mode vs Edit Mode

The WAI-ARIA Authoring Practices Guide (APG) defines two keyboard interaction modes for grids that contain interactive content. A grid with editable cells or interactive widgets MUST implement both modes.

### 1.1 Navigation Mode (default)

Navigation Mode is the mode the grid enters when it first receives focus and the mode it returns to after every edit session.

| Aspect | Behavior |
|--------|----------|
| Arrow keys | Move focus between cells (roving tabindex) |
| Tab / Shift+Tab | Exit the grid entirely (single tab stop) |
| Keystroke handling | Intercepted by the grid for navigation, selection, sorting, etc. |
| Interactive widgets | NOT operable -- widgets inside cells are inert at this level |
| Grid role | Active keyboard trap for arrow keys; not a trap for Tab |
| `tabindex` | Exactly one cell has `tabindex="0"`; all others have `tabindex="-1"` |

### 1.2 Edit Mode

Edit Mode is entered when the user activates an editable cell. The grid relinquishes arrow key control to the editor widget.

| Aspect | Behavior |
|--------|----------|
| Arrow keys | Pass through to the editor widget (e.g., cursor movement in a text input) |
| Tab / Shift+Tab | Cycle between widgets within the cell (if multiple), or commit and advance to the next editable cell (configurable) |
| Escape | Cancel the edit, revert to the original value, return to Navigation Mode |
| Enter | Commit the edit, return to Navigation Mode (or advance to the next row, configurable in F-07) |
| F2 | Enter Edit Mode (from Navigation Mode) or commit the edit and return to Navigation Mode (from Edit Mode) |
| Keystroke handling | Passed to the editor widget; grid navigation shortcuts are suspended |

### 1.3 Visual Mode Indicator

The grid MUST provide a visual indicator that distinguishes Navigation Mode from Edit Mode. Users (both sighted and assistive technology users) need to know which mode is active.

Requirements:

- **MUST**: The focused cell MUST change its visual appearance when transitioning from Navigation Mode to Edit Mode (e.g., a different outline color or style, an inset shadow, a visible text cursor appearing).
- **MUST**: The visual change MUST NOT rely on color alone (WCAG 1.4.1). Combine color with a shape change, border style change, or the appearance of the editor widget itself.
- **SHOULD**: A screen reader announcement SHOULD indicate the mode transition (e.g., "Editing. Name. Text input." when entering edit mode).
- **MAY**: An optional status region (`role="status"`, `aria-live="polite"`) MAY display the current mode as text (e.g., "Edit Mode") for grids where mode awareness is critical.

---

## 2. Mode Transitions

### 2.1 Transition Table

| From | To | Trigger | Effect |
|------|----|---------|--------|
| Navigation | Edit | **Enter** on an editable cell | Focus moves to the editor widget; value is selected or cursor is placed at end |
| Navigation | Edit | **F2** on an editable cell | Same as Enter |
| Navigation | Edit | **Alphanumeric key** on an editable cell | Clears the current value and begins typing with the pressed character |
| Navigation | Edit | **Double-click** on an editable cell | Focus moves to editor; cursor placed at click position |
| Edit | Navigation | **Escape** | Cancel edit, revert to original value, focus returns to the `gridcell` |
| Edit | Navigation | **Enter** | Commit edit, focus returns to the `gridcell` (or moves to next row per F-07 configuration) |
| Edit | Navigation | **F2** | Commit edit, focus returns to the `gridcell` |
| Edit | Edit (next cell) | **Tab** | Commit current edit, move focus to the next editable cell in reading order, enter Edit Mode on that cell |
| Edit | Edit (prev cell) | **Shift+Tab** | Commit current edit, move focus to the previous editable cell in reading order, enter Edit Mode on that cell |
| Navigation | Navigation | Any arrow key, Home, End, Page Up, Page Down | Standard grid navigation per [F-14](../02-features/14-keyboard-navigation.md) |

### 2.2 Transition on Non-Editable Cells

When the focused cell is NOT editable:

- **Enter, F2, alphanumeric keys**: MUST NOT enter Edit Mode. The grid SHOULD either ignore the keystroke or perform a Navigation Mode action (e.g., Enter on a column header triggers sort cycling).
- **Double-click**: MUST NOT enter Edit Mode. MAY trigger cell selection or no action.

### 2.3 Transition Cancellation

The `before-edit` lifecycle hook (see Section 6) MAY cancel the transition into Edit Mode. When cancelled:

- The grid remains in Navigation Mode.
- Focus remains on the `gridcell`.
- No editor widget is created.
- A screen reader announcement SHOULD indicate the cancellation reason if one is available (e.g., "Cell is locked").

---

## 3. Cell Editability Conditions

Editability is determined by a layered system of conditions. Each layer can independently mark cells as editable or read-only. A cell is editable only when ALL applicable layers permit it.

### 3.1 Grid-Level Editability

The grid itself MAY be marked as read-only. When `aria-readonly="true"` is set on the `grid` element, ALL cells are read-only regardless of column-level, row-level, or cell-level settings (because ALL layers must permit editing for a cell to be editable).

### 3.2 Column-Level Editability

A column definition MAY specify that all cells in that column are editable or read-only. This is the most common granularity.

```
column.editable = true | false
```

When a column is not editable, every cell in that column is read-only regardless of row-level or cell-level settings.

### 3.3 Row-Level Editability

A row MAY be marked as read-only, making all cells in that row non-editable regardless of column-level settings. Use cases include:

- Summary/aggregate rows
- Rows pending deletion
- Rows the current user does not have permission to edit

### 3.4 Cell-Level Editability (Callback)

For the finest granularity, a callback function receives cell coordinates and returns a boolean indicating whether that specific cell is editable.

```
cellEditable(rowData, columnDef, rowIndex, colIndex) -> boolean
```

This callback is evaluated:

- When the cell is rendered (to set the correct ARIA attribute)
- When the user attempts to enter Edit Mode (to gate the transition)
- When the cell's data or context changes (to update the ARIA attribute)

### 3.5 ARIA Markup for Editability

| Cell state | ARIA attribute | When to use |
|------------|----------------|-------------|
| Editable cell in an editable grid | `aria-readonly="false"` | Explicitly marks the cell as editable |
| Read-only cell in an editable grid | `aria-readonly="true"` | Distinguishes this cell from its editable siblings |
| All cells in a fully read-only grid | `aria-readonly="true"` on the `grid` element | Inherited by all descendants |
| Visible but conditionally non-interactive | `aria-disabled="true"` | Cell is visible but the user cannot interact with it (e.g., a cell that becomes editable only after another cell is filled) |

**Inheritance rule**: `aria-readonly` on the `grid` element sets the default for all cells. Individual `gridcell`, `columnheader`, or `rowheader` elements MAY override the grid-level value. Absence of the attribute on a cell means the cell inherits from its nearest ancestor with the attribute.

---

## 4. Editor Types

When a cell enters Edit Mode, the grid replaces the cell's display content with an editor widget appropriate to the data type. The following editor types MUST be supported:

| Editor type | HTML element(s) | Use case |
|-------------|-----------------|----------|
| Text input | `<input type="text">` | Short strings, names, codes |
| Number input | `<input type="number">` or constrained text input | Numeric values with optional min/max/step |
| Date picker | `<input type="date">` or custom date component | Date values |
| Select / Dropdown | `<select>` or custom listbox | Enumerated values (status, category) |
| Checkbox | `<input type="checkbox">` | Boolean values |
| Large text area | `<textarea>` | Multi-line text, notes, descriptions |
| Custom component | Any component implementing the editor interface | Domain-specific editors (color picker, rating, rich text) |

### 4.1 Editor Sizing Constraints

- The editor widget MUST fit within the cell's CSS grid area. It MUST NOT cause the column width or row height to change when entering Edit Mode.
- If the editor requires more space than the cell provides (e.g., a large text area), the editor SHOULD use an overlay or popover positioned relative to the cell, rather than expanding the cell.
- The overlay approach MUST maintain focus trap behavior: Escape returns to Navigation Mode, Tab cycles within the overlay if it has multiple controls.

### 4.2 Editor Value Contract

- The editor MUST receive the **raw value** (the underlying data), not the formatted display value. For example, a numeric cell displaying "$1,234.56" MUST provide the editor with the number `1234.56`.
- The editor MUST return the raw value on commit. Formatting is applied by the cell renderer after edit completion.
- Type coercion (string-to-number, string-to-date) is the responsibility of the editor or a validation hook, not the cell renderer.

### 4.3 Custom Editor Interface

Custom editors MUST implement a minimal interface to participate in the editor lifecycle:

```
interface CellEditor {
  // Called when the editor is mounted. Returns the focusable element.
  init(params: EditorParams): HTMLElement;

  // Returns the current value.
  getValue(): any;

  // Called when the edit is committed. Returns true if the value is valid.
  isValid(): boolean;

  // Called when the editor is about to be destroyed.
  destroy(): void;

  // Optional: called when the editor should select all content.
  selectAll?(): void;

  // Optional: returns true if the editor handles the key event internally.
  handlesKey?(event: KeyboardEvent): boolean;
}
```

---

## 5. Two-Level Focus Model

When a cell contains multiple interactive widgets (e.g., an Edit button and a Delete button, or a text value alongside a copy-to-clipboard button), a two-level focus model is required to provide keyboard access to all widgets without breaking grid navigation.

### 5.1 Focus Levels

| Level | What has focus | Arrow key behavior | Tab behavior |
|-------|---------------|-------------------|--------------|
| **Outer (gridcell)** | The `gridcell` element itself | Moves to adjacent cells (grid navigation) | Exits the grid |
| **Inner (widget)** | A widget inside the cell | Depends on the widget (e.g., no-op for buttons, cursor movement for inputs) | Cycles between widgets within the cell |

### 5.2 Transitions Between Levels

1. **Outer to Inner**: The user presses **Enter** or **F2** on a cell that contains interactive widgets. Focus moves from the `gridcell` to the **first** focusable widget inside the cell.
2. **Inner cycling**: **Tab** moves focus to the next widget. **Shift+Tab** moves to the previous. Focus wraps within the cell (from the last widget, Tab returns to the first widget).
3. **Inner to Outer**: **Escape** returns focus from the inner widget to the `gridcell` element. The grid resumes Navigation Mode.

### 5.3 Implementation

```html
<!-- Outer level: gridcell is the focus target during Navigation Mode -->
<div role="gridcell" tabindex="-1">
  <button tabindex="-1" aria-label="Edit record">Edit</button>
  <button tabindex="-1" aria-label="Delete record">Delete</button>
</div>
```

When the user presses Enter on the cell:

```
1. Set gridcell tabindex to -1
2. Set first widget tabindex to 0
3. Call first widget .focus()
4. Grid enters Edit Mode (arrow keys no longer navigate between cells)
```

When the user presses Escape inside the cell:

```
1. Set all widget tabindex values to -1
2. Set gridcell tabindex to 0
3. Call gridcell .focus()
4. Grid returns to Navigation Mode
```

### 5.4 Distinction from Single-Widget Cells

When a cell contains exactly **one** interactive widget (e.g., a single checkbox), the two-level model is NOT required. Instead, the widget itself becomes the focus target during Navigation Mode (arrow keys move focus directly between single-widget cells). See [FD-04: Accessibility Foundation](04-accessibility-foundation.md) for the single-widget focus delegation pattern.

---

## 6. Editor Lifecycle

Every edit session follows a four-phase lifecycle. Hooks at each phase allow the application to intercept, validate, or cancel the operation.

### 6.1 Phase 1: Before-Edit

Triggered when the user initiates an edit (Enter, F2, alphanumeric key, double-click).

```
BeforeEditEvent {
  cell:       { rowIndex, colIndex, rowData, columnDef }
  trigger:    "enter" | "f2" | "alphanumeric" | "doubleclick" | "api"
  cancel():   void   // Call to prevent entering Edit Mode
}
```

**Behavior**:
- The `before-edit` hook is invoked BEFORE the editor widget is created.
- If `cancel()` is called, the grid remains in Navigation Mode. No editor is created.
- Use cases: permission checks, conditional lock, prompting the user to save pending changes elsewhere.

### 6.2 Phase 2: During-Edit (Value Change)

Triggered as the user modifies the value within the editor.

```
ValueChangeEvent {
  cell:         { rowIndex, colIndex, rowData, columnDef }
  oldValue:     any
  newValue:     any
  source:       "user" | "api"
}
```

**Behavior**:
- Fired on every meaningful change (input events, selection changes).
- This is an informational hook -- it MUST NOT block or cancel the change. Use validation (Phase 3) for rejection.
- Use cases: live preview, dependent cell updates, character count display, real-time validation feedback.

### 6.3 Phase 3: Commit

Triggered when the user confirms the edit (Enter, Tab, or programmatic commit).

```
CommitEditEvent {
  cell:         { rowIndex, colIndex, rowData, columnDef }
  oldValue:     any
  newValue:     any
  cancel():     void   // Call to reject the commit and keep the editor open
}
```

**Behavior**:
- The `commit` hook is invoked BEFORE the value is written back to the data model.
- If `cancel()` is called, the editor remains open and focus stays in the editor. The application SHOULD display a validation message (see [F-18: Validation](../02-features/18-validation.md)).
- If not cancelled, the value is written to the data model, the editor is destroyed, and the cell re-renders with the new value.
- The grid then transitions based on the trigger:
  - **Enter**: Return to Navigation Mode, focus on the same cell.
  - **Tab**: Enter Edit Mode on the next editable cell.
  - **Shift+Tab**: Enter Edit Mode on the previous editable cell.

### 6.4 Phase 4: Cancel

Triggered when the user cancels the edit (Escape).

```
CancelEditEvent {
  cell:         { rowIndex, colIndex, rowData, columnDef }
  oldValue:     any
  dirtyValue:   any   // The value in the editor at the time of cancellation
}
```

**Behavior**:
- The editor is destroyed. The cell re-renders with the **original value** (not the dirty value).
- Focus returns to the `gridcell`. The grid returns to Navigation Mode.
- This event is informational and cannot be cancelled -- Escape MUST always work as an exit mechanism (WCAG 2.1.2: No Keyboard Trap).

### 6.5 Lifecycle Diagram

```
User action (Enter / F2 / key / double-click)
          |
          v
   +------------------+
   |   Before-Edit    |--- cancel() ---> Stay in Navigation Mode
   +------------------+
          |
          v
   +------------------+
   |  Editor Created  |---> Focus moves to editor widget
   +------------------+
          |
          v
   +------------------+
   |   During-Edit    |<--- (repeated on each value change)
   +------------------+
          |
     +---------+---------+
     |                   |
  (Enter/Tab)        (Escape)
     |                   |
     v                   v
+----------+     +-------------+
|  Commit  |     |   Cancel    |
+----------+     +-------------+
     |                   |
     |--- cancel() -->  |
     |  Keep editor     |
     |  open            |
     |                   |
     v                   v
  Value written     Value reverted
  Editor destroyed  Editor destroyed
  Mode transition   Navigation Mode
```

---

## 7. Tab Behavior in Edit Mode

Tab behavior during editing is configurable because different application paradigms have different expectations.

### 7.1 Spreadsheet Convention (default recommendation)

When the user presses **Tab** while in Edit Mode:

1. Commit the current edit (trigger the Commit lifecycle phase).
2. Move focus to the **next editable cell** in reading order (left-to-right, top-to-bottom in LTR layouts; right-to-left, top-to-bottom in RTL layouts).
3. Enter Edit Mode on the destination cell.
4. If there is no next editable cell (end of grid), commit and return to Navigation Mode.

When the user presses **Shift+Tab** while in Edit Mode:

1. Commit the current edit.
2. Move focus to the **previous editable cell** in reading order.
3. Enter Edit Mode on the destination cell.
4. If there is no previous editable cell (beginning of grid), commit and return to Navigation Mode.

### 7.2 Form Convention (alternative)

When the user presses **Tab** while in Edit Mode:

1. Commit the current edit.
2. Exit the grid entirely (move focus to the next focusable element on the page).

This convention treats the grid as a single tab stop, consistent with the APG guidance for grids that are not spreadsheet-like.

### 7.3 Configuration

The tab behavior MUST be configurable at the grid level. The property controls whether Tab during Edit Mode advances to the next editable cell or exits the grid.

```
tabNavigationMode: "cell" | "grid"
```

- `"cell"` (default): Tab commits and moves to the next editable cell (spreadsheet convention).
- `"grid"`: Tab commits and exits the grid (form convention).

### 7.4 Skipping Non-Editable Cells

When `tabNavigationMode` is `"cell"`, the Tab key MUST skip over non-editable cells. The determination of "next editable cell" uses the same editability evaluation described in Section 3 (column, row, and cell-level checks).

---

## 8. Editability Across Variants

The editability model applies uniformly to all four variants, with the following variant-specific considerations:

### 8.1 Data Grid

The baseline case. All sections of this document apply directly.

### 8.2 Tree Grid

- Editable cells in indented rows MUST NOT lose their indentation when the editor is active. The editor widget MUST be positioned within the content area of the cell, to the right of the expand/collapse control and indentation spacing.
- The expand/collapse control in the first column is NOT an editor -- activating it (Enter or Arrow Right/Left on the row) operates in Navigation Mode and does not trigger the editor lifecycle.
- When a parent row is collapsed, edits on hidden child cells MUST NOT be possible (they are not in the DOM due to virtualization, or they are hidden).

### 8.3 Pivot Table

- Dimension header cells (row headers and column headers that define pivot axes) are typically NOT editable. Their values come from the data aggregation engine.
- Value cells (the intersection of row and column dimensions) MAY be editable for data-entry pivot scenarios. The editability model applies to these cells.
- Editing a value cell SHOULD trigger recalculation of affected aggregates. This is an application-level concern surfaced through the `commit` lifecycle hook.

### 8.4 Gantt Chart

- The task list region (left side) follows the standard editability model for its cells (task name, dates, duration, assignee, etc.).
- Timeline bars (right side) are NOT cells and are NOT part of the grid's ARIA structure. Editing a bar's position (drag to reschedule) is a separate interaction model defined in the [Gantt Chart variant spec](../03-variant-specific/01-gantt-chart.md). However, changes to bar position SHOULD be reflected in the task list cells, and vice versa.
- When a user edits a start-date or end-date cell in the task list, the corresponding timeline bar MUST update to reflect the new dates.

---

## 9. Accessibility Contract for Editing

This section consolidates the ARIA and WCAG requirements that editing MUST satisfy. These requirements are derived from [FD-04: Accessibility Foundation](04-accessibility-foundation.md) and the WAI-ARIA APG grid pattern.

### 9.1 ARIA Attributes During Edit Mode

| Attribute | Element | Value during editing | Purpose |
|-----------|---------|---------------------|---------|
| `aria-readonly` | `gridcell` | `"false"` (already set on editable cells) | Indicates cell accepts input |
| `aria-invalid` | `gridcell` or editor input | `"true"` when validation fails | Signals error state to AT |
| `aria-errormessage` | `gridcell` or editor input | ID of the error description element | Points AT to the error text |
| `aria-required` | `gridcell` or editor input | `"true"` when the cell value is mandatory | Signals required field to AT |
| `aria-describedby` | Editor input | ID(s) of instructional text | Provides editing hints (e.g., "Enter a date in YYYY-MM-DD format") |

### 9.2 Screen Reader Announcements

| Event | Announcement | Mechanism |
|-------|--------------|-----------|
| Enter Edit Mode | Column name, cell value, editor type (e.g., "Name. Alice Johnson. Text input.") | Focus moving to the editor input triggers AT announcement |
| Validation error on commit | Error message (e.g., "Invalid email address") | `aria-invalid="true"` + `aria-errormessage` on the editor, plus live region announcement |
| Successful commit | New value (e.g., "Name changed to Bob Smith") | Live region (`role="status"`, `aria-live="polite"`) |
| Cancel edit | "Edit cancelled" | Live region announcement |
| Transition to next cell (Tab) | New cell column name and value | Focus moving to the new editor triggers AT announcement |

### 9.3 WCAG Compliance Checklist (Editing)

| WCAG SC | Level | Requirement | Implementation |
|---------|-------|-------------|----------------|
| 1.3.1 Info and Relationships | A | Editor structure is programmatically determinable | Editor inputs are properly labeled via column header association or `aria-label` |
| 1.3.5 Identify Input Purpose | AA | Input purpose is programmatically determinable | Use `autocomplete` attributes where applicable on editor inputs |
| 1.4.1 Use of Color | A | Edit mode indicator not color-only | Combine color change with border style, cursor appearance, or text |
| 2.1.1 Keyboard | A | All editing operations keyboard-accessible | Enter, F2, Escape, Tab all functional |
| 2.1.2 No Keyboard Trap | A | User can always exit Edit Mode | Escape MUST always return to Navigation Mode |
| 2.4.7 Focus Visible | AA | Focus indicator visible in Edit Mode | Editor input has visible focus outline |
| 2.4.13 Focus Appearance | AAA | Focus indicator meets size and contrast thresholds | 2px minimum outline, 3:1 contrast change |
| 3.2.1 On Focus | A | Entering Edit Mode does not change context unexpectedly | Mode change is user-initiated (Enter/F2/key) |
| 3.2.2 On Input | A | Value changes do not cause unexpected context changes | Commit is explicit (Enter/Tab), not automatic on each keystroke |
| 3.3.1 Error Identification | A | Validation errors described in text | `aria-invalid` + `aria-errormessage` + visible error text |
| 3.3.2 Labels or Instructions | A | Editable cells have associated labels | Column header serves as label; `aria-label` on editor if needed |
| 4.1.2 Name, Role, Value | A | Editor widget has accessible name, role, and value | Standard input elements with label association |

---

## 10. Interactions with Other Foundations and Features

| Document | Interaction |
|----------|-------------|
| [FD-01: Layout Model](01-layout-model.md) | Editors MUST NOT alter column widths or row heights; editors operate within the CSS grid area allocated to the cell |
| [FD-02: Variant Model](02-variant-model.md) | Variant-specific editability nuances are defined in Section 8 of this document |
| [FD-04: Accessibility Foundation](04-accessibility-foundation.md) | Roving tabindex strategy, focus management, and ARIA structure are the baseline for the editing focus model |
| [F-07: Cell Editing](../02-features/07-cell-editing.md) | Specific editing features (full-row editing, Enter-to-add-row, batch editing, clipboard paste) build upon this lifecycle |
| [F-08: Selection](../02-features/08-selection.md) | Selection and editing interact: editing a cell typically selects it; range selection may trigger batch editing |
| [F-14: Keyboard Navigation](../02-features/14-keyboard-navigation.md) | Navigation Mode key bindings are defined there; this document defines Edit Mode key bindings |
| [F-17: Undo/Redo](../02-features/17-undo-redo.md) | Each committed edit pushes an entry onto the undo stack |
| [F-18: Validation](../02-features/18-validation.md) | Validation rules execute during the Commit phase; validation failure cancels the commit |
