# ch-rating: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default](#case-1-default)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow Parts

| Part                 | Description                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| `"partial-selected"` | Present in the `star-container` and `star` parts when the star is partially selected (fractional value).        |
| `"selected"`         | Present in the `star-container` and `star` parts when the star is fully selected.                               |
| `"star"`             | The visual star element rendered inside each star container. Combined with state parts to indicate selection.   |
| `"star-container"`   | The wrapper for an individual star, including its radio input. Combined with state parts to indicate selection. |
| `"stars-container"`  | The container that wraps all individual star elements.                                                          |
| `"unselected"`       | Present in the `star-container` and `star` parts when the star is not selected at all.                          |

## CSS Custom Properties

| Name                                            | Description                                                                                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `--ch-rating-star__selected-background-color`   | Specifies the background-color of the selected portion of the star. @default currentColor                                            |
| `--ch-rating-star__size`                        | Specifies the size of the star.                                                                                                      |
| `--ch-rating-star__unselected-background-color` | Specifies the background-color of the unselected portion of the star. @default color-mix(in srgb, currentColor 50%, transparent 50%) |

## Shadow DOM Layout

## Case 1: Default

```
<ch-rating>
  | #shadow-root
  | <div part="stars-container">
  |   <!-- for each star in maxValue -->
  |   <div part="star-container [selected | unselected | partial-selected]">
  |     <div part="star [selected | unselected | partial-selected]"></div>
  |     <input type="radio" />
  |   </div>
  | </div>
</ch-rating>
```

## Styling Recipes

### Gold star rating

```css
ch-rating {
  color: #f5a623;
  --ch-rating-star__selected-background-color: #f5a623;
  --ch-rating-star__unselected-background-color: #ddd;
  --ch-rating-star__size: 2rem;
}
```

### Compact inline rating

```css
ch-rating {
  --ch-rating-star__size: 1em;
  vertical-align: middle;
}
```

### High-contrast selected stars with drop shadow

```css
ch-rating::part(star selected) {
  filter: drop-shadow(0 0 3px rgba(245, 166, 35, 0.6));
}

ch-rating::part(star unselected) {
  opacity: 0.3;
}
```

## Anti-patterns

- **Do not use `!important` to override custom properties.** Set them on the `ch-rating` selector or a parent element instead; custom properties naturally cascade.
- **Do not style the internal `<input>` elements directly.** They are visually hidden radio buttons used for accessibility. Style the visual stars through `::part(star)` and `::part(star-container)`.
- **Do not set `pointer-events: none` on the host.** The component already manages pointer events internally to ensure correct focus delegation.

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-rating__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-rating::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.

---

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

---

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

---

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

---

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

---

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

---

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

---

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).
