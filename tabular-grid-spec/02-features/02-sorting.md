# F-02: Sorting

Sorting allows users to reorder rows based on the values in one or more columns. This feature category covers single-column sorting, multi-column sorting, custom comparators, default sort state, tri-state cycling, locale-aware ordering, sort-by-value semantics, and visual sort indicators.

Sorting applies to all four variants (Data Grid, Tree Grid, Pivot Table, Gantt Chart) with variant-specific adaptations for hierarchical and aggregated data.

> **Foundations**: This feature assumes the layout model defined in [FD-01](../01-foundations/01-layout-model.md). Sorting reorders rows in the DOM; because rows use `grid-template-columns: subgrid`, reordering has no impact on column alignment. The editability model in [FD-03](../01-foundations/03-editability-model.md) defines how sorting interacts with active editing sessions.

---

## 2.1 Single-Column Sorting [P0]

**Description**: The user clicks a column header to sort all rows by that column's values. Subsequent clicks on the same header toggle the sort direction. Only one column determines the sort order at a time; clicking a different column's header replaces the previous sort.

**Applies to**: All variants

**Use Cases**
- UC-1: A user viewing a contacts list clicks the "Last Name" header to alphabetize entries, making it easy to locate a specific person.
- UC-2: A user clicks the "Amount" header on a financial transactions grid to surface the largest or smallest transactions.
- UC-3: A project manager clicks the "Due Date" header in a Gantt Chart task list to identify overdue or upcoming tasks.

**Conditions of Use**
- The column MUST have `sortable: true` in its column definition (or inherit the grid-level `sortable` default).
- The column MUST have a `dataType` specified (or a custom comparator provided via F-02.3) for meaningful sort results.

**Behavioral Requirements**
- BR-1: The grid MUST sort all visible rows by the clicked column's values when the user activates a sortable column header.
- BR-2: The grid MUST toggle the sort direction on repeated activation of the same column header according to the configured sort cycling mode (see F-02.5).
- BR-3: When the user activates a different sortable column header, the grid MUST clear the previous column's sort state and apply sort to the newly activated column.
- BR-4: The grid MUST emit a `columnSortChanged` event containing the `columnId` and the new `sortDirection` whenever the sort state changes.
- BR-5: Non-sortable columns (`sortable: false`) MUST NOT respond to sort-triggering interactions. The column header MUST NOT show sort affordances (cursor, hover state) for non-sortable columns.
- BR-6: The sort operation MUST be stable: rows with equal values in the sorted column MUST preserve their relative order from before the sort (or from the previous sort key).
- BR-7: The grid MUST update the `aria-sort` attribute on the sorted column header to reflect the current direction (see F-02.8 for full accessibility requirements).

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Sorting MUST apply within each parent's children at every level of the hierarchy. Parent-child relationships MUST be preserved: a child row MUST NOT appear separated from its ancestor chain. See VR-20 in [FD-02](../01-foundations/02-variant-model.md). |
| Pivot Table | Sorting applies to dimension members within a level (e.g., sort regions alphabetically) or to value columns by their aggregated values. The multi-level header structure determines which rows are reordered. |
| Gantt Chart | Sorting applies to the task list region. Timeline bars MUST reorder to match the new task list row order. |

**CSS Subgrid Implications**

Sorting reorders row elements in the DOM. Because each row uses `display: grid; grid-template-columns: subgrid; grid-column: 1 / -1` (per [FD-01](../01-foundations/01-layout-model.md), Section 1.4), column alignment is maintained automatically after reorder. No CSS changes are required beyond DOM reordering.

**Editability Interaction**
- When a cell is in Edit Mode (per [FD-03](../01-foundations/03-editability-model.md)), the grid MUST defer sort execution until the edit is committed or cancelled. Reordering the DOM while an editor is active would destroy the editor and lose the user's in-progress input.
- After the edit completes, if a pending sort exists (e.g., triggered programmatically), the grid SHOULD apply it.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Enter | Activate sort on the focused column header (cycle sort direction) | Navigation Mode, focus on `columnheader` |
| Space | Activate sort on the focused column header (cycle sort direction) | Navigation Mode, focus on `columnheader` |

> Note: Enter and Space on a column header trigger sort cycling, consistent with button activation semantics. If the column header also supports other interactions (resize handle, context menu), those are triggered by different keys or mouse targets. See F-09 and F-16.

**Accessibility**
- **ARIA**: The sorted column header MUST carry `aria-sort="ascending"` or `aria-sort="descending"`. When the sort is cleared, the attribute MUST be set to `"none"`. All other sortable column headers MUST have `aria-sort="none"` (not absent -- presence of the attribute signals that the column is sortable).
- **Screen Reader**: When sort is applied, a live region (`role="status"`, `aria-live="polite"`) MUST announce: SR: "Sorted by [Column Name], ascending" or SR: "Sorted by [Column Name], descending". When sort is cleared: SR: "Sort removed from [Column Name]".
- **WCAG**: 1.3.1 (sort state is programmatically determinable via `aria-sort`), 2.1.1 (sort is keyboard-accessible via Enter/Space on header), 2.5.2 (sort activates on click/keyup, not mousedown/keydown, to allow cancellation), 4.1.2 (column header has accessible name and sort state).
- **Visual**: Sort direction MUST be indicated by a directional icon (arrow or chevron) on the column header. The icon MUST NOT rely on color alone to convey direction (WCAG 1.4.1). Shape difference (up arrow vs down arrow) satisfies this requirement.

