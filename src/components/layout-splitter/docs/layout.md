# ch-layout-splitter: Shadow DOM layout

## Case 1: Horizontal/vertical layout with items

```
<ch-layout-splitter>
  | #shadow-root
  | <div>
  |   <!-- for each item in model.items -->
  |   <div part="{item.id}">
  |     <!-- Nested group: recurse with children -->
  |     <!-- else (leaf) -->
  |     <slot name="{item.id}" />
  |   </div>
  |   <!-- Separator between items -->
  |   <div part="bar [{dragBar.part}]"></div>
  | </div>
</ch-layout-splitter>
```

## Case 2: No model

```
<ch-layout-splitter>
  | #shadow-root
  | (empty)
</ch-layout-splitter>
```
