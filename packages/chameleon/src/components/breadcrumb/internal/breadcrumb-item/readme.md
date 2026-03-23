# `ch-breadcrumb-item`

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `caption:  string | undefined`

<p>Specifies the caption of the control</p>

**Attribute**: <code>caption</code>

**Default**: <code>undefined</code>

---

### `disabled:  boolean | undefined`

<p>This attribute lets you specify if the element is disabled.
If disabled, it will not fire any user interaction related event
(for example, click event).</p>

**Attribute**: <code>disabled</code>

**Default**: <code>undefined</code>

---

### `accessibleName:  string | undefined`

<p>Specifies a short string, typically 1 to 3 words, that authors associate
with an element to provide users of assistive technologies with a label
for the element.</p>

**Attribute**: <code>accessible-name</code>

**Default**: <code>undefined</code>

---

### `link:  ItemLink | undefined`

**Attribute**: <code>link</code>

**Default**: <code>undefined</code>

---

### `model:  BreadCrumbItemModel`

<p>Specifies the UI model of the control</p>

**Attribute**: <code>model</code>

**Default**: <code>undefined</code>

---

### `selected:  boolean`

<p>Specifies if the hyperlink is selected. Only applies when the <code>link</code>
property is defined.</p>

**Attribute**: <code>selected</code>

**Default**: <code>false</code>

---

### `selectedLinkIndicator:  boolean`

<p>Specifies if the selected item indicator is displayed when the item is
selected. Only applies when the <code>link</code> property is defined.</p>

**Attribute**: <code>selectedlinkindicator</code>

**Default**: <code>false</code>

---

### `startImgSrc:  string | undefined`

<p>Specifies the src of the start image.</p>

**Attribute**: <code>startimgsrc</code>

**Default**: <code>undefined</code>

---

### `startImgType:  Exclude<ImageRender, "img"> | undefined`

<p>Specifies how the start image will be rendered.</p>

**Attribute**: <code>startimgtype</code>

**Default**: <code>undefined</code>

---

### `getImagePathCallback: ((imageSrc: BreadCrumbItemModel) => GxImageMultiState | undefined) | undefined`

<p>This property specifies a callback that is executed when the path for an
startImgSrc needs to be resolved.</p>

**Attribute**: <code>getimagepathcallback</code>

**Default**: <code>undefined</code>
</details>
