# F-06: Tree / Hierarchical Data

Tree and hierarchical data features enable the grid to display, navigate, and manipulate parent-child relationships at arbitrary nesting depths. Unlike grouping (F-04), which creates visual hierarchy from flat data by shared column values, tree features represent *inherent* hierarchical data where each row has a defined parent (or is a root node). The Tree Grid variant uses `role="treegrid"` with `aria-level`, `aria-setsize`, and `aria-posinset` to convey this structure -- this is fundamentally different from the grouped Data Grid, which uses `role="grid"` with `role="rowgroup"`. Implementers MUST NOT mix these two patterns.

Tree features are primarily a **Tree Grid** feature but also apply to the **Gantt Chart** (which uses a tree-structured task list for WBS hierarchies) and, in limited form, to the **Data Grid** (auto-group column for hierarchical result sets). The **Pivot Table** does not use tree features; its dimension hierarchy is handled by F-05.

> **Foundations**: This feature assumes the layout model defined in [FD-01](../01-foundations/01-layout-model.md). Tree rows are standard subgrid rows; indentation is achieved via `padding-inline-start` within the tree column cell, not by consuming additional grid tracks. The variant model in [FD-02](../01-foundations/02-variant-model.md), Section 2.2, defines the Tree Grid's ARIA role and required attributes. The accessibility foundation in [FD-04](../01-foundations/04-accessibility-foundation.md) defines the baseline focus management model that tree-specific focus behaviors extend. The full ARIA structural model for `role="treegrid"` -- including `aria-level`, `aria-setsize`, `aria-posinset`, and expand/collapse focus rules -- is detailed in [03-variant-specific/03-tree-grid.md](../03-variant-specific/03-tree-grid.md).

> **Chameleon 6 context**: Chameleon 6 supported tree data via the tree node cell type with `caret`, `indent`, `node-selector`, and `node-icon` CSS Parts. It exposed `expandRow(id)` and `collapseRow(id)` methods, and the `cellCaretClicked` event for expand/collapse interaction. Chameleon 7 carries forward these concepts with enhanced ARIA semantics, keyboard navigation, lazy loading, and declarative configuration.

---

## 6.1 Tree Data with Expand/Collapse [P0]

**Description**: The grid displays hierarchical parent-child data as an indented tree structure where parent rows can be expanded to reveal their children or collapsed to hide them. Each row exists at a specific depth level in the hierarchy, and nesting can be arbitrarily deep. This is the foundational tree feature upon which all other tree features depend. The data model provides parent-child relationships (via a `parentId` field, a `children` array, or a path-based hierarchy), and the grid renders them as an expandable tree within the tabular layout.

**Applies to**: Tree Grid, Gantt Chart (WBS task list), Data Grid (when displaying hierarchical result sets via auto-group column, F-06.8)

**Use Cases**
- UC-1: A file browser displays a directory tree with folders and files, allowing the user to expand folders to see their contents and collapse them to reduce visual noise.
- UC-2: An organizational chart displays employees in a reporting hierarchy (CEO > VPs > Directors > Managers > Individual Contributors) with expand/collapse at each level.
- UC-3: A product catalog displays categories, subcategories, and products as a nested tree, allowing a buyer to drill into specific categories.
- UC-4: A Gantt Chart displays a Work Breakdown Structure (WBS) where project phases contain task groups, which contain individual tasks.
- UC-5: A bill of materials (BOM) displays assemblies containing sub-assemblies containing parts, with arbitrary nesting depth representing the manufacturing hierarchy.

**Conditions of Use**
- The grid MUST accept hierarchical data in at least two formats: (a) a flat array with each row containing a `parentId` (or equivalent foreign key) that references its parent row's ID, with root nodes having `parentId: null`; (b) a nested object structure where each row has a `children` array containing its child rows.
- The grid MUST accept a configuration property identifying which column serves as the tree column (the column displaying expand/collapse controls and indentation). If not specified, the first visible column MUST be used as the default tree column.
- The grid MUST accept a configuration property for the default expanded state of tree nodes (e.g., `defaultExpanded: boolean | number`, where a number specifies the depth to which nodes are expanded by default). Default: `false` (all collapsed except root-level rows).
- The data model MUST provide a unique identifier for each row to support parent-child relationship resolution and programmatic expand/collapse.

**Behavioral Requirements**
- BR-1: The grid MUST render rows in tree order: a parent row is immediately followed by its children (when expanded), which are in turn followed by their children, producing a depth-first traversal order in the visual display.
- BR-2: Parent rows (rows with children) MUST display an expand/collapse toggle control in the tree column. The toggle MUST be clickable to expand or collapse the node. Leaf rows (rows with no children) MUST NOT display a toggle control.
- BR-3: When a parent row is collapsed, ALL descendant rows (children, grandchildren, etc.) MUST be removed from the DOM or hidden with `display: none` so they are excluded from both the visual display and the accessibility tree. Using `visibility: hidden` alone is NOT sufficient.
- BR-4: When a parent row is expanded, its direct children MUST become visible. If any of those children are themselves expanded parents, their children MUST also be visible (recursively). The expand/collapse state of each descendant MUST be preserved across parent collapse/expand cycles -- collapsing a grandparent and re-expanding it MUST restore the intermediate parent's previously remembered expanded/collapsed state.
- BR-5: The grid MUST provide programmatic methods to expand and collapse rows: `expandRow(rowId)`, `collapseRow(rowId)`, `expandAll()`, `collapseAll()`, and `expandToLevel(depth: number)`. These methods MUST update both the visual state and the ARIA attributes.
- BR-6: The grid MUST emit a `rowExpandedChanged` event when a row is expanded or collapsed, containing the row ID, the new expanded state (`true` or `false`), and the row's depth level. This event MUST fire for both user-initiated and programmatic expand/collapse operations.
- BR-7: When a parent row is collapsed and the current focus (the active cell or active row) was on a descendant of that parent, focus MUST move to the collapsed parent row (specifically, to the same column index within the parent row, or to the tree column cell if the original column is not applicable). The grid MUST NOT leave focus on a hidden element.
- BR-8: When a parent row is collapsed and a descendant row was selected, the selection state of the descendant MUST be preserved in memory. When the parent is re-expanded, the descendant's selection MUST be restored visually. The grid MUST NOT silently clear selection on collapse.
- BR-9: The grid MUST support dynamically adding or removing child rows at runtime. Adding a child to a currently expanded parent MUST immediately render the new child row in the correct position. Adding a child to a collapsed parent MUST NOT auto-expand the parent.
- BR-10: The grid MUST correctly compute and maintain `aria-setsize` and `aria-posinset` for all visible rows, updating these values when the tree structure changes (expand, collapse, add, remove, filter).

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Data Grid | Data Grid MAY display tree data via the auto-group column (F-06.8) while retaining `role="grid"`. In this mode, `aria-level`, `aria-setsize`, and `aria-posinset` MUST NOT be used (those are `treegrid`-only attributes). Instead, hierarchy is conveyed visually through indentation and expand/collapse, with group rows using `role="rowgroup"` where appropriate. |
| Tree Grid | The full `role="treegrid"` model applies. Every body row MUST carry `aria-level`, `aria-setsize`, and `aria-posinset`. Parent rows MUST carry `aria-expanded="true"` or `aria-expanded="false"`. Leaf rows MUST NOT carry `aria-expanded`. |
| Pivot Table | N/A. The Pivot Table's dimensional hierarchy is managed by F-05, not by the tree data model. |
| Gantt Chart | The Gantt Chart's task list region uses `role="treegrid"` when displaying WBS hierarchy. All Tree Grid ARIA rules apply to the task list. The timeline region renders summary bars for parent tasks that span the date range of all descendant tasks. Collapsing a parent task hides descendant timeline bars and shows only the parent's summary bar. |

**CSS Subgrid Implications**

Tree rows are standard subgrid rows and follow the same pattern as all other rows per [FD-01](../01-foundations/01-layout-model.md):

```css
.tree-row {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
}
```

Indentation does NOT consume grid tracks. It is achieved via `padding-inline-start` on the tree column cell (see F-06.3). This ensures that all tree rows, regardless of depth, share the same column track structure, and column operations (resize, hide, reorder, freeze) affect all tree rows uniformly.

