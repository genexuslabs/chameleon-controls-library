# F-12: Export & Import

Export and import features allow users to extract grid data into external formats (CSV, Excel, PDF, clipboard) and to receive data from external sources (clipboard paste is covered in F-07). This feature category covers CSV export, Excel (XLSX) export, PDF export, clipboard copy, clipboard copy with headers, print-friendly rendering, and custom export formatting.

All four variants (Data Grid, Tree Grid, Pivot Table, Gantt Chart) support export with variant-specific adaptations for hierarchical data, pivoted layouts, and dual-region content.

> **Foundations**: This feature assumes the layout model defined in [FD-01](../01-foundations/01-layout-model.md) for determining column order and visibility. The data display model in [F-01](./01-data-display-rendering.md) defines raw vs. formatted values -- export operations must choose which representation to emit. The selection model in [F-08](./08-selection.md) determines which rows, cells, or ranges feed into "export selected" workflows.

> **Key coordination principle**: Export MUST respect the current grid state -- column order, visibility, sorting, filtering, and grouping -- unless the developer explicitly requests exporting the full underlying data set. The user sees what they export.

> **Clipboard paste**: Clipboard paste (Ctrl+V) is defined in [F-07: Cell Editing](./07-cell-editing.md), not in this feature category. This document covers only the outbound direction (copy and export).

---

## 12.1 CSV Export [P1]

**Description**: The grid exports its visible data to a comma-separated values (CSV) file. The exported file includes a header row derived from column headers and one data row per visible grid row. The user or developer triggers the export via an API call or a built-in toolbar/context menu action. CSV export produces a standards-compliant RFC 4180 file that can be opened in any spreadsheet application or text editor.

**Applies to**: All variants

**Use Cases**
- UC-1: A business analyst exports a filtered Data Grid of sales records to CSV for import into a third-party reporting tool.
- UC-2: A user exports a Tree Grid of project tasks to CSV, expecting the hierarchy to be conveyed via an indentation column or level indicator since CSV is a flat format.
- UC-3: A developer triggers a programmatic CSV export of selected rows only, attaching the result to an API request for server-side processing.

**Conditions of Use**
- The grid MUST expose a programmatic API method for CSV export (e.g., `exportToCsv(options?: CsvExportOptions)`).
- The grid SHOULD provide a built-in UI affordance (toolbar button or context menu item) to trigger CSV export, configurable by the developer.
- CSV export MUST be available without requiring any third-party library.

**Behavioral Requirements**
- BR-1: The exported CSV file MUST conform to RFC 4180: comma-delimited fields, CRLF line endings, fields containing commas/quotes/newlines enclosed in double quotes, and double quotes escaped by doubling.
- BR-2: The first row of the CSV MUST be a header row containing the display names (visible labels) of all exported columns, in the current column order.
- BR-3: By default, the export MUST include only visible columns in their current display order. Hidden columns (F-09.4) MUST be excluded unless the developer explicitly includes them via `options.includeHiddenColumns: true`.
- BR-4: By default, the export MUST include only visible (non-filtered) rows. The developer MAY override this via `options.allData: true` to export the full unfiltered dataset.
- BR-5: The export MUST respect the current sort order. Exported rows MUST appear in the same order as displayed in the grid.
- BR-6: The developer MUST be able to choose between exporting raw data values or formatted display values via `options.useFormattedValues: boolean`. The default SHOULD be raw values for CSV (per F-01 BR-5).
- BR-7: The export MUST support exporting only the currently selected rows via `options.selectedOnly: true`. The selection state is obtained from F-08.
- BR-8: The grid MUST emit a `beforeExport` event before generating the CSV, allowing the developer to modify options, add custom rows (e.g., a title row or metadata row), or cancel the export. The event payload MUST include the export format (`"csv"`), the resolved column list, and a `cancel()` method.
- BR-9: The grid MUST emit an `afterExport` event after the CSV is generated, containing the export format and a reference to the generated data (Blob or string).
- BR-10: The export MUST handle special characters correctly: Unicode characters MUST be preserved, and the output encoding MUST be UTF-8 with an optional BOM (configurable via `options.includeBom: boolean`, default `true` for Excel compatibility).
- BR-11: For large datasets, the export SHOULD use streaming or chunked generation to avoid blocking the main thread. If the export takes longer than 500ms, the grid SHOULD display a progress indicator.
- BR-12: Group header rows (F-04) MUST be included in the export as distinct rows with the group label in the first column and empty values in data columns, unless `options.excludeGroupHeaders: true`.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | The export MUST include hierarchy information. By default, the first column (or a dedicated "Level" column) MUST contain indentation (repeated spaces or a configurable prefix) or the row's depth level as an integer. The developer MAY configure the hierarchy representation via `options.treeFormat: "indent" \| "level" \| "path"`. |
| Pivot Table | The export MUST export the pivoted view (dimension headers and aggregated values), not the raw source data (per F-05). Multi-level column headers MUST be flattened into composite labels (e.g., "2024 > Q1 > Revenue") since CSV supports only a single header row. |
| Gantt Chart | The export MUST export the task list data (task name, dates, duration, dependencies, etc.). Timeline bar visual information (position, color) is NOT included in CSV. A "Dependencies" column SHOULD serialize dependency relationships as text (e.g., "Task-3 FS, Task-5 SS"). |

**CSS Subgrid Implications**

None. CSV export operates on the data model, not the rendered DOM. Column order is derived from the logical column order (which matches the subgrid track order).

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| (None by default) | CSV export is typically triggered via API or toolbar button, not a keyboard shortcut. The developer MAY bind a custom shortcut. | N/A |

