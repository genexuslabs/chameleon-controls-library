# ch-action-group-render: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Responsive collapse with overflow menu](#case-1-responsive-collapse-with-overflow-menu)

## Shadow Parts

| Part          | Description                                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `"separator"` | A horizontal divider rendered for items of `type: "separator"`. Also receives the item's `id` and custom `parts` if defined. |
| `"vertical"`  | Present on `separator` items.                                                                                                |

## Shadow DOM Layout

## Case 1: Responsive collapse with overflow menu

```
<ch-action-group-render>
  | #shadow-root
  |
  | <!-- when responsive collapse && collapsedItems > 0 -->
  | <ch-action-menu-render>
  |   | #shadow-root
  |   | <button part="expandable-button [expanded | collapsed] [disabled]">
  |   |   <slot />
  |   | </button>
  |   | <!-- when expanded -->
  |   | <ch-popover part="window">
  |   |   | #shadow-root
  |   |   | <slot />
  |   |
  |   |   <!-- for each collapsedItem in collapsedItems -->
  |   |   <ch-action-menu role="listitem">
  |   |     | #shadow-root
  |   |     | <!-- Button item (no link) -->
  |   |     | <button part="button [disabled] [expanded | collapsed] [{parts}]">
  |   |     |   <span part="content [{parts}]">Caption text</span>
  |   |     |   <!-- when shortcut -->
  |   |     |   <span part="shortcut [{parts}]">Ctrl+S</span>
  |   |     | </button>
  |   |     |
  |   |     | <!-- else (link item) -->
  |   |     | <a part="link [disabled] [expanded | collapsed] [{parts}]">
  |   |     |   <span part="content [{parts}]">Caption text</span>
  |   |     |   <!-- when shortcut -->
  |   |     |   <span part="shortcut [{parts}]">Ctrl+S</span>
  |   |     | </a>
  |   |     |
  |   |     | <!-- when expandable && expanded (sub-menu) -->
  |   |     | <ch-popover role="list" part="window [{parts}]">
  |   |     |   | #shadow-root
  |   |     |   | <slot />
  |   |     |
  |   |     |   <!-- Nested ch-action-menu (recursive) -->
  |   |     | </ch-popover>
  |   |   </ch-action-menu>
  |   | </ch-popover>
  |
  |   <!-- for each slotItem in collapsedItems -->
  |   <slot slot="{item.id}" name="{item.id}" />
  | </ch-action-menu-render>
  |
  | <!-- for each item in model -->
  | <!-- Actionable item -->
  | <ch-action-menu-render role="listitem">
  |   | #shadow-root
  |   | <button part="expandable-button [expanded | collapsed] [disabled]">
  |   |   <slot />
  |   | </button>
  |   | <!-- when expanded -->
  |   | <ch-popover role="list" part="window">
  |   |   | #shadow-root
  |   |   | <slot />
  |   |
  |   |   <!-- for each item in model -->
  |   |   <ch-action-menu role="listitem">
  |   |     | #shadow-root
  |   |     | <!-- Button item (no link) -->
  |   |     | <button part="button [disabled] [expanded | collapsed] [{parts}]">
  |   |     |   <span part="content [{parts}]">Caption text</span>
  |   |     |   <!-- when shortcut -->
  |   |     |   <span part="shortcut [{parts}]">Ctrl+S</span>
  |   |     | </button>
  |   |     |
  |   |     | <!-- else (link item) -->
  |   |     | <a part="link [disabled] [expanded | collapsed] [{parts}]">
  |   |     |   <span part="content [{parts}]">Caption text</span>
  |   |     |   <!-- when shortcut -->
  |   |     |   <span part="shortcut [{parts}]">Ctrl+S</span>
  |   |     | </a>
  |   |     |
  |   |     | <!-- when expandable && expanded (sub-menu) -->
  |   |     | <ch-popover role="list" part="window [{parts}]">
  |   |     |   | #shadow-root
  |   |     |   | <slot />
  |   |     |
  |   |     |   <!-- Nested ch-action-menu (recursive) -->
  |   |     | </ch-popover>
  |   |   </ch-action-menu>
  |   |
  |   |   <!-- Separator (between items) -->
  |   |   <hr part="separator [{parts}]" role="listitem" />
  |   | </ch-popover>
  | </ch-action-menu-render>
  |
  | <!-- Separator -->
  | <hr part="[{item.id}] separator vertical [{item.parts}]" />
  |
  | <!-- Slot item -->
  | <slot role="listitem" name="{item.id}" />
</ch-action-group-render>
```
