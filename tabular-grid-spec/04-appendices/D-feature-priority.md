# Appendix D: Feature Priority Summary

> **Part of**: [Tabular Grid Specification](../README.md)
> **Type**: All features grouped by priority tier (P0/P1/P2)

## Overview

Features are classified into three priority tiers:

- **P0 (Core)**: Must-have for any functional tabular grid. Without these, the component is not usable.
- **P1 (Standard)**: Expected in enterprise-grade grids. Most business applications require these.
- **P2 (Future)**: Competitive differentiators or specialized features. Valuable but not blocking.

> All four variants (Data Grid, Tree Grid, Pivot Table, Gantt Chart) are at equal priority level — P0/P1/P2 applies to individual features, not to variants.

---

## P0: Core Features

These features must be implemented for the component to be considered functional. A tabular grid that is missing any P0 feature is not production-ready.

### Data Display and Rendering

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-01.1 | Custom Cell Renderers / Templates | [02-features/01-data-display-rendering.md](../02-features/01-data-display-rendering.md) |
| F-01.2 | Cell Data Types | [02-features/01-data-display-rendering.md](../02-features/01-data-display-rendering.md) |
| F-01.3 | Value Formatters | [02-features/01-data-display-rendering.md](../02-features/01-data-display-rendering.md) |
| F-01.5 | Row Height: Fixed | [02-features/01-data-display-rendering.md](../02-features/01-data-display-rendering.md) |
| F-01.8 | Multi-Level Column Headers (Column Groups) | [02-features/01-data-display-rendering.md](../02-features/01-data-display-rendering.md) |
| F-01.11 | Conditional Styling (Cell/Row Class Rules) | [02-features/01-data-display-rendering.md](../02-features/01-data-display-rendering.md) |
| F-01.12 | Empty-State Overlay | [02-features/01-data-display-rendering.md](../02-features/01-data-display-rendering.md) |
| F-01.13 | Loading Skeleton | [02-features/01-data-display-rendering.md](../02-features/01-data-display-rendering.md) |

### Sorting

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-02.1 | Single-Column Sorting | [02-features/02-sorting.md](../02-features/02-sorting.md) |
| F-02.2 | Multi-Column Sorting | [02-features/02-sorting.md](../02-features/02-sorting.md) |
| F-02.3 | Custom Sort Comparators | [02-features/02-sorting.md](../02-features/02-sorting.md) |
| F-02.4 | Pre-Sorted / Default Sort | [02-features/02-sorting.md](../02-features/02-sorting.md) |
| F-02.5 | Tri-State Sort Cycling | [02-features/02-sorting.md](../02-features/02-sorting.md) |
| F-02.8 | Sort Indicators in Headers | [02-features/02-sorting.md](../02-features/02-sorting.md) |

### Filtering

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-03.4 | External / Programmatic Filter | [02-features/03-filtering.md](../02-features/03-filtering.md) |

### Tree and Hierarchical Data

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-06.1 | Tree Data with Expand/Collapse | [02-features/06-tree-hierarchical.md](../02-features/06-tree-hierarchical.md) |
| F-06.2 | Lazy-Load Children (Async Tree) | [02-features/06-tree-hierarchical.md](../02-features/06-tree-hierarchical.md) |
| F-06.3 | Indentation Levels | [02-features/06-tree-hierarchical.md](../02-features/06-tree-hierarchical.md) |
| F-06.4 | Tree Column with Carets/Icons | [02-features/06-tree-hierarchical.md](../02-features/06-tree-hierarchical.md) |

### Cell Editing

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-07.1 | Inline Cell Editing (Click-to-Edit) | [02-features/07-cell-editing.md](../02-features/07-cell-editing.md) |
| F-07.3 | Edit Triggers | [02-features/07-cell-editing.md](../02-features/07-cell-editing.md) |
| F-07.4 | Built-In Editor Types | [02-features/07-cell-editing.md](../02-features/07-cell-editing.md) |
| F-07.5 | Custom Cell Editors | [02-features/07-cell-editing.md](../02-features/07-cell-editing.md) |
| F-07.6 | Edit Lifecycle Events | [02-features/07-cell-editing.md](../02-features/07-cell-editing.md) |
| F-07.9 | Conditional Editability (Read-Only Cells) | [02-features/07-cell-editing.md](../02-features/07-cell-editing.md) |

