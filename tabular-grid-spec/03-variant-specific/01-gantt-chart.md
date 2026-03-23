# VS-01: Gantt Chart — ARIA Structure, Timeline & Accessibility Model

> **Part of**: [Tabular Grid Specification](../README.md)
> **Variant**: Gantt Chart
> **Scope**: Dual-region ARIA structure, task bar accessibility, timeline interaction, dependencies, zoom, milestones, critical path, cross-region keyboard navigation

## Overview

The Gantt Chart is a dual-region component combining a task list grid with a graphical timeline. The task list uses `role="grid"` (standard grid accessibility). The timeline uses `role="application"` for its graphical interaction model. These two regions share focus in a unified keyboard navigation model.

> **CAUTION**: `role="application"` disables the screen reader's virtual/browse mode for that region, placing the burden of all keyboard interaction documentation on the component. This role MUST be applied only to the timeline `<div>`, NEVER to the entire Gantt component or the task list grid.

The baseline Data Grid ARIA structure is defined in [FD-04: Accessibility Foundation](../01-foundations/04-accessibility-foundation.md). This file specifies the complete Gantt-specific model.

---

## 1. Dual-Region DOM Structure

The Gantt Chart wraps both regions inside a landmark container so screen reader users can navigate to the component as a whole from the landmarks list.

```html
<div role="region" aria-label="Project Timeline: [project name]">

  <!-- Region 1: Task list — standard grid -->
  <div role="grid"
       aria-label="Task List"
       aria-rowcount="N"
       aria-colcount="M">
    <!-- thead, tbody rows follow standard grid pattern (see FD-04) -->
    ...
  </div>

  <!-- Region 2: Timeline — application role for graphical interaction -->
  <div role="application"
       aria-label="Timeline"
       aria-describedby="gantt-help-text">

    <div id="gantt-help-text" class="sr-only">
      Use Tab to enter the timeline. Arrow keys move between task bars.
      Arrow Left and Right adjust the task start date by one time unit.
      Shift+Arrow Left and Shift+Arrow Right adjust the task end date.
      Ctrl+Arrow Left and Ctrl+Arrow Right shift the entire task earlier or later.
      Plus and Minus keys zoom the timeline in and out.
      Press D to enter dependency creation mode.
      Press Tab or Escape to return to the task list.
    </div>

    <!-- Today marker, task bars, milestones rendered here -->
    ...

  </div>

</div>
```

### 1.1 Why `role="region"` at the Top Level

`role="region"` with a meaningful `aria-label` creates a named landmark. Screen reader users navigating by landmarks (e.g., NVDA landmark navigation, VoiceOver rotor) can jump directly to "Project Timeline: [project name]" without tabbing through unrelated page content. Without this wrapper the Gantt is invisible in the landmark tree.

### 1.2 Why `role="grid"` for the Task List

The task list is a structured table of rows and columns with navigation, sorting, and row selection. `role="grid"` is the correct semantic match. It provides:

- `aria-rowcount` / `aria-colcount` for virtual-scroll scenarios.
- Row and cell roles (`row`, `gridcell`, `columnheader`) that map to the visual structure.
- Full compatibility with screen reader table-reading commands.

The task list grid follows all patterns defined in [FD-04](../01-foundations/04-accessibility-foundation.md) without modification.

### 1.3 Why `role="application"` for the Timeline

The timeline renders task bars as positioned graphical objects whose primary interactions are:

- Dragging bars to reschedule tasks (pointer-based).
- Keyboard-driven date adjustment (custom key bindings on Arrow keys with modifiers).
- Zoom control on `+` / `-`.
- Dependency creation mode via `D`.

None of these interactions map to the reading patterns screen readers use in browse/virtual mode (which intercepts arrow keys for document navigation). Applying `role="application"` disables virtual mode for the timeline subtree, allowing the component to receive raw keyboard events and provide its own full interaction model.

**This role MUST NOT be applied to the full Gantt wrapper or the task list.** Overuse of `role="application"` is a known accessibility anti-pattern that deprives screen reader users of their familiar reading commands. It is scoped strictly to the timeline canvas.

