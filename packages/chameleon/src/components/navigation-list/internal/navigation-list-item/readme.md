# `ch-navigation-list-item`

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

### `expandable:  boolean`

<p>Specifies if the control contains sub items.</p>

**Attribute**: <code>expandable</code>

**Default**: <code>false</code>

---

### `expanded:  boolean | undefined`

<p>Specifies if the control is expanded or collapsed.</p>

**Attribute**: <code>expanded</code>

**Default**: <code>undefined</code>

---

### `exportparts:  string`

<p>This property works the same as the exportparts attribute. It is defined
as a property just to reflect the default value, which avoids FOUC when
the <code>ch-navigation-list-render</code> component is Server Side Rendered.
Otherwise, setting this attribute on the client would provoke FOUC and/or
visual flickering.</p>

**Attribute**: <code>exportparts</code>

**Default**: <code>NAVIGATION_LIST_ITEM_EXPORT_PARTS</code>

---

### `level:  number`

<p>Specifies at which level of the navigation list is rendered the control.</p>

**Attribute**: <code>level</code>

**Default**: <code>NAVIGATION_LIST_INITIAL_LEVEL</code>

---

### `link:  ItemLink | undefined`

**Attribute**: <code>link</code>

**Default**: <code>undefined</code>

---

### `model:  NavigationListItemModel`

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

### `sharedState:  NavigationListSharedState`

**Attribute**: <code>sharedstate</code>

**Default**: <code>undefined</code>

---

### `startImgSrc:  string | undefined`

<p>Specifies the src of the start image.</p>

**Attribute**: <code>startimgsrc</code>

**Default**: <code>undefined</code>

---

### `startImgType: Exclude<ImageRender, "img"> | undefined`

<p>Specifies how the start image will be rendered.</p>

**Attribute**: <code>startimgtype</code>

**Default**: <code>undefined</code>
</details>
