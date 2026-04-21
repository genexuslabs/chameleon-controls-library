# F-15: Theming & Styling

> **Part of**: [Tabular Grid Specification](../README.md)
> **Feature category**: Theming & Styling
> **Variants**: All (Data Grid, Tree Grid, Pivot Table, Gantt Chart)

## Overview

Theming and styling covers the complete set of mechanisms that allow consumers to control the visual appearance of the tabular grid without modifying internal component markup. This encompasses CSS custom properties for global visual tokens, CSS shadow parts for targeting specific structural elements from outside the shadow DOM, dynamic class-based row and cell styling, column-level styling analogous to HTML `<colgroup>`, row striping for readability, density mode presets, grid-line display control, and per-column or per-cell content alignment.

Together these features form a layered styling API: CSS variables establish a design-token baseline that cascades through the entire grid, CSS Parts provide surgical access to named shadow DOM elements, class callbacks enable data-driven conditional styling at row and cell granularity, and density plus alignment properties expose the most commonly adjusted dimensions as first-class component properties. The architecture ensures all styling is externally composable — consumers never need to pierce the shadow DOM with non-standard selectors or override internal implementation details.

> **Foundations**: This feature category assumes the layout model defined in [FD-01: Layout Model](../01-foundations/01-layout-model.md), which specifies the CSS subgrid structure that all cells and headers participate in. Column track sizing exposed via CSS variables in F-15.1 is a direct extension of the sizing model described in FD-01. Accessibility requirements for focus indicators and color contrast referenced throughout this file derive from [FD-04: Accessibility Foundation](../01-foundations/04-accessibility-foundation.md). Edit-mode cell styling interactions reference the editability model in [FD-03: Editability Model](../01-foundations/03-editability-model.md).

---

## 15.1 CSS Custom Properties (CSS Variables) [P0]

**Description**: The grid exposes a comprehensive set of CSS custom properties (variables) prefixed `--ch-grid-*` that act as design tokens for all visual aspects of the component. Variables cascade from the host element into all internal shadow DOM elements, allowing a consumer to retheme the entire grid by setting a small number of properties on a single ancestor. All default values are set inside the component's shadow stylesheet so the grid renders correctly with no consumer overrides.

**Applies to**: All variants

**Use Cases**
- UC-1: A product team applies its design system color palette to every grid on the page by setting `--ch-grid-header-bg`, `--ch-grid-row-bg`, and `--ch-grid-accent-color` on the `:root` selector once, rather than overriding component internals.
- UC-2: A dark-mode stylesheet toggles a `data-theme="dark"` attribute on `<body>` and supplies a matching set of `--ch-grid-*` values that replace the light-mode defaults without any JavaScript.
- UC-3: An embedded analytics widget overrides `--ch-grid-font-size` and `--ch-grid-cell-padding` on its own container element to produce a compact variant scoped only to that widget.
- UC-4: A Gantt Chart consumer overrides `--ch-grid-gantt-bar-bg` and `--ch-grid-gantt-milestone-color` to match project-status color codes defined in their design system.

**Conditions of Use**
- CSS custom properties MUST be settable on the component host element (`ch-tabular-grid`) or on any ancestor element in the light DOM.
- All `--ch-grid-*` variables MUST have fallback default values defined inside the component shadow stylesheet so the grid renders correctly when no overrides are provided.
- Variables that control interactive states (hover, focus, selection) MUST accept any valid CSS color value including `transparent`.

**Behavioral Requirements**
- BR-1: The grid SHALL expose `--ch-grid-header-bg` controlling the background color of all header row cells.
- BR-2: The grid SHALL expose `--ch-grid-header-color` controlling the text color of all header row cells.
- BR-3: The grid SHALL expose `--ch-grid-row-bg` controlling the default background color of data rows.
- BR-4: The grid SHALL expose `--ch-grid-row-alt-bg` controlling the background color of alternating rows when row striping is enabled (F-15.5).
- BR-5: The grid SHALL expose `--ch-grid-row-hover-bg` controlling the background color of a row on pointer hover.
- BR-6: The grid SHALL expose `--ch-grid-row-selected-bg` and `--ch-grid-row-selected-color` controlling the background and text color of selected rows.
- BR-7: The grid SHALL expose `--ch-grid-focus-ring-color` and `--ch-grid-focus-ring-width` controlling the focus indicator painted around the focused cell or row.
- BR-8: The grid SHALL expose `--ch-grid-border-color` controlling all internal cell border colors, and `--ch-grid-outline-color` controlling the outer border of the grid.
- BR-9: The grid SHALL expose `--ch-grid-cell-padding-block` and `--ch-grid-cell-padding-inline` controlling the block-direction (top/bottom) and inline-direction (start/end) padding of data cells respectively.
- BR-10: The grid SHALL expose `--ch-grid-font-family` and `--ch-grid-font-size` controlling the font used throughout the grid. Header font properties MUST inherit these unless overridden by `--ch-grid-header-font-family` and `--ch-grid-header-font-size`.
- BR-11: The grid SHALL expose `--ch-grid-row-height` as a CSS custom property that sets the default row height. Individual row overrides (F-01.5) MUST use inline `style` attributes that override this variable at the row element level.
- BR-12: The grid SHALL expose `--ch-grid-footer-bg` and `--ch-grid-footer-color` for footer row styling in aggregation and pivot contexts.
- BR-13: CSS custom property changes at runtime (via JavaScript `style.setProperty`) SHALL immediately re-render affected visual regions without requiring a full component re-render cycle.
- BR-14: The grid SHALL document all `--ch-grid-*` custom properties in its README with their type, default value, and the visual aspect they control.

