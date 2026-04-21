# Appendix F: WCAG 2.2 AAA Compliance Audit Checklist

> **Part of**: [Tabular Grid Specification](../README.md)
> **Type**: Compliance verification checklist
> **Target**: WCAG 2.2 AAA (includes all A and AA criteria)

## Overview

This checklist maps WCAG 2.2 success criteria to grid-specific pass/fail tests. Use it during implementation review and accessibility audits.

**Columns**: Criterion | Level | Grid-Specific Test | Pass Condition | Spec Reference

---

## Principle 1: Perceivable

### 1.1 Text Alternatives

| Criterion | Level | Grid-Specific Test | Pass Condition | Spec Reference |
|---|---|---|---|---|
| 1.1.1 Non-text Content | A | Inspect loading spinners, sort icons, filter icons, expand/collapse arrows, Gantt task bars, and milestone markers in the accessibility tree. | All non-text content has a text alternative via `aria-label`, visually hidden text, or `aria-hidden="true"` on purely decorative elements. No icon renders without an accessible label or is left ambiguous. | FD-04 |

---

### 1.3 Adaptable

| Criterion | Level | Grid-Specific Test | Pass Condition | Spec Reference |
|---|---|---|---|---|
| 1.3.1 Info and Relationships | A | Inspect the DOM/accessibility tree for role assignments. Activate sort on a column; inspect `aria-sort`. Expand a group row; inspect `aria-expanded`. | Grid uses `role="grid"` or `role="treegrid"`, `role="row"`, `role="columnheader"` / `role="rowheader"` / `role="gridcell"`. Sort state is conveyed via `aria-sort`. Row grouping uses `role="rowgroup"` and `aria-expanded`. All structural relationships are programmatically determinable. | FD-04 |
| 1.3.2 Meaningful Sequence | A | Read DOM source order. Scroll grid horizontally with frozen columns present; inspect `aria-colindex` values. | DOM order matches visual reading order (left-to-right, top-to-bottom). Frozen columns maintain a continuous, correct `aria-colindex` sequence that reflects their logical position in the full column set. | FD-04, F-09.4 |
| 1.3.3 Sensory Characteristics | A | Review all user-facing instructions and labels. Verify sort state indicator and filter active indicator. | No instruction relies solely on color, shape, or position without a textual or programmatic supplement (e.g., "click the highlighted column" is not sufficient). Sort direction has both an icon and `aria-sort` text; filter active state has both a visual indicator and a textual label. | F-15 |
| 1.3.4 Orientation | AA | Render the grid in a portrait viewport and a landscape viewport. Apply CSS `orientation: portrait` lock and verify absence. | Grid renders correctly and all functionality remains accessible in both portrait and landscape orientations. No CSS forces a single orientation. | F-21.4 |
| 1.3.5 Identify Input Purpose | AA | Inspect cell editors for email, phone number, date, and person-name fields. Check `type` and `autocomplete` attributes. | Cell editors for common data types use appropriate `<input type>` values (e.g., `type="email"`, `type="tel"`, `type="date"`) and `autocomplete` token values where applicable, enabling browser autofill and assistive technology input hints. | F-07.4 |
| 1.3.6 Identify Purpose | AAA | Inspect all icon buttons (sort, filter, column menu, expand, drag handle) and landmark regions in the accessibility tree. | Every icon and region has a programmatic purpose expressed via `role` and/or `aria-label`. No interactive element is identified solely through visual appearance. | FD-04 |

---

### 1.4 Distinguishable

