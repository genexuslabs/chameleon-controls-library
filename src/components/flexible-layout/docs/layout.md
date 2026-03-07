# ch-flexible-layout-render: Shadow DOM layout

## Case 1: Default (with model)

```
<ch-flexible-layout-render>
  | #shadow-root
  | <!-- when theme -->
  | <ch-theme></ch-theme>
  |
  | <ch-flexible-layout>
  |   | #shadow-root
  |   | <ch-layout-splitter>
  |   |   | #shadow-root
  |   |   | <div>
  |   |   |   <!-- for each item in layout.items -->
  |   |   |   <div part="{item.id}">
  |   |   |     <slot name="{item.id}" />
  |   |   |   </div>
  |   |   |   <div part="bar"></div>
  |   |   | </div>
  |   |
  |   |   <!-- for each single-content leaf in layout -->
  |   |   <slot name="{widget.id}" slot="{leaf.id}" />
  |   |
  |   |   <!-- for each tabbed leaf in layout -->
  |   |   <ch-tab-render slot="{leaf.id}" part="{leaf.id} leaf">
  |   |     | #shadow-root
  |   |     | <div part="tab-list">
  |   |     |   <!-- for each widget in leaf.widgets -->
  |   |     |   <button part="{item.id} tab [selected | not-selected] [disabled] [closable | not-closable]">
  |   |     |     <ch-textblock part="{item.id} tab-caption [selected | not-selected]">
  |   |     |       | #shadow-root
  |   |     |       | Caption text
  |   |     |     </ch-textblock>
  |   |     |     <!-- when closeButton -->
  |   |     |     <button part="{item.id} close-button [selected | not-selected] [disabled]"></button>
  |   |     |   </button>
  |   |     | </div>
  |   |     | <div part="tab-panel-container">
  |   |     |   <!-- for each widget in leaf.widgets -->
  |   |     |   <div part="{item.id} tab-panel [selected | not-selected] [disabled]">
  |   |     |     <slot name="{widget.id}" />
  |   |     |   </div>
  |   |     | </div>
  |   |
  |   |     <!-- for each widget in leaf.widgets -->
  |   |     <slot name="{widget.id}" slot="{widget.id}" />
  |   |   </ch-tab-render>
  |   | </ch-layout-splitter>
  |   |
  |   | <div part="droppable-area" popover="manual"></div>
  |
  |   <!-- for each widget in allWidgets -->
  |   <div slot="{widget.id}">
  |     <slot name="{widget.id}" />
  |   </div>
  | </ch-flexible-layout>
</ch-flexible-layout-render>
```
