# Appendix B: ARIA Attribute Quick Reference

> **Part of**: [Tabular Grid Specification](../README.md)
> **Type**: Quick-reference table synthesized from FD-04 and variant-specific files
> **Note**: For full context, see [FD-04: Accessibility Foundation](../01-foundations/04-accessibility-foundation.md) and the variant-specific files in `03-variant-specific/`.

## Overview

This appendix is a quick reference for all ARIA attributes used in the tabular grid component. Use this table to find which attributes are required, where they go, and what their valid values are.

---

## ARIA Attribute Reference

| Attribute | Element / Role | When Required | Valid Values | Purpose | Source |
|-----------|---------------|---------------|--------------|---------|--------|
| `role="grid"` | Root container element | Always, for Data Grid and Pivot Table variants | — | Identifies the component as an interactive grid widget to assistive technologies | FD-04 |
| `role="treegrid"` | Root container element | Always, for Tree Grid variant | — | Identifies the component as a tree-structured interactive grid; enables `aria-level`, `aria-setsize`, `aria-posinset` on rows | FD-04 |
| `role="application"` | Timeline region wrapper | Gantt Chart timeline region only | — | Signals that the region manages its own keyboard interaction; prevents browser from intercepting application-specific keys | F-14, Gantt variant |
| `role="region"` | Gantt outer wrapper element | Gantt Chart only | — | Identifies the Gantt Chart as a landmark region; must be paired with `aria-label` or `aria-labelledby` | Gantt variant |
| `role="rowgroup"` | `<thead>` and `<tbody>` containers | Always | — | Groups header rows or body rows; mirrors the semantic meaning of `<thead>`/`<tbody>` for non-table markup | FD-04 |
| `role="row"` | Each row element | Always | — | Identifies a row within the grid; required on every focusable row element | FD-04 |
| `role="columnheader"` | Header cells in the header row | Always, for each column header | — | Identifies a cell as a column header; screen readers announce it with sort state and column position | FD-04 |
| `role="rowheader"` | Leftmost cell(s) that identify the row | When a cell serves as a row label rather than a data value | — | Distinguishes row-identifying cells from data cells; commonly used in Pivot Table row dimension headers | FD-04, Pivot variant |
| `role="gridcell"` | Data cells in body rows | Always, for each non-header body cell | — | Identifies an interactive data cell; screen readers announce it with its row and column context | FD-04 |
| `role="button"` | Task bar elements in Gantt timeline | Always, for each task bar | — | Exposes task bars as activatable controls; enables Enter and Space activation semantics expected by screen reader users | Gantt variant |
| `role="img"` | Milestone marker elements | Always, for each milestone | — | Identifies decorative or informational milestone shapes as images; must have an accessible name via `aria-label` | Gantt variant |
| `role="menu"` | Context menu container | Whenever a context menu is present | — | Identifies the popup as a menu widget; enables arrow-key navigation expectations for screen reader users | FD-04 |
| `role="menuitem"` | Individual context menu items | Whenever `role="menu"` is used | — | Identifies each item within a menu; do not use `role="option"` (that is for listboxes) | FD-04 |
| `role="tooltip"` | Validation error messages, cell hover tooltips | When transient hint content is displayed adjacent to a cell or editor | — | Marks ephemeral informational text as a tooltip; referenced by `aria-describedby` on the triggering element | FD-04 |
| `aria-rowcount` | Root grid/treegrid element | Always when using virtualization or server-side data; otherwise recommended | Integer ≥ 1, or `-1` if total count is unknown | Communicates the total number of rows in the full dataset to assistive technologies, independent of how many rows are currently rendered in the DOM | FD-04 |
| `aria-colcount` | Root grid/treegrid element | Always when using column virtualization; otherwise recommended | Integer ≥ 1, or `-1` if total count is unknown | Communicates the total number of columns in the full dataset to assistive technologies | FD-04 |
| `aria-rowindex` | Each `role="row"` element | Required on every row when `aria-rowcount` is set | Integer ≥ 1; 1-based position in the complete dataset | Tells screen readers the absolute position of the row in the full dataset, not just the rendered slice | FD-04 |
| `aria-colindex` | Each `role="gridcell"`, `role="columnheader"`, `role="rowheader"` | Required on every cell when `aria-colcount` is set | Integer ≥ 1; 1-based column position in the complete dataset | Tells screen readers the absolute column position of the cell in the full dataset | FD-04 |
| `aria-rowspan` | Cells that span multiple rows | When a cell visually merges across two or more rows | Integer ≥ 2 | Communicates merged row cells to assistive technologies; commonly used in Pivot Table merged column header groups | Pivot variant |
| `aria-colspan` | Cells that span multiple columns | When a cell visually merges across two or more columns | Integer ≥ 2 | Communicates merged column cells to assistive technologies; commonly used in Pivot Table merged row dimension headers | Pivot variant |
| `aria-sort` | `role="columnheader"` | On every sortable column header; also on the currently sorted column | `none` \| `ascending` \| `descending` \| `other` | Communicates the current sort direction to screen readers; `none` must be set on sortable-but-unsorted columns so users know they can interact | FD-04 |
| `aria-expanded` | Parent rows in Tree Grid, group header rows, expandable row dimension headers in Pivot | On every row that can be expanded or collapsed | `true` \| `false` | Communicates the expanded/collapsed state of a parent node or group to screen readers | FD-04, Tree Grid variant, Pivot variant |
| `aria-selected` | `role="row"` or `role="gridcell"` | On every row or cell when selection is enabled | `true` \| `false` | Communicates whether the row or cell is part of the current selection | FD-04 |
| `aria-checked` | `role="row"` with a checkbox-style selection | When rows use a tri-state checkbox pattern for selection (e.g., in tree grids with partial child selection) | `true` \| `false` \| `mixed` | The `mixed` value communicates partial selection of a parent node's children | FD-04, Tree Grid variant |
| `aria-level` | `role="row"` in a treegrid | On every row in the Tree Grid variant | Integer ≥ 1; 1-based depth in the tree | Communicates the nesting depth of the row to screen readers; only valid when the container has `role="treegrid"` | Tree Grid variant |
| `aria-setsize` | `role="row"` in a treegrid | On every row in the Tree Grid variant | Integer ≥ 1, or `-1` if unknown | The total number of sibling rows at the same level under the same parent; communicates set size to screen readers | Tree Grid variant |
| `aria-posinset` | `role="row"` in a treegrid | On every row in the Tree Grid variant | Integer ≥ 1; 1-based position among siblings | The position of this row within its sibling set; used together with `aria-setsize` | Tree Grid variant |
| `aria-label` | Grid container, landmark regions, task bars, milestone markers | Required on `role="region"` and `role="application"` elements; recommended on the grid container itself; required on task bars and milestones that lack visible text labels | Any non-empty string | Provides an accessible name for elements that do not have a visible text label or whose visible label is insufficient | FD-04, Gantt variant |
| `aria-labelledby` | Grid container, landmark regions | When an existing visible element contains the label text | One or more element ID references (space-separated) | References an existing visible label element instead of duplicating text in `aria-label`; preferred over `aria-label` when a visible label exists | FD-04 |
| `aria-describedby` | Cells with validation errors, Gantt timeline region, task bars with dependencies | When supplementary descriptive text is available beyond the accessible name | One or more element ID references | Associates descriptive or instructional text with an element; used to link validation error messages (via `role="tooltip"`) and Gantt keyboard help text to their elements | FD-04, Gantt variant |
| `aria-busy` | Root grid/treegrid element | During data loading, sorting, filtering, or Pivot Table reconfiguration | `true` \| `false` | Signals to screen readers that the content is being updated and announcements should be held; set to `false` when the update is complete | FD-04 |
| `aria-live` | Live region containers for status messages and error announcements | On dedicated off-screen announcement containers | `polite` \| `assertive` | `polite` for non-critical status messages (row count updates, sort confirmation); `assertive` for critical errors and validation failures | FD-04 |
| `aria-atomic` | Live region containers | On any element with `aria-live` | `true` \| `false` | `true` instructs screen readers to announce the entire content of the live region on each update, not just the changed portion | FD-04 |
| `aria-relevant` | Live region containers | Optional; use only when the default behavior (`additions text`) is insufficient | `additions` \| `removals` \| `text` \| `all` (space-separated list) | Specifies which types of DOM changes should be announced; the default (`additions text`) is appropriate for most cases | FD-04 |
| `aria-hidden` | Cloned sticky header rows, purely decorative elements | On every element that is a visual duplicate of an already-accessible element, or is purely decorative | `true` | Removes the element from the accessibility tree; critical for cloned sticky header rows to prevent duplicate column header announcements | FD-04 |
| `aria-invalid` | Cell editor elements | When the editor's current value fails validation | `true` \| `false` \| `grammar` \| `spelling` | Signals to assistive technologies that the field contains an invalid value; must be paired with `aria-describedby` pointing to the error message | FD-04 |
| `aria-disabled` | `role="gridcell"`, `role="row"`, interactive child elements | When a cell or row is conditionally non-interactive (visible but not operable) | `true` \| `false` | Unlike the HTML `disabled` attribute, `aria-disabled` keeps the element focusable and discoverable by keyboard users and screen readers | FD-04 |
| `aria-haspopup` | Cells or rows that trigger a popup on activation | When activating the element opens a menu, dialog, or listbox | `menu` \| `listbox` \| `tree` \| `grid` \| `dialog` \| `true` | Advertises that activating the element will open a popup; screen readers may announce the popup type | FD-04 |
| `aria-current` | Today marker element in Gantt timeline | Always, on the element that marks the current date | `date` | Identifies the element as representing the current date; the value `date` is the semantically correct token for date-related markers | Gantt variant |
| `aria-roledescription` | Pivot Table root container, Gantt task bar elements, milestone marker elements | When the default role name announced by screen readers is insufficient or misleading | Any non-empty string (e.g., `"pivot table"`, `"task bar"`, `"milestone"`) | Replaces the generic role name with a more descriptive application-specific label in screen reader announcements; must not be used as a substitute for `aria-label` | FD-04, Pivot variant, Gantt variant |
| `aria-orientation` | Today marker separator in Gantt timeline | On the separator element that marks the current day column | `vertical` \| `horizontal` | Communicates the visual orientation of the separator element to assistive technologies | Gantt variant |
| `aria-pressed` | Task bar elements (`role="button"`) | When a task bar can be toggled into a selected/active state | `true` \| `false` \| `mixed` | Communicates the pressed/selected state of a button-role task bar; use when selection is a persistent toggle state, not just a transient activation | Gantt variant |
| `aria-owns` | Any element | Avoid; do not use in the tabular grid component | — | DOM structure should reflect the logical ownership of elements; `aria-owns` is a last resort and introduces fragility; not used in this component | FD-04 |
| `aria-activedescendant` | Root grid/treegrid element | Optional; only for implementations that use a single-tab-stop composite widget pattern with a statically rendered DOM | ID reference to the currently focused child element | An alternative to the roving `tabindex` pattern; can reduce focus management complexity in heavily virtualized grids but requires all candidate elements to be present in the DOM | FD-04 |
| `aria-grabbed` | Gantt task bar elements during drag operations | During user-initiated drag of a task bar | `true` \| `false` \| `undefined` (attribute absent = not draggable) | Communicates drag state to screen readers; deprecated in ARIA 1.2 in favor of the HTML Drag and Drop API accessibility model, but still referenced for compatibility with older assistive technologies | Gantt variant |

