# Appendix A: Complete Keyboard Reference

> **Part of**: [Tabular Grid Specification](../README.md)
> **Type**: Quick-reference table synthesized from F-14 and variant-specific files
> **Note**: For behavioral requirements, see [F-14: Keyboard Navigation](../02-features/14-keyboard-navigation.md) and the variant-specific files in `03-variant-specific/`.

## Overview

This appendix provides a consolidated keyboard reference for all four variants. Each key is documented with its action, applicable mode, and variant notes.

---

## Data Grid

| Key | Action | Mode | Notes / Context |
|-----|--------|------|-----------------|
| Arrow Up | Move focus to the cell above | Navigation | Wraps to last row if at first row is not required; focus stays at edge |
| Arrow Down | Move focus to the cell below | Navigation | Wraps to first row if at last row is not required; focus stays at edge |
| Arrow Left | Move focus to the cell to the left | Navigation | At first cell of row, focus stays |
| Arrow Right | Move focus to the cell to the right | Navigation | At last cell of row, focus stays |
| Arrow Up | Cursor movement within editor (e.g., multi-line text) | Edit | Behavior depends on the active cell editor type |
| Arrow Down | Cursor movement within editor | Edit | Behavior depends on the active cell editor type |
| Arrow Left | Cursor movement within editor | Edit | Behavior depends on the active cell editor type |
| Arrow Right | Cursor movement within editor | Edit | Behavior depends on the active cell editor type |
| Enter | Enter edit mode for the focused cell | Navigation | If cell is already in edit mode, has no additional effect from navigation layer |
| Enter | Commit the edited value and move focus to the cell below | Edit | Saves the value; moves focus one row down in the same column |
| Escape | No action | Navigation | Key is ignored when not editing |
| Escape | Cancel the edit; discard changes; return to navigation mode | Edit | Restores the original value; focus returns to the cell |
| Tab | Exit the grid forward (move focus to next focusable element in page) | Navigation | Grid is treated as a single tab stop in the page tab sequence |
| Tab | Commit value and move focus to the next editable cell; exit grid if none remain | Edit | Cycles through editable cells left-to-right, top-to-bottom; exits grid at last editable cell |
| Shift+Tab | Exit the grid backward (move focus to previous focusable element in page) | Navigation | Grid is treated as a single tab stop in the page tab sequence |
| Shift+Tab | Commit value and move focus to the previous editable cell; exit grid if none remain | Edit | Cycles through editable cells right-to-left, bottom-to-top; exits grid at first editable cell |
| Home | Move focus to the first cell in the current row | Navigation | Column index becomes 1 |
| End | Move focus to the last cell in the current row | Navigation | Column index becomes the last visible column |
| Ctrl+Home | Move focus to the first cell of the first row | Navigation | Row and column index both become 1 |
| Ctrl+End | Move focus to the last cell of the last row | Navigation | Row and column index both become the last visible positions |
| Page Up | Move focus up by one visible page height | Navigation | Scrolls the viewport; focus moves to the topmost visible row in the same column |
| Page Down | Move focus down by one visible page height | Navigation | Scrolls the viewport; focus moves to the bottommost visible row in the same column |
| Space | Toggle selection for the focused row or cell | Navigation | Behavior depends on selection mode (row vs. cell) and whether multi-select is enabled |
| Ctrl+A | Select all rows | Navigation | Requires multi-row selection mode to be enabled |
| F2 | Enter edit mode without clearing the current cell value | Navigation | Cursor is placed at the end of the existing value inside the editor |
| Shift+F10 | Open the context menu for the focused cell or row | Navigation | Equivalent to a right-click on the focused element |
| Delete | Delete the focused row (if row deletion is configured) or clear the cell value | Navigation | The exact behavior is determined by component configuration |
| Backspace | Clear the current cell value and enter edit mode | Edit | Triggered from navigation mode: clears value and activates the editor |
| Any printable character | Enter edit mode and replace the cell value with the typed character | Navigation | The pressed character becomes the first character of the new value in the editor |
| Ctrl+Z | Undo the last operation | Both | Operates on the component's undo history; behavior in edit mode is editor-dependent |
| Ctrl+Y | Redo the last undone operation | Both | Alternative to Ctrl+Shift+Z |
| Ctrl+Shift+Z | Redo the last undone operation | Both | Alternative to Ctrl+Y |
| Ctrl+C | Copy the current selection to the clipboard | Navigation | Copies selected rows or cells depending on selection mode |
| Ctrl+V | Paste clipboard content into the focused cell or selection | Navigation | Only available when cell editing is enabled |

