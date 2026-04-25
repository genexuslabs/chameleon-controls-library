import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChameleonControls } from "../../../typings/chameleon-components";
import type { NavigationListModel } from "../types";

import "../navigation-list-render.lit";
import "../internal/navigation-list-item/navigation-list-item.lit";

const buildModel = (): NavigationListModel => [
  {
    id: "home",
    caption: "Home",
    link: { url: "/home" }
  },
  {
    id: "components",
    caption: "Components",
    expanded: true,
    items: [
      {
        id: "components-breadcrumb",
        caption: "Breadcrumb",
        link: { url: "/components/breadcrumb" }
      },
      {
        id: "components-navigation-list",
        caption: "Navigation List",
        link: { url: "/components/navigation-list" }
      }
    ]
  }
];

let navigationList!: ChameleonControls["ch-navigation-list-render"];
let container: HTMLElement;

const findItem = (id: string) =>
  navigationList.shadowRoot!.querySelector<HTMLElement>(
    `ch-navigation-list-item#${id}`
  ) ??
  navigationList.querySelector<HTMLElement>(`ch-navigation-list-item#${id}`);

beforeEach(async () => {
  document.body.innerHTML = "";
  const result = await render(
    html`<ch-navigation-list-render
      .model=${buildModel()}
    ></ch-navigation-list-render>`
  );

  container = result.container;
  navigationList = container.querySelector("ch-navigation-list-render")!;
  await navigationList.updateComplete;
});

afterEach(cleanup);

describe("[ch-navigation-list-render][selectedLink][type]", () => {
  it("should default to undefined", () => {
    expect(navigationList.selectedLink).toBeUndefined();
  });

  it("should accept a string id as selectedLink", async () => {
    navigationList.selectedLink = "home";
    await navigationList.updateComplete;

    expect(navigationList.selectedLink).toBe("home");
  });

  it("should be readable as the 'selected-link' attribute", async () => {
    cleanup();
    const result = await render(
      html`<ch-navigation-list-render
        selected-link="home"
        .model=${buildModel()}
      ></ch-navigation-list-render>`
    );

    const nav = result.container.querySelector("ch-navigation-list-render")!;
    await nav.updateComplete;

    expect(nav.selectedLink).toBe("home");
  });
});

describe("[ch-navigation-list-render][selectedLink][selection by id]", () => {
  it("should mark item as selected when its id matches selectedLink", async () => {
    navigationList.selectedLink = "home";
    await navigationList.updateComplete;

    const home = findItem("home");
    await (home as any).updateComplete;
    expect((home as any).selected).toBe(true);
  });

  it("should not mark non-matching items as selected", async () => {
    navigationList.selectedLink = "home";
    await navigationList.updateComplete;

    const breadcrumb = findItem("components-breadcrumb");
    await (breadcrumb as any).updateComplete;
    expect((breadcrumb as any).selected).toBe(false);
  });

  it("should select nested items by id", async () => {
    navigationList.selectedLink = "components-navigation-list";
    await navigationList.updateComplete;

    const nested = findItem("components-navigation-list");
    await (nested as any).updateComplete;
    expect((nested as any).selected).toBe(true);
  });

  it(
    "should not select an item by id when the item has no link (button)",
    async () => {
      navigationList.selectedLink = "components";
      await navigationList.updateComplete;

      const components = findItem("components");
      await (components as any).updateComplete;
      expect((components as any).selected).toBe(false);
    }
  );

  it("should set aria-current=page on the selected hyperlink", async () => {
    navigationList.selectedLink = "home";
    await navigationList.updateComplete;

    const home = findItem("home");
    await (home as any).updateComplete;
    const anchor = home!.shadowRoot!.querySelector("a");

    expect(anchor?.getAttribute("aria-current")).toBe("page");
  });

  it("should not set aria-current on non-selected hyperlinks", async () => {
    navigationList.selectedLink = "home";
    await navigationList.updateComplete;

    const breadcrumb = findItem("components-breadcrumb");
    await (breadcrumb as any).updateComplete;
    const anchor = breadcrumb!.shadowRoot!.querySelector("a");

    expect(anchor?.getAttribute("aria-current")).toBeNull();
  });

  it("should clear the previous selection when selectedLink changes", async () => {
    navigationList.selectedLink = "home";
    await navigationList.updateComplete;

    navigationList.selectedLink = "components-breadcrumb";
    await navigationList.updateComplete;

    const home = findItem("home");
    const breadcrumb = findItem("components-breadcrumb");
    await (home as any).updateComplete;
    await (breadcrumb as any).updateComplete;

    expect((home as any).selected).toBe(false);
    expect((breadcrumb as any).selected).toBe(true);
  });
});

describe("[ch-navigation-list-render][selectedLink][click behavior]", () => {
  it("should set selectedLink to the clicked item id", async () => {
    const home = findItem("home");
    await (home as any).updateComplete;

    const anchor = home!.shadowRoot!.querySelector("a") as HTMLAnchorElement;
    anchor.addEventListener("click", e => e.preventDefault());
    anchor.click();

    await navigationList.updateComplete;

    expect(navigationList.selectedLink).toBe("home");
  });

  it("should set selectedLink to a nested item id when clicked", async () => {
    const nested = findItem("components-navigation-list");
    await (nested as any).updateComplete;

    const anchor = nested!.shadowRoot!.querySelector("a") as HTMLAnchorElement;
    anchor.addEventListener("click", e => e.preventDefault());
    anchor.click();

    await navigationList.updateComplete;

    expect(navigationList.selectedLink).toBe("components-navigation-list");
  });

  it("should not change selectedLink when a button (non-link) item is clicked", async () => {
    navigationList.selectedLink = "home";
    await navigationList.updateComplete;

    const components = findItem("components");
    await (components as any).updateComplete;

    const button = components!.shadowRoot!.querySelector(
      "button"
    ) as HTMLButtonElement;
    button.click();

    await navigationList.updateComplete;

    expect(navigationList.selectedLink).toBe("home");
  });
});