---

## Common Mistakes to Avoid

The following mistakes are frequently observed in grid implementations and result in degraded accessibility.

**Using `aria-level`, `aria-setsize`, or `aria-posinset` on rows in a `role="grid"` container**
These attributes are only valid on `role="row"` elements within a `role="treegrid"` container. Applying them inside a flat `role="grid"` has no defined semantics and may confuse screen readers. Use `role="treegrid"` for the Tree Grid variant.

**Applying `role="application"` to the entire Gantt component instead of only the timeline region**
`role="application"` disables the browser's default keyboard handling, including screen reader virtual/browse mode for the enclosed content. It must be scoped to the exact region that manages its own keyboard interaction — the timeline canvas — not the entire Gantt Chart wrapper. The task list must remain inside a `role="grid"` container.

**Setting `aria-rowindex` starting from 0 instead of 1**
The ARIA specification requires `aria-rowindex` values to be 1-based integers. A value of `0` is invalid. Off-by-one errors here cause screen readers to announce incorrect row positions to users.

**Using `aria-hidden="true"` on focusable elements**
An element that is focusable via keyboard (whether via `tabindex`, native interactivity, or roving focus management) must never have `aria-hidden="true"`. Doing so makes the element invisible to screen readers while still reachable by keyboard, creating a silent keyboard trap. Either remove the element from the tab sequence or remove `aria-hidden`.

**Forgetting to update `aria-rowcount` after server-side row loading**
When rows are loaded incrementally from a server, the total row count may become known after initial render. The `aria-rowcount` attribute on the root grid element must be updated once the total is available. Leaving it at `-1` indefinitely means screen reader users never learn the size of the dataset.

**Using `aria-label` instead of `aria-roledescription` to add a descriptive role name**
`aria-label` replaces the element's accessible name, not its role name. Setting `aria-label="pivot table"` on the root grid element would cause screen readers to announce "pivot table" as the name of the grid, suppressing the actual label (e.g., "Sales Report"). Use `aria-roledescription="pivot table"` to augment the role name and a separate `aria-label` or `aria-labelledby` for the accessible name.

**Cloning header rows for sticky effect without setting `aria-hidden="true"` on the clones**
A common implementation technique for sticky column headers is to clone the header row and position it with CSS. If the clone is not removed from the accessibility tree with `aria-hidden="true"`, screen readers will encounter every column header twice, producing confusing duplicate announcements. All cloned header rows must have `aria-hidden="true"`.

---

*This appendix is synthesized from [FD-04: Accessibility Foundation](../01-foundations/04-accessibility-foundation.md) and the variant-specific files. See [README.md](../README.md) for the complete table of contents.*