### 1.4 Help Text via `aria-describedby`

Because `role="application"` removes the default screen reader affordances, users receive no automatic guidance about how to interact with the region. The `aria-describedby` reference to the hidden help text element ensures that when focus enters the timeline application region, screen readers announce the usage instructions automatically. This is the primary mitigation for the cognitive burden imposed by `role="application"`.

The help text element uses class `sr-only` (visually hidden, still in the accessibility tree). It MUST NOT use `aria-hidden="true"` or `display: none`.

---

## 2. Task Bar ARIA

Each task is represented by one task bar rendered at a position and width calculated from its start date, end date, and the current zoom level.

```html
<div role="button"
     aria-label="Task: Deploy Backend, Start: March 10 2024, End: March 14 2024, Duration: 5 days, Progress: 60%, Assigned to: Alice"
     aria-roledescription="task bar"
     aria-pressed="false"
     tabindex="-1"
     data-task-id="task-42">
</div>
```

### 2.1 Role

`role="button"` is used rather than a custom ARIA role or no role. Reasons:

- Task bars are activatable (Enter opens task detail; Space selects).
- `role="button"` is universally supported in screen readers.
- It communicates that the element is interactive without requiring virtual-mode navigation.

`role="button"` on a `<div>` requires explicit `tabindex` management (see Section 2.5).

### 2.2 `aria-roledescription`

`aria-roledescription="task bar"` replaces the generic "button" announcement with "task bar" when the screen reader reads the role. This gives users a domain-meaningful label ("Deploy Backend task bar") rather than "Deploy Backend button".

`aria-roledescription` MUST NOT be applied to elements whose role conveys essential information not otherwise communicated (e.g., do not apply it to `role="alert"` or `role="dialog"`). On `role="button"` in this context it is appropriate because the underlying role is still announced through the accessible name and the state properties.

### 2.3 `aria-label` Format

The `aria-label` MUST follow this template exactly:

```
Task: [name], Start: [month day year], End: [month day year], Duration: [N days], Progress: [N%][, Assigned to: [name]]
```

- Dates MUST use the long-form locale date string (e.g., "March 10 2024") for unambiguous pronunciation. Do not use ISO format (2024-03-10) in the accessible name — screen readers may read it as a subtraction expression.
- "Assigned to" is optional; omit when no assignee is set.
- Duration is computed from start and end and rounded to whole days.
- Progress is omitted when the task has no progress tracking (i.e., `progress` property is `undefined`).

When task data changes (rescheduled, progress updated), the `aria-label` MUST be updated synchronously before the live region announcement fires.

### 2.4 `aria-pressed` for Selection State

`aria-pressed="false"` indicates the task bar is not selected. `aria-pressed="true"` indicates it is selected (part of a multi-select group or the active task). This mirrors the selection pattern used in the task list grid rows.

Note: `aria-pressed` communicates a toggle state. For task bars that support multi-select (Shift+click, Shift+Space), the pressed state reflects whether this bar is part of the current selection.

### 2.5 `tabindex` Management (Roving Tabindex)

Within the `role="application"` timeline region, focus is managed via the roving tabindex pattern:

- Exactly one task bar has `tabindex="0"` at any time — the currently focused bar.
- All other task bars have `tabindex="-1"`.
- When the user presses Arrow Up / Arrow Down, focus moves to the adjacent bar and `tabindex` values are updated accordingly.
- When focus enters the timeline from the task list, `tabindex="0"` is set on the bar corresponding to the currently focused task list row.

### 2.6 Task Bar State During Keyboard Date Adjustment

When the user is adjusting a task bar with keyboard (Arrow keys):

- `aria-grabbed="true"` is set on the task bar to signal the drag/resize state.
  (`aria-grabbed` is deprecated in ARIA 1.2 but remains supported in ARIA 1.1 implementations; it MUST be included for backward compatibility alongside the live region announcement.)
- A live region (assertive) fires after each key press with the updated date information (see Section 10).
- When the operation ends (Enter to confirm, Escape to cancel), `aria-grabbed` is removed.

