# VS-03: Tree Grid — ARIA Structure & Keyboard Model

> **Part of**: [Tabular Grid Specification](../README.md)
> **Variant**: Tree Grid
> **Scope**: ARIA structural model, `role="treegrid"` requirements, keyboard/focus model unique to this variant

## Overview

The Tree Grid variant uses `role="treegrid"` instead of `role="grid"`. This changes the ARIA structure significantly: every row requires `aria-level`, `aria-setsize`, and `aria-posinset` attributes. The focus model also differs — Arrow Left/Right has dual behavior (expand/collapse vs. cell navigation) that requires careful specification.

The baseline Data Grid ARIA structure is defined in [FD-04: Accessibility Foundation](../01-foundations/04-accessibility-foundation.md). This file specifies ONLY what changes or extends that baseline for the Tree Grid variant.

> **Feature coverage**: Tree-specific features (expand/collapse behavior, lazy-load, tri-state checkbox, drag reparenting, tree filtering, indentation) are specified in [F-06: Tree / Hierarchical Data](../02-features/06-tree-hierarchical.md).

---

## 1. Role Hierarchy

The DOM and ARIA role structure for a Tree Grid uses the same role vocabulary as the Data Grid, with one critical difference at the container level.

### 1.1 Role Structure

| DOM Element | ARIA Role | Notes |
|-------------|-----------|-------|
| Container element | `role="treegrid"` | Replaces `role="grid"` from Data Grid variant |
| Header row container | `role="rowgroup"` | Same as Data Grid |
| Body row container | `role="rowgroup"` | Same as Data Grid |
| Header row | `role="row"` | Same as Data Grid; does NOT carry hierarchy attributes |
| Body row | `role="row"` | Carries `aria-level`, `aria-setsize`, `aria-posinset` (see Section 2) |
| Column header cell | `role="columnheader"` | Same as Data Grid |
| Row header cell | `role="rowheader"` | Strongly recommended for the name/label column in a tree grid |
| Data cell | `role="gridcell"` | Same as Data Grid |

### 1.2 Screen Reader Announcement Difference

Unlike `role="grid"`, `role="treegrid"` signals to assistive technology that the content is inherently hierarchical. Screen readers may:

- Announce "tree grid" instead of "grid" when the user enters the widget
- Use tree-oriented vocabulary such as "expanded", "collapsed", "level N" when announcing rows
- Navigate the hierarchy using AT-specific tree navigation commands in addition to standard grid navigation

This means the component does not need to add supplemental announcements for hierarchy level when the ARIA attributes are correctly set — the platform/screen reader handles it.

### 1.3 Header Rows and Hierarchy Attributes

Header rows (`role="row"` inside the header `role="rowgroup"`) do NOT carry `aria-level`, `aria-setsize`, or `aria-posinset`. These attributes apply exclusively to data rows in the body `role="rowgroup"`.

---

## 2. Row Hierarchy Attributes

Every data row in a treegrid must carry three positional attributes that communicate hierarchy to assistive technology. These attributes are on the `role="row"` element, not on any cell.

### 2.1 `aria-level`

- **Type**: integer, 1-based
- **Meaning**: depth of the row in the tree hierarchy
- **Root rows**: `aria-level="1"`
- **Children of root rows**: `aria-level="2"`
- **Grandchildren**: `aria-level="3"`, and so on

Even when all data rows are at the same level (a flat tree), every row must still carry `aria-level="1"`. Omitting `aria-level` on any data row is a conformance error.

### 2.2 `aria-setsize`

- **Type**: integer
- **Meaning**: total count of sibling rows sharing the same parent at the same level
- **Scope**: siblings only — NOT the total number of rows in the entire treegrid, and NOT the total number of rows at that depth across different parents

**Calculating `aria-setsize`:**

