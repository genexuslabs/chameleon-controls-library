# ch-checkbox: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: With caption](#case-1-with-caption)
  - [Case 2: Without caption (no start image)](#case-2-without-caption-no-start-image)

## Shadow Parts

| Part              | Description                                                                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"checked"`       | Present in the `input`, `option`, `label` and `container` parts when the control is checked and not indeterminate (`value` === `checkedValue` and `indeterminate !== true`).     |
| `"container"`     | The container that serves as a wrapper for the `input` and the `option` parts.                                                                                                   |
| `"disabled"`      | Present in the `input`, `option`, `label` and `container` parts when the control is disabled (`disabled` === `true`).                                                            |
| `"indeterminate"` | Present in the `input`, `option`, `label` and `container` parts when the control is indeterminate (`indeterminate` === `true`). Takes precedence over `checked`/`unchecked`.     |
| `"input"`         | The native `<input type="checkbox">` element that implements the interactions for the component.                                                                                 |
| `"label"`         | The `<label>` element that wraps the checkbox and caption text. Only present when `caption` is set or `startImgSrc` resolves to a valid image.                                   |
| `"option"`        | The decorative overlay rendered above the `input` part. This part has `position: absolute` and `pointer-events: none`, and is always `aria-hidden`.                              |
| `"unchecked"`     | Present in the `input`, `option`, `label` and `container` parts when the control is unchecked and not indeterminate (`value` === `unCheckedValue` and `indeterminate !== true`). |

## CSS Custom Properties

| Name                                        | Description                                                                                                                                                                                                                                                |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ch-checkbox__background-image-size`      | Specifies the size of the start image of the control. @default 100%                                                                                                                                                                                        |
| `--ch-checkbox__container-size`             | Specifies the size for the container of the `input` and `option` elements. @default min(1em, 20px)                                                                                                                                                         |
| `--ch-checkbox__image-size`                 | Specifies the box size that contains the start image of the control. @default 0.875em                                                                                                                                                                      |
| `--ch-checkbox__option-checked-image`       | Specifies the image of the checkbox when is checked. @default url("data:image/svg+xml, <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><path fill='currentColor' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z'/></svg>")       |
| `--ch-checkbox__option-image-size`          | Specifies the image size of the `option` element. @default 100%                                                                                                                                                                                            |
| `--ch-checkbox__option-indeterminate-image` | Specifies the image of the checkbox when is indeterminate. @default url("data:image/svg+xml, <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><path fill='currentColor' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z'/></svg>") |
| `--ch-checkbox__option-size`                | Specifies the size for the `option` element. @default 50%                                                                                                                                                                                                  |

## Shadow DOM Layout

## Case 1: With caption

```
<ch-checkbox>
  | #shadow-root
  | <label part="label [checked | unchecked] [indeterminate] [disabled]">
  |   <div part="container [checked | unchecked] [indeterminate] [disabled]">
  |     <input part="input" type="checkbox" />
  |     <div part="option [checked | unchecked] [indeterminate] [disabled]"></div>
  |   </div>
  |   Caption text
  | </label>
</ch-checkbox>
```

## Case 2: Without caption (no start image)

```
<ch-checkbox>
  | #shadow-root
  | <div part="container [checked | unchecked] [indeterminate] [disabled]">
  |   <input part="input" type="checkbox" />
  |   <div part="option [checked | unchecked] [indeterminate] [disabled]"></div>
  | </div>
</ch-checkbox>
```
