import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChameleonControls } from "../../../typings/chameleon-components";

import "../breadcrumb-render.lit";
import "../internal/breadcrumb-item/breadcrumb-item.lit";

const mod = [
  { id: "1", caption: "item a", link: { url: "/components/breadcrumb" } },
  {
    id: "2",
    caption: "item b",
    link: { url: "/components/navigation-list" }
  }
];

let breadcrumb!: ChameleonControls;
let container: HTMLElement;

beforeEach(async () => {
  document.body.innerHTML = "";
  const result = await render(
    html`<ch-breadcrumb-render .model=${mod}></ch-breadcrumb-render>`
  );

  container = result.container;
  breadcrumb = container.querySelector("ch-breadcrumb-render");
  await (breadcrumb as any).updateComplete;
});

afterEach(cleanup);

describe("[Breadcrumb - Structure]", () => {
  it("should have role navigation", () => {
    expect(breadcrumb.getAttribute("role")).toBe("navigation");
  });

  it("should render ol element", () => {
    expect(breadcrumb.shadowRoot!.querySelector("ol")).toBeTruthy();
  });

  it("should render correct number of items", () => {
    const items = breadcrumb
      .shadowRoot!.querySelector("ol")
      ?.querySelectorAll("ch-breadcrumb-item");
    expect(items?.length).toBe(2);
  });

  it("should render separators between items", () => {
    const separators = breadcrumb.shadowRoot!.querySelectorAll(".separator");
    expect(separators.length).toBe(1);
  });

  it("should not render separator after last item", () => {
    const ol = breadcrumb.shadowRoot!.querySelector("ol");
    const lastSeparator = ol?.querySelector(
      "ch-breadcrumb-item:last-of-type + .separator"
    );
    expect(lastSeparator).toBeNull();
  });
});

describe("[Breadcrumb Item - Structure]", () => {
  it("should have role listitem", () => {
    const item = breadcrumb
      .shadowRoot!.querySelector("ol")
      ?.querySelector("ch-breadcrumb-item");
    expect(item?.getAttribute("role")).toBe("listitem");
  });
  it("should render anchor element for items with link", async () => {
    const item = breadcrumb
      .shadowRoot!.querySelector("ol")
      ?.querySelector("ch-breadcrumb-item");

    await (item as any)?.updateComplete;
    expect(item?.shadowRoot?.querySelector("a")).toBeTruthy();
  });
  it("should render button element for items without link", async () => {
    cleanup();
    const buttonModel = [{ id: "1", caption: "button item" }];
    const result = await render(
      html`<ch-breadcrumb-render .model=${buttonModel}></ch-breadcrumb-render>`
    );
    const bc = result.container.querySelector("ch-breadcrumb-render");
    await (bc as any).updateComplete;

    const item = bc?.shadowRoot?.querySelector("ch-breadcrumb-item");
    await (item as any)?.updateComplete;
    expect(item?.shadowRoot?.querySelector("button")).toBeTruthy();
  });
  it("should render caption in span element", async () => {
    const item = breadcrumb
      .shadowRoot!.querySelector("ol")
      ?.querySelector("ch-breadcrumb-item");
    await (item as any)?.updateComplete;
    const caption = item?.shadowRoot?.querySelector("span.caption");

    expect(caption?.textContent?.trim()).toBe("item a");
  });
});

describe("[Breadcrumb - Custom Separator]", () => {
  it("should use custom separator", async () => {
    cleanup();

    const result = await render(
      html`<ch-breadcrumb-render
        .model=${mod}
        .separator=${">"}
      ></ch-breadcrumb-render>`
    );

    const bc = result.container.querySelector("ch-breadcrumb-render");
    await (bc as any).updateComplete;

    const separator = bc?.shadowRoot!.querySelector(".separator");
    expect(separator?.textContent).toBe(">");
  });

  it("should use default separator when not specified", () => {
    const separator = breadcrumb?.shadowRoot!.querySelector(".separator");
    expect(separator?.textContent).toBe("/");
  });
});

