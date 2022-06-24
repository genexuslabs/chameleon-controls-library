# ch-modal

<!-- Auto Generated Below -->

## Properties

| Property       | Attribute       | Description | Type      | Default     |
| -------------- | --------------- | ----------- | --------- | ----------- |
| `caption`      | `caption`       |             | `string`  | `""`        |
| `closeAuto`    | `close-auto`    |             | `boolean` | `undefined` |
| `closeText`    | `close-text`    |             | `string`  | `undefined` |
| `closeTooltip` | `close-tooltip` |             | `string`  | `undefined` |
| `hidden`       | `hidden`        |             | `boolean` | `true`      |
| `modal`        | `modal`         |             | `boolean` | `true`      |

## Events

| Event          | Description | Type               |
| -------------- | ----------- | ------------------ |
| `windowClosed` |             | `CustomEvent<any>` |

## Dependencies

### Used by

- [ch-grid-settings](../grid-settings)

### Graph

```mermaid
graph TD;
  ch-grid-settings --> ch-window
  style ch-window fill:#f9f,stroke:#333,stroke-width:4px
```

---

_Built with [StencilJS](https://stenciljs.com/)_
