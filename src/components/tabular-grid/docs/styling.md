# ch-grid: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default](#case-1-default)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow Parts

| Part                                 | Description                                                               |
| ------------------------------------ | ------------------------------------------------------------------------- |
| `"footer"`                           | The footer section rendered below the grid body.                          |
| `"header"`                           | The header section rendered above the grid body.                          |
| `"main"`                             | The main scrollable section containing the grid columns, rows, and cells. |
| `"settings-caption"`                 | The caption/title text in the settings panel header.                      |
| `"settings-close"`                   | The close button in the settings panel.                                   |
| `"settings-columns"`                 | The column visibility list inside the settings panel.                     |
| `"settings-columns-item"`            | An individual column entry in the settings column list.                   |
| `"settings-columns-label"`           | The label for a column entry in the settings panel.                       |
| `"settings-columns-visible"`         | The visibility toggle for a column in the settings panel.                 |
| `"settings-columns-visible-checked"` | The visibility toggle when the column is visible.                         |
| `"settings-footer"`                  | The footer area of the settings panel.                                    |
| `"settings-header"`                  | The header area of the settings panel.                                    |
| `"settings-main"`                    | The main content area of the settings panel.                              |
| `"settings-mask"`                    | The backdrop overlay displayed behind the settings panel.                 |
| `"settings-window"`                  | The settings panel window container.                                      |

## Shadow DOM Layout

## Case 1: Default

```
<ch-tabular-grid>
  | #shadow-root
  | <header part="header">
  |   <slot name="header" />
  | </header>
  |
  | <section part="main">
  |   <slot />
  | </section>
  |
  | <aside>
  |   <ch-tabular-grid-settings>
  |     | #shadow-root
  |     | <ch-window>
  |     |   | #shadow-root
  |     |   | <div part="settings-mask"></div>
  |     |   | <div part="settings-window">
  |     |   |   <div part="settings-header">
  |     |   |     <span part="settings-caption"></span>
  |     |   |     <button part="settings-close"></button>
  |     |   |   </div>
  |     |   |   <div part="settings-main">
  |     |   |     <slot />
  |     |   |   </div>
  |     |   |   <div part="settings-footer">
  |     |   |     <slot name="footer" />
  |     |   |   </div>
  |     |   | </div>
  |     | </ch-window>
  |
  |     <slot name="settings">
  |       <ch-tabular-grid-settings-columns part="settings-columns">
  |         | #shadow-root
  |         | <ul>
  |         |   <!-- for each column in columns -->
  |         |   <li part="settings-columns-item">
  |         |     <label part="settings-columns-label">
  |         |       <input part="settings-columns-visible [settings-columns-visible-checked]" type="checkbox" />
  |         |       Column name
  |         |     </label>
  |         |   </li>
  |         | </ul>
  |       </ch-tabular-grid-settings-columns>
  |     </slot>
  |   </ch-tabular-grid-settings>
  |   <slot name="column-display" />
  |   <slot name="row-actions" />
  | </aside>
  |
  | <footer part="footer">
  |   <slot name="footer" />
  | </footer>
</ch-tabular-grid>
```

## Styling Recipes

### Row State Classes

The grid applies CSS classes to rows based on their state. Provide class names via properties:

```html
<ch-tabular-grid
  row-selected-class="row--selected"
  row-highlighted-class="row--highlighted"
  row-focused-class="row--focused"
  row-marked-class="row--marked"
></ch-tabular-grid>
```

```css
.row--selected {
  background-color: #e3f2fd;
}

.row--highlighted {
  background-color: #f5f5f5;
}

.row--focused {
  outline: 2px solid #0078d4;
  outline-offset: -2px;
}

.row--marked {
  background-color: #fff3e0;
}
```

### Grid Lines

Control which grid lines are visible using the `show-lines` attribute:

```html
<!-- Show only horizontal lines between rows -->
<ch-tabular-grid show-lines="row-inside"></ch-tabular-grid>

<!-- Show no lines at all -->
<ch-tabular-grid show-lines="none"></ch-tabular-grid>
```

## Anti-patterns

### 1. Using CSS Grid on the host to override the internal layout

```css
/* INCORRECT - the grid uses its own internal CSS Grid; overriding it will break the layout */
ch-tabular-grid {
  display: flex;
}

/* CORRECT - use the host display as-is (flex column) and control dimensions */
ch-tabular-grid {
  width: 100%;
  height: 400px;
}
```

### 2. Targeting internal grid cells without CSS classes

```css
/* INCORRECT - internal elements are in the shadow DOM */
ch-tabular-grid td {
  padding: 8px;
}

/* CORRECT - use CSS classes on the slotted elements */
```

```html
<ch-tabular-grid-cell class="tabular-grid-cell">Content</ch-tabular-grid-cell>
```

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-tabular-grid__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-tabular-grid::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.
