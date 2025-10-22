# ch-sidebar



<!-- Auto Generated Below -->


## Properties

| Property                             | Attribute                                | Description                                                                                                                                                                                                                                           | Type                  | Default     |
| ------------------------------------ | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------- |
| `expandButtonCollapseAccessibleName` | `expand-button-collapse-accessible-name` | Specifies a short string, typically 1 to 3 words, that authors associate with an element to provide users of assistive technologies with a label for expand button when `expanded = true`.                                                            | `string`              | `undefined` |
| `expandButtonCollapseCaption`        | `expand-button-collapse-caption`         | Specifies the caption of the expand button when `expanded = true`.                                                                                                                                                                                    | `string`              | `undefined` |
| `expandButtonExpandAccessibleName`   | `expand-button-expand-accessible-name`   | Specifies a short string, typically 1 to 3 words, that authors associate with an element to provide users of assistive technologies with a label for expand button when `expanded = false`.                                                           | `string`              | `undefined` |
| `expandButtonExpandCaption`          | `expand-button-expand-caption`           | Specifies the caption of the expand button when `expanded = false`.                                                                                                                                                                                   | `string`              | `undefined` |
| `expandButtonPosition`               | `expand-button-position`                 | Specifies the position of the expand button relative to the content of the sidebar.  - `"before"`: The expand button is positioned before the content of the sidebar.  - `"after"`: The expand button is positioned after the content of the sidebar. | `"after" \| "before"` | `"after"`   |
| `expanded`                           | `expanded`                               | Specifies whether the control is expanded or collapsed.                                                                                                                                                                                               | `boolean`             | `true`      |
| `showExpandButton`                   | `show-expand-button`                     | `true` to display a expandable button at the bottom of the control.                                                                                                                                                                                   | `boolean`             | `false`     |


## Events

| Event            | Description                                                                   | Type                   |
| ---------------- | ----------------------------------------------------------------------------- | ---------------------- |
| `expandedChange` | Emitted when the element is clicked or the space key is pressed and released. | `CustomEvent<boolean>` |


## CSS Custom Properties

| Name                                     | Description                                                                                                                                                                                                                                                                        |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--ch-sidebar__chevron-background-image` | Specifies the image of expand button. @default url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" style="transform:rotate(-90deg)" viewBox="0 0 18 18" fill="none"><path d="M16.5 5L8.7 12.7L1 5" stroke="%23000" stroke-width="1.2" stroke-linecap="round"/></svg>') |
| `--ch-sidebar__chevron-image-size`       | Specifies the image size of the expandable button. @default 100%                                                                                                                                                                                                                   |
| `--ch-sidebar__chevron-size`             | Specifies the expandable button size. @default 0.875em                                                                                                                                                                                                                             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
