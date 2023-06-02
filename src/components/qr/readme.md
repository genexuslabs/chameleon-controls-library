# ch-qr



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute    | Description                                                                                                                                                                                                                                                                                          | Type                       | Default     |
| ------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ----------- |
| `background` | `background` | The background color. By default is transparent.                                                                                                                                                                                                                                                     | `string`                   | `null`      |
| `ecLevel`    | `ec-level`   | Means "Error correction levels". The four values L, M, Q, and H will use %7, 15%, 25%, and 30% of the QR code for error correction respectively. So on one hand the code will get bigger but chances are also higher that it will be read without errors later on. This value is by default High (H) | `"H" \| "L" \| "M" \| "Q"` | `"H"`       |
| `fill`       | `fill`       | What color you want your QR code to be. By default is black.                                                                                                                                                                                                                                         | `string`                   | `"black"`   |
| `radius`     | `radius`     | Defines how round the blocks should be. Numbers from 0 (squares) to 0.5 (maximum round) are supported.                                                                                                                                                                                               | `number`                   | `0`         |
| `size`       | `size`       | The total size of the final QR code in pixels - it will be a square. This value is by default "128"                                                                                                                                                                                                  | `number`                   | `128`       |
| `text`       | `text`       | Any kind of text, also links, email addresses, any thing.                                                                                                                                                                                                                                            | `string`                   | `undefined` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
