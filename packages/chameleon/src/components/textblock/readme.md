# `ch-textblock`

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `autoGrow:  boolean`

<p>This property defines if the control size will grow automatically, to
adjust to its content size.</p>
<p>If <code>false</code> the overflowing content will be displayed with an ellipsis.
This ellipsis takes into account multiple lines.</p>

**Attribute**: <code>autogrow</code>

**Default**: <code>false</code>

---

### `caption:  string | undefined`

<p>Specifies the content to be displayed when the control has <code>format = text</code>.</p>

**Attribute**: <code>caption</code>

**Default**: <code>undefined</code>

---

### `characterToMeasureLineHeight:  string`

<p>Specifies the character used to measure the line height</p>

**Attribute**: <code>charactertomeasurelineheight</code>

**Default**: <code>"A"</code>

---

### `format:  "text" | "HTML"`

<p>It specifies the format that will have the textblock control.</p>
<ul>
<li>
<p>If <code>format</code> = <code>HTML</code>, the textblock control works as an HTML div and
the innerHTML will be taken from the default slot.</p>
</li>
<li>
<p>If <code>format</code> = <code>text</code>, the control works as a normal textblock control
and it is affected by most of the defined properties.</p>
</li>
</ul>

**Attribute**: <code>format</code>

**Default**: <code>"text"</code>

---

### `showTooltipOnOverflow:  boolean`

<p><code>true</code> to display a tooltip when the caption overflows the size of the
container.</p>
<p>Only works if <code>format = text</code> and <code>autoGrow = false</code>.</p>

**Attribute**: <code>showtooltiponoverflow</code>

**Default**: <code>false</code>
</details>

<details open>
  <summary>
  
  ## Slots
  </summary>
  
### `- The slot for the HTML content.`
</details>