describe("[Breadcrumb - Accessibility]", () => {
  it("should set aria-label when accessibleName is provided", async () => {
    cleanup();
    const result = await render(
      html`<ch-breadcrumb-render
        .model=${mod}
        accessible-name="Site Navigation"
      ></ch-breadcrumb-render>`
    );
    const bc = result.container.querySelector("ch-breadcrumb-render");
    await (bc as any).updateComplete;

    expect(bc?.getAttribute("aria-label")).toBe("Site Navigation");
  });
  it("should set aria-current on selected link", async () => {
    cleanup();
    const selectedModel = [
      { id: "1", caption: "Home", link: { url: "/home" } }
    ];
    const result = await render(
      html`<ch-breadcrumb-render
        .model=${selectedModel}
        .selectedLink=${{ id: "1", link: { url: "/home" } }}
      ></ch-breadcrumb-render>`
    );
    const bc = result.container.querySelector("ch-breadcrumb-render");
    await (bc as any).updateComplete;

    const item = bc?.shadowRoot?.querySelector("ch-breadcrumb-item");
    await (item as any)?.updateComplete;

    const anchor = item?.shadowRoot?.querySelector("a");
    expect(anchor?.getAttribute("aria-current")).toBe("page");
  });
  it("should set aria-disabled on disabled items", async () => {
    cleanup();
    const disabledModel = [
      { id: "1", caption: "Disabled", link: { url: "/test" }, disabled: true }
    ];
    const result = await render(
      html`<ch-breadcrumb-render
        .model=${disabledModel}
      ></ch-breadcrumb-render>`
    );
    const bc = result.container.querySelector("ch-breadcrumb-render");
    await (bc as any).updateComplete;

    const item = bc?.shadowRoot?.querySelector("ch-breadcrumb-item");
    await (item as any)?.updateComplete;

    const anchor = item?.shadowRoot?.querySelector("a");
    expect(anchor?.getAttribute("aria-disabled")).toBe("true");
  });
});

describe("[Breadcrumb - Disabled State]", () => {
  it("should not have href when disabled", async () => {
    cleanup();
    const disabledModel = [
      { id: "1", caption: "Disabled", link: { url: "/test" }, disabled: true }
    ];
    const result = await render(
      html`<ch-breadcrumb-render
        .model=${disabledModel}
      ></ch-breadcrumb-render>`
    );
    const bc = result.container.querySelector("ch-breadcrumb-render");
    await (bc as any).updateComplete;

    const item = bc?.shadowRoot?.querySelector("ch-breadcrumb-item");
    await (item as any)?.updateComplete;
    const anchor = item?.shadowRoot?.querySelector("a");
    expect(anchor?.hasAttribute("href")).toBe(false);
  });
  it("should disable button when disabled", async () => {
    cleanup();
    const disabledModel = [{ id: "1", caption: "Disabled", disabled: true }];
    const result = await render(
      html`<ch-breadcrumb-render
        .model=${disabledModel}
      ></ch-breadcrumb-render>`
    );
    const bc = result.container.querySelector("ch-breadcrumb-render");
    await (bc as any).updateComplete;

    const item = bc?.shadowRoot?.querySelector("ch-breadcrumb-item");
    await (item as any)?.updateComplete;

    const button = item?.shadowRoot?.querySelector("button");
    expect(button?.disabled).toBe(true);
  });
});

