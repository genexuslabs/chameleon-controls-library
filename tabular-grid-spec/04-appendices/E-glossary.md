# Appendix E: Glossary

> **Part of**: [Tabular Grid Specification](../README.md)
> **Type**: Term definitions

## Overview

Definitions for terms used throughout the tabular grid specification.

---

## A

**Accessible Name**
The text string that assistive technologies use to identify a UI element. Computed from `aria-label`, `aria-labelledby`, or content text. Every interactive grid element (sort button, filter control, expand/collapse control, cell editor) must have an accessible name.

**aria-activedescendant**
ARIA technique where the composite widget element keeps DOM focus while announcing logical focus via ID reference. An alternative to roving tabindex for heavy virtualization scenarios. The grid container retains `tabindex="0"` and updates `aria-activedescendant` to the ID of the currently "focused" cell. See also: roving tabindex.

**aria-level**
ARIA attribute on `role="row"` elements in a treegrid, specifying the 1-based depth in the hierarchy. A root-level row has `aria-level="1"`, its children have `aria-level="2"`, and so on. Required on all rows in a Tree Grid variant. See FD-04.

**aria-posinset**
ARIA attribute on `role="row"` elements in a treegrid, specifying the 1-based position among siblings at the same level. Combined with `aria-setsize`, it allows screen readers to announce "item 3 of 5". Required when virtualization is active and not all siblings are present in the DOM. See FD-04.

**aria-setsize**
ARIA attribute on `role="row"` elements in a treegrid, specifying the total count of siblings at the same level. Set to `-1` when the sibling count is unknown (e.g., lazy-loaded children not yet fetched). Required when virtualization omits sibling rows from the DOM. See FD-04.

---

## B

**Batch editing**
An edit mode where multiple cell changes are accumulated in a pending state and committed or rolled back as a single unit. Pending cells are visually marked as unsaved. The user triggers commit (e.g., Save button or Ctrl+S) or rollback (e.g., Escape or Cancel button) to finalize. Contrast with immediate-commit editing where each cell change is persisted on blur. See FD-03.

**Behavioral Requirement (BR-N)**
A normative assertion in this specification using "SHALL" or "MUST" that is directly testable. Each BR has a unique numeric identifier (e.g., BR-47). Behavioral Requirements are distinct from informative notes and design recommendations.

---

## C

**Cell**
The intersection of a row and a column, containing data or interactive content. Carries `role="gridcell"` (or `role="columnheader"` / `role="rowheader"` for header cells). The basic unit of grid navigation and interaction.

**Cell editor**
An interactive widget — text input, select, date picker, checkbox, rich-text editor, or other control — that replaces a cell's read-only display when the cell enters edit mode. The editor is activated by pressing Enter or F2, or by direct typing. See FD-03.

**Cell interaction forwarding**
A GeneXus-originated pattern where clicking or interacting with one cell activates or modifies a logically related cell. The canonical example is clicking the row label cell to toggle the selection checkbox cell. The click event is forwarded programmatically so that accessibility attributes and state still reflect the checkbox cell. See FD-03.

**Cell range**
A rectangular selection of cells spanning one or more rows and one or more columns. Defined by an anchor cell (where selection began) and an active cell (the current extent). Extended with Shift+Arrow or Shift+Click. See F-05.

**Column**
A vertical series of cells sharing a common column header and data semantics. Columns have an identity (field name or ID), a data type, and display properties (width, visibility, pinning, alignment). Columns are defined in the grid's column definition model.

**Column group**
A named group of adjacent columns represented by a spanning header cell. Column groups may be collapsible (hiding the grouped columns) and may be nested. Implemented with multi-level header rows and `colspan` / `aria-colspan`. See F-09.

**Column header**
A cell in the header row that labels a column. Participates in sort activation (click or keyboard), column menu (right-click or button), and resize (drag handle). Carries `role="columnheader"` and `aria-sort` when the column is sortable.