**Accessibility**
- **ARIA**: The toolbar button (if present) MUST have `role="button"` with an accessible label (e.g., `aria-label="Export to CSV"`). If the button is in a toolbar, the toolbar MUST have `role="toolbar"` and support arrow key navigation.
- **Screen Reader**: When the export begins, a live region (`role="status"`, `aria-live="polite"`) MUST announce: SR: "Exporting data to CSV." When the export completes, the live region MUST announce: SR: "CSV export complete. [N] rows exported." If the export is cancelled, announce: SR: "CSV export cancelled."
- **WCAG**: 2.1.1 (export action is keyboard-accessible via the toolbar button or a developer-assigned shortcut), 4.1.3 (status messages are conveyed via live regions without receiving focus).
- **Visual**: If a progress indicator is shown during export, it MUST meet WCAG 1.4.11 (Non-text Contrast) with a 3:1 contrast ratio.

**Chameleon 6 Status**: New. Chameleon 6 did not provide built-in CSV export. Developers implemented export externally using the data model. Chameleon 7 introduces built-in CSV export with full configuration.

**Interactions**
- F-12.5 (Clipboard Copy with Headers): CSV export and clipboard copy share header-generation logic.
- F-12.7 (Custom Export Formatting): custom formatters can transform cell values during CSV generation.
- F-01 (Data Display & Rendering): raw vs. formatted value choice.
- F-02 (Sorting): export respects current sort order.
- F-03 (Filtering): export respects current filter state by default.
- F-04 (Grouping): group headers optionally included in export.
- F-05 (Pivoting): pivot table export emits the pivoted view.
- F-06 (Tree/Hierarchical): tree hierarchy encoded in CSV rows.
- F-08 (Selection): "export selected" uses the current selection state.
- F-09 (Column Management): column order and visibility determine exported columns.

---

## 12.2 Excel (XLSX) Export [P2]

**Description**: The grid exports its visible data to an Excel-compatible XLSX file. Unlike CSV, XLSX supports multiple sheets, cell formatting (number formats, date formats, fonts, colors), column widths, frozen panes, and multi-level headers. The export produces a file that preserves the grid's visual structure more faithfully than CSV. XLSX generation MAY require an optional third-party library (e.g., SheetJS/xlsx or ExcelJS).

**Applies to**: All variants

**Use Cases**
- UC-1: A financial analyst exports a Data Grid with currency-formatted columns to XLSX, expecting the Excel file to preserve number formats so formulas can reference the values.
- UC-2: A project manager exports a Gantt Chart task list to XLSX with date columns properly typed so Excel recognizes them as dates for timeline charting.
- UC-3: A user exports a Pivot Table to XLSX, expecting the multi-level column headers to appear as merged cells in Excel, matching the visual hierarchy.

**Conditions of Use**
- The grid MUST expose a programmatic API method for XLSX export (e.g., `exportToExcel(options?: ExcelExportOptions)`).
- If XLSX generation requires an external library, the grid MUST document the dependency and gracefully handle its absence (throwing a descriptive error, not a cryptic failure).
- The grid SHOULD provide a built-in UI affordance (toolbar button or context menu item) to trigger Excel export.

**Behavioral Requirements**
- BR-1: The exported XLSX file MUST contain a single worksheet by default, named after the grid's title or a configurable `options.sheetName` property.
- BR-2: The first row(s) of the worksheet MUST contain column headers. For grids with single-level headers, this is one row. For Pivot Tables with multi-level column headers, merged cells MUST represent the hierarchy.
- BR-3: Cell values MUST be typed correctly in the XLSX: numbers as numeric cells, dates as date-typed cells with the appropriate number format, booleans as boolean cells, and strings as text cells. This ensures Excel formulas and sorting work correctly on the exported data.
- BR-4: The export MUST apply number formats to cells based on the column's formatter configuration (F-01). For example, a currency column with format `"$#,##0.00"` MUST export with that Excel number format applied.
- BR-5: Column widths in the XLSX SHOULD approximate the grid's rendered column widths. The developer MAY override widths via `options.columnWidths`.
- BR-6: The export SHOULD support frozen panes matching the grid's frozen/pinned columns (F-09). Frozen columns in the grid SHOULD be frozen in the Excel sheet.
- BR-7: The export MUST respect the same visibility, ordering, filtering, and selection options as CSV export (BR-3 through BR-7 of F-12.1 apply).
- BR-8: The developer MAY configure cell styling via `options.cellStyle` callback, receiving the row data, column definition, and cell value, and returning Excel style properties (fill color, font, borders).
- BR-9: The grid MUST emit `beforeExport` and `afterExport` events (same contract as F-12.1 BR-8 and BR-9) with format `"xlsx"`.
- BR-10: Group header rows MUST be exported as merged cells spanning all data columns, with optional Excel grouping (outline levels) that allow expand/collapse in Excel.
- BR-11: For large datasets (more than 10,000 rows), the export SHOULD use streaming XLSX generation to limit memory consumption.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Hierarchy MUST be represented using Excel's outline (grouping) feature, where child rows are grouped under parent rows and can be expanded/collapsed in Excel. Alternatively, indentation via cell indent formatting SHOULD be applied to the first column. |
| Pivot Table | Multi-level column headers MUST be exported as merged header cells. Row dimension headers SHOULD use merged cells or outline grouping. Aggregated value cells MUST carry appropriate number formats. |
| Gantt Chart | Task dependencies SHOULD be exported as a text column. Start/end dates MUST be typed as Excel date cells. Duration SHOULD be a numeric cell. A separate "Timeline" sheet is NOT generated (timeline is a visual-only construct). |