### Selection

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-08.1 | Row Selection: Single | [02-features/08-selection.md](../02-features/08-selection.md) |
| F-08.2 | Row Selection: Multiple (Ctrl/Shift+Click) | [02-features/08-selection.md](../02-features/08-selection.md) |
| F-08.3 | Row Selection: Checkbox Column | [02-features/08-selection.md](../02-features/08-selection.md) |
| F-08.4 | Cell Selection: Single | [02-features/08-selection.md](../02-features/08-selection.md) |
| F-08.7 | Select All / Deselect All | [02-features/08-selection.md](../02-features/08-selection.md) |
| F-08.8 | Programmatic Selection API | [02-features/08-selection.md](../02-features/08-selection.md) |
| F-08.9 | Selection Events | [02-features/08-selection.md](../02-features/08-selection.md) |
| F-08.11 | Highlight on Hover | [02-features/08-selection.md](../02-features/08-selection.md) |
| F-08.12 | Row Marking (Independent Checkbox) | [02-features/08-selection.md](../02-features/08-selection.md) |

### Column Management

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-09.1 | Column Resize (Drag Header Border) | [02-features/09-column-management.md](../02-features/09-column-management.md) |
| F-09.2 | Resize Modes | [02-features/09-column-management.md](../02-features/09-column-management.md) |
| F-09.3 | Column Reorder (Drag Headers) | [02-features/09-column-management.md](../02-features/09-column-management.md) |
| F-09.4 | Column Pinning/Freezing | [02-features/09-column-management.md](../02-features/09-column-management.md) |
| F-09.5 | Column Hide/Show | [02-features/09-column-management.md](../02-features/09-column-management.md) |
| F-09.6 | Column Visibility Panel | [02-features/09-column-management.md](../02-features/09-column-management.md) |
| F-09.8 | Dynamic Columns at Runtime | [02-features/09-column-management.md](../02-features/09-column-management.md) |
| F-09.10 | Custom Header Rendering | [02-features/09-column-management.md](../02-features/09-column-management.md) |
| F-09.11 | Column Sizing Modes | [02-features/09-column-management.md](../02-features/09-column-management.md) |

### Row Management

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-10.5 | Summary / Footer Rows | [02-features/10-row-management.md](../02-features/10-row-management.md) |

### Virtualization and Performance

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-11.1 | Row Virtualization | [02-features/11-virtualization-performance.md](../02-features/11-virtualization-performance.md) |
| F-11.3 | DOM Recycling | [02-features/11-virtualization-performance.md](../02-features/11-virtualization-performance.md) |
| F-11.4 | Lazy Loading / Infinite Scrolling | [02-features/11-virtualization-performance.md](../02-features/11-virtualization-performance.md) |
| F-11.6 | Large Dataset Support | [02-features/11-virtualization-performance.md](../02-features/11-virtualization-performance.md) |
| F-11.7 | Batched DOM Updates | [02-features/11-virtualization-performance.md](../02-features/11-virtualization-performance.md) |

### Export and Clipboard

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-12.4 | Clipboard Copy (Cells, Rows, Ranges) | [02-features/12-export-import.md](../02-features/12-export-import.md) |

### Internationalization

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-13.1 | Localized UI Strings | [02-features/13-internationalization.md](../02-features/13-internationalization.md) |
| F-13.2 | RTL Layout | [02-features/13-internationalization.md](../02-features/13-internationalization.md) |
| F-13.3 | Locale-Aware Formatting | [02-features/13-internationalization.md](../02-features/13-internationalization.md) |

