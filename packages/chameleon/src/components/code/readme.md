# `ch-code`

<p>A control to highlight code blocks.</p>
<ul>
<li>
<p>It supports code highlight by parsing the incoming code string to <a href="https://github.com/syntax-tree/hast">hast</a> using <a href="https://shiki.matsu.io">Shiki</a>. After that, it implements a reactivity layer by implementing its own render for the hast.</p>
</li>
<li>
<p>It also supports all programming languages from <a href="https://shiki.matsu.io">Shiki.js</a>.</p>
</li>
<li>
<p>When the code highlighting is needed at runtime, the control will load on demand the code parser and the programming language needed to parse the code.</p>
</li>
</ul>

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `language:  string | undefined`

<p>Specifies the code language to highlight.</p>

**Attribute**: <code>language</code>

**Default**: <code>"txt"</code>

---

### `lastNestedChildClass:  string`

**Attribute**: <code>lastnestedchildclass</code>

**Default**: <code>"last-nested-child"</code>

---

### `showIndicator:  boolean`

<p>Specifies if an indicator is displayed in the last element rendered.
Useful for streaming scenarios where a loading indicator is needed.</p>

**Attribute**: <code>show-indicator</code>

**Default**: <code>false</code>

---

### `value:  string | undefined`

<p>Specifies the code string to highlight.</p>

**Attribute**: <code>value</code>

**Default**: <code>undefined</code>
</details>
