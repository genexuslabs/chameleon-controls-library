# Layout Doc

Create or update the Shadow DOM Layout section in a component's `docs/styling.md` file.

## Input

The user provides a component name (e.g. `accordion`, `tree-view`, `action-list`).
The component source lives at `src/components/<name>/`.

## Steps

1. **Read the component's render method** in the main `.tsx` file under `src/components/<name>/`.
   Identify all elements rendered in the shadow DOM, their `part` attributes, slots, conditional branches, and iterations.

2. **Read internal sub-component renders** if the component renders children that have their own shadow DOM (e.g. `ch-tree-view-item`, `ch-checkbox`). Follow the render chain into those `.tsx` files to understand their internal structure.

3. **Cross-reference `src/common/reserved-names.ts`** to find part name dictionaries and `exportparts` chains. This file defines the canonical part names for each component and the mappings used in `exportparts`.

4. **Apply the part resolution algorithm** (see below) to determine the final resolved names for parts inside nested shadow boundaries.

5. **Identify conditional rendering branches** — these become Cases or `<!-- when -->` / `<!-- else -->` annotations within a case. A Case represents a significant top-level rendering variant (e.g. expanded vs collapsed, desktop vs mobile). Minor conditional elements within a case use `<!-- when -->` comments.

6. **Follow the syntax conventions** in `docs/layout-syntax.md`. Key rules:
   - Elements inside shadow DOM are prefixed with `|`
   - Nested shadow DOMs add additional `|` levels
   - Static parts: `part="name"`
   - Conditional parts: `[part]`
   - Mutually exclusive parts: `[a | b]`
   - Dynamic parts: `{expression}`
   - Conditional dynamic parts: `[{expression}]`
   - Iterations: `<!-- for each item in collection -->`
   - Conditionals: `<!-- when condition -->` / `<!-- else -->`
   - The `exportparts` attribute is **never shown** in diagrams

7. **Update the `## Shadow DOM Layout` section in `docs/styling.md`** following this structure:

```markdown
## Shadow DOM Layout

## Case 1: Short description

\`\`\`
<ch-component-name>
  | #shadow-root
  | ...
</ch-component-name>
\`\`\`

## Case 2: Another variant (if needed)
...
```

> **Important:** `styling.md` is the single source of truth for styling documentation.
> It also contains Shadow Parts and CSS Custom Properties sections — do not remove or modify those.

## Part Resolution Algorithm

When a sub-component with its own shadow DOM is rendered inside another component's shadow root, the inner parts must be resolved to their final consumer-accessible names. The `exportparts` attribute itself is never shown — only the resolved part names appear in the diagram.

For each part P on an element E inside a nested shadow root:

1. Start at E's immediate shadow host (the parent component that renders E).
2. Check if the host's `exportparts` includes P (possibly renamed).
3. If **not exported** → **omit** P from the diagram entirely.
4. If exported **with rename** (`original:renamed`) → use the **renamed** name.
5. If exported **without rename** → keep the original name.
6. Move up to the next shadow boundary (if any) and repeat from step 2, using the (possibly renamed) name from the previous step.
7. The final name after all boundaries = the name shown in the diagram.

### Light DOM exception

Elements projected via `<slot>` are in light DOM — their parts are directly accessible without `exportparts`. The algorithm above only applies to elements rendered inside shadow DOM.

### Example

A `ch-checkbox` rendered inside `ch-tree-view-item` has its `container` part renamed to `item__checkbox-container` via exportparts. In `reserved-names.ts` you might see:

```ts
exportparts: "container:item__checkbox-container,input:item__checkbox-input,option:item__checkbox-option"
```

In the diagram, the checkbox's inner parts appear with their renamed names:

```
| <ch-checkbox part="item__checkbox [checked | unchecked | indeterminate] [disabled]">
|   | #shadow-root
|   | <div part="item__checkbox-container">
|   |   <input part="item__checkbox-input" type="checkbox" />
|   |   <div part="item__checkbox-option"></div>
|   | </div>
| </ch-checkbox>
```

## Key Reference Files

- `docs/layout-syntax.md` — Full syntax conventions
- `src/common/reserved-names.ts` — Part name dictionaries and exportparts mappings
- `src/components/<name>/<name>.tsx` — Component render method
- Existing `docs/styling.md` files in other components — Examples to follow

## Checklist Before Finishing

- [ ] All elements in shadow DOM use the `|` prefix notation
- [ ] Nested shadow DOMs have additional `|` levels
- [ ] Parts use final resolved names (after applying the resolution algorithm)
- [ ] Parts not exported by parent components are omitted
- [ ] No `exportparts` attributes appear anywhere in the diagram
- [ ] Conditional rendering uses `<!-- when -->` / `<!-- else -->` comments
- [ ] Iterations use `<!-- for each -->` comments
- [ ] Slots are shown with their `name` attribute
- [ ] Sub-component shadow DOMs are expanded inline (no cross-references)
