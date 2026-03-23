# F-18: Validation

> **Part of**: [Tabular Grid Specification](../README.md)
> **Feature category**: Validation
> **Variants**: All (Data Grid, Tree Grid, Pivot Table, Gantt Chart)

## Overview
Validation ensures data integrity for cell edits. Validation rules run synchronously or asynchronously; feedback is provided visually and via ARIA live regions for screen readers.

---

### 18.1 Cell-Level Validation Rules [P1]

**Description**: Each column definition can specify one or more validation rules that run when a cell value is committed. Rules accept the new value, the full row record, and the column definition, and return either a synchronous result or a Promise. Multiple rules can be composed into an array and are evaluated in order; the first failure short-circuits evaluation.

**Applies to**: All variants

**Use Cases**
- UC-1: A "Quantity" column requires a positive integer; the user types `-5` and the cell is marked invalid with the message "Must be a positive number".
- UC-2: A "Email" column applies the built-in `email()` validator; typing `not-an-email` shows "Invalid email address".
- UC-3: A column composes `[required(), minLength(3), pattern(/^[A-Z]/)]` to enforce multiple constraints on a product code field.
- UC-4: A custom rule checks that a start date is not after an end date on the same row.

**Conditions of Use**
- `validate` is specified in a column definition object.
- Rules only run when the column's `editable` flag is `true` (or the column is otherwise editable).
- Rules are triggered by every `cellValueChange` event (value committed by the user).
- Composed rules in an array are evaluated left to right; evaluation stops at the first failure.

**Behavioral Requirements**
- BR-1: The grid SHALL accept a `validate` property on column definitions with the signature `(value: any, row: RowData, col: ColDef) => ValidationResult | Promise<ValidationResult>`.
- BR-2: The grid SHALL accept an array form `validate: Rule[]` and evaluate rules in declared order, stopping at the first invalid result.
- BR-3: `ValidationResult` SHALL have the shape `{ valid: boolean, message?: string }`.
- BR-4: The grid SHALL provide the following built-in validator factories: `required()`, `min(n)`, `max(n)`, `minLength(n)`, `maxLength(n)`, `pattern(regex)`, `email()`, `url()`.
- BR-5: The grid SHALL run validation rules on every `cellValueChange` event when the column has a `validate` definition.
- BR-6: When validation fails, the grid SHALL mark the cell as invalid and surface the error message per F-18.4.
- BR-7: The grid SHALL prevent the containing row from being committed (saved) while any cell in that row is in an invalid state.
- BR-8: When all invalid cells in a row are corrected, the row SHALL become committable without further user action.

**Editability Interaction**
Validation rules are only evaluated for editable cells. Read-only cells and computed columns (F-19.1) skip validation unless `editable: true` is explicitly set with a matching `valueSetter`.

**Chameleon 6 Status**: New feature (Chameleon 6 had no built-in validation)

**Interactions**: F-18.2 (synchronous rule execution path), F-18.3 (asynchronous rule execution path), F-18.4 (error feedback rendering), F-18.5 (form-level aggregation), F-07 (cell editing lifecycle), FD-03 (editability foundation)

---

### 18.2 Synchronous Validation [P1]

**Description**: Synchronous validators return a `ValidationResult` directly (not wrapped in a Promise). When a synchronous rule fails, the cell immediately enters an error state and focus is prevented from leaving the cell, forcing the user to correct the value or cancel the edit. Error feedback is rendered inline without any loading state.

**Applies to**: All variants

**Use Cases**
- UC-1: A required field is left blank; pressing Tab keeps focus in the cell and shows "This field is required".
- UC-2: A numeric field receives a letter; the synchronous `pattern` validator fires instantly and blocks commit.
- UC-3: The user presses Escape to cancel the edit; the cell reverts to its previous value and clears the error.

**Conditions of Use**
- At least one synchronous (non-Promise-returning) rule must be configured on the column.
- Synchronous validation runs during the `beforeCellCommit` phase, before the value is written to the data model.
- Pressing Escape while in an error state cancels the edit and restores the previous value.

