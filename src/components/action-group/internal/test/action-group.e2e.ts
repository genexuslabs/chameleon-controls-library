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
      "<ch-action-group><ch-action-group-item slot='list-item' id='item-1'></ch-action-group-item> </ch-action-group>"
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

  // TODO: Find a way to simulate the work that Angular does to locate the item on its correspondent slot and trigger the displayedItemsCountChange event
  it.skip("Items hide inside more-action-btn when screen size is reduced", async () => {
    const page = await newE2EPage();

    /* Simulate Angular logic */
    await page.addScriptTag({
      content: ` window.addEventListener(
      'load',
      () => {
        const actionGroup = document.querySelector('ch-action-group');
        actionGroup.addEventListener('displayedItemsCountChange', ev => {
          const items = actionGroup.querySelectorAll(":scope > gx-action-group-item[slot='list-item']");
          const moreButton = actionGroup.querySelectorAll(":scope > gx-action-group-item[slot='more-button-item']");

          items.forEach((item, ind) => {
            console.log(ind);
            if (ind >= ev.detail) {
              item.setAttribute('slot', 'more-button-item');
              item.setAttribute('disposed-top', false);
            }
          });

          if (moreButton.length > 0) {
            for (let index = 0; index < ev.detail - items.length; index++) {
              moreButton[index].setAttribute('slot', 'list-item');
              item.setAttribute('disposed-top', true);
              item.classList.add('first-level-action');
            }
          }
        });
      },
      false,
    );`,
      type: "text/javascript"
    });
    await page.waitForChanges();
    await page.setViewport({
      height: 180,
      width: 180
    });
    await page.waitForChanges();
    await page.setContent(
      `<ch-action-group><ch-action-group-item slot='list-item' id='item-1' > Navigate to 1</ch-action-group-item> <ch-action-group-item slot='list-item' id='item-2' > Navigate to 2 </ch-action-group-item><ch-action-group-item slot='list-item' id='item-3' > Navigate to 3 </ch-action-group-item></ch-action-group>`
    );
    await page.waitForChanges();
    const element = await page.find(
      "ch-action-group ch-action-group-item:last-child"
    );
    expect(element.isVisible);
  });
});