**Chameleon 6 Status**: Existed. Column model has `sortable: boolean` and `sortDirection: "ascending" | "descending" | "other" | "none"`. Event: `TabularGridColumnSortChangedEvent` with `columnId` and `sortDirection`. Chameleon 7 carries forward the same type definitions (`TabularGridSortDirection`).

**Interactions**
- F-02.2 (Multi-Column Sorting): single-sort is the default; multi-sort extends it.
- F-02.5 (Tri-State Sort Cycling): determines the direction sequence.
- F-02.8 (Sort Indicators): visual representation of sort state.
- F-03 (Filtering): sort applies to the filtered row set.
- F-04 (Grouping): sort applies within groups and may reorder groups.
- F-07 (Cell Editing): sort is deferred during active edits.
- F-11 (Virtualization): sort triggers re-render of the visible window.
- F-14 (Keyboard Navigation): Enter/Space on column headers.
- F-20 (Server-Side Operations): sort may be delegated to the server.

---

## 2.2 Multi-Column Sorting [P0]

**Description**: The user sorts by multiple columns simultaneously, establishing a primary sort, secondary sort, and so on. For example, sorting first by "Department" then by "Last Name" groups employees by department with alphabetical ordering within each department. Sort priority numbers are displayed in column headers to indicate the order of precedence.

**Applies to**: All variants

**Use Cases**
- UC-1: A user sorts a sales report by "Region" (primary) and then by "Revenue" descending (secondary) to see top-performing accounts within each region.
- UC-2: A user sorts a bug tracker by "Priority" descending, then "Created Date" ascending, to see the oldest high-priority bugs first.

**Conditions of Use**
- Multi-column sorting MUST be enabled via a grid-level configuration property (e.g., `multiSort: true`). When disabled, only single-column sorting (F-02.1) applies.
- Each column participating in the sort MUST have `sortable: true`.

**Behavioral Requirements**
- BR-1: The grid MUST support sorting by at least 3 columns simultaneously. Implementations SHOULD support an unlimited number of sort columns.
- BR-2: When `multiSort` is enabled and the user holds Shift while clicking a sortable column header, the grid MUST add that column as the next sort level rather than replacing the existing sort.
- BR-3: If the user clicks a column header WITHOUT Shift (in multi-sort mode), the grid MUST clear all existing sort levels and apply single-column sort on the clicked column.
- BR-4: If the user Shift+clicks a column that is already part of the multi-sort, the grid MUST cycle that column's sort direction (per F-02.5) without changing its priority position.
- BR-5: Each sort level MUST have an associated priority number (1 = primary, 2 = secondary, etc.). The priority number MUST be displayed in the column header (see F-02.8).
- BR-6: The grid MUST emit a sort event containing the complete ordered list of sort columns with their directions whenever any sort level changes.
- BR-7: Removing a sort level (cycling to "none" via tri-state, or clearing via API) MUST renumber the remaining sort levels to maintain a contiguous sequence (e.g., removing level 2 of 3 causes level 3 to become level 2).
- BR-8: The sort comparison MUST apply sort levels in priority order: rows are first compared by the primary sort column, then by the secondary sort column for rows with equal primary values, and so on.
- BR-9: When the user clears all sort levels (e.g., via a "Clear Sort" action in a column menu or API), the grid MUST restore the original unsorted row order or the order defined by the data source.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Multi-column sort applies within each parent's children at every hierarchy level. All sort levels MUST preserve parent-child relationships. |
| Pivot Table | Multi-sort may apply across dimension levels and value columns. Sorting a row dimension reorders groups; sorting a value column reorders rows within the innermost dimension. |
| Gantt Chart | Multi-sort applies to the task list. Timeline bars reorder to match. |

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Shift + Enter | Add or cycle this column as a secondary+ sort level | Navigation Mode, focus on `columnheader` |
| Shift + Space | Add or cycle this column as a secondary+ sort level | Navigation Mode, focus on `columnheader` |
| Enter (without Shift) | Clear all sort levels, apply single-column sort on this column | Navigation Mode, focus on `columnheader` |

**Accessibility**
- **ARIA**: When multiple columns are sorted, each sorted column header MUST carry `aria-sort="ascending"` or `aria-sort="descending"`. The `aria-sort` attribute does not convey priority order, so the priority number MUST be included in the column header's accessible name or description (e.g., via `aria-description="Sort priority 2"`).
- **Screen Reader**: SR: "Sorted by [Column 1] ascending, then [Column 2] descending" via live region when multi-sort state changes. Each column header should announce its sort priority when focused: SR: "[Column Name], sort priority 2, descending".
- **WCAG**: 1.3.1 (multi-sort state is programmatically determinable), 2.1.1 (Shift+Enter/Space for multi-sort is keyboard-accessible).
- **Visual**: Sort priority numbers MUST be displayed as numeric badges alongside the sort direction icon. Numbers and icons MUST NOT rely on color alone.

