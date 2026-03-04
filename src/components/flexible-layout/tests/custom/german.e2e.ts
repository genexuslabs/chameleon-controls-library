import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { FlexibleLayoutModel } from "../../internal/flexible-layout/types";

const SIDEBAR_LEAF_ID = "sidebar";
const CENTER_LEAF_ID = "center";

const INFO_PANEL_1 = "info-panel-1";
const INFO_PANEL_2 = "info-panel-2";
const PERSON_MANAGER_WIDGET = "person-manager-content";

const SAME_WIDGET_ID_SAME_AS_LEAF_ID = false;
const SINGLE_CONTENT_WIDGET_ID = SAME_WIDGET_ID_SAME_AS_LEAF_ID
  ? CENTER_LEAF_ID
  : PERSON_MANAGER_WIDGET;

export const LAYOUT_MODEL: FlexibleLayoutModel = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: SIDEBAR_LEAF_ID,
      size: "280px",
      type: "tabbed",
      selectedWidgetId: INFO_PANEL_1,
      tabListPosition: "block-start",
      widgets: [
        { id: INFO_PANEL_1, name: "Overview" },
        { id: INFO_PANEL_2, name: "Details" }
      ]
    },
    {
      id: CENTER_LEAF_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: SINGLE_CONTENT_WIDGET_ID },
      slot: true,
      overflow: "auto"
    }
  ]
};

describe("[ch-flexible-layout-render][german]", () => {
  let page: E2EPage;
  let flexibleLayoutRef: E2EElement;

  const getRenderedContent = () =>
    page.evaluate(
      () =>
        document.querySelector("ch-flexible-layout-render").shadowRoot.innerHTML
    );

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-flexible-layout-render>
        <div slot="${INFO_PANEL_1}">Overview panel content</div>
        <div slot="${INFO_PANEL_2}">Details panel content</div>
        <div slot="${SINGLE_CONTENT_WIDGET_ID}">Person manager content</div>
      </ch-flexible-layout-render>`,
      failOnConsoleError: true
    });
    flexibleLayoutRef = await page.find("ch-flexible-layout-render");
  });

  /**
   * This test verifies the fix for a bug where `widgetsInfo` was incorrectly stored by `leafId`
   * instead of `widget.id` for single-content leaves, causing a TypeError when rendering.
   * This test validates that widgets render correctly when the widget ID differs from the leaf ID
   * for single-content type items.
   */
  it("should render correctly when widget ID differs from leaf ID for single-content items", async () => {
    flexibleLayoutRef.setProperty("slottedWidgets", true);
    flexibleLayoutRef.setProperty("model", LAYOUT_MODEL);
    await page.waitForChanges();

    const renderedContent = await getRenderedContent();

    expect(renderedContent).toContain(
      `<slot name="${INFO_PANEL_1}" slot="${INFO_PANEL_1}"></slot>`
    );

    expect(renderedContent).toContain(
      `<slot name="${SINGLE_CONTENT_WIDGET_ID}" slot="${SINGLE_CONTENT_WIDGET_ID}"></slot>`
    );
  });
});