**CSS Subgrid Implications**

None. XLSX export operates on the data model. Column widths MAY be derived from the computed CSS grid track sizes (`getComputedStyle` on the grid element) to approximate visual fidelity.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| (None by default) | Excel export is triggered via API or toolbar button. The developer MAY bind a custom shortcut. | N/A |

**Accessibility**
- **ARIA**: Same as F-12.1 -- toolbar button with accessible label (e.g., `aria-label="Export to Excel"`).
- **Screen Reader**: Live region MUST announce: SR: "Exporting data to Excel." on start and SR: "Excel export complete. [N] rows exported." on completion.
- **WCAG**: 2.1.1 (keyboard-accessible trigger), 4.1.3 (status messages via live regions).
- **Visual**: Progress indicator for large exports MUST meet contrast requirements.

**Chameleon 6 Status**: New. Chameleon 6 did not provide built-in Excel export. Chameleon 7 introduces XLSX export with typed cells, formatting, and hierarchical structure.

**Interactions**
- F-12.1 (CSV Export): shares the same data extraction pipeline; XLSX adds formatting on top.
- F-12.7 (Custom Export Formatting): custom formatters apply to XLSX cell values and styles.
- F-01 (Data Display & Rendering): formatter configuration drives Excel number formats.
- F-04 (Grouping): groups exported as Excel outline levels.
- F-05 (Pivoting): multi-level headers exported as merged cells.
- F-06 (Tree/Hierarchical): tree hierarchy exported as Excel outline grouping.
- F-09 (Column Management): frozen columns map to Excel frozen panes.

---

## 12.3 PDF Export [P2]

**Description**: The grid exports its visible data to a PDF document that preserves the grid's tabular layout, column headers, cell formatting, and pagination. The PDF is suitable for printing, archiving, or sharing as a read-only document. PDF generation MAY require an optional third-party library (e.g., jsPDF, pdfmake). The export supports page orientation, paper size, headers/footers, and page-break configuration.

**Applies to**: All variants

**Use Cases**
- UC-1: A compliance officer exports a filtered Data Grid of audit records to PDF for archival, including a title, export date, and page numbers.
- UC-2: A project manager exports a Gantt Chart task list to PDF for distribution to stakeholders who do not have access to the application.
- UC-3: A user exports a Pivot Table to PDF, expecting the multi-level headers and aggregated values to be rendered faithfully with proper alignment.

**Conditions of Use**
- The grid MUST expose a programmatic API method for PDF export (e.g., `exportToPdf(options?: PdfExportOptions)`).
- If PDF generation requires an external library, the grid MUST document the dependency and gracefully handle its absence.
- The grid SHOULD provide a built-in UI affordance (toolbar button or context menu item) to trigger PDF export.

**Behavioral Requirements**
- BR-1: The PDF MUST render the grid as a formatted table with visible borders, column headers, and data rows. The visual appearance SHOULD approximate the on-screen grid rendering (font family, font size, alignment, cell padding).
- BR-2: The PDF MUST support configurable page layout: `options.orientation` (`"portrait"` | `"landscape"`), `options.pageSize` (`"A4"` | `"Letter"` | custom dimensions), and `options.margins` (top, right, bottom, left).
- BR-3: When the grid width exceeds the page width, the export MUST handle overflow by either: (a) scaling the table to fit the page width (`options.fitToPage: true`), or (b) splitting columns across multiple pages with repeated row headers on each page (`options.fitToPage: false`).
- BR-4: The export MUST paginate rows across multiple pages when the data exceeds a single page height. Column headers MUST be repeated on each page.
- BR-5: The developer MUST be able to configure a document header (title, subtitle, date, logo) and footer (page numbers, custom text) via `options.header` and `options.footer` callbacks or template strings.
- BR-6: The export MUST respect the same visibility, ordering, filtering, and selection options as CSV export (F-12.1 BR-3 through BR-7 apply).
- BR-7: Cell formatting MUST use the formatted display values by default (per F-01 BR-5), since PDF is a visual/print format. The developer MAY override this.
- BR-8: The grid MUST emit `beforeExport` and `afterExport` events with format `"pdf"`.
- BR-9: Group header rows MUST be rendered as visually distinct rows spanning the full table width, matching their on-screen appearance.
- BR-10: Page breaks SHOULD NOT split a group header from its first data row. The export SHOULD apply widow/orphan control to keep at least 2 data rows with each group header on a page.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | Indentation MUST be visually represented in the PDF (left padding or indentation markers). The hierarchy structure MUST be apparent in the printed output. |
| Pivot Table | Multi-level column headers MUST be rendered as merged/spanning cells in the PDF table, matching the on-screen visual hierarchy. |
| Gantt Chart | By default, only the task list is exported to PDF. An advanced option (`options.includeTimeline: true`) MAY render a simplified timeline visualization (bars without interactivity) alongside the task list, though this is a SHOULD requirement due to rendering complexity. |

**CSS Subgrid Implications**

None directly. However, the PDF export MAY read computed styles (column widths, font sizes, cell padding) from the rendered CSS subgrid to replicate visual fidelity. The export MUST NOT depend on the DOM being in a specific scroll position -- it MUST export all target rows regardless of what is currently virtualized.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| (None by default) | PDF export is triggered via API or toolbar button. The developer MAY bind a custom shortcut. | N/A |