**Editability Interaction**
- All tree rows (both parent and leaf) are editable per their normal editability rules ([FD-03](../01-foundations/03-editability-model.md)). Parent rows are data rows, not structural group headers -- they contain real data and MUST be editable when `editable: true` is configured.
- When a cell in the tree column is in Edit Mode, the expand/collapse toggle MUST NOT interfere with the editor. Clicking the toggle area MUST toggle expand/collapse and MUST NOT activate the cell editor. Clicking the cell content area (outside the toggle) MUST activate the editor per FD-03.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Enter | If on a parent row's tree column cell: toggle expand/collapse. If on a non-tree column cell: enter Edit Mode (per FD-03). | Navigation Mode |
| Space | Toggle row selection (per F-08) or toggle expand/collapse if on tree column | Navigation Mode |
| Arrow Right | If on a collapsed parent row: expand the row (do not move focus). If on an expanded parent row: move focus to the first child row. If on a leaf row: move focus to the next column cell. | Navigation Mode |
| Arrow Left | If on an expanded parent row: collapse the row (do not move focus). If on a collapsed parent row or leaf row: move focus to the parent row. If at root level and collapsed: no action. | Navigation Mode |
| Arrow Down | Move focus to the next visible row (skipping collapsed descendants) | Navigation Mode |
| Arrow Up | Move focus to the previous visible row (skipping collapsed descendants) | Navigation Mode |
| Home | Move focus to the first row in the tree (first root node) | Navigation Mode |
| End | Move focus to the last visible row in the tree | Navigation Mode |
| \* (asterisk/multiply on numpad) | Expand all sibling nodes at the current level (WAI-ARIA APG treegrid pattern) | Navigation Mode |

**Accessibility**
- **ARIA**: The grid root MUST carry `role="treegrid"`. Each body row MUST carry `role="row"` with `aria-level` (1-based depth), `aria-setsize` (number of siblings at the same level under the same parent), and `aria-posinset` (1-based position among siblings). Parent rows MUST carry `aria-expanded="true"` when expanded and `aria-expanded="false"` when collapsed. Leaf rows MUST NOT have the `aria-expanded` attribute at all (omit it entirely, do not set it to any value). The tree column cell MUST carry `role="gridcell"` (or `role="rowheader"` if it serves as the row identifier).
- **Screen Reader**: When focus lands on a tree row: SR: "[Cell value], row [N] of [total visible], level [depth], [expanded/collapsed if parent], [setsize] items at this level". When the user expands a row: live region announces SR: "[Row name] expanded, [N] child items". When the user collapses a row: live region announces SR: "[Row name] collapsed". When focus is forcibly moved to a collapsed parent (due to BR-7): the screen reader MUST announce the parent row as the new focus target.
- **WCAG**: 1.3.1 (tree structure is programmatically determinable via `aria-level`, `aria-setsize`, `aria-posinset`, and `aria-expanded`), 2.1.1 (expand/collapse is keyboard-accessible via Enter, Arrow Right/Left), 2.4.3 (focus order follows depth-first tree traversal of visible rows), 2.4.7 (focus indicator visible on the active row/cell), 4.1.2 (name, role, and expanded state are programmatically determinable).
- **Visual**: Parent rows MUST display an expand/collapse affordance (caret/chevron icon) that changes orientation or shape to indicate expanded vs. collapsed state. The change MUST NOT rely on color alone (WCAG 1.4.1). Indentation MUST clearly convey nesting depth. A visible focus indicator meeting WCAG 2.4.11 (Focus Appearance) MUST be present.

**Chameleon 6 Status**: Existed. Chameleon 6 supported tree data via the tree node cell type with expand/collapse caret. The `expandRow(id)` and `collapseRow(id)` methods controlled state programmatically. The `cellCaretClicked` event notified the application of user expand/collapse actions. Chameleon 7 enhances this with full `treegrid` ARIA semantics (`aria-level`, `aria-setsize`, `aria-posinset`), Arrow Right/Left keyboard expand/collapse, focus management on collapse (BR-7), and declarative `defaultExpanded` configuration.

**Interactions**
- F-06.2 (Lazy-Load Children): async loading triggered by expand.
- F-06.3 (Indentation Levels): visual indentation per depth.
- F-06.4 (Tree Column with Carets/Icons): expand/collapse toggle and node icons.
- F-06.5 (Tri-State Checkbox Selection): checkbox selection propagation through hierarchy.
- F-06.7 (Filtering Within Tree): filtered view preserves ancestor chains.
- F-06.8 (Auto-Group Column): auto-generated tree column for hierarchical data.
- F-08 (Selection): row selection interacts with tree expand/collapse.
- F-11 (Virtualization): collapsed subtrees are excluded from the virtualized row set.
- F-14 (Keyboard Navigation): Arrow Right/Left for expand/collapse is integrated into the keyboard model.
- F-21 (State Persistence): per-row expanded state should be included in saved grid state.

---

## 6.2 Lazy-Load Children (Async Tree) [P0]

**Description**: Child rows are loaded from the server on demand when a parent node is expanded for the first time, rather than preloading the entire hierarchy. This is critical for large hierarchies (file systems, organizational charts, product taxonomies) where loading all data upfront would be prohibitively expensive. The parent row indicates a loading state while children are being fetched, and the loaded children are cached for subsequent expand/collapse cycles.

**Applies to**: Tree Grid, Gantt Chart (WBS task list), Data Grid (auto-group column with lazy children)

**Use Cases**
- UC-1: A file browser loads directory contents from the server only when the user expands a folder, enabling navigation of a file system with millions of files without upfront data transfer.
- UC-2: An organizational hierarchy loads direct reports from an HR API when a manager node is expanded, supporting organizations with tens of thousands of employees.
- UC-3: A product catalog loads subcategories and products from a commerce API on demand, enabling navigation of catalogs with hundreds of thousands of SKUs.
- UC-4: A Gantt Chart loads sub-tasks from a project management API when a parent task is expanded, supporting projects with thousands of tasks across multiple phases.
- UC-5: A hierarchical comment thread loads replies from the server when a parent comment is expanded, supporting threads with deep nesting and high reply counts.

**Conditions of Use**
- The grid MUST accept a callback function for fetching children (e.g., `getChildren: (parentRowData: RowData) => Promise<RowData[]>`). The callback receives the parent row's data and returns a promise that resolves with an array of child row data objects.
- A parent row MUST indicate whether it *might* have children before the children are loaded. This MUST be specified via a `hasChildren` property on the row data (or a column definition callback `hasChildren: (rowData: RowData) => boolean`). Rows with `hasChildren: true` MUST display the expand toggle even when no children are currently loaded.
- The grid SHOULD support a caching strategy: once children are loaded for a parent, collapsing and re-expanding the parent MUST NOT re-fetch children from the server unless the cache is explicitly invalidated via API (e.g., `refreshChildren(rowId)`).

**Behavioral Requirements**
- BR-1: When a parent row with `hasChildren: true` and no loaded children is expanded (by user click, keyboard, or API call), the grid MUST invoke the `getChildren` callback with the parent row's data.
- BR-2: While the `getChildren` promise is pending, the grid MUST set `aria-busy="true"` on the parent row element to indicate that the row is loading content.
- BR-3: While the `getChildren` promise is pending, the grid MUST display a visual loading indicator. This SHOULD be an inline spinner or skeleton rows beneath the parent row, NOT a full-grid overlay. The parent row MUST remain interactive (the user can collapse it to cancel the visual loading state).
- BR-4: While the `getChildren` promise is pending, the grid MUST announce the loading state via a live region (`role="status"`, `aria-live="polite"`): SR: "Loading children of [parent row name]...".
- BR-5: When the `getChildren` promise resolves successfully, the grid MUST: (a) insert the child rows beneath the parent in tree order, (b) update the parent row's `aria-expanded` to `"true"`, (c) remove `aria-busy` from the parent row, (d) update `aria-setsize` and `aria-posinset` on the newly inserted child rows, (e) announce via live region: SR: "[N] items loaded".
- BR-6: If the `getChildren` promise resolves with an empty array, the grid MUST: (a) update the parent to a leaf state (remove the expand toggle, remove `aria-expanded`), (b) remove `aria-busy`, (c) announce via live region: SR: "No child items".
- BR-7: If the `getChildren` promise rejects (error), the grid MUST: (a) remove `aria-busy` from the parent row, (b) keep the expand toggle visible (the user may retry), (c) announce via live region: SR: "Failed to load children of [parent row name]", (d) emit an `error` event with the error details.
- BR-8: Focus MUST remain on the parent row throughout the loading process. The grid MUST NOT move focus to a loading indicator or to the first loaded child. The user can then Arrow Down to navigate to the loaded children.
- BR-9: If the user collapses the parent row while loading is in progress, the grid SHOULD cancel the pending request (if the `getChildren` callback supports cancellation via `AbortController` or similar) and remove the loading indicator. Children that arrive after cancellation MUST be cached but NOT displayed until the parent is re-expanded.
- BR-10: The grid MUST support a `refreshChildren(rowId)` method that clears the cached children for the specified parent and re-invokes `getChildren` on the next expand. This allows the application to force a refresh when the server data may have changed.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Full lazy-load behavior as described. |
| Data Grid | If using auto-group column (F-06.8) with lazy children, the same loading mechanism applies. ARIA attributes differ (no `aria-level`/`aria-setsize`/`aria-posinset`). |
| Pivot Table | N/A. Pivot Table dimensions are pre-determined by the data; lazy-load does not apply to the dimension model. |
| Gantt Chart | Lazy-load applies to the task list. When children are loaded, the timeline MUST render corresponding bars after the promise resolves. The timeline SHOULD show a placeholder (dashed summary bar) for parent tasks with unloaded children. |

