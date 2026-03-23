# F-01: Data Display & Rendering

This feature category covers how the tabular grid renders cell content, formats data for display, communicates loading and empty states, and controls row height strategies. These features define the baseline visual experience: what users see before they interact with sorting, filtering, editing, or selection.

All four variants (Data Grid, Tree Grid, Pivot Table, Gantt Chart) share these features unless a variant-specific deviation is documented. The Data Grid behavior is the default.

> **Prerequisites**: [FD-01: CSS Subgrid Layout Model](../01-foundations/01-layout-model.md) defines the column track architecture. [FD-03: Editability Model](../01-foundations/03-editability-model.md) defines how renderers transition to editors. This document builds on both.

---

## 1.1 Custom Cell Renderers / Templates [P0]

**Description**

Custom cell renderers allow developers to control how cell content is displayed by providing custom components, HTML templates, or render functions. Instead of plain text, a cell can display buttons, images, badges, progress bars, icons, sparklines, or any arbitrary DOM structure.

**Applies to**: Data Grid, Tree Grid, Pivot Table (value cells), Gantt Chart (task list cells)

**Use Cases**

| ID | Use Case |
|----|----------|
| UC-1 | Display a user avatar image alongside the user name in a personnel grid |
| UC-2 | Render a progress bar that fills proportionally to a percentage value |
| UC-3 | Show a status badge (colored chip with icon) for a workflow column |
| UC-4 | Embed action buttons (Edit, Delete) directly within a cell |
| UC-5 | Display a sparkline chart summarizing a row's time-series data |
| UC-6 | Render a star rating widget as a read-only visual indicator |

**Conditions of Use**

- A column definition MUST accept a renderer property that specifies the custom render logic.
- If no custom renderer is provided, the grid MUST fall back to displaying the cell value as plain text (or the output of a value formatter if one is configured).
- Custom renderers MUST receive sufficient context: the cell value, the full row data, the column definition, the row index, and the column index.

**Behavioral Requirements**

| ID | Requirement |
|----|-------------|
| BR-1 | The grid SHALL invoke the custom renderer for every cell in the configured column, passing a parameter object containing `value`, `rowData`, `columnDef`, `rowIndex`, and `colIndex`. |
| BR-2 | The rendered DOM MUST be confined to the cell's CSS grid area. Renderer output MUST NOT alter the column width or row height beyond the configured sizing strategy (see F-01.5 through F-01.7). |
| BR-3 | When the cell enters Edit Mode (per FD-03), the renderer output SHALL be replaced by the editor widget. When Edit Mode ends, the renderer SHALL be re-invoked with the current value. |
| BR-4 | The renderer MUST be re-invoked when the underlying cell data changes (e.g., after an edit commit, a data refresh, or a real-time update). |
| BR-5 | Renderers SHALL support returning either a DOM element, an HTML string, or a Lit `TemplateResult`. The grid MUST handle all three output types. |
| BR-6 | When a renderer produces interactive elements (buttons, links), those elements MUST participate in the two-level focus model defined in FD-03 Section 5. They MUST have `tabindex="-1"` during Navigation Mode. |
| BR-7 | Renderers MUST NOT break virtualization. A renderer that performs expensive initialization SHOULD provide lifecycle hooks (`init`, `refresh`, `destroy`) to enable DOM recycling. |

**Variant-Specific Behavior**

| Variant | Deviation |
|---------|-----------|
| Tree Grid | The renderer for the first (tree node) column MUST render its content to the right of the expand/collapse control and indentation spacing. The renderer does NOT control the caret or indentation; those are managed by the grid. |
| Pivot Table | Renderers on value cells receive aggregated values, not raw record values. The `rowData` context provides the dimension values that define the intersection. |
| Gantt Chart | Renderers apply to task list cells only. Timeline bars are NOT cells and are rendered by the timeline engine (see VS-01). |

**CSS Subgrid Implications**

- Per LC-02 (FD-01), renderer output MUST NOT alter column track sizing. The cell element enforces `min-width: 0; overflow: hidden` to clip content that exceeds the track width.
- Renderers that produce absolutely positioned children MUST position them relative to the cell element, which serves as the containing block.

**Editability Interaction**

- Per FD-03 Section 2.1, when a cell transitions from Navigation Mode to Edit Mode, the renderer DOM is replaced by the editor widget. The transition MUST be seamless: the cell area does not resize, and the editor appears in the same visual position.
- When Edit Mode ends (commit or cancel), the renderer is re-invoked. If the value changed, the new value is passed; if cancelled, the original value is passed.
- Renderers that embed interactive controls (buttons) use the two-level focus model. Pressing Enter/F2 on the cell moves focus to the first interactive element inside the renderer, NOT to an editor widget. The grid distinguishes between "editable cells" (which open an editor) and "interactive cells" (which delegate focus to renderer widgets) based on the column's `editable` property.

**Keyboard Interaction**

| Key | Context | Action |
|-----|---------|--------|
| Enter / F2 | Navigation Mode, cell with interactive renderer | Focus moves to first interactive element inside the renderer (two-level focus model) |
| Tab | Inner focus level, multiple interactive elements | Cycles focus between interactive elements within the cell |
| Escape | Inner focus level | Returns focus to the gridcell; grid resumes Navigation Mode |

**Accessibility**

