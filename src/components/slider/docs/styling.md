# ch-slider: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default](#case-1-default)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow Parts

| Part                  | Description                                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"disabled"`          | Present in all parts when the control is disabled (`disabled` === `true`).                                                                              |
| `"thumb"`             | The thumb of the slider element.                                                                                                                        |
| `"track"`             | The track of the slider element.                                                                                                                        |
| `"track__selected"`   | Represents the portion of the track that is selected, that is, the portion of the track that starts at the min value and goes to the current value.     |
| `"track__unselected"` | Represents the portion of the track that is not selected, that is, the portion of the track that starts at the current value and goes to the max value. |

## CSS Custom Properties

| Name                                             | Description                                                                                                                       |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `--ch-slider-thumb-background-color`             | Specifies the background-color of the thumb. @default currentColor                                                                |
| `--ch-slider-thumb-size`                         | Specifies the size of the thumb. @default clamp(8px, 1.5em, 24px)                                                                 |
| `--ch-slider-track-block-size`                   | Specifies the block size of the track. @default clamp(3px, 0.25em, 16px)                                                          |
| `--ch-slider-track__selected-background-color`   | Specifies the background-color of the selected portion of the track. @default color-mix(in srgb, currentColor 15%, transparent)   |
| `--ch-slider-track__unselected-background-color` | Specifies the background-color of the unselected portion of the track. @default color-mix(in srgb, currentColor 15%, transparent) |

## Shadow DOM Layout

## Case 1: Default

```
<ch-slider>
  | #shadow-root
  | <div class="position-absolute-wrapper">
  |   <input type="range" />
  |   <div part="track [disabled]">
  |     <div part="track__selected [disabled]"></div>
  |     <div part="track__unselected [disabled]"></div>
  |   </div>
  |   <div part="thumb [disabled]"></div>
  | </div>
</ch-slider>
```

## Styling Recipes

### Accent-colored slider

```css
ch-slider {
  --ch-slider-thumb-background-color: var(--accent-color, #6200ee);
  --ch-slider-track__selected-background-color: var(--accent-color, #6200ee);
  --ch-slider-track__unselected-background-color: #e0e0e0;
}
```

### Thin track with large thumb

```css
ch-slider {
  --ch-slider-track-block-size: 2px;
  --ch-slider-thumb-size: 20px;
}

ch-slider::part(track) {
  border-radius: 1px;
}
```

### Disabled state styling

```css
ch-slider::part(track disabled) {
  opacity: 0.3;
}

ch-slider::part(thumb disabled) {
  background-color: #9e9e9e;
  opacity: 0.5;
}
```

### Full-width slider in a form

```css
ch-slider {
  display: grid;
  inline-size: 100%;
}
```

## Anti-patterns

- **Do not hide the native `<input type="range">` with CSS from outside the shadow DOM.** The component already manages the native input's visibility internally; overriding it can break interaction and accessibility.
- **Do not set `appearance` on the host element.** The native range input appearance reset is handled inside the shadow DOM.
- **Do not use `::part(track__selected)` and `::part(track__unselected)` with percentage widths.** Their widths are computed dynamically via internal CSS variables tied to the component value. Use background-color and opacity instead.

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-slider__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-slider::part(...)`) instead of tag names.
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
