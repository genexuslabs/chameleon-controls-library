import {
  E2EElement,
  E2EPage,
  EventSpy,
  newE2EPage
} from "@stencil/core/testing";
import { FlexibleLayoutModel } from "../internal/flexible-layout/types";
import {
  flexibleLayoutTestRenders,
  TEST1_ID,
  TEST2_ID,
  TEST3_ID
} from "./renders-test";

const ONE_SLOT_MODEL = {
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

const TWO_SLOT_MODEL = {
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

const SLOT_AND_RENDER_MODEL = {
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
      id: TEST3_ID,
      size: "1fr",
      type: "single-content",
      widget: { id: TEST3_ID, name: "", renderId: TEST3_ID }
    }
  ]
} satisfies FlexibleLayoutModel;

const FLEXIBLE_LAYOUT_RENDERED_CONTENT = (children: string) =>
  `<ch-flexible-layout exportparts="tab,tab-caption,close-button,tab-list,tab-list-start,tab-list-end,tab-panel,tab-panel-container,img,closable,not-closable,disabled,dragging,dragging-over-tab-list,dragging-out-of-tab-list,expanded,collapsed,selected,not-selected,block,inline,start,end,droppable-area,leaf,bar" class="hydrated">${children}</ch-flexible-layout>`;

const SLOT_CONTENT = (id: string) => `<slot name="${id}" slot="${id}"></slot>`;

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
    flexibleLayoutRef.setProperty("model", ONE_SLOT_MODEL);
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

  it('should render two slots when the model contains items item with "slot: true"', async () => {
    flexibleLayoutRef.setProperty("model", TWO_SLOT_MODEL);
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

  // TODO: It seems that puppeteer do not allow us to serialize the h function
  // from StencilJS to support the "renders" property
  it.skip("should render slots and traditional items with renders", async () => {
    flexibleLayoutRef.setProperty("model", SLOT_AND_RENDER_MODEL);
    flexibleLayoutRef.setProperty("renders", flexibleLayoutTestRenders);
    await page.waitForChanges();

    expect(await getRenderedContent()).toBe(
      FLEXIBLE_LAYOUT_RENDERED_CONTENT(
        SLOT_CONTENT(TEST1_ID) +
          `<button slot="${TEST3_ID}" type="button">Something</button>`
      )
    );
    expect(renderedWidgetsChangeSpy).toHaveReceivedEvent();
    expect(renderedWidgetsChangeSpy).toHaveReceivedEventDetail({
      rendered: [TEST3_ID],
      slotted: [TEST1_ID]
    });
  });

  it("should update the rendered slots when updating the model at runtime", async () => {
    flexibleLayoutRef.setProperty("model", ONE_SLOT_MODEL);
    await page.waitForChanges();

    flexibleLayoutRef.setProperty("model", TWO_SLOT_MODEL);
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
});