**Behavioral Requirements**
- BR-1: The grid SHALL fire a cancelable `beforeCellCommit` event with `{ value, previousValue, row, col }` before committing any cell value.
- BR-2: When a synchronous validator returns `{ valid: false }`, the grid SHALL call `event.preventDefault()` internally on `beforeCellCommit` and keep the cell in edit mode.
- BR-3: The grid SHALL display the error message inline adjacent to the cell editor while the cell remains in edit mode.
- BR-4: The grid SHALL prevent focus from moving to another cell while the cell is in a synchronous validation failure state.
- BR-5: Pressing Escape while in a synchronous validation failure state SHALL cancel the edit, restore the previous cell value, clear the error state, and release focus normally.
- BR-6: The grid SHALL not write an invalid value to the data model at any point during synchronous validation failure.
- BR-7: When the user modifies the value in the cell while in error state, the grid SHALL re-run synchronous validators and clear the error if the new value is valid.

**Keyboard Interaction**
| Key | Action | Mode |
|-----|--------|------|
| Tab / Shift+Tab | Attempts commit; blocked if synchronous validation fails | Edit mode |
| Enter | Attempts commit; blocked if synchronous validation fails | Edit mode |
| Escape | Cancel edit, restore previous value, clear error, release focus | Edit mode with validation error |

**Accessibility**
- **ARIA**: The cell editor input SHALL have `aria-invalid="true"` while a synchronous error is active. The error message element SHALL have `role="tooltip"` with an `id` referenced by `aria-describedby` on the input.
- **Screen Reader**: SR: "Error: [column name] — [error message]" announced via an assertive ARIA live region when the error first appears.
- **WCAG**: 3.3.1 Error Identification (Level A), 3.3.3 Error Suggestion (Level AA).
- **Visual**: The cell editor SHALL display a non-color indicator (e.g., error icon, thickened border) alongside any color change to satisfy WCAG 1.4.1.

**Chameleon 6 Status**: New feature

**Interactions**: F-18.1 (rule definition), F-18.4 (error feedback rendering), F-07 (cell editing lifecycle and beforeCellCommit event), F-14 (keyboard navigation blocked during error state)

---

### 18.3 Asynchronous / Server-Side Validation [P1]

**Description**: Async validators return a `Promise<ValidationResult>`, enabling server-side checks such as uniqueness constraints or external business rule evaluation. The cell exits edit mode immediately but is placed in a "pending validation" state with a visual loading indicator while the Promise is in flight. On settlement, the cell transitions to either a valid or error state.

**Applies to**: All variants

**Use Cases**
- UC-1: A "Username" column checks uniqueness against the server; a spinner is shown while the request is in flight.
- UC-2: A product code field validates against an external catalog; if the server returns invalid, the cell re-enters an error state after commit.
- UC-3: A slow server takes longer than the configured `validationTimeout`; the value is tentatively accepted and a `validationTimeout` event is fired.
- UC-4: Multiple cells are committed in rapid succession; each pending validation is tracked independently.

**Conditions of Use**
- At least one async (Promise-returning) rule must be configured on the column.
- The cell exits edit mode on commit regardless of pending validation; the loading indicator is rendered on the committed (non-edit) cell.
- `validationTimeout` defaults to `5000` ms if not specified.
- If the Promise rejects (throws), the grid treats the result as `{ valid: false, message: 'Validation error' }` and fires a `validationError` event.

**Behavioral Requirements**
- BR-1: The grid SHALL accept async validators that return `Promise<ValidationResult>` using the same `validate` property as synchronous rules.
- BR-2: While an async validator Promise is pending, the grid SHALL render a loading indicator on the cell and set a `validating` CSS part/class on the cell element.
- BR-3: While pending, the cell SHALL be in a "pending validation" state: not in edit mode, but not yet marked as valid or invalid.
- BR-4: When the Promise resolves with `{ valid: false }`, the grid SHALL place the cell into error state with the provided message per F-18.4.
- BR-5: When the Promise resolves with `{ valid: true }`, the grid SHALL clear any pending or error state from the cell.
- BR-6: The grid SHALL accept `validationTimeout: number` (milliseconds) on the grid or column definition. If the Promise has not settled within this duration, the grid SHALL treat the result as valid, fire a `validationTimeout` event carrying `{ row, col }`, and remove the loading indicator.
- BR-7: If the async validator Promise rejects, the grid SHALL treat the result as `{ valid: false, message: 'Validation error' }` and fire a `validationError` event carrying `{ row, col, error }`.
- BR-8: Multiple cells across different rows MAY have concurrent pending validations; each cell's state is tracked independently.
- BR-9: The grid SHALL cancel any pending validation Promise for a cell if the cell's row is removed from the data set before the Promise settles.

