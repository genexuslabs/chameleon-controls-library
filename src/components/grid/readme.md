# ch-grid

<!-- Auto Generated Below -->

## Properties

| Property       | Attribute | Description | Type       | Default |
| -------------- | --------- | ----------- | ---------- | ------- |
| `freezedCols`  | --        |             | `Object[]` | `[]`    |
| `hideableCols` | --        |             | `Object[]` | `[]`    |

## Events

| Event              | Description | Type               |
| ------------------ | ----------- | ------------------ |
| `emitFreezedCols`  |             | `CustomEvent<any>` |
| `emitHideableCols` |             | `CustomEvent<any>` |

## Dependencies

### Depends on

- [ch-grid-column](../grid-column)
- [ch-grid-cell](../grid-cell)
- [ch-icon](../icon)

### Graph

```mermaid
graph TD;
  ch-grid --> ch-grid-column
  ch-grid --> ch-grid-cell
  ch-grid --> ch-icon
  ch-grid-column --> ch-icon
  ch-grid-column --> ch-grid-menu
  ch-grid-menu --> ch-grid-input-text
  ch-grid-menu --> ch-grid-select
  ch-grid-menu --> ch-grid-select-option
  style ch-grid fill:#f9f,stroke:#333,stroke-width:4px
```

---

_Built with [StencilJS](https://stenciljs.com/)_