### Keyboard Navigation

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-14.1 | Keyboard Navigation Mode | [02-features/14-keyboard-navigation.md](../02-features/14-keyboard-navigation.md) |
| F-14.2 | Arrow Key Navigation | [02-features/14-keyboard-navigation.md](../02-features/14-keyboard-navigation.md) |
| F-14.3 | Enter to Edit/Confirm | [02-features/14-keyboard-navigation.md](../02-features/14-keyboard-navigation.md) |
| F-14.4 | Escape to Cancel | [02-features/14-keyboard-navigation.md](../02-features/14-keyboard-navigation.md) |
| F-14.5 | Tab Navigation | [02-features/14-keyboard-navigation.md](../02-features/14-keyboard-navigation.md) |
| F-14.6 | Home/End | [02-features/14-keyboard-navigation.md](../02-features/14-keyboard-navigation.md) |
| F-14.7 | Ctrl+Home / Ctrl+End | [02-features/14-keyboard-navigation.md](../02-features/14-keyboard-navigation.md) |
| F-14.8 | Page Up / Page Down | [02-features/14-keyboard-navigation.md](../02-features/14-keyboard-navigation.md) |
| F-14.9 | Space to Toggle Selection | [02-features/14-keyboard-navigation.md](../02-features/14-keyboard-navigation.md) |
| F-14.10 | +/- to Expand/Collapse | [02-features/14-keyboard-navigation.md](../02-features/14-keyboard-navigation.md) |
| F-14.11 | Ctrl+A to Select All | [02-features/14-keyboard-navigation.md](../02-features/14-keyboard-navigation.md) |
| F-14.12 | F2 to Start Editing | [02-features/14-keyboard-navigation.md](../02-features/14-keyboard-navigation.md) |
| F-14.13 | Shift+F10 for Context Menu | [02-features/14-keyboard-navigation.md](../02-features/14-keyboard-navigation.md) |
| F-14.15 | Delete to Clear/Delete | [02-features/14-keyboard-navigation.md](../02-features/14-keyboard-navigation.md) |

### Theming and Styling

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-15.1 | CSS Custom Properties (CSS Variables) | [02-features/15-theming-styling.md](../02-features/15-theming-styling.md) |
| F-15.2 | CSS Shadow Parts | [02-features/15-theming-styling.md](../02-features/15-theming-styling.md) |

### Developer Experience

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-22.1 | TypeScript Type Definitions | [02-features/22-developer-experience.md](../02-features/22-developer-experience.md) |
| F-22.3 | Event System | [02-features/22-developer-experience.md](../02-features/22-developer-experience.md) |

### Foundations

| Feature ID | Feature Name | Source File |
|---|---|---|
| FD-01 | Layout Model (CSS Subgrid) | [01-foundations/01-layout-model.md](../01-foundations/01-layout-model.md) |
| FD-02 | Variant Model | [01-foundations/02-variant-model.md](../01-foundations/02-variant-model.md) |
| FD-03 | Editability Model | [01-foundations/03-editability-model.md](../01-foundations/03-editability-model.md) |
| FD-04 | Accessibility Foundation | [01-foundations/04-accessibility-foundation.md](../01-foundations/04-accessibility-foundation.md) |

---

## P1: Standard Features

These features are expected in enterprise-grade grids. Most business applications require them. They should be implemented after all P0 features are complete and stable.

### Data Display and Rendering

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-01.4 | Cell Tooltips | [02-features/01-data-display-rendering.md](../02-features/01-data-display-rendering.md) |
| F-01.6 | Row Height: Auto (Content-Based) | [02-features/01-data-display-rendering.md](../02-features/01-data-display-rendering.md) |
| F-01.7 | Row Height: Variable (Per-Row Callback) | [02-features/01-data-display-rendering.md](../02-features/01-data-display-rendering.md) |
| F-01.9 | Row Spanning | [02-features/01-data-display-rendering.md](../02-features/01-data-display-rendering.md) |
| F-01.10 | Column Spanning | [02-features/01-data-display-rendering.md](../02-features/01-data-display-rendering.md) |

### Sorting

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-02.6 | Locale-Aware / Natural Sort | [02-features/02-sorting.md](../02-features/02-sorting.md) |
| F-02.7 | Sort by Value vs Display Value | [02-features/02-sorting.md](../02-features/02-sorting.md) |

### Filtering

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-03.1 | Inline Filter Row | [02-features/03-filtering.md](../02-features/03-filtering.md) |
| F-03.2 | Filter Types | [02-features/03-filtering.md](../02-features/03-filtering.md) |
| F-03.3 | Quick Filter / Global Search | [02-features/03-filtering.md](../02-features/03-filtering.md) |
| F-03.5 | Floating Filters | [02-features/03-filtering.md](../02-features/03-filtering.md) |

