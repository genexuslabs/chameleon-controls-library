# ch-edit: Shadow DOM layout

## Case 1: Single-line input

```
<ch-edit part="[ch-edit--empty-value] [{hostParts}]">
  | #shadow-root
  | <!-- when showAdditionalContentBefore -->
  | <slot name="additional-content-before" />
  |
  | <input type="text | email | number | password | ..." />
  |
  | <!-- when type === "date" && placeholder && !value -->
  | <div part="date-placeholder">Placeholder text</div>
  |
  | <!-- when showAdditionalContentAfter -->
  | <slot name="additional-content-after" />
  |
  | <!-- when type === "search" && value -->
  | <button part="clear-button [disabled]"></button>
  |
  | <!-- when type === "password" && showPasswordButton -->
  | <button part="show-password-button [disabled] [password-displayed | password-hidden]"></button>
</ch-edit>
```

## Case 2: Multiline (textarea)

```
<ch-edit part="[ch-edit--empty-value] [{hostParts}]">
  | #shadow-root
  | <!-- when showAdditionalContentBefore -->
  | <slot name="additional-content-before" />
  |
  | <textarea></textarea>
  |
  | <!-- when showAdditionalContentAfter -->
  | <slot name="additional-content-after" />
</ch-edit>
```
