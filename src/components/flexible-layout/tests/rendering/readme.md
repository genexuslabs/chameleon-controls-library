# Widget Rendering & Content Projection Tests

Tests validating how `ch-flexible-layout-render` renders widget content via **slots** (user-provided projection) or **renders** (function-based rendering).

**Note:** Some tests use `.spec.tsx` (instead of `.e2e.ts`) because the `renders` prop requires JavaScript functions, which Puppeteer cannot serialize.

## How Rendering Works

```typescript
#widgetIsSlotted = (widgetInfo: FlexibleLayoutWidget) =>
  widgetInfo.slot ?? this.slottedWidgets;
```

- `widget.slot` defined → uses that value
- `widget.slot` undefined → uses `slottedWidgets` (defaults to `false`)

## Configuration Combinations

### `type="single-content"`

| `slottedWidgets` | `widget.slot` | Result | Test Files |
|------------------|---------------|--------|------------|
| `false` (default) | `true` | slot | slots, content-projection |
| `false` (default) | `false` | renders | renders, content-projection |
| `false` (default) | `undefined` | renders | renders, content-projection |
| `true` | `true` | slot | slots, content-projection |
| `true` | `false` | renders | renders, content-projection |
| `true` | `undefined` | slot | slots, content-projection |

### `type="tabbed"`

Same logic. Representative cases only (multiple widgets, selected tab rendered, tab switching).

| `slottedWidgets` | `widget.slot` | Result | Test Files |
|------------------|---------------|--------|------------|
| `false` (default) | `true` | slot | slots, content-projection |
| `false` (default) | `false` | renders | renders, content-projection |
| `true` | `undefined` | slot | slots, content-projection |

---

## Content Projection

Validates content reaches final destination through all shadow DOM levels.

### [`content-projection.e2e.ts`](content-projection.e2e.ts)

**Slotted content projection (E2E)**

- Uses `assignedNodes({ flatten: true })` and `assignedSlot` to verify actual DOM projection
- Tests single-content and tabbed leaves
- Covers `widget.id === leaf.id` cases

**Cases:**
- Single-content: content projects through shadow boundaries
- Tabbed: selected tab projects, non-selected tabs NOT assigned

### [`content-projection.spec.tsx`](content-projection.spec.tsx)

**Renders-based content projection (Spec)**

- Validates `renders` functions produce content that reaches destination
- Tests single-content and tabbed leaves
- Covers `widget.id === leaf.id` cases

**Cases:**
- Single-content: rendered content with correct slot attributes
- Tabbed: selected tab rendered, non-selected tabs NOT rendered, `ch-tab-render` present

---

## Renders

Validates `renders` property behavior and function execution.

### [`renders.spec.tsx`](renders.spec.tsx)

**Render function execution and element creation (Spec)**

- Tests all `slottedWidgets` and `widget.slot={false}` / `undefined` combinations
- Validates functions execute and DOM elements created
- Tests mixing slots and renders
- Tests lifecycle: only selected tab rendered initially
- Tests `renderedWidgetsChange` event
- Covers `widget.id === leaf.id` cases

**Validations:**
- Functions execute when `widget.slot={false}` or renders override `slottedWidgets`
- Content appears with correct slot attributes
- Lazy rendering for tabbed leaves
- Events fire correctly

---

## Slots

Validates slot element creation and attributes.

### [`slots.e2e.ts`](slots.e2e.ts)

**Slot element creation at Level 1 (E2E)**

- Tests all `slottedWidgets` and `widget.slot={true}` / `undefined` combinations
- Validates slot elements exist with correct `name` attributes
- Tests single-content and tabbed leaves
- Tests `renderedWidgetsChange` event

**Validations:**
- Slots created when `widget.slot={true}` or `slottedWidgets={true}`
- Slot `name` matches widget ID
- Tabbed leaves: one slot per widget, all created upfront
- Events fire correctly

---

## Related Tests

- [`../slot-attributes.e2e.ts`](../slot-attributes.e2e.ts) - Slot attribute propagation across all shadow DOM levels
- [`../model-switching.e2e.ts`](../model-switching.e2e.ts) - Content projection persists when switching models (slots)
- [`../model-switching.spec.tsx`](../model-switching.spec.tsx) - Content projection persists when switching models (renders)