```
Parent row "Documents" has 2 children: ["resume.pdf", "Projects/"]
  resume.pdf   → aria-setsize="2"
  Projects/    → aria-setsize="2"

Parent row "Downloads" has 3 children: ["file-a.zip", "file-b.zip", "file-c.zip"]
  file-a.zip   → aria-setsize="3"
  file-b.zip   → aria-setsize="3"
  file-c.zip   → aria-setsize="3"

Root level has 3 rows: ["Documents", "Downloads", "Pictures"]
  Documents    → aria-setsize="3"
  Downloads    → aria-setsize="3"
  Pictures     → aria-setsize="3"
```

**Lazy-loaded children (unknown count):**

When a parent row is collapsed and children have not yet been loaded, the exact sibling count of future children is unknown. Use `aria-setsize="-1"` to indicate the count is unknown. Once children are loaded and rendered, update `aria-setsize` on each child to the correct count.

If a partial page of children has been loaded but more exist (virtual scrolling within a branch), use the total known count for the branch if available, or `-1` if still unknown.

**Dynamic updates (rows added or removed):**

When rows are added or removed from a parent's children list, `aria-setsize` and `aria-posinset` must be updated on ALL siblings of the affected row — not just the added/removed row. Failing to update all siblings will produce incorrect positional announcements.

### 2.3 `aria-posinset`

- **Type**: integer, 1-based
- **Meaning**: the position of this row among its siblings (1 = first sibling, 2 = second sibling, etc.)
- **Scope**: same as `aria-setsize` — position within parent, not within the entire treegrid

**Calculating `aria-posinset`:**

```
Parent "Documents" has children: ["resume.pdf", "Projects/"]
  resume.pdf  → aria-posinset="1"
  Projects/   → aria-posinset="2"
```

### 2.4 Flat Tree Special Case

A treegrid with no hierarchical data (all rows at level 1) is still a valid treegrid if the data model requires it. In this case:

- All rows: `aria-level="1"`
- All rows: `aria-setsize="<total row count>"` (or `-1` if count is unknown/virtual)
- All rows: `aria-posinset="<1-based position>"`
- No rows carry `aria-expanded` (no parents exist)

This use case is uncommon. Consider using `role="grid"` for flat tabular data unless the tree variant is required by the data model or dynamic grouping requirements.

### 2.5 Placement of Hierarchy Attributes

These three attributes are always on the `role="row"` element:

```html
<!-- Correct -->
<div role="row" aria-level="2" aria-setsize="3" aria-posinset="1">
  <div role="gridcell">...</div>
</div>

<!-- Incorrect — attributes on cell instead of row -->
<div role="row">
  <div role="gridcell" aria-level="2" aria-setsize="3" aria-posinset="1">...</div>
</div>
```

---

## 3. Expandable Row Attributes

### 3.1 `aria-expanded` on Parent Rows

Parent rows — rows that have, or may have, children — communicate their expand/collapse state via `aria-expanded`:

- `aria-expanded="true"`: children are currently visible in the DOM
- `aria-expanded="false"`: children exist (or may exist) but are currently hidden

The `aria-expanded` attribute is placed on the `role="row"` element, not on any cell or the expand/collapse trigger button inside the row.

### 3.2 Leaf Rows Must Not Carry `aria-expanded`

Leaf rows (confirmed to have no children) must NOT have an `aria-expanded` attribute at all. Setting `aria-expanded="false"` on a leaf row incorrectly signals to assistive technology that the row has hidden children, causing screen readers to offer expand commands that have no effect.

```html
<!-- Parent row, collapsed -->
<div role="row" aria-level="1" aria-setsize="2" aria-posinset="1" aria-expanded="false">

<!-- Leaf row — no aria-expanded -->
<div role="row" aria-level="2" aria-setsize="3" aria-posinset="1">
```

### 3.3 Lazy-Loaded Rows

When a row's children have not yet been loaded (lazy load on first expand), the row is treated as a potential parent:

1. Before first expand: `aria-expanded="false"` — row appears to have children
2. After expand and load: if children exist, `aria-expanded="true"` with children rendered
3. After expand and load: if NO children exist (empty result), remove `aria-expanded` entirely — the row is now confirmed as a leaf

