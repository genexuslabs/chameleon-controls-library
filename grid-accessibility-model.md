# Accessibility Modeling for Tabular Grid Variants — WCAG 2.2 AAA

This document provides a comprehensive accessibility model for six tabular grid variants: data grid, tree grid, pivot table, Gantt chart, spreadsheet, and master-detail grid. It covers WCAG 2.2 compliance at all levels (A, AA, AAA), complete ARIA role/state/property reference, focus management patterns, keyboard interaction models, per-variant structural modeling, cross-cutting feature accessibility patterns, annotated HTML examples, and a testable compliance audit checklist.

**Grid Variants Covered:**

| Variant | ARIA Role | Description |
|---------|-----------|-------------|
| Data Grid | `role="grid"` | Flat rows — sortable, filterable, editable, groupable |
| Tree Grid | `role="treegrid"` | Hierarchical parent-child rows with expand/collapse |
| Pivot Table | `role="grid"` + multi-axis headers | Cross-tabulated data with row and column dimension headers |
| Gantt Chart | `role="grid"` + `role="application"` | Task list grid paired with timeline bar visualization |
| Spreadsheet | `role="grid"` | Cell-addressed, formula-driven, clipboard-centric |
| Master-Detail | `role="grid"` | Expandable rows revealing detail panels or nested grids |

---

## Table of Contents

