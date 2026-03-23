# FD-04: Accessibility Foundation

This foundation establishes the baseline accessibility model for the tabular grid component. The Data Grid's complete ARIA structure is defined HERE; the Tree Grid, Pivot Table, and Gantt Chart variant-specific extensions are in `03-variant-specific/` and EXTEND this baseline. All four variants inherit every requirement in this document unless their variant-specific file explicitly overrides it.

The target compliance level is **WCAG 2.2 AAA**. Every requirement uses RFC 2119 language (MUST, SHOULD, MAY) to indicate its normative weight.

> **Prerequisite**: Read [FD-01: CSS Subgrid Layout Model](01-layout-model.md) for the DOM structure that the ARIA attributes attach to, and [FD-02: Variant Model](02-variant-model.md) for ARIA role assignments per variant.

> **Scope boundary**: This document defines the *structural* accessibility model -- DOM/ARIA hierarchy, focus management, live regions, and interaction model. Feature-level ARIA details (e.g., sort indicator announcements, validation error markup) are specified in their respective feature files in `02-features/` and cross-referenced here.

---

## 4.1 Data Grid Baseline DOM/ARIA Structure

The Data Grid uses `<div>` elements (not `<table>`) because the CSS subgrid layout model (FD-01) requires explicit grid containers. All semantic meaning MUST be conveyed through ARIA roles and attributes.

### 4.1.1 Annotated HTML Example

```html
<!-- Root grid container -->
<div role="grid"
     aria-label="Employee directory"
     aria-rowcount="1284"
     aria-colcount="6"
     aria-multiselectable="true">

  <!-- Header rowgroup -->
  <div role="rowgroup">
    <div role="row" aria-rowindex="1">
      <!-- Selector column: not a data column, use presentation wrapper if needed -->
      <div role="columnheader" aria-colindex="1">
        <input type="checkbox" aria-label="Select all rows" tabindex="-1">
      </div>
      <div role="columnheader" aria-colindex="2" aria-sort="ascending">
        Name
      </div>
      <div role="columnheader" aria-colindex="3" aria-sort="none">
        Department
      </div>
      <div role="columnheader" aria-colindex="4" aria-sort="none">
        Email
      </div>
      <div role="columnheader" aria-colindex="5" aria-sort="none">
        Start Date
      </div>
      <div role="columnheader" aria-colindex="6" aria-sort="none">
        Salary
      </div>
    </div>
  </div>

  <!-- Body rowgroup -->
  <div role="rowgroup">
    <div role="row"
         aria-rowindex="2"
         aria-selected="false">
      <div role="gridcell" aria-colindex="1">
        <input type="checkbox" aria-label="Select Alice Johnson" tabindex="-1">
      </div>
      <div role="rowheader" aria-colindex="2" tabindex="0">
        Alice Johnson
      </div>
      <div role="gridcell" aria-colindex="3" tabindex="-1">
        Engineering
      </div>
      <div role="gridcell" aria-colindex="4" tabindex="-1"
           aria-readonly="false">
        alice.johnson@example.com
      </div>
      <div role="gridcell" aria-colindex="5" tabindex="-1">
        2021-03-15
      </div>
      <div role="gridcell" aria-colindex="6" tabindex="-1">
        $95,000
      </div>
    </div>

    <div role="row"
         aria-rowindex="3"
         aria-selected="true">
      <div role="gridcell" aria-colindex="1">
        <input type="checkbox" aria-label="Select Bob Smith" tabindex="-1"
               checked>
      </div>
      <div role="rowheader" aria-colindex="2" tabindex="-1">
        Bob Smith
      </div>
      <div role="gridcell" aria-colindex="3" tabindex="-1">
        Marketing
      </div>
      <div role="gridcell" aria-colindex="4" tabindex="-1"
           aria-readonly="false">
        bob.smith@example.com
      </div>
      <div role="gridcell" aria-colindex="5" tabindex="-1">
        2019-07-01
      </div>
      <div role="gridcell" aria-colindex="6" tabindex="-1">
        $88,000
      </div>
    </div>
    <!-- Additional rows... -->
  </div>

  <!-- Live region: OUTSIDE the grid role hierarchy (see 4.6) -->
  <div aria-live="polite" aria-atomic="true" class="sr-only"
       id="grid-live-region"></div>
</div>
```

### 4.1.2 Role Hierarchy Rules

| Level | Role | Required attributes | Notes |
|-------|------|-------------------|-------|
| Root | `grid` | `aria-label` or `aria-labelledby`, `aria-rowcount`, `aria-colcount` | MUST be the outermost semantic container |
| Group | `rowgroup` | None required | Separates header, body, and footer sections |
| Row | `row` | `aria-rowindex` | MUST be 1-based, continuous across all rowgroups |
| Header cell | `columnheader` | `aria-colindex`, optionally `aria-sort` | One per column in the header row |
| Row identifier | `rowheader` | `aria-colindex` | Used for the cell that uniquely identifies the row (e.g., Name) |
| Data cell | `gridcell` | `aria-colindex` | All non-header, non-rowheader cells |

### 4.1.3 Intermediate Wrapper Elements

Any `<div>` or `<span>` inserted for layout purposes between semantic elements (e.g., a styling wrapper inside a `gridcell`) MUST carry `role="presentation"` or `role="none"` to prevent the assistive technology from interpreting it as meaningful structure. Alternatively, the wrapper SHOULD be removed from the accessibility tree entirely if it serves no semantic purpose.

```html
<!-- Correct: layout wrapper with role="presentation" -->
<div role="gridcell" aria-colindex="3" tabindex="-1">
  <div role="presentation" class="cell-content-wrapper">
    Engineering
  </div>
</div>
```

### 4.1.4 Key ARIA Attributes Reference

| Attribute | Element | Value | Purpose |
|-----------|---------|-------|---------|
| `aria-rowcount` | `grid` | Total data rows (including header rows) | Enables AT to announce "row N of M" even under virtualization |
| `aria-colcount` | `grid` | Total columns (including hidden/virtualized) | Enables AT to announce "column N of M" |
| `aria-rowindex` | `row` | 1-based position in the full dataset | MUST be continuous; header row = 1, first data row = 2 |
| `aria-colindex` | `columnheader`, `rowheader`, `gridcell` | 1-based position in the full column set | MUST be continuous across frozen and scrollable panes |
| `aria-selected` | `row` or `gridcell` | `"true"` or `"false"` | MUST be present on ALL selectable rows/cells when selection is enabled |
| `aria-sort` | `columnheader` | `"ascending"`, `"descending"`, `"none"`, `"other"` | MUST be present on ALL sortable column headers |
| `aria-readonly` | `grid`, `gridcell` | `"true"` or `"false"` | See FD-03 Section 3.5 for inheritance rules |
| `aria-multiselectable` | `grid` | `"true"` | MUST be set when multiple rows/cells can be selected |
| `aria-busy` | `grid` | `"true"` during async operations | Tells AT the grid is updating; do not announce intermediate states |

