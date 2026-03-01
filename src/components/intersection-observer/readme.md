# gx-intersection-observer



<!-- Auto Generated Below -->


## Overview

The `ch-intersection-observer` component is a declarative wrapper around the
native `IntersectionObserver` API that emits events when slotted content
crosses visibility thresholds.


## Features
 - Observes element visibility relative to a specified root element or the browser viewport.
 - Configurable visibility thresholds as comma-separated percentages.
 - Root margins in device-independent pixels (dip) or percentages to expand or contract the intersection area.
 - Emits an `intersectionUpdate` event with full `IntersectionObserverEntry` details.

## Use when
 - Triggering actions when an element scrolls into or out of view.
 - Implementing lazy loading or scroll-based animations.
 - Implementing lazy loading of images or components that should only load when scrolled into view.
 - Triggering animations or data fetching when an element enters the viewport.

## Do not use when
 - You need to observe element resizing — use a `ResizeObserver` instead.
 - Continuous scroll position tracking is needed — use a scroll event listener instead.
## Properties

| Property       | Attribute       | Description                                                                       | Type     | Default     |
| -------------- | --------------- | --------------------------------------------------------------------------------- | -------- | ----------- |
| `bottomMargin` | `bottom-margin` | Bottom margin around the root element                                             | `string` | `undefined` |
| `leftMargin`   | `left-margin`   | Left margin around the root element                                               | `string` | `undefined` |
| `rightMargin`  | `right-margin`  | Right margin around the root element                                              | `string` | `undefined` |
| `root`         | `root`          | Set the ID of the component that is used as the viewport, default is the browser. | `string` | `undefined` |
| `threshold`    | `threshold`     | Numeric values representing percentages of the target element which are visible.  | `string` | `undefined` |
| `topMargin`    | `top-margin`    | Top margin around the root element                                                | `string` | `undefined` |


## Events

| Event                | Description                                                                          | Type                                     |
| -------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------- |
| `intersectionUpdate` | Emitted whenever the control reaches a threshold specified by the threshold property | `CustomEvent<IntersectionObserverEntry>` |


## Slots

| Slot        | Description                                          |
| ----------- | ---------------------------------------------------- |
| `"content"` | The element to be observed for intersection changes. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
