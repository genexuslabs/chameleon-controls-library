# ch-segmented-control-render: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow Parts

| Part           | Description                                                                                                                             |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `"action"`     | The `<button>` element for each segment. Receives the `selected`, `unselected`, `disabled`, `first`, `last`, and `between` state parts. |
| `"between"`    | Present in the `action` part when the segment is neither the first nor the last item.                                                   |
| `"disabled"`   | Present in the `action` part when the segment is disabled.                                                                              |
| `"first"`      | Present in the `action` part when the segment is the first item in the group.                                                           |
| `"last"`       | Present in the `action` part when the segment is the last item in the group.                                                            |
| `"selected"`   | Present in the `action` part when the segment is the currently selected one.                                                            |
| `"unselected"` | Present in the `action` part when the segment is not selected.                                                                          |

## Styling Recipes

### Basic pill-shaped segmented control

```css
ch-segmented-control-render::part(action) {
  padding: 6px 16px;
  border: 1px solid #ccc;
  background: #fff;
  color: #333;
  cursor: pointer;
  font-size: 14px;
}

ch-segmented-control-render::part(action selected) {
  background: #0066cc;
  color: #fff;
  border-color: #0066cc;
}

ch-segmented-control-render::part(action first) {
  border-radius: 20px 0 0 20px;
}

ch-segmented-control-render::part(action last) {
  border-radius: 0 20px 20px 0;
}
```

### Disabled segment appearance

```css
ch-segmented-control-render::part(action disabled) {
  opacity: 0.4;
  cursor: not-allowed;
}
```

### Segment with icon sizing

Style the action button to control icon layout inside segments.

```css
ch-segmented-control-render::part(action) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
```

### Hover and focus states

```css
ch-segmented-control-render::part(action unselected):hover {
  background: #f0f0f0;
}

ch-segmented-control-render::part(action):focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

## Anti-patterns

1. **Do not style `ch-segmented-control-item` directly from outside.** The item uses Shadow DOM, so element selectors will not penetrate it. Use `::part(action)` on the parent `ch-segmented-control-render` to style the button.

2. **Do not override `exportParts` without understanding the consequences.** Changing the `exportParts` property removes the default part forwarding, which breaks all `::part()` selectors that consumers depend on. Only modify this if you intentionally need to remap part names.

3. **Do not use `nth-child` selectors for first/last styling.** The component provides dedicated `first`, `last`, and `between` parts for positional styling. Using `nth-child` is fragile and will not penetrate the shadow boundary of each item.

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-segmented-control__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-segmented-control::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.

---

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).