### 2.7 `data-task-id`

`data-task-id` stores the task's unique identifier. It is used to:

- Link back to the corresponding row in the task list grid.
- Identify the task when firing custom events (`ganttTaskMoved`, `ganttTaskResized`).
- Programmatically sync selection state between the task list and the timeline.

---

## 3. Milestone Markers

Milestones are point-in-time events with no duration. They appear as visual markers (typically a diamond shape) on the timeline.

```html
<div role="img"
     aria-label="Milestone: Beta Release, Date: March 20 2024"
     aria-roledescription="milestone"
     tabindex="-1">
</div>
```

### 3.1 Role

`role="img"` is appropriate because a milestone marker conveys meaningful visual information but does not support activation or selection interactions. It is informational, not interactive.

If milestones become interactive in a future variant (e.g., clicking a milestone opens its details), the role MUST change to `role="button"` with `aria-roledescription="milestone"`.

### 3.2 `aria-label` Format

```
Milestone: [name], Date: [month day year]
```

The date format follows the same long-form locale string requirement as task bars (Section 2.3).

### 3.3 Keyboard Reachability

Milestones MUST be keyboard-reachable within the `role="application"` region. They participate in the roving tabindex sequence alongside task bars. The Arrow Down / Arrow Up keys navigate through both task bars and milestones in top-to-bottom visual order.

When a milestone receives focus, the screen reader announces:
```
[name] milestone. [date].
```

Milestones do not support date adjustment via keyboard. Arrow Left / Right on a focused milestone navigates to the adjacent task bar or milestone; it does not move the milestone's date. (Milestone date editing is performed via the task list or a separate edit dialog.)

---

## 4. Dependency Links

Dependency arrows are rendered as SVG paths or absolutely positioned `<div>` overlays connecting task bars. They are purely visual and cannot receive keyboard focus.

### 4.1 Describing Dependencies via `aria-describedby`

Each task bar that participates in one or more dependencies MUST have an `aria-describedby` reference to a hidden description element that lists its dependencies in plain text.

```html
<!-- Task bar (Section 2 pattern) with added aria-describedby -->
<div role="button"
     aria-label="Task: User Testing, Start: March 21 2024, End: March 28 2024, Duration: 8 days, Progress: 0%"
     aria-roledescription="task bar"
     aria-describedby="task-51-deps"
     aria-pressed="false"
     tabindex="-1"
     data-task-id="task-51">
</div>

<!-- Hidden dependency description -->
<span id="task-51-deps" class="sr-only">
  Depends on: Deploy Backend (task-42), Finish-to-Start.
  Blocking: none.
</span>
```

The description element MUST use class `sr-only`. It MUST NOT use `aria-hidden="true"` or `display: none`.

### 4.2 Dependency Type Vocabulary

All dependency descriptions MUST use one of the following standardized type strings:

| Type | Description |
|------|-------------|
| Finish-to-Start | Predecessor must finish before successor can start |
| Start-to-Start | Predecessor must start before successor can start |
| Finish-to-Finish | Predecessor must finish before successor can finish |
| Start-to-Finish | Predecessor must start before successor can finish |

These strings are used verbatim in the `aria-describedby` description and in live region announcements.

### 4.3 Dependency Creation Mode (Keyboard)

Users can create dependencies using the keyboard without a pointer device.

**Entry**: Press `D` while a task bar has focus.

**Announcement on entry**:
```
Dependency mode. [task name] is the source task. Arrow Up and Arrow Down to select the target task. Press Enter to create a Finish-to-Start dependency. Tab to cycle dependency types. Escape to cancel.
```

**During selection**: Arrow Up / Down moves a visual highlight to candidate target tasks. The focused task bar announces the candidate: "[candidate name] selected as target."

**Dependency type cycling (Tab within dependency mode)**:
Tab cycles through: Finish-to-Start → Start-to-Start → Finish-to-Finish → Start-to-Finish → Finish-to-Start...
Announce on each cycle: "Dependency type: [type]."

