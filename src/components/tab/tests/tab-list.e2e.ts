import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { simpleModel1 } from "../../../showcase/assets/components/tab/models";

describe("[ch-tab][tab-list]", () => {
  let page: E2EPage;
  let tabRef: E2EElement;
  let tabListRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-tab-render style="width: 300px; height: 350px"></ch-tab-render>`,
      failOnConsoleError: true
    });
    tabRef = await page.find("ch-tab-render");
    tabRef.setProperty("model", simpleModel1);
    await page.waitForChanges();
    tabListRef = await page.find("ch-tab-render >>> div");
  });

  it('the tab-list should stretch to the container width (tabListPosition === "block-start")', async () => {
    expect((await tabListRef.getComputedStyle()).width).toEqual("300px");
  });

  it('the tab-list should stretch to the container width (tabListPosition === "block-end")', async () => {
    tabRef.setProperty("tabListPosition", "block-end");
    await page.waitForChanges();
    expect((await tabListRef.getComputedStyle()).width).toEqual("300px");
  });

  it('the tab-list should stretch to the container height (tabListPosition === "inline-start")', async () => {
    tabRef.setProperty("tabListPosition", "inline-start");
    await page.waitForChanges();
    expect((await tabListRef.getComputedStyle()).height).toEqual("350px");
  });

  it('the tab-list should stretch to the container height (tabListPosition === "inline-end")', async () => {
    tabRef.setProperty("tabListPosition", "inline-end");
    await page.waitForChanges();
    expect((await tabListRef.getComputedStyle()).height).toEqual("350px");
  });
});