| Criterion | Level | Grid-Specific Test | Pass Condition | Spec Reference |
|---|---|---|---|---|
| 1.4.1 Use of Color | A | View sort direction indicator, filter-active state, selected rows, invalid cells, and Gantt critical-path bars in a color-blind simulation. Remove CSS color and verify remaining affordances. | Sort direction, filter active, selection, cell validation errors, and critical path are each conveyed by at least one non-color cue: an icon, a pattern, a text label, or a border change. No state is communicated by color alone. | F-15, F-18.4 |
| 1.4.3 Contrast (Minimum) | AA | Use a color contrast analyzer on cell text, column header text, placeholder text in filters, and error message text against their backgrounds. | All text meets a minimum contrast ratio of 4.5:1 against its background. Large text (18pt+ or 14pt+ bold) meets 3:1. Error messages meet 4.5:1. | F-15, F-18.4 |
| 1.4.4 Resize Text | AA | Set browser text size to 200%. Interact with the grid; scroll; navigate. | All cell text, header text, and UI control text scales to 200% without loss of content, functionality, or overlap. Row heights adjust to accommodate the enlarged text. | F-01.5 |
| 1.4.5 Images of Text | AA | Inspect icon rendering in the DOM. | All grid icons are rendered as inline SVG or icon font glyphs, not as `<img>` elements containing rasterized text. Column header labels and cell content are rendered as real text. | F-15 |
| 1.4.6 Contrast (Enhanced) | AAA | Use a color contrast analyzer on all grid text elements. | All text meets the enhanced contrast ratio of 7:1 against its background. Large text meets 4.5:1. | F-15 |
| 1.4.10 Reflow | AA | Set viewport width to 320 CSS pixels. Render the grid and verify scrolling behavior. | The grid does not introduce horizontal scrolling at 320px viewport width. It achieves this through responsive column hiding, an adaptive single-column layout mode, or a horizontal scroll container scoped to the grid region (not the page). | F-21.3, F-21.5 |
| 1.4.11 Non-text Contrast | AA | Use a color contrast analyzer on column resize handles, row drag handles, checkbox cell borders, and the focus indicator against adjacent colors. | Column resize handles, row drag handles, checkbox and radio controls, and focus indicators all meet a 3:1 contrast ratio against adjacent colors. | F-15 |
| 1.4.12 Text Spacing | AA | Apply a text-spacing bookmarklet (letter-spacing: 0.12em; word-spacing: 0.16em; line-height: 1.5; paragraph spacing: 2em). Interact with the grid. | No cell content, column header, or UI control text is clipped, truncated, or overlapped when user-defined text spacing overrides are applied. Row heights expand to accommodate increased line height. | F-15 |
| 1.4.13 Content on Hover or Focus | AA | Hover over a cell with a tooltip; move the pointer away without triggering dismissal; press Escape while tooltip is visible. | Tooltips and other content that appears on hover or focus are: (a) dismissible by pressing Escape without moving focus, (b) hoverable — the pointer can move from the trigger element to the tooltip without the tooltip disappearing, and (c) persistent — they remain visible until dismissed, focus moves away, or the information is no longer valid. | F-01.4 |

---

## Principle 2: Operable

### 2.1 Keyboard Accessible

| Criterion | Level | Grid-Specific Test | Pass Condition | Spec Reference |
|---|---|---|---|---|
| 2.1.1 Keyboard | A | Without using a mouse, perform: cell navigation, column sorting, filter input, row selection, cell editing, export action, context menu activation. | Every grid feature is fully operable using only a keyboard. Arrow navigation, sorting, filtering, selection, editing, export, and context menus all have documented keyboard interactions. No feature requires a pointer device. | F-14, FD-04 |
| 2.1.2 No Keyboard Trap | A | Tab into the grid. Press Escape while in edit mode. Tab out of the grid. | Focus is not trapped. Tab exits the grid when pressed at the last focusable element (or Shift+Tab from the first). Escape from edit mode reliably returns to navigation mode without trapping focus. | FD-03, FD-04 |
| 2.1.3 Keyboard (No Exception) | AAA | Attempt column reorder and row reorder using only the keyboard (no mouse). | Every feature, including drag-and-drop interactions, is operable via keyboard. Column reordering has a keyboard alternative (via the column menu). Row reordering has a keyboard alternative (via cut/paste or menu-driven move actions). No feature is exclusively pointer-operated. | F-09.3, F-10.1 |

---

### 2.4 Navigable