**CSS Subgrid Implications**

Loading indicator rows (skeleton placeholders) MUST participate in the subgrid layout like any other row, using `grid-template-columns: subgrid; grid-column: 1 / -1`. Skeleton cells MUST align with column tracks to maintain visual consistency. When the loading completes and real child rows replace skeleton rows, no subgrid structural change occurs -- only row content changes.

**Editability Interaction**
- Parent rows are editable independently of their loading state. If a parent row is in Edit Mode when the user triggers expand (which must happen via the toggle, not the keyboard shortcuts that would conflict with editing), the edit MUST NOT be cancelled. The loading and child insertion happen around the parent row.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Arrow Right | On a collapsed parent with `hasChildren: true` and no loaded children: trigger lazy-load (same as expanding). Focus stays on parent. | Navigation Mode |
| Arrow Right | On a parent that is currently loading (`aria-busy="true"`): no action (do not trigger a second load). | Navigation Mode |
| Escape | While loading is in progress and focus is on the parent: collapse the parent and cancel the load (if cancellation is supported). | Navigation Mode |

**Accessibility**
- **ARIA**: `aria-busy="true"` MUST be set on the parent row element while loading. `aria-busy` MUST be removed when loading completes (success, empty, or error). The `aria-expanded` attribute on the parent MUST remain `"false"` until children are loaded and displayed (the row is not semantically "expanded" while loading).
- **Screen Reader**: Loading announcement: SR: "Loading children of [parent row name]...". Success announcement: SR: "[N] items loaded". Empty announcement: SR: "No child items". Error announcement: SR: "Failed to load children of [parent row name]". All announcements via `aria-live="polite"` live region.
- **WCAG**: 1.3.1 (`aria-busy` conveys loading state programmatically), 2.1.1 (lazy-load is triggered by keyboard via Arrow Right/Enter), 4.1.3 (status messages are available to assistive technology via live region without receiving focus -- WCAG 2.2 Level AA).
- **Visual**: A loading spinner or animation MUST be displayed in the indentation area below the parent row. The spinner MUST respect `prefers-reduced-motion: reduce` (use a static "loading" text or icon instead of animation). Error state SHOULD display a retry affordance (icon or text link).

**Chameleon 6 Status**: Existed (partially). Chameleon 6 supported lazy-load via the `cellCaretClicked` event: the application intercepted the event, fetched children, and programmatically inserted them into the data model. The grid did not manage loading state or caching internally. Chameleon 7 introduces a declarative `getChildren` callback with built-in loading state management, caching, `aria-busy`, and live region announcements.

**Interactions**
- F-06.1 (Tree Data with Expand/Collapse): lazy-load is the async variant of expand.
- F-06.3 (Indentation Levels): loaded children are indented at the correct depth level.
- F-06.4 (Tree Column with Carets/Icons): the caret toggles expand, which triggers lazy-load.
- F-06.7 (Filtering Within Tree): filtering lazy-loaded trees requires server-side filtering support or a full-load-then-filter strategy.
- F-11 (Virtualization): lazily loaded rows participate in virtualization once inserted into the row set.
- F-20 (Server-Side Operations): lazy-load is a form of server-side row model; the `getChildren` callback is the interface between the grid and the server.

---

## 6.3 Indentation Levels [P0]

**Description**: Visual indentation proportional to each row's depth in the tree hierarchy provides the primary visual cue for understanding parent-child relationships. Each nesting level shifts the tree column cell's content further to the right (or the start side in RTL), creating a staircase effect that mirrors the tree structure. The indentation amount per level is configurable and is implemented via CSS padding, not by consuming grid tracks.

**Applies to**: Tree Grid, Gantt Chart (WBS task list), Data Grid (auto-group column)

**Use Cases**
- UC-1: A file browser indents directories and files proportionally to their depth, allowing users to instantly perceive the folder structure at a glance.
- UC-2: A large organizational chart with 8+ levels of hierarchy uses indentation to show reporting depth, with each level indented by 20px.
- UC-3: A Gantt Chart's WBS task list indents sub-tasks under their parent phases, visually grouping related work items.

**Conditions of Use**
- The grid MUST apply indentation only to the tree column (the column designated for tree controls via F-06.1 or auto-generated via F-06.8).
- The indentation amount per level MUST be configurable via a CSS custom property (e.g., `--ch-tabular-grid-tree-indent: 20px`). The default indent per level SHOULD be 20px.
- Indentation MUST be computed as `depth * indent-size`, where `depth` is the 0-based nesting level (root rows have depth 0 and zero indentation, their children have depth 1 and one unit of indentation, etc.). Alternatively, if `aria-level` is 1-based, indentation MUST be `(aria-level - 1) * indent-size`.

**Behavioral Requirements**
- BR-1: The grid MUST apply `padding-inline-start` to the tree column cell, computed as `(row depth) * var(--ch-tabular-grid-tree-indent, 20px)`. This padding pushes the cell content (caret + icon + text) rightward proportionally to depth.
- BR-2: Indentation MUST NOT consume additional grid tracks. The tree column occupies a single column track, and all rows share the same track width for that column regardless of depth. Indentation is within-cell padding, not structural layout.
- BR-3: Indentation MUST apply to ALL rows in the tree column, including parent and leaf rows. Leaf rows receive the same indentation as their sibling parent rows (they are at the same depth).
- BR-4: When a row's depth changes (e.g., via drag-and-drop reparenting, F-06.6), the grid MUST immediately update the indentation to reflect the new depth.
- BR-5: In RTL (right-to-left) layouts, indentation MUST shift content toward the right (the start side in RTL). The use of `padding-inline-start` ensures this automatically in compliant CSS implementations.
- BR-6: The grid SHOULD expose a CSS Part on the tree column cell content area (e.g., `::part(tree-cell-content)`) to allow developers to customize indentation styling beyond the default padding (e.g., adding connecting tree lines).
- BR-7: The grid MUST NOT allow indentation to cause the tree column cell content to overflow and become hidden. When indentation pushes content beyond the column width, the grid SHOULD either: (a) auto-widen the tree column, (b) show a horizontal scrollbar within the tree column, or (c) allow text truncation with a tooltip (F-01.4) to reveal full content. The default behavior SHOULD be text truncation with tooltip.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Full indentation behavior as described. `aria-level` on each row provides the programmatic depth. |
| Data Grid | If using auto-group column (F-06.8), indentation applies to that column. The depth is conveyed visually only (no `aria-level`). |
| Pivot Table | N/A. Pivot Table row dimension headers may have nesting, but this is handled by spanning headers (F-05.2), not by cell-level indentation. |
| Gantt Chart | Indentation applies to the task list region's tree column. The timeline region does not use indentation; it uses bar nesting and summary bars to convey hierarchy. |

**CSS Subgrid Implications**

Indentation is achieved entirely within a single grid track via `padding-inline-start`. This preserves the subgrid column alignment:

```css
.tree-cell[data-depth="0"] { padding-inline-start: calc(0 * var(--ch-tabular-grid-tree-indent, 20px)); }
.tree-cell[data-depth="1"] { padding-inline-start: calc(1 * var(--ch-tabular-grid-tree-indent, 20px)); }
.tree-cell[data-depth="2"] { padding-inline-start: calc(2 * var(--ch-tabular-grid-tree-indent, 20px)); }
/* Or dynamically via inline style: padding-inline-start: calc(var(--depth) * var(--ch-tabular-grid-tree-indent, 20px)); */
```

