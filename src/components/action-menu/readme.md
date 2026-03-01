# ch-action-menu-render

<!-- Auto Generated Below -->


## Overview

The `ch-action-menu-render` component renders a dropdown menu triggered by an
expandable button, supporting deeply nested sub-menus and full keyboard
accessibility.

## Features
 - Deeply nested sub-menus with mouse hover expand/collapse.
 - Keyboard navigation (arrow keys, Escape, Enter).
 - Menu items can be buttons, hyperlinks, separators, or custom slots.
 - Positioned using `ch-popover`; auto-closes on outside click or Escape.
 - Internal expansion state management -- host only supplies data and reacts to events.

## Use when
 - You need a multi-level dropdown menu with full keyboard accessibility (e.g., application menus, context menus, toolbar overflow menus).
 - Space is constrained and 3 or more item-level actions must be accessible (e.g., Edit, Rename, Delete in a table row).
 - Contextual actions that are secondary and do not need to be always visible.

## Do not use when
 - You need a flat list of selectable items without nesting -- prefer `ch-action-list-render` instead.
 - Fewer than 3 actions are available — show them as visible inline icon buttons (fewer clicks, more discoverable).
 - Selection input is needed — never use `role="menu"` semantics for a value selector; prefer `ch-combo-box-render`.
 - Actions should always be immediately visible and prominent — put them inline.

## Accessibility
 - The expandable button has `aria-expanded`, `aria-haspopup="true"`, `aria-controls`, and a configurable `aria-label` (`buttonAccessibleName`).
 - The popup window has `role="list"`.
 - Keyboard support: Escape closes the menu and returns focus to the trigger button; arrow keys navigate items.
## Properties

| Property               | Attribute                | Description                                                                                                                                              | Type                                                                                          | Default         |
| ---------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------- |
| `blockAlign`           | `block-align`            | Specifies the block alignment of the dropdown menu that is placed relative to the expandable button.                                                     | `"center" \| "inside-end" \| "inside-start" \| "outside-end" \| "outside-start"`              | `"outside-end"` |
| `buttonAccessibleName` | `button-accessible-name` | This attribute lets you specify the label for the first expandable button. Important for accessibility.                                                  | `string`                                                                                      | `undefined`     |
| `disabled`             | `disabled`               | This attribute lets you specify if the element is disabled. If disabled, it will not fire any user interaction related event (for example, click event). | `boolean`                                                                                     | `false`         |
| `expanded`             | `expanded`               | `true` to expand the dropdown window.                                                                                                                    | `boolean`                                                                                     | `false`         |
| `getImagePathCallback` | --                       | This property specifies a callback that is executed when the path for an startImgSrc or endImgSrc (of an item) needs to be resolved.                     | `(item: ActionMenuItemActionableModel, iconDirection: "start" \| "end") => GxImageMultiState` | `undefined`     |
| `gxImageConstructor`   | --                       | This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.                                                                                 | `(name: string) => any`                                                                       | `undefined`     |
| `gxSettings`           | `gx-settings`            | This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.                                                                                 | `any`                                                                                         | `undefined`     |
| `inlineAlign`          | `inline-align`           | Specifies the inline alignment of the dropdown section that is placed relative to the expandable button.                                                 | `"center" \| "inside-end" \| "inside-start" \| "outside-end" \| "outside-start"`              | `"center"`      |
| `model`                | --                       | This property lets you define the model of the control.                                                                                                  | `ActionMenuItemModel[]`                                                                       | `undefined`     |
| `positionTry`          | `position-try`           | Specifies an alternative position to try when the popover overflows the window.                                                                          | `"flip-block" \| "flip-inline" \| "none"`                                                     | `"none"`        |
| `useGxRender`          | `use-gx-render`          | This property is a WA to implement the Tree View as a UC 2.0 in GeneXus.                                                                                 | `boolean`                                                                                     | `false`         |


## Events

| Event                | Description                                                                                                                      | Type                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `buttonClick`        | Fired when a button is clicked. This event can be prevented.                                                                     | `CustomEvent<{ id?: string; caption: string; disabled?: boolean; endImgSrc?: string; endImgType?: "mask" \| "background"; expanded?: boolean; items?: ActionMenuModel; itemsBlockAlign?: ChPopoverAlign; itemsInlineAlign?: ChPopoverAlign; link?: ItemLink; parts?: string; positionTry?: "none" \| "flip-block" \| "flip-inline"; shortcut?: string; startImgSrc?: string; startImgType?: "mask" \| "background"; type?: "actionable"; }>` |
| `expandedChange`     | Fired when the visibility of the main dropdown is changed.                                                                       | `CustomEvent<boolean>`                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `expandedItemChange` | Fired when the visibility of a dropdown item is changed.                                                                         | `CustomEvent<{ item: ActionMenuItemActionableModel; expanded: boolean; }>`                                                                                                                                                                                                                                                                                                                                                                   |
| `hyperlinkClick`     | Fired when an hyperlink is clicked. This event can be prevented, but the dropdown will be closed in any case (prevented or not). | `CustomEvent<{ event: PointerEvent; item: ActionMenuItemActionableModel; }>`                                                                                                                                                                                                                                                                                                                                                                 |


## Slots

| Slot       | Description                                                                                                                         |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
|            | Default slot projected inside the expandable button. Use it to provide the button label or icon.                                    |
| `"{name}"` | Named slots matching each item of `type: "slot"` in the model. Use them to inject custom content at specific positions in the menu. |


## Shadow Parts

| Part                  | Description                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `"action"`            | The clickable row element for each menu item.                                                                          |
| `"button"`            | A `<button>`-type action row. Receives `expandable`, `expanded`, `collapsed`, and `disabled` state parts.              |
| `"collapsed"`         | Present in the `button` part when the item's sub-menu is closed.                                                       |
| `"content"`           | The content area inside each action row (caption + optional icon).                                                     |
| `"disabled"`          | Present in the `button` part when the item is disabled.                                                                |
| `"expandable"`        | Present in the `button` part when the item has sub-items.                                                              |
| `"expandable-button"` | The top-level button that toggles the dropdown. Also receives the `expanded`, `collapsed`, and `disabled` state parts. |
| `"expanded"`          | Present in the `button` part when the item's sub-menu is open.                                                         |
| `"link"`              | An `<a>`-type action row.                                                                                              |
| `"separator"`         | A horizontal divider rendered for items of `type: "separator"`.                                                        |
| `"shortcut"`          | The keyboard shortcut label rendered at the end of an action row.                                                      |
| `"window"`            | The popover container that holds the dropdown menu items.                                                              |


## CSS Custom Properties

| Name                                           | Description                                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `--ch-action-menu-item__background-image-size` | Specifies the size of the start and end images of the items. @default 100%                  |
| `--ch-action-menu-item__image-size`            | Specifies the box size that contains the start or end images of the items. @default 0.875em |


## Dependencies

### Used by

 - [ch-action-group-render](../action-group)

### Depends on

- [ch-action-menu](./internal/action-menu)
- [ch-popover](../popover)

### Graph
```mermaid
graph TD;
  ch-action-menu-render --> ch-action-menu
  ch-action-menu-render --> ch-popover
  ch-action-menu --> ch-popover
  ch-action-group-render --> ch-action-menu-render
  style ch-action-menu-render fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
