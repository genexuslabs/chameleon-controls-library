# ch-tab-render: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Full layout (tab list visible, with close buttons)](#case-1-full-layout-tab-list-visible-with-close-buttons)
  - [Case 2: Tab button hidden (panels only)](#case-2-tab-button-hidden-panels-only)

## Shadow Parts

| Part                         | Description                                                                                                             |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `"block"`                    | Present when the tab list is oriented vertically (block direction).                                                     |
| `"closable"`                 | Present in the `tab` and `tab-caption` parts when the item has a close button.                                          |
| `"close-button"`             | The button that closes a tab. Rendered when `closeButton` is `true` and the item is closable.                           |
| `"collapsed"`                | Present in the `tab-panel-container` part when the panel container is hidden.                                           |
| `"disabled"`                 | Present in the `tab`, `tab-caption`, `close-button`, and `tab-panel` parts when the item is disabled.                   |
| `"dragging"`                 | Present in the `tab`, `close-button`, and `tab-list` parts while a tab is being dragged.                                |
| `"dragging-out-of-tab-list"` | Present in the `tab` and `close-button` parts while dragging outside the tab list bounds.                               |
| `"dragging-over-tab-list"`   | Present in the `tab` and `close-button` parts while dragging within the tab list bounds.                                |
| `"end"`                      | Present when the tab list is positioned at the end edge.                                                                |
| `"expanded"`                 | Present in the `tab-panel-container` part when the panel container is visible.                                          |
| `"img"`                      | The `<img>` element rendered when a tab item uses `startImgSrc` with `startImgType = "img"`.                            |
| `"inline"`                   | Present when the tab list is oriented horizontally (inline direction).                                                  |
| `"not-closable"`             | Present in the `tab` and `tab-caption` parts when the item does not have a close button.                                |
| `"not-selected"`             | Present in the `tab`, `tab-caption`, `close-button`, and `tab-panel` parts when the item is not selected.               |
| `"selected"`                 | Present in the `tab`, `tab-caption`, `close-button`, and `tab-panel` parts when the item is selected.                   |
| `"start"`                    | Present when the tab list is positioned at the start edge.                                                              |
| `"tab"`                      | The primary `<button>` element for each tab item. Also receives the `{item.id}`, position, state, and direction parts.  |
| `"tab-caption"`              | The `<ch-textblock>` text label inside each tab button. Present when `showCaptions` is `true`.                          |
| `"tab-list"`                 | The `<div>` that wraps all tab buttons and acts as the `role="tablist"` container.                                      |
| `"tab-list-end"`             | The `<div>` adjacent to the end of the tab list. Used to project toolbar content via `slot={tabListPosition}`.          |
| `"tab-list-start"`           | The `<div>` adjacent to the start of the tab list. Used to project toolbar content via `slot={tabListPosition}`.        |
| `"tab-panel"`                | The panel `<div>` for each tab's content area. Receives `{item.id}`, position, and state parts.                         |
| `"tab-panel-container"`      | The outer container `<div>` that wraps all tab panels.                                                                  |
| `"{item.id}"`                | Present on the `tab`, `tab-caption`, `close-button`, and `tab-panel` parts for each tab item, enabling per-tab styling. |

## CSS Custom Properties

| Name                                           | Description                                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `--ch-tab-button__background-image-size`       | Specifies the size of the start images of the tab buttons. @default 100%                   |
| `--ch-tab-button__image-size`                  | Specifies the box size that contains the start images of the tab buttons. @default 0.875em |
| `--ch-tab-close-button__background-image-size` | Specifies the image size of the close button. @default 100%                                |
| `--ch-tab-close-button__image-size`            | Specifies the box size that contains an image for the close button. @default 0.875em       |

## Shadow DOM Layout

## Case 1: Full layout (tab list visible, with close buttons)

```
<ch-tab-render>
  | #shadow-root
  |
  | <!-- when showTabListStart -->
  | <div part="tab-list-start [block | inline] [start | end] {tabListPosition}">
  |   <slot name="{tabListPosition}" />
  | </div>
  |
  | <div role="tablist" aria-label="{accessibleName}" part="tab-list [block | inline] [start | end] {tabListPosition} [dragging]">
  |   <!-- for each item in model -->
  |   <button id="{item.id}" role="tab" aria-selected="{selected}" aria-controls="panel-{item.id}" part="{item.id} tab {tabListPosition} [block | inline] [start | end] [closable | not-closable] [selected | not-selected] [disabled] [dragging] [dragging-over-tab-list | dragging-out-of-tab-list]">
  |     <!-- when startImgType === "img" -->
  |     <img aria-hidden="true" part="img" />
  |     <!-- when showCaptions -->
  |     <ch-textblock part="{item.id} tab-caption {tabListPosition} [block | inline] [start | end] [closable | not-closable] [selected | not-selected] [disabled] [dragging] [dragging-over-tab-list | dragging-out-of-tab-list]">
  |       | #shadow-root
  |       | Caption text
  |     </ch-textblock>
  |     <!-- when closeButton -->
  |     <button part="{item.id} close-button {tabListPosition} [block | inline] [start | end] [selected | not-selected] [disabled] [dragging] [dragging-over-tab-list | dragging-out-of-tab-list]"></button>
  |   </button>
  | </div>
  |
  | <!-- when showTabListEnd -->
  | <div part="tab-list-end [block | inline] [start | end] {tabListPosition}">
  |   <slot name="{tabListPosition}" />
  | </div>
  |
  | <div part="tab-panel-container [block | inline] [start | end] {tabListPosition} [expanded | collapsed]">
  |   <!-- for each item in model -->
  |   <div id="panel-{item.id}" role="tabpanel" aria-labelledby="{item.id}" part="{item.id} tab-panel {tabListPosition} [block | inline] [start | end] [selected | not-selected] [disabled]">
  |     <slot name="{item.id}" />
  |   </div>
  | </div>
  |
  | <!-- when dragging -->
  | <button part="{item.id} tab dragging [block | inline] [start | end] [dragging-over-tab-list | dragging-out-of-tab-list] [closable | not-closable] [selected | not-selected] [disabled]">
  |   <!-- Drag preview (same structure as tab button) -->
  | </button>
</ch-tab-render>
```

## Case 2: Tab button hidden (panels only)

```
<ch-tab-render>
  | #shadow-root
  | <div part="tab-panel-container [block | inline] [start | end] {tabListPosition} [expanded | collapsed]">
  |   <!-- for each item in model -->
  |   <div part="{item.id} tab-panel {tabListPosition} [block | inline] [start | end] [selected | not-selected] [disabled]">
  |     <slot name="{item.id}" />
  |   </div>
  | </div>
</ch-tab-render>
```