**Columnheader (role)**
The ARIA role applied to column header cells (`<th scope="col">` equivalent in ARIA grid). Announces the column label to screen readers when a gridcell in that column receives focus. See FD-04.

**Critical path**
In a Gantt chart, the sequence of tasks that determines the shortest possible project completion duration. Tasks on the critical path have zero float; any delay directly delays the project end date. Critical path tasks are typically highlighted with a distinct color or pattern. See F-22 (Gantt variant).

**CSS Subgrid**
A CSS feature using the `subgrid` keyword for `grid-template-columns` and/or `grid-template-rows`, allowing a grid item's children to participate in the parent grid's track sizing. Used in the tabular grid to align cell content across rows without repeating column-width calculations in every row element. See FD-01.

---

## D

**Data Grid**
The base variant of the tabular grid. Uses `role="grid"`, supports flat rows and optional row grouping. Does not impose a hierarchy on the data model. The foundation on which Tree Grid, Pivot Table, and Gantt Chart variants are built. See F-01.

**Dependency (Gantt)**
A constraint between two Gantt tasks specifying that one task must begin or finish before another can begin or finish. The four standard dependency types are Finish-to-Start (FS), Start-to-Start (SS), Finish-to-Finish (FF), and Start-to-Finish (SF). Rendered as connector lines on the timeline. See F-22.

**DOM recycling**
The technique of reusing existing DOM elements for new row data when the user scrolls, instead of creating new elements and destroying off-screen ones. A performance optimization that reduces garbage collection pressure and layout reflow cost. Works together with virtualization. See FD-02.

---

## E

**Edit mode**
The state where a cell's editor widget is active and the user can input a new value. Entered from navigation mode via Enter, F2, or direct alphanumeric key press. Exited via Escape (cancel) or Tab/Enter (confirm and advance). During edit mode, Arrow keys operate within the editor rather than moving cell focus. See FD-03.

**Editability model**
The set of rules governing which cells can be edited, the conditions under which edit mode is entered or exited, and how Tab and Enter behave during editing. Covers immediate-commit vs. batch-edit modes, cell-level vs. row-level editing, and read-only overrides. Fully defined in FD-03.

---

## F

**Fill handle**
A UI control — typically a small square rendered at the corner of the active selection — that the user drags to extend a value or pattern across adjacent cells. Analogous to the fill handle in spreadsheet applications. Requires mouse or touch drag; keyboard alternative is available via a context menu action. See F-08.

**Filter model**
A data structure representing all currently active filter conditions across columns. In server-side row mode, the filter model is passed to the datasource `getRows` callback so the server can apply filtering before returning results. The structure includes field name, filter type, and filter value(s) for each active filter. See F-03, FD-05.

**Frozen column**
A column that remains horizontally fixed and always visible while the user scrolls the grid body to the right. Implemented via `position: sticky` with a calculated `left` (or `right` for right-frozen columns) offset. Also called a pinned column. See F-09.

**Focus management**
The strategy for controlling which DOM element holds keyboard focus within the complex grid widget. The two primary strategies are roving tabindex and aria-activedescendant. The choice affects how virtualization interacts with accessibility. See FD-04.

---

## G

**Gantt Chart**
A variant of the tabular grid that combines a task-list grid on the left with a graphical horizontal timeline on the right. The left grid uses `role="grid"` for task data; the timeline region uses `role="application"` with full keyboard support for task bar manipulation. Supports dependencies, milestones, and critical path display. See F-22 (Gantt variant specification).

**Gridcell (role)**
The ARIA role applied to data cells in a grid or treegrid. When a gridcell receives focus, screen readers announce the column header, row header (if any), and cell value. Required on all non-header cells in the grid body. See FD-04.

**Group row**
A row that represents an aggregated group of data rows, displaying a group label and optional aggregate values (sum, count, average). Has expand/collapse behavior to show or hide the child data rows. Carries `aria-expanded` and typically `aria-level` attributes. See F-11.