Because indentation is padding within the cell (not a change to the grid track), column resizing, freezing, hiding, and reordering are unaffected. The tree column track width applies uniformly to all rows; only the content offset differs.

**Accessibility**
- **ARIA**: Indentation is a visual affordance. The programmatic tree structure is conveyed via `aria-level` (Tree Grid) or `role="rowgroup"` nesting (Data Grid). Assistive technology MUST NOT rely on indentation to determine hierarchy -- `aria-level` provides this information.
- **Screen Reader**: The screen reader MUST announce the level via `aria-level`, not via pixel indentation. For example: SR: "Level 3" (from `aria-level="3"`). Indentation provides no additional announcement.
- **WCAG**: 1.3.1 (tree depth is programmatically determinable via `aria-level`, not solely via visual indentation), 1.4.1 (indentation MUST NOT rely on color alone; spatial offset is acceptable as it does not depend on color perception), 1.4.12 (text spacing: indentation MUST NOT cause content to be clipped when text spacing is adjusted per WCAG 1.4.12).
- **Visual**: Indentation MUST be clearly visible. A minimum indent of 16px per level SHOULD be enforced to ensure the staircase is perceptible. Optionally, tree lines (vertical and horizontal connecting lines between parent and child rows) MAY be rendered via CSS to further clarify the hierarchy. Tree lines MUST NOT be the sole indicator of hierarchy (indentation must also be present).

**Chameleon 6 Status**: Existed. Chameleon 6 provided the `indent` CSS Part on the tree node cell type, which rendered a spacer element proportional to depth. Chameleon 7 replaces the spacer element approach with `padding-inline-start` on the tree cell, leveraging the CSS custom property `--ch-tabular-grid-tree-indent` for configurable indent size.

**Interactions**
- F-06.1 (Tree Data with Expand/Collapse): indentation visually reinforces the tree structure.
- F-06.4 (Tree Column with Carets/Icons): the caret icon is positioned after the indentation padding.
- F-06.6 (Drag-and-Drop Reparenting): reparenting changes depth, which changes indentation.
- F-09 (Column Management): tree column resize must account for maximum indentation depth.
- F-13 (Internationalization): `padding-inline-start` provides automatic RTL support.
- F-15 (Theming & Styling): `--ch-tabular-grid-tree-indent` is part of the theming custom property surface.

---

## 6.4 Tree Column with Carets/Icons [P0]

**Description**: The designated tree column renders a composite cell containing, from inline-start to inline-end: (1) depth indentation (F-06.3), (2) an expand/collapse caret icon for parent rows (or blank space for leaf rows), and (3) an optional node-type icon (e.g., folder/file, department/person) followed by the cell's text content. The caret conveys expandable state visually and is the primary click target for expand/collapse. The caret icon MUST be `aria-hidden="true"` because the expanded/collapsed state is communicated to assistive technology via `aria-expanded` on the row element.

**Applies to**: Tree Grid, Gantt Chart (WBS task list), Data Grid (auto-group column)

**Use Cases**
- UC-1: A file browser displays a folder icon for directories and a file icon for files, with a right-pointing chevron (collapsed) or down-pointing chevron (expanded) before each folder.
- UC-2: A project management tool displays different icons for project phases, milestones, and tasks in the tree column, helping users quickly distinguish node types.
- UC-3: An organizational chart shows a person icon for individual contributors and a team icon for managers with direct reports.
- UC-4: A bill of materials shows an assembly icon for composite items and a part icon for leaf components.

**Conditions of Use**
- The caret icon MUST be displayed on every parent row and MUST NOT be displayed on leaf rows. The space reserved for the caret on leaf rows SHOULD match the caret width to maintain alignment.
- The node-type icon MUST be optional and configurable per row via a callback (e.g., `treeNodeIcon: (rowData: RowData) => string | TemplateResult | null`). If no icon callback is provided, no icon is rendered.
- The caret icon MUST be customizable via CSS Parts or CSS custom properties. The default caret SHOULD be a chevron (right-pointing when collapsed, down-pointing when expanded).

**Behavioral Requirements**
- BR-1: The tree column cell MUST render its content in the following order from inline-start: (a) indentation padding (F-06.3), (b) caret icon (parent rows only), (c) node-type icon (if configured), (d) cell text content or custom renderer output (F-01.1).
- BR-2: The caret icon MUST be a clickable target. Clicking the caret MUST toggle the row's expand/collapse state. The click target MUST be large enough to be usable (minimum 24x24 CSS pixels per WCAG 2.5.8 Target Size minimum).
- BR-3: The caret icon MUST rotate or change shape to indicate expanded vs. collapsed state. A right-pointing chevron (▶) for collapsed and a down-pointing chevron (▼) for expanded is the recommended default. The transition SHOULD be animated (CSS rotation) and MUST respect `prefers-reduced-motion: reduce`.
- BR-4: The caret icon MUST be declared `aria-hidden="true"`. The expand/collapse state is conveyed programmatically via `aria-expanded` on the parent row element. The caret is a visual redundancy, not an ARIA control.
- BR-5: Leaf rows MUST NOT render a caret icon. The space where the caret would appear MUST be preserved (rendered as an empty spacer of the same width) so that leaf row content aligns with parent row content at the same depth.
- BR-6: The node-type icon, if present, MUST be rendered between the caret and the cell text content. The icon MUST be declared `aria-hidden="true"` unless it conveys information not available from the cell text (in which case it MUST have an `aria-label`). Decorative icons (folder/file when the cell text already identifies the type) MUST use `aria-hidden="true"`.
- BR-7: The grid MUST expose CSS Parts on the tree column cell's internal elements: `::part(tree-caret)` for the caret icon, `::part(tree-icon)` for the node-type icon, and `::part(tree-cell-content)` for the text/renderer area. These Parts allow developers to customize styling without overriding internal structure.
- BR-8: When the tree column is NOT the first visible column (e.g., after column reorder), the indentation, caret, and icon MUST still render correctly in whichever column is designated as the tree column. Tree controls are tied to the tree column identity, not to the column's visual position.
- BR-9: The caret click MUST NOT propagate to the cell's click handler (if any) or trigger cell selection. It is a distinct interaction from clicking the cell content. The caret click area and the cell content area MUST have separate event handling.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Full behavior as described. |
| Data Grid | If using auto-group column (F-06.8), the same caret and icon pattern applies to the auto-generated column. |
| Pivot Table | N/A. Pivot row dimension headers use their own expand/collapse affordance (F-05.2), which does not follow the tree caret pattern. |
| Gantt Chart | Caret and icon render in the task list's tree column. The timeline region does not display carets or tree icons; it uses bar nesting to convey hierarchy. |

**CSS Subgrid Implications**

The caret, icon, and text content are all within a single grid cell (the tree column cell). They do not affect the subgrid track structure. The cell uses a flex or inline layout internally to position the caret, icon, and content:

```css
.tree-cell {
  display: flex;
  align-items: center;
  padding-inline-start: calc(var(--depth) * var(--ch-tabular-grid-tree-indent, 20px));
}

.tree-cell::part(tree-caret) {
  flex-shrink: 0;
  width: 20px;  /* Fixed width for alignment */
}

.tree-cell::part(tree-icon) {
  flex-shrink: 0;
  margin-inline-end: 4px;
}
```

**Editability Interaction**
- Clicking the caret area MUST toggle expand/collapse, NOT enter Edit Mode. Only clicking the cell content area (text/renderer) triggers Edit Mode entry per FD-03.
- When the tree column cell is in Edit Mode, the caret MUST remain visible and interactive. The editor widget occupies the text content area only, not the caret or icon area. This allows the user to edit the cell's value while the expand/collapse toggle remains accessible.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Arrow Right | On collapsed parent: expand (F-06.1 keyboard behavior). The caret serves as the visual indicator of this action. | Navigation Mode |
| Arrow Left | On expanded parent: collapse (F-06.1 keyboard behavior). The caret rotates to indicate collapsed state. | Navigation Mode |
| Enter | Toggle expand/collapse when focus is on the tree column cell of a parent row. | Navigation Mode |
| Click on caret | Toggle expand/collapse. MUST NOT trigger cell selection or Edit Mode. | Any |

