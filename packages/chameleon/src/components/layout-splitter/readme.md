# `ch-layout-splitter`

<p>This component allows us to design a layout composed by columns and rows.</p>
<ul>
<li>Columns and rows can have relative (<code>fr</code>) or absolute (<code>px</code>) size.</li>
<li>The line that separates two columns or two rows will always have a drag-bar to resize the layout.</li>
</ul>

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `barAccessibleName:  string`

<p>This attribute lets you specify the label for the drag bar.
Important for accessibility.</p>

**Attribute**: <code>bar-accessible-name</code>

**Default**: <code>"Resize"</code>

---

### `dragBarDisabled:  boolean`

<p>This attribute lets you specify if the resize operation is disabled in all
drag bars. If <code>true</code>, the drag bars are disabled.</p>

**Attribute**: <code>drag-bar-disabled</code>

**Default**: <code>false</code>

---

### `incrementWithKeyboard:  number`

<p>Specifies the resizing increment (in pixel) that is applied when using the
keyboard to resize a drag bar.</p>

**Attribute**: <code>increment-with-keyboard</code>

**Default**: <code>2</code>

---

### `model:  LayoutSplitterModel`

<p>Specifies the list of component that are displayed. Each component will be
separated via a drag bar.</p>

**Default**: <code>{
    id: "root",
    direction: "columns",
    items: []
  }</code>
</details>

<details open>
  <summary>
  
  ## Methods
  </summary>
  
### `refreshLayout: () => void`

<p>Schedules a new render of the control even if no state changed.</p>

---

### `addSiblingLeaf: (parentGroup: string, siblingItem: string, placedInTheSibling: "before" | "after", leafInfo: LayoutSplitterLeafModel, takeHalfTheSpaceOfTheSiblingItem: boolean) => LayoutSplitterItemAddResult`

---

### `removeItem: (itemId: string) => LayoutSplitterItemRemoveResult`

<p>Removes the item that is identified by the given ID.
The layout is rearranged depending on the state of the removed item.</p>
</details>