This progression ensures screen readers do not permanently treat an empty lazy row as a parent.

### 3.4 Loading State During Expand

When children are being fetched after the user triggers expand:

- Keep `aria-expanded="false"` on the row during the fetch (children not yet visible)
- Show a loading indicator (spinner) accessible to screen readers via `role="status"` or equivalent live region, as specified in [F-06.3](../02-features/06-tree-hierarchical.md)
- Once children are rendered, set `aria-expanded="true"` and update `aria-setsize`/`aria-posinset` on children

---

## 4. Complete Annotated HTML Example

The following example shows a three-level file browser tree grid. Every required ARIA attribute is shown. Comments explain the attribute values.

```html
<!--
  aria-rowcount: total number of data rows currently rendered (excluding header).
  aria-colcount: total number of columns.
  In virtual scrolling, aria-rowcount reflects the total known row count,
  not just the rendered subset.
-->
<div
  role="treegrid"
  aria-label="File Browser"
  aria-rowcount="8"
  aria-colcount="3"
>

  <!-- ═══════════════════════════════════════════════ -->
  <!-- HEADER ROWGROUP                                 -->
  <!-- Header rows do not carry hierarchy attributes.  -->
  <!-- ═══════════════════════════════════════════════ -->
  <div role="rowgroup">
    <div role="row" aria-rowindex="1">
      <div role="columnheader" aria-colindex="1" aria-sort="none">Name</div>
      <div role="columnheader" aria-colindex="2">Size</div>
      <div role="columnheader" aria-colindex="3">Modified</div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════ -->
  <!-- BODY ROWGROUP                                   -->
  <!-- ═══════════════════════════════════════════════ -->
  <div role="rowgroup">

    <!--
      Root row #1: "Documents" folder
      aria-level="1"      → depth 1 (root)
      aria-setsize="3"    → 3 root-level siblings (Documents, Downloads, Pictures)
      aria-posinset="1"   → first among root siblings
      aria-expanded="true" → children are visible
      tabindex="0"         → this is the currently focused row (roving tabindex)
    -->
    <div
      role="row"
      aria-rowindex="2"
      aria-level="1"
      aria-setsize="3"
      aria-posinset="1"
      aria-expanded="true"
      tabindex="0"
    >
      <div role="rowheader" aria-colindex="1">Documents</div>
      <div role="gridcell" aria-colindex="2">—</div>
      <div role="gridcell" aria-colindex="3">2024-01-15</div>
    </div>

    <!--
      Child row #1 of "Documents": "resume.pdf" — LEAF node
      aria-level="2"      → depth 2 (child of root)
      aria-setsize="2"    → 2 siblings under Documents (resume.pdf, Projects/)
      aria-posinset="1"   → first sibling
      NO aria-expanded    → leaf node; must not carry aria-expanded
      tabindex="-1"        → not currently focused
    -->
    <div
      role="row"
      aria-rowindex="3"
      aria-level="2"
      aria-setsize="2"
      aria-posinset="1"
      tabindex="-1"
    >
      <div role="gridcell" aria-colindex="1">resume.pdf</div>
      <div role="gridcell" aria-colindex="2">245 KB</div>
      <div role="gridcell" aria-colindex="3">2024-01-10</div>
    </div>

    <!--
      Child row #2 of "Documents": "Projects/" folder — COLLAPSED parent
      aria-level="2"       → depth 2
      aria-setsize="2"     → 2 siblings under Documents
      aria-posinset="2"    → second sibling
      aria-expanded="false" → has children, currently collapsed
      tabindex="-1"
    -->
    <div
      role="row"
      aria-rowindex="4"
      aria-level="2"
      aria-setsize="2"
      aria-posinset="2"
      aria-expanded="false"
      tabindex="-1"
    >
      <div role="rowheader" aria-colindex="1">Projects</div>
      <div role="gridcell" aria-colindex="2">—</div>
      <div role="gridcell" aria-colindex="3">2024-01-12</div>
    </div>

    <!--
      Root row #2: "Downloads" folder — EXPANDED parent
      aria-level="1"      → depth 1 (root)
      aria-setsize="3"    → 3 root siblings
      aria-posinset="2"   → second root sibling
      aria-expanded="true" → children visible
    -->
    <div
      role="row"
      aria-rowindex="5"
      aria-level="1"
      aria-setsize="3"
      aria-posinset="2"
      aria-expanded="true"
      tabindex="-1"
    >
      <div role="rowheader" aria-colindex="1">Downloads</div>
      <div role="gridcell" aria-colindex="2">—</div>
      <div role="gridcell" aria-colindex="3">2024-01-14</div>
    </div>

    <!--
      Child of "Downloads": "archive.zip" — LEAF
      aria-level="2"
      aria-setsize="1"    → only one child under Downloads
      aria-posinset="1"
      NO aria-expanded
    -->
    <div
      role="row"
      aria-rowindex="6"
      aria-level="2"
      aria-setsize="1"
      aria-posinset="1"
      tabindex="-1"
    >
      <div role="gridcell" aria-colindex="1">archive.zip</div>
      <div role="gridcell" aria-colindex="2">1.2 MB</div>
      <div role="gridcell" aria-colindex="3">2024-01-13</div>
    </div>

    <!--
      Root row #3: "Pictures" folder — COLLAPSED parent
      aria-level="1"
      aria-setsize="3"
      aria-posinset="3"   → third root sibling
      aria-expanded="false"
    -->
    <div
      role="row"
      aria-rowindex="7"
      aria-level="1"
      aria-setsize="3"
      aria-posinset="3"
      aria-expanded="false"
      tabindex="-1"
    >
      <div role="rowheader" aria-colindex="1">Pictures</div>
      <div role="gridcell" aria-colindex="2">—</div>
      <div role="gridcell" aria-colindex="3">2024-01-08</div>
    </div>

  </div><!-- end body rowgroup -->
</div><!-- end treegrid -->
```

