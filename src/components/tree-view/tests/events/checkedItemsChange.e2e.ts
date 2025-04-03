import {
  E2EElement,
  E2EPage,
  EventSpy,
  newE2EPage
} from "@stencil/core/testing";
import { testTreeViewModel } from "../utils.e2e";
// import { TREE_VIEW_NODE_RENDER } from "../utils.e2e";

const DEV_NODE_ID = "dev";

describe("[ch-tree-view-render][events][checkedItemsChange]", () => {
  let page: E2EPage;
  let treeViewRef: E2EElement;
  let checkedItemsChangeSpy: EventSpy;

  // const getTreeViewRenderedContent = () =>
  //   page.evaluate(() =>
  //     document
  //       .querySelector("ch-tree-view-render")
  //       .shadowRoot.innerHTML.toString()
  //   );

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-tree-view-render></ch-tree-view-render>`,
      failOnConsoleError: true
    });
    treeViewRef = await page.find("ch-tree-view-render");
    treeViewRef.setProperty("model", testTreeViewModel);
    treeViewRef.setProperty("filterDebounce", 0);
    checkedItemsChangeSpy = await treeViewRef.spyOnEvent("checkedItemsChange");

    await page.waitForChanges();
  });

  const clickOnCheckbox = async (treeViewId: string) => {
    const checkboxRef = await page.find(
      `ch-tree-view-render >>> ch-tree-view-item[id='${treeViewId}'] >>> ch-checkbox`
    );

    return checkboxRef.press("Space");
  };

  // TODO: This is hard to implement, because we have to observe the event by
  // getting a reference for the element, but the element must be created with
  // the model, without triggering any extra re-render by updating the property
  // after the initial render.
  // We should probably check this event in a parent node and create the
  // element using page.evaluate
  it.todo("should not emit the checkedItemsChange event on the initial load");

  // TODO: Fix this
  it.skip("should not emit the event if the checked property, but no node has checkbox = true", async () => {
    treeViewRef.setProperty("checked", true);
    await page.waitForChanges();

    expect(checkedItemsChangeSpy).toHaveReceivedEventTimes(0);
  });

  it("should emit the event if the checked property is updated and checkbox = true", async () => {
    treeViewRef.setProperty("checkbox", true);
    treeViewRef.setProperty("checked", true);
    await page.waitForChanges();

    expect(checkedItemsChangeSpy).toHaveReceivedEventTimes(2);

    // TODO: Puppeteer doesn't know how to deserialize a Map...
    expect(checkedItemsChangeSpy).toHaveNthReceivedEventDetail(0, {});
    expect(checkedItemsChangeSpy).toHaveReceivedEventDetail({
      /* Add all items */
    });
  });

  it("should emit the event with empty checked items if checkbox = true and all items are unchecked", async () => {
    treeViewRef.setProperty("checkbox", true);
    await page.waitForChanges();

    expect(checkedItemsChangeSpy).toHaveReceivedEventTimes(2);

    // TODO: Puppeteer doesn't know how to deserialize a Map...
    expect(checkedItemsChangeSpy).toHaveNthReceivedEventDetail(0, {});
    expect(checkedItemsChangeSpy).toHaveNthReceivedEventDetail(1, {});
  });

  it("should emit the event the event with the checked items when the user updates the checkbox", async () => {
    treeViewRef.setProperty("checkbox", true);
    await page.waitForChanges();

    expect(checkedItemsChangeSpy).toHaveReceivedEventTimes(2);

    // TODO: Puppeteer doesn't know how to deserialize a Map...
    expect(checkedItemsChangeSpy).toHaveNthReceivedEventDetail(0, {});
    expect(checkedItemsChangeSpy).toHaveNthReceivedEventDetail(1, {});

    await clickOnCheckbox(DEV_NODE_ID);
    await page.waitForChanges();

    expect(checkedItemsChangeSpy).toHaveReceivedEventTimes(3);

    // TODO: Puppeteer doesn't know how to deserialize a Map...
    expect(checkedItemsChangeSpy).toHaveNthReceivedEventDetail(2, {
      /* Add all items */
    });
  });
});
