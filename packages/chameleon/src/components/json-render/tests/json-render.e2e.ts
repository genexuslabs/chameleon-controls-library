import { html } from "lit";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { Spec } from "@json-render/core";

import "../json-render.lit";
import type { ComponentRegistry } from "../types";

// ---- Test component renderers (plain HTML, no nested shadow DOM) ----
const testRegistry: ComponentRegistry = {
  Container: ({ element, children, loading }) => html`
    <div
      class="test-container"
      data-title=${(element.props as any).title ?? ""}
      data-loading=${loading ?? false}
    >
      ${children}
    </div>
  `,
  Text: ({ element }) => html`
    <span class="test-text">${(element.props as any).text}</span>
  `,
  Button: ({ element, emit }) => html`
    <button
      class="test-button"
      @click=${() => emit("click")}
      ?disabled=${(element.props as any).disabled}
    >
      ${(element.props as any).label}
    </button>
  `,
  Input: ({ element, bindings, setState }) => html`
    <input
      class="test-input"
      .value=${(element.props as any).value ?? ""}
      @input=${(e: InputEvent) => {
        const path = bindings?.value;
        if (path) setState(path, (e.target as HTMLInputElement).value);
      }}
    />
  `,
};

function getHost(container: HTMLElement) {
  const host = container.querySelector("ch-json-render") as any;
  return { host, root: host?.shadowRoot ?? host };
}

async function mountRenderer(
  spec: Spec | null,
  options: { loading?: boolean; registry?: ComponentRegistry } = {}
) {
  const registry = options.registry ?? testRegistry;
  const result = render(html`
    <ch-json-render
      .spec=${spec}
      .registry=${registry}
      ?loading=${options.loading ?? false}
    ></ch-json-render>
  `);
  const { host } = getHost(result.container);
  if (host) await host.updateComplete;
  return { container: result.container, ...getHost(result.container) };
}

afterEach(cleanup);

// ---- Tests matching @json-render/svelte renderer.test.ts ----

describe("[ch-json-render] Rendering", () => {
  it("renders nothing for null spec", async () => {
    const { root } = await mountRenderer(null);
    expect(root.querySelector(".test-container")).toBeNull();
    expect(root.querySelector(".test-text")).toBeNull();
  });

  it("renders nothing for spec with empty root", async () => {
    const { root } = await mountRenderer({ root: "", elements: {} });
    expect(root.querySelector(".test-container")).toBeNull();
  });

  it("renders a single element", async () => {
    const spec: Spec = {
      root: "text1",
      elements: {
        text1: { type: "Text", props: { text: "Hello World" }, children: [] },
      },
    };
    const { root } = await mountRenderer(spec);
    const el = root.querySelector(".test-text");
    expect(el).not.toBeNull();
    expect(el?.textContent).toBe("Hello World");
  });

  it("renders nested elements", async () => {
    const spec: Spec = {
      root: "container",
      elements: {
        container: {
          type: "Container",
          props: { title: "Root" },
          children: ["text1", "text2"],
        },
        text1: { type: "Text", props: { text: "First" }, children: [] },
        text2: { type: "Text", props: { text: "Second" }, children: [] },
      },
    };
    const { root } = await mountRenderer(spec);
    const texts = root.querySelectorAll(".test-text");
    expect(texts).toHaveLength(2);
    expect(texts[0]?.textContent).toBe("First");
    expect(texts[1]?.textContent).toBe("Second");
  });

  it("renders deeply nested elements", async () => {
    const spec: Spec = {
      root: "outer",
      elements: {
        outer: {
          type: "Container",
          props: { title: "Outer" },
          children: ["inner"],
        },
        inner: {
          type: "Container",
          props: { title: "Inner" },
          children: ["text"],
        },
        text: { type: "Text", props: { text: "Deep" }, children: [] },
      },
    };
    const { root } = await mountRenderer(spec);
    expect(root.querySelectorAll(".test-container")).toHaveLength(2);
    expect(root.querySelector(".test-text")?.textContent).toBe("Deep");
  });

  it("passes loading prop to components", async () => {
    const spec: Spec = {
      root: "c",
      elements: { c: { type: "Container", props: {}, children: [] } },
    };
    const { root } = await mountRenderer(spec, { loading: true });
    expect(
      root.querySelector(".test-container")?.getAttribute("data-loading")
    ).toBe("true");
  });

  it("renders nothing for unknown component types when no fallback", async () => {
    const spec: Spec = {
      root: "x",
      elements: { x: { type: "UnknownType", props: {}, children: [] } },
    };
    const { root } = await mountRenderer(spec);
    expect(root.querySelector(".test-container")).toBeNull();
  });

  it("skips missing child elements gracefully", async () => {
    const spec: Spec = {
      root: "c",
      elements: {
        c: {
          type: "Container",
          props: {},
          children: ["exists", "missing"],
        },
        exists: { type: "Text", props: { text: "I exist" }, children: [] },
      },
    };
    const { root } = await mountRenderer(spec);
    const texts = root.querySelectorAll(".test-text");
    expect(texts).toHaveLength(1);
    expect(texts[0]?.textContent).toBe("I exist");
  });
});

// ---- Additional tests beyond the upstream suite ----

