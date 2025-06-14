# ch-infinite-scroll



<!-- Auto Generated Below -->


## Properties

| Property                                        | Attribute       | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Type                                                                     | Default           |
| ----------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ----------------- |
| `autoScroll`                                    | `auto-scroll`   | Specifies how the scroll position will be adjusted when the content size changes when using `position = "bottom"`.   - "at-scroll-end": If the scroll is positioned at the end of the content,   the infinite-scroll will maintain the scroll at the end while the   content size changes.   - "never": The scroll position won't be adjusted when the content size   changes.                                                                                                                                                                                                                   | `"at-scroll-end" \| "never"`                                             | `"at-scroll-end"` |
| `dataProvider`                                  | `data-provider` | `true` if the infinite scroll is used in a grid that has data provider. This attribute determine the utility of the infinite scroll, because in certain configurations the infinite scroll can be used only to implement the inverse loading utility.                                                                                                                                                                                                                                                                                                                                            | `boolean`                                                                | `false`           |
| `disabled`                                      | `disabled`      | Specifies if the infinite scroll is disabled. When disabled, the infinite scroll won't fire any event when reaching the threshold. The `dataProvider` property can be `true` and this property can be `false` at the same time, meaning that the infinite scroll is disabled, but if the control has `inverseLoading`, the `dataProvider` property will re-position the scrollbar when new content is added to the grid.                                                                                                                                                                         | `boolean`                                                                | `false`           |
| `infiniteThresholdReachedCallback` _(required)_ | --              | This callback will be called every time the `threshold` is reached.  When the threshold is met and this callback is executed, the internal `loadingState` will be changed to `"loading"` and the user has to keep in sync the `loadingState` of the component with the real state of the data.                                                                                                                                                                                                                                                                                                   | `() => void`                                                             | `undefined`       |
| `loadingState` _(required)_                     | `loading-state` | If `"more-data-to-fetch"`, the infinite scroll will execute the `infiniteThresholdReachedCallback` when the `threshold` is met. When the threshold is met, the internal `loadingState` will be changed to `"loading"` and the user has to keep in sync the `loadingState` of the component with the real state of the data.  Set this to `"all-records-loaded"` to disable the infinite scroll from actively trying to receive new data while reaching the threshold. This is useful when it is known that there is no more data that can be added, and the infinite scroll is no longer needed. | `"all-records-loaded" \| "initial" \| "loading" \| "more-data-to-fetch"` | `undefined`       |
| `position`                                      | `position`      | The position of the infinite scroll element. The value can be either `top` or `bottom`. When `position === "top"`, the control also implements inverse loading.                                                                                                                                                                                                                                                                                                                                                                                                                                  | `"bottom" \| "top"`                                                      | `"bottom"`        |
| `threshold`                                     | `threshold`     | The threshold distance from the bottom of the content to call the `infinite` output event when scrolled. The threshold value can be either a percent, or in pixels. For example, use the value of `10%` for the `infinite` output event to get called when the user has scrolled 10% from the bottom of the page. Use the value `100px` when the scroll is within 100 pixels from the bottom of the page.                                                                                                                                                                                        | `string`                                                                 | `"150px"`         |


## Dependencies

### Used by

 - [ch-smart-grid](../..)

### Graph
```mermaid
graph TD;
  ch-smart-grid --> ch-infinite-scroll
  style ch-infinite-scroll fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
