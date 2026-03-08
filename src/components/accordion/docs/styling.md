# ch-accordion-render: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default (items from model)](#case-1-default-items-from-model)

## Shadow Parts

| Part          | Description                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------- |
| `"collapsed"` | Present in the `header`, `panel`, and `section` parts when the item is collapsed.             |
| `"disabled"`  | Present in the `header`, `panel`, and `section` parts when the item is disabled.              |
| `"expanded"`  | Present in the `header`, `panel`, and `section` parts when the item is expanded.              |
| `"header"`    | The clickable `<button>` element that toggles the collapsible section. Present on every item. |
| `"panel"`     | The outer container that wraps the `header` and the `section` of each item.                   |
| `"section"`   | The collapsible `<section>` element that contains the item's body content.                    |

## CSS Custom Properties

| Name                                                                                                                            | Description                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ch-accordion-expand-collapse-duration Specifies duration of the expand and collapse animation @default 0ms`                  |                                                                                                                                                                                                                                                                                           |
| `--ch-accordion-expand-collapse-timing-function Specifies timing function of the expand and collapse animation @default linear` |                                                                                                                                                                                                                                                                                           |
| `--ch-accordion__chevron-color`                                                                                                 | Specifies the color of the chevron. @default currentColor                                                                                                                                                                                                                                 |
| `--ch-accordion__chevron-image-size`                                                                                            | Specifies the image size of the chevron. @default 100%                                                                                                                                                                                                                                    |
| `--ch-accordion__chevron-size`                                                                                                  | Specifies the box size of the chevron. @default 0.875em                                                                                                                                                                                                                                   |
| `--ch-accordion__header-background-image`                                                                                       | Specifies the background image used for the expandable chevron in the header. @default url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="none"><path d="M16.5 5L8.7 12.7L1 5" stroke="%23000" stroke-width="1.2" stroke-linecap="round"/></svg>') |
| `--ch-accordion__header-background-image-size`                                                                                  | Specifies the size of the start image of the header. @default 100%                                                                                                                                                                                                                        |
| `--ch-accordion__header-image-size`                                                                                             | Specifies the box size that contains the start image of the header. @default 0.875em                                                                                                                                                                                                      |

## Shadow DOM Layout

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