**Accessibility**
- **ARIA**: Toolbar button with accessible label (e.g., `aria-label="Export to PDF"`).
- **Screen Reader**: Live region MUST announce: SR: "Exporting data to PDF." on start and SR: "PDF export complete. [N] rows exported across [M] pages." on completion.
- **WCAG**: 2.1.1 (keyboard-accessible trigger), 4.1.3 (status messages via live regions).
- **Visual**: Progress indicator for large exports MUST meet contrast requirements.

**Chameleon 6 Status**: New. Chameleon 6 did not provide built-in PDF export. Chameleon 7 introduces PDF export with layout control and pagination.

**Interactions**
- F-12.1 (CSV Export): shares the data extraction pipeline.
- F-12.6 (Print-Friendly Rendering): PDF export and print rendering share layout/pagination logic.
- F-12.7 (Custom Export Formatting): custom formatters apply to PDF cell rendering.
- F-01 (Data Display & Rendering): formatted values used by default for PDF.
- F-04 (Grouping): group headers rendered in PDF.
- F-05 (Pivoting): multi-level headers rendered as merged cells.
- F-06 (Tree/Hierarchical): indentation preserved in PDF.

---

## 12.4 Clipboard Copy (Cells, Rows, Ranges) [P0]

**Description**: The user copies the currently selected cells, rows, or ranges to the system clipboard using Ctrl+C (Cmd+C on macOS). The copied data is placed on the clipboard in a tab-separated, newline-delimited plain text format suitable for pasting into spreadsheet applications, text editors, or other grids. An HTML representation MAY also be placed on the clipboard for rich-text paste targets. After a successful copy, the grid announces the result via an ARIA live region so screen reader users are informed.

**Applies to**: All variants

**Use Cases**
- UC-1: A user selects a single cell and presses Ctrl+C to copy the cell's value to the clipboard for pasting into an email.
- UC-2: A user selects a range of cells (B3:E10) and presses Ctrl+C. The clipboard contains the 4x8 grid of values in tab-separated format for pasting into Excel.
- UC-3: A user selects 5 rows (via checkboxes or Ctrl+click) and presses Ctrl+C. All cell values from the selected rows are copied, one row per line.
- UC-4: A screen reader user presses Ctrl+C after selecting 12 rows. The live region announces "Copied 12 rows" so the user has confirmation without visual feedback.

**Conditions of Use**
- At least one cell, row, or range MUST be selected (F-08) before the copy operation is triggered.
- The grid MUST NOT override the browser's default Ctrl+C behavior when no grid element has focus. The override MUST only apply when focus is within the grid in Navigation Mode.
- The Clipboard API (`navigator.clipboard.writeText()` or `document.execCommand('copy')`) MUST be available. If the Clipboard API is blocked by browser permissions, the grid MUST fall back to `execCommand('copy')` or display a user-facing message explaining the restriction.