**Notes on the example:**

- `aria-rowcount="8"` includes the header row (index 1) plus 7 data rows — however, `aria-rowcount` on `role="treegrid"` counts only the currently **rendered** rows. If "Projects/" were expanded and its children were virtual/unrendered, `aria-rowcount` would remain 7 until those rows enter the DOM.
- The "Projects/" node (rowindex 4) is collapsed; its children do not appear in the DOM. When expanded, new rows with `aria-level="3"` would be inserted after rowindex 4, and `aria-rowcount` would increase accordingly.
- `tabindex="0"` appears on exactly one row at a time (roving tabindex). All other interactive rows use `tabindex="-1"`.

---

## 5. Focus Model: Row-Focus vs. Cell-Focus

The Tree Grid uses a two-mode focus model. This differs from the Data Grid, where the cell is always the primary focus unit.

### 5.1 Row-Focus Mode (Default for Treegrid)

When navigating between rows, `tabindex="0"` is on the `role="row"` element. Cells within that row have no `tabindex` attribute (or `tabindex="-1"` if interactive cells need programmatic focus).

**Behavior in row-focus mode:**

| Key | Action |
|-----|--------|
| Arrow Down | Move focus to next visible row (skip hidden collapsed children) |
| Arrow Up | Move focus to previous visible row |
| Arrow Right (collapsed parent) | Expand the node; focus stays on the row element |
| Arrow Right (expanded parent or leaf) | Move focus to the first cell (`aria-colindex="1"`) in the current row |
| Enter | Move focus to first cell (or enter edit mode if row is editable) |
| Space | Toggle row selection (if selection is enabled; see F-02) |

Row-focus mode is the default state when the user first enters the treegrid via Tab, and after pressing Arrow Left to return from cell navigation.

### 5.2 Cell-Focus Mode

