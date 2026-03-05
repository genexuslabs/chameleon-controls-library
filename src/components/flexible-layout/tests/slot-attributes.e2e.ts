/**
 * Validates slot/name attributes across the three shadow DOM levels:
 *
 *   <ch-flexible-layout-render>
 *       ├─ #shadow → <ch-flexible-layout>
 *       │     ├─ #shadow → <ch-layout-splitter>
 *       │     │     ├─ #shadow
 *       │     │     │  └─ <div id="{leaf.id}">
 *       │     │     │        └─ <slot name="{leaf.id}" />           ← Level 3
 *       │     │     └─ <slot slot="{leaf.id}" name="{widget.id}" /> ← Level 2
 *       │     └─ <slot name="{widget.id}" slot="{widget.id}" />     ← Level 1
 *       └─ <div slot="{widget.id}">User content</div>
 *   </ch-flexible-layout-render>
 *
 * Both cases are validated:
 *   - widget.id !== leaf.id (current behavior)
 *   - widget.id === leaf.id (backward compatibility with models from ≤ v6.31.2,
 *     where single-content widget lookup was keyed by leaf.id, forcing both
 *     IDs to match)
 */
import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { FlexibleLayoutModel } from "../internal/flexible-layout/types";

const CENTER_LEAF_ID = "center";
const SIDEBAR_LEAF_ID = "sidebar";

const PERSON_MANAGER_WIDGET_ID = "person-manager-content";
const TAB_A_WIDGET_ID = "tab-A";
const TAB_B_WIDGET_ID = "tab-B";

const SAME_ID_LEAF = "shared-id";
const SAME_ID_TABBED_LEAF = "shared-tab-id";

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

const SINGLE_CONTENT_SAME_ID_MODEL: FlexibleLayoutModel = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: SAME_ID_LEAF,
      size: "1fr",
      type: "single-content",
      widget: { id: SAME_ID_LEAF, name: "", slot: true }
    }
  ]
};

const TABBED_SAME_ID_MODEL: FlexibleLayoutModel = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: SAME_ID_TABBED_LEAF,
      size: "1fr",
      type: "tabbed",
      selectedWidgetId: SAME_ID_TABBED_LEAF,
      widgets: [
        { id: SAME_ID_TABBED_LEAF, name: "Tab Same", slot: true },
        { id: TAB_B_WIDGET_ID, name: "Tab B", slot: true }
      ]
    }
  ]
};

// When true, all tests run (including single-content leaves where widget.id !== leaf.id).
// When false, tests that use SINGLE_CONTENT_MODEL are skipped because the bug
// (using leafId instead of widget.id as key for widget info) causes slot
// mismatches in that scenario.

const FIX_APPLIED = true;

type SlotAttr = { name: string | null; slot: string | null };

