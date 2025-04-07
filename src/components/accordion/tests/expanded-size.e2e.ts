import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import {
  accordionSimpleModel,
  accordionWithExpandedSizeModel
} from "../../../showcase/assets/components/accordion/models";

describe("[ch-accordion-render][expandedSize]", () => {
  let page: E2EPage;
  let accordionRef: E2EElement;

  const getGridTemplateRowsValue = () =>
    page.evaluate(() =>
      getComputedStyle(
        document.querySelector("ch-accordion-render")
      ).getPropertyValue("--ch-accordion-grid-template-rows")
    );

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-accordion-render></ch-accordion-render>`,
      failOnConsoleError: true
    });
    accordionRef = await page.find("ch-accordion-render");
    accordionRef.setProperty("model", accordionWithExpandedSizeModel);
    await page.waitForChanges();
  });

  it('should set "1fr" in the "--ch-accordion-grid-template-rows" custom var if the model is empty', async () => {
    accordionRef.setProperty("model", []);
    await page.waitForChanges();

    expect(await getGridTemplateRowsValue()).toBe("1fr");
  });

  it('should set "1fr" in the "--ch-accordion-grid-template-rows" custom var if the model is undefined', async () => {
    accordionRef.setProperty("model", undefined);
    await page.waitForChanges();

    expect(await getGridTemplateRowsValue()).toBe("1fr");
  });

  it('should set "1fr" in the "--ch-accordion-grid-template-rows" custom var if the model is null', async () => {
    accordionRef.setProperty("model", null);
    await page.waitForChanges();

    expect(await getGridTemplateRowsValue()).toBe("1fr");
  });

  it('should render "max-content" if no expandedSize and "0fr" when collapsed', async () => {
    expect(await getGridTemplateRowsValue()).toBe("max-content 0fr 0fr 0fr");
  });

  it("should set the expanded size when an item is expanded and has expandedSize", async () => {
    await page.click('ch-accordion-render >>> [part="item 4 panel collapsed"]');
    await page.waitForChanges();
    expect(await getGridTemplateRowsValue()).toBe("max-content 0fr 0fr 1fr");

    await page.click('ch-accordion-render >>> [part="item 3 panel collapsed"]');
    await page.waitForChanges();
    expect(await getGridTemplateRowsValue()).toBe("max-content 0fr 1fr 1fr");
  });

  it('should restore to "0fr" when collapsing and item with expandedSize', async () => {
    await page.click('ch-accordion-render >>> [part="item 4 panel collapsed"]');
    await page.waitForChanges();
    expect(await getGridTemplateRowsValue()).toBe("max-content 0fr 0fr 1fr");

    await page.click('ch-accordion-render >>> [part="item 4 panel expanded"]');
    await page.waitForChanges();
    expect(await getGridTemplateRowsValue()).toBe("max-content 0fr 0fr 0fr");
  });

  it('should set "max-content" when the item does not have expandedSize, even if it is expanded', async () => {
    expect(await getGridTemplateRowsValue()).toBe("max-content 0fr 0fr 0fr");

    await page.click('ch-accordion-render >>> [part="item 1 panel collapsed"]');
    await page.waitForChanges();
    expect(await getGridTemplateRowsValue()).toBe("max-content 0fr 0fr 0fr");
  });

  it('should update the "--ch-accordion-grid-template-rows" custom var when updating the model at runtime', async () => {
    expect(await getGridTemplateRowsValue()).toBe("max-content 0fr 0fr 0fr");

    await page.click('ch-accordion-render >>> [part="item 2 panel collapsed"]');
    await page.waitForChanges();
    expect(await getGridTemplateRowsValue()).toBe("max-content 0.5fr 0fr 0fr");

    accordionRef.setProperty("model", accordionSimpleModel);
    await page.waitForChanges();
    expect(await getGridTemplateRowsValue()).toBe(
      "max-content max-content max-content max-content"
    );
  });

  it('should properly work items with expandedSize and the "singleItemExpanded" property', async () => {
    accordionRef.setProperty("singleItemExpanded", true);
    await page.waitForChanges();
    expect(await getGridTemplateRowsValue()).toBe("max-content 0fr 0fr 0fr");

    await page.click('ch-accordion-render >>> [part="item 4 panel collapsed"]');
    await page.waitForChanges();
    expect(await getGridTemplateRowsValue()).toBe("max-content 0fr 0fr 1fr");

    await page.click('ch-accordion-render >>> [part="item 3 panel collapsed"]');
    await page.waitForChanges();
    expect(await getGridTemplateRowsValue()).toBe("max-content 0fr 1fr 0fr");

    await page.click('ch-accordion-render >>> [part="item 1 panel collapsed"]');
    await page.waitForChanges();
    expect(await getGridTemplateRowsValue()).toBe("max-content 0fr 0fr 0fr");
  });

  it('should properly work when setting the "singleItemExpanded" property at runtime', async () => {
    await page.click('ch-accordion-render >>> [part="item 4 panel collapsed"]');
    await page.waitForChanges();
    expect(await getGridTemplateRowsValue()).toBe("max-content 0fr 0fr 1fr");

    await page.click('ch-accordion-render >>> [part="item 3 panel collapsed"]');
    await page.waitForChanges();
    expect(await getGridTemplateRowsValue()).toBe("max-content 0fr 1fr 1fr");

    accordionRef.setProperty("singleItemExpanded", true);
    await page.waitForChanges();
    expect(await getGridTemplateRowsValue()).toBe("max-content 0fr 1fr 0fr");
  });

  it('should properly work when removing the "singleItemExpanded" property at runtime', async () => {
    accordionRef.setProperty("singleItemExpanded", true);
    await page.waitForChanges();
    expect(await getGridTemplateRowsValue()).toBe("max-content 0fr 0fr 0fr");

    await page.click('ch-accordion-render >>> [part="item 4 panel collapsed"]');
    await page.waitForChanges();
    expect(await getGridTemplateRowsValue()).toBe("max-content 0fr 0fr 1fr");

    accordionRef.setProperty("singleItemExpanded", false);
    await page.waitForChanges();

    await page.click('ch-accordion-render >>> [part="item 2 panel collapsed"]');
    await page.waitForChanges();
    expect(await getGridTemplateRowsValue()).toBe("max-content 0.5fr 0fr 1fr");
  });
});