describe("[Breadcrumb - Events]", () => {
  it("should emit hyperlinkClick when clicking a link", async () => {
    const handler = vi.fn((e: Event) => e.preventDefault());
    breadcrumb.addEventListener("hyperlinkClick", handler);

    const item = breadcrumb
      .shadowRoot!.querySelector("ol")
      ?.querySelector("ch-breadcrumb-item");

    await (item as any)?.updateComplete;
    const anchor = item?.shadowRoot?.querySelector("a");
    anchor?.click();

    await (breadcrumb as any).updateComplete;

    expect(handler).toHaveBeenCalled();
  });

  it("should emit buttonClick when clicking a button", async () => {
    cleanup();
    const buttonModel = [{ id: "1", caption: "button item" }];
    const result = await render(
      html`<ch-breadcrumb-render .model=${buttonModel}></ch-breadcrumb-render>`
    );
    const bc = result.container.querySelector("ch-breadcrumb-render");
    await (bc as any).updateComplete;

    const handler = vi.fn();

    bc?.addEventListener("buttonClick", handler);

    const item = bc?.shadowRoot?.querySelector("ch-breadcrumb-item");
    await (item as any)?.updateComplete;
    const button = item?.shadowRoot?.querySelector("button");
    button?.click();

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(handler).toHaveBeenCalled();
  });

  it(
    "should update selectedLink when clicking a hyperlink",
    { timeout: 5000 },
    async () => {
      const item = breadcrumb
        .shadowRoot!.querySelector("ol")
        ?.querySelector("ch-breadcrumb-item");

      await (item as any)?.updateComplete;

      const anchor = item?.shadowRoot?.querySelector("a") as HTMLAnchorElement;

      anchor.addEventListener("click", e => {
        e.preventDefault();
      });

      anchor.click();
      await (breadcrumb as any).updateComplete;

      expect((breadcrumb as any).selectedLink).toEqual({
        id: "1",
        link: { url: "/components/breadcrumb" }
      });
    }
  );

  it("should prevent default when hyperlinkClick is prevented", async () => {
    const handler = vi.fn((e: Event) => e.preventDefault());
    breadcrumb.addEventListener("hyperlinkClick", handler);

    const item = breadcrumb
      .shadowRoot!.querySelector("ol")
      ?.querySelector("ch-breadcrumb-item");
    const anchor = item?.shadowRoot?.querySelector("a");

    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      composed: true
    });
    const defaultPrevented = !anchor?.dispatchEvent(clickEvent);

    expect(defaultPrevented).toBe(true);
  });
});

describe("[Breadcrumb - Selected Link]", () => {
  it("should mark item as selected when matching selectedLink", async () => {
    cleanup();
    const result = await render(
      html`<ch-breadcrumb-render
        .model=${mod}
        .selectedLink=${{ id: "1", link: { url: "/components/breadcrumb" } }}
      ></ch-breadcrumb-render>`
    );
    const bc = result.container.querySelector("ch-breadcrumb-render");
    await (bc as any).updateComplete;

    const item = bc?.shadowRoot?.querySelector("ch-breadcrumb-item");
    expect((item as any).selected).toBe(true);
  });
  it("should not mark item as selected when not matching selectedLink", async () => {
    cleanup();
    const result = await render(
      html`<ch-breadcrumb-render
        .model=${mod}
        .selectedLink=${{
          id: "2",
          link: { url: "/components/navigation-list" }
        }}
      ></ch-breadcrumb-render>`
    );
    const bc = result.container.querySelector("ch-breadcrumb-render");
    await (bc as any).updateComplete;

    const item = bc?.shadowRoot?.querySelector("ch-breadcrumb-item");
    expect((item as any).selected).toBe(false);
  });
});

describe("[Breadcrumb - Empty Model]", () => {
  it("should render nothing when model is undefined", async () => {
    cleanup();
    const result = await render(
      html`<ch-breadcrumb-render></ch-breadcrumb-render>`
    );
    const bc = result.container.querySelector("ch-breadcrumb-render");
    await (bc as any).updateComplete;

    expect(bc?.shadowRoot?.querySelector("ol")).toBeNull();
  });

  it("should render empty ol when model is empty array", async () => {
    cleanup();
    const result = await render(
      html`<ch-breadcrumb-render .model=${[]}></ch-breadcrumb-render>`
    );
    const bc = result.container.querySelector("ch-breadcrumb-render");
    await (bc as any).updateComplete;

    const ol = bc?.shadowRoot?.querySelector("ol");
    expect(ol).toBeTruthy();
    expect(ol?.querySelectorAll("ch-breadcrumb-item").length).toBe(0);
  });
});
