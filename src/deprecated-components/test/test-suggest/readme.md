# ch-test-suggest



<!-- Auto Generated Below -->


> **[DEPRECATED]** Use the `ch-combo-box-render` with `suggest = true`

## Properties

| Property                 | Attribute | Description                                                                                                      | Type                                                  | Default     |
| ------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------- |
| `selectorSourceCallback` | --        | Callback invoked when user writes on object selector input, return possible options to show in autocomplete list | `(prefix: string) => Promise<SelectorCategoryData[]>` | `undefined` |


## Shadow Parts

| Part                        | Description |
| --------------------------- | ----------- |
| `"object-selector-suggest"` |             |


## Dependencies

### Depends on

- [ch-suggest](../../suggest)
- [ch-suggest-list](../../suggest/suggest-list)
- [ch-suggest-list-item](../../suggest/suggest-list-item)

### Graph
```mermaid
graph TD;
  ch-test-suggest --> ch-suggest
  ch-test-suggest --> ch-suggest-list
  ch-test-suggest --> ch-suggest-list-item
  ch-suggest --> ch-window
  ch-window --> ch-window-close
  style ch-test-suggest fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
