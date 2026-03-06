/**
 * Validates that content projection keeps working after switching between
 * different layout models at runtime.
 *
 * These tests focus on the component's ability to re-render and re-project
 * user content when the `model` property changes dynamically.
 * For static content projection see `rendering/content-projection.e2e.ts`.
 *
 * Covered transitions (all use widget.id === leaf.id):
 *
 *  1. single-content -> tabbed
 *  2. tabbed -> single-content
 *  3. tabbed -> tabbed (different leaf IDs)
 */
import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { FlexibleLayoutModel } from "../internal/flexible-layout/types";

const SINGLE_LEAF_ID = "single-leaf";
const TABBED_LEAF_A_ID = "tabbed-leaf-a";
const TABBED_LEAF_B_ID = "tabbed-leaf-b";

const SINGLE_CONTENT_MODEL: FlexibleLayoutModel = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: SINGLE_LEAF_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: SINGLE_LEAF_ID, name: "", slot: true }
    }
  ]
};

const TABBED_MODEL_A: FlexibleLayoutModel = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: TABBED_LEAF_A_ID,
      size: "1fr",
      type: "tabbed",
      selectedWidgetId: TABBED_LEAF_A_ID,
      widgets: [
        { id: TABBED_LEAF_A_ID, name: "Tab A", slot: true },
        { id: "tab-b", name: "Tab B", slot: true }
      ]
    }
  ]
};

const TABBED_MODEL_B: FlexibleLayoutModel = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: TABBED_LEAF_B_ID,
      size: "1fr",
      type: "tabbed",
      selectedWidgetId: TABBED_LEAF_B_ID,
      widgets: [
        { id: TABBED_LEAF_B_ID, name: "Tab C", slot: true },
        { id: "tab-d", name: "Tab D", slot: true }
      ]
    }
  ]
};

const getProjectedTextAtLeaf = (page: E2EPage, leafId: string) =>
  page.evaluate((leafId: string) => {
    const render = document.querySelector("ch-flexible-layout-render");
    const flexLayout = render.shadowRoot.querySelector("ch-flexible-layout");
    const splitter = flexLayout.shadowRoot.querySelector("ch-layout-splitter");
    const leafDiv = splitter.shadowRoot.querySelector(`[id="${leafId}"]`);
    if (!leafDiv) {
      return null;
    }
    const slot = leafDiv.querySelector("slot");
    if (!slot) {
      return null;
    }
    const nodes = (slot as any).assignedNodes({ flatten: true });
    const element = nodes.find((n: any) => n.nodeType === 1);
    return element?.textContent ?? null;
  }, leafId);

const getProjectedTextInTabPanel = (
  page: E2EPage,
  leafId: string,
  widgetId: string
) =>
  page.evaluate(
    (leafId: string, widgetId: string) => {
      const render = document.querySelector("ch-flexible-layout-render");
      const flexLayout = render.shadowRoot.querySelector("ch-flexible-layout");
      const splitter =
        flexLayout.shadowRoot.querySelector("ch-layout-splitter");
      const leafDiv = splitter.shadowRoot.querySelector(`[id="${leafId}"]`);
      if (!leafDiv) {
        return null;
      }
      const leafSlot = leafDiv.querySelector("slot");
      if (!leafSlot) {
        return null;
      }
      const nodes = (leafSlot as any).assignedNodes({ flatten: true });
      const tabRender = nodes.find(
        (n: any) => n.nodeType === 1 && n.tagName === "CH-TAB-RENDER"
      );
      if (!tabRender) {
        return null;
      }

      const panelSlot = tabRender.shadowRoot?.querySelector(
        `slot[name="${widgetId}"]`
      );
      if (!panelSlot) {
        return null;
      }
      const panelNodes = (panelSlot as any).assignedNodes({ flatten: true });
      const contentEl = panelNodes.find((n: any) => n.nodeType === 1);
      return contentEl?.textContent ?? null;
    },
    leafId,
    widgetId
  );

describe("[ch-flexible-layout-render][model-switching]", () => {
  let page: E2EPage;
  let flexibleLayoutRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-flexible-layout-render>
        <div slot="${SINGLE_LEAF_ID}">Single content</div>
        <div slot="${TABBED_LEAF_A_ID}">Tab A content</div>
        <div slot="tab-b">Tab B content</div>
        <div slot="${TABBED_LEAF_B_ID}">Tab C content</div>
        <div slot="tab-d">Tab D content</div>
      </ch-flexible-layout-render>`,
      failOnConsoleError: true
    });
    flexibleLayoutRef = await page.find("ch-flexible-layout-render");
  });

  it("should project content after switching from single-content to tabbed", async () => {
    flexibleLayoutRef.setProperty("model", SINGLE_CONTENT_MODEL);
    await page.waitForChanges();

    expect(await getProjectedTextAtLeaf(page, SINGLE_LEAF_ID)).toBe(
      "Single content"
    );

    flexibleLayoutRef.setProperty("model", TABBED_MODEL_A);
    await page.waitForChanges();

    expect(
      await getProjectedTextInTabPanel(page, TABBED_LEAF_A_ID, TABBED_LEAF_A_ID)
    ).toBe("Tab A content");
  });

  it("should project content after switching from tabbed to single-content", async () => {
    flexibleLayoutRef.setProperty("model", TABBED_MODEL_A);
    await page.waitForChanges();

    expect(
      await getProjectedTextInTabPanel(page, TABBED_LEAF_A_ID, TABBED_LEAF_A_ID)
    ).toBe("Tab A content");

    flexibleLayoutRef.setProperty("model", SINGLE_CONTENT_MODEL);
    await page.waitForChanges();

    expect(await getProjectedTextAtLeaf(page, SINGLE_LEAF_ID)).toBe(
      "Single content"
    );
  });

  it("should project content after switching between different tabbed models", async () => {
    flexibleLayoutRef.setProperty("model", TABBED_MODEL_A);
    await page.waitForChanges();

    expect(
      await getProjectedTextInTabPanel(page, TABBED_LEAF_A_ID, TABBED_LEAF_A_ID)
    ).toBe("Tab A content");

    flexibleLayoutRef.setProperty("model", TABBED_MODEL_B);
    await page.waitForChanges();

    expect(
      await getProjectedTextInTabPanel(page, TABBED_LEAF_B_ID, TABBED_LEAF_B_ID)
    ).toBe("Tab C content");
  });
});
