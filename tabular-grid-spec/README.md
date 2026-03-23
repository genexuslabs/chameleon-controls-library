# Tabular Grid Specification

Comprehensive feature specification for the ultimate tabular grid component, covering four variants equally: **Data Grid**, **Tree Grid**, **Pivot Table**, and **Gantt Chart**.

This spec describes ideal feature behavior, accessibility requirements (WCAG 2.2 AAA), keyboard interaction models, and CSS subgrid layout constraints. It is derived from market analysis of 14 libraries (~177 features), the WAI-ARIA Authoring Practices Guide, and real-world usage requirements.

> **Purpose**: This spec feeds into a second specification that defines the actual `ch-tabular-grid-render` API (interfaces, events, types, methods, layout) for Chameleon 7. It must be thorough enough for test-driven development.

> **Scope**: Feature-focused, not API-focused. Each feature is specified with use cases, conditions of use, behavioral requirements (testable assertions), keyboard interaction, accessibility (ARIA + screen reader announcements), and CSS subgrid implications.

---

## How to Read This Document

### Structure

The spec is organized in four parts:

1. **Foundations** (`01-foundations/`) — Constraints and models that apply to ALL features. Read these first.
2. **Features** (`02-features/`) — The 22 feature category files, each containing multiple features specified with a consistent template.
3. **Variant-Specific** (`03-variant-specific/`) — ARIA structural models, keyboard extensions, and focus management nuances unique to each non-Data-Grid variant. The Data Grid baseline structure is in `FD-04` (Accessibility Foundation).
4. **Appendices** (`04-appendices/`) — Quick-reference tables and checklists synthesized from the feature sections.

### Cross-Reference Convention

- **`F-NN`** refers to a feature category file: `02-features/NN-*.md` (e.g., `F-07` = `02-features/07-cell-editing.md`)
- **`F-NN.M`** refers to a specific feature within a file (e.g., `F-18.4` = the 4th feature in `02-features/18-validation.md`)
- **`FD-NN`** refers to a foundation file: `01-foundations/NN-*.md` (e.g., `FD-04` = `01-foundations/04-accessibility-foundation.md`)

### Priority Tiers

Each feature is tagged with a priority tier:

- **P0 (Core)**: Must-have for any functional tabular grid. Without these, the component is not usable.
- **P1 (Standard)**: Expected in enterprise-grade grids. Most business applications require these.
- **P2 (Future)**: Competitive differentiators or specialized features. Valuable but not blocking.

All 4 variants are at equal priority level; P0/P1/P2 applies to individual features, not to variants.

### Feature Template

Every feature follows this template (conditional sections omitted when not applicable):

```
### N.N Feature Name [P0/P1/P2]
Description | Applies to | Use Cases | Conditions of Use |
Behavioral Requirements (BR-N) | Variant-Specific Behavior |
CSS Subgrid Implications | Editability Interaction |
Keyboard Interaction | Accessibility (ARIA, SR, WCAG, Visual) |
Chameleon 6 Status | Interactions (cross-references)
```

---

## Table of Contents

### Part I: Foundations

| File | Description |
|------|-------------|
| [01-layout-model.md](01-foundations/01-layout-model.md) | CSS Subgrid architecture: row elements as real grid items, column width management, frozen columns via sticky positioning, virtualization interaction |
| [02-variant-model.md](01-foundations/02-variant-model.md) | Four variant definitions with ARIA roles: Data Grid (`grid`), Tree Grid (`treegrid`), Pivot Table (`grid` + roledescription), Gantt Chart (dual-region `grid` + `application`) |
| [03-editability-model.md](01-foundations/03-editability-model.md) | Navigation mode vs edit mode, mode transitions, cell editability conditions, editor types, two-level focus model, editor lifecycle |
| [04-accessibility-foundation.md](01-foundations/04-accessibility-foundation.md) | Data Grid baseline DOM/ARIA structure, WCAG 2.2 AAA target, focus management (roving tabindex), live regions, focus within cells, virtualization focus, grouped rows, frozen columns, edge wrapping |

### Part II: Features