---

## Tree Grid

The Tree Grid supports all Data Grid keys. The following keys are additional or have modified behavior due to the hierarchical row structure.

| Key | Action | Mode | Notes / Context |
|-----|--------|------|-----------------|
| Arrow Up | Move focus to the cell above | Navigation | Same as Data Grid |
| Arrow Down | Move focus to the cell below | Navigation | Same as Data Grid |
| Arrow Right | Expand the focused collapsed parent row | Navigation | When the focused row is a collapsed parent node, expands it without moving focus |
| Arrow Right | Move focus to the first cell of the row | Navigation | When the focused row is already expanded, or the cursor is not on the row header cell |
| Arrow Left | Move focus to the row element (the row header cell) | Navigation | When focus is on the first data cell of a row, moves focus to the row's leading row header area |
| Arrow Left | Move focus to the parent row | Navigation | When focus is on the row header cell of a collapsed (or leaf) row, moves focus up to the parent |
| Arrow Left | Collapse the focused expanded parent row | Navigation | When focus is on the row header cell of an expanded parent node |
| Enter | Enter edit mode or confirm | Both | Same as Data Grid |
| Escape | Cancel edit / return to navigation | Both | Same as Data Grid |
| Tab | Exit grid forward or move to next editable cell | Both | Same as Data Grid |
| Shift+Tab | Exit grid backward or move to previous editable cell | Both | Same as Data Grid |
| Home | Move to first cell in the current row | Navigation | Same as Data Grid |
| End | Move to last cell in the current row | Navigation | Same as Data Grid |
| Ctrl+Home | Move to first cell of the first row | Navigation | Same as Data Grid |
| Ctrl+End | Move to last cell of the last row | Navigation | Same as Data Grid |
| Page Up | Move up by one visible page height | Navigation | Same as Data Grid |
| Page Down | Move down by one visible page height | Navigation | Same as Data Grid |
| Space | Toggle row/cell selection | Navigation | Same as Data Grid |
| Ctrl+A | Select all rows | Navigation | Same as Data Grid |
| F2 | Enter edit mode without clearing value | Navigation | Same as Data Grid |
| Shift+F10 | Open context menu | Navigation | Same as Data Grid |
| Delete | Delete row or clear cell value | Navigation | Same as Data Grid |
| Backspace | Clear cell value and enter edit mode | Edit | Same as Data Grid |
| Any printable character | Enter edit mode replacing cell value | Navigation | Same as Data Grid |
| Ctrl+Z | Undo | Both | Same as Data Grid |
| Ctrl+Y / Ctrl+Shift+Z | Redo | Both | Same as Data Grid |
| Ctrl+C | Copy selection | Navigation | Same as Data Grid |
| Ctrl+V | Paste into cells | Navigation | Same as Data Grid |
| + (Plus) | Expand the currently focused node | Navigation | Expands only the focused parent row, not its descendants |
| - (Minus) | Collapse the currently focused node | Navigation | Collapses only the focused parent row |
| * (Asterisk) | Expand all sibling nodes at the same level as the focused row | Navigation | Does not expand descendants of the siblings recursively unless specified |

---

## Pivot Table

The Pivot Table supports all Data Grid keys. The following keys have additional behavior due to drill-down row dimension headers and accessibility announcements.

