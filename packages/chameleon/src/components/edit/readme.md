# `ch-edit`

<p>A wrapper for the input and textarea elements. It additionally provides:</p>
<ul>
<li>A placeholder for <code>&quot;date&quot;</code>, <code>&quot;datetime-local&quot;</code> and <code>&quot;time&quot;</code> types.</li>
<li>An action button.</li>
<li>Useful style resets.</li>
<li>Support for picture formatting.</li>
<li>Support to auto grow the control when used with multiline (useful to
model chat inputs).</li>
<li>An image which can have multiple states.</li>
<li>Support for debouncing the input event.</li>
</ul>

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `accessibleName:  string | undefined`

<p>Specifies a short string, typically 1 to 3 words, that authors associate
with an element to provide users of assistive technologies with a label
for the element.</p>

**Attribute**: <code>accessible-name</code>

**Default**: <code>undefined</code>

---

### `autocapitalize:  string`

<p>Specifies the auto-capitalization behavior. Same as <a href="https://developer.apple.com/library/content/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/Attributes.html#//apple_ref/doc/uid/TP40008058-autocapitalize">autocapitalize</a>
attribute for <code>input</code> elements. Only supported by Safari and Chrome.</p>

**Attribute**: <code>autocapitalize</code>

**Default**: <code>""</code>

---

### `autocomplete: "on" | "off" | "current-password" | "new-password"`

<p>This attribute indicates whether the value of the control can be
automatically completed by the browser. Same as <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-autocomplete">autocomplete</a>
attribute for <code>input</code> elements.</p>

**Attribute**: <code>autocomplete</code>

**Default**: <code>"off"</code>

---

### `autoFocus:  boolean`

<p>Specifies if the control automatically get focus when the page loads.</p>

**Attribute**: <code>auto-focus</code>

**Default**: <code>false</code>

---

### `autoGrow:  boolean`

<p>This property defines if the control size will grow automatically, to
adjust to its content size.</p>

**Attribute**: <code>auto-grow</code>

**Default**: <code>false</code>

---

### `debounce:  number`

<p>Specifies a debounce for the input event.</p>

**Attribute**: <code>debounce</code>

**Default**: <code>0</code>

---

### `disabled:  boolean`

<p>This attribute lets you specify if the element is disabled.
If disabled, it will not fire any user interaction related event
(for example, click event).</p>

**Attribute**: <code>disabled</code>

**Default**: <code>false</code>

---

### `getImagePathCallback: ((imageSrc: string) => GxImageMultiState | undefined) | undefined`

<p>This property specifies a callback that is executed when the path for an
startImgSrc needs to be resolved.</p>

**Default**: <code>undefined</code>

---

### `hostParts:  string | undefined`

<p>Specifies a set of parts to use in the Host element (<code>ch-edit</code>).</p>

**Attribute**: <code>host-parts</code>

**Default**: <code>undefined</code>

---

### `maxLength: number | undefined`

<p>This property defines the maximum string length that the user can enter
into the control.</p>

**Attribute**: <code>max-length</code>

**Default**: <code>undefined</code>

---

### `mode:  EditInputMode | undefined`

<p>This attribute hints at the type of data that might be entered by the user
while editing the element or its contents. This allows a browser to
display an appropriate virtual keyboard. Only works when
<code>multiline === false</code>.</p>

**Attribute**: <code>mode</code>

**Default**: <code>undefined</code>

---

### `multiline:  boolean`

<p>Controls if the element accepts multiline text.</p>

**Attribute**: <code>multiline</code>

**Default**: <code>false</code>

---

### `name:  string | undefined`

<p>This property specifies the <code>name</code> of the control when used in a form.</p>

**Attribute**: <code>name</code>

**Default**: <code>undefined</code>

---

### `pattern:  string | undefined`

<p>This attribute specifies a regular expression the form control's value
should match. Only works when <code>multiline === false</code>.</p>

**Attribute**: <code>pattern</code>

**Default**: <code>undefined</code>

---

### `picture:  string | undefined`

<p>Specifies a picture to apply for the value of the control. Only works if
not <code>multiline</code>.</p>

**Attribute**: <code>picture</code>

**Default**: <code>undefined</code>

---

### `pictureCallback: ((value: unknown, picture: string) => string) | undefined`

<p>Specifies the callback to execute when the picture must computed for the
new value.</p>

**Default**: <code>undefined</code>

---

### `placeholder:  string | undefined`

<p>A hint to the user of what can be entered in the control. Same as <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-placeholder">placeholder</a>
attribute for <code>input</code> elements.</p>

**Attribute**: <code>placeholder</code>

