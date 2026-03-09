# ch-image: Styling

## Table of Contents

- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default](#case-1-default)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## CSS Custom Properties

| Name                         | Description                                                      |
| ---------------------------- | ---------------------------------------------------------------- |
| `--ch-image-background-size` | Specifies the size of the image. @default 100%                   |
| `--ch-image-size`            | Specifies the box size that contains the image. @default 0.875em |

## Shadow DOM Layout

## Case 1: Default

```
<ch-image>
  | #shadow-root
  | (empty — image rendered via CSS background/mask on Host)
</ch-image>
```

## Anti-patterns

### 1. Using `ch-image` for meaningful content images

```html
<!-- INCORRECT - ch-image is always aria-hidden="true" -->
<ch-image src="product-photo"></ch-image>

<!-- CORRECT - use a native <img> for meaningful images -->
<img src="product-photo.png" alt="Product photo" />
```

### 2. Setting image source via CSS instead of the `src` property

```css
/* INCORRECT - the component resolves images via a callback, not direct CSS */
ch-image {
  background-image: url("icon.svg");
}

/* CORRECT - use the src property */
```

```html
<ch-image src="icon-name"></ch-image>
```

### 3. Expecting state changes without a container

The multi-state behavior requires the parent container to have the `data-ch-image` attribute (set automatically). If the `ch-image` is not inside a valid container, hover/active/focus states will not work.

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-image__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-image::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.

---

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).
