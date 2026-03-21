import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html } from "lit";
import type { Spec } from "@json-render/core";

import "../../../src/components/json-render/json-render.lit";
import type { ComponentRegistry } from "../../../src/components/json-render/types";

import styles from "./json-render-showcase.scss?inline";
import demoStyles from "./json-render-demo-styles.scss?inline";

// ---- Shared computed functions ----
// Passed via `.functions` to ch-json-render instances that need arithmetic or
// boolean logic in their specs (since $state alone is a read, not a transform).
const counterFunctions = {
  inc: (args: Record<string, unknown>) => (args.n as number) + 1,
  dec: (args: Record<string, unknown>) => (args.n as number) - 1,
};

const toggleFunctions = {
  not: (args: Record<string, unknown>) => !args.v,
};

// ---- Shared component registry for all demos ----
// Components render plain semantic HTML so there's no nested shadow DOM to
// pierce when querying from within the preview-box.

const demoRegistry: ComponentRegistry = {
  Stack: ({ children }) =>
    html`<div class="demo-stack">${children}</div>`,

  Row: ({ children }) =>
    html`<div class="demo-row">${children}</div>`,

  Card: ({ element, children }) =>
    html`<div class="demo-card" data-id=${(element.props as any).id ?? ""}>${children}</div>`,

  Heading: ({ element }) =>
    html`<h3 class="demo-heading">${(element.props as any).text}</h3>`,

  Text: ({ element }) =>
    html`<p class="demo-text">${(element.props as any).text}</p>`,

  Counter: ({ element }) =>
    html`<p class="demo-counter">${(element.props as any).value}</p>`,

  Badge: ({ element }) => {
    const variant = (element.props as any).variant ?? "active";
    return html`<span class="demo-badge ${variant}">${(element.props as any).text}</span>`;
  },

  Button: ({ element, emit }) =>
    html`<button
      class="demo-button ${(element.props as any).variant ?? ""}"
      @click=${() => emit("click")}
    >${(element.props as any).label}</button>`,

  DeleteButton: ({ element, emit }) =>
    html`<button class="demo-delete" @click=${() => emit("click")}>
      ${(element.props as any).label ?? "Delete"}
    </button>`,

  Input: ({ element, bindings, setState }) =>
    html`<input
      class="demo-input"
      type="text"
      placeholder=${(element.props as any).placeholder ?? ""}
      .value=${(element.props as any).value ?? ""}
      @input=${(e: InputEvent) => {
        const path = bindings?.value;
        if (path) setState(path, (e.target as HTMLInputElement).value);
      }}
    />`,
};

// ---- Demo specs ----

const SPEC_HELLO: Spec = {
  root: "root",
  elements: {
    root: {
      type: "Stack",
      props: {},
      children: ["heading", "text"]
    },
    heading: {
      type: "Heading",
      props: { text: "Hello, ch-json-render!" },
      children: []
    },
    text: {
      type: "Text",
      props: { text: "This component renders a JSON spec into real UI by delegating to a user-supplied registry." },
      children: []
    }
  }
};

const SPEC_COUNTER: Spec = {
  root: "root",
  state: { count: 0 },
  elements: {
    root: {
      type: "Stack",
      props: {},
      children: ["counter", "row"]
    },
    counter: {
      type: "Counter",
      props: { value: { $state: "/count" } },
      children: []
    },
    row: {
      type: "Row",
      props: {},
      children: ["decBtn", "incBtn"]
    },
    decBtn: {
      type: "Button",
      props: { label: "−", variant: "secondary" },
      on: {
        click: {
          action: "setState",
          params: {
            statePath: "/count",
            value: { $computed: "dec", args: { n: { $state: "/count" } } }
          }
        }
      },
      children: []
    },
    incBtn: {
      type: "Button",
      props: { label: "+" },
      on: {
        click: {
          action: "setState",
          params: {
            statePath: "/count",
            value: { $computed: "inc", args: { n: { $state: "/count" } } }
          }
        }
      },
      children: []
    }
  }
};

