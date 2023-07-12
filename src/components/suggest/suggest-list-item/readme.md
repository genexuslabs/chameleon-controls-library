# ch-suggest-list-item



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                                                                                    | Type      | Default     |
| ---------- | ---------- | ---------------------------------------------------------------------------------------------- | --------- | ----------- |
| `iconSrc`  | `icon-src` | The icon url                                                                                   | `string`  | `undefined` |
| `selected` | `selected` | The presence of this property adds a class to the item, indicating that is currently selected. | `boolean` | `undefined` |


## Events

| Event                | Description                                                                                                               | Type                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `focusChangeAttempt` | This event is emitted every time the item is about to lose focus, by pressing the "ArrowUp" or "ArrowDown" keyboard keys. | `CustomEvent<{ el: HTMLChSuggestListItemElement; code: ChSuggestKeyDownEvents; }>` |
| `itemSelected`       | This event is emitted every time the item is selected, either by clicking on it, or by pressing Enter.                    | `CustomEvent<{ el: HTMLChSuggestListItemElement; value: any; }>`                   |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