---

## 4.2 WCAG 2.2 AAA Target

The tabular grid MUST satisfy ALL applicable WCAG 2.2 criteria up to and including Level AAA. The following table lists every applicable success criterion with grid-specific implementation notes.

### 4.2.1 Perceivable

| SC | Name | Level | Grid-Specific Implementation Notes |
|----|------|-------|-----------------------------------|
| 1.1.1 | Non-text Content | A | Icon-only cells (status indicators, action buttons) MUST have text alternatives via `aria-label`. Cell images MUST have `alt` text. Decorative icons MUST be `aria-hidden="true"`. |
| 1.3.1 | Info and Relationships | A | The `grid` > `rowgroup` > `row` > `columnheader`/`gridcell` hierarchy MUST be expressed in ARIA roles. Column headers MUST be programmatically associated with their cells via `aria-colindex` alignment. Sort state MUST use `aria-sort`, not just visual indicators. Selection state MUST use `aria-selected`. |
| 1.3.2 | Meaningful Sequence | A | DOM order MUST match the logical reading order (left-to-right per row, top-to-bottom per grid in LTR locales). Column reorder via CSS (`order` property) MUST NOT break the accessibility tree order. See FD-01 Section 1.3.5. |
| 1.3.3 | Sensory Characteristics | A | Instructions MUST NOT rely solely on shape, color, size, or visual location. "Click the green cell" is insufficient; "Click the cell marked as valid" is acceptable. Sort direction MUST be conveyed by `aria-sort`, not only by arrow icons. |
| 1.3.4 | Orientation | AA | The grid MUST be usable in both portrait and landscape orientations. Content MUST NOT be locked to a single orientation unless essential. |
| 1.4.1 | Use of Color | A | Row selection, cell editing state, validation errors, and sort indicators MUST NOT rely on color alone. Combine color with: borders, icons, text labels, underlines, or patterns. |
| 1.4.3 | Contrast (Minimum) | AA | All text in cells MUST have a 4.5:1 contrast ratio against the cell background (3:1 for large text). This applies to every density/theme combination. Striped row backgrounds MUST maintain contrast for text in both stripe colors. |
| 1.4.4 | Resize Text | AA | The grid MUST remain functional when text is resized up to 200%. Column widths SHOULD adapt (content wrapping or horizontal scroll). Text MUST NOT be clipped without a mechanism to access the full content (tooltip or expandable cell). |
| 1.4.6 | Contrast (Enhanced) | AAA | All text MUST have a 7:1 contrast ratio against the cell background (4.5:1 for large text). This is the AAA enhancement over 1.4.3. |
| 1.4.10 | Reflow | AA | At 320px viewport width (400% zoom of 1280px), content MUST reflow without horizontal scrolling for the primary content. For grids, this is satisfied if the grid provides a horizontal scrollbar AND the scroll mechanism is keyboard-accessible. Grids are inherently two-dimensional and are exempt from the "no horizontal scroll" requirement per the WCAG exception for data tables. |
| 1.4.11 | Non-text Contrast | AA | Focus indicators, cell borders, selection outlines, sort icons, expand/collapse carets, and frozen-column separators MUST have a 3:1 contrast ratio against adjacent colors. |
| 1.4.12 | Text Spacing | AA | The grid MUST remain functional when line height is set to 1.5x, letter spacing to 0.12em, word spacing to 0.16em, and paragraph spacing to 2x. Content MAY be clipped but MUST remain accessible via a mechanism (scroll, tooltip). |
| 1.4.13 | Content on Hover or Focus | AA | Tooltips and popovers triggered by hover or focus MUST be: (a) dismissible via Escape without moving focus, (b) hoverable (the pointer can move to the tooltip), (c) persistent until dismissed or the trigger loses hover/focus. |

### 4.2.2 Operable

| SC | Name | Level | Grid-Specific Implementation Notes |
|----|------|-------|-----------------------------------|
| 2.1.1 | Keyboard | A | ALL grid operations MUST be keyboard-accessible: navigation, selection, sorting, editing, context menus, column resize/reorder, row expand/collapse. See F-14. |
| 2.1.2 | No Keyboard Trap | A | Tab MUST exit the grid. Escape MUST exit Edit Mode. The grid MUST NOT trap keyboard focus. Escape from any popup, dropdown, or overlay MUST return focus to the triggering cell. |
| 2.1.3 | Keyboard (No Exception) | AAA | No exceptions. Every operation performable by mouse MUST be performable by keyboard. This includes drag-to-reorder columns, drag-to-resize, and fill-handle drag. |
| 2.2.1 | Timing Adjustable | A | If the grid auto-saves or auto-commits edits on a timer, the user MUST be able to extend, disable, or adjust the timeout. Debounced operations (e.g., search-as-you-type in a filter) MUST NOT discard the user's input. |
| 2.4.1 | Bypass Blocks | A | The grid MUST be a single Tab stop. Tab enters the grid (focus lands on the last-focused cell), and Tab again exits the grid. This provides a bypass mechanism -- the user does not need to Tab through every cell. |
| 2.4.3 | Focus Order | A | Focus order MUST follow a logical sequence: left-to-right, top-to-bottom within the grid. Tab order between the grid and surrounding page elements MUST be predictable. |
| 2.4.6 | Headings and Labels | AA | The grid MUST have an accessible name via `aria-label` or `aria-labelledby`. Column headers serve as implicit labels for their cells. Filter inputs MUST have associated labels. |
| 2.4.7 | Focus Visible | AA | The focused cell MUST have a visible focus indicator. The indicator MUST be visible in all themes and density modes. |
| 2.4.11 | Focus Not Obscured (Minimum) | AA | The focused cell MUST NOT be fully obscured by sticky headers, frozen columns, or overlapping UI elements. If the focused cell would be obscured, the grid MUST scroll it into view. |
| 2.4.12 | Focus Not Obscured (Enhanced) | AAA | The focused cell MUST NOT be even partially obscured. The entire cell MUST be visible when it receives focus. |
| 2.4.13 | Focus Appearance | AAA | The focus indicator MUST have an area of at least a 2px-thick perimeter around the cell, with a contrast ratio of at least 3:1 between the focused and unfocused states. |
| 2.5.1 | Pointer Gestures | A | Any multipoint or path-based gesture (e.g., pinch-to-zoom the Gantt timeline) MUST have a single-pointer alternative. Column resize MUST work with a single click-and-drag (not require multi-finger). |
| 2.5.2 | Pointer Cancellation | A | Drag operations (column resize, row reorder, fill handle) MUST support cancellation: releasing outside the target area, or pressing Escape during drag, MUST revert the operation. |
| 2.5.3 | Label in Name | A | Interactive elements with visible labels (sort buttons, filter inputs, menu items) MUST include the visible label text in their accessible name. |
| 2.5.5 | Target Size (Enhanced) | AAA | Interactive targets (sort toggle, filter clear button, expand/collapse caret, checkbox) MUST be at least 44x44 CSS pixels, or the spacing between targets MUST provide an equivalent effective target area. |
| 2.5.7 | Dragging Movements | AA | Any operation that requires dragging (column reorder, column resize, row reorder, fill handle) MUST have a non-dragging alternative. Column reorder MUST be achievable via a keyboard shortcut or menu. Column resize MUST be achievable via keyboard (e.g., Shift+Arrow on a column header). |
| 2.5.8 | Target Size (Minimum) | AA | Interactive targets MUST be at least 24x24 CSS pixels, or have sufficient spacing such that a 24px diameter circle centered on the target does not overlap other targets. |