**Accessibility**
- **ARIA**: The caret icon element MUST carry `aria-hidden="true"`. The node-type icon element MUST carry `aria-hidden="true"` (unless it conveys unique information via `aria-label`). The `aria-expanded` attribute on the row element is the sole programmatic indicator of expand/collapse state. The tree column cell itself carries `role="gridcell"` (or `role="rowheader"`).
- **Screen Reader**: The screen reader MUST announce the expand/collapse state from `aria-expanded` on the row, NOT from the caret icon. Icon-only content (if the node-type icon has semantic meaning not in the text) MUST provide an accessible name via `aria-label`.
- **WCAG**: 1.1.1 (icons that convey information MUST have text alternatives), 1.4.1 (caret state change MUST NOT rely on color alone -- shape/rotation is required), 2.5.8 (caret click target MUST be at least 24x24 CSS pixels), 4.1.2 (expand/collapse state is exposed via `aria-expanded`).
- **Visual**: The caret MUST be visually distinct from other cell content. It MUST change orientation (rotation animation or shape swap) to indicate expanded vs. collapsed. Node-type icons SHOULD be sized consistently (16x16 or 20x20 CSS pixels) and SHOULD maintain a consistent position relative to the caret and text.

**Chameleon 6 Status**: Existed. Chameleon 6 provided `caret`, `indent`, `node-selector`, and `node-icon` CSS Parts on the tree node cell type. The `cellCaretClicked` event fired when the caret was clicked. Chameleon 7 retains the concept but changes the internal implementation: carets are `aria-hidden="true"` (not interactive ARIA elements), `aria-expanded` is placed on the row element (not the cell), and CSS Parts are renamed to `tree-caret`, `tree-icon`, and `tree-cell-content`.

**Interactions**
- F-06.1 (Tree Data with Expand/Collapse): the caret is the primary expand/collapse trigger.
- F-06.2 (Lazy-Load Children): clicking the caret on a parent with unloaded children triggers lazy-load.
- F-06.3 (Indentation Levels): the caret is positioned after indentation padding.
- F-06.5 (Tri-State Checkbox Selection): the checkbox, if present, is positioned between the caret and the icon.
- F-01.1 (Custom Cell Renderers): the text content area of the tree cell supports custom renderers.
- F-15 (Theming & Styling): CSS Parts enable caret and icon theming.

---

## 6.5 Tri-State Checkbox Selection in Tree [P1]

**Description**: When row selection checkboxes are enabled in a tree, the parent row's checkbox reflects the aggregate selection state of its descendants using a tri-state model: checked (all descendants selected), unchecked (no descendants selected), or indeterminate/mixed (some but not all descendants selected). Checking a parent automatically selects all of its descendants. Unchecking a parent deselects all descendants. The mixed state resolves to checked on the next click (mixed -> checked -> unchecked -> checked cycle), enabling bulk selection of entire subtrees with a single action.

**Applies to**: Tree Grid, Gantt Chart (WBS task list)

**Use Cases**
- UC-1: A file manager allows the user to select an entire folder (and all its contents recursively) by checking the folder's checkbox, enabling bulk operations like move, copy, or delete.
- UC-2: An organizational chart allows an HR administrator to select an entire department (manager + all direct and indirect reports) by checking the department head's checkbox.
- UC-3: A test suite runner displays test groups and individual tests in a tree. Checking a test group selects all tests within it for execution. Partially selecting tests within a group shows a mixed checkbox on the group.
- UC-4: A permissions editor displays a hierarchical permission tree. Checking a parent permission grants all child permissions. A mixed state indicates partial permission assignment.

**Conditions of Use**
- Tri-state checkbox selection MUST only be active when (a) row selection checkboxes are enabled (F-08) AND (b) the grid is in Tree Grid mode (or Gantt Chart with tree task list).
- The grid MUST accept a configuration property to enable/disable tri-state cascading behavior (e.g., `treeCheckboxCascade: boolean`, default: `true` when in Tree Grid mode with checkboxes). Setting this to `false` makes each checkbox independent (no parent-child propagation).
- The selection model (F-08) MUST be set to multi-select mode for tri-state to function. Single-select mode MUST NOT use tri-state behavior.

**Behavioral Requirements**
- BR-1: When the user checks a parent row's checkbox, the grid MUST select the parent AND all of its descendant rows (children, grandchildren, etc., regardless of nesting depth). All descendant checkboxes MUST update to checked.
- BR-2: When the user unchecks a parent row's checkbox, the grid MUST deselect the parent AND all of its descendant rows. All descendant checkboxes MUST update to unchecked.
- BR-3: When some (but not all) descendants of a parent are selected, the parent's checkbox MUST display the indeterminate (mixed) visual state and MUST carry `aria-checked="mixed"`.
- BR-4: The tri-state cycle when clicking a parent checkbox MUST follow: mixed -> checked -> unchecked -> checked -> ... Clicking a mixed checkbox MUST select all descendants (transition to checked). Clicking a checked checkbox MUST deselect all descendants (transition to unchecked).
- BR-5: The cascading behavior MUST propagate up the tree. When a child's checkbox changes state, the grid MUST recalculate the parent's state, then the grandparent's state, and so on up to the root. This ensures that the mixed/checked/unchecked state is always consistent at every level.
- BR-6: Collapsed descendants that are not visible MUST still participate in the tri-state calculation. Checking a parent MUST select ALL descendants, including those currently hidden within collapsed subtrees. The visual and ARIA state of hidden descendants MUST update (in the data model) even though they are not rendered.
- BR-7: Lazy-loaded children (F-06.2) that have not yet been fetched present a challenge. When a parent with unloaded children is checked, the grid MUST: (a) mark the parent as checked, (b) set a flag on the parent indicating "all descendants selected", (c) when children are lazily loaded in the future, they MUST inherit the parent's "all selected" state. The grid MUST emit a `selectionChanged` event noting that the selection is "indeterminate pending lazy load" or equivalent.
- BR-8: The "Select All" header checkbox (F-08) MUST consider the tri-state tree model. Checking "Select All" MUST check all root-level rows, which cascades to all descendants. The header checkbox itself follows the same tri-state model: checked (all rows selected), unchecked (none selected), mixed (some selected).
- BR-9: The grid MUST emit `selectionChanged` events for each batch of selection changes. When checking a parent selects 100 descendants, the grid MUST emit a single event containing all affected row IDs, NOT 100 individual events.
- BR-10: When filtering (F-06.7) is active, tri-state calculation MUST operate on the visible (filtered) set of rows. If a parent has 10 children but only 3 are visible after filtering, the parent's tri-state MUST be computed from the 3 visible children only. However, checking the parent MUST still select all visible descendants (the 3 visible children), NOT the hidden ones.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Full tri-state behavior as described. |
| Data Grid | N/A for tri-state. Data Grid row grouping does not support checkbox cascading; group header checkboxes (if present) use the selection model from F-08. |
| Pivot Table | N/A. Pivot Table does not use tree-based row selection. |
| Gantt Chart | Tri-state checkboxes apply to the task list. Selecting a parent task and all its subtasks affects which timeline bars are included in bulk operations (e.g., bulk reschedule, export). |

**Editability Interaction**
- Checkbox selection is independent of Edit Mode. Clicking a checkbox MUST toggle selection, NOT enter Edit Mode. If a cell is in Edit Mode and the user clicks a checkbox in the same or another row, the checkbox toggles selection and the edit continues.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Space | Toggle the focused row's checkbox. If the row is a parent, cascading applies per BR-1/BR-2/BR-4. | Navigation Mode, focus on checkbox or row |
| Ctrl+A (Cmd+A on Mac) | Select all rows (triggers cascading from roots). | Navigation Mode |
| Shift+Arrow Down | Extend selection to include the next visible row. Does NOT trigger cascading (individual row selection). | Navigation Mode |
| Shift+Click on checkbox | Select a range from the last selected row to the clicked row. Does NOT trigger cascading (range selection). | Any |

**Accessibility**
- **ARIA**: Parent checkboxes with indeterminate state MUST carry `aria-checked="mixed"`. Fully checked checkboxes MUST carry `aria-checked="true"`. Unchecked checkboxes MUST carry `aria-checked="false"`. The checkbox MUST have `role="checkbox"`. The checkbox MUST have an accessible name, e.g., `aria-label="Select [row name] and all descendants"` for parent rows or `aria-label="Select [row name]"` for leaf rows.
- **Screen Reader**: When a parent checkbox is toggled: live region announces SR: "[Row name] and [N] descendants selected" (on check) or SR: "[Row name] and [N] descendants deselected" (on uncheck). When a parent is in mixed state: SR: "[Row name], partially selected, [M] of [N] descendants selected".
- **WCAG**: 1.3.1 (`aria-checked="mixed"` is programmatically determinable), 2.1.1 (checkbox is keyboard-accessible via Space), 4.1.2 (checkbox role, name, and checked state are exposed).
- **Visual**: The mixed/indeterminate state MUST be visually distinct from both checked and unchecked. The standard indeterminate visual (a horizontal dash or filled square inside the checkbox) MUST be used. The distinction MUST NOT rely on color alone.

