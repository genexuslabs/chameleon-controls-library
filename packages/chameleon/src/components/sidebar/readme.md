# `ch-sidebar`

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `expandButtonCollapseAccessibleName:  string | undefined`

<p>Specifies a short string, typically 1 to 3 words, that authors associate
with an element to provide users of assistive technologies with a label
for expand button when <code>expanded = true</code>.</p>

**Attribute**: <code>expand-button-collapse-accessible-name</code>

**Default**: <code>undefined</code>

---

### `expandButtonExpandAccessibleName:  string | undefined`

<p>Specifies a short string, typically 1 to 3 words, that authors associate
with an element to provide users of assistive technologies with a label
for expand button when <code>expanded = false</code>.</p>

**Attribute**: <code>expand-button-expand-accessible-name</code>

**Default**: <code>undefined</code>

---

### `expandButtonCollapseCaption:  string | undefined`

<p>Specifies the caption of the expand button when <code>expanded = true</code>.</p>

**Attribute**: <code>expand-button-collapse-caption</code>

**Default**: <code>undefined</code>

---

### `expandButtonExpandCaption:  string | undefined`

<p>Specifies the caption of the expand button when <code>expanded = false</code>.</p>

**Attribute**: <code>expand-button-expand-caption</code>

**Default**: <code>undefined</code>

---

### `expandButtonPosition:  "before" | "after"`

<p>Specifies the position of the expand button relative to the content of the
sidebar.</p>
<ul>
<li><code>&quot;before&quot;</code>: The expand button is positioned before the content of the sidebar.</li>
<li><code>&quot;after&quot;</code>: The expand button is positioned after the content of the sidebar.</li>
</ul>

**Attribute**: <code>expand-button-position</code>

**Default**: <code>"after"</code>

---

### `expanded:  boolean`

<p>Specifies whether the control is expanded or collapsed.</p>

**Attribute**: <code>expanded</code>

**Default**: <code>true</code>

---

### `showExpandButton:  boolean`

<p><code>true</code> to display a expandable button at the bottom of the control.</p>

**Attribute**: <code>show-expand-button</code>

**Default**: <code>false</code>
</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `expandedChange: boolean`

<p>Emitted when thea element is clicked or the space key is pressed and
released.</p>
</details>
