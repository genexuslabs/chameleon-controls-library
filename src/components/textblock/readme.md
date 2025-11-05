# ch-textblock



<!-- Auto Generated Below -->


## Properties

| Property                       | Attribute                          | Description                                                                                                                                                                                                                                                                                                                     | Type                                                  | Default     |
| ------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------- |
| `accessibleRole`               | `accessible-role`                  | Specifies the accessible role of the component, which improves the semantic that the component models.                                                                                                                                                                                                                          | `"h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6" \| "p"` | `"p"`       |
| `autoGrow`                     | `auto-grow`                        | This property defines if the control size will grow automatically, to adjust to its content size.  If `false` the overflowing content will be displayed with an ellipsis. This ellipsis takes into account multiple lines.                                                                                                      | `boolean`                                             | `false`     |
| `caption`                      | `caption`                          | Specifies the content to be displayed when the control has `format = text`.                                                                                                                                                                                                                                                     | `string`                                              | `undefined` |
| `characterToMeasureLineHeight` | `character-to-measure-line-height` | Specifies the character used to measure the line height                                                                                                                                                                                                                                                                         | `string`                                              | `"A"`       |
| `format`                       | `format`                           | It specifies the format that will have the textblock control.   - If `format` = `HTML`, the textblock control works as an HTML div and    the innerHTML will be taken from the default slot.   - If `format` = `text`, the control works as a normal textblock control    and it is affected by most of the defined properties. | `"HTML" \| "text"`                                    | `"text"`    |
| `showTooltipOnOverflow`        | `show-tooltip-on-overflow`         | `true` to display a tooltip when the caption overflows the size of the container.  Only works if `format = text` and `autoGrow = false`.                                                                                                                                                                                        | `boolean`                                             | `false`     |


## Events

| Event                      | Description                                                                                                           | Type                   |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `overflowingContentChange` | Fired when the displayed lines overflows the control's content. If `true`, the current content overflows the control. | `CustomEvent<boolean>` |


## Slots

| Slot | Description                    |
| ---- | ------------------------------ |
|      | The slot for the HTML content. |


## Dependencies

### Used by

 - [ch-tab-render](../tab)

### Graph
```mermaid
graph TD;
  ch-tab-render --> ch-textblock
  style ch-textblock fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