| Aspect | Requirement |
|--------|-------------|
| ARIA | Interactive elements inside renderers MUST have accessible names (`aria-label` or visible label text). Decorative elements MUST use `aria-hidden="true"`. |
| Screen Reader | When focus enters a cell with a custom renderer, the screen reader MUST announce the cell value (from `aria-label` on the gridcell or the cell's text content). Custom renderers MUST NOT produce an announcement storm from multiple nested live regions. |
| WCAG 1.3.1 | The programmatic structure of rendered content MUST convey meaningful relationships. A progress bar MUST use `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`. |
| WCAG 4.1.2 | All interactive elements within a renderer MUST expose name, role, and value to assistive technology. |
| Visual | Renderers MUST NOT rely on color alone (WCAG 1.4.1) to convey information. A status badge MUST include text or an icon in addition to its color. |

**Chameleon 6 Status**: Supported via cell templates (Stencil functional components rendered per cell).

**Interactions**: F-07 (Cell Editing -- editor replaces renderer), F-11 (Virtualization -- renderer lifecycle hooks for DOM recycling), F-14 (Keyboard Navigation -- two-level focus model for interactive renderers), F-15 (Theming -- CSS Parts on renderer output), FD-03 (Editability Model -- renderer/editor swap)

---

## 1.2 Cell Data Types [P0]

**Description**

Typed columns declare the data type of their values, which drives sorting comparators, filter operators, editor selection, default formatting, and validation rules. Data types provide a single declaration point that informs multiple downstream features.

**Applies to**: Data Grid, Tree Grid, Pivot Table (dimension and value columns), Gantt Chart (task list columns)

**Use Cases**

| ID | Use Case |
|----|----------|
| UC-1 | A "Price" column declared as `number` automatically sorts numerically, displays a number filter, and opens a numeric editor |
| UC-2 | A "Created Date" column declared as `datetime` uses date-aware sorting, a date-range filter, and a date picker editor |
| UC-3 | A "Is Active" column declared as `boolean` renders a checkbox and provides a true/false filter toggle |

**Conditions of Use**

- The `dataType` property on a column definition MUST accept one of the supported type identifiers.
- If `dataType` is omitted, the grid MUST default to `"string"`.

**Behavioral Requirements**

| ID | Requirement |
|----|-------------|
| BR-1 | The grid MUST support the following built-in data types: `"string"`, `"number"`, `"boolean"`, `"datetime"`. |
| BR-2 | Each data type SHALL provide a default sort comparator that is used unless a custom comparator is specified (F-02). String: locale-aware lexicographic. Number: numeric. Boolean: false before true. Datetime: chronological. |
| BR-3 | Each data type SHALL provide a default filter type (F-03). String: text filter (contains, starts with, equals). Number: number filter (equals, greater than, less than, between). Boolean: toggle filter. Datetime: date range filter. |
| BR-4 | Each data type SHALL map to a default editor type (FD-03 Section 4). String: text input. Number: number input. Boolean: checkbox. Datetime: date picker. |
| BR-5 | Each data type SHALL provide a default value formatter (F-01.3) if none is explicitly specified. String: identity (no transformation). Number: locale-aware number formatting. Boolean: no formatting (rendered as checkbox). Datetime: locale-aware date/time string. |
| BR-6 | Custom data types MAY be registered to extend the built-in set. A custom data type definition MUST provide at minimum: a sort comparator, a default editor type, and a default formatter. |
| BR-7 | The `dataType` property MUST NOT alter the raw data stored in the data model. It only affects how the value is presented, compared, filtered, and edited. |

**Variant-Specific Behavior**

| Variant | Deviation |
|---------|-----------|
| Pivot Table | Value cells typically display aggregation results. The `dataType` on value columns drives formatting (e.g., currency formatting for summed revenue). Dimension columns use data types for their filter/sort behavior. |
| Gantt Chart | Task list columns use data types normally. Date columns (`datetime`) in the task list are synchronized with timeline bar positions. |

**Accessibility**

| Aspect | Requirement |
|--------|-------------|
| Screen Reader | When a cell value is announced, the screen reader SHOULD hear the formatted value (per the data type's default formatter), not the raw value. For example, a datetime column should announce "March 15, 2026" rather than "2026-03-15T00:00:00Z". |
| WCAG 1.3.1 | The data type does not produce visible structure, so no structural ARIA requirements apply. The data type's influence on sorting and filtering is communicated through sort indicators (F-02) and filter state (F-03). |

**Chameleon 6 Status**: Partially supported. Column `dataType` existed but only influenced sorting. Chameleon 7 extends it to drive formatting, filtering, and editor selection.

**Chameleon 7 Status**: The `dataType` property is defined on `TabularGridColumnItemModel` with values `"string" | "number" | "boolean" | "datetime"`.

**Interactions**: F-02 (Sorting -- data type provides default comparator), F-03 (Filtering -- data type selects default filter), F-07 (Cell Editing -- data type selects default editor), F-01.3 (Value Formatters -- data type provides default format), F-18 (Validation -- data type informs type-level validation), FD-03 (Editability -- editor type mapping)

---

## 1.3 Value Formatters [P0]

**Description**

Value formatters transform raw data values into display strings without modifying the underlying data. They are distinct from cell renderers: formatters handle text-level transformation (e.g., formatting a number as currency), while renderers handle full DOM control (e.g., rendering a progress bar). When both a formatter and a renderer are specified, the formatter runs first and its output is passed to the renderer.

**Applies to**: Data Grid, Tree Grid, Pivot Table (value cells and dimension labels), Gantt Chart (task list cells)

**Use Cases**

| ID | Use Case |
|----|----------|
| UC-1 | Display a raw number `1234.5` as the currency string `"$1,234.50"` |
| UC-2 | Display a boolean `true` as the text `"Yes"` and `false` as `"No"` |
| UC-3 | Display a datetime value as a human-readable relative string `"2 hours ago"` |
| UC-4 | Display a decimal `0.85` as a percentage `"85%"` |
| UC-5 | Mask sensitive data: display a phone number `"5551234567"` as `"(555) 123-4567"` |

**Conditions of Use**

- A column definition MUST accept a `valueFormatter` property: a function receiving the raw value and context, returning a string.
- If no `valueFormatter` is specified, the grid MUST apply the data type's default format (F-01.2 BR-5).

**Behavioral Requirements**

| ID | Requirement |
|----|-------------|
| BR-1 | The `valueFormatter` function SHALL receive a parameter object containing `value` (the raw cell value), `rowData`, `columnDef`, `rowIndex`, and `colIndex`. It SHALL return a `string`. |
| BR-2 | The formatted string MUST be used for display purposes only. The raw value MUST be preserved in the data model unchanged. |
| BR-3 | When a cell enters Edit Mode, the editor MUST receive the **raw** value, NOT the formatted string. This ensures type-safe editing (e.g., the user edits `1234.5`, not `"$1,234.50"`). |
| BR-4 | Sorting (F-02) MUST operate on the raw value by default, NOT the formatted string. A separate `sortByFormattedValue` option MAY be provided for cases where formatted-value sorting is desired. |
| BR-5 | Export (F-12) MUST allow choosing whether to export raw or formatted values. CSV and Excel export SHOULD default to raw values; PDF and print SHOULD default to formatted values. |
| BR-6 | When both a `valueFormatter` and a custom cell renderer are specified on a column, the formatter SHALL execute first. The renderer receives the **formatted** string as `formattedValue` alongside the raw `value`. |
| BR-7 | The `valueFormatter` SHALL be invoked each time the cell is rendered (initial render, data change, post-edit re-render). It MUST be a pure function with no side effects. |
| BR-8 | Copy-to-clipboard operations (F-12) SHOULD copy the formatted value by default, with an option to copy raw values. |

**Accessibility**

| Aspect | Requirement |
|--------|-------------|
| Screen Reader | The screen reader MUST announce the formatted value, not the raw value. If the gridcell contains the formatted string as text content, this happens automatically. If a custom renderer is used, the gridcell's `aria-label` or text content MUST reflect the formatted value. |
| WCAG 1.3.1 | No additional structural requirements. The formatter affects only the textual content of the cell. |

**Chameleon 6 Status**: Not directly supported as a separate concept. Formatting was handled within cell templates.

**Interactions**: F-01.1 (Renderers -- formatter output feeds into renderer), F-01.2 (Data Types -- data type provides default formatter), F-02 (Sorting -- raw vs. formatted sort), F-07 (Cell Editing -- editor receives raw value), F-12 (Export -- raw vs. formatted export), F-13 (Internationalization -- locale-aware formatting), FD-03 (Editability -- editor value contract)

---

## 1.4 Cell Tooltips [P1]

**Description**

Cell tooltips display additional information when the user hovers over or focuses a cell. They serve two primary purposes: revealing truncated content (when cell text overflows due to column width constraints) and providing supplementary context beyond what the cell itself shows. Tooltips MUST comply with WCAG 1.4.13 (Content on Hover or Focus).

**Applies to**: Data Grid, Tree Grid, Pivot Table, Gantt Chart (task list cells)

**Use Cases**

| ID | Use Case |
|----|----------|
| UC-1 | A narrow "Name" column truncates long names with ellipsis; hovering reveals the full name |
| UC-2 | A "Status" column shows a short code; the tooltip explains the full meaning |
| UC-3 | A validation error tooltip shows the error message when hovering over an invalid cell |
| UC-4 | A "Last Modified" column shows a relative date; the tooltip shows the exact timestamp |

**Conditions of Use**

- Tooltips MAY be configured at the column level (static field mapping or callback) or at the grid level (global callback for all cells).
- Tooltips MUST appear on both pointer hover AND keyboard focus.
- The tooltip MUST be dismissible, hoverable, and persistent per WCAG 1.4.13.

**Behavioral Requirements**

| ID | Requirement |
|----|-------------|
| BR-1 | The grid SHALL support static tooltips via a `tooltipField` property on the column definition, which maps to a field in the row data. |
| BR-2 | The grid SHALL support dynamic tooltips via a `tooltipValueGetter` callback on the column definition, receiving `{ value, rowData, columnDef, rowIndex, colIndex }` and returning a string or null. Returning null or empty string suppresses the tooltip. |
| BR-3 | The tooltip MUST appear after a configurable delay (default: 300ms for hover, 0ms for focus) to avoid flickering during rapid mouse movement. |
| BR-4 | The tooltip MUST be **dismissible**: pressing `Escape` SHALL hide the tooltip without moving focus. |
| BR-5 | The tooltip MUST be **hoverable**: the user SHALL be able to move the pointer from the trigger cell to the tooltip content without the tooltip disappearing. The tooltip MUST remain visible while the pointer is within the combined trigger + tooltip area. |
| BR-6 | The tooltip MUST be **persistent**: it SHALL remain visible until the user dismisses it (Escape), moves the pointer away from both the trigger and the tooltip, or moves keyboard focus away from the trigger cell. The tooltip MUST NOT auto-dismiss on a timer. |
| BR-7 | When cell content is truncated (text-overflow: ellipsis), the grid SHOULD automatically show the full cell text as a tooltip, even if no tooltip is explicitly configured. This behavior SHOULD be opt-out configurable. |
| BR-8 | The tooltip MUST NOT appear when the cell is in Edit Mode. Hovering over a cell being edited MUST NOT trigger a tooltip. |

**Keyboard Interaction**

| Key | Context | Action |
|-----|---------|--------|
| Escape | Tooltip visible | Dismiss the tooltip; focus remains on the cell |
| Tab / Arrow keys | Tooltip visible | Dismiss the tooltip as focus moves to another cell |

**Accessibility**

| Aspect | Requirement |
|--------|-------------|
| ARIA | The tooltip element MUST use `role="tooltip"` and a unique `id`. The trigger cell MUST reference the tooltip via `aria-describedby="[tooltip-id]"` when the tooltip is visible. When the tooltip is hidden, `aria-describedby` MUST be removed or point to nothing. |
| Screen Reader | For truncated content tooltips, the cell's `aria-label` MUST contain the full untruncated text (making the tooltip redundant for screen readers). The tooltip element MAY use `aria-hidden="true"` in this case. For tooltips that provide supplementary information beyond the cell value, `aria-describedby` MUST be used so the screen reader announces the tooltip content as a description. |
| WCAG 1.4.13 | Content on Hover or Focus: the three mandatory conditions (dismissible, hoverable, persistent) are fully specified in BR-4, BR-5, BR-6. |
| Visual | The tooltip MUST have sufficient contrast (WCAG 1.4.3: 4.5:1 for normal text, 3:1 for large text). The tooltip MUST NOT obscure the trigger cell to the extent that the user cannot read the cell value. |

**Chameleon 6 Status**: Not natively supported. Developers implemented tooltips via custom cell templates.

**Interactions**: F-01.1 (Renderers -- tooltip may be part of a custom renderer), F-01.3 (Formatters -- tooltip may show formatted or raw value), F-07 (Cell Editing -- tooltip suppressed during editing), F-18 (Validation -- validation error tooltip)

---

## 1.5 Row Height: Fixed [P0]

**Description**

Fixed row height mode sets a uniform height for all data rows. This is the default and highest-performance mode because the virtual scroller can compute total scroll height and row positions via simple multiplication (row count x row height) without measuring any rendered rows.

**Applies to**: Data Grid, Tree Grid, Pivot Table, Gantt Chart (task list rows)

**Use Cases**

| ID | Use Case |
|----|----------|
| UC-1 | A standard data table with single-line text in all columns uses 40px row height |
| UC-2 | A compact density mode reduces row height to 32px for information-dense views |
| UC-3 | A comfortable density mode uses 52px for touch-friendly targets |

**Conditions of Use**

- Fixed row height MUST be the default mode when no explicit height mode is configured.
- The height value MUST be configurable via a property (e.g., `rowHeight`) and via a CSS custom property (`--ch-tabular-grid-row-height`).

**Behavioral Requirements**

| ID | Requirement |
|----|-------------|
| BR-1 | When `rowHeight` is set (or the CSS custom property `--ch-tabular-grid-row-height` is defined), every data row in the body MUST render at exactly that height. |
| BR-2 | Cell content that exceeds the fixed row height MUST be clipped (`overflow: hidden`) or truncated (`text-overflow: ellipsis`). The row MUST NOT grow to accommodate overflowing content. |
| BR-3 | The row height property MUST be updateable at runtime. Changing the row height MUST trigger a re-render of visible rows and recalculation of the virtual scroller's total scroll height. |
| BR-4 | Header rows are NOT governed by the fixed row height. Header row height MUST be `max-content` (auto-sized to fit header text and controls). |
| BR-5 | The fixed row height MUST apply uniformly to all body rows including group header rows, summary rows, and pinned rows, unless those row types have their own explicit height configuration. |

**CSS Subgrid Implications**

- Per FD-01 Section 1.10.1, fixed row height is applied via the CSS custom property on the row element:
  ```css
  .row {
    height: var(--ch-tabular-grid-row-height, 40px);
  }
  ```
- Row height does NOT affect column track sizing. Per FD-01 Section 1.10.4, subgrid only inherits column tracks; each row's height is independent.

**Accessibility**

| Aspect | Requirement |
|--------|-------------|
| WCAG 1.4.4 | When the user zooms text to 200%, clipped content MUST still be accessible via tooltip (F-01.4) or by the cell's `aria-label` containing the full text. |
| Visual | The minimum row height MUST accommodate the default font size at 200% zoom without rendering text unreadable. RECOMMENDED minimum: 32px at default zoom. |

**Chameleon 6 Status**: Supported. The `rowHeight` property set a fixed pixel height for all rows.

**Interactions**: F-01.4 (Tooltips -- truncated content shown via tooltip), F-11 (Virtualization -- fixed height enables O(1) scroll position computation), F-15 (Theming -- density presets define standard row heights), FD-01 (Layout Model -- row height CSS architecture)

---

## 1.6 Row Height: Auto (Content-Based) [P1]

**Description**

Auto row height mode allows each row to size to fit its tallest cell's content. This accommodates multi-line text, wrapped content, and variable-height renderers without clipping. The trade-off is reduced virtualization performance, because the virtual scroller cannot know a row's height until the row is rendered and measured.

**Applies to**: Data Grid, Tree Grid, Pivot Table, Gantt Chart (task list rows)

**Use Cases**

| ID | Use Case |
|----|----------|
| UC-1 | A "Notes" column contains multi-line text that should be fully visible |
| UC-2 | A "Description" column uses word-wrap and the row expands to show all text |
| UC-3 | A custom renderer produces variable-height content (e.g., a list of tags) |

**Conditions of Use**

- Auto height MAY be enabled globally (all rows auto-size) or per-column (specific columns drive auto-height while others clip).
- Auto height MUST NOT be the default mode. Developers MUST explicitly opt in.

**Behavioral Requirements**

| ID | Requirement |
|----|-------------|
| BR-1 | When auto height is enabled, rows SHALL size to fit their tallest cell content. No explicit height constraint is applied to the row element. |
| BR-2 | Cell content in auto-height rows MUST allow text wrapping. The cell MUST NOT enforce `overflow: hidden; text-overflow: ellipsis` when auto height is active. |
| BR-3 | When a cell's content changes (edit, data update), the row height MUST reflow to accommodate the new content size. |
| BR-4 | The grid MUST support a `minRowHeight` constraint that prevents rows from collapsing below a minimum height, even in auto mode. |
| BR-5 | The grid MUST support a `maxRowHeight` constraint that caps the row height. Content exceeding this cap is clipped with overflow handling. |
| BR-6 | Per-column auto-height SHALL be configured via an `autoHeight` property on the column definition. When any column in a row has `autoHeight: true`, the row's height is determined by the tallest auto-height cell (other columns clip normally). |

**CSS Subgrid Implications**

- Per FD-01 Section 1.10.2, auto height uses the CSS default behavior when no explicit height is set on the row element. The row's height is determined by `max-content` of its cells.
- In subgrid rows, each row is an independent grid formatting context. The tallest cell within a row determines the row height -- this is standard CSS grid behavior and requires no JavaScript measurement for the layout itself.
- However, the **virtual scroller** needs height information. Strategies:
  - **Estimate-then-measure**: render with an estimated height, measure after paint via `ResizeObserver` or `getBoundingClientRect`, update spacers.
  - **Pre-measure off-screen**: render rows in a hidden container, measure, cache, then render in viewport.
  - **Hybrid**: use estimated height for initial scroll, cache measured heights as rows scroll into view.

**Accessibility**

| Aspect | Requirement |
|--------|-------------|
| Visual | Auto-height rows improve readability by showing complete content. This is the RECOMMENDED mode for grids where cell content varies significantly in length. |
| WCAG 1.4.4 | Auto-height rows inherently handle text zoom: as text size increases, the row grows to accommodate it. |

**Chameleon 6 Status**: Not supported. All rows used fixed height.

**Interactions**: F-01.1 (Renderers -- renderer output determines auto-height), F-01.5 (Fixed Row Height -- mutually exclusive modes per row), F-11 (Virtualization -- auto height requires estimate-then-measure), FD-01 (Layout Model -- CSS auto sizing)

---

## 1.7 Row Height: Variable (Per-Row Callback) [P1]

**Description**

Variable row height mode allows each row to have an explicitly different height, determined by a developer-provided callback function. Unlike auto height (which measures rendered content), variable height uses pre-known values from the data model or business logic, enabling the virtual scroller to compute scroll positions without rendering.

**Applies to**: Data Grid, Tree Grid, Pivot Table, Gantt Chart (task list rows)

**Use Cases**

| ID | Use Case |
|----|----------|
| UC-1 | A grid mixing regular data rows (40px) and section header rows (60px) |
| UC-2 | Rows with thumbnail images use 80px; rows without use 40px |
| UC-3 | A Gantt task list where summary tasks are taller than subtasks |

**Conditions of Use**

- Variable row height is configured via a callback function (e.g., `getRowHeight`) on the grid.
- The callback receives row data and row index and returns a pixel height.
- Variable height and auto height MUST NOT be combined on the same row. Variable height takes precedence if both are somehow configured.

**Behavioral Requirements**

| ID | Requirement |
|----|-------------|
| BR-1 | The grid SHALL accept a `getRowHeight` callback with signature `(rowData, rowIndex) => number`. The returned number is the row height in pixels. |
| BR-2 | The callback SHALL be invoked once per row during initial render and whenever the data model changes. The grid MUST cache the results to avoid redundant invocations during scroll. |
| BR-3 | The virtual scroller MUST maintain a cumulative height index (prefix sum array) to compute scroll positions in O(log n) time via binary search, rather than iterating all rows. |
| BR-4 | When row data changes (edit, sort, filter), the grid MUST re-invoke the callback for affected rows and update the cumulative height index. |
| BR-5 | Cell content that exceeds the variable row height MUST be clipped. The row MUST render at exactly the height returned by the callback. |

**CSS Subgrid Implications**

- Per FD-01 Section 1.10.3, variable row heights are applied via per-row inline styles:
  ```css
  .row {
    height: var(--row-height);  /* Set per-row via inline style */
  }
  ```
- The JavaScript layer sets `--row-height` on each row element based on the callback result.

**Accessibility**

| Aspect | Requirement |
|--------|-------------|
| Visual | Variable heights MUST NOT cause jarring visual jumps during scroll. The virtual scroller MUST use the cached height array for smooth scroll position calculation. |
| WCAG 1.4.4 | Clipped content due to fixed per-row height MUST be accessible via tooltip (F-01.4) or `aria-label`. |

**Chameleon 6 Status**: Not directly supported. Limited to fixed row height.

**Interactions**: F-01.5 (Fixed Row Height -- mutually exclusive), F-01.6 (Auto Row Height -- mutually exclusive), F-11 (Virtualization -- cumulative height index for scroll computation), FD-01 (Layout Model -- per-row CSS custom property)

---

## 1.8 Multi-Level Column Headers (Column Groups) [P0]

**Description**

Multi-level column headers organize columns into a visual and semantic hierarchy where parent header cells span multiple child columns. This provides users with visual grouping (e.g., "Address" spanning "Street", "City", "Zip") and conveys structural relationships between columns to assistive technology.

**Applies to**: Data Grid, Tree Grid, Pivot Table (extends with dimension headers), Gantt Chart (task list)

**Use Cases**

| ID | Use Case |
|----|----------|
| UC-1 | An "Address" group header spans "Street", "City", "State", "Zip" columns |
| UC-2 | A "Q1 2026" header spans "January", "February", "March" subcolumns in a financial report |
| UC-3 | A Pivot Table has nested column dimensions: Year > Quarter > Month |
| UC-4 | Three levels of headers for a complex data model: "Personal" > "Contact" > "Email", "Phone" |

**Conditions of Use**

- Multi-level headers are configured via `TabularGridColumnsMultiLevelModel` (an array of arrays, where each inner array represents one header level).
- The grid auto-detects single-level vs. multi-level models using the existing type discriminator.
- Each column header item MAY specify `colSpan`, `colStart`, and `rowSpan` to control its position in the header grid.

**Behavioral Requirements**

| ID | Requirement |
|----|-------------|
| BR-1 | The grid MUST render one header row per level in the `TabularGridColumnsMultiLevelModel`. |
| BR-2 | Parent header cells MUST span their child columns using the `colSpan` property, rendered as `grid-column: span N` in CSS. |
| BR-3 | Header cells that span multiple header levels MUST use the `rowSpan` property, rendered as `grid-row: span N` in CSS. |
| BR-4 | All header rows MUST use `grid-template-columns: subgrid` to inherit column tracks from the host, ensuring header cells align with data cells below (per LC-03). |
| BR-5 | Clicking a parent (group) header MUST NOT trigger sorting. Only leaf-level column headers that map to data fields SHALL be sortable. |
| BR-6 | Column resize on a parent header SHOULD resize its child columns proportionally, or MAY be disabled on parent headers (configurable). |
| BR-7 | When all child columns of a group are hidden, the parent header MUST also be hidden (track set to 0px). |

**Variant-Specific Behavior**

| Variant | Deviation |
|---------|-----------|
| Pivot Table | Column dimensions form a hierarchy that maps directly to multi-level headers. When the pivot configuration changes, the entire header structure is rebuilt. Column headers in a Pivot Table are generated dynamically from dimension values, not statically defined. Each data cell MUST be explicitly associated with all contributing column headers via `headers` or `aria-labelledby` (per VR-07). |
| Tree Grid | Multi-level headers apply identically to Data Grid. No deviation. |
| Gantt Chart | Multi-level headers apply to the task list region only. The timeline header has its own time-scale-based header structure (see VS-01). |

**CSS Subgrid Implications**

- Per FD-01 Section 1.5, header rows use `subgrid` for column alignment:
  ```css
  .header-rowgroup {
    display: grid;
    grid-template-columns: subgrid;
    grid-column: 1 / -1;
  }
  ```
- Column header cells use CSS custom properties for explicit placement:
  ```css
  ch-tabular-grid-column {
    grid-column: var(--ch-tabular-grid-column__column-start, auto)
                 / span var(--ch-tabular-grid-column__column-span, 1);
    grid-row: auto / span var(--ch-tabular-grid-column__row-span, 1);
  }
  ```
- Per FD-01 Section 1.5.2, `.column-row` wrappers MAY use `display: contents` as they are visual grouping aids, not semantic rows.

**Keyboard Interaction**

| Key | Context | Action |
|-----|---------|--------|
| Arrow Left/Right | Focus on a header cell | Move to adjacent header cell at the same level |
| Arrow Down | Focus on a parent header | Move focus to the first child header cell in the next level |
| Arrow Up | Focus on a child header | Move focus to the parent header cell in the level above |
| Enter | Focus on a leaf header | Trigger sort cycling (if sortable) |
| Enter | Focus on a parent header | No action (parent headers are not sortable) |

**Accessibility**

| Aspect | Requirement |
|--------|-------------|
| ARIA | Parent header cells MUST use `role="columnheader"`. They MUST declare the span via `aria-colspan` matching the `colSpan` value. Multi-row spanning headers MUST declare `aria-rowspan`. |
| Screen Reader | When navigating to a data cell, the screen reader MUST announce all ancestor column headers from the topmost level to the leaf level. For example: "Address, City, San Francisco". This requires proper DOM structure or `headers` attribute association. |
| WCAG 1.3.1 | The hierarchical relationship between parent and child headers MUST be programmatically determinable. This is achieved through the DOM nesting order (headers in earlier rows span headers in later rows) combined with `aria-colspan`/`aria-rowspan` attributes. |
| Visual | Parent headers SHOULD be visually distinguishable from leaf headers (e.g., different background shade, font weight, or a bottom border separating levels). |

**Chameleon 6 Status**: Supported. Column groups rendered via nested column definitions with `headerGroup` property.

**Chameleon 7 Status**: Supported. `TabularGridColumnsMultiLevelModel` (array of arrays) with `colSpan`, `colStart`, `rowSpan` on `TabularGridColumnItemModel`.

**Interactions**: F-02 (Sorting -- only leaf headers trigger sort), F-09 (Column Management -- resize/reorder/hide interact with groups), F-14 (Keyboard Navigation -- header navigation across levels), FD-01 (Layout Model -- subgrid header architecture, Section 1.5)

---

## 1.9 Row Spanning [P1]

**Description**

Row spanning allows a cell to extend vertically across multiple rows, visually merging the cell area across those rows. This is used when adjacent rows share a value in one column (e.g., a "Category" cell spanning all rows with the same category).

**Applies to**: Data Grid, Tree Grid (limited), Pivot Table (row dimension headers), Gantt Chart (task list, limited)

**Use Cases**

| ID | Use Case |
|----|----------|
| UC-1 | A "Department" column where the department name spans all employees in that department |
| UC-2 | A Pivot Table where a row dimension header ("North America") spans all sub-rows under that dimension |
| UC-3 | A report grid where a "Section" column merges cells for rows belonging to the same section |

**Conditions of Use**

- Row spanning is configured via a `rowSpan` property on the column definition: either a static number or a callback `(rowData, rowIndex) => number`.
- Row spanning interacts with virtualization and MUST be carefully managed to avoid rendering artifacts.

**Behavioral Requirements**

| ID | Requirement |
|----|-------------|
| BR-1 | The grid SHALL support a `rowSpan` property on column definitions, accepting a number or a callback `(rowData, rowIndex, columnDef) => number`. A value of 1 (default) means no spanning. |
| BR-2 | A cell with `rowSpan > 1` SHALL visually occupy the cell area of `rowSpan` consecutive rows in that column. The spanned-over cells in subsequent rows MUST NOT render content in that column. |
| BR-3 | Row-spanning cells MUST maintain alignment with their column track via subgrid. The spanning is achieved via `grid-row: span N` on the cell element within its row's grid context, OR via absolute positioning within the column track. |
| BR-4 | When sorting or filtering changes the row order, row spans MUST be recalculated. A row span MUST NOT persist across a reorder boundary if the logical grouping no longer applies. |
| BR-5 | Selection of a row-spanning cell MUST select the cell itself, not all spanned rows. Clicking the spanning cell area that overlaps row N SHOULD select the spanning cell. |
| BR-6 | Row-spanning cells MUST NOT span across group boundaries. If rows are grouped, a span MUST terminate at the group boundary even if the callback returns a larger span value. |

**Variant-Specific Behavior**

| Variant | Deviation |
|---------|-----------|
| Pivot Table | Row dimension headers use row spanning extensively. The multi-level row header structure naturally produces spanning cells (e.g., "North America" spans all country rows under it). Row spans in Pivot Table headers are part of the generated structure, not user-configured callbacks. |
| Tree Grid | Row spanning is NOT RECOMMENDED in Tree Grids because the hierarchical expand/collapse model makes vertical spanning semantically ambiguous. If supported, spans MUST be limited to visible (expanded) rows. |

**CSS Subgrid Implications**

- Row spanning within subgrid is challenging because each row is a separate grid formatting context. A cell in row 1 cannot directly extend into row 2's grid context.
- **Implementation strategy**: The spanning cell is rendered in the first row and uses absolute positioning to extend visually over subsequent rows. Alternatively, the spanning cell is promoted to the body rowgroup level and positioned with explicit `grid-row` and `grid-column` placement.
- The promoted-cell approach breaks the row > cell DOM nesting but preserves visual alignment. The ARIA structure MUST maintain correct cell-to-row association via `aria-rowindex` and explicit `headers` attributes regardless of the DOM strategy.

**Editability Interaction**

- A row-spanning cell that is editable enters Edit Mode as a single cell. The editor covers the full spanning area.
- Cells that are hidden behind the spanning cell (the "spanned-over" positions) MUST NOT be editable or focusable.

**Keyboard Interaction**

| Key | Context | Action |
|-----|---------|--------|
| Arrow Down | Focus on a row-spanning cell | Move to the cell in the same column in the first row AFTER the span ends |
| Arrow Up | Focus on the cell below a span | Move to the row-spanning cell above |

**Accessibility**

| Aspect | Requirement |
|--------|-------------|
| ARIA | The spanning cell MUST declare `aria-rowspan` with the number of rows it spans. The cell MUST use `aria-rowindex` set to the index of the first row in the span. |
| Screen Reader | When navigating into the column containing a spanning cell, the screen reader MUST announce the spanning cell once, regardless of which row within the span the user navigated from. It SHOULD announce "spans N rows" as part of the cell description. |
| WCAG 1.3.1 | The spanning relationship MUST be programmatically determinable. If the spanning cell is promoted outside its parent row element, explicit `headers` attributes MUST associate it with the correct rows. |

**Chameleon 6 Status**: Not supported.

**Chameleon 7 Status**: The `rowSpan` property is defined on `TabularGridColumnItemModel`.

**Interactions**: F-01.10 (Column Spanning -- may combine with row spanning for merged regions), F-08 (Selection -- spanning cell selection semantics), F-11 (Virtualization -- spanning cells complicate row virtualization; a spanning cell must remain in the DOM if any of its spanned rows is visible), F-14 (Keyboard Navigation -- skip spanned-over cells), FD-01 (Layout Model -- subgrid spanning strategies)

---

## 1.10 Column Spanning [P1]

**Description**

Column spanning allows a cell to extend horizontally across multiple columns, occupying the combined width of those columns. This is used for full-width content, merged cells, or summary rows that need a single cell to span the entire grid width.

**Applies to**: Data Grid, Tree Grid, Pivot Table, Gantt Chart (task list)

**Use Cases**

| ID | Use Case |
|----|----------|
| UC-1 | A "title" row that spans all columns to display a full-width section header |
| UC-2 | A group header row where the group label spans all columns |
| UC-3 | A cell displaying a long description that merges across the "Name" and "Description" columns |
| UC-4 | A summary row footer where a "Total" label spans the first three columns, followed by aggregated values |

**Conditions of Use**

- Column spanning is configured via a `colSpan` property on the column definition or on a per-cell basis via callback.
- Column spanning interacts with column hiding and column reorder.

**Behavioral Requirements**

| ID | Requirement |
|----|-------------|
| BR-1 | The grid SHALL support a `colSpan` property on column definitions, accepting a number or a callback `(rowData, rowIndex, columnDef) => number`. A value of 1 (default) means no spanning. |
| BR-2 | A cell with `colSpan > 1` SHALL visually occupy the combined width of `colSpan` consecutive column tracks. Cells in the spanned-over columns for that row MUST NOT render. |
| BR-3 | Column spanning MUST be implemented via `grid-column: span N` within the row's subgrid context. This is straightforward because the row inherits the host's column tracks via subgrid. |
| BR-4 | When a column within a span is hidden (track set to 0px per LC-05), the spanning cell MUST still span the hidden track. The visible width adjusts automatically as the 0px track contributes no width. The `colSpan` value MUST NOT change. |
| BR-5 | When columns are reordered (per LC-06, via CSS `grid-column` placement), column spanning MUST respect the visual order. If the spanned columns become non-contiguous due to reorder, the grid MUST either: (a) break the span and render individual cells, or (b) prevent reordering that would break an active span. |
| BR-6 | Column-spanning cells MUST NOT extend beyond the last column. If `colSpan` exceeds the remaining columns, the span MUST be clamped to the available columns. |

**Variant-Specific Behavior**

| Variant | Deviation |
|---------|-----------|
| Pivot Table | Column spanning is used in row header cells that span multiple columns of the row header area. The Pivot Table's dynamic column structure means spans are recalculated when dimensions change. |
| Tree Grid | Column spanning on group rows or full-width rows works identically to Data Grid. |

**CSS Subgrid Implications**

- Column spanning within subgrid rows is native CSS:
  ```css
  .cell--spanning {
    grid-column: var(--ch-tabular-grid-column__column-start)
                 / span var(--ch-tabular-grid-column__column-span, 1);
  }
  ```
- This is the same custom property pattern used for header cells (FD-01 Section 1.4.4), providing consistency between header and body column spanning.

**Editability Interaction**

- A column-spanning cell that is editable enters Edit Mode as a single cell. The editor occupies the full spanning width.
- Cells that are hidden behind the spanning cell (the "spanned-over" columns for that row) MUST NOT be editable or focusable.

**Keyboard Interaction**

| Key | Context | Action |
|-----|---------|--------|
| Arrow Right | Focus on a column-spanning cell | Move to the cell in the first column AFTER the span ends |
| Arrow Left | Focus on the cell after a span | Move to the column-spanning cell to the left |

**Accessibility**

| Aspect | Requirement |
|--------|-------------|
| ARIA | The spanning cell MUST declare `aria-colspan` with the number of columns it spans. The cell MUST use `aria-colindex` set to the index of the first column in the span. |
| Screen Reader | When the screen reader encounters a column-spanning cell, it MUST announce the associated column headers for all spanned columns, or announce "spans N columns" as part of the cell description. |
| WCAG 1.3.1 | The spanning relationship MUST be programmatically determinable via `aria-colspan`. |

**Chameleon 6 Status**: Supported on column header cells. Not supported on data cells.

**Chameleon 7 Status**: The `colSpan` property is defined on `TabularGridColumnItemModel`. Currently used for header cells; extending to data cells is specified here.

**Interactions**: F-01.9 (Row Spanning -- may combine for merged regions), F-08 (Selection -- spanning cell selection), F-09 (Column Management -- hide/reorder interactions), F-14 (Keyboard Navigation -- skip spanned-over cells), FD-01 (Layout Model -- column spanning via subgrid CSS)

---

## 1.11 Conditional Styling (Cell/Row Class Rules) [P0]

**Description**

Conditional styling dynamically applies CSS classes, CSS Parts, or inline styles to cells and rows based on data values, row state, or application logic. This is the primary mechanism for visual data communication: highlighting negative numbers, coloring status indicators, flagging overdue items, and distinguishing row types.

**Applies to**: Data Grid, Tree Grid, Pivot Table, Gantt Chart (task list cells and rows)

**Use Cases**

| ID | Use Case |
|----|----------|
| UC-1 | Red text and background tint on cells with negative financial values |
| UC-2 | A "Status" column where "Active" rows get a green indicator and "Inactive" rows get a gray indicator |
| UC-3 | Strikethrough text on rows marked for deletion |
| UC-4 | Bold font on summary/total rows |
| UC-5 | A warning icon and yellow background on cells that fail soft validation |
| UC-6 | Alternate row shading for readability (zebra striping) |

**Conditions of Use**

- Conditional styling MUST be applicable at both the cell level and the row level.
- The primary mechanism in Chameleon 7 is via the `parts` property on column/cell models, which exposes CSS Parts for external styling via `::part()` selectors.
- A callback-based approach MUST also be supported for dynamic conditions.

**Behavioral Requirements**

| ID | Requirement |
|----|-------------|
| BR-1 | The grid SHALL support a `parts` property on column definitions that adds CSS Part names to cells in that column. Multiple part names MUST be space-separated. |
| BR-2 | The grid SHALL support a `cellParts` callback on column definitions with signature `(value, rowData, columnDef, rowIndex, colIndex) => string | null` that returns space-separated CSS Part names or null. |
| BR-3 | The grid SHALL support a `rowParts` callback at the grid level with signature `(rowData, rowIndex) => string | null` that returns space-separated CSS Part names applied to the row element. |
| BR-4 | CSS Part names applied via conditional styling MUST be exposed on the rendered DOM elements via the `part` attribute, allowing consumers to style them with `::part(partName)` selectors. |
| BR-5 | Conditional styles MUST be re-evaluated whenever cell data changes (edit commit, data refresh, sort, filter). The grid MUST update the `part` attribute accordingly. |
| BR-6 | The grid SHALL support a `cellClass` callback returning CSS class names as an alternative to CSS Parts. Both mechanisms MAY be used simultaneously on the same cell. |
| BR-7 | The grid SHALL support a `rowClass` callback returning CSS class names applied to the row element. |
| BR-8 | Conditional styling MUST NOT interfere with selection styling, focus styling, or edit mode styling. Grid-managed visual states (selection highlight, focus ring, edit mode indicator) MUST take precedence over or compose correctly with conditional styles via CSS specificity or layering. |

**Variant-Specific Behavior**

| Variant | Deviation |
|---------|-----------|
| Pivot Table | Conditional styling on value cells typically highlights aggregation results (e.g., red for below-target totals). The `rowData` in the callback provides dimension values for the intersection. |
| Tree Grid | Row-level conditional styling MAY vary by tree level (e.g., parent rows bold, leaf rows normal). The `rowData` includes tree metadata (`level`, `isLeaf`, `isExpanded`). |

**Accessibility**

| Aspect | Requirement |
|--------|-------------|
| WCAG 1.4.1 | Conditional styling MUST NOT use color as the sole means of conveying information. Any color-based indication MUST be supplemented with a non-color indicator: text, icon, border style, or pattern. For example, a "negative value" style MUST include a minus sign or "()" notation, not just red color. |
| WCAG 1.4.3 | Text within conditionally styled cells MUST maintain sufficient contrast against the conditional background color (4.5:1 for normal text, 3:1 for large text). |
| WCAG 1.4.11 | Non-text contrast: any visual indicator applied via conditional styling (e.g., a colored left border on a flagged row) MUST have at least 3:1 contrast against adjacent colors. |
| Screen Reader | Conditional styles that convey semantic meaning (e.g., "overdue", "error", "warning") SHOULD be supplemented with programmatic information. Options: (a) include descriptive text in the cell content, (b) set `aria-label` to include the condition (e.g., "Revenue: $-500, negative"), or (c) use `aria-describedby` pointing to a description. |

**Chameleon 6 Status**: Supported via the `parts` property on column definitions, enabling `::part()` styling.

**Chameleon 7 Status**: The `parts` property is defined on `TabularGridColumnItemModel`. Callback-based parts and row-level parts are specified here as extensions.

**Interactions**: F-01.1 (Renderers -- conditional styling composes with custom renderers), F-08 (Selection -- conditional styles compose with selection highlight), F-15 (Theming -- CSS Parts architecture, density, striping), F-18 (Validation -- validation error styling)

---

## 1.12 Empty-State Overlay [P0]

**Description**

The empty-state overlay displays custom content when the grid has zero data rows to show. This provides user guidance ("No data available", "No results match your filter", "Add your first record") instead of a blank grid body, which can be confusing.

**Applies to**: Data Grid, Tree Grid, Pivot Table, Gantt Chart

**Use Cases**

| ID | Use Case |
|----|----------|
| UC-1 | A grid with no data source connected shows "No data available" |
| UC-2 | After filtering produces zero results, the grid shows "No results match your filter. Try broadening your search." |
| UC-3 | An empty task list shows an illustration and a "Create your first task" call-to-action button |
| UC-4 | A server error prevented data loading; the empty state shows "Unable to load data. Retry." |

**Conditions of Use**

- The empty-state overlay MUST appear automatically when the grid's data source contains zero rows AND the grid is not in a loading state.
- The empty-state content MUST be customizable. The grid provides a default message and accepts a developer-defined template/component.

**Behavioral Requirements**

| ID | Requirement |
|----|-------------|
| BR-1 | The grid SHALL display the empty-state overlay when the visible row count is zero AND `loading` is `false`. |
| BR-2 | The empty-state overlay MUST be rendered within the body region, replacing the row area. It MUST span the full width of the grid body. |
| BR-3 | The grid SHALL provide a default empty-state message: "No data available." This message MUST be customizable via a property (e.g., `emptyStateText`). |
| BR-4 | The grid SHALL accept a custom empty-state template or component via a slot or property (e.g., `emptyStateComponent`), allowing developers to provide illustrations, buttons, and rich content. |
| BR-5 | When data is subsequently added (rows arrive), the empty-state overlay MUST be removed and replaced with the data rows. |
| BR-6 | The empty-state overlay MUST remain visible when the user has applied filters that produce zero results. The message SHOULD be contextual: "No results match your filter" rather than generic "No data available." |
| BR-7 | The empty-state overlay MUST NOT appear during initial loading. The loading state (F-01.13) takes precedence. Transition: loading -> empty-state happens when loading completes with zero rows. |

**Accessibility**

| Aspect | Requirement |
|--------|-------------|
| ARIA | The empty-state container MUST use `role="status"` so that assistive technology recognizes it as a live region. If the content changes (e.g., from generic to filter-specific message), the change MUST be announced. |
| Screen Reader | The screen reader MUST announce the empty-state text when the grid transitions to the empty state. SR: "No data available." or "No results match your filter." |
| WCAG 4.1.3 | The empty-state message is a status message that MUST be programmatically determined without receiving focus. `role="status"` with `aria-live="polite"` satisfies this. |
| Visual | If the empty-state includes interactive elements (e.g., a "Retry" button), those elements MUST be keyboard-focusable and MUST have visible focus indicators. |

**Chameleon 6 Status**: Not natively supported. Developers handled empty states externally.

**Interactions**: F-01.13 (Loading Skeleton -- loading takes precedence over empty state), F-03 (Filtering -- zero-result filter produces contextual empty state), F-20 (Server-Side Operations -- server error empty state)

---

## 1.13 Loading Skeleton [P0]

**Description**

The loading skeleton provides a visual placeholder while data is being fetched asynchronously. It communicates to the user that data is on its way, reducing perceived latency and preventing the user from interpreting a blank grid as an empty data set. Loading indicators may take the form of a spinner overlay, animated skeleton rows (gray placeholders mimicking row shapes), or a progress bar.

**Applies to**: Data Grid, Tree Grid, Pivot Table, Gantt Chart

**Use Cases**

| ID | Use Case |
|----|----------|
| UC-1 | Initial page load: the grid shows skeleton rows while the API call is in flight |
| UC-2 | Filter change: the grid shows a loading overlay while server-side filtering executes |
| UC-3 | Pivot table reconfiguration: a spinner displays while the pivot engine recalculates |
| UC-4 | Infinite scroll: a loading indicator appears at the bottom while additional rows are fetched |

**Conditions of Use**

- Loading state is controlled by a `loading` property on the grid.
- The loading indicator MUST be customizable. The grid provides a default loading component and accepts a developer-defined template.

**Behavioral Requirements**

| ID | Requirement |
|----|-------------|
| BR-1 | When `loading` is set to `true`, the grid SHALL display the loading indicator. When set to `false`, the loading indicator SHALL be removed. |
| BR-2 | The grid SHALL provide a default loading indicator. Skeleton rows (animated gray placeholders mimicking the row/cell structure) are RECOMMENDED as the default over a plain spinner, because they convey the structure of the expected data. |
| BR-3 | The grid SHALL accept a custom loading component via a slot or property (e.g., `loadingComponent`), allowing developers to provide branded spinners, progress bars, or skeleton designs. |
| BR-4 | When `loading` is `true` and the grid already has data (e.g., refreshing data), the existing rows SHOULD remain visible with the loading indicator overlaid or positioned adjacent (e.g., a thin progress bar at the top), rather than replacing the rows with skeleton placeholders. This prevents content flash. |
| BR-5 | When `loading` transitions from `true` to `false` with zero rows, the grid MUST transition to the empty-state overlay (F-01.12). |
| BR-6 | The loading indicator MUST be shown programmatically. The grid SHALL expose methods `showLoading()` and `hideLoading()` in addition to the declarative `loading` property. |
| BR-7 | During loading, all interactive grid operations (sorting, filtering, editing, selection) SHOULD be suppressed or deferred. The grid SHOULD visually indicate that interaction is temporarily unavailable (e.g., reduced opacity on header controls). |

**Accessibility**

| Aspect | Requirement |
|--------|-------------|
| ARIA | The grid container MUST set `aria-busy="true"` while `loading` is `true`. When loading completes, `aria-busy` MUST be set to `"false"`. |
| Screen Reader | On loading start: announce "Loading data..." via a `role="status"` live region. On loading complete: announce "Data loaded. N rows." via the same live region. On loading error: announce the error via `role="alert"`. |
| WCAG 4.1.3 | Loading and completion announcements are status messages that MUST reach assistive technology without receiving focus. |
| Visual | Skeleton placeholder elements MUST use `aria-hidden="true"` so that screen readers do not perceive or attempt to read the placeholder DOM structure. |

**Chameleon 6 Status**: Not natively supported. Developers showed external loading indicators.

**Interactions**: F-01.12 (Empty-State Overlay -- loading -> empty transition), F-11 (Virtualization -- loading state during lazy load), F-20 (Server-Side Operations -- server requests trigger loading state)

---

## 1.14 Flashing Cells [P2]

**Description**

Flashing cells temporarily highlight a cell when its value changes, providing a visual cue for real-time data feeds (stock tickers, monitoring dashboards, live scoreboards). The flash is a brief CSS animation or transition that draws the user's attention to updated values, then fades back to the cell's normal styling.

**Applies to**: Data Grid, Tree Grid, Pivot Table (value cells), Gantt Chart (task list cells)

**Use Cases**

| ID | Use Case |
|----|----------|
| UC-1 | A stock price column flashes green when the price increases and red when it decreases |
| UC-2 | A monitoring dashboard grid flashes cells when sensor values change |
| UC-3 | A live scoreboard flashes the score cell when a team scores |

**Conditions of Use**

- Cell flashing MUST be opt-in, configured per column via an `enableCellChangeFlash` property.
- Flashing MUST only occur on data-driven value changes (API update, real-time push), NOT on user edits (edit commits). User edits are intentional and the user already knows the value changed.
- Flashing MUST be suppressible globally (e.g., during bulk data loads).

**Behavioral Requirements**

| ID | Requirement |
|----|-------------|
| BR-1 | When `enableCellChangeFlash` is `true` on a column definition AND the cell value changes due to an external data update, the grid SHALL apply a temporary visual highlight (flash) to the cell. |
| BR-2 | The flash SHALL be implemented via CSS transitions/animations. The grid SHALL add a CSS class (e.g., `cell--flash-up`, `cell--flash-down`, `cell--flash-neutral`) to the cell element, then remove it after the animation completes. |
| BR-3 | The flash duration SHALL be configurable via a property (default: 500ms). The flash MUST auto-remove after the duration elapses. |
| BR-4 | The grid SHALL support directional flashing: a different flash style for value increase vs. decrease. The default flash classes SHOULD be `cell--flash-up` (for increase) and `cell--flash-down` (for decrease). A non-directional `cell--flash-neutral` class is applied when direction cannot be determined. |
| BR-5 | If a cell's value changes again before the previous flash completes, the flash SHALL restart (reset the animation). |
| BR-6 | The grid SHALL support programmatic flashing via an API method: `flashCells({ rowIds, columnIds, flashDuration })`. |
| BR-7 | Flashing MUST NOT trigger during user edits (edit commit via FD-03). It MUST only trigger on external data model changes. |
| BR-8 | The grid SHALL support a global `suppressCellFlash` property that disables all flashing (useful during bulk data loads). |

**Accessibility**

| Aspect | Requirement |
|--------|-------------|
| WCAG 1.4.1 | The flash MUST NOT use color as the only indicator. The flash animation SHOULD include a brief background-color transition combined with a visible border or outline change. |
| WCAG 2.3.1 | The flash MUST NOT flash more than three times per second (to prevent seizure risk). For high-frequency updates, flashing MUST be throttled. |
| Screen Reader | Cell flashes MUST NOT trigger individual screen reader announcements. For high-frequency updates, a summary announcement SHOULD be batched: "N cells updated in column [column name]" (throttled to one announcement per 5-10 seconds). |
| WCAG 2.2.2 | If flashing is persistent or repetitive, the user MUST be able to pause, stop, or hide the flashing. A preference or setting to disable flashing globally satisfies this. |
| Visual | A `prefers-reduced-motion` media query SHOULD suppress or minimize the flash animation for users who prefer reduced motion. |

**Chameleon 6 Status**: Not supported.

**Interactions**: F-01.1 (Renderers -- flash class applied alongside custom renderer output), F-01.11 (Conditional Styling -- flash classes compose with conditional CSS Parts), F-07 (Cell Editing -- flash suppressed during user edits), F-20 (Server-Side Operations -- real-time data updates trigger flashing)

---

## 1.15 Column Auto-Generation from Data Shape [P2]

**Description**

Column auto-generation automatically creates column definitions from the keys or properties of the first data row, without requiring the developer to manually specify each column. This reduces boilerplate for quick prototyping, data exploration interfaces, and scenarios where the data schema is not known at compile time.

**Applies to**: Data Grid, Tree Grid, Gantt Chart (task list)

**Use Cases**

| ID | Use Case |
|----|----------|
| UC-1 | A developer passes a JSON array to the grid without defining columns; the grid creates one column per object key |
| UC-2 | A data exploration tool loads arbitrary CSV files; columns are generated from the CSV headers |
| UC-3 | An admin interface displays any database table selected from a dropdown; column definitions are unknown at build time |

**Conditions of Use**

- Auto-generation is activated when the grid receives data but has no explicit column definitions.
- Auto-generation MUST be overridable: if column definitions are provided, they take precedence.

**Behavioral Requirements**

| ID | Requirement |
|----|-------------|
| BR-1 | When the grid is provided with row data but no `columns` model, it SHALL auto-generate column definitions by inspecting the keys of the first data row. |
| BR-2 | Each auto-generated column SHALL use the key name as both the column `id` and the `caption` (header text). The caption MAY be formatted: `camelCase` keys are converted to "Title Case" (e.g., `firstName` -> `"First Name"`). |
| BR-3 | The grid SHALL attempt to infer `dataType` from the first data row's values: `typeof value === "number"` -> `"number"`, `typeof value === "boolean"` -> `"boolean"`, `value instanceof Date` -> `"datetime"`, otherwise `"string"`. |
| BR-4 | Auto-generated columns SHALL be fully functional: sortable, filterable, resizable, and hideable by default. |
| BR-5 | When new data arrives with different keys (e.g., a different table is loaded), the grid MUST regenerate the column definitions to match the new data shape. |
| BR-6 | The grid SHALL provide an `autoColumnsCallback` hook that receives the auto-generated column array and allows the developer to modify it (add, remove, reorder, customize) before the grid renders. |
| BR-7 | Nested object properties MUST NOT be auto-generated as columns. Only top-level keys produce columns. Nested data requires explicit column definitions with `valueGetter` paths. |

**Variant-Specific Behavior**

| Variant | Deviation |
|---------|-----------|
| Pivot Table | Auto-generation does NOT apply to Pivot Tables. Pivot Tables require explicit dimension and value field configuration. |
| Tree Grid | Auto-generation creates flat columns. The developer MUST still configure the tree hierarchy (parent-child field mapping) separately. |

**Accessibility**

| Aspect | Requirement |
|--------|-------------|
| ARIA | Auto-generated columns MUST produce the same ARIA structure as manually defined columns: each header cell has `role="columnheader"` with an accessible name derived from the caption. |
| Screen Reader | No deviation from standard column behavior. |

**Chameleon 6 Status**: Not supported.

**Interactions**: F-01.2 (Data Types -- auto-generation infers data types), F-09 (Column Management -- auto-generated columns support resize, reorder, hide), F-22 (Developer Experience -- reduces boilerplate for rapid development)

---

## Summary: Behavioral Requirements Cross-Reference

| Feature | BR Count | Priority |
|---------|----------|----------|
| 1.1 Custom Cell Renderers | 7 | P0 |
| 1.2 Cell Data Types | 7 | P0 |
| 1.3 Value Formatters | 8 | P0 |
| 1.4 Cell Tooltips | 8 | P1 |
| 1.5 Row Height: Fixed | 5 | P0 |
| 1.6 Row Height: Auto | 6 | P1 |
| 1.7 Row Height: Variable | 5 | P1 |
| 1.8 Multi-Level Column Headers | 7 | P0 |
| 1.9 Row Spanning | 6 | P1 |
| 1.10 Column Spanning | 6 | P1 |
| 1.11 Conditional Styling | 8 | P0 |
| 1.12 Empty-State Overlay | 7 | P0 |
| 1.13 Loading Skeleton | 7 | P0 |
| 1.14 Flashing Cells | 8 | P2 |
| 1.15 Column Auto-Generation | 7 | P2 |

**Total**: 15 features, 102 behavioral requirements

---

## Cross-Reference Index

| Referenced Document | Sections Referencing It |
|---------------------|------------------------|
| FD-01 (Layout Model) | 1.1, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10 |
| FD-02 (Variant Model) | 1.1, 1.8, 1.9 |
| FD-03 (Editability Model) | 1.1, 1.2, 1.3, 1.9, 1.10 |
| F-02 (Sorting) | 1.2, 1.3, 1.8 |
| F-03 (Filtering) | 1.2, 1.12 |
| F-07 (Cell Editing) | 1.1, 1.3, 1.14 |
| F-08 (Selection) | 1.9, 1.10, 1.11 |
| F-09 (Column Management) | 1.8, 1.10, 1.15 |
| F-11 (Virtualization) | 1.1, 1.5, 1.6, 1.7, 1.9, 1.13 |
| F-12 (Export) | 1.3 |
| F-13 (Internationalization) | 1.3 |
| F-14 (Keyboard Navigation) | 1.1, 1.8, 1.9, 1.10 |
| F-15 (Theming) | 1.1, 1.5, 1.11 |
| F-18 (Validation) | 1.2, 1.4, 1.11 |
| F-20 (Server-Side Operations) | 1.12, 1.13, 1.14 |
| F-22 (Developer Experience) | 1.15 |
| VS-01 (Gantt Chart) | 1.1 |
