# ch-action-list-render: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default (items from model)](#case-1-default-items-from-model)
- [Styling Recipes](#styling-recipes)
- [Anti-patterns](#anti-patterns)
- [Do's and Don'ts](#dos-and-donts)

## Shadow Parts

| Part                  | Description                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `"collapsed"`         | Present in the `group__expandable` part when the group is collapsed.                                                   |
| `"disabled"`          | Present in the `item__action`, `item__caption`, `group__action`, and `group__caption` parts when the item is disabled. |
| `"expanded"`          | Present in the `group__expandable` part when the group is expanded.                                                    |
| `"group__action"`     | The clickable header row for a group item.                                                                             |
| `"group__caption"`    | The text caption inside a group header.                                                                                |
| `"group__expandable"` | The expandable/collapsible container for a group's children.                                                           |
| `"item__action"`      | The clickable row element for each actionable item.                                                                    |
| `"item__caption"`     | The text caption inside an actionable item.                                                                            |
| `"item__checkbox"`    | The checkbox element rendered when `checkbox` is `true`.                                                               |
| `"not-selected"`      | Present in the `item__action` and `group__action` parts when the item is not selected.                                 |
| `"selected"`          | Present in the `item__action` and `group__action` parts when the item is selected.                                     |
| `"separator"`         | A horizontal divider rendered between items when the model contains an item of `type: "separator"`.                    |

## CSS Custom Properties

| Name                                                   | Description                                                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `--ch-action-list-group__expandable-button-image-size` | Specifies the image size of the expandable button. @default 100%                            |
| `--ch-action-list-group__expandable-button-size`       | Specifies the box size that contains the expandable button image. @default 0.875em          |
| `--ch-action-list-item__background-image-size`         | Specifies the image size of the additional images. @default 100%                            |
| `--ch-action-list-item__image-size`                    | Specifies the box size that contains the images for the additional images. @default 0.875em |

## Shadow DOM Layout

## Case 1: Default (items from model)

```
<ch-action-list-render aria-multiselectable="{multiSelection}">
  | #shadow-root
  |
  | <!-- for each item in model -->
  | <!-- Item -->
  | <ch-action-list-item aria-selected="{selected}">
  |   | #shadow-root
  |   | <button part="item__action [nested] [nested-expandable] [selectable | not-selectable] [selected | not-selected] [disabled]">
  |   |
  |   |   <!-- when additionalInfo["stretch-start"] -->
  |   |   <div part="item__stretch-start">
  |   |     <div part="item__additional-item">
  |   |       <!-- Content depends on additionalItem type -->
  |   |     </div>
  |   |   </div>
  |   |
  |   |   <!-- when additionalInfo["block-start"] -->
  |   |   <div part="item__block-start">
  |   |     <div part="item__additional-item">
  |   |       <!-- Content depends on additionalItem type -->
  |   |     </div>
  |   |   </div>
  |   |
  |   |   <div part="item__inline-caption [editing | not-editing]">
  |   |     <!-- when editing -->
  |   |     <ch-edit part="item__edit-caption [{parts}]"></ch-edit>
  |   |     <!-- else when caption -->
  |   |     <span part="item__caption">Caption text</span>
  |   |
  |   |     <!-- when inline-caption.start -->
  |   |     <div part="item__inline-caption start">
  |   |       <div part="item__additional-item">
  |   |         <!-- Content depends on additionalItem type -->
  |   |       </div>
  |   |     </div>
  |   |     <!-- when inline-caption.end -->
  |   |     <div part="item__inline-caption end">
  |   |       <div part="item__additional-item">
  |   |         <!-- Content depends on additionalItem type -->
  |   |       </div>
  |   |     </div>
  |   |   </div>
  |   |
  |   |   <!-- when additionalInfo["block-end"] -->
  |   |   <div part="item__block-end">
  |   |     <div part="item__additional-item">
  |   |       <!-- Content depends on additionalItem type -->
  |   |     </div>
  |   |   </div>
  |   |
  |   |   <!-- when additionalInfo["stretch-end"] -->
  |   |   <div part="item__stretch-end">
  |   |     <div part="item__additional-item">
  |   |       <!-- Content depends on additionalItem type -->
  |   |     </div>
  |   |   </div>
  |   |
  |   | </button>
  | </ch-action-list-item>
  |
  | <!-- Group -->
  | <!-- for each group in model -->
  | <ch-action-list-group>
  |   | #shadow-root
  |   | <!-- when expandable -->
  |   | <button aria-expanded="{expanded}" aria-controls="expandable" part="group__action [selected | not-selected] [disabled]">
  |   |   Caption text
  |   | </button>
  |   | <!-- else (not expandable) -->
  |   | <span part="group__caption [disabled]">Caption text</span>
  |   |
  |   | <!-- when hasContent -->
  |   | <ul id="expandable" aria-busy="{downloading}" part="group__expandable [expanded | collapsed] [lazy-loaded]">
  |   |   <slot />
  |   | </ul>
  | </ch-action-list-group>
</ch-action-list-render>
```

## Styling Recipes

### Selectable List with Hover Effects

A polished list with hover and selection states.

```css
ch-action-list-render::part(item__action) {
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 150ms ease;
}

ch-action-list-render::part(item__action):hover {
  background-color: rgba(0, 0, 0, 0.04);
}

ch-action-list-render::part(item__action selected) {
  background-color: #0078d4;
  color: #fff;
}
```

### Checkbox List Styling

Style the checkbox items within the list.

```css
ch-action-list-render::part(item__checkbox) {
  accent-color: #0078d4;
  inline-size: 16px;
  block-size: 16px;
}

ch-action-list-render::part(item__action) {
  gap: 8px;
  padding: 6px 12px;
}
```

### Grouped List with Expandable Sections

Style group headers and their expandable containers.

```css
ch-action-list-render {
  --ch-action-list-group__expandable-button-size: 14px;
}

ch-action-list-render::part(group__action) {
  font-weight: 600;
  font-size: 0.8em;
  letter-spacing: 0.05em;
  padding: 10px 12px 4px;
  color: #888;
}

ch-action-list-render::part(group__expandable expanded) {
  padding-block-end: 8px;
}
```

## Anti-patterns

### 1. Using attribute selectors instead of state parts

```css
/* INCORRECT - attribute selectors do not reliably reflect internal state */
ch-action-list-render[selection="single"]::part(item__action) {
  cursor: pointer;
}

/* CORRECT - use state parts to differentiate selected/not-selected */
ch-action-list-render::part(item__action selected) {
  background-color: #e8f0fe;
}
```

### 2. Using combinators after `::part()`

```css
/* INCORRECT - combinators after ::part() are not supported */
ch-action-list-render::part(item__action) > span {
  color: red;
}

/* CORRECT - target the part directly */
ch-action-list-render::part(item__caption) {
  color: red;
}
```

### 3. Using structural pseudo-classes on parts

```css
/* INCORRECT - structural pseudo-classes are silently ignored */
ch-action-list-render::part(item__action):first-child {
  border-top: none;
}

/* CORRECT - target the part directly, optionally with state parts */
ch-action-list-render::part(item__action) {
  border-top: none;
}
```

For more details on shadow parts best practices, see the [CSS Shadow Parts Guide](../../../docs/css-shadow-parts-guide.md).

## Do's and Don'ts

### Do

- Prefer CSS custom properties (e.g., `--ch-action-list__*`) over `::part()` for simple theming.
- Use class selectors on the host (e.g., `.my-action-list::part(...)`) instead of tag names.
- Use state part intersections (e.g., `::part(element state)`) for conditional styling.
- Test styling changes across all component states (hover, focus, disabled, etc.).

### Don't

- Don't chain `::part()` selectors — use `exportparts` if needed.
- Don't use combinators (` `, `>`, `+`, `~`) after `::part()`.
- Don't use structural pseudo-classes (`:first-child`, `:nth-child()`, etc.) with `::part()`.
- Don't override internal CSS custom properties that are not documented.
