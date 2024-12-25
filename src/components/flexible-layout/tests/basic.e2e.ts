import {
  E2EElement,
  E2EPage,
  EventSpy,
  newE2EPage
} from "@stencil/core/testing";
import { FlexibleLayoutModel } from "../internal/flexible-layout/types";

const EMPTY_MODEL = {
  id: "root",
  direction: "columns",
  items: []
} satisfies FlexibleLayoutModel;

// const FLEXIBLE_LAYOUT_RENDERED_CONTENT = (children: string) =>
//   `<ch-flexible-layout class="flexible-layout hydrated">${children}</ch-flexible-layout>`;

describe("[ch-flexible-layout-render][basic]", () => {
  let page: E2EPage;
  let flexibleLayoutRef: E2EElement;
  let renderedWidgetsChangeSpy: EventSpy;

  // const getRenderedContent = () =>
  //   page.evaluate(
  //     () =>
  //       document.querySelector("ch-flexible-layout-render").shadowRoot.innerHTML
  //   );

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

  it("should have a shadowRoot", async () => {
    expect(flexibleLayoutRef.shadowRoot).toBeTruthy();
    expect(renderedWidgetsChangeSpy).not.toHaveReceivedEvent();
  });

  it('should not throw any error when the "model" property is undefined', async () => {
    flexibleLayoutRef.setProperty("model", undefined);
    await page.waitForChanges();
    expect(await flexibleLayoutRef.getProperty("model")).toBe(undefined);
    expect(renderedWidgetsChangeSpy).not.toHaveReceivedEvent();
  });

  it('should not throw any error when the "renders" property is undefined', async () => {
    flexibleLayoutRef.setProperty("renders", undefined);
    await page.waitForChanges();
    expect(await flexibleLayoutRef.getProperty("renders")).toBe(undefined);
    expect(renderedWidgetsChangeSpy).not.toHaveReceivedEvent();
  });

  it('the "model" and "renders" property should be undefined by default', async () => {
    expect(await flexibleLayoutRef.getProperty("model")).toBe(undefined);
    expect(await flexibleLayoutRef.getProperty("renders")).toBe(undefined);
    expect(renderedWidgetsChangeSpy).not.toHaveReceivedEvent();
  });

  it('should not throw any error when the "renders" property is undefined and the "model" property is set without any widget', async () => {
    flexibleLayoutRef.setProperty("model", EMPTY_MODEL);
    flexibleLayoutRef.setProperty("renders", undefined);
    await page.waitForChanges();

    expect(await flexibleLayoutRef.getProperty("model")).toEqual(EMPTY_MODEL);
    expect(await flexibleLayoutRef.getProperty("renders")).toBe(undefined);
    expect(renderedWidgetsChangeSpy).not.toHaveReceivedEvent();
  });
});
