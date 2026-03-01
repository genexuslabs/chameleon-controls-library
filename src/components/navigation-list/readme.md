# ch-navigation-list-render

<!-- Auto Generated Below -->


## Overview

The `ch-navigation-list-render` component renders a hierarchical navigation
menu composed of expandable items that can act as hyperlinks or buttons.

## Features
 - Nested items supported to any depth, each with optional start image, caption, and expandable indicator.
 - Automatic synchronization with ancestor `ch-sidebar` expand/collapse events.
 - Auto-expand ancestors of the selected link when `expandSelectedLink` is enabled.
 - Configurable expandable button style (`decorative` or `no`) and position (`start` or `end`).
 - Selected link indicator for hyperlink items.
 - Caption display on collapse via inline text or tooltip.
 - Custom item rendering through the `renderItem` callback.

## Use when
 - Building primary or secondary navigation menus inside a sidebar, dashboard shell, or settings page.
 - Primary or secondary sidebar navigation that changes what is rendered in the main content area.
 - Indicating the user's current location within the application.

## Do not use when
 - Displaying flat, non-hierarchical link lists -- a simple `<ul>` would suffice.
 - Displaying tree-structured data that requires checkboxes, drag-and-drop, or inline editing -- prefer `ch-tree-view-render` instead.
 - Displaying hierarchical data structures like file trees — prefer `ch-tree-view-render`.
 - Contextual actions on items — prefer `ch-action-list-render` or `ch-action-menu-render`.
 - Navigation depth regularly exceeds 2 levels — consider a `ch-tree-view-render` or separate pages.

## Accessibility
 - The host element has `role="list"`.
 - Expandable items use disclosure semantics so assistive technology can convey hierarchy.
## Properties

| Property                   | Attribute                    | Description                                                                                                                                                                                                                            | Type                                                                                                                | Default                              |
| -------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `autoGrow`                 | `auto-grow`                  | If `false` the overflowing content of the control will be clipped to the borders of its container.                                                                                                                                     | `boolean`                                                                                                           | `false`                              |
| `expandSelectedLink`       | `expand-selected-link`       | `true` to expand the path to the selected link when the `selectedLink` property is updated.                                                                                                                                            | `boolean`                                                                                                           | `false`                              |
| `expandableButton`         | `expandable-button`          | Specifies what kind of expandable button is displayed in the items by default.  - `"decorative"`: Only a decorative icon is rendered to display the state     of the item.                                                             | `"decorative" \| "no"`                                                                                              | `"decorative"`                       |
| `expandableButtonPosition` | `expandable-button-position` | Specifies the position of the expandable button in reference of the action element of the items  - `"start"`: Expandable button is placed before the action element.  - `"end"`: Expandable button is placed after the action element. | `"end" \| "start"`                                                                                                  | `"start"`                            |
| `expanded`                 | `expanded`                   | Specifies if the control is expanded or collapsed.                                                                                                                                                                                     | `boolean`                                                                                                           | `true`                               |
| `getImagePathCallback`     | --                           | This property specifies a callback that is executed when the path for an startImgSrc needs to be resolved.                                                                                                                             | `(item: NavigationListItemModel) => GxImageMultiState`                                                              | `undefined`                          |
| `gxImageConstructor`       | --                           | This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.                                                                                                                                                               | `(name: string) => any`                                                                                             | `undefined`                          |
| `gxSettings`               | `gx-settings`                | This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.                                                                                                                                                               | `any`                                                                                                               | `undefined`                          |
| `model`                    | --                           | Specifies the items of the control.                                                                                                                                                                                                    | `NavigationListItemModel[]`                                                                                         | `undefined`                          |
| `renderItem`               | --                           | Specifies the items of the control.                                                                                                                                                                                                    | `(item: NavigationListItemModel, navigationListState: ChNavigationListRender, level: number, index: number) => any` | `defaultRender`                      |
| `selectedLink`             | --                           | Specifies the current selected hyperlink.                                                                                                                                                                                              | `{ id?: string; link: ItemLink; }`                                                                                  | `{     link: { url: undefined }   }` |
| `selectedLinkIndicator`    | `selected-link-indicator`    | Specifies if the selected item indicator is displayed (only work for hyperlink)                                                                                                                                                        | `boolean`                                                                                                           | `false`                              |
| `showCaptionOnCollapse`    | `show-caption-on-collapse`   | Specifies how the caption of the items will be displayed when the control is collapsed                                                                                                                                                 | `"inline" \| "tooltip"`                                                                                             | `"inline"`                           |
| `tooltipDelay`             | `tooltip-delay`              | Specifies the delay (in ms) for the tooltip to be displayed.                                                                                                                                                                           | `number`                                                                                                            | `100`                                |
| `useGxRender`              | `use-gx-render`              | This property is a WA to implement the Navigation List as a UC 2.0 in GeneXus.                                                                                                                                                         | `boolean`                                                                                                           | `false`                              |