| Criterion | Level | Grid-Specific Test | Pass Condition | Spec Reference |
|---|---|---|---|---|
| 2.4.1 Bypass Blocks | A | Using only the keyboard, attempt to skip past the grid to reach subsequent page content. | A skip link precedes the grid, or the grid is wrapped in a `role="region"` with an accessible name, allowing keyboard users to bypass it. | FD-04 |
| 2.4.2 Page Titled | A | N/A — the grid is a component, not a page. | Not applicable at the component level. The embedding page is responsible for this criterion. | — |
| 2.4.3 Focus Order | A | Tab into the grid, then Arrow-key through cells. Verify focus order across header row, body rows, and pinned rows. | Focus follows a logical, predictable sequence: Tab enters the grid → header row → body (left-to-right, top-to-bottom) → Tab exits. Pinned rows appear at expected positions. Focus does not jump unexpectedly. | FD-04 |
| 2.4.7 Focus Visible | A | Keyboard-navigate to multiple cells including frozen columns, group rows, and cells partially obscured by sticky headers. | Every focused cell has a visible focus indicator at all times. The indicator meets minimum contrast requirements (3:1 against adjacent colors per 2.4.11). | FD-04, F-15.1 |
| 2.4.11 Focus Appearance | AA | Measure the focus indicator dimensions and contrast ratio on focused cells and interactive elements. | The focus indicator has at least a 2px solid outline. The enclosed area of the focus indicator is at least as large as the perimeter of the focused component multiplied by 2px. The indicator achieves at least 3:1 contrast against adjacent colors. | FD-04, F-15.1 |
| 2.4.12 Focus Not Obscured (Minimum) | AA | Navigate with keyboard to cells that would be behind the sticky header row or frozen columns. | The focused cell is scrolled into view and is at least partially visible. The sticky header row does not completely obscure the focused cell. | FD-04 |
| 2.4.13 Focus Appearance | AAA | Measure focus indicator area against the component's perimeter at the enhanced level. | Focus indicator area meets or exceeds the component perimeter × 2px at the enhanced threshold. Contrast ratio is at least 3:1 against adjacent colors (same threshold as 2.4.11, but with stricter area calculation). | FD-04, F-15.1 |

---

### 2.5 Input Modalities

| Criterion | Level | Grid-Specific Test | Pass Condition | Spec Reference |
|---|---|---|---|---|
| 2.5.1 Pointer Gestures | A | Identify all features that use drag gestures (column resize, column reorder, row reorder, fill handle, Gantt task bar move/resize). Verify each has a non-drag alternative. | Every feature that involves a drag or multi-point gesture has a single-pointer or keyboard alternative: column resize via column menu, column reorder via column menu, row reorder via keyboard or menu, fill handle via context menu, Gantt task adjustment via keyboard. | F-09, F-10, F-22.5 |
| 2.5.2 Pointer Cancellation | A | Start a drag operation (column reorder, row reorder, task bar move). Before releasing the mouse button, move the pointer to an invalid drop target. Release. | Down-events do not trigger irreversible actions. The `mousedown` event initiates drag but `mouseup` completes it. If the pointer is released outside a valid drop target, the drag operation is cancelled and no change is committed. | F-09.1, F-10.1 |
| 2.5.3 Label in Name | A | Inspect the accessible names of sort buttons, filter controls, expand/collapse buttons, and column header cells against their visible text labels. | The accessible name of every interactive element contains the visible text label or is identical to it. No element has an accessible name that conflicts with or omits the visible label text. | FD-04 |
| 2.5.4 Motion Actuation | A | Verify no grid functionality is triggered by device orientation change or shaking. | No grid feature requires or relies on device motion input. All device-motion-dependent features (if any) have alternative activation methods. | N/A |
| 2.5.5 Target Size (Enhanced) | AAA | Measure the pointer target size of: column resize handles, row drag handles, checkbox cells, sort activation areas in column headers, expand/collapse controls, and Gantt task bars. | All interactive pointer targets are at least 44×44 CSS pixels. Resize handles must achieve this via a transparent hit-target overlay if the visible handle is narrower. | F-15, VS-01 |
| 2.5.6 Concurrent Input Mechanisms | AAA | Operate the grid sequentially with a keyboard, mouse, touchscreen, and stylus pen. Switch input modalities mid-interaction. | The grid accepts input from any combination of keyboard, mouse, touch, and pen without requiring a specific input modality or losing state when modalities are switched. | F-21.4 |
| 2.5.7 Dragging Movements | AA | Identify all features that use drag gestures: column reorder (F-09.2), row reorder (F-10.1), fill handle (F-08.10), Gantt task bar dragging (VS-04). For each, verify that a non-dragging alternative exists that can be operated with a single pointer without dragging. | Every dragging operation has a non-dragging single-pointer alternative: column reorder via column menu or dialog, row reorder via context menu or keyboard move actions, fill handle via Ctrl+D/Ctrl+R or context menu, Gantt task bar adjustment via keyboard or date-entry dialog. No functionality requires a dragging movement as the only means of operation. | F-09.2, F-10.1, F-08.10, VS-04 |
| 2.5.8 Target Size (Minimum) | AA | Measure the pointer target size of: checkbox cells, expand/collapse controls, fill handle drag affordance, and other small interactive controls. | All interactive pointer targets are at least 24×24 CSS pixels, or have sufficient spacing from adjacent targets such that the 24×24 bounding box does not overlap another target. Controls smaller than 24×24 (e.g., the fill handle square) must provide a transparent hit-target overlay that achieves the minimum size. | F-08.3, F-08.10, F-15 |

