# ch-radio-group-render: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default (items from model)](#case-1-default-items-from-model)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow Parts

| Part                 | Description                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"checked"`          | Present in the `radio-item`, `radio__option`, `radio__label` and `radio__container` parts when the control is checked (`checked` === `true`).     |
| `"disabled"`         | Present in the `radio-item`, `radio__option`, `radio__label` and `radio__container` parts when the control is disabled (`disabled` === `true`).   |
| `"radio-item"`       | The radio item element.                                                                                                                           |
| `"radio__container"` | The container that serves as a wrapper for the `input` and the `option` parts.                                                                    |
| `"radio__input"`     | The invisible input element that implements the interactions for the component. This part must be kept "invisible".                               |
| `"radio__label"`     | The label that is rendered when the `caption` property is not empty.                                                                              |
| `"radio__option"`    | The actual "input" that is rendered above the `input` part. This part has `position: absolute` and `pointer-events: none`.                        |
| `"unchecked"`        | Present in the `radio-item`, `radio__option`, `radio__label` and `radio__container` parts when the control is not checked (`checked` !== `true`). |

## CSS Custom Properties

| Name                                     | Description                                                                                                      |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `--ch-radio-group__radio-container-size` | Specifies the size for the container of the `radio__input` and `radio__option` elements. @default min(1em, 20px) |
| `--ch-radio-group__radio-option-size`    | Specifies the size for the `radio__option` element. @default 50%                                                 |

## Shadow DOM Layout

## Case 1: Default (items from model)

```
<ch-radio-group-render role="radiogroup">
  | #shadow-root
  | <!-- for each item in model -->
  | <div part="radio-item [checked | unchecked] [disabled]">
  |   <div part="radio__container [checked | unchecked] [disabled]">
  |     <input part="radio__input" type="radio" />
  |     <div part="radio__option [checked | unchecked] [disabled]"></div>
  |   </div>
  |   <!-- when item.caption -->
  |   <label part="radio__label [checked | unchecked] [disabled]">
  |     Caption text
  |   </label>
  | </div>
</ch-radio-group-render>
```

## Styling Recipes

### Custom Radio Appearance

Style the radio buttons with a branded color scheme.

```css
ch-radio-group-render {
  --ch-radio-group__radio-container-size: 22px;
  --ch-radio-group__radio-option-size: 55%;
  color: #333;
}

ch-radio-group-render::part(radio__container) {
  border: 2px solid #ccc;
}

ch-radio-group-render::part(radio__container checked) {
  border-color: #0078d4;
}

ch-radio-group-render::part(radio__option checked) {
  background-color: #0078d4;
}
```

### Focus Ring

Add a visible focus ring when navigating with the keyboard.

```css
ch-radio-group-render::part(radio__input):focus-visible {
  outline: 2px solid #0078d4;
  outline-offset: 2px;
  border-radius: 50%;
  opacity: 1;
}
```

### Horizontal Spacing

Control the gap between items when using horizontal layout.

```css
ch-radio-group-render {
  gap: 16px;
}

ch-radio-group-render::part(radio-item) {
  gap: 8px;
}
```

### Card-style Radio Items

Make each radio item look like a selectable card.

```css
ch-radio-group-render::part(radio-item) {
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  gap: 10px;
}

ch-radio-group-render::part(radio-item checked) {
  border-color: #0078d4;
  background-color: #f0f7ff;
}

ch-radio-group-render::part(radio-item):hover {
  border-color: #999;
}
```

## Anti-patterns

### 1. Using structural pseudo-classes to target specific items

```css
/* INCORRECT - structural pseudo-classes are silently ignored on parts */
ch-radio-group-render::part(radio-item):first-child {
  margin-top: 0;
}

/* CORRECT - target all items uniformly, or use state parts for conditional styling */
ch-radio-group-render::part(radio-item) {
  margin-top: 0;
}
```

### 2. Using attribute selectors instead of state parts

```css
/* INCORRECT - attribute selectors do not work inside ::part() */
ch-radio-group-render::part(radio__container[checked]) {
  border-color: blue;
}

/* CORRECT - use state parts */
ch-radio-group-render::part(radio__container checked) {
  border-color: blue;
}
```

### 3. Trying to style the invisible input as a visible element

```css
/* INCORRECT - the radio__input must remain invisible; style radio__option instead */
ch-radio-group-render::part(radio__input) {
  opacity: 1;
  appearance: auto;
}

/* CORRECT - style the decorative option part for visual changes */
ch-radio-group-render::part(radio__option checked) {
  background-color: blue;
}
```

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-radio-group__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-radio-group::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.