**CSS Subgrid Implications**

Column track sizes participate in the CSS custom property system. The grid exposes `--ch-grid-col-{n}-width` variables (where `n` is the one-based column index) that the internal subgrid uses for `grid-template-columns`. Column resize operations (F-09) write new values to these variables, making the column widths both scriptable and cascade-aware.

**Editability Interaction**

The grid SHALL expose `--ch-grid-cell-editing-bg`, `--ch-grid-cell-editing-border-color`, and `--ch-grid-cell-editing-focus-ring-color` to style cells that are in Edit Mode. These variables allow consumers to give active editing cells a visually distinct appearance aligned with their form field design tokens.

**Chameleon 6 Status**: Existed (partial) — Chameleon 6 exposed a subset of color variables. The complete token set including spacing, font, focus indicator, and footer variables is new in Chameleon 7.

**Interactions**: F-15.5 (Row Striping uses `--ch-grid-row-alt-bg`), F-15.6 (Density Modes write to `--ch-grid-cell-padding-*` and `--ch-grid-row-height`), F-15.7 (Grid Lines toggles `--ch-grid-border-color` to `transparent`), FD-01 (column track sizing), FD-04 (focus ring contrast requirements)

---

## 15.2 CSS Shadow Parts [P0]

**Description**: The grid exposes a comprehensive set of named CSS Parts via the `part` attribute on shadow DOM elements, enabling consumers to apply arbitrary styles to internal structural elements from the light DOM using the `::part()` pseudo-element selector. Parts cover structural containers, positional row/cell variants, column state indicators, and interactive state reflections at the column level. The part taxonomy is designed so that common visual customizations — border-radius on the last row, background on a sorted column, bold text in odd rows — require no JavaScript callbacks, only CSS rules.

**Applies to**: All variants

**Use Cases**
- UC-1: A consumer applies `ch-tabular-grid::part(header-cell) { text-transform: uppercase; letter-spacing: 0.05em; }` to enforce title-case header styling across the design system without any JavaScript.
- UC-2: A financial dashboard uses `ch-tabular-grid::part(sorted-column) { background: var(--color-sorted-col-highlight); }` to give the active sort column a persistent tinted background.
- UC-3: A consumer uses `ch-tabular-grid::part(last-row last-cell) { border-radius: 0 0 8px 0; }` to round the bottom-right corner of the grid without setting a border-radius on the grid container (which would clip the scrollbar). **Note**: The `::part()` compound selector `::part(last-row last-cell)` matches a single element that carries BOTH the `last-row` and `last-cell` parts simultaneously. This means cells in the last row must also carry the `last-row` part (not just their parent row element). The grid implementation MUST propagate positional row parts (`first-row`, `last-row`, `odd-row`, `even-row`) to the cell elements as well as the row elements, so that compound part selectors combining row-position and cell-position parts work correctly.
- UC-4: A hover-aware design uses `ch-tabular-grid::part(column-hover) { background: rgba(0,0,0,0.04); }` to shade an entire column when any cell in it is hovered.

**Conditions of Use**
- CSS Parts are available whenever the grid is rendered. Parts for states (e.g., `sorted-column`) are only present on the relevant elements when that state is active.
- Part names MUST be stable across minor and patch releases. Breaking changes to part names MUST be accompanied by a major version increment and migration guide.

**Behavioral Requirements**
- BR-1: The grid SHALL expose the following structural parts: `grid` (the outermost shadow container), `header` (the header region wrapper), `header-row` (each header row element), `header-cell` (each header cell element), `body` (the scrollable data region), `row` (each data row element), `cell` (each data cell element), `footer` (the footer region wrapper), `footer-row` (each footer row element), `footer-cell` (each footer cell element).
- BR-2: The grid SHALL expose positional parts on row elements: `first-row` (the first visible data row), `last-row` (the last visible data row), `odd-row` (rows at odd one-based positions in the rendered order), `even-row` (rows at even positions). These parts SHALL be applied based on visual/rendered position, not data-source index.
- BR-3: The grid SHALL expose positional parts on cell elements: `first-cell` (the first cell in a row), `last-cell` (the last cell in a row). These parts SHALL respect column visibility — hidden columns MUST NOT be counted when determining first/last position.
- BR-4: The grid SHALL expose column-state parts on all cells within the affected column: `sorted-column` (cells in the currently sorted column or columns), `filtered-column` (cells in any column that has an active filter), `frozen-column` (cells in any frozen/pinned column).
- BR-5: The grid SHALL expose interactive-state parts at column level: `column-hover` (applied to all cells in the column containing the currently hovered cell), `column-focus` (applied to all cells in the column containing the currently focused cell). These parts allow styling an entire column based on pointer or keyboard focus position.
- BR-6: Multiple parts SHALL be composable: a frozen sorted column's cells SHALL simultaneously carry `frozen-column`, `sorted-column`, and any applicable positional parts. Consumers can write compound part selectors such as `::part(sorted-column first-cell)` to target the intersection.
- BR-7: For frozen columns, the `part` attribute and `position: sticky` behavior SHALL coexist correctly. The `::part()` rule SHALL be able to override `background-color` on a sticky cell without breaking the stacking context required for correct sticky positioning.
- BR-8: When virtualization (F-11) is active, positional parts (`first-row`, `last-row`, `odd-row`, `even-row`) SHALL reflect the scroll-position-independent logical position of the row in the full dataset, not the DOM recycling position. A row that is logically the 3rd row SHALL always carry `odd-row` regardless of which recycled DOM element renders it.
- BR-9: The grid SHALL expose group-related parts for Tree Grid and grouped Data Grid: `group-row` (a grouping header row), `group-cell` (the expand/collapse cell within a group row), `leaf-row` (a non-group data row inside a group).
- BR-10: The grid SHALL expose Gantt-specific parts: `gantt-bar` (the timeline bar element), `gantt-milestone` (a milestone diamond element), `gantt-dependency` (a dependency line SVG element), `gantt-today-line` (the vertical today indicator line).

