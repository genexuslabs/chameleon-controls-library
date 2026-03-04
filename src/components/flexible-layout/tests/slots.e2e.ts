import {
    E2EElement,
    E2EPage,
    EventSpy,
    newE2EPage
} from "@stencil/core/testing";
import { FlexibleLayoutModel } from "../internal/flexible-layout/types";
import {
    FLEXIBLE_LAYOUT_RENDERED_CONTENT,
    FLEXIBLE_LAYOUT_RENDERED_CONTENT_TABBED,
    SLOT_CONTENT
} from "./common";
import { WIDGET1_ID, WIDGET2_ID } from "./renders-test";

const LEAF1_ID = "Leaf1";
const LEAF2_ID = "Leaf2";

const ONE_WIDGET_SLOT_TRUE = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: LEAF1_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: WIDGET1_ID, name: "", slot: true }
    }
  ]
} satisfies FlexibleLayoutModel;

const TWO_WIDGET_SLOT_TRUE = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: LEAF1_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: WIDGET1_ID, name: "", slot: true }
    },
    {
      id: LEAF2_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: WIDGET2_ID, name: "", slot: true }
    }
  ]
} satisfies FlexibleLayoutModel;

const ONE_WIDGET_SLOT_UNDEFINED = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: LEAF1_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: WIDGET1_ID, name: "" }
    }
  ]
} satisfies FlexibleLayoutModel;

const TWO_WIDGET_SLOT_UNDEFINED = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: LEAF1_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: WIDGET1_ID, name: "" }
    },
    {
      id: LEAF2_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: WIDGET2_ID, name: "" }
    }
  ]
} satisfies FlexibleLayoutModel;

const TWO_TABBED_WIDGET_SLOT_TRUE = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: "tabbed-item",
      size: "1fr",
      type: "tabbed",
      selectedWidgetId: WIDGET1_ID,
      widgets: [
        { id: WIDGET1_ID, name: "Tab 1", slot: true },
        { id: WIDGET2_ID, name: "Tab 2", slot: true }
      ]
    }
  ]
} satisfies FlexibleLayoutModel;

const TWO_TABBED_WIDGET_SLOT_UNDEFINED = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: "tabbed-item",
      size: "1fr",
      type: "tabbed",
      selectedWidgetId: WIDGET1_ID,
      widgets: [
        { id: WIDGET1_ID, name: "Tab 1" },
        { id: WIDGET2_ID, name: "Tab 2" }
      ]
    }
  ]
} satisfies FlexibleLayoutModel;

/**
 * Model where widget.id equals leaf.id.
 * (For backward compatibility tests)
 */
const ONE_WIDGET_SAME_ID_AS_LEAF = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: LEAF1_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: LEAF1_ID, name: "", slot: true }
    }
  ]
} satisfies FlexibleLayoutModel;

