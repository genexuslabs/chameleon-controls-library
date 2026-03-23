# F-16: Context Menus

> **Part of**: [Tabular Grid Specification](../README.md)
> **Feature category**: Context Menus
> **Variants**: All (Data Grid, Tree Grid, Pivot Table, Gantt Chart)

## Overview
Context menus provide contextual actions for columns, cells, and rows. They can be triggered via right-click or keyboard (Shift+F10) and support both built-in and custom items.

---

### 16.1 Column Header Context Menu [P1]

**Description**: Right-click or Shift+F10 on a column header opens a contextual menu with column-specific actions. Built-in items reflect current column state and are dynamically shown or hidden based on that state. For example, "Clear Sort" only appears when the column is currently sorted.

**Applies to**: All variants

**Use Cases**
- UC-1: User right-clicks a column header to sort the column descending.
- UC-2: User presses Shift+F10 while a column header is focused to pin the column to the left.
- UC-3: User opens the header menu to hide a column they do not need in the current view.
- UC-4: User selects "Auto-size Column" to fit the column width to its content.

**Conditions of Use**
- A column header cell must be focused or hovered for the menu to be triggered.
- Built-in items are only present when the corresponding capability is enabled (e.g., "Sort Ascending" requires sorting to be enabled for that column).
- "Clear Sort" is only shown when the column has an active sort applied.
- "Unpin" is only shown when the column is currently pinned.

**Behavioral Requirements**
- BR-1: The grid SHALL open the column header context menu on right-click of a column header cell.
- BR-2: The grid SHALL open the column header context menu when Shift+F10 is pressed while focus is on a column header cell.
- BR-3: The grid SHALL position the menu anchored to the column header cell; right-click SHALL position at pointer coordinates.
- BR-4: The grid SHALL include the following built-in items when their corresponding features are enabled: Sort Ascending, Sort Descending, Clear Sort, Pin Left, Pin Right, Unpin, Hide Column, Auto-size Column, Reset Column Width.
- BR-5: The grid SHALL show "Clear Sort" only when the column has an active sort.
- BR-6: The grid SHALL show "Unpin" only when the column is pinned; "Pin Left" and "Pin Right" SHALL only appear when the column is not pinned.
- BR-7: The grid SHALL close the menu and execute the selected action when Enter is pressed on a menu item.
- BR-8: The grid SHALL close the menu without taking action when Escape is pressed.
- BR-9: The grid SHALL return focus to the column header cell that triggered the menu after the menu closes, regardless of whether an action was taken.
- BR-10: The grid SHALL fire a `columnContextMenu` event before opening the menu, carrying `{ column, triggerX, triggerY }`, allowing the consumer to call `event.preventDefault()` to suppress the default menu.

**Keyboard Interaction**
| Key | Action | Mode |
|-----|--------|------|
| Shift+F10 | Open column header context menu | Header focused |
| Arrow Down | Move focus to next menu item | Menu open |
| Arrow Up | Move focus to previous menu item | Menu open |
| Enter | Activate focused menu item | Menu open |
| Escape | Close menu, return focus to header | Menu open |
| Home | Move focus to first menu item | Menu open |
| End | Move focus to last menu item | Menu open |

**Accessibility**
- **ARIA**: Column header element SHALL carry `aria-haspopup="menu"`. The menu container SHALL have `role="menu"`. Each item SHALL have `role="menuitem"`. Disabled items SHALL have `aria-disabled="true"`. The menu SHALL have `aria-labelledby` pointing to the triggering column header.
- **Screen Reader**: SR: "Sort Ascending, menu item" when navigating items. SR: "Column header context menu, [column label]" when the menu opens.
- **WCAG**: 1.3.1 Info and Relationships, 2.1.1 Keyboard, 4.1.2 Name, Role, Value.
- **Visual**: Focused menu item SHALL have a visible focus indicator not relying solely on color.

**Chameleon 6 Status**: Partially existed

**Interactions**: F-02 (sorting items), F-09 (column management items — pin, hide, resize), F-16.3 (custom items added alongside built-ins), F-16.5 (programmatic open/close API), F-14 (keyboard navigation integration)

---

### 16.2 Cell and Row Context Menu [P1]

