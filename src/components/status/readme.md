# ch-status



<!-- Auto Generated Below -->


## Overview

The ch-status is an element that provides a loading indicator.
It informs the loading state in various parts of the user interface,
such as buttons, overlays, and other elements.

## Properties

| Property           | Attribute         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Type          | Default     |
| ------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ----------- |
| `accessibleName`   | `accessible-name` | Specifies a short string that authors associate with an element to provide users of assistive technologies with a label for the element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `string`      | `undefined` |
| `loadingRegionRef` | --                | If the control is describing the loading progress of a particular region of a page, set this property with the reference of the loading region. This will set the `aria-describedby` and `aria-busy` attributes on the loading region to improve accessibility while the control is in rendered.  When the control detects that is no longer in rendered (aka it is removed from the DOM), it will remove the `aria-busy` attribute and update (or remove if necessary) the`aria-describedby` attribute.  If an ID is set prior to the component's first render, the ch-status will use this ID for the `aria-describedby`. Otherwise, the ch-status will compute a unique ID for this matter.  **Important**: If you are using Shadow DOM, take into account that the `loadingRegionRef` must be in the same Shadow Tree as the ch-status. Otherwise, the `aria-describedby` binding won't work, since the control ID is not visible for the `loadingRegionRef`. | `HTMLElement` | `undefined` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
