import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-action-list-render]", () => {
  let page: E2EPage;
  let actionListRef: E2EElement;

  const getActionListRenderedContent = (): Promise<string> =>
    page.evaluate(() =>
      document
        .querySelector("ch-action-list-render")
        .shadowRoot.innerHTML.toString()
    );

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-action-list-render></ch-action-list-render>`,
      failOnConsoleError: true
    });
    actionListRef = await page.find("ch-action-list-render");
  });

  it("should have a shadowRoot", async () => {
    expect(actionListRef.shadowRoot).toBeDefined();
  });

  it("should render empty if the model is not set", async () => {
    expect(await getActionListRenderedContent()).toEqual("");
  });

  it("should render empty if the model is undefined", async () => {
    actionListRef.setProperty("model", undefined);
    await page.waitForChanges();
    expect(await getActionListRenderedContent()).toEqual("");
  });

  it("should render empty if the model is null", async () => {
    actionListRef.setProperty("model", null);
    await page.waitForChanges();
    expect(await getActionListRenderedContent()).toEqual("");
  });

  it('should have role="list"', async () => {
    expect(actionListRef).toEqualAttribute("role", "list");
  });

  it.skip('should have aria-multiselectable="true" if selection="multiple"', async () => {
    expect(actionListRef.getAttribute("aria-multiselectable")).toBeNull();

    actionListRef.setProperty("selection", "single");
    await page.waitForChanges();
    expect(actionListRef.getAttribute("aria-multiselectable")).toBeNull();

    actionListRef.setProperty("selection", "none");
    await page.waitForChanges();
    expect(actionListRef.getAttribute("aria-multiselectable")).toBeNull();

    actionListRef.setProperty("selection", "multiple");
    await page.waitForChanges();
    expect(actionListRef).toEqualAttribute("aria-multiselectable", "true");
  });
});