const SPEC_VISIBILITY: Spec = {
  root: "root",
  state: { show: false },
  elements: {
    root: {
      type: "Stack",
      props: {},
      children: ["toggleBtn", "badge", "text"]
    },
    toggleBtn: {
      type: "Button",
      props: { label: "Toggle visibility" },
      on: {
        click: {
          action: "setState",
          params: {
            statePath: "/show",
            value: { $computed: "not", args: { v: { $state: "/show" } } }
          }
        }
      },
      children: []
    },
    badge: {
      type: "Badge",
      props: {
        text: { $cond: { $state: "/show" }, $then: "Visible", $else: "Hidden" },
        variant: { $cond: { $state: "/show" }, $then: "active", $else: "inactive" }
      },
      children: []
    },
    text: {
      type: "Text",
      props: { text: "This message is only rendered when visible is true." },
      children: [],
      visible: { $state: "/show" }
    }
  }
};

const SPEC_TODO: Spec = {
  root: "root",
  state: {
    todos: [
      { id: "1", text: "Learn json-render protocol" },
      { id: "2", text: "Build a Kasstor renderer" }
    ],
    draft: ""
  },
  elements: {
    root: {
      type: "Stack",
      props: {},
      children: ["addRow", "list"]
    },
    addRow: {
      type: "Row",
      props: {},
      children: ["input", "addBtn"]
    },
    input: {
      type: "Input",
      props: { value: { $bindState: "/draft" }, placeholder: "New todo…" },
      children: []
    },
    addBtn: {
      type: "Button",
      props: { label: "Add" },
      on: {
        // Two actions fire in sequence: push the new item, then clear the draft.
        click: [
          {
            action: "pushState",
            params: {
              statePath: "/todos",
              value: { id: "$id", text: { $state: "/draft" } }
            }
          },
          {
            action: "setState",
            params: { statePath: "/draft", value: "" }
          }
        ]
      },
      children: []
    },
    list: {
      type: "Stack",
      props: {},
      children: ["item"],
      repeat: { statePath: "/todos", key: "id" }
    },
    item: {
      type: "Card",
      props: { id: { $item: "id" } },
      children: ["itemText", "deleteBtn"]
    },
    itemText: {
      type: "Text",
      props: { text: { $item: "text" } },
      children: []
    },
    deleteBtn: {
      type: "DeleteButton",
      props: { label: "Remove" },
      on: {
        click: {
          action: "removeState",
          params: { statePath: "/todos", index: { $index: true } }
        }
      },
      children: []
    }
  }
};

const SPEC_BINDING: Spec = {
  root: "root",
  state: { name: "", email: "" },
  elements: {
    root: {
      type: "Stack",
      props: {},
      children: ["nameInput", "emailInput", "preview"]
    },
    nameInput: {
      type: "Input",
      props: { value: { $bindState: "/name" }, placeholder: "Your name…" },
      children: []
    },
    emailInput: {
      type: "Input",
      props: { value: { $bindState: "/email" }, placeholder: "Your email…" },
      children: []
    },
    preview: {
      type: "Card",
      props: {},
      children: ["previewName", "previewEmail"]
    },
    previewName: {
      type: "Text",
      props: { text: { $template: "Name: ${/name}" } },
      children: []
    },
    previewEmail: {
      type: "Text",
      props: { text: { $template: "Email: ${/email}" } },
      children: []
    }
  }
};

// ---- Helper to format specs for the code panel ----
function fmt(spec: Spec): string {
  return JSON.stringify(spec, null, 2);
}

// ---- Component ----

