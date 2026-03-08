# ch-combo-box-render: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Desktop, expanded with items](#case-1-desktop-expanded-with-items)
  - [Case 2: Desktop, expanded with groups](#case-2-desktop-expanded-with-groups)
  - [Case 3: Desktop, collapsed](#case-3-desktop-collapsed)
  - [Case 4: Mobile (native select)](#case-4-mobile-native-select)

## Shadow Parts

| Part                                 | Description                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------ |
| `"ch-combo-box-render--placeholder"` | Present on the host when no item is selected and the placeholder text is displayed.  |
| `"collapsed"`                        | State part applied to collapsed group headers and expandable buttons.                |
| `"disabled"`                         | State part applied to disabled items, groups, group headers, and expandable headers. |
| `"expandable"`                       | Applied to group headers that can be expanded or collapsed.                          |
| `"expanded"`                         | State part applied to expanded group headers and expandable buttons.                 |
| `"group"`                            | Applied to each item group container.                                                |
| `"group__content"`                   | The container that wraps the child items of a group.                                 |
| `"group__header"`                    | The header element of an item group.                                                 |
| `"group__header-caption"`            | The caption text inside a group header.                                              |
| `"item"`                             | Applied to each selectable leaf item in the list.                                    |
| `"nested"`                           | State part applied to items that are nested inside a group.                          |
| `"section"`                          | Applied to section containers in the dropdown.                                       |
| `"selected"`                         | State part applied to the currently selected item.                                   |
| `"window"`                           | The popover element that contains the dropdown list of items.                        |

## CSS Custom Properties

| Name                                                 | Description                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ch-combo-box-group__expandable-button-image-size` | Specifies the image size of the expandable button size in the group items. @default 100%                                                                                                                                                                                                                    |
| `--ch-combo-box-group__expandable-button-size`       | Specifies the expandable button size in the group items. @default 0.875em                                                                                                                                                                                                                                   |
| `--ch-combo-box-item-gap`                            | Specifies the spacing between the images, text and the expandable button on items. @default 0px                                                                                                                                                                                                             |
| `--ch-combo-box-item__background-image-size`         | Specifies the image size of the items. For example, the image size for the startImgSrc and endImgSrc @default 100%                                                                                                                                                                                          |
| `--ch-combo-box-item__image-size`                    | Specifies the box size that contains an image in the items. For example, the box for the startImgSrc and endImgSrc @default 0.875em                                                                                                                                                                         |
| `--ch-combo-box-separation`                          | Specifies the separation between the combo-box and the displayed popover. @default 0px                                                                                                                                                                                                                      |
| `--ch-combo-box-separation-x`                        | Specifies the separation between the combo-box and the popover displayed on the x-axis. @default var(--ch-combo-box-separation)                                                                                                                                                                             |
| `--ch-combo-box-separation-y`                        | Specifies the separation between the combo-box and the popover displayed on the y-axis. @default var(--ch-combo-box-separation)                                                                                                                                                                             |
| `--ch-combo-box__picker`                             | Specifies the image of the combo-box's picker. @default url('data:image/svg+xml,<svg width="8" height="12" viewBox="0 0 8 12" xmlns="http://www.w3.org/2000/svg"><path d="M4.16669 0.666626L7.66669 4.66663H0.666687L4.16669 0.666626ZM4.16669 11.3333L0.666687 7.33329H7.66669L4.16669 11.3333Z"/></svg>') |
| `--ch-combo-box__picker-collapsed`                   | Specifies the image of the combo-box's picker when it is collapsed. @default var(--ch-combo-box__picker)                                                                                                                                                                                                    |
| `--ch-combo-box__picker-color`                       | Specifies the color of the combo-box's picker. @default currentColor                                                                                                                                                                                                                                        |
| `--ch-combo-box__picker-expanded`                    | Specifies the image of the combo-box's picker when it is expanded. @default var(--ch-combo-box__picker)                                                                                                                                                                                                     |
| `--ch-combo-box__picker-image-size`                  | Specifies the image size of the combo-box's picker. @default 100%                                                                                                                                                                                                                                           |
| `--ch-combo-box__picker-size`                        | Specifies the box size that contains the combo-box's picker. @default 0.875em                                                                                                                                                                                                                               |
| `--ch-combo-box__placeholder-color`                  | Define the placeholder color when the combo-box does not have a value set. (currentColor by default)                                                                                                                                                                                                        |
| `--ch-combo-box__popover-max-block-size`             | Specifies the maximum block size of the popover. Only px values are supported. @default auto                                                                                                                                                                                                                |
| `--ch-combo-box__popover-max-inline-size`            | Specifies the maximum inline size of the popover. Only px values are supported. @default auto                                                                                                                                                                                                               |

## Shadow DOM Layout

## Case 1: Desktop, expanded with items

```
<ch-combo-box-render part="[ch-combo-box-render--placeholder] [{hostParts}]">
  | #shadow-root
  | <span class="invisible-text"></span>
  | <div role="combobox">
  |   <input aria-controls="popover" />
  | </div>
  | <ch-popover id="popover" role="listbox" part="window">
  |   | #shadow-root
  |   | <slot />
  |
  |   <!-- for each item in model -->
  |   <button role="option" part="{item.value} item [nested] [disabled] [selected]">
  |     Caption text
  |   </button>
  | </ch-popover>
</ch-combo-box-render>
```

## Case 2: Desktop, expanded with groups

```
<ch-combo-box-render part="[ch-combo-box-render--placeholder] [{hostParts}]">
  | #shadow-root
  | <span class="invisible-text"></span>
  | <div role="combobox">
  |   <input aria-controls="popover" />
  | </div>
  | <ch-popover id="popover" role="listbox" part="window">
  |   | #shadow-root
  |   | <slot />
  |
  |   <!-- for each group in model -->
  |   <div role="group" aria-labelledby="{index}" part="{item.value} group [disabled]">
  |     <!-- when expandable -->
  |     <button id="{index}" aria-expanded="{expanded}" aria-controls="{index}__content" part="{item.value} group__header expandable [disabled] [expanded | collapsed]">
  |       <span part="group__header-caption {item.value}">Caption text</span>
  |     </button>
  |     <!-- else (not expandable) -->
  |     <span id="{index}" part="{item.value} group__header [disabled]">Caption text</span>
  |
  |     <div id="{index}__content" part="group__content {item.value}">
  |       <!-- for each item in group.items -->
  |       <button role="option" part="{item.value} item nested [disabled] [selected]">
  |         Caption text
  |       </button>
  |     </div>
  |   </div>
  | </ch-popover>
</ch-combo-box-render>
```

## Case 3: Desktop, collapsed

```
<ch-combo-box-render part="[ch-combo-box-render--placeholder] [{hostParts}]">
  | #shadow-root
  | <span class="invisible-text"></span>
  | <div role="combobox">
  |   <input aria-controls="popover" />
  | </div>
</ch-combo-box-render>
```

## Case 4: Mobile (native select)

```
<ch-combo-box-render part="[ch-combo-box-render--placeholder] [{hostParts}]">
  | #shadow-root
  | <select>
  |   <!-- for each item in model -->
  |   <option>Caption text</option>
  |   <!-- for each group in model -->
  |   <optgroup label="Group caption">
  |     <!-- for each item in group.items -->
  |     <option>Caption text</option>
  |   </optgroup>
  | </select>
</ch-combo-box-render>
```
