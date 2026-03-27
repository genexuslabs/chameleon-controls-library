# `ch-smart-grid`

<p>The <code>ch-smart-grid</code> component is an accessible grid layout for data-driven applications that require infinite scrolling, virtual rendering, and dynamic content loading.</p>

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `accessibleName:  string | undefined`

<p>Specifies a short string, typically 1 to 3 words, that authors associate
with an element to provide users of assistive technologies with a label
for the element.</p>

**Attribute**: <code>accessible-name</code>

**Default**: <code>undefined</code>

---

### `autoGrow:  boolean | undefined`

<p>When <code>true</code>, the control size grows automatically to fit its content
(no scrollbars). When <code>false</code>, the control has a fixed size and
shows scrollbars if the content overflows.</p>
<p>When <code>false</code>, the <code>ch-scrollable</code> class is applied to the host,
enabling <code>contain: strict</code> and <code>overflow: auto</code>.</p>
<p>Interacts with <code>inverseLoading</code>: when both <code>autoGrow</code> and
<code>inverseLoading</code> are <code>true</code>, the CLS-avoidance opacity class is
removed after the first render instead of waiting for the
virtual-scroller load event.</p>

**Attribute**: <code>auto-grow</code>

**Default**: <code>false</code>

---

### `autoScroll:  "never" | "at-scroll-end"`

<p>Specifies how the scroll position will be adjusted when the content size
changes when using <code>inverseLoading = true</code>.</p>
<ul>
<li>
<p>&quot;at-scroll-end&quot;: If the scroll is positioned at the end of the content,
the chat will maintain the scroll at the end while the content size
changes.</p>
</li>
<li>
<p>&quot;never&quot;: The scroll position won't be adjusted when the content size
changes.</p>
</li>
</ul>

**Attribute**: <code>auto-scroll</code>

**Default**: <code>"at-scroll-end"</code>

---

### `dataProvider:  boolean | undefined`

<p><code>true</code> if the control has an external data provider and therefore must
implement infinite scrolling to load data progressively.
When <code>true</code>, a <code>ch-infinite-scroll</code> element is rendered at the top
(if <code>inverseLoading</code>) or bottom of the grid content.</p>

**Attribute**: <code>data-provider</code>

**Default**: <code>false</code>

---

### `inverseLoading:  boolean | undefined`

<p>When set to <code>true</code>, the grid items will be loaded in inverse order, with
the first element at the bottom and the &quot;Loading&quot; message (infinite-scroll)
at the top.</p>

**Attribute**: <code>inverse-loading</code>

**Default**: <code>false</code>

---

### `itemsCount:  number`

<p>The current number of items (rows/cells) in the grid.
This is a required property used to trigger re-renders whenever the
data set changes. When <code>itemsCount</code> is <code>0</code>, the <code>grid-content-empty</code>
slot is rendered instead of <code>grid-content</code>.</p>
<p>If not specified, grid empty and loading placeholders may not work
correctly.</p>

**Attribute**: <code>items-count</code>

**Default**: <code>undefined</code>

---

### `loadingState:  SmartGridDataState`

<p>Specifies the loading state of the grid:</p>
<ul>
<li><code>&quot;initial&quot;</code>: First load; shows the <code>grid-initial-loading-placeholder</code>
slot.</li>
<li><code>&quot;loading&quot;</code>: Data is being fetched (infinite scroll triggered). The
<code>ch-infinite-scroll</code> component shows its loading indicator.</li>
<li><code>&quot;loaded&quot;</code>: Data fetch is complete. Normal content is rendered.</li>
</ul>
<p>This property is mutable: the component sets it to <code>&quot;loading&quot;</code> when
the infinite-scroll threshold is reached.</p>

**Attribute**: <code>loading-state</code>

**Default**: <code>"initial"</code>

---

### `threshold:  string`

<p>The threshold distance from the bottom of the content to call the
<code>infinite</code> output event when scrolled. The threshold value can be either a
percent, or in pixels. For example, use the value of <code>10%</code> for the
<code>infinite</code> output event to get called when the user has scrolled 10% from
the bottom of the page. Use the value <code>100px</code> when the scroll is within
100 pixels from the bottom of the page.</p>

**Attribute**: <code>threshold</code>

**Default**: <code>"10px"</code>
</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `infiniteThresholdReached: void`

<p>Emitted every time the infinite-scroll threshold is reached.
The host should respond by fetching the next page of data and updating
<code>loadingState</code> back to <code>&quot;loaded&quot;</code> when done.</p>
<p>Does not bubble (<code>bubbles: false</code>). Not cancelable. Payload is <code>void</code>.
Before emitting, the component automatically sets <code>loadingState</code> to
<code>&quot;loading&quot;</code>.</p>
</details>

<details open>
  <summary>
  
  ## Methods
  </summary>
  
### `scrollEndContentToPosition: (cellId: string, options: { position: "start" | "end"; behavior?: ScrollBehavior }) => void`

<p>Scrolls the grid so that the cell identified by <code>cellId</code> is aligned at
the <code>&quot;start&quot;</code> or <code>&quot;end&quot;</code> of the viewport.</p>
<p>When <code>position === &quot;start&quot;</code>, the component reserves extra space after
the last cell (similar to how the Monaco editor reserves space for the
last lines) to keep the anchor cell visible at the top even when there
is not enough content below it.</p>
<p>The reserved space is automatically recalculated as cells are added or
removed. Call <code>removeScrollEndContentReference()</code> to clear the anchor.</p>

---

### `removeScrollEndContentReference: () => void`

<p>Removes the cell reference that is aligned at the start of the viewport.</p>
<p>In other words, removes the reserved space that is used to aligned
<code>scrollEndContentToPosition(cellId, { position: &quot;start&quot; })</code></p>
</details>

<details open>
  <summary>
  
  ## Slots
  </summary>
  
### `grid-initial-loading-placeholder`

<p>Placeholder content shown during the initial loading state before any data has been fetched.</p>

---

### `grid-content`

<p>Primary content slot for grid cells. Rendered when the grid has records and is not in the initial loading state.</p>

---

### `grid-content-empty`

<p>Fallback content displayed when the grid has finished loading but contains no records.</p>
</details>
