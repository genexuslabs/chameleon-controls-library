# ch-combo-box-render: Shadow DOM layout

## Case 1: Desktop, expanded with items

```
<ch-combo-box-render part="[ch-combo-box-render--placeholder] [{hostParts}]">
  | #shadow-root
  | <span class="invisible-text"></span>
  | <div role="combobox">
  |   <input />
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
  |   <input />
  | </div>
  | <ch-popover id="popover" role="listbox" part="window">
  |   | #shadow-root
  |   | <slot />
  |
  |   <!-- for each group in model -->
  |   <div role="group" part="{item.value} group [disabled]">
  |     <!-- when expandable -->
  |     <button part="{item.value} group__header expandable [disabled] [expanded | collapsed]">
  |       <span part="group__header-caption {item.value}">Caption text</span>
  |     </button>
  |     <!-- else (not expandable) -->
  |     <span part="{item.value} group__header [disabled]">Caption text</span>
  |
  |     <div part="group__content {item.value}">
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
  |   <input />
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
