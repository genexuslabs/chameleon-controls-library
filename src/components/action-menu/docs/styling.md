# ch-action-menu-render: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Expanded with menu items](#case-1-expanded-with-menu-items)
  - [Case 2: Collapsed](#case-2-collapsed)

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
