# `ch-image`

<p>A control to display multiple images, depending on the state (focus, hover,
active or disabled) of a parent element.</p>

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `containerRef:  HTMLElement | undefined`

<p>Specifies a reference for the container, in order to update the state of
the icon. The reference must be an ancestor of the control.
If not specified, the direct parent reference will be used.</p>

**Default**: <code>undefined</code>

---

### `disabled:  boolean | undefined`

<p>Specifies if the icon is disabled.</p>

**Attribute**: <code>disabled</code>

**Default**: <code>false</code>

---

### `getImagePathCallback: GetImagePathCallback | undefined`

<p>This property specifies a callback that is executed when the path the
image needs to be resolved.</p>

**Default**: <code>undefined</code>

---

### `src:  string | unknown | undefined`

<p>Specifies the src for the image.</p>

**Default**: <code>undefined</code>

---

### `styles:  string | undefined`

<p>Specifies an accessor for the attribute style of the ch-image. This
accessor is useful for SSR scenarios were the Host access is limited
(since Lit does not provide the Host declarative component).</p>
<p>Without this accessor, the initial load in SSR scenarios would flicker.</p>

**Attribute**: <code>style</code>

**Default**: <code>undefined</code>

---

### `type: Exclude<ImageRender, "img"> | undefined`

<p>Specifies how the image will be rendered.</p>

**Attribute**: <code>type</code>

**Default**: <code>"background"</code>
</details>