**On Enter (confirm)**:
- Dependency is created.
- Dependency mode exits.
- `aria-describedby` description elements for both tasks are updated.
- Live region (assertive) announces: "Dependency created: [source task] must finish before [target task] starts." (or appropriate phrasing for the chosen type)

**On Escape (cancel)**:
- Dependency mode exits without changes.
- Live region (polite) announces: "Dependency creation cancelled."
- Focus returns to the source task bar.

---

## 5. Timeline Zoom

The timeline supports five zoom levels that determine the time unit of the visible columns.

| Level | Unit | Column label examples |
|-------|------|-----------------------|
| Days | 1 day per column | Mon Mar 10, Tue Mar 11 |
| Weeks | 1 week per column | Week 11, Week 12 |
| Months | 1 month per column | Mar 2024, Apr 2024 |
| Quarters | 1 quarter per column | Q1 2024, Q2 2024 |
| Years | 1 year per column | 2024, 2025 |

### 5.1 Keyboard Controls

- `+` (Plus / NumpadAdd): Zoom in — move to the next finer time unit (e.g., Months → Weeks).
- `-` (Minus / NumpadSubtract): Zoom out — move to the next coarser time unit (e.g., Weeks → Months).
- At the finest zoom level, `+` has no effect. At the coarsest zoom level, `-` has no effect.

### 5.2 Zoom Change Announcements

After each zoom change, a `aria-live="polite"` region announces:

```
Timeline zoomed to [weeks] view.
```

The live region MUST be outside both the task list grid and the timeline application region to avoid interference with their own live regions. It is typically placed inside the top-level `role="region"` wrapper but before the two sub-regions.

```html
<div role="region" aria-label="Project Timeline: [project name]">
  <div aria-live="polite" aria-atomic="true" class="sr-only" id="gantt-status">
    <!-- Zoom announcements, critical path announcements, etc. -->
  </div>
  <div role="grid" ...>...</div>
  <div role="application" ...>...</div>
</div>
```

### 5.3 Focus Preservation During Zoom

Zoom does NOT move focus. The task bar that had focus before the zoom change retains focus after the zoom change. The task bar's position and size on screen may change, but its `aria-label` is unchanged (dates are absolute, not relative to zoom level).

### 5.4 Current Zoom Level Display

The current zoom level MUST be exposed in the task list toolbar (or a dedicated controls area) as a visible status indicator. This indicator MUST also be programmatically available:

```html
<span role="status" aria-live="polite" id="gantt-zoom-level">
  Zoom: Weeks
</span>
```

When zoom changes, this element's text content is updated synchronously. Using `role="status"` (which implies `aria-live="polite"`) means it is announced without interrupting the user.

---

## 6. Today Marker

The today marker is a vertical line dividing the past from the future on the timeline canvas.

```html
<div role="separator"
     aria-orientation="vertical"
     aria-label="Today: March 16 2024"
     aria-current="date">
</div>
```

### 6.1 Role and Properties

- `role="separator"` is appropriate because the today marker is a visual divider that conveys a categorical boundary (past / present).
- `aria-orientation="vertical"` describes the orientation of the divider line.
- `aria-label` provides the human-readable date for screen reader users.
- `aria-current="date"` marks this element as the current date indicator, consistent with its semantic meaning.

### 6.2 Visual Requirements

The today marker MUST be visually distinct from task bars by at least two independent visual cues (WCAG 1.4.1 — Use of Color). Recommended: distinct color (e.g., red or blue) plus increased line weight (e.g., 2px vs 1px grid lines) plus a "Today" label at the top of the line.

### 6.3 Keyboard Reachability

The today marker is informational (`role="separator"`). It MUST NOT receive keyboard focus. It is not included in the roving tabindex sequence of the timeline application region.

---

## 7. Critical Path

The critical path is the longest sequence of dependent tasks that determines the minimum project duration. Tasks on the critical path cannot be delayed without delaying the project end date.

### 7.1 Visual Highlighting

When critical path highlighting is enabled, critical path task bars are rendered with a distinct visual treatment (e.g., red outline, bold border). At least two independent visual cues MUST be used to distinguish critical path tasks from non-critical tasks (WCAG 1.4.1).

