# ch-action-list-render: Shadow DOM layout

## Case 1: Default (items from model)

```
<ch-action-list-render>
  | #shadow-root
  |
  | <!-- for each item in model -->
  | <!-- Item -->
  | <ch-action-list-item>
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
  |   | <button part="group__action [selected | not-selected] [disabled]">
  |   |   Caption text
  |   | </button>
  |   | <!-- else (not expandable) -->
  |   | <span part="group__caption [disabled]">Caption text</span>
  |   |
  |   | <!-- when hasContent -->
  |   | <ul part="group__expandable [expanded | collapsed] [lazy-loaded]">
  |   |   <slot />
  |   | </ul>
  | </ch-action-list-group>
</ch-action-list-render>
```

## Additional items inside ch-action-list-item

```
<!-- Additional item: image type -->
<div part="item__additional-item">
  <div part="image"></div>
</div>

<!-- Additional item: text type -->
<div part="item__additional-item">
  <span part="text">Value</span>
</div>

<!-- Additional item: action type -->
<div part="item__additional-item">
  <button part="action [action--fix | action--modify | action--remove | action--custom] [fixed | not-fixed] [disabled]"></button>
</div>

<!-- Confirm/cancel buttons (when action triggers confirmation) -->
<div part="item__additional-item-confirm">
  <button part="action--accept"></button>
  <button part="action--cancel"></button>
</div>
```
