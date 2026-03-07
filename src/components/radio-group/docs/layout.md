# ch-radio-group-render: Shadow DOM layout

## Case 1: Default (items from model)

```
<ch-radio-group-render role="radiogroup">
  | #shadow-root
  | <!-- for each item in model -->
  | <div part="radio-item [checked | unchecked] [disabled]">
  |   <div part="radio__container [checked | unchecked] [disabled]">
  |     <input part="radio__input" type="radio" />
  |     <div part="radio__option [checked | unchecked] [disabled]"></div>
  |   </div>
  |   <!-- when item.caption -->
  |   <label part="radio__label [checked | unchecked] [disabled]">
  |     Caption text
  |   </label>
  | </div>
</ch-radio-group-render>
```