**Chameleon 6 Status**: Existed (partial) — Chameleon 6 exposed structural parts (`row`, `cell`, `header-cell`) but lacked positional parts, column-state parts, and interactive-state column parts.

**Interactions**: F-15.1 (CSS variables cascade through parts), F-15.5 (Row Striping may use `odd-row`/`even-row` parts as the CSS hook), F-09 (Frozen columns use `frozen-column` part), F-02 (Sorting sets `sorted-column` part), F-03 (Filtering sets `filtered-column` part), FD-01 (subgrid layout must not break `::part()` styling)

---

## 15.3 Class-Based Row and Cell Styling [P1]

**Description**: The grid accepts consumer-provided callback functions that compute one or more CSS class names for individual rows and individual cells based on their associated data. The returned class names are applied directly to the row or cell DOM element as part of the component's render cycle. This mechanism enables fully data-driven conditional styling — rows can be highlighted based on record state, cells colored based on value thresholds — all expressed as pure CSS rules in the consumer's own stylesheet without any coupling to component internals.

**Applies to**: All variants

**Use Cases**
- UC-1: A project management grid uses `rowClass: (row) => row.data.isOverdue ? 'row--overdue' : ''` to apply a red left-border to all overdue task rows via a `.row--overdue` rule in the application stylesheet.
- UC-2: A financial grid uses `cellClass: (row, col) => col.field === 'delta' && row.data.delta < 0 ? 'cell--negative' : ''` to render negative delta values in red.
- UC-3: A workflow grid applies `['row--read', 'row--locked']` (an array of classes) to rows that match multiple conditions simultaneously.
- UC-4: An administrative grid highlights every row belonging to a particular tenant by returning a tenant-specific class name, which the design team styles in a dynamically loaded theme CSS file.

**Conditions of Use**
- `rowClass` and `cellClass` callbacks are optional. When not provided, no dynamic classes are applied beyond the component's own internal part attributes.
- Callbacks MUST be pure functions — they MUST NOT produce side effects or mutate row/cell data. The grid may call them at any time during render, including during virtualized scroll recycling.
- Returned class names MUST be added to the element in addition to the grid's own internal class names; the grid MUST NOT replace its internal classes.

**Behavioral Requirements**
- BR-1: The grid SHALL accept a `rowClass` property typed as `(rowData: RowData) => string | string[] | null | undefined`. A falsy return value SHALL produce no additional classes.
- BR-2: The grid SHALL accept a `cellClass` property typed as `(rowData: RowData, colDef: ColumnDef) => string | string[] | null | undefined`. A falsy return value SHALL produce no additional classes.
- BR-3: When `rowClass` returns a non-empty string or array, the grid SHALL apply each class name to the row's root DOM element using `classList.add(...)`. This element is the same element that exposes the `row` CSS Part.
- BR-4: When `cellClass` returns a non-empty string or array, the grid SHALL apply each class name to the cell's root DOM element using `classList.add(...)`. This element is the same element that exposes the `cell` CSS Part.
- BR-5: When a row's data changes (e.g., after an inline edit), the grid SHALL re-invoke `rowClass` and `cellClass` for the affected row and update the class list. Stale classes from previous evaluations SHALL be removed before applying new ones.
- BR-6: With virtualization active (F-11), the grid SHALL re-evaluate `rowClass` and `cellClass` each time a recycled DOM row is bound to a new data record. Stale classes from the previous binding MUST be cleared before new classes are applied.
- BR-7: The grid SHALL expose a `refreshRowClasses(rowId?: string)` method. When called without arguments it SHALL re-evaluate all row and cell classes in the current viewport. When called with a specific row identifier it SHALL re-evaluate only that row and its cells.
- BR-8: Class names returned by `rowClass` and `cellClass` SHALL be accessible from the light DOM (they are on shadow elements but the `part` attribute makes them styleable via `::part()`). Additionally, when the grid element is in a mode where its shadow host reflects the current row's classes on itself (accessibility reflection), the `rowClass` values MUST still be applied to the row element, not the host.

**Chameleon 6 Status**: Existed — Chameleon 6 supported `rowClass` and `cellClass` callbacks with similar semantics. Chameleon 7 adds `refreshRowClasses`, array support for multiple simultaneous classes, and guaranteed class cleanup on virtual row recycling.

**Interactions**: F-15.2 (applied classes are on the same elements as CSS Parts; `::part()` and class-based selectors can be combined), F-11 (virtualization requires class re-evaluation on DOM recycling), F-07 (after inline edit, `rowClass` must be re-evaluated with updated data), FD-03 (editability model triggers row data changes)

---

## 15.4 Column-Level Styling [P1]

**Description**: Column definitions accept styling properties (`colClass`, `colStyle`) that apply a CSS class or inline style to every data cell in that column, analogous to how the HTML `<col>` element inside `<colgroup>` applies styles to entire columns in a table. Additionally, the grid assigns a `data-col-id` attribute to each cell reflecting the column's identifier, allowing consumers to write targeted CSS attribute selectors without any JavaScript callbacks. This is a new feature in Chameleon 7, addressing the common requirement of applying consistent column-level visual treatment (font weight, text color, background tint) without writing a `cellClass` callback that tests `colDef.id` for every cell.