**Description**: Right-click or Shift+F10 on a data cell opens a contextual menu scoped to that cell and its containing row. Built-in items are driven by grid capabilities active at the time. The menu exposes both the row record and the column definition to consumers so that custom actions can make data-aware decisions.

**Applies to**: All variants

**Use Cases**
- UC-1: User right-clicks a cell to copy the cell value to the clipboard.
- UC-2: User presses Shift+F10 on a focused cell to open the edit dialog for that cell.
- UC-3: User right-clicks a row to delete it when row deletion is configured.
- UC-4: User right-clicks a cell to copy the entire row as tab-separated values.
- UC-5: User right-clicks within a range selection to copy the selected range.

**Conditions of Use**
- A data cell must be focused or hovered for the menu to trigger.
- "Copy Range" appears only when range selection is enabled (F-08) and a multi-cell range is currently selected.
- "Edit Cell" appears only when the cell's column is configured as editable (FD-03).
- "Delete Row" appears only when the `allowRowDelete` option is enabled.
- In Tree Grid variant, additional items (Expand All Children, Collapse All Children) are conditionally shown for rows with children.

**Behavioral Requirements**
- BR-1: The grid SHALL open the cell context menu on right-click of a data cell.
- BR-2: The grid SHALL open the cell context menu when Shift+F10 is pressed while focus is on a data cell.
- BR-3: The grid SHALL position the menu at pointer coordinates on right-click; on Shift+F10, the menu SHALL be positioned adjacent to the focused cell.
- BR-4: The grid SHALL include "Copy Cell" as a built-in item when clipboard access is available.
- BR-5: The grid SHALL include "Copy Row" as a built-in item when clipboard access is available.
- BR-6: The grid SHALL include "Copy Range" only when a multi-cell range selection is active.
- BR-7: The grid SHALL include "Edit Cell" only when the cell is in an editable column.
- BR-8: The grid SHALL include "Delete Row" only when row deletion is configured.
- BR-9: The grid SHALL fire a `cellContextMenu` event before opening the menu, carrying `{ row, column, cell, triggerX, triggerY }`, allowing the consumer to call `event.preventDefault()` to suppress the default menu.
- BR-10: The grid SHALL return focus to the triggering cell after the menu closes.
- BR-11: In Tree Grid variant, the grid SHALL include "Expand All Children" and "Collapse All Children" items for rows that have child rows, conditional on the row's expanded state.

**Variant-Specific Behavior**
| Variant | Difference |
|---------|------------|
| Tree Grid | Adds "Expand All Children" / "Collapse All Children" items for rows with children |
| Pivot Table | Cell menu is limited to copy operations; edit/delete are not applicable to aggregated cells |
| Gantt Chart | Cell menu for task rows includes task-specific actions (e.g., "Edit Task", "Add Dependency") when configured |

**Keyboard Interaction**
| Key | Action | Mode |
|-----|--------|------|
| Shift+F10 | Open cell context menu | Cell focused |
| Arrow Down | Move focus to next menu item | Menu open |
| Arrow Up | Move focus to previous menu item | Menu open |
| Enter | Activate focused menu item | Menu open |
| Escape | Close menu, return focus to cell | Menu open |
| Home | Move focus to first menu item | Menu open |
| End | Move focus to last menu item | Menu open |

**Accessibility**
- **ARIA**: Each data cell carrying a menu trigger SHALL have `aria-haspopup="menu"` when a context menu is configured. The menu container SHALL have `role="menu"`. Each item SHALL have `role="menuitem"`. Disabled items SHALL have `aria-disabled="true"`.
- **Screen Reader**: SR: "Context menu available, press Shift+F10 to open" when a cell with a configured menu receives focus. SR: "[action name], menu item" when navigating items.
- **WCAG**: 1.3.1 Info and Relationships, 2.1.1 Keyboard, 4.1.2 Name, Role, Value.
- **Visual**: Active/focused menu item SHALL have a visible focus ring not relying solely on color contrast.

**Chameleon 6 Status**: Partially existed

**Interactions**: F-07 (edit cell action), F-08 (copy range requires range selection), F-10 (delete row), F-12 (copy actions feed into export), F-16.3 (custom items), F-16.4 (conditional items), F-16.5 (programmatic API)

