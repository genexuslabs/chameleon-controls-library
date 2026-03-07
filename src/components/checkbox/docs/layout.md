# ch-checkbox: Shadow DOM layout

## Case 1: With caption

```
<ch-checkbox>
  | #shadow-root
  | <label part="label [checked | unchecked] [indeterminate] [disabled]">
  |   <div part="container [checked | unchecked] [indeterminate] [disabled]">
  |     <input part="input" type="checkbox" />
  |     <div part="option [checked | unchecked] [indeterminate] [disabled]"></div>
  |   </div>
  |   Caption text
  | </label>
</ch-checkbox>
```

## Case 2: Without caption (no start image)

```
<ch-checkbox>
  | #shadow-root
  | <div part="container [checked | unchecked] [indeterminate] [disabled]">
  |   <input part="input" type="checkbox" />
  |   <div part="option [checked | unchecked] [indeterminate] [disabled]"></div>
  | </div>
</ch-checkbox>
```
