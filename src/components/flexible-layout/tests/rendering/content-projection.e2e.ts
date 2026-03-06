/**
 * Validates that user-provided slotted content is correctly projected through
 * all shadow DOM levels of ch-flexible-layout-render.
 *
 * These tests focus on whether content actually reaches its final destination
 * (via `assignedNodes({ flatten: true })`), not on intermediate slot attribute
 * values -- see `../slot-attributes.e2e.ts` for that.
 * For model switching tests see `../model-switching.e2e.ts`.
 *
 * Covered cases:
 *
 *  1. single-content leaf, widget.id != leaf.id    (skip-flag controlled)
 *  2. single-content leaf, widget.id === leaf.id
 *
 *  3. tabbed leaf, all widget.id != leaf.id
 *     - selected tab projected   - non-selected tab NOT assigned
 *  4. tabbed leaf, selected widget.id === leaf.id
 *     - selected tab projected   - non-selected tab NOT assigned
 *  5. tabbed leaf, NON-selected widget.id === leaf.id
 *     - selected tab projected   - non-selected tab NOT assigned
 */
import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { FlexibleLayoutModel } from "../../internal/flexible-layout/types";

const LEAF_ID = "leaf-1";
const TABBED_LEAF_ID = "leaf-2";

const WIDGET_ID = "widget-1";
const TAB_WIDGET_A_ID = "widget-a";
const TAB_WIDGET_B_ID = "widget-b";

const SHARED_LEAF_ID = "shared-id";
const SHARED_TAB_LEAF_ID = "shared-tab-id";

const SKIP_SINGLE_CONTENT_DIFFERENT_ID = false;

const SINGLE_CONTENT_DIFFERENT_ID_MODEL: FlexibleLayoutModel = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: LEAF_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: WIDGET_ID, name: "", slot: true }
    }
  ]
};

const SINGLE_CONTENT_SAME_ID_MODEL: FlexibleLayoutModel = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: SHARED_LEAF_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: SHARED_LEAF_ID, name: "", slot: true }
    }
  ]
};

const TABBED_MODEL: FlexibleLayoutModel = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: TABBED_LEAF_ID,
      size: "1fr",
      type: "tabbed",
      selectedWidgetId: TAB_WIDGET_A_ID,
      widgets: [
        { id: TAB_WIDGET_A_ID, name: "Tab A", slot: true },
        { id: TAB_WIDGET_B_ID, name: "Tab B", slot: true }
      ]
    }
  ]
};

const TABBED_SAME_ID_MODEL: FlexibleLayoutModel = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: SHARED_TAB_LEAF_ID,
      size: "1fr",
      type: "tabbed",
      selectedWidgetId: SHARED_TAB_LEAF_ID,
      widgets: [
        { id: SHARED_TAB_LEAF_ID, name: "Tab Same", slot: true },
        { id: TAB_WIDGET_B_ID, name: "Tab B", slot: true }
      ]
    }
  ]
};