Once a cell is focused (via Arrow Right from a row, or via direct click on a cell), `tabindex="0"` moves to the focused cell element. The row element moves to `tabindex="-1"`.

**Behavior in cell-focus mode:**

| Key | Action |
|-----|--------|
| Arrow Right | Move to next cell in the same row (if not on last cell) |
| Arrow Left (not on first cell) | Move to previous cell in the same row |
| Arrow Left (on first cell) | Return to row-focus mode (focus moves to `role="row"` element) |
| Arrow Down | Move to same column cell in the next visible row |
| Arrow Up | Move to same column cell in the previous visible row |
| Arrow Right (on last cell) | No action (per ARIA APG, do not wrap to next row) |
| Home | Move to first cell in the current row |
| End | Move to last cell in the current row |

Navigation between rows in cell-focus mode (Arrow Down/Up) follows the same column-preserving behavior as the Data Grid defined in FD-04.

### 5.3 Arrow Left Multi-Level Sequence

The Arrow Left key performs different actions depending on the current focus state. The complete sequence starting from a focused cell in an expanded node:

**Step 1** — Arrow Left while a cell (not the first cell) is focused:
- Action: move focus to the previous cell in the row
- Focus: moves left within the row

**Step 1 (alternate)** — Arrow Left while the first cell (`aria-colindex="1"`) is focused:
- Action: return to row-focus mode
- Focus: moves to the `role="row"` element

**Step 2** — Arrow Left while the `role="row"` element of an **expanded** parent is focused:
- Action: collapse the node (`aria-expanded` changes from `"true"` to `"false"`; children are hidden)
- Focus: stays on the same row element

**Step 3** — Arrow Left while the `role="row"` element of a **collapsed** or **leaf** row is focused:
- Action: move focus to the parent row (the row at `aria-level = currentLevel - 1` that is the direct ancestor)
- Focus: moves to parent row element

**Important shortcut**: If Arrow Left is pressed on an already-collapsed parent or a leaf node (Step 3 directly), focus moves immediately to the parent row. There is no intermediate collapse step because the node is already collapsed.

**At root level (aria-level="1")**: Arrow Left on a collapsed or leaf row has no effect (there is no parent row to navigate to).

---

## 6. Collapse/Expand Focus Rules

### 6.1 Expanding a Node

When the user expands a node (via Arrow Right, Enter on expand control, or mouse click):

- Focus stays on the parent row that was expanded
- Focus does NOT automatically move to the first child
- The newly visible child rows receive `tabindex="-1"`
- The parent row retains `tabindex="0"` (focus owner)

Rationale: automatically moving focus to children is disorienting for keyboard and screen reader users who may want to continue navigating at the parent level after expanding.

### 6.2 Collapsing a Node

When the user collapses a node (via Arrow Left on an expanded row, Enter on collapse control, or mouse click):

- Focus stays on the parent row that was collapsed
- The now-hidden child rows must NOT hold `tabindex="0"` — reassign to the parent row
- The parent row receives `tabindex="0"`

### 6.3 Collapse with Focus on Descendant

When a parent node is collapsed while focus is on a descendant row (child, grandchild, or deeper):

1. The descendant row becomes hidden (removed from the visual tree)
2. Focus must move to the collapsed parent row
3. The collapsed parent row receives `tabindex="0"`
4. All descendant rows move to `tabindex="-1"` (or are removed from DOM if virtualized)

This situation arises when the user collapses an ancestor via a method other than keyboard navigation at that row (e.g., a toolbar "Collapse All" button, programmatic API call, or clicking the expand toggle of a row above while focus is elsewhere).

### 6.4 Row Removed While Focused

When a row is removed from the tree while it holds focus (delete operation, filter exclusion, or data update):

1. If a **next sibling** exists at the same level: move focus to the next sibling row
2. Else if a **previous sibling** exists at the same level: move focus to the previous sibling row
3. Else (no siblings): move focus to the **parent row**
4. If the row was a root row with no siblings: move focus to the treegrid container (`role="treegrid"`)