| Key | Action | Mode | Notes / Context |
|-----|--------|------|-----------------|
| Arrow Up | Move focus to the cell above | Navigation | Same as Data Grid |
| Arrow Down | Move focus to the cell below | Navigation | Same as Data Grid |
| Arrow Left | Move focus to the cell to the left | Navigation | When focus is on a data cell, same as Data Grid |
| Arrow Left | Collapse the focused expanded row dimension header | Navigation | When focus is on an expanded row dimension header cell, collapses the drill-down group |
| Arrow Right | Move focus to the cell to the right | Navigation | When focus is on a data cell, same as Data Grid |
| Arrow Right | Expand the focused collapsed row dimension header | Navigation | When focus is on a collapsed row dimension header cell, expands the drill-down group |
| Enter | Enter edit mode or confirm | Both | Same as Data Grid; pivot cells may be read-only depending on configuration |
| Escape | Cancel edit / return to navigation | Both | Same as Data Grid |
| Tab | Exit grid forward or move to next editable cell | Both | Same as Data Grid |
| Shift+Tab | Exit grid backward or move to previous editable cell | Both | Same as Data Grid |
| Home | Move to first cell in the current row | Navigation | Same as Data Grid |
| End | Move to last cell in the current row | Navigation | Same as Data Grid |
| Ctrl+Home | Move to first cell of the first row | Navigation | Same as Data Grid |
| Ctrl+End | Move to last cell of the last row | Navigation | Same as Data Grid |
| Page Up | Move up by one visible page height | Navigation | Same as Data Grid |
| Page Down | Move down by one visible page height | Navigation | Same as Data Grid |
| Space | Toggle row/cell selection | Navigation | Same as Data Grid |
| Ctrl+A | Select all rows | Navigation | Same as Data Grid |
| F2 | Enter edit mode without clearing value | Navigation | Same as Data Grid |
| Shift+F10 | Open context menu | Navigation | Same as Data Grid |
| Delete | Delete row or clear cell value | Navigation | Same as Data Grid |
| Backspace | Clear cell value and enter edit mode | Edit | Same as Data Grid |
| Any printable character | Enter edit mode replacing cell value | Navigation | Same as Data Grid; may be suppressed on read-only pivot cells |
| Ctrl+Z | Undo | Both | Same as Data Grid |
| Ctrl+Y / Ctrl+Shift+Z | Redo | Both | Same as Data Grid |
| Ctrl+C | Copy selection | Navigation | Same as Data Grid |
| Ctrl+V | Paste into cells | Navigation | Same as Data Grid |
| Ctrl+Alt+Arrow Up | Announce all column headers above the currently focused data cell | Navigation | Accessibility shortcut; triggers a screen reader announcement of the full column header chain |
| Ctrl+Alt+Arrow Left | Announce all row headers to the left of the currently focused data cell | Navigation | Accessibility shortcut; triggers a screen reader announcement of the full row header chain |

---

## Gantt Chart

The Gantt Chart is composed of two distinct interactive regions: the **Task List** (a grid region) and the **Timeline** (an application region). Each region has its own keyboard model.

### Task List (Grid Region)

The Task List behaves identically to the Data Grid keyboard model.

