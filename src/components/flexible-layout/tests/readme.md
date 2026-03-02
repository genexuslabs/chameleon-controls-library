# Widget Rendering Test Combinations

The `ch-flexible-layout-render` component renders widgets either via **slots** (projected outside) or **renders** (internal functions). The decision is made by:

```typescript
#widgetIsSlotted = (widgetInfo: FlexibleLayoutWidget) =>
  widgetInfo.slot ?? this.slottedWidgets;
```

- If `widget.slot` is defined → uses that value
- If `widget.slot` is `undefined` → uses `slottedWidgets` (defaults to `false`)

The tables below help understand and validate the necessary tests by combining the different options (`slottedWidgets` and `widget.slot`).

## Single-Content Items

| `slottedWidgets` | `widget.slot` | Result | Test Location | Status |
|------------------|---------------|--------|----------------|--------|
| `false` (default) | `true` | slot | [`slots.e2e.ts`](slots.e2e.ts) | ✅ Implemented |
| `false` (default) | `false` | renders | [`renders.spec.tsx`](renders.spec.tsx) | ✅ Implemented |
| `false` (default) | `undefined` | renders | [`renders.spec.tsx`](renders.spec.tsx) | ✅ Implemented |
| `true` | `true` | slot | [`slots.e2e.ts`](slots.e2e.ts) | ✅ Implemented |
| `true` | `false` | renders | [`renders.spec.tsx`](renders.spec.tsx) | ✅ Implemented |
| `true` | `undefined` | slot | [`slots.e2e.ts`](slots.e2e.ts) | ✅ Implemented |

## Tabbed Items

**Note:** Same decision logic as single-content items. Only representative cases tested to verify tabbed-specific behavior (multiple widgets, only selected rendered initially, tab switching).

| `slottedWidgets` | `widget.slot` | Result | Test Location | Status | Notes |
|------------------|---------------|--------|----------------|--------|-------|
| `false` (default) | `true` | slot | [`slots.e2e.ts`](slots.e2e.ts) | ✅ Implemented | Multiple widgets, only selected rendered |
| `false` (default) | `false` | renders | [`renders.spec.tsx`](renders.spec.tsx) | ✅ Implemented | Multiple widgets, only selected rendered, includes tab switching test |
| `true` | `undefined` | slot | [`slots.e2e.ts`](slots.e2e.ts) | ✅ Implemented | Multiple widgets, only selected rendered |

**Test files:**
- `slots.e2e.ts` - E2E tests for slot scenarios
- `renders.spec.tsx` - Spec tests for render function scenarios (requires `renders` prop)

**Note:** The `renders` prop expects JavaScript functions. Puppeteer cannot serialize functions between Node.js and the browser context, so tests requiring `renders` use `.spec.tsx` files (run in the same process, functions can be passed directly). Slot tests use `.e2e.ts` since they don't need functions.