### 7.2 Accessible Name Update for Critical Path Tasks

Task bars on the critical path MUST have their `aria-label` updated to include a "Critical path task:" prefix:

```
Critical path task: Deploy Backend, Start: March 10 2024, End: March 14 2024, Duration: 5 days, Progress: 60%, Assigned to: Alice
```

Non-critical tasks are not modified. This means a screen reader user navigating through task bars can distinguish critical from non-critical tasks from the accessible name alone, without requiring visual inspection.

### 7.3 Critical Path Recalculation Announcement

When the critical path is recalculated (e.g., after a task is rescheduled or a dependency is added), a live region MUST announce the result using `aria-live="assertive"`:

```
Critical path updated: 7 tasks on critical path.
```

`aria-live="assertive"` is used because a change to the critical path is a significant project event that the user needs to be aware of immediately, even if they are mid-interaction. This is one of the few legitimate uses of assertive live regions in this component.

### 7.4 Critical Path Mode Indicator

When critical path highlighting is active, the timeline application region MUST expose this as a description:

```html
<div role="application"
     aria-label="Timeline"
     aria-describedby="gantt-help-text gantt-cp-notice"
     ...>

  <span id="gantt-cp-notice" class="sr-only">
    Critical path highlighting is active.
  </span>

  ...
</div>
```

The `aria-describedby` value is a space-separated list of IDs. Both the help text and the critical path notice are announced when focus enters the timeline region.

---

## 8. Summary Tasks (Expandable Parent Tasks)

Summary tasks (also called parent tasks or phases) represent groups of child tasks. They appear in both the task list grid (as expandable rows) and the timeline (as wider bars spanning the full duration of their children).

### 8.1 Summary Task Bar ARIA

```html
<div role="button"
     aria-label="Summary: Phase 1 — Planning, Start: March 1 2024, End: March 31 2024, 4 child tasks"
     aria-roledescription="summary task"
     aria-expanded="true"
     tabindex="-1"
     data-task-id="task-10">
</div>
```

- `aria-roledescription="summary task"` differentiates summary bars from leaf task bars.
- `aria-expanded="true"` means the child tasks are visible in both the task list and the timeline.
- `aria-expanded="false"` means the child tasks are hidden.
- The child task count in `aria-label` ("4 child tasks") helps users understand the scope of the summary.

### 8.2 Expanded State Synchronization

The `aria-expanded` value on the summary task bar MUST always mirror the expanded/collapsed state of the corresponding row in the task list grid. When the user collapses the row in the task list (Arrow Left on the summary row or clicking the expand toggle), the timeline summary bar's `aria-expanded` MUST update to `"false"` synchronously.

### 8.3 Child Task Bar Visibility

When a summary task is collapsed:

- Child task bars in the timeline MUST either be removed from the DOM or have `aria-hidden="true"` set.
- Both approaches are acceptable; DOM removal is preferred for performance in large datasets.
- Removing from the DOM also removes from the accessibility tree automatically.
- If using `aria-hidden="true"`, child bars MUST also have `tabindex="-1"` to prevent focus reaching hidden elements.

### 8.4 `aria-owns` Not Used

`aria-owns` is explicitly NOT used to link summary bars to their child bars. The positional relationship of parent and child bars on the timeline canvas is sufficient for visual users, and the accessible relationship is conveyed through the task list grid's standard tree/group row structure (see [FD-04](../01-foundations/04-accessibility-foundation.md)) and the `aria-label` child count on the summary bar.

Overuse of `aria-owns` can cause screen reader announcement issues and creates implicit expectations about navigation order that conflict with the roving tabindex model in the timeline.

### 8.5 Collapse/Expand Interaction

Summary task bars support collapse and expand via:

| Input | Action |
|-------|--------|
| Enter or Space on summary bar | Toggle expanded/collapsed state |
| Arrow Left on focused summary bar in task list | Collapse (if expanded) |
| Arrow Right on focused summary bar in task list | Expand (if collapsed) |