| # | File | Features | Description |
|---|------|----------|-------------|
| 01 | [data-display-rendering.md](02-features/01-data-display-rendering.md) | ~13 | Cell renderers, data types, formatters, tooltips, row heights, multi-level headers, spanning, styling, overlays |
| 02 | [sorting.md](02-features/02-sorting.md) | ~8 | Single/multi-column, custom comparators, tri-state cycling, locale-aware, sort indicators |
| 03 | [filtering.md](02-features/03-filtering.md) | ~7 | Inline filter row, filter types, global search, external filter, advanced builder, presets |
| 04 | [grouping-aggregation.md](02-features/04-grouping-aggregation.md) | ~7 | Row grouping, expand/collapse, aggregation functions, group footers, drag-to-group |
| 05 | [pivoting.md](02-features/05-pivoting.md) | ~7 | Pivot mode, multi-dimension, aggregation, auto-columns, dimension config, field selector |
| 06 | [tree-hierarchical.md](02-features/06-tree-hierarchical.md) | ~8 | Expand/collapse, lazy-load, indentation, carets, tri-state checkbox, reparenting, tree filter |
| 07 | [cell-editing.md](02-features/07-cell-editing.md) | ~10 | Inline/full-row editing, triggers, editor types, lifecycle, batch, clipboard paste, Enter-to-add-row |
| 08 | [selection.md](02-features/08-selection.md) | ~11 | Row/cell/column/range selection, checkbox, marking, fill handle, hover highlight |
| 09 | [column-management.md](02-features/09-column-management.md) | ~13 | Resize, reorder, pin/freeze, hide, auto-size, column menu, sizing modes, colgroup styling, collapsible groups |
| 10 | [row-management.md](02-features/10-row-management.md) | ~7 | Reorder, pin, master-detail, full-width rows, summary/footer, animation, hover actions |
| 11 | [virtualization-performance.md](02-features/11-virtualization-performance.md) | ~7 | Row/column virtualization, DOM recycling, lazy load, client pagination, large dataset support |
| 12 | [export-import.md](02-features/12-export-import.md) | ~7 | CSV/Excel/PDF export, clipboard copy with headers, print, custom formatting |
| 13 | [internationalization.md](02-features/13-internationalization.md) | ~4 | Localized strings, RTL layout, locale-aware formatting, multi-language packs |
| 14 | [keyboard-navigation.md](02-features/14-keyboard-navigation.md) | ~15 | Navigation mode, arrow keys, Enter/Escape/Tab/Home/End/PgUp/PgDn, Space, F2, Shift+F10, shortcuts |
| 15 | [theming-styling.md](02-features/15-theming-styling.md) | ~8 | CSS variables, CSS Parts, class styling, striping, density, show lines, alignment, positional parts |
| 16 | [context-menus.md](02-features/16-context-menus.md) | ~5 | Column/cell/row menus, custom items, conditional items, API |
| 17 | [undo-redo.md](02-features/17-undo-redo.md) | ~4 | Cell edit undo, structural undo, stack depth, transaction-based |
| 18 | [validation.md](02-features/18-validation.md) | ~5 | Cell-level rules, sync/async, feedback (visual + ARIA), form-level |
| 19 | [formulas-calculated.md](02-features/19-formulas-calculated.md) | ~4 | Computed columns, formula support (future), cross-cell refs (future), formula bar (future) |
| 20 | [server-side-operations.md](02-features/20-server-side-operations.md) | ~7 | Server-side row model, sort/filter/group/paginate, infinite scroll, viewport, CRUD |
| 21 | [state-persistence-responsive.md](02-features/21-state-persistence-responsive.md) | ~5 | State save/restore, storage, responsive hiding, touch/mobile, adaptive layout |
| 22 | [developer-experience.md](02-features/22-developer-experience.md) | ~8 | TypeScript, SSR, events, tool panels, external DnD, synced grids, plugins, charting (future) |

### Part III: Variant-Specific

| File | Variant | Scope |
|------|---------|-------|
| [01-gantt-chart.md](03-variant-specific/01-gantt-chart.md) | Gantt Chart | Dual-region ARIA structure, timeline bars, dependencies, zoom, milestones, critical path |
| [02-pivot-table.md](03-variant-specific/02-pivot-table.md) | Pivot Table | Multi-axis header ARIA structure, header-to-cell association, drill-down semantics |
| [03-tree-grid.md](03-variant-specific/03-tree-grid.md) | Tree Grid | `treegrid` ARIA structure, aria-level/setsize/posinset, expand/collapse focus model |

> The **Data Grid** baseline ARIA structure is defined in [FD-04: Accessibility Foundation](01-foundations/04-accessibility-foundation.md) as the foundational model that all other variants extend.

### Part IV: Appendices

| File | Description |
|------|-------------|
| [A-keyboard-reference.md](04-appendices/A-keyboard-reference.md) | Consolidated keyboard table per variant (Data Grid, Tree Grid, Pivot Table, Gantt Chart) |
| [B-aria-reference.md](04-appendices/B-aria-reference.md) | ARIA attribute quick reference: attribute, target element, when required, valid values |
| [C-chameleon6-parity.md](04-appendices/C-chameleon6-parity.md) | Every Chameleon 6 property/event/method mapped to spec section |
| [D-feature-priority.md](04-appendices/D-feature-priority.md) | All features grouped by P0/P1/P2 tier |
| [E-glossary.md](04-appendices/E-glossary.md) | Term definitions |
| [F-wcag-audit-checklist.md](04-appendices/F-wcag-audit-checklist.md) | WCAG 2.2 AAA compliance audit checklist with grid-specific pass/fail criteria |

---

## Source Materials

This spec synthesizes:

1. **Market Analysis** (`popular-tabular-grid.md`) — 177 features across 23 categories from 14 libraries (AG Grid, TanStack Table, Handsontable, MUI X, PrimeReact, Syncfusion, SlickGrid, Tabulator, DevExtreme, Kendo, Grid.js, Smart HTML Elements, TreeGrid, Bryntum)
2. **Accessibility Model** (`grid-accessibility-model.md`) — WCAG 2.2 AAA compliance for 6 grid variants, complete ARIA reference, keyboard interaction models, annotated HTML examples
3. **Brainstorming Notes** (`Tabular Grid spec.docx`) — User requirements including positional CSS Parts, column-level styling, collapsible column groups, cross-grid drag, cell interaction forwarding
4. **Chameleon 6 Implementation** — Existing properties, events (25+), methods (20+), types for carry-forward tracking
5. **Chameleon 7 In-Progress** — Lit-based architecture, CSS subgrid layout, multi-level column model
