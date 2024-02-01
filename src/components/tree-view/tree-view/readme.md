# ch-tree-x



<!-- Auto Generated Below -->


## Properties

| Property                | Attribute                 | Description                                                                                                        | Type                                          | Default     |
| ----------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- | ----------- |
| `multiSelection`        | `multi-selection`         | Set this attribute if you want to allow multi selection of the items.                                              | `boolean`                                     | `false`     |
| `openSubTreeCountdown`  | `open-sub-tree-countdown` | This property lets you specify the time (in ms) that the mouse must be over in a subtree to open it when dragging. | `number`                                      | `750`       |
| `scrollToEdgeOnDrag`    | `scroll-to-edge-on-drag`  | `true` to scroll in the tree when dragging an item near the edges of the tree.                                     | `boolean`                                     | `true`      |
| `selectedItemsCallback` | --                        | Callback that is executed to get the current selected items.                                                       | `() => Map<string, TreeViewItemSelectedInfo>` | `undefined` |
| `waitDropProcessing`    | `wait-drop-processing`    | This property lets you specify if the tree is waiting to process the drop of items.                                | `boolean`                                     | `false`     |


## Events

| Event                 | Description                                                                                                                   | Type                                                                                                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `droppableZoneEnter`  | Fired when an element attempts to enter in a droppable zone where the tree has no information about the validity of the drop. | `CustomEvent<{ newContainer: GxDataTransferInfo; draggedItems: GxDataTransferInfo[]; dropType: TreeViewDropType; }>`                                                             |
| `expandedItemChange`  | Fired when an item is expanded or collapsed.                                                                                  | `CustomEvent<{ id: string; expanded: boolean; }>`                                                                                                                                |
| `itemContextmenu`     | Fired when an element displays its contextmenu.                                                                               | `CustomEvent<{ id: string; itemRef: HTMLChTreeViewItemElement; metadata: string; contextmenuEvent: PointerEvent; }>`                                                             |
| `itemsDropped`        | Fired when the dragged items are dropped in another item of the tree.                                                         | `CustomEvent<{ newContainer: GxDataTransferInfo; draggedItems: GxDataTransferInfo[]; draggingSelectedItems: boolean; dropInTheSameTree: boolean; dropType: TreeViewDropType; }>` |
| `selectedItemsChange` | Fired when the selected items change.                                                                                         | `CustomEvent<Map<string, TreeViewItemSelectedInfo>>`                                                                                                                             |


## Methods

### `scrollIntoVisible(treeItemId: string) => Promise<void>`

Given an item id, it scrolls into the item's view.

#### Parameters

| Name         | Type     | Description |
| ------------ | -------- | ----------- |
| `treeItemId` | `string` |             |

#### Returns

Type: `Promise<void>`



### `updateValidDropZone(requestTimestamp: number, newContainerId: string, draggedItems: GxDataTransferInfo[], dropType: TreeViewDropType, validDrop: boolean) => Promise<void>`

Update the information about the valid droppable zones.

#### Parameters

| Name               | Type                             | Description                                                                            |
| ------------------ | -------------------------------- | -------------------------------------------------------------------------------------- |
| `requestTimestamp` | `number`                         | Time where the request to the server was made. Useful to avoid having old information. |
| `newContainerId`   | `string`                         | ID of the container where the drag is trying to be made.                               |
| `draggedItems`     | `GxDataTransferInfo[]`           | Information about the dragged items.                                                   |
| `dropType`         | `"after" \| "before" \| "above"` |                                                                                        |
| `validDrop`        | `boolean`                        | Current state of the droppable zone.                                                   |

#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part                 | Description |
| -------------------- | ----------- |
| `"tree-x-container"` |             |


## Dependencies

### Used by

 - [ch-tree-view-render](../../renders/tree-view)

### Graph
```mermaid
graph TD;
  ch-tree-view-render --> ch-tree-view
  style ch-tree-view fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
