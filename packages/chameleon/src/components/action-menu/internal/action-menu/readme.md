# `ch-action-menu`

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `actionGroupParent:  boolean`

<p>Specifies if the current parent of the item is the action-group control.</p>

**Attribute**: <code>action-group-parent</code>

**Default**: <code>false</code>

---

### `blockAlign:  ChPopoverAlign`

<p>Specifies the block alignment of the dropdown menu that is placed
relative to the expandable button.</p>

**Default**: <code>"center"</code>

---

### `caption:  string | undefined`

<p>Specifies the caption that the control will display.</p>

**Default**: <code>undefined</code>

---

### `disabled:  boolean`

<p>This attribute lets you specify if the element is disabled.
If disabled, it will not fire any user interaction related event
(for example, click event).</p>

**Attribute**: <code>disabled</code>

**Default**: <code>false</code>

---

### `endImgSrc:  string | undefined`

<p>Specifies the src of the end image.</p>

**Default**: <code>undefined</code>

---

### `endImgType:  Exclude<ImageRender, "img">`

<p>Specifies how the end image will be rendered.</p>

**Default**: <code>"background"</code>

---

### `expandable:  boolean`

<p>Specifies whether the item contains a subtree. <code>true</code> if the item has a
subtree.</p>

**Attribute**: <code>expandable</code>

**Default**: <code>false</code>

---

### `expanded:  boolean | undefined`

<p><code>true</code> to display the dropdown menu.</p>

**Default**: <code>false</code>

---

### `inlineAlign:  ChPopoverAlign`

<p>Specifies the inline alignment of the dropdown menu that is placed
relative to the expandable button.</p>

**Default**: <code>"center"</code>

---

### `link:  ItemLink | undefined`

<p>Specifies the hyperlink properties of the item. If this property is
defined, the <code>ch-action-menu</code> will render an anchor tag with this
properties. Otherwise, it will render a button tag.</p>

**Default**: <code>undefined</code>

---

### `model:  ActionMenuItemActionableModel`

<p>Specifies the extended model of the control. This property is only needed
to know the UI Model on each event</p>

**Default**: <code>undefined</code>

---

### `openOnFocus:  boolean`

<p>Determine if the dropdown menu should be opened when the expandable
button of the control is focused.
TODO: Add implementation</p>

**Attribute**: <code>open-on-focus</code>

**Default**: <code>false</code>

---

### `parts:  string | undefined`

<p>Specifies a set of parts to use in every DOM element of the control.</p>

**Default**: <code>undefined</code>

---

### `positionTry:  "flip-block" | "flip-inline" | "none"`

<p>Specifies an alternative position to try when the popover overflows the
window.</p>

**Default**: <code>undefined</code>

---

### `shortcut:  string | undefined`

<p>Specifies the shortcut caption that the control will display.</p>

**Default**: <code>undefined</code>

---

### `startImgSrc:  string | undefined`

<p>Specifies the src for the left img.</p>

**Default**: <code>undefined</code>

---

### `startImgType:  Exclude<ImageRender, "img">`

<p>Specifies how the start image will be rendered.</p>

**Default**: <code>"background"</code>
</details>
