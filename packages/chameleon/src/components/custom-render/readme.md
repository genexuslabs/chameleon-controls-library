# `ch-custom-render`

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `content: TemplateResult | undefined | null | typeof nothing | string`

<p>Content rendered inside this element's shadow root.</p>

**Default**: <code>undefined</code>

---

### `exportParts:  string | undefined`

<p>Parts to be re-exported from this element.</p>

**Attribute**: <code>exportparts</code>

**Default**: <code>undefined</code>

---

### `theme:  string | undefined`

<p>Theme CSS scoped to this element's shadow root. Two complementary
mechanisms apply it depending on the render mode:</p>
<ul>
<li>
<p><strong>SSR</strong>: the source string is shipped inside an inline <code>&lt;style&gt;</code> tag.
<code>CSSStyleSheet</code> does not exist in Node, and the only way to get styles
into the server-rendered HTML is for them to be part of the serialized
markup.  guarantees this branch is the one
emitted on the server.</p>
</li>
<li>
<p><strong>Client hydration</strong>: the SSR-emitted <code>&lt;style&gt;</code> is kept in the DOM
until 's post-hydration microtask swaps it for
<code>nothing</code>, removing the inline tag without a hydration mismatch. By
that point <code>connectedCallback</code> has already adopted the constructable
stylesheet, so styling stays continuous.</p>
</li>
<li>
<p><strong>Runtime (browser)</strong>: the same string is adopted as a <code>CSSStyleSheet</code>
on the shadow root via <code>addStyleSheet</code>. Instances that share the same
source string share the same <code>CSSStyleSheet</code> (deduped via
); reference-counted add/remove keeps the count
accurate when several elements come and go.</p>
</li>
</ul>
<p>Supported transitions (resolved by #syncAdoptedSheet):</p>
<ul>
<li><code>undefined → &quot;css&quot;</code>: adopt the sheet.</li>
<li><code>&quot;a&quot; → &quot;b&quot;</code>:        remove &quot;a&quot;, adopt &quot;b&quot;.</li>
<li><code>&quot;css&quot; → undefined</code>: remove the sheet.</li>
<li>same value:          no-op.</li>
</ul>
<p>Adoption is also synchronized with the element's connection state. The
sheet is removed in <code>disconnectedCallback</code> and re-adopted in
<code>connectedCallback</code>, so a DOM move (which fires disconnect + connect
synchronously) leaves the refcount balanced — and a reconnection after
a theme change while detached re-adopts the new value, not the stale one.</p>
<p>Adoption is a no-op on the server (<code>CSSStyleSheet</code> does not exist there).</p>

**Default**: <code>undefined</code>
</details>
