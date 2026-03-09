# ch-checkbox: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: With caption](#case-1-with-caption)
  - [Case 2: Without caption (no start image)](#case-2-without-caption-no-start-image)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow Parts

| Part              | Description                                                                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"checked"`       | Present in the `input`, `option`, `label` and `container` parts when the control is checked and not indeterminate (`value` === `checkedValue` and `indeterminate !== true`).     |
| `"container"`     | The container that serves as a wrapper for the `input` and the `option` parts.                                                                                                   |
| `"disabled"`      | Present in the `input`, `option`, `label` and `container` parts when the control is disabled (`disabled` === `true`).                                                            |
| `"indeterminate"` | Present in the `input`, `option`, `label` and `container` parts when the control is indeterminate (`indeterminate` === `true`). Takes precedence over `checked`/`unchecked`.     |
| `"input"`         | The native `<input type="checkbox">` element that implements the interactions for the component.                                                                                 |
| `"label"`         | The `<label>` element that wraps the checkbox and caption text. Only present when `caption` is set or `startImgSrc` resolves to a valid image.                                   |
| `"option"`        | The decorative overlay rendered above the `input` part. This part has `position: absolute` and `pointer-events: none`, and is always `aria-hidden`.                              |
| `"unchecked"`     | Present in the `input`, `option`, `label` and `container` parts when the control is unchecked and not indeterminate (`value` === `unCheckedValue` and `indeterminate !== true`). |

## CSS Custom Properties

| Name                                        | Description                                                                                                                                                                                                                                                |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ch-checkbox__background-image-size`      | Specifies the size of the start image of the control. @default 100%                                                                                                                                                                                        |
| `--ch-checkbox__container-size`             | Specifies the size for the container of the `input` and `option` elements. @default min(1em, 20px)                                                                                                                                                         |
| `--ch-checkbox__image-size`                 | Specifies the box size that contains the start image of the control. @default 0.875em                                                                                                                                                                      |
| `--ch-checkbox__option-checked-image`       | Specifies the image of the checkbox when is checked. @default url("data:image/svg+xml, <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><path fill='currentColor' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z'/></svg>")       |
| `--ch-checkbox__option-image-size`          | Specifies the image size of the `option` element. @default 100%                                                                                                                                                                                            |
| `--ch-checkbox__option-indeterminate-image` | Specifies the image of the checkbox when is indeterminate. @default url("data:image/svg+xml, <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><path fill='currentColor' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z'/></svg>") |
| `--ch-checkbox__option-size`                | Specifies the size for the `option` element. @default 50%                                                                                                                                                                                                  |

## Shadow DOM Layout

## Case 1: With caption

```
<ch-checkbox>
  | #shadow-root
  | <label part="label [checked | unchecked] [indeterminate] [disabled]">
  |   <div part="container [checked | unchecked] [indeterminate] [disabled]">
  |     <input aria-label="{accessibleName}" part="input" type="checkbox" />
  |     <div aria-hidden="true" part="option [checked | unchecked] [indeterminate] [disabled]"></div>
  |   </div>
  |   Caption text
  | </label>
</ch-checkbox>
```

## Case 2: Without caption (no start image)

```
<ch-checkbox>
  | #shadow-root
  | <div part="container [checked | unchecked] [indeterminate] [disabled]">
  |   <input aria-label="{accessibleName}" part="input" type="checkbox" />
  |   <div aria-hidden="true" part="option [checked | unchecked] [indeterminate] [disabled]"></div>
  | </div>
</ch-checkbox>
```

## Styling Recipes

### Custom Checkbox Appearance

Replace the default checkbox look with a rounded, colored variant.

```css
ch-checkbox {
  --ch-checkbox__container-size: 22px;
  --ch-checkbox__option-size: 65%;
  color: #333;
}

ch-checkbox::part(input) {
  border: 2px solid #ccc;
  border-radius: 4px;
}

ch-checkbox::part(input checked) {
  border-color: #0078d4;
  background-color: #0078d4;
}

ch-checkbox::part(option checked) {
  background-color: #fff;
}
```

### Focus Ring

Add a visible focus ring for keyboard navigation.

```css
ch-checkbox::part(input):focus-visible {
  outline: 2px solid #0078d4;
  outline-offset: 2px;
}
```

### Label Styling

Customize the label text when the checkbox is in different states.

```css
ch-checkbox::part(label) {
  font-size: 14px;
  color: #333;
  gap: 8px;
}

ch-checkbox::part(label checked) {
  color: #0078d4;
  font-weight: 600;
}

ch-checkbox::part(label disabled) {
  color: #999;
}
```

### Indeterminate State

Provide a distinct look for the indeterminate (mixed) state.

```css
ch-checkbox::part(input indeterminate) {
  border-color: #0078d4;
  background-color: #0078d4;
}

ch-checkbox::part(option indeterminate) {
  background-color: #fff;
}
```

## Anti-patterns

### 1. Using attribute selectors instead of state parts

```css
/* INCORRECT - attribute selectors do not reliably reflect internal state */
ch-checkbox[value="true"]::part(option) {
  background-color: green;
}

/* CORRECT - use state parts */
ch-checkbox::part(option checked) {
  background-color: green;
}
```

### 2. Using combinators after `::part()`

```css
/* INCORRECT - combinators after ::part() are not supported */
ch-checkbox::part(container) > .option {
  background: blue;
}

/* CORRECT - target the part directly */
ch-checkbox::part(option checked) {
  background: blue;
}
```

### 3. Using structural pseudo-classes on parts

```css
/* INCORRECT - structural pseudo-classes are silently ignored */
ch-checkbox::part(input):first-child {
  border-color: red;
}

/* CORRECT - target the part directly, optionally with state parts */
ch-checkbox::part(input) {
  border-color: red;
}
```

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-checkbox__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-checkbox::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.
