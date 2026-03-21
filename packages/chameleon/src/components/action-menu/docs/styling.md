# ch-action-menu-render: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Expanded with menu items](#case-1-expanded-with-menu-items)
  - [Case 2: Collapsed](#case-2-collapsed)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow Parts

| Part                  | Description                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `"action"`            | The clickable row element for each menu item.                                                                          |
| `"button"`            | A `<button>`-type action row. Receives `expandable`, `expanded`, `collapsed`, and `disabled` state parts.              |
| `"collapsed"`         | Present in the `button` part when the item's sub-menu is closed.                                                       |
| `"content"`           | The content area inside each action row (caption + optional icon).                                                     |
| `"disabled"`          | Present in the `button` part when the item is disabled.                                                                |
| `"expandable"`        | Present in the `button` part when the item has sub-items.                                                              |
| `"expandable-button"` | The top-level button that toggles the dropdown. Also receives the `expanded`, `collapsed`, and `disabled` state parts. |
| `"expanded"`          | Present in the `button` part when the item's sub-menu is open.                                                         |
| `"link"`              | An `<a>`-type action row.                                                                                              |
| `"separator"`         | A horizontal divider rendered for items of `type: "separator"`.                                                        |
| `"shortcut"`          | The keyboard shortcut label rendered at the end of an action row.                                                      |
| `"window"`            | The popover container that holds the dropdown menu items.                                                              |

## CSS Custom Properties

| Name                                           | Description                                                                                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--ch-action-menu-item__background-image-size` | Specifies the size of the start and end images of the items. @default 100%                                                                       |
| `--ch-action-menu-item__image-size`            | Specifies the box size that contains the start or end images of the items. @default 0.875em                                                      |
| `--ch-action-menu-separation`                  | Specifies the base separation between the action menu trigger and the dropdown menu on both axes. @default 0px                                   |
| `--ch-action-menu-separation-x`                | Specifies the separation on the inline (x) axis between the action menu trigger and the dropdown menu. @default var(--ch-action-menu-separation) |
| `--ch-action-menu-separation-y`                | Specifies the separation on the block (y) axis between the action menu trigger and the dropdown menu. @default var(--ch-action-menu-separation)  |

## Shadow DOM Layout

## Case 1: Expanded with menu items

```
<ch-action-menu-render>
  | #shadow-root
  | <button aria-controls="window" part="expandable-button [expanded | collapsed] [disabled]">
  |   <slot />
  | </button>
  | <ch-popover id="window" role="list" part="window">
  |   | #shadow-root
  |   | <slot />
  |
  |   <!-- for each item in model -->
  |   <ch-action-menu role="listitem">
  |     | #shadow-root
  |     | <!-- Button item (no link) -->
  |     | <button part="button [disabled] [expanded | collapsed] [{parts}]">
  |     |   <span part="content [{parts}]">Caption text</span>
  |     |   <!-- when shortcut -->
  |     |   <span part="shortcut [{parts}]">Ctrl+S</span>
  |     | </button>
  |     |
  |     | <!-- else (link item) -->
  |     | <a part="link [disabled] [expanded | collapsed] [{parts}]">
  |     |   <span part="content [{parts}]">Caption text</span>
  |     |   <!-- when shortcut -->
  |     |   <span part="shortcut [{parts}]">Ctrl+S</span>
  |     | </a>
  |     |
  |     | <!-- when expandable && expanded (sub-menu) -->
  |     | <ch-popover role="list" part="window [{parts}]">
  |     |   | #shadow-root
  |     |   | <slot />
  |     |
  |     |   <!-- Nested ch-action-menu (recursive) -->
  |     | </ch-popover>
  |   </ch-action-menu>
  |
  |   <!-- Separator (between items) -->
  |   <hr part="separator [{parts}]" role="listitem" />
  | </ch-popover>
</ch-action-menu-render>
```

## Case 2: Collapsed

```
<ch-action-menu-render>
  | #shadow-root
  | <button part="expandable-button collapsed [disabled]">
  |   <slot />
  | </button>
</ch-action-menu-render>
```

## Styling Recipes

### Context Menu Appearance

A floating context menu with rounded corners and shadow.

```css
ch-action-menu-render {
  --ch-action-menu-separation-y: 4px;
  --ch-action-menu-item__image-size: 16px;
}

ch-action-menu-render::part(window) {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 4px;
  min-inline-size: 180px;
}

ch-action-menu-render::part(button) {
  padding: 6px 32px 6px 8px;
  border-radius: 4px;
  font-size: 13px;
}

ch-action-menu-render::part(button):hover {
  background-color: #f0f0f0;
}

ch-action-menu-render::part(separator) {
  margin-block: 4px;
}
```

### Keyboard Shortcut Labels

Style the shortcut text that appears at the end of menu items.

```css
ch-action-menu-render::part(shortcut) {
  color: #888;
  font-size: 0.85em;
  margin-inline-start: auto;
  padding-inline-start: 24px;
}
```

### Disabled Menu Items

Visually differentiate disabled items.

```css
ch-action-menu-render::part(button disabled) {
  opacity: 0.4;
  cursor: not-allowed;
}
```

## Anti-patterns

### 1. Using attribute selectors instead of state parts

```css
/* INCORRECT - attribute selectors do not reliably reflect internal state */
ch-action-menu-render[expanded]::part(window) {
  display: block;
}

/* CORRECT - use state parts */
ch-action-menu-render::part(expandable-button expanded) {
  border-color: blue;
}
```

### 2. Using combinators after `::part()`

```css
/* INCORRECT - combinators after ::part() are not supported */
ch-action-menu-render::part(window) > button {
  color: red;
}

/* CORRECT - target the part directly */
ch-action-menu-render::part(button) {
  color: red;
}
```

### 3. Using structural pseudo-classes on parts

```css
/* INCORRECT - structural pseudo-classes are silently ignored */
ch-action-menu-render::part(button):first-child {
  border-top: none;
}

/* CORRECT - target the part directly, optionally with state parts */
ch-action-menu-render::part(button) {
  border-top: none;
}
```

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-action-menu__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-action-menu::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.