In all cases, `tabindex="0"` is reassigned to the receiving element before the removed row's `tabindex` is cleared.

### 6.5 Focus and Virtual Scrolling

When virtual scrolling is active and the focused row is scrolled out of the rendered viewport:

- The row must remain in the DOM as long as it holds focus (do not virtualize away a focused row)
- When focus moves to a row outside the rendered range, scroll the viewport to bring that row into view before transferring `tabindex="0"`

---

## 7. Keyboard Interaction Reference Table

The following table is the normative keyboard specification for the Tree Grid variant. Keys marked with * apply only when the respective feature (selection, editing) is enabled.

| Key | Focus State | Action |
|-----|-------------|--------|
| Arrow Down | Row | Move focus to next visible row (skip hidden collapsed descendants) |
| Arrow Up | Row | Move focus to previous visible row |
| Arrow Right | Row — collapsed parent | Expand node; focus stays on row |
| Arrow Right | Row — expanded parent or leaf | Move focus to first cell (`aria-colindex="1"`) in the row |
| Arrow Left | Cell — not first cell | Move focus to previous cell in the row |
| Arrow Left | Cell — first cell (`aria-colindex="1"`) | Move focus to the owning `role="row"` element |
| Arrow Left | Row — expanded parent | Collapse node; focus stays on row |
| Arrow Left | Row — collapsed parent or leaf | Move focus to parent row (`aria-level` − 1); no-op at root level |
| Arrow Down | Cell | Move focus to same column cell in the next visible row |
| Arrow Up | Cell | Move focus to same column cell in the previous visible row |
| Arrow Right | Cell — not last cell | Move focus to next cell in the row |
| Arrow Right | Cell — last cell | No action |
| Enter | Row | Move focus to first cell; or enter edit mode if row is directly editable |
| Enter | Cell — editable | Enter edit mode for the cell |
| Enter | Cell — read-only | No action (or activate if cell contains a link/button) |
| Escape | Edit mode | Commit or cancel edit (per F-05 editing rules); return focus to cell |
| Home | Row or Cell | Move focus to first cell of current row |
| End | Row or Cell | Move focus to last cell of current row |
| Ctrl+Home | Any | Move focus to first visible data row, first cell |
| Ctrl+End | Any | Move focus to last visible data row, last cell |
| Page Up | Any | Move focus up by approximately one visible page of rows |
| Page Down | Any | Move focus down by approximately one visible page of rows |
| Space | Row* | Toggle row selection (requires row selection enabled; see F-02) |
| Space | Cell* | Toggle cell selection or activate cell action |
| Shift+Space | Row* | Extend range selection to this row |
| Ctrl+A | Any* | Select all rows (requires multi-select enabled) |
| * (Asterisk) | Row | Expand all sibling rows at the same level under the same parent |
| + (Plus) | Row | Expand the current node (same as Arrow Right on collapsed parent) |
| - (Minus) | Row | Collapse the current node (same as Arrow Left on expanded parent) |
| F2 | Cell | Toggle cell edit mode on/off (alternate to Enter; see F-05) |
| Tab | Grid | Move focus to the next focusable element outside the treegrid |
| Shift+Tab | Grid | Move focus to the previous focusable element outside the treegrid |

**Notes:**

- "Visible row" means a row that is currently rendered and not hidden due to a collapsed ancestor.
- Page Up/Page Down move by the number of rows currently visible in the viewport. The exact row count depends on row height and viewport height.
- `* (Asterisk)` applies only to the immediate siblings of the focused row, not to the entire tree. To expand all nodes in the tree, use a dedicated toolbar action.
- Tab and Shift+Tab always exit the treegrid. Internal cell-to-cell navigation uses Arrow keys only. There is no Tab-within-grid navigation (unlike native HTML tables).

---

## 8. Differences from Data Grid (`role="grid"`)