### 4.2.3 Understandable

| SC | Name | Level | Grid-Specific Implementation Notes |
|----|------|-------|-----------------------------------|
| 3.2.1 | On Focus | A | Moving focus to a cell MUST NOT automatically trigger a context change (e.g., loading a detail view, opening a dialog). Context changes MUST require explicit user action (Enter, click). |
| 3.2.2 | On Input | A | Changing a filter value or sort column MUST NOT cause an unexpected context change. The grid MAY auto-apply filters, but MUST NOT navigate to another page or open a new window. |
| 3.2.5 | Change on Request | AAA | ALL changes of context MUST be initiated by the user or announced in advance. Server-side data refreshes MUST NOT silently replace the grid content -- use `aria-busy` and announce completion via live region. |
| 3.3.1 | Error Identification | A | Cell validation errors MUST be identified in text and associated with the cell via `aria-invalid` and `aria-errormessage`. See F-18. |
| 3.3.2 | Labels or Instructions | A | Filter inputs MUST have visible labels. Editor inputs MUST be labeled by their column header. Required cells MUST be marked with `aria-required="true"`. |
| 3.3.3 | Error Suggestion | AA | Validation errors SHOULD include a suggestion for correction (e.g., "Expected format: YYYY-MM-DD"). |
| 3.3.4 | Error Prevention (Legal, Financial, Data) | AA | For grids that modify legal, financial, or user-controlled data: changes MUST be reversible (undo), verifiable (confirmation before batch commit), or reviewable (summary of changes before save). |

### 4.2.4 Robust

| SC | Name | Level | Grid-Specific Implementation Notes |
|----|------|-------|-----------------------------------|
| 4.1.3 | Status Messages | AA | All status messages (sort applied, filter applied, page changed, row count updated, save success/failure) MUST be announced to AT without receiving focus. Use `aria-live="polite"` regions (see Section 4.6). |

---

## 4.3 Focus Management

The grid MUST implement a focus management strategy that provides efficient keyboard navigation while maintaining a single Tab stop. Two strategies are defined: **roving tabindex** (primary) and **aria-activedescendant** (fallback).

### 4.3.1 Roving Tabindex (Primary Strategy)

Roving tabindex is the W3C APG-recommended strategy for grid focus management. It provides the most reliable screen reader support across all browser/AT combinations.

**Principle**: Exactly one cell in the grid has `tabindex="0"` at any time. All other cells have `tabindex="-1"`. Arrow key navigation updates the tabindex values and calls `.focus()` on the target cell.

**Algorithm**:

```
On arrow key press (e.g., ArrowRight):
  1. Determine target cell (current row, next column)
  2. If target exists and is navigable:
     a. Set current cell tabindex = -1
     b. Set target cell tabindex = 0
     c. Call target.focus()
  3. If target does not exist (edge of grid):
     a. No action (see 4.13 Edge Wrapping Prohibition)
```

**Advantages**:
- Screen readers announce the focused cell's content, role, and position reliably.
- Works consistently across NVDA, JAWS, VoiceOver, Narrator, and TalkBack.
- The browser's native focus mechanism handles scroll-into-view automatically.

**Disadvantages**:
- Every navigation keystroke modifies the DOM (two `tabindex` mutations + one `focus()` call).
- Under heavy virtualization, the target cell may not be in the DOM when the arrow key is pressed.

### 4.3.2 aria-activedescendant (Fallback Strategy)

`aria-activedescendant` is an alternative focus management pattern where the grid container itself holds focus, and the "active" cell is indicated via an `aria-activedescendant` attribute pointing to the cell's ID.

**Principle**: The grid container has `tabindex="0"` and maintains focus. Cells do not have `tabindex`. The `aria-activedescendant` attribute on the grid points to the ID of the visually highlighted cell.

```html
<div role="grid" tabindex="0" aria-activedescendant="cell-3-2">
  ...
  <div role="gridcell" id="cell-3-2" aria-colindex="2">Engineering</div>
  ...
</div>
```

**Algorithm**:

```
On arrow key press (e.g., ArrowRight):
  1. Determine target cell ID
  2. Update aria-activedescendant = target cell ID
  3. Update visual highlight (CSS class) from old cell to target cell
  4. Do NOT call .focus() on the cell
```

**Advantages**:
- No DOM focus changes; only one attribute mutation per navigation.
- Cells do not need to be in the DOM for the grid to "remember" the active cell.
- Avoids focus-loss issues when cells are virtualized out of the DOM.

**Disadvantages**:
- Screen reader support is less consistent. Some AT combinations do not reliably announce the `aria-activedescendant` target on attribute change.
- The cell content is not natively focused, which can cause AT to miss announcements of cell text, especially for cells with rich content.
- Browser scroll-into-view does not trigger (the container is already focused).

### 4.3.3 Hybrid Approach (Recommended)

The grid SHOULD use a hybrid strategy:

1. **Normal operation**: Use roving tabindex. This provides the best AT support.
2. **During rapid scrolling** (e.g., holding down an arrow key, Page Up/Down, Ctrl+End): Temporarily switch to aria-activedescendant to avoid rapid DOM focus thrashing and to handle cells that are being virtualized in/out of the DOM during the scroll.
3. **After scroll settles** (debounced, ~150ms after last navigation keystroke): Switch back to roving tabindex. Set the target cell's `tabindex="0"`, call `.focus()`, and remove `aria-activedescendant` from the grid.

### 4.3.4 Comparison Table