**Chameleon 6 Status**: New. Chameleon 6 supports single-column sort only (`sortDirection` per column, no multi-sort coordination). Multi-column sorting is a new capability for Chameleon 7.

**Interactions**
- F-02.1 (Single-Column Sort): multi-sort extends single-sort; click without Shift falls back to single-sort.
- F-02.5 (Tri-State Sort Cycling): each sort level cycles independently.
- F-02.8 (Sort Indicators): priority badges are part of the indicator system.
- F-09.6 (Column Menu): "Clear Sort" action for removing a column from multi-sort.
- F-16 (Context Menus): sort actions in column context menu.
- F-21 (State Persistence): multi-sort state should be included in saved state.

---

## 2.3 Custom Sort Comparators [P0]

**Description**: The developer provides a custom comparison function for a column, overriding the default sort behavior. This is essential for domain-specific orderings that cannot be derived from the raw data type alone (e.g., sorting severity levels Low < Medium < High < Critical, or sorting by a composite key).

**Applies to**: All variants

**Use Cases**
- UC-1: A column displays severity levels as strings ("Low", "Medium", "High", "Critical"). Default alphabetical sort would produce "Critical, High, Low, Medium" -- the wrong order. A custom comparator maps these to numeric priorities.
- UC-2: A column displays full names ("Last, First"). The developer provides a comparator that sorts by last name first, then first name, even though the raw value is a single string.
- UC-3: A Pivot Table dimension represents fiscal quarters ("Q1-FY24", "Q2-FY24") that require custom parsing for chronological sort.

**Conditions of Use**
- The column definition MUST accept an optional `comparator` function property.
- When a `comparator` is provided, the grid MUST use it instead of the default sort logic for that column.
- The column MUST still have `sortable: true` for the comparator to be invoked.

**Behavioral Requirements**
- BR-1: The custom comparator function MUST receive two cell values and MUST return a negative number, zero, or positive number following the standard `Array.prototype.sort` comparator contract.
- BR-2: The comparator function signature MUST be: `(valueA: any, valueB: any, rowDataA: RowData, rowDataB: RowData, direction: "ascending" | "descending") => number`. Providing the full row data allows comparisons based on multiple fields. Providing the direction allows asymmetric sort behavior if needed.
- BR-3: The grid MUST NOT invert the comparator result to handle descending sort. The grid provides the `direction` parameter; if the comparator does not use it, the grid MUST multiply the result by -1 for descending order. The direction parameter exists so comparators CAN handle direction themselves (e.g., to always sort nulls last regardless of direction).
- BR-4: When no custom comparator is provided, the grid MUST use a default comparator based on the column's `dataType`: string comparison for `"string"`, numeric comparison for `"number"`, date comparison for `"datetime"`, and boolean comparison (false < true) for `"boolean"`.
- BR-5: The default comparator MUST handle `null` and `undefined` values consistently: nulls MUST sort to the end (last) regardless of sort direction, unless overridden by a custom comparator.
- BR-6: Custom comparators MUST be invoked with the same stability guarantees as default sorting (F-02.1, BR-6).

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | The custom comparator is applied when comparing sibling rows within the same parent. The comparator does not affect the parent-child relationship. |
| Pivot Table | Custom comparators may be used for dimension member ordering (e.g., custom fiscal quarter ordering) or value column ordering. |

**Accessibility**
- **ARIA**: No additional ARIA requirements beyond F-02.1. The sort direction is exposed via `aria-sort` regardless of whether a custom or default comparator is used.
- **Screen Reader**: No additional announcements. The user is unaware of the comparison mechanism; only the result (sort direction) matters.
- **WCAG**: No additional criteria.
- **Visual**: No additional visual requirements.

**Chameleon 6 Status**: New. Chameleon 6 defines `dataType` on columns ("string", "number", "boolean", "datetime") for built-in sort behavior, but does not expose a custom comparator function. Custom comparators are a new capability for Chameleon 7.

**Interactions**
- F-02.1 (Single-Column Sort): comparator is invoked during sort execution.
- F-02.2 (Multi-Column Sort): each column in a multi-sort may have its own comparator.
- F-02.6 (Locale-Aware Sort): the default string comparator should use `Intl.Collator`; custom comparators may use any logic.
- F-02.7 (Sort by Value vs Display Value): the comparator receives raw values by default.
- F-20 (Server-Side Operations): custom comparators apply only to client-side sorting. Server-side mode delegates sort logic to the server.

---

## 2.4 Pre-Sorted / Default Sort [P0]

