import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { FlexibleLayoutModel } from "../internal/flexible-layout/types";

const INFO_PANEL_1 = "info-panel-1";
const INFO_PANEL_2 = "info-panel-2";
const PERSON_MANAGER_WIDGET = "person-manager-content";
const NEW_WIDGET_ID = "new-widget-content";

const SIDEBAR_LEAF_ID = "sidebar";
const CENTER_LEAF_ID = "center";
const NEW_LEAF_ID = "new-leaf";
const MAIN_GROUP_ID = "main-group";

// Model WITHOUT intermediate group (items directly in root)
const LAYOUT_MODEL_WITHOUT_GROUP: FlexibleLayoutModel = {
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
      widget: { id: PERSON_MANAGER_WIDGET },
      slot: true,
      overflow: "auto"
    }
  ]
};

// Model WITH intermediate group (required for addSiblingView to work)
const LAYOUT_MODEL_WITH_GROUP: FlexibleLayoutModel = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: MAIN_GROUP_ID,
      direction: "columns",
      size: "1fr",
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
          widget: { id: PERSON_MANAGER_WIDGET },
          slot: true,
          overflow: "auto"
        }
      ]
    }
  ]
};

describe("[ch-flexible-layout-render][methods]", () => {
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
        <div slot="${PERSON_MANAGER_WIDGET}">Person manager content</div>
        <div slot="${NEW_WIDGET_ID}">New widget content</div>
      </ch-flexible-layout-render>`,
      failOnConsoleError: true
    });
    flexibleLayoutRef = await page.find("ch-flexible-layout-render");
  });

  /**
   * Validates that addSiblingView fails when items are directly in the root
   * (without an intermediate group). This is a known limitation documented
   * with a TODO in the implementation.
   */
  it("should fail to add item via addSiblingView when items are directly in root", async () => {
    flexibleLayoutRef.setProperty("slottedWidgets", true);
    flexibleLayoutRef.setProperty("model", LAYOUT_MODEL_WITHOUT_GROUP);
    await page.waitForChanges();

    const newLeafModel = {
      id: NEW_LEAF_ID,
      size: "1fr",
      type: "single-content" as const,
      widget: { id: NEW_WIDGET_ID },
      slot: true
    };

    // Attempting to use "root" as parentGroup will fail
    const addSuccess = await flexibleLayoutRef.callMethod(
      "addSiblingView",
      "root", // ❌ "root" is not in itemsInfo as a group
      CENTER_LEAF_ID,
      "after",
      newLeafModel,
      true
    );

    // Should fail because root is not a group in itemsInfo
    expect(addSuccess).toBe(false);

    // Verify the new leaf was NOT added
    const renderedContent = await getRenderedContent();
    expect(renderedContent).not.toContain(
      `<slot name="${NEW_WIDGET_ID}" slot="${NEW_WIDGET_ID}"></slot>`
    );
  });

  /**
   * Validates that addSiblingView works correctly when items are directly in root.
   * This test should pass once the TODO in add-sibling-item.ts is completed.
   */
  it.skip("should add item via addSiblingView when items are directly in root", async () => {
    flexibleLayoutRef.setProperty("slottedWidgets", true);
    flexibleLayoutRef.setProperty("model", LAYOUT_MODEL_WITHOUT_GROUP);
    await page.waitForChanges();

    // Verify initial state
    let renderedContent = await getRenderedContent();
    expect(renderedContent).toContain(
      `<slot name="${INFO_PANEL_1}" slot="${INFO_PANEL_1}"></slot>`
    );
    expect(renderedContent).toContain(
      `<slot name="${PERSON_MANAGER_WIDGET}" slot="${PERSON_MANAGER_WIDGET}"></slot>`
    );

    const newLeafModel = {
      id: NEW_LEAF_ID,
      size: "1fr",
      type: "single-content" as const,
      widget: { id: NEW_WIDGET_ID },
      slot: true
    };

    // Once TODO is completed, using "root" as parentGroup should work
    const addSuccess = await flexibleLayoutRef.callMethod(
      "addSiblingView",
      "root", // ✅ Should work once TODO is completed
      CENTER_LEAF_ID,
      "after",
      newLeafModel,
      true
    );

    expect(addSuccess).toBe(true);
    await page.waitForChanges();

    // Verify the new leaf was added
    renderedContent = await getRenderedContent();
    expect(renderedContent).toContain(
      `<slot name="${NEW_WIDGET_ID}" slot="${NEW_WIDGET_ID}"></slot>`
    );
    // Verify existing items are still there
    expect(renderedContent).toContain(
      `<slot name="${INFO_PANEL_1}" slot="${INFO_PANEL_1}"></slot>`
    );
    expect(renderedContent).toContain(
      `<slot name="${PERSON_MANAGER_WIDGET}" slot="${PERSON_MANAGER_WIDGET}"></slot>`
    );
  });

  /**
   * WA: Validates that addSiblingView works correctly when items are inside
   * an intermediate group. This is the workaround for the limitation.
   */
  it("should add item via addSiblingView when items are in an intermediate group", async () => {
    flexibleLayoutRef.setProperty("slottedWidgets", true);
    flexibleLayoutRef.setProperty("model", LAYOUT_MODEL_WITH_GROUP);
    await page.waitForChanges();

    // Verify initial state
    let renderedContent = await getRenderedContent();
    expect(renderedContent).toContain(
      `<slot name="${INFO_PANEL_1}" slot="${INFO_PANEL_1}"></slot>`
    );
    expect(renderedContent).toContain(
      `<slot name="${PERSON_MANAGER_WIDGET}" slot="${PERSON_MANAGER_WIDGET}"></slot>`
    );

    const newLeafModel = {
      id: NEW_LEAF_ID,
      size: "1fr",
      type: "single-content" as const,
      widget: { id: NEW_WIDGET_ID },
      slot: true
    };

    // Using the intermediate group ID works correctly
    const addSuccess = await flexibleLayoutRef.callMethod(
      "addSiblingView",
      MAIN_GROUP_ID, // ✅ Use the intermediate group ID
      CENTER_LEAF_ID,
      "after",
      newLeafModel,
      true
    );

    expect(addSuccess).toBe(true);
    await page.waitForChanges();

    // Verify the new leaf was added
    renderedContent = await getRenderedContent();
    expect(renderedContent).toContain(
      `<slot name="${NEW_WIDGET_ID}" slot="${NEW_WIDGET_ID}"></slot>`
    );
    // Verify existing items are still there
    expect(renderedContent).toContain(
      `<slot name="${INFO_PANEL_1}" slot="${INFO_PANEL_1}"></slot>`
    );
    expect(renderedContent).toContain(
      `<slot name="${PERSON_MANAGER_WIDGET}" slot="${PERSON_MANAGER_WIDGET}"></slot>`
    );
  });

  it("should remove item via removeView", async () => {
    flexibleLayoutRef.setProperty("slottedWidgets", true);
    flexibleLayoutRef.setProperty("model", LAYOUT_MODEL_WITH_GROUP);
    await page.waitForChanges();

    // Verify initial state: sidebar and center should be rendered
    let renderedContent = await getRenderedContent();
    expect(renderedContent).toContain(
      `<slot name="${INFO_PANEL_1}" slot="${INFO_PANEL_1}"></slot>`
    );
    expect(renderedContent).toContain(
      `<slot name="${PERSON_MANAGER_WIDGET}" slot="${PERSON_MANAGER_WIDGET}"></slot>`
    );

    // Remove the sidebar using removeView
    const removeResult = await flexibleLayoutRef.callMethod(
      "removeView",
      SIDEBAR_LEAF_ID, // leafId
      true // removeRenderedWidgets
    );

    expect(removeResult.success).toBe(true);
    await page.waitForChanges();

    // Verify sidebar was removed (INFO_PANEL_1 should not be rendered)
    renderedContent = await getRenderedContent();
    expect(renderedContent).not.toContain(
      `<slot name="${INFO_PANEL_1}" slot="${INFO_PANEL_1}"></slot>`
    );
    // Verify center is still rendered
    expect(renderedContent).toContain(
      `<slot name="${PERSON_MANAGER_WIDGET}" slot="${PERSON_MANAGER_WIDGET}"></slot>`
    );
  });

  // TODO: Test addWidget method
  it("should add widget to an existing tabbed leaf via addWidget", async () => {});

  // TODO: Test removeWidget method
  it("should remove widget from a tabbed leaf via removeWidget", async () => {});

  // TODO: Test updateSelectedWidget method
  it("should update selected widget in a tabbed leaf via updateSelectedWidget", async () => {});

  // TODO: Test updateViewInfo method
  it("should update view info via updateViewInfo", async () => {});

  // TODO: Test updateWidgetInfo method
  it("should update widget info via updateWidgetInfo", async () => {});
});
