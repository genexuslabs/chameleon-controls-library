# `ch-tabular-grid-column`

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `accessibleName:  string | undefined`

<p>...</p>

**Attribute**: <code>accessiblename</code>

**Default**: <code>undefined</code>

---

### `caption:  string | undefined`

<p>Specifies the caption of the column</p>

**Attribute**: <code>caption</code>

**Default**: <code>undefined</code>

---

### `colSpan:  number | undefined`

<p>Specifies the column span value of the column.</p>

**Attribute**: <code>colspan</code>

**Default**: <code>undefined</code>

---

### `colStart:  number | undefined`

<p>Specifies the start position of the column.</p>

**Attribute**: <code>colstart</code>

**Default**: <code>undefined</code>

---

### `parts:  string | undefined`

<p>...</p>

**Attribute**: <code>parts</code>

**Default**: <code>undefined</code>

---

### `resizable:  boolean | undefined`

<p>...</p>

**Attribute**: <code>resizable</code>

**Default**: <code>undefined</code>

---

### `rowSpan:  number | undefined`

<p>Specifies the row span value of the column.</p>

**Attribute**: <code>rowspan</code>

**Default**: <code>undefined</code>

---

### `size:  string | undefined`

<p>...</p>

**Attribute**: <code>size</code>

**Default**: <code>undefined</code>

---

### `styles:  string | undefined`

<p>Specifies an accessor for the attribute style of the
<code>ch-tabular-grid-column</code>. This accessor is useful for SSR scenarios were
the Host access is limited (since Lit does not provide the Host
declarative component).</p>
<p>Without this accessor, the initial load in SSR scenarios would flicker.</p>

**Attribute**: <code>style</code>

**Default**: <code>undefined</code>

---

### `sortable:  boolean | undefined`

<p>...</p>

**Attribute**: <code>sortable</code>

**Default**: <code>undefined</code>

---

### `sortDirection: TabularGridSortDirection | undefined`

<p>Specifies if the column content is sorted.</p>

**Attribute**: <code>aria-sort</code>

**Default**: <code>undefined</code>
</details>
>

**Default**: <code>false</code>

---

### `unCheckedCaption: string | undefined`

<p>Caption displayed when the switch is 'off'</p>

**Attribute**: <code>un-checked-caption</code>

**Default**: <code>undefined</code>

---

### `value:  string`

<p>The value of the control.</p>

**Attribute**: <code>value</code>

**Default**: <code>"on"</code>
</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `input: boolean`

<p>The <code>input</code> event is emitted when a change to the element's checked state
is committed by the user.</p>
<p>It contains the new checked state of the control.</p>
<p>This event is preventable.</p>
</details>

<details open>
  <summary>
  
  ## CSS Parts
  </summary>
  
### `track`

<p>The track of the switch element.</p>

---

### `thumb`

<p>The thumb of the switch element.</p>

---

### `caption`

<p>The caption (checked or unchecked) of the switch element.</p>

---

### `checked`

<p>Present in the <code>track</code>, <code>thumb</code> and <code>caption</code> parts when the control is checked (<code>checked</code> === <code>true</code>).</p>

---

### `disabled`

<p>Present in the <code>track</code>, <code>thumb</code> and <code>caption</code> parts when the control is disabled (<code>disabled</code> === <code>true</code>).</p>

---

### `unchecked`

<p>Present in the <code>track</code>, <code>thumb</code> and <code>caption</code> parts when the control is unchecked (<code>checked</code> === <code>false</code>).</p>
</details>
nRef</code> must be in the same Shadow Tree as this control.
Otherwise, the <code>aria-describedby</code> binding won't work, since the control ID
is not visible for the <code>loadingRegionRef</code>.</p>

**Default**: <code>undefined</code>

---

### `value:  number`

<p>Specifies the current value of the component. In other words, how much of
the task that has been completed.</p>
<p>This property is not used if indeterminate === true.</p>

**Attribute**: <code>value</code>

**Default**: <code>DEFAULT_MIN_VALUE</code>
</details>
pen>
  <summary>
  
  ## Events
  </summary>
  
### `change: void`

---

### `input: string`

---

### `passwordVisibilityChange: boolean`
</details>

<details open>
  <summary>
  
  ## Slots
  </summary>
  
### `additional-content-before`

<p>The slot used for the additional content when <code>showAdditionalContentBefore === true</code>.</p>

---

### `additional-content-after`

<p>The slot used for the additional content when <code>showAdditionalContentAfter === true</code>.</p>
</details>

<details open>
  <summary>
  
  ## CSS Parts
  </summary>
  
### `date-placeholder`

<p>A placeholder displayed when the control is editable (<code>readonly=&quot;false&quot;</code>), has no value set, and its type is <code>&quot;datetime-local&quot; | &quot;date&quot; | &quot;time&quot;</code>.</p>
</details>
</code> is defined.</p>

---

### `send-input-after`

<p>Region after the text input inside the edit control. Rendered when <code>sendContainerLayout.sendInputAfter</code> is defined.</p>

---

### `send-button`

<p>The button that sends the current message.</p>

---

### `stop-response-button`

<p>The button that stops the assistant's response generation. Rendered when <code>waitingResponse</code> is <code>true</code> and a <code>stopResponse</code> callback is provided.</p>
</details>
(similar to how the Monaco editor reserves space for the
last lines) to keep the anchor cell visible at the top even when there
is not enough content below it.</p>
<p>The reserved space is automatically recalculated as cells are added or
removed. Call <code>removeScrollEndContentReference()</code> to clear the anchor.</p>

---

### `removeScrollEndContentReference: () => void`

<p>Removes the cell reference that is aligned at the start of the viewport.</p>
<p>In other words, removes the reserved space that is used to aligned
<code>scrollEndContentToPosition(cellId, { position: &quot;start&quot; })</code></p>

---

### `handleVirtualItemsChanged: (event: ChVirtualScrollerCustomEvent<VirtualScrollVirtualItems>) => void`
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