---

## Principle 3: Understandable

### 3.1 Readable

| Criterion | Level | Grid-Specific Test | Pass Condition | Spec Reference |
|---|---|---|---|---|
| 3.1.1 Language of Page | A | N/A — the grid is a component, not a page. | Not applicable at the component level. The embedding page is responsible for setting the `lang` attribute on `<html>`. | — |
| 3.1.2 Language of Parts | AA | Render a grid with multilingual cell content. Inspect cell elements with content in a non-page language. | Where cell content is in a language different from the page language, the `lang` attribute is set on the cell element or its content wrapper, enabling screen readers to switch voice/pronunciation accordingly. | F-13 |

---

### 3.2 Predictable

| Criterion | Level | Grid-Specific Test | Pass Condition | Spec Reference |
|---|---|---|---|---|
| 3.2.1 On Focus | A | Tab into the grid and Arrow-key through cells using only the keyboard. Observe whether any data changes, sorts, or navigations occur purely from focus movement. | Focusing a cell does not trigger sorting, data loading, context changes, page navigation, or any other action. Focus movement is purely navigational. | FD-04 |
| 3.2.2 On Input | A | Click a sortable column header to apply sort. Observe what changes. | Activating a sort control updates the column sort state and re-orders grid data in place. No unexpected context change occurs (no page reload, no loss of keyboard focus, no navigation away from the grid). The sort change is announced via a live region. | F-02 |

---

### 3.3 Input Assistance

| Criterion | Level | Grid-Specific Test | Pass Condition | Spec Reference |
|---|---|---|---|---|
| 3.3.1 Error Identification | A | Enter an invalid value in an editable cell (e.g., text in a numeric cell, date out of allowed range). Commit the edit. | The invalid cell is identified with an `aria-invalid="true"` attribute. The error is described in text accessible to screen readers, either via `aria-errormessage`, a live region announcement, or visible error text adjacent to the cell. | F-18.4 |
| 3.3.2 Labels or Instructions | A | Navigate to editable cells using a screen reader. Verify cells are announced with their column label. | All editable cells are associated with their column header label. Screen readers announce the column name when the cell receives focus, providing sufficient context without requiring visual inspection of the header row. | FD-04 |
| 3.3.3 Error Suggestion | AA | Trigger cell validation errors for common error types (required field empty, value out of range, invalid format). Review error messages. | Validation error messages include actionable suggestions where the correction can be determined (e.g., "Value must be between 1 and 100", "Enter a valid email address"). Generic messages like "Invalid value" are not sufficient when a specific suggestion is possible. | F-18.4 |
| 3.3.4 Error Prevention (Legal, Financial, Data) | AA | Make a cell edit that cannot be automatically reversed. Verify undo availability or confirmation prompt. | Before committing data changes that are difficult to reverse, the grid either: (a) provides a confirmation dialog, or (b) supports undo so the action can be reversed. Batch edit mode satisfies this by requiring an explicit commit action after review. | F-17, F-18 |

---

## Principle 4: Robust

### 4.1 Compatible