**Applies to**: All variants

**Use Cases**
- UC-1: A price-list grid applies `colClass: 'col--numeric'` to all numeric columns in the column definition so that `.col--numeric { font-variant-numeric: tabular-nums; text-align: end; }` automatically applies to every price and quantity cell.
- UC-2: A report grid uses `data-col-id` attribute selectors to color all revenue column cells without a callback. **Note**: Since `data-col-id` is set on elements inside the shadow DOM, the light-DOM descendant selector `ch-tabular-grid [data-col-id="revenue"]` cannot penetrate the shadow boundary. Instead, consumers should use `colClass` on the column definition (e.g., `colClass: 'col--revenue'`) and style via `ch-tabular-grid::part(cell).col--revenue`, or use the `colStyle` property to apply inline styles directly. The `data-col-id` attribute selector is intended for use within the component's own internal shadow stylesheet or in CSS injected via `adoptedStyleSheets`.
- UC-3: A risk-assessment grid sets `colStyle: { background: 'rgba(255,200,0,0.1)' }` on a "Risk Score" column to give the entire column a yellow tint distinguishing it from informational columns.
- UC-4: A Pivot Table consumer applies column-level classes to value columns based on their measure type (currency vs percentage vs count) by mapping column definitions at pivot generation time.

**Conditions of Use**
- `colClass` and `colStyle` are defined at the column-definition level, not on the grid host. They apply to all data cells in the column; header cells are not affected unless `headerColClass` / `headerColStyle` are also set.
- `data-col-id` is always present on every cell and is set to the column definition's `id` (or `field` if `id` is not provided). It is a read-only attribute managed by the grid.

**Behavioral Requirements**
- BR-1: Each column definition object SHALL accept a `colClass` property typed as `string | string[]`. When provided, the grid SHALL apply the specified class(es) to the root element of every data cell in that column, in addition to any classes from `cellClass`.
- BR-2: Each column definition object SHALL accept a `colStyle` property typed as `Partial<CSSStyleDeclaration>` or a CSS-string shorthand. When provided, the grid SHALL merge the specified styles onto the inline `style` attribute of every data cell in that column. Merging MUST NOT overwrite styles set by `cellClass` rules unless the specificity of the inline style naturally wins.
- BR-3: The grid SHALL apply a `data-col-id` attribute to every cell (data, header, and footer) whose value is the column's `id` property, falling back to the column's `field` property if `id` is absent. This attribute SHALL be stable across re-renders and virtual scroll recycling.
- BR-4: When column definitions are updated at runtime (e.g., a column is added or removed), the grid SHALL re-apply `colClass` and `colStyle` to all affected cells in the next render cycle.
- BR-5: `colClass` applied via column definition SHALL NOT conflict with `rowClass` or `cellClass` applied via grid-level callbacks. Both sets of classes SHALL coexist on the same cell element.
- BR-6: The grid SHALL accept `headerColClass` and `headerColStyle` as separate column-definition properties that apply only to the column's header cell, following the same typing and behavior as `colClass`/`colStyle`.
- BR-7: For frozen columns (F-09), `colClass` and `data-col-id` SHALL be present on the frozen cell and on any non-frozen mirror cell if the implementation uses DOM duplication for sticky positioning. The CSS Part `frozen-column` SHALL also be present so `::part(frozen-column)` and `[data-col-id]` attribute selectors are independently usable.

**CSS Subgrid Implications**

In the CSS subgrid layout, all cells in a column share the same grid column track. The `data-col-id` attribute selector approach works correctly without any CSS grid specifics. However, a complementary approach using `nth-child` on the subgrid tracks is also valid for positional styling; the grid MAY document this pattern in the README as an alternative to `data-col-id`.

**Chameleon 6 Status**: New feature — Chameleon 6 had no column-level `colClass`/`colStyle` on column definitions, and no `data-col-id` attribute.

**Interactions**: F-15.2 (CSS Parts and `data-col-id` are independent but complementary selectors), F-15.3 (class precedence: `colClass` applies at column granularity; `cellClass` applies at cell granularity; both coexist), F-09 (frozen columns require correct attribute propagation), FD-01 (subgrid column tracks relate to `data-col-id` positional targeting)

---

## 15.5 Row Striping [P1]

**Description**: The grid supports alternating row background colors (zebra striping) to improve row-to-row readability in dense data displays. Striping is toggled via the `stripedRows` boolean property. The visual implementation leverages the positional CSS Parts `odd-row` and `even-row` (exposed by F-15.2) along with the `--ch-grid-row-alt-bg` CSS variable (exposed by F-15.1), meaning striping integrates cleanly with the overall theming system. Special attention is paid to correctness under virtualization and grouped/tree layouts.

**Applies to**: All variants

**Use Cases**
- UC-1: A read-only reporting grid enables `stripedRows: true` so analysts can visually track rows across wide columns without a ruler.
- UC-2: A design-system consumer customizes stripe colors by setting `--ch-grid-row-alt-bg: var(--ds-surface-secondary)` on the grid host, producing stripes that match the surrounding UI.
- UC-3: A tree grid consumer enables striping and expects group header rows to be excluded from the alternation so that only leaf rows participate in the odd/even color pattern.
- UC-4: A pivot table uses striping to visually separate alternating measure rows when there are many rows of aggregated values.

