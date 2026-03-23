# `ch-tab-render`

<p>The <code>ch-tab-render</code> component renders a tabbed interface where each tab
button switches the visible content panel.</p>

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `accessibleName:  string | undefined`

<p>Specifies a short string, typically 1 to 3 words, that authors associate
with an element to provide users of assistive technologies with a label
for the element. This value is applied as the accessible name of the
<code>role=&quot;tablist&quot;</code> element.</p>

**Attribute**: <code>accessible-name</code>

**Default**: <code>undefined</code>

---

### `closeButton:  boolean`

<p><code>true</code> to display a close button for the items.</p>

**Attribute**: <code>close-button</code>

**Default**: <code>false</code>

---

### `closeButtonAccessibleName:  string`

<p>Specifies a short string, typically 1 to 3 words, that authors associate
with an element to provide users of assistive technologies with a label
for the element. This label is used for the close button of the captions.</p>

**Attribute**: <code>close-button-accessible-name</code>

**Default**: <code>"Close"</code>

---

### `contain:  CssContainProperty | undefined`

<p>Same as the contain CSS property. This property indicates that an item
and its contents are, as much as possible, independent from the rest of
the document tree. Containment enables isolating a subsection of the DOM,
providing performance benefits by limiting calculations of layout, style,
paint, size, or any combination to a DOM subtree rather than the entire
page.
Containment can also be used to scope CSS counters and quotes.</p>

**Attribute**: <code>contain</code>

**Default**: <code>"none"</code>

---

### `disabled:  boolean`

<p>This attribute lets you specify if all tab buttons are disabled.
If disabled, tab buttons will not fire any user interaction related event
(for example, click event).</p>

**Attribute**: <code>disabled</code>

**Default**: <code>false</code>

---

### `dragOutside:  boolean`

<p>When the control is sortable, the items can be dragged outside of the
tab-list.</p>
<p>This property lets you specify if this behavior is enabled.</p>

**Attribute**: <code>drag-outside</code>

**Default**: <code>false</code>

---

### `expanded:  boolean`

<p><code>true</code> if the tab panel container is visible. When <code>false</code>, only the
tab-list toolbar is displayed and all tab panels are hidden.</p>

**Attribute**: <code>expanded</code>

**Default**: <code>true</code>

---

### `getImagePathCallback:  GetImagePathCallback | undefined`

<p>This property specifies a callback that is executed when the path for an
startImgSrc needs to be resolved.</p>

**Attribute**: <code>getimagepathcallback</code>

**Default**: <code>undefined</code>

---

### `model:  TabModel | undefined`

<p>Specifies the items of the tab control. Tab panels use lazy rendering:
a panel's content slot is only rendered after the tab has been selected
at least once (tracked internally via <code>wasRendered</code>).</p>

**Attribute**: <code>model</code>

**Default**: <code>undefined</code>

---

### `overflow:  CssOverflowProperty | `${CssOverflowProperty} ${CssOverflowProperty}``

<p>Same as the overflow CSS property. This property sets the desired behavior
when content does not fit in the item's padding box (overflows) in the
horizontal and/or vertical direction.</p>

**Attribute**: <code>overflow</code>

**Default**: <code>"visible"</code>

---

### `selectedId:  string | undefined`

<p>Specifies the selected item of the widgets array.</p>

**Attribute**: <code>selected-id</code>

**Default**: <code>undefined</code>

---

### `showCaptions:  boolean`

<p><code>true</code> to show the captions of the items.</p>

**Attribute**: <code>show-captions</code>

**Default**: <code>true</code>

---

### `showTabListEnd:  boolean`

<p><code>true</code> to render a slot named &quot;tab-list-end&quot; to project content at the
end position of the tab-list (&quot;after&quot; the tab buttons).</p>

**Attribute**: <code>show-tab-list-end</code>

**Default**: <code>false</code>

---

### `showTabListStart:  boolean`

<p><code>true</code> to render a slot named &quot;tab-list-start&quot; to project content at the
start position of the tab-list (&quot;before&quot; the tab buttons).</p>

**Attribute**: <code>show-tab-list-start</code>

**Default**: <code>false</code>

---

### `sortable:  boolean`

<p><code>true</code> to enable sorting the tab buttons by dragging them in the tab-list.</p>
<p>If <code>false</code>, the tab buttons can not be dragged out either.</p>

**Attribute**: <code>sortable</code>

**Default**: <code>false</code>

---

### `tabButtonHidden:  boolean`

<p><code>true</code> to not render the tab buttons of the control.</p>

**Attribute**: <code>tab-button-hidden</code>

**Default**: <code>false</code>

---

### `tabListPosition:  TabListPosition`

<p>Specifies the position of the tab list of the <code>ch-tab-render</code>.</p>

**Attribute**: <code>tab-list-position</code>

**Default**: <code>DEFAULT_TAB_LIST_POSITION</code>
</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `expandMainGroup: string`

<p>Fired when an item of the main group is double clicked.</p>

---

### `itemClose: TabItemCloseInfo`

<p>Fired the close button of an item is clicked.</p>

---

### `selectedItemChange: TabSelectedItemInfo`

<p>Fired when the selected item change.
This event can be default prevented to prevent the item selection.</p>

---

### `itemDragStart: number`

<p>Fired the first time a caption button is dragged outside of its tab list.</p>
</details>

<details open>
  <summary>
  
  ## Methods
  </summary>
  
### `endDragPreview: () => Promise<void>`

<p>Ends the preview of the dragged item. Useful for ending the preview via
keyboard interaction.</p>

---

### `getDraggableViews: () => Promise<DraggableViewInfo>`

<p>Returns the info associated to the draggable view.</p>

---

### `promoteDragPreviewToTopLayer: () => Promise<void>`

<p>Promotes the drag preview to the top layer. Useful to avoid z-index issues.</p>

---

### `removePage: (pageId: string, forceRerender: any) => void`

<p>Given an id, remove the page from the render</p>
</details>

<details open>
  <summary>
  
  ## Slots
  </summary>
  
### `{tabListPosition}`

<p>Named slot rendered adjacent to the tab list for custom toolbar content (e.g., an overflow menu or add-tab button).</p>

---

### `{item.id}`

<p>Named slot for each tab panel's content, projected when the tab has been rendered at least once.</p>
</details>