**Description**: The grid renders with an initial sort state when it first appears, without requiring user interaction. The default sort is configured declaratively via column definitions and applies immediately on first render.

**Applies to**: All variants

**Use Cases**
- UC-1: A task management grid opens with tasks sorted by "Priority" descending so the most urgent items are visible immediately.
- UC-2: A data grid loads a customer list pre-sorted by "Name" ascending to match the user's expectation of alphabetical order.
- UC-3: A Gantt Chart renders with tasks sorted by "Start Date" ascending to present a chronological project view.

**Conditions of Use**
- At least one column MUST have a `sortDirection` value other than `"none"` in its column definition to establish a default sort.
- For multi-column default sort, multiple columns carry `sortDirection` values plus a `sortPriority` property indicating their precedence.

**Behavioral Requirements**
- BR-1: The grid MUST apply the configured sort state on initial render, before the first paint that includes data rows.
- BR-2: The grid MUST NOT emit `columnSortChanged` events for the initial sort state. The initial state is declarative configuration, not a user-initiated change. Events MUST only fire for subsequent state changes.
- BR-3: The initial sort state MUST be reflected in the `aria-sort` attributes on the corresponding column headers from the first render.
- BR-4: The initial sort state MUST be reflected in the visual sort indicators (direction icons, priority badges) from the first render.
- BR-5: If no column has a `sortDirection` specified, the grid MUST render rows in the order provided by the data source (natural order).
- BR-6: The developer MUST be able to set the sort state programmatically at any time via an API, not just on initial render. Programmatic sort changes MUST emit the `columnSortChanged` event.
- BR-7: When the data source is updated (rows added, removed, or modified), the current sort state MUST be re-applied automatically to maintain sorted order, unless the grid is operating in server-side mode (F-20).

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Default sort applies within each hierarchy level. The initial column definitions determine the per-level ordering on first render. |
| Pivot Table | Default sort determines the initial ordering of dimension members and value columns. |

**Accessibility**
- **ARIA**: Same requirements as F-02.1. The `aria-sort` attribute MUST be present on the initially sorted column header(s) from the first render.
- **Screen Reader**: No announcement is needed for the initial sort state (it is the starting state, not a change). The user discovers the sort state by navigating to the column header and hearing the `aria-sort` value.
- **WCAG**: 1.3.1 (initial sort state is programmatically determinable from the first render).
- **Visual**: Sort indicators MUST be visible on initial render, matching the configured sort state.

**Chameleon 6 Status**: Existed. Column model supports `sortDirection` which sets the initial sort state. Chameleon 7 carries forward `sortDirection` and adds `sortPriority` for multi-column default sort.

**Interactions**
- F-02.1 (Single-Column Sort): default sort establishes the initial state that single-column sort subsequently modifies.
- F-02.2 (Multi-Column Sort): default multi-sort requires `sortPriority` in addition to `sortDirection`.
- F-02.8 (Sort Indicators): indicators reflect the default sort state on first render.
- F-20 (Server-Side Operations): in server-side mode, the default sort configuration is sent to the server; the server returns pre-sorted data.
- F-21 (State Persistence): restored state overrides column-definition defaults.

---

## 2.5 Tri-State Sort Cycling [P0]

**Description**: Clicking a column header cycles through sort states. In tri-state mode, the cycle is: ascending, descending, unsorted (removed). In two-state mode, the cycle is: ascending, descending (no unsorted state). The cycling mode is configurable at the grid level and optionally per column.

**Applies to**: All variants

**Use Cases**
- UC-1: A user sorts a column ascending, clicks again for descending, and clicks a third time to remove the sort entirely and return to the original data order. This tri-state cycle gives the user full control.
- UC-2: In a spreadsheet-like application, the developer configures two-state cycling (ascending/descending only) because there is no meaningful "unsorted" state -- data always needs an explicit order.

**Conditions of Use**
- The grid MUST support a configuration property for the sort cycle mode (e.g., `sortCycle: "tri-state" | "two-state"`).
- The default MUST be `"tri-state"` (ascending, descending, none), as this provides the most user control.
- Individual columns MAY override the grid-level cycle mode.

**Behavioral Requirements**
- BR-1: In tri-state mode, each click on a sortable column header MUST advance the sort state in the sequence: `"none"` -> `"ascending"` -> `"descending"` -> `"none"` (removed).
- BR-2: In two-state mode, each click MUST toggle between `"ascending"` and `"descending"`. The sort can never be fully removed by clicking (only by API or column menu action).
- BR-3: When the sort state cycles to `"none"` (tri-state mode), the grid MUST restore the original data order (the order provided by the data source, or the previously established sort order from other columns in multi-sort).
- BR-4: In multi-column sort (F-02.2), cycling one sort level to `"none"` MUST remove that column from the sort stack and renumber remaining levels (per F-02.2, BR-7).
- BR-5: The cycle sequence MUST be configurable at the grid level. The default sequence is `["ascending", "descending", "none"]` for tri-state and `["ascending", "descending"]` for two-state. Advanced configurations MAY allow custom sequences (e.g., `["descending", "ascending", "none"]` for columns where descending is the most common first choice).
- BR-6: The sort cycle state MUST be consistent between mouse clicks, keyboard activation (Enter/Space), and programmatic API calls.

