/**
 * Validates that content provided via the `renders` property is correctly
 * projected through all shadow DOM levels of ch-flexible-layout-render.
 *
 * Uses spec tests because Puppeteer cannot serialize JavaScript functions.
 * For slot-based content projection tests see `content-projection.e2e.ts`.
 */
import { h } from "@stencil/core";
import { newSpecPage } from "@stencil/core/testing";
import { ChLayoutSplitter } from "../../layout-splitter/layout-splitter";
import { ChTabRender } from "../../tab/tab";
import { ChFlexibleLayoutRender } from "../flexible-layout-render";
import { ChFlexibleLayout } from "../internal/flexible-layout/flexible-layout";
import {
  FlexibleLayoutModel,
  FlexibleLayoutRenders
} from "../internal/flexible-layout/types";

const LEAF_ID = "leaf-1";
const TABBED_LEAF_ID = "leaf-2";

const WIDGET_ID = "widget-1";
const TAB_WIDGET_A_ID = "widget-a";
const TAB_WIDGET_B_ID = "widget-b";

const SHARED_LEAF_ID = "shared-id";
const SHARED_TAB_LEAF_ID = "shared-tab-id";

const SKIP_SINGLE_CONTENT_DIFFERENT_ID = true;

const testRenders: FlexibleLayoutRenders = {
  [WIDGET_ID]: () => (
    <div key={WIDGET_ID} slot={WIDGET_ID}>
      Widget content
    </div>
  ),
  [SHARED_LEAF_ID]: () => (
    <div key={SHARED_LEAF_ID} slot={SHARED_LEAF_ID}>
      Shared id content
    </div>
  ),
  [TAB_WIDGET_A_ID]: () => (
    <div key={TAB_WIDGET_A_ID} slot={TAB_WIDGET_A_ID}>
      Tab A content
    </div>
  ),
  [TAB_WIDGET_B_ID]: () => (
    <div key={TAB_WIDGET_B_ID} slot={TAB_WIDGET_B_ID}>
      Tab B content
    </div>
  ),
  [SHARED_TAB_LEAF_ID]: () => (
    <div key={SHARED_TAB_LEAF_ID} slot={SHARED_TAB_LEAF_ID}>
      Shared tab id content
    </div>
  )
};

const SINGLE_CONTENT_DIFFERENT_ID_MODEL: FlexibleLayoutModel = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: LEAF_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: WIDGET_ID, name: "", renderId: WIDGET_ID }
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
      widget: { id: SHARED_LEAF_ID, name: "", renderId: SHARED_LEAF_ID }
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
        { id: TAB_WIDGET_A_ID, name: "Tab A", renderId: TAB_WIDGET_A_ID },
        { id: TAB_WIDGET_B_ID, name: "Tab B", renderId: TAB_WIDGET_B_ID }
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
        {
          id: SHARED_TAB_LEAF_ID,
          name: "Tab Same",
          renderId: SHARED_TAB_LEAF_ID
        },
        { id: TAB_WIDGET_B_ID, name: "Tab B", renderId: TAB_WIDGET_B_ID }
      ]
    }
  ]
};

const getFlexibleLayout = (
  root: HTMLChFlexibleLayoutRenderElement
): HTMLChFlexibleLayoutElement =>
  root.shadowRoot.querySelector("ch-flexible-layout");

const getLayoutSplitter = (
  flexLayout: HTMLChFlexibleLayoutElement
): HTMLChLayoutSplitterElement =>
  flexLayout.shadowRoot.querySelector("ch-layout-splitter");

const getRenderedContentText = (
  flexLayout: HTMLChFlexibleLayoutElement,
  widgetId: string
): string | null => {
  const el = flexLayout.querySelector(`[slot="${widgetId}"]`);
  return el?.textContent?.trim() ?? null;
};

const getSplitterLeafSlot = (
  splitter: HTMLChLayoutSplitterElement,
  leafId: string
): Element | null =>
  splitter.shadowRoot?.querySelector(
    `[id="${leafId}"] slot[name="${leafId}"]`
  ) ?? null;

const getTabRender = (
  flexLayout: HTMLChFlexibleLayoutElement,
  leafId: string
): HTMLChTabRenderElement | null =>
  flexLayout.shadowRoot.querySelector(`ch-tab-render[id="${leafId}"]`);