describe("[ch-flexible-layout-render][slots]", () => {
  let page: E2EPage;
  let flexibleLayoutRef: E2EElement;
  let renderedWidgetsChangeSpy: EventSpy;

  const getRenderedContent = () =>
    page.evaluate(
      () =>
        document.querySelector("ch-flexible-layout-render").shadowRoot.innerHTML
    );

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-flexible-layout-render></ch-flexible-layout-render>`,
      failOnConsoleError: true
    });
    flexibleLayoutRef = await page.find("ch-flexible-layout-render");
    renderedWidgetsChangeSpy = await flexibleLayoutRef.spyOnEvent(
      "renderedWidgetsChange"
    );
  });

  // slot via model (widget.slot: true)

  it('should render a slot when the model only contains an item with "widget.slot: true"', async () => {
    flexibleLayoutRef.setProperty("model", ONE_WIDGET_SLOT_TRUE);
    await page.waitForChanges();

    expect(await getRenderedContent()).toBe(
      FLEXIBLE_LAYOUT_RENDERED_CONTENT(SLOT_CONTENT(WIDGET1_ID))
    );
    expect(renderedWidgetsChangeSpy).toHaveReceivedEvent();
    expect(renderedWidgetsChangeSpy).toHaveReceivedEventDetail({
      rendered: [],
      slotted: [WIDGET1_ID]
    });
  });

  it('should render two slots when the model contains items item with "widget.slot: true"', async () => {
    flexibleLayoutRef.setProperty("model", TWO_WIDGET_SLOT_TRUE);
    await page.waitForChanges();

    expect(await getRenderedContent()).toBe(
      FLEXIBLE_LAYOUT_RENDERED_CONTENT(
        SLOT_CONTENT(WIDGET1_ID) + SLOT_CONTENT(WIDGET2_ID)
      )
    );
    expect(renderedWidgetsChangeSpy).toHaveReceivedEvent();
    expect(renderedWidgetsChangeSpy).toHaveReceivedEventDetail({
      rendered: [],
      slotted: [WIDGET1_ID, WIDGET2_ID]
    });
  });

  // slot via property (slottedWidgets: true)

  it('should render a slot when the model only contains an item with "widget.slot: undefined"', async () => {
    flexibleLayoutRef.setProperty("slottedWidgets", true);
    flexibleLayoutRef.setProperty("model", ONE_WIDGET_SLOT_UNDEFINED);
    await page.waitForChanges();

    expect(await getRenderedContent()).toBe(
      FLEXIBLE_LAYOUT_RENDERED_CONTENT(SLOT_CONTENT(WIDGET1_ID))
    );
    expect(renderedWidgetsChangeSpy).toHaveReceivedEvent();
    expect(renderedWidgetsChangeSpy).toHaveReceivedEventDetail({
      rendered: [],
      slotted: [WIDGET1_ID]
    });
  });

  it('should render two slots when the model contains items item with "widget.slot: undefined"', async () => {
    flexibleLayoutRef.setProperty("slottedWidgets", true);
    flexibleLayoutRef.setProperty("model", TWO_WIDGET_SLOT_UNDEFINED);
    await page.waitForChanges();

    expect(await getRenderedContent()).toBe(
      FLEXIBLE_LAYOUT_RENDERED_CONTENT(
        SLOT_CONTENT(WIDGET1_ID) + SLOT_CONTENT(WIDGET2_ID)
      )
    );
    expect(renderedWidgetsChangeSpy).toHaveReceivedEvent();
    expect(renderedWidgetsChangeSpy).toHaveReceivedEventDetail({
      rendered: [],
      slotted: [WIDGET1_ID, WIDGET2_ID]
    });
  });

  /**
   * Backward compatibility test: validates that slots render correctly when
   * widget.id equals leaf.id. This ensures existing users who were using the
   * same ID for both the leaf and its widget continue to work after the fix
   * that changed slot names in `ch-flexible-layout` from `name={leaf.id}` to
   * `name={leaf.widget.id}`.
   */
  it("should render a slot when widget.id equals leaf.id (backward compatibility)", async () => {
    flexibleLayoutRef.setProperty("model", ONE_WIDGET_SAME_ID_AS_LEAF);
    await page.waitForChanges();

    expect(await getRenderedContent()).toBe(
      FLEXIBLE_LAYOUT_RENDERED_CONTENT(SLOT_CONTENT(LEAF1_ID))
    );
    expect(renderedWidgetsChangeSpy).toHaveReceivedEvent();
    expect(renderedWidgetsChangeSpy).toHaveReceivedEventDetail({
      rendered: [],
      slotted: [LEAF1_ID]
    });
  });

  // tabbed widgets - slot via model (widget.slot: true)

  it('should render a slot for selected tabbed widget when multiple widgets have "widget.slot: true"', async () => {
    flexibleLayoutRef.setProperty("model", TWO_TABBED_WIDGET_SLOT_TRUE);
    await page.waitForChanges();

    // Only the selected widget (WIDGET1_ID) should be rendered initially
    expect(await getRenderedContent()).toBe(
      FLEXIBLE_LAYOUT_RENDERED_CONTENT_TABBED(
        SLOT_CONTENT(WIDGET1_ID),
        "tabbed-item",
        "block-start",
        [WIDGET1_ID, WIDGET2_ID]
      )
    );
    expect(renderedWidgetsChangeSpy).toHaveReceivedEvent();
    expect(renderedWidgetsChangeSpy).toHaveReceivedEventDetail({
      rendered: [],
      slotted: [WIDGET1_ID]
    });
  });

  // tabbed widgets - slot via property (slottedWidgets: true)

  it('should render a slot for selected tabbed widget when multiple widgets have "widget.slot: undefined" and slottedWidgets is true', async () => {
    flexibleLayoutRef.setProperty("slottedWidgets", true);
    flexibleLayoutRef.setProperty("model", TWO_TABBED_WIDGET_SLOT_UNDEFINED);
    await page.waitForChanges();

    // Only the selected widget (WIDGET1_ID) should be rendered initially
    expect(await getRenderedContent()).toBe(
      FLEXIBLE_LAYOUT_RENDERED_CONTENT_TABBED(
        SLOT_CONTENT(WIDGET1_ID),
        "tabbed-item",
        "block-start",
        [WIDGET1_ID, WIDGET2_ID]
      )
    );
    expect(renderedWidgetsChangeSpy).toHaveReceivedEvent();
    expect(renderedWidgetsChangeSpy).toHaveReceivedEventDetail({
      rendered: [],
      slotted: [WIDGET1_ID]
    });
  });

  // slot updates

  it("should update the rendered slots when updating the model at runtime", async () => {
    flexibleLayoutRef.setProperty("model", ONE_WIDGET_SLOT_TRUE);
    await page.waitForChanges();

    flexibleLayoutRef.setProperty("model", TWO_WIDGET_SLOT_TRUE);
    await page.waitForChanges();

    expect(await getRenderedContent()).toBe(
      FLEXIBLE_LAYOUT_RENDERED_CONTENT(
        SLOT_CONTENT(WIDGET1_ID) + SLOT_CONTENT(WIDGET2_ID)
      )
    );
    expect(renderedWidgetsChangeSpy).toHaveReceivedEventTimes(2);
    expect(renderedWidgetsChangeSpy).toHaveNthReceivedEventDetail(0, {
      rendered: [],
      slotted: [WIDGET1_ID]
    });
    expect(renderedWidgetsChangeSpy).toHaveNthReceivedEventDetail(1, {
      rendered: [],
      slotted: [WIDGET1_ID, WIDGET2_ID]
    });
  });

  /**
   * Note: For tests for the `renders` property, see `renders.spec.tsx`.
   * Tests that require `renders` are in spec files because Puppeteer cannot
   * serialize JavaScript functions when passing them between Node.js and the
   * browser context.
   */
});
