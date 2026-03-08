# ch-sidebar: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Expand button before content](#case-1-expand-button-before-content)
  - [Case 2: Expand button after content](#case-2-expand-button-after-content)
  - [Case 3: No expand button](#case-3-no-expand-button)

## Shadow Parts

| Part              | Description                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| `"collapsed"`     | Present on the expand button when the sidebar is collapsed.                                       |
| `"expand-button"` | The button that toggles the expanded/collapsed state. Rendered when `showExpandButton` is `true`. |
| `"expanded"`      | Present on the expand button when the sidebar is expanded.                                        |

## CSS Custom Properties

| Name                                     | Description                                                                                                                                                                                                                                                                        |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ch-sidebar-inline-size--collapsed`    | Specifies the inline size of the sidebar when collapsed. @default auto                                                                                                                                                                                                             |
| `--ch-sidebar-inline-size--expanded`     | Specifies the inline size of the sidebar when expanded. @default auto                                                                                                                                                                                                              |
| `--ch-sidebar__chevron-background-image` | Specifies the image of expand button. @default url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" style="transform:rotate(-90deg)" viewBox="0 0 18 18" fill="none"><path d="M16.5 5L8.7 12.7L1 5" stroke="%23000" stroke-width="1.2" stroke-linecap="round"/></svg>') |
| `--ch-sidebar__chevron-image-size`       | Specifies the image size of the expandable button. @default 100%                                                                                                                                                                                                                   |
| `--ch-sidebar__chevron-size`             | Specifies the expandable button size. @default 0.875em                                                                                                                                                                                                                             |

## Shadow DOM Layout

## Case 1: Expand button before content

```
<ch-sidebar>
  | #shadow-root
  | <!-- when showExpandButton && expandButtonPosition === "before" -->
  | <button part="expand-button [expanded | collapsed]"></button>
  | <slot />
</ch-sidebar>
```

## Case 2: Expand button after content

```
<ch-sidebar>
  | #shadow-root
  | <slot />
  | <!-- when showExpandButton && expandButtonPosition === "after" -->
  | <button part="expand-button [expanded | collapsed]"></button>
</ch-sidebar>
```

## Case 3: No expand button

```
<ch-sidebar>
  | #shadow-root
  | <slot />
</ch-sidebar>
```
