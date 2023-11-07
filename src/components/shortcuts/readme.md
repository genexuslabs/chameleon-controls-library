# ch-keyboard



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute  | Description                          | Type     | Default     |
| ------------------ | ---------- | ------------------------------------ | -------- | ----------- |
| `showKey`          | `show-key` |                                      | `"F10"`  | `"F10"`     |
| `src` _(required)_ | `src`      | The URL of the shortcut definitions. | `string` | `undefined` |


## Shadow Parts

| Part        | Description |
| ----------- | ----------- |
| `"tooltip"` |             |


## Dependencies

### Depends on

- [ch-window](../window)

### Graph
```mermaid
graph TD;
  ch-shortcuts --> ch-window
  ch-window --> ch-window-close
  style ch-shortcuts fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
