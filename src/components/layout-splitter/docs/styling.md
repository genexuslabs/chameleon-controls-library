# ch-layout-splitter: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Horizontal/vertical layout with items](#case-1-horizontalvertical-layout-with-items)
  - [Case 2: No model](#case-2-no-model)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow Parts

| Part          | Description                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `"bar"`       | The drag bar separator that divides two columns or two rows. May include an additional custom part when the item specifies `dragBar.part`. |
| `"{item.id}"` | Exposed on every group container, enabling per-item styling from outside the shadow DOM.                                                   |

## Shadow DOM Layout

## Case 1: Horizontal/vertical layout with items

```
<ch-layout-splitter>
  | #shadow-root
  | <div>
  |   <!-- for each item in model.items -->
  |   <div part="{item.id}">
  |     <!-- Nested group: recurse with children -->
  |     <!-- else (leaf) -->
  |     <slot name="{item.id}" />
  |   </div>
  |   <!-- Separator between items -->
  |   <div part="bar [{dragBar.part}]"></div>
  | </div>
</ch-layout-splitter>
```

## Case 2: No model

```
<ch-layout-splitter>
  | #shadow-root
  | (empty)
</ch-layout-splitter>
```

## Styling Recipes

### Subtle Drag Bars

Drag bars that are invisible until hovered or focused.

```css
ch-layout-splitter::part(bar) {
  color: transparent;
  transition: color 150ms ease;
}

ch-layout-splitter::part(bar):hover,
ch-layout-splitter::part(bar):focus-visible {
  color: #0078d4;
}

ch-layout-splitter::part(bar):active {
  color: #005a9e;
}
```

### Visible Separator Lines

Always-visible thin separator lines between panels.

```css
ch-layout-splitter::part(bar) {
  color: #e0e0e0;
}

ch-layout-splitter::part(bar):hover {
  color: #0078d4;
}
```

### Focus Ring on Drag Bars

Add a visible focus indicator for keyboard accessibility.

```css
ch-layout-splitter::part(bar):focus-visible {
  color: #0078d4;
  outline: 2px solid #005a9e;
  outline-offset: -1px;
}
```

### Custom Drag Bar with Named Part

When you define a custom `dragBar.part` in the model, you can target that specific bar.

```css
/* Model item has dragBar: { part: "main-sidebar-bar" } */
ch-layout-splitter::part(main-sidebar-bar) {
  color: #ccc;
}

ch-layout-splitter::part(main-sidebar-bar):hover {
  color: #0078d4;
}
```

## Anti-patterns

### 1. Setting explicit dimensions on the host without container sizing

```css
/* INCORRECT - the layout-splitter needs its parent to have a defined size */
ch-layout-splitter {
  width: 100%;
  height: 100%;
}

/* CORRECT - ensure the parent container has explicit dimensions */
.container {
  width: 100%;
  height: 100vh;
}
```

### 2. Using combinators after `::part()`

```css
/* INCORRECT - combinators after ::part() are not supported */
ch-layout-splitter::part(bar)::before {
  content: "||";
}

/* CORRECT - use the color property which drives the bar's background-color */
ch-layout-splitter::part(bar) {
  color: #ccc;
}
```

### 3. Overriding grid properties on the host

```css
/* INCORRECT - the component manages its own grid template internally */
ch-layout-splitter {
  grid-template-columns: 1fr 1fr;
}

/* CORRECT - use the model to define the layout distribution */
```

```js
splitter.model = {
  id: "root",
  direction: "columns",
  items: [
    { id: "left", size: "1fr" },
    { id: "right", size: "1fr" }
  ]
};
```

### 4. Using structural pseudo-classes on parts

```css
/* INCORRECT - structural pseudo-classes are silently ignored on parts */
ch-layout-splitter::part(bar):first-child {
  color: red;
}

/* CORRECT - use a custom dragBar.part name in the model for specific bars */
ch-layout-splitter::part(first-bar) {
  color: red;
}
```

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-layout-splitter__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-layout-splitter::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.
