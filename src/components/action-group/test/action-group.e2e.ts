import { newE2EPage } from "@stencil/core/testing";

describe("ch-action-group", () => {
  it("renders", async () => {
    const page = await newE2EPage();
    await page.setContent("<ch-action-group></ch-action-group>");

    const element = await page.find("ch-action-group");
    expect(element).toHaveClass("hydrated");
  });
  it("more-action-btn is located at start by default", async () => {
    const page = await newE2EPage();
    await page.setContent(
      "<ch-action-group><ch-action-group-item slot='list-item' id='item-1'> </ch-action-group>"
    );

    const element = await page.find("ch-action-group >>> ch-dropdown");

    const dropdownGridColumn = (await element.getComputedStyle())
      .gridColumnStart;

    expect(dropdownGridColumn).toBe("auto");
  });
  it("more-action-btn is located at the end when more-actions-button-position attribute is set to End", async () => {
    const page = await newE2EPage();
    await page.setContent(
      "<ch-action-group items-overflow-behavior='Responsive Collapse' more-actions-button-position='End'><ch-action-group-item slot='list-item' id='item-1'></ch-action-group-item> </ch-action-group>"
    );

    const element = await page.find("ch-action-group >>> ch-dropdown");

    const dropdownGridColumn = (await element.getComputedStyle())
      .gridColumnStart;

    expect(dropdownGridColumn).toBe("3");
  });
  /*  it.only("Items hide inside more-action-btn when screen size is reduced", async () => {
    const page = await newE2EPage();
    await page.setContent(
      "<ch-action-group><ch-action-group-item slot='list-item' id='item-1' > Navigate to 1</ch-action-group-item> <ch-action-group-item slot='list-item' id='item-2' > Navigate to 2 </ch-action-group-item><ch-action-group-item slot='list-item' id='item-3' > Navigate to 3 </ch-action-group-item></ch-action-group>"
    );

    await page.setViewport({
      height: 100,
      width: 100
    });
    await page.waitForChanges();
    await page.waitForChanges();
    const element = await page.find(
      "ch-action-group ch-action-group-item:last-child"
    );
  }); */
});