**Chameleon 6 Status**: Existed (partially). Chameleon 6 provided the `node-selector` CSS Part on tree node cells, which rendered a checkbox. However, tri-state cascading behavior was application-managed -- the grid did not automatically propagate selection up or down the tree. Chameleon 7 introduces built-in tri-state cascading with `aria-checked="mixed"` support and configurable `treeCheckboxCascade` behavior.

**Interactions**
- F-06.1 (Tree Data with Expand/Collapse): collapsed subtrees still participate in tri-state calculation.
- F-06.2 (Lazy-Load Children): unloaded children inherit parent selection state on load.
- F-06.4 (Tree Column with Carets/Icons): the checkbox is positioned within the tree column cell, between the caret and the icon.
- F-06.7 (Filtering Within Tree): tri-state operates on the visible (filtered) row set.
- F-08 (Selection): tri-state extends the row selection model with cascading behavior.
- F-12 (Export): exporting selected rows in a tree MUST include all selected descendants, respecting tri-state state.

---

## 6.6 Drag-and-Drop Reparenting [P2]

**Description**: The user moves a tree node from one parent to another by dragging it and dropping it onto the target parent or between siblings, changing the node's position in the hierarchy. This is one of the most complex tree features because it involves visual drag feedback (drop indicators), validation of legal drop targets (preventing a parent from being dropped onto its own descendant), updating the data model, and recalculating ARIA attributes for all affected nodes. A keyboard alternative (cut/paste via context menu or Ctrl+X / Ctrl+V) MUST be provided for accessibility.

**Applies to**: Tree Grid, Gantt Chart (WBS task list reparenting)

**Use Cases**
- UC-1: A file manager allows the user to move a file from one folder to another by dragging it.
- UC-2: A project management tool allows rearranging the WBS by dragging tasks between phases or reordering tasks within a phase.
- UC-3: An organizational chart allows moving an employee to a different manager by dragging their row to a new parent.
- UC-4: A content management system allows reorganizing a page tree by dragging pages between sections.
- UC-5: A test suite organizer allows dragging tests between test groups to reorganize the test hierarchy.

**Conditions of Use**
- Drag-and-drop reparenting MUST be enabled via a configuration property (e.g., `allowTreeDragDrop: boolean`, default: `false`).
- The grid MUST accept a validation callback for drop targets: `canDrop: (draggedRow: RowData, targetParent: RowData | null, position: "before" | "after" | "child") => boolean`. This callback determines whether a specific drop is allowed.
- A keyboard alternative MUST be available for all drag-and-drop operations (WCAG 2.1.1). The grid MUST provide either: (a) a context menu with "Cut" and "Paste" options, or (b) Ctrl+X to cut and Ctrl+V to paste (with paste target determined by the currently focused row).

**Behavioral Requirements**
- BR-1: When the user initiates a drag on a tree row, the grid MUST create a visual drag image (ghost) showing the dragged row's content. The original row MUST remain visible in its original position but MUST be visually dimmed (e.g., reduced opacity) to indicate it is being moved.
- BR-2: As the user drags over potential drop targets, the grid MUST display drop indicators showing where the row will be placed. Three drop positions MUST be supported: (a) "before" -- a horizontal line above the target row (drop as preceding sibling), (b) "after" -- a horizontal line below the target row (drop as following sibling), (c) "child" -- the target row is highlighted (drop as last child of target). The drop position MUST be determined by the vertical position of the cursor within the target row's area (top third = before, middle third = child, bottom third = after).
- BR-3: The grid MUST prevent circular references: a node MUST NOT be dropped onto itself or any of its own descendants. The `canDrop` callback MUST be invoked to validate each potential target. When a drop is invalid, the grid MUST display a "no drop" cursor and MUST NOT highlight the target.
- BR-4: When the drop is completed, the grid MUST: (a) remove the row from its current position, (b) insert it at the new position, (c) update `aria-level` for the moved row and all its descendants, (d) update `aria-setsize` and `aria-posinset` for all affected siblings (at both the source and target positions), (e) update indentation (F-06.3) for the moved row and descendants.
- BR-5: The grid MUST emit a `rowMoved` event on successful drop, containing the moved row's ID, the source parent ID, the target parent ID, and the new position index among siblings.
- BR-6: The grid MUST support undo for reparenting (F-17). After a reparent, Ctrl+Z MUST restore the row to its original position in the hierarchy.
- BR-7: If multiple rows are selected and the user drags the selection, all selected rows MUST move together. The grid MUST validate the drop for all selected rows and reject the entire operation if any row cannot be dropped at the target.
- BR-8: When dragging, if the user hovers over a collapsed parent for a configurable duration (e.g., 1 second), the grid SHOULD auto-expand that parent to allow dropping into its children. The auto-expand MUST be reversible (auto-collapse when the cursor leaves the row area without dropping).
- BR-9: The keyboard alternative (cut/paste) MUST work as follows: (a) Ctrl+X marks the focused row (or selected rows) as "cut" (visually dimmed), (b) the user navigates to the target row, (c) Ctrl+V pastes the cut row as a child of the focused row (or the context menu offers "Paste Before", "Paste After", "Paste as Child" options). Escape cancels the cut operation.
- BR-10: The grid MUST support a `moveRow(rowId, targetParentId, positionIndex)` API method for programmatic reparenting, enabling drag-and-drop alternatives and batch operations.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Full reparenting behavior as described. |
| Data Grid | N/A. Flat row reorder (F-10.1) applies instead. |
| Pivot Table | N/A. Pivot dimensions are configuration, not data. |
| Gantt Chart | Reparenting applies to the task list. When a task is reparented, the timeline MUST update: the task bar moves to the new parent's subtree, and summary bars for both the source and target parents MUST recompute their date spans. Dependencies (if implemented) MUST be preserved. |

**CSS Subgrid Implications**

Drag indicators (horizontal lines, row highlights) are rendered as overlay elements positioned absolutely relative to the grid body. They MUST NOT interfere with the subgrid layout. The dragged row's ghost image is rendered outside the grid's layout flow (e.g., as a fixed-position clone).

**Editability Interaction**
- If a row is in Edit Mode when the user attempts to drag it, the grid MUST first commit or cancel the edit (per FD-03) before allowing the drag. A row in Edit Mode MUST NOT be draggable until the edit is resolved.
- If the user drops a row while another row is in Edit Mode (the drop target or a sibling), the edit MUST NOT be affected. Drop and edit are independent operations.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Ctrl+X (Cmd+X on Mac) | Cut the focused row (or selected rows). Mark as "pending move". | Navigation Mode |
| Ctrl+V (Cmd+V on Mac) | Paste the cut row as a child of the focused row. | Navigation Mode |
| Escape | Cancel the cut operation; restore normal visual state on the cut row(s). | Navigation Mode (after Ctrl+X) |
| Shift+F10 or Context Menu Key | Open context menu with Move, Paste Before, Paste After, Paste as Child options. | Navigation Mode |

**Accessibility**
- **ARIA**: During drag, the dragged row SHOULD carry `aria-grabbed="true"` (deprecated in ARIA 1.1 but still recognized by some assistive technology) or use `aria-describedby` pointing to a live region that describes the drag state. Drop targets SHOULD carry `aria-dropeffect="move"` (also deprecated, but functional). For the keyboard alternative, no special ARIA is needed beyond the context menu accessibility (F-16) and live region announcements.
- **Screen Reader**: On Ctrl+X: live region announces SR: "[Row name] cut. Navigate to target and press Ctrl+V to move." On Ctrl+V: live region announces SR: "[Row name] moved to [target parent name]." On invalid drop: SR: "Cannot move [row name] here." On Escape (cancel cut): SR: "Move cancelled."
- **WCAG**: 2.1.1 (keyboard alternative via Ctrl+X/Ctrl+V and context menu), 2.5.7 (dragging movements: a single-pointer alternative to drag is not strictly required if the keyboard alternative exists, but a context menu with "Move to..." is recommended), 1.3.1 (the new tree structure after reparenting is programmatically determinable via updated ARIA attributes).
- **Visual**: During drag: the drag ghost MUST show the row content. The source row MUST be dimmed. Drop indicators MUST be visually prominent (e.g., a 2px blue line for before/after, or a blue highlight for child). Invalid drop targets MUST show a "no drop" cursor. After drop: the row appears at its new position with correct indentation. No animation is required but a subtle move animation SHOULD be used (respecting `prefers-reduced-motion`).