**Conditions of Use**
- `stripedRows` defaults to `false`. Striping is applied only when explicitly enabled.
- Striping and `rowClass` callbacks (F-15.3) can both be active simultaneously. The consumer is responsible for ensuring their `rowClass` styles do not visually conflict with the stripe background.
- Row selection styling (`--ch-grid-row-selected-bg`) SHALL take visual precedence over stripe background for selected rows.

**Behavioral Requirements**
- BR-1: The grid SHALL accept a `stripedRows` property of type `boolean` (default `false`). When `true`, odd-positioned rows SHALL receive `--ch-grid-row-alt-bg` as their background and even-positioned rows SHALL receive `--ch-grid-row-bg`.
- BR-2: Row position for striping purposes SHALL be determined by the row's visual/rendered position in the current sort and filter state, not by the row's position in the original data source. After sorting or filtering, position numbering SHALL restart from 1.
- BR-3: With virtualization (F-11) active, the grid SHALL maintain correct odd/even classification for recycled DOM rows. Each time a virtual row DOM element is bound to a new data record, its stripe class or part attribute SHALL be updated to reflect the logical position of that record.
- BR-4: In grouped Data Grid (F-04) and Tree Grid (F-06) layouts, group header rows and tree branch rows SHALL be configurable as striping participants or striping anchors via the `stripedRowsIncludeGroups` property (default `false`). When `false`, only leaf/data rows participate in the alternation; group header rows receive the non-striped background.
- BR-5: The stripe colors SHALL be controllable exclusively via `--ch-grid-row-bg` (even rows) and `--ch-grid-row-alt-bg` (odd rows). No additional hardcoded colors SHALL be introduced by the striping feature.
- BR-6: Row hover (`--ch-grid-row-hover-bg`) SHALL overlay the stripe background on hover. The hover color SHALL be applied via a CSS rule with higher specificity than the stripe rule or via `mix-blend-mode`/`opacity` layering so that the stripe is still perceptible in the hover state, if the consumer desires this effect.
- BR-7: When `stripedRows` changes at runtime, the grid SHALL re-evaluate stripe classes for all rendered rows without requiring a full data reload.

**Chameleon 6 Status**: Existed — Chameleon 6 supported `stripedRows`. Chameleon 7 adds `stripedRowsIncludeGroups`, guarantees virtual-scroll correctness, and integrates with the formal CSS Parts taxonomy.

**Interactions**: F-15.1 (`--ch-grid-row-alt-bg` variable), F-15.2 (`odd-row`/`even-row` CSS Parts), F-15.3 (coexistence with `rowClass`), F-11 (virtual scroll recycling and stripe classification), F-04 (grouped rows and stripe anchoring), F-06 (tree rows and stripe anchoring), F-08 (selected rows override stripe background)

---

## 15.6 Density Modes [P1]

**Description**: The grid provides three built-in density presets — `compact`, `normal`, and `comfortable` — that adjust cell padding and default row height as a unit, making it easy to adapt the grid for use in information-dense dashboards (compact) versus spacious enterprise forms (comfortable). Density is implemented entirely via CSS custom property overrides, meaning consumers can fine-tune individual variables after selecting a preset without fighting hardcoded values. Density presets can coexist with per-row variable heights (F-01.5).

**Applies to**: All variants

**Use Cases**
- UC-1: An operations dashboard that displays 50+ rows simultaneously uses `density="compact"` to maximize the number of visible rows without requiring the user to scroll.
- UC-2: A data entry form with inline editing uses `density="comfortable"` to provide generous tap targets on touch devices and clear visual separation between fields.
- UC-3: A consumer selects `density="normal"` (the default) as a balanced baseline and then overrides `--ch-grid-cell-padding-block` by 2px to fine-tune the vertical rhythm without deviating from the preset system.
- UC-4: A user preference panel allows end users to switch density at runtime; the grid responds immediately without data reload.

**Conditions of Use**
- `density` defaults to `"normal"`. The property is settable at any time.
- Per-row variable heights (F-01.5) set via row-level data properties take visual precedence over the density-preset row height for those specific rows. All other rows continue to use the density preset height.

**Behavioral Requirements**
- BR-1: The grid SHALL accept a `density` property accepting `'compact' | 'normal' | 'comfortable'`. The default SHALL be `'normal'`.
- BR-2: Each density preset SHALL define a specific value for `--ch-grid-cell-padding-block`, `--ch-grid-cell-padding-inline`, and `--ch-grid-row-height`. The recommended baseline values are:
  - `compact`: 4px block / 8px inline / 28px row height
  - `normal`: 8px block / 12px inline / 40px row height
  - `comfortable`: 12px block / 16px inline / 56px row height
  These values MUST be overridable by consumer-set `--ch-grid-*` variables.
- BR-3: Density SHALL be implemented by the component setting CSS custom properties on its host element's shadow stylesheet at the `:host` level using the `density` attribute value as a CSS selector (e.g., `:host([density="compact"]) { --ch-grid-row-height: 28px; ... }`). Consumer overrides set on the host element in the light DOM MUST cascade on top of these `:host` defaults.
- BR-4: Changing `density` at runtime SHALL immediately update the layout. The grid SHALL NOT require a data reload or manual refresh call to apply the new density.
- BR-5: When `density` is `'compact'`, custom cell renderer components inside cells MUST receive the reduced padding and height via CSS inheritance, not via direct prop injection. Renderers that use fixed pixel heights are the consumer's responsibility.
- BR-6: The density preset SHALL affect all rows uniformly including header rows and footer rows, unless the consumer has set explicit override variables for headers (`--ch-grid-header-cell-padding-*`) or footers (`--ch-grid-footer-cell-padding-*`), which SHALL always take precedence.

