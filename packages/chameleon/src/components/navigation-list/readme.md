# `ch-navigation-list-render`

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `autoGrow:  boolean`

<p>If <code>false</code> the overflowing content of the control will be clipped to the
borders of its container.</p>

**Attribute**: <code>auto-grow</code>

**Default**: <code>false</code>

---

### `expandableButton: "decorative" | "no"`

<p>Specifies what kind of expandable button is displayed in the items by
default.</p>
<ul>
<li><code>&quot;decorative&quot;</code>: Only a decorative icon is rendered to display the state
of the item.</li>
</ul>

**Attribute**: <code>expandable-button</code>

**Default**: <code>"decorative"</code>

---

### `expandableButtonPosition:  "start" | "end"`

<p>Specifies the position of the expandable button in reference of the action
element of the items</p>
<ul>
<li><code>&quot;start&quot;</code>: Expandable button is placed before the action element.</li>
<li><code>&quot;end&quot;</code>: Expandable button is placed after the action element.</li>
</ul>

**Attribute**: <code>expandable-button-position</code>

**Default**: <code>"start"</code>

---

### `getImagePathCallback: ((item: NavigationListItemModel) => GxImageMultiState | undefined) | undefined`

<p>This property specifies a callback that is executed when the path for an
startImgSrc needs to be resolved.</p>

**Attribute**: <code>getimagepathcallback</code>

**Default**: <code>undefined</code>

---

### `expanded:  boolean`

<p>Specifies if the control is expanded or collapsed.</p>

**Attribute**: <code>expanded</code>

**Default**: <code>true</code>

---

### `expandSelectedLink:  boolean`

<p><code>true</code> to expand the path to the selected link when the <code>selectedLink</code>
property is updated.</p>

**Attribute**: <code>expand-selected-link</code>

**Default**: <code>false</code>

---

### `model: NavigationListModel | undefined`

<p>Specifies the items of the control.</p>

**Attribute**: <code>model</code>

**Default**: <code>undefined</code>

---

### `renderItem: ((item: NavigationListItemModel, navigationListSharedState: NavigationListSharedState, level: number) => TemplateResult) | undefined`

<p>Specifies the items of the control.</p>

**Attribute**: <code>renderitem</code>

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

### `showCaptionOnCollapse: "inline" | "tooltip"`

<p>Specifies how the caption of the items will be displayed when the control
is collapsed</p>

**Attribute**: <code>show-caption-on-collapse</code>

**Default**: <code>"inline"</code>

---

### `tooltipDelay:  number`

<p>Specifies the delay (in ms) for the tooltip to be displayed.</p>

**Attribute**: <code>tooltip-delay</code>

**Default**: <code>100</code>
</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `buttonClick: NavigationListItemModel`

<p>Fired when an button is clicked.
This event can be prevented.</p>

---

### `hyperlinkClick: NavigationListHyperlinkClickEvent`

<p>Fired when an hyperlink is clicked.
This event can be prevented.</p>
</details>
