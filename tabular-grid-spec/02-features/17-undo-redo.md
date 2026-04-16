# F-17: Undo / Redo

> **Part of**: [Tabular Grid Specification](../README.md)
> **Feature category**: Undo / Redo
> **Variants**: All (Data Grid, Tree Grid, Pivot Table, Gantt Chart)

## Overview
The undo/redo system allows users to reverse and re-apply edit operations. It operates on cell edits and structural changes, with configurable stack depth and transaction support.

---

### 17.1 Cell Edit Undo/Redo [P1]

**Description**: Ctrl+Z undoes the most recent committed cell edit and Ctrl+Y (or Ctrl+Shift+Z) redoes it. Each committed edit is pushed as a discrete entry onto the undo stack. If an edit is in progress when Ctrl+Z is pressed, the current edit is cancelled without being committed to the stack, matching the behavior of Escape in the editability model (FD-03).

**Applies to**: All variants

**Use Cases**
- UC-1: User edits a cell value, commits with Enter, then presses Ctrl+Z to restore the previous value.
- UC-2: User makes several sequential cell edits and presses Ctrl+Z multiple times to step back through each one.
- UC-3: User presses Ctrl+Z while a cell is in edit mode to cancel the current edit without committing it.
- UC-4: User presses Ctrl+Y to re-apply a previously undone cell edit.
- UC-5: An automated batch edit (F-07.7) is committed; user presses Ctrl+Z once to undo the entire batch as a single step.

**Conditions of Use**
- The undo/redo system only tracks committed edits; edits abandoned via Escape or Ctrl+Z during edit mode are not recorded.
- `undoEnabled` must be `true` (default) for Ctrl+Z and Ctrl+Y to have any effect.
- Undo and redo are only available in Data Grid and Tree Grid variants where cell editing is supported; they are no-ops in Pivot Table and Gantt Chart unless those variants expose editable cells.
- When the undo stack is exhausted, Ctrl+Z is a no-op.
- When the redo stack is exhausted (no undone operations), Ctrl+Y is a no-op.
- Performing any new edit after an undo clears the redo stack.

**Behavioral Requirements**
- BR-1: The grid SHALL push each committed cell edit onto the undo stack as a discrete operation containing `{ rowId, colId, oldValue, newValue }`.
- BR-2: The grid SHALL execute Ctrl+Z to undo the most recent stack entry, restoring the cell's previous value.
- BR-3: The grid SHALL move focus to the cell whose value was restored after an undo operation.
- BR-4: The grid SHALL execute Ctrl+Y or Ctrl+Shift+Z to redo the most recently undone operation, re-applying the new value.
- BR-5: The grid SHALL move focus to the cell whose value was re-applied after a redo operation.
- BR-6: When Ctrl+Z is pressed while a cell is in edit mode, the grid SHALL cancel the current edit (discard unsaved input) without pushing any entry onto the undo stack, consistent with FD-03.
- BR-7: The grid SHALL clear the redo stack when a new edit is committed after one or more undo operations.
- BR-8: The grid SHALL expose a read-only `undoStack` property as an array of pending undo operation descriptors.
- BR-9: The grid SHALL fire `undoAvailable` and `redoAvailable` change events whenever the availability of undo or redo operations changes.
- BR-10: The grid SHALL respect keyboard shortcut remapping configured via F-14.14; if Ctrl+Z is remapped, the default binding SHALL be deactivated.

**Keyboard Interaction**
| Key | Action | Mode |
|-----|--------|------|
| Ctrl+Z | Undo most recent operation | Normal navigation or cell focused |
| Ctrl+Z | Cancel current cell edit (no stack push) | Cell in edit mode |
| Ctrl+Y | Redo most recently undone operation | Normal navigation or cell focused |
| Ctrl+Shift+Z | Redo most recently undone operation (alternative binding) | Normal navigation or cell focused |

**Accessibility**
- **ARIA**: When an undo or redo operation is applied, the affected cell SHALL update its accessible value immediately so that screen readers announce the new content on next focus.
- **Screen Reader**: SR: "Undo applied: [column name] changed from [old value] to [new value]" announced via `aria-live="polite"` region. SR: "Redo applied: [column name] restored to [new value]" on redo.
- **WCAG**: 3.3.4 Error Prevention (Legal, Financial, Data) — undo supports reversibility of data entry. 2.1.1 Keyboard.
- **Visual**: Toolbar undo/redo buttons (when present) SHALL show disabled state visually when the respective stack is empty, not relying solely on color.

**Chameleon 6 Status**: New feature

**Interactions**: FD-03 (editability model — Escape/Ctrl+Z in edit mode), F-07.7 (batch editing — undone as single transaction via F-17.3), F-17.2 (shared undo stack), F-17.3 (transaction grouping), F-17.4 (stack configuration), F-14.14 (keyboard shortcut customization)