**Accessibility**
- **ARIA**: The pending cell SHALL have `aria-busy="true"` while the validation Promise is in flight. On settlement, `aria-busy` SHALL be removed. `aria-invalid` follows the settled result per F-18.4.
- **Screen Reader**: SR: "[column name] — validating" announced via a polite live region when the cell enters pending state. Settlement announcements follow F-18.4.
- **WCAG**: 4.1.3 Status Messages (Level AA) — the pending/loading status must be programmatically determinable without moving focus.
- **Visual**: The loading indicator SHALL not rely solely on color; a spinner animation or explicit text "Validating…" SHALL be visible.

**Chameleon 6 Status**: New feature

**Interactions**: F-18.1 (rule definition and composition), F-18.4 (error feedback on rejection), F-18.5 (form-level validate waits for all pending Promises before resolving), F-07 (cell editing lifecycle)

---

### 18.4 Validation Feedback (Visual + ARIA) [P1]

**Description**: Invalid cells display a coordinated set of visual and programmatic signals so that all users — including those relying on screen readers or high-contrast modes — can identify errors and understand the corrective action required. Feedback is rendered without requiring focus to return to the cell, and an assertive ARIA live region announces the error and its clearance.

**Applies to**: All variants

**Use Cases**
- UC-1: A cell fails validation; a red border, an error icon, and a tooltip-style error message all appear simultaneously.
- UC-2: A screen reader user commits an invalid value; the assistive technology announces "Error: Quantity — Must be a positive number" without any manual navigation.
- UC-3: The user corrects the value; the error indicator disappears and the live region announces "Error cleared".
- UC-4: A consumer with `showValidSuccess: true` configured sees a green check icon on successfully validated cells.

**Conditions of Use**
- Error feedback is shown on any cell that has failed validation (synchronous or asynchronous).
- Valid state does not show any indicator unless `showValidSuccess: true` is explicitly set on the grid or column.
- Error message color and icon must meet WCAG 1.4.3 contrast requirements.
- The error tooltip/popover is dismissed when the cell is corrected or when `Escape` is pressed while focus is in the cell.

**Behavioral Requirements**
- BR-1: Invalid cells SHALL display a non-color visual indicator (e.g., error icon, pattern border, or shape) in addition to any color change to satisfy WCAG 1.4.1.
- BR-2: The error message SHALL be rendered in a popover element with `role="tooltip"` and a unique `id`, linked to the cell's editor input via `aria-describedby`.
- BR-3: The cell's editor input SHALL have `aria-invalid="true"` when the cell is invalid.
- BR-4: The grid SHALL maintain an assertive ARIA live region (`aria-live="assertive"`) outside the grid table; when a cell becomes invalid, the grid SHALL inject "Error: [column name] — [error message]" into this region.
- BR-5: When a cell transitions from invalid to valid, the grid SHALL inject "Error cleared" into the assertive live region and remove `aria-invalid`.
- BR-6: Error message text color SHALL meet WCAG 1.4.3 minimum contrast ratio of 4.5:1 against its background (7:1 for AAA-targeted deployments).
- BR-7: The grid SHALL accept `showValidSuccess: boolean` (default `false`); when `true`, valid cells that have passed explicit validation SHALL display a success indicator.
- BR-8: The error popover SHALL be positioned to avoid viewport overflow; it SHALL reposition dynamically if the cell scrolls close to the viewport edge.
- BR-9: The grid SHALL expose CSS parts `cell--invalid`, `cell--valid`, `cell--validating` for consumer theming of validation states.
- BR-10: The error popover SHALL be associated with the triggering cell via a stable DOM relationship, not solely via visual proximity.