| Aspect | Data Grid (`role="grid"`) | Tree Grid (`role="treegrid"`) |
|--------|--------------------------|-------------------------------|
| Container role | `role="grid"` | `role="treegrid"` |
| Primary focus unit | Cell | Row (cells accessed via Arrow Right) |
| `aria-level` | Not required | Required on every data row |
| `aria-setsize` | Not required | Required on every data row |
| `aria-posinset` | Not required | Required on every data row |
| `aria-expanded` | On group header rows only (F-04 grouping) | On every parent row |
| Arrow Right on row | N/A (cells are primary focus; no row-focus mode) | Expand if collapsed; enter cell if expanded or leaf |
| Arrow Left on cell | No special behavior beyond cell navigation | Returns focus to the owning `role="row"` element |
| Arrow Left on row | N/A (row is not a focus target) | Collapse if expanded; move to parent if collapsed |
| Screen reader entry announcement | "grid" | "tree grid" (varies by AT) |
| Row header (`role="rowheader"`) | Optional | Strongly recommended for the name/label column |
| Tab behavior inside grid | Moves between focusable cells (in some implementations) | Exits the treegrid entirely |
| Hierarchy depth signal | None | `aria-level` communicates depth to AT |
| Sibling count | Not communicated | `aria-setsize` / `aria-posinset` communicate position |

---

## 9. Distinction from Grouped Flat Data

Choosing between `role="treegrid"` and `role="grid"` with row grouping requires understanding the nature of the data.

### 9.1 When to Use `role="treegrid"`

Use `role="treegrid"` when:

- The data is genuinely hierarchical — parent rows and child rows represent different instances of the same or related entity types (e.g., folder/file, account/transaction, task/subtask)
- Children belong to a specific parent entity, and the parent-child relationship is defined by the data model, not just a UI grouping heuristic
- The hierarchy can be multiple levels deep and the depth may vary per branch
- Nodes can be independently expanded, collapsed, moved, or deleted with their subtrees
- The component needs to communicate positional context (`aria-level`, `aria-setsize`, `aria-posinset`) to screen reader users navigating the tree

### 9.2 When to Use `role="grid"` with Row Grouping

Use `role="grid"` with grouping rows (F-04) when:

- The data is fundamentally flat (all rows are the same entity type)
- Grouping is a UI-layer feature applied to a flat dataset, not a data structure
- The "group header" row is a generated aggregate, not a first-class data entity
- All leaf rows have the same schema and the hierarchy exists only for display organization
- The grouping is a single level (no nesting of groups within groups)

### 9.3 Chameleon 7 Implementation

**Chameleon 7 Tree Grid variant** (`ch-tabular-grid` with `treeGrid` mode) uses `role="treegrid"` and renders all row hierarchy attributes as specified in this document.

**Chameleon 7 Data Grid with grouping** (F-04: Row Grouping feature enabled on the base grid) uses `role="grid"`. Generated group header rows carry `aria-expanded` to indicate expand/collapse state, but do NOT carry `aria-level`, `aria-setsize`, or `aria-posinset`. Screen readers announce these rows as grid rows, not as tree nodes.

The distinction is important for consumers choosing between variants: a file system browser is a treegrid; a sales report grouped by region is a flat grid with grouping rows.

---

## 10. Normative Requirements

The following requirements apply to any implementation of the Chameleon 7 Tree Grid variant. Requirements are identified as `TG-NN` for traceability.

### Container and Role

| ID | Requirement |
|----|-------------|
| TG-01 | The treegrid container element MUST have `role="treegrid"`. |
| TG-02 | The treegrid container MUST have `aria-rowcount` reflecting the total count of rendered data rows (excluding header rows). In virtual scrolling mode, `aria-rowcount` MUST reflect the total known row count across the entire dataset. |
| TG-03 | The treegrid container MUST have `aria-colcount` reflecting the total number of columns. |
| TG-04 | The treegrid container MUST have an accessible name provided via `aria-label` or `aria-labelledby`. |