---

## H

**Header association**
The mechanism by which a data cell is programmatically linked to its column header and (in treegrid) its row header, enabling screen readers to announce full context when a cell receives focus. In an ARIA grid, this is achieved through the `role="columnheader"` / `role="rowheader"` on header cells in the same row or column. In an HTML `<table>`, it uses `<th scope>` or `headers` attributes. See FD-04.

---

## I

**Infinite scroll**
A data-loading pattern where additional rows are automatically fetched and appended as the user scrolls near the bottom of the visible content. Creates the appearance of an endlessly long list. Contrasts with pagination, which divides data into discrete pages. Compatible with the `infinite` row model. See F-16.

---

## L

**Lazy loading**
The pattern of fetching child node data only when the user expands a parent node, rather than loading the entire tree up-front. Triggers a datasource `getRows` call for the children of the expanded node. The parent row is shown in a loading state until children arrive. See F-12 (Tree Grid variant), FD-05.

**Live region**
An ARIA region marked with `aria-live="polite"` or `aria-live="assertive"` that causes screen readers to announce content changes without requiring keyboard focus to move to the changed element. Used in the grid to announce sort and filter state changes, row count updates, validation errors, and data load completions. See FD-04.

---

## M

**Marking (row mark)**
An independent visual and programmatic state on a row that is distinct from selection. Marking and selection can coexist on the same row simultaneously. Marks are typically used to flag rows for later action (e.g., "mark for deletion"), while selection tracks the current interactive context. Both states are exposed via ARIA. See F-06.

**Master-detail**
A layout pattern where a data row can be expanded to reveal a detail panel below it containing related content (a nested grid, a form, a chart, etc.). The detail panel is part of the row's expanded region. The row carries `aria-expanded`. See F-13.

**Milestone (Gantt)**
A zero-duration point in time on the Gantt timeline representing a significant project event (e.g., release date, review deadline). Rendered as a distinct shape (diamond or circle) rather than a bar. Carries accessible text describing the milestone name and date. See F-22.

---

## N

**Navigation mode**
The default state of the grid where keyboard focus moves between cells using Arrow keys, Home, End, Page Up, and Page Down. In navigation mode, the cell's interactive content is announced but not activated. Pressing Enter or F2 transitions to edit mode. Contrast with edit mode. See FD-03.

**Normative requirement**
A specification statement that implementors MUST fulfill. Normative requirements use the keywords "SHALL", "MUST", "MUST NOT", "SHALL NOT", "REQUIRED". Distinguished from informative notes, which use "SHOULD", "MAY", "RECOMMENDED", or "OPTIONAL" and provide guidance without mandating behavior.

---

## P

**Pagination**
The division of the grid's rows into discrete pages for display. Client-side pagination loads all data and slices it in the browser. Server-side pagination requests one page at a time from the server, passing `startRow`/`endRow` or `page`/`pageSize` parameters to the datasource. See F-16.

**Pivot table**
A variant of the tabular grid that aggregates source data across two axes: row dimension headers (left) and column dimension headers (top). The intersection cells contain aggregated values. Uses `role="grid"` with `aria-roledescription="pivot table"`. Column headers are dynamically generated from data values and may change as pivot configuration changes. See F-23 (Pivot variant specification).

**Pinned column**
Synonym for frozen column. A column fixed to the left or right edge of the scrollable grid body so it remains visible during horizontal scroll. See frozen column.

**Pinned row**
A row fixed to the top or bottom of the grid body that remains visible while the grid body scrolls vertically. Commonly used for aggregate/summary rows or for a "new row" input row. Implemented via `position: sticky`. See F-01.

---

## R

**Row**
A horizontal series of cells representing a single data record. Carries `role="row"`. In a treegrid, also carries `aria-level`, `aria-setsize`, and `aria-posinset`. The unit of selection, marking, and row-level operations (drag, expand, inline editing).