**Accessibility**
- **ARIA**: Invalid cells SHALL have `aria-invalid="true"` on the editor input. Error message containers SHALL use `role="tooltip"` linked via `aria-describedby`. The assertive live region SHALL have `aria-atomic="true"` to ensure full message announcement.
- **Screen Reader**: SR: "Error: [column name] — [error message]" on cell becoming invalid. SR: "Error cleared" on cell becoming valid.
- **WCAG**: 1.4.1 Use of Color (Level A), 1.4.3 Contrast — Minimum (Level AA), 3.3.1 Error Identification (Level A), 3.3.3 Error Suggestion (Level AA).
- **Visual**: The non-color indicator (icon or border style) SHALL remain visible in Windows High Contrast Mode and forced-colors environments.

**Chameleon 6 Status**: New feature

**Interactions**: F-18.2 (synchronous path populates feedback), F-18.3 (async path populates feedback on settlement), F-18.5 (form-level validation highlights all invalid cells simultaneously), F-15 (CSS parts for theming), FD-03 (accessibility foundations)

---

### 18.5 Form-Level Validation [P1]

**Description**: A form-level API allows consumers to trigger validation across all editable cells at once, retrieve a structured report of all errors, and integrate the grid with native HTML form submission. The overall valid/invalid state is surfaced through an event and a programmatic method so that surrounding form UI can react (e.g., disabling a Submit button).

**Applies to**: All variants

**Use Cases**
- UC-1: A "Save All" button calls `grid.validate()` before submitting; the returned `ValidationReport` lists every row and column with errors.
- UC-2: All invalid cells are highlighted simultaneously so the user can see the full extent of errors in one pass.
- UC-3: A consumer wraps the grid in an HTML `<form>` and calls `grid.reportValidity()` to trigger native browser validation UI.
- UC-4: After fixing all errors, the consumer calls `grid.clearValidation()` to reset all error states before a fresh submission.

**Conditions of Use**
- `grid.validate()` runs all validators for all cells that have a `validate` rule defined.
- Async validators are awaited; `grid.validate()` returns a Promise that resolves only when all async validators have settled.
- `grid.clearValidation()` removes all error indicators but does not reset cell values.
- `validationChange` fires only when the overall valid state transitions (invalid → valid or valid → invalid), not on every individual cell change.

**Behavioral Requirements**
- BR-1: The grid SHALL expose `grid.validate(): Promise<ValidationReport>` that runs all validators for all editable cells and resolves with the aggregated result.
- BR-2: `ValidationReport` SHALL have the shape `{ valid: boolean, errors: Array<{ rowId: string, colId: string, message: string }> }`.
- BR-3: When `grid.validate()` is called, the grid SHALL highlight all invalid cells simultaneously using the same feedback mechanism as F-18.4.
- BR-4: The grid SHALL expose `grid.clearValidation()` which removes all validation error states from all cells without altering cell values.
- BR-5: The grid SHALL expose `grid.getInvalidCells(): Array<{ rowId: string, colId: string, message: string }>` as a synchronous snapshot of the current invalid cell set.
- BR-6: The grid SHALL fire a `validationChange` event with `{ valid: boolean }` when the overall grid validity transitions between valid and invalid states.
- BR-7: The grid SHALL expose `grid.reportValidity(): boolean` for HTML form integration; this method SHALL trigger the same highlighting as `grid.validate()` (synchronous rules only) and return `false` when any cell is invalid.
- BR-8: When `grid.validate()` is awaited and all validators pass, the returned `ValidationReport.valid` SHALL be `true` and `errors` SHALL be an empty array.
- BR-9: `grid.validate()` SHALL wait for all pending async validation Promises (F-18.3) before resolving.