### Row Hierarchy Attributes

| ID | Requirement |
|----|-------------|
| TG-05 | Every data row (`role="row"` in the body `role="rowgroup"`) MUST carry `aria-level` with a 1-based integer value representing its depth in the tree. |
| TG-06 | Every data row MUST carry `aria-setsize` with the count of siblings sharing the same parent. When sibling count is unknown (lazy-loaded, not yet fetched), `aria-setsize` MUST be set to `-1`. |
| TG-07 | Every data row MUST carry `aria-posinset` with the 1-based position of the row among its siblings. |
| TG-08 | When rows are added to or removed from a parent's children list, `aria-setsize` and `aria-posinset` MUST be updated on ALL sibling rows of the affected entry. |
| TG-09 | Header rows MUST NOT carry `aria-level`, `aria-setsize`, or `aria-posinset`. |
| TG-10 | `aria-level`, `aria-setsize`, and `aria-posinset` MUST be placed on the `role="row"` element, not on cell elements. |

### Expand / Collapse Attributes

| ID | Requirement |
|----|-------------|
| TG-11 | Parent rows (rows that have or may have children) MUST carry `aria-expanded="true"` when children are visible, and `aria-expanded="false"` when children are hidden. |
| TG-12 | Leaf rows (confirmed to have no children) MUST NOT carry the `aria-expanded` attribute. |
| TG-13 | A lazy-loaded row whose children have not yet been fetched MUST carry `aria-expanded="false"` until the fetch completes. If the fetch returns no children, `aria-expanded` MUST be removed from the row. |
| TG-14 | `aria-expanded` MUST be placed on the `role="row"` element, not on the expand/collapse trigger button inside the row. |

### Focus Model

| ID | Requirement |
|----|-------------|
| TG-15 | The treegrid MUST implement roving `tabindex`. Exactly one interactive element (row or cell) in the treegrid MUST have `tabindex="0"` at any time; all others MUST have `tabindex="-1"`. |
| TG-16 | When navigating between rows (Arrow Down/Up), `tabindex="0"` MUST be on the `role="row"` element (row-focus mode). |
| TG-17 | Arrow Right on a collapsed parent row MUST expand the node and MUST keep focus on the row element. |
| TG-18 | Arrow Right on an expanded parent row or a leaf row MUST move focus to the first cell (`aria-colindex="1"`) in that row (entering cell-focus mode). |
| TG-19 | Arrow Left on the first cell of a row MUST return focus to the owning `role="row"` element. |
| TG-20 | Arrow Left on an expanded parent row MUST collapse the node and MUST keep focus on the row element. |

### Navigation and Collapse Behavior

| ID | Requirement |
|----|-------------|
| TG-21 | Arrow Left on a collapsed or leaf row MUST move focus to the parent row (the nearest ancestor at `aria-level` = current level − 1). At root level (`aria-level="1"`), Arrow Left MUST have no effect. |
| TG-22 | When a parent row is collapsed while focus is on a descendant row, focus MUST move to the collapsed parent row. |
| TG-23 | When a focused row is removed from the tree, focus MUST move to: the next sibling if one exists, else the previous sibling, else the parent row, else the treegrid container. |
| TG-24 | When a node is expanded, focus MUST remain on the parent row. Focus MUST NOT automatically move to the first child. |
| TG-25 | When a node is collapsed, focus MUST remain on the parent row. |

### Virtual Scrolling

| ID | Requirement |
|----|-------------|
| TG-26 | A row that currently holds focus MUST NOT be removed from the DOM by the virtual scrolling engine. It MUST remain rendered as long as it is the focus owner. |
| TG-27 | When focus moves to a row outside the currently rendered viewport range, the implementation MUST scroll the viewport to bring the target row into view before transferring `tabindex="0"`. |

---

*This file is part of the Chameleon 7 Tabular Grid Specification. See [README.md](../README.md) for the complete table of contents.*