## Events

| Event            | Description                                                      | Type                                                                                                                                                                                                                   |
| ---------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `buttonClick`    | Fired when an button is clicked. This event can be prevented.    | `CustomEvent<{ id?: string; caption: string; disabled?: boolean; expanded?: boolean; metadata?: string; startImgSrc?: string; startImgType?: "mask" \| "background"; link?: ItemLink; items?: NavigationListModel; }>` |
| `hyperlinkClick` | Fired when an hyperlink is clicked. This event can be prevented. | `CustomEvent<{ event: PointerEvent; item: NavigationListItemModel; }>`                                                                                                                                                 |


## Shadow Parts

| Part                          | Description                                                                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `"collapsed"`                 | Present in the `item__action` and `item__group` parts when the item is collapsed.                                                   |
| `"disabled"`                  | Present in the `item__action`, `item__caption`, `item__group`, and `indicator` parts when the item is disabled.                     |
| `"even-level"`                | Present in the `item__action` and `item__group` parts when the item is at an even nesting level.                                    |
| `"expand-button"`             | Present in the `item__action` part when the item has an expandable button.                                                          |
| `"expanded"`                  | Present in the `item__action` and `item__group` parts when the item is expanded.                                                    |
| `"indicator"`                 | The visual selection indicator shown for the active item. Rendered when `selectedLinkIndicator` is `true` and the item is selected. |
| `"item__action"`              | The clickable row element for each navigation item. Receives position, state, and level parts.                                      |
| `"item__button"`              | A `<button>`-type navigation item row.                                                                                              |
| `"item__caption"`             | The text caption inside the navigation item.                                                                                        |
| `"item__group"`               | The container for an item's nested children.                                                                                        |
| `"item__link"`                | An `<a>`-type navigation item row.                                                                                                  |
| `"navigation-list-collapsed"` | Present in the `item__action` and `item__caption` parts when the parent `ch-sidebar` is collapsed.                                  |
| `"not-selected"`              | Present in the `item__caption`, `item__group`, and `item__link` parts when the item is not selected.                                |
| `"odd-level"`                 | Present in the `item__action` and `item__group` parts when the item is at an odd nesting level.                                     |
| `"selected"`                  | Present in the `item__caption`, `item__group`, and `item__link` parts when the item is selected.                                    |
| `"tooltip"`                   | Present in the `item__caption` part to style the tooltip that appears when the sidebar is collapsed.                                |


## CSS Custom Properties

| Name                                                                                                                                       | Description                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--ch-navigation-list-collapsed-size`                                                                                                      | Specifies the inline-size when the navigation list is collapsed @default var(--ch-sidebar-inline-size--collapsed, auto)                          |
| `--ch-navigation-list-item-custom-padding-inline-start`                                                                                    | Specifies an additional value for the padding-inline-start of the items without breaking the indentation of the items. @default 0px              |
| `--ch-navigation-list-item-expand-collapse-duration Specifies duration of the expand and collapse animation @default 0ms`                  |                                                                                                                                                  |
| `--ch-navigation-list-item-expand-collapse-timing-function Specifies timing function of the expand and collapse animation @default linear` |                                                                                                                                                  |
| `--ch-navigation-list-item-gap`                                                                                                            | Specifies the spacing between the images, text and the expandable button of the items. @default 0px                                              |
| `--ch-navigation-list-item__expandable-button-image-size`                                                                                  | Specifies the image size of the expandable button. @default 100%                                                                                 |
| `--ch-navigation-list-item__expandable-button-size`                                                                                        | Specifies the expandable button size of the items. @default 0.875em                                                                              |
| `--ch-navigation-list-item__image-size`                                                                                                    | Specifies the box size that contains the start image of the items. @default 0.875em                                                              |
| `--ch-navigation-list-item__tooltip-separation`                                                                                            | Specifies the separation between the action and the displayed tooltip. @default 0px                                                              |
| `--ch-navigation-list-item__tooltip-separation-x`                                                                                          | Specifies the separation between the action and the tooltip displayed on the x-axis. @default var(--ch-navigation-list-item__tooltip-separation) |
| `--ch-navigation-list-item__tooltip-separation-y`                                                                                          | Specifies the separation between the action and the tooltip displayed on the y-axis. @default var(--ch-navigation-list-item__tooltip-separation) |


## Dependencies

### Used by

 - [ch-showcase](../../showcase/assets/components)

### Depends on

- [ch-navigation-list-item](./internal/navigation-list-item)

### Graph
```mermaid
graph TD;
  ch-navigation-list-render --> ch-navigation-list-item
  ch-navigation-list-item --> ch-tooltip
  ch-tooltip --> ch-popover
  ch-showcase --> ch-navigation-list-render
  style ch-navigation-list-render fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
