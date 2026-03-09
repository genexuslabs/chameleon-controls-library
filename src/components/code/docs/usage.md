# ch-code - Usage

## Table of Contents

- [Basic Usage](#basic-usage)
- [Editable Code with Monaco](#editable-code-with-monaco)
- [Side-by-Side Diff](#side-by-side-diff)
- [YAML with Schema Validation](#yaml-with-schema-validation)
- [Do's and Don'ts](#dos-and-donts)

## Basic Usage

Demonstrates displaying a static, read-only code snippet with syntax highlighting.

### HTML

```html
<ch-code
  id="code-block"
  language="typescript"
  value="function greet(name: string): string {
  return `Hello, ${name}!`;
}

const message = greet('World');
console.log(message);"
></ch-code>
```

### JavaScript

```js
const codeBlock = document.querySelector("#code-block");

// Update the code dynamically
codeBlock.value = `interface User {
  id: number;
  name: string;
  email: string;
}

function getUser(id: number): Promise<User> {
  return fetch(\`/api/users/\${id}\`).then(res => res.json());
}`;

// Change the language at runtime
codeBlock.language = "typescript";
```

### Key Points

- The `language` property accepts any valid highlight.js language identifier (e.g., `"typescript"`, `"python"`, `"json"`, `"yaml"`, `"html"`, `"css"`).
- When `language` is `undefined` or empty, the component falls back to `"plaintext"` (no highlighting).
- The code is parsed asynchronously using lowlight, and language grammars are loaded on demand at runtime.
- The component renders a semantic `<code>` element with an `hljs language-{lang}` class.
- The host uses `overflow: auto` for scrollable long code blocks with keyboard-driven scrolling.

## Editable Code with Monaco

Demonstrates a fully-featured code editor powered by the Monaco Editor, with IntelliSense and syntax highlighting.

### HTML

```html
<ch-code-editor
  id="editor"
  language="typescript"
  theme="vs-dark"
  value="function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}"
  style="height: 400px;"
></ch-code-editor>
```

### JavaScript

```js
const editor = document.querySelector("#editor");

// Read the current editor value
function getEditorContent() {
  // Access the Monaco instance via the updateOptions method
  // The value property reflects the current content
  return editor.value;
}

// Update editor content programmatically
editor.value = `class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }

  subtract(a: number, b: number): number {
    return a - b;
  }
}`;

// Change editor options at runtime
editor.updateOptions({
  fontSize: 16,
  minimap: { enabled: false },
  wordWrap: "on"
});

// Switch to read-only mode
editor.readonly = true;
```

### Key Points

- The `language` property is required and accepts any Monaco language ID (e.g., `"typescript"`, `"json"`, `"yaml"`, `"python"`).
- The `theme` property accepts built-in Monaco themes: `"vs"` (light), `"vs-dark"` (dark), `"hc-black"` (high contrast).
- The `options` property passes through to Monaco's `IStandaloneEditorConstructionOptions` for full customization.
- The component uses `shadow: false` (no Shadow DOM), so Monaco's built-in accessibility features are fully available.
- A `ResizeObserver` automatically relayouts the editor when the container size changes.

## Side-by-Side Diff

Demonstrates comparing two versions of code with the Monaco Diff Editor.

### HTML

```html
<ch-code-diff-editor
  id="diff-editor"
  language="typescript"
  theme="vs"
  readonly
  value="function greet(name: string): string {
  return 'Hello, ' + name;
}

function add(a: number, b: number): number {
  return a + b;
}"
  modified-value="function greet(name: string): string {
  return `Hello, ${name}!`;
}

function add(a: number, b: number): number {
  return a + b;
}

function subtract(a: number, b: number): number {
  return a - b;
}"
  style="height: 400px;"
></ch-code-diff-editor>
```

### JavaScript

```js
const diffEditor = document.querySelector("#diff-editor");

// Update the original (left) side
diffEditor.value = "const x = 1;";

// Update the modified (right) side
diffEditor.modifiedValue = "const x = 2;\nconst y = 3;";

// Toggle read-only mode (when false, both panes are editable)
diffEditor.readonly = false;

// Update options at runtime
diffEditor.updateOptions({
  renderSideBySide: false // Switch to inline diff view
});
```

### Key Points

- The `value` property sets the original (left-side) content; `modified-value` sets the modified (right-side) content.
- By default, `readonly` is `true`, making both panes read-only. Set to `false` to enable editing in both panes.
- The `options` property accepts `IDiffEditorConstructionOptions`, including `renderSideBySide` (default `true`) to toggle between side-by-side and inline diff views.
- The `language` property applies the same language mode to both the original and modified models.
- YAML schema validation is supported via `yamlSchemaUri`, which validates both panes against the specified schema.

## YAML with Schema Validation

Demonstrates a YAML editor with remote schema validation for IntelliSense and error diagnostics.

### HTML

```html
<ch-code-editor
  id="yaml-editor"
  language="yaml"
  theme="vs"
  yaml-schema-uri="https://json.schemastore.org/github-workflow.json"
  value="name: CI Pipeline
on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test"
  style="height: 500px;"
></ch-code-editor>
```

### JavaScript

```js
const editor = document.querySelector("#yaml-editor");

// Switch to a different YAML schema at runtime
editor.yamlSchemaUri = "https://json.schemastore.org/prettierrc.json";
editor.value = `semi: false
singleQuote: true
trailingComma: all
tabWidth: 2
printWidth: 80`;

// Disable schema validation by setting an empty URI
editor.yamlSchemaUri = "";
```

### Key Points

- The `yaml-schema-uri` property accepts a URL to a JSON Schema that validates the YAML content and provides IntelliSense suggestions.
- Schema validation only takes effect when `language` is set to `"yaml"`.
- Changing the `yamlSchemaUri` at runtime recreates the editor model to apply the new schema.
- The `configureMonacoYaml` integration enables features like auto-completion, hover documentation, and inline error diagnostics based on the provided schema.
- Both `ch-code-editor` and `ch-code-diff-editor` support the `yamlSchemaUri` property.

## Do's and Don'ts

### Do

- Set properties via JavaScript for complex types (objects, arrays) rather than HTML attributes.

### Don't

- Don't set complex model/items data via HTML attributes — use JavaScript property assignment instead.
- Don't rely on HTML attribute reflection for reading dynamic state — use JavaScript property access.
- Don't manipulate the component's internal Shadow DOM elements directly.
- Don't use `innerHTML` to set component content when properties or slots are available.