**Chameleon 6 Status**: New. Chameleon 6 did not support drag-and-drop reparenting within the tree. Row reorder in Chameleon 6 was flat only. Chameleon 7 introduces hierarchical drag-and-drop with circular reference prevention, keyboard alternative, and full ARIA support.

**Interactions**
- F-06.1 (Tree Data with Expand/Collapse): reparenting changes the tree structure; expand/collapse state on moved nodes is preserved.
- F-06.3 (Indentation Levels): indentation updates after reparenting to reflect new depth.
- F-06.5 (Tri-State Checkbox Selection): reparenting recalculates tri-state for both source and target parents.
- F-10 (Row Management): reparenting is the tree equivalent of row reorder.
- F-16 (Context Menus): context menu provides the keyboard-accessible reparenting alternative.
- F-17 (Undo/Redo): reparenting operations are undoable.
- F-22 (Developer Experience): `moveRow()` API for programmatic reparenting.

---

## 6.7 Filtering Within Tree (Show Ancestor Chain) [P1]

**Description**: When a filter is applied to a tree, matching rows are displayed along with their entire ancestor chain up to the root, preserving the hierarchical context. Without ancestor chain preservation, filtered tree rows would appear as flat, rootless items, losing all structural meaning. Ancestor rows that do not themselves match the filter are shown with a muted/dimmed visual treatment to distinguish them from actual matches, making it clear they are present only to provide context.

**Applies to**: Tree Grid, Gantt Chart (WBS task list), Data Grid (auto-group column with hierarchical data)

**Use Cases**
- UC-1: A file browser user searches for "report.pdf". The grid shows "report.pdf" along with its parent folder chain ("Documents > Projects > Q4-Review > report.pdf"), allowing the user to see where the file resides.
- UC-2: An organizational chart is filtered by "Engineering". All employees in the Engineering department are shown, along with the full management chain up to the CEO, preserving the reporting hierarchy.
- UC-3: A product catalog is filtered by "wireless". Products containing "wireless" in their name are shown along with their parent categories and subcategories, so the user can see which product lines include wireless products.
- UC-4: A Gantt Chart is filtered by "Overdue" status. Overdue tasks are shown along with their parent phases and project nodes, preserving the WBS context in both the task list and timeline.

**Conditions of Use**
- When filtering is active on a Tree Grid (or tree-structured grid), the grid MUST display the ancestor chain for every matching row.
- The grid MUST accept a configuration property to control this behavior (e.g., `treeFilterShowParents: boolean`, default: `true`). Setting this to `false` displays matching rows flat, without ancestors (useful for search-result-style display).
- The filter criteria themselves are defined by F-03 (Filtering). This feature (F-06.7) defines only how filtering interacts with the tree structure.

**Behavioral Requirements**
- BR-1: When a row matches the filter, the grid MUST also display every ancestor of that row, from the matching row's parent up to the root. Ancestor rows that do not match the filter are called "context ancestors".
- BR-2: Context ancestor rows MUST be visually distinct from matching rows. The grid MUST apply a muted/dimmed visual treatment (e.g., reduced opacity, lighter text color, or a distinct CSS class). This distinction MUST NOT rely on color alone -- an additional visual cue (e.g., italic text, a "context" badge, or a different icon state) SHOULD be provided.
- BR-3: Context ancestor rows MUST be rendered as expanded (their children that match or have matching descendants MUST be visible). The user MUST be able to collapse context ancestors, which hides their descendants (both matching and non-matching) within that subtree.
- BR-4: When a filter is removed (cleared), the grid MUST restore the full tree structure with the previously remembered expand/collapse state for all rows. Rows that were expanded before filtering MUST be expanded after the filter is cleared.
- BR-5: Non-matching rows that are NOT ancestors of a matching row MUST be hidden (not rendered). For example, if a parent has 10 children but only 2 match the filter, the parent is shown (as context ancestor) along with the 2 matching children; the other 8 children are hidden.
- BR-6: The row count displayed in the grid's status area (if any) MUST distinguish between matching rows and total visible rows (including context ancestors). For example: "5 matches (12 rows shown including ancestors)".
- BR-7: Sorting within a filtered tree MUST apply only to the visible row set. Context ancestor rows remain in their natural tree position (they cannot be sorted independently of their matching descendants).
- BR-8: When a filter query changes (debounced per F-03.1 BR-3), the grid MUST recompute the visible set: new matches gain their ancestor chains, rows that no longer match (and are not ancestors of matches) are hidden.
- BR-9: For lazy-loaded trees (F-06.2), filtering MUST either: (a) require server-side filtering that returns pre-filtered hierarchical data with ancestor chains, or (b) filter only currently loaded nodes (with a clear indication that unloaded branches were not searched). The grid MUST NOT silently omit unloaded branches from filter results without informing the user.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Full ancestor chain behavior as described. |
| Data Grid | If using auto-group column (F-06.8), ancestor chain behavior applies to the grouped hierarchy. |
| Pivot Table | N/A. Pivot Table filtering operates on dimensions (F-05), not tree hierarchy. |
| Gantt Chart | Ancestor chain behavior applies to the task list. In the timeline, matching task bars are shown at full opacity; context ancestor summary bars are shown at reduced opacity or with a dashed style to match the muted treatment of context ancestors in the task list. |

**CSS Subgrid Implications**

No additional subgrid impact. Context ancestor rows are standard subgrid rows with a CSS class that applies the muted visual treatment. No column track changes are needed.

**Editability Interaction**
- Context ancestor rows MUST remain editable (they are real data rows, not structural placeholders). However, editing a context ancestor's data MUST NOT automatically change its filter-match status. If the user edits a context ancestor such that it now matches the filter, it SHOULD transition from muted to normal styling.
- If the user edits a matching row such that it no longer matches the filter, the grid MUST keep the row visible until the edit is committed. After commit, the row MUST be re-evaluated against the filter. If it no longer matches and has no matching descendants, it is hidden (along with any context ancestors that are no longer needed).

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Ctrl+F (Cmd+F on Mac) | Open filter/search UI (per F-03). Tree filter behavior activates automatically. | Any |
| Arrow Down / Arrow Up | Navigate between visible rows (matching rows and context ancestors). | Navigation Mode |
| Escape | Clear filter and restore full tree (per F-03). | Focus in filter input |

**Accessibility**
- **ARIA**: Context ancestor rows MUST NOT be omitted from the accessibility tree. They carry the same ARIA attributes (`aria-level`, `aria-setsize`, `aria-posinset`, `aria-expanded`) as they would without filtering. The grid SHOULD set `aria-description="context ancestor, does not match filter"` or equivalent on context ancestor rows to distinguish them for screen reader users.
- **Screen Reader**: When navigating to a context ancestor: SR: "[Row name], level [N], does not match filter, [M] matching descendants". When navigating to a matching row: SR: "[Row name], level [N], matches filter". A live region MUST announce filter results: SR: "[N] matches found. [M] rows shown including ancestor context."
- **WCAG**: 1.3.1 (the distinction between matching and context rows is programmatically determinable via `aria-description` or equivalent), 1.4.1 (visual distinction between matching and context rows MUST NOT rely on color alone), 2.4.3 (focus order follows tree order of visible rows; hidden rows are removed from focus order).
- **Visual**: Context ancestor rows MUST be visually muted. The default treatment SHOULD be reduced opacity (e.g., `opacity: 0.6`) combined with italic text. Matching rows MUST retain full visual prominence. The muted treatment MUST be customizable via a CSS Part (`::part(tree-context-ancestor)`) or CSS custom property.

**Chameleon 6 Status**: New. Chameleon 6 did not provide built-in tree filtering with ancestor chain preservation. Applications had to manually manage which rows were visible during tree filtering. Chameleon 7 introduces automatic ancestor chain display with visual distinction and `treeFilterShowParents` configuration.

