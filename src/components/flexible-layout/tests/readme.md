# Slots vs Renders: Test Combinations

The `ch-flexible-layout-render` component renders widgets either via **slots** (projected outside) or **renders** (internal functions). The decision is made by:

```typescript
#widgetIsSlotted = (widgetInfo: FlexibleLayoutWidget) =>
  widgetInfo.slot ?? this.slottedWidgets;
```

- If `widget.slot` is defined → uses that value
- If `widget.slot` is `undefined` → uses `slottedWidgets` (defaults to `false`)

The tables below help understand and validate the necessary tests by combining the different options (`slottedWidgets` and `widget.slot`).

## `type="single-content"`

| `slottedWidgets` | `widget.slot` | Result | Test Location |
|------------------|---------------|--------|----------------|
| `false` (default) | `true` | slot | [`slots.e2e.ts`](slots.e2e.ts) |
| `false` (default) | `false` | renders | [`renders.spec.tsx`](renders.spec.tsx) |
| `false` (default) | `undefined` | renders | [`renders.spec.tsx`](renders.spec.tsx) |
| `true` | `true` | slot | [`slots.e2e.ts`](slots.e2e.ts) |
| `true` | `false` | renders | [`renders.spec.tsx`](renders.spec.tsx) |
| `true` | `undefined` | slot | [`slots.e2e.ts`](slots.e2e.ts) |

## `type="tabbed"`

**Note:** Same decision logic as single-content items. Only representative cases tested to verify tabbed-specific behavior (multiple widgets, only selected rendered initially, tab switching).

| `slottedWidgets` | `widget.slot` | Result | Test Location |
|------------------|---------------|--------|----------------|
| `false` (default) | `true` | slot | [`slots.e2e.ts`](slots.e2e.ts) |
| `false` (default) | `false` | renders | [`renders.spec.tsx`](renders.spec.tsx) |
| `true` | `undefined` | slot | [`slots.e2e.ts`](slots.e2e.ts) |

**Test files:**
- `slots.e2e.ts` - E2E tests for slot scenarios
- `renders.spec.tsx` - Spec tests for render function scenarios (requires `renders` prop)

**Note:** The `renders` prop expects JavaScript functions. Puppeteer cannot serialize functions between Node.js and the browser context, so tests requiring `renders` use `.spec.tsx` files (run in the same process, functions can be passed directly). Slot tests use `.e2e.ts` since they don't need functions.