@Component({
  styles,
  tag: "showcase-json-render"
})
export class ShowcaseJsonRender extends KasstorElement {
  override render() {
    return html`
      <h1>ch-json-render</h1>
      <p class="page-subtitle">
        Renders AI-generated JSON specs into real UI by delegating to a
        user-supplied component registry. Supports reactive state, conditional
        visibility, list repetition, two-way bindings, and custom actions.
      </p>

      <!-- 1. Hello World -->
      <section class="demo-section">
        <h2>1 — Basic rendering</h2>
        <p>
          A flat map of elements, each with a <code>type</code>, <code>props</code>,
          and <code>children</code> array. The root element key tells the
          renderer where to start.
        </p>
        <div class="demo-grid">
          <div class="preview-box">
            <div class="preview-label">Preview</div>
            <ch-json-render
              .spec=${SPEC_HELLO}
              .registry=${demoRegistry}
              .styleSheet=${demoStyles}
            ></ch-json-render>
          </div>
          <div class="spec-box">
            <pre>${fmt(SPEC_HELLO)}</pre>
          </div>
        </div>
      </section>

      <!-- 2. Counter — reactive state -->
      <section class="demo-section">
        <h2>2 — Reactive state & setState</h2>
        <p>
          The spec carries an initial <code>state</code> object. Props can read
          from it with <code>{ "$state": "/path" }</code>. The built-in
          <code>setState</code> action writes back and triggers a re-render.
        </p>
        <div class="demo-grid">
          <div class="preview-box">
            <div class="preview-label">Preview</div>
            <ch-json-render
              .spec=${SPEC_COUNTER}
              .registry=${demoRegistry}
              .functions=${counterFunctions}
              .styleSheet=${demoStyles}
            ></ch-json-render>
          </div>
          <div class="spec-box">
            <pre>${fmt(SPEC_COUNTER)}</pre>
          </div>
        </div>
      </section>

      <!-- 3. Visibility -->
      <section class="demo-section">
        <h2>3 — Conditional visibility</h2>
        <p>
          The <code>visible</code> field on any element accepts a boolean, a
          <code>{ "$state": "/path" }</code> condition, or compound
          <code>$and</code>/<code>$or</code> expressions.
        </p>
        <div class="demo-grid">
          <div class="preview-box">
            <div class="preview-label">Preview</div>
            <ch-json-render
              .spec=${SPEC_VISIBILITY}
              .registry=${demoRegistry}
              .functions=${toggleFunctions}
              .styleSheet=${demoStyles}
            ></ch-json-render>
          </div>
          <div class="spec-box">
            <pre>${fmt(SPEC_VISIBILITY)}</pre>
          </div>
        </div>
      </section>

      <!-- 4. Todo list — repeat + pushState + removeState -->
      <section class="demo-section">
        <h2>4 — Repeat, pushState & removeState</h2>
        <p>
          <code>repeat: { statePath, key }</code> renders an element once per
          item in a state array. <code>pushState</code> appends,
          <code>removeState</code> splices by <code>{ "$index": true }</code>.
        </p>
        <div class="demo-grid">
          <div class="preview-box">
            <div class="preview-label">Preview</div>
            <ch-json-render
              .spec=${SPEC_TODO}
              .registry=${demoRegistry}
              .styleSheet=${demoStyles}
            ></ch-json-render>
          </div>
          <div class="spec-box">
            <pre>${fmt(SPEC_TODO)}</pre>
          </div>
        </div>
      </section>

      <!-- 5. Two-way binding -->
      <section class="demo-section">
        <h2>5 — Two-way binding & $template</h2>
        <p>
          <code>{ "$bindState": "/path" }</code> resolves to the current value
          AND exposes the write-back path in <code>bindings</code>. Components
          call <code>setState(bindings.value, newValue)</code> to commit.
          <code>{ "$template": "Hello \${/name}" }</code> interpolates state
          paths inline.
        </p>
        <div class="demo-grid">
          <div class="preview-box">
            <div class="preview-label">Preview</div>
            <ch-json-render
              .spec=${SPEC_BINDING}
              .registry=${demoRegistry}
              .styleSheet=${demoStyles}
            ></ch-json-render>
          </div>
          <div class="spec-box">
            <pre>${fmt(SPEC_BINDING)}</pre>
          </div>
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-json-render": ShowcaseJsonRender;
  }
}
