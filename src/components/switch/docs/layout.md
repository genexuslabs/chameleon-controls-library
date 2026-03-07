# ch-switch: Shadow DOM layout

## Case 1: Default

```
<ch-switch>
  | #shadow-root
  | <label>
  |   <div part="track [checked | unchecked] [disabled]">
  |     <input part="thumb [checked | unchecked] [disabled]" type="checkbox" role="switch" />
  |   </div>
  |   <span part="caption [checked | unchecked] [disabled]">
  |     Caption text
  |   </span>
  | </label>
</ch-switch>
```
