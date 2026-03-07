# ch-sidebar: Shadow DOM layout

## Case 1: Expand button before content

```
<ch-sidebar>
  | #shadow-root
  | <!-- when showExpandButton && expandButtonPosition === "before" -->
  | <button part="expand-button [expanded | collapsed]"></button>
  | <slot />
</ch-sidebar>
```

## Case 2: Expand button after content

```
<ch-sidebar>
  | #shadow-root
  | <slot />
  | <!-- when showExpandButton && expandButtonPosition === "after" -->
  | <button part="expand-button [expanded | collapsed]"></button>
</ch-sidebar>
```

## Case 3: No expand button

```
<ch-sidebar>
  | #shadow-root
  | <slot />
</ch-sidebar>
```