---

### 16.3 Custom Menu Items [P1]

**Description**: Consumers can inject custom items into both column header and cell context menus via configuration. Items can be static or dynamically computed per cell via a callback. Single-level submenus are supported. Custom items can be mixed with, prepended to, appended to, or used to replace the built-in items entirely.

**Applies to**: All variants

**Use Cases**
- UC-1: Consumer adds a "Send to Dashboard" action to the cell context menu for all numeric columns.
- UC-2: Consumer generates dynamic items based on row data (e.g., showing workflow transitions valid for the current row status).
- UC-3: Consumer adds a submenu "Export As" with items "CSV", "JSON", "Excel" to the column header menu.
- UC-4: Consumer replaces all built-in column header items with a fully custom set.

**Conditions of Use**
- `columnMenuItems` is evaluated at menu-open time so that dynamic content is current.
- Callback form of `cellMenuItems` receives the current `CellContext` at menu-open time.
- Submenus are limited to one level of nesting; deeper nesting is ignored.
- When `menuItemsPosition: 'replace'` is set, no built-in items are included.

**Behavioral Requirements**
- BR-1: The grid SHALL accept `columnMenuItems: MenuItem[]` to add items to column header context menus.
- BR-2: The grid SHALL accept `cellMenuItems: MenuItem[] | ((context: CellContext) => MenuItem[])` to add items to cell/row context menus.
- BR-3: The grid SHALL support `MenuItem` with the shape `{ label: string, icon?: string, action: (context) => void, disabled?: boolean | ((context) => boolean), hidden?: boolean | ((context) => boolean), separator?: boolean, submenu?: MenuItem[] }`.
- BR-4: The grid SHALL accept `menuItemsPosition: 'before' | 'after' | 'replace'` to control placement of custom items relative to built-in items (default: `'after'`).
- BR-5: The grid SHALL render a visual separator for items with `separator: true`; a separator item SHALL NOT be the first or last visible item in a menu.
- BR-6: The grid SHALL render an icon when `MenuItem.icon` is provided, using the grid's icon rendering pipeline.
- BR-7: The grid SHALL evaluate `disabled` and `hidden` functions at menu-open time against the current context.
- BR-8: The grid SHALL open a submenu on Arrow Right when focus is on a parent item with `submenu`; the grid SHALL close the submenu on Arrow Left or Escape.
- BR-9: The grid SHALL call `MenuItem.action(context)` when the item is activated, passing the current `CellContext` or column context as appropriate.
- BR-10: The grid SHALL ignore `submenu` entries beyond the first level of nesting without throwing an error.

**Keyboard Interaction**
| Key | Action | Mode |
|-----|--------|------|
| Arrow Right | Open submenu, move focus to first item | Parent item focused |
| Arrow Left | Close submenu, return focus to parent item | Submenu open |
| Escape | Close submenu (first press), then close menu (second press) | Submenu open |
| Enter | Activate item or open submenu if present | Menu item focused |

**Accessibility**
- **ARIA**: Parent items with submenus SHALL have `aria-haspopup="menu"` and `aria-expanded` reflecting submenu state. Submenus SHALL have `role="menu"`. Separator items SHALL have `role="separator"`.
- **Screen Reader**: SR: "[label], submenu, menu item" for items with submenus. SR: "Submenu opened" when a submenu expands.
- **WCAG**: 2.1.1 Keyboard, 4.1.2 Name, Role, Value.
- **Visual**: Submenu parent items SHALL have a visual indicator (e.g., chevron icon) to signal nested content, not relying solely on color.

**Chameleon 6 Status**: Partially existed

**Interactions**: F-16.1 (column header integration), F-16.2 (cell integration), F-16.4 (hidden/disabled conditions), F-16.5 (event cancellation can precede custom item display)

---

### 16.4 Conditional Menu Items [P1]

**Description**: Individual menu items can be conditionally hidden or disabled based on the current row, cell data, or grid state at the time the menu opens. Separators are automatically suppressed when all adjacent items are hidden, preventing orphaned dividers.

**Applies to**: All variants