### Grouping and Aggregation

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-04.1 | Single-Level Row Grouping | [02-features/04-grouping-aggregation.md](../02-features/04-grouping-aggregation.md) |
| F-04.2 | Multi-Level / Nested Grouping | [02-features/04-grouping-aggregation.md](../02-features/04-grouping-aggregation.md) |
| F-04.3 | Group Headers with Expand/Collapse | [02-features/04-grouping-aggregation.md](../02-features/04-grouping-aggregation.md) |
| F-04.4 | Aggregation Functions | [02-features/04-grouping-aggregation.md](../02-features/04-grouping-aggregation.md) |
| F-04.5 | Group Footer Rows | [02-features/04-grouping-aggregation.md](../02-features/04-grouping-aggregation.md) |
| F-04.7 | Custom Group Row Rendering | [02-features/04-grouping-aggregation.md](../02-features/04-grouping-aggregation.md) |

### Pivoting

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-05.1 | Pivot Mode | [02-features/05-pivoting.md](../02-features/05-pivoting.md) |
| F-05.2 | Multi-Dimension Pivoting | [02-features/05-pivoting.md](../02-features/05-pivoting.md) |
| F-05.3 | Pivot with Aggregation | [02-features/05-pivoting.md](../02-features/05-pivoting.md) |
| F-05.4 | Auto-Generated Pivot Columns | [02-features/05-pivoting.md](../02-features/05-pivoting.md) |
| F-05.5 | Dimension Configuration | [02-features/05-pivoting.md](../02-features/05-pivoting.md) |
| F-05.6 | Pivot Field Selector Panel | [02-features/05-pivoting.md](../02-features/05-pivoting.md) |
| F-05.7 | Dynamic Column Reconfiguration | [02-features/05-pivoting.md](../02-features/05-pivoting.md) |

### Tree and Hierarchical Data

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-06.5 | Tri-State Checkbox Selection in Tree | [02-features/06-tree-hierarchical.md](../02-features/06-tree-hierarchical.md) |
| F-06.7 | Filtering Within Tree (Show Ancestor Chain) | [02-features/06-tree-hierarchical.md](../02-features/06-tree-hierarchical.md) |
| F-06.8 | Auto-Group Column | [02-features/06-tree-hierarchical.md](../02-features/06-tree-hierarchical.md) |

### Cell Editing

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-07.2 | Full-Row Editing Mode | [02-features/07-cell-editing.md](../02-features/07-cell-editing.md) |
| F-07.7 | Batch Editing / Transaction Updates | [02-features/07-cell-editing.md](../02-features/07-cell-editing.md) |
| F-07.8 | Clipboard Paste into Cells | [02-features/07-cell-editing.md](../02-features/07-cell-editing.md) |
| F-07.10 | Enter-to-Create-New-Row | [02-features/07-cell-editing.md](../02-features/07-cell-editing.md) |

### Selection

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-08.5 | Cell Range Selection (Excel-Like) | [02-features/08-selection.md](../02-features/08-selection.md) |

### Column Management

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-09.7 | Auto-Size Columns to Fit Content | [02-features/09-column-management.md](../02-features/09-column-management.md) |
| F-09.9 | Column Menu | [02-features/09-column-management.md](../02-features/09-column-management.md) |
| F-09.12 | Column-Level Styling (like colgroup) | [02-features/09-column-management.md](../02-features/09-column-management.md) |
| F-09.13 | Collapsible Column Groups (Column Tree) | [02-features/09-column-management.md](../02-features/09-column-management.md) |

### Row Management

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-10.1 | Row Reorder (Drag-and-Drop) | [02-features/10-row-management.md](../02-features/10-row-management.md) |
| F-10.2 | Row Pinning | [02-features/10-row-management.md](../02-features/10-row-management.md) |
| F-10.3 | Master-Detail (Expand Row to Detail Panel) | [02-features/10-row-management.md](../02-features/10-row-management.md) |
| F-10.4 | Full-Width Rows | [02-features/10-row-management.md](../02-features/10-row-management.md) |
| F-10.7 | Hover Action Buttons | [02-features/10-row-management.md](../02-features/10-row-management.md) |

### Virtualization and Performance

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-11.2 | Column Virtualization | [02-features/11-virtualization-performance.md](../02-features/11-virtualization-performance.md) |
| F-11.5 | Client-Side Pagination | [02-features/11-virtualization-performance.md](../02-features/11-virtualization-performance.md) |

### Export and Clipboard

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-12.1 | CSV Export | [02-features/12-export-import.md](../02-features/12-export-import.md) |
| F-12.5 | Clipboard Copy with Headers | [02-features/12-export-import.md](../02-features/12-export-import.md) |

### Internationalization

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-13.4 | Multi-Language Packs | [02-features/13-internationalization.md](../02-features/13-internationalization.md) |

