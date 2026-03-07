# gx-intersection-observer

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Use when](#use-when)
- [Do not use when](#do-not-use-when)
- [Slots](#slots)
- [Accessibility](#accessibility)
- [Properties](#properties)
- [Events](#events)
- [Slots](#slots)
- [Styling](./docs/styling.md)

<!-- Auto Generated Below -->

## Overview

The `ch-intersection-observer` component is a declarative wrapper around the native `IntersectionObserver` API that emits events when slotted content crosses visibility thresholds.

## Features
 - Observes element visibility relative to a specified root element or the browser viewport.
 - Configurable visibility thresholds as comma-separated percentages (e.g., `"25%,50%,75%"`).
 - Root margins in device-independent pixels (dip) or percentages to expand or contract the intersection area.
 - Emits an `intersectionUpdate` event with full `IntersectionObserverEntry` details.
 - Automatically disconnects the observer when the component is removed from the DOM.
 - The host renders with `display: contents`, so it does not affect layout.

## Use when
 - Triggering actions when an element scrolls into or out of view.
 - Implementing lazy loading of images or components that should only load when scrolled into view.
 - Triggering animations or data fetching when an element enters the viewport.

## Do not use when
 - You need to observe element resizing — use a `ResizeObserver` instead.
 - Continuous scroll position tracking is needed — use a scroll event listener instead.
 - The target element uses `display: contents` — the observer skips elements with that display value and looks for the first descendant that has a box.

## Slots
 - `content`: The element to be observed for intersection changes. The observer targets the first child element whose computed `display` is not `contents`.

## Accessibility
 - This component is purely behavioral and renders no visible UI of its own. It has no keyboard or ARIA implications.

## Properties

| Property       | Attribute       | Description                                                                                                                                                                                                                                                                                                                                                                                | Type     | Default     |
| -------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------- |
| `bottomMargin` | `bottom-margin` | Bottom margin around the root element. Accepts a device-independent pixel value (e.g., `"200dip"`, converted to `px`) or a percentage (e.g., `"10%"`). Invalid values default to `"0px"`.  Init-only — changes after `componentDidLoad` have no effect.                                                                                                                                    | `string` | `undefined` |
| `leftMargin`   | `left-margin`   | Left margin around the root element. Accepts a device-independent pixel value (e.g., `"200dip"`, converted to `px`) or a percentage (e.g., `"10%"`). Invalid values default to `"0px"`.  Init-only — changes after `componentDidLoad` have no effect.                                                                                                                                      | `string` | `undefined` |
| `rightMargin`  | `right-margin`  | Right margin around the root element. Accepts a device-independent pixel value (e.g., `"200dip"`, converted to `px`) or a percentage (e.g., `"10%"`). Invalid values default to `"0px"`.  Init-only — changes after `componentDidLoad` have no effect.                                                                                                                                     | `string` | `undefined` |
| `root`         | `root`          | The DOM ID of the element to use as the intersection root (viewport). The element is resolved via `document.getElementById`. If not specified or if the ID does not match any element, the browser viewport is used.  Init-only — changes after `componentDidLoad` have no effect.                                                                                                         | `string` | `undefined` |
| `threshold`    | `threshold`     | Comma-separated percentage values representing the visibility thresholds at which the `intersectionUpdate` event fires. Each value must be a number optionally followed by `%` (e.g., `"25%,50%,75%"`). Values exceeding 100% are ignored. If not specified, defaults to `[0]` (fires as soon as even one pixel is visible).  Init-only — changes after `componentDidLoad` have no effect. | `string` | `undefined` |
| `topMargin`    | `top-margin`    | Top margin around the root element. Accepts a device-independent pixel value (e.g., `"200dip"`, converted to `px`) or a percentage (e.g., `"10%"`). Invalid values default to `"0px"`.  Init-only — changes after `componentDidLoad` have no effect.                                                                                                                                       | `string` | `undefined` |

## Events

| Event                | Description                                                                                                                                                                                                                                                                                                                                                                       | Type                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `intersectionUpdate` | Emitted whenever the observed element crosses one of the visibility thresholds specified by the `threshold` property. The event payload is the first `IntersectionObserverEntry` from the observer callback, which contains the intersection ratio, bounding rectangles, and visibility state.  Not cancelable. Emitted synchronously within the `IntersectionObserver` callback. | `CustomEvent<IntersectionObserverEntry>` |

## Slots

| Slot        | Description                                          |
| ----------- | ---------------------------------------------------- |
| `"content"` | The element to be observed for intersection changes. |

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