| Key | Action | Mode | Notes / Context |
|-----|--------|------|-----------------|
| Arrow Up | Move focus to the cell above | Navigation | Same as Data Grid |
| Arrow Down | Move focus to the cell below | Navigation | Same as Data Grid |
| Arrow Left | Move focus to the cell to the left | Navigation | Same as Data Grid |
| Arrow Right | Move focus to the cell to the right | Navigation | Same as Data Grid |
| Enter | Enter edit mode or confirm | Both | Same as Data Grid |
| Escape | Cancel edit / return to navigation | Both | Same as Data Grid |
| Tab | Exit grid forward or move to next editable cell; when leaving last cell, focus moves to timeline | Both | Exiting the task list forward transfers focus into the Gantt timeline region |
| Shift+Tab | Exit grid backward or move to previous editable cell | Both | Same as Data Grid |
| Home | Move to first cell in the current row | Navigation | Same as Data Grid |
| End | Move to last cell in the current row | Navigation | Same as Data Grid |
| Ctrl+Home | Move to first cell of the first row | Navigation | Same as Data Grid |
| Ctrl+End | Move to last cell of the last row | Navigation | Same as Data Grid |
| Page Up | Move up by one visible page height | Navigation | Same as Data Grid |
| Page Down | Move down by one visible page height | Navigation | Same as Data Grid |
| Space | Toggle row/cell selection | Navigation | Same as Data Grid |
| Ctrl+A | Select all rows | Navigation | Same as Data Grid |
| F2 | Enter edit mode without clearing value | Navigation | Same as Data Grid |
| Shift+F10 | Open context menu | Navigation | Same as Data Grid |
| Delete | Delete row or clear cell value | Navigation | Same as Data Grid |
| Backspace | Clear cell value and enter edit mode | Edit | Same as Data Grid |
| Any printable character | Enter edit mode replacing cell value | Navigation | Same as Data Grid |
| Ctrl+Z | Undo | Both | Same as Data Grid |
| Ctrl+Y / Ctrl+Shift+Z | Redo | Both | Same as Data Grid |
| Ctrl+C | Copy selection | Navigation | Same as Data Grid |
| Ctrl+V | Paste into cells | Navigation | Same as Data Grid |

### Timeline (Application Region)

The Timeline region uses `role="application"`, which means the browser delegates full keyboard handling to the component. Focus is placed on individual task bar elements (`role="button"`).

| Key | Action | Mode | Notes / Context |
|-----|--------|------|-----------------|
| Arrow Left | Move the focused task bar's start date earlier by 1 zoom unit | Navigation | The zoom unit varies by current zoom level (e.g., 1 day, 1 week) |
| Arrow Right | Move the focused task bar's start date later by 1 zoom unit | Navigation | The zoom unit varies by current zoom level |
| Shift+Arrow Left | Move the focused task bar's end date earlier by 1 zoom unit (shorten task) | Navigation | Only the end date changes; start date is not affected |
| Shift+Arrow Right | Move the focused task bar's end date later by 1 zoom unit (extend task) | Navigation | Only the end date changes; start date is not affected |
| Ctrl+Arrow Left | Shift the entire focused task earlier by 1 zoom unit (preserve duration) | Navigation | Both start and end dates move; duration remains unchanged |
| Ctrl+Arrow Right | Shift the entire focused task later by 1 zoom unit (preserve duration) | Navigation | Both start and end dates move; duration remains unchanged |
| Arrow Up | Move focus to the previous task bar in the timeline | Navigation | Follows the same visual order as the task list |
| Arrow Down | Move focus to the next task bar in the timeline | Navigation | Follows the same visual order as the task list |
| + (Plus) | Zoom in to a finer time scale | Navigation | Increases timeline detail; e.g., from weeks to days |
| - (Minus) | Zoom out to a coarser time scale | Navigation | Decreases timeline detail; e.g., from days to weeks |
| Enter | Activate the focused task bar (open detail view or trigger default action) | Navigation | Equivalent to a click on the task bar |
| Space | Select or deselect the focused task bar | Navigation | Toggles selection state; does not activate the task |
| D | Enter dependency creation mode for the focused task bar | Navigation | Allows the user to draw a dependency link to another task using keyboard interaction |
| Escape | Cancel the current operation (dependency creation, drag) and return focus to the task list | Navigation | Pressing Escape from an idle focused task bar also returns focus to the task list |
| Tab | Exit the timeline region and return focus to the task list | Navigation | The timeline is a single tab stop; Tab moves focus out of `role="application"` |

---

*This appendix is synthesized from [F-14: Keyboard Navigation](../02-features/14-keyboard-navigation.md) and the variant-specific files. See [README.md](../README.md) for the complete table of contents.*
