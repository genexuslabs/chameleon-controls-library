import { newE2EPage } from "@stencil/core/testing";

describe("ch-action-group-item", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent(
      "<ch-action-group><ch-action-group-item slot='list-item' id='item-1'></ch-action-group-item> </ch-action-group>"
    );

    const element = await page.find("ch-action-group-item");
    expect(element).toHaveClass("hydrated");
  });
  it("trigger actionGroupItemSelected event when item is selected", async () => {
    const page = await newE2EPage();

    await page.setContent(
      "<ch-action-group><ch-action-group-item slot='list-item' id='item-1'>Navigate to</ch-action-group-item> </ch-action-group>"
    );
    const element = await page.find("ch-action-group");
    const item = await page.find("ch-action-group-item");
    const actionGroupItemSelected = await element.spyOnEvent(
      "actionGroupItemSelected"
    );
    await item.click();
    await page.waitForChanges();
    expect(actionGroupItemSelected).toHaveReceivedEvent();
  });
  it("set the link property works", async () => {
    const page = await newE2EPage();

    await page.setContent(
      "<ch-action-group><ch-action-group-item slot='list-item' id='item-1' link='google.com'>Navigate to</ch-action-group-item><ch-action-group-item slot='list-item' id='item-2'>No link</ch-action-group-item> </ch-action-group>"
    );
    const item1 = await page.find("ch-action-group-item[id='item-1'] >>> a");
    const item2 = await page.find("ch-action-group-item[id='item-2'] >>> a");
    await page.waitForChanges();
    expect(item1.getAttribute("href")).toBe("google.com");
    expect(item2.getAttribute("href")).toBeNull();
  });
  it("not show item when presented property is set to false", async () => {
    const page = await newE2EPage();

    await page.setContent(
      "<ch-action-group><ch-action-group-item presented='false' slot='list-item' id='item-1' link='google.com'>Navigate to</ch-action-group-item><ch-action-group-item slot='list-item' id='item-2'>No link</ch-action-group-item> </ch-action-group>"
    );
    const item1 = await page.find("ch-action-group-item[id='item-1']");
    const item2 = await page.find("ch-action-group-item[id='item-2']");

    expect((await item1.getComputedStyle()).opacity).toBe("0");
    expect((await item2.getComputedStyle()).opacity).toBe("1");
  });
});
