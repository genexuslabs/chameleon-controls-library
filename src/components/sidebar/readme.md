# ch-sidebar

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Use when](#use-when)
- [Do not use when](#do-not-use-when)
- [Accessibility](#accessibility)
- [Usage](./docs/usage.md)
- [Properties](#properties)
- [Events](#events)
- [Slots](#slots)
- [Styling](./docs/styling.md)

<!-- Auto Generated Below -->

## Overview

The `ch-sidebar` component provides a collapsible side panel typically used for primary or secondary navigation, tool palettes, or contextual information.

## Features
 - Expand or collapse programmatically or through an optional button with configurable position, caption, and accessible label.
 - Observable system: descendant components (such as `ch-navigation-list-render`) automatically synchronize their expanded state. The component auto-assigns `el.id` on connect so the observer system can identify it.
 - RTL-aware expand/collapse button rendering.
 - Separate accessible names and captions for the expanded and collapsed states of the button.

## Use when
 - Wrapping content that should be togglable between a full and a compact view (navigation menus, tool palettes, contextual panels).
 - Providing a collapsible side panel for secondary navigation, tools, or contextual content.
 - The main content needs more horizontal space when the panel is collapsed.

## Do not use when
 - Displaying transient overlays -- prefer a dialog or popover instead.
 - The sidebar content is always required and must never be hidden.

## Accessibility
 - The expand/collapse button carries an `aria-label` that changes based on the current state (`expandButtonExpandAccessibleName` / `expandButtonCollapseAccessibleName`).

## Properties

| Property                             | Attribute                                | Description                                                                                                                                                                                                                                           | Type                  | Default     |
| ------------------------------------ | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------- |
| `expandButtonCollapseAccessibleName` | `expand-button-collapse-accessible-name` | Specifies a short string, typically 1 to 3 words, that authors associate with an element to provide users of assistive technologies with a label for expand button when `expanded = true`.                                                            | `string`              | `undefined` |
| `expandButtonCollapseCaption`        | `expand-button-collapse-caption`         | Specifies the caption of the expand button when `expanded = true`.                                                                                                                                                                                    | `string`              | `undefined` |
| `expandButtonExpandAccessibleName`   | `expand-button-expand-accessible-name`   | Specifies a short string, typically 1 to 3 words, that authors associate with an element to provide users of assistive technologies with a label for expand button when `expanded = false`.                                                           | `string`              | `undefined` |
| `expandButtonExpandCaption`          | `expand-button-expand-caption`           | Specifies the caption of the expand button when `expanded = false`.                                                                                                                                                                                   | `string`              | `undefined` |
| `expandButtonPosition`               | `expand-button-position`                 | Specifies the position of the expand button relative to the content of the sidebar.  - `"before"`: The expand button is positioned before the content of the sidebar.  - `"after"`: The expand button is positioned after the content of the sidebar. | `"after" \| "before"` | `"after"`   |
| `expanded`                           | `expanded`                               | Specifies whether the control is expanded or collapsed. This property uses mutable two-way binding: the component updates it directly when the user clicks the expand/collapse button.                                                                | `boolean`             | `true`      |
| `showExpandButton`                   | `show-expand-button`                     | `true` to display a expandable button at the bottom of the control.                                                                                                                                                                                   | `boolean`             | `false`     |

## Events

| Event            | Description                                                                                    | Type                   |
| ---------------- | ---------------------------------------------------------------------------------------------- | ---------------------- |
| `expandedChange` | Emitted when the expand/collapse button is activated. The payload is the new `expanded` value. | `CustomEvent<boolean>` |

## Slots

| Slot | Description                           |
| ---- | ------------------------------------- |
|      | Default slot for the sidebar content. |

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
