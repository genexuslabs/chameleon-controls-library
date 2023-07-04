# ch-suggest



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                                                                                                                          | Type     | Default     |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------- |
| `debounce` | `debounce` | The debounce amount in miliseconds (This is the time the suggest waits after the user has finished typing, to show the suggestions). | `500`    | `500`       |
| `label`    | `label`    | The label                                                                                                                            | `string` | `undefined` |
| `value`    | `value`    | The input value                                                                                                                      | `string` | `undefined` |


## Events

| Event          | Description                                                                   | Type                  |
| -------------- | ----------------------------------------------------------------------------- | --------------------- |
| `inputChanged` | ***************************** 5.EVENTS (EMMIT) ****************************** | `CustomEvent<string>` |


## Shadow Parts

| Part                    | Description |
| ----------------------- | ----------- |
| `"ch-window-container"` |             |
| `"input"`               |             |
| `"label"`               |             |


## Dependencies

### Depends on

- [ch-window](../window)

### Graph
```mermaid
graph TD;
  ch-suggest --> ch-window
  ch-window --> ch-window-close
  style ch-suggest fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
