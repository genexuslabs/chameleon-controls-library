/**
 * Validates that user-provided slotted content is correctly projected through
 * all shadow DOM levels of ch-flexible-layout-render.
 *
 * These tests focus on whether content actually reaches its final destination
 * (via `assignedNodes({ flatten: true })`), not on intermediate slot attribute
 * values — see `slot-attributes.e2e.ts` for that.
 */
import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { FlexibleLayoutModel } from "../internal/flexible-layout/types";

const CENTER_LEAF_ID = "center";
const SIDEBAR_LEAF_ID = "sidebar";

const PERSON_MANAGER_WIDGET_ID = "person-manager";
const TAB_A_WIDGET_ID = "tab-A";
const TAB_B_WIDGET_ID = "tab-B";

const SHARED_LEAF_ID = "shared-id";
const SHARED_TAB_LEAF_ID = "shared-tab-id";

const SKIP_SINGLE_CONTENT_DIFFERENT_ID = false;

const SINGLE_CONTENT_MODEL: FlexibleLayoutModel = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: CENTER_LEAF_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: PERSON_MANAGER_WIDGET_ID, name: "", slot: true }
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
      id: SIDEBAR_LEAF_ID,
      size: "1fr",
      type: "tabbed",
      selectedWidgetId: TAB_A_WIDGET_ID,
      widgets: [
        { id: TAB_A_WIDGET_ID, name: "Tab A", slot: true },
        { id: TAB_B_WIDGET_ID, name: "Tab B", slot: true }
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
        { id: TAB_B_WIDGET_ID, name: "Tab B", slot: true }
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
        <div slot="${PERSON_MANAGER_WIDGET_ID}">Person manager content</div>
        <div slot="${SHARED_LEAF_ID}">Shared id content</div>
        <div slot="${TAB_A_WIDGET_ID}">Tab A content</div>
        <div slot="${TAB_B_WIDGET_ID}">Tab B content</div>
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
        flexibleLayoutRef.setProperty("model", SINGLE_CONTENT_MODEL);
        await page.waitForChanges();
      });

      it("should project user content through all shadow DOM levels", async () => {
        expect(await getProjectedTextAtLeaf(page, CENTER_LEAF_ID)).toBe(
          "Person manager content"
        );
      });

      it("should assign the user's content element to a slot", async () => {
        expect(
          await isContentAssignedToSlot(page, PERSON_MANAGER_WIDGET_ID)
        ).toBe(true);
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
        await getProjectedTextInTabPanel(page, SIDEBAR_LEAF_ID, TAB_A_WIDGET_ID)
      ).toBe("Tab A content");
    });

    it("should not assign non-selected tab content to any slot", async () => {
      expect(await isContentAssignedToSlot(page, TAB_B_WIDGET_ID)).toBe(false);
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
      expect(await isContentAssignedToSlot(page, TAB_B_WIDGET_ID)).toBe(false);
    });
  });

  describe("model updates", () => {
    (SKIP_SINGLE_CONTENT_DIFFERENT_ID ? it.skip : it)(
      "should keep projecting content after switching from one model to another",
      async () => {
        flexibleLayoutRef.setProperty("model", SINGLE_CONTENT_MODEL);
        await page.waitForChanges();

        expect(await getProjectedTextAtLeaf(page, CENTER_LEAF_ID)).toBe(
          "Person manager content"
        );

        flexibleLayoutRef.setProperty("model", SINGLE_CONTENT_SAME_ID_MODEL);
        await page.waitForChanges();

        expect(await getProjectedTextAtLeaf(page, SHARED_LEAF_ID)).toBe(
          "Shared id content"
        );
      }
    );

    (SKIP_SINGLE_CONTENT_DIFFERENT_ID ? it.skip : it)(
      "should keep projecting content after switching from single-content to tabbed",
      async () => {
        flexibleLayoutRef.setProperty("model", SINGLE_CONTENT_MODEL);
        await page.waitForChanges();

        expect(await getProjectedTextAtLeaf(page, CENTER_LEAF_ID)).toBe(
          "Person manager content"
        );

        flexibleLayoutRef.setProperty("model", TABBED_MODEL);
        await page.waitForChanges();

        expect(
          await getProjectedTextInTabPanel(
            page,
            SIDEBAR_LEAF_ID,
            TAB_A_WIDGET_ID
          )
        ).toBe("Tab A content");
      }
    );
  });
});
