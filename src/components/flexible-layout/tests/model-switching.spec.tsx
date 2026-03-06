/**
 * Validates that content projection keeps working after switching between
 * different layout models at runtime (renders-based delivery).
 *
 * These tests focus on the component's ability to re-render and re-project
 * user content when the `model` property changes dynamically.
 * For static content projection see `rendering/content-projection.spec.tsx`.
 *
 * Covered transitions (all use widget.id === leaf.id):
 *
 *  1. single-content -> tabbed
 *  2. tabbed -> single-content
 *  3. tabbed -> tabbed (different leaf IDs)
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

const SINGLE_LEAF_ID = "single-leaf";
const TABBED_LEAF_A_ID = "tabbed-leaf-a";
const TABBED_LEAF_B_ID = "tabbed-leaf-b";

const testRenders: FlexibleLayoutRenders = {
  [SINGLE_LEAF_ID]: () => (
    <div key={SINGLE_LEAF_ID} slot={SINGLE_LEAF_ID}>
      Single content
    </div>
  ),
  [TABBED_LEAF_A_ID]: () => (
    <div key={TABBED_LEAF_A_ID} slot={TABBED_LEAF_A_ID}>
      Tab A content
    </div>
  ),
  "tab-b": () => (
    <div key="tab-b" slot="tab-b">
      Tab B content
    </div>
  ),
  [TABBED_LEAF_B_ID]: () => (
    <div key={TABBED_LEAF_B_ID} slot={TABBED_LEAF_B_ID}>
      Tab C content
    </div>
  ),
  "tab-d": () => (
    <div key="tab-d" slot="tab-d">
      Tab D content
    </div>
  )
};

const SINGLE_CONTENT_MODEL: FlexibleLayoutModel = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: SINGLE_LEAF_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: SINGLE_LEAF_ID, name: "", renderId: SINGLE_LEAF_ID }
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
        { id: TABBED_LEAF_A_ID, name: "Tab A", renderId: TABBED_LEAF_A_ID },
        { id: "tab-b", name: "Tab B", renderId: "tab-b" }
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
        { id: TABBED_LEAF_B_ID, name: "Tab C", renderId: TABBED_LEAF_B_ID },
        { id: "tab-d", name: "Tab D", renderId: "tab-d" }
      ]
    }
  ]
};

const getFlexibleLayout = (
  root: HTMLChFlexibleLayoutRenderElement
): HTMLChFlexibleLayoutElement =>
  root.shadowRoot.querySelector("ch-flexible-layout");

const getRenderedContentText = (
  flexLayout: HTMLChFlexibleLayoutElement,
  widgetId: string
): string | null => {
  const el = flexLayout.querySelector(`[slot="${widgetId}"]`);
  return el?.textContent?.trim() ?? null;
};

describe("[ch-flexible-layout-render][model-switching][renders]", () => {
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

    (page.win as any).chameleonControlsLibrary ??= {
      getImagePathCallback: {}
    };

    chFlexibleLayoutRender = page.root as HTMLChFlexibleLayoutRenderElement;
  });

  it("should render content after switching from single-content to tabbed", async () => {
    chFlexibleLayoutRender.model = SINGLE_CONTENT_MODEL;
    await page.waitForChanges();

    const flexLayout = getFlexibleLayout(chFlexibleLayoutRender);
    expect(getRenderedContentText(flexLayout, SINGLE_LEAF_ID)).toBe(
      "Single content"
    );

    chFlexibleLayoutRender.model = TABBED_MODEL_A;
    await page.waitForChanges();

    expect(getRenderedContentText(flexLayout, TABBED_LEAF_A_ID)).toBe(
      "Tab A content"
    );
  });

  it("should render content after switching from tabbed to single-content", async () => {
    chFlexibleLayoutRender.model = TABBED_MODEL_A;
    await page.waitForChanges();

    const flexLayout = getFlexibleLayout(chFlexibleLayoutRender);
    expect(getRenderedContentText(flexLayout, TABBED_LEAF_A_ID)).toBe(
      "Tab A content"
    );

    chFlexibleLayoutRender.model = SINGLE_CONTENT_MODEL;
    await page.waitForChanges();

    expect(getRenderedContentText(flexLayout, SINGLE_LEAF_ID)).toBe(
      "Single content"
    );
  });

  it("should render content after switching between different tabbed models", async () => {
    chFlexibleLayoutRender.model = TABBED_MODEL_A;
    await page.waitForChanges();

    const flexLayout = getFlexibleLayout(chFlexibleLayoutRender);
    expect(getRenderedContentText(flexLayout, TABBED_LEAF_A_ID)).toBe(
      "Tab A content"
    );

    chFlexibleLayoutRender.model = TABBED_MODEL_B;
    await page.waitForChanges();

    expect(getRenderedContentText(flexLayout, TABBED_LEAF_B_ID)).toBe(
      "Tab C content"
    );
  });
});