**Accessibility**
- **ARIA**: The `aria-sort` attribute transitions through `"ascending"`, `"descending"`, and `"none"` in sync with the cycle state.
- **Screen Reader**: Each state transition MUST be announced via live region: SR: "Sorted by [Column], ascending", SR: "Sorted by [Column], descending", SR: "Sort removed from [Column]".
- **WCAG**: 3.2.1 (On Focus) -- sort state MUST NOT change when the column header merely receives focus; it changes only on activation (click, Enter, Space).
- **Visual**: The sort indicator icon MUST update immediately on each cycle step. In the "none" state, the sort indicator MUST be hidden or display a neutral state (no arrow).

**Chameleon 6 Status**: Existed (partially). Chameleon 6 supports `sortDirection` values of `"ascending"`, `"descending"`, `"other"`, and `"none"`, but the cycling behavior is managed by the application (the grid does not auto-cycle). Chameleon 7 introduces built-in cycle management with configurable mode.

**Interactions**
- F-02.1 (Single-Column Sort): cycling determines the direction sequence when a header is clicked.
- F-02.2 (Multi-Column Sort): cycling applies to each sort level independently.
- F-02.4 (Pre-Sorted / Default Sort): default sort can start at any point in the cycle.
- F-02.8 (Sort Indicators): indicators reflect the current cycle state.

---

## 2.6 Locale-Aware / Natural Sort [P1]

**Description**: String sorting respects locale-specific character ordering rules using `Intl.Collator` rather than raw Unicode codepoint comparison. Natural sort additionally handles embedded numbers intelligently, so that "Item 2" sorts before "Item 10" instead of after it.

**Applies to**: All variants

**Use Cases**
- UC-1: A German-locale user sorts a name column. With locale-aware sort, characters like "a" sort correctly relative to "a" and "o", matching user expectations for the `de` locale.
- UC-2: A version column contains "v1.2", "v1.10", "v2.1". Natural sort produces "v1.2, v1.10, v2.1" instead of the lexicographic "v1.10, v1.2, v2.1".
- UC-3: A file listing contains "file1.txt", "file2.txt", "file10.txt". Natural sort orders them numerically within the string.

**Conditions of Use**
- Locale-aware sort MUST be the default behavior for string columns. Raw Unicode comparison MUST NOT be the default.
- The grid MUST accept a `locale` configuration (e.g., `sortLocale: string`) that defaults to the browser's locale (`navigator.language`).
- Natural sort MUST be opt-in per column via a column-level property (e.g., `naturalSort: true`), because it has a higher computational cost than standard locale-aware sort.

