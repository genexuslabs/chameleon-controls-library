# ch-status

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Use when](#use-when)
- [Do not use when](#do-not-use-when)
- [Accessibility](#accessibility)
- [Properties](#properties)
- [Slots](#slots)
- [Styling](./docs/styling.md)

<!-- Auto Generated Below -->

## Overview

The `ch-status` component provides a lightweight loading indicator that communicates an ongoing process to both visual users and assistive technologies.

## Features
 - Sets `role="status"` and `aria-live="polite"` for non-interrupting screen reader announcements.
 - Automatic `aria-busy` and `aria-describedby` management on a referenced loading region.
 - Cleans up ARIA attributes when removed from the DOM.
 - Designed for use inside buttons, overlays, table cells, and any region needing a simple "busy" signal.

## Use when
 - You need an indeterminate loading state without numeric progress (e.g., a spinner on a button).
 - A region of the page is loading and no progress percentage is available (spinner pattern).
 - An operation is running in the background and the user should be aware without being interrupted.

## Do not use when
 - You have tasks with measurable progress -- prefer `ch-progress` instead.
 - Actual progress percentage is known — prefer `ch-progress` with determinate mode instead.

## Accessibility
 - `role="status"` is set on the host in `connectedCallback`, which carries an implicit `aria-live="polite"` and `aria-atomic="true"` semantic. An explicit `aria-live="polite"` is also set for maximum compatibility.
 - Resolves its accessible name from the `accessibleName` property.
 - `aria-busy` and `aria-describedby` are set on the `loadingRegionRef` element while the status is rendered, and cleaned up on disconnect.
 - No keyboard interaction — the component is a passive indicator, not an interactive control.

## Properties

| Property           | Attribute         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Type          | Default     |
| ------------------ | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ----------- |
| `accessibleName`   | `accessible-name` | Specifies a short string that authors associate with an element to provide users of assistive technologies with a label for the element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `string`      | `undefined` |
| `loadingRegionRef` | --                | If the control is describing the loading progress of a particular region of a page, set this property with the reference of the loading region. This will set the `aria-describedby` and `aria-busy` attributes on the loading region to improve accessibility while the control is in rendered.  When the control detects that is no longer rendered (aka it is removed from the DOM), it will remove the `aria-busy` attribute and the `aria-describedby` attribute.  **Note**: Setting this prop overwrites any existing `aria-describedby` value on the referenced element — it replaces rather than appends.  If an ID is set prior to the component's first render, the ch-status will use this ID for the `aria-describedby`. Otherwise, the ch-status will compute a unique ID for this matter.  **Important**: If you are using Shadow DOM, take into account that the `loadingRegionRef` must be in the same Shadow Tree as the ch-status. Otherwise, the `aria-describedby` binding won't work, since the control ID is not visible for the `loadingRegionRef`. | `HTMLElement` | `undefined` |

## Slots

| Slot | Description                                                                                                                                                                       |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|      | Default slot. Use it to project custom visual content such as a spinner icon or loading text. Content changes trigger polite `aria-live` announcements to assistive technologies. |

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
