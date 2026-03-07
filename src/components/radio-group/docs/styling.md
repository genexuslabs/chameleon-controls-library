# ch-radio-group-render: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default (items from model)](#case-1-default-items-from-model)

## Shadow Parts

| Part                 | Description                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"checked"`          | Present in the `radio-item`, `radio__option`, `radio__label` and `radio__container` parts when the control is checked (`checked` === `true`).     |
| `"disabled"`         | Present in the `radio-item`, `radio__option`, `radio__label` and `radio__container` parts when the control is disabled (`disabled` === `true`).   |
| `"radio-item"`       | The radio item element.                                                                                                                           |
| `"radio__container"` | The container that serves as a wrapper for the `input` and the `option` parts.                                                                    |
| `"radio__input"`     | The invisible input element that implements the interactions for the component. This part must be kept "invisible".                               |
| `"radio__label"`     | The label that is rendered when the `caption` property is not empty.                                                                              |
| `"radio__option"`    | The actual "input" that is rendered above the `input` part. This part has `position: absolute` and `pointer-events: none`.                        |
| `"unchecked"`        | Present in the `radio-item`, `radio__option`, `radio__label` and `radio__container` parts when the control is not checked (`checked` !== `true`). |

## CSS Custom Properties

| Name                                     | Description                                                                                                      |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `--ch-radio-group__radio-container-size` | Specifies the size for the container of the `radio__input` and `radio__option` elements. @default min(1em, 20px) |
| `--ch-radio-group__radio-option-size`    | Specifies the size for the `radio__option` element. @default 50%                                                 |

## Shadow DOM Layout

## Case 1: Default (items from model)

```
<ch-radio-group-render role="radiogroup">
  | #shadow-root
  | <!-- for each item in model -->
  | <div part="radio-item [checked | unchecked] [disabled]">
  |   <div part="radio__container [checked | unchecked] [disabled]">
  |     <input part="radio__input" type="radio" />
  |     <div part="radio__option [checked | unchecked] [disabled]"></div>
  |   </div>
  |   <!-- when item.caption -->
  |   <label part="radio__label [checked | unchecked] [disabled]">
  |     Caption text
  |   </label>
  | </div>
</ch-radio-group-render>
```
