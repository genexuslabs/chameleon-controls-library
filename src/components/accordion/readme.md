# ch-accordion-render



<!-- Auto Generated Below -->


## Properties

| Property               | Attribute              | Description                                                                                                                                                                    | Type                                      | Default     |
| ---------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ----------- |
| `disabled`             | `disabled`             | This attribute lets you specify if all accordions are disabled. If disabled,accordions will not fire any user interaction related event (for example, `expandedChange` event). | `boolean`                                 | `false`     |
| `getImagePathCallback` | --                     | This property specifies a callback that is executed when the path for an startImgSrc needs to be resolved.                                                                     | `(imageSrc: string) => GxImageMultiState` | `undefined` |
| `model`                | --                     | Specifies the items of the control.                                                                                                                                            | `AccordionItem[]`                         | `undefined` |
| `singleItemExpanded`   | `single-item-expanded` | If `true` only one item will be expanded at the same time.                                                                                                                     | `boolean`                                 | `false`     |


## Events

| Event            | Description                                 | Type                                              |
| ---------------- | ------------------------------------------- | ------------------------------------------------- |
| `expandedChange` | Fired when an item is expanded or collapsed | `CustomEvent<{ id: string; expanded: boolean; }>` |


## CSS Custom Properties

| Name                                                                                                                            | Description                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `--ch-accordion-expand-collapse-duration Specifies duration of the expand and collapse animation @default 0ms`                  |                                                                                      |
| `--ch-accordion-expand-collapse-timing-function Specifies timing function of the expand and collapse animation @default linear` |                                                                                      |
| `--ch-accordion__chevron-color`                                                                                                 | Specifies the color of the chevron. @default 100%                                    |
| `--ch-accordion__chevron-image-size`                                                                                            | Specifies the image size of the chevron. @default 100%                               |
| `--ch-accordion__chevron-size`                                                                                                  | Specifies the box size of the chevron. @default 0.875em                              |
| `--ch-accordion__header-background-image-size`                                                                                  | Specifies the size of the start image of the header. @default 100%                   |
| `--ch-accordion__header-image-size`                                                                                             | Specifies the box size that contains the start image of the header. @default 0.875em |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
