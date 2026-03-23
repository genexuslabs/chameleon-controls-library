# `ch-action-list-item`

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `additionalInfo:  ActionListItemAdditionalInformation | undefined`

**Default**: <code>undefined</code>

---

### `caption:  string | undefined`

<p>This attributes specifies the caption of the control.</p>

**Default**: <code>undefined</code>

---

### `checkbox:  boolean`

<p>Set this attribute if you want display a checkbox in the control.</p>

**Attribute**: <code>checkbox</code>

**Default**: <code>false</code>

---

### `checked:  boolean`

<p>Set this attribute if you want the checkbox to be checked by default.
Only works if <code>checkbox = true</code></p>

**Attribute**: <code>checked</code>

**Default**: <code>false</code>

---

### `customRender:  boolean`

<p>Set this attribute if you want to set a custom render for the control, by
passing a slot.</p>

**Attribute**: <code>custom-render</code>

**Default**: <code>false</code>

---

### `disabled:  boolean`

<p>This attribute lets you specify if the element is disabled.
If disabled, it will not fire any user interaction related event
(for example, click event).</p>

**Attribute**: <code>disabled</code>

**Default**: <code>false</code>

---

### `editable:  boolean | undefined`

<p>This property lets you specify if the edit operation is enabled in the
control. If <code>true</code>, the control can edit its caption in place.</p>

**Default**: <code>undefined</code>

---

### `fixed:  boolean | undefined`

**Default**: <code>false</code>

---

### `getImagePathCallback: ((item: ActionListItemAdditionalBase) => GxImageMultiState | undefined) | undefined`

<p>This property specifies a callback that is executed when the path for an
imgSrc needs to be resolved.</p>

**Default**: <code>undefined</code>

---

### `metadata:  string | undefined`

<p>This attribute represents additional info for the control that is included
when dragging the item.</p>

**Default**: <code>undefined</code>

---

### `nested:  boolean`

<p>Specifies if the item is inside of a ch-action-list-group control.</p>

**Default**: <code>false</code>

---

### `nestedExpandable:  boolean`

<p>Specifies if the item is inside of a ch-action-list-group control that
is expandable.</p>

**Default**: <code>false</code>

---

### `parts:  string | undefined`

<p>Specifies a set of parts to use in every DOM element of the control.</p>

**Default**: <code>undefined</code>

---

### `selectable:  boolean`

<p>Specifies if the item can be selected.</p>

**Default**: <code>false</code>

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

---

### `translations:  ActionListTranslations | undefined`

<p>Specifies the literals required for the control.</p>

**Default**: <code>undefined</code>
</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `captionChange: ActionListCaptionChangeEventDetail`

<p>Fired when the fixed value of the control is changed.</p>

---

### `fixedChange: ActionListFixedChangeEventDetail`

<p>Fired when the control is asking to modify its caption</p>

---

### `remove: string`

<p>Fired when the remove button was clicked in the control.</p>

---

### `itemDragEnd: void`

<p>Fired when the item is no longer being dragged.</p>
</details>
