# ch-code: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default](#case-1-default)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow Parts

| Part     | Description                                                                                                                                                      |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"code"` | The inner `<code>` element that wraps the highlighted content. Also exposes a `language-{lang}` part (e.g. `language-typescript`) for language-specific styling. |

## CSS Custom Properties

| Name                               | Description                                                                             |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| `--ch-code__addition`              | Specifies the color for the addition tokens @default currentColor                       |
| `--ch-code__attr`                  | Specifies the color for the attr tokens @default currentColor                           |
| `--ch-code__attribute`             | Specifies the color for the attribute tokens @default currentColor                      |
| `--ch-code__built-in`              | Specifies the color for the built-in tokens @default currentColor                       |
| `--ch-code__bullet`                | Specifies the color for the bullet tokens @default currentColor                         |
| `--ch-code__class`                 | Specifies the color for the class tokens @default currentColor                          |
| `--ch-code__code`                  | Specifies the color for the code tokens @default currentColor                           |
| `--ch-code__comment`               | Specifies the color for the comment tokens @default currentColor                        |
| `--ch-code__deletion`              | Specifies the color for the deletion tokens @default currentColor                       |
| `--ch-code__doctag`                | Specifies the color for the doctag tokens @default currentColor                         |
| `--ch-code__formula`               | Specifies the color for the formula tokens @default currentColor                        |
| `--ch-code__function`              | Specifies the color for the function tokens @default currentColor                       |
| `--ch-code__function-variable`     | Specifies the color for the function variable tokens @default currentColor              |
| `--ch-code__keyword`               | Specifies the color for the keyword tokens @default currentColor                        |
| `--ch-code__link`                  | Specifies the color for the link tokens @default currentColor                           |
| `--ch-code__literal`               | Specifies the color for the literal tokens @default currentColor                        |
| `--ch-code__meta`                  | Specifies the color for the meta tokens @default currentColor                           |
| `--ch-code__meta__keyword`         | Specifies the color for the keyword tokens inside the meta token. @default currentColor |
| `--ch-code__meta__string`          | Specifies the color for the string tokens inside the meta token. @default currentColor  |
| `--ch-code__name`                  | Specifies the color for the name tokens @default currentColor                           |
| `--ch-code__number`                | Specifies the color for the number tokens @default currentColor                         |
| `--ch-code__operator`              | Specifies the color for the operator tokens @default currentColor                       |
| `--ch-code__quote`                 | Specifies the color for the quote tokens @default currentColor                          |
| `--ch-code__regexp`                | Specifies the color for the regexp tokens @default currentColor                         |
| `--ch-code__selector-attr`         | Specifies the color for the selector-attr tokens @default currentColor                  |
| `--ch-code__selector-class`        | Specifies the color for the selector-class tokens @default currentColor                 |
| `--ch-code__selector-id`           | Specifies the color for the selector-id tokens @default currentColor                    |
| `--ch-code__selector-pseudo`       | Specifies the color for the selector-pseudo tokens @default currentColor                |
| `--ch-code__selector-tag`          | Specifies the color for the selector-tag tokens @default currentColor                   |
| `--ch-code__string`                | Specifies the color for the string tokens @default currentColor                         |
| `--ch-code__subst`                 | Specifies the color for the substitution tokens @default currentColor                   |
| `--ch-code__symbol`                | Specifies the color for the symbol tokens @default currentColor                         |
| `--ch-code__tag`                   | Specifies the color for the tag tokens @default currentColor                            |
| `--ch-code__template-tag`          | Specifies the color for the template-tag tokens @default currentColor                   |
| `--ch-code__template-variable`     | Specifies the color for the template-variable tokens @default currentColor              |
| `--ch-code__title`                 | Specifies the color for the title tokens @default currentColor                          |
| `--ch-code__title-class`           | Specifies the color for the title-class tokens @default currentColor                    |
| `--ch-code__title-class-inherited` | Specifies the color for the title-class-inherited tokens @default currentColor          |
| `--ch-code__title-function`        | Specifies the color for the title-function tokens @default currentColor                 |
| `--ch-code__type`                  | Specifies the color for the type tokens @default currentColor                           |
| `--ch-code__variable`              | Specifies the color for the variable tokens @default currentColor                       |
| `--ch-code__variable-language`     | Specifies the color for the variable-language tokens @default currentColor              |

## Shadow DOM Layout

## Case 1: Default

```
<ch-code>
  | #shadow-root
  | <code part="code language-{language}">
  |   ...highlighted code blocks...
  | </code>
</ch-code>
```

## Styling Recipes

### Code Block with Line Background

```css
ch-code {
  --ch-code__keyword: #c678dd;
  --ch-code__string: #98c379;
  --ch-code__comment: #5c6370;

  background-color: #282c34;
  color: #abb2bf;
  padding: 16px;
  border-radius: 6px;
  font-family: "Fira Code", "Cascadia Code", monospace;
  font-size: 13px;
  line-height: 1.6;
}
```

## Anti-patterns

### 1. Using CSS custom properties on Monaco-based editors

```css
/* INCORRECT - Monaco editors do not use ch-code CSS custom properties */
ch-code-editor {
  --ch-code__keyword: blue;
}

/* CORRECT - use the theme property for Monaco editors */
```

```html
<ch-code-editor theme="vs-dark"></ch-code-editor>
```

### 2. Not setting a height on Monaco editors

```css
/* INCORRECT - Monaco editors need explicit dimensions */
ch-code-editor {
  /* no height set */
}

/* CORRECT - always set explicit height */
ch-code-editor {
  height: 400px;
}
```

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-code__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-code::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.
