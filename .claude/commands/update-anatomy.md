# Update Anatomy

Update the `layout-metadata.json` and regenerate anatomy SVG diagrams for Chameleon components.
Use this when component styles (`.scss`) or shadow DOM layout (`layout.md`) have changed.

## Input

The user provides one of:
- A component name: `/update-anatomy accordion`
- Multiple names: `/update-anatomy accordion,tree-view,checkbox`
- The `--all` flag: `/update-anatomy --all`
- Optional `--force` flag to regenerate even without detected changes

## Steps

### 1. Resolve target components

- Parse the argument to get component name(s)
- For `--all`: scan `src/components/*/docs/layout.md` to find all components with layout files
- Verify each component has a `docs/layout.md` — if missing, report and skip

### 2. For each component, gather context

Read these files:
- `src/components/{name}/docs/layout.md` — the shadow DOM layout description
- `src/components/{name}/{name}.scss` — the component's main SCSS
- If the layout references sub-components (`ch-*` tags with shadow roots), also read their SCSS files
- `src/components/{name}/docs/layout-metadata.json` — existing metadata (if any)

### 3. Detect changes

- Compute a hash of `layout.md + SCSS` content
- Compare with the `sourceHash` field in existing `layout-metadata.json`
- If hashes match and `--force` is not set, skip this component (report "no changes detected")

### 4. Parse the layout

Run the parser to get the AST:
```bash
node scripts/layout-to-svg/parse-layout.mjs src/components/{name}/docs/layout.md
```

### 5. Analyze SCSS and generate metadata

For each node in the AST (identified by path like "0", "0.0", "0.1.0"), determine visual hints by analyzing the SCSS:

#### SCSS Analysis Guide

For each CSS class/part that maps to a node in the AST:

1. **direction**: `display: flex` → check `flex-direction` (default row). `display: grid` → check `grid-auto-flow` or `grid-template-columns/rows`. `display: inline-grid; grid-auto-flow: column` → "row". `display: contents` → inherit parent direction, mark node as hidden.

2. **position**: `position: absolute` or `position: fixed` → "absolute". `position: relative` alone → "flow" (just a positioning context). `popover` attribute → "overlay".

3. **widthRatio/heightRatio**: Infer from `inline-size`, `block-size`, `flex: 1`, `width: 100%`. Use 1.0 for full-width, estimate proportions for partial sizes.

4. **hidden**: `display: contents` → hidden (wrapper only). Elements with no visual properties that just group children → hidden.

5. **style**: button/input/a/select/textarea → "interactive". slot → "slot". Text content → "text". hr/img/canvas/decorative divs → "decorative". Everything else → "container".

6. **alignSelf**: Look for `align-self`, `justify-self`, `margin: auto` patterns, or parent's `align-items`/`justify-content`.

#### Metadata schema

Only include entries for nodes that DIFFER from defaults (direction="column", position="flow", style=auto-inferred from tag):

```json
{
  "component": "{name}",
  "sourceHash": "{computed hash}",
  "cases": [
    {
      "case": 1,
      "title": "Case title from layout.md",
      "canvas": { "width": 600, "height": 400 },
      "nodes": {
        "0": { "direction": "row" },
        "0.0.1": { "hidden": true },
        "0.0.2": { "style": "interactive", "direction": "row" }
      }
    }
  ]
}
```

Node paths: "0" = root element, "0.0" = first child, "0.1" = second child, "0.0.0" = first grandchild.

#### Preserving manual edits

If an existing entry has `"manual": true`, preserve it exactly. Only update entries that:
- Are new (node added to AST)
- Don't have `"manual": true`

Remove entries for nodes that no longer exist in the AST.

### 6. Write the metadata

Write the result to `src/components/{name}/docs/layout-metadata.json`.

### 7. Regenerate SVGs

Run the renderer:
```bash
node scripts/layout-to-svg/render-svg.mjs --component {name}
```

### 8. Report summary

List:
- Components processed with SVG count
- Components skipped (no changes)
- Any errors encountered
- If manual entries were preserved, mention which ones

## Relationship with /layout-doc

These commands are complementary:
- `/layout-doc {name}` → creates/updates `layout.md` (analyzes `.tsx` + `reserved-names.ts`)
- `/update-anatomy {name}` → creates/updates `layout-metadata.json` + regenerates SVGs (analyzes `layout.md` + `.scss`)

Typical flow when a component changes:
1. Modify `.tsx` and/or `.scss`
2. `/layout-doc {name}` → update layout.md
3. `/update-anatomy {name}` → update metadata + SVGs

If only styles changed (no DOM structure change):
1. Modify `.scss`
2. `/update-anatomy {name}` → update metadata + SVGs (layout.md unchanged)

## Key Reference Files

- `scripts/layout-to-svg/parse-layout.mjs` — Parser (layout.md → AST)
- `scripts/layout-to-svg/render-svg.mjs` — SVG renderer (AST + metadata → SVG)
- `scripts/layout-to-svg/generate-metadata.mjs` — Batch AI metadata generator
- `scripts/layout-to-svg/defaults.mjs` — Default visual hints and colors
- `scripts/layout-to-svg/types.d.ts` — TypeScript interfaces (documentation)
- `docs/layout-syntax.md` — Layout.md syntax conventions
