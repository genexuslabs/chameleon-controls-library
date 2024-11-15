import {
  E2EElement,
  E2EPage,
  EventSpy,
  newE2EPage
} from "@stencil/core/testing";
import { FlexibleLayoutModel } from "../internal/flexible-layout/types";

const TEST1_ID = "Test";

const ITEM_WITH_SLOT_MODEL = {
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

const FLEXIBLE_LAYOUT_RENDERED_CONTENT = (children: string) =>
  `<ch-flexible-layout class="flexible-layout hydrated">${children}</ch-flexible-layout>`;

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

  it('should render an slot when the model only contains an item with "slot: true"', async () => {
    flexibleLayoutRef.setProperty("model", ITEM_WITH_SLOT_MODEL);
    await page.waitForChanges();

    expect(await getRenderedContent()).toBe(
      FLEXIBLE_LAYOUT_RENDERED_CONTENT(
        `<slot name="${TEST1_ID}" slot="${TEST1_ID}"></slot>`
      )
    );
    expect(renderedWidgetsChangeSpy).toHaveReceivedEvent();
    expect(renderedWidgetsChangeSpy).toHaveReceivedEventDetail({
      rendered: [],
      slotted: [TEST1_ID]
    });
  });
});
