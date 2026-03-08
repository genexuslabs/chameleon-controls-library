# ch-rating: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default](#case-1-default)

## Shadow Parts

| Part                 | Description                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| `"partial-selected"` | Present in the `star-container` and `star` parts when the star is partially selected (fractional value).        |
| `"selected"`         | Present in the `star-container` and `star` parts when the star is fully selected.                               |
| `"star"`             | The visual star element rendered inside each star container. Combined with state parts to indicate selection.   |
| `"star-container"`   | The wrapper for an individual star, including its radio input. Combined with state parts to indicate selection. |
| `"stars-container"`  | The container that wraps all individual star elements.                                                          |
| `"unselected"`       | Present in the `star-container` and `star` parts when the star is not selected at all.                          |

## CSS Custom Properties

| Name                                            | Description                                                                                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `--ch-rating-star__selected-background-color`   | Specifies the background-color of the selected portion of the star. @default currentColor                                            |
| `--ch-rating-star__size`                        | Specifies the size of the star.                                                                                                      |
| `--ch-rating-star__unselected-background-color` | Specifies the background-color of the unselected portion of the star. @default color-mix(in srgb, currentColor 50%, transparent 50%) |

## Shadow DOM Layout

## Case 1: Default

```
<ch-rating>
  | #shadow-root
  | <div part="stars-container">
  |   <!-- for each star in maxValue -->
  |   <div part="star-container [selected | unselected | partial-selected]">
  |     <div part="star [selected | unselected | partial-selected]"></div>
  |     <input type="radio" />
  |   </div>
  | </div>
</ch-rating>
```
