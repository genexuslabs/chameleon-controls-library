# ch-action-menu-render: Shadow DOM layout

## Case 1: Expanded with menu items

```
<ch-action-menu-render>
  | #shadow-root
  | <button part="expandable-button [expanded | collapsed] [disabled]">
  |   <slot />
  | </button>
  | <ch-popover role="list" part="window">
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
