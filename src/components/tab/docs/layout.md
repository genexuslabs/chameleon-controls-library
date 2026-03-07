# ch-tab-render: Shadow DOM layout

## Case 1: Full layout (tab list visible, with close buttons)

```
<ch-tab-render>
  | #shadow-root
  |
  | <!-- when showTabListStart -->
  | <div part="tab-list-start [block | inline] [start | end] {tabListPosition}">
  |   <slot name="{tabListPosition}" />
  | </div>
  |
  | <div role="tablist" part="tab-list [block | inline] [start | end] {tabListPosition} [dragging]">
  |   <!-- for each item in model -->
  |   <button role="tab" part="{item.id} tab {tabListPosition} [block | inline] [start | end] [closable | not-closable] [selected | not-selected] [disabled] [dragging] [dragging-over-tab-list | dragging-out-of-tab-list]">
  |     <!-- when startImgType === "img" -->
  |     <img part="img" />
  |     <!-- when showCaptions -->
  |     <ch-textblock part="{item.id} tab-caption {tabListPosition} [block | inline] [start | end] [closable | not-closable] [selected | not-selected] [disabled] [dragging] [dragging-over-tab-list | dragging-out-of-tab-list]">
  |       | #shadow-root
  |       | Caption text
  |     </ch-textblock>
  |     <!-- when closeButton -->
  |     <button part="{item.id} close-button {tabListPosition} [block | inline] [start | end] [selected | not-selected] [disabled] [dragging] [dragging-over-tab-list | dragging-out-of-tab-list]"></button>
  |   </button>
  | </div>
  |
  | <!-- when showTabListEnd -->
  | <div part="tab-list-end [block | inline] [start | end] {tabListPosition}">
  |   <slot name="{tabListPosition}" />
  | </div>
  |
  | <div part="tab-panel-container [block | inline] [start | end] {tabListPosition} [expanded | collapsed]">
  |   <!-- for each item in model -->
  |   <div role="tabpanel" part="{item.id} tab-panel {tabListPosition} [block | inline] [start | end] [selected | not-selected] [disabled]">
  |     <slot name="{item.id}" />
  |   </div>
  | </div>
  |
  | <!-- when dragging -->
  | <button part="{item.id} tab dragging [block | inline] [start | end] [dragging-over-tab-list | dragging-out-of-tab-list] [closable | not-closable] [selected | not-selected] [disabled]">
  |   <!-- Drag preview (same structure as tab button) -->
  | </button>
</ch-tab-render>
```

## Case 2: Tab button hidden (panels only)

```
<ch-tab-render>
  | #shadow-root
  | <div part="tab-panel-container [block | inline] [start | end] {tabListPosition} [expanded | collapsed]">
  |   <!-- for each item in model -->
  |   <div part="{item.id} tab-panel {tabListPosition} [block | inline] [start | end] [selected | not-selected] [disabled]">
  |     <slot name="{item.id}" />
  |   </div>
  | </div>
</ch-tab-render>
```