---

### 17.2 Structural Change Undo [P1]

**Description**: Structural grid operations — such as row reordering, column resizing, and column visibility changes — are recorded on the same unified undo stack as cell edits. This gives users a single, predictable Ctrl+Z path to reverse any grid change regardless of its type.

**Applies to**: All variants

**Use Cases**
- UC-1: User accidentally reorders a row and presses Ctrl+Z to restore its original position.
- UC-2: User resizes a column too narrow and presses Ctrl+Z to restore the previous width.
- UC-3: User hides a column and immediately presses Ctrl+Z to reveal it again.
- UC-4: User adds a new blank row, presses Ctrl+Z to remove it.
- UC-5: User performs a cell edit followed by a column reorder; two successive Ctrl+Z presses reverse each operation in order.

**Conditions of Use**
- All structural operations listed below push entries onto the unified undo stack only when they are user-initiated; programmatic changes made via the grid API do not push to the stack unless `pushToUndoStack: true` is explicitly passed.
- Structural and cell edit operations share the same ordered stack; undo steps through them in strict chronological reverse order.
- Operations covered: row reorder (F-10.1), row pin/unpin (F-10.2), column reorder (F-09.3), column resize (F-09.1), column hide/show (F-09.5), row add (F-10.3), row delete (F-10.4).

**Behavioral Requirements**
- BR-1: The grid SHALL push each user-initiated structural operation onto the unified undo stack as a discrete entry containing `{ type: 'structural', operation: string, before: any, after: any }`.
- BR-2: The grid SHALL undo a row reorder by restoring the row to its previous position in the display order.
- BR-3: The grid SHALL undo a row pin/unpin by toggling the row's pinned state back to its prior value.
- BR-4: The grid SHALL undo a column reorder by restoring the column to its previous index.
- BR-5: The grid SHALL undo a column resize by restoring the column's previous width, updating the corresponding CSS variable.
- BR-6: The grid SHALL undo a column hide/show by restoring the column's previous visibility state.
- BR-7: The grid SHALL undo a row addition by removing the added row.
- BR-8: The grid SHALL undo a row deletion by restoring the deleted row at its previous position with its previous data.
- BR-9: The grid SHALL fire a cancelable `undoAction` event before applying any undo, carrying `{ type: 'cell' | 'structural', operation: string, oldValue: any, newValue: any }`; calling `event.preventDefault()` SHALL prevent the undo from being applied.
- BR-10: Programmatic structural changes made via the grid API SHALL NOT push to the undo stack unless the caller passes `{ pushToUndoStack: true }` as an option.

**Accessibility**
- **ARIA**: After a structural undo (e.g., column reorder), the grid's accessible column order SHALL update immediately so that screen reader navigation reflects the restored structure.
- **Screen Reader**: SR: "Undo applied: [operation description]" announced via `aria-live="polite"` region. Example: "Undo applied: Column Price moved back to position 3."
- **WCAG**: 3.3.4 Error Prevention, 2.1.1 Keyboard.
- **Visual**: No additional visual indicator beyond the standard undo keyboard shortcut and optional toolbar button state is required.

**Chameleon 6 Status**: New feature

**Interactions**: F-09.1 (column resize), F-09.3 (column reorder), F-09.5 (column visibility), F-10.1 (row reorder), F-10.2 (row pin), F-10.3 (row add), F-10.4 (row delete), F-17.1 (shared stack with cell edits), F-17.3 (transactions can group structural operations), F-17.4 (stack depth and clear configuration)

---

### 17.3 Transaction-Based Undo [P1]

**Description**: Consumers can bracket multiple operations inside a transaction so that they appear as a single undo step. Transactions can be committed, recording all enclosed operations as one entry, or rolled back, reversing all enclosed operations immediately. This is used internally by batch editing (F-07.7) and is available for consumer orchestration.

**Applies to**: All variants

**Use Cases**
- UC-1: A "Fill Down" action edits 50 cells; the consumer wraps it in a transaction so that one Ctrl+Z reverses all 50 edits at once.
- UC-2: A multi-step row insertion wizard uses a transaction so that cancelling the wizard rolls back all partial changes.
- UC-3: An import operation applies rows in a transaction; on validation failure, `rollbackTransaction()` cleanly reverses the partial import.
- UC-4: Batch edit mode (F-07.7) automatically uses a transaction to group all pending edits into one undo step on commit.

**Conditions of Use**
- Only one transaction may be active at a time; nested `beginTransaction()` calls are not supported.
- All operations (cell edits and structural changes) performed while a transaction is open are captured in the transaction buffer and are not individually pushed to the undo stack until `commitTransaction()` is called.
- Rolling back a transaction reverses all buffered operations in reverse chronological order before clearing the buffer.
- A transaction that has not been committed or rolled back when the grid is destroyed is automatically rolled back.

