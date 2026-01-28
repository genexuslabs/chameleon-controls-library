# `ch-theme`

<p>It allows you to load a style sheet in a similar way to the
native LINK or STYLE tags, but assigning it a name so that
it can be reused in different contexts,
either in the Document or in a Shadow-Root.</p>

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `attachStyleSheets:  boolean`

<p>Indicates whether the theme should be attached to the Document or
the ShadowRoot after loading.
The value can be overridden by the <code>attachStyleSheet</code> property of the model.</p>

**Attribute**: <code>attachstylesheets</code>

**Default**: <code>true</code>

---

### `avoidFlashOfUnstyledContent:  boolean`

<p><code>true</code> to visually hide the contents of the root node while the control's
style is not loaded.</p>

**Attribute**: <code>avoidflashofunstyledcontent</code>

**Default**: <code>true</code>

---

### `hidden:  boolean`

<p>Specifies an accessor for the attribute <code>hidden</code> of the <code>ch-theme</code>. This
accessor is useful for SSR scenarios were the DOM is shimmed and we don't
have access to is limited (since Lit does not provide the Host declarative
component), so we have to find a way to reflect the hidden property in the
<code>ch-theme</code> tag.</p>
<p>Without this accessor, the initial load in SSR scenarios would flicker.</p>

**Attribute**: <code>hidden</code>

**Default**: <code>false</code>

---

### `model:  ThemeModel | undefined | null`

<p>Specify themes to load</p>

**Default**: <code>undefined</code>

---

### `timeout: any`

<p>Specifies the time to wait for the requested theme to load.</p>

**Attribute**: <code>timeout</code>

**Default**: <code>10000</code>
</details>

<details open>
  <summary>
  
  ## Events
  </summary>
  
### `themeLoaded: ChThemeLoadedEvent`

<p>Event emitted when the theme has successfully loaded</p>
</details>
