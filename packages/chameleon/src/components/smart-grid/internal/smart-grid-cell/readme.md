# `ch-smart-grid-cell`

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `cellId:  string`

<p>Specifies the ID of the cell.</p>
<p>We use a specific property instead of the actual id attribute, because
with this property we don't need this ID to be unique in the Shadow scope
where this cell is rendered. In other words, if there is an element with
<code>id=&quot;1&quot;</code>, this cell can still have <code>cellId=&quot;1&quot;</code>.</p>

**Attribute**: <code>cell-id</code>

**Default**: <code>undefined</code>

---

### `smartGridRef: HTMLChSmartGridElement | undefined`

<p>Specifies the reference for the smart grid parent.</p>
<p>This property is useful to avoid the cell from queering the ch-smart-grid
ref on the initial load.</p>

**Default**: <code>undefined</code>
</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `smartCellDidLoad: string`

<p>Fired when the component and all its child did render for the first time.</p>
<p>It contains the <code>cellId</code>.</p>
</details>
