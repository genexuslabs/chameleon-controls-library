# ch-navigation-list-render: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Expanded navigation list](#case-1-expanded-navigation-list)
  - [Case 2: Collapsed navigation list with tooltips](#case-2-collapsed-navigation-list-with-tooltips)

## Shadow Parts

| Part                          | Description                                                                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `"collapsed"`                 | Present in the `item__action` and `item__group` parts when the item is collapsed.                                                   |
| `"disabled"`                  | Present in the `item__action`, `item__caption`, `item__group`, and `indicator` parts when the item is disabled.                     |
| `"end"`                       | Present in the `item__action` and `item__group` parts when the expandable button position is `"end"`.                               |
| `"even-level"`                | Present in the `item__action` and `item__group` parts when the item is at an even nesting level.                                    |
| `"expand-button"`             | Present in the `item__action` part when the item has an expandable button.                                                          |
| `"expanded"`                  | Present in the `item__action` and `item__group` parts when the item is expanded.                                                    |
| `"indicator"`                 | The visual selection indicator shown for the active item. Rendered when `selectedLinkIndicator` is `true` and the item is selected. |
| `"item__action"`              | The clickable row element for each navigation item. Receives position, state, and level parts.                                      |
| `"item__button"`              | A `<button>`-type navigation item row.                                                                                              |
| `"item__caption"`             | The text caption inside the navigation item.                                                                                        |
| `"item__group"`               | The container for an item's nested children.                                                                                        |
| `"item__link"`                | An `<a>`-type navigation item row.                                                                                                  |
| `"navigation-list-collapsed"` | Present in the `item__action` and `item__caption` parts when the parent `ch-sidebar` is collapsed.                                  |
| `"not-selected"`              | Present in the `item__caption`, `item__group`, and `item__link` parts when the item is not selected.                                |
| `"odd-level"`                 | Present in the `item__action` and `item__group` parts when the item is at an odd nesting level.                                     |
| `"selected"`                  | Present in the `item__caption`, `item__group`, and `item__link` parts when the item is selected.                                    |
| `"start"`                     | Present in the `item__action` and `item__group` parts when the expandable button position is `"start"`.                             |
| `"tooltip"`                   | Present in the `item__caption` part to style the tooltip that appears when the sidebar is collapsed.                                |

## CSS Custom Properties

| Name                                                                                                                                       | Description                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--ch-navigation-list-collapsed-size`                                                                                                      | Specifies the inline-size when the navigation list is collapsed @default var(--ch-sidebar-inline-size--collapsed, auto)                          |
| `--ch-navigation-list-item-custom-padding-inline-start`                                                                                    | Specifies an additional value for the padding-inline-start of the items without breaking the indentation of the items. @default 0px              |
| `--ch-navigation-list-item-expand-collapse-duration Specifies duration of the expand and collapse animation @default 0ms`                  |                                                                                                                                                  |
| `--ch-navigation-list-item-expand-collapse-timing-function Specifies timing function of the expand and collapse animation @default linear` |                                                                                                                                                  |
| `--ch-navigation-list-item-gap`                                                                                                            | Specifies the spacing between the images, text and the expandable button of the items. @default 0px                                              |
| `--ch-navigation-list-item__background-image-size`                                                                                         | Specifies the size of the start image of the items. @default 100%                                                                                |
| `--ch-navigation-list-item__expandable-button-image-size`                                                                                  | Specifies the image size of the expandable button. @default 100%                                                                                 |
| `--ch-navigation-list-item__expandable-button-size`                                                                                        | Specifies the expandable button size of the items. @default 0.875em                                                                              |
| `--ch-navigation-list-item__image-size`                                                                                                    | Specifies the box size that contains the start image of the items. @default 0.875em                                                              |
| `--ch-navigation-list-item__tooltip-separation`                                                                                            | Specifies the separation between the action and the displayed tooltip. @default 0px                                                              |
| `--ch-navigation-list-item__tooltip-separation-x`                                                                                          | Specifies the separation between the action and the tooltip displayed on the x-axis. @default var(--ch-navigation-list-item__tooltip-separation) |
| `--ch-navigation-list-item__tooltip-separation-y`                                                                                          | Specifies the separation between the action and the tooltip displayed on the y-axis. @default var(--ch-navigation-list-item__tooltip-separation) |

## Shadow DOM Layout

## Case 1: Expanded navigation list

```
<ch-navigation-list-render>
  | #shadow-root
  |
  | <!-- for each item in model -->
  | <ch-navigation-list-item>
  |   | #shadow-root
  |   |
  |   | <!-- Link item -->
  |   | <a part="item__action item__link [selected | not-selected] [disabled] [even-level | odd-level] [expand-button] [start | end] [navigation-list-collapsed]">
  |   |   <span part="item__caption [selected | not-selected] [disabled] [navigation-list-collapsed]">
  |   |     Caption text
  |   |   </span>
  |   | </a>
  |   |
  |   | <!-- else (button item) -->
  |   | <button part="item__action item__button [selected | not-selected] [disabled] [even-level | odd-level] [expanded | collapsed] [expand-button] [start | end] [navigation-list-collapsed]">
  |   |   <span part="item__caption [selected | not-selected] [disabled] [navigation-list-collapsed]">
  |   |     Caption text
  |   |   </span>
  |   | </button>
  |   |
  |   | <!-- when selected && selectedLinkIndicator -->
  |   | <div part="indicator [disabled]"></div>
  |   |
  |   | <!-- when expandable -->
  |   | <div role="list" part="item__group [even-level | odd-level] [expanded | collapsed] [disabled]">
  |   |   <slot />
  |   | </div>
  | </ch-navigation-list-item>
</ch-navigation-list-render>
```

## Case 2: Collapsed navigation list with tooltips

```
<ch-navigation-list-render>
  | #shadow-root
  |
  | <!-- for each item in model -->
  | <ch-navigation-list-item>
  |   | #shadow-root
  |   | <button part="item__action item__button [selected | not-selected] [disabled] [even-level | odd-level] navigation-list-collapsed">
  |   |   <!-- when showCaptionOnCollapse === "tooltip" -->
  |   |   <ch-tooltip>
  |   |     | #shadow-root
  |   |     | <button part="item__caption">
  |   |     |   <slot name="action" />
  |   |     | </button>
  |   |     | <!-- when visible -->
  |   |     | <ch-popover part="tooltip">
  |   |     |   | #shadow-root
  |   |     |   | <slot />
  |   |     | </ch-popover>
  |   |   </ch-tooltip>
  |   | </button>
  | </ch-navigation-list-item>
</ch-navigation-list-render>
```
