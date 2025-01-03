import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

describe("[ch-dialog][parts]", () => {
  let page: E2EPage;
  let dialogRef: E2EElement;

  const testPart = (
    selector: string,
    elementDescription: string,
    part: string
  ) =>
    it(`the ${elementDescription} should have the "${part}" part`, async () => {
      const elementRef = await page.find(`ch-dialog >>> ${selector}`);
      expect(elementRef).not.toBeNull();
      // expect(elementRef.getAttribute("part")).toContain(part);
    });

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-dialog></ch-dialog>`,
      failOnConsoleError: true
    });
    dialogRef = await page.find("ch-dialog");

    // Some parts depend on properties not being false or undefined:
    await dialogRef.setProperty("showHeader", true);
    await dialogRef.setProperty("caption", "Some Caption");
    await dialogRef.setProperty("show", true);
    await dialogRef.setProperty("resizable", true);
    await page.waitForChanges();
  });

  testPart('[part="dialog"]', "dialog", "dialog");
  testPart('[part="header"]', "header", "header");
  testPart('[part="caption"]', "caption", "caption");
  testPart('[part="close-button"]', "close-button", "close-button");
  testPart('[part="content"]', "content", "content");

  // Edges and corners
  testPart(
    '[part="edge edge-block-start"]',
    "edge-block-start",
    "edge-block-start"
  );
  testPart(
    '[part="edge edge-inline-end"]',
    "edge-inline-end",
    "edge-inline-end"
  );
  testPart('[part="edge edge-block-end"]', "edge-block-end", "edge-block-end");
  testPart(
    '[part="edge edge-inline-start"]',
    "edge-inline-start",
    "edge-inline-start"
  );

  testPart(
    '[part="corner corner-block-start-inline-start"]',
    "corner-block-start-inline-start",
    "corner-block-start-inline-start"
  );
  testPart(
    '[part="corner corner-block-start-inline-end"]',
    "corner-block-start-inline-end",
    "corner-block-start-inline-end"
  );
  testPart(
    '[part="corner corner-block-end-inline-start"]',
    "corner-block-end-inline-start",
    "corner-block-end-inline-start"
  );
  testPart(
    '[part="corner corner-block-end-inline-end"]',
    "corner-block-end-inline-end",
    "corner-block-end-inline-end"
  );
});
