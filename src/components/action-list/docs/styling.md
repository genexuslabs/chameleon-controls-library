# ch-action-list-render: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default (items from model)](#case-1-default-items-from-model)
  - [Additional items inside ch-action-list-item](#additional-items-inside-ch-action-list-item)

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
