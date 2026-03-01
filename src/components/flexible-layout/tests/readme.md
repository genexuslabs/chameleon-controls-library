# Widget Rendering Test Combinations

The `ch-flexible-layout-render` component renders widgets either via **slots** (projected outside) or **renders** (internal functions). The decision is made by:

```typescript
#widgetIsSlotted = (widgetInfo: FlexibleLayoutWidget) =>
  widgetInfo.slot ?? this.slottedWidgets;
```

- If `widget.slot` is defined → uses that value
- If `widget.slot` is `undefined` → uses `slottedWidgets` (defaults to `false`)

## Combination Matrix

| `slottedWidgets` | `widget.slot` | Result | Test Location |
|------------------|---------------|--------|----------------|
| `false` (default) | `true` | slot | [`slots.e2e.ts`](slots.e2e.ts) |
| `false` (default) | `false` | renders | [`renders.spec.tsx`](renders.spec.tsx) |
| `false` (default) | `undefined` | renders | [`renders.spec.tsx`](renders.spec.tsx) |
| `true` | `true` | slot | [`slots.e2e.ts`](slots.e2e.ts) |
| `true` | `false` | renders | [`renders.spec.tsx`](renders.spec.tsx) |
| `true` | `undefined` | slot | [`slots.e2e.ts`](slots.e2e.ts) |

Tests are split into two files:

- **`slots.e2e.ts`**: E2E tests for slot-only scenarios.

- **`renders.spec.tsx`**: Spec tests for scenarios that require the `renders` prop. The `renders` prop expects functions to render widgets internally, so these tests run in Node.js with jsdom where functions can be passed directly (Puppeteer cannot serialize functions between Node.js and the browser context).
