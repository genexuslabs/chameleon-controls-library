# `ch-breadcrumb-render`

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `getImagePathCallback: ((item: BreadCrumbItemModel) => GxImageMultiState | undefined) | undefined`

<p>This property specifies a callback that is executed when the path for an
startImgSrc needs to be resolved.</p>

**Attribute**: <code>getimagepathcallback</code>

**Default**: <code>undefined</code>

---

### `selectedLink: {  id?: string;  link: ItemLink;}`

<p>Specifies the current selected hyperlink.</p>

**Attribute**: <code>selectedlink</code>

**Default**: <code>{
    link: { url: undefined }
  }</code>

---

### `selectedLinkIndicator:  boolean`

<p>Specifies if the selected item indicator is displayed (only work for hyperlink)</p>

**Attribute**: <code>selected-link-indicator</code>

**Default**: <code>false</code>

---

### `model:  BreadCrumbModel | undefined`

<p>Specifies the items of the control.</p>

**Attribute**: <code>model</code>

**Default**: <code>undefined</code>

---

### `separator:  string | undefined`

**Attribute**: <code>separator</code>

**Default**: <code>"/"</code>

---

### `accessibleName:  string | undefined`

<p>Specifies a short string, typically 1 to 3 words, that authors associate
with an element to provide users of assistive technologies with a label
for the element.</p>

**Attribute**: <code>accessible-name</code>

**Default**: <code>undefined</code>
</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `buttonClick: BreadCrumbItemModel`

<p>Fired when an button is clicked.
This event can be prevented.</p>

---

### `hyperlinkClick: BreadCrumbHyperlinkClickEvent`

<p>Fired when an hyperlink is clicked.
This event can be prevented.</p>
</details>
