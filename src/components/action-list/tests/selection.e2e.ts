import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { ticketList } from "../../../showcase/assets/components/action-list/models";

describe("[ch-action-list-render][selection]", () => {
  let page: E2EPage;
  let actionListRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      failOnConsoleError: true,
      html: `<ch-action-list-render></ch-action-list-render>`
    });
    actionListRef = await page.find("ch-action-list-render");
    actionListRef.setProperty("model", ticketList);
    await page.waitForChanges();
  });

  it("should have a shadowRoot", () => {
    expect(actionListRef.shadowRoot).not.toBeNull();
  });

  it('should work with selection="single" by default', async () => {
    await page.setContent(
      `<ch-action-list-render selection="single"></ch-action-list-render>`
    );
    actionListRef = await page.find("ch-action-list-render");
    actionListRef.setProperty("model", ticketList);
    await page.waitForChanges();

    await page.click("ch-action-list-render >>> ch-action-list-item");
  });
});