describe("[ch-json-render] State resolution", () => {
  it("resolves $state in props", async () => {
    const spec: Spec = {
      root: "text",
      elements: {
        text: {
          type: "Text",
          props: { text: { $state: "/greeting" } },
          children: [],
        },
      },
      state: { greeting: "Hello from state" },
    };
    const { root } = await mountRenderer(spec);
    expect(root.querySelector(".test-text")?.textContent).toBe(
      "Hello from state"
    );
  });

  it("updates the DOM when state changes via setState action", async () => {
    const spec: Spec = {
      root: "c",
      elements: {
        c: { type: "Container", props: {}, children: ["text", "btn"] },
        text: {
          type: "Text",
          props: { text: { $state: "/count" } },
          children: [],
        },
        btn: {
          type: "Button",
          props: { label: "Increment" },
          on: {
            click: { action: "setState", params: { statePath: "/count", value: 42 } },
          },
          children: [],
        },
      },
      state: { count: 0 },
    };
    const { host, root } = await mountRenderer(spec);
    expect(root.querySelector(".test-text")?.textContent).toBe("0");
    root.querySelector<HTMLButtonElement>(".test-button")!.click();
    await host.updateComplete;
    expect(root.querySelector(".test-text")?.textContent).toBe("42");
  });
});

describe("[ch-json-render] Visibility", () => {
  it("hides elements when visibility condition is false", async () => {
    const spec: Spec = {
      root: "c",
      elements: {
        c: { type: "Container", props: {}, children: ["text"] },
        text: {
          type: "Text",
          props: { text: "Hidden" },
          children: [],
          visible: { $state: "/show" },
        },
      },
      state: { show: false },
    };
    const { root } = await mountRenderer(spec);
    expect(root.querySelector(".test-text")).toBeNull();
  });

  it("shows elements when visibility condition becomes true", async () => {
    const spec: Spec = {
      root: "c",
      elements: {
        c: { type: "Container", props: {}, children: ["text", "btn"] },
        text: {
          type: "Text",
          props: { text: "Revealed" },
          children: [],
          visible: { $state: "/show" },
        },
        btn: {
          type: "Button",
          props: { label: "Show" },
          on: {
            click: { action: "setState", params: { statePath: "/show", value: true } },
          },
          children: [],
        },
      },
      state: { show: false },
    };
    const { host, root } = await mountRenderer(spec);
    expect(root.querySelector(".test-text")).toBeNull();
    root.querySelector<HTMLButtonElement>(".test-button")!.click();
    await host.updateComplete;
    expect(root.querySelector(".test-text")).not.toBeNull();
  });
});

describe("[ch-json-render] Repeat", () => {
  it("renders one element per item in the state array", async () => {
    const spec: Spec = {
      root: "c",
      elements: {
        c: {
          type: "Container",
          props: {},
          children: ["item"],
          repeat: { statePath: "/items" },
        },
        item: {
          type: "Text",
          props: { text: { $item: "label" } },
          children: [],
        },
      },
      state: { items: [{ label: "A" }, { label: "B" }, { label: "C" }] },
    };
    const { root } = await mountRenderer(spec);
    const texts = root.querySelectorAll(".test-text");
    expect(texts).toHaveLength(3);
    expect(Array.from(texts).map(el => el.textContent)).toEqual([
      "A",
      "B",
      "C",
    ]);
  });

  it("removes items from DOM when removeState action is used", async () => {
    const spec: Spec = {
      root: "c",
      elements: {
        c: {
          type: "Container",
          props: {},
          children: ["item"],
          repeat: { statePath: "/items" },
        },
        item: {
          type: "Button",
          props: { label: { $item: "label" } },
          on: {
            click: {
              action: "removeState",
              params: { statePath: "/items", index: { $index: true } },
            },
          },
          children: [],
        },
      },
      state: { items: [{ label: "X" }, { label: "Y" }] },
    };
    const { host, root } = await mountRenderer(spec);
    expect(root.querySelectorAll(".test-button")).toHaveLength(2);
    root.querySelectorAll<HTMLButtonElement>(".test-button")[0]!.click();
    await host.updateComplete;
    expect(root.querySelectorAll(".test-button")).toHaveLength(1);
    expect(
      root.querySelector(".test-button")?.textContent?.trim()
    ).toBe("Y");
  });
});

describe("[ch-json-render] Two-way binding", () => {
  it("updates state via $bindState and re-renders", async () => {
    const spec: Spec = {
      root: "c",
      elements: {
        c: { type: "Container", props: {}, children: ["input", "text"] },
        input: {
          type: "Input",
          props: { value: { $bindState: "/name" } },
          children: [],
        },
        text: {
          type: "Text",
          props: { text: { $state: "/name" } },
          children: [],
        },
      },
      state: { name: "initial" },
    };
    const { host, root } = await mountRenderer(spec);
    expect(root.querySelector(".test-text")?.textContent).toBe("initial");

    const input = root.querySelector<HTMLInputElement>(".test-input")!;
    input.value = "updated";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await host.updateComplete;

    expect(root.querySelector(".test-text")?.textContent).toBe("updated");
  });
});

describe("[ch-json-render] Custom actions", () => {
  it("calls onAction for non-built-in actions", async () => {
    const onAction = vi.fn();
    const spec: Spec = {
      root: "btn",
      elements: {
        btn: {
          type: "Button",
          props: { label: "Go" },
          on: { click: { action: "navigate", params: { url: "/home" } } },
          children: [],
        },
      },
    };
    const { host, root } = await mountRenderer(spec, {
      registry: { ...testRegistry },
    });
    (host as any).onAction = onAction;
    root.querySelector<HTMLButtonElement>(".test-button")!.click();
    await host.updateComplete;
    expect(onAction).toHaveBeenCalledWith(
      "navigate",
      { url: "/home" },
      expect.any(Function),
      expect.any(Function)
    );
  });
});