### Keyboard Navigation

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-14.14 | Keyboard Shortcut Customization | [02-features/14-keyboard-navigation.md](../02-features/14-keyboard-navigation.md) |

### Theming and Styling

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-15.3 | Class-Based Row and Cell Styling | [02-features/15-theming-styling.md](../02-features/15-theming-styling.md) |
| F-15.4 | Column-Level Styling | [02-features/15-theming-styling.md](../02-features/15-theming-styling.md) |
| F-15.5 | Row Striping | [02-features/15-theming-styling.md](../02-features/15-theming-styling.md) |
| F-15.6 | Density Modes | [02-features/15-theming-styling.md](../02-features/15-theming-styling.md) |
| F-15.7 | Grid Lines Display | [02-features/15-theming-styling.md](../02-features/15-theming-styling.md) |
| F-15.8 | Cell Alignment | [02-features/15-theming-styling.md](../02-features/15-theming-styling.md) |

### Context Menus

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-16.1 | Column Header Context Menu | [02-features/16-context-menus.md](../02-features/16-context-menus.md) |
| F-16.2 | Cell and Row Context Menu | [02-features/16-context-menus.md](../02-features/16-context-menus.md) |
| F-16.3 | Custom Menu Items | [02-features/16-context-menus.md](../02-features/16-context-menus.md) |
| F-16.4 | Conditional Menu Items | [02-features/16-context-menus.md](../02-features/16-context-menus.md) |
| F-16.5 | Context Menu API | [02-features/16-context-menus.md](../02-features/16-context-menus.md) |

### Undo/Redo

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-17.1 | Cell Edit Undo/Redo | [02-features/17-undo-redo.md](../02-features/17-undo-redo.md) |
| F-17.2 | Structural Change Undo | [02-features/17-undo-redo.md](../02-features/17-undo-redo.md) |
| F-17.3 | Transaction-Based Undo | [02-features/17-undo-redo.md](../02-features/17-undo-redo.md) |
| F-17.4 | Undo Stack Configuration | [02-features/17-undo-redo.md](../02-features/17-undo-redo.md) |

### Validation

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-18.1 | Cell-Level Validation Rules | [02-features/18-validation.md](../02-features/18-validation.md) |
| F-18.2 | Synchronous Validation | [02-features/18-validation.md](../02-features/18-validation.md) |
| F-18.3 | Asynchronous / Server-Side Validation | [02-features/18-validation.md](../02-features/18-validation.md) |
| F-18.4 | Validation Feedback (Visual + ARIA) | [02-features/18-validation.md](../02-features/18-validation.md) |
| F-18.5 | Form-Level Validation | [02-features/18-validation.md](../02-features/18-validation.md) |

### Formulas and Calculated Columns

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-19.1 | Computed / Derived Columns | [02-features/19-formulas-calculated.md](../02-features/19-formulas-calculated.md) |
| F-19.2 | Aggregate Expressions in Column Headers | [02-features/19-formulas-calculated.md](../02-features/19-formulas-calculated.md) |

### Server-Side Operations

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-20.1 | Server-Side Row Model | [02-features/20-server-side-operations.md](../02-features/20-server-side-operations.md) |
| F-20.2 | Server-Side Sorting | [02-features/20-server-side-operations.md](../02-features/20-server-side-operations.md) |
| F-20.3 | Server-Side Filtering | [02-features/20-server-side-operations.md](../02-features/20-server-side-operations.md) |
| F-20.4 | Server-Side Grouping | [02-features/20-server-side-operations.md](../02-features/20-server-side-operations.md) |
| F-20.5 | Server-Side Pagination | [02-features/20-server-side-operations.md](../02-features/20-server-side-operations.md) |
| F-20.6 | Infinite Row Model (Infinite Scroll) | [02-features/20-server-side-operations.md](../02-features/20-server-side-operations.md) |
| F-20.7 | CRUD Integration Patterns | [02-features/20-server-side-operations.md](../02-features/20-server-side-operations.md) |

