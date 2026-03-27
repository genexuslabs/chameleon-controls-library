# `ch-virtual-scroller`

<p>The <code>ch-virtual-scroller</code> component provides efficient virtual scrolling for large lists of items within a <code>ch-smart-grid</code>, keeping only visible items plus a configurable buffer in the DOM.</p>

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `bufferAmount:  number`

<p>The number of extra elements to render above and below the current
container's viewport. A higher value reduces the chance of blank areas
during fast scrolling but increases DOM size.</p>
<p>The new value is used on the next scroll or resize update.</p>

**Attribute**: <code>buffer-amount</code>

**Default**: <code>5</code>

---

### `initialRenderViewportItems:  number`

<p>Specifies an estimated count of items that fit in the viewport for the
initial render. Combined with <code>bufferAmount</code>, this determines how many
items are rendered before the first scroll event. A value that is too
low may cause visible blank space on initial load; a value that is too
high increases initial DOM size.</p>
<p>Defaults to <code>10</code>. Init-only — only used during the first render cycle.</p>

**Attribute**: <code>initial-render-viewport-items</code>

**Default**: <code>10</code>

---

### `inverseLoading:  boolean`

<p>When set to <code>true</code>, the grid items will be loaded in inverse order, with
the scroll positioned at the bottom on the initial load.</p>
<p>If <code>mode=&quot;virtual-scroll&quot;</code>, only the items at the start of the viewport
that are not visible will be removed from the DOM. The items at the end of
the viewport that are not visible will remain rendered to avoid flickering
issues.</p>

**Attribute**: <code>inverse-loading</code>

**Default**: <code>false</code>

---

### `items:  SmartGridModel | undefined`

<p>The array of items to be rendered in the <code>ch-smart-grid</code>. Each item must
have a unique <code>id</code> property used internally for virtual size tracking.</p>
<p>When a new array reference is assigned, the virtual scroller resets its
internal state (indexes, virtual sizes) and performs a fresh initial
render. For incremental additions, prefer the <code>addItems()</code> method to
avoid a full reset.</p>
<p>Setting to <code>undefined</code> or an empty array emits an empty
<code>virtualItemsChanged</code> event.</p>

**Default**: <code>undefined</code>

---

### `itemsCount:  number`

<p>The total number of elements in the <code>items</code> array. Set this property when
you mutate the existing array (e.g., push/splice) without assigning a new
reference, so the virtual scroller knows the length has changed.</p>
<p>If <code>items</code> is reassigned as a new array reference, this property is not
needed since the <code>@Watch</code> on <code>items</code> will handle the reset.</p>

**Attribute**: <code>items-count</code>

**Default**: <code>undefined</code>

---

### `mode:  "virtual-scroll" | "lazy-render"`

<p>Specifies how the control will behave.</p>
<ul>
<li>
<p>&quot;virtual-scroll&quot;: Only the items at the start of the viewport that are
not visible will be removed from the DOM. The items at the end of the
viewport that are not visible will remain rendered to avoid flickering
issues.</p>
</li>
<li>
<p>&quot;lazy-render&quot;: It behaves similarly to &quot;virtual-scroll&quot; on the initial
load, but when the user scrolls and new items are rendered, those items
that are outside of the viewport won't be removed from the DOM.</p>
</li>
</ul>

**Attribute**: <code>mode</code>

**Default**: <code>"virtual-scroll"</code>
</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `virtualItemsChanged: VirtualScrollVirtualItems`

<p>Emitted when the slice of visible items changes due to scrolling, resizing,
or programmatic updates. The payload includes <code>startIndex</code>, <code>endIndex</code>,
<code>totalItems</code>, and the <code>virtualItems</code> sub-array that should be rendered.</p>
<p>This event is the primary mechanism for the parent <code>ch-smart-grid</code> to know
which cells to render.</p>

---

### `virtualScrollerDidLoad: void`

<p>Fired once when all cells in the initial viewport have been rendered and
are visible. After this event, the scroller removes <code>opacity: 0</code> and
starts listening for scroll/resize events. This event has no payload.</p>
</details>

<details open>
  <summary>
  
  ## Methods
  </summary>
  
### `addItems: (position: "start" | "end", items: SmartGridModel) => void`

<p>Adds items to the beginning or end of the <code>items</code> array without resetting
the virtual scroller's internal indexes. This is the preferred way to
append or prepend items to the collection (e.g., infinite scroll or
chat message loading). When <code>position</code> is <code>&quot;start&quot;</code>, internal start/end
indexes are shifted by the number of added items to keep the viewport
stable.</p>
<p>After mutation, the scroller triggers a scroll handler update to
recalculate visible items.</p>
</details>

<details open>
  <summary>
  
  ## Slots
  </summary>
  
### `- Default slot. The slot for `ch-smart-grid-cell` elements representing the items to be virtually scrolled.`
</details>
