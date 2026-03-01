import {
  E2EElement,
  E2EPage,
  EventSpy,
  newE2EPage
} from "@stencil/core/testing";
import { FlexibleLayoutModel } from "../internal/flexible-layout/types";
import { FLEXIBLE_LAYOUT_RENDERED_CONTENT, SLOT_CONTENT } from "./common";
import { TEST1_ID, TEST2_ID } from "./renders-test";

const ONE_WIDGET_SLOT_TRUE = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: TEST1_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: TEST1_ID, name: "", slot: true }
    }
  ]
} satisfies FlexibleLayoutModel;

const TWO_WIDGET_SLOT_TRUE = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: TEST1_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: TEST1_ID, name: "", slot: true }
    },
    {
      id: TEST2_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: TEST2_ID, name: "", slot: true }
    }
  ]
} satisfies FlexibleLayoutModel;

const ONE_WIDGET_SLOT_UNDEFINED = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: TEST1_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: TEST1_ID, name: "" }
    }
  ]
} satisfies FlexibleLayoutModel;

const TWO_WIDGET_SLOT_UNDEFINED = {
  id: "root",
  direction: "columns",
  items: [
    {
      id: TEST1_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: TEST1_ID, name: "" }
    },
    {
      id: TEST2_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: TEST2_ID, name: "" }
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
      FLEXIBLE_LAYOUT_RENDERED_CONTENT(SLOT_CONTENT(TEST1_ID))
    );
    expect(renderedWidgetsChangeSpy).toHaveReceivedEvent();
    expect(renderedWidgetsChangeSpy).toHaveReceivedEventDetail({
      rendered: [],
      slotted: [TEST1_ID]
    });
  });

  it('should render two slots when the model contains items item with "widget.slot: true"', async () => {
    flexibleLayoutRef.setProperty("model", TWO_WIDGET_SLOT_TRUE);
    await page.waitForChanges();

    expect(await getRenderedContent()).toBe(
      FLEXIBLE_LAYOUT_RENDERED_CONTENT(
        SLOT_CONTENT(TEST1_ID) + SLOT_CONTENT(TEST2_ID)
      )
    );
    expect(renderedWidgetsChangeSpy).toHaveReceivedEvent();
    expect(renderedWidgetsChangeSpy).toHaveReceivedEventDetail({
      rendered: [],
      slotted: [TEST1_ID, TEST2_ID]
    });
  });

  // slot via property (slottedWidgets: true)

  it('should render a slot when the model only contains an item with "widget.slot: undefined"', async () => {
    flexibleLayoutRef.setProperty("slottedWidgets", true);
    flexibleLayoutRef.setProperty("model", ONE_WIDGET_SLOT_UNDEFINED);
    await page.waitForChanges();

    expect(await getRenderedContent()).toBe(
      FLEXIBLE_LAYOUT_RENDERED_CONTENT(SLOT_CONTENT(TEST1_ID))
    );
    expect(renderedWidgetsChangeSpy).toHaveReceivedEvent();
    expect(renderedWidgetsChangeSpy).toHaveReceivedEventDetail({
      rendered: [],
      slotted: [TEST1_ID]
    });
  });

  it('should render two slots when the model contains items item with "widget.slot: undefined"', async () => {
    flexibleLayoutRef.setProperty("slottedWidgets", true);
    flexibleLayoutRef.setProperty("model", TWO_WIDGET_SLOT_UNDEFINED);
    await page.waitForChanges();

    expect(await getRenderedContent()).toBe(
      FLEXIBLE_LAYOUT_RENDERED_CONTENT(
        SLOT_CONTENT(TEST1_ID) + SLOT_CONTENT(TEST2_ID)
      )
    );
    expect(renderedWidgetsChangeSpy).toHaveReceivedEvent();
    expect(renderedWidgetsChangeSpy).toHaveReceivedEventDetail({
      rendered: [],
      slotted: [TEST1_ID, TEST2_ID]
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
        SLOT_CONTENT(TEST1_ID) + SLOT_CONTENT(TEST2_ID)
      )
    );
    expect(renderedWidgetsChangeSpy).toHaveReceivedEventTimes(2);
    expect(renderedWidgetsChangeSpy).toHaveNthReceivedEventDetail(0, {
      rendered: [],
      slotted: [TEST1_ID]
    });
    expect(renderedWidgetsChangeSpy).toHaveNthReceivedEventDetail(1, {
      rendered: [],
      slotted: [TEST1_ID, TEST2_ID]
    });
  });

  // RENDERS TESTS

  /**
   * Note: Tests that involve the `renders` property (which expects
   * functions) are implemented in `renders.spec.tsx` instead of this
   * E2E file. This is because Puppeteer cannot serialize JavaScript
   * functions when passing them between Node.js and the browser
   * context. Spec tests run in the same process, allowing us to
   * pass functions directly.
   */
});
