# `ch-switch`

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `accessibleName: string | undefined`

<p>Specifies a short string, typically 1 to 3 words, that authors associate
with an element to provide users of assistive technologies with a label
for the element.asd123</p>

**Attribute**: <code>accessible-name</code>

**Default**: <code>undefined</code>

---

### `checkedCaption: string | undefined`

<p>Caption displayed when the switch is 'on'</p>

**Attribute**: <code>checked-caption</code>

**Default**: <code>undefined</code>

---

### `checked:  boolean`

<p><code>true</code> if the <code>ch-switch</code> is checked.</p>
<p>If checked:</p>
<ul>
<li>The <code>value</code> property will be available in the parent <code>&lt;form&gt;</code> if the
<code>name</code> attribute is set.</li>
<li>The <code>checkedCaption</code> will be used to display the current caption.</li>
</ul>
<p>If not checked:</p>
<ul>
<li>The <code>value</code> property won't be available in the parent <code>&lt;form&gt;</code>, even
if the <code>name</code> attribute is set.</li>
<li>The <code>unCheckedCaption</code> will be used to display the current caption.</li>
</ul>

**Attribute**: <code>checked</code>

**Default**: <code>false</code>

---

### `disabled:  boolean`

<p>This attribute lets you specify if the element is disabled.
If disabled, it will not fire any user interaction related event
(for example, click event).</p>

**Attribute**: <code>disabled</code>

**Default**: <code>false</code>

---

### `name:  string | undefined`

<p>Specifies the <code>name</code> of the component when used in a form.</p>

**Attribute**: <code>name</code>

**Default**: <code>undefined</code>

---

### `readonly:  boolean`

<p>This attribute indicates that the user cannot modify the value of the control.
Same as <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly">readonly</a>
attribute for <code>input</code> elements.</p>

**Attribute**: <code>readonly</code>

**Default**: <code>false</code>

---

### `unCheckedCaption: string | undefined`

<p>Caption displayed when the switch is 'off'</p>

**Attribute**: <code>un-checked-caption</code>

**Default**: <code>undefined</code>

---

### `value:  string`

<p>The value of the control.</p>

**Attribute**: <code>value</code>

**Default**: <code>"on"</code>
</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `input: boolean`

<p>The <code>input</code> event is emitted when a change to the element's checked state
is committed by the user.</p>
<p>It contains the new checked state of the control.</p>
<p>This event is preventable.</p>
</details>

<details open>
  <summary>
  
  ## CSS Parts
  </summary>
  
### `track`

<p>The track of the switch element.</p>

---

### `thumb`

<p>The thumb of the switch element.</p>

---

### `caption`

<p>The caption (checked or unchecked) of the switch element.</p>

---

### `checked`

<p>Present in the <code>track</code>, <code>thumb</code> and <code>caption</code> parts when the control is checked (<code>checked</code> === <code>true</code>).</p>

---

### `disabled`

<p>Present in the <code>track</code>, <code>thumb</code> and <code>caption</code> parts when the control is disabled (<code>disabled</code> === <code>true</code>).</p>

---

### `unchecked`

<p>Present in the <code>track</code>, <code>thumb</code> and <code>caption</code> parts when the control is unchecked (<code>checked</code> === <code>false</code>).</p>
</details>
