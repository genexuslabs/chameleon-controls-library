# ch-layout-splitter: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Horizontal/vertical layout with items](#case-1-horizontalvertical-layout-with-items)
  - [Case 2: No model](#case-2-no-model)

## Shadow Parts

| Part          | Description                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `"bar"`       | The drag bar separator that divides two columns or two rows. May include an additional custom part when the item specifies `dragBar.part`. |
| `"{item.id}"` | Exposed on every group container, enabling per-item styling from outside the shadow DOM.                                                   |

## Shadow DOM Layout

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