**Chameleon 6 Status**: Existed (partial) — Chameleon 6 had a `size` property with `"XS"` / `"S"` / `"M"` / `"L"` values. Chameleon 7 renames the property to `density`, normalizes to industry-standard preset names, and fully implements it via CSS custom properties instead of hardcoded class names.

**Interactions**: F-15.1 (density writes to shared CSS custom properties), F-01 (F-01.5 per-row variable heights interact with density's default row height), F-14 (keyboard navigation target size should remain adequate at compact density per WCAG 2.5.8)

---

## 15.7 Grid Lines Display [P1]

**Description**: The grid provides a `showLines` property that controls which internal borders are visible — horizontal dividers between rows, vertical dividers between columns, all cell borders, only the outer grid border, or none. This allows the grid to fit naturally into a wide range of layout contexts: a seamless borderless grid inside a card component, a full-grid-line spreadsheet-style view, or a horizontally-ruled table typical of enterprise data grids. All line visibility is implemented by toggling `--ch-grid-border-color` and related variables between their specified color and `transparent`.

**Applies to**: All variants

**Use Cases**
- UC-1: A card-based dashboard uses `showLines="none"` to render the grid without any borders, relying only on row striping (F-15.5) for row separation.
- UC-2: A spreadsheet-style data entry grid uses `showLines="all"` to produce a traditional cell-grid appearance familiar to users of office productivity tools.
- UC-3: A report grid uses `showLines="horizontal"` (the default) to show only the horizontal row separator lines, keeping the layout clean without vertical column dividers.
- UC-4: A widget that wraps the grid in its own bordered container uses `showLines="outer"` to maintain only the perimeter border and remove internal dividers.

**Conditions of Use**
- `showLines` defaults to `"horizontal"`.
- Grid line visibility is purely decorative and does not affect data layout, column widths, or row heights.
- The `showLines` value interacts with CSS Parts: a consumer can always override individual border properties via `::part(cell)` regardless of the `showLines` setting.

**Behavioral Requirements**
- BR-1: The grid SHALL accept a `showLines` property accepting `'none' | 'horizontal' | 'vertical' | 'all' | 'outer'`. The default SHALL be `'horizontal'`.
- BR-2: When `showLines` is `'none'`, the grid SHALL render no internal or external borders. All `border`, `border-top`, `border-bottom`, `border-left`, `border-right`, and `outline` properties on internal grid elements SHALL be `0` or `transparent`.
- BR-3: When `showLines` is `'horizontal'`, the grid SHALL render a bottom border on each row (effectively a horizontal line between rows). No vertical borders between cells SHALL be visible.
- BR-4: When `showLines` is `'vertical'`, the grid SHALL render a right border (or `border-inline-end` in logical property terms) on each cell. No horizontal row separators SHALL be visible.
- BR-5: When `showLines` is `'all'`, the grid SHALL render both horizontal row borders and vertical cell borders, producing a full cell-grid appearance.
- BR-6: When `showLines` is `'outer'`, the grid SHALL render only the outer border of the grid container (the element carrying the `grid` CSS Part). No internal row or cell borders SHALL be visible.
- BR-7: Changing `showLines` at runtime SHALL immediately update the visual presentation without requiring a data reload.
- BR-8: Grid lines SHALL be rendered using CSS border properties, not box shadows or outlines on internal elements, to ensure correct rendering with CSS subgrid layouts where adjacent cell borders must collapse cleanly.

**Accessibility**
- **ARIA**: Grid lines are purely decorative. No ARIA attributes change with `showLines`. The grid's role (`role="grid"`) and cell roles (`role="gridcell"`) are unaffected.
- **Screen Reader**: SR does not announce grid line presence or absence.
- **WCAG**: Grid lines are visual aids. When `showLines` is `'none'`, the grid MUST use at least one other visual differentiation mechanism (e.g., row striping, density, or consumer-supplied background colors) to ensure rows remain distinguishable. This is a design guidance recommendation, not a hard WCAG requirement.
- **Visual**: Row separators aid users with low vision in tracking which row they are reading. Disabling all lines (`'none'`) reduces visual structure and SHOULD only be done when an alternative row-differentiation mechanism is present.

**Chameleon 6 Status**: Existed (partial) — Chameleon 6 had some row-line control but did not expose the full `'none' | 'horizontal' | 'vertical' | 'all' | 'outer'` vocabulary.

**Interactions**: F-15.1 (uses `--ch-grid-border-color`; outer border uses `--ch-grid-outline-color`), F-15.5 (Row Striping is a recommended complementary mechanism when `showLines="none"`), F-15.2 (CSS Parts allow per-element border overrides regardless of `showLines`)

---

## 15.8 Cell Alignment [P1]

**Description**: The grid supports per-column control of horizontal and vertical content alignment within cells, with an optional per-row and per-cell override mechanism for exceptional cases. Alignment uses CSS logical properties (`justify-content`, `align-items` with `start`, `center`, `end`) so it is automatically RTL-aware: `start` means left in LTR and right in RTL without any additional configuration. Alignment applies within the CSS subgrid cell box, correctly accounting for cell padding defined by the density or `--ch-grid-cell-padding-*` variables.

**Applies to**: All variants

**Use Cases**
- UC-1: A numeric data grid sets `align: 'end'` on all numeric columns so that numbers right-align, making decimal points line up vertically for easy comparison.
- UC-2: An RTL Arabic-locale deployment of the same grid sets no explicit alignment; because `end` maps to right in LTR but left in RTL, the number columns automatically align correctly in both locales.
- UC-3: A status icon column uses `align: 'center'` and `verticalAlign: 'middle'` so status badges are centered both horizontally and vertically in their cells.
- UC-4: A multi-line description column uses `verticalAlign: 'top'` so that when rows expand to show long text, the text begins at the top of the cell rather than being centered vertically.

**Conditions of Use**
- `align` and `verticalAlign` are column-definition properties. They are optional; when absent, the grid defaults to `align: 'start'` and `verticalAlign: 'middle'`.
- Row-level and cell-level alignment overrides are provided via `rowAlignOverride` in the row data map and by returning an alignment object from cell renderer components respectively. These are lower-frequency escape hatches; the column-level settings cover the vast majority of use cases.
- Alignment applies to data cells only by default. Header cell alignment is controlled separately via `headerAlign` on the column definition.

**Behavioral Requirements**
- BR-1: Each column definition SHALL accept an `align` property typed as `'start' | 'center' | 'end'`. The default SHALL be `'start'`. This property SHALL control the CSS `justify-content` (or `text-align` for text-only cells) of the cell content container.
- BR-2: Each column definition SHALL accept a `verticalAlign` property typed as `'top' | 'middle' | 'bottom'`. The default SHALL be `'middle'`. This property SHALL control the CSS `align-items` of the cell content container, mapping `top` → `flex-start`, `middle` → `center`, `bottom` → `flex-end`.
- BR-3: Each column definition SHALL accept a `headerAlign` property typed as `'start' | 'center' | 'end'` (default `'start'`), separately controlling horizontal alignment of the header cell for that column.
- BR-4: The grid SHALL implement all horizontal alignment using CSS logical properties (`justify-content: flex-start | center | flex-end`, or equivalent logical values). Hard-coded `left`/`right` text-align values SHALL NOT be used, ensuring automatic RTL flipping without additional code.
- BR-5: A row definition MAY include a `cellAlignOverride` map keyed by column `id` with values of type `{ align?: 'start' | 'center' | 'end'; verticalAlign?: 'top' | 'middle' | 'bottom' }`. When present, the override values SHALL take precedence over the column-definition alignment for cells at the intersection of that row and those columns.
- BR-6: A custom cell renderer component MAY set its own internal alignment. If the cell renderer fills the full cell box, its internal alignment is authoritative. The column-definition alignment applies to the cell's flex/grid container, which the renderer content inherits unless the renderer explicitly overrides it.
- BR-7: Alignment SHALL apply consistently across all density modes (F-15.6). The CSS custom property changes for density MUST NOT inadvertently reset or conflict with the alignment flex/grid properties.
- BR-8: When a cell is in Edit Mode (F-07), alignment SHALL be preserved for the editor widget unless the editor component explicitly sets its own alignment. The cell container's alignment context SHALL remain active during editing.

**CSS Subgrid Implications**

Each grid cell is a CSS subgrid participant. The alignment properties apply to the cell's inner content container (a flex or grid child inside the cell), not to the cell element itself (which is a subgrid item and whose position is controlled by the track layout). This separation ensures that alignment overrides do not disrupt the CSS subgrid column track widths.

**Accessibility**
- **ARIA**: Alignment is a visual property with no ARIA equivalent. No ARIA attributes are modified by alignment settings.
- **Screen Reader**: SR reads cell content in DOM order regardless of visual alignment. Alignment MUST NOT alter DOM order.
- **WCAG**: Alignment using CSS logical properties satisfies WCAG 1.3.4 (Orientation) and 1.3.2 (Meaningful Sequence) because visual order matches DOM order and is direction-aware.
- **Visual**: End-aligned numeric columns improve scannability. Center alignment of icon columns ensures non-text indicators are visually anchored and easier to compare row-to-row.

**Chameleon 6 Status**: Partially existed — Chameleon 6 supported `align` on column definitions but used directional `left`/`right`/`center` values rather than logical `start`/`end`. `verticalAlign`, RTL logical property implementation, and row-level override maps are new in Chameleon 7.

**Interactions**: F-15.4 (column-level `colStyle` can also set alignment styles; column-definition `align`/`verticalAlign` properties take precedence within the grid's internal render logic), F-15.6 (density changes cell padding but MUST NOT reset alignment), F-07 (edit mode preserves cell alignment context), F-13 (RTL layout requires logical property alignment implementation), FD-01 (subgrid cell box is the alignment context)

---

## Normative Requirements Summary

The following table consolidates all normative requirements for the Theming & Styling feature category. Each requirement identifier maps to its source behavioral requirement above.

| Req ID | Feature | Requirement | Priority |
|--------|---------|-------------|----------|
| TS-01 | F-15.1 | The grid SHALL expose `--ch-grid-header-bg`, `--ch-grid-header-color`, `--ch-grid-row-bg`, `--ch-grid-row-alt-bg`, `--ch-grid-row-hover-bg`, `--ch-grid-row-selected-bg`, and `--ch-grid-row-selected-color` as CSS custom properties. | P0 |
| TS-02 | F-15.1 | The grid SHALL expose `--ch-grid-focus-ring-color` and `--ch-grid-focus-ring-width` for focus indicator customization. | P0 |
| TS-03 | F-15.1 | The grid SHALL expose `--ch-grid-border-color`, `--ch-grid-outline-color`, `--ch-grid-cell-padding-block`, `--ch-grid-cell-padding-inline`, `--ch-grid-font-family`, `--ch-grid-font-size`, `--ch-grid-row-height`, `--ch-grid-footer-bg`, and `--ch-grid-footer-color`. | P0 |
| TS-04 | F-15.1 | All `--ch-grid-*` variables SHALL have fallback default values in the component shadow stylesheet. | P0 |
| TS-05 | F-15.1 | CSS custom property changes applied at runtime via `style.setProperty` SHALL immediately re-render affected regions without a full component re-render. | P0 |
| TS-06 | F-15.1 | The grid SHALL expose `--ch-grid-cell-editing-bg`, `--ch-grid-cell-editing-border-color`, and `--ch-grid-cell-editing-focus-ring-color` for Edit Mode cell appearance. | P0 |
| TS-07 | F-15.2 | The grid SHALL expose CSS Parts for all structural elements: `grid`, `header`, `header-row`, `header-cell`, `body`, `row`, `cell`, `footer`, `footer-row`, `footer-cell`. | P0 |
| TS-08 | F-15.2 | The grid SHALL expose positional CSS Parts `first-row`, `last-row`, `odd-row`, `even-row` on row elements, and `first-cell`, `last-cell` on cell elements, based on rendered visual position. | P0 |
| TS-09 | F-15.2 | The grid SHALL expose column-state CSS Parts `sorted-column`, `filtered-column`, and `frozen-column` on all cells within the affected column. | P0 |
| TS-10 | F-15.2 | The grid SHALL expose interactive-state CSS Parts `column-hover` and `column-focus` on all cells in the column containing the hovered or focused cell. | P0 |
| TS-11 | F-15.2 | Positional CSS Parts SHALL reflect logical data position, not DOM recycling position, when virtualization is active. | P0 |
| TS-12 | F-15.2 | CSS Part names SHALL be stable across minor and patch releases. Breaking changes to part names SHALL require a major version increment. | P0 |
| TS-13 | F-15.3 | The grid SHALL accept `rowClass` typed as `(rowData: RowData) => string | string[] | null | undefined` and apply returned class names to row elements. | P1 |
| TS-14 | F-15.3 | The grid SHALL accept `cellClass` typed as `(rowData: RowData, colDef: ColumnDef) => string | string[] | null | undefined` and apply returned class names to cell elements. | P1 |
| TS-15 | F-15.3 | Following an inline edit that changes row data, the grid SHALL re-invoke `rowClass` and `cellClass` for the affected row and update class lists, removing stale classes. | P1 |
| TS-16 | F-15.3 | The grid SHALL expose a `refreshRowClasses(rowId?: string)` method to force re-evaluation of dynamic classes. | P1 |
| TS-17 | F-15.4 | Column definitions SHALL accept `colClass` (`string | string[]`) and `colStyle` (`Partial<CSSStyleDeclaration>`) properties applied to all data cells in the column. | P1 |
| TS-18 | F-15.4 | The grid SHALL apply a `data-col-id` attribute to every cell (data, header, footer) with the column's `id` or `field` as its value. This attribute SHALL be stable across re-renders and virtual scroll recycling. | P1 |
| TS-19 | F-15.4 | Column definitions SHALL accept `headerColClass` and `headerColStyle` properties that apply exclusively to the column's header cell. | P1 |
| TS-20 | F-15.5 | The grid SHALL accept a `stripedRows` boolean property (default `false`). When `true`, odd-positioned rows SHALL use `--ch-grid-row-alt-bg` and even-positioned rows SHALL use `--ch-grid-row-bg`. | P1 |
| TS-21 | F-15.5 | Row stripe classification SHALL be based on the row's logical position in the current sort/filter state, and SHALL be correctly updated for recycled DOM rows under virtualization. | P1 |
| TS-22 | F-15.5 | The grid SHALL expose `stripedRowsIncludeGroups` (default `false`) to control whether group header rows participate in the odd/even alternation. | P1 |
| TS-23 | F-15.6 | The grid SHALL accept a `density` property of `'compact' | 'normal' | 'comfortable'` (default `'normal'`) and SHALL implement each preset by writing specific values for `--ch-grid-cell-padding-block`, `--ch-grid-cell-padding-inline`, and `--ch-grid-row-height` at the `:host` shadow level. | P1 |
| TS-24 | F-15.6 | Consumer-set `--ch-grid-*` variables on the host element SHALL cascade on top of density-preset `:host` defaults, allowing fine-tuning without abandoning the preset system. | P1 |
| TS-25 | F-15.7 | The grid SHALL accept a `showLines` property of `'none' | 'horizontal' | 'vertical' | 'all' | 'outer'` (default `'horizontal'`) and SHALL implement each value by toggling CSS border properties without altering cell box sizes. | P1 |
| TS-26 | F-15.7 | Grid lines SHALL be implemented using CSS `border` properties, not box-shadows or outline hacks, to ensure correct border-collapse behavior within the CSS subgrid layout. | P1 |
| TS-27 | F-15.8 | Column definitions SHALL accept `align: 'start' | 'center' | 'end'` (default `'start'`) and `verticalAlign: 'top' | 'middle' | 'bottom'` (default `'middle'`) for cell content alignment. | P1 |
| TS-28 | F-15.8 | All horizontal alignment SHALL use CSS logical properties (mapping `start` → `flex-start`, `end` → `flex-end`) to ensure automatic RTL flipping without additional JavaScript. | P1 |
| TS-29 | F-15.8 | A row definition MAY include a `cellAlignOverride` map keyed by column `id` to override column-level alignment at the row-cell intersection. | P1 |
| TS-30 | F-15.8 | Density mode changes (F-15.6) SHALL NOT reset or conflict with cell alignment properties. Alignment flex/grid context SHALL persist across density switches. | P1 |

---

*This file is part of the Chameleon 7 Tabular Grid Specification. See [README.md](../README.md) for the complete table of contents.*
