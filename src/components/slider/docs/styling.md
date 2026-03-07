# ch-slider: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default](#case-1-default)

## Shadow Parts

| Part                  | Description                                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"disabled"`          | Present in all parts when the control is disabled (`disabled` === `true`).                                                                              |
| `"thumb"`             | The thumb of the slider element.                                                                                                                        |
| `"track"`             | The track of the slider element.                                                                                                                        |
| `"track__selected"`   | Represents the portion of the track that is selected, that is, the portion of the track that starts at the min value and goes to the current value.     |
| `"track__unselected"` | Represents the portion of the track that is not selected, that is, the portion of the track that starts at the current value and goes to the max value. |

## CSS Custom Properties

| Name                                             | Description                                                                                                                       |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `--ch-slider-thumb-background-color`             | Specifies the background-color of the thumb. @default currentColor                                                                |
| `--ch-slider-thumb-size`                         | Specifies the size of the thumb. @default clamp(8px, 1.5em, 24px)                                                                 |
| `--ch-slider-track-block-size`                   | Specifies the block size of the track. @default clamp(3px, 0.25em, 16px)                                                          |
| `--ch-slider-track__selected-background-color`   | Specifies the background-color of the selected portion of the track. @default color-mix(in srgb, currentColor 15%, transparent)   |
| `--ch-slider-track__unselected-background-color` | Specifies the background-color of the unselected portion of the track. @default color-mix(in srgb, currentColor 15%, transparent) |

## Shadow DOM Layout

## Case 1: Default

```
<ch-slider>
  | #shadow-root
  | <div class="position-absolute-wrapper">
  |   <input type="range" />
  |   <div part="track [disabled]">
  |     <div part="track__selected [disabled]"></div>
  |     <div part="track__unselected [disabled]"></div>
  |   </div>
  |   <div part="thumb [disabled]"></div>
  | </div>
</ch-slider>
```