**Behavioral Requirements**
- BR-1: The default string comparator MUST use `Intl.Collator` with the configured locale and `{ sensitivity: "base" }` as the default sensitivity. The sensitivity level SHOULD be configurable.
- BR-2: When `naturalSort` is enabled for a column, the comparator MUST use `Intl.Collator` with `{ numeric: true }` to handle embedded numbers correctly.
- BR-3: The `Intl.Collator` instance SHOULD be cached per locale to avoid repeated construction overhead during sort operations.
- BR-4: Custom comparators (F-02.3) MAY use `Intl.Collator` internally or implement their own logic. The grid MUST NOT apply locale-aware sorting on top of a custom comparator.
- BR-5: Case sensitivity MUST be configurable via the `Intl.Collator` `sensitivity` option. The default `"base"` sensitivity treats "a" and "A" as equal. Developers MAY configure `"case"` or `"variant"` for stricter comparisons.
- BR-6: The locale setting MUST be changeable at runtime. Changing the locale MUST re-sort currently sorted columns using the new locale.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Locale-aware sorting applies within each hierarchy level when comparing sibling rows. |
| Pivot Table | Locale-aware sorting applies to dimension member labels (e.g., sorting country names alphabetically in the user's locale). |

**Accessibility**
- **ARIA**: No additional ARIA requirements. Locale-aware sort is an implementation detail of the comparator; the `aria-sort` attribute is unaffected.
- **Screen Reader**: No additional announcements. Users benefit from correct sort order matching their locale expectations.
- **WCAG**: No additional criteria directly, but correct locale sorting supports WCAG 3.1.1 (Language of Page) by respecting the declared language's collation rules.
- **Visual**: No additional visual requirements.

**Chameleon 6 Status**: New. Chameleon 6 does not specify locale-aware or natural sort behavior. The sort implementation is left to the application. Chameleon 7 introduces built-in locale-aware sorting via `Intl.Collator`.

**Interactions**
- F-02.3 (Custom Sort Comparators): custom comparators bypass the locale-aware default.
- F-13 (Internationalization): the sort locale SHOULD align with the grid's internationalization locale setting.

---

## 2.7 Sort by Value vs Display Value [P1]

**Description**: Determines whether the sort comparator operates on the raw data value or the formatted display string. By default, sorting uses the raw value, which produces correct ordering for numbers, dates, and other typed data. However, when a cell formatter transforms data significantly (e.g., mapping numeric codes to labels), sorting by display value may better match user expectations.

**Applies to**: All variants

**Use Cases**
- UC-1: A column stores dates as ISO strings ("2024-03-15") but displays them as "March 15, 2024". Sorting by raw value (ISO string) produces correct chronological order. Sorting by display value would produce incorrect alphabetical order ("April" before "January"). Raw value sort is correct here.
- UC-2: A column stores status codes (1, 2, 3) but displays labels ("Open", "In Progress", "Closed"). Sorting by raw value (1, 2, 3) matches the workflow order. A custom comparator (F-02.3) is more appropriate here than display-value sort.
- UC-3: A column displays a composite format ("Smith, John - Engineering") derived from multiple data fields. Sorting by display value allows the user to sort by what they see when no single raw value captures the display order.

**Conditions of Use**
- The column definition MUST accept an optional `sortByDisplayValue: boolean` property (default: `false`).
- When `sortByDisplayValue` is `true`, the grid MUST pass the formatted display string to the comparator instead of the raw data value.

**Behavioral Requirements**
- BR-1: By default (`sortByDisplayValue: false`), the grid MUST pass the raw data value to the comparator function. This is the correct behavior for typed data (numbers, dates, booleans) and MUST be the default.
- BR-2: When `sortByDisplayValue: true`, the grid MUST invoke the column's cell formatter/renderer to obtain the display string, then pass that string to the comparator.
- BR-3: When `sortByDisplayValue: true`, the comparator MUST treat all values as strings (using the locale-aware string comparator from F-02.6) unless a custom comparator is also provided.
- BR-4: The grid MUST NOT invoke the cell formatter solely for sorting if `sortByDisplayValue` is `false`. Formatter invocation for sort purposes MUST only occur when explicitly opted in.
- BR-5: If a column has both `sortByDisplayValue: true` and a custom comparator (F-02.3), the custom comparator receives the display values as its `valueA` and `valueB` parameters.

**Accessibility**
- **ARIA**: No additional ARIA requirements. The sort mechanism (raw vs display) is an implementation detail; `aria-sort` reflects the direction regardless.
- **Screen Reader**: No additional announcements.
- **WCAG**: No additional criteria.
- **Visual**: No additional visual requirements.

**Chameleon 6 Status**: New. Chameleon 6 does not distinguish between sort-by-value and sort-by-display-value. Chameleon 7 introduces explicit control.

**Interactions**
- F-02.3 (Custom Sort Comparators): custom comparators receive display values when `sortByDisplayValue` is enabled.
- F-02.6 (Locale-Aware Sort): display-value sort uses the locale-aware string comparator by default.
- F-01 (Data Display & Rendering): cell formatters/renderers produce the display values used when `sortByDisplayValue` is enabled.

---

## 2.8 Sort Indicators in Headers [P0]

**Description**: Visual indicators in column headers communicate the current sort state to the user. Indicators include directional icons (arrows or chevrons) showing ascending/descending, priority numbers for multi-column sort, and appropriate ARIA attributes for assistive technology. Indicators MUST use non-color-redundant visual cues per WCAG 1.4.1.

**Applies to**: All variants

**Use Cases**
- UC-1: After clicking a column header, the user sees an upward arrow icon indicating ascending sort, confirming the action took effect.
- UC-2: In a multi-sort scenario, the user sees "1 up-arrow" on the primary sort column and "2 down-arrow" on the secondary sort column, clearly communicating the sort hierarchy.
- UC-3: A screen reader user navigates to a column header and hears "Name, column 2 of 5, ascending sort" due to the `aria-sort` attribute.

**Conditions of Use**
- Sort indicators MUST be displayed on every column header that has an active sort state (direction is not "none").
- Sortable columns that are not currently sorted SHOULD display a subtle sortable affordance on hover (e.g., a faint bidirectional arrow or an `aria-sort="none"` attribute).

**Behavioral Requirements**
- BR-1: When a column's sort direction is `"ascending"`, the header MUST display an upward-pointing directional icon (arrow, chevron, or triangle).
- BR-2: When a column's sort direction is `"descending"`, the header MUST display a downward-pointing directional icon.
- BR-3: When a column's sort direction is `"none"` (unsorted), the directional icon MUST be hidden or display a neutral/bidirectional affordance.
- BR-4: For multi-column sort (F-02.2), each sorted column header MUST display a priority number (1, 2, 3...) adjacent to the directional icon. The number indicates the sort level precedence.
- BR-5: The priority number MUST NOT be displayed for single-column sort (when only one column is sorted, the number "1" is redundant).
- BR-6: The sort indicator icon MUST be implemented as a CSS pseudo-element, an inline SVG, or a background image. It MUST be declared `aria-hidden="true"` (or equivalent) because the sort state is already conveyed via the `aria-sort` attribute on the column header. Redundant icon labels would cause screen readers to announce sort information twice.
- BR-7: The sort indicator MUST NOT reduce the space available for the column header text below the column's minimum usable width. The indicator SHOULD be positioned at the trailing edge of the header cell (right side in LTR, left side in RTL) with appropriate padding.
- BR-8: The sort indicator MUST be visible at all density settings (compact, default, spacious) as defined in F-15.
- BR-9: The directional icon MUST use shape difference (up vs down arrow) as the primary differentiator, NOT color. Color MAY be used as a supplementary cue but MUST NOT be the sole distinction (WCAG 1.4.1: Use of Color).
- BR-10: When a sort is applied or changed, the indicator transition SHOULD be animated (e.g., a rotation or fade) to draw the user's attention to the change. The animation MUST respect `prefers-reduced-motion: reduce` by disabling or minimizing the animation.
- BR-11: The sort indicator MUST be stylable via CSS custom properties and/or CSS Parts to allow theme customization.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Pivot Table | Sort indicators appear on the innermost level of multi-level column headers. Parent (grouping) column headers that are not directly sortable MUST NOT display sort indicators. |
| Gantt Chart | Sort indicators appear only on task list column headers. The timeline region has no column headers and no sort indicators. |

**CSS Subgrid Implications**

Sort indicators are contained within column header cells. They do not affect column track sizing (the indicator is positioned within the existing header cell area). No subgrid changes are required.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| (none) | Sort indicators are purely visual; they do not introduce new keyboard interactions. | N/A |

**Accessibility**
- **ARIA**: The `aria-sort` attribute on the `columnheader` element is the authoritative source of sort state for assistive technology. Valid values: `"ascending"`, `"descending"`, `"other"` (for multi-column sort where the column participates but the combined sort is not purely ascending or descending), `"none"` (sortable but not currently sorted). The `aria-sort` attribute MUST NOT be present on non-sortable column headers.
- **Screen Reader**: The `aria-sort` attribute causes screen readers to announce the sort state when the column header receives focus (e.g., "Name, column header, ascending sort"). For multi-sort, the priority number SHOULD be included via `aria-description` (e.g., `aria-description="Sort priority 2"`) so the screen reader announces: "Revenue, column header, descending sort, sort priority 2".
- **WCAG**: 1.3.1 (sort state is programmatically determinable via `aria-sort`), 1.4.1 (sort direction uses shape, not color alone), 1.4.3 (sort icon meets minimum contrast ratio of 4.5:1 against the header background at normal size, or 3:1 for large/bold), 1.4.11 (non-text contrast: sort icon has at least 3:1 contrast ratio against the header background).
- **Visual**: Sort icons MUST meet WCAG 1.4.11 (Non-text Contrast) with a minimum 3:1 contrast ratio against the header background. Active sort indicators SHOULD be more visually prominent than the hover affordance on unsorted sortable columns.

**Chameleon 6 Status**: Existed. Chameleon 6 renders sort indicators based on the `sortDirection` property and manages the `aria-sort` attribute. Chameleon 7 extends this with priority numbers for multi-sort and ensures WCAG 1.4.1 / 1.4.11 compliance for the icon rendering.

**Interactions**
- F-02.1 (Single-Column Sort): indicator reflects single-sort direction.
- F-02.2 (Multi-Column Sort): indicator includes priority number.
- F-02.5 (Tri-State Sort Cycling): indicator updates on each cycle step.
- F-09 (Column Management): column resize MUST NOT clip or hide the sort indicator. The indicator MUST remain visible even at minimum column width.
- F-15 (Theming & Styling): sort indicator appearance (size, color, style) MUST be customizable via CSS custom properties and/or CSS Parts.
- F-13 (Internationalization): indicator position flips in RTL layouts (leading edge becomes right in LTR, left in RTL).

---

## Cross-Cutting Concerns

### Sort and Filtering Interaction

When both sorting and filtering are active (F-03), the sort MUST operate on the filtered row set. The sequence is: filter first, then sort the filtered results. If the filter changes (rows added or removed from the visible set), the existing sort MUST be re-applied to the new filtered set.

### Sort and Grouping Interaction

When both sorting and grouping are active (F-04), the sort behavior depends on configuration:

- **Sort within groups** (default): groups maintain their order, and rows within each group are sorted by the active sort column(s).
- **Sort groups themselves**: the group header rows are reordered based on the sort column's aggregated value for the group (e.g., sort groups by the sum of revenue within each group).

The grid SHOULD support both modes via a configuration property.

### Sort and Server-Side Operations

When the grid operates in server-side mode (F-20), sort state changes MUST be communicated to the server as part of the data request. The server is responsible for returning rows in the correct order. The grid MUST NOT perform client-side re-sorting of server-provided data in server-side mode.

### Sort and Virtualization

Sort changes trigger a re-render of the visible row window (F-11). The virtual scroller MUST reset its scroll position to the top after a sort change (or optionally scroll to keep a previously focused row visible, if trackable). Sort operations on large datasets SHOULD be performed asynchronously (off the main thread or in chunks) to avoid blocking the UI.

### Sort and Undo/Redo

Sort state changes (user-initiated) SHOULD be recorded in the undo stack (F-17) so the user can undo a sort operation and return to the previous row order. This is a P2 enhancement; implementations MAY defer this.

---

## Normative Requirements Summary

| ID | Requirement | Level | Feature |
|----|-------------|-------|---------|
| SR-01 | The grid MUST sort rows when a sortable column header is activated. | MUST | F-02.1 |
| SR-02 | The grid MUST toggle sort direction on repeated activation per the configured cycle mode. | MUST | F-02.1, F-02.5 |
| SR-03 | The grid MUST clear previous single-column sort when a different column is sorted (single-sort mode). | MUST | F-02.1 |
| SR-04 | The grid MUST emit `columnSortChanged` events on user-initiated and programmatic sort changes. | MUST | F-02.1 |
| SR-05 | Non-sortable columns MUST NOT respond to sort interactions. | MUST | F-02.1 |
| SR-06 | Sort MUST be stable (equal values preserve relative order). | MUST | F-02.1 |
| SR-07 | Sorted column headers MUST carry `aria-sort` with the correct value. | MUST | F-02.1, F-02.8 |
| SR-08 | Shift+click MUST add a secondary sort level when multi-sort is enabled. | MUST | F-02.2 |
| SR-09 | Click without Shift MUST reset to single-column sort (in multi-sort mode). | MUST | F-02.2 |
| SR-10 | Multi-sort priority numbers MUST be contiguous after removals. | MUST | F-02.2 |
| SR-11 | Custom comparators MUST follow the `Array.prototype.sort` contract. | MUST | F-02.3 |
| SR-12 | Null/undefined values MUST sort to the end by default. | MUST | F-02.3 |
| SR-13 | Default sort state MUST be applied on initial render before first paint. | MUST | F-02.4 |
| SR-14 | Initial sort MUST NOT emit `columnSortChanged` events. | MUST | F-02.4 |
| SR-15 | Tri-state cycle: ascending -> descending -> none. | MUST | F-02.5 |
| SR-16 | Two-state cycle: ascending -> descending (no removal). | MUST | F-02.5 |
| SR-17 | Default string comparator MUST use `Intl.Collator` with the configured locale. | MUST | F-02.6 |
| SR-18 | Sort-by-display-value MUST be opt-in per column (default: raw value). | MUST | F-02.7 |
| SR-19 | Sort direction icon MUST use shape difference, not color alone (WCAG 1.4.1). | MUST | F-02.8 |
| SR-20 | Sort icon MUST be `aria-hidden="true"` (state conveyed by `aria-sort`). | MUST | F-02.8 |
| SR-21 | Sort icon MUST meet 3:1 non-text contrast ratio (WCAG 1.4.11). | MUST | F-02.8 |
| SR-22 | Sort indicator animation MUST respect `prefers-reduced-motion: reduce`. | MUST | F-02.8 |
| SR-23 | Tree Grid sorting MUST preserve parent-child relationships. | MUST | F-02.1 |
| SR-24 | Sort MUST be deferred while a cell is in Edit Mode. | MUST | F-02.1 |
| SR-25 | Sort state changes MUST be announced via live region. | MUST | F-02.1, F-02.8 |
| SR-26 | Sort activation MUST occur on click (not mousedown) per WCAG 2.5.2. | MUST | F-02.1 |

---

## Cross-References

| Topic | Reference |
|-------|-----------|
| CSS subgrid layout (rows reorder in DOM) | [FD-01: Layout Model](../01-foundations/01-layout-model.md) |
| Variant-specific sort behavior | [FD-02: Variant Model](../01-foundations/02-variant-model.md), Section 3.3 |
| Sort deferred during editing | [FD-03: Editability Model](../01-foundations/03-editability-model.md) |
| Baseline ARIA structure, focus management | FD-04: Accessibility Foundation |
| Data display and cell formatters | F-01: Data Display & Rendering |
| Filtering (filter-then-sort sequence) | F-03: Filtering |
| Grouping (sort within/across groups) | F-04: Grouping & Aggregation |
| Tree hierarchy sort preservation | F-06: Tree / Hierarchical |
| Cell editing (sort deferred during edits) | F-07: Cell Editing |
| Column management (sort indicator in resized columns) | F-09: Column Management |
| Virtualization (re-render on sort) | F-11: Virtualization & Performance |
| Internationalization (locale alignment) | F-13: Internationalization |
| Keyboard navigation (Enter/Space on headers) | F-14: Keyboard Navigation |
| Theming (sort indicator styling) | F-15: Theming & Styling |
| Context menus (sort actions in column menu) | F-16: Context Menus |
| Undo/Redo (sort state in undo stack) | F-17: Undo/Redo |
| Server-side sort delegation | F-20: Server-Side Operations |
| State persistence (sort state save/restore) | F-21: State Persistence & Responsive |