**Behavioral Requirements**
- BR-1: The grid SHALL expose `grid.beginTransaction()` which opens a new transaction; all subsequent user and API operations SHALL be buffered until the transaction is closed.
- BR-2: The grid SHALL throw an error if `grid.beginTransaction()` is called while a transaction is already active.
- BR-3: The grid SHALL expose `grid.commitTransaction()` which closes the active transaction and pushes all buffered operations as a single undo stack entry.
- BR-4: The grid SHALL expose `grid.rollbackTransaction()` which closes the active transaction and immediately reverses all buffered operations in reverse order, without pushing anything to the undo stack.
- BR-5: The grid SHALL fire a `transactionStart` event when a transaction begins, carrying no payload beyond a transaction ID.
- BR-6: The grid SHALL fire a `transactionEnd` event when a transaction ends, carrying `{ committed: boolean, operationCount: number, transactionId: string }`.
- BR-7: Undoing a committed transaction SHALL reverse all of its constituent operations as a single undo step; one Ctrl+Z SHALL undo the entire committed transaction.
- BR-8: Redoing a committed-then-undone transaction SHALL re-apply all constituent operations as a single redo step.
- BR-9: Calling `grid.commitTransaction()` when no transaction is active SHALL be a no-op and SHALL NOT throw.
- BR-10: Calling `grid.rollbackTransaction()` when no transaction is active SHALL be a no-op and SHALL NOT throw.
- BR-11: The grid SHALL automatically roll back any active transaction when the grid component is destroyed or detached from the DOM.

**Accessibility**
- **ARIA**: Because a committed transaction may change many cells simultaneously, the grid SHALL batch accessible value announcements and emit a single summarized `aria-live` announcement rather than one per cell.
- **Screen Reader**: SR: "Undo applied: [N] changes reversed" for a transaction undo where N is the operation count.
- **WCAG**: 3.3.4 Error Prevention — transaction rollback supports safe cancellation of multi-step data entry.
- **Visual**: No additional visual indicator is required beyond the existing undo/redo affordances.

**Chameleon 6 Status**: New feature

**Interactions**: F-07.7 (batch editing uses transactions internally), F-17.1 (cell edits within a transaction), F-17.2 (structural changes within a transaction), F-17.4 (committed transactions occupy one slot in the undo stack)

---

### 17.4 Undo Stack Configuration [P1]

**Description**: The undo stack behavior is configurable: consumers can set a maximum stack depth, specify which grid events automatically clear the stack, and disable the undo/redo system entirely. A programmatic API to clear the stack is also provided.

**Applies to**: All variants

**Use Cases**
- UC-1: A financial application sets `undoStackDepth: 100` to give power users a deeper history.
- UC-2: A read-heavy dashboard sets `undoEnabled: false` to eliminate undo overhead when editing is rarely used.
- UC-3: A consumer adds `'filter'` and `'sort'` to `undoClearOn` so that the stack resets whenever the visible dataset changes, preventing confusing cross-context undos.
- UC-4: After a server-side save operation, the consumer calls `grid.clearUndoStack()` to prevent undoing past the save point.

**Conditions of Use**
- `undoStackDepth` must be a positive integer; values less than 1 are clamped to 1.
- `undoClearOn` accepts any combination of `'sort'`, `'filter'`, `'group'`, and `'dataLoad'`; the default is `['dataLoad']`.
- When `undoEnabled` is `false`, Ctrl+Z and Ctrl+Y are not intercepted by the grid; the browser or other listeners may handle them.
- Stack depth enforcement occurs on push: when a new entry would exceed the depth limit, the oldest entry is dropped before the new one is added.

**Behavioral Requirements**
- BR-1: The grid SHALL accept `undoStackDepth: number` (default: 50) defining the maximum number of entries the undo stack may hold.
- BR-2: When a new undo entry is pushed and the stack already contains `undoStackDepth` entries, the grid SHALL drop the oldest entry to make room.
- BR-3: The grid SHALL accept `undoClearOn: ('sort' | 'filter' | 'group' | 'dataLoad')[]` (default: `['dataLoad']`); the undo and redo stacks SHALL be cleared when any listed event occurs.
- BR-4: The grid SHALL accept `undoEnabled: boolean` (default: `true`); when `false`, the grid SHALL not push operations to the undo stack and SHALL not intercept Ctrl+Z or Ctrl+Y.
- BR-5: The grid SHALL expose `grid.clearUndoStack()` which empties both the undo and redo stacks immediately.
- BR-6: After `grid.clearUndoStack()` is called, the grid SHALL fire `undoAvailable` and `redoAvailable` change events reflecting the now-empty stacks.
- BR-7: Keyboard shortcut customization configured via F-14.14 SHALL apply to undo/redo bindings; remapped shortcuts SHALL replace the defaults.
- BR-8: The grid SHALL expose a read-only `undoStackDepth` getter reflecting the current count of entries in the undo stack (distinct from the configuration property of the same name).
- BR-9: `undoEnabled` MAY be changed at runtime; disabling it while operations are on the stack SHALL preserve existing entries but prevent new ones from being added; re-enabling it SHALL resume normal stack behavior.