**Behavioral Requirements**
- BR-1: When the user presses Ctrl+C (Cmd+C on macOS) with one or more cells, rows, or ranges selected, the grid MUST copy the selected data to the system clipboard.
- BR-2: The clipboard format MUST be plain text with tab characters (`\t`) separating columns and newline characters (`\n` or `\r\n`) separating rows. This is the de facto standard for spreadsheet clipboard interop.
- BR-3: When a single cell is selected, the clipboard MUST contain only that cell's value (no tab, no newline).
- BR-4: When multiple cells in a single row are selected (contiguous or non-contiguous), the clipboard MUST contain the values separated by tabs, in column order.
- BR-5: When a rectangular range is selected, the clipboard MUST contain one line per row in the range, with tab-separated values for each column in the range.
- BR-6: When multiple non-contiguous rows are selected, the clipboard MUST contain one line per selected row (in display order), with tab-separated values for all visible columns.
- BR-7: By default, the copy operation MUST use the **formatted display value** (per F-01 BR-8). The developer MAY configure `copyRawValues: true` to copy raw data values instead.
- BR-8: The grid MUST place both `text/plain` and `text/html` representations on the clipboard (using the Clipboard API's `ClipboardItem` with multiple types when available). The HTML representation MUST be a `<table>` element with `<tr>` and `<td>` elements, enabling rich paste into applications that support HTML clipboard content.
- BR-9: The grid MUST NOT enter Edit Mode as a result of Ctrl+C. If the user is in Navigation Mode, Ctrl+C copies; if the user is in Edit Mode, Ctrl+C MUST be passed through to the editor (allowing copy within the editor input).
- BR-10: After a successful copy, the grid MUST announce the result via an ARIA live region (`role="status"`, `aria-live="polite"`). The announcement MUST follow this pattern:
  - Single cell: SR: "Copied 1 cell"
  - Single row: SR: "Copied 1 row"
  - Multiple rows: SR: "Copied [N] rows"
  - Range: SR: "Copied [R] rows by [C] columns"
- BR-11: After a successful copy, the grid SHOULD display a brief visual confirmation (e.g., a subtle border flash on the copied cells, or a toast notification). The visual confirmation MUST respect `prefers-reduced-motion: reduce` and MUST NOT be the sole feedback mechanism (the live region announcement is the primary feedback).
- BR-12: The grid MUST emit a `copy` event before placing data on the clipboard, allowing the developer to modify the copied text, add additional data, or cancel the operation. The event MUST include the selected data, the formatted text, and a `cancel()` method.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | When copying rows that include parent and child rows, the hierarchy is NOT represented in the clipboard text (it is flat tab-separated data). Each row is one line, regardless of depth. If the developer needs hierarchy in the clipboard, they use F-12.7 (Custom Export Formatting) to inject indentation or level prefixes. |
| Pivot Table | Copying a range that includes dimension header cells MUST include the header values in the clipboard. Aggregated cells copy their aggregated (display) value, not the underlying raw records. |
| Gantt Chart | Copying from the task list copies task data. Copying from the timeline region is NOT supported (timeline bars are visual-only). If the user selects task rows, the copy includes all visible task list columns. |

**CSS Subgrid Implications**

None. Clipboard copy reads from the data model and selection state, not from the DOM. Column order is derived from the logical column order matching the subgrid track order.

**Editability Interaction**
- When a cell is in Edit Mode, Ctrl+C MUST be handled by the editor (native input copy behavior), NOT by the grid's copy handler. The grid's copy handler MUST only activate in Navigation Mode.
- After exiting Edit Mode (commit or cancel), Ctrl+C returns to grid-level copy behavior.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Ctrl+C (Cmd+C) | Copy selected cells/rows/range to clipboard | Navigation Mode |
| Ctrl+C (Cmd+C) | Copy selected text within the editor input (native behavior) | Edit Mode |

**Accessibility**
- **ARIA**: After a successful copy, a live region (`role="status"`, `aria-live="polite"`) MUST announce the copy result. The live region element MUST be present in the DOM at all times (not dynamically created) to ensure reliable announcement across screen readers.
- **Screen Reader**: SR: "Copied [N] rows" (for row selection), SR: "Copied 1 cell" (for single cell), SR: "Copied [R] rows by [C] columns" (for range selection). The announcement MUST occur within 100ms of the copy completing.
- **WCAG**: 2.1.1 (copy is keyboard-accessible via Ctrl+C), 4.1.3 (copy confirmation is a status message conveyed via live region without receiving focus), 1.3.1 (the copied data structure -- rows and columns -- is programmatically determinable from the selection state).
- **Visual**: The copied cell(s) SHOULD display a brief visual indicator (e.g., a "marching ants" border or a highlight flash lasting 1-2 seconds). This indicator MUST NOT rely on animation alone for meaning (the live region is the accessible confirmation). The indicator MUST respect `prefers-reduced-motion: reduce` by reducing or eliminating animation.

**Chameleon 6 Status**: New. Chameleon 6 did not provide built-in clipboard copy. Developers implemented copy externally using selection events and the Clipboard API. Chameleon 7 introduces built-in Ctrl+C handling with accessible announcements.

**Interactions**
- F-12.5 (Clipboard Copy with Headers): extends this feature by prepending column headers to the clipboard content.
- F-12.7 (Custom Export Formatting): custom formatters can transform values before they are placed on the clipboard.
- F-07 (Cell Editing): Ctrl+C in Edit Mode defers to the editor; clipboard paste (Ctrl+V) is in F-07.
- F-08.4 (Cell Selection): single-cell copy.
- F-08.5 (Range Selection): range copy in tab-separated format.
- F-08.2 (Row Selection: Multiple): multi-row copy.
- F-08.6 (Column Selection): copying an entire column.
- F-01 (Data Display & Rendering): formatted vs. raw value for clipboard content.

---

## 12.5 Clipboard Copy with Headers [P1]

**Description**: An extended clipboard copy mode that prepends column header names as the first row of the copied data. This is useful when pasting into an empty spreadsheet or document where the column context is needed. The user triggers this via Ctrl+Shift+C or a configurable alternative shortcut. When this mode is active, the copied data includes a header row followed by the data rows, both in tab-separated format.

**Applies to**: All variants

**Use Cases**
- UC-1: A user selects a range of cells and presses Ctrl+Shift+C to copy with headers, then pastes into an empty Excel sheet where the first row becomes the column labels.
- UC-2: A user selects 20 rows and copies with headers for pasting into a document, providing context for each column without manually typing headers.
- UC-3: A developer configures the grid so that Ctrl+C always includes headers (no separate shortcut needed), because the grid is used in a data-export-heavy workflow.

**Conditions of Use**
- The grid MUST support a configuration property to control header inclusion (e.g., `copyHeaders: "never" | "always" | "withShortcut"`). The default SHOULD be `"withShortcut"` (headers included only with the extended shortcut).
- At least one cell, row, or range MUST be selected before triggering the copy.

**Behavioral Requirements**
- BR-1: When `copyHeaders` is `"withShortcut"` (default), pressing Ctrl+Shift+C (Cmd+Shift+C on macOS) MUST copy the selected data with a header row prepended. Ctrl+C without Shift copies data only (per F-12.4).
- BR-2: When `copyHeaders` is `"always"`, pressing Ctrl+C MUST always include the header row. Ctrl+Shift+C behaves identically to Ctrl+C.
- BR-3: When `copyHeaders` is `"never"`, neither Ctrl+C nor Ctrl+Shift+C includes headers.
- BR-4: The header row MUST contain the display names (visible labels) of the columns included in the copy. For a range copy, only the headers of the columns within the range are included. For a row copy, all visible column headers are included.
- BR-5: The header row MUST be the first row in the clipboard text, separated from data rows by the same newline convention as data rows.
- BR-6: The HTML clipboard representation (per F-12.4 BR-8) MUST include the header row as `<th>` elements within a `<thead>`, distinguishing them from data `<td>` cells.
- BR-7: The live region announcement MUST indicate that headers were included: SR: "Copied [N] rows with headers" or SR: "Copied [R] rows by [C] columns with headers".
- BR-8: For Pivot Tables with multi-level column headers, the copy MUST include all header levels as separate rows in the clipboard text. Each header level is one row, with merged spans represented by repeating the parent label across the spanned columns.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | The header row includes the tree column header (e.g., "Name" or "Task"). No hierarchy metadata is in the header row itself. |
| Pivot Table | Multi-level headers produce multiple header rows in the clipboard (one per header level). |
| Gantt Chart | Only task list column headers are included. Timeline region has no textual headers. |

**CSS Subgrid Implications**

None. Header labels are derived from the column definition model, not from rendered DOM header cells.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Ctrl+Shift+C (Cmd+Shift+C) | Copy selected data with column headers prepended | Navigation Mode |

**Accessibility**
- **ARIA**: The live region announcement MUST differentiate "with headers" from a plain copy, so the user understands the clipboard content structure.
- **Screen Reader**: SR: "Copied [N] rows with headers" or SR: "Copied [R] rows by [C] columns with headers".
- **WCAG**: 2.1.1 (keyboard-accessible via Ctrl+Shift+C), 4.1.3 (status message via live region).
- **Visual**: The same visual confirmation as F-12.4 applies. The header row in the visual indicator (if a "marching ants" border is used) SHOULD NOT extend to the column headers in the grid -- the indicator covers only the selected data cells.

**Chameleon 6 Status**: New. Chameleon 6 did not provide built-in clipboard copy with headers. Chameleon 7 introduces this as a configurable copy mode.

**Interactions**
- F-12.4 (Clipboard Copy): this feature extends the base clipboard copy with header prepending.
- F-12.7 (Custom Export Formatting): custom formatters apply to both header labels and cell values.
- F-08 (Selection): selection state determines which rows/cells/range are copied.
- F-09 (Column Management): column visibility and order determine which headers are included.
- F-05 (Pivoting): multi-level headers produce multiple header rows.

---

## 12.6 Print-Friendly Rendering [P2]

**Description**: The grid provides a print-optimized rendering mode activated by the browser's print dialog (Ctrl+P) or a programmatic API. In print mode, the grid expands to show all rows (disabling virtualization), removes interactive UI elements (scrollbars, hover effects, edit controls, toolbar), applies print-specific CSS styles, and paginates content across printed pages with repeated column headers. This mode uses CSS `@media print` rules to transform the grid for paper output.

**Applies to**: All variants

**Use Cases**
- UC-1: A user presses Ctrl+P to print a filtered Data Grid of 200 invoice records. The print preview shows all 200 rows across multiple pages with column headers on each page.
- UC-2: A manager prints a Tree Grid of organizational hierarchy. The printed output preserves indentation and expand/collapse state (printing only the currently visible nodes).
- UC-3: A developer triggers a print preview programmatically after applying specific filters and column visibility settings, ensuring a clean printable report.

**Conditions of Use**
- Print-friendly rendering MUST activate automatically when the browser's `@media print` context is triggered (via Ctrl+P or `window.print()`).
- The grid MAY also expose a programmatic API (e.g., `preparePrint(options?: PrintOptions)`) that applies print styles without triggering the browser print dialog, allowing the developer to preview or adjust before printing.
- Virtualization (F-11) MUST be temporarily disabled during print rendering to ensure all rows are in the DOM.

**Behavioral Requirements**
- BR-1: When `@media print` is active, the grid MUST render ALL visible (non-filtered) rows in the DOM, bypassing virtual scrolling. This ensures all data appears in the printed output.
- BR-2: The grid MUST hide interactive-only UI elements during print: scrollbars, resize handles, drag handles, toolbar buttons, context menus, edit controls, checkbox selectors (unless configured to print), and filter indicators.
- BR-3: Column headers MUST repeat on each printed page. The grid SHOULD use CSS `thead { display: table-header-group }` or equivalent technique to ensure header repetition across page breaks.
- BR-4: The grid MUST apply appropriate page-break rules: `break-inside: avoid` on data rows to prevent splitting a row across pages, `break-after: avoid` on group headers to keep them with their first data row.
- BR-5: The grid SHOULD transform its CSS subgrid layout into a `display: table` layout (or equivalent) for print, since CSS subgrid may not paginate correctly across pages in all browser print engines. Alternatively, the grid MAY use a dedicated print stylesheet that replaces the grid layout with a table layout.
- BR-6: The print rendering MUST respect the current column order, visibility, sort, and filter state. The printed output MUST match what the user sees on screen (minus interactive elements).
- BR-7: The developer MUST be able to configure print-specific options: `options.title` (printed above the grid), `options.showPageNumbers` (printed in the footer), `options.includeTimestamp` (export date/time in the header or footer).
- BR-8: The grid MUST emit a `beforePrint` event when print rendering begins (either via `@media print` detection or API call), allowing the developer to adjust content, add a watermark, or cancel.
- BR-9: After printing (or when the print dialog is closed), the grid MUST restore its original rendering state: re-enable virtualization, restore interactive elements, and revert to the screen layout.
- BR-10: The printed grid MUST use high-contrast, print-appropriate colors: black text on white background by default, with configurable overrides. Background colors SHOULD be omitted by default (to save ink) unless `options.printBackgrounds: true` is set.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | The printed output preserves the current expand/collapse state. Only visible (expanded) nodes are printed. Indentation is preserved via left padding or indent markers. |
| Pivot Table | Multi-level column headers are printed as merged cells or repeated labels. The full pivoted layout is preserved. |
| Gantt Chart | By default, only the task list is printed. The timeline region MAY be printed alongside the task list if `options.includeTimeline: true`, rendering a static representation of the timeline bars. If the combined width exceeds the page, the task list and timeline SHOULD be printed on separate pages or the timeline scaled to fit. |

**CSS Subgrid Implications**

The most significant subgrid implication in this feature: CSS subgrid layouts do not paginate reliably across printed pages in all browsers, because the subgrid rows are part of a single grid formatting context that may not break at row boundaries. The grid MUST address this by either: (a) switching to `display: table` in the `@media print` stylesheet, (b) using a pre-rendering step that generates a traditional table element for print, or (c) testing and confirming that the target browsers' print engines handle subgrid pagination correctly. Option (a) or (b) is RECOMMENDED for maximum compatibility.

**Keyboard Interaction**

| Key | Action | Mode |
|-----|--------|------|
| Ctrl+P (Cmd+P) | Trigger browser print dialog (browser-native, not grid-specific) | Any |

**Accessibility**
- **ARIA**: During print rendering, ARIA attributes remain in the DOM but are not relevant (the printed page is a static visual output). No additional ARIA changes are needed for print mode.
- **Screen Reader**: Print mode does not affect screen reader interaction, since the print dialog is a browser-native feature. If the grid exposes a "Print" toolbar button, it MUST have an accessible label (e.g., `aria-label="Print grid"`).
- **WCAG**: 1.3.1 (printed table structure is semantically meaningful), 1.4.1 (printed output MUST NOT rely on color alone for meaning -- e.g., status indicators MUST include text labels in print), 1.4.3 (printed text MUST meet minimum contrast -- achieved by defaulting to black text on white).
- **Visual**: The printed output MUST use adequate font sizes (minimum 10pt recommended), clear cell borders, and sufficient spacing for readability on paper.

**Chameleon 6 Status**: Partially existed. Chameleon 6 had basic `@media print` styles that hid some interactive elements, but did not provide full virtualization bypass, header repetition, or configurable print options. Chameleon 7 introduces a comprehensive print mode with layout transformation and developer configuration.

**Interactions**
- F-12.3 (PDF Export): PDF export and print rendering share pagination and layout logic. PDF export produces a downloadable file; print rendering produces browser print output.
- F-12.7 (Custom Export Formatting): custom formatters MAY apply to printed cell values (e.g., replacing icons with text labels for print).
- F-11 (Virtualization): virtualization MUST be disabled during print rendering.
- F-09 (Column Management): column visibility and order are respected in print.
- F-15 (Theming & Styling): the print stylesheet overrides the screen theme with print-appropriate styles.

---

## 12.7 Custom Export Formatting [P2]

**Description**: A hook-based system that allows the developer to customize cell values, column headers, row inclusion, and structural metadata during any export or copy operation. The developer registers callback functions that are invoked for each cell, row, or header during the export pipeline. These callbacks can transform values (e.g., replacing enum codes with display labels, stripping HTML from rich-text cells), add computed columns, skip specific rows, or inject additional rows (totals, disclaimers). Custom formatting applies uniformly across CSV, XLSX, PDF, clipboard copy, and print export.

**Applies to**: All variants

**Use Cases**
- UC-1: A developer registers a cell formatter that converts status codes (1, 2, 3) to human-readable labels ("Active", "Pending", "Archived") in all exports, even though the grid renderer uses colored icons.
- UC-2: A developer adds a "Total" row at the bottom of the CSV export that sums all numeric columns, even though the grid does not display a total row.
- UC-3: A developer excludes rows with a "Draft" status from PDF export, even though they are visible in the grid, to produce a client-facing report.
- UC-4: A developer transforms a "Full Name" column into two separate columns ("First Name" and "Last Name") in the Excel export for data import compatibility with a CRM system.

**Conditions of Use**
- Custom export formatters are registered via configuration callbacks on the grid or via the `beforeExport` event (F-12.1 BR-8).
- Multiple formatters MAY be registered and are applied in registration order (pipeline pattern).
- Custom formatters MUST NOT mutate the grid's internal data model. They operate on a copy of the data during export.

**Behavioral Requirements**
- BR-1: The grid MUST support a `cellExportFormatter` callback with the signature: `(value: any, column: ColumnDef, rowData: any, context: ExportContext) => any`. The returned value replaces the cell value in the export output. The `ExportContext` MUST include the export format (`"csv"`, `"xlsx"`, `"pdf"`, `"clipboard"`, `"print"`), the row index, and the column index.
- BR-2: The grid MUST support a `headerExportFormatter` callback with the signature: `(headerLabel: string, column: ColumnDef, context: ExportContext) => string`. This allows renaming or transforming column headers per export format.
- BR-3: The grid MUST support a `rowExportFilter` callback with the signature: `(rowData: any, rowIndex: number, context: ExportContext) => boolean`. Returning `false` excludes the row from the export. This filter runs AFTER visibility/selection filters.
- BR-4: The grid MUST support an `additionalRows` callback via the `beforeExport` event, allowing the developer to prepend or append rows (e.g., title rows, summary rows, disclaimer text) to the export output. Added rows MUST be clearly distinguishable in the event payload (marked as `type: "custom"`).
- BR-5: The grid MUST support a `columnExportMapper` callback with the signature: `(columns: ColumnDef[], context: ExportContext) => ExportColumnDef[]`. This allows the developer to add, remove, reorder, or split columns for export. The returned column definitions drive the export pipeline.
- BR-6: Custom formatters MUST receive the **raw data value** as input (not the display-formatted value), unless the developer has configured `useFormattedValues: true` for the export, in which case the formatter receives the formatted value.
- BR-7: For XLSX export, the `cellExportFormatter` MAY return an object with both `value` and `style` properties, allowing per-cell style customization (background color, font, number format).
- BR-8: For PDF export, the `cellExportFormatter` MAY return an object with `value` and `style` properties (font size, alignment, background color, text color).
- BR-9: Custom formatters MUST be applied consistently across all export formats. A `cellExportFormatter` registered on the grid MUST be invoked for CSV, XLSX, PDF, clipboard copy, and print operations. The `ExportContext.format` property allows format-specific logic within the callback.
- BR-10: If a `cellExportFormatter` throws an error, the grid MUST catch the error, log a warning, and use the original (unformatted) value for that cell. The export MUST NOT fail due to a formatter error.

**Variant-Specific Behavior**

| Variant | Difference |
|---------|------------|
| Tree Grid | The `cellExportFormatter` receives the row's `depth` (tree level) in the `ExportContext`, enabling depth-aware formatting (e.g., bold parent rows, indented child labels). |
| Pivot Table | The `cellExportFormatter` receives the dimension coordinates (row dimensions, column dimensions) in the `ExportContext`, enabling dimension-aware formatting (e.g., highlighting specific aggregation intersections). |
| Gantt Chart | The `cellExportFormatter` receives task-specific properties (isMilestone, isCriticalPath) in the `ExportContext`, enabling task-type-aware formatting. |

**CSS Subgrid Implications**

None. Custom export formatting operates on the data pipeline, not on rendered DOM or CSS layout.

**Editability Interaction**
- Custom export formatters are independent of edit state. If a cell is currently being edited (in Edit Mode), the export MUST use the last committed value, not the in-progress editor value. This prevents exporting partially edited data.

**Keyboard Interaction**

No dedicated keyboard interaction. Custom export formatting is a developer-configured pipeline, not a user-facing action.

**Accessibility**
- **ARIA**: No direct ARIA impact. Custom formatting affects the exported content, not the grid's live ARIA structure.
- **Screen Reader**: The live region announcements for export (F-12.1 through F-12.5) remain unchanged. Custom formatters do not alter announcement text unless the developer modifies it via the `afterExport` event.
- **WCAG**: Custom formatters MUST NOT remove accessibility-relevant information from exports. For example, if a cell value conveys meaning through both color and text (e.g., "Active" with a green icon), the export formatter SHOULD preserve the text label, not export only the color code.
- **Visual**: No visual impact on the grid. Formatting affects only the exported artifact.

**Chameleon 6 Status**: New. Chameleon 6 did not provide export hooks or formatters. Developers who needed custom export behavior built it entirely outside the grid. Chameleon 7 introduces a pluggable formatting pipeline for all export channels.

**Interactions**
- F-12.1 (CSV Export): custom formatters transform CSV cell values.
- F-12.2 (Excel Export): custom formatters transform XLSX cell values and MAY provide per-cell styles.
- F-12.3 (PDF Export): custom formatters transform PDF cell values and MAY provide per-cell styles.
- F-12.4 (Clipboard Copy): custom formatters transform clipboard cell values.
- F-12.5 (Clipboard Copy with Headers): custom formatters apply to both header labels and cell values.
- F-12.6 (Print-Friendly Rendering): custom formatters MAY transform printed cell values.
- F-01 (Data Display & Rendering): formatters receive raw or formatted values based on configuration.
- F-04 (Grouping): custom formatters receive group context for group header rows.
- F-06 (Tree/Hierarchical): custom formatters receive tree depth in context.

---

## Cross-Feature Dependency Matrix

| Feature | Depends On | Depended On By |
|---------|-----------|----------------|
| F-12.1 CSV Export | F-01, F-02, F-03, F-04, F-05, F-06, F-08, F-09 | F-12.2, F-12.3, F-12.5, F-12.7 |
| F-12.2 Excel Export | F-01, F-04, F-05, F-06, F-09, F-12.1 (shared pipeline) | F-12.7 |
| F-12.3 PDF Export | F-01, F-04, F-05, F-06, F-09, F-12.1 (shared pipeline), F-12.6 (shared layout) | F-12.7 |
| F-12.4 Clipboard Copy | F-01, F-07, F-08 | F-12.5, F-12.7 |
| F-12.5 Copy with Headers | F-12.4, F-08, F-09 | F-12.7 |
| F-12.6 Print Rendering | F-09, F-11, F-15 | F-12.3 (shared layout), F-12.7 |
| F-12.7 Custom Formatting | F-01, F-04, F-06 | F-12.1, F-12.2, F-12.3, F-12.4, F-12.5, F-12.6 |

---

## Full Interaction Map

| Concern | Target Feature |
|---------|---------------|
| Raw vs. formatted values in export | F-01: Data Display & Rendering |
| Export respects sort order | F-02: Sorting |
| Export respects filter state | F-03: Filtering |
| Group headers in export | F-04: Grouping & Aggregation |
| Pivot table export (pivoted view, multi-level headers) | F-05: Pivoting |
| Tree hierarchy in export (indentation, depth, outline) | F-06: Tree / Hierarchical |
| Clipboard paste (inbound) | F-07: Cell Editing |
| Export selected rows/cells/ranges | F-08: Selection |
| Column visibility and order in export | F-09: Column Management |
| Virtualization bypass for print | F-11: Virtualization & Performance |
| Locale-aware formatting in export | F-13: Internationalization |
| Keyboard shortcuts for copy | F-14: Keyboard Navigation |
| Print stylesheet overrides theme | F-15: Theming & Styling |