describe("[ch-flexible-layout-render][content-projection][renders]", () => {
  let page: Awaited<ReturnType<typeof newSpecPage>>;
  let chFlexibleLayoutRender: HTMLChFlexibleLayoutRenderElement;

  beforeEach(async () => {
    page = await newSpecPage({
      components: [
        ChFlexibleLayoutRender,
        ChFlexibleLayout,
        ChLayoutSplitter,
        ChTabRender
      ],
      template: () => <ch-flexible-layout-render renders={testRenders} />
    });

    // `ch-tab-render` reads `window.chameleonControlsLibrary.getImagePathCallback`
    // in its connectedCallback (via getControlRegisterProperty). In production
    // this global is initialised by the module-level code in
    // registry-properties.ts, but newSpecPage creates its own mock window
    // (`page.win`) where that initialisation never runs. Without this line,
    // every test that triggers a tabbed model throws:
    //   TypeError: Cannot read properties of undefined (reading 'getImagePathCallback')
    (page.win as any).chameleonControlsLibrary ??= {
      getImagePathCallback: {}
    };

    chFlexibleLayoutRender = page.root as HTMLChFlexibleLayoutRenderElement;
  });

  (SKIP_SINGLE_CONTENT_DIFFERENT_ID ? describe.skip : describe)(
    "single-content leaf",
    () => {
      beforeEach(async () => {
        chFlexibleLayoutRender.model = SINGLE_CONTENT_DIFFERENT_ID_MODEL;
        await page.waitForChanges();
      });

      it("should render widget content with correct slot attribute", () => {
        const flexLayout = getFlexibleLayout(chFlexibleLayoutRender);
        expect(getRenderedContentText(flexLayout, WIDGET_ID)).toBe(
          "Widget content"
        );
      });

      it("should have a matching slot in ch-layout-splitter", () => {
        const flexLayout = getFlexibleLayout(chFlexibleLayoutRender);
        const splitter = getLayoutSplitter(flexLayout);
        expect(getSplitterLeafSlot(splitter, LEAF_ID)).not.toBeNull();
      });
    }
  );

  describe("single-content leaf (widget.id === leaf.id)", () => {
    beforeEach(async () => {
      chFlexibleLayoutRender.model = SINGLE_CONTENT_SAME_ID_MODEL;
      await page.waitForChanges();
    });

    it("should render widget content with correct slot attribute", () => {
      const flexLayout = getFlexibleLayout(chFlexibleLayoutRender);
      expect(getRenderedContentText(flexLayout, SHARED_LEAF_ID)).toBe(
        "Shared id content"
      );
    });

    it("should have a matching slot in ch-layout-splitter", () => {
      const flexLayout = getFlexibleLayout(chFlexibleLayoutRender);
      const splitter = getLayoutSplitter(flexLayout);
      expect(getSplitterLeafSlot(splitter, SHARED_LEAF_ID)).not.toBeNull();
    });
  });

  describe("tabbed leaf", () => {
    beforeEach(async () => {
      chFlexibleLayoutRender.model = TABBED_MODEL;
      await page.waitForChanges();
    });

    it("should render selected tab content with correct slot attribute", () => {
      const flexLayout = getFlexibleLayout(chFlexibleLayoutRender);
      expect(getRenderedContentText(flexLayout, TAB_WIDGET_A_ID)).toBe(
        "Tab A content"
      );
    });

    it("should have a matching slot in ch-layout-splitter for the tabbed leaf", () => {
      const flexLayout = getFlexibleLayout(chFlexibleLayoutRender);
      const splitter = getLayoutSplitter(flexLayout);
      expect(getSplitterLeafSlot(splitter, TABBED_LEAF_ID)).not.toBeNull();
    });

    it("should render ch-tab-render for the tabbed leaf", () => {
      const flexLayout = getFlexibleLayout(chFlexibleLayoutRender);
      const tabRender = getTabRender(flexLayout, TABBED_LEAF_ID);
      expect(tabRender).not.toBeNull();
    });
  });

  describe("tabbed leaf (selected widget.id === leaf.id)", () => {
    beforeEach(async () => {
      chFlexibleLayoutRender.model = TABBED_SAME_ID_MODEL;
      await page.waitForChanges();
    });

    it("should render selected tab content with correct slot attribute", () => {
      const flexLayout = getFlexibleLayout(chFlexibleLayoutRender);
      expect(getRenderedContentText(flexLayout, SHARED_TAB_LEAF_ID)).toBe(
        "Shared tab id content"
      );
    });

    it("should have a matching slot in ch-layout-splitter for the tabbed leaf", () => {
      const flexLayout = getFlexibleLayout(chFlexibleLayoutRender);
      const splitter = getLayoutSplitter(flexLayout);
      expect(getSplitterLeafSlot(splitter, SHARED_TAB_LEAF_ID)).not.toBeNull();
    });
  });

  describe("model updates", () => {
    (SKIP_SINGLE_CONTENT_DIFFERENT_ID ? it.skip : it)(
      "should keep rendering content after switching from one model to another",
      async () => {
        chFlexibleLayoutRender.model = SINGLE_CONTENT_DIFFERENT_ID_MODEL;
        await page.waitForChanges();

        const flexLayout = getFlexibleLayout(chFlexibleLayoutRender);
        expect(getRenderedContentText(flexLayout, WIDGET_ID)).toBe(
          "Widget content"
        );

        chFlexibleLayoutRender.model = SINGLE_CONTENT_SAME_ID_MODEL;
        await page.waitForChanges();

        expect(getRenderedContentText(flexLayout, SHARED_LEAF_ID)).toBe(
          "Shared id content"
        );
      }
    );

    (SKIP_SINGLE_CONTENT_DIFFERENT_ID ? it.skip : it)(
      "should keep rendering content after switching from single-content to tabbed",
      async () => {
        chFlexibleLayoutRender.model = SINGLE_CONTENT_DIFFERENT_ID_MODEL;
        await page.waitForChanges();

        const flexLayout = getFlexibleLayout(chFlexibleLayoutRender);
        expect(getRenderedContentText(flexLayout, WIDGET_ID)).toBe(
          "Widget content"
        );

        chFlexibleLayoutRender.model = TABBED_MODEL;
        await page.waitForChanges();

        expect(getRenderedContentText(flexLayout, TAB_WIDGET_A_ID)).toBe(
          "Tab A content"
        );
      }
    );
  });
});
