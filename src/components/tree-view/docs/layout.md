# ch-tree-view-render: Shadow DOM layout

## Case 1: Default

```
<ch-tree-view-render>
  | #shadow-root
  | <ch-tree-view>
  |   | #shadow-root
  |   | <div part="drag-preview"></div>
  |   | <slot />
  |
  |   <!-- for each item in model -->
  |   <ch-tree-view-item part="item [drag-enter]">
  |     | #shadow-root
  |     | <button part="item__header [disabled] [drag-enter] [selected | not-selected] [expand-button] [editing | not-editing] [level-0-leaf] [even-level | odd-level] [expanded | collapsed]">
  |     |
  |     |   <!-- when expandableButton === "action" && !leaf -->
  |     |   <button part="item__expandable-button [disabled] [expanded | collapsed]"></button>
  |     |
  |     |   <!-- when checkbox -->
  |     |   <ch-checkbox part="item__checkbox [checked | unchecked | indeterminate] [disabled]">
  |     |     | #shadow-root
  |     |     | <div part="item__checkbox-container">
  |     |     |   <input part="item__checkbox-input" type="checkbox" />
  |     |     |   <div part="item__checkbox-option"></div>
  |     |     | </div>
  |     |   </ch-checkbox>
  |     |
  |     |   <!-- when customRender: custom content slot -->
  |     |   <slot name="custom-content" />
  |     |
  |     |   <!-- else (default action) -->
  |     |   <div part="item__action [editing | not-editing] [expanded | collapsed]">
  |     |     <!-- when startImgSrc -->
  |     |     <div part="item__img start-img"></div>
  |     |     <!-- when editing -->
  |     |     <input part="item__edit-caption" />
  |     |     <!-- else -->
  |     |     Caption text
  |     |     <!-- when endImgSrc -->
  |     |     <div part="item__img end-img"></div>
  |     |   </div>
  |     |
  |     |   <!-- when downloading && !leaf -->
  |     |   <div part="item__downloading"></div>
  |     |
  |     |   <!-- when showLines -->
  |     |   <div part="item__line [last-line]"></div>
  |     |
  |     | </button>
  |     |
  |     | <!-- when !leaf (has children) -->
  |     | <div role="group" part="item__group [expanded | collapsed] [even-level | odd-level] [lazy-loaded]">
  |     |   <slot />
  |     | </div>
  |   </ch-tree-view-item>
  | </ch-tree-view>
</ch-tree-view-render>
```
