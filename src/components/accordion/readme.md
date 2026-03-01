# ch-accordion-render



<!-- Auto Generated Below -->


## Overview

The `ch-accordion-render` component displays a vertical stack of collapsible
panels, each with a clickable header that toggles the visibility of its
associated content section.

## Properties

| Property                   | Attribute                    | Description                                                                                                                                                                    | Type                                      | Default     |
| -------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ----------- |
| `disabled`                 | `disabled`                   | This attribute lets you specify if all accordions are disabled. If disabled,accordions will not fire any user interaction related event (for example, `expandedChange` event). | `boolean`                                 | `false`     |
| `expandableButtonPosition` | `expandable-button-position` | Specifies the position of the expandable button in the header of the panels.                                                                                                   | `"end" \| "start"`                        | `"end"`     |
| `getImagePathCallback`     | --                           | This property specifies a callback that is executed when the path for an startImgSrc needs to be resolved.                                                                     | `(imageSrc: string) => GxImageMultiState` | `undefined` |
| `model`                    | --                           | Specifies the items of the control.                                                                                                                                            | `AccordionItemModel[]`                    | `undefined` |
| `singleItemExpanded`       | `single-item-expanded`       | If `true` only one item will be expanded at the same time.                                                                                                                     | `boolean`                                 | `false`     |


## Events

| Event            | Description                                 | Type                                              |
| ---------------- | ------------------------------------------- | ------------------------------------------------- |
| `expandedChange` | Fired when an item is expanded or collapsed | `CustomEvent<{ id: string; expanded: boolean; }>` |


## Slots

| Slot                    | Description                                                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `"{item.headerSlotId}"` | Named slot projected inside the `header` button for custom header content. Rendered when the item defines a `headerSlotId`. |
| `"{item.id}"`           | Named slot projected inside the `section` for each item's collapsible body content.                                         |


## Shadow Parts

| Part          | Description                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------- |
| `"collapsed"` | Present in the `header`, `panel`, and `section` parts when the item is collapsed.             |
| `"disabled"`  | Present in the `header`, `panel`, and `section` parts when the item is disabled.              |
| `"expanded"`  | Present in the `header`, `panel`, and `section` parts when the item is expanded.              |
| `"header"`    | The clickable `<button>` element that toggles the collapsible section. Present on every item. |
| `"panel"`     | The outer container that wraps the `header` and the `section` of each item.                   |
| `"section"`   | The collapsible `<section>` element that contains the item's body content.                    |


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
