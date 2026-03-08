# ch-accordion-render

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Use when](#use-when)
- [Do not use when](#do-not-use-when)
- [Accessibility](#accessibility)
- [Properties](#properties)
- [Events](#events)
- [Slots](#slots)
- [Styling](./docs/styling.md)

<!-- Auto Generated Below -->

## Overview

The `ch-accordion-render` component displays a vertical stack of collapsible panels, each with a clickable header that toggles the visibility of its associated content section.

## Features
 - Expand or collapse panels on demand to organize lengthy content into space-efficient sections.
 - Single-item mode (`singleItemExpanded`) ensures only one panel is open at a time, automatically closing the others.
 - Configurable expandable button position (`start` or `end`) in each panel header.
 - Per-item images in the header via `startImgSrc` and a customizable image-path callback.
 - Disabled state at the control level or per individual item.
 - Custom header content through named slots.

## Use when
 - Organizing lengthy content into logically grouped, collapsible sections (FAQs, settings pages, form groups).
 - Reducing cognitive load by showing one section at a time.
 - Reducing page length when users are unlikely to need all sections simultaneously (FAQs, settings).
 - Space-constrained UIs where vertical scrolling is undesirable and content can be consumed independently.

## Do not use when
 - Users need to compare content side-by-side -- the accordion pattern inherently hides inactive sections.
 - Users are likely to read all sections — use plain headings and scrollable content instead.
 - Content sections are interdependent and must be compared side by side — the back-and-forth is too costly.
 - Sequential step-by-step processes where hiding steps creates confusion — prefer a stepper/wizard.
 - Nesting accordions within accordions — double-nested collapsed panels disorient users.

## Accessibility
 - Each header is a `<button>` with `aria-expanded` and `aria-controls` linking to its section.
 - Sections are labelled via `aria-labelledby` pointing back to the header button, or via explicit `aria-label` when provided.
 - Supports the disclosure pattern: toggling a header expands or collapses its associated section.

## Properties

| Property                   | Attribute                    | Description                                                                                                                                                                                                                                                              | Type                                      | Default     |
| -------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ----------- |
| `disabled`                 | `disabled`                   | This attribute lets you specify if all accordions are disabled. If disabled,accordions will not fire any user interaction related event (for example, `expandedChange` event).                                                                                           | `boolean`                                 | `false`     |
| `expandableButtonPosition` | `expandable-button-position` | Specifies the position of the expandable button (chevron) in the header of the panels. `"start"` places the chevron at the inline-start edge of the header, while `"end"` places it at the inline-end edge.                                                              | `"end" \| "start"`                        | `"end"`     |
| `getImagePathCallback`     | --                           | This property specifies a callback that is executed when the path for an `startImgSrc` needs to be resolved. The resolution follows a fallback chain: per-instance callback → global registry callback → built-in default (which wraps the src in `{ base: imageSrc }`). | `(imageSrc: string) => GxImageMultiState` | `undefined` |
| `model`                    | --                           | Specifies the items of the control. Each entry is an `AccordionItemModel` with at least `id`, `caption`, and `expanded`. The component mutates `item.expanded` directly on these model objects when the user toggles a panel.                                            | `AccordionItemModel[]`                    | `undefined` |
| `singleItemExpanded`       | `single-item-expanded`       | If `true` only one item will be expanded at the same time.                                                                                                                                                                                                               | `boolean`                                 | `false`     |

## Events

| Event            | Description                                                                                                                                                                                                                                                 | Type                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `expandedChange` | Fired when an item is expanded or collapsed. The payload is `{ id: string; expanded: boolean }`. In `singleItemExpanded` mode, multiple events fire: one for each auto-collapsed item (with `expanded: false`) followed by one for the newly expanded item. | `CustomEvent<{ id: string; expanded: boolean; }>` |

## Slots

| Slot                    | Description                                                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `"{item.headerSlotId}"` | Named slot projected inside the `header` button for custom header content. Rendered when the item defines a `headerSlotId`. |
| `"{item.id}"`           | Named slot projected inside the `section` for each item's collapsible body content.                                         |

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