| Criterion | Roving Tabindex | aria-activedescendant | Hybrid |
|-----------|----------------|----------------------|--------|
| Screen reader reliability | Best | Inconsistent | Best (normal), acceptable (rapid scroll) |
| DOM mutations per navigation | 3 (2 tabindex + 1 focus) | 1 (attribute) | Context-dependent |
| Virtualization compatibility | Requires cell in DOM | Works without cell in DOM | Both |
| Scroll-into-view | Automatic (browser) | Manual (JS required) | Context-dependent |
| Implementation complexity | Low | Medium | High |
| Recommended for | Primary use | Fallback only | Production grids |

---

## 4.4 Focus Restoration on Re-entry

When the user Tabs out of the grid and then Shift+Tabs back (or Tabs forward back to the grid), focus MUST return to the **last focused cell**, not to the first cell of the grid.

### 4.4.1 Algorithm

```
On focusout event (grid loses focus):
  1. Store lastFocusedRow = current focused cell's rowIndex
  2. Store lastFocusedCol = current focused cell's colIndex
  3. The cell with tabindex="0" retains its tabindex value (no change needed)

On focusin event (grid regains focus via Tab/Shift+Tab):
  1. If the focus target is the grid container itself (not a specific cell):
     a. Find the cell at (lastFocusedRow, lastFocusedCol)
     b. If that cell is in the DOM: call cell.focus()
     c. If that cell is NOT in the DOM (virtualized out):
        - Scroll to bring the row into view
        - After render, set tabindex="0" on the cell and call cell.focus()
  2. If the focus target is already a cell (browser focused the tabindex="0" cell):
     a. No redirect needed; the browser did the right thing
```

### 4.4.2 Edge Cases

| Scenario | Behavior |
|----------|----------|
| Stored cell's row was deleted | Focus the cell at the same column in the nearest row. If no rows remain, focus the first column header. |
| Stored cell's column was hidden | Focus the nearest visible cell in the same row. |
| Grid data was completely replaced | Focus the cell at (first data row, first visible column) and reset stored coordinates. |
| Grid has zero rows | Focus the first column header. |

---

## 4.5 Focus During Virtualization

Virtualization removes cells from the DOM when they scroll out of view. The grid MUST maintain logical focus through these transitions.

### 4.5.1 State Storage

The grid MUST maintain two state variables:

```
focusedRowIndex: number    // 1-based, matches aria-rowindex
focusedColIndex: number    // 1-based, matches aria-colindex
```

These values represent the logical position of focus, independent of whether the corresponding DOM element exists.

### 4.5.2 Focused Cell Scrolls Out of View

When the user scrolls (via scrollbar or mouse wheel) such that the focused cell leaves the rendered DOM:

