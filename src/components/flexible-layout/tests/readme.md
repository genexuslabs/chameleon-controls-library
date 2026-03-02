# Widget Rendering Test Combinations

The `ch-flexible-layout-render` component renders widgets either via **slots** (projected outside) or **renders** (internal functions). The decision is made by:

```typescript
#widgetIsSlotted = (widgetInfo: FlexibleLayoutWidget) =>
  widgetInfo.slot ?? this.slottedWidgets;
```

- If `widget.slot` is defined → uses that value
- If `widget.slot` is `undefined` → uses `slottedWidgets` (defaults to `false`)

## Combination Matrix

### Single-Content Items (one widget per item)

| `slottedWidgets` | `widget.slot` | Result | Test Location | Status |
|------------------|---------------|--------|----------------|--------|
| `false` (default) | `true` | slot | [`slots.e2e.ts`](slots.e2e.ts) | ✅ Implemented |
| `false` (default) | `false` | renders | [`renders.spec.tsx`](renders.spec.tsx) | ✅ Implemented |
| `false` (default) | `undefined` | renders | [`renders.spec.tsx`](renders.spec.tsx) | ✅ Implemented |
| `true` | `true` | slot | [`slots.e2e.ts`](slots.e2e.ts) | ✅ Implemented |
| `true` | `false` | renders | [`renders.spec.tsx`](renders.spec.tsx) | ✅ Implemented |
| `true` | `undefined` | slot | [`slots.e2e.ts`](slots.e2e.ts) | ✅ Implemented |

### Tabbed Items (multiple widgets per item)

**Note:** The slot/render decision logic (`#widgetIsSlotted`) is identical for both single-content and tabbed items. For tabbed items, we only test representative cases to verify tabbed-specific behavior: multiple widgets per item, only the selected widget (specified by `selectedWidgetId`) is rendered initially (optimization to avoid rendering all tabs at once), and tab switching works correctly. Other combinations are not tested separately for tabbed items since the decision logic is already fully covered by single-content item tests above.

| `slottedWidgets` | `widget.slot` | Result | Test Location | Status | Notes |
|------------------|---------------|--------|----------------|--------|-------|
| `false` (default) | `true` | slot | [`slots.e2e.ts`](slots.e2e.ts) | ✅ Implemented | Multiple widgets, only selected rendered |
| `false` (default) | `false` | renders | [`renders.spec.tsx`](renders.spec.tsx) | ✅ Implemented | Multiple widgets, only selected rendered, includes tab switching test |
| `true` | `undefined` | slot | [`slots.e2e.ts`](slots.e2e.ts) | ✅ Implemented | Multiple widgets, only selected rendered |

Tests are split into two files:

- **`slots.e2e.ts`**: E2E tests for slot-only scenarios.

- **`renders.spec.tsx`**: Spec tests for scenarios that require the `renders` prop. The `renders` prop expects functions to render widgets internally, so these tests run in Node.js with jsdom where functions can be passed directly (Puppeteer cannot serialize functions between Node.js and the browser context).