**Roving tabindex**
A focus management technique for composite widgets where only one element in the group has `tabindex="0"` at any time, and all others have `tabindex="-1"`. When focus moves to a new element, `tabindex="0"` is transferred to it and the previous element is set to `tabindex="-1"`. Allows Tab to enter and exit the composite widget while Arrow keys move within it. See FD-04. Contrast with aria-activedescendant.

**Row model**
The configuration that describes how row data is loaded and managed. Three models are supported: `client` (all rows loaded into memory at once), `serverSide` (rows fetched on demand with full server-side sort/filter/group support), and `infinite` (rows fetched in blocks as the user scrolls). The row model determines datasource API shape and virtualization behavior. See FD-05.

---

## S

**Sort model**
A data structure representing the current column sort state: an ordered list of `{ field, direction }` pairs supporting multi-column sort. In server-side row mode, the sort model is passed to the datasource `getRows` callback. The order of entries determines sort priority (first entry is primary sort). See F-02, FD-05.

**Sticky header**
A column header row (or multi-level header group) that remains visible at the top of the viewport while the grid body scrolls vertically. Implemented via `position: sticky; top: 0`. The sticky header must not obscure the focused cell (see WCAG 2.4.12). See FD-01, FD-04.

**Subgrid**
See CSS Subgrid. In the context of this specification, also refers to the body container element that inherits its parent's column track definitions via `grid-template-columns: subgrid`, enabling pixel-perfect column alignment between the header and body without duplicating column widths. See FD-01.

---

## T

**Treegrid**
The ARIA `role` applied to the grid element when the grid displays hierarchical parent-child data. Requires rows to carry `aria-level`, `aria-setsize`, and `aria-posinset`. Expandable rows carry `aria-expanded`. Screen readers announce tree structure context when navigating rows. See FD-04, F-12.

**Tree Grid**
A variant of the tabular grid designed for hierarchical parent-child data where rows can have child rows. Uses `role="treegrid"` on the container and `role="row"` with hierarchy attributes on each row. Supports lazy loading of child rows. See F-12.

**Transaction**
A group of data operations that are committed or rolled back as a single atomic unit. Used in batch editing (a set of cell edits) and undo/redo (an undoable action that may span multiple cells or rows). Transactions allow the grid to maintain a consistent data state and expose a clean undo history. See FD-03, F-17.

**Two-level focus**
A focus model for cells that contain multiple interactive child widgets (e.g., a cell with two action buttons). In the first level, Arrow-key navigation treats the entire cell as a single unit. Pressing Enter or F2 enters the second level, where Tab navigates between the child widgets inside the cell. Pressing Escape returns to first-level cell navigation. See FD-03, FD-04.

---

## V

**Variant**
One of the four specializations of the tabular grid component: Data Grid (flat/grouped rows), Tree Grid (hierarchical rows), Pivot Table (aggregated cross-tabulation), or Gantt Chart (task list with timeline). Each variant shares the core grid foundation but extends it with variant-specific ARIA roles, keyboard behaviors, and rendering. See F-01.

**Virtualization**
The technique of rendering only the rows and columns currently visible in the viewport (plus a small overscan buffer), and recycling DOM elements as the user scrolls. Enables the grid to display hundreds of thousands of rows with a fixed, small DOM footprint. Requires careful ARIA attribute management (aria-rowcount, aria-colcount, aria-rowindex, aria-colindex) to convey full data dimensions to assistive technologies. See FD-02, FD-04.

---

## W

**WCAG**
Web Content Accessibility Guidelines, published by the W3C Web Accessibility Initiative (WAI). The internationally recognized standard for web accessibility. This specification targets WCAG 2.2 AAA compliance — the highest conformance level, encompassing all A, AA, and AAA success criteria. See Appendix F for the grid-specific WCAG audit checklist.

---

*Appendix E — Tabular Grid Specification*