const TABBED_NON_SELECTED_SAME_ID_MODEL: FlexibleLayoutModel = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: SHARED_TAB_LEAF_ID,
      size: "1fr",
      type: "tabbed",
      selectedWidgetId: TAB_WIDGET_A_ID,
      widgets: [
        { id: TAB_WIDGET_A_ID, name: "Tab A", slot: true },
        { id: SHARED_TAB_LEAF_ID, name: "Tab Same", slot: true }
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

const isContentAssignedToSlot = (page: E2EPage, widgetId: string) =>
  page.evaluate((widgetId: string) => {
    const div = document.querySelector(
      `ch-flexible-layout-render > [slot="${widgetId}"]`
    );
    return div ? (div as any).assignedSlot !== null : false;
  }, widgetId);

describe("[ch-flexible-layout-render][content-projection]", () => {
  let page: E2EPage;
  let flexibleLayoutRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-flexible-layout-render>
        <div slot="${WIDGET_ID}">Widget content</div>
        <div slot="${SHARED_LEAF_ID}">Shared id content</div>
        <div slot="${TAB_WIDGET_A_ID}">Tab A content</div>
        <div slot="${TAB_WIDGET_B_ID}">Tab B content</div>
        <div slot="${SHARED_TAB_LEAF_ID}">Shared tab id content</div>
      </ch-flexible-layout-render>`,
      failOnConsoleError: true
    });
    flexibleLayoutRef = await page.find("ch-flexible-layout-render");
  });

  (SKIP_SINGLE_CONTENT_DIFFERENT_ID ? describe.skip : describe)(
    "single-content leaf",
    () => {
      beforeEach(async () => {
        flexibleLayoutRef.setProperty(
          "model",
          SINGLE_CONTENT_DIFFERENT_ID_MODEL
        );
        await page.waitForChanges();
      });

      it("should project user content through all shadow DOM levels", async () => {
        expect(await getProjectedTextAtLeaf(page, LEAF_ID)).toBe(
          "Widget content"
        );
      });

      it("should assign the user's content element to a slot", async () => {
        expect(await isContentAssignedToSlot(page, WIDGET_ID)).toBe(true);
      });
    }
  );

  describe("single-content leaf (widget.id === leaf.id)", () => {
    beforeEach(async () => {
      flexibleLayoutRef.setProperty("model", SINGLE_CONTENT_SAME_ID_MODEL);
      await page.waitForChanges();
    });

    it("should project user content through all shadow DOM levels", async () => {
      expect(await getProjectedTextAtLeaf(page, SHARED_LEAF_ID)).toBe(
        "Shared id content"
      );
    });

    it("should assign the user's content element to a slot", async () => {
      expect(await isContentAssignedToSlot(page, SHARED_LEAF_ID)).toBe(true);
    });
  });

  describe("tabbed leaf", () => {
    beforeEach(async () => {
      flexibleLayoutRef.setProperty("model", TABBED_MODEL);
      await page.waitForChanges();
    });

    it("should project selected tab content through all shadow DOM levels into the tab panel", async () => {
      expect(
        await getProjectedTextInTabPanel(page, TABBED_LEAF_ID, TAB_WIDGET_A_ID)
      ).toBe("Tab A content");
    });

    it("should not assign non-selected tab content to any slot", async () => {
      expect(await isContentAssignedToSlot(page, TAB_WIDGET_B_ID)).toBe(false);
    });
  });

  describe("tabbed leaf (selected widget.id === leaf.id)", () => {
    beforeEach(async () => {
      flexibleLayoutRef.setProperty("model", TABBED_SAME_ID_MODEL);
      await page.waitForChanges();
    });

    it("should project selected tab content through all shadow DOM levels into the tab panel", async () => {
      expect(
        await getProjectedTextInTabPanel(
          page,
          SHARED_TAB_LEAF_ID,
          SHARED_TAB_LEAF_ID
        )
      ).toBe("Shared tab id content");
    });

    it("should not assign non-selected tab content to any slot", async () => {
      expect(await isContentAssignedToSlot(page, TAB_WIDGET_B_ID)).toBe(false);
    });
  });

  describe("tabbed leaf (non-selected widget.id === leaf.id)", () => {
    beforeEach(async () => {
      flexibleLayoutRef.setProperty("model", TABBED_NON_SELECTED_SAME_ID_MODEL);
      await page.waitForChanges();
    });

    it("should project selected tab content through all shadow DOM levels into the tab panel", async () => {
      expect(
        await getProjectedTextInTabPanel(
          page,
          SHARED_TAB_LEAF_ID,
          TAB_WIDGET_A_ID
        )
      ).toBe("Tab A content");
    });

    it("should not assign non-selected tab content to any slot", async () => {
      expect(await isContentAssignedToSlot(page, SHARED_TAB_LEAF_ID)).toBe(
        false
      );
    });
  });
});
