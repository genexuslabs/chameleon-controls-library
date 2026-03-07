# ch-image: Styling

## Table of Contents

- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Default](#case-1-default)

## CSS Custom Properties

| Name                         | Description                                                      |
| ---------------------------- | ---------------------------------------------------------------- |
| `--ch-image-background-size` | Specifies the size of the image. @default 100%                   |
| `--ch-image-size`            | Specifies the box size that contains the image. @default 0.875em |

## Shadow DOM Layout

## Case 1: Default

```
<ch-image>
  | #shadow-root
  | (empty — image rendered via CSS background/mask on Host)
</ch-image>
```