After toggle, live region (polite) announces: "Phase 1 — Planning collapsed. 4 child tasks hidden." or "Phase 1 — Planning expanded. 4 child tasks shown."

---

## 9. Cross-Region Navigation (Task List ↔ Timeline)

The task list and timeline are two separate focusable regions that share a conceptual selection model. Keyboard navigation between them MUST be seamless and predictable.

### 9.1 From Task List to Timeline

**Trigger**: Tab from any cell in the last focused row of the task list grid.

**Behavior**:
1. Focus enters the `role="application"` timeline region.
2. The `aria-describedby` help text is announced by the screen reader (describes available key bindings).
3. Focus moves to the task bar corresponding to the currently focused/selected task list row.
4. If no row is currently focused or selected, focus moves to the first visible task bar in the viewport.
5. The focused task bar's `tabindex` is set to `"0"`; all others revert to `"-1"`.

**Announcement** (from the task bar's accessible name and roledescription):
```
[task name] task bar. [aria-label content]. Use Arrow keys to adjust dates, Plus and Minus to zoom.
```

(The trailing usage hint is provided by the help text announced on entry to the application region, not repeated on each focus change within the region.)

### 9.2 From Timeline to Task List

**Trigger 1 — Tab from timeline**:
- Focus exits the timeline application region and moves to the next focusable element in document order, which is typically either the task list or the next page-level element.
- If the task list follows the timeline in DOM order (or precedes it), focus goes there.

**Trigger 2 — Escape from timeline**:
- Focus returns explicitly to the task list.
- The task list row corresponding to the currently focused task bar receives focus.
- Focus within the task list moves to the first cell (usually the task name cell) of the corresponding row.
- Live region (polite) announces: "Returned to task list. [task name] row."

### 9.3 Escape Behavior Hierarchy

Within the timeline application region, Escape follows a priority hierarchy:

1. If a dependent operation is active (dependency creation mode, drag mode via keyboard): cancel that operation.
2. If a task bar date adjustment is in progress (user has pressed Arrow keys but not confirmed): revert to original dates.
3. If none of the above: exit the timeline and return focus to the task list.

This hierarchy ensures Escape is never ambiguous.

### 9.4 Row–Bar Correspondence and Programmatic Sync

Each task list row and its corresponding timeline task bar are linked by `data-task-id`. When selection changes in either region:

- Selecting a row in the task list causes the corresponding task bar to receive the selected visual treatment (and `aria-pressed="true"`).
- Selecting a task bar in the timeline causes the corresponding task list row to receive the selected visual treatment (and its `aria-selected="true"`).

The `aria-controls` attribute MAY be placed on the task list row to formally link it to the task bar:

```html
<!-- Task list row -->
<tr role="row" aria-selected="false" aria-controls="task-bar-42">
  ...
</tr>

<!-- Corresponding task bar in timeline -->
<div role="button"
     id="task-bar-42"
     aria-label="Task: Deploy Backend, ..."
     aria-roledescription="task bar"
     ...>
</div>
```

`aria-controls` is optional here (it has inconsistent support across screen readers), but it provides a programmatic association that authoring tools and testing frameworks can verify.

---

## 10. Keyboard Interaction in Timeline (`role="application"`)

The following table is the normative keyboard map for the timeline region. All key bindings operate only when the `role="application"` region has focus. They have no effect outside that region.

| Key | Action |
|-----|--------|
| Arrow Left | Move focused task bar start date earlier by 1 unit (current zoom unit: day / week / month / quarter / year) |
| Arrow Right | Move focused task bar start date later by 1 unit |
| Shift+Arrow Left | Move focused task bar end date earlier by 1 unit (shortens the task) |
| Shift+Arrow Right | Move focused task bar end date later by 1 unit (extends the task) |
| Ctrl+Arrow Left | Shift the entire task (start AND end) earlier by 1 unit — maintains duration |
| Ctrl+Arrow Right | Shift the entire task (start AND end) later by 1 unit — maintains duration |
| Arrow Up | Move focus to the previous task bar or milestone in top-to-bottom visual order |
| Arrow Down | Move focus to the next task bar or milestone in top-to-bottom visual order |
| + (Plus / NumpadAdd) | Zoom in the timeline (finer time unit) |
| - (Minus / NumpadSubtract) | Zoom out the timeline (coarser time unit) |
| Enter | Activate the focused task bar — opens task detail panel or edit dialog |
| Space | Toggle selection of the focused task bar (multi-select with Shift+Space) |
| Shift+Space | Extend selection to the focused task bar (range select from last selected bar) |
| D | Enter dependency creation mode (see Section 4.3) |
| Escape | Cancel current operation OR return focus to task list (see Section 9.3) |
| Tab | Move focus to next focusable element outside the timeline (exits the application region) |
| Shift+Tab | Move focus to previous focusable element outside the timeline (exits the application region) |
| Home | Move focus to the first task bar in the timeline |
| End | Move focus to the last task bar in the timeline |
| Page Up | Scroll the timeline one viewport-width earlier in time (does not move task bar focus) |
| Page Down | Scroll the timeline one viewport-width later in time (does not move task bar focus) |

### 10.1 Live Region Announcements for Date Adjustment

After each key press that adjusts a task bar date (Arrow Left, Arrow Right, Shift+Arrow Left, Shift+Arrow Right, Ctrl+Arrow Left, Ctrl+Arrow Right), an assertive live region fires:

```
Task: Deploy Backend. Start: March 9 2024. End: March 13 2024. Duration: 5 days.
```

The announcement format is:
```
Task: [name]. Start: [new start date]. End: [new end date]. Duration: [N days].
```

- `aria-live="assertive"` is used because the user is actively adjusting dates and needs immediate confirmation of each change.
- `aria-atomic="true"` ensures the full announcement is read rather than just the changed portion.
- The live region is updated AFTER the task bar's `aria-label` is updated, so the accessible name and the live announcement are always consistent.

### 10.2 Multi-Select in the Timeline

When multiple task bars are selected (Shift+Space range select or Ctrl+Space toggle):

- Each selected bar has `aria-pressed="true"`.
- The live region announces: "[N] tasks selected." after each selection change.
- Keyboard date adjustment (Arrow keys) applies to ALL selected task bars simultaneously.
- Live region announces: "[N] tasks moved. New dates vary."

---

## 11. Normative Requirements

The following requirements are normative. Implementations MUST satisfy all GC-NN requirements. Requirements marked SHOULD indicate strong recommendations.

### GC-01 — Region Wrapper

The Gantt Chart component MUST render a `role="region"` wrapper element with an `aria-label` that includes the project name in the format `"Project Timeline: [project name]"`. This creates a named landmark for screen reader navigation.

### GC-02 — Task List Grid Role

The task list sub-region MUST use `role="grid"` with `aria-label="Task List"`, `aria-rowcount`, and `aria-colcount` attributes set to the total row and column counts respectively (including rows and columns not in the DOM due to virtual scrolling).

### GC-03 — Timeline Application Role

The timeline sub-region MUST use `role="application"`. This role MUST be applied only to the timeline canvas `<div>`, NOT to the full Gantt component, NOT to the task list grid, and NOT to any ancestor element that contains both regions.

### GC-04 — Help Text via `aria-describedby`

The timeline `role="application"` element MUST have an `aria-describedby` attribute referencing a visually hidden element that describes all keyboard interactions available in the timeline region. The referenced element MUST be present in the DOM, MUST NOT have `aria-hidden="true"`, and MUST NOT have `display: none` or `visibility: hidden`.

### GC-05 — Task Bar Role

Every task bar in the timeline MUST use `role="button"`. No custom ARIA role is permitted for task bars.

### GC-06 — Task Bar `aria-roledescription`

Every task bar MUST have `aria-roledescription="task bar"`. This value is case-sensitive and MUST be exactly this string.

### GC-07 — Task Bar `aria-label` Format

Every task bar `aria-label` MUST use the format: `"Task: [name], Start: [long-form date], End: [long-form date], Duration: [N days], Progress: [N%][, Assigned to: [name]]"`. Dates MUST be in long-form locale string format (e.g., "March 10 2024"). ISO date format MUST NOT be used in accessible names.

### GC-08 — Task Bar Selection State

Every task bar MUST use `aria-pressed="false"` when not selected and `aria-pressed="true"` when selected. No other ARIA attribute is used to convey selection state on task bars.

### GC-09 — Milestone Role

Every milestone marker MUST use `role="img"` with `aria-roledescription="milestone"` and an `aria-label` in the format `"Milestone: [name], Date: [long-form date]"`.

### GC-10 — Milestone Keyboard Reachability

Milestones MUST participate in the roving tabindex sequence within the `role="application"` timeline region. A keyboard-only user MUST be able to navigate to every milestone using Arrow Up and Arrow Down.

### GC-11 — Dependency Description

Every task bar that has one or more dependencies (as predecessor or successor) MUST have `aria-describedby` referencing a visually hidden element that lists all dependencies in plain text using the vocabulary defined in Section 4.2.

### GC-12 — Zoom Live Region

Every zoom level change MUST trigger an announcement in a `aria-live="polite"` region with the text `"Timeline zoomed to [unit] view."` where `[unit]` is one of: days, weeks, months, quarters, years.

### GC-13 — Focus Preservation on Zoom

A zoom level change MUST NOT move keyboard focus. The task bar or milestone that had focus before the zoom change MUST retain focus after the zoom change.

### GC-14 — Critical Path Announcement

When critical path highlighting is enabled or recalculated, a `aria-live="assertive"` region MUST announce `"Critical path updated: [N] tasks on critical path."` where `[N]` is the count of tasks on the critical path.

### GC-15 — Critical Path Task Bar Naming

Task bars that are on the critical path MUST have their `aria-label` updated to use the prefix `"Critical path task:"` instead of `"Task:"`. This update MUST occur synchronously when critical path highlighting is applied.

### GC-16 — Today Marker

The today marker MUST be rendered as `role="separator"` with `aria-orientation="vertical"`, an `aria-label` containing the current date in long-form locale string format, and `aria-current="date"`. The today marker MUST NOT receive keyboard focus.

### GC-17 — Summary Task `aria-expanded`

Summary task bars MUST use `aria-roledescription="summary task"` and MUST have `aria-expanded="true"` when their child tasks are visible and `aria-expanded="false"` when their child tasks are hidden. The `aria-expanded` value MUST always mirror the expanded state of the corresponding task list row.

### GC-18 — Child Bar Visibility on Collapse

When a summary task is collapsed, all child task bars in the timeline MUST be either removed from the DOM or have `aria-hidden="true"` set. A collapsed child task bar MUST NOT be reachable by keyboard.

### GC-19 — Tab Navigation Between Regions

Tab from the task list grid MUST move focus into the `role="application"` timeline region. The first task bar to receive focus MUST correspond to the currently selected or focused task list row. If no row is selected, focus MUST move to the first visible task bar.

### GC-20 — Escape from Timeline

Escape pressed in the `role="application"` timeline region when no operation is active MUST return focus to the task list. Focus in the task list MUST move to the first cell of the row corresponding to the task bar that was focused in the timeline before Escape was pressed.

### GC-21 — Date Adjustment Live Region

After each keyboard date adjustment (any Arrow key or Ctrl+Arrow combination) on a task bar, an `aria-live="assertive"` region MUST fire with the format: `"Task: [name]. Start: [new date]. End: [new date]. Duration: [N days]."` The live region update MUST occur after the task bar's `aria-label` is updated.

### GC-22 — Touch Target Size

All interactive task bar drag handles and resize handles MUST meet WCAG 2.5.5 Target Size (Enhanced): a minimum target size of 44×44 CSS pixels. If a drag handle is visually smaller than 44×44px, an invisible touch target overlay of at least 44×44px MUST be provided. This requirement applies to pointer-based interactions; keyboard date adjustment via Arrow keys is always available as an alternative.

---

*This file is part of the Chameleon 7 Tabular Grid Specification. See [README.md](../README.md) for the complete table of contents.*
