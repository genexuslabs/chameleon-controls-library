# `ch-json-render`

<details open>
  <summary>
  
  ## Properties
  </summary>
  
### `spec:  Spec | null`

<p>The JSON spec describing the UI tree to render.</p>

**Default**: <code>null</code>

---

### `registry:  ComponentRegistry`

<p>Registry mapping element type names to renderer functions.</p>

**Default**: <code>{}</code>

---

### `store:  StateStore | undefined`

<p>External state store (controlled mode).
When absent, an internal store seeded from <code>spec.state</code> is used.</p>

**Default**: <code>undefined</code>

---

### `functions:  Record<string, ComputedFunction>`

<p>Named functions available for <code>$computed</code> prop expressions.</p>

**Default**: <code>{}</code>

---

### `loading: any`

<p>When true, each renderer receives <code>loading: true</code> (e.g. during streaming).</p>

**Attribute**: <code>loading</code>

**Default**: <code>false</code>

---

### `fallback:  ComponentRenderer | undefined`

<p>Fallback renderer used when an element type is not in the registry.
Useful for showing a skeleton while the registry is being built.</p>

**Default**: <code>undefined</code>

---

### `styleSheet:  string`

<p>Optional CSS string adopted into the component's shadow root.
Use this to style elements rendered by the registry, which live inside
the shadow DOM and cannot be styled from outside.</p>

**Default**: <code>""</code>

---

### `onAction: ((name: string, params?: Record<string, unknown>, setState?: (path: string, value: unknown) => void, getState?: () => StateModel) => void | Promise<void>) | undefined`

<p>Handler for custom (non-built-in) actions.
Receives the action name, resolved params, a setState helper, and a
getState snapshot function.</p>

**Default**: <code>undefined</code>
</details>
