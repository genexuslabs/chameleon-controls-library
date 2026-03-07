# ch-accordion-render: Shadow DOM layout

## Case 1: Default (items from model)

```
<ch-accordion-render>
  | #shadow-root
  | <!-- for each item in model -->
  | <div part="{item.id} panel [disabled] [expanded | collapsed]">
  |   <button part="{item.id} [headerSlotId] header [disabled] [expanded | collapsed]">
  |     <!-- when headerSlotId -->
  |     <slot name="{headerSlotId}" />
  |     <!-- else -->
  |     Caption text
  |   </button>
  |   <section>
  |     <!-- when expanded or previously rendered -->
  |     <div part="{item.id} section [disabled] [expanded | collapsed]">
  |       <slot name="{item.id}" />
  |     </div>
  |   </section>
  | </div>
</ch-accordion-render>
```