**Use Cases**
- UC-1: The "Delete Row" item is disabled when the row is locked or read-only.
- UC-2: The "Edit Cell" item is hidden for aggregated rows that cannot be edited.
- UC-3: A custom "Approve" action is hidden unless the row's status field equals `'pending'`.
- UC-4: A separator between two groups is automatically hidden when one entire group is hidden.

**Conditions of Use**
- `disabled` and `hidden` callbacks are evaluated at menu-open time, not at grid initialization.
- Automatic separator suppression applies to both built-in separators and consumer-defined separator items.
- A fully hidden menu (all items hidden) does not open; the `contextMenuOpen` event still fires and is cancelable.

**Behavioral Requirements**
- BR-1: The grid SHALL evaluate `hidden: (context) => boolean` for each menu item at menu-open time and exclude hidden items from the rendered menu.
- BR-2: The grid SHALL evaluate `disabled: (context) => boolean` for each menu item at menu-open time and render disabled items with `aria-disabled="true"` and no pointer interaction.
- BR-3: The grid SHALL suppress a separator item when all items immediately preceding it (up to the previous separator or menu start) are hidden.
- BR-4: The grid SHALL suppress a separator item when all items immediately following it (up to the next separator or menu end) are hidden.
- BR-5: The grid SHALL NOT open the context menu if all items (after applying `hidden` rules) are hidden; focus SHALL remain on the triggering element.
- BR-6: The grid SHALL re-evaluate all conditions on each menu open so that changes in data or grid state are reflected.
- BR-7: Disabled items SHALL be focusable via keyboard but SHALL NOT execute their action when Enter is pressed.
- BR-8: The grid SHALL apply conditional logic equally to both built-in items and consumer-defined custom items.

**Accessibility**
- **ARIA**: Disabled items SHALL have `aria-disabled="true"` and SHALL remain in the DOM (not removed) so that screen readers can announce their presence.
- **Screen Reader**: SR: "[item label], dimmed, menu item" for disabled items.
- **WCAG**: 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value.
- **Visual**: Disabled items SHALL have a visually distinct appearance (reduced opacity or muted color) in addition to the `aria-disabled` state; this SHALL NOT rely solely on color.

**Chameleon 6 Status**: Partially existed

**Interactions**: F-16.3 (disabled/hidden callbacks defined in MenuItem), F-16.1 (built-in column header items use same system), F-16.2 (built-in cell items use same system)

---

### 16.5 Context Menu API [P1]

**Description**: A programmatic API allows consumers to open, close, and intercept context menus without user pointer input. The API supports both column header and cell menu types. Events fired at open and close time allow consumers to replace the default menu entirely with a custom implementation.

**Applies to**: All variants

**Use Cases**
- UC-1: An accessibility audit tool programmatically opens the context menu for a cell to verify its contents.
- UC-2: A consumer intercepts the `contextMenuOpen` event to show a fully custom overlay menu instead of the default one.
- UC-3: A consumer calls `grid.hideContextMenu()` when the user performs a navigation action that should dismiss any open overlays.
- UC-4: A toolbar "More Actions" button calls `grid.showContextMenu(rowId, colId, 'cell')` to open the cell menu at the focused cell.

**Conditions of Use**
- `grid.showContextMenu()` requires a valid `rowId` and `colId` for `type: 'cell'`, or a valid `colId` for `type: 'column'`.
- If no menu content would be shown (all items hidden), `showContextMenu()` is a no-op and fires no events.
- `grid.hideContextMenu()` is safe to call when no menu is open; it is a no-op in that case.
- `event.preventDefault()` on `contextMenuOpen` suppresses the default menu rendering but does not prevent the event from firing further listeners.

