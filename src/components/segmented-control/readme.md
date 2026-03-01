# ch-segmented-control-render



<!-- Auto Generated Below -->


## Overview

The `ch-segmented-control-render` component presents a horizontal set of
mutually exclusive options as a row of connected segments.

## Properties

| Property       | Attribute        | Description                                                                                                                                      | Type                          | Default                          |
| -------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- | -------------------------------- |
| `exportParts`  | `export-parts`   | Specifies the parts that are exported by the internal segmented-control-item. This property is useful to override the exported parts.            | `string`                      | `SEGMENTED_CONTROL_EXPORT_PARTS` |
| `itemCssClass` | `item-css-class` | A CSS class to set as the `ch-segmented-control-item` element class. This default class is used for the items that don't have an explicit class. | `string`                      | `"segmented-control-item"`       |
| `model`        | --               | This property lets you define the items of the ch-segmented-control-render control.                                                              | `SegmentedControlItemModel[]` | `undefined`                      |
| `selectedId`   | `selected-id`    | Specifies the ID of the selected item                                                                                                            | `string`                      | `undefined`                      |


## Events

| Event                | Description                                                                                 | Type                  |
| -------------------- | ------------------------------------------------------------------------------------------- | --------------------- |
| `selectedItemChange` | Fired when the selected item change. It contains the information about the new selected id. | `CustomEvent<string>` |


## Shadow Parts

| Part           | Description                                                                                                                             |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `"action"`     | The `<button>` element for each segment. Receives the `selected`, `unselected`, `disabled`, `first`, `last`, and `between` state parts. |
| `"between"`    | Present in the `action` part when the segment is neither the first nor the last item.                                                   |
| `"disabled"`   | Present in the `action` part when the segment is disabled.                                                                              |
| `"first"`      | Present in the `action` part when the segment is the first item in the group.                                                           |
| `"last"`       | Present in the `action` part when the segment is the last item in the group.                                                            |
| `"selected"`   | Present in the `action` part when the segment is the currently selected one.                                                            |
| `"unselected"` | Present in the `action` part when the segment is not selected.                                                                          |


## Dependencies

### Used by

 - [ch-showcase](../../showcase/assets/components)

### Depends on

- [ch-segmented-control-item](./internal/segmented-control-item)

### Graph
```mermaid
graph TD;
  ch-segmented-control-render --> ch-segmented-control-item
  ch-showcase --> ch-segmented-control-render
  style ch-segmented-control-render fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