### State Persistence and Responsive Layout

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-21.1 | Grid State Save/Restore | [02-features/21-state-persistence-responsive.md](../02-features/21-state-persistence-responsive.md) |
| F-21.2 | Storage Integration | [02-features/21-state-persistence-responsive.md](../02-features/21-state-persistence-responsive.md) |
| F-21.3 | Responsive Column Hiding | [02-features/21-state-persistence-responsive.md](../02-features/21-state-persistence-responsive.md) |
| F-21.4 | Touch and Mobile Optimization | [02-features/21-state-persistence-responsive.md](../02-features/21-state-persistence-responsive.md) |
| F-21.5 | Adaptive Layout | [02-features/21-state-persistence-responsive.md](../02-features/21-state-persistence-responsive.md) |

### Developer Experience

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-22.2 | SSR / SSG Compatibility | [02-features/22-developer-experience.md](../02-features/22-developer-experience.md) |
| F-22.4 | Tool Panels / Sidebar | [02-features/22-developer-experience.md](../02-features/22-developer-experience.md) |
| F-22.5 | External Drag-and-Drop Integration | [02-features/22-developer-experience.md](../02-features/22-developer-experience.md) |
| F-22.6 | Programmatic Row and Column Management | [02-features/22-developer-experience.md](../02-features/22-developer-experience.md) |
| F-22.7 | Synchronized / Aligned Grids | [02-features/22-developer-experience.md](../02-features/22-developer-experience.md) |

### Variant-Specific Documentation

| Feature ID | Feature Name | Source File |
|---|---|---|
| VS-01 | Gantt Chart Variant | [03-variant-specific/01-gantt-chart.md](../03-variant-specific/01-gantt-chart.md) |
| VS-02 | Pivot Table Variant | [03-variant-specific/02-pivot-table.md](../03-variant-specific/02-pivot-table.md) |
| VS-03 | Tree Grid Variant | [03-variant-specific/03-tree-grid.md](../03-variant-specific/03-tree-grid.md) |

---

## P2: Future Features

These features are competitive differentiators or address specialized use cases. They are valuable but not required for initial release. Schedule them after P1 is stable.

### Data Display and Rendering

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-01.14 | Flashing Cells (Live Data Highlight) | [02-features/01-data-display-rendering.md](../02-features/01-data-display-rendering.md) |
| F-01.15 | Column Auto-Generation from Data Shape | [02-features/01-data-display-rendering.md](../02-features/01-data-display-rendering.md) |

### Filtering

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-03.6 | Advanced Filter Builder | [02-features/03-filtering.md](../02-features/03-filtering.md) |
| F-03.7 | Filter Presets / Saved States | [02-features/03-filtering.md](../02-features/03-filtering.md) |

### Grouping and Aggregation

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-04.6 | Drag-to-Group Panel | [02-features/04-grouping-aggregation.md](../02-features/04-grouping-aggregation.md) |

### Tree and Hierarchical Data

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-06.6 | Drag-and-Drop Reparenting | [02-features/06-tree-hierarchical.md](../02-features/06-tree-hierarchical.md) |

### Selection

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-08.6 | Column Selection | [02-features/08-selection.md](../02-features/08-selection.md) |
| F-08.10 | Fill Handle (Drag to Auto-Fill Range) | [02-features/08-selection.md](../02-features/08-selection.md) |

### Row Management

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-10.6 | Row Animation | [02-features/10-row-management.md](../02-features/10-row-management.md) |

### Export and Clipboard

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-12.2 | Excel (XLSX) Export | [02-features/12-export-import.md](../02-features/12-export-import.md) |
| F-12.3 | PDF Export | [02-features/12-export-import.md](../02-features/12-export-import.md) |
| F-12.6 | Print-Friendly Rendering | [02-features/12-export-import.md](../02-features/12-export-import.md) |
| F-12.7 | Custom Export Formatting | [02-features/12-export-import.md](../02-features/12-export-import.md) |

### Formulas and Calculated Columns

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-19.3 | Excel-Like Formula Support | [02-features/19-formulas-calculated.md](../02-features/19-formulas-calculated.md) |
| F-19.4 | Formula Bar UI | [02-features/19-formulas-calculated.md](../02-features/19-formulas-calculated.md) |

### Developer Experience

| Feature ID | Feature Name | Source File |
|---|---|---|
| F-22.8 | Plugin / Module System | [02-features/22-developer-experience.md](../02-features/22-developer-experience.md) |

---

> **See also**: [Appendix A: Keyboard Reference](A-keyboard-reference.md) · [Appendix B: ARIA Reference](B-aria-reference.md) · [Appendix C: Chameleon 6 Feature Parity](C-chameleon6-parity.md)