**Behavioral Requirements**
- BR-1: The grid SHALL expose `grid.showContextMenu(rowId: string, colId: string, type: 'cell' | 'column')` which opens the appropriate context menu positioned adjacent to the specified cell or column header.
- BR-2: The grid SHALL expose `grid.hideContextMenu()` which closes any currently open context menu.
- BR-3: The grid SHALL fire a `contextMenuOpen` event when any context menu opens, carrying `{ type: 'cell' | 'column', row?: RowData, column: ColumnDef, triggerX: number, triggerY: number }`.
- BR-4: The `contextMenuOpen` event SHALL be cancelable; calling `event.preventDefault()` SHALL prevent the default menu from rendering.
- BR-5: The grid SHALL fire a `contextMenuClose` event when any context menu closes, carrying `{ type: 'cell' | 'column', actionTaken: boolean }`.
- BR-6: Only one context menu SHALL be open at any time; opening a second menu SHALL implicitly close the first.
- BR-7: The grid SHALL close any open context menu when focus moves outside the grid.
- BR-8: The grid SHALL close any open context menu when the grid data is reloaded.
- BR-9: The `contextMenuOpen` and `contextMenuClose` events SHALL be available for subscription via standard DOM `addEventListener`.

**Accessibility**
- **ARIA**: Programmatically opened menus SHALL meet the same ARIA requirements as pointer-triggered menus (see F-16.1 and F-16.2).
- **Screen Reader**: SR: Menu opening and closing announcements SHALL be identical regardless of whether the menu was triggered by pointer, keyboard, or API.
- **WCAG**: 2.1.1 Keyboard, 4.1.2 Name, Role, Value.
- **Visual**: Programmatically opened menus SHALL appear with the same visual treatment as user-triggered menus.

**Chameleon 6 Status**: New feature

**Interactions**: F-16.1 (column header menu), F-16.2 (cell menu), F-16.3 (custom items visible in programmatically opened menu), F-16.4 (conditional logic applies equally), F-14 (keyboard navigation applies once menu is open)

---

## Normative Requirements

The following normative requirements summarize the binding rules for the Context Menus feature. Each requirement is uniquely identified for traceability.

| ID | Requirement |
|----|-------------|
| CM-01 | The grid SHALL open a column header context menu on right-click of a column header cell. |
| CM-02 | The grid SHALL open a column header context menu when Shift+F10 is pressed while focus is on a column header cell. |
| CM-03 | The grid SHALL open a cell context menu on right-click of a data cell. |
| CM-04 | The grid SHALL open a cell context menu when Shift+F10 is pressed while focus is on a data cell. |
| CM-05 | The grid SHALL dynamically include or exclude built-in menu items based on current column and grid state at the time the menu opens. |
| CM-06 | The grid SHALL include only one open context menu at any time; opening a new menu SHALL close any existing open menu. |
| CM-07 | The grid SHALL close the active context menu when Escape is pressed. |
| CM-08 | The grid SHALL return keyboard focus to the element that triggered the context menu after the menu closes. |
| CM-09 | The grid SHALL fire a cancelable `columnContextMenu` event before rendering a column header menu, carrying column and trigger position data. |
| CM-10 | The grid SHALL fire a cancelable `cellContextMenu` event before rendering a cell menu, carrying row, column, cell, and trigger position data. |
| CM-11 | The grid SHALL accept `columnMenuItems: MenuItem[]` for consumer-defined column header menu items. |
| CM-12 | The grid SHALL accept `cellMenuItems: MenuItem[] | ((context: CellContext) => MenuItem[])` for consumer-defined cell menu items. |
| CM-13 | The grid SHALL support `MenuItem.submenu` for one level of nested submenu; deeper nesting SHALL be silently ignored. |
| CM-14 | The grid SHALL evaluate `MenuItem.hidden` and `MenuItem.disabled` callbacks at menu-open time against the current context. |
| CM-15 | The grid SHALL suppress separator items when all adjacent items in the same visual group are hidden. |
| CM-16 | The grid SHALL NOT open a context menu when all items are hidden after applying `hidden` rules. |
| CM-17 | The grid SHALL expose `grid.showContextMenu(rowId, colId, type)` for programmatic menu opening. |
| CM-18 | The grid SHALL expose `grid.hideContextMenu()` for programmatic menu closing; this method SHALL be safe to call when no menu is open. |
| CM-19 | The grid SHALL fire `contextMenuOpen` and `contextMenuClose` events for all menu open/close operations regardless of trigger source. |
| CM-20 | All context menus SHALL meet WCAG 2.1 AA requirements including keyboard operability, ARIA roles, and non-color-only visual indicators for state. |

---
*This file is part of the Chameleon 7 Tabular Grid Specification. See [README.md](../README.md) for the complete table of contents.*
