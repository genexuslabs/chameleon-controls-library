# `ch-action-list-group`

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `caption:  string | undefined`

<p>This attributes specifies the caption of the control</p>

**Default**: <code>undefined</code>

---

### `disabled:  boolean`

<p>This attribute lets you specify if the element is disabled.
If disabled, it will not fire any user interaction related event
(for example, click event).</p>

**Attribute**: <code>disabled</code>

**Default**: <code>false</code>

---

### `expandable:  boolean | undefined`

<p>If the item has a sub-tree, this attribute determines if the subtree is
displayed.</p>

**Default**: <code>undefined</code>

---

### `expanded:  boolean | undefined`

<p>If the item has a sub-tree, this attribute determines if the subtree is
displayed.</p>

**Default**: <code>undefined</code>

---

### `metadata:  string | undefined`

<p>This attribute represents additional info for the control that is included
when dragging the item.</p>

**Default**: <code>undefined</code>

---

### `parts:  string | undefined`

<p>Specifies a set of parts to use in every DOM element of the control.</p>

**Default**: <code>undefined</code>

---

### `selected:  boolean`

<p>This attribute lets you specify if the item is selected</p>

**Default**: <code>false</code>

---

### `showDownloadingSpinner:  boolean`

<p><code>true</code> to show the downloading spinner when lazy loading the sub items of
the control.</p>

**Attribute**: <code>show-downloading-spinner</code>

**Default**: <code>true</code>
</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `loadLazyContent: string`

<p>Fired when the lazy control is expanded an its content must be loaded.</p>
</details>

<details open>
  <summary>
  
  ## Methods
  </summary>
  
### `setFocus: () => void`

<p>Set the focus in the control if <code>expandable === true</code>.</p>
</details>