| Criterion | Level | Grid-Specific Test | Pass Condition | Spec Reference |
|---|---|---|---|---|
| 4.1.2 Name, Role, Value | A | Inspect the accessibility tree for: grid container, every column header, every data cell, sort buttons, filter inputs, checkboxes, expand/collapse controls, row drag handles, and cell editors. | Every UI component has: (a) an accessible name, (b) an appropriate ARIA role, and (c) all relevant states and properties (e.g., `aria-sort`, `aria-expanded`, `aria-selected`, `aria-checked`, `aria-invalid`, `aria-disabled`) exposed and kept in sync with visual state. | FD-04 |
| 4.1.3 Status Messages | AA | Apply a filter. Sort a column. Load more rows via infinite scroll. Trigger a validation error. Observe screen reader announcements without moving focus. | Status messages — "Filter applied, 42 rows shown", "Sorted by Name ascending", "100 rows loaded", "Validation error: value is required" — are communicated via ARIA live regions (`aria-live="polite"` or `aria-live="assertive"` as appropriate) without requiring keyboard focus to move to the message. | FD-04 |

---

## Grid-Specific WCAG Audit Procedure

The following procedure provides a structured sequence for conducting a full WCAG 2.2 AAA audit on a tabular grid implementation. Each step maps to one or more checklist items above.

1. **Test keyboard navigation**: Using only the keyboard (no mouse), verify that every cell in the grid is reachable via Tab (to enter the grid) and Arrow keys (to navigate within it). Confirm that Home/End navigate to the first/last cell in a row, and Ctrl+Home/Ctrl+End navigate to the first/last cell in the grid. Confirm Tab exits the grid after the last focusable element.

2. **Test focus visibility**: Arrow-key through a representative set of cells, including cells in frozen columns, the first and last visible rows, group rows, and cells adjacent to the sticky header. Verify the focused cell always has a clearly visible focus indicator that is not obscured by sticky headers or frozen column overlays.

3. **Test sort accessibility**: Using a screen reader, navigate to a sortable column header. Activate sort (Enter or Space). Verify the screen reader announces the new sort state (e.g., "Name, sorted ascending"). Activate sort again and verify the announcement updates. Check that `aria-sort` on the column header reflects the correct value (`ascending`, `descending`, or `none`).

4. **Test row count**: Using a screen reader, Tab into the grid. Verify the screen reader announces the grid's total row count (via `aria-rowcount`) and total column count (via `aria-colcount`) on the grid element. If the row count is unknown (server-side loading), verify `aria-rowcount="-1"` is set and the screen reader announces an appropriate alternative.

5. **Test validation**: Navigate to an editable cell. Enter an invalid value and commit (Tab or Enter). Verify the screen reader announces an error, that the cell is identified as invalid, and that the error message provides a suggestion for correction. Confirm `aria-invalid="true"` and `aria-errormessage` (or equivalent) are present on the cell.

6. **Test live regions**: Apply a column filter and verify the screen reader announces the filtered row count without focus moving. Load additional rows via infinite scroll and verify a load-completion announcement. Apply a sort and verify the sort-state change announcement. All announcements should occur via live regions without focus movement.

7. **Test tree grid (if applicable)**: In a Tree Grid variant, navigate to rows at multiple hierarchy levels using a screen reader. Verify the screen reader announces `aria-level`, `aria-posinset`, and `aria-setsize` for each row (e.g., "level 2, item 3 of 5"). Expand a parent row and verify `aria-expanded` changes from `false` to `true`. Verify child rows become accessible. Collapse and verify child rows are no longer announced.

8. **Test Gantt (if applicable)**: Navigate to the Gantt timeline region using a screen reader and verify it has a role of `application` with an accessible name and help text (`aria-describedby`) explaining keyboard controls. Using only the keyboard, select a task bar and adjust its start date and end date. Verify date changes are announced. Navigate dependency lines and verify each dependency is described with accessible text naming the predecessor and successor tasks.

9. **Check color contrast**: Using a color contrast analyzer tool, sample all text elements (cell content, column headers, placeholder text, error messages, group row labels) and verify they meet 7:1 contrast ratio (AAA enhanced). Sample all non-text UI controls (resize handles, drag handles, checkbox borders, focus indicators, sort icons) and verify they meet 3:1.

10. **Test touch targets**: Using browser developer tools or a device, measure the pointer-target hit area of: column resize handles (via overlay), row drag handles, checkbox cells, sort activation areas within column headers, expand/collapse controls, fill handles, and Gantt task bar resize handles. Verify all interactive hit areas are at least 44×44 CSS pixels.

---

*Appendix F — Tabular Grid Specification*