1. [WCAG 2.2 Compliance Matrix](#section-1--wcag-22-compliance-matrix)
   - [Perceivable](#perceivable)
   - [Operable](#operable)
   - [Understandable](#understandable)
   - [Robust](#robust)
2. [ARIA Roles, States & Properties Reference](#section-2--aria-roles-states--properties-reference)
3. [Focus Management Models](#section-3--focus-management-models)
4. [Keyboard Interaction Model](#section-4--keyboard-interaction-model)
   - [Universal Grid Navigation](#41-universal-grid-navigation)
   - [Tree Grid Additions](#42-tree-grid-additions)
   - [Gantt Chart Additions](#43-gantt-chart-additions)
   - [Pivot Table Additions](#44-pivot-table-additions)
   - [Spreadsheet Additions](#45-spreadsheet-additions)
   - [Master-Detail Additions](#46-master-detail-additions)
5. [Per-Variant Accessibility Model](#section-5--per-variant-accessibility-model)
   - [Data Grid](#51-data-grid-rolegrid)
   - [Tree Grid](#52-tree-grid-roletreegrid)
   - [Pivot Table](#53-pivot-table)
   - [Gantt Chart](#54-gantt-chart)
   - [Spreadsheet](#55-spreadsheet-grid)
   - [Master-Detail](#56-master-detail-grid)
6. [Cross-Cutting Feature Accessibility Patterns](#section-6--cross-cutting-feature-accessibility-patterns)
7. [Annotated HTML/ARIA Examples](#section-7--annotated-htmlaria-examples)
8. [AAA Compliance Audit Checklist](#8-aaa-compliance-audit-checklist)

---

# Accessibility Modeling for Tabular Grid Variants

## Section 1 — WCAG 2.2 Compliance Matrix

This section maps every applicable WCAG 2.2 success criterion to tabular grid implementations. Each entry describes the requirement, its grid-specific application, concrete implementation guidance, and AAA-level deltas where they exist.

---

### Perceivable

---

#### 1.1.1 Non-text Content (A)

**Requirement:** All non-text content presented to the user must have a text alternative that serves the equivalent purpose, unless it is purely decorative.

**Grid application:** Tabular grids routinely use iconographic indicators for sort direction, expand/collapse state, filter activation, drag handles, row selection checkmarks, and inline status badges. Each icon that conveys information or provides a function requires a text alternative accessible to assistive technology.

**Implementation:**

- Sort icons in column headers: when `aria-sort` is already declared on the `columnheader`, the icon is redundant for AT. Apply `aria-hidden="true"` to the icon element to prevent double-announcement.
  ```html
  <div role="columnheader" aria-sort="ascending">
    Name
    <ch-icon aria-hidden="true" name="arrow-up"></ch-icon>
  </div>
  ```
- Expand/collapse icons in treegrid rows: when `aria-expanded` is set on the `row` or on a disclosure button within the row, apply `aria-hidden="true"` to the icon. If using a standalone toggle button without `aria-expanded` on the row, the button itself must carry an accessible name (e.g., `aria-label="Expand row 3"`).
  ```html
  <div role="row" aria-expanded="false">
    <div role="gridcell">
      <button aria-label="Expand Marketing group">
        <ch-icon aria-hidden="true" name="chevron-right"></ch-icon>
      </button>
      Marketing
    </div>
  </div>
  ```
- Filter icons in column headers: provide `aria-label` on the filter button (e.g., `aria-label="Filter by Status"`). If the filter is active, append state information (`aria-label="Filter by Status, active"`) or use `aria-pressed="true"`.
- Drag handles for column/row reorder: provide `aria-label="Reorder column Name"` or `aria-roledescription="draggable"` paired with `aria-label`. Because drag handles are decorative without keyboard context, also provide a non-drag alternative per 2.5.7.
- Inline status icons (warning, error, info): if the icon accompanies visible text that conveys the same meaning, apply `aria-hidden="true"`. If the icon is the sole indicator, provide `aria-label` or adjacent visually-hidden text.

---

#### 1.3.1 Info and Relationships (A)

**Requirement:** Information, structure, and relationships conveyed through presentation must be programmatically determinable or available in text.

**Grid application:** The tabular grid's visual structure — columns, rows, headers, groupings, hierarchy — must be fully represented in the accessibility tree through roles and properties. Assistive technologies rely on this structure for cell navigation announcements (e.g., "Column 3, Row 5, Status: Active").

**Implementation:**

- **Role hierarchy must be strict:**
  ```
  grid (or treegrid)
    └─ rowgroup (optional, for thead/tbody/tfoot semantics)
        └─ row
            ├─ columnheader (for header cells)
            ├─ rowheader (for row-identifying cells, e.g., Name column)
            └─ gridcell (for data cells)
  ```
- Every `row` must be a direct child of `grid`, `treegrid`, or `rowgroup`. Every `gridcell`, `columnheader`, and `rowheader` must be a direct child of `row`. Intermediate wrapper elements must carry `role="presentation"` or `role="none"` to preserve the required ownership chain.
  ```html
  <div role="grid" aria-label="Employee directory">
    <div role="rowgroup">
      <div role="row">
        <div role="columnheader" aria-sort="none">Name</div>
        <div role="columnheader" aria-sort="none">Department</div>
        <div role="columnheader" aria-sort="none">Status</div>
      </div>
    </div>
    <div role="rowgroup">
      <div role="row">
        <div role="rowheader">Alice Johnson</div>
        <div role="gridcell">Engineering</div>
        <div role="gridcell">Active</div>
      </div>
    </div>
  </div>
  ```
- **Header-cell association:** In native HTML tables, `<th>` elements with `scope="col"` or `scope="row"` provide implicit association. In custom ARIA grids, the column position implicitly associates data cells with column headers (AT uses `aria-colindex` or DOM position). For complex layouts with merged headers or non-standard structures, use `aria-labelledby` on data cells pointing to the relevant header cell's `id`.
- **Grouped rows:** Use `rowgroup` to separate header rows from body rows from footer/summary rows. In treegrid, hierarchical grouping is conveyed through `aria-level`, `aria-setsize`, and `aria-posinset` on each `row`, not through nested `rowgroup` elements.
- **Selection state:** Programmatically indicate selected rows via `aria-selected="true"` on the `row` element. If multi-select is supported, declare `aria-multiselectable="true"` on the `grid`.

---

#### 1.3.2 Meaningful Sequence (A)

**Requirement:** When the sequence in which content is presented affects its meaning, a correct reading sequence must be programmatically determinable.

**Grid application:** Column reorder (drag or menu-driven) and row sort operations change the visual presentation. The DOM order must always reflect the current visual order so that screen readers traversing the grid encounter cells in the same sequence a sighted user sees.

**Implementation:**

- After column reorder: physically move the DOM elements for each column within every row. Do NOT use CSS `order`, `flex-order`, or `grid-column` to visually rearrange columns while leaving the DOM in the original order — this creates a mismatch where screen readers read columns in the wrong sequence.
- After row sort: re-order the `row` elements in the DOM to match the sorted visual order. Update `aria-rowindex` values to reflect the new logical positions.
- If using CSS Grid with `grid-template-columns` for column sizing, the column order in the template must match the DOM order of cells within each row.
- Virtual scrolling implementations must ensure that the virtualized window of rows is inserted in the DOM in the correct sorted/filtered order.

---

#### 1.3.3 Sensory Characteristics (A)

**Requirement:** Instructions for understanding and operating content must not rely solely on sensory characteristics such as shape, color, size, visual location, orientation, or sound.

**Grid application:** Grid instructions, labels, and documentation must not assume the user can perceive visual shape or spatial position.

**Implementation:**

- Do not use instructions like "click the arrow to sort" or "use the triangle icon to expand." Instead: "Activate the Sort button in the column header" or "Activate the Expand button to show child rows."
- Column header actions must be identified by name, not by icon shape. A filter button must say "Filter" (visible text or `aria-label`), not rely on a funnel icon alone.
- Error states: "The cell in the Status column on row 3 contains an error" rather than "the red cell."
- Resize handles: do not describe as "the double-arrow on the column border." Provide a labeled control: "Resize column Name."

---

#### 1.3.4 Orientation (AA)

**Requirement:** Content must not restrict its view and operation to a single display orientation (portrait or landscape) unless a specific orientation is essential.

**Grid application:** Tabular grids must render and remain operable in both portrait and landscape orientations on all viewport sizes.

**Implementation:**

- Use responsive column strategies: allow horizontal scroll, column hiding, or column collapsing at narrow widths. Do not lock the grid to landscape orientation.
- Touch targets (sort, filter, expand) must remain accessible and meet minimum size requirements in both orientations.
- Test grid functionality in both orientations on mobile devices, including keyboard navigation with external keyboards in both modes.

---

#### 1.4.1 Use of Color (A)

**Requirement:** Color must not be used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.

**Grid application:** Grids frequently use color to indicate selection, validation errors, sort direction, active filters, cell editing mode, and row grouping. Every color-conveyed meaning must have a redundant non-color indicator.

**Implementation:**

| Visual state | Color-only (non-compliant) | Compliant alternative |
|---|---|---|
| Selected row | Blue background only | Checkbox in first column + background + `aria-selected="true"` |
| Validation error | Red cell border only | Error icon + descriptive text + `aria-invalid="true"` + `aria-errormessage` |
| Sort direction | Blue header text only | Sort icon (arrow up/down) + `aria-sort` + optionally bold text |
| Active filter | Colored filter icon only | Filter icon with badge/dot + "filtered" text + announcement |
| Required field | Red asterisk only | Asterisk + "(required)" text or `aria-required="true"` |
| Current row / hover | Light gray background only | Visible border or outline that meets contrast ratio |
| Disabled cell | Dimmed text only | Dimmed text + disabled pattern/hatch + `aria-disabled="true"` |

---

#### 1.4.3 Contrast (Minimum) (AA) / 1.4.6 Contrast (Enhanced) (AAA)

**Requirement:** Text must have sufficient contrast against its background. AA requires 4.5:1 for normal text and 3:1 for large text (18pt or 14pt bold). AAA requires 7:1 for normal text and 4.5:1 for large text.

**Grid application:** Grid cells, headers, toolbar labels, pagination text, error messages, placeholder text, and all textual content must meet contrast requirements against their respective backgrounds — including alternating row stripes, selection highlights, and hover states.

**Implementation:**

- Measure contrast for every text-background combination in the grid's visual states:
  - Default row background
  - Alternating (striped) row background
  - Selected row background
  - Hovered row background
  - Editing cell background
  - Error cell background
  - Disabled cell background
  - Column header background
  - Footer/summary row background
- Placeholder text in editable cells and filter inputs must also meet the applicable contrast ratio.
- Ensure that text remains legible on high-contrast mode and forced-colors mode (Windows).

**AAA note:** The ratio increases from 4.5:1 to 7:1 for normal text and from 3:1 to 4.5:1 for large text. Most grid text is normal-sized, so 7:1 is the practical target for AAA. This is especially challenging for light-colored selection backgrounds and subtle striping.

---

#### 1.4.4 Resize Text (AA)

**Requirement:** Text must be resizable up to 200% without loss of content or functionality, except for captions and images of text.

**Grid application:** When users zoom text to 200% via browser settings, grid cells must accommodate the enlarged text without clipping, overlapping, or making content inaccessible.

**Implementation:**

- Use relative units (`rem`, `em`, `%`) for cell padding, row height, and font size — not fixed `px` heights that clip at larger text sizes.
- If cell height is constrained, provide `overflow: auto` or `overflow: visible` so content remains accessible.
- Column headers must wrap or grow to accommodate enlarged text. Do not use `white-space: nowrap` with `overflow: hidden` and no `text-overflow` mechanism.
- Test the grid with browser zoom at 200% and independently with text-only zoom at 200%. Both must remain functional and readable.
- Horizontal scrollbar is acceptable at zoom levels since data tables are exempt from single-column reflow, but all scrolled content must remain keyboard-navigable.

---

#### 1.4.10 Reflow (AA)

**Requirement:** Content must be presentable without loss of information or functionality, and without requiring scrolling in two dimensions, at a width of 320 CSS pixels and a height of 256 CSS pixels — except for content which requires two-dimensional layout for usage or meaning.

**Grid application:** Data tables are explicitly listed as an exception to the reflow requirement. Tabular grids may use horizontal scrolling at narrow viewports. However, the exception only covers the data table itself, not surrounding controls.

**Implementation:**

- Grid toolbar, filter controls, pagination, and search fields must reflow to a single-column layout at 320px width.
- The grid itself may retain horizontal scroll at 320px, but:
  - The horizontal scroll must be keyboard-navigable (arrow keys move through off-screen columns).
  - A frozen/pinned first column (row identifier) is strongly recommended so users maintain row context while scrolling.
  - All interactive elements within scrolled cells must remain reachable by keyboard.
- Provide `tabindex="0"` on the scrollable container if it is not the grid element itself, or ensure the grid element is the scrollable container, so keyboard users can scroll with arrow keys.

---

#### 1.4.11 Non-text Contrast (AA)

**Requirement:** Visual information required to identify user interface components and states, and graphical objects required to understand the content, must have a contrast ratio of at least 3:1 against adjacent colors.

**Grid application:** Grid focus indicators, cell borders that convey structure, icons, interactive control boundaries, and state-change visuals must all meet 3:1 contrast.

**Implementation:**

| Element | Adjacent color | Minimum ratio |
|---|---|---|
| Focus indicator (outline/ring) | Cell background and page background | 3:1 |
| Cell borders (when they convey table structure) | Cell background | 3:1 |
| Sort icon | Column header background | 3:1 |
| Expand/collapse icon | Cell background | 3:1 |
| Checkbox border | Cell background | 3:1 |
| Filter icon | Header background | 3:1 |
| Resize handle | Column header/border area | 3:1 |
| Selected state indicator (border/outline) | Unselected cell background | 3:1 |
| Error indicator (icon/border) | Cell background | 3:1 |
| Drag handle dots/lines | Cell background | 3:1 |

- Note: purely decorative borders (e.g., subtle grid lines that are not required to perceive the table structure) are exempt if the data is otherwise distinguishable.

---

#### 1.4.12 Text Spacing (AA)

**Requirement:** No loss of content or functionality must occur when the user overrides: line height to at least 1.5 times the font size, paragraph spacing to at least 2 times the font size, letter spacing to at least 0.12 times the font size, and word spacing to at least 0.16 times the font size.

**Grid application:** Grid cells with fixed dimensions may clip or overlap when text spacing is increased. Headers, toolbar labels, and cell content must all accommodate user-set spacing.

**Implementation:**

- Do not use fixed-height containers with `overflow: hidden` for text content. Use `min-height` instead of `height`, or allow `overflow: visible` / `overflow: auto`.
- Test with the following bookmarklet-applied styles:
  ```css
  * {
    line-height: 1.5em !important;
    letter-spacing: 0.12em !important;
    word-spacing: 0.16em !important;
  }
  p {
    margin-bottom: 2em !important;
  }
  ```
- Particular risk areas in grids:
  - Column headers with `nowrap` and `overflow: hidden` — text becomes clipped.
  - Fixed-height rows — multi-line content overflows.
  - Inline validation messages — overlap adjacent cells.
  - Toolbar buttons with tight padding — labels clip.

---

#### 1.4.13 Content on Hover or Focus (AA)

**Requirement:** Where receiving and then removing hover or keyboard focus triggers additional content to become visible and then hidden, the additional content must be dismissible, hoverable, and persistent.

**Grid application:** Grid tooltips (on truncated cells, column header descriptions, validation error details), popover menus, and inline help text triggered by hover or focus must satisfy all three conditions.

**Implementation:**

1. **Dismissible:** The user must be able to dismiss the tooltip/popover without moving hover or focus. The standard mechanism is the Escape key.
   ```js
   tooltip.addEventListener('keydown', (e) => {
     if (e.key === 'Escape') {
       hideTooltip();
       e.stopPropagation(); // Prevent Escape from propagating to grid
     }
   });
   ```
2. **Hoverable:** The user must be able to move the mouse pointer over the tooltip content without the tooltip disappearing. This means no `mouseleave` on the trigger that immediately hides the tooltip — use a brief delay and cancel the hide if the pointer enters the tooltip.
3. **Persistent:** The tooltip must remain visible until the user dismisses it, moves focus/hover away, or the information is no longer valid. No auto-dismiss timeouts.

- Truncated cell content shown on hover: provide `role="tooltip"` with `aria-describedby` on the cell, and satisfy all three conditions.
- Validation error details shown on focus: use `aria-errormessage` pointing to an error element, and ensure the error popover meets hover/dismiss/persist rules.

---

### Operable

---

#### 2.1.1 Keyboard (A) / 2.1.3 Keyboard (No Exception) (AAA)

**Requirement:** All functionality must be operable through a keyboard interface. At Level A, exceptions exist for path-dependent input. At Level AAA, there are no exceptions whatsoever.

**Grid application:** Every grid operation — cell navigation, selection, sorting, filtering, column resize, column reorder, row reorder, cell editing, expand/collapse, context menus, pagination, and toolbar actions — must be keyboard-operable.

**Implementation:**

| Operation | Key binding | Notes |
|---|---|---|
| Navigate between cells | Arrow keys | Moves focus one cell in the arrow direction |
| Navigate to first/last cell in row | Home / End | |
| Navigate to first/last row | Ctrl+Home / Ctrl+End | |
| Page up/down | Page Up / Page Down | Move by visible viewport height |
| Enter grid (from outside) | Tab | Focus enters at last-focused cell |
| Exit grid | Tab / Shift+Tab | Focus leaves grid to next/previous focusable |
| Select row | Space | Toggle selection on focused row |
| Extend selection | Shift+Arrow / Shift+Space | Range select |
| Select all | Ctrl+A | When `aria-multiselectable="true"` |
| Sort column | Enter on column header | Cycle through sort states |
| Begin cell edit | Enter or F2 | Enter edit mode on focused cell |
| Confirm edit | Enter | Commit value, exit edit mode |
| Cancel edit | Escape | Revert value, exit edit mode |
| Expand/collapse row (treegrid) | Enter or Arrow Right/Left on row | Right expands, Left collapses |
| Open context menu | Shift+F10 or Menu key | On focused cell/row |
| Column resize | Via menu or keyboard shortcut | Non-drag alternative per 2.5.7 |
| Column reorder | Via menu or keyboard shortcut | Non-drag alternative per 2.5.7 |

**AAA note:** At Level A, operations that inherently require path-dependent input (e.g., freehand drawing) are exempt. At Level AAA, no exceptions exist. This means if any grid feature (such as lasso selection or freehand annotation) uses path-dependent input, a keyboard alternative is mandatory at AAA.

---

#### 2.1.2 No Keyboard Trap (A)

**Requirement:** If keyboard focus can be moved to a component using a keyboard interface, focus must be movable away from that component using only a keyboard interface. If non-standard exit keys are needed, the user must be advised.

**Grid application:** Grids use complex internal keyboard patterns (arrow keys for navigation, Enter for editing). The user must always be able to exit the grid with Tab and exit any sub-component (editors, dialogs, menus) with Escape.

**Implementation:**

- **Grid exit:** Tab moves focus out of the grid to the next focusable element on the page. Shift+Tab moves to the previous. The grid is a single tab stop.
- **Cell edit mode:** When the user enters edit mode (Enter or F2), focus moves to the editor control. Escape exits edit mode and returns focus to the cell. Tab inside a multi-widget cell moves between widgets; Tab on the last widget either commits and moves to the next cell or exits edit mode (choose one convention and document it).
- **Modal dialogs triggered from grid:** (e.g., a date picker, a row detail dialog) Focus is trapped inside the dialog per modal pattern. Escape closes the dialog and returns focus to the triggering cell.
- **Dropdown menus and popovers:** Escape closes the menu and returns focus to the trigger. Arrow keys navigate within the menu. Tab closes the menu and moves focus forward.
- **Never:** Do not use `tabindex` configurations that trap the user inside a cell editor with no exit mechanism.

---

#### 2.2.1 Timing Adjustable (A)

**Requirement:** For any time limit set by the content, the user must be able to turn off, adjust, or extend the time limit (with certain exceptions for real-time events and essential time limits).

**Grid application:** Grids with auto-save, session timeouts during cell editing, or auto-refresh intervals must respect this criterion.

**Implementation:**

- If the grid auto-saves after a period of inactivity: warn the user before saving, allow extension, or make auto-save non-destructive (save a draft rather than committing).
- If a session timeout may interrupt an editing session: provide a warning dialog at least 20 seconds before timeout, with an option to extend the session.
- If the grid data auto-refreshes on a timer: provide controls to pause, stop, or adjust the refresh interval. If auto-refresh replaces data the user is currently editing, preserve the edit state.
- Timeout durations for toast notifications about save/delete/error operations should either be user-configurable or the notifications should persist until dismissed (the latter is simpler and more accessible).

---

#### 2.4.1 Bypass Blocks (A)

**Requirement:** A mechanism must be available to bypass blocks of content that are repeated on multiple pages.

**Grid application:** A large data grid is a significant block of content. Users navigating sequentially must be able to skip past the grid to reach subsequent page content.

**Implementation:**

- **Option 1 (preferred):** Place a visible "Skip past data grid" link before the grid that becomes visible on focus and moves focus to the element immediately after the grid.
  ```html
  <a href="#after-grid" class="skip-link">Skip past employee data grid</a>
  <div role="grid" aria-label="Employee directory">
    <!-- grid content -->
  </div>
  <div id="after-grid" tabindex="-1">...</div>
  ```
- **Option 2:** Use a heading element (`<h2>`, `<h3>`) immediately before the grid that appears in the document outline. Screen reader users can navigate by headings to skip the grid.
  ```html
  <h2 id="grid-heading">Employee Directory</h2>
  <div role="grid" aria-labelledby="grid-heading">
    <!-- grid content -->
  </div>
  ```
- **Option 3:** Wrap the grid in a `<section>` or use `role="region"` with `aria-label`, so landmark navigation can skip past it.
- Best practice: combine a heading with a skip link for maximum compatibility.

---

#### 2.4.3 Focus Order (A)

**Requirement:** If content can be navigated sequentially and the navigation sequence affects meaning or operation, focusable components must receive focus in an order that preserves meaning and operability.

**Grid application:** The Tab sequence through grid-related elements must follow a logical order that matches the visual layout and workflow.

**Implementation:**

Recommended Tab order for a complete grid component:

1. Skip link ("Skip past grid")
2. Grid title / heading (if focusable)
3. Grid toolbar (search, filter buttons, view toggles, action buttons) — left to right
4. Column header row (if headers contain interactive controls, they are reachable via arrow keys within the grid, not Tab)
5. Grid body (single Tab stop — internal navigation via arrow keys)
6. Grid footer / status bar
7. Pagination controls (previous, page numbers, next)
8. Next page element

- The grid itself is a **single Tab stop**. Pressing Tab while inside the grid moves focus out of the grid, not to the next cell. Internal cell-to-cell navigation uses arrow keys exclusively.
- If the grid toolbar is above the grid, it receives focus before the grid. If it is below, it receives focus after.

---

#### 2.4.6 Headings and Labels (AA)

**Requirement:** Headings and labels must describe topic or purpose.

**Grid application:** The grid must have a descriptive accessible name. Column headers must clearly describe the data in their column. Filter inputs, search fields, and toolbar controls must have descriptive labels.

**Implementation:**

- **Grid accessible name:** Use `aria-label` for a concise name or `aria-labelledby` pointing to a visible heading.
  ```html
  <h2 id="grid-title">Q4 Sales Report — Eastern Region</h2>
  <div role="grid" aria-labelledby="grid-title">
  ```
- Do not use generic names like "Data Grid" or "Table." The name must describe the specific content.
- **Column headers:** Must contain text that clearly describes the column data. Avoid abbreviations without expansion (use `aria-label` or `title` for the expanded form if the visual header is abbreviated).
- **Filter inputs:** Each filter input must have `aria-label` describing what it filters: `aria-label="Filter by department"`.
- **Toolbar buttons:** Each must have a descriptive accessible name. Icon-only buttons require `aria-label`.

---

#### 2.4.7 Focus Visible (AA) / 2.4.13 Focus Appearance (AAA)

**Requirement:** Any keyboard-operable user interface must have a mode of operation where the keyboard focus indicator is visible (AA). At AAA, the focus indicator must meet specific size and contrast requirements.

**Grid application:** The focused cell, row, header, or interactive control within the grid must have a clearly visible focus indicator at AA. At AAA, the indicator must meet precise dimensional and contrast requirements.

**Implementation (AA):**

- Every focusable cell must display a visible focus ring or outline when focused.
- Do not rely on the browser default outline if it is suppressed globally with `outline: none`. Provide a custom focus style.
- Focus must be visible on all backgrounds: default rows, striped rows, selected rows, error rows.

**Implementation (AAA — 2.4.13 Focus Appearance):**

The focus indicator must meet ALL of the following:

1. **Minimum area:** The focus indicator must have an area of at least a 2 CSS pixel thick perimeter of the focused element. For a cell that is 100px wide and 40px tall, the perimeter outline must be at least 2px thick.
2. **Contrast:** The focus indicator must have a contrast ratio of at least 3:1 between the focused and unfocused states of the pixels forming the indicator.
3. **Not fully obscured:** No part of the focus indicator may be hidden by author-created content.

```css
/* AAA-compliant focus indicator */
[role="gridcell"]:focus {
  outline: 3px solid #0050d8; /* 3px exceeds 2px minimum */
  outline-offset: -3px;       /* Inset to prevent clipping by adjacent cells */
  z-index: 1;                 /* Ensure indicator is above adjacent cells */
}
```

- Validate that the outline color has 3:1 contrast against both the cell background and the area immediately outside the cell.

---

#### 2.4.11 Focus Not Obscured (Minimum) (AA) / 2.4.12 Focus Not Obscured (Enhanced) (AAA)

**Requirement:** When a UI component receives keyboard focus, it must not be entirely hidden by author-created content (AA). At AAA, no part of the focused component may be hidden.

**Grid application:** Sticky column headers, sticky first columns, floating toolbars, summary footers, overlay panels, and toast notifications can obscure the focused cell.

**Implementation (AA):**

- When the focused cell scrolls behind a sticky header, auto-scroll to keep at least part of the cell visible.
- Ensure toast notifications do not cover the focused cell. Position them in a region that does not overlap the grid, or auto-dismiss and move them.

**Implementation (AAA):**

- The focused cell must be **completely** visible — no portion may be covered.
- Use `scroll-padding` to account for sticky elements:
  ```css
  [role="grid"] {
    scroll-padding-top: 48px;    /* Height of sticky header row */
    scroll-padding-bottom: 40px; /* Height of sticky footer */
    scroll-padding-left: 120px;  /* Width of frozen first column */
  }
  ```
- When programmatically moving focus (e.g., after sort or filter), call `element.scrollIntoView({ block: 'nearest', inline: 'nearest' })` and verify the element is not behind a sticky region.
- Sticky headers and footers must not use `z-index` values that place them over the focused cell's focus indicator. Alternatively, increase the focus indicator's `z-index` above sticky elements.
- Test by tabbing through the grid while sticky elements are present at every edge.

---

#### 2.5.1 Pointer Gestures (A)

**Requirement:** All functionality that uses multipoint or path-based gestures can be operated with a single-pointer activation without a path-based gesture, unless such a gesture is essential.

**Grid application:** No grid operation may require multi-touch (pinch, multi-finger swipe) or path-based gestures (drag) as the only input method.

**Implementation:**

- If pinch-to-zoom is provided for the grid, also provide zoom controls (buttons with +/- or a zoom slider).
- Swipe-to-delete on a row must also be achievable through a delete button, context menu, or keyboard shortcut.
- Column resize by dragging the border must have a single-pointer alternative (e.g., double-click to auto-fit, or a resize option in the column context menu).

---

#### 2.5.2 Pointer Cancellation (A)

**Requirement:** For functionality operated using a single pointer: the down-event is not used to execute any part of the function, or completion is on the up-event with an abort/undo mechanism, or the up-event reverses any outcome of the down-event.

**Grid application:** Drag-and-drop operations in grids (column reorder, row reorder, cell drag-fill) and click-based operations (sort, select, edit) must comply with pointer cancellation rules.

**Implementation:**

- **Sort on click:** Execute on `click` (up-event), not `mousedown`. This allows users to press down on a header, realize they targeted the wrong column, drag away, and release without triggering a sort.
- **Row selection on click:** Execute on `click`, not `mousedown`.
- **Drag-and-drop column/row reorder:** The reorder completes on pointer up at the drop location. If the pointer is released outside any valid drop zone, the drag is cancelled and the original order is restored.
- **Cell edit activation:** Enter edit mode on `click` or `dblclick`, not on `mousedown`.
- **Resize handle:** Resize commits on pointer up. Moving the pointer back to the original position before releasing should restore the original column width (or provide undo).

---

#### 2.5.3 Label in Name (A)

**Requirement:** For user interface components with labels that include text or images of text, the accessible name must contain the text that is presented visually.

**Grid application:** All visible button labels, menu item labels, and control labels within the grid must be contained in the accessible name.

**Implementation:**

- A button that visually displays "Sort" must have an accessible name containing "Sort" (e.g., `aria-label="Sort by Name ascending"` — the word "Sort" is present).
- A button that visually displays "Filter" must not have `aria-label="Search"` — the accessible name must contain "Filter."
- A pagination button showing "Next" must have an accessible name containing "Next" (e.g., `aria-label="Next page"` is compliant).
- Icon-only buttons with visible tooltip text: if the tooltip shows "Delete row," then `aria-label` must contain "Delete row."

---

#### 2.5.8 Target Size (Minimum) (AA) / 2.5.5 Target Size (Enhanced) (AAA)

**Requirement:** Interactive targets must be at least 24x24 CSS pixels (AA) or 44x44 CSS pixels (AAA), with exceptions for inline targets, spacing-compensated targets, and user agent controls.

**Grid application:** Small interactive elements within grid cells — checkboxes, sort buttons, expand/collapse icons, filter triggers, resize handles, and action buttons — must meet minimum target size requirements.

**Implementation (AA — 2.5.8, minimum 24x24px):**

| Target | Typical problem | Solution |
|---|---|---|
| Row selection checkbox | 16px icon, no padding | Enlarge clickable area to 24x24 via padding or transparent border |
| Sort button in header | Entire header is clickable (fine) or only small icon | Make the entire header cell the click target for sort |
| Expand/collapse toggle | 12px chevron icon | Wrap in a 24x24 button element with padding |
| Resize handle | 1-4px wide column border | Provide a 24px wide hit area for the resize handle |
| Inline action buttons | Small icon buttons in cells | Minimum 24x24 with adequate spacing |
| Filter clear button (x) | 12px icon | 24x24 clickable area minimum |

**AAA note (2.5.5, minimum 44x44px):** All the above targets must be at least 44x44 CSS pixels. This significantly impacts grid density. At AAA, grids must increase row height and cell padding to accommodate 44px minimum for all interactive targets. Consider providing a "comfortable" density mode that meets this requirement.

---

#### 2.5.7 Dragging Movements (AA)

**Requirement:** All functionality that uses a dragging movement for operation must be achievable by a single pointer without dragging, unless dragging is essential or the functionality is determined by the user agent.

**Grid application:** Column reorder, row reorder, column resize, and cell drag-fill must each have a non-drag alternative.

**Implementation:**

| Drag operation | Non-drag alternative |
|---|---|
| Column reorder | Column header context menu with "Move Left" / "Move Right" options, or a column order dialog. Keyboard: select column, use Ctrl+Shift+Arrow to move. |
| Row reorder | Row context menu with "Move Up" / "Move Down." Keyboard: select row, use Ctrl+Shift+Arrow to move. |
| Column resize | Double-click header border to auto-fit. Column header context menu with "Resize column" dialog or preset widths. Keyboard shortcut to enter resize mode where Left/Right arrow adjusts width. |
| Cell drag-fill (copy formula/value down) | Select range, then use "Fill Down" command from context menu or Ctrl+D. |

---

### Understandable

---

#### 3.2.1 On Focus (A)

**Requirement:** When any user interface component receives focus, it must not initiate a change of context.

**Grid application:** Focusing a grid cell, column header, or toolbar control must not trigger navigation, submission, or any unexpected context change.

**Implementation:**

- Focusing a cell must NOT: auto-enter edit mode, trigger a detail panel navigation, auto-select the row, open a dropdown, or trigger data loading for a detail view.
- Focusing a column header must NOT: auto-trigger sort.
- Focusing a filter input must NOT: auto-apply the filter.
- It IS acceptable for focus to trigger visual changes that do not constitute a context change: highlighting the row, showing a cell tooltip (if it meets 1.4.13), or updating a non-focus-stealing status region.

---

#### 3.2.2 On Input (A)

**Requirement:** Changing the setting of any user interface component must not automatically cause a change of context unless the user has been advised of the behavior in advance.

**Grid application:** Typing in a cell, changing a dropdown value within a cell, or toggling a checkbox must not auto-submit data or trigger navigation without explicit user action or prior notice.

**Implementation:**

- Cell editing: changing a cell value must NOT auto-save and navigate away. Provide explicit commit (Enter) and cancel (Escape) actions.
- Filter input: typing in a filter field may live-filter the displayed rows (this is a content change, not a context change, and is acceptable), but it must NOT navigate away, open a new page, or move focus.
- Checkbox in a cell: toggling a checkbox should update the cell value but must NOT submit the entire form or trigger page navigation.
- Dropdown in a cell: selecting a value must NOT auto-close the dropdown AND submit AND navigate. Selecting a value in the dropdown commits the value to the cell; separate actions handle submission.

---

#### 3.2.5 Change on Request (AAA)

**Requirement:** Changes of context must be initiated only by user request, or a mechanism is available to turn off such changes.

**Grid application:** Sort, filter, pagination, and any data transformation must activate only on explicit user action, not on hover, focus, or timer.

**Implementation:**

- Sort must activate on click/Enter on the sort button, not on hover over the column header.
- Pagination must change page on click/Enter on the page control, not on focus.
- Filter must apply on explicit action (click a "Apply" button, or press Enter in the filter field). Live filtering (as-you-type) is acceptable if it only changes displayed rows (content change) without changing context (no focus move, no page change). However, for AAA, providing an option to disable live filtering and require explicit application is the safest approach.
- Auto-refresh must not replace visible data without user consent. Provide a "Refresh" button or allow the user to opt into auto-refresh.

---

#### 3.3.1 Error Identification (A)

**Requirement:** If an input error is automatically detected, the item in error must be identified and the error described to the user in text.

**Grid application:** When cell validation fails (wrong data type, out-of-range value, required field empty), the error must be identified in text, not only by visual indicators.

**Implementation:**

- Each cell with a validation error must:
  1. Set `aria-invalid="true"` on the cell or the editor within the cell.
  2. Set `aria-errormessage` pointing to an element containing the error text.
  3. Display visible error text (not just a red border or icon).
  ```html
  <div role="gridcell" aria-invalid="true" aria-errormessage="err-3-2">
    <input type="text" value="-5" />
  </div>
  <div id="err-3-2" role="alert">Value must be 0 or greater</div>
  ```
- Error messages must identify the field: "Quantity (row 3): Value must be 0 or greater" rather than just "Invalid value."
- When a row-level save fails, identify which cells have errors and describe each.

---

#### 3.3.2 Labels or Instructions (A)

**Requirement:** Labels or instructions must be provided when content requires user input.

**Grid application:** Editable cells must be identifiable as editable and have associated labels. Filter inputs, search fields, and inline editors must have clear labels.

**Implementation:**

- **Editable cells:** The column header serves as the label for cells in that column. Ensure the header-to-cell association is maintained (via grid structure or explicit `aria-labelledby`). Add `aria-readonly="false"` on editable cells to distinguish them from read-only cells, or use `aria-readonly="true"` on read-only cells within an otherwise editable grid.
- **Filter inputs:** Apply `aria-label` that describes the filter purpose: `aria-label="Filter by Status column"`.
- **Search field:** Apply `aria-label="Search in grid"` or use a visible `<label>` element.
- **Inline editors:** When a cell enters edit mode and an `<input>` is rendered, associate it with the column header via `aria-labelledby`:
  ```html
  <div role="gridcell">
    <input type="text" aria-labelledby="col-name" />
  </div>
  ```
- Provide instructions for non-obvious interactions: "Press Enter to edit, Escape to cancel" as `aria-describedby` on the grid or as visible instructions near the grid.

---

#### 3.3.3 Error Suggestion (AA)

**Requirement:** If an input error is automatically detected and suggestions for correction are known, the suggestions must be provided to the user, unless it would jeopardize security or purpose.

**Grid application:** Validation errors in grid cells must not only identify the problem but also suggest how to fix it.

**Implementation:**

| Error type | Poor message | Good message |
|---|---|---|
| Numeric range | "Invalid" | "Value must be between 0 and 100" |
| Required field | "Error" | "This field is required. Enter a department name." |
| Date format | "Wrong format" | "Enter a date in YYYY-MM-DD format (e.g., 2025-12-31)" |
| Enum/dropdown | "Invalid value" | "Choose one of: Active, Inactive, Pending" |
| Email format | "Invalid email" | "Enter a valid email address (e.g., name@example.com)" |
| Unique constraint | "Duplicate" | "This ID already exists. Enter a unique identifier." |

- Error suggestions must be provided in the same `aria-errormessage` element used for error identification.
- If the grid provides a validation summary (e.g., after a batch save attempt), the summary must list each error with its row, column, and suggestion.

---

#### 3.3.4 Error Prevention (Legal, Financial, Data) (AA)

**Requirement:** For pages that cause legal commitments, financial transactions, or modification/deletion of user-controllable data, at least one of the following must be true: submissions are reversible, data is checked and the user is given an opportunity to correct, or a mechanism is available to review, confirm, and correct before finalizing.

**Grid application:** Grids that allow row deletion, bulk editing, or data submission that modifies persistent records must provide error prevention mechanisms.

**Implementation:**

- **Row deletion:** Require a confirmation dialog: "Are you sure you want to delete 3 rows? This action cannot be undone." The dialog must be keyboard-accessible and focus-trapped.
- **Bulk edit:** Provide a review step showing the changes before committing. Alternatively, provide an undo mechanism: "3 cells updated. Undo" with a time-limited or persistent undo option.
- **Data submission:** Before saving the grid to a backend, present a confirmation: "Save 15 modified records?" or allow review of changed cells (highlight changes with `aria-live` announcement).
- **Undo:** If feasible, provide Ctrl+Z undo for the most recent cell edit, row deletion, or bulk operation. Announce the undo availability via a status message.

---

### Robust

---

#### 4.1.3 Status Messages (AA)

**Requirement:** In content implemented using markup languages, status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus.

**Grid application:** Grid operations produce frequent status changes — sort applied, filter results updated, page changed, rows loaded, row count changed, save confirmed, deletion confirmed, errors encountered. These must be announced to screen readers without moving focus.

**Implementation:**

Provide a dedicated live region associated with the grid:

```html
<div role="grid" aria-label="Employee directory">
  <!-- grid content -->
</div>
<div aria-live="polite" aria-atomic="true" class="sr-only" id="grid-status">
  <!-- Status messages injected here -->
</div>
```

Announce the following events by updating the live region text content:

| Event | Announcement example |
|---|---|
| Sort applied | "Sorted by Name, ascending" |
| Filter applied | "Filtered by Department: Engineering. 24 rows shown." |
| Filter cleared | "Filter cleared. 150 rows shown." |
| Page changed | "Page 3 of 12. Showing rows 41 to 60." |
| Rows loaded (lazy/async) | "25 additional rows loaded. 75 rows total." |
| Row deleted | "Row deleted. 149 rows remaining." |
| Row added | "New row added at position 1." |
| Save successful | "Changes saved successfully." |
| Save failed | "Save failed. 2 cells contain errors." |
| Selection changed (bulk) | "5 rows selected." |
| Grid busy/loading | Set `aria-busy="true"` on the grid; announce "Loading data..." |
| Grid loading complete | Remove `aria-busy`; announce "Data loaded. 150 rows." |

- Use `aria-live="polite"` for non-urgent updates (sort, filter, page change).
- Use `role="alert"` (equivalent to `aria-live="assertive"`) only for errors that require immediate attention.
- Use `aria-atomic="true"` to ensure the entire status message is read, not just the changed portion.
- **Critical:** The live region must exist in the DOM before content is injected. Dynamically creating a live region and immediately populating it is unreliable across screen readers.

---

## Section 2 — ARIA Roles, States & Properties Reference

This section provides a complete reference for every ARIA attribute applicable to grid and treegrid patterns. Each attribute includes the target element, valid values, and usage guidance.

---

### 2.1 Core Grid Roles

#### `grid`

| Aspect | Detail |
|---|---|
| **Element** | The outermost container of the data grid (typically a `<div>` or `<table>`) |
| **When to use** | For interactive two-dimensional data structures where cells are navigable and may be editable. Prefer native `<table>` when the grid is purely presentational (read-only, no cell interaction) |
| **Required children** | `row` (direct child) or `rowgroup` containing `row` |
| **Required properties** | `aria-label` or `aria-labelledby` for accessible name |
| **Optional properties** | `aria-multiselectable`, `aria-readonly`, `aria-colcount`, `aria-rowcount`, `aria-activedescendant`, `aria-busy`, `aria-describedby` |

```html
<div role="grid"
     aria-label="Quarterly sales data"
     aria-rowcount="500"
     aria-colcount="12"
     aria-multiselectable="true">
```

#### `treegrid`

| Aspect | Detail |
|---|---|
| **Element** | The outermost container when the grid has hierarchically expandable rows |
| **When to use** | When rows can be expanded/collapsed to show/hide child rows (parent-child hierarchy). Combines grid navigation (2D arrow keys) with tree semantics (expand/collapse) |
| **Required children** | Same as `grid`: `row` or `rowgroup > row` |
| **Behavioral difference from `grid`** | Rows carry `aria-expanded`, `aria-level`, `aria-setsize`, `aria-posinset`. Arrow Left on an expanded row collapses it; on a collapsed or leaf row, moves to parent |

#### `row`

| Aspect | Detail |
|---|---|
| **Element** | Each row of cells in the grid |
| **Required parent** | `grid`, `treegrid`, or `rowgroup` |
| **Required children** | One or more `gridcell`, `columnheader`, or `rowheader` |
| **Key properties** | `aria-rowindex` (when virtualized), `aria-selected`, `aria-expanded` (in treegrid), `aria-level` (in treegrid), `aria-setsize` (in treegrid), `aria-posinset` (in treegrid), `aria-disabled` |

#### `gridcell`

| Aspect | Detail |
|---|---|
| **Element** | Each data cell within a row |
| **Required parent** | `row` |
| **Key properties** | `aria-colindex` (when virtualized or columns hidden), `aria-selected`, `aria-readonly`, `aria-required`, `aria-invalid`, `aria-errormessage`, `aria-describedby`, `aria-disabled` |
| **Notes** | Native `<td>` inside a `<table>` with `role="grid"` implicitly has the `gridcell` role |

#### `columnheader`

| Aspect | Detail |
|---|---|
| **Element** | Header cells in the column header row |
| **Required parent** | `row` |
| **Key properties** | `aria-sort` (`none`, `ascending`, `descending`, `other`), `aria-colindex`, `aria-readonly`, `aria-required` |
| **Notes** | Native `<th scope="col">` inside a `role="grid"` table implicitly has this role. Even in custom ARIA grids, `columnheader` provides richer semantics than `gridcell` for header cells |

#### `rowheader`

| Aspect | Detail |
|---|---|
| **Element** | The cell in each row that identifies/names the row (e.g., a "Name" column in an employee grid) |
| **Required parent** | `row` |
| **Key properties** | Same as `gridcell`, plus the implicit "this names the row" semantics |
| **Notes** | Use for the primary identifier column. Screen readers announce the `rowheader` cell when navigating to any cell in that row, providing context |

#### `rowgroup`

| Aspect | Detail |
|---|---|
| **Element** | Groups of rows — typically separating header rows, body rows, and footer rows |
| **Required parent** | `grid` or `treegrid` |
| **Required children** | One or more `row` |
| **When to use** | When the grid has distinct header, body, and footer sections. Maps to `<thead>`, `<tbody>`, `<tfoot>` in native HTML |
| **Notes** | Not used for hierarchical grouping in treegrid (use `aria-level` on rows instead) |

---

### 2.2 Companion Roles

These roles are not part of the grid itself but appear in components associated with grid functionality.

#### `separator`

Used on column resize handles when they are focusable (keyboard-operable). Set `aria-orientation="vertical"` for column separators. Apply `aria-valuemin`, `aria-valuemax`, `aria-valuenow` when the separator controls a measurable column width.

```html
<div role="separator"
     aria-orientation="vertical"
     aria-valuemin="50"
     aria-valuemax="500"
     aria-valuenow="200"
     aria-label="Resize Name column"
     tabindex="0">
</div>
```

#### `menu` / `menuitem`

Used for context menus triggered from cells, rows, or column headers. The menu container carries `role="menu"`, each option carries `role="menuitem"`. Use `role="menuitemcheckbox"` for toggleable options (e.g., show/hide columns) and `role="menuitemradio"` for mutually exclusive options (e.g., sort direction).

#### `dialog`

Used for modal editors (date pickers, multi-field edit forms), confirmation dialogs (delete confirmation), and column configuration panels. Must have `aria-label` or `aria-labelledby`, and focus must be trapped within the dialog while open.

#### `tooltip`

Used for truncated cell content shown on hover/focus, column header descriptions, and help text. The trigger element must reference the tooltip via `aria-describedby`. The tooltip must satisfy 1.4.13 (dismissible, hoverable, persistent).

#### `status`

Used for non-urgent grid status messages (row count, page info). Implicit `aria-live="polite"` and `aria-atomic="true"`.

#### `alert`

Used for urgent grid notifications (save failure, critical validation errors). Implicit `aria-live="assertive"`. Use sparingly to avoid overwhelming screen reader users.

#### `navigation`

Used on pagination controls when they form a distinct navigation block: `<nav aria-label="Grid pagination">`.

#### `region`

Used to mark the grid as a landmark for landmark navigation when no more specific landmark role applies. Requires `aria-label` or `aria-labelledby`.

#### `application`

Use with extreme caution. Setting `role="application"` on the grid container tells screen readers to pass all keystrokes to the web application rather than intercepting them for screen reader shortcuts. This may be necessary for grids where arrow keys must always control cell navigation. However, it disables screen reader browse/reading mode, so all content must be accessible through focus alone. **Only use if the grid's keyboard model requires it and all content is reachable programmatically.**

#### `searchbox`

Used on grid search/filter text inputs when they perform search functionality. Provides semantic richness over `role="textbox"`.

#### `tablist` / `tab`

Used when the grid has view tabs (e.g., "All", "Active", "Archived" views). The tab bar uses `role="tablist"`, each tab uses `role="tab"`, and the grid or its container uses `role="tabpanel"`.

#### `checkbox`

Used within grid cells for row selection checkboxes or boolean data fields. In a "select all" header checkbox, use `aria-label="Select all rows"`. For row checkboxes, use `aria-label="Select row [identifier]"`.

---

### 2.3 Structural Properties

These properties communicate the grid's dimensions and cell positions, especially critical when the grid is virtualized (only a subset of rows/columns is in the DOM) or has hidden/merged cells.

#### `aria-rowcount`

| Aspect | Detail |
|---|---|
| **Element** | `grid` or `treegrid` |
| **Value** | Integer: total number of rows in the full dataset (not just currently rendered). Use `-1` if the total is unknown (e.g., infinite scroll) |
| **When required** | When virtualization means the DOM contains fewer `row` elements than the actual dataset |
| **Example** | `<div role="grid" aria-rowcount="5000">` |

#### `aria-colcount`

| Aspect | Detail |
|---|---|
| **Element** | `grid` or `treegrid` |
| **Value** | Integer: total number of columns, including any currently hidden |
| **When required** | When columns are hidden or the grid is horizontally virtualized |
| **Example** | `<div role="grid" aria-colcount="25">` |

#### `aria-rowindex`

| Aspect | Detail |
|---|---|
| **Element** | `row` (or `gridcell` if rows are not present, which is non-standard) |
| **Value** | Integer, **1-based**: the row's position in the full dataset. First data row (after headers) is typically `2` (header row is `1`) |
| **When required** | When `aria-rowcount` is set and not all rows are in the DOM |
| **Notes** | Must reflect the row's position in the full sorted/filtered dataset, not just the current DOM order. In treegrid, only count visible (expanded) rows |

#### `aria-colindex`

| Aspect | Detail |
|---|---|
| **Element** | `gridcell`, `columnheader`, `rowheader` (or `row` if all cells in the row start from the same column offset) |
| **Value** | Integer, **1-based**: the cell's column position in the full column set |
| **When required** | When `aria-colcount` is set and not all columns are in the DOM, or when columns are hidden |
| **Notes** | If placed on the `row`, it indicates the starting column index for the first cell in that row, and subsequent cells are assumed to be contiguous |

#### `aria-rowspan`

| Aspect | Detail |
|---|---|
| **Element** | `gridcell`, `columnheader`, `rowheader` |
| **Value** | Integer: number of rows the cell spans |
| **When required** | For merged cells that span multiple rows |
| **Default** | `1` |

#### `aria-colspan`

| Aspect | Detail |
|---|---|
| **Element** | `gridcell`, `columnheader`, `rowheader` |
| **Value** | Integer: number of columns the cell spans |
| **When required** | For merged cells that span multiple columns |
| **Default** | `1` |

---

### 2.4 State Properties

#### `aria-selected`

| Aspect | Detail |
|---|---|
| **Element** | `row`, `gridcell` |
| **Values** | `true`, `false` |
| **When to use** | On `row`: for row selection. On `gridcell`: for individual cell selection (e.g., in spreadsheet-like grids). Set on ALL selectable items (not just the selected ones) — unselected rows get `aria-selected="false"`, not the absence of the attribute |
| **Relationship** | The parent `grid` should have `aria-multiselectable="true"` if multiple selection is supported |

#### `aria-expanded`

| Aspect | Detail |
|---|---|
| **Element** | `row` (in treegrid), or a button within a cell that controls disclosure |
| **Values** | `true` (expanded, children visible), `false` (collapsed, children hidden) |
| **When to use** | On parent rows in a `treegrid`. Do not set on leaf rows (absence of the attribute indicates no expandability). Can also be used on cells containing disclosure widgets in non-treegrid contexts |

#### `aria-sort`

| Aspect | Detail |
|---|---|
| **Element** | `columnheader` |
| **Values** | `none` (sortable but not currently sorted), `ascending`, `descending`, `other` |
| **When to use** | On every sortable column header. Set `aria-sort="none"` on sortable columns that are not currently sorted, and `ascending`/`descending` on the currently sorted column. Only one column should have `ascending` or `descending` at a time (for single-column sort). For multi-column sort, multiple headers may carry `aria-sort` values. To convey sort priority, update the column header's `aria-label` to include the priority number (e.g., `aria-label="Revenue, sorted descending, priority 2"`). Optionally, `aria-description` can supplement this with additional context. Do not use `aria-roledescription` for sort priority — it overrides the role announcement entirely. |

#### `aria-readonly`

| Aspect | Detail |
|---|---|
| **Element** | `grid` (to set default for all cells), `gridcell`, `columnheader`, `rowheader` |
| **Values** | `true` (not editable), `false` (editable) |
| **When to use** | If the grid is fully read-only, set `aria-readonly="true"` on the `grid`. If individual cells are read-only in an otherwise editable grid, set on those cells. Absence of the attribute implies the cell inherits from the grid's value |

#### `aria-disabled`

| Aspect | Detail |
|---|---|
| **Element** | `row`, `gridcell`, or interactive elements within cells |
| **Values** | `true`, `false` |
| **When to use** | When a row or cell is visible but not currently operable (e.g., a row pending deletion, a cell that is conditionally disabled). Unlike removing the element from the DOM or hiding it, `aria-disabled` keeps the element in the accessibility tree and navigable, but indicates it cannot be activated |
| **Note** | `aria-disabled` does not prevent interaction — the application must also prevent keyboard/pointer activation on disabled elements |

**Important:** `aria-disabled="true"` only communicates the disabled state to assistive technology. The host application must also prevent activation via JavaScript (e.g., ignore `click`, `keydown` for Enter/Space). Unlike the HTML `disabled` attribute, `aria-disabled` does not inherently prevent interaction.

#### `aria-checked`

| Aspect | Detail |
|---|---|
| **Element** | Elements with role `checkbox` or `menuitemcheckbox` within grid cells |
| **Values** | `true`, `false`, `mixed` (for "select all" checkbox when some but not all rows are selected) |
| **When to use** | On row selection checkboxes and boolean data cells rendered as checkboxes |

#### `aria-invalid`

| Aspect | Detail |
|---|---|
| **Element** | `gridcell`, or the input element within an editable cell |
| **Values** | `true`, `false`, `grammar`, `spelling` |
| **When to use** | When cell validation fails. Set `aria-invalid="true"` and pair with `aria-errormessage` pointing to the error description |

#### `aria-busy`

| Aspect | Detail |
|---|---|
| **Element** | `grid` or `treegrid` (when the entire grid is loading), `row` or `gridcell` (when individual items are loading) |
| **Values** | `true`, `false` |
| **When to use** | During asynchronous data loading. Set `aria-busy="true"` before the load begins, remove (or set to `false`) when loading completes. This tells AT to wait before announcing content changes in the region |

---

### 2.5 Relationship Properties

#### `aria-labelledby`

| Aspect | Detail |
|---|---|
| **Element** | `grid`, `gridcell`, or any element needing a label from another element |
| **Points to** | The `id` of one or more elements whose text content forms the accessible name |
| **Grid usage** | On the `grid` element, point to a visible heading. On a `gridcell` in complex layouts, point to the relevant column header and/or row header for explicit association |

```html
<h2 id="title">Active Projects</h2>
<div role="grid" aria-labelledby="title">
```

#### `aria-describedby`

| Aspect | Detail |
|---|---|
| **Element** | `grid`, `gridcell`, interactive controls within cells |
| **Points to** | The `id` of one or more elements providing supplementary description |
| **Grid usage** | On the `grid`, point to instructions ("Use arrow keys to navigate cells. Press Enter to edit."). On a `gridcell`, point to supplementary information (e.g., a footnote, a help text element) |

```html
<div role="grid" aria-labelledby="title" aria-describedby="grid-help">
<p id="grid-help" class="sr-only">
  Use arrow keys to navigate. Press Enter to edit a cell. Press Escape to cancel.
</p>
```

#### `aria-owns`

| Aspect | Detail |
|---|---|
| **Element** | `grid`, `row` |
| **Points to** | `id`(s) of elements that are logically children but not DOM children |
| **Grid usage** | When virtualization or DOM structure constraints prevent `row` elements from being direct children of `grid` or `rowgroup`, use `aria-owns` to re-establish the parent-child relationship. Use sparingly; prefer correcting DOM structure with `role="presentation"` wrappers instead |

#### `aria-controls`

| Aspect | Detail |
|---|---|
| **Element** | Interactive controls that affect the grid |
| **Points to** | The `id` of the `grid` element |
| **Grid usage** | On filter inputs, search fields, sort buttons, and view toggles that are outside the grid but control its content. This tells AT that activating the control will change the grid |

```html
<input type="search" aria-label="Search employees" aria-controls="employee-grid" />
<div role="grid" id="employee-grid">
```

#### `aria-activedescendant`

| Aspect | Detail |
|---|---|
| **Element** | `grid` or `treegrid` (the element with `tabindex="0"`) |
| **Points to** | The `id` of the currently active (visually focused) cell or row within the grid |
| **Grid usage** | Used in the `aria-activedescendant` focus management pattern (see Section 3.2). The grid container keeps DOM focus while pointing to the "active" descendant. Updated on every arrow key press |

#### `aria-errormessage`

| Aspect | Detail |
|---|---|
| **Element** | `gridcell` or input within a cell that has `aria-invalid="true"` |
| **Points to** | The `id` of the element containing the error message text |
| **Grid usage** | Provides the specific error description for an invalid cell. Only referenced when `aria-invalid="true"` is set. The referenced element should contain actionable error text (per 3.3.1 and 3.3.3) |

```html
<div role="gridcell" aria-invalid="true" aria-errormessage="err-qty-row5">
  <input type="text" value="-3" />
</div>
<span id="err-qty-row5">Quantity must be 0 or greater</span>
```

---

### 2.6 Widget Properties

#### `aria-multiselectable`

| Aspect | Detail |
|---|---|
| **Element** | `grid` or `treegrid` |
| **Values** | `true`, `false` |
| **When to use** | When the grid supports selecting multiple rows or cells simultaneously (via Shift+Click, Ctrl+Click, or Shift+Arrow). If not set, selection is assumed to be single-select or not supported |

#### `aria-required`

| Aspect | Detail |
|---|---|
| **Element** | `gridcell` or input within an editable cell |
| **Values** | `true`, `false` |
| **When to use** | On cells that must have a value before the row/grid can be saved. Pair with visual indication (asterisk, text) per 1.4.1 |

#### `aria-haspopup`

| Aspect | Detail |
|---|---|
| **Element** | `columnheader` (if clicking opens a menu), `gridcell` (if it contains a dropdown or launches a dialog), buttons within cells |
| **Values** | `true`/`menu`, `listbox`, `tree`, `grid`, `dialog` |
| **When to use** | When activating the element opens a popup. Use the specific value matching the popup type. `aria-haspopup="menu"` for context menus, `aria-haspopup="dialog"` for modal editors, `aria-haspopup="listbox"` for dropdown selectors |

```html
<div role="columnheader" aria-haspopup="menu">
  Status
  <button aria-label="Column options for Status" aria-haspopup="menu">
    <ch-icon aria-hidden="true" name="more-vertical"></ch-icon>
  </button>
</div>
```

#### `aria-roledescription`

| Aspect | Detail |
|---|---|
| **Element** | `grid`, `row`, or any element where the default role announcement is insufficient |
| **Value** | Localized string describing the role in human terms |
| **When to use** | Sparingly. Can be used on `role="grid"` to announce as "data grid" or "spreadsheet" if the default "grid" announcement is unclear. Can be used on draggable elements: `aria-roledescription="draggable"` |
| **Caution** | Overuse reduces the benefit of standardized role announcements. Only use when the default role name would confuse users |

---

### 2.7 Tree-Specific Properties

These properties apply to `row` elements within a `treegrid` to communicate hierarchical structure.

#### `aria-level`

| Aspect | Detail |
|---|---|
| **Element** | `row` in `treegrid` |
| **Value** | Integer, **1-based**: depth level in the hierarchy. Top-level rows are `1`, their children are `2`, etc. |
| **Required** | Yes, on every row in a `treegrid` |
| **Notes** | Screen readers use this to announce "level 2" and to determine parent-child relationships for keyboard navigation (Arrow Left on a level-2 row moves to its level-1 parent) |

#### `aria-setsize`

| Aspect | Detail |
|---|---|
| **Element** | `row` in `treegrid` |
| **Value** | Integer: total number of sibling rows at the same level within the same parent. Use `-1` if the total is unknown |
| **Required** | When virtualization means not all sibling rows are in the DOM |
| **Example** | If a parent has 50 child rows but only 10 are rendered, each rendered child row carries `aria-setsize="50"` |

#### `aria-posinset`

| Aspect | Detail |
|---|---|
| **Element** | `row` in `treegrid` |
| **Value** | Integer, **1-based**: the row's position among its siblings at the same level |
| **Required** | When virtualization means not all sibling rows are in the DOM |
| **Example** | The third child of a parent (out of 50 total) carries `aria-posinset="3"` and `aria-setsize="50"` |

```html
<div role="treegrid" aria-label="File browser">
  <div role="row" aria-level="1" aria-setsize="3" aria-posinset="1" aria-expanded="true">
    <div role="gridcell">Documents</div>
  </div>
  <div role="row" aria-level="2" aria-setsize="2" aria-posinset="1">
    <div role="gridcell">report.pdf</div>
  </div>
  <div role="row" aria-level="2" aria-setsize="2" aria-posinset="2">
    <div role="gridcell">notes.txt</div>
  </div>
  <div role="row" aria-level="1" aria-setsize="3" aria-posinset="2" aria-expanded="false">
    <div role="gridcell">Images</div>
  </div>
  <div role="row" aria-level="1" aria-setsize="3" aria-posinset="3">
    <div role="gridcell">readme.md</div>
  </div>
</div>
```

---

### 2.8 Live Region Properties

Live region properties go on a **separate status container element**, NOT on grid cells. Placing `aria-live` on individual cells causes excessive announcements on every cell content update.

#### `aria-live`

| Aspect | Detail |
|---|---|
| **Element** | A dedicated status `<div>` associated with the grid |
| **Values** | `off` (default), `polite` (announced at next pause), `assertive` (announced immediately, interrupting current speech) |
| **Grid usage** | `polite` for sort/filter/page change announcements. `assertive` only for critical errors. The element must exist in the DOM before content is injected for reliable cross-browser behavior |

#### `aria-atomic`

| Aspect | Detail |
|---|---|
| **Element** | The live region container |
| **Values** | `true` (announce entire container content on any change), `false` (announce only changed nodes) |
| **Grid usage** | Set `true` on the grid status container so the full status message is announced, not just the changed word |

#### `aria-relevant`

| Aspect | Detail |
|---|---|
| **Element** | The live region container |
| **Values** | `additions`, `removals`, `text`, `all` (space-separated combinations) |
| **Grid usage** | Default (`additions text`) is typically sufficient. Set `all` if removal of text from the status container should also be announced (rare in grid contexts) |

#### `aria-busy` (in live region context)

When `aria-busy="true"` is set on a live region, AT delays announcing changes until `aria-busy` is removed. Use this when performing batch updates to the status container to prevent multiple announcements.

---

### 2.9 Supplementary Attributes

#### `aria-hidden`

| Aspect | Detail |
|---|---|
| **Element** | Decorative icons, duplicative visual indicators, off-screen content |
| **Values** | `true`, `false` |
| **Grid usage** | Apply `aria-hidden="true"` to sort icons when `aria-sort` conveys the state, expand/collapse icons when `aria-expanded` conveys the state, purely decorative cell icons, and off-screen virtual rows/columns that should not be discovered by AT |
| **Caution** | Never set `aria-hidden="true"` on a focusable element or an ancestor of focusable elements |

#### `aria-current`

| Aspect | Detail |
|---|---|
| **Element** | Pagination controls, navigation items |
| **Values** | `page`, `step`, `location`, `date`, `time`, `true`, `false` |
| **Grid usage** | On the current page button in pagination: `aria-current="page"`. On a date cell in a calendar grid representing today: `aria-current="date"` |

#### `aria-keyshortcuts`

| Aspect | Detail |
|---|---|
| **Element** | Any element with a keyboard shortcut |
| **Value** | String describing the shortcut in the format `"Control+Shift+F"` |
| **Grid usage** | On a filter button: `aria-keyshortcuts="Control+Shift+F"`. On a search input: `aria-keyshortcuts="Control+F"`. Announces the shortcut to screen reader users |

#### `aria-valuemin` / `aria-valuemax` / `aria-valuenow` / `aria-valuetext`

| Aspect | Detail |
|---|---|
| **Element** | `separator` (column resize handle), `slider`, `progressbar` within grid cells |
| **Grid usage** | On a focusable column resize handle with `role="separator"`: `aria-valuemin="50"` (minimum column width in px), `aria-valuemax="500"`, `aria-valuenow="200"`. On a progress bar within a grid cell: provide `aria-valuetext` for a human-readable value (e.g., `aria-valuetext="75% complete"`) |

#### `aria-placeholder`

| Aspect | Detail |
|---|---|
| **Element** | Editable `gridcell` or inputs within cells |
| **Value** | String: hint text shown when the cell is empty |
| **Grid usage** | On an empty editable cell: `aria-placeholder="Enter value"`. For filter inputs: use the HTML `placeholder` attribute on the `<input>` element instead (which is natively supported) |

---

## Section 3 — Focus Management Models

Focus management in data grids determines how keyboard users navigate cells and how assistive technologies track the user's position. This section describes the two standard patterns, when to apply each, and detailed guidance for focus behavior in complex scenarios.

---

### 3.1 Roving Tabindex Pattern

The roving tabindex pattern is the **recommended approach** for grid focus management per the W3C ARIA Authoring Practices Guide.

**Mechanism:**

- Exactly one cell (or interactive element within a cell) in the grid has `tabindex="0"`. All other focusable cells have `tabindex="-1"`.
- When the user presses an arrow key, the implementation:
  1. Sets the currently focused cell to `tabindex="-1"`.
  2. Sets the target cell to `tabindex="0"`.
  3. Calls `targetCell.focus()`.
- The grid itself does NOT have `tabindex`. The individual cells carry tabindex.

**Benefits:**

- The focused element is in the browser's own focus management, so screen readers reliably track and announce it.
- `document.activeElement` always returns the focused cell, simplifying focus queries.
- Browser default behaviors for focused elements (e.g., scroll into view) work automatically.

**Implementation:**

```html
<!-- Initial state: first data cell has tabindex="0" -->
<div role="grid" aria-label="Employees">
  <div role="row">
    <div role="columnheader" tabindex="-1" id="ch-name">Name</div>
    <div role="columnheader" tabindex="-1" id="ch-dept">Department</div>
  </div>
  <div role="row">
    <div role="gridcell" tabindex="0" id="cell-1-1">Alice</div>
    <div role="gridcell" tabindex="-1" id="cell-1-2">Engineering</div>
  </div>
  <div role="row">
    <div role="gridcell" tabindex="-1" id="cell-2-1">Bob</div>
    <div role="gridcell" tabindex="-1" id="cell-2-2">Marketing</div>
  </div>
</div>
```

```js
function moveFocus(currentCell, targetCell) {
  if (!targetCell) return;
  currentCell.setAttribute('tabindex', '-1');
  targetCell.setAttribute('tabindex', '0');
  targetCell.focus();
}

gridElement.addEventListener('keydown', (e) => {
  const current = document.activeElement;
  let target = null;

  switch (e.key) {
    case 'ArrowRight':
      target = getNextCell(current, 'right');
      break;
    case 'ArrowLeft':
      target = getNextCell(current, 'left');
      break;
    case 'ArrowDown':
      target = getNextCell(current, 'down');
      break;
    case 'ArrowUp':
      target = getNextCell(current, 'up');
      break;
    case 'Home':
      target = e.ctrlKey ? getFirstCell() : getFirstCellInRow(current);
      break;
    case 'End':
      target = e.ctrlKey ? getLastCell() : getLastCellInRow(current);
      break;
  }

  if (target) {
    e.preventDefault();
    moveFocus(current, target);
  }
});
```

---

### 3.2 aria-activedescendant Pattern

The `aria-activedescendant` pattern keeps DOM focus on the grid container and uses an ARIA property to indicate which cell is logically active.

**Mechanism:**

- The grid container has `tabindex="0"` and receives all keyboard events.
- The grid container carries `aria-activedescendant` set to the `id` of the currently "active" cell.
- When the user presses an arrow key, the implementation updates `aria-activedescendant` to the new cell's `id` and applies visual focus styling to the new cell.
- The cells themselves do NOT carry `tabindex`.

**Benefits:**

- Simpler when virtualization destroys and recreates DOM elements. Since focus is on the container (which is stable), destroying a cell does not trigger a focus loss event.
- Can be simpler to implement when cells contain complex widgets.

**Drawbacks:**

- Screen reader support is less consistent than roving tabindex. Some screen readers and browser combinations do not reliably track `aria-activedescendant` changes.
- `document.activeElement` always returns the grid container, not the active cell, complicating focus queries.
- Browser auto-scroll-into-view does not apply to the activedescendant; the implementation must handle scrolling manually.

**Implementation:**

```html
<div role="grid"
     aria-label="Employees"
     tabindex="0"
     aria-activedescendant="cell-1-1">
  <div role="row">
    <div role="gridcell" id="cell-1-1">Alice</div>
    <div role="gridcell" id="cell-1-2">Engineering</div>
  </div>
  <div role="row">
    <div role="gridcell" id="cell-2-1">Bob</div>
    <div role="gridcell" id="cell-2-2">Marketing</div>
  </div>
</div>
```

```js
gridElement.addEventListener('keydown', (e) => {
  const currentId = gridElement.getAttribute('aria-activedescendant');
  const currentCell = document.getElementById(currentId);
  let targetCell = null;

  switch (e.key) {
    case 'ArrowRight':
      targetCell = getNextCell(currentCell, 'right');
      break;
    // ... other directions
  }

  if (targetCell) {
    e.preventDefault();
    // Update visual focus
    currentCell.classList.remove('focused');
    targetCell.classList.add('focused');
    // Update ARIA
    gridElement.setAttribute('aria-activedescendant', targetCell.id);
    // Manual scroll into view
    targetCell.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
});
```

---

### 3.3 When to Use Which

| Factor | Roving Tabindex | aria-activedescendant |
|---|---|---|
| Screen reader reliability | Excellent — universal support | Variable — some AT/browser combinations fail to announce changes |
| W3C APG recommendation | Primary recommendation | Documented alternative |
| Virtualization compatibility | Requires careful focus restoration when the focused element is destroyed | Naturally compatible — container focus is stable |
| `document.activeElement` | Returns the focused cell | Returns the grid container |
| Auto scroll-into-view | Browser handles automatically | Must implement manually |
| Complexity for simple grids | Moderate | Moderate |
| Complexity for virtualized grids | Higher (focus restoration logic needed) | Lower |
| Widgets inside cells | Natural — focus moves to widgets | Requires moving DOM focus for interactive widgets, partially negating the pattern's benefits |

**Recommendation:**

- **Use roving tabindex** as the default pattern. It has the broadest assistive technology support and is explicitly recommended by the W3C ARIA Authoring Practices Guide.
- **Consider aria-activedescendant** only when heavy virtualization makes roving tabindex impractical (e.g., the focused row is routinely destroyed as it scrolls out of the viewport, and the virtualization framework does not provide stable focus management).
- **Hybrid approach:** Use roving tabindex for the grid body, but switch to `aria-activedescendant` during rapid programmatic scrolling (e.g., page up/down) where cells are being destroyed and recreated in quick succession, then return to roving tabindex when scrolling stops.

---

### 3.4 Focus Within Cells

The content of a grid cell determines how focus should be managed within it. Screen readers in grid navigation mode (application mode / forms mode) only announce content of the focused element and its descendants. Non-focusable content in adjacent elements is invisible.

#### Static text cell

Focus the `gridcell` element itself. The cell's text content is announced.

```html
<div role="gridcell" tabindex="-1">Marketing</div>
```

#### Single interactive widget

Focus the widget directly, not the parent `gridcell`. This avoids an extra Enter/navigation step.

```html
<div role="gridcell">
  <button tabindex="-1" aria-label="Edit Alice's record">Edit</button>
</div>
```

The gridcell does not get `tabindex`. Arrow key navigation moves focus between the `<button>` elements across cells. The button is the focus target.

#### Single checkbox

Focus the checkbox directly.

```html
<div role="gridcell">
  <input type="checkbox" tabindex="-1" aria-label="Select Alice" />
</div>
```

#### Multiple interactive widgets in one cell

Use a two-level focus model:

1. Arrow key navigation focuses the `gridcell` itself (outer level).
2. Enter or F2 enters the cell, moving focus to the first widget inside.
3. Tab/Shift+Tab cycles between widgets within the cell.
4. Escape exits the cell, returning focus to the `gridcell`.

```html
<div role="gridcell" tabindex="-1">
  <button tabindex="-1" aria-label="Edit">Edit</button>
  <button tabindex="-1" aria-label="Delete">Delete</button>
</div>
```

When the user presses Enter on this cell:

```js
function enterCell(cell) {
  const firstWidget = cell.querySelector('[tabindex]');
  if (firstWidget) {
    cell.setAttribute('tabindex', '-1');
    firstWidget.setAttribute('tabindex', '0');
    firstWidget.focus();
  }
}

function exitCell(cell) {
  const activeWidget = cell.querySelector('[tabindex="0"]');
  if (activeWidget) {
    activeWidget.setAttribute('tabindex', '-1');
  }
  cell.setAttribute('tabindex', '0');
  cell.focus();
}
```

#### Critical: non-focusable content in application/forms mode

When a screen reader enters a grid, it typically switches to application mode (forms mode). In this mode, only the focused element and its text content descendants are announced. Content in non-focusable cells that is NOT the focus target is **invisible** to the screen reader user.

This means:

- Every cell that contains meaningful content MUST be focusable (`tabindex="-1"` or `tabindex="0"`).
- If a cell contains only a status icon with no text, the cell must be focusable and carry `aria-label` or contain visually-hidden text describing the status.
- Empty cells should still be focusable (with `tabindex="-1"`) so the user can navigate through them and know the cell exists, even if it is empty. The screen reader will announce the column header and "blank" or similar.

---

### 3.5 Focus During Virtualization

When the grid virtualizes rows (rendering only the visible viewport plus a buffer), the focused cell's DOM element may be destroyed as it scrolls out of view.

**Strategy:**

1. **Store focused coordinates:** Maintain a `focusedRowIndex` and `focusedColIndex` in the grid state, independent of the DOM.
2. **On scroll out:** When the focused row is removed from the DOM, the focus naturally moves to the grid container (or is lost). Set a flag indicating "focus is stored, not active."
3. **On scroll back in:** When the previously focused row re-enters the DOM, restore `tabindex="0"` on the cell at `[focusedRowIndex, focusedColIndex]`. If the grid still has document focus (the container or any cell), programmatically focus the restored cell.
4. **On arrow key while stored:** If the user presses an arrow key and the focused row is not in the DOM, calculate the target coordinates, scroll to bring the target row into view, then focus the target cell.

```js
// Pseudocode for virtualization focus management
class GridFocusManager {
  constructor() {
    this.focusedRow = 0;
    this.focusedCol = 0;
    this.isFocusStored = false;
  }

  onCellDestroyed(rowIndex, colIndex) {
    if (rowIndex === this.focusedRow && colIndex === this.focusedCol) {
      this.isFocusStored = true;
      // Move DOM focus to grid container to prevent focus loss to <body>
      this.gridElement.focus();
    }
  }

  onCellRendered(rowIndex, colIndex, cellElement) {
    if (rowIndex === this.focusedRow && colIndex === this.focusedCol) {
      cellElement.setAttribute('tabindex', '0');
      if (this.isFocusStored && this.gridHasFocus()) {
        cellElement.focus();
        this.isFocusStored = false;
      }
    } else {
      cellElement.setAttribute('tabindex', '-1');
    }
  }
}
```

---

### 3.6 Focus Restoration on Re-entry

When the user Tabs out of the grid and later Shift+Tabs back, focus must return to the **last focused cell**, not the first cell.

**Implementation:**

1. When focus leaves the grid (detected via `focusout` event where `relatedTarget` is outside the grid), record the last focused cell coordinates.
2. When focus returns to the grid (detected via `focusin` event), find the cell at the stored coordinates. If it exists in the DOM, set `tabindex="0"` on it and focus it. If it has been virtualized out, scroll it into view first.
3. The cell with `tabindex="0"` persists even when the grid does not have focus. This means the browser's natural Tab behavior will land on that cell automatically. However, if the grid container has `tabindex="0"` (as in `aria-activedescendant` pattern), intercept focus on the container and redirect it to the stored cell.

```js
gridElement.addEventListener('focusin', (e) => {
  // If focus lands on the grid container, redirect to last-focused cell
  if (e.target === gridElement) {
    const lastCell = getCellElement(this.focusedRow, this.focusedCol);
    if (lastCell) {
      lastCell.focus();
    }
  }
});
```

---

### 3.7 Focus with Dialogs and Editors

When a grid interaction opens a modal dialog (e.g., a complex cell editor, a detail form, a confirmation dialog), focus management follows the dialog pattern.

**Opening a dialog from a grid cell:**

1. Record the triggering cell's coordinates and element.
2. Open the dialog and move focus to the first focusable element within it (or the dialog container if it has `tabindex="-1"` and a label).
3. Trap focus within the dialog (Tab wraps from last to first element, Shift+Tab wraps from first to last).
4. Prevent grid arrow key navigation while the dialog is open.

**Closing the dialog:**

1. On Escape or "Cancel" button: dismiss the dialog, discard changes, return focus to the triggering cell.
2. On "Save"/"Confirm" button: apply changes, dismiss the dialog, return focus to the triggering cell.
3. If the triggering cell has been removed (e.g., the dialog deleted the row), focus the nearest logical cell (next row at same column).

```js
function openCellDialog(triggerCell) {
  const dialog = createDialog();
  document.body.appendChild(dialog);

  // Store return-focus target
  dialog.returnFocusTo = triggerCell;

  // Focus first element in dialog
  const firstFocusable = dialog.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  firstFocusable?.focus();
}

function closeCellDialog(dialog, reason) {
  const returnTarget = dialog.returnFocusTo;
  dialog.remove();

  if (returnTarget && returnTarget.isConnected) {
    returnTarget.focus();
  } else {
    // Cell was removed; find nearest alternative
    focusNearestCell(returnTarget.dataset.row, returnTarget.dataset.col);
  }
}
```

**Inline cell editing (non-modal):**

When Enter or F2 activates inline edit mode and an `<input>` replaces the cell text:

1. Move focus to the `<input>`.
2. Arrow keys now operate within the input (text cursor movement), not grid navigation.
3. Enter commits the edit, destroys the input, returns focus to the `gridcell`.
4. Escape cancels the edit, reverts the value, destroys the input, returns focus to the `gridcell`.
5. Tab may either commit-and-move-right or commit-and-exit-grid (choose one convention).

---

### 3.8 Focus Indicators (2.4.13 AAA)

The focus indicator must be highly visible, correctly sized, and never obscured. This subsection consolidates the visual requirements.

**Minimum requirements for AAA (2.4.13 Focus Appearance):**

1. **Perimeter:** The indicator must form a solid or dashed outline of at least 2 CSS pixels thickness around the entire focused element.
2. **Contrast change:** The pixels forming the indicator must have at least 3:1 contrast ratio between the focused state and the unfocused state. This is measured as the contrast between the indicator color and the adjacent color that was visible before the indicator appeared.
3. **Not obscured:** No author-created content (sticky headers, floating toolbars, overlay panels) may cover any part of the focus indicator.

**Implementation recommendations:**

```css
/* Primary focus style */
[role="gridcell"]:focus,
[role="columnheader"]:focus,
[role="rowheader"]:focus {
  outline: 3px solid #005fcc;    /* Blue, 3px > 2px minimum */
  outline-offset: -3px;          /* Inset so adjacent cells don't clip it */
  z-index: 10;                   /* Above adjacent cells and borders */
  position: relative;            /* Establish stacking context for z-index */
}

/* Ensure focus is visible on all row backgrounds */
.row-striped [role="gridcell"]:focus {
  outline-color: #005fcc;       /* Verify 3:1 against striped row color */
}

.row-selected [role="gridcell"]:focus {
  outline-color: #ffffff;       /* White outline on blue selection bg */
  box-shadow: 0 0 0 3px #005fcc; /* Double ring for extra visibility */
}

/* Prevent sticky elements from covering focus */
[role="grid"] {
  scroll-padding-top: 52px;     /* Sticky header height + 4px buffer */
  scroll-padding-bottom: 44px;  /* Sticky footer height + 4px buffer */
  scroll-padding-left: 132px;   /* Frozen column width + 4px buffer */
  scroll-padding-right: 4px;    /* Small buffer */
}
```

**High contrast / forced colors mode:**

```css
@media (forced-colors: active) {
  [role="gridcell"]:focus,
  [role="columnheader"]:focus,
  [role="rowheader"]:focus {
    outline: 3px solid Highlight;
    outline-offset: -3px;
  }
}
```

**Testing:** Verify focus visibility by tabbing through the grid with every combination of: default row, striped row, selected row, error row, disabled row, hovered row. The focus indicator must be clearly visible in every combination.

---

### 3.9 Focus on Row Add/Remove

When rows are dynamically added or removed, focus must be managed to avoid losing the user's position.

#### Row deletion

When the focused row is deleted:

1. Move focus to the **next row** at the same column position.
2. If the deleted row was the last row, move focus to the **new last row** at the same column position.
3. If all rows are deleted, move focus to a meaningful element: the "no data" message, the "Add row" button, or the grid toolbar.
4. Announce the deletion via the status live region: "Row deleted. 149 rows remaining."

```js
function deleteRow(rowIndex) {
  const wasLastRow = rowIndex === totalRows - 1;
  const focusCol = this.focusedCol;

  // Remove the row from data and DOM
  removeRowFromData(rowIndex);
  removeRowFromDOM(rowIndex);

  // Determine focus target
  let targetRowIndex;
  if (wasLastRow) {
    targetRowIndex = Math.max(0, rowIndex - 1);
  } else {
    targetRowIndex = rowIndex; // Next row has shifted into this index
  }

  // Focus the target cell
  if (totalRows > 0) {
    const targetCell = getCellElement(targetRowIndex, focusCol);
    targetCell.setAttribute('tabindex', '0');
    targetCell.focus();
  } else {
    document.getElementById('no-data-message').focus();
  }

  // Announce
  announceStatus(`Row deleted. ${totalRows} rows remaining.`);
}
```

#### Row addition

When a new row is added:

1. If the new row is added at the user's request (e.g., clicking "Add Row"): move focus to the **first editable cell** of the new row. If the new row is in edit mode, focus the first input.
2. If the new row appears asynchronously (e.g., real-time data): do NOT move focus. Keep focus on the current cell. Announce via live region: "New row added."
3. Update `aria-rowcount` on the grid.

```js
function addRow(position) {
  const newRowData = createEmptyRow();
  insertRowInData(position, newRowData);
  const newRowElement = renderRow(position, newRowData);

  // Move focus to first editable cell in the new row
  const firstEditable = newRowElement.querySelector(
    '[role="gridcell"]:not([aria-readonly="true"])'
  );
  if (firstEditable) {
    // Update tabindex
    const currentFocused = gridElement.querySelector('[tabindex="0"]');
    if (currentFocused) currentFocused.setAttribute('tabindex', '-1');
    firstEditable.setAttribute('tabindex', '0');
    firstEditable.focus();
  }

  // Announce
  announceStatus(`New row added at position ${position + 1}.`);
}
```

#### Asynchronous data loading

When the grid loads additional data asynchronously (lazy loading, infinite scroll):

1. Set `aria-busy="true"` on the grid before loading begins.
2. Do NOT move focus. The user's current focus position must remain stable.
3. When loading completes, set `aria-busy="false"` and update `aria-rowcount`.
4. Announce via live region: "25 additional rows loaded. 175 rows total."
5. If the load fails, announce the error: "Failed to load additional rows. Retry available." Do not move focus.

```js
async function loadMoreRows() {
  gridElement.setAttribute('aria-busy', 'true');
  announceStatus('Loading additional rows...');

  try {
    const newRows = await fetchRows(currentOffset, pageSize);
    appendRowsToDOM(newRows);
    gridElement.setAttribute('aria-rowcount', String(totalRows));
    announceStatus(`${newRows.length} additional rows loaded. ${totalRows} rows total.`);
  } catch (error) {
    announceStatus('Failed to load additional rows.');
  } finally {
    gridElement.setAttribute('aria-busy', 'false');
  }
}
```

---

# Tabular Grid Variants: Accessibility Modeling Document

## Section 4 — Keyboard Interaction Model

This section defines the complete keyboard interaction model for all tabular grid variants. The model is grounded in the WAI-ARIA Authoring Practices Guide (APG) grid pattern and extended per variant. All interactions target WCAG 2.2 Level AAA conformance.

---

### 4.1 Universal Grid Navigation

The following keyboard interactions apply to every grid variant unless explicitly overridden by a variant-specific section.

#### Navigation Mode vs Edit Mode

The WAI-ARIA APG defines two interaction modes for grids. Implementations MUST clearly distinguish between them:

- **Navigation Mode** (default): Arrow keys move focus between cells. Keystrokes are intercepted by the grid widget; they do NOT reach cell contents. Interactive widgets inside cells (buttons, links, checkboxes) are NOT operable. The grid itself is the active keyboard trap.
- **Edit Mode**: Entered via `Enter`, `F2`, or typing an alphanumeric character in an editable cell. Arrow keys pass through to the widget inside the cell (e.g., a text input cursor). `Tab` / `Shift+Tab` move between focusable widgets within the cell or within the grid. `Escape` returns to Navigation Mode. `F2` toggles back to Navigation Mode while preserving the edit state.

A grid that contains interactive content (links, buttons, menus, checkboxes) MUST implement both modes. A read-only display grid MAY implement only Navigation Mode.

> **AAA note**: Provide a visible mode indicator (e.g., cell outline style change, status bar text) so users always know which mode is active. This is a usability best practice that improves cognitive accessibility and helps users maintain awareness of the current interaction state.

#### Complete Key Reference

| Key | Action | Context / Mode |
|---|---|---|
| `Arrow Up` (`↑`) | Move focus to the cell directly above the current cell. If on the first data row, move to the column header. | Navigation Mode |
| `Arrow Down` (`↓`) | Move focus to the cell directly below the current cell. | Navigation Mode |
| `Arrow Left` (`←`) | Move focus to the cell immediately to the left. If on the first cell in the row, focus does NOT wrap to the previous row. | Navigation Mode |
| `Arrow Right` (`→`) | Move focus to the cell immediately to the right. If on the last cell in the row, focus does NOT wrap to the next row. | Navigation Mode |
| `Home` | Move focus to the first cell in the current row. | Navigation Mode |
| `End` | Move focus to the last cell in the current row. | Navigation Mode |
| `Ctrl+Home` | Move focus to the first cell in the first row (top-left corner of data). | Navigation Mode |
| `Ctrl+End` | Move focus to the last cell in the last row (bottom-right corner of data). | Navigation Mode |
| `Page Up` | Scroll up by approximately one viewport height and move focus to the cell in the same column that is now at the top of the visible area. | Navigation Mode |
| `Page Down` | Scroll down by approximately one viewport height and move focus to the cell in the same column that is now at the bottom of the visible area. | Navigation Mode |
| `Tab` | **Navigation Mode**: Move focus OUT of the grid to the next focusable element in the page tab order. **Edit Mode**: Move focus to the next focusable widget within the cell, or if none, to the next cell containing a widget, or exit the grid. | Both modes |
| `Shift+Tab` | **Navigation Mode**: Move focus OUT of the grid to the previous focusable element in the page tab order. **Edit Mode**: Move focus to the previous focusable widget within the cell, or if none, to the previous cell containing a widget, or exit the grid backward. | Both modes |
| `Enter` | **On a read-only cell**: Activate the default action (follow link, expand detail row, open context). **On an editable cell**: Enter Edit Mode; if already in Edit Mode, commit the edit and move focus down one row (spreadsheet convention) or stay (form convention). **On a column header**: Toggle sort direction. | Navigation Mode / Edit Mode |
| `F2` | **Navigation Mode**: Enter Edit Mode in the current cell without clearing existing content. **Edit Mode**: Return to Navigation Mode while preserving the current edit value. A second press of `F2` restores Navigation Mode. | Both modes |
| `Alphanumeric key` | If the current cell is editable and in Navigation Mode, enter Edit Mode and begin editing with the typed character, replacing the cell content. | Navigation Mode (editable cell) |
| `Escape` | **Edit Mode**: Cancel the current edit, revert cell value to its prior state, and return to Navigation Mode. **Popup open**: Close the popup (autocomplete, date picker, context menu) without committing. **Selection active**: Optionally deselect all. | Edit Mode / Popup open |
| `Space` | Toggle selection of the current row (row selection mode) or current cell (cell selection mode). On a checkbox cell, toggle the checkbox. | Navigation Mode |
| `Ctrl+A` | Select all rows (row selection mode) or all cells (cell selection mode). When all are already selected, deselect all. | Navigation Mode |
| `Shift+Arrow Up` (`Shift+↑`) | Extend row selection upward by one row. The anchor row remains; the focus row moves up. | Navigation Mode (multi-select enabled) |
| `Shift+Arrow Down` (`Shift+↓`) | Extend row selection downward by one row. | Navigation Mode (multi-select enabled) |
| `Shift+Arrow Left` (`Shift+←`) | Extend cell selection leftward by one cell. | Navigation Mode (cell-range selection enabled) |
| `Shift+Arrow Right` (`Shift+→`) | Extend cell selection rightward by one cell. | Navigation Mode (cell-range selection enabled) |
| `Ctrl+Space` | Select the entire column of the currently focused cell. | Navigation Mode (column selection enabled) |
| `Shift+Space` | Select the entire row of the currently focused cell. | Navigation Mode (row selection enabled) |
| `Ctrl+C` | Copy the selected cell(s), row(s), or range to the system clipboard. Announce "Copied N rows" or "Copied NxM range" via a live region. | Navigation Mode |
| `Ctrl+V` | Paste clipboard content into the grid starting at the focused cell. Only functional in editable grids. | Navigation Mode / Edit Mode |
| `Shift+F10` | Open the context menu for the focused cell or row, equivalent to a right-click. Focus moves to the first item in the context menu. | Navigation Mode |
| `Delete` | **On an editable cell**: Clear cell content. **On a selected row** (if row deletion is enabled): Delete the row. Announce the deletion via a live region. | Navigation Mode |

> **Implementation note --- edge wrapping**: Per APG, arrow key navigation in grids MUST NOT wrap. Pressing `Arrow Right` on the last cell of a row does nothing. Pressing `Arrow Down` on the last row does nothing. This is distinct from menu and listbox patterns where wrapping is permitted.

> **Implementation note:** This keyboard model assumes the **roving tabindex** focus pattern (Section 3.1). When using the `aria-activedescendant` pattern (Section 3.2), the same keys apply but arrow navigation updates visual styling and the `aria-activedescendant` attribute rather than moving DOM focus.

> **Escape hierarchy:** When multiple layers are active, Escape closes the innermost layer first: (1) close modal dialog/popup → (2) cancel inline edit → (3) return to Navigation Mode. For example, if a cell editor opens a date picker dialog, the first Escape closes the date picker; the second Escape cancels the edit.

---

### 4.2 Tree Grid Additions

These interactions extend Section 4.1 and apply only to grids using `role="treegrid"`. They govern hierarchical expand/collapse behavior.

#### Key Reference

| Key | Action | Context |
|---|---|---|
| `Arrow Right` (on a **collapsed parent row**) | Expand the row (set `aria-expanded` from `"false"` to `"true"`). Child rows become visible. Focus stays on the parent row. | Focus is on a ROW element (not a cell) with `aria-expanded="false"` |
| `Arrow Right` (on an **expanded parent row**) | Move focus to the first child row. | Focus is on a ROW element with `aria-expanded="true"` |
| `Arrow Right` (on a **cell**) | Standard behavior: move to the next cell in the row. | Focus is on a CELL element (gridcell / columnheader) |
| `Arrow Left` (on an **expanded parent row**) | Collapse the row (set `aria-expanded` from `"true"` to `"false"`). Child rows are hidden. Focus stays on the parent row. | Focus is on a ROW element with `aria-expanded="true"` |
| `Arrow Left` (on a **child row** or collapsed row) | Move focus to the parent row. If the current row is a root-level row, do nothing. | Focus is on a ROW element that is a child in the hierarchy |
| `Arrow Left` (on a **cell**) | Standard behavior: move to the previous cell in the row. | Focus is on a CELL element |
| `*` (asterisk) | Expand all sibling rows at the current hierarchical level. Does NOT expand rows at deeper levels (single-level expand). | Focus is on any row |

#### Critical Nuance: Row Focus vs Cell Focus

The APG tree grid pattern specifies that **expand/collapse via arrow keys only works when entire rows are the focus targets** --- that is, when `tabindex` is managed on `role="row"` elements and arrow up/down moves between rows.

In most data-oriented tree grids, however, **cells are the focus targets** (each `role="gridcell"` or `role="columnheader"` receives focus). In this cell-focused model:

- `Arrow Left` and `Arrow Right` move between cells within the row, following standard grid navigation.
- Expand/collapse MUST be triggered by an alternative mechanism:
  - `Enter` on the expand/collapse toggle cell (typically the first cell containing a disclosure triangle).
  - A dedicated toggle button within the cell that receives focus via `Tab` in Edit Mode.
  - `Space` on the row, if row selection is not the primary action.

The implementation MUST document which model it uses and ensure consistency.

```html
<!-- Cell-focused tree grid: expand/collapse via Enter on the toggle cell -->
<div role="treegrid" aria-label="Organization">
  <div role="row" aria-level="1" aria-expanded="false" aria-setsize="3" aria-posinset="1">
    <div role="gridcell" tabindex="0" class="tree-toggle-cell">
      <!-- Enter here expands the row -->
      Engineering
    </div>
    <div role="gridcell" tabindex="-1">42 employees</div>
  </div>
</div>
```

---

### 4.3 Gantt Chart Additions

Gantt charts present a dual-region interface: a task list grid and a graphical timeline. The keyboard model must address both regions and the transitions between them.

| Key | Action | Context |
|---|---|---|
| `Tab` | Tab from the last focusable element in the task list grid moves focus to the first task bar in the timeline region. Shift+Tab reverses. Since the timeline uses `role="application"`, standard screen reader pass-through keys are disabled within it. Provide accessible instructions (e.g., an `aria-describedby` pointing to a help text element) explaining the custom keyboard model. Within the timeline, `Tab` moves to the next task bar. | Cross-region navigation |
| `Arrow Left` (`←`) in timeline | Adjust the task start date earlier by the smallest visible time unit (e.g., one day). Announce the new start date via live region. | Timeline region, task bar focused |
| `Arrow Right` (`→`) in timeline | Adjust the task start date later by the smallest visible time unit. Announce the new start date via live region. | Timeline region, task bar focused |
| `Shift+Arrow Left` (`Shift+←`) in timeline | Decrease the task duration by one time unit (move end date earlier). Announce new duration. | Timeline region, task bar focused |
| `Shift+Arrow Right` (`Shift+→`) in timeline | Increase the task duration by one time unit (move end date later). Announce new duration. | Timeline region, task bar focused |
| `Enter` | Open a task editor dialog for the focused task. The dialog MUST be a modal with focus trap. On close, focus returns to the originating task bar or row. | Either region, task focused |
| `+` (plus) | Zoom in on the timeline (increase temporal resolution, e.g., from months to weeks). Announce new scale via live region. | Timeline region |
| `-` (minus) | Zoom out on the timeline (decrease temporal resolution, e.g., from weeks to months). Announce new scale via live region. | Timeline region |
| `Ctrl+Arrow Right` (`Ctrl+→`) | Navigate to the next dependent task (follow the dependency link forward). Announce the dependency relationship. | Timeline region, task bar focused |
| `Ctrl+Arrow Left` (`Ctrl+←`) | Navigate to the previous dependent task (follow the dependency link backward). Announce the dependency relationship. | Timeline region, task bar focused |

> **AAA note**: Every keyboard-triggered change to task dates or durations MUST be confirmed with a reversible action (`Ctrl+Z` to undo) per WCAG 2.2 SC 3.3.4 (Error Prevention). Announce changes via `aria-live="assertive"` for time-critical feedback or `aria-live="polite"` for non-blocking updates.

---

### 4.4 Pivot Table Additions

Pivot tables extend the base grid with multi-level grouped headers on both axes. Keyboard navigation must support traversing these hierarchical headers.

| Key | Action | Context |
|---|---|---|
| `Arrow Left` (`←`) in header rows | Navigate between column headers within the same level of the multi-level column header hierarchy. | Focus on a column header cell |
| `Arrow Right` (`→`) in header rows | Navigate between column headers within the same level. | Focus on a column header cell |
| `Arrow Up` (`↑`) in row header column | Navigate between row headers within the same level of the multi-level row header hierarchy. If at the top of a sub-group, move to the parent group header. | Focus on a row header cell |
| `Arrow Down` (`↓`) in row header column | Navigate to the next row header within the same level, or into a child sub-group. | Focus on a row header cell |
| `Enter` on a dimension header | Expand a collapsed dimension grouping (drill down) or collapse an expanded grouping (roll up). Toggle `aria-expanded`. Announce the new state and the number of revealed/hidden items. | Focus on a row or column dimension header |
| `Ctrl+Arrow Up` (`Ctrl+↑`) | From a data cell, announce the contributing row header(s) at all levels. For example: "Row headers: North Region, Q1 2026". Does not move focus. | Focus on a data cell (gridcell) |
| `Ctrl+Arrow Left` (`Ctrl+←`) | From a data cell, announce the contributing column header(s) at all levels. For example: "Column headers: Revenue, Year-to-Date". Does not move focus. | Focus on a data cell (gridcell) |

> **AAA note**: The `Ctrl+Arrow` header announcement shortcuts are essential for WCAG 2.2 SC 1.3.1 (Info and Relationships) at the AAA level. Without them, users navigating a pivot table with a screen reader lose track of which dimension intersection a data value represents.

---

### 4.5 Spreadsheet Additions

Spreadsheet grids extend the base grid with cell addressing, formula editing, range operations, and multi-sheet navigation.

| Key | Action | Context |
|---|---|---|
| `Ctrl+Arrow Up/Down/Left/Right` | Jump to the edge of the current data region in the arrow direction. The edge is defined as the last non-empty cell before an empty cell, or the first non-empty cell after an empty cell. | Navigation Mode |
| `Ctrl+Shift+Arrow Up/Down/Left/Right` | Extend the current selection to the edge of the data region in the arrow direction. Combines jump-to-edge with selection extension. | Navigation Mode (selection active) |
| `Ctrl+G` or `F5` | Open the "Go To" dialog. The dialog contains a text input for a cell address (e.g., "B14") and a listbox for named ranges. Focus moves into the dialog. On confirmation, focus moves to the target cell. | Navigation Mode |
| `=` (equals sign) | Begin formula input in the current cell. Enter Edit Mode with the formula bar active. The cell displays the formula text; the formula bar mirrors it. Announce "Formula editing mode" via live region. | Navigation Mode (editable cell) |
| `Tab` during formula input | Accept the current autocomplete suggestion in the formula bar (e.g., function name completion). If no suggestion is active, commit the formula and move to the next cell to the right. | Edit Mode (formula input active) |
| `Ctrl+D` | Fill down: copy the content of the topmost cell in the selection into all selected cells below it. Announce "Filled down N cells". | Navigation Mode (vertical selection active) |
| `Ctrl+R` | Fill right: copy the content of the leftmost cell in the selection into all selected cells to its right. Announce "Filled right N cells". | Navigation Mode (horizontal selection active) |
| `Ctrl+Shift+L` | Toggle auto-filter dropdowns on the header row. Announce "Auto-filter enabled" or "Auto-filter disabled". | Navigation Mode (focus on any cell) |
| `Ctrl+;` (semicolon) | Insert the current date into the focused cell in the locale-appropriate format. Enter Edit Mode briefly, then return to Navigation Mode. | Navigation Mode (editable cell) |

---

### 4.6 Master-Detail Additions

Master-detail grids allow rows to expand into a subordinate detail panel containing forms, nested grids, or supplementary content.

| Key | Action | Context |
|---|---|---|
| `Enter` | Expand the detail panel for the focused row. Set `aria-expanded="true"` on the row. Announce "Detail expanded for [row identifier]". Focus remains on the parent row (Option A, recommended) or moves to the first focusable element in the detail (Option B). | Navigation Mode, focus on a master row |
| `Escape` | Collapse the currently expanded detail panel. Set `aria-expanded="false"`. If focus was inside the detail panel, move focus back to the parent row. Announce "Detail collapsed". | Detail panel is open |
| `Tab` | From the parent row, move focus into the detail panel's first focusable element. Within the detail panel, `Tab` follows the normal tab order of the detail content. | Focus on expanded parent row or within detail panel |
| `Shift+Tab` | From the first focusable element in the detail panel, return focus to the parent row. Within the detail panel, move to the previous focusable element. | Focus within detail panel |

> **Consistency requirement**: The implementation MUST choose either Option A (focus stays on parent) or Option B (focus moves into detail) and apply it uniformly to all master-detail expansions within the application. Mixing behaviors within the same grid violates the principle of predictable interaction, which is essential for keyboard and screen reader users.

---

## Section 5 — Per-Variant Accessibility Model

This section defines the complete ARIA structure, semantic role assignments, attribute requirements, focus management strategy, and screen reader announcement expectations for each of the six tabular grid variants.

---

### 5.1 Data Grid (`role="grid"`)

The data grid is the foundational variant. All other variants extend or modify this model.

#### 5.1.1 DOM / ARIA Structure

```html
<div role="grid"
     aria-label="Employees"
     aria-rowcount="500"
     aria-colcount="8">

  <!-- Column header group -->
  <div role="rowgroup">
    <div role="row" aria-rowindex="1">
      <div role="columnheader"
           aria-colindex="1"
           aria-sort="ascending"
           tabindex="-1">
        Name
      </div>
      <div role="columnheader"
           aria-colindex="2"
           aria-sort="none"
           tabindex="-1">
        Department
      </div>
      <div role="columnheader"
           aria-colindex="3"
           aria-sort="none"
           tabindex="-1">
        Age
      </div>
      <div role="columnheader"
           aria-colindex="4"
           aria-sort="none"
           tabindex="-1">
        Salary
      </div>
      <!-- columns 5-8 may be scrolled into view -->
    </div>
  </div>

  <!-- Data body group -->
  <div role="rowgroup">
    <div role="row" aria-rowindex="2" aria-selected="false">
      <div role="gridcell"
           aria-colindex="1"
           tabindex="0">
        Alice Johnson
      </div>
      <div role="gridcell"
           aria-colindex="2"
           tabindex="-1">
        Engineering
      </div>
      <div role="gridcell"
           aria-colindex="3"
           tabindex="-1">
        34
      </div>
      <div role="gridcell"
           aria-colindex="4"
           tabindex="-1">
        $92,000
      </div>
    </div>
    <div role="row" aria-rowindex="3" aria-selected="false">
      <div role="gridcell"
           aria-colindex="1"
           tabindex="-1">
        Bob Smith
      </div>
      <div role="gridcell"
           aria-colindex="2"
           tabindex="-1">
        Marketing
      </div>
      <div role="gridcell"
           aria-colindex="3"
           tabindex="-1">
        28
      </div>
      <div role="gridcell"
           aria-colindex="4"
           tabindex="-1">
        $78,000
      </div>
    </div>
    <!-- rows 4-500 virtualized -->
  </div>
</div>
```

#### 5.1.2 ARIA Attributes per Element Level

**Grid container** (`role="grid"`):

| Attribute | Required | Purpose |
|---|---|---|
| `aria-label` or `aria-labelledby` | REQUIRED | Provides an accessible name for the grid. Every grid MUST have an accessible name. |
| `aria-rowcount` | REQUIRED when virtualizing | Total number of rows in the dataset, including header rows. Set to the full data count (e.g., `500`), not the DOM row count. Set to `-1` if the total is unknown (infinite scroll). |
| `aria-colcount` | REQUIRED when columns are hidden/virtualized | Total number of columns in the dataset. Required when not all columns are rendered in the DOM simultaneously. |
| `aria-multiselectable` | Conditional | Set to `"true"` when multiple rows or cells can be selected simultaneously. Omit or set to `"false"` for single-select or no-select grids. |
| `aria-describedby` | RECOMMENDED | Point to an element containing usage instructions (e.g., "Use arrow keys to navigate cells. Press Enter to edit."). |
| `aria-busy` | Conditional | Set to `"true"` while the grid is loading or refreshing data. Remove or set to `"false"` when complete. |
| `aria-activedescendant` | Alternative | Alternative to roving tabindex: the grid container holds `tabindex="0"` and `aria-activedescendant` points to the ID of the currently focused cell. Use ONE focus strategy, not both. |

**Row group** (`role="rowgroup"`):

| Attribute | Required | Purpose |
|---|---|---|
| (no required ARIA attributes) | --- | Structural grouping of header rows, body rows, and footer rows. Analogous to `<thead>`, `<tbody>`, `<tfoot>`. |

**Row** (`role="row"`):

| Attribute | Required | Purpose |
|---|---|---|
| `aria-rowindex` | REQUIRED when virtualizing | The 1-based index of this row in the full dataset. Must be monotonically increasing across all rendered rows but need not be contiguous (gaps indicate virtualized-out rows). |
| `aria-selected` | Conditional | Set to `"true"` or `"false"` on every row when selection is enabled. Omitting the attribute means the row is not selectable. All selectable rows MUST have this attribute. |
| `aria-level` | Only for tree grids | Not used in flat data grids. |
| `aria-disabled` | Conditional | Set to `"true"` for rows that are visible but not interactive. |

**Column header** (`role="columnheader"`):

| Attribute | Required | Purpose |
|---|---|---|
| `aria-colindex` | REQUIRED when virtualizing | The 1-based index of this column in the full column set. |
| `aria-sort` | REQUIRED on sortable columns | One of `"ascending"`, `"descending"`, `"other"`, or `"none"`. Only ONE column should have a value other than `"none"` at a time (for single-column sort). For multi-column sort, multiple headers may have non-`"none"` values. |
| `aria-label` | Conditional | Override the visible text if the header contains only an icon or abbreviation. |

**Grid cell** (`role="gridcell"`):

| Attribute | Required | Purpose |
|---|---|---|
| `aria-colindex` | REQUIRED when virtualizing | The 1-based column index. Must match the corresponding `columnheader` index. |
| `aria-readonly` | Conditional | Set to `"true"` on cells that are not editable in an otherwise editable grid. Omit on read-only grids (the default). |
| `aria-required` | Conditional | Set to `"true"` on cells that must have a value before form submission. |
| `aria-invalid` | Conditional | Set to `"true"` or a specific token (`"grammar"`, `"spelling"`) when the cell value fails validation. Pair with `aria-errormessage` pointing to the error text element. |
| `aria-errormessage` | Conditional | ID reference to an element containing the validation error message. Only meaningful when `aria-invalid` is not `"false"`. |
| `aria-selected` | Conditional | For cell-level selection (as opposed to row-level). |

#### 5.1.3 Virtualization

When the grid virtualizes rows (renders only visible rows in the DOM), the following rules apply:

1. `aria-rowcount` on the grid container MUST reflect the total data row count, including header rows. For example, 1 header row + 499 data rows = `aria-rowcount="500"`.
2. Each rendered row MUST have `aria-rowindex` set to its 1-based position in the full dataset. When the user scrolls and rows are recycled, `aria-rowindex` values update to reflect the new data positions.
3. When the total row count is unknown (infinite scroll / progressive loading), set `aria-rowcount="-1"`.
4. Column virtualization follows the same pattern with `aria-colcount` on the grid and `aria-colindex` on each cell and header.

```html
<!-- Virtualized grid showing rows 50-70 of 10,000 -->
<div role="grid" aria-label="Transactions" aria-rowcount="10001" aria-colcount="12">
  <div role="rowgroup">
    <div role="row" aria-rowindex="1">
      <!-- header cells always rendered -->
      <div role="columnheader" aria-colindex="1">Date</div>
      <div role="columnheader" aria-colindex="2">Amount</div>
      <!-- ... -->
    </div>
  </div>
  <div role="rowgroup">
    <div role="row" aria-rowindex="51"> <!-- data row 50, +1 for header -->
      <div role="gridcell" aria-colindex="1">2026-01-15</div>
      <div role="gridcell" aria-colindex="2">$1,234.56</div>
    </div>
    <!-- ... rows 52-71 ... -->
    <div role="row" aria-rowindex="71">
      <div role="gridcell" aria-colindex="1">2026-02-03</div>
      <div role="gridcell" aria-colindex="2">$567.89</div>
    </div>
  </div>
</div>
```

> **APG caveat**: With infinite scroll, `Ctrl+End` navigates to the last currently loaded row in the DOM, not necessarily the last row in the dataset. Implementations SHOULD announce "End of loaded data. More rows may be available." via a live region when the user reaches the boundary.

#### 5.1.4 Grouped Rows

Flat data grids sometimes group rows by a column value (e.g., group by "Department"). This is NOT a tree structure; it is a visual grouping.

```html
<div role="grid" aria-label="Employees by Department" aria-rowcount="52">
  <div role="rowgroup"> <!-- header -->
    <div role="row" aria-rowindex="1">
      <div role="columnheader" aria-colindex="1">Name</div>
      <div role="columnheader" aria-colindex="2">Role</div>
    </div>
  </div>

  <!-- Engineering group -->
  <div role="rowgroup">
    <div role="row" aria-rowindex="2" aria-expanded="true">
      <div role="gridcell" aria-colindex="1" aria-colspan="2">
        <strong>Engineering (15 employees)</strong>
      </div>
    </div>
    <div role="row" aria-rowindex="3">
      <div role="gridcell" aria-colindex="1">Alice</div>
      <div role="gridcell" aria-colindex="2">Senior Engineer</div>
    </div>
    <!-- ... more rows ... -->
  </div>

  <!-- Marketing group -->
  <div role="rowgroup">
    <div role="row" aria-rowindex="18" aria-expanded="true">
      <div role="gridcell" aria-colindex="1" aria-colspan="2">
        <strong>Marketing (10 employees)</strong>
      </div>
    </div>
    <!-- ... -->
  </div>
</div>
```

**Distinction**: Grouped flat data uses `role="rowgroup"` to separate groups with `aria-expanded` on the group header row. A tree structure uses `aria-level` on each row. Do NOT mix the two patterns.

> **`aria-owns` ordering caveat**: If group header rows and their child rows are not DOM-contiguous (e.g., because of separate scroll containers for pinned vs scrollable columns), use `aria-owns` on the group header row to declare the logical order. However, `aria-owns` can degrade performance in some screen readers for large grids. Prefer DOM order when possible.

#### 5.1.5 Edge Wrapping Prohibition

Data grids MUST NOT wrap navigation at edges:

- Pressing `Arrow Right` on the last cell of a row: no action (focus stays).
- Pressing `Arrow Down` on the last row: no action (focus stays).
- Pressing `Arrow Left` on the first cell of a row: no action (focus stays).
- Pressing `Arrow Up` on the first row (or first data row from header): no action (focus stays).

This is explicitly required by the APG grid pattern and distinguishes grids from menus and listboxes.

#### 5.1.6 HTML `<table>` with Grid Role

When an HTML `<table>` element is enhanced with `role="grid"`:

```html
<table role="grid" aria-label="Employees" aria-rowcount="500">
  <thead>
    <tr> <!-- Do NOT add role="row" --- <tr> already implies it -->
      <th aria-sort="ascending"> <!-- Do NOT add role="columnheader" -->
        Name
      </th>
      <th>Age</th>
    </tr>
  </thead>
  <tbody>
    <tr aria-rowindex="2" aria-selected="false">
      <!-- Do NOT add role="gridcell" --- <td> already implies it -->
      <td tabindex="0">Alice</td>
      <td tabindex="-1">34</td>
    </tr>
  </tbody>
</table>
```

**Rule**: Do NOT add redundant ARIA roles (`role="row"` on `<tr>`, `role="gridcell"` on `<td>`, `role="columnheader"` on `<th>`) when using native HTML table elements. The implicit ARIA semantics already map correctly. Adding redundant roles can cause double-announcement in some screen readers.

**Exception**: If using `<div>` elements to construct a table-like layout, every structural role MUST be explicitly declared.

#### 5.1.7 Frozen / Pinned Columns

When columns are frozen (pinned) to the left or right edge, the grid may render them in separate DOM containers for CSS positioning. Despite the DOM split:

1. `aria-colindex` MUST be continuous across all DOM panes. The first pinned column is `aria-colindex="1"`, the first scrollable column continues the sequence (e.g., `aria-colindex="3"` if two columns are pinned).
2. Each row MUST appear as a single `role="row"` element spanning all panes, OR use `aria-owns` to associate cells from different panes into a single logical row.
3. Keyboard navigation MUST treat the frozen and scrollable columns as a single continuous row. `Arrow Right` from the last frozen column cell moves to the first scrollable column cell seamlessly.

```html
<!-- Approach: single row spanning both panes using CSS grid/sticky -->
<div role="grid" aria-label="Financial Data" aria-colcount="20">
  <div role="rowgroup">
    <div role="row" aria-rowindex="1">
      <!-- Frozen columns (position: sticky) -->
      <div role="columnheader" aria-colindex="1" class="frozen">Account</div>
      <div role="columnheader" aria-colindex="2" class="frozen">Name</div>
      <!-- Scrollable columns -->
      <div role="columnheader" aria-colindex="3">Jan</div>
      <div role="columnheader" aria-colindex="4">Feb</div>
      <!-- ... up to aria-colindex="20" -->
    </div>
  </div>
</div>
```

#### 5.1.8 Sticky Headers

When column headers use `position: sticky` to remain visible during vertical scrolling:

1. The header-to-cell association is maintained through the structural `role="rowgroup"` / `role="row"` / `role="columnheader"` hierarchy. No additional ARIA attributes are needed for the sticky behavior itself.
2. Ensure that `aria-colindex` values on sticky headers match the `aria-colindex` values on data cells in the same column.
3. Screen readers determine column headers by DOM structure (the `columnheader` in the same `aria-colindex` position), NOT by visual position. Sticky positioning does not break this association.
4. If the sticky header implementation requires cloning header cells into a separate container (e.g., for Shadow DOM isolation), the cloned cells MUST be `aria-hidden="true"` and the original cells MUST remain in the DOM as the authoritative ARIA source.

---

### 5.2 Tree Grid (`role="treegrid"`)

A tree grid combines the column/cell structure of a data grid with the hierarchical expand/collapse semantics of a tree view.

#### 5.2.1 DOM / ARIA Structure

```html
<div role="treegrid"
     aria-label="Organization Structure"
     aria-rowcount="85"
     aria-colcount="4">

  <!-- Header -->
  <div role="rowgroup">
    <div role="row" aria-rowindex="1">
      <div role="columnheader" aria-colindex="1">Department / Employee</div>
      <div role="columnheader" aria-colindex="2">Role</div>
      <div role="columnheader" aria-colindex="3">Headcount</div>
      <div role="columnheader" aria-colindex="4">Budget</div>
    </div>
  </div>

  <!-- Body -->
  <div role="rowgroup">
    <!-- Level 1: Top-level department, expanded -->
    <div role="row"
         aria-rowindex="2"
         aria-level="1"
         aria-expanded="true"
         aria-setsize="3"
         aria-posinset="1"
         aria-selected="false">
      <div role="gridcell" aria-colindex="1" tabindex="0">
        <span aria-hidden="true" class="expand-icon">&#9660;</span>
        Engineering
      </div>
      <div role="gridcell" aria-colindex="2" tabindex="-1">Division</div>
      <div role="gridcell" aria-colindex="3" tabindex="-1">42</div>
      <div role="gridcell" aria-colindex="4" tabindex="-1">$4.2M</div>
    </div>

    <!-- Level 2: Sub-department, expanded -->
    <div role="row"
         aria-rowindex="3"
         aria-level="2"
         aria-expanded="true"
         aria-setsize="2"
         aria-posinset="1"
         aria-selected="false">
      <div role="gridcell" aria-colindex="1" tabindex="-1">
        <span aria-hidden="true" class="expand-icon">&#9660;</span>
        Frontend
      </div>
      <div role="gridcell" aria-colindex="2" tabindex="-1">Team</div>
      <div role="gridcell" aria-colindex="3" tabindex="-1">18</div>
      <div role="gridcell" aria-colindex="4" tabindex="-1">$1.8M</div>
    </div>

    <!-- Level 3: Leaf row (individual employee, no expand) -->
    <div role="row"
         aria-rowindex="4"
         aria-level="3"
         aria-setsize="18"
         aria-posinset="1"
         aria-selected="false">
      <div role="gridcell" aria-colindex="1" tabindex="-1">
        Alice Johnson
      </div>
      <div role="gridcell" aria-colindex="2" tabindex="-1">Senior Engineer</div>
      <div role="gridcell" aria-colindex="3" tabindex="-1">---</div>
      <div role="gridcell" aria-colindex="4" tabindex="-1">---</div>
    </div>

    <!-- More level 3 rows... -->

    <!-- Level 2: Second sub-department, collapsed -->
    <div role="row"
         aria-rowindex="22"
         aria-level="2"
         aria-expanded="false"
         aria-setsize="2"
         aria-posinset="2"
         aria-selected="false">
      <div role="gridcell" aria-colindex="1" tabindex="-1">
        <span aria-hidden="true" class="expand-icon">&#9654;</span>
        Backend
      </div>
      <div role="gridcell" aria-colindex="2" tabindex="-1">Team</div>
      <div role="gridcell" aria-colindex="3" tabindex="-1">24</div>
      <div role="gridcell" aria-colindex="4" tabindex="-1">$2.4M</div>
    </div>
    <!-- Children of Backend are NOT in DOM (collapsed) -->

    <!-- Level 1: Second top-level department -->
    <div role="row"
         aria-rowindex="23"
         aria-level="1"
         aria-expanded="false"
         aria-setsize="3"
         aria-posinset="2"
         aria-selected="false">
      <div role="gridcell" aria-colindex="1" tabindex="-1">
        <span aria-hidden="true" class="expand-icon">&#9654;</span>
        Sales
      </div>
      <div role="gridcell" aria-colindex="2" tabindex="-1">Division</div>
      <div role="gridcell" aria-colindex="3" tabindex="-1">35</div>
      <div role="gridcell" aria-colindex="4" tabindex="-1">$3.5M</div>
    </div>
  </div>
</div>
```

#### 5.2.2 Row-Level ARIA Attributes

| Attribute | Purpose | Example Value |
|---|---|---|
| `aria-level` | The depth of this row in the hierarchy. Root items are level 1. | `"1"`, `"2"`, `"3"` |
| `aria-expanded` | Present ONLY on rows that have (or can have) children. `"true"` = expanded (children visible), `"false"` = collapsed (children hidden). Omit entirely on leaf rows. | `"true"` or `"false"` |
| `aria-setsize` | The total number of sibling rows at this level within the same parent. | `"3"` (three top-level departments) |
| `aria-posinset` | The 1-based position of this row among its siblings. | `"2"` (second of three) |

**Screen reader announcement goal**: When a user focuses a tree grid row, the screen reader should convey: "Level 2 of 3, item 3 of 5, expanded, Sales Department". The combination of `aria-level`, `aria-setsize`, `aria-posinset`, and `aria-expanded` produces this output.

#### 5.2.3 Focus Behavior on Expand/Collapse

**On expand**:
- Focus STAYS on the parent row (or the cell within the parent row that triggered the expand). The user then explicitly navigates to child rows via `Arrow Down`.
- Child rows are inserted into the DOM (or made visible) immediately after the parent row.
- Screen reader announces: "expanded" (the `aria-expanded` state change).

**On collapse**:
- If focus was on the parent row: focus stays. Screen reader announces: "collapsed".
- If focus was on a descendant row (child, grandchild, etc.): focus MUST move to the parent row that was collapsed. This is critical --- collapsing a parent while focus is on a hidden child would leave focus in a non-existent location.
- Collapsed child rows are removed from the DOM or hidden with `display: none` / `visibility: hidden`. They MUST NOT remain focusable.

```javascript
// Pseudocode: collapse handler
function collapseRow(parentRow) {
  const childRows = getVisibleDescendants(parentRow);
  const focusedElement = document.activeElement;

  // Check if focus is on a descendant
  if (childRows.some(row => row.contains(focusedElement))) {
    // Move focus to parent BEFORE hiding children
    parentRow.querySelector('[tabindex]').focus();
  }

  parentRow.setAttribute('aria-expanded', 'false');
  childRows.forEach(row => row.hidden = true);
}
```

#### 5.2.4 Lazy-Loaded Children

When child rows are loaded asynchronously (e.g., fetched from a server on expand):

1. Set `aria-busy="true"` on the parent row immediately upon expand request.
2. Optionally announce "Loading..." via an `aria-live="polite"` region.
3. When data arrives, render child rows, set `aria-busy="false"` on the parent row.
4. Announce "N items loaded" via the live region.
5. Focus remains on the parent row throughout the loading process.

```html
<!-- During loading -->
<div role="row" aria-level="1" aria-expanded="true" aria-busy="true"
     aria-rowindex="5" aria-setsize="3" aria-posinset="2">
  <div role="gridcell" aria-colindex="1" tabindex="0">
    Sales Department
  </div>
  <!-- ... -->
</div>
<!-- Live region -->
<div aria-live="polite" class="sr-only">Loading child items...</div>
```

#### 5.2.5 Tri-State Checkbox in Tree Grids

When a tree grid includes a selection checkbox column, parent rows use a tri-state checkbox to reflect aggregate child selection:

| `aria-checked` Value | Meaning |
|---|---|
| `"true"` | All children (at all depths) are selected. |
| `"false"` | No children are selected. |
| `"mixed"` | Some but not all children are selected. |

```html
<div role="row" aria-level="1" aria-expanded="true">
  <div role="gridcell" aria-colindex="1">
    <input type="checkbox"
           aria-checked="mixed"
           aria-label="Select Engineering and all sub-items" />
    Engineering
  </div>
  <!-- ... -->
</div>
```

When the user activates a `"mixed"` checkbox, the convention is to transition to `"true"` (select all children). A subsequent activation transitions to `"false"` (deselect all).

#### 5.2.6 Distinction from Grouped Flat Data

| Characteristic | Tree Grid (`role="treegrid"`) | Grouped Flat Grid (`role="grid"` + `rowgroup`) |
|---|---|---|
| Hierarchy | Arbitrary depth via `aria-level` | Single-level grouping only |
| Row semantics | Every row has `aria-level`, `aria-setsize`, `aria-posinset` | Group header rows have `aria-expanded`; member rows have no level |
| Keyboard expand | Arrow keys or Enter on tree toggle | Enter on group header |
| Container role | `treegrid` | `grid` |
| Screen reader mode | Tree grid navigation | Standard grid navigation |

---

### 5.3 Pivot Table

A pivot table presents aggregated data at the intersection of multi-level row dimensions and multi-level column dimensions. The primary accessibility challenge is maintaining the association between data cells and their contributing headers on both axes.

#### 5.3.1 DOM / ARIA Structure

```html
<div role="grid"
     aria-roledescription="pivot table"
     aria-label="Revenue by Region and Quarter"
     aria-rowcount="25"
     aria-colcount="10">

  <!-- Multi-level column headers -->
  <div role="rowgroup">
    <!-- Level 1 column headers: Years -->
    <div role="row" aria-rowindex="1">
      <div role="columnheader"
           aria-colindex="1"
           aria-colspan="2"
           id="rh-label">
        <!-- Empty corner cell, spanning row header columns -->
      </div>
      <div role="columnheader"
           aria-colindex="3"
           aria-colspan="4"
           id="ch-2025">
        2025
      </div>
      <div role="columnheader"
           aria-colindex="7"
           aria-colspan="4"
           id="ch-2026">
        2026
      </div>
    </div>
    <!-- Level 2 column headers: Quarters -->
    <div role="row" aria-rowindex="2">
      <div role="columnheader" aria-colindex="1" id="rh-region">Region</div>
      <div role="columnheader" aria-colindex="2" id="rh-product">Product</div>
      <div role="columnheader" aria-colindex="3" id="ch-2025-q1">Q1</div>
      <div role="columnheader" aria-colindex="4" id="ch-2025-q2">Q2</div>
      <div role="columnheader" aria-colindex="5" id="ch-2025-q3">Q3</div>
      <div role="columnheader" aria-colindex="6" id="ch-2025-q4">Q4</div>
      <div role="columnheader" aria-colindex="7" id="ch-2026-q1">Q1</div>
      <div role="columnheader" aria-colindex="8" id="ch-2026-q2">Q2</div>
      <div role="columnheader" aria-colindex="9" id="ch-2026-q3">Q3</div>
      <div role="columnheader" aria-colindex="10" id="ch-2026-q4">Q4</div>
    </div>
  </div>

  <!-- Data body with multi-level row headers -->
  <div role="rowgroup">
    <!-- Row group: North Region -->
    <div role="row" aria-rowindex="3">
      <div role="rowheader"
           aria-colindex="1"
           id="rh-north"
           aria-rowspan="3">
        North
      </div>
      <div role="rowheader" aria-colindex="2" id="rh-north-widgets">Widgets</div>
      <div role="gridcell"
           aria-colindex="3"
           headers="ch-2025 ch-2025-q1 rh-north rh-north-widgets">
        $45,000
      </div>
      <div role="gridcell"
           aria-colindex="4"
           headers="ch-2025 ch-2025-q2 rh-north rh-north-widgets">
        $52,000
      </div>
      <!-- ... more quarter cells ... -->
    </div>
    <div role="row" aria-rowindex="4">
      <!-- North row header is spanned from above; do not repeat -->
      <div role="rowheader" aria-colindex="2" id="rh-north-gadgets">Gadgets</div>
      <div role="gridcell"
           aria-colindex="3"
           headers="ch-2025 ch-2025-q1 rh-north rh-north-gadgets">
        $38,000
      </div>
      <!-- ... -->
    </div>

    <!-- Grand Total row -->
    <div role="row" aria-rowindex="25">
      <div role="rowheader"
           aria-colindex="1"
           aria-colspan="2"
           id="rh-grandtotal">
        Grand Total
      </div>
      <div role="gridcell"
           aria-colindex="3"
           headers="ch-2025 ch-2025-q1 rh-grandtotal">
        $1,245,000
      </div>
      <!-- ... -->
    </div>
  </div>
</div>
```

#### 5.3.2 Header-to-Cell Association Strategies

**Strategy A: `headers` attribute** (recommended for complex multi-level headers)

Each data cell (`role="gridcell"`) carries a `headers` attribute containing a space-separated list of IDs pointing to ALL contributing headers on both axes:

```html
<div role="gridcell"
     aria-colindex="3"
     headers="ch-2025 ch-2025-q1 rh-north rh-north-widgets">
  $45,000
</div>
```

Screen reader announces: "Revenue, 2025, Q1, North, Widgets: $45,000"

**Strategy B: `aria-labelledby`** (alternative)

```html
<div role="gridcell"
     aria-colindex="3"
     aria-labelledby="rh-north rh-north-widgets ch-2025 ch-2025-q1 cell-3-3">
  <span id="cell-3-3">$45,000</span>
</div>
```

`aria-labelledby` takes precedence over `headers` and allows explicit ordering of the label components. The cell value itself must be wrapped in an element with an ID so it can be included in the label.

**Recommendation**: Use `headers` for its semantic clarity and native table support. Use `aria-labelledby` only when the `headers` approach does not produce a coherent screen reader announcement (e.g., when header order matters for comprehension).

#### 5.3.3 Grand Total Rows and Columns

- Grand total header cells MUST contain explicit text: "Grand Total", not just styling.
- Grand total data cells use the same `headers` association, pointing to the "Grand Total" header.
- Visually distinguish grand total rows/columns (bold, background color) but do NOT rely solely on visual distinction. The text "Grand Total" in the header cell is the accessible signal.

#### 5.3.4 Dynamic Column Changes

When the user reconfigures the pivot table (adds/removes dimensions, changes aggregation), the column structure changes:

1. Set `aria-busy="true"` on the grid during reconfiguration.
2. After rendering the new structure, set `aria-busy="false"`.
3. Announce the change via `aria-live="polite"`: "Pivot table updated. Now showing Revenue by Region and Product, grouped by Quarter."
4. Move focus to the first data cell (or restore to an equivalent position if possible).
5. Update `aria-colcount` and `aria-rowcount` to reflect the new dimensions.

#### 5.3.5 Context Announcement

The `Ctrl+Arrow Up` and `Ctrl+Arrow Left` shortcuts (defined in Section 4.4) provide on-demand header announcement:

```javascript
// Pseudocode: Ctrl+Up announces contributing row headers
function announceRowHeaders(cell) {
  const headerIds = cell.getAttribute('headers').split(' ');
  const rowHeaders = headerIds
    .map(id => document.getElementById(id))
    .filter(el => el.getAttribute('role') === 'rowheader');
  const text = rowHeaders.map(h => h.textContent.trim()).join(', ');
  liveRegion.textContent = `Row headers: ${text}`;
}
```

#### 5.3.6 `aria-roledescription`

Apply `aria-roledescription="pivot table"` to the grid container. This overrides the default "grid" or "table" announcement with "pivot table", giving users immediate context about the component type. Use this sparingly; it is one of the few legitimate uses of `aria-roledescription`.

---

### 5.4 Gantt Chart

A Gantt chart is a dual-region component: a structured task list (grid) and a graphical timeline. The accessibility model must expose both regions and their relationship.

#### 5.4.1 DOM / ARIA Structure

```html
<div role="region" aria-label="Gantt Chart: Project Alpha">

  <!-- Help text for screen reader users -->
  <div id="gantt-help" class="sr-only">
    Gantt chart with two regions: a task list grid and a timeline.
    Use Tab to move between regions. In the timeline, use arrow keys to
    adjust task dates, Shift+arrows to adjust duration, and Enter to
    open the task editor.
  </div>

  <!-- Region 1: Task list grid -->
  <div role="grid"
       aria-label="Task List"
       aria-describedby="gantt-help"
       aria-rowcount="25"
       aria-colcount="5">
    <div role="rowgroup">
      <div role="row" aria-rowindex="1">
        <div role="columnheader" aria-colindex="1">Task Name</div>
        <div role="columnheader" aria-colindex="2">Assignee</div>
        <div role="columnheader" aria-colindex="3">Start</div>
        <div role="columnheader" aria-colindex="4">End</div>
        <div role="columnheader" aria-colindex="5">Progress</div>
      </div>
    </div>
    <div role="rowgroup">
      <div role="row" aria-rowindex="2" aria-expanded="true">
        <div role="gridcell" aria-colindex="1" tabindex="0">
          Design Phase
        </div>
        <div role="gridcell" aria-colindex="2" tabindex="-1">Team A</div>
        <div role="gridcell" aria-colindex="3" tabindex="-1">Jan 5</div>
        <div role="gridcell" aria-colindex="4" tabindex="-1">Jan 20</div>
        <div role="gridcell" aria-colindex="5" tabindex="-1">75%</div>
      </div>
      <!-- child tasks when expanded -->
    </div>
  </div>

  <!-- Region 2: Timeline (application mode) -->
  <div role="application"
       aria-label="Timeline"
       aria-describedby="gantt-help"
       aria-roledescription="timeline">

    <!-- Current date marker -->
    <div aria-current="date" class="today-marker" aria-label="Today: March 16, 2026">
    </div>

    <!-- Task bar -->
    <div role="img"
         tabindex="0"
         aria-label="Task: Design Phase, January 5 to January 20, 75% complete, assigned to Team A"
         aria-describedby="dep-design"
         aria-roledescription="task bar"
         id="bar-design">
      <div role="progressbar"
           aria-valuenow="75"
           aria-valuemin="0"
           aria-valuemax="100"
           aria-label="Progress: 75%">
      </div>
    </div>

    <!-- Dependency description (hidden, referenced by aria-describedby) -->
    <div id="dep-design" class="sr-only">
      Depends on: Requirements Gathering. Blocks: Development Phase.
    </div>

    <!-- Milestone -->
    <div role="img"
         tabindex="-1"
         aria-label="Milestone: Design Review, January 20"
         aria-roledescription="milestone"
         id="bar-milestone-1">
    </div>

    <!-- Summary task (expandable) -->
    <div role="img"
         tabindex="-1"
         aria-label="Summary: Phase 1, January 5 to February 28, 3 subtasks"
         aria-expanded="true"
         aria-owns="bar-design bar-dev bar-testing"
         aria-roledescription="summary task">
    </div>
  </div>

  <!-- Live region for announcements -->
  <div aria-live="polite" class="sr-only" id="gantt-live"></div>
</div>
```

#### 5.4.2 CAUTION: `role="application"`

`role="application"` disables the screen reader's virtual/browse mode shortcuts (e.g., `H` for next heading, `T` for next table). Apply it ONLY to the timeline region, NEVER to the entire Gantt chart or the task list grid.

Mitigations:
1. Provide a keyboard help mechanism (described in `aria-describedby` pointing to help text).
2. Ensure all functionality within the application region is operable via the documented keyboard shortcuts.
3. Provide an alternative tabular view of the same data (the task list grid) that does NOT use `role="application"`.

#### 5.4.3 Task Bar Accessibility

Each task bar MUST expose:

| Information | ARIA Mechanism | Example |
|---|---|---|
| Task name | `aria-label` (first component) | "Task: Design Phase" |
| Date range | `aria-label` (continued) | "January 5 to January 20" |
| Completion percentage | Nested `role="progressbar"` with `aria-valuenow` | `aria-valuenow="75"` |
| Assignee | `aria-label` (continued) | "assigned to Team A" |
| Dependencies | `aria-describedby` pointing to hidden text | "Depends on: Requirements Gathering" |
| Task type | `aria-roledescription` | `"task bar"`, `"milestone"`, `"summary task"` |

#### 5.4.4 Dependencies

Dependencies between tasks (finish-to-start, start-to-start, etc.) are visually represented as arrows. These MUST be exposed textually:

```html
<!-- Hidden dependency text -->
<div id="dep-development" class="sr-only">
  Depends on: Design Phase (finish-to-start).
  Blocks: Testing Phase (finish-to-start), Deployment (finish-to-start).
</div>

<div role="img"
     tabindex="-1"
     aria-label="Task: Development Phase, January 21 to March 15, 40% complete"
     aria-describedby="dep-development">
</div>
```

The `Ctrl+Arrow Right` / `Ctrl+Arrow Left` shortcuts (Section 4.3) allow keyboard users to jump between dependent tasks, mimicking the visual arrow-following experience.

#### 5.4.5 Critical Path

When the critical path is highlighted visually, announce it via a live region when it changes:

```javascript
// When critical path is recalculated
liveRegion.textContent = "Critical path updated: Requirements → Design → Development → Testing. Total duration: 85 days.";
```

Additionally, critical path tasks SHOULD have a distinguishing attribute:

```html
<div role="img"
     tabindex="-1"
     aria-label="Task: Development Phase (critical path), January 21 to March 15"
     class="critical-path">
</div>
```

#### 5.4.6 Scale Changes

When the user zooms in or out (`+`/`-` keys), announce the new scale:

```javascript
liveRegion.textContent = "Timeline scale changed to weeks. Showing January 2026 to June 2026.";
```

#### 5.4.7 `aria-current="date"`

The "today" marker on the timeline uses `aria-current="date"` to indicate the current date position. This is the correct token value per the ARIA specification --- `aria-current` accepts `"page"`, `"step"`, `"location"`, `"date"`, `"time"`, and `"true"`.

---

### 5.5 Spreadsheet Grid

A spreadsheet grid extends the data grid with cell addressing, formula evaluation, multi-sheet navigation, and range operations. The primary accessibility additions are the address bar, formula bar, and sheet tabs.

#### 5.5.1 DOM / ARIA Structure

```html
<div role="region" aria-label="Spreadsheet: Budget 2026">

  <!-- Address bar -->
  <div role="status" aria-live="polite" id="address-bar">
    <label for="address-input" class="sr-only">Cell address</label>
    <input type="text"
           id="address-input"
           role="combobox"
           aria-label="Cell address"
           aria-expanded="false"
           aria-autocomplete="list"
           value="A1" />
  </div>

  <!-- Formula bar -->
  <div role="region" aria-label="Formula Bar" aria-live="polite" id="formula-bar-region">
    <label for="formula-input" class="sr-only">Formula</label>
    <input type="text"
           id="formula-input"
           role="textbox"
           aria-label="Formula Bar"
           value="" />
  </div>

  <!-- Grid -->
  <div role="grid"
       aria-label="Sheet 1"
       aria-rowcount="1048576"
       aria-colcount="16384"
       aria-describedby="spreadsheet-help">
    <div role="rowgroup">
      <div role="row" aria-rowindex="1">
        <div role="columnheader" aria-colindex="2" id="col-A">A</div>
        <div role="columnheader" aria-colindex="3" id="col-B">B</div>
        <div role="columnheader" aria-colindex="4" id="col-C">C</div>
        <!-- ... -->
      </div>
    </div>
    <div role="rowgroup">
      <div role="row" aria-rowindex="2">
        <div role="rowheader" aria-colindex="1" id="row-1">1</div>
        <div role="gridcell"
             aria-colindex="2"
             aria-label="Cell A1: Revenue"
             tabindex="0"
             id="cell-A1">
          Revenue
        </div>
        <div role="gridcell"
             aria-colindex="3"
             aria-label="Cell B1: 55"
             tabindex="-1"
             id="cell-B1">
          55
        </div>
        <div role="gridcell"
             aria-colindex="4"
             aria-label="Cell C1"
             tabindex="-1"
             aria-readonly="true"
             id="cell-C1">
        </div>
      </div>
      <div role="row" aria-rowindex="3">
        <div role="rowheader" aria-colindex="1" id="row-2">2</div>
        <div role="gridcell"
             aria-colindex="2"
             aria-label="Cell A2: Expenses"
             tabindex="-1"
             id="cell-A2">
          Expenses
        </div>
        <div role="gridcell"
             aria-colindex="3"
             aria-label="Cell B2: 42"
             tabindex="-1"
             id="cell-B2">
          42
        </div>
        <div role="gridcell"
             aria-colindex="4"
             aria-label="Cell C2: =B1-B2"
             tabindex="-1"
             id="cell-C2">
          13
          <!-- Displays calculated value; formula shown in formula bar -->
        </div>
      </div>
    </div>
  </div>

  <!-- Sheet tabs -->
  <div role="tablist" aria-label="Sheets">
    <div role="tab" aria-selected="true" tabindex="0" id="tab-sheet1">
      Sheet 1
    </div>
    <div role="tab" aria-selected="false" tabindex="-1" id="tab-sheet2">
      Sheet 2
    </div>
    <div role="tab" aria-selected="false" tabindex="-1" id="tab-sheet3">
      Summary
    </div>
  </div>

  <!-- Help text -->
  <div id="spreadsheet-help" class="sr-only">
    Spreadsheet grid. Use arrow keys to navigate cells. Press F2 or type to
    edit. Press Escape to cancel. Use Ctrl+G to go to a cell address. Formula
    bar shows the formula for the selected cell.
  </div>

  <!-- Live region for announcements -->
  <div aria-live="polite" class="sr-only" id="spreadsheet-live"></div>
</div>
```

#### 5.5.2 Address Bar

| Aspect | Implementation |
|---|---|
| Role | `role="status"` container with `aria-live="polite"` wrapping a text input |
| Update trigger | Every time cell focus changes, update the input value (e.g., "B14") |
| User input | User can type a cell address and press Enter to navigate. Supports named ranges. |
| Autocomplete | When the input has `role="combobox"` with `aria-autocomplete="list"`, named ranges appear in a popup listbox. |
| Announcement | Because the container is `aria-live="polite"`, screen readers announce the address on focus change. Guard against excessive verbosity --- debounce rapid arrow key navigation so only the final address is announced. |

#### 5.5.3 Formula Bar

| Aspect | Implementation |
|---|---|
| Role | `role="textbox"` with `aria-label="Formula Bar"` inside an `aria-live="polite"` region |
| Content | Shows the formula of the focused cell (e.g., `=SUM(A1:A10)`). If the cell has no formula, shows the raw value. |
| Editing | When the user enters Edit Mode (F2 or typing), focus can optionally move to the formula bar. Changes in the formula bar are mirrored in the cell and vice versa. |
| Cell display | The cell always shows the calculated value (e.g., `55`), not the formula. The formula is ONLY shown in the formula bar. |
| Screen reader | "Formula Bar: =SUM(A1:A10)" when the formula bar region updates. |

#### 5.5.4 Cell Labels

Each cell MUST have an accessible label that includes the cell address:

```html
<!-- Cell with content -->
<div role="gridcell" aria-label="Cell A1: Revenue">Revenue</div>

<!-- Empty cell -->
<div role="gridcell" aria-label="Cell C5"><!-- empty --></div>

<!-- Cell with formula (shows calculated value) -->
<div role="gridcell" aria-label="Cell C2: 13">13</div>
```

The pattern `"Cell [address]: [value]"` ensures screen reader users always know their position, even in a virtualized grid where column/row headers may not be in the DOM.

#### 5.5.5 Named Ranges

The Go To dialog (`Ctrl+G` / `F5`) provides access to named ranges:

```html
<div role="dialog" aria-label="Go To" aria-modal="true">
  <label for="goto-input">Cell address or named range:</label>
  <input type="text" id="goto-input" value="" />
  <div role="listbox" aria-label="Named ranges" id="goto-ranges">
    <div role="option" id="range-revenue">Revenue (B1:B12)</div>
    <div role="option" id="range-expenses">Expenses (C1:C12)</div>
    <div role="option" id="range-summary">Summary (A1:D5 on Sheet 3)</div>
  </div>
  <button type="button">Go</button>
  <button type="button">Cancel</button>
</div>
```

On Cancel or Escape, focus returns to the cell that was focused when the dialog was opened. On confirmation ("Go"), focus moves to the target cell specified by the address or named range.

#### 5.5.6 Multi-Sheet Navigation

Sheets are represented as a `role="tablist"` with `role="tab"` elements:

- `Arrow Left` / `Arrow Right`: move between tabs.
- `Enter` or `Space`: activate the tab (switch to that sheet).
- `aria-selected="true"` on the active sheet tab.
- When switching sheets, the grid content updates. Announce "Switched to Sheet 2" via the live region.
- The grid's `aria-label` updates to reflect the current sheet name.

#### 5.5.7 Auto-Fill and Clipboard Announcements

| Action | Announcement (via live region) |
|---|---|
| `Ctrl+D` (fill down) | "Filled down 5 cells with value: Revenue" |
| `Ctrl+R` (fill right) | "Filled right 3 cells with formula: =SUM(A1:A10)" |
| `Ctrl+C` (copy) | "Copied 3 by 2 range: A1 to B3" |
| `Ctrl+V` (paste) | "Pasted 3 by 2 range starting at D1" |
| `Ctrl+Z` (undo) | "Undone: paste at D1" |

For undo and redo patterns (Ctrl+Z, Ctrl+Y), see Section 6.13.

---

### 5.6 Master-Detail Grid

A master-detail grid extends the data grid by allowing individual rows to expand into a subordinate detail panel. The detail panel can contain forms, nested grids, charts, or arbitrary content.

#### 5.6.1 DOM / ARIA Structure

```html
<div role="grid"
     aria-label="Orders"
     aria-rowcount="200"
     aria-colcount="6">
  <div role="rowgroup">
    <div role="row" aria-rowindex="1">
      <div role="columnheader" aria-colindex="1">Order ID</div>
      <div role="columnheader" aria-colindex="2">Customer</div>
      <div role="columnheader" aria-colindex="3">Date</div>
      <div role="columnheader" aria-colindex="4">Total</div>
      <div role="columnheader" aria-colindex="5">Status</div>
      <div role="columnheader" aria-colindex="6">Details</div>
    </div>
  </div>
  <div role="rowgroup">
    <!-- Master row: collapsed -->
    <div role="row"
         aria-rowindex="2"
         aria-expanded="false"
         aria-selected="false"
         aria-controls="detail-1001"
         id="master-row-1001">
      <div role="gridcell" aria-colindex="1" tabindex="0">#1001</div>
      <div role="gridcell" aria-colindex="2" tabindex="-1">Acme Corp</div>
      <div role="gridcell" aria-colindex="3" tabindex="-1">2026-03-10</div>
      <div role="gridcell" aria-colindex="4" tabindex="-1">$12,450</div>
      <div role="gridcell" aria-colindex="5" tabindex="-1">Shipped</div>
      <div role="gridcell" aria-colindex="6" tabindex="-1">
        <button aria-label="Toggle details for order 1001"
                aria-expanded="false"
                aria-controls="detail-1001">
          Expand
        </button>
      </div>
    </div>

    <!-- Master row: expanded -->
    <div role="row"
         aria-rowindex="3"
         aria-expanded="true"
         aria-selected="false"
         aria-controls="detail-1002"
         id="master-row-1002">
      <div role="gridcell" aria-colindex="1" tabindex="-1">#1002</div>
      <div role="gridcell" aria-colindex="2" tabindex="-1">Globex Inc</div>
      <div role="gridcell" aria-colindex="3" tabindex="-1">2026-03-12</div>
      <div role="gridcell" aria-colindex="4" tabindex="-1">$8,200</div>
      <div role="gridcell" aria-colindex="5" tabindex="-1">Processing</div>
      <div role="gridcell" aria-colindex="6" tabindex="-1">
        <button aria-label="Toggle details for order 1002"
                aria-expanded="true"
                aria-controls="detail-1002">
          Collapse
        </button>
      </div>
    </div>

    <!-- Detail panel for order 1002 -->
    <div role="row" aria-rowindex="4">
      <div role="gridcell" aria-colindex="1" aria-colspan="6">
        <div role="region"
             aria-label="Details for order #1002"
             id="detail-1002"
             tabindex="-1">

          <!-- Detail content: could be a form -->
          <h3 id="detail-1002-heading">Order #1002 Details</h3>
          <dl>
            <dt>Shipping Address</dt>
            <dd>742 Evergreen Terrace, Springfield</dd>
            <dt>Payment Method</dt>
            <dd>Corporate Account</dd>
          </dl>

          <!-- Detail content: nested grid -->
          <div role="grid"
               aria-label="Line items for order #1002"
               aria-rowcount="4"
               aria-colcount="4">
            <div role="rowgroup">
              <div role="row" aria-rowindex="1">
                <div role="columnheader" aria-colindex="1">Product</div>
                <div role="columnheader" aria-colindex="2">Quantity</div>
                <div role="columnheader" aria-colindex="3">Unit Price</div>
                <div role="columnheader" aria-colindex="4">Subtotal</div>
              </div>
            </div>
            <div role="rowgroup">
              <div role="row" aria-rowindex="2">
                <div role="gridcell" aria-colindex="1" tabindex="-1">Widget A</div>
                <div role="gridcell" aria-colindex="2" tabindex="-1">50</div>
                <div role="gridcell" aria-colindex="3" tabindex="-1">$100</div>
                <div role="gridcell" aria-colindex="4" tabindex="-1">$5,000</div>
              </div>
              <div role="row" aria-rowindex="3">
                <div role="gridcell" aria-colindex="1" tabindex="-1">Gadget B</div>
                <div role="gridcell" aria-colindex="2" tabindex="-1">20</div>
                <div role="gridcell" aria-colindex="3" tabindex="-1">$160</div>
                <div role="gridcell" aria-colindex="4" tabindex="-1">$3,200</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Next master row -->
    <div role="row"
         aria-rowindex="5"
         aria-expanded="false"
         aria-selected="false"
         aria-controls="detail-1003"
         id="master-row-1003">
      <div role="gridcell" aria-colindex="1" tabindex="-1">#1003</div>
      <!-- ... -->
    </div>
  </div>
</div>
```

#### 5.6.2 Key ARIA Attributes

**Master row**:

| Attribute | Purpose |
|---|---|
| `aria-expanded` | `"true"` when detail panel is visible, `"false"` when collapsed. Present on every expandable master row. |
| `aria-controls` | Points to the ID of the detail panel region. Establishes the programmatic relationship between the row and its detail. |

**Detail panel**:

| Attribute | Purpose |
|---|---|
| `role="region"` | Declares the detail panel as a landmark region, making it navigable via screen reader landmark shortcuts. |
| `aria-label` | Provides context: "Details for order #1002". MUST include the identifier of the parent row so the user knows which row's details are displayed. |
| `id` | The unique identifier referenced by the master row's `aria-controls`. |
| `tabindex="-1"` | Makes the region programmatically focusable (for Option B focus management) without adding it to the natural tab order. |

**Expand/collapse button** (within the master row):

| Attribute | Purpose |
|---|---|
| `aria-expanded` | Mirrors the master row's `aria-expanded` state. |
| `aria-controls` | Points to the same detail panel ID. |
| `aria-label` | "Toggle details for order 1001" --- provides context when the button text alone ("Expand"/"Collapse") is insufficient. |

#### 5.6.3 Focus Management

**Option A (recommended): Focus stays on parent row**

When the user expands a detail panel (via `Enter` on the master row or the expand button):

1. `aria-expanded` transitions to `"true"`.
2. The detail panel DOM is inserted or made visible.
3. Focus STAYS on the master row (or the expand button within it).
4. The user presses `Tab` to enter the detail panel. Focus moves to the first focusable element within the detail region.
5. Within the detail panel, `Tab` / `Shift+Tab` follow normal tab order.
6. `Shift+Tab` from the first element in the detail panel returns focus to the master row.
7. `Escape` collapses the detail panel and returns focus to the master row.

**Option B: Focus moves into detail panel**

When the user expands a detail panel:

1. `aria-expanded` transitions to `"true"`.
2. The detail panel DOM is inserted or made visible.
3. Focus moves to the detail region element (which has `tabindex="-1"`) or to the first focusable element within it.
4. `Escape` collapses the detail panel and returns focus to the master row.

**Consistency mandate**: The implementation MUST use the same option for ALL master-detail interactions within the grid. Inconsistent behavior is a usability best practice violation that creates confusion for keyboard and screen reader users. Note: SC 3.2.4 (Consistent Identification) applies to consistent labeling of components with the same functionality, and SC 3.2.6 (Consistent Help) applies to help mechanisms appearing in consistent locations across pages — neither directly governs focus behavior consistency within a widget, but the principle of predictable interaction is essential for accessibility.

#### 5.6.4 Collapse Behavior

When a detail panel is collapsed:

1. If focus is inside the detail panel: move focus to the master row BEFORE hiding the detail content.
2. Set `aria-expanded="false"` on both the master row and the expand button.
3. Remove the detail panel from the DOM or hide it with `display: none`. The detail content MUST NOT remain focusable after collapse.
4. Announce "Details collapsed" via a live region if no screen reader state change announcement is sufficient.

```javascript
// Pseudocode: collapse detail panel
function collapseDetail(masterRow) {
  const detailId = masterRow.getAttribute('aria-controls');
  const detailPanel = document.getElementById(detailId);

  // Move focus out of detail panel if it is inside
  if (detailPanel.contains(document.activeElement)) {
    masterRow.querySelector('[tabindex]').focus();
  }

  masterRow.setAttribute('aria-expanded', 'false');
  const toggleBtn = masterRow.querySelector('button[aria-controls]');
  if (toggleBtn) {
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.textContent = 'Expand';
  }

  detailPanel.hidden = true;
}
```

#### 5.6.5 Nested Grid Navigation

When the detail panel contains a nested grid (`role="grid"` with its own `aria-label`):

1. `Tab` from the master grid enters the detail panel. Further `Tab` presses reach the nested grid.
2. Once inside the nested grid, all standard grid keyboard interactions (Section 4.1) apply within that nested grid's scope.
3. `Escape` from Navigation Mode within the nested grid (no edit active, no selection) collapses the detail panel and returns focus to the parent row. Alternatively, `Shift+Tab` exits the nested grid to the detail panel region without collapsing it.
4. If `Escape` is pressed during Edit Mode within the nested grid, it first returns to Navigation Mode within the nested grid (standard behavior per Section 4.1). A subsequent `Escape` then collapses the detail panel and returns focus to the master row.
5. The nested grid MUST have its own `aria-label` (e.g., "Line items for order #1002") to distinguish it from the parent grid.

> **AAA note**: Deeply nested grids (grid within detail within grid) create cognitive complexity. Limit nesting to one level when possible. If deeper nesting is required, provide a breadcrumb-style status region announcing the current nesting context: "Master grid > Order #1002 > Line items grid".

#### 5.6.6 Differences from Base Data Grid

| Aspect | Base Data Grid | Master-Detail Grid |
|---|---|---|
| `aria-expanded` on rows | Not used (unless grouped) | Present on every expandable master row |
| `aria-controls` on rows | Not used | Points to detail panel ID |
| Detail panel | N/A | `role="region"` with contextual `aria-label` |
| Tab behavior | Exits the grid | Enters detail panel, then exits grid |
| Escape behavior | Cancel edit / deselect | Collapse detail / exit nested grid |
| `aria-rowindex` | Continuous | Must account for detail panel rows occupying index positions |
| Nested grid | N/A | Fully independent grid with own label and keyboard scope |

---

*End of Sections 4 and 5.*

---

# Tabular Grid Variants — Accessibility Modeling Document

## Section 6 — Cross-Cutting Feature Accessibility Patterns

The patterns in this section apply uniformly across **all** grid variants: data grid, tree grid, pivot table, Gantt chart, spreadsheet, and master-detail. Each pattern specifies the required ARIA attributes, keyboard interactions, expected screen reader announcements, and the WCAG 2.2 AAA success criteria addressed.

> **Notation conventions.**
> - `SR:` prefixes denote the expected screen reader announcement text.
> - Keyboard shortcuts use the standard modifier notation (`Ctrl`, `Shift`, `Alt`). On macOS, `Ctrl` maps to `Cmd` unless stated otherwise.
> - All `aria-live` regions referenced below **must** exist in the DOM at page load (even if initially empty). Dynamically injected live regions are unreliable across assistive technology combinations.

---

### 6.1 Selection

Selection is the most polymorphic pattern in a grid. Six sub-patterns exist, each with distinct ARIA semantics.

#### 6.1.1 Single Row Selection

| Aspect | Specification |
|---|---|
| **ARIA on grid** | No special attribute (absence of `aria-multiselectable` implies single selection). |
| **ARIA on row** | `aria-selected="true"` on the selected `role="row"`. All other rows carry `aria-selected="false"`. |
| **Keyboard** | `Space` on the focused row toggles selection. `Enter` activates cell content or starts editing (per Section 4.1), not selection. Arrow keys move focus without selecting (focus and selection are independent). |
| **Screen reader** | SR: "Row 3 of 500, Alice, selected." The "selected" state is conveyed automatically by the `aria-selected` attribute. |
| **Constraint** | Exactly one row carries `aria-selected="true"` at any time. Setting a new row to `true` must simultaneously set the previous row to `false`. |

#### 6.1.2 Multi-Row Selection

| Aspect | Specification |
|---|---|
| **ARIA on grid** | `aria-multiselectable="true"` on the `role="grid"` element. |
| **ARIA on rows** | `aria-selected="true"` on every selected row; `aria-selected="false"` on unselected rows. |
| **Keyboard** | `Shift+Arrow Down/Up` — extend contiguous selection range from the anchor row. `Shift+Space` — toggle selection on the focused row without affecting other selected rows. `Ctrl+Space` — select the entire column containing the focused cell. `Ctrl+A` — select all rows. `Escape` — deselect all. |
| **Screen reader** | SR (after range extend): "Rows 3 through 7 selected, 5 rows total." SR (after toggle): "Row 12, selected" or "Row 12, not selected." |
| **Announcement** | Use an `aria-live="polite"` status region outside the grid to announce cumulative selection count: "5 rows selected." |

#### 6.1.3 Checkbox Column Selection

| Aspect | Specification |
|---|---|
| **Header checkbox** | Inside the first `role="columnheader"`: `<div role="checkbox" aria-checked="false" aria-label="Select all rows" tabindex="-1">`. The checkbox uses `tabindex="-1"` because the grid cell is the single tab entry point (roving tabindex pattern); the checkbox is reachable via Enter/Space when the cell is focused. When some but not all rows are selected: `aria-checked="mixed"`. |
| **Row checkbox** | Inside the first `role="gridcell"` of each row: `<div role="checkbox" aria-checked="true|false" aria-label="Select row: [row identifier]" tabindex="-1">`. |
| **Row state** | The parent `role="row"` **simultaneously** carries `aria-selected="true"` when its checkbox is checked. Both the checkbox state and row selection state must remain synchronized. |
| **Keyboard** | `Space` on the focused checkbox toggles it. When the header checkbox is toggled, all row checkboxes update and the grid announces the result via live region. |
| **Screen reader** | SR (header toggle to checked): "Select all rows, checked. 500 rows selected." SR (header partial): "Select all rows, mixed. 12 of 500 rows selected." SR (row toggle): "Select row: Alice, checked." |

#### 6.1.4 Cell Selection

| Aspect | Specification |
|---|---|
| **ARIA on cell** | `aria-selected="true"` on the focused `role="gridcell"`. Other cells carry `aria-selected="false"`. |
| **Grid attribute** | If multi-cell selection is supported, add `aria-multiselectable="true"` on the grid. |
| **Keyboard** | `Enter` or click to select the focused cell. Arrow keys move focus between cells. |
| **Screen reader** | SR: "Cell B3, Revenue, 45000, selected." The column header and row context should be conveyed by the grid's header association. |

#### 6.1.5 Range Selection (Excel-like)

| Aspect | Specification |
|---|---|
| **ARIA on grid** | `aria-multiselectable="true"`. |
| **ARIA on cells** | `aria-selected="true"` on every cell within the selected range. |
| **Keyboard** | `Shift+Arrow keys` — extend the selection range from the anchor cell. `Ctrl+Shift+End` — extend to last cell. `Ctrl+Shift+Home` — extend to first cell. |
| **Live region** | After range change, announce via `aria-live="polite"`: SR: "Selected range A1 through C5, 3 columns by 5 rows, 15 cells." |
| **Visual** | Highlighted background on selected cells with a visible border on the range boundary. The selection indication must not rely on color alone (see WCAG 1.4.1). |

#### 6.1.6 Fill Handle

| Aspect | Specification |
|---|---|
| **Fill handle element** | A small draggable control at the bottom-right corner of the selected cell or range. Must have `role="button"` with `aria-label="Fill handle. Drag to fill adjacent cells."` and meet the minimum 24x24 CSS pixel target size (SC 2.5.8). |
| **Keyboard alternative** | `Ctrl+D` — fill down (copies the value from the top cell of the selection into all cells below it within the selection). `Ctrl+R` — fill right (copies the value from the leftmost cell into all cells to its right within the selection). |
| **Live region** | SR: "Filled 5 cells downward with value 42." SR (series): "Filled range B2 through B10 with series 1, 2, 3, ..., 9." |
| **Undo** | Fill operations must be undoable via `Ctrl+Z`. Announce: "Fill undone. 5 cells restored." |

#### WCAG Criteria Addressed

| Criterion | Relevance |
|---|---|
| **1.4.1 Use of Color** | Selection state must not be communicated by color alone. A visible border, icon, or bold text must supplement the color highlight. |
| **1.4.11 Non-text Contrast** | The visual boundary between selected and unselected cells/rows must achieve at least 3:1 contrast ratio against adjacent unselected state. |
| **4.1.3 Status Messages** | Cumulative selection counts and range descriptions are status messages that must reach assistive technology without receiving focus. |

---

### 6.2 Sorting

| Aspect | Specification |
|---|---|
| **ARIA on column header** | `aria-sort="ascending"`, `aria-sort="descending"`, or `aria-sort="none"` on the `role="columnheader"` element. **Never** place `aria-sort` on a `role="gridcell"`. Only one column carries a non-`none` value in single-sort mode. |
| **Tri-state cycle** | First activation: ascending. Second: descending. Third: none (sort removed). |
| **Keyboard** | `Enter` or `Space` on the focused column header advances the sort cycle. |
| **Multi-column sort** | `Ctrl+Enter` (or `Ctrl+Click`) adds the column to the existing sort chain without replacing it. Each sorted column header carries its own `aria-sort` value. A visual priority number (1, 2, 3) appears alongside the sort arrow. |
| **Sort indicator icon** | The directional arrow icon must carry `aria-hidden="true"` because `aria-sort` already communicates the state to assistive technology. The priority number is part of the column header's accessible name: `aria-label="Revenue, sorted descending, sort priority 2"`. |
| **Live region** | After sort completes, announce via `aria-live="polite"`: SR: "Name column sorted ascending." SR (multi): "Revenue column sorted descending, priority 2 of 3." SR (removed): "Sort removed from Name column." |
| **Focus after sort** | Focus remains on the column header that was activated. The grid content re-renders beneath it. |

#### WCAG Criteria Addressed

| Criterion | Relevance |
|---|---|
| **1.1.1 Non-text Content** | The sort arrow icon has a text alternative via `aria-sort` on the header; `aria-hidden="true"` on the icon prevents double-announcement. |
| **1.4.1 Use of Color** | Sort indication must include a directional arrow (shape), not only a color change. |
| **4.1.3 Status Messages** | Sort state changes are status messages announced without moving focus. |

---

### 6.3 Filtering

| Aspect | Specification |
|---|---|
| **Column filter trigger** | A button inside or adjacent to the column header: `<button aria-label="Filter: Name column" aria-haspopup="dialog">`. If the filter UI is a simple dropdown list, use `aria-haspopup="listbox"` instead. |
| **Filter dialog** | `role="dialog"` with `aria-label="Filter: Column Name"` and `aria-modal="true"`. Contains filter controls (text inputs, checkboxes, date pickers, etc.). |
| **Focus management** | On open: focus moves to the first interactive element inside the dialog. Focus is trapped within the dialog. On close (`Escape` or explicit Cancel/Apply button): focus returns to the column header filter button. |
| **Applied filter indicator** | Visual: filter icon changes state (filled vs outline). ARIA: the column header's `aria-label` is updated to include the filter state — `aria-label="Name, filtered"` or more specifically `aria-label="Name, filtered: contains 'Al'"`. |
| **Result announcement** | Via `role="status"` live region: SR: "Filtered to 15 of 200 rows." If no results: "No rows match the current filter." |
| **Global search** | `<input role="searchbox" aria-label="Search all columns" type="search">`. Results announced via live region: SR: "8 rows match 'engineering'." Provide a debounce of at least 300ms before announcing to avoid overwhelming screen readers during typing. |
| **Filter removal** | Clear button inside the filter UI: `<button aria-label="Clear filter for Name column">`. After clearing: SR: "Filter removed from Name column. Showing all 200 rows." |

#### WCAG Criteria Addressed

| Criterion | Relevance |
|---|---|
| **2.1.1 Keyboard** | All filter operations are fully keyboard accessible. |
| **3.2.2 On Input** | Filters require an explicit action (Apply button or Enter key) to take effect. Auto-filtering on each keystroke violates this criterion because it changes context without explicit user request. If auto-filtering is implemented, it must be clearly labeled and predictable. |
| **4.1.3 Status Messages** | Filter result counts are status messages. |

---

### 6.4 Column and Row Resize

| Aspect | Specification |
|---|---|
| **Resize handle element** | `role="separator"` with `aria-orientation="vertical"` for column resize handles and `aria-orientation="horizontal"` for row resize handles. |
| **Value attributes** | `aria-valuenow="150"` (current width/height in pixels), `aria-valuemin="50"` (minimum), `aria-valuemax="800"` (maximum). Update `aria-valuenow` in real time during keyboard resize. |
| **Accessible name** | `aria-label="Resize Name column"` (or `"Resize row 5"`). |
| **Keyboard** | Focus the separator with `Tab`. `Left/Right Arrow` (columns) or `Up/Down Arrow` (rows) adjusts size by a small increment (e.g., 10px). `Shift+Arrow` adjusts by a large increment (e.g., 50px). `Home` sets to minimum. `End` sets to maximum. `Escape` cancels and restores the previous size. |
| **Non-drag alternative** | Context menu on column header includes "Resize Column..." which opens a dialog with a numeric text input: `<input type="number" aria-label="Width in pixels for Name column" min="50" max="800">`. |
| **Target size** | The resize handle hit area must be at least 24x24 CSS pixels (WCAG 2.5.8, AA). For AAA conformance (SC 2.5.5), use 44x44 CSS pixels. The visual handle may be narrower, but the interactive hit area must meet the target. |
| **Live region** | SR: "Name column resized to 200 pixels." Announce only on completion (key up or drag end), not during continuous adjustment. |

#### WCAG Criteria Addressed

| Criterion | Relevance |
|---|---|
| **2.1.1 Keyboard** | Full keyboard-based resize without requiring pointer drag. |
| **2.5.7 Dragging Movements** | A non-drag alternative (dialog with text input) is provided. |
| **2.5.8 Target Size (Minimum)** | 24x24px minimum hit area; 44x44px for AAA. |
| **2.5.5 Target Size (Enhanced)** | 44x44px target for AAA conformance. |

---

### 6.5 Column and Row Reorder (Drag-and-Drop)

| Aspect | Specification |
|---|---|
| **Drag handle** | `role="button"` with `aria-roledescription="drag handle"` and `aria-label="Reorder Name column"`. Placed inside or adjacent to the column header. |
| **Keyboard alternative (direct)** | `Ctrl+Shift+Left Arrow` / `Ctrl+Shift+Right Arrow` — moves the focused column one position left or right. `Ctrl+Shift+Up Arrow` / `Ctrl+Shift+Down Arrow` — moves the focused row one position up or down. |
| **Keyboard alternative (menu)** | Column header context menu includes: "Move Left", "Move Right", "Move to Position..." (opens dialog with numeric input or listbox of positions). |
| **During drag (pointer)** | The grabbed element receives `aria-roledescription="dragging"`. Do **not** use the deprecated `aria-grabbed` attribute (removed in WAI-ARIA 1.2). A live region announces: SR: "Grabbed Name column. Current position: 2 of 8. Use arrow keys or drop on target." |
| **Drop feedback** | Visual: insertion indicator line at the drop target. Live region: SR: "Name column moved to position 5 of 8." |
| **Cancellation** | `Escape` during drag: element returns to original position. SR: "Reorder cancelled. Name column returned to position 2 of 8." |
| **Post-reorder focus** | Focus follows the moved column/row to its new position. |
| **Column index update** | After reorder, all `aria-colindex` values must be recalculated to reflect the new order. |

#### WCAG Criteria Addressed

| Criterion | Relevance |
|---|---|
| **2.5.7 Dragging Movements** | Keyboard and menu-based alternatives are provided for all drag operations. |
| **2.5.2 Pointer Cancellation** | Drag can be cancelled by releasing outside a valid target or pressing Escape. The drop does not execute on `pointerdown` — only on `pointerup` over a valid target. |
| **2.1.1 Keyboard** | All reorder operations have keyboard equivalents. |

---

### 6.6 Context Menus

| Aspect | Specification |
|---|---|
| **Trigger** | `Shift+F10` or the `Applications` (context menu) key opens the context menu for the focused cell, row, or column header. Alternatively, a visible button within the cell or header can serve as trigger: `<button aria-haspopup="menu" aria-label="Actions for Name column">`. |
| **Menu structure** | `role="menu"` on the container. `role="menuitem"` for standard items. `role="menuitemcheckbox"` for toggleable items (e.g., "Show Gridlines"). `role="menuitemradio"` for mutually exclusive items. `role="separator"` between logical groups. |
| **Accessible name** | `aria-label` on the menu: "Context menu for row 5" or "Context menu for Name column header". |
| **Keyboard** | `Arrow Down/Up` — navigate between menu items. `Enter` or `Space` — activate the focused item. `Escape` — close the menu. `Arrow Right` — open a submenu (if present). `Arrow Left` — close a submenu and return to parent. `Home/End` — jump to first/last item. First-character navigation: typing a letter moves to the next item starting with that letter. |
| **Focus management** | On open: focus moves to the first `menuitem`. On close: focus returns to the triggering cell, row, or button element. |
| **Disabled items** | Use `aria-disabled="true"` on unavailable items. Do **not** remove them from the DOM — their presence maintains menu structure predictability. Disabled items are still focusable (to allow discovery) but do not activate on `Enter`/`Space`. |
| **Submenus** | Parent item: `aria-haspopup="menu"` and `aria-expanded="false|true"`. Submenu: `role="menu"` nested or referenced via `aria-controls`. |

#### WCAG Criteria Addressed

| Criterion | Relevance |
|---|---|
| **2.1.1 Keyboard** | All menu operations are keyboard accessible. |
| **2.4.3 Focus Order** | Focus moves into the menu on open and returns to the trigger on close, maintaining logical focus order. |
| **2.4.7 Focus Visible** | Focused menu items must have a visible focus indicator meeting 3:1 contrast. |

---

### 6.7 Tooltips and Hover Content

| Aspect | Specification |
|---|---|
| **Tooltip element** | `role="tooltip"` on the tooltip container. Unique `id` attribute for association. |
| **Association** | The trigger element uses `aria-describedby="[tooltip-id]"` to associate the tooltip as supplementary description. If the tooltip provides the **primary** label (e.g., icon-only buttons), use `aria-labelledby` instead. |
| **Appearance trigger** | Pointer: tooltip appears on `mouseenter` of the trigger element. Keyboard: tooltip appears when the trigger element receives focus. |
| **WCAG 1.4.13 — Content on Hover or Focus** | Three mandatory behaviors: |
| | **1. Dismissible:** `Escape` key hides the tooltip without moving focus. |
| | **2. Hoverable:** When the tooltip is visible, the user can move the pointer from the trigger element to the tooltip content without the tooltip disappearing. This requires the tooltip to remain visible while the pointer is anywhere within the combined trigger + tooltip area (or a reasonable gap region). |
| | **3. Persistent:** The tooltip remains visible until the user explicitly dismisses it (`Escape`), moves pointer away from both trigger and tooltip, or moves focus away from the trigger. It must **not** auto-dismiss on a timer. |
| **Keyboard dismissal** | `Escape` hides the tooltip. Focus remains on the trigger element (focus does not move). |
| **Truncated cell content** | When grid cells truncate text with ellipsis, the full text is shown in a tooltip. The cell must have `aria-label` with the full text (so the tooltip is redundant for screen readers). Mark the tooltip with `aria-hidden="true"` in this case, or rely on `aria-describedby` only when the tooltip adds information beyond the cell value. |

#### WCAG Criteria Addressed

| Criterion | Relevance |
|---|---|
| **1.4.13 Content on Hover or Focus** | The three-part requirement (dismissible, hoverable, persistent) is fully met. |
| **1.1.1 Non-text Content** | When a tooltip supplements an icon-only trigger, the tooltip text serves as the accessible name or description. |

---

### 6.8 Cell Editing

| Aspect | Specification |
|---|---|
| **Read-only indication** | Read-only cells: `aria-readonly="true"` on the `role="gridcell"`. Editable cells: `aria-readonly="false"` (explicit) or omit the attribute (implicit editable). In grids where most cells are read-only, explicitly marking editable cells is more helpful. |
| **Enter edit mode** | `F2` — enters edit mode for the focused cell (standard grid convention). `Enter` — also enters edit mode (alternative). Direct typing — begins editing and replaces the cell content with the typed character. |
| **Editor element** | The cell content is replaced (or overlaid) by an `<input>`, `<select>`, `<textarea>`, or custom editor. The editor element inherits its accessible name from the column header via `aria-labelledby="[columnheader-id]"`. If additional context is needed: `aria-labelledby="[columnheader-id] [rowheader-id]"`. |
| **Validation** | On invalid input: `aria-invalid="true"` on the input/cell. Error description element with unique `id`, referenced by `aria-errormessage="[error-id]"` on the input. Error text must be visible and descriptive: "Value must be a number between 0 and 100." |
| **Commit** | `Enter` — commits the edit. The cell returns to navigation mode. SR: "Cell updated to 75." (via live region). |
| **Cancel** | `Escape` — cancels the edit and restores the original value. SR: "Edit cancelled. Value restored to 42." (via live region). |
| **Tab behavior** | `Tab` in edit mode: commits the current cell and moves focus to the next editable cell in the row. `Shift+Tab`: commits and moves to the previous editable cell. |
| **Batch editing** | When multiple cells are edited in rapid succession (e.g., paste operation), defer announcements until the batch completes. SR: "5 cells updated in column Revenue." |
| **Complex editors** | Dropdown editors: `role="combobox"` or `role="listbox"` with standard keyboard patterns. Date pickers: `role="dialog"` with `aria-label="Choose date for Start Date column"`. |

#### WCAG Criteria Addressed

| Criterion | Relevance |
|---|---|
| **2.1.1 Keyboard** | All edit operations (enter, commit, cancel, navigate between editable cells) are keyboard accessible. |
| **3.3.1 Error Identification** | Validation errors are identified via `aria-invalid` and described via `aria-errormessage`. |
| **3.3.3 Error Suggestion** | Error messages provide actionable suggestions ("must be between 0 and 100"). |
| **3.3.4 Error Prevention (Legal, Financial, Data)** | For grids handling important data, edits are reversible (Escape to cancel, Ctrl+Z to undo). |
| **4.1.3 Status Messages** | Edit confirmation and cancellation announcements are status messages. |

---

### 6.9 Live Data Updates

| Aspect | Specification |
|---|---|
| **Status container** | `<div role="status" aria-live="polite" aria-atomic="true">` placed **outside** the grid DOM (not as a grid descendant). This element must exist in the DOM at page load, even if initially empty. |
| **Non-critical updates** | Use `aria-live="polite"` for routine changes. SR: "Row count updated to 250." SR: "Data refreshed at 2:45 PM." |
| **Critical alerts** | Use `role="alert"` (implicitly `aria-live="assertive"`) for urgent interruptions. SR: "Connection lost. Data may be stale." SR: "Server error. Unable to save changes." |
| **Bulk data refresh** | Set `aria-busy="true"` on the grid element at the start of the update. Set `aria-busy="false"` when complete. While `aria-busy="true"`, assistive technology should suppress intermediate announcements from the grid region. After completion, a single summary: SR: "Data refresh complete. 250 rows loaded." |
| **Individual cell changes** | Do **not** apply `aria-live` to individual grid cells — real-time updates across many cells would generate an overwhelming stream of announcements. Instead, batch cell changes and announce a summary: SR: "5 cells updated in column Revenue." |
| **`aria-relevant` configuration** | `aria-relevant="additions text"` — announce new rows and changed text values. Add `"removals"` only when row deletion is semantically important to the user (e.g., a monitoring dashboard where a disappeared row means an alert was resolved). |
| **Streaming/real-time data** | For high-frequency updates (stock tickers, monitoring), throttle announcements to a maximum of one per 5-10 seconds. Summarize: SR: "15 values updated in the last 10 seconds." |

#### WCAG Criteria Addressed

| Criterion | Relevance |
|---|---|
| **4.1.3 Status Messages** | All data update notifications are programmatically determinable via live regions without receiving focus. |

---

### 6.10 Pagination

| Aspect | Specification |
|---|---|
| **Container** | `<nav role="navigation" aria-label="Pagination">` wrapping the pagination controls. |
| **Page buttons** | Each page number is a `<button>`. The active page uses `aria-current="page"`: `<button aria-current="page">3</button>`. |
| **Navigation buttons** | "Previous" and "Next" buttons with `aria-label="Go to previous page"` and `aria-label="Go to next page"`. When at the first page, "Previous" has `aria-disabled="true"`. When at the last page, "Next" has `aria-disabled="true"`. |
| **Keyboard** | `Tab` moves focus into the pagination region. Arrow keys navigate between page buttons. `Enter` activates the focused page button. |
| **Page size selector** | `<select aria-label="Rows per page">` or a custom `role="listbox"`. After change: SR: "Showing 25 rows per page. Page 1 of 20." |
| **Post-navigation announcement** | Via `aria-live="polite"` live region: SR: "Page 3 of 10. Showing rows 21 to 30 of 200." |
| **Focus after page change** | Two valid strategies (choose one and apply consistently): (1) Focus moves to the first data row of the new page. (2) Focus remains on the activated page button. Document the chosen strategy for users. |
| **Ellipsis** | Truncated page ranges (1, 2, ..., 9, 10) should use `<span aria-hidden="true">...</span>` if a "Go to page" input is provided, or a visible "..." with `role="presentation"`. |

#### WCAG Criteria Addressed

| Criterion | Relevance |
|---|---|
| **2.4.3 Focus Order** | Focus management after page change follows a logical, predictable order. |
| **4.1.3 Status Messages** | Page navigation results are announced as status messages. |
| **2.4.5 Multiple Ways** | Pagination combined with search/filter provides multiple ways to locate data (AAA). |

---

### 6.11 Loading and Empty States

| Aspect | Specification |
|---|---|
| **Initial loading** | Set `aria-busy="true"` on the grid container. Provide a loading overlay inside a `role="status"` region: `<div role="status">Loading data...</div>`. Visual spinner: `aria-hidden="true"` on the spinner element (the status text conveys the information). |
| **Loading complete** | Set `aria-busy="false"` on the grid container. SR: "Data loaded. 200 rows available." (via the status region). |
| **Empty state** | When the grid has no data: render a `role="status"` region within or adjacent to the grid containing descriptive text. SR: "No data available." or "No results match your filter. Try broadening your search criteria." |
| **Progressive loading (infinite scroll)** | As new rows load, announce via `aria-live="polite"`: SR: "Loaded 50 more rows. Total: 150 rows." Update `aria-rowcount` on the grid element to reflect the new total. |
| **Skeleton rows** | Mark all skeleton placeholder elements with `aria-hidden="true"`. Set `aria-busy="true"` on the grid container. Screen readers should perceive neither the skeleton visuals nor their DOM structure. |
| **Error during load** | Use `role="alert"`: SR: "Failed to load data. Please try again." Provide a retry button: `<button>Retry</button>` that receives focus automatically or is easily discoverable. |

#### WCAG Criteria Addressed

| Criterion | Relevance |
|---|---|
| **4.1.3 Status Messages** | Loading progress, completion, and empty state messages are status messages. |
| **1.1.1 Non-text Content** | Spinner animations have text alternatives via the status region; skeleton placeholders are hidden. |
| **2.2.1 Timing Adjustable** | If loading has a timeout, the user must be warned and given the option to extend. |

---

### 6.12 Grouped Rows

| Aspect | Specification |
|---|---|
| **Group header row** | A `role="row"` element containing a single `role="gridcell"` (or `role="rowheader"`) that spans all columns via `aria-colspan="[total-column-count]"`. |
| **Expand/collapse** | `aria-expanded="true"` or `aria-expanded="false"` on the group header row element. |
| **Group label** | The spanning cell contains descriptive text: "North Region (12 items)". The accessible name of the row can be reinforced with `aria-label="North Region, 12 items, expanded"`. |
| **Aggregation cells** | When group rows contain aggregate values (sums, averages), each cell should provide full context via `aria-label`: `aria-label="Sum of Sales for North Region: $45,000"`. |
| **Keyboard** | `Enter` or `Space` on the focused group header row toggles `aria-expanded`. `Arrow Down` from a collapsed group skips to the next group header. `Arrow Down` from an expanded group enters the first child row. |
| **Screen reader** | SR (expand): "North Region, 12 items, expanded." SR (collapse): "North Region, 12 items, collapsed." |
| **Distinction from tree grid** | Grouped rows represent **flat data** organized into visual groups at the same hierarchical level. Unlike a tree grid, grouped rows do **not** use `aria-level`, `aria-setsize`, or `aria-posinset`. The group is a single level of nesting with expand/collapse semantics only. |
| **Nested groups** | For nested group hierarchies, use `role="treegrid"` and the tree grid pattern (Section 5.2). Section 6.12 covers flat grouped rows within a standard `role="grid"` — these are visually grouped but not hierarchical. |

#### WCAG Criteria Addressed

| Criterion | Relevance |
|---|---|
| **1.3.1 Info and Relationships** | Group structure (header + children) is conveyed programmatically through `aria-expanded` and the spanning cell pattern. |
| **4.1.3 Status Messages** | Group expand/collapse state changes are announced without focus change. |

---

### 6.13 Undo and Redo

| Aspect | Specification |
|---|---|
| **Keyboard** | `Ctrl+Z` — undo the last edit operation. `Ctrl+Y` or `Ctrl+Shift+Z` — redo the last undone operation. |
| **Single undo** | SR: "Edit undone. Cell B3 restored to 42." (via `aria-live="polite"` live region). |
| **Single redo** | SR: "Edit reapplied. Cell B3 set to 55." |
| **Batch undo** | When undoing a batch operation (e.g., paste, fill, bulk edit): SR: "3 edits undone." or "Batch undo: 10 cells restored to previous values." |
| **Undo stack boundary** | When there is nothing left to undo: SR: "Nothing to undo." When there is nothing to redo: SR: "Nothing to redo." |
| **Undo menu** | For complex undo histories, provide an undo history panel accessible via `Ctrl+Alt+Z` or a visible button: `role="listbox"` with each entry as `role="option"` describing the operation: "Edit cell B3 from 42 to 55 at 2:30 PM". |
| **Focus after undo/redo** | Focus moves to the cell (or first cell) affected by the undo/redo operation. |

#### WCAG Criteria Addressed

| Criterion | Relevance |
|---|---|
| **3.3.4 Error Prevention (Legal, Financial, Data)** | Undo provides a safety net for reversing unintended modifications, particularly important in grids handling financial or legal data. |
| **3.3.6 Error Prevention (All)** | For AAA conformance, undo/redo support is available for all editable operations, not just those involving legal or financial data. |

---

### 6.14 Column Pinning and Freezing

| Aspect | Specification |
|---|---|
| **DOM structure** | Pinned columns are typically rendered in separate DOM containers (left pane, scrollable center pane, right pane) to enable independent scrolling. Despite this physical separation, the grid must present as **one continuous logical structure** to assistive technology. |
| **`aria-colindex` continuity** | `aria-colindex` values must be sequential across all panes. Example: left pane (columns 1, 2), center pane (columns 3, 4, 5), right pane (column 6). There must be no gaps or restarts. |
| **`aria-owns` assembly** | If the three panes are separate DOM subtrees, the grid element may use `aria-owns` to declare the correct reading order of rows across panes. Each row ID must be listed in the correct column order. Alternatively, use CSS-based pinning (e.g., `position: sticky`) so that pinned columns remain within the same DOM parent as non-pinned columns — this eliminates the need for `aria-owns`. |
| **Keyboard navigation** | Arrow key navigation must cross pane boundaries seamlessly. The user must **not** perceive the transition between pinned and scrollable columns. Focus moves from the last pinned column (left pane, column 2) to the first scrollable column (center pane, column 3) with a single `Arrow Right` press. |
| **Scroll behavior** | When keyboard focus moves into the scrollable center pane, the viewport scrolls to reveal the focused cell while pinned columns remain stationary. This is a visual behavior — ARIA is unaffected. |
| **Pin/unpin action** | Column header context menu includes "Pin Column Left", "Pin Column Right", "Unpin Column". After pinning: SR: "Name column pinned to the left. Now in position 1." After unpinning: SR: "Name column unpinned. Now in position 4." |

#### WCAG Criteria Addressed

| Criterion | Relevance |
|---|---|
| **1.3.1 Info and Relationships** | The grid is perceived as a single continuous structure regardless of DOM segmentation. |
| **1.3.2 Meaningful Sequence** | `aria-colindex` order matches the logical reading order across panes. |
| **2.1.1 Keyboard** | Cross-pane navigation is seamless via arrow keys. |

---

### 6.15 Export Operations

| Aspect | Specification |
|---|---|
| **Single-format export** | `<button aria-label="Export as CSV">Export</button>`. |
| **Multi-format export** | Trigger button: `<button aria-haspopup="menu" aria-expanded="false">Export</button>`. Menu: `role="menu"` containing `role="menuitem"` for each format: "Export as CSV", "Export as Excel", "Export as PDF". |
| **Scope selection** | If the export can target different scopes (all rows, selected rows, current page), provide radio options in a dialog or submenu: `role="menuitemradio"` with `aria-checked`. |
| **Progress** | For large exports, announce progress via `aria-live="polite"`: SR: "Exporting... 50% complete." SR (completion): "Export complete. File downloaded as report.csv." |
| **Error** | SR: "Export failed. Please try again." (via `role="alert"`). |
| **Download notification** | Since file downloads are handled by the browser, the grid should confirm the action was initiated: SR: "Export started. Your browser will download the file." |

#### WCAG Criteria Addressed

| Criterion | Relevance |
|---|---|
| **2.1.1 Keyboard** | Export triggers and format menus are fully keyboard accessible. |
| **4.1.3 Status Messages** | Export progress and completion are status messages. |

---

### 6.16 Column Visibility and Settings Panel

| Aspect | Specification |
|---|---|
| **Trigger button** | `<button aria-label="Column settings" aria-haspopup="dialog" aria-expanded="false">`. On open: `aria-expanded="true"`. |
| **Settings panel** | `role="dialog"` with `aria-label="Show or hide columns"` and `aria-modal="true"`. |
| **Column list** | A list of checkboxes, one per column: `<div role="checkbox" aria-checked="true" aria-label="Name column: visible">`. Or as a `role="listbox"` where each `role="option"` has `aria-selected="true|false"`. |
| **Reorder within panel** | If the panel supports column reorder, each column entry includes a drag handle (`role="button"` with `aria-roledescription="drag handle"`) and keyboard alternative (arrow keys to move, or explicit "Move Up"/"Move Down" buttons). |
| **Apply** | Explicit "Apply" or "Done" button. On apply: focus returns to the trigger button. SR: "3 columns hidden, 8 columns visible." (via live region). |
| **Grid update — `aria-colcount`** | `aria-colcount` on the grid element reflects the **total** column count including hidden columns. This tells assistive technology that not all columns are visible. |
| **Grid update — `aria-colindex`** | Visible cells retain their original `aria-colindex` values. If columns 3 and 4 are hidden, visible cells jump from `aria-colindex="2"` to `aria-colindex="5"`. Screen readers interpret the gap as hidden content and may announce: "columns 3 and 4 not shown." |
| **Focus management** | On open: focus moves to the first checkbox in the dialog. Focus is trapped within the dialog. On close: focus returns to the trigger button. |

#### WCAG Criteria Addressed

| Criterion | Relevance |
|---|---|
| **2.1.1 Keyboard** | All column visibility operations are keyboard accessible. |
| **2.4.3 Focus Order** | Focus trap in the dialog prevents focus from escaping to the grid behind it. |
| **4.1.3 Status Messages** | Column visibility change results are announced as status messages. |
| **1.3.1 Info and Relationships** | `aria-colcount` and gapped `aria-colindex` values correctly convey that some columns are hidden. |

---

### 6.17 Status Bar and Summary Aggregations

| Aspect | Specification |
|---|---|
| **Container** | `<div role="status" aria-live="polite" aria-label="Grid summary">` placed immediately after the grid element (not inside it). |
| **Content** | Text summarizing the current state: "Sum: $45,000 | Average: $3,750 | Count: 12 selected rows". Use semantic separators (CSS or visible `|`) between values. |
| **Update triggers** | The status bar updates when: (1) The selection changes. (2) Data values change (edit, refresh). (3) Filter/sort changes affect the visible dataset. |
| **Announcement** | Because the container is `aria-live="polite"`, content changes are automatically announced. To avoid verbosity on rapid selection changes, debounce updates by 500ms. |
| **Interactive aggregation controls** | If the user can change the aggregation function (e.g., switch from Sum to Average): `<select aria-label="Aggregation function for Revenue column">` with options "Sum", "Average", "Count", "Min", "Max". After change: SR: "Revenue aggregation changed to Average. Average: $3,750." |
| **Multiple aggregation rows** | If the status bar contains multiple rows (e.g., subtotals per group + grand total), structure them as a description list or table within the status region for clarity. |

#### WCAG Criteria Addressed

| Criterion | Relevance |
|---|---|
| **4.1.3 Status Messages** | All summary and aggregation updates are programmatically determinable as status messages. |
| **1.3.1 Info and Relationships** | The relationship between aggregation values and their source data/columns is conveyed via labels and context. |

---
---

## Section 7 — Annotated HTML/ARIA Examples

Each example below provides a complete, self-contained HTML fragment with every ARIA attribute annotated. These are reference implementations; production code should generate identical ARIA semantics regardless of the rendering technology (web components, virtual DOM, etc.).

---

### Example 1: Data Grid with Sorting, Selection, and Pagination

```html
<!--
  DATA GRID: Employee listing
  - 500 total rows, 3 columns, 2 rows currently rendered (virtualized)
  - "Name" column sorted ascending
  - First visible row is selected (single-select mode)
  - Pagination controls below the grid
-->

<!-- Live region for dynamic announcements — exists in DOM at page load -->
<div
  id="grid-status"
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  <!-- Content injected dynamically, e.g., "Page 1 of 250. Showing rows 1 to 2 of 500." -->
</div>

<!-- Grid container -->
<div
  role="grid"
  aria-label="Employees"
  aria-rowcount="501"
  <!-- 501 = 1 header row + 500 data rows. aria-rowcount includes ALL rows, visible or not. -->
  aria-colcount="3"
  <!-- Total number of columns in the grid. -->
>

  <!-- Column header row -->
  <div
    role="row"
    aria-rowindex="1"
    <!-- 1-based index. The header row is row 1. -->
  >
    <div
      role="columnheader"
      aria-colindex="1"
      aria-sort="ascending"
      <!-- Communicates that this column is sorted ascending.
           Only placed on columnheader, NEVER on gridcell.
           Screen reader announces: "Name, column 1 of 3, sorted ascending." -->
      tabindex="-1"
      <!-- Focusable via arrow keys but not in the Tab sequence. -->
      id="col-name"
    >
      Name
      <span aria-hidden="true">&#9650;</span>
      <!-- Sort arrow icon. aria-hidden because aria-sort already conveys the state. -->
    </div>

    <div
      role="columnheader"
      aria-colindex="2"
      aria-sort="none"
      <!-- Sortable but currently not sorted. -->
      tabindex="-1"
      id="col-age"
    >
      Age
    </div>

    <div
      role="columnheader"
      aria-colindex="3"
      aria-sort="none"
      tabindex="-1"
      id="col-dept"
    >
      Department
    </div>
  </div>

  <!-- Data row 1 (first visible row) — selected -->
  <div
    role="row"
    aria-rowindex="2"
    <!-- Row index 2 (header is 1, first data row is 2). -->
    aria-selected="true"
    <!-- This row is currently selected.
         Screen reader announces: "Row 2 of 501, selected." -->
  >
    <div
      role="gridcell"
      aria-colindex="1"
      tabindex="0"
      <!-- tabindex="0" because this is the active/focused cell in the grid.
           Only ONE cell in the entire grid has tabindex="0" (the roving tabindex pattern).
           All other focusable cells have tabindex="-1". -->
    >
      Alice Johnson
    </div>

    <div
      role="gridcell"
      aria-colindex="2"
      tabindex="-1"
    >
      32
    </div>

    <div
      role="gridcell"
      aria-colindex="3"
      tabindex="-1"
    >
      Engineering
    </div>
  </div>

  <!-- Data row 2 (second visible row) — not selected -->
  <div
    role="row"
    aria-rowindex="3"
    aria-selected="false"
    <!-- Explicitly false. In a selection-enabled grid, every row should
         declare aria-selected to make the selection state unambiguous. -->
  >
    <div
      role="gridcell"
      aria-colindex="1"
      tabindex="-1"
    >
      Bob Smith
    </div>

    <div
      role="gridcell"
      aria-colindex="2"
      tabindex="-1"
    >
      45
    </div>

    <div
      role="gridcell"
      aria-colindex="3"
      tabindex="-1"
    >
      Marketing
    </div>
  </div>

</div>
<!-- End of grid -->

<!-- Pagination -->
<nav
  role="navigation"
  aria-label="Pagination"
  <!-- Landmark region for pagination controls. -->
>
  <button
    aria-label="Go to previous page"
    aria-disabled="true"
    <!-- Disabled because we are on the first page.
         Using aria-disabled (not the HTML disabled attribute) keeps the button
         focusable so keyboard users can discover it. -->
  >
    Previous
  </button>

  <button aria-current="page">
    <!-- aria-current="page" identifies this as the current page.
         Screen reader announces: "1, current page." -->
    1
  </button>

  <button>2</button>
  <button>3</button>

  <span aria-hidden="true">...</span>
  <!-- Ellipsis hidden from AT. A "Go to page" input (not shown) provides
       access to skipped page numbers. -->

  <button>250</button>

  <button aria-label="Go to next page">
    Next
  </button>
</nav>
```

---

### Example 2: Tree Grid with 3 Levels

```html
<!--
  TREE GRID: Organizational hierarchy
  - 3 levels: Department > Team > Employee
  - "Engineering" (level 1) is expanded
    - "Frontend Team" (level 2) is collapsed, contains 3 items
    - "Backend Team" (level 2) is expanded, contains 2 items
      - "Alice" (level 3, leaf)
      - "Bob" (level 3, leaf, selected via checkbox)
-->

<!-- Live region -->
<div
  id="treegrid-status"
  role="status"
  aria-live="polite"
  aria-atomic="true"
></div>

<!-- Tree grid container -->
<div
  role="treegrid"
  <!-- role="treegrid" (not "grid") signals hierarchical row relationships.
       Screen readers enable tree-specific navigation (expand/collapse). -->
  aria-label="Organization structure"
  aria-multiselectable="true"
  <!-- Multiple rows can be selected via checkboxes. -->
>

  <!-- Column header row -->
  <div role="row">
    <div role="columnheader" id="th-select">
      <div
        role="checkbox"
        aria-checked="mixed"
        <!-- "mixed" because only some rows are selected (Bob is selected, others are not).
             Screen reader: "Select all, mixed." -->
        aria-label="Select all"
        tabindex="-1"
        <!-- tabindex="-1" (not "0") because only one element in the entire grid
             should have tabindex="0" (the roving tabindex target). The grid cell
             is the single tab entry point; this checkbox is reachable via Enter/Space
             when focus is on its parent cell. -->
      ></div>
    </div>
    <div role="columnheader" id="th-name">Name</div>
    <div role="columnheader" id="th-role">Role</div>
    <div role="columnheader" id="th-count">Headcount</div>
  </div>

  <!-- Level 1: Engineering (root node, expanded) -->
  <div
    role="row"
    aria-level="1"
    <!-- Depth in the tree. Root nodes are level 1. -->
    aria-setsize="3"
    <!-- Total number of sibling nodes at this level (e.g., Engineering, Marketing, Sales). -->
    aria-posinset="1"
    <!-- Position within the sibling set. Engineering is the 1st of 3 departments. -->
    aria-expanded="true"
    <!-- This node is expanded; its children are visible.
         Screen reader: "Engineering, expanded, level 1, 1 of 3." -->
    aria-selected="false"
  >
    <div role="gridcell">
      <div
        role="checkbox"
        aria-checked="false"
        aria-label="Select Engineering"
        tabindex="-1"
      ></div>
    </div>
    <div role="gridcell" tabindex="0">
      <!-- tabindex="0": this is the currently focused cell (roving tabindex). -->
      Engineering
    </div>
    <div role="gridcell">Department</div>
    <div role="gridcell">52</div>
  </div>

  <!-- Level 2: Frontend Team (child of Engineering, collapsed) -->
  <div
    role="row"
    aria-level="2"
    <!-- Level 2: child of the level-1 "Engineering" row. -->
    aria-setsize="2"
    <!-- There are 2 teams under Engineering: Frontend and Backend. -->
    aria-posinset="1"
    <!-- Frontend is the 1st of 2 teams. -->
    aria-expanded="false"
    <!-- Collapsed. Its 3 child rows are not rendered / not visible.
         Screen reader: "Frontend Team, collapsed, level 2, 1 of 2." -->
    aria-selected="false"
  >
    <div role="gridcell">
      <div
        role="checkbox"
        aria-checked="false"
        aria-label="Select Frontend Team"
        tabindex="-1"
      ></div>
    </div>
    <div role="gridcell" tabindex="-1">Frontend Team</div>
    <div role="gridcell">Team</div>
    <div role="gridcell">3</div>
  </div>

  <!-- Level 2: Backend Team (child of Engineering, expanded) -->
  <div
    role="row"
    aria-level="2"
    aria-setsize="2"
    aria-posinset="2"
    <!-- Backend is the 2nd of 2 teams. -->
    aria-expanded="true"
    <!-- Expanded. Its 2 child rows (Alice, Bob) are visible below.
         Screen reader: "Backend Team, expanded, level 2, 2 of 2." -->
    aria-selected="false"
  >
    <div role="gridcell">
      <div
        role="checkbox"
        aria-checked="false"
        aria-label="Select Backend Team"
        tabindex="-1"
      ></div>
    </div>
    <div role="gridcell" tabindex="-1">Backend Team</div>
    <div role="gridcell">Team</div>
    <div role="gridcell">2</div>
  </div>

  <!-- Level 3: Alice (leaf node under Backend Team) -->
  <div
    role="row"
    aria-level="3"
    <!-- Level 3: individual employee (leaf). -->
    aria-setsize="2"
    <!-- 2 employees in Backend Team. -->
    aria-posinset="1"
    <!-- Alice is the 1st of 2. -->
    <!-- No aria-expanded: leaf nodes do not have this attribute.
         Its absence tells assistive technology this row cannot be expanded. -->
    aria-selected="false"
  >
    <div role="gridcell">
      <div
        role="checkbox"
        aria-checked="false"
        aria-label="Select Alice"
        tabindex="-1"
      ></div>
    </div>
    <div role="gridcell" tabindex="-1">Alice</div>
    <div role="gridcell">Senior Developer</div>
    <div role="gridcell">
      <!-- Empty: headcount not applicable to individuals. -->
    </div>
  </div>

  <!-- Level 3: Bob (leaf node under Backend Team, selected) -->
  <div
    role="row"
    aria-level="3"
    aria-setsize="2"
    aria-posinset="2"
    <!-- Bob is the 2nd of 2. -->
    aria-selected="true"
    <!-- Row is selected. Both aria-selected on the row AND aria-checked
         on the checkbox must stay synchronized.
         Screen reader: "Bob, selected, level 3, 2 of 2." -->
  >
    <div role="gridcell">
      <div
        role="checkbox"
        aria-checked="true"
        <!-- Checked: corresponds to the row being selected.
             Screen reader: "Select Bob, checked." -->
        aria-label="Select Bob"
        tabindex="-1"
      ></div>
    </div>
    <div role="gridcell" tabindex="-1">Bob</div>
    <div role="gridcell">Developer</div>
    <div role="gridcell"></div>
  </div>

</div>
<!-- End of treegrid -->
```

---

### Example 3: Pivot Table with Multi-Level Headers

```html
<!--
  PIVOT TABLE: Revenue by Region x Quarter
  - Column headers (2 levels):
    - Level 1: "Q1 2026", "Q2 2026"
    - Level 2 (under each quarter): "Sales", "Returns"
  - Row headers: "North", "South"
  - Grand total row at the bottom
  - Uses <table> with proper headers attribute for cell-to-header association
-->

<!-- Live region -->
<div
  id="pivot-status"
  role="status"
  aria-live="polite"
  aria-atomic="true"
></div>

<table
  role="grid"
  aria-label="Revenue by Region and Quarter"
  aria-rowcount="5"
  <!-- 2 header rows + 2 data rows + 1 total row = 5 -->
  aria-colcount="6"
  <!-- 1 row-header column + 4 data columns (Q1 Sales, Q1 Returns, Q2 Sales, Q2 Returns) + 1 total column = 6 -->
>

  <!-- When role="grid" is set on <table>, child elements inherit grid roles
       implicitly: <tr> = row, <th> = columnheader (or rowheader with scope="row"),
       <td> = gridcell. Explicit role attributes are omitted to avoid redundancy. -->
  <thead>
    <!-- Header row level 1: Quarter groupings -->
    <tr aria-rowindex="1">

      <th
        aria-colindex="1"
        rowspan="2"
        <!-- Spans both header rows because "Region" applies to both levels. -->
        id="hdr-region"
      >
        Region
      </th>

      <th
        aria-colindex="2"
        colspan="2"
        <!-- Spans 2 sub-columns: Sales and Returns for Q1. -->
        id="hdr-q1"
        scope="colgroup"
        <!-- scope="colgroup" tells AT this header governs a group of columns. -->
      >
        Q1 2026
      </th>

      <th
        aria-colindex="4"
        <!-- aria-colindex=4 because Q1 occupied columns 2-3. -->
        colspan="2"
        id="hdr-q2"
        scope="colgroup"
      >
        Q2 2026
      </th>

      <th
        aria-colindex="6"
        rowspan="2"
        id="hdr-total-col"
      >
        Grand Total
      </th>
    </tr>

    <!-- Header row level 2: Metric sub-headers -->
    <tr aria-rowindex="2">
      <!--
        Note: "Region" (col 1) and "Grand Total" (col 6) are not repeated here
        because they use rowspan="2" in the row above.
      -->

      <th
        aria-colindex="2"
        id="hdr-q1-sales"
        scope="col"
      >
        Sales
      </th>

      <th
        aria-colindex="3"
        id="hdr-q1-returns"
        scope="col"
      >
        Returns
      </th>

      <th
        aria-colindex="4"
        id="hdr-q2-sales"
        scope="col"
      >
        Sales
      </th>

      <th
        aria-colindex="5"
        id="hdr-q2-returns"
        scope="col"
      >
        Returns
      </th>
    </tr>
  </thead>

  <tbody>
    <!-- Data row: North -->
    <tr aria-rowindex="3">

      <th
        aria-colindex="1"
        id="hdr-north"
        scope="row"
        <!-- scope="row" marks this as a row header.
             Screen reader uses this to provide row context for each data cell. -->
      >
        North
      </th>

      <td
        aria-colindex="2"
        headers="hdr-north hdr-q1 hdr-q1-sales"
        <!-- headers attribute explicitly associates this cell with:
             1. Row header: "North"
             2. Column group header: "Q1 2026"
             3. Column sub-header: "Sales"
             Screen reader: "North, Q1 2026, Sales: $120,000." -->
        tabindex="-1"
      >
        $120,000
      </td>

      <td
        aria-colindex="3"
        headers="hdr-north hdr-q1 hdr-q1-returns"
        tabindex="-1"
      >
        $8,000
      </td>

      <td
        aria-colindex="4"
        headers="hdr-north hdr-q2 hdr-q2-sales"
        tabindex="-1"
      >
        $135,000
      </td>

      <td
        aria-colindex="5"
        headers="hdr-north hdr-q2 hdr-q2-returns"
        tabindex="-1"
      >
        $9,500
      </td>

      <td
        aria-colindex="6"
        headers="hdr-north hdr-total-col"
        tabindex="-1"
      >
        $236,500
      </td>
    </tr>

    <!-- Data row: South -->
    <tr aria-rowindex="4">

      <th
        aria-colindex="1"
        id="hdr-south"
        scope="row"
      >
        South
      </th>

      <td
        aria-colindex="2"
        headers="hdr-south hdr-q1 hdr-q1-sales"
        tabindex="-1"
      >
        $95,000
      </td>

      <td
        aria-colindex="3"
        headers="hdr-south hdr-q1 hdr-q1-returns"
        tabindex="-1"
      >
        $6,200
      </td>

      <td
        aria-colindex="4"
        headers="hdr-south hdr-q2 hdr-q2-sales"
        tabindex="-1"
      >
        $110,000
      </td>

      <td
        aria-colindex="5"
        headers="hdr-south hdr-q2 hdr-q2-returns"
        tabindex="-1"
      >
        $7,800
      </td>

      <td
        aria-colindex="6"
        headers="hdr-south hdr-total-col"
        tabindex="-1"
      >
        $188,600
      </td>
    </tr>
  </tbody>

  <tfoot>
    <!-- Grand total row -->
    <tr aria-rowindex="5">

      <th
        aria-colindex="1"
        id="hdr-grand-total"
        scope="row"
      >
        Grand Total
      </th>

      <td
        aria-colindex="2"
        headers="hdr-grand-total hdr-q1 hdr-q1-sales"
        aria-label="Grand Total, Q1 2026 Sales: $215,000"
        <!-- aria-label provides complete context for the grand total cell,
             ensuring screen readers announce the full meaning even if header
             traversal is inconsistent. -->
        tabindex="-1"
      >
        $215,000
      </td>

      <td
        aria-colindex="3"
        headers="hdr-grand-total hdr-q1 hdr-q1-returns"
        aria-label="Grand Total, Q1 2026 Returns: $14,200"
        tabindex="-1"
      >
        $14,200
      </td>

      <td
        aria-colindex="4"
        headers="hdr-grand-total hdr-q2 hdr-q2-sales"
        aria-label="Grand Total, Q2 2026 Sales: $245,000"
        tabindex="-1"
      >
        $245,000
      </td>

      <td
        aria-colindex="5"
        headers="hdr-grand-total hdr-q2 hdr-q2-returns"
        aria-label="Grand Total, Q2 2026 Returns: $17,300"
        tabindex="-1"
      >
        $17,300
      </td>

      <td
        aria-colindex="6"
        headers="hdr-grand-total hdr-total-col"
        aria-label="Grand Total: $425,100"
        tabindex="-1"
      >
        $425,100
      </td>
    </tr>
  </tfoot>

</table>
```

---

### Example 4: Gantt Chart Dual-Region

```html
<!--
  GANTT CHART: Project timeline
  - Left region: task list as a data grid (Name, Start, End, Duration)
  - Right region: visual timeline rendered as an application region
  - One dependency shown between tasks
  - Dual-region approach: grid for tabular data, application for interactive timeline
-->

<!-- Live region for announcements -->
<div
  id="gantt-status"
  role="status"
  aria-live="polite"
  aria-atomic="true"
></div>

<!-- Outer landmark containing both regions -->
<div
  role="region"
  aria-label="Gantt Chart: Project Alpha"
  <!-- Outer landmark gives assistive technology a way to navigate to the
       entire Gantt chart as a single entity. -->
>

  <!-- LEFT REGION: Task list grid -->
  <div
    role="grid"
    aria-label="Task list"
    aria-rowcount="5"
    <!-- 1 header row + 4 data rows -->
    aria-colcount="4"
  >

    <!-- Header row -->
    <div role="row" aria-rowindex="1">
      <div role="columnheader" aria-colindex="1" id="gantt-th-name">Task Name</div>
      <div role="columnheader" aria-colindex="2" id="gantt-th-start">Start Date</div>
      <div role="columnheader" aria-colindex="3" id="gantt-th-end">End Date</div>
      <div role="columnheader" aria-colindex="4" id="gantt-th-dur">Duration</div>
    </div>

    <!-- Task 1: Design Phase -->
    <div
      role="row"
      aria-rowindex="2"
      id="task-row-1"
      aria-controls="gantt-bar-1"
      <!-- aria-controls links this row to its corresponding timeline bar.
           Assistive technology can use this to navigate between the table row
           and the visual bar representation. -->
    >
      <div role="gridcell" aria-colindex="1" tabindex="0">Design Phase</div>
      <div role="gridcell" aria-colindex="2" tabindex="-1">2026-04-01</div>
      <div role="gridcell" aria-colindex="3" tabindex="-1">2026-04-15</div>
      <div role="gridcell" aria-colindex="4" tabindex="-1">15 days</div>
    </div>

    <!-- Task 2: Development -->
    <div
      role="row"
      aria-rowindex="3"
      id="task-row-2"
      aria-controls="gantt-bar-2"
    >
      <div role="gridcell" aria-colindex="1" tabindex="-1">Development</div>
      <div role="gridcell" aria-colindex="2" tabindex="-1">2026-04-16</div>
      <div role="gridcell" aria-colindex="3" tabindex="-1">2026-06-15</div>
      <div role="gridcell" aria-colindex="4" tabindex="-1">61 days</div>
    </div>

    <!-- Task 3: Testing -->
    <div
      role="row"
      aria-rowindex="4"
      id="task-row-3"
      aria-controls="gantt-bar-3"
    >
      <div role="gridcell" aria-colindex="1" tabindex="-1">Testing</div>
      <div role="gridcell" aria-colindex="2" tabindex="-1">2026-06-16</div>
      <div role="gridcell" aria-colindex="3" tabindex="-1">2026-07-15</div>
      <div role="gridcell" aria-colindex="4" tabindex="-1">30 days</div>
    </div>

    <!-- Task 4: Launch -->
    <div
      role="row"
      aria-rowindex="5"
      id="task-row-4"
      aria-controls="gantt-bar-4"
    >
      <div role="gridcell" aria-colindex="1" tabindex="-1">Launch</div>
      <div role="gridcell" aria-colindex="2" tabindex="-1">2026-07-16</div>
      <div role="gridcell" aria-colindex="3" tabindex="-1">2026-07-16</div>
      <div role="gridcell" aria-colindex="4" tabindex="-1">1 day (milestone)</div>
    </div>

  </div>
  <!-- End task list grid -->

  <!-- RIGHT REGION: Visual timeline -->
  <div
    role="application"
    <!-- role="application" passes all keyboard input to the widget's own
         keyboard handler, bypassing screen reader virtual cursor mode.
         This is appropriate because the timeline has custom drag-and-drop
         and keyboard interactions that conflict with virtual cursor navigation.
         IMPORTANT: only use role="application" on the timeline, NOT the task grid. -->
    aria-label="Timeline"
    aria-roledescription="Gantt timeline"
    <!-- aria-roledescription overrides the generic "application" announcement.
         Screen reader announces: "Gantt timeline" when entering this region. -->
  >

    <!-- Timeline header: month/week labels -->
    <div
      role="img"
      aria-label="Timeline spanning April 2026 to July 2026"
      <!-- The timeline header (month labels, week markers) is treated as a
           decorative/informational image since the exact dates are already
           available in the task grid. -->
    >
      <!-- Visual month/week markers rendered via CSS/SVG -->
    </div>

    <!-- Task bar 1: Design Phase -->
    <div
      role="img"
      id="gantt-bar-1"
      aria-label="Design Phase: April 1 to April 15, 2026. Duration: 15 days. Progress: 100% complete."
      <!-- role="img" with a comprehensive aria-label describes the bar.
           All temporal and progress information is in the label so the user
           does not need to visually interpret the bar's position/width/fill. -->
      tabindex="0"
      <!-- Focusable. Arrow keys move between bars. Enter opens task details. -->
    >
    </div>

    <!-- Task bar 2: Development (has a dependency) -->
    <div
      role="img"
      id="gantt-bar-2"
      aria-label="Development: April 16 to June 15, 2026. Duration: 61 days. Progress: 45% complete."
      aria-describedby="dep-1-desc"
      <!-- aria-describedby links to the dependency description below.
           Screen reader announces the label first, then (on further reading
           or when requested): "Depends on: Design Phase (finish-to-start)." -->
      tabindex="-1"
    >
    </div>

    <!-- Dependency description (visually hidden, referenced by aria-describedby) -->
    <!-- Use CSS visually-hidden class, NOT the hidden attribute. The hidden attribute
         may remove elements from the accessibility tree in some browser/AT combinations,
         making aria-describedby ineffective. -->
    <div
      id="dep-1-desc"
      class="visually-hidden"
    >
      Depends on: Design Phase (finish-to-start). Development starts after Design Phase ends.
    </div>

    <!-- Task bar 3: Testing -->
    <div
      role="img"
      id="gantt-bar-3"
      aria-label="Testing: June 16 to July 15, 2026. Duration: 30 days. Progress: 0% complete. Not started."
      tabindex="-1"
    >
    </div>

    <!-- Task bar 4: Launch (milestone — single-day marker) -->
    <div
      role="img"
      id="gantt-bar-4"
      aria-label="Launch: July 16, 2026. Milestone."
      aria-roledescription="milestone"
      <!-- Override "image" with "milestone" for more meaningful announcement. -->
      tabindex="-1"
    >
    </div>

    <!-- Visual dependency line (arrow from bar 1 to bar 2) -->
    <svg aria-hidden="true">
      <!-- The SVG arrow is purely visual. The dependency relationship is
           communicated via aria-describedby on the dependent bar.
           aria-hidden="true" hides the entire SVG from assistive technology. -->
      <line x1="200" y1="30" x2="200" y2="70" stroke="#666" />
      <polygon points="195,65 205,65 200,75" fill="#666" />
    </svg>

  </div>
  <!-- End timeline application region -->

</div>
<!-- End Gantt chart outer landmark -->
```

---

### Example 5: Spreadsheet with Formula Bar

```html
<!--
  SPREADSHEET: Basic 2-column, 3-row spreadsheet
  - Address bar shows current cell reference (B3)
  - Formula bar shows the formula for the active cell (=SUM(B1:B2))
  - Grid: A1="Name", B1=100, B2=200, B3=300 (calculated)
  - Sheet tabs: "Sheet1" (active), "Sheet2"
-->

<!-- Live region -->
<div
  id="spreadsheet-status"
  role="status"
  aria-live="polite"
  aria-atomic="true"
></div>

<!-- Toolbar region containing address bar and formula bar -->
<div
  role="toolbar"
  aria-label="Formula toolbar"
  aria-orientation="horizontal"
  <!-- role="toolbar" groups the address bar and formula bar.
       Left/Right arrow keys move between controls within the toolbar. -->
>

  <!-- Address bar: displays the current cell reference -->
  <div
    role="combobox"
    aria-label="Cell address"
    aria-expanded="false"
    <!-- role="combobox" because the user can type a cell reference (e.g., "A1")
         to navigate, and it can suggest matching named ranges.
         When not expanded, it displays the current cell reference. -->
  >
    <input
      type="text"
      value="B3"
      aria-label="Cell address"
      aria-autocomplete="list"
      <!-- aria-autocomplete="list" indicates that typing will show
           suggestions (named ranges, cell references). -->
    />
  </div>

  <!-- Formula bar: displays and edits the cell formula or value -->
  <div
    role="textbox"
    aria-label="Formula bar"
    aria-multiline="false"
    contenteditable="true"
    tabindex="0"
    <!-- The formula bar is a contenteditable div (or an input) where the user
         can view and edit the formula for the active cell.
         When cell B3 is active, this shows "=SUM(B1:B2)".
         Screen reader: "Formula bar: =SUM(B1:B2)." -->
  >
    =SUM(B1:B2)
  </div>

</div>
<!-- End toolbar -->

<!-- Spreadsheet grid -->
<div
  role="grid"
  aria-label="Sheet1"
  aria-rowcount="4"
  <!-- 1 header row + 3 data rows -->
  aria-colcount="2"
>

  <!-- Column headers (A, B) -->
  <div role="row" aria-rowindex="1">
    <div
      role="columnheader"
      aria-colindex="1"
      id="ss-col-a"
      tabindex="-1"
    >
      A
    </div>
    <div
      role="columnheader"
      aria-colindex="2"
      id="ss-col-b"
      tabindex="-1"
    >
      B
    </div>
  </div>

  <!-- Row 1 -->
  <div role="row" aria-rowindex="2">
    <div
      role="gridcell"
      aria-colindex="1"
      aria-readonly="false"
      <!-- Editable cell. F2 or Enter to start editing. -->
      aria-label="Cell A1: Name"
      <!-- aria-label provides the full cell reference and value.
           This is critical for spreadsheets where column/row headers are
           letters/numbers and the cell value is the primary content.
           Screen reader: "Cell A1: Name." -->
      tabindex="-1"
    >
      Name
    </div>
    <div
      role="gridcell"
      aria-colindex="2"
      aria-readonly="false"
      aria-label="Cell B1: 100"
      tabindex="-1"
    >
      100
    </div>
  </div>

  <!-- Row 2 -->
  <div role="row" aria-rowindex="3">
    <div
      role="gridcell"
      aria-colindex="1"
      aria-readonly="false"
      aria-label="Cell A2"
      <!-- Empty cell. Label still includes the cell reference for context. -->
      tabindex="-1"
    >
    </div>
    <div
      role="gridcell"
      aria-colindex="2"
      aria-readonly="false"
      aria-label="Cell B2: 200"
      tabindex="-1"
    >
      200
    </div>
  </div>

  <!-- Row 3 -->
  <div role="row" aria-rowindex="4">
    <div
      role="gridcell"
      aria-colindex="1"
      aria-readonly="false"
      aria-label="Cell A3"
      tabindex="-1"
    >
    </div>
    <div
      role="gridcell"
      aria-colindex="2"
      aria-readonly="false"
      aria-label="Cell B3: 300, formula: =SUM(B1:B2)"
      <!-- For formula cells, the aria-label includes BOTH the displayed value
           AND the formula. This gives screen reader users the same information
           sighted users see in the formula bar.
           Screen reader: "Cell B3: 300, formula: =SUM(B1:B2)." -->
      tabindex="0"
      <!-- tabindex="0": this is the currently active/focused cell. -->
    >
      300
    </div>
  </div>

</div>
<!-- End spreadsheet grid -->

<!-- Sheet tabs -->
<div
  role="tablist"
  aria-label="Worksheets"
  <!-- role="tablist" for the sheet tab bar.
       Left/Right arrow keys navigate between tabs. -->
>
  <button
    role="tab"
    aria-selected="true"
    <!-- aria-selected="true" identifies the active sheet.
         Screen reader: "Sheet1, selected, tab 1 of 2." -->
    aria-controls="sheet1-panel"
    <!-- aria-controls links this tab to the grid content above
         (which would be wrapped in a role="tabpanel" in production). -->
    id="sheet1-tab"
    tabindex="0"
  >
    Sheet1
  </button>

  <button
    role="tab"
    aria-selected="false"
    aria-controls="sheet2-panel"
    id="sheet2-tab"
    tabindex="-1"
    <!-- tabindex="-1": not the active tab, so it is reachable via arrow
         keys within the tablist but not via Tab. -->
  >
    Sheet2
  </button>
</div>
```

---

### Example 6: Master-Detail with Nested Grid

```html
<!--
  MASTER-DETAIL: Orders grid with expandable detail panels
  - Parent grid: 2 order rows
  - First row (Order #123) is expanded, showing a nested detail grid
  - Second row (Order #456) is collapsed
  - Detail panel contains a nested grid of order line items
-->

<!-- Live region -->
<div
  id="master-detail-status"
  role="status"
  aria-live="polite"
  aria-atomic="true"
></div>

<!-- Parent (master) grid -->
<div
  role="grid"
  aria-label="Orders"
  aria-rowcount="5"
  <!-- 1 header row + 2 data rows + 2 detail panel rows -->
  aria-colcount="4"
>

  <!-- Header row -->
  <div role="row" aria-rowindex="1">
    <div role="columnheader" aria-colindex="1" id="master-th-expand">
      <!-- Visually this column contains expand/collapse toggles.
           The header can be empty or labeled: -->
      <span class="visually-hidden">Expand/Collapse</span>
    </div>
    <div role="columnheader" aria-colindex="2" id="master-th-order">Order #</div>
    <div role="columnheader" aria-colindex="3" id="master-th-date">Date</div>
    <div role="columnheader" aria-colindex="4" id="master-th-total">Total</div>
  </div>

  <!-- Row 1: Order #123 (expanded) -->
  <div
    role="row"
    aria-rowindex="2"
    aria-expanded="true"
    <!-- aria-expanded="true" indicates this row's detail panel is visible.
         Screen reader: "Row 2 of 5, expanded." -->
    aria-controls="detail-panel-123"
    <!-- aria-controls points to the detail panel element.
         This creates a programmatic link between the parent row and
         the detail region, allowing AT to navigate between them. -->
  >
    <div role="gridcell" aria-colindex="1">
      <button
        aria-expanded="true"
        aria-label="Collapse details for Order #123"
        <!-- The toggle button mirrors the row's aria-expanded state and
             provides an explicit label describing the action. -->
        tabindex="0"
      >
        <span aria-hidden="true">&#9660;</span>
        <!-- Down-pointing triangle icon. aria-hidden because the button
             label already describes the state and action. -->
      </button>
    </div>
    <div role="gridcell" aria-colindex="2" tabindex="-1">123</div>
    <div role="gridcell" aria-colindex="3" tabindex="-1">2026-03-10</div>
    <div role="gridcell" aria-colindex="4" tabindex="-1">$450.00</div>
  </div>

  <!-- Detail panel for Order #123.
       Wrapped in a row > gridcell to maintain valid grid role hierarchy
       (grid > row > gridcell). The region landmark lives inside the gridcell. -->
  <div role="row" aria-rowindex="3">
    <div role="gridcell" aria-colspan="4" tabindex="-1">
      <div
        role="region"
        id="detail-panel-123"
        aria-label="Order details for Order #123"
        <!-- role="region" with aria-label creates a navigable landmark.
             Screen reader: "Order details for Order #123, region." -->
      >

        <!-- Nested (detail) grid: line items for Order #123 -->
        <div
          role="grid"
          aria-label="Line items for Order #123"
          <!-- The nested grid has its OWN aria-label, distinct from the parent grid.
               This is a completely independent grid with its own header structure,
               keyboard navigation scope, and column indices. -->
          aria-rowcount="4"
          <!-- 1 header + 3 line items -->
          aria-colcount="4"
        >

          <!-- Nested grid header -->
          <div role="row" aria-rowindex="1">
            <div role="columnheader" aria-colindex="1" id="detail-th-product">Product</div>
            <div role="columnheader" aria-colindex="2" id="detail-th-qty">Quantity</div>
            <div role="columnheader" aria-colindex="3" id="detail-th-price">Unit Price</div>
            <div role="columnheader" aria-colindex="4" id="detail-th-subtotal">Subtotal</div>
          </div>

          <!-- Line item 1 -->
          <div role="row" aria-rowindex="2">
            <div role="gridcell" aria-colindex="1" tabindex="-1">Widget A</div>
            <div role="gridcell" aria-colindex="2" tabindex="-1">2</div>
            <div role="gridcell" aria-colindex="3" tabindex="-1">$100.00</div>
            <div role="gridcell" aria-colindex="4" tabindex="-1">$200.00</div>
          </div>

          <!-- Line item 2 -->
          <div role="row" aria-rowindex="3">
            <div role="gridcell" aria-colindex="1" tabindex="-1">Widget B</div>
            <div role="gridcell" aria-colindex="2" tabindex="-1">1</div>
            <div role="gridcell" aria-colindex="3" tabindex="-1">$150.00</div>
            <div role="gridcell" aria-colindex="4" tabindex="-1">$150.00</div>
          </div>

          <!-- Line item 3 -->
          <div role="row" aria-rowindex="4">
            <div role="gridcell" aria-colindex="1" tabindex="-1">Widget C</div>
            <div role="gridcell" aria-colindex="2" tabindex="-1">2</div>
            <div role="gridcell" aria-colindex="3" tabindex="-1">$50.00</div>
            <div role="gridcell" aria-colindex="4" tabindex="-1">$100.00</div>
          </div>

        </div>
        <!-- End nested grid -->

      </div>
    </div>
  </div>
  <!-- End detail panel for Order #123 -->

  <!-- Row 2: Order #456 (collapsed) -->
  <div
    role="row"
    aria-rowindex="4"
    aria-expanded="false"
    <!-- Collapsed. Detail panel is not rendered or is hidden.
         Screen reader: "Row 4, collapsed." -->
    aria-controls="detail-panel-456"
  >
    <div role="gridcell" aria-colindex="1">
      <button
        aria-expanded="false"
        aria-label="Expand details for Order #456"
        tabindex="-1"
      >
        <span aria-hidden="true">&#9654;</span>
        <!-- Right-pointing triangle: collapsed state. -->
      </button>
    </div>
    <div role="gridcell" aria-colindex="2" tabindex="-1">456</div>
    <div role="gridcell" aria-colindex="3" tabindex="-1">2026-03-12</div>
    <div role="gridcell" aria-colindex="4" tabindex="-1">$230.00</div>
  </div>

  <!-- Detail panel for Order #456 (hidden when collapsed).
       Wrapped in a row > gridcell for valid grid role hierarchy. -->
  <div role="row" aria-rowindex="5" hidden>
    <div role="gridcell" aria-colspan="4" tabindex="-1">
      <div
        role="region"
        id="detail-panel-456"
        aria-label="Order details for Order #456"
      >
        <!-- Nested grid content would appear here when expanded. -->
      </div>
    </div>
  </div>

</div>
<!-- End parent (master) grid -->
```

---

### Example 7: Virtualized Grid

```html
<!--
  VIRTUALIZED GRID: Large dataset rendering
  - Total: 10,000 rows and 20 columns
  - Only 10 rows are currently in the DOM (rows 45-54 of the data)
  - Column headers are always rendered
  - Demonstrates aria-rowcount, aria-colcount, aria-rowindex, aria-colindex
  - All indices are 1-based per the ARIA specification
  - Indices may not be contiguous (gaps indicate virtualized-out rows/columns)
-->

<!-- Live region for scroll position and virtualization announcements -->
<div
  id="virtual-grid-status"
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  <!-- Updated as user scrolls: "Showing rows 45 to 54 of 10,000." -->
</div>

<!-- Virtualized grid -->
<div
  role="grid"
  aria-label="Transaction log"
  aria-rowcount="10001"
  <!-- aria-rowcount = total rows including header.
       10,000 data rows + 1 header row = 10,001.
       This value tells assistive technology the FULL size of the grid,
       even though only a small subset is in the DOM.
       Screen reader may announce: "Grid with 10,001 rows and 20 columns." -->
  aria-colcount="20"
  <!-- aria-colcount = total number of columns.
       All 20 column headers are rendered (no column virtualization in this example),
       but this attribute is still required to declare the full column count. -->
>

  <!-- Column header row (always rendered, not virtualized) -->
  <div role="row" aria-rowindex="1">
    <!-- aria-rowindex="1": the header row is always row 1. -->

    <div
      role="columnheader"
      aria-colindex="1"
      <!-- aria-colindex="1": 1-based. First column. -->
      id="vh-id"
      tabindex="-1"
    >
      ID
    </div>

    <div
      role="columnheader"
      aria-colindex="2"
      id="vh-date"
      tabindex="-1"
    >
      Date
    </div>

    <div
      role="columnheader"
      aria-colindex="3"
      id="vh-type"
      tabindex="-1"
    >
      Type
    </div>

    <!-- Columns 4 through 19 follow the same pattern (omitted for brevity).
         Each has aria-colindex matching its 1-based position. -->

    <div
      role="columnheader"
      aria-colindex="20"
      id="vh-status"
      tabindex="-1"
    >
      Status
    </div>
  </div>

  <!--
    VIRTUALIZED DATA ROWS
    Only rows 45-54 (out of 10,000) are currently in the DOM.
    The aria-rowindex values are 46-55 because:
      - Row index 1 = header row
      - Row index 2 = first data row (data row 1)
      - Row index N+1 = data row N
    So data row 45 = aria-rowindex 46.

    IMPORTANT: aria-rowindex values are NOT contiguous with the header row.
    The gap between aria-rowindex="1" (header) and aria-rowindex="46" (first
    rendered data row) tells assistive technology that rows 2-45 exist but
    are not currently in the DOM. Screen readers use this to calculate and
    announce: "Row 46 of 10,001."
  -->

  <!-- Data row 45 (first currently rendered row) -->
  <div
    role="row"
    aria-rowindex="46"
    <!-- 1-based: header is 1, so data row 45 is index 46. -->
  >
    <div
      role="gridcell"
      aria-colindex="1"
      <!-- Each cell carries aria-colindex to allow assistive technology
           to compute position even in a sparse DOM.
           In this example all 20 columns are rendered per row, so
           aria-colindex values are contiguous (1-20). If columns were
           also virtualized, there would be gaps here too. -->
      tabindex="0"
      <!-- This is the currently focused cell (roving tabindex). -->
    >
      TXN-10045
    </div>

    <div
      role="gridcell"
      aria-colindex="2"
      tabindex="-1"
    >
      2026-03-15
    </div>

    <div
      role="gridcell"
      aria-colindex="3"
      tabindex="-1"
    >
      Payment
    </div>

    <!-- Cells for columns 4-19 follow the same pattern.
         Each has the correct aria-colindex. -->

    <div
      role="gridcell"
      aria-colindex="20"
      tabindex="-1"
    >
      Completed
    </div>
  </div>

  <!-- Data row 46 -->
  <div
    role="row"
    aria-rowindex="47"
  >
    <div role="gridcell" aria-colindex="1" tabindex="-1">TXN-10046</div>
    <div role="gridcell" aria-colindex="2" tabindex="-1">2026-03-15</div>
    <div role="gridcell" aria-colindex="3" tabindex="-1">Refund</div>
    <!-- ... columns 4-19 ... -->
    <div role="gridcell" aria-colindex="20" tabindex="-1">Pending</div>
  </div>

  <!-- Data row 47 -->
  <div
    role="row"
    aria-rowindex="48"
  >
    <div role="gridcell" aria-colindex="1" tabindex="-1">TXN-10047</div>
    <div role="gridcell" aria-colindex="2" tabindex="-1">2026-03-15</div>
    <div role="gridcell" aria-colindex="3" tabindex="-1">Payment</div>
    <!-- ... columns 4-19 ... -->
    <div role="gridcell" aria-colindex="20" tabindex="-1">Completed</div>
  </div>

  <!-- Data row 48 -->
  <div
    role="row"
    aria-rowindex="49"
  >
    <div role="gridcell" aria-colindex="1" tabindex="-1">TXN-10048</div>
    <div role="gridcell" aria-colindex="2" tabindex="-1">2026-03-15</div>
    <div role="gridcell" aria-colindex="3" tabindex="-1">Transfer</div>
    <!-- ... columns 4-19 ... -->
    <div role="gridcell" aria-colindex="20" tabindex="-1">Completed</div>
  </div>

  <!-- Data row 49 -->
  <div
    role="row"
    aria-rowindex="50"
  >
    <div role="gridcell" aria-colindex="1" tabindex="-1">TXN-10049</div>
    <div role="gridcell" aria-colindex="2" tabindex="-1">2026-03-15</div>
    <div role="gridcell" aria-colindex="3" tabindex="-1">Payment</div>
    <!-- ... columns 4-19 ... -->
    <div role="gridcell" aria-colindex="20" tabindex="-1">Completed</div>
  </div>

  <!-- Data row 50 -->
  <div
    role="row"
    aria-rowindex="51"
  >
    <div role="gridcell" aria-colindex="1" tabindex="-1">TXN-10050</div>
    <div role="gridcell" aria-colindex="2" tabindex="-1">2026-03-16</div>
    <div role="gridcell" aria-colindex="3" tabindex="-1">Payment</div>
    <!-- ... columns 4-19 ... -->
    <div role="gridcell" aria-colindex="20" tabindex="-1">Pending</div>
  </div>

  <!-- Data row 51 -->
  <div
    role="row"
    aria-rowindex="52"
  >
    <div role="gridcell" aria-colindex="1" tabindex="-1">TXN-10051</div>
    <div role="gridcell" aria-colindex="2" tabindex="-1">2026-03-16</div>
    <div role="gridcell" aria-colindex="3" tabindex="-1">Refund</div>
    <!-- ... columns 4-19 ... -->
    <div role="gridcell" aria-colindex="20" tabindex="-1">Processing</div>
  </div>

  <!-- Data row 52 -->
  <div
    role="row"
    aria-rowindex="53"
  >
    <div role="gridcell" aria-colindex="1" tabindex="-1">TXN-10052</div>
    <div role="gridcell" aria-colindex="2" tabindex="-1">2026-03-16</div>
    <div role="gridcell" aria-colindex="3" tabindex="-1">Payment</div>
    <!-- ... columns 4-19 ... -->
    <div role="gridcell" aria-colindex="20" tabindex="-1">Completed</div>
  </div>

  <!-- Data row 53 -->
  <div
    role="row"
    aria-rowindex="54"
  >
    <div role="gridcell" aria-colindex="1" tabindex="-1">TXN-10053</div>
    <div role="gridcell" aria-colindex="2" tabindex="-1">2026-03-16</div>
    <div role="gridcell" aria-colindex="3" tabindex="-1">Transfer</div>
    <!-- ... columns 4-19 ... -->
    <div role="gridcell" aria-colindex="20" tabindex="-1">Completed</div>
  </div>

  <!-- Data row 54 (last currently rendered row) -->
  <div
    role="row"
    aria-rowindex="55"
    <!-- aria-rowindex="55" = data row 54.
         The gap between this row (55) and the maximum (10,001) tells
         assistive technology that rows 56-10,001 exist beyond the
         current viewport but are not in the DOM. -->
  >
    <div role="gridcell" aria-colindex="1" tabindex="-1">TXN-10054</div>
    <div role="gridcell" aria-colindex="2" tabindex="-1">2026-03-16</div>
    <div role="gridcell" aria-colindex="3" tabindex="-1">Payment</div>
    <!-- ... columns 4-19 ... -->
    <div role="gridcell" aria-colindex="20" tabindex="-1">Completed</div>
  </div>

  <!--
    VIRTUALIZATION IMPLEMENTATION NOTES:

    1. When the user scrolls (or navigates via arrow keys beyond the rendered range),
       the application must:
       a. Remove rows leaving the viewport from the DOM.
       b. Add new rows entering the viewport to the DOM.
       c. Update aria-rowindex on each rendered row to reflect its true position.
       d. Announce the new scroll position via the live region:
          "Showing rows 55 to 64 of 10,000."

    2. Keyboard behavior:
       - Arrow Down on the last rendered row (aria-rowindex="55") must trigger
         virtualization to render the next row (aria-rowindex="56") and move
         focus to it. The user must never "hit a wall" — navigation is seamless.
       - Ctrl+End jumps to the last row (aria-rowindex="10001") and triggers
         rendering of the final viewport.
       - Ctrl+Home jumps to the first data row (aria-rowindex="2").

    3. Focus management:
       - The roving tabindex (tabindex="0") must follow focus across
         virtualization boundaries. When a focused row is virtualized out
         (e.g., during programmatic scroll), focus should move to the nearest
         rendered row in the scroll direction.
       - Never lose focus to the document body during virtualization.

    4. aria-busy:
       - During large scroll jumps (e.g., Ctrl+End triggering data fetch),
         set aria-busy="true" on the grid. Remove it when rendering completes.
  -->

</div>
<!-- End virtualized grid -->
```

---

### Cross-Reference: WCAG 2.2 Criteria Covered Across All Patterns

| WCAG Criterion | Level | Patterns Addressing It |
|---|---|---|
| 1.1.1 Non-text Content | A | 6.2, 6.7, 6.11 |
| 1.3.1 Info and Relationships | A | 6.12, 6.14, 6.16, 6.17 |
| 1.3.2 Meaningful Sequence | A | 6.14 |
| 1.4.1 Use of Color | A | 6.1, 6.2 |
| 1.4.11 Non-text Contrast | AA | 6.1 |
| 1.4.13 Content on Hover or Focus | AA | 6.7 |
| 2.1.1 Keyboard | A | 6.3, 6.4, 6.5, 6.6, 6.8, 6.14, 6.15, 6.16 |
| 2.2.1 Timing Adjustable | A | 6.11 |
| 2.4.3 Focus Order | A | 6.6, 6.10, 6.16 |
| 2.4.5 Multiple Ways | AA | 6.10 |
| 2.4.7 Focus Visible | AA | 6.6 |
| 2.5.2 Pointer Cancellation | A | 6.5 |
| 2.5.5 Target Size (Enhanced) | AAA | 6.4 |
| 2.5.7 Dragging Movements | AA | 6.4, 6.5 |
| 2.5.8 Target Size (Minimum) | AA | 6.4 |
| 3.2.2 On Input | A | 6.3 |
| 3.3.1 Error Identification | A | 6.8 |
| 3.3.3 Error Suggestion | AA | 6.8 |
| 3.3.4 Error Prevention (Legal, Financial, Data) | AA | 6.13 |
| 3.3.6 Error Prevention (All) | AAA | 6.13 |
| 4.1.3 Status Messages | AA | 6.1, 6.2, 6.3, 6.4, 6.5, 6.8, 6.9, 6.10, 6.11, 6.12, 6.15, 6.16, 6.17 |

---

## 8. AAA Compliance Audit Checklist

Use this checklist to verify WCAG 2.2 AAA compliance for each grid variant. Each item is testable as pass/fail.

### 8.1 Universal Checklist (All Grid Variants)

#### Perceivable

- [ ] **1.1.1** Every icon (sort, filter, expand, drag) has a text alternative or is `aria-hidden="true"` when redundant with ARIA state
- [ ] **1.3.1** Grid uses correct role hierarchy (`grid`/`treegrid` > `rowgroup` > `row` > `gridcell`/`columnheader`/`rowheader`)
- [ ] **1.3.1** Every data cell is programmatically associated with its column header (via DOM position or `aria-labelledby`)
- [ ] **1.3.2** DOM reading order matches visual order (no CSS-only reordering that breaks screen reader sequence)
- [ ] **1.3.3** No instructions rely solely on shape, color, size, or visual position
- [ ] **1.4.1** Selection state is conveyed by more than color alone (checkbox, border, or icon accompanies color change)
- [ ] **1.4.1** Validation errors are conveyed by more than red color alone (icon and/or text description present)
- [ ] **1.4.1** Sort direction is conveyed by more than color alone (`aria-sort` + icon)
- [ ] **1.4.6** (AAA) Text contrast ratio ≥ 7:1 against background for all cell text, headers, and labels
- [ ] **1.4.4** Grid remains usable when browser text is zoomed to 200%
- [ ] **1.4.10** If grid exceeds viewport width, horizontal scrolling is keyboard-navigable
- [ ] **1.4.11** Focus indicator has ≥ 3:1 contrast against adjacent colors
- [ ] **1.4.11** Cell borders have ≥ 3:1 contrast if they convey structure
- [ ] **1.4.11** All meaningful icons have ≥ 3:1 contrast
- [ ] **1.4.12** Grid content does not clip or overlap with text spacing overrides (line-height 1.5×, letter-spacing 0.12em, word-spacing 0.16em)
- [ ] **1.4.13** Tooltips are dismissible (Escape), hoverable (mouse can reach tooltip), and persistent (no auto-dismiss)

#### Operable

- [ ] **2.1.3** (AAA) Every feature works with keyboard alone, with zero exceptions
- [ ] **2.1.2** Focus can exit the grid via Tab; modal editors/dialogs can be closed with Escape
- [ ] **2.4.1** A skip link or heading exists before the grid for bypassing it
- [ ] **2.4.3** Tab order is logical: skip link → toolbar → grid (single tab stop) → pagination → next element
- [ ] **2.4.6** Grid has a descriptive accessible name (`aria-label` or `aria-labelledby` pointing to heading)
- [ ] **2.4.13** (AAA) Focus indicator is ≥ 2px thick perimeter with ≥ 3:1 contrast change between focused and unfocused states
- [ ] **2.4.12** (AAA) Focused cell is completely visible — not obscured by sticky headers, footers, overlays, or z-index layers
- [ ] **2.5.5** (AAA) All interactive targets (sort buttons, expand icons, resize handles, checkboxes, filter buttons) are ≥ 44×44 CSS pixels
- [ ] **2.5.7** Column reorder has non-drag keyboard alternative
- [ ] **2.5.7** Row reorder has non-drag keyboard alternative
- [ ] **2.5.7** Column resize has non-drag keyboard alternative
- [ ] **2.5.2** Drag operations are cancelable (Escape or release outside drop zone returns to original state)

#### Understandable

- [ ] **3.2.1** Focusing a cell does not trigger unexpected actions (no auto-edit, no navigation, no modal)
- [ ] **3.2.2** Changing a cell value does not auto-submit or cause unexpected side effects
- [ ] **3.2.5** (AAA) Sort, filter, and pagination changes occur only on explicit user action (not on hover or focus)
- [ ] **3.3.1** Validation errors describe the problem in text (not just visual indication)
- [ ] **3.3.2** Editable cells and filter inputs have associated labels (column header or `aria-label`)
- [ ] **3.3.3** Validation error messages suggest corrections ("Value must be 0-100", not just "Invalid")
- [ ] **3.3.4** Destructive actions (delete, bulk edit) are reversible (undo) or require confirmation

#### Robust

- [ ] **4.1.3** Sort changes announced via live region without focus shift
- [ ] **4.1.3** Filter results announced (e.g., "Filtered to 15 of 200 rows")
- [ ] **4.1.3** Page changes announced (e.g., "Page 3 of 10")
- [ ] **4.1.3** Save/delete confirmations announced via live region
- [ ] **4.1.3** Row count changes announced after data operations

#### Keyboard Navigation

- [ ] Arrow keys navigate between cells
- [ ] Home/End navigate to first/last cell in row
- [ ] Ctrl+Home/Ctrl+End navigate to first/last cell in grid
- [ ] Page Up/Down scroll by one viewport
- [ ] Enter starts editing or activates cell content
- [ ] F2 toggles between navigation and edit mode
- [ ] Escape cancels edit and returns to navigation mode
- [ ] Space toggles selection
- [ ] Tab exits grid in navigation mode; navigates widgets in edit mode
- [ ] Shift+F10 opens context menu
- [ ] Focus returns to last focused cell when re-entering grid via Shift+Tab

#### ARIA Attributes

- [ ] `aria-sort` is set on sorted `columnheader` elements (not on `gridcell`)
- [ ] `aria-selected` is set on selected rows/cells
- [ ] `aria-readonly` is set on non-editable cells (or omitted with `aria-readonly="false"` on editable ones)
- [ ] `aria-multiselectable` is set on grid when multi-select is enabled
- [ ] `aria-rowcount`/`aria-colcount` reflect total data count (when virtualized or columns hidden)
- [ ] `aria-rowindex`/`aria-colindex` are correct and 1-based (especially across frozen column panes)
- [ ] `aria-invalid` and `aria-errormessage` are set on cells with validation errors

---

### 8.2 Per-Variant Additions

#### Tree Grid

- [ ] Container uses `role="treegrid"` (not `role="grid"`)
- [ ] Every row has `aria-level` reflecting its nesting depth (1-based)
- [ ] Parent rows have `aria-expanded="true|false"`
- [ ] Leaf rows do NOT have `aria-expanded`
- [ ] `aria-setsize` and `aria-posinset` are set on rows within each level
- [ ] Right Arrow on collapsed parent row expands it
- [ ] Left Arrow on expanded parent row collapses it
- [ ] Left Arrow on child row moves focus to parent
- [ ] When parent is collapsed and focus was on a child, focus moves to parent
- [ ] Lazy-loaded children: `aria-busy="true"` on parent during fetch, `"false"` when done
- [ ] Tri-state checkboxes use `aria-checked="mixed"` when partially selected

#### Pivot Table

- [ ] `aria-roledescription="pivot table"` on grid container
- [ ] Multi-level column headers have unique `id` attributes
- [ ] Data cells have `headers` attribute listing ALL contributing row AND column header IDs
- [ ] Grand total row/column has explicit text label ("Grand Total")
- [ ] Dimension grouping headers have `aria-expanded` for drill-down
- [ ] Dynamic column changes announced via live region

#### Gantt Chart

- [ ] Dual regions: `role="grid"` for task list, `role="application"` for timeline only
- [ ] `role="application"` is NOT applied to the entire Gantt — only the timeline
- [ ] Outer landmark: `aria-label="Gantt Chart"`
- [ ] Task bars have descriptive `aria-label` (name, dates, duration, progress, assignee)
- [ ] Dependencies exposed via `aria-describedby` pointing to hidden dependency text
- [ ] Progress shown via `aria-valuenow`/`aria-valuemin`/`aria-valuemax`
- [ ] Milestones distinguished with `aria-roledescription="milestone"`
- [ ] `aria-current="date"` on today's date marker
- [ ] Tab key moves between grid and timeline regions
- [ ] Arrow keys in timeline adjust dates; Shift+Arrow adjusts duration

#### Spreadsheet

- [ ] Address bar (`role="status"`, `aria-live="polite"`) shows current cell reference (e.g., "A1")
- [ ] Cell `aria-label` includes cell reference ("Cell A1: 42")
- [ ] Formula bar (`role="textbox"`, `aria-label="Formula Bar"`) shows formula when cell is focused
- [ ] Sheet tabs use `role="tablist"` > `role="tab"` with `aria-selected` on active sheet
- [ ] Ctrl+Arrow jumps to edge of data region
- [ ] Ctrl+D fills down; Ctrl+R fills right
- [ ] Clipboard operations announce context via live region ("Copied 3×2 range")

#### Master-Detail

- [ ] Expandable rows have `aria-expanded="true|false"`
- [ ] `aria-controls` on expandable row points to detail panel ID
- [ ] Detail panel has `role="region"` with descriptive `aria-label`
- [ ] Nested grids within detail have their own `role="grid"` and `aria-label`
- [ ] Enter expands detail; Escape collapses and returns focus
- [ ] Tab moves focus from parent row into detail panel
- [ ] Shift+Tab returns focus from detail to parent row
- [ ] When detail collapses with focus inside, focus returns to parent row

---

### 8.3 Testing Methodology

#### Screen Reader Testing

Test with at least 2 of the following combinations:

| Screen Reader | Browser | OS | Priority |
|---------------|---------|-----|----------|
| NVDA | Chrome | Windows | Required |
| JAWS | Chrome | Windows | Required |
| VoiceOver | Safari | macOS | Recommended |
| TalkBack | Chrome | Android | Recommended (mobile) |
| Narrator | Edge | Windows | Optional |

**For each combination, verify:**
1. Grid structure announced correctly ("grid, 500 rows, 8 columns" or similar)
2. Cell navigation announces column header + cell value
3. Sort state announced on sorted column headers
4. Selection state announced when toggling rows/cells
5. Expand/collapse announced on tree/detail rows
6. Status messages (filter results, page changes) announced without focus shift
7. Edit mode entered and exited correctly with announcements

#### Automated Testing Tools

| Tool | What It Tests | Usage |
|------|---------------|-------|
| axe-core | ARIA validity, contrast, roles, labels | Integrate in CI/CD or run via browser extension |
| Lighthouse | Accessibility score, common issues | Chrome DevTools → Lighthouse → Accessibility |
| WAVE | Visual overlay of issues | Browser extension |
| IBM Equal Access | Full WCAG 2.1 compliance | Browser extension or CI tool |

#### Manual Testing Protocol

1. **Keyboard-only navigation:** Disconnect mouse. Navigate entire grid using only keyboard. Verify all features accessible.
2. **200% zoom:** Browser zoom to 200%. Verify grid is usable — cells expand, scroll works, no overlapping text.
3. **Text spacing override:** Apply CSS overrides (line-height: 1.5, letter-spacing: 0.12em, word-spacing: 0.16em). Verify no content clipped or overlapping.
4. **Forced colors mode (Windows High Contrast):** Enable Windows High Contrast. Verify focus indicators, selection states, sort indicators, and borders all remain visible.
5. **Reduced motion:** Set `prefers-reduced-motion: reduce`. Verify row animations and transitions are suppressed or minimal.
6. **Portrait/landscape:** Rotate mobile device or resize window. Verify grid works in both orientations.
7. **Target size audit:** Measure interactive targets (sort buttons, expand icons, resize handles, checkboxes). Verify ≥ 44×44 CSS pixels for AAA.
