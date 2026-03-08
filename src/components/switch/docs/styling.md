# ch-switch: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default](#case-1-default)

## Shadow Parts

| Part          | Description                                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| `"caption"`   | The caption (checked or unchecked) of the switch element.                                                         |
| `"checked"`   | Present in the `track`, `thumb` and `caption` parts when the control is checked (`value` === `checkedValue`).     |
| `"disabled"`  | Present in the `track`, `thumb` and `caption` parts when the control is disabled (`disabled` === `true`).         |
| `"thumb"`     | The thumb of the switch element.                                                                                  |
| `"track"`     | The track of the switch element.                                                                                  |
| `"unchecked"` | Present in the `track`, `thumb` and `caption` parts when the control is unchecked (`value` === `unCheckedValue`). |

## CSS Custom Properties

| Name                                            | Description                                                                                                                       |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `--ch-switch-thumb-size`                        | Specifies the size of the thumb. @default clamp(8px, 1em, 24px)                                                                   |
| `--ch-switch-thumb__checked-background-color`   | Specifies the background color of the thumb when the control is checked. @default currentColor                                    |
| `--ch-switch-thumb__state-transition-duration`  | Specifies the transition duration of the thumb when switching between states. @default 0ms                                        |
| `--ch-switch-thumb__unchecked-background-color` | Specifies the background color of the thumb when the control is unchecked. @default #b2b2b2                                       |
| `--ch-switch-track-block-size`                  | Specifies the block size of the track. @default clamp(3px, 0.5em, 16px)                                                           |
| `--ch-switch-track-inline-size`                 | Specifies the inline size of the track. @default clamp(3px, 0.5em, 16px)                                                          |
| `--ch-switch-track__checked-background-color`   | Specifies the background color of the track when the control is checked. @default color-mix(in srgb, currentColor 35%, #b2b2b2)   |
| `--ch-switch-track__unchecked-background-color` | Specifies the background color of the track when the control is unchecked. @default color-mix(in srgb, currentColor 35%, #b2b2b2) |

## Shadow DOM Layout

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
