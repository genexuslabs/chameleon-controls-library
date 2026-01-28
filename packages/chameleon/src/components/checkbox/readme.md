# `ch-checkbox`

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `accessibleName: string | undefined`

<p>Specifies a short string, typically 1 to 3 words, that authors associate
with an element to provide users of assistive technologies with a label
for the element.</p>

**Attribute**: <code>accessible-name</code>

**Default**: <code>undefined</code>

---

### `caption:  string | undefined`

<p>Specifies the label of the checkbox.</p>

**Attribute**: <code>caption</code>

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

### `getImagePathCallback: GetImagePathCallback | undefined`

<p>This property specifies a callback that is executed when the path for an
startImgSrc needs to be resolved.</p>

**Default**: <code>undefined</code>

---

### `indeterminate:  boolean`

<p><code>true</code> if the control's value is indeterminate.</p>
<p>This property is purely a visual change. It has no impact on whether the
checkbox's is used in a form submission. That is decided by the
<code>checked</code> property, regardless of the <code>indeterminate</code> state.</p>

**Attribute**: <code>indeterminate</code>

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

### `startImgSrc:  string | undefined`

<p>Specifies the source of the start image.</p>

**Attribute**: <code>start-img-src</code>

**Default**: <code>undefined</code>

---

### `startImgType: Exclude<ImageRender, "img">`

<p>Specifies the source of the start image.</p>

**Attribute**: <code>start-img-type</code>

**Default**: <code>"background"</code>

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
</details>

<details open>
  <summary>
  
  ## CSS Custom Vars
  </summary>
  
### `--ch-checkbox__container-size = min(1em, 20px)`

<p>Specifies the size for the container of the <code>input</code> and <code>option</code> elements.</p>

---

### `--ch-checkbox__checked-image = url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><path d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z'/></svg>")`

<p>Specifies the image of the checkbox when is checked.</p>

---

### `--ch-checkbox__option-indeterminate-image = url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><rect width='8' height='8'/></svg>")`

<p>Specifies the image of the checkbox when is indeterminate.</p>

---

### `--ch-checkbox__option-image-size = 50%`

<p>Specifies the image size of the <code>option</code> element.</p>

---

### `--ch-checkbox__image-size = #{$default-decorative-image-size}`

<p>Specifies the box size that contains the start image of the control.</p>

---

### `--ch-checkbox__background-image-size = 100%`

<p>Specifies the size of the start image of the control.</p>
</details>