**Default**: <code>undefined</code>

---

### `preventEnterInInputEditorMode:  boolean`

<p>Specifies whether the ch-edit should prevent the default behavior of the
<code>Enter</code> key when in input editor mode.</p>
<p>In other words, if <code>true</code>, pressing <code>Enter</code> will not submit the form or
trigger the default action of the <code>Enter</code> key in an input field when the
user-edit is in input editor mode.</p>

**Attribute**: <code>prevent-enter-in-input-editor-mode</code>

**Default**: <code>false</code>

---

### `readonly:  boolean`

<p>This attribute indicates that the user cannot modify the value of the control.
Same as <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-readonly">readonly</a>
attribute for <code>input</code> elements.</p>

**Attribute**: <code>readonly</code>

**Default**: <code>false</code>

---

### `showAdditionalContentAfter:  boolean`

<p>If <code>true</code>, a slot is rendered in the edit with <code>&quot;additional-content-after&quot;</code>
name.
This slot is intended to customize the internal content of the edit by
adding additional elements after the edit content.</p>

**Attribute**: <code>show-additional-content-after</code>

**Default**: <code>false</code>

---

### `showAdditionalContentBefore:  boolean`

<p>If <code>true</code>, a slot is rendered in the edit with <code>&quot;additional-content-before&quot;</code>
name.
This slot is intended to customize the internal content of the edit by
adding additional elements before the edit content.</p>

**Attribute**: <code>show-additional-content-before</code>

**Default**: <code>false</code>

---

### `showPassword: boolean`

<p>Specifies if the password is displayed as plain text when using
<code>type = &quot;password&quot;</code>.</p>

**Attribute**: <code>show-password</code>

**Default**: <code>false</code>

---

### `showPasswordButton:  boolean`

<p>Specifies if the show password button is displayed when using
<code>type = &quot;password&quot;</code>.</p>

**Attribute**: <code>show-password-button</code>

**Default**: <code>false</code>

---

### `spellcheck:  boolean`

<p>Specifies whether the element may be checked for spelling errors.</p>

**Attribute**: <code>spellcheck</code>

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

### `translations:  EditTranslations`

<p>Specifies the literals required in the control.</p>

**Default**: <code>{
    accessibleName: {
      clearSearchButton: "Clear search",
      hidePasswordButton: "Hide password",
      showPasswordButton: "Show password"
    }
  }</code>

---

### `type:  EditType`

<p>The type of control to render. A subset of the types supported by the <code>input</code> element is supported:</p>
<ul>
<li><code>&quot;date&quot;</code></li>
<li><code>&quot;datetime-local&quot;</code></li>
<li><code>&quot;email&quot;</code></li>
<li><code>&quot;file&quot;</code></li>
<li><code>&quot;number&quot;</code></li>
<li><code>&quot;password&quot;</code></li>
<li><code>&quot;search&quot;</code></li>
<li><code>&quot;tel&quot;</code></li>
<li><code>&quot;text&quot;</code></li>
<li><code>&quot;url&quot;</code></li>
</ul>

**Attribute**: <code>type</code>

**Default**: <code>"text"</code>

---

### `value:  string | undefined`

<p>The initial value of the control.</p>

**Attribute**: <code>value</code>

**Default**: <code>undefined</code>
</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `change: Event`

<p>The <code>change</code> event is emitted when a change to the element's value is
committed by the user. Unlike the <code>input</code> event, the <code>change</code> event is not
necessarily fired for each change to an element's value but when the
control loses focus.
This event is <em>NOT</em> debounced by the <code>debounce</code> property.</p>

---

### `input: string`

<p>Fired synchronously when the value is changed.
This event is debounced by the <code>debounce</code> property.</p>

---

### `passwordVisibilityChange: boolean`

<p>Fired when the visibility of the password (when using <code>type=&quot;password&quot;</code>)
is changed by clicking on the show password button.</p>
<p>The detail contains the new value of the <code>showPassword</code> property.</p>
</details>

<details open>
  <summary>
  
  ## Slots
  </summary>
  
### `additional-content-before`

<p>The slot used for the additional content when <code>showAdditionalContentBefore === true</code>.</p>

---

### `additional-content-after`

<p>The slot used for the additional content when <code>showAdditionalContentAfter === true</code>.</p>
</details>

<details open>
  <summary>
  
  ## CSS Parts
  </summary>
  
### `date-placeholder`

<p>A placeholder displayed when the control is editable (<code>readonly=&quot;false&quot;</code>), has no value set, and its type is <code>&quot;datetime-local&quot; | &quot;date&quot; | &quot;time&quot;</code>.</p>
</details>
