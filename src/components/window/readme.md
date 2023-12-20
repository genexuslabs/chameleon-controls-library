# ch-modal

<!-- Auto Generated Below -->


## Overview

The 'ch-window' component represents a popup container that is positioned
relative to an element or the screen.

## Properties

| Property              | Attribute                | Description                                                                          | Type                                                                             | Default     |
| --------------------- | ------------------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ----------- |
| `allowDrag`           | `allow-drag`             | Specifies the drag behavior of the window.                                           | `"box" \| "header" \| "no"`                                                      | `"no"`      |
| `caption`             | `caption`                | The caption or title of the window.                                                  | `string`                                                                         | `""`        |
| `closeOnEscape`       | `close-on-escape`        | Determines whether the window should close when the Escape key is pressed.           | `boolean`                                                                        | `undefined` |
| `closeOnOutsideClick` | `close-on-outside-click` | Determines whether the window should close when clicked outside.                     | `boolean`                                                                        | `undefined` |
| `closeText`           | `close-text`             | The text for the close button.                                                       | `string`                                                                         | `undefined` |
| `closeTooltip`        | `close-tooltip`          | The tooltip text for the close button.                                               | `string`                                                                         | `undefined` |
| `container`           | --                       | The container element for the window.                                                | `HTMLElement`                                                                    | `undefined` |
| `hidden`              | `hidden`                 | Determines if the window is hidden or visible.                                       | `boolean`                                                                        | `true`      |
| `modal`               | `modal`                  | Specifies whether the window should be displayed as a modal.                         | `boolean`                                                                        | `true`      |
| `showFooter`          | `show-footer`            | This attribute lets you specify if a footer is rendered at the bottom of the window. | `boolean`                                                                        | `true`      |
| `showHeader`          | `show-header`            | This attribute lets you specify if a header is rendered on top of the window.        | `boolean`                                                                        | `true`      |
| `showMain`            | `show-main`              | This attribute lets you specify if a div wrapper is rendered for the default slot.   | `boolean`                                                                        | `true`      |
| `showSeparation`      | `show-separation`        | This attribute lets you specify if a div between the container and the window space. | `boolean`                                                                        | `false`     |
| `xAlign`              | `x-align`                | The horizontal alignment of the window.                                              | `"center" \| "inside-end" \| "inside-start" \| "outside-end" \| "outside-start"` | `"center"`  |
| `yAlign`              | `y-align`                | The vertical alignment of the window.                                                | `"center" \| "inside-end" \| "inside-start" \| "outside-end" \| "outside-start"` | `"center"`  |


## Events

| Event          | Description                        | Type               |
| -------------- | ---------------------------------- | ------------------ |
| `windowClosed` | Emitted when the window is closed. | `CustomEvent<any>` |
| `windowOpened` | Emitted when the window is opened. | `CustomEvent<any>` |


## Shadow Parts

| Part           | Description |
| -------------- | ----------- |
| `"caption"`    |             |
| `"close"`      |             |
| `"footer"`     |             |
| `"header"`     |             |
| `"main"`       |             |
| `"mask"`       |             |
| `"separation"` |             |
| `"window"`     |             |


## Dependencies

### Used by

 - [ch-dropdown](../dropdown)
 - [ch-grid-column-settings](../grid/grid-column/grid-column-settings)
 - [ch-grid-row-actions](../grid/grid-row-actions)
 - [ch-grid-settings](../grid/grid-settings)
 - [ch-shortcuts](../shortcuts)
 - [ch-suggest](../suggest)
 - [ch-tooltip](../tooltip)

### Depends on

- [ch-window-close](window-close)

### Graph
```mermaid
graph TD;
  ch-window --> ch-window-close
  ch-dropdown --> ch-window
  ch-grid-column-settings --> ch-window
  ch-grid-row-actions --> ch-window
  ch-grid-settings --> ch-window
  ch-shortcuts --> ch-window
  ch-suggest --> ch-window
  ch-tooltip --> ch-window
  style ch-window fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