**Accessibility**
- **ARIA**: When `grid.validate()` highlights multiple invalid cells, each cell SHALL individually receive `aria-invalid="true"` per F-18.4. The assertive live region SHALL announce a summary: "Validation complete. [N] error(s) found." followed by the individual cell announcements.
- **Screen Reader**: SR: "Validation complete. [N] error(s) found." announced assertively after `grid.validate()` settles.
- **WCAG**: 3.3.1 Error Identification (Level A), 3.3.3 Error Suggestion (Level AA), 4.1.3 Status Messages (Level AA).
- **Visual**: The batch highlighting of invalid cells SHALL use the same non-color indicators as individual cell validation (F-18.4) and SHALL be visible in high-contrast modes.

**Chameleon 6 Status**: New feature

**Interactions**: F-18.1 (rules run per column definition), F-18.3 (async rules awaited by validate()), F-18.4 (feedback mechanism reused for batch highlighting), F-07 (cell editing lifecycle informs current cell state), F-12 (export can be gated on grid.validate() result)

---

## Normative Requirements

The following normative requirements summarize the binding rules for the Validation feature. Each requirement is uniquely identified for traceability.

| ID | Requirement |
|----|-------------|
| VL-01 | The grid SHALL accept a `validate` property on column definitions with the signature `(value: any, row: RowData, col: ColDef) => ValidationResult \| Promise<ValidationResult>`. |
| VL-02 | The grid SHALL accept an array form `validate: Rule[]` and evaluate rules in declared order, stopping at the first failure. |
| VL-03 | `ValidationResult` SHALL have the shape `{ valid: boolean, message?: string }`. |
| VL-04 | The grid SHALL provide built-in validator factories: `required()`, `min(n)`, `max(n)`, `minLength(n)`, `maxLength(n)`, `pattern(regex)`, `email()`, `url()`. |
| VL-05 | The grid SHALL run validation rules on every `cellValueChange` event for columns with a `validate` definition. |
| VL-06 | The grid SHALL fire a cancelable `beforeCellCommit` event with `{ value, previousValue, row, col }` before committing any cell value. |
| VL-07 | When a synchronous validator returns `{ valid: false }`, the grid SHALL keep the cell in edit mode and prevent focus from leaving the cell. |
| VL-08 | The grid SHALL not write an invalid value to the data model at any point during a synchronous validation failure. |
| VL-09 | Pressing Escape during a synchronous validation error SHALL cancel the edit, restore the previous value, clear the error, and release focus normally. |
| VL-10 | The grid SHALL render a loading indicator and set `aria-busy="true"` on a cell while an async validation Promise is in flight. |
| VL-11 | If an async validation Promise does not settle within `validationTimeout` milliseconds, the grid SHALL treat the result as valid and fire a `validationTimeout` event. |
| VL-12 | If an async validation Promise rejects, the grid SHALL treat the result as `{ valid: false, message: 'Validation error' }` and fire a `validationError` event. |
| VL-13 | Invalid cells SHALL display a non-color visual indicator (icon, pattern border, or shape) in addition to any color change, satisfying WCAG 1.4.1. |
| VL-14 | Invalid cell editor inputs SHALL have `aria-invalid="true"`; the associated error message element SHALL have `role="tooltip"` linked via `aria-describedby`. |
| VL-15 | The grid SHALL maintain an assertive ARIA live region; cell becoming invalid SHALL inject "Error: [column name] — [error message]"; cell becoming valid SHALL inject "Error cleared". |
| VL-16 | Error message text color SHALL meet a minimum contrast ratio of 4.5:1 (WCAG 1.4.3 AA) against its background. |
| VL-17 | The grid SHALL expose `grid.validate(): Promise<ValidationReport>` that runs all validators, awaits all async validators, and returns `{ valid: boolean, errors: Array<{ rowId, colId, message }> }`. |
| VL-18 | The grid SHALL expose `grid.clearValidation()` which removes all validation error states without altering cell values. |
| VL-19 | The grid SHALL expose `grid.getInvalidCells(): Array<{ rowId, colId, message }>` as a synchronous snapshot of the current invalid cell set. |
| VL-20 | The grid SHALL fire a `validationChange` event with `{ valid: boolean }` when the overall grid validity transitions between valid and invalid states. |

---
*This file is part of the Chameleon 7 Tabular Grid Specification. See [README.md](../README.md) for the complete table of contents.*
