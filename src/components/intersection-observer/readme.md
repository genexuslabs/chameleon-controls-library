# gx-intersection-observer



<!-- Auto Generated Below -->


## Overview

The `ch-intersection-observer` component is a declarative wrapper around the
native `IntersectionObserver` API that emits events when slotted content
crosses visibility thresholds.

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