**Keyboard Interaction**
| Key | Action | Mode |
|-----|--------|------|
| Ctrl+Z | Undo (when `undoEnabled: true`) | Normal navigation |
| Ctrl+Y | Redo (when `undoEnabled: true`) | Normal navigation |
| Ctrl+Shift+Z | Redo alternative (when `undoEnabled: true`) | Normal navigation |

**Accessibility**
- **ARIA**: When the undo stack is cleared, if a toolbar contains undo/redo buttons, their `aria-disabled` state SHALL update immediately.
- **Screen Reader**: SR: "Undo history cleared" announced via `aria-live="polite"` when `grid.clearUndoStack()` is called programmatically.
- **WCAG**: 2.1.1 Keyboard — undo/redo must remain keyboard-operable when enabled.
- **Visual**: Undo/redo toolbar buttons (when present) SHALL visually reflect availability (enabled vs. disabled) without relying solely on color.

**Chameleon 6 Status**: New feature

**Interactions**: F-17.1 (stack depth affects cell edit history), F-17.2 (structural changes occupy stack slots), F-17.3 (committed transactions occupy one stack slot regardless of operation count), F-14.14 (keyboard shortcut remapping applies to Ctrl+Z / Ctrl+Y)

---

## Normative Requirements

The following normative requirements summarize the binding rules for the Undo / Redo feature. Each requirement is uniquely identified for traceability.

| ID | Requirement |
|----|-------------|
| UR-01 | The grid SHALL push each committed cell edit onto the undo stack as a discrete entry containing the row ID, column ID, old value, and new value. |
| UR-02 | The grid SHALL undo the most recent undo stack entry on Ctrl+Z, restoring the affected cell to its previous value and moving focus to that cell. |
| UR-03 | The grid SHALL redo the most recently undone operation on Ctrl+Y or Ctrl+Shift+Z, re-applying the value and moving focus to the affected cell. |
| UR-04 | When Ctrl+Z is pressed while a cell is in edit mode, the grid SHALL cancel the current edit without pushing any entry to the undo stack. |
| UR-05 | The grid SHALL clear the redo stack when a new edit is committed after one or more undo operations. |
| UR-06 | The grid SHALL push user-initiated structural operations (row reorder, row pin, column reorder, column resize, column hide/show, row add, row delete) onto the unified undo stack. |
| UR-07 | Structural changes made via the grid API SHALL NOT push to the undo stack unless `{ pushToUndoStack: true }` is explicitly passed by the caller. |
| UR-08 | The grid SHALL fire a cancelable `undoAction` event before applying any undo operation; calling `event.preventDefault()` SHALL prevent the undo from being applied. |
| UR-09 | The grid SHALL expose `grid.beginTransaction()`, `grid.commitTransaction()`, and `grid.rollbackTransaction()` for transaction-based undo grouping. |
| UR-10 | The grid SHALL throw an error if `grid.beginTransaction()` is called while a transaction is already active. |
| UR-11 | A committed transaction SHALL occupy exactly one slot on the undo stack, and one Ctrl+Z SHALL reverse all of its constituent operations. |
| UR-12 | The grid SHALL accept `undoStackDepth: number` (default 50); when the stack exceeds this depth on push, the oldest entry SHALL be dropped. |
| UR-13 | The grid SHALL accept `undoClearOn: ('sort' | 'filter' | 'group' | 'dataLoad')[]` (default `['dataLoad']`) and clear both stacks when any listed event occurs. |
| UR-14 | The grid SHALL accept `undoEnabled: boolean` (default `true`); when `false`, no operations SHALL be pushed to the stack and Ctrl+Z / Ctrl+Y SHALL not be intercepted by the grid. |
| UR-15 | The grid SHALL expose `grid.clearUndoStack()` which empties both the undo and redo stacks and fires availability change events. |
| UR-16 | All undo/redo operations SHALL provide `aria-live` announcements describing the operation applied, meeting WCAG 2.1 AA requirements. |

---
*This file is part of the Chameleon 7 Tabular Grid Specification. See [README.md](../README.md) for the complete table of contents.*