describe("[ch-flexible-layout-render][slot-attributes]", () => {
  let page: E2EPage;
  let flexibleLayoutRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-flexible-layout-render>
        <div slot="${PERSON_MANAGER_WIDGET_ID}">Person manager content</div>
        <div slot="${SAME_ID_LEAF}">Shared id content</div>
        <div slot="${TAB_A_WIDGET_ID}">Tab A content</div>
        <div slot="${TAB_B_WIDGET_ID}">Tab B content</div>
        <div slot="${SAME_ID_TABBED_LEAF}">Shared tab id content</div>
      </ch-flexible-layout-render>`,
      failOnConsoleError: true
    });
    flexibleLayoutRef = await page.find("ch-flexible-layout-render");
  });

  (FIX_APPLIED ? describe : xdescribe)("single-content leaf", () => {
    beforeEach(async () => {
      flexibleLayoutRef.setProperty("slottedWidgets", true);
      flexibleLayoutRef.setProperty("model", SINGLE_CONTENT_MODEL);
      await page.waitForChanges();
    });

    it("Level 1 (ch-flexible-layout-render): slot name and slot should both equal widget.id", async () => {
      const attrs: SlotAttr = await page.evaluate((widgetId: string) => {
        const renderRoot = document.querySelector(
          "ch-flexible-layout-render"
        ).shadowRoot;
        const flexLayout = renderRoot.querySelector("ch-flexible-layout");
        const slot = flexLayout.querySelector(`slot[name="${widgetId}"]`);
        if (!slot) {
          return { name: null, slot: null };
        }
        return {
          name: slot.getAttribute("name"),
          slot: slot.getAttribute("slot")
        };
      }, PERSON_MANAGER_WIDGET_ID);

      expect(attrs.name).toBe(PERSON_MANAGER_WIDGET_ID);
      expect(attrs.slot).toBe(PERSON_MANAGER_WIDGET_ID);
    });

    it("Level 2 (ch-flexible-layout): slot name should equal widget.id and slot should equal leaf.id", async () => {
      const attrs: SlotAttr = await page.evaluate((widgetId: string) => {
        const renderRoot = document.querySelector(
          "ch-flexible-layout-render"
        ).shadowRoot;
        const flexLayout = renderRoot.querySelector("ch-flexible-layout");
        const flexLayoutRoot = flexLayout.shadowRoot;
        const splitter = flexLayoutRoot.querySelector("ch-layout-splitter");
        const slot = splitter.querySelector(`slot[name="${widgetId}"]`);
        if (!slot) {
          return { name: null, slot: null };
        }
        return {
          name: slot.getAttribute("name"),
          slot: slot.getAttribute("slot")
        };
      }, PERSON_MANAGER_WIDGET_ID);

      expect(attrs.name).toBe(PERSON_MANAGER_WIDGET_ID);
      expect(attrs.slot).toBe(CENTER_LEAF_ID);
    });

    it("Level 3 (ch-layout-splitter): slot name should equal leaf.id inside a div with id=leaf.id", async () => {
      const result = await page.evaluate((leafId: string) => {
        const renderRoot = document.querySelector(
          "ch-flexible-layout-render"
        ).shadowRoot;
        const flexLayout = renderRoot.querySelector("ch-flexible-layout");
        const flexLayoutRoot = flexLayout.shadowRoot;
        const splitter = flexLayoutRoot.querySelector("ch-layout-splitter");
        const splitterRoot = splitter.shadowRoot;
        const leafDiv = splitterRoot.querySelector(`[id="${leafId}"]`);
        if (!leafDiv) {
          return { divId: null, slotName: null, hasLeafClass: false };
        }
        const slot = leafDiv.querySelector("slot");
        return {
          divId: leafDiv.getAttribute("id"),
          slotName: slot ? slot.getAttribute("name") : null,
          hasLeafClass: leafDiv.classList.contains("leaf")
        };
      }, CENTER_LEAF_ID);

      expect(result.divId).toBe(CENTER_LEAF_ID);
      expect(result.slotName).toBe(CENTER_LEAF_ID);
      expect(result.hasLeafClass).toBe(true);
    });

    it("Content projection: user content reaches the Level 3 slot via assignedNodes({ flatten: true })", async () => {
      const result = await page.evaluate((leafId: string) => {
        const renderRoot = document.querySelector(
          "ch-flexible-layout-render"
        ).shadowRoot;
        const flexLayout = renderRoot.querySelector("ch-flexible-layout");
        const splitter =
          flexLayout.shadowRoot.querySelector("ch-layout-splitter");
        const leafDiv = splitter.shadowRoot.querySelector(`[id="${leafId}"]`);
        const slot = leafDiv.querySelector("slot");
        const nodes = (slot as any).assignedNodes({ flatten: true });
        const elements = nodes.filter((n: any) => n.nodeType === 1);
        if (elements.length === 0) {
          return { slotAttr: null, textContent: null };
        }
        return {
          slotAttr: elements[0].getAttribute("slot"),
          textContent: elements[0].textContent
        };
      }, CENTER_LEAF_ID);

      expect(result.slotAttr).toBe(PERSON_MANAGER_WIDGET_ID);
      expect(result.textContent).toBe("Person manager content");
    });
  });

  describe("tabbed leaf", () => {
    beforeEach(async () => {
      flexibleLayoutRef.setProperty("slottedWidgets", true);
      flexibleLayoutRef.setProperty("model", TABBED_MODEL);
      await page.waitForChanges();
    });

    it("Level 1 (ch-flexible-layout-render): selected widget slot name and slot should both equal widget.id", async () => {
      const attrs: SlotAttr = await page.evaluate((widgetId: string) => {
        const renderRoot = document.querySelector(
          "ch-flexible-layout-render"
        ).shadowRoot;
        const flexLayout = renderRoot.querySelector("ch-flexible-layout");
        const slot = flexLayout.querySelector(`slot[name="${widgetId}"]`);
        if (!slot) {
          return { name: null, slot: null };
        }
        return {
          name: slot.getAttribute("name"),
          slot: slot.getAttribute("slot")
        };
      }, TAB_A_WIDGET_ID);

      expect(attrs.name).toBe(TAB_A_WIDGET_ID);
      expect(attrs.slot).toBe(TAB_A_WIDGET_ID);
    });

    it("Level 1 (ch-flexible-layout-render): non-selected widget should not have a slot projected", async () => {
      const exists = await page.evaluate((widgetId: string) => {
        const renderRoot = document.querySelector(
          "ch-flexible-layout-render"
        ).shadowRoot;
        const flexLayout = renderRoot.querySelector("ch-flexible-layout");
        return flexLayout.querySelector(`slot[name="${widgetId}"]`) !== null;
      }, TAB_B_WIDGET_ID);

      expect(exists).toBe(false);
    });

    it("Level 2 (ch-flexible-layout): ch-tab-render should have slot=leaf.id and contain a slot with name=widget.id and slot=widget.id", async () => {
      const result = await page.evaluate(
        (widgetId: string, leafId: string) => {
          const renderRoot = document.querySelector(
            "ch-flexible-layout-render"
          ).shadowRoot;
          const flexLayout = renderRoot.querySelector("ch-flexible-layout");
          const flexLayoutRoot = flexLayout.shadowRoot;
          const splitter = flexLayoutRoot.querySelector("ch-layout-splitter");
          const tabRender = splitter.querySelector(
            `ch-tab-render[id="${leafId}"]`
          );
          if (!tabRender) {
            return {
              tabRenderSlot: null,
              innerSlotName: null,
              innerSlotSlot: null
            };
          }
          const innerSlot = tabRender.querySelector(`slot[name="${widgetId}"]`);
          return {
            tabRenderSlot: tabRender.getAttribute("slot"),
            innerSlotName: innerSlot ? innerSlot.getAttribute("name") : null,
            innerSlotSlot: innerSlot ? innerSlot.getAttribute("slot") : null
          };
        },
        TAB_A_WIDGET_ID,
        SIDEBAR_LEAF_ID
      );

      expect(result.tabRenderSlot).toBe(SIDEBAR_LEAF_ID);
      expect(result.innerSlotName).toBe(TAB_A_WIDGET_ID);
      expect(result.innerSlotSlot).toBe(TAB_A_WIDGET_ID);
    });

    it("Level 3 (ch-layout-splitter): slot name should equal leaf.id inside a div with id=leaf.id", async () => {
      const result = await page.evaluate((leafId: string) => {
        const renderRoot = document.querySelector(
          "ch-flexible-layout-render"
        ).shadowRoot;
        const flexLayout = renderRoot.querySelector("ch-flexible-layout");
        const flexLayoutRoot = flexLayout.shadowRoot;
        const splitter = flexLayoutRoot.querySelector("ch-layout-splitter");
        const splitterRoot = splitter.shadowRoot;
        const leafDiv = splitterRoot.querySelector(`[id="${leafId}"]`);
        if (!leafDiv) {
          return { divId: null, slotName: null, hasLeafClass: false };
        }
        const slot = leafDiv.querySelector("slot");
        return {
          divId: leafDiv.getAttribute("id"),
          slotName: slot ? slot.getAttribute("name") : null,
          hasLeafClass: leafDiv.classList.contains("leaf")
        };
      }, SIDEBAR_LEAF_ID);

      expect(result.divId).toBe(SIDEBAR_LEAF_ID);
      expect(result.slotName).toBe(SIDEBAR_LEAF_ID);
      expect(result.hasLeafClass).toBe(true);
    });

    it("Content projection: ch-tab-render is assigned to the Level 3 slot via assignedNodes({ flatten: true })", async () => {
      const result = await page.evaluate((leafId: string) => {
        const renderRoot = document.querySelector(
          "ch-flexible-layout-render"
        ).shadowRoot;
        const flexLayout = renderRoot.querySelector("ch-flexible-layout");
        const splitter =
          flexLayout.shadowRoot.querySelector("ch-layout-splitter");
        const leafDiv = splitter.shadowRoot.querySelector(`[id="${leafId}"]`);
        const slot = leafDiv.querySelector("slot");
        const nodes = (slot as any).assignedNodes({ flatten: true });
        const elements = nodes.filter((n: any) => n.nodeType === 1);
        if (elements.length === 0) {
          return { tagName: null, slotAttr: null };
        }
        return {
          tagName: elements[0].tagName.toLowerCase(),
          slotAttr: elements[0].getAttribute("slot")
        };
      }, SIDEBAR_LEAF_ID);

      expect(result.tagName).toBe("ch-tab-render");
      expect(result.slotAttr).toBe(SIDEBAR_LEAF_ID);
    });
  });

  describe("single-content leaf (widget.id === leaf.id)", () => {
    beforeEach(async () => {
      flexibleLayoutRef.setProperty("slottedWidgets", true);
      flexibleLayoutRef.setProperty("model", SINGLE_CONTENT_SAME_ID_MODEL);
      await page.waitForChanges();
    });

    it("Level 1 (ch-flexible-layout-render): slot name and slot should both equal the shared id", async () => {
      const attrs: SlotAttr = await page.evaluate((id: string) => {
        const renderRoot = document.querySelector(
          "ch-flexible-layout-render"
        ).shadowRoot;
        const flexLayout = renderRoot.querySelector("ch-flexible-layout");
        const slot = flexLayout.querySelector(`slot[name="${id}"]`);
        if (!slot) {
          return { name: null, slot: null };
        }
        return {
          name: slot.getAttribute("name"),
          slot: slot.getAttribute("slot")
        };
      }, SAME_ID_LEAF);

      expect(attrs.name).toBe(SAME_ID_LEAF);
      expect(attrs.slot).toBe(SAME_ID_LEAF);
    });

    it("Level 2 (ch-flexible-layout): name and slot should both equal the shared id", async () => {
      const attrs: SlotAttr = await page.evaluate((id: string) => {
        const renderRoot = document.querySelector(
          "ch-flexible-layout-render"
        ).shadowRoot;
        const flexLayout = renderRoot.querySelector("ch-flexible-layout");
        const flexLayoutRoot = flexLayout.shadowRoot;
        const splitter = flexLayoutRoot.querySelector("ch-layout-splitter");
        const slot = splitter.querySelector(`slot[name="${id}"]`);
        if (!slot) {
          return { name: null, slot: null };
        }
        return {
          name: slot.getAttribute("name"),
          slot: slot.getAttribute("slot")
        };
      }, SAME_ID_LEAF);

      expect(attrs.name).toBe(SAME_ID_LEAF);
      expect(attrs.slot).toBe(SAME_ID_LEAF);
    });

    it("Level 3 (ch-layout-splitter): slot name should equal the shared id inside a div with id=shared id", async () => {
      const result = await page.evaluate((id: string) => {
        const renderRoot = document.querySelector(
          "ch-flexible-layout-render"
        ).shadowRoot;
        const flexLayout = renderRoot.querySelector("ch-flexible-layout");
        const flexLayoutRoot = flexLayout.shadowRoot;
        const splitter = flexLayoutRoot.querySelector("ch-layout-splitter");
        const splitterRoot = splitter.shadowRoot;
        const leafDiv = splitterRoot.querySelector(`[id="${id}"]`);
        if (!leafDiv) {
          return { divId: null, slotName: null, hasLeafClass: false };
        }
        const slot = leafDiv.querySelector("slot");
        return {
          divId: leafDiv.getAttribute("id"),
          slotName: slot ? slot.getAttribute("name") : null,
          hasLeafClass: leafDiv.classList.contains("leaf")
        };
      }, SAME_ID_LEAF);

      expect(result.divId).toBe(SAME_ID_LEAF);
      expect(result.slotName).toBe(SAME_ID_LEAF);
      expect(result.hasLeafClass).toBe(true);
    });

    it("Content projection: user content reaches the Level 3 slot via assignedNodes({ flatten: true })", async () => {
      const result = await page.evaluate((id: string) => {
        const renderRoot = document.querySelector(
          "ch-flexible-layout-render"
        ).shadowRoot;
        const flexLayout = renderRoot.querySelector("ch-flexible-layout");
        const splitter =
          flexLayout.shadowRoot.querySelector("ch-layout-splitter");
        const leafDiv = splitter.shadowRoot.querySelector(`[id="${id}"]`);
        const slot = leafDiv.querySelector("slot");
        const nodes = (slot as any).assignedNodes({ flatten: true });
        const elements = nodes.filter((n: any) => n.nodeType === 1);
        if (elements.length === 0) {
          return { slotAttr: null, textContent: null };
        }
        return {
          slotAttr: elements[0].getAttribute("slot"),
          textContent: elements[0].textContent
        };
      }, SAME_ID_LEAF);

      expect(result.slotAttr).toBe(SAME_ID_LEAF);
      expect(result.textContent).toBe("Shared id content");
    });
  });

  describe("tabbed leaf (selected widget.id === leaf.id)", () => {
    beforeEach(async () => {
      flexibleLayoutRef.setProperty("slottedWidgets", true);
      flexibleLayoutRef.setProperty("model", TABBED_SAME_ID_MODEL);
      await page.waitForChanges();
    });

    it("Level 1 (ch-flexible-layout-render): selected widget slot name and slot should both equal the shared id", async () => {
      const attrs: SlotAttr = await page.evaluate((id: string) => {
        const renderRoot = document.querySelector(
          "ch-flexible-layout-render"
        ).shadowRoot;
        const flexLayout = renderRoot.querySelector("ch-flexible-layout");
        const slot = flexLayout.querySelector(`slot[name="${id}"]`);
        if (!slot) {
          return { name: null, slot: null };
        }
        return {
          name: slot.getAttribute("name"),
          slot: slot.getAttribute("slot")
        };
      }, SAME_ID_TABBED_LEAF);

      expect(attrs.name).toBe(SAME_ID_TABBED_LEAF);
      expect(attrs.slot).toBe(SAME_ID_TABBED_LEAF);
    });

    it("Level 1 (ch-flexible-layout-render): non-selected widget should not have a slot projected", async () => {
      const exists = await page.evaluate((widgetId: string) => {
        const renderRoot = document.querySelector(
          "ch-flexible-layout-render"
        ).shadowRoot;
        const flexLayout = renderRoot.querySelector("ch-flexible-layout");
        return flexLayout.querySelector(`slot[name="${widgetId}"]`) !== null;
      }, TAB_B_WIDGET_ID);

      expect(exists).toBe(false);
    });

    it("Level 2 (ch-flexible-layout): ch-tab-render should have slot=shared id and contain a slot with name=shared id and slot=shared id", async () => {
      const result = await page.evaluate((id: string) => {
        const renderRoot = document.querySelector(
          "ch-flexible-layout-render"
        ).shadowRoot;
        const flexLayout = renderRoot.querySelector("ch-flexible-layout");
        const flexLayoutRoot = flexLayout.shadowRoot;
        const splitter = flexLayoutRoot.querySelector("ch-layout-splitter");
        const tabRender = splitter.querySelector(`ch-tab-render[id="${id}"]`);
        if (!tabRender) {
          return {
            tabRenderSlot: null,
            innerSlotName: null,
            innerSlotSlot: null
          };
        }
        const innerSlot = tabRender.querySelector(`slot[name="${id}"]`);
        return {
          tabRenderSlot: tabRender.getAttribute("slot"),
          innerSlotName: innerSlot ? innerSlot.getAttribute("name") : null,
          innerSlotSlot: innerSlot ? innerSlot.getAttribute("slot") : null
        };
      }, SAME_ID_TABBED_LEAF);

      expect(result.tabRenderSlot).toBe(SAME_ID_TABBED_LEAF);
      expect(result.innerSlotName).toBe(SAME_ID_TABBED_LEAF);
      expect(result.innerSlotSlot).toBe(SAME_ID_TABBED_LEAF);
    });

    it("Level 3 (ch-layout-splitter): slot name should equal the shared id inside a div with id=shared id", async () => {
      const result = await page.evaluate((id: string) => {
        const renderRoot = document.querySelector(
          "ch-flexible-layout-render"
        ).shadowRoot;
        const flexLayout = renderRoot.querySelector("ch-flexible-layout");
        const flexLayoutRoot = flexLayout.shadowRoot;
        const splitter = flexLayoutRoot.querySelector("ch-layout-splitter");
        const splitterRoot = splitter.shadowRoot;
        const leafDiv = splitterRoot.querySelector(`[id="${id}"]`);
        if (!leafDiv) {
          return { divId: null, slotName: null, hasLeafClass: false };
        }
        const slot = leafDiv.querySelector("slot");
        return {
          divId: leafDiv.getAttribute("id"),
          slotName: slot ? slot.getAttribute("name") : null,
          hasLeafClass: leafDiv.classList.contains("leaf")
        };
      }, SAME_ID_TABBED_LEAF);

      expect(result.divId).toBe(SAME_ID_TABBED_LEAF);
      expect(result.slotName).toBe(SAME_ID_TABBED_LEAF);
      expect(result.hasLeafClass).toBe(true);
    });

    it("Content projection: ch-tab-render is assigned to the Level 3 slot via assignedNodes({ flatten: true })", async () => {
      const result = await page.evaluate((id: string) => {
        const renderRoot = document.querySelector(
          "ch-flexible-layout-render"
        ).shadowRoot;
        const flexLayout = renderRoot.querySelector("ch-flexible-layout");
        const splitter =
          flexLayout.shadowRoot.querySelector("ch-layout-splitter");
        const leafDiv = splitter.shadowRoot.querySelector(`[id="${id}"]`);
        const slot = leafDiv.querySelector("slot");
        const nodes = (slot as any).assignedNodes({ flatten: true });
        const elements = nodes.filter((n: any) => n.nodeType === 1);
        if (elements.length === 0) {
          return { tagName: null, slotAttr: null };
        }
        return {
          tagName: elements[0].tagName.toLowerCase(),
          slotAttr: elements[0].getAttribute("slot")
        };
      }, SAME_ID_TABBED_LEAF);

      expect(result.tagName).toBe("ch-tab-render");
      expect(result.slotAttr).toBe(SAME_ID_TABBED_LEAF);
    });
  });
});