**Interactions**
- F-03 (Filtering): F-06.7 extends filtering behavior for tree data. All filter types (inline, global search, external) trigger ancestor chain display.
- F-06.1 (Tree Data with Expand/Collapse): context ancestors are shown expanded; expand/collapse is interactive on context ancestors.
- F-06.2 (Lazy-Load Children): lazy-loaded trees require server-side filtering support for complete results.
- F-06.5 (Tri-State Checkbox Selection): tri-state operates on the visible (filtered) row set, including context ancestors.
- F-11 (Virtualization): visible rows (matches + context ancestors) participate in virtualization; hidden rows are excluded.
- F-20 (Server-Side Operations): server-side filtering MUST return ancestor chains when `treeFilterShowParents: true`.

---

## 6.8 Auto-Group Column [P1]

**Description**: An automatically generated column that displays the tree hierarchy with expand/collapse controls, indentation, and optional node icons, without the developer manually designating a tree column or configuring tree cell rendering. The auto-group column is created by the grid when hierarchical data is detected (or when `autoGroupColumn: true` is configured), and it appears as the first column (or a configurable position). This feature simplifies tree setup: the developer provides hierarchical data and the grid handles the tree column creation automatically.

**Applies to**: Tree Grid, Data Grid (hierarchical result sets), Gantt Chart (auto-generated WBS column)

**Use Cases**
- UC-1: A developer provides hierarchical data to the grid without specifying a tree column. The grid automatically creates a "Group" column showing the tree structure with expand/collapse controls.
- UC-2: A grid receives hierarchical JSON from an API where rows have `parentId` fields. Without additional configuration, the grid detects the hierarchy and renders an auto-group column.
- UC-3: A Data Grid receives a grouped dataset from the server and automatically generates a group column showing the group hierarchy, without the developer manually creating a tree column definition.
- UC-4: A developer customizes the auto-group column's header text, width, and node icon callback while letting the grid handle the tree column rendering.

**Conditions of Use**
- The grid MUST generate the auto-group column when: (a) `autoGroupColumn: true` is explicitly configured, OR (b) hierarchical data is provided (flat array with `parentId` fields or nested data with `children` arrays) and no explicit tree column is designated.
- If an explicit tree column is designated (via `treeColumn: "columnId"` or equivalent), the auto-group column MUST NOT be generated (the designated column takes over tree rendering).
- The auto-group column MUST be configurable via an `autoGroupColumnDef` property that accepts a partial column definition (e.g., header text, width, icon callback, renderer).

**Behavioral Requirements**
- BR-1: The auto-group column MUST be inserted as the first column in the grid by default. The position MUST be configurable (e.g., `autoGroupColumnPosition: "first" | "last" | number`).
- BR-2: The auto-group column MUST render tree controls: indentation (F-06.3), caret icons for parent rows (F-06.4), and optional node-type icons. These follow the same behavioral requirements as F-06.3 and F-06.4.
- BR-3: The cell content of the auto-group column MUST display a meaningful value for each row. The grid MUST use the following priority to determine the display value: (a) a `groupDisplayValue` property on the row data, (b) the value of the first visible data column, (c) the row's unique ID as a fallback. The display value source MUST be configurable via the `autoGroupColumnDef.valueGetter` property.
- BR-4: The auto-group column MUST participate in the grid's column model. It MUST be resizable, sortable (sorting by tree order or by display value), and freezable (pinnable). However, it MUST NOT be hideable -- hiding the tree column would eliminate the expand/collapse affordance.
- BR-5: The auto-group column MUST have a default header text of "Group" (or a localized equivalent per F-13). The header text MUST be customizable via `autoGroupColumnDef.headerName`.
- BR-6: When the grid transitions from hierarchical data to flat data (e.g., clearing `parentId` fields or switching to non-hierarchical mode), the auto-group column MUST be automatically removed. When hierarchical data is restored, the auto-group column MUST be re-created.
- BR-7: The auto-group column MUST NOT appear in the grid's column definitions reported to the developer (it is a generated column, not a user-defined one). However, it MUST be accessible via a separate API (e.g., `grid.autoGroupColumn` property) for programmatic interaction.
- BR-8: When the grid is in Data Grid mode (not Tree Grid), the auto-group column MUST still function but the ARIA model uses `role="grid"` with `rowgroup` for group headers rather than `role="treegrid"` with `aria-level`. The expand/collapse controls work identically; only the ARIA semantics differ.
- BR-9: The auto-group column MUST support checkbox selection (F-06.5) when row selection checkboxes are enabled. The checkbox is rendered within the auto-group cell, between the caret and the icon.
- BR-10: The auto-group column MUST be included in export (F-12). Exported data MUST include the tree hierarchy information (e.g., indentation via repeated spaces or an explicit "Level" column in CSV/Excel export).

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | The auto-group column uses `role="treegrid"` semantics. Each row carries `aria-level`, `aria-setsize`, and `aria-posinset`. |
| Data Grid | The auto-group column uses `role="grid"` semantics. Group structure is conveyed via `role="rowgroup"` and `aria-expanded` on group rows. `aria-level` is NOT used. |
| Pivot Table | N/A. The Pivot Table has row dimension headers (F-05) that serve a similar display purpose but are structurally different. |
| Gantt Chart | The auto-group column is the WBS column in the task list. It displays task hierarchy with the same tree controls. The default header text SHOULD be "WBS" or "Task" (configurable). |

**CSS Subgrid Implications**

The auto-group column adds one additional column track to the grid's `grid-template-columns`. When the auto-group column is generated, the grid MUST insert a track (at the configured position) into the column template. When the auto-group column is removed, the track MUST be removed. All rows (header, body, footer) MUST include the auto-group column track in their subgrid spans.

```css
/* Example: auto-group column as first track */
.grid-host {
  grid-template-columns: var(--auto-group-width, 250px) /* auto-group */ [data-columns...];
}
```

The auto-group column width defaults to `250px` (configurable via `autoGroupColumnDef.width` or the CSS custom property `--ch-tabular-grid-auto-group-width`). Because the auto-group column content includes indentation + caret + icon + text, a wider default than typical data columns is appropriate.

**Editability Interaction**
- The auto-group column's cell content area MAY be editable if configured via `autoGroupColumnDef.editable: true`. By default, the auto-group column is NOT editable (it displays a derived/display value, not a direct data field).
- When editable, editing follows the standard FD-03 model: the editor appears in the text content area, and the caret/icon remain visible and interactive.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Arrow Right | On collapsed parent in auto-group column: expand. On expanded parent: move to first child or next column. | Navigation Mode |
| Arrow Left | On expanded parent in auto-group column: collapse. On collapsed/leaf: move to parent row or previous column. | Navigation Mode |
| Enter | Toggle expand/collapse on parent row in auto-group column. | Navigation Mode |

**Accessibility**
- **ARIA**: The auto-group column header MUST carry `role="columnheader"` with an accessible name (the configured header text or "Group"). Auto-group cells MUST carry `role="gridcell"` (or `role="rowheader"` if the auto-group column is the row identifier). All other ARIA requirements from F-06.1, F-06.3, and F-06.4 apply.
- **Screen Reader**: When focus lands on an auto-group cell: SR: "[display value], [Group column name], level [N], [expanded/collapsed], row [M]". The announcement matches the standard tree row announcement from F-06.1.
- **WCAG**: All WCAG requirements from F-06.1 (tree structure), F-06.3 (indentation), and F-06.4 (carets/icons) apply to the auto-group column.
- **Visual**: The auto-group column MUST be visually identifiable as the tree/hierarchy column. It SHOULD have a default left-aligned layout with indentation, caret, and text. The column SHOULD be styled with a subtle visual distinction (e.g., a slightly different background or left border) to signal its special role, configurable via CSS Parts.

**Chameleon 6 Status**: New. Chameleon 6 required the developer to manually designate a column as the tree column and configure the tree node cell type. Chameleon 7 introduces automatic tree column generation from hierarchical data, reducing boilerplate configuration.

**Interactions**
- F-06.1 (Tree Data with Expand/Collapse): the auto-group column is the rendering surface for tree expand/collapse.
- F-06.2 (Lazy-Load Children): the auto-group column displays loading indicators for lazy-loaded children.
- F-06.3 (Indentation Levels): the auto-group column applies indentation per depth.
- F-06.4 (Tree Column with Carets/Icons): the auto-group column renders carets and icons.
- F-06.5 (Tri-State Checkbox Selection): checkboxes are rendered within the auto-group column cells.
- F-06.7 (Filtering Within Tree): the auto-group column shows context ancestors with muted styling.
- F-09 (Column Management): the auto-group column participates in column resize, pin, and reorder (but not hide).
- F-12 (Export): the auto-group column is included in exports with hierarchy information.
- F-15 (Theming & Styling): the auto-group column supports CSS Parts and custom properties for styling.