1. The grid container receives focus (as the cell is removed from the DOM, focus falls to the nearest focusable ancestor).
2. The grid MUST NOT interpret this as "the user tabbed out." Instead, set a `focusStoredDuringVirtualization = true` flag.
3. The grid MUST visually indicate that focus is logically within the grid (e.g., maintain the grid's focus outline).
4. The stored `focusedRowIndex` and `focusedColIndex` remain unchanged.

### 4.5.3 Focused Cell Scrolls Back Into View

When the row containing the stored focus coordinates is re-rendered in the DOM:

1. Find the cell at `(focusedRowIndex, focusedColIndex)`.
2. Set its `tabindex="0"`.
3. If `focusStoredDuringVirtualization === true` AND the grid container still has focus:
   - Call `cell.focus()`.
   - Set `focusStoredDuringVirtualization = false`.

### 4.5.4 Arrow Key Navigation While Focus Is Stored

When the user presses an arrow key while `focusStoredDuringVirtualization === true`:

1. Calculate the target cell coordinates based on `focusedRowIndex` and `focusedColIndex` plus the arrow direction.
2. Update `focusedRowIndex` and/or `focusedColIndex` to the target.
3. If the target row is not in the DOM: scroll to bring it into view. After the render cycle, set `tabindex="0"` on the target cell and call `.focus()`.
4. If the target row is already in the DOM: set `tabindex="0"` on the target cell and call `.focus()`. Clear the `focusStoredDuringVirtualization` flag.

### 4.5.5 Constraints

- The grid MUST NOT lose the logical focus position when cells are virtualized. Focus MUST survive any number of scroll-out/scroll-back cycles.
- `aria-rowcount` and `aria-colcount` on the grid element MUST always reflect the total dataset size, not the rendered DOM count.
- `aria-rowindex` on each rendered row MUST reflect the row's position in the full dataset, ensuring screen readers announce the correct "row N of M."

---

## 4.6 Live Region Architecture

A live region provides asynchronous announcements to screen readers without moving focus. The grid MUST maintain a dedicated live region for status announcements.

### 4.6.1 DOM Structure

```html
<!-- Live region: placed INSIDE the grid's shadow DOM or as a sibling,
     but OUTSIDE the role="grid" subtree to avoid interfering with
     the grid's ARIA structure. -->
<div id="grid-live-region"
     aria-live="polite"
     aria-atomic="true"
     class="sr-only"
     role="log">
</div>

<!-- Alert region: for critical errors only -->
<div id="grid-alert-region"
     role="alert"
     class="sr-only">
</div>
```

**CSS for `.sr-only`** (visually hidden but accessible to AT):

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### 4.6.2 Placement Rules

- The live region element MUST exist in the DOM **before** any content is injected into it. Creating the element and immediately setting `textContent` can cause AT to miss the first announcement.
- The live region MUST be OUTSIDE the `role="grid"` subtree. Placing it inside the grid can cause some AT to treat its content as grid cell content.
- The live region SHOULD be a sibling of the grid container or placed inside the component's shadow root adjacent to the grid.

### 4.6.3 Polite vs. Assertive

| Priority | Mechanism | When to use |
|----------|-----------|-------------|
| Polite | `aria-live="polite"` | Sort applied, filter applied, page changed, rows loaded, selection changed, grid updated |
| Assertive | `role="alert"` (implicitly `aria-live="assertive"`) | Critical errors only: save failure, data loss warning, network error |

**Rule of thumb**: If the announcement can wait for the screen reader to finish its current utterance, use polite. If the user MUST hear the announcement immediately (data integrity at risk), use assertive. Overuse of assertive disrupts the screen reader's reading flow.

### 4.6.4 Announcement Debouncing

Rapid operations (e.g., the user sorts, then immediately filters, then pages) can produce a burst of announcements that overwhelm the screen reader. The grid MUST debounce live region updates:

1. When a new announcement is queued, start a debounce timer (200-300ms).
2. If another announcement arrives before the timer fires, replace the pending announcement with the new one (or merge them).
3. When the timer fires, inject the final announcement text into the live region.

For operations that produce incremental updates (e.g., "Loading rows... 50 of 200... 100 of 200..."), the grid SHOULD announce only the final state ("200 rows loaded").

### 4.6.5 Event-to-Announcement Table

| Event | Announcement text | Priority | Notes |
|-------|-------------------|----------|-------|
| Sort applied | "Sorted by {column}, {direction}" | Polite | E.g., "Sorted by Name, ascending" |
| Multi-column sort applied | "Sorted by {col1} {dir1}, then {col2} {dir2}" | Polite | List all active sorts |
| Sort removed | "Sort removed from {column}" | Polite | When cycling from desc back to unsorted |
| Filter applied | "Filtered. {N} rows match." | Polite | Include count if known |
| Filter removed | "Filter removed. {N} rows." | Polite | |
| All filters cleared | "All filters cleared. {N} rows." | Polite | |
| Page changed | "Page {N} of {M}. Showing rows {start} to {end}." | Polite | For client-side pagination |
| Rows loaded (async) | "{N} rows loaded." | Polite | For server-side or lazy-load |
| Grid loading started | "Loading data." | Polite | Pair with `aria-busy="true"` |
| Grid loading complete | "{N} rows loaded." | Polite | Pair with `aria-busy="false"` |
| Row deleted | "Row deleted. {N} rows remaining." | Polite | |
| Row added (user) | "Row added." | Polite | Focus moves to new row (see 4.9) |
| Row added (async) | "New row added: {identifier}." | Polite | Focus does NOT move |
| Save success | "Changes saved." | Polite | |
| Save failure | "Save failed. {reason}." | Assertive | Critical: use `role="alert"` |
| Selection changed | "{N} rows selected." | Polite | Debounce heavily during range selection |
| Column resized | "{column} resized to {width}." | Polite | Only announce on resize end, not during |
| Column reordered | "{column} moved to position {N}." | Polite | |
| Group expanded | "{group name} expanded. {N} rows." | Polite | |
| Group collapsed | "{group name} collapsed." | Polite | |

---

## 4.7 Screen Reader Interaction Model

Understanding how screen readers interact with ARIA grids is essential for correct implementation. This section documents the interaction model that all grid features MUST account for.

### 4.7.1 Forms Mode / Application Mode

When a screen reader user navigates into a `role="grid"` element, the screen reader typically enters **forms mode** (also called "focus mode" or "application mode" depending on the AT). In this mode:

- **Single-key shortcuts** (H for headings, T for tables, arrow keys for browsing) are **disabled**. Keystrokes pass through to the web application.
- The user navigates using the grid's own keyboard model (arrow keys between cells, Enter to edit, etc.).
- Only the **focused element and its text descendants** are announced. Content in other cells is NOT read aloud unless the user navigates to them.

### 4.7.2 Implications for Cell Content

Because only the focused cell is announced:

- Every cell with meaningful content MUST be focusable (via `tabindex="-1"` or `tabindex="0"` for the active cell).
- Non-focusable content inside a forms-mode grid is **invisible** to screen reader users.
- Empty cells SHOULD still be focusable. The screen reader will announce them as "blank" or announce the column header, which tells the user the cell exists but has no value.

### 4.7.3 Browse Mode Fallback

Some screen reader users may toggle back to **browse mode** (by pressing Escape or a mode-toggle key). In browse mode, the AT reads the grid content linearly, similar to reading a `<table>`. The grid's ARIA structure (`role="row"`, `role="gridcell"`, `aria-colindex`) enables AT to announce row/column context during linear reading.

The grid SHOULD NOT prevent browse mode. If the user toggles to browse mode, the ARIA structure provides adequate context. However, grid keyboard shortcuts will not work in browse mode.

---

## 4.8 Focus Within Cells

Different cell content types require different focus strategies. The grid MUST implement the appropriate strategy based on the cell's content.

### 4.8.1 Static Text Cell

```html
<!-- Focus target: the gridcell itself -->
<div role="gridcell" aria-colindex="3" tabindex="-1">
  Engineering
</div>
```

The `gridcell` element receives focus. Arrow keys move focus to adjacent cells. The screen reader announces the cell text and column header.

### 4.8.2 Single Interactive Widget Cell

```html
<!-- Focus target: the widget directly, NOT the parent gridcell -->
<div role="gridcell" aria-colindex="1">
  <input type="checkbox"
         aria-label="Select Alice Johnson"
         tabindex="-1">
</div>
```

When the cell contains a **single** interactive widget, focus MUST target the widget directly, not the parent `gridcell`. The `gridcell` does NOT have a `tabindex`. This allows the user to operate the widget immediately (e.g., Space toggles the checkbox) without an extra Enter keystroke.

**Rules**:
- The widget has `tabindex="-1"` (or `tabindex="0"` when it is the active cell in the roving tabindex scheme).
- Arrow keys still move focus to adjacent cells (the grid intercepts arrow keys before the widget receives them).
- Space and Enter operate the widget.

### 4.8.3 Single Checkbox Cell (Special Case)

A cell containing only a checkbox for row selection follows the single-widget pattern above. Additionally:

- The checkbox MUST have an `aria-label` that identifies the row (e.g., "Select Alice Johnson").
- Space toggles the checkbox AND updates `aria-selected` on the row.
- The checkbox state and `aria-selected` MUST always be synchronized.

### 4.8.4 Multiple Interactive Widgets Cell

```html
<!-- Focus target: gridcell in Navigation Mode, widgets in Edit Mode -->
<div role="gridcell" aria-colindex="7" tabindex="-1">
  <button tabindex="-1" aria-label="Edit record">Edit</button>
  <button tabindex="-1" aria-label="Delete record">Delete</button>
</div>
```

When the cell contains **multiple** interactive widgets, the two-level focus model (FD-03 Section 5) applies:

1. **Navigation Mode**: The `gridcell` element receives focus. Arrow keys navigate between cells. The screen reader announces "Edit button, Delete button" (or the cell's text content).
2. **Enter/F2**: Focus moves to the first widget inside the cell. Tab cycles between widgets. Escape returns to the `gridcell`.

### 4.8.5 Non-Focusable Content Warning

In forms mode, any content inside a `gridcell` that is not the focus target and is not a text descendant of the focus target is **invisible** to screen readers. This means:

- An `<img>` inside a `gridcell` that is not the focus target: invisible. **Solution**: Add `alt` text that becomes part of the `gridcell`'s text content, or use `aria-label` on the `gridcell`.
- A `<span class="badge">` with icon-only content: invisible. **Solution**: Add `aria-label` to the `gridcell` or use `sr-only` text.
- A secondary text element (e.g., subtitle) that is a text descendant of the focused `gridcell`: visible and announced.

---

## 4.9 Focus on Row Add/Remove

### 4.9.1 Row Deletion

When a row is deleted (by user action or API):

1. If the deleted row contained the focused cell:
   - Move focus to the **same column in the next row** (the row below the deleted one).
   - If the deleted row was the last row: move focus to the **same column in the new last row**.
   - If no rows remain: move focus to the first column header.
2. Update `aria-rowcount` on the grid.
3. Announce via live region: "Row deleted. {N} rows remaining."
4. Update `aria-rowindex` on all subsequent rows (values shift down by one).

### 4.9.2 Row Addition (User-Initiated)

When the user adds a new row (e.g., via an "Add Row" button, Enter-to-add-row, or API triggered by user action):

1. Render the new row in the DOM.
2. Move focus to the **first editable cell** of the new row. If no cell is editable, move focus to the first cell of the new row.
3. If the grid is in an editing configuration, enter Edit Mode on that cell.
4. Update `aria-rowcount` on the grid.
5. Announce via live region: "Row added."

### 4.9.3 Row Addition (Asynchronous / Server Push)

When a row is added asynchronously (real-time data feed, another user's action, server push):

1. Render the new row in the DOM.
2. **Do NOT move focus**. The user may be working in another cell; stealing focus is disruptive.
3. Update `aria-rowcount` on the grid.
4. Announce via live region: "New row added: {row identifier}."

### 4.9.4 Bulk Operations

For bulk deletions or additions (e.g., deleting 50 rows at once):

1. Perform all DOM mutations.
2. Move focus according to the single-row rules above (focus the row that would have been next after the last deleted row).
3. Announce a single consolidated message: "{N} rows deleted. {M} rows remaining." or "{N} rows added."
4. Update `aria-rowcount` once.

---

## 4.10 Grouped Rows ARIA

Row grouping (available in the Data Grid variant -- see F-04) uses `rowgroup` elements with `aria-expanded` on group header rows to create collapsible sections.

### 4.10.1 Structure

```html
<div role="grid" aria-rowcount="57" aria-colcount="5"
     aria-label="Sales report">

  <!-- Column headers -->
  <div role="rowgroup">
    <div role="row" aria-rowindex="1">
      <div role="columnheader" aria-colindex="1">Region</div>
      <div role="columnheader" aria-colindex="2">Product</div>
      <div role="columnheader" aria-colindex="3">Revenue</div>
      <div role="columnheader" aria-colindex="4">Cost</div>
      <div role="columnheader" aria-colindex="5">Profit</div>
    </div>
  </div>

  <!-- Body with grouped rows -->
  <div role="rowgroup">

    <!-- Group header row: single spanning cell -->
    <div role="row" aria-rowindex="2" aria-expanded="true">
      <div role="gridcell"
           aria-colindex="1"
           aria-colspan="5"
           tabindex="-1">
        North America (12 items)
      </div>
    </div>

    <!-- Group member rows (visible because group is expanded) -->
    <div role="row" aria-rowindex="3">
      <div role="gridcell" aria-colindex="1" tabindex="-1">USA</div>
      <div role="gridcell" aria-colindex="2" tabindex="-1">Widget A</div>
      <div role="gridcell" aria-colindex="3" tabindex="-1">$45,000</div>
      <div role="gridcell" aria-colindex="4" tabindex="-1">$12,000</div>
      <div role="gridcell" aria-colindex="5" tabindex="-1">$33,000</div>
    </div>
    <!-- ... more member rows ... -->

    <!-- Another group -->
    <div role="row" aria-rowindex="15" aria-expanded="false">
      <div role="gridcell"
           aria-colindex="1"
           aria-colspan="5"
           tabindex="-1">
        Europe (8 items)
      </div>
    </div>
    <!-- Member rows NOT in DOM (group is collapsed) -->

  </div>
</div>
```

### 4.10.2 Group Header Row Requirements

| Requirement | Details |
|-------------|---------|
| MUST have `aria-expanded` | `"true"` when expanded, `"false"` when collapsed |
| MUST contain a single gridcell | The gridcell MUST span all columns via `aria-colspan` |
| MUST include group label text | E.g., "North America (12 items)" -- not just "North America" |
| MUST be focusable | The gridcell in the group header MUST participate in keyboard navigation |
| MUST respond to Enter/Space | Toggle expand/collapse when the group header cell is focused |

### 4.10.3 Distinction from Tree Grid

Grouped rows in a Data Grid MUST NOT use `aria-level`, `aria-setsize`, or `aria-posinset`. These attributes are reserved for `role="treegrid"` (see VS-03). The grouped Data Grid uses `aria-expanded` on group header rows and `rowgroup` for structural grouping only. If the data has true parent-child hierarchy (not value-based grouping), the Tree Grid variant MUST be used instead.

---

## 4.11 Frozen/Pinned Columns ARIA

Frozen (pinned) columns create a visual split between a fixed left/right pane and a scrollable center pane. The ARIA structure MUST present a seamless grid regardless of the visual pane split.

### 4.11.1 Continuous aria-colindex

`aria-colindex` MUST be continuous across ALL columns, including frozen ones. The frozen/scrollable split is purely visual; the ARIA structure MUST NOT reflect it.

```html
<!-- Frozen columns: 1, 2. Scrollable columns: 3, 4, 5, 6. -->
<div role="row" aria-rowindex="2">
  <div role="rowheader" aria-colindex="1" tabindex="-1">ID-001</div>    <!-- Frozen -->
  <div role="gridcell" aria-colindex="2" tabindex="-1">Alice</div>      <!-- Frozen -->
  <div role="gridcell" aria-colindex="3" tabindex="-1">Engineering</div> <!-- Scrollable -->
  <div role="gridcell" aria-colindex="4" tabindex="-1">Senior</div>     <!-- Scrollable -->
  <div role="gridcell" aria-colindex="5" tabindex="-1">2021-03</div>    <!-- Scrollable -->
  <div role="gridcell" aria-colindex="6" tabindex="-1">$95,000</div>    <!-- Scrollable -->
</div>
```

### 4.11.2 Single Row Element

All cells of a row MUST be children (or descendants via `role="presentation"` wrappers) of a **single** `role="row"` element. The frozen/scrollable visual split MUST NOT result in separate `role="row"` elements for the same logical row.

If the DOM structure absolutely requires separate containers for frozen and scrollable panes (violating the preferred single-container approach from FD-01 Section 1.7), the `aria-owns` attribute MUST be used on the row element to claim ownership of cells in the other container:

```html
<!-- Last resort: aria-owns bridges separate DOM containers -->
<div role="row" aria-rowindex="2" aria-owns="row2-scrollable-cells">
  <div role="gridcell" aria-colindex="1">ID-001</div>  <!-- Frozen pane -->
  <div role="gridcell" aria-colindex="2">Alice</div>   <!-- Frozen pane -->
</div>
<!-- In a separate DOM container: -->
<div id="row2-scrollable-cells">
  <div role="gridcell" aria-colindex="3">Engineering</div>
  <!-- ... -->
</div>
```

> **Recommendation**: Avoid `aria-owns`. Use the single-container sticky approach from FD-01.

### 4.11.3 Seamless Arrow Key Navigation

Arrow Right from the last frozen column cell MUST move focus to the first scrollable column cell. Arrow Left from the first scrollable column cell MUST move focus to the last frozen column cell. The user MUST NOT perceive any "pane boundary" during keyboard navigation.

---

## 4.12 Sticky Headers ARIA

Sticky column headers (headers that remain visible at the top of the grid as the user scrolls down) are a CSS-only visual behavior. However, there are ARIA implications if the sticky implementation uses DOM cloning.

### 4.12.1 CSS-Only Sticky (Preferred)

When sticky headers are implemented with `position: sticky` on the original header row, **no additional ARIA is needed**. The original header elements remain the authoritative source of column header semantics. Screen readers interact with the real header elements, which happen to be visually sticky.

### 4.12.2 Cloned Headers (Fallback)

If the sticky header implementation creates a visual **clone** of the header row (e.g., a copy that sits in a fixed-position container while the original scrolls away), the following rules apply:

| Requirement | Details |
|-------------|---------|
| Cloned headers MUST be `aria-hidden="true"` | Prevents AT from seeing duplicate headers |
| Original headers MUST remain in the DOM | They are the authoritative ARIA source |
| Original headers MAY be visually hidden | `visibility: hidden` or `opacity: 0`, but NOT `display: none` (which removes from AT) |
| Focus MUST target original headers | If the user navigates to a column header, focus lands on the original, not the clone |

### 4.12.3 Constraint

There MUST be exactly **one** set of `role="columnheader"` elements per column in the accessibility tree. Duplicate headers cause AT to announce columns twice or miscount columns.

---

## 4.13 Edge Wrapping Prohibition

The WAI-ARIA Authoring Practices Guide specifies that grids MUST NOT wrap focus at edges. This distinguishes grids from menus and listboxes.

### 4.13.1 Rules

| Navigation | At edge | Required behavior |
|------------|---------|-------------------|
| Arrow Right | Last cell of row | **No action**. Focus stays on the current cell. |
| Arrow Down | Last row of grid | **No action**. Focus stays on the current cell. |
| Arrow Left | First cell of row | **No action**. Focus stays on the current cell. |
| Arrow Up | First row of grid (header) | **No action**. Focus stays on the current cell. |

### 4.13.2 Rationale

Edge wrapping (Arrow Right on the last cell wraps to the first cell of the next row) creates unpredictable navigation for screen reader users. In a grid, the user expects Arrow Right to stay within the same row. Wrapping would make it impossible to know when the end of a row is reached.

### 4.13.3 Exception: Tab in Edit Mode

When `tabNavigationMode` is `"cell"` (FD-03 Section 7), Tab in Edit Mode advances to the next editable cell in reading order. This MAY cross row boundaries (Tab on the last editable cell of a row moves to the first editable cell of the next row). This is NOT a violation of the edge wrapping prohibition because:

1. Tab is not an arrow key -- it follows reading order, not grid-axis navigation.
2. The user is in Edit Mode, not Navigation Mode.
3. This matches the spreadsheet Tab convention that users expect.

---

## 4.14 Virtualization ARIA

Virtualization renders only a subset of rows and/or columns in the DOM. ARIA attributes MUST compensate for the missing DOM elements to give AT the full picture.

### 4.14.1 aria-rowcount

The `aria-rowcount` attribute on the `grid` element MUST reflect the **total number of rows in the full dataset**, not the number of rows currently in the DOM.

```html
<!-- 10,000 total rows, but only 50 rendered in the DOM -->
<div role="grid" aria-rowcount="10001" aria-colcount="6">
  <!-- aria-rowcount = 10000 data rows + 1 header row = 10001 -->
  ...
</div>
```

If the total row count is **unknown** (e.g., infinite scroll with server-side data of indeterminate size), set `aria-rowcount="-1"`. This tells AT that the row count is not yet known.

### 4.14.2 aria-rowindex

Each rendered row MUST carry `aria-rowindex` set to the row's **1-based position in the full dataset**.

```html
<!-- Rows 501-550 are currently rendered (header row is index 1) -->
<div role="rowgroup">
  <div role="row" aria-rowindex="502">...</div>  <!-- Data row 501 -->
  <div role="row" aria-rowindex="503">...</div>  <!-- Data row 502 -->
  ...
  <div role="row" aria-rowindex="551">...</div>  <!-- Data row 550 -->
</div>
```

The screen reader uses `aria-rowindex` and `aria-rowcount` to announce "Row 502 of 10001" even though only 50 rows are in the DOM.

### 4.14.3 aria-colcount and aria-colindex

When columns are hidden or virtualized:

- `aria-colcount` on the `grid` MUST reflect the total number of logical columns (including hidden/virtualized ones).
- `aria-colindex` on each cell MUST reflect the cell's 1-based position in the full column set.

```html
<!-- 20 total columns, only columns 5-15 are rendered -->
<div role="grid" aria-colcount="20">
  <div role="row" aria-rowindex="2">
    <div role="gridcell" aria-colindex="5">...</div>
    <div role="gridcell" aria-colindex="6">...</div>
    ...
    <div role="gridcell" aria-colindex="15">...</div>
  </div>
</div>
```

### 4.14.4 Constraints

| ID | Constraint |
|----|-----------|
| AC-01 | `aria-rowcount` MUST equal the total dataset row count (including all rowgroups), or `-1` if unknown. |
| AC-02 | `aria-rowindex` values MUST be 1-based and monotonically increasing within each rowgroup. Gaps between rendered rows are expected and correct. |
| AC-03 | `aria-colcount` MUST equal the total column count. |
| AC-04 | `aria-colindex` values MUST be 1-based and continuous within each rendered row. Gaps are permitted when columns are virtualized. |
| AC-05 | When rows are added or removed from the dataset (not just from the DOM), `aria-rowcount` MUST be updated. |
| AC-06 | When columns are added, removed, or the hidden set changes, `aria-colcount` MUST be updated. |

---

## 4.15 Normative Requirements Summary

The following table consolidates the normative requirements established in this document. Each requirement is identified by a unique ID for cross-referencing from feature specifications.

| ID | Requirement | Level |
|----|-------------|-------|
| AR-01 | The Data Grid root container MUST carry `role="grid"`. | MUST |
| AR-02 | The grid MUST have an accessible name via `aria-label` or `aria-labelledby`. | MUST |
| AR-03 | The grid MUST set `aria-rowcount` to the total number of rows (all rowgroups) or `-1` if unknown. | MUST |
| AR-04 | The grid MUST set `aria-colcount` to the total number of columns. | MUST |
| AR-05 | Every row MUST have `aria-rowindex` with a 1-based value reflecting its position in the full dataset. | MUST |
| AR-06 | Every cell MUST have `aria-colindex` with a 1-based value reflecting its position in the full column set. | MUST |
| AR-07 | `aria-colindex` MUST be continuous across frozen and scrollable panes. | MUST |
| AR-08 | Sortable column headers MUST carry `aria-sort`. | MUST |
| AR-09 | Selectable rows/cells MUST carry `aria-selected`. When selection is enabled, ALL selectable elements MUST carry `aria-selected` (not just the selected ones). | MUST |
| AR-10 | Intermediate wrapper elements MUST carry `role="presentation"` or `role="none"`. | MUST |
| AR-11 | The grid MUST implement roving tabindex as the primary focus management strategy. | MUST |
| AR-12 | Exactly one cell MUST have `tabindex="0"` at any time; all others MUST have `tabindex="-1"`. | MUST |
| AR-13 | Tab out + Shift+Tab back MUST return focus to the last focused cell. | MUST |
| AR-14 | When a focused cell is virtualized out of the DOM, the grid MUST preserve `focusedRowIndex` and `focusedColIndex` and restore focus when the cell re-enters the DOM. | MUST |
| AR-15 | The grid MUST maintain a `<div aria-live="polite">` live region OUTSIDE the `role="grid"` subtree. | MUST |
| AR-16 | The live region element MUST exist in the DOM before any content is injected. | MUST |
| AR-17 | `role="alert"` (assertive) MUST be used ONLY for critical errors. | MUST |
| AR-18 | Live region updates MUST be debounced (200-300ms) during rapid operations. | MUST |
| AR-19 | Every cell with meaningful content MUST be focusable. | MUST |
| AR-20 | Empty cells SHOULD be focusable. | SHOULD |
| AR-21 | A cell with a single interactive widget MUST delegate focus to the widget directly. | MUST |
| AR-22 | A cell with multiple interactive widgets MUST use the two-level focus model (FD-03 Section 5). | MUST |
| AR-23 | On row deletion, focus MUST move to the same column in the next row (or new last row). | MUST |
| AR-24 | On user-initiated row addition, focus MUST move to the first editable cell of the new row. | MUST |
| AR-25 | On async row addition, focus MUST NOT move. | MUST |
| AR-26 | Grouped row headers MUST use `aria-expanded` and a single gridcell with `aria-colspan`. | MUST |
| AR-27 | Grouped Data Grid rows MUST NOT use `aria-level`, `aria-setsize`, or `aria-posinset`. | MUST |
| AR-28 | All cells of a row MUST be children of a single `role="row"` element (or connected via `aria-owns`). | MUST |
| AR-29 | Arrow keys at grid edges MUST NOT wrap focus to another row or column. | MUST |
| AR-30 | If sticky headers use cloned DOM, clones MUST be `aria-hidden="true"`. | MUST |
| AR-31 | There MUST be exactly one set of `role="columnheader"` elements per column in the accessibility tree. | MUST |
| AR-32 | `aria-rowcount` and `aria-colcount` MUST reflect dataset totals, not rendered DOM counts. | MUST |
| AR-33 | The grid SHOULD use the hybrid focus strategy (roving tabindex normally, `aria-activedescendant` during rapid scroll). | SHOULD |
| AR-34 | Status messages MUST be announced via live regions without moving focus (WCAG 4.1.3). | MUST |
| AR-35 | The focused cell MUST NOT be fully obscured by sticky headers, frozen columns, or overlapping UI. | MUST |
| AR-36 | Focus indicators MUST have a 2px minimum perimeter and 3:1 contrast ratio (WCAG 2.4.13). | MUST |
| AR-37 | All drag operations MUST have a non-dragging keyboard alternative (WCAG 2.5.7). | MUST |
| AR-38 | Interactive targets MUST meet the 44x44 CSS pixel minimum (WCAG 2.5.5 AAA) or provide equivalent spacing. | MUST |
| AR-39 | The grid MUST set `aria-multiselectable="true"` when multi-selection is enabled. | MUST |
| AR-40 | The grid MUST set `aria-busy="true"` during asynchronous data operations and `aria-busy="false"` when complete. | MUST |

---

## 4.16 Cross-References

| Topic | Reference |
|-------|-----------|
| CSS Subgrid DOM structure | [FD-01: Layout Model](01-layout-model.md) |
| ARIA roles per variant | [FD-02: Variant Model](02-variant-model.md) |
| Editability model, two-level focus, Edit Mode ARIA | [FD-03: Editability Model](03-editability-model.md) |
| Tree Grid ARIA extensions (aria-level, aria-setsize, aria-posinset) | [VS-03: Tree Grid](../03-variant-specific/03-tree-grid.md) |
| Pivot Table multi-axis header ARIA | [VS-02: Pivot Table](../03-variant-specific/02-pivot-table.md) |
| Gantt Chart dual-region ARIA | [VS-01: Gantt Chart](../03-variant-specific/01-gantt-chart.md) |
| Keyboard navigation features | [F-14: Keyboard Navigation](../02-features/14-keyboard-navigation.md) |
| Sort ARIA (aria-sort cycling) | [F-02: Sorting](../02-features/02-sorting.md) |
| Filter announcements | [F-03: Filtering](../02-features/03-filtering.md) |
| Grouping ARIA | [F-04: Grouping & Aggregation](../02-features/04-grouping-aggregation.md) |
| Selection ARIA (aria-selected) | [F-08: Selection](../02-features/08-selection.md) |
| Virtualization focus management | [F-11: Virtualization & Performance](../02-features/11-virtualization-performance.md) |
| Validation error ARIA | [F-18: Validation](../02-features/18-validation.md) |
| WCAG audit checklist | [Appendix F: WCAG Audit Checklist](../04-appendices/F-wcag-audit-checklist.md) |
| ARIA attribute quick reference | [Appendix B: ARIA Reference](../04-appendices/B-aria-reference.md) |
| Consolidated keyboard reference | [Appendix A: Keyboard Reference](../04-appendices/A-keyboard-reference.md) |
